import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { DTOConfig } from '../dto/dto.config';
import { Ps_UtilObjectService } from '../utilities/export.util';
import { Ps_AuthService } from './auth.service';
import { Ps_CoreFunction } from './core.function';

@Injectable({
    providedIn: 'root'
})
export class PS_AuthGuardService  {
   
    constructor(
        public router: Router,
        public auth: Ps_AuthService,

    ) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        // console.log(Ps_CoreFunction.canActivate(route,state,this.router,this.auth));
        return Ps_CoreFunction.canActivate(route,state,this.router,this.auth);
    }
    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return Ps_CoreFunction.canActivateChild(route,state,this.router,this.auth);
    }

    // private p_CheckPermission(link: string, formUrl?: string) {
    //     let that = this;
    //     return new Promise<boolean>((resolve) => {
    //         if (that.isDev || that.lstIgnore.indexOf(link) != -1) {
    //             resolve(true);
    //         } else {
    //             if (Ps_UtilObjectService.hasValue(DTOConfig.Authen.token) &&
    //                 Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token)) {
    //                 resolve(true);
    //             } else {
    //                 this.auth.getCacheToken().subscribe(() => {

    //                     if (Ps_UtilObjectService.hasValue(DTOConfig.Authen.token) &&
    //                         Ps_UtilObjectService.hasValueString(DTOConfig.Authen.token.access_token)) {
    //                         resolve(true);
    //                     } else {
    //                         setTimeout(() => {
    //                             this.router.navigate([DTOConfig.appInfo.urlLogin]);
    //                         }, 100);
    //                         resolve(false);
    //                     }
    //                 }, f => {
    //                     setTimeout(() => {
    //                         this.router.navigate([DTOConfig.appInfo.urlLogin]);
    //                     }, 100);
    //                     resolve(false);
    //                 });
    //             }
    //         }
    //     });
    // }

}