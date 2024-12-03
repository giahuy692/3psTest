import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { IDictionary } from './dictionary.interface';
import { DTOAPICache } from '../dto/dto.apicache';
import { Ps_UtilCacheService, Ps_UtilObjectService } from '../utilities/export.util';
import { ApiMethodType } from '../enum/export.enum';
import { DTOAPI, DTOResponse } from '../dto/export.dto';
import { Ps_CoreFunction } from './core.function';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';

@Injectable({
    providedIn: 'root'
})

export class PS_CommonService {
    private _dicData: IDictionary<Subject<any>> = {};
    private _dicRunning: IDictionary<Boolean> = {};

    constructor(
        private http: HttpClient,
        private cache: Ps_UtilCacheService,
        public layoutApiConfig: LayoutApiConfigService,
    ) { }
    public init(): Observable<boolean> {
        let that = this;

        return new Observable<boolean>(o => {
            this.cache.init().subscribe(s => {
                let keys: Array<string> = this.cache.apiGetKeys();
                keys.forEach(val => {
                    that._dicData[val] = new Subject<any>();
                    that._dicRunning[val] = false;
                });
                o.next(s);
                o.complete();
            });
        });
    }
    //Kết nối server lấy dữ liệu
    public connect<T>(
        pmethod: ApiMethodType,
        URL: string,
        data: unknown,
        headers?: HttpHeaders,
        withCredent: boolean = false,
        observe: any = 'body',
        responseType: any = 'json'
    ): Observable<T> {
        let that = this;

        if (!Ps_UtilObjectService.hasValue(headers))
            headers = that.getHeader();

        let options: {
            headers?: HttpHeaders,
            observe?: any,
            params?: any,
            reportProgress?: boolean,
            responseType?: any,
            withCredentials?: boolean
        } = {
            headers: headers,
            withCredentials: withCredent,
            observe: observe,
            responseType: responseType
        };
        let result: Observable<T>;
        switch (pmethod) {
            case ApiMethodType.get:
                options.params = data;
                result = that.http.get<T>(URL, options);
                break;
            case ApiMethodType.post:
                // const api = URL;
                // const moduleLv1 = localStorage.getItem('Module');
                // const moduleLv2 = localStorage.getItem('Menu');
                // try {
                //     const excludeStrings = ['UpdateAPIServices', 'GetListModuleAPITree', 'GetPermissionDLL', 'connect/token', 'getuserinfo', 'GetModule'];
                
                //     if (!excludeStrings.some(str => api?.includes(str))) {
                //         this.UpdateAPIServices(api, moduleLv1, moduleLv2).subscribe();
                //     }
                // } catch (error) {
                    
                // }
                
                result = this.http.post<T>(URL, data, options)
                break;
            case ApiMethodType.put:
                result = this.http.put<T>(URL, data, options)
                break;
            case ApiMethodType.delete:
                result = this.http.delete<T>(URL, options)
                break;
            default:
                result = this.http.post<T>(URL, JSON.stringify(data), options)
                break;
        }
        return result;
    }
    //Reset lại toàn bộ dữ liệu Data và các key đang running
    public resetData() {
        let that = this;

        that._dicData = {};
        that._dicRunning = {};
    }
    //Lấy dữ liệu
    public getData<T>(api: DTOAPI, param: any, formUrl: string = ''): Observable<T> {
        let that = this;
        return that.connectWithAuthFormURL<T>(api.method, api.url, param, formUrl);
    }
    //Cập nhật dữ liệu
    public updateData<T>(api: DTOAPI, param: any, formUrl: string = ''): Observable<T> {
        let that = this;
        return that.connect<T>(api.method, api.url, param, that.getHeader(formUrl));
    }
    //Xóa dữ liệu
    public deleteData<T>(api: DTOAPI, param: any, formUrl: string = ''): Observable<T> {
        let that = this;
        return that.connect<T>(api.method, api.url, param, that.getHeader(formUrl));
    }
    //Thực thi redirect trang login
    public redirectLogin(urlLogin: string): void {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.redirectLogin)) {
            return Ps_CoreFunction.redirectLogin(urlLogin);
        } else {
            throw "Redirect Login no implement";
        }
    }
    //Thực thi lấy header
    public getHeader(formURL: string = '', isAuthorize: boolean = true): HttpHeaders {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.getHeader)) {
            return Ps_CoreFunction.getHeader(formURL, isAuthorize);
        } else {
            throw "getUserInfo no implement";
        }
    }
    //lấy dữ liệu trên cache/server với việc truyền vào form để xác nhận phân quyền
    private connectWithAuthFormURL<T>(
        pmethod: ApiMethodType,
        URL: string,
        data: any,
        formURL: string
    ): Observable<T> {
        let that = this;
        let strkey: string = JSON.stringify(pmethod) + JSON.stringify(data) + URL;
        let headers = this.getHeader(formURL);
        if (Ps_UtilObjectService.hasValue(that._dicData[strkey])) {

            if (that._dicRunning[strkey]) {
                return that._dicData[strkey];
            } else {
                that.cache.apiGet(strkey).subscribe(obs => {
                    let flag: Boolean = false;
                    if (obs != null) {
                        let itemCache: DTOAPICache = Object.assign(new DTOAPICache(), obs);
                        if (itemCache.Expire > (new Date()).getTime()) {
                            flag = true;
                            that._dicData[strkey].next(itemCache.Data);
                            that._dicData[strkey].complete();
                            that._dicData[strkey] = new Subject<T>();
                        }
                    }
                    if (flag == false && that._dicRunning[strkey] == false) {
                        that._dicRunning[strkey] = true;
                        that.connect<T>(pmethod, URL, data, headers).subscribe(res => {
                            that._dicData[strkey].next(res);
                            that._dicRunning[strkey] = false;
                            that._dicData[strkey].complete();
                            that._dicData[strkey] = new Subject<T>();
                            let item: DTOAPICache = new DTOAPICache();
                            if (item.build(res) == true) {
                                that.cache.apiSet(strkey, item).subscribe(() => { });
                            }
                        },
                            f => {
                                that._dicData[strkey].error(f);
                                that._dicRunning[strkey] = false;
                                that._dicData[strkey].complete();
                                that._dicData[strkey] = new Subject<T>();
                            });
                    }
                }
                );
                return that._dicData[strkey];
            }
        } else {
            that._dicData[strkey] = new Subject<T>();
            that._dicRunning[strkey] = true;
            that.connect<T>(pmethod, URL, data, headers).subscribe(
                res => {
                    that._dicData[strkey].next(res);
                    that._dicRunning[strkey] = false;
                    that._dicData[strkey].complete();
                    that._dicData[strkey] = new Subject<T>();
                    let item: DTOAPICache = new DTOAPICache();
                    if (item.build(res) == true) {
                        that.cache.apiSet(strkey, item).subscribe(() => { });
                    }
                },
                f => {
                    that._dicData[strkey].error(f);
                    that._dicRunning[strkey] = false;
                    that._dicData[strkey].complete();
                    that._dicData[strkey] = new Subject<T>();
                }
            );
            return that._dicData[strkey];
        }
    }

    // API dùng để kiểm tra API đó đã tồn tại trong nhóm api của module đó chưa để insert vào DB
    UpdateAPIServices(api: string, moduleLv1: string, moduleLv2: string) {
        let that = this;
        let param = { 'Link': api, 'Module': moduleLv1, 'ModuleChild': moduleLv2 }
        return new Observable<DTOResponse>(obs => {
            that.connect(that.layoutApiConfig.getAPIList().UpdateAPIServices.method,
                that.layoutApiConfig.getAPIList().UpdateAPIServices.url,
                JSON.stringify(param)).subscribe(
                    (res: any) => {
                        obs.next(res);
                        obs.complete();
                    }, errors => {
                        obs.error(errors);
                        obs.complete();
                    }
                )
        });
    }
}