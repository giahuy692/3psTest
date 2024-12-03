import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Ps_UtilObjectService } from "../utilities/utility.object";

@Injectable({
    providedIn: 'root'
})

export class LocalStorageService {
    private storageChangeEvent = new Subject<any>();

    constructor() {
        window.addEventListener('storage', this.onStorageChange.bind(this));
    }

    private onStorageChange(key: string, event: StorageEvent): void {
        if (key === event?.key) {
            this.storageChangeEvent.next(event);
        } 
    }
    

    subscribeToLocalStorageChange(key: string): Observable<any> {
        return new Observable<any>((subscriber) => {
            const handler = (event: StorageEvent) => { 
                const value = JSON.parse(localStorage.getItem(key));
                // console.log('value', value);
                if (key === event?.key && event.newValue !== null && value !== null)  
                //check key, value trùng với param để kh emit value của các changed key khác
                { 
                    subscriber.next(value);
                } else if (value === null){ //emit null value khi logout (vì khi logout local storage chỉ emit 1 lần null)
                    subscriber.next(null);
                } 
            }
            window.addEventListener('storage', handler);

            return () => {
                window.removeEventListener('storage', handler);
            };
        });
    }

    subscribeToLoginState(key: string): Observable<any> {
        return new Observable<any>((subscriber) => {
            const handler = (event: StorageEvent) => {
                const loginState = this.getItem('loginState');
                if (key === event?.key && event.newValue !== null && loginState !== null) 
                //check key, value trùng với param để kh emit value của các changed key khác
                { 
                    subscriber.next(loginState);
                } else if (loginState === null){ //emit null value khi logout (vì khi logout local storage chỉ emit 1 lần null)
                    subscriber.next(null);
                } 
            }
            window.addEventListener('storage', handler);

            return () => {
                window.removeEventListener('storage', handler);
            };
        });
    }


    // hàm test sesionShare update cho trang hri001-staff-detail
    // subscribeStaff(key: string): Observable<any> {
    //     return new Observable<any>((subscriber) => {
    //         const handler = (event: StorageEvent) => {
    //             const value = JSON.parse(localStorage.getItem(key)); 
    //             if (key === event?.key && event.newValue !== null && value !== null && event.key === key) { 
    //                 subscriber.next(value);
    //             } else if (value === null){
    //                 subscriber.next(null);
    //             }
    //         }
    //         window.addEventListener('storage', handler);
    //         return () => {
    //             window.removeEventListener('storage', handler);
    //         };
    //     });
    // }

    




    setItem(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getItem(key: string): any {
     
        const value = JSON.parse(localStorage.getItem(key));
        if (value) {
            return JSON.parse(value);
        } else {
            return null;
        }
    }

    getStorageChangeEvent(key: string): Observable<any> {
        return this.storageChangeEvent.asObservable();
    }

    getPermission(): any {
        const item = localStorage.getItem('Permission');
        console.log('permission', item);
        return item ? JSON.parse(item) : null;
    }
}