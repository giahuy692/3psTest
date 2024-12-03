import { HttpHandler, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { ActivatedRouteSnapshot, RouteConfigLoadEnd, Router, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { DTOAPI, DTOConfig, DTOToken } from '../../../../p-lib/dto/export.dto';
import { Ps_UtilCacheService } from '../../../../p-lib/utilities/utility.cache';
import { Ps_UtilObjectService } from '../../../../p-lib/utilities/utility.object';
import { APIList_IDServer } from '../../../../p-lib/services/auth.service.api';
import { PS_CommonService } from '../../../../p-lib/services/common.service';
import { Ps_CoreFunction } from '../../../../p-lib/services/core.function';
import { ApiMethodType, Ps_AuthService } from "src/app/p-lib";
import { catchError, filter, switchMap, take } from "rxjs/operators";

export class Ps_AuthBearerService {
    private refreshTokenInProgress: boolean = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    //Khởi tạo Bearer Authen Service
    static init(
        _cache: Ps_UtilCacheService,
        libcommon: PS_CommonService,
    ) {
        //Khởi tạo header theo nguyên tắc Bearer
        Ps_CoreFunction.getHeader = (formURL: string = '', isAuthorize: boolean = true) => {
            return this.getHeaderJSon(formURL, isAuthorize);
        };
        //Khởi tạo redirect trang Login
        Ps_CoreFunction.redirectLogin = (urlLogin: string) => {
            setTimeout(() => {
                window.location.href = urlLogin;
            }, 1);
        };
        //Khởi tạo đăng nhập và getToken từ server
        Ps_CoreFunction.getToken = (username: string, password: string) => {
            const data = new HttpParams({
                fromObject: {
                    client_id: DTOConfig.idServer.client_id,
                    client_secret: DTOConfig.idServer.client_secret,
                    grant_type: DTOConfig.idServer.grant_type,
                    scope: DTOConfig.idServer.scope,
                    username: username,
                    password: password
                }
            });

            return libcommon.connect(APIList_IDServer.apiToken().method, APIList_IDServer.apiToken().url, data,
                this.getHeaderJSon('', false, true), false);
        };
        //Khởi tạo refresh token từ server
        Ps_CoreFunction.refreshToken = (token: DTOToken) => {
            // let data = { reqdata: token.refresh_token }

            const formURL = new HttpParams({
                fromObject: {
                    client_id: DTOConfig.idServer.client_id,
                    client_secret: DTOConfig.idServer.client_secret,
                    grant_type: 'refresh_token',
                    refresh_token: token.refresh_token
                }
            });
            // return libcommon.connect(APIList_IDServer.apiRefreshToken().method,
            //     APIList_IDServer.apiRefreshToken().url, data, this.getHeaderJSon('', false))
            return libcommon.connect(APIList_IDServer.apiRefreshToken().method,
                APIList_IDServer.apiRefreshToken().url, formURL, this.getHeaderJSon('', false, true), false)
        };
        //Khởi tạo get token từ cache
        Ps_CoreFunction.getCacheToken = () => {

            return new Observable(obs => {
                let token: DTOToken;
                _cache.getItem("bearerToken").subscribe(ops => {
                    if (Ps_UtilObjectService.hasValue(ops)) {
                        token = new DTOToken(JSON.parse(ops.value).value);
                    }
                    DTOConfig.Authen.token = token;
                    DTOConfig.Authen.isLogin = (Ps_UtilObjectService.hasValue(token) &&
                        Ps_UtilObjectService.hasValueString(token.access_token));
                    obs.next(token);
                    obs.complete();
                });
            });
        };
        //Khởi tạo set token vào cache
        Ps_CoreFunction.setCacheToken = (token: DTOToken) => {
            return new Observable(obs => {
                _cache.setItem("bearerToken", token);
                obs.next(token);
                obs.complete();
            });
        };
        //Khởi tạo xóa token khỏi cache
        Ps_CoreFunction.clearToken = (logString: string = "auth clearToken") => {

            _cache.clear().subscribe(f => {
                DTOConfig.Authen.isLogin = false;
                DTOConfig.Authen.token = new DTOToken();
                //console.log("xóa hết cache tại:" + logString)
            });
        };
        //Khởi tạo thay đổi password
        Ps_CoreFunction.changePassword = (params: any) => {
            return libcommon.connect(APIList_IDServer.apiChangePassword().method, APIList_IDServer.apiChangePassword().url, params);
        };
        //Khởi tạo thiết lập password
        Ps_CoreFunction.setPassword = (params: any) => {
            return libcommon.connect(APIList_IDServer.apiSetPassword().method, APIList_IDServer.apiSetPassword().url, params);
        };
        //Khởi tạo thiết lập add authen
        Ps_CoreFunction.addAuthenticationToken = (req: HttpRequest<any>) => {
            if (Ps_UtilObjectService.hasValue(DTOConfig.Authen.token) &&
                Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token)) {
                req.clone({
                    setHeaders: {
                        Authorization: 'Bearer ' + DTOConfig.Authen.token.access_token,
                    }
                });
            }
            return req;
        };
        //#region Function liên quan tới cấu hình api auth
        //api đăng nhập lấy token
        Ps_CoreFunction.getApiToken = () => {
            return new DTOAPI({
                url: DTOConfig.appInfo.apiid + 'connect/token',
                method: ApiMethodType.post
            });
        };
        //api refresh token
        // Ps_CoreFunction.getApiRefreshToken = () => {
        //     return new DTOAPI({
        //         url: DTOConfig.appInfo.apiid + 'api/Account/RefreshToken',
        //         method: ApiMethodType.post
        //     });
        // };
        Ps_CoreFunction.getApiRefreshToken = () => {
            return new DTOAPI({
                url: DTOConfig.appInfo.apiid + 'connect/token',
                method: ApiMethodType.post
            });
        };
        //api thiết lập mật khẩu người dùng
        Ps_CoreFunction.getApiSetPassword = () => {
            return new DTOAPI({
                url: DTOConfig.appInfo.apiid + 'api/Account/SetPassword',
                method: ApiMethodType.post
            });
        };
        //api đổi mật khẩu người dùng
        Ps_CoreFunction.getApiChangePassword = () => {
            return new DTOAPI({
                // url: DTOConfig.appInfo.apiid + 'api/Account/ChangePassword',
                url: DTOConfig.appInfo.apiid + 'identity/changepassword',
                method: ApiMethodType.post
            });
        };
        //#endregion
        //#region  Function liên quan tới phân quyền auth-guard
        Ps_CoreFunction.canActivateChild = (activedRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot, router: Router, auth: Ps_AuthService) => {
            let isDev = false;
            return new Promise<boolean>((resolve) => {

                if (isDev) {
                    resolve(true);
                } else {
                    if (Ps_UtilObjectService.hasValue(DTOConfig.Authen.token) &&
                        Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token)) {
                        resolve(true);
                    } else {
                        auth.getCacheToken().subscribe(() => {

                            if (Ps_UtilObjectService.hasValue(DTOConfig.Authen.token) &&
                                Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token)) {
                                resolve(true);
                            } else {
                                setTimeout(() => {
                                    // router.navigate([DTOConfig.appInfo.urlLogin]);//lỗi 404
                                    // router.navigate([''])//ko redirect
                                    // Ps_CoreFunction.redirectLogin("");//lỗi loop vô tận
                                    auth.logout()
                                }, 100);
                                resolve(false);
                            }
                        }, f => {
                            setTimeout(() => {
                                router.navigate([DTOConfig.appInfo.urlLogin]);
                            }, 100);
                            resolve(false);
                        });
                    }
                }
            })
        }
        Ps_CoreFunction.canActivate = (activedRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot, router: Router, auth: Ps_AuthService) => {
            let isDev = false;
            return new Promise<boolean>((resolve) => {

                if (isDev) {
                    resolve(true);
                } else {
                    if (Ps_UtilObjectService.hasValue(DTOConfig.Authen.token) &&
                        Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token)) {
                        resolve(true);
                    } else {
                        auth.getCacheToken().subscribe(() => {

                            if (Ps_UtilObjectService.hasValue(DTOConfig.Authen.token) &&
                                Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token)) {
                                resolve(true);
                            } else {
                                setTimeout(() => {
                                    router.navigate([DTOConfig.appInfo.urlLogin]);
                                    // auth.logout()
                                }, 100);
                                resolve(false);
                            }
                        }, f => {
                            setTimeout(() => {
                                router.navigate([DTOConfig.appInfo.urlLogin]);
                            }, 100);
                            resolve(false);
                        });
                    }
                }
            })
        }
        //#endregion
        //#region Function liên quan tới intercept
        Ps_CoreFunction.addAuthenticationToken = (req: HttpRequest<any>): HttpRequest<any> => {
            if (Ps_UtilObjectService.hasValue(DTOConfig.Authen)
                && Ps_UtilObjectService.hasValue(DTOConfig.Authen.token)
                && Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token)
            )
                req = req.clone({
                    setHeaders:
                    {
                        Authorization: "Bearer " + DTOConfig.Authen.token.access_token,
                    }
                });
            return req;
        }
        Ps_CoreFunction.intercept = (req: HttpRequest<any>, next: HttpHandler, auth: Ps_AuthService) => {

            let that = this;
            req = Ps_CoreFunction.addAuthenticationToken(req);
            return next.handle(req).pipe(catchError(err => {
                //Lỗi do đăng nhập chưa xóa dữ liệu trên cache
                if (req.url == APIList_IDServer.apiToken().url) {
                    //console.log("checkLinkIDServer: true")
                    auth.clearToken("checkLinkIDServer");
                    let error = "";
                    if (Ps_UtilObjectService.hasValue(err)) {
                        if (Ps_UtilObjectService.hasValue(err.error) &&
                            Ps_UtilObjectService.hasValue(err.error.Message)) {
                            error = err.error.Message;
                        } else {
                            if (Ps_UtilObjectService.hasValue(err.statusText))
                                error = err.statusText;
                            else {
                                error = err;
                            }
                        }
                    }
                    return throwError(err);
                }
                //Lỗi khác lỗi 401
                else if (err.status !== 401) {
                    let error = "";
                    if (Ps_UtilObjectService.hasValue(err)) {
                        if (Ps_UtilObjectService.hasValue(err.error) && Ps_UtilObjectService.hasValue(err.error.Message)) {
                            error = err.error.Message;
                        } else {
                            if (Ps_UtilObjectService.hasValue(err.statusText))
                                error = err.statusText;
                            else {
                                error = err;
                            }
                        }
                    }
                    return throwError(error);
                }
                //Lỗi 401
                else {


                    if (!DTOConfig.Authen.refreshTokenInProgress) {
                        // console.log('pause request ');
                        // console.log(req)
                        // console.log(DTOConfig.Authen.refreshTokenInProgress)
                        DTOConfig.Authen.refreshTokenInProgress = true;
                        DTOConfig.Authen.refreshTokenSubject.next(null);
                        auth.refreshToken(DTOConfig.Authen.token).subscribe((data) => {
                            DTOConfig.Authen.refreshTokenInProgress = false;
                            DTOConfig.Authen.refreshTokenSubject.next(data);
                            return next.handle(Ps_CoreFunction.addAuthenticationToken(req));
                        },
                            error => {
                                auth.clearToken("AuthInterceptor");
                                // libcommon.redirectLogin(DTOConfig.appInfo.urlLogin);
                                libcommon.redirectLogin('');
                                return throwError(error);
                            });
                    }
                    return DTOConfig.Authen.refreshTokenSubject.pipe(
                        filter(token => token !== null),
                        take(1),
                        switchMap((token) => next.handle(Ps_CoreFunction.addAuthenticationToken(req)))
                    );
                }
            }));
        }
        //user info
        Ps_CoreFunction.getUserInfo = (token: DTOToken) => {
            return libcommon.connect(APIList_IDServer.getUserInfo().method, APIList_IDServer.getUserInfo().url, token.access_token,
                this.getHeaderJSon('', false, true), false);
        };
        //#endregion

    }
    //Tạo header theo nguyên tắc bearer
    static getHeaderJSon(formURL: string = '', isAuthorize: boolean = true, istoken: boolean = false): HttpHeaders {
        if (isAuthorize) {
            return formURL == '' ? new HttpHeaders({
                'Data-type': 'json',
                'Content-type': 'application/json;charset=utf-8',
                // 'Authorization': 'Bearer' + Ps_UtilObjectService.hasValue(DTOConfig.Authen.token) &&
                //     Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token) ?
                //     DTOConfig.Authen.token.access_token : '',
                'UserName': '',
                'Company': DTOConfig.cache.companyid,
                'DataPermission': Ps_UtilObjectService.hasValue(DTOConfig.cache.dataPermission) ?
                    DTOConfig.cache.dataPermission : '',
                'Language': 'vi-VN',
                'FormURL': formURL,
                'Access-Control-Allow-Origin': '*',
            }) : new HttpHeaders({
                'Data-type': 'json',
                'Content-type': 'application/json;charset=utf-8',
                // 'Authorization': 'Bearer' + Ps_UtilObjectService.hasValue(DTOConfig.Authen.token) &&
                //     Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token) ?
                //     DTOConfig.Authen.token.access_token : '',
                'UserName': '',
                'Language': 'vi-VN',
                'Company': DTOConfig.cache.companyid,
                'DataPermission': Ps_UtilObjectService.hasValue(DTOConfig.cache.dataPermission) ?
                    DTOConfig.cache.dataPermission : '',
                'FormURL': formURL,
                'Access-Control-Allow-Origin': '*',
            });
        } else {
            return istoken ? new HttpHeaders({
                'Content-type': 'application/x-www-form-urlencoded',
                'Language': 'vi-VN',
                'Access-Control-Allow-Origin': '*'
            }) : new HttpHeaders({
                'Data-type': 'json',
                'Content-type': 'application/json;charset=utf-8',
                'Language': 'vi-VN',
                'Access-Control-Allow-Origin': '*',
            });
        }
    }
}