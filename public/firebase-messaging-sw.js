// Scripts para rodar o Firebase Messaging no Service Worker Nativamente
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAJVzr1SRZu9kTZRsJlib1M-0qMPIzSX68",
  authDomain: "potesagrado-34c79.firebaseapp.com",
  projectId: "potesagrado-34c79",
  storageBucket: "potesagrado-34c79.firebasestorage.app",
  messagingSenderId: "64529832333",
  appId: "1:64529832333:web:6ffdcbcfced2dfa77a05c4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
