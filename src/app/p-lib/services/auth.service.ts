import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { DTOConfig, DTOStaff, DTOToken } from '../dto/export.dto';
import { Ps_UtilCacheService, Ps_UtilObjectService } from '../utilities/export.util';
import { PS_CommonService } from './common.service';
import { Ps_CoreFunction } from './core.function';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class Ps_AuthService {
    keyCacheUserInfo: string = 'user_info'

    constructor(
        private apiService: PS_CommonService,
        private cacheService: Ps_UtilCacheService,
        private localStorageService: LocalStorageService
    ) {
    }
    //Thực thi việc đăng nhập và lấy token
    getToken(username, password): Observable<any> {
        let that = this;
        return new Observable(obs => {
            if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.getToken)) {
                Ps_CoreFunction.getToken(username, password).subscribe(res => {
                    if (Ps_UtilObjectService.hasValue(res)) {
                        that.setCacheToken(res).subscribe(s => {
                            DTOConfig.Authen.isLogin = true;
                            this.localStorageService.setItem('loginState', true);
                            that.apiService.resetData();
                            obs.next(true);
                            obs.complete();
                        }, f => {
                            obs.error(f);
                            obs.complete();
                        })
                    }
                }, f => {
                    obs.error(f);
                    obs.complete();
                });
            }
            else {
                throw "getToken no implement";
            }
        });
    }
    //Thực thi việc gọi về Server để refresh token
    refreshToken(token: DTOToken): Observable<any> {
        let that = this;
        return new Observable(observer => {
            if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.refreshToken)) {
                Ps_CoreFunction.refreshToken(token).subscribe(data => {
                    if (Ps_UtilObjectService.hasValue(data)) {
                        that.setCacheToken(data).subscribe(() => {
                            observer.next(data);
                            observer.complete();
                        }, err => {
                            that.clearToken("auth refreshTokenOnServer")
                            observer.next(null);
                            observer.complete();
                        });
                    } else {
                        that.clearToken("auth refreshTokenOnServer")
                        observer.next(null);
                        observer.complete();
                    }
                }, error => {
                    observer.error(error);
                    observer.complete()
                });
            } else {
                throw "refreshToken no implement";
            }
        });
    }
    //Thực thi get token vào cache theo function đã được định nghĩa trong authen.service.xxxx.ts
    getCacheToken(): Observable<any> {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.getCacheToken)) {
            return Ps_CoreFunction.getCacheToken();
        } else {
            throw "getCacheToken no implement";
        }
    }
    //Thực thi set token vào cache theo function đã được định nghĩa trong authen.service.xxxx.ts
    setCacheToken(token: DTOToken): Observable<any> {
        DTOConfig.Authen.token = new DTOToken(token);
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.setCacheToken)) {
            return Ps_CoreFunction.setCacheToken(token);
        } else {
            throw "setCacheToken no implement";
        }
    }
    //Thực thi xóa cache token và toàn bộ dữ liệu
    clearToken(logString: string = "auth clearToken"): void {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.clearToken)) {
            return Ps_CoreFunction.clearToken(logString);
        } else {
            throw "clearToken no implement";
        }
    }
    //Thực thi thiết lập mật khẩu người dùng
    setPassword(params: any): Observable<any> {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.setPassword)) {
            return Ps_CoreFunction.setPassword(params);
        } else {
            throw "setPassword no implement";
        }
    }
    //Thực thi thay đổi mật khẩu người dùng
    changePassword(params: any): Observable<any> {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.changePassword)) {
            return Ps_CoreFunction.changePassword(params);
        } else {
            throw "changePassword no implement";
        }
    }
    //Thực thi add authen token
    addAuthenticationToken(req: HttpRequest<any>): HttpRequest<any> {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.addAuthenticationToken)) {
            return Ps_CoreFunction.addAuthenticationToken(req);
        } else {
            throw "addAuthenticationToken no implement";
        }
    }
    //đăng xuất
    logout(redirectURL?: string): void {
        let that = this;
        that.clearToken();
        localStorage.clear();

        if (Ps_UtilObjectService.hasValueString(redirectURL)) {
            window.location.href = redirectURL
        }
        else if (Ps_UtilObjectService.hasValueString(Ps_CoreFunction.redirectLogin)) {
            Ps_CoreFunction.redirectLogin("");
        } 
        else {
            window.location.href = "/"
        }
    }
    //
    getUserInfo(token) {
        let that = this
        return new Observable<any>(obs => {
            if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.getUserInfo)) {
                Ps_CoreFunction.getUserInfo(token).subscribe(res => {
                    obs.next(res);
                    obs.complete();
                }, f => {
                    obs.error(f);
                    obs.complete();
                });
            }
            else {
                throw "getUserInfo no implement";
            }
        });
    }
    //cache user info
    getCacheUserInfo(): Observable<DTOStaff> {
        return new Observable(obs => {
            this.cacheService.getItem(this.keyCacheUserInfo).subscribe(res => {
                if (Ps_UtilObjectService.hasValue(res))
                    obs.next(JSON.parse(res.value).value);
                else {
                    obs.next(null);
                }
                obs.complete()
            }, () => {
                obs.next(null);
                obs.complete()
            });
        });
    }
    setCacheUserInfo(data: DTOStaff): void {
        this.cacheService.setItem(this.keyCacheUserInfo, data);
    }

    isLogin() {
        return DTOConfig.Authen.isLogin;
    }
}