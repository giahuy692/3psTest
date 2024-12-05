import { Injectable } from '@angular/core';
import { Messaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { getToken, onMessage } from 'firebase/messaging';
import { Ps_UtilObjectService } from 'src/app/p-lib';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private currentMessage = new BehaviorSubject(null);
  private serviceWorker: ServiceWorkerRegistration

  constructor(private messaging: Messaging) {}

  // VAPID Key dùng để xác thực giữa ứng dụng client và Firebase Messaging Server.
  // Bạn cần thay thế giá trị này bằng VAPID Key từ Firebase Console của dự án bạn.
  vapidKey = 'BJ3oniCKyBFvdawVwUXnr3NebzsCmKOVxQ6nc8V0-_RMcYWII8f8yAE8GHR895VGRjJKiOFVYjXIwfrfe2sZoAQ';
  // Yêu cầu quyền thông báo
  requestPermission() {
    Notification.requestPermission()
      .then(async (permission) => {
        if (permission === 'granted') {
          // Kiểm tra xem đã có Service Worker đăng ký hay chưa
          const existingRegistration = await navigator.serviceWorker.getRegistration("../../../../firebase-messaging-sw.js");
          console.log(existingRegistration)
          if (existingRegistration) {
            console.log('Service Worker already registered:', existingRegistration);
            this.serviceWorker = existingRegistration; // Lưu lại Service Worker đã đăng ký
          } else {
            // Đăng ký Service Worker mới nếu chưa tồn tại
            navigator.serviceWorker.register("../../../../firebase-messaging-sw.js")
              .then((registration: ServiceWorkerRegistration) => {
                console.log('Service Worker registered:', registration);
                this.serviceWorker = registration; // Lưu lại Service Worker vừa đăng ký
              })
              .catch((err) => {
                console.error('Service Worker registration failed:', err);
              });
          }
        } else {
          console.error('Permission for notifications was denied.');
        }
      })
      .catch((err) => console.error('Error requesting notification permission', err));
  }  

  /**
   * Lấy FCM Token
   * @param vapidKey VAPID Key dùng để xác thực giữa ứng dụng client và Firebase Messaging Server.
      Bạn cần thay thế giá trị này bằng VAPID Key từ Firebase Console của dự án bạn.
   * @param serviceWorker đã đăng ký ở requestPermission
   */
  public async getToken(existingRegistration: ServiceWorkerRegistration) {
    await getToken(this.messaging, { vapidKey: this.vapidKey, serviceWorkerRegistration: existingRegistration })
      .then((token) => {
        if (token) {
          console.log('FCM Token:', token);
          // Gửi token này tới backend để xử lý thông báo
        } else {
          console.log('No registration token available.');
        }
      })
      .catch((err) => {
        console.error('An error occurred while retrieving token. ', err);
      });
  }

  listenToForegroundMessages(): void {
    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
  
      // Gọi API backend
      // this.http.post('/your-backend-endpoint', payload)
      //   .subscribe({
      //     next: (res) => console.log('API called successfully:', res),
      //     error: (err) => console.error('Error calling API:', err),
      //   });
    });
  }

}
