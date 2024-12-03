importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging.js');

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAq53_Okq6p0XmTN8456CLLfsoZnyn6mOE",
    authDomain: "testfirebase-426a3.firebaseapp.com",
    projectId: "testfirebase-426a3",
    storageBucket: "testfirebase-426a3.firebasestorage.app",
    messagingSenderId: "1042553762111",
    appId: "1:1042553762111:web:0ca1d4c70825364ee9e38a"
  };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Xử lý thông báo khi ứng dụng chạy nền
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});
