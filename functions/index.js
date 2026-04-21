const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendDepositPush = functions.firestore
  .document('deposits/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    // Obter dados da configuração principal de onde estão salvos os Tokens do Push
    const tripConfigSnap = await admin.firestore().doc('trip_config/main').get();
    
    if (!tripConfigSnap.exists) {
      console.log('No trip config found.');
      return null;
    }

    const tripData = tripConfigSnap.data();
    const fcmTokens = tripData.fcmTokens || [];

    if (fcmTokens.length === 0) {
      console.log('No users subscribed to Push Notifications.');
      return null;
    }

    // Identificar a ação
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
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log('Successfully sent message:', response.successCount);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    
    return null;
});
