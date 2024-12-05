import { Injectable } from '@angular/core';
import { Messaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { getToken, onMessage } from 'firebase/messaging';
import { Ps_UtilObjectService } from 'src/app/p-lib';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private serviceWorker: ServiceWorkerRegistration

  constructor(private messaging: Messaging) { }

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
          if (existingRegistration) {
            this.serviceWorker = existingRegistration; // Lưu lại Service Worker đã đăng ký
          } else {
            // Đăng ký Service Worker mới nếu chưa tồn tại
            navigator.serviceWorker.register("../../../../firebase-messaging-sw.js")
              .then((registration: ServiceWorkerRegistration) => {
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
 * Kiểm tra quyền Notifications và Pop-ups and Redirects
 * Nếu quyền nào bị chặn, hiển thị hướng dẫn bật riêng cho từng quyền.
 * @param existingRegistration Service Worker đã đăng ký
 */
public async checkPermissionsAndGuide(existingRegistration: ServiceWorkerRegistration) {
  let notificationsGranted = true;
  let popupsGranted = true;

  // Kiểm tra quyền Notifications
  const notificationPermission = Notification.permission;
  if (notificationPermission === "denied") {
    notificationsGranted = false;
  } else if (notificationPermission === "default") {
    const newPermission = await Notification.requestPermission();
    if (newPermission !== "granted") {
      notificationsGranted = false;
    }
  }

  // Hiển thị hướng dẫn nếu quyền bị chặn
  if (!notificationsGranted || !popupsGranted) {
    const messages: string[] = [];

    // if (!notificationsGranted) {
    //   messages.push(
    //     `- Để bật Notifications:\n  Chrome: Settings → Privacy and Security → Site Settings → Notifications\n  Firefox: Options → Privacy & Security → Permissions → Notifications`
    //   );
    // }

    // if (!popupsGranted) {
    //   messages.push(
    //     `- Để bật Pop-ups and Redirects:\n  Chrome: Settings → Privacy and Security → Site Settings → Pop-ups and redirects\n  Firefox: Options → Privacy & Security → Permissions → Pop-ups and redirects`
    //   );
    // }

    // alert(
    //   `Để nhận được thông báo từ hệ thống ERP bạn cần cấp quyền các quyền truy cập từ trình duyệt của bạn:
    //   ${!notificationsGranted ? `+ Notifications` : ''}
    //   ${!popupsGranted ? `+ Pop-ups and Redirects` : ''}
    //   \n${messages.join("\n")}`
    // );
    return;
  }

  // Nếu cả hai quyền đều được cấp, tiến hành lấy FCM Token
  await this.getToken(existingRegistration);
}


/**
 * Lấy FCM Token
 * @param existingRegistration Service Worker đã đăng ký
 */
public async getToken(existingRegistration: ServiceWorkerRegistration) {
  await getToken(this.messaging, { vapidKey: this.vapidKey, serviceWorkerRegistration: existingRegistration })
    .then((token) => {
      if (token) {
        console.log("FCM Token:", token);
        // Gửi token này tới backend để xử lý thông báo
      } else {
        console.log("No registration token available.");
      }
    })
    .catch((err) => {
      console.error("An error occurred while retrieving token. ", err);
    });
}



}
