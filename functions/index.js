const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Trigger: When a new deposit is created, send a push notification to members.
 */
exports.sendDepositPush = functions.firestore
  .document('casais/{casalId}/deposits/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const { casalId } = context.params;
    
    const tripConfigSnap = await admin.firestore().doc(`casais/${casalId}/trip_config/main`).get();
    if (!tripConfigSnap.exists) return null;

    const tripData = tripConfigSnap.data();
    const fcmTokens = tripData.fcmTokens || [];
    if (fcmTokens.length === 0) return null;

    const msgType = data.type === 'expense' ? 'gastou' : 'depositou';
    const msgEfeito = data.type === 'expense' ? '📉' : '💸';
    const quemStr = data.whoName || 'Alguém';
    const bodyText = `${msgEfeito} ${quemStr} ${msgType} R$ ${parseFloat(data.amount).toFixed(2)}`;

    const message = {
      notification: {
        title: "Atualização no Pote Sagrado!",
        body: bodyText,
      },
      tokens: fcmTokens,
    };

    try {
      await admin.messaging().sendEachForMulticast(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    return null;
});

/**
 * Callable: joinCouple
 * Safely link two users using an invite code and migrate data.
 */
exports.joinCouple = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const { inviteCode } = data;
  if (!inviteCode) {
    throw new functions.https.HttpsError('invalid-argument', 'Invite code is required.');
  }

  const db = admin.firestore();
  const uid = context.auth.uid;

  // 1. Find the target user/casal
  let targetCasalId = inviteCode;
  if (!inviteCode.startsWith('casal_')) {
    const userQuery = await db.collection('users').where('inviteCode', '==', inviteCode.toUpperCase()).limit(1).get();
    if (userQuery.empty) {
      throw new functions.https.HttpsError('not-found', 'Invite code not found.');
    }
    const partnerDoc = userQuery.docs[0];
    if (partnerDoc.id === uid) {
      throw new functions.https.HttpsError('already-exists', 'You cannot join your own couple.');
    }
    targetCasalId = partnerDoc.data().casalId || `casal_${partnerDoc.id}`;
  }

  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  const currentCasalId = userSnap.exists() ? (userSnap.data().casalId || `casal_${uid}`) : `casal_${uid}`;

  if (targetCasalId === currentCasalId) {
    return { success: true, message: 'Already in this couple.' };
  }

  // 2. Perform Migration (Server-Side)
  // We'll move deposits, achievements, pinboard_links, gallery, love_interactions, and love_progress
  const collectionsToMigrate = ['deposits', 'achievements', 'pinboard_links', 'gallery', 'love_interactions'];
  const userFieldMap = {
    'deposits': 'who',
    'achievements': 'who',
    'pinboard_links': 'addedBy',
    'gallery': 'addedBy',
    'love_interactions': 'partnerId'
  };

  let batch = db.batch();
  let operationCount = 0;

  const commitBatch = async () => {
    if (operationCount > 0) {
      await batch.commit();
      batch = db.batch();
      operationCount = 0;
    }
  };

  for (const col of collectionsToMigrate) {
    const userField = userFieldMap[col] || 'who';
    const docs = await db.collection(`casais/${currentCasalId}/${col}`).where(userField, '==', uid).get();

    for (const docSnap of docs.docs) {
      const targetRef = db.doc(`casais/${targetCasalId}/${col}/${docSnap.id}`);
      batch.set(targetRef, docSnap.data());
      batch.delete(docSnap.ref);
      operationCount += 2;

      if (operationCount >= 450) {
        await commitBatch();
      }
    }
  }

  // Handle love_progress (copy if doesn't exist in target)
  const progressSnap = await db.doc(`casais/${currentCasalId}/love_progress/main`).get();
  if (progressSnap.exists) {
    const targetProgressRef = db.doc(`casais/${targetCasalId}/love_progress/main`);
    const targetProgressSnap = await targetProgressRef.get();
    if (!targetProgressSnap.exists) {
       batch.set(targetProgressRef, progressSnap.data());
       operationCount++;
    }
  }

  // 3. Update User Document
  batch.update(userRef, { casalId: targetCasalId });
  operationCount++;

  await commitBatch();

  return { success: true, casalId: targetCasalId };
});

/**
 * Callable: deleteUserAccount
 * LGPD compliant deletion of user data.
 */
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  const casalId = userSnap.exists() ? (userSnap.data().casalId || `casal_${uid}`) : `casal_${uid}`;

  const batch = db.batch();

  // 1. Delete user-specific data in shared collections
  const collections = ['deposits', 'achievements', 'pinboard_links', 'gallery', 'notifications'];
  const userFieldMap = {
    'deposits': 'who',
    'achievements': 'who',
    'pinboard_links': 'addedBy',
    'gallery': 'addedBy',
    'notifications': 'to'
  };

  for (const col of collections) {
    const userField = userFieldMap[col] || 'who';
    const docs = await db.collection(`casais/${casalId}/${col}`).where(userField, '==', uid).get();
    docs.forEach(docSnap => batch.delete(docSnap.ref));
  }

  // 2. Delete user's custom dates
  const customDates = await db.collection(`users/${uid}/customDates`).get();
  customDates.forEach(docSnap => batch.delete(docSnap.ref));

  // 3. Delete user document
  batch.delete(userRef);

  await batch.commit();

  // 4. Delete the Auth user
  try {
    await admin.auth().deleteUser(uid);
  } catch (error) {
    console.error('Error deleting auth user:', error);
    // Even if auth delete fails, firestore data is gone.
  }

  return { success: true };
});
