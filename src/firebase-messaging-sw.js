// File này được dùng ở angular.json

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

/** Firebase Config
 * apiKey: Khóa API để xác thực các yêu cầu gửi đến Firebase.
    authDomain: Domain được sử dụng cho tính năng xác thực.
    projectId: ID của dự án Firebase.
    storageBucket: Đường dẫn đến Google Cloud Storage liên kết với dự án.
    messagingSenderId: ID gửi tin nhắn qua Firebase Cloud Messaging (FCM).
    appId: ID ứng dụng Firebase.
 */
const firebaseConfig = {
  apiKey: "AIzaSyAq53_Okq6p0XmTN8456CLLfsoZnyn6mOE",
  authDomain: "testfirebase-426a3.firebaseapp.com",
  projectId: "testfirebase-426a3",
  storageBucket: "testfirebase-426a3.firebasestorage.app",
  messagingSenderId: "1042553762111",
  appId: "1:1042553762111:web:0ca1d4c70825364ee9e38a"
};

firebase.initializeApp(firebaseConfig); // Khởi tạo Firebase nếu chưa khởi tạo.

const messaging = firebase.messaging(); // Lấy đối tượng Firebase Messaging.

// Xử lý thông báo khi ứng dụng chạy nền
messaging.onBackgroundMessage((payload) => {

  // Hiển thị thông báo thông qua Service Worker
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});
