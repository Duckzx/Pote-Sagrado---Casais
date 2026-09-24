const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

// Push notification to the couple's devices when a deposit/expense is added.
exports.sendDepositPush = onDocumentCreated('casais/{casalId}/deposits/{docId}', async (event) => {
  const data = event.data && event.data.data();
  if (!data || data.isXpBonus) return;

  const { casalId } = event.params;
  const configRef = getFirestore().doc(`casais/${casalId}/trip_config/main`);
  const configSnap = await configRef.get();
  const fcmTokens = (configSnap.exists && configSnap.data().fcmTokens) || [];

  if (fcmTokens.length === 0) {
    console.log('No devices subscribed to push notifications.', casalId);
    return;
  }

  const msgType = data.type === 'expense' ? 'gastou' : 'depositou';
  const msgEfeito = data.type === 'expense' ? '📉' : '💸';
  const quemStr = data.whoName || 'Alguém';
  const valor = Number(data.amount || 0).toFixed(2).replace('.', ',');

  const response = await getMessaging().sendEachForMulticast({
    notification: {
      title: 'Atualização no Pote Sagrado!',
      body: `${msgEfeito} ${quemStr} ${msgType} R$ ${valor}`,
    },
    webpush: { fcmOptions: { link: '/' } },
    tokens: fcmTokens,
  });
  console.log('Push sent:', response.successCount, 'failed:', response.failureCount);

  // Remove tokens of devices that uninstalled / revoked permission
  const invalid = [];
  response.responses.forEach((r, i) => {
    const code = r.error && r.error.code;
    if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
      invalid.push(fcmTokens[i]);
    }
  });
  if (invalid.length > 0) {
    await configRef.update({ fcmTokens: FieldValue.arrayRemove(...invalid) });
  }
});
