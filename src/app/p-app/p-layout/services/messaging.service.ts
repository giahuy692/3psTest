import { Injectable } from '@angular/core';
import { Messaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { getToken, onMessage } from 'firebase/messaging';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private currentMessage = new BehaviorSubject(null);

  constructor(private messaging: Messaging) {}

  // Yêu cầu quyền thông báo
  requestPermission(vapidKey: string) {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          this.getToken(vapidKey);
        } else {
          console.error('Unable to get permission to notify.');
        }
      })
      .catch((err) => console.error('Error requesting notification permission', err));
  }

  // Lấy FCM Token
  private getToken(vapidKey: string) {
    getToken(this.messaging, { vapidKey })
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
      console.log('Message received: ', payload);
      this.currentMessage.next(payload);
    });
  }

  get currentMessage$() {
    return this.currentMessage.asObservable();
  }
}
