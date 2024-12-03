import { HttpEvent, HttpHandler, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from "rxjs";
import { DTOAPI } from '../dto/dto.api';
import { DTOToken } from '../dto/dto.token';
import { Ps_AuthService } from './export.service';

export class Ps_CoreFunction {
    ///Function liên quan tới token
    public static getToken?: (username: string, password: string) => Observable<any>;
    public static refreshToken: (token: DTOToken) => Observable<any>;
    public static clearToken: (logString: string) => void;
    public static setCacheToken: (token: DTOToken) => Observable<any>;
    public static getCacheToken: () => Observable<any>;
    public static changePassword: (params: any) => Observable<any>;
    public static setPassword: (params: any) => Observable<any>;
    public static addAuthenticationToken: (req: HttpRequest<any>) => HttpRequest<any>
    public static getUserInfo: (token: DTOToken) => Observable<any>;
    ///Function liên quan tới Services
    public static getHeader: (formURL: string, isAuthorize: boolean) => HttpHeaders;
    public static redirectLogin: (urlLogin: string) => void;

    ///Function liên quan tới cấu hình api auth
    public static getApiToken: () => DTOAPI;
    public static getApiRefreshToken: () => DTOAPI;
    public static getApiSetPassword: () => DTOAPI;
    public static getApiChangePassword: () => DTOAPI;

    ///Function liên quan tới phân quyền auth-guard
    public static canActivate?: (activedRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot, router: Router, auth: Ps_AuthService) => Promise<boolean>;
    public static canActivateChild?: (activedRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot, router: Router, auth: Ps_AuthService) => Promise<boolean>;

    ///Function liên quan tới intercept
    public static intercept: (req: HttpRequest<any>, next: HttpHandler, auth: Ps_AuthService) => Observable<HttpEvent<any>>;
}
