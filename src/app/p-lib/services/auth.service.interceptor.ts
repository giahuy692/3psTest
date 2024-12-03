import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ps_AuthService } from './auth.service';
import { Ps_UtilObjectService } from '../utilities/export.util';
import { DTOConfig } from '../dto/dto.config';
import { PS_CommonService } from './common.service';
import { APIList_IDServer } from './auth.service.api';
import { Ps_CoreFunction } from './core.function';

@Injectable()
export class PS_AuthInterceptorService implements HttpInterceptor {

   

    constructor(public auth: Ps_AuthService,
        public libcommon: PS_CommonService
    ) { 
    }  

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {        
        let that = this;
        return Ps_CoreFunction.intercept(req,next,that.auth);       
    }
}