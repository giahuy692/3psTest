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

  // Yêu cầu quyền thông báo
  requestPermission(vapidKey: string) {
    Notification.requestPermission()
      .then(async (permission) => {
        if (permission === 'granted') {
          navigator.serviceWorker.register("../../../../firebase-messaging-sw.js").then((registration : ServiceWorkerRegistration) => {
            this.serviceWorker = registration
            // console.log(registration)
            // if(Ps_UtilObjectService.hasValue(registration) && registration.active)
              // this.getToken(vapidKey, registration);
          }).catch((err) => {
            console.error('Service Worker registration failed:', err);
          }); 
        //   await navigator.serviceWorker.getRegistration("/firebase-cloud-messaging-push-scope").then((registration : any) => {
        //     this.getToken(vapidKey, registration);
        //   }).catch((err) => {
        //     console.error('Service Worker registration failed:', err);
        //   });   
        // } else {
        //   console.error('Unable to get permission to notify.');
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
  public async getToken(vapidKey: string, serviceWorker : ServiceWorkerRegistration = this.serviceWorker) {
    await getToken(this.messaging, { vapidKey: vapidKey, serviceWorkerRegistration: serviceWorker })
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

  // Nhận tin nhắn khi ứng dụng đang chạy
  receiveMessage() {
    onMessage(this.messaging, (payload) => {
      this.currentMessage.next(payload);
    });
  }

  get currentMessage$() {
    return this.currentMessage.asObservable();
  }
}
