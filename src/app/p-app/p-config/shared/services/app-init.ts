import { NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnumDashboard } from 'src/app/p-lib/enum/dashboard.enum';
import { EnumConfig } from 'src/app/p-lib/enum/config.enum';
import { EnumEcommerce } from 'src/app/p-lib/enum/ecommerce.enum';
import { EnumHR } from 'src/app/p-lib/enum/hr.enum';
import { EnumLayout } from 'src/app/p-lib/enum/layout.enum';
import { EnumLGT } from 'src/app/p-lib/enum/lgt.enum';
import { EnumMarketing } from 'src/app/p-lib/enum/marketing.enum';
import { EnumPurchase } from 'src/app/p-lib/enum/purchase.enum';
import { EnumSales } from 'src/app/p-lib/enum/sales.enum';
import { EnumWebHachi } from 'src/app/p-lib/enum/webhachi.enum';
import {
    DTOConfig,
    PS_CommonService,
    Ps_AuthService,
    Ps_UtilCacheService,
    DTOToken,
    Ps_UtilObjectService,

} from '../../../../p-lib';
import { Ps_AuthBearerService } from './auth.service.bearer';
import { EnumDeveloper } from 'src/app/p-lib/enum/developer.enum';

export class AppInit {
    static init(libCommon: PS_CommonService,
        auth: Ps_AuthService,
        cache: Ps_UtilCacheService,
        zone: NgZone,
        router: Router): Observable<boolean> {

        let that = this;
        return new Observable(obs => {
            zone.runOutsideAngular(() => {
                that.SetGlobalConfig();
                Ps_AuthBearerService.init(cache,
                    libCommon);
                libCommon.init().subscribe(s => {
                    //console.log('AppComponent: libCommon.init()');
                    //auth.getCacheToken().subscribe(res=>{
                    obs.next(true);
                    obs.complete();
                    // },
                    // (e)=>{
                    //     console.log(e);
                    //     obs.next(true);
                    //     obs.complete();
                    // });


                });

            });
        })

    }
    static SetGlobalConfig() {
        if (document['myparam']) {
            let data = document['myparam']();

            if (data != undefined && data != null) {
                let objConfig = {
                    idServer: {
                        client_id: "admin",
                        client_secret: "adminsecret",
                        scope: "adminapi offline_access",
                        grant_type: "password",
                    },
                    Authen: {
                        isLogin: false,
                        token: new DTOToken(),
                        refreshTokenInProgress: false,
                        refreshTokenSubject: new BehaviorSubject<any>(null),
                    },
                    appInfo: {
                        apiid: data.apiid,
                        urlLogin: data.urlLogin,
                        apiec: data.apiec,
                        apicnb: data.apicnb,
                        apiconf: data.apiconf,
                        apibi: data.apibi,
                        apimar: data.apimar,
                        apierp: data.apierp,
                        apiwms: data.apiwms,
                        apires: data.apires,
                        apisyn: data.apisyn,
                        apiecHachi: data.apiecHachi,
                        apiHachi: data.apiHachi,
                        res: data.res,
                    },
                    cache: {
                        timerPermission: 0,
                        timerApi: 0,
                        companyid: "1"
                    }
                };
                Object.assign(DTOConfig, objConfig);
            }
        }

        if (document['apiConfig']) {
            let apiConfig = document['apiConfig']();

            if (apiConfig != undefined && apiConfig != null) {
                let marketing = apiConfig.marketing
                let ecommerce = apiConfig.ecommerce
                let config = apiConfig.config
                let developer = apiConfig.developer
                let hr = apiConfig.hr
                let layout = apiConfig.layout
                let lgt = apiConfig.lgt
                let purchase = apiConfig.purchase
                let sales = apiConfig.sales
                let webhachi = apiConfig.webhachi
                let dashboard = apiConfig.dashboard
                let org = apiConfig.org
                
                Object.assign(EnumMarketing, marketing);
                Object.assign(EnumEcommerce, ecommerce);
                Object.assign(EnumConfig, config);
                Object.assign(EnumDeveloper, developer);
                Object.assign(EnumHR, hr);
                Object.assign(EnumHR, org);
                Object.assign(EnumLayout, layout);
                Object.assign(EnumLGT, lgt);
                Object.assign(EnumPurchase, purchase);
                Object.assign(EnumSales, sales);
                Object.assign(EnumWebHachi, webhachi);
                Object.assign(EnumDashboard, dashboard);
            }
        }
    }
}