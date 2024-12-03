import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HriApiConfigService } from './hri-api-config.service';
import { DTOResponse, PS_CommonService, Ps_UtilCacheService } from 'src/app/p-lib';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';

@Injectable({
    providedIn: 'root'
})

export class QuizAPIService {

    constructor(
        private http: HttpClient,
        private config: HriApiConfigService,
        private cacheService: Ps_UtilCacheService,
        private api: PS_CommonService,
    ) { }

    // GetEvaluationSupervisor(state: State) {
    //     let that = this;

    //     return new Observable<DTOResponse>(obs => {
    //         that.api.connect(that.config.getAPIList().GetQuizMonitor.method,
    //             that.config.getAPIList().GetQuizMonitor.url,
    //             JSON.stringify(toDataSourceRequest(state))).subscribe(
    //                 (res: any) => {
    //                     obs.next(res);
    //                     obs.complete();
    //                 }, errors => {
    //                     obs.error(errors);
    //                     obs.complete();
    //                 })
    //     });
    // }

    GetEvaluationSupervisor() {
        let that = this;

        return new Observable<DTOResponse>(obs => {
            this.http.get("https://api.npoint.io/eac605ad181fa41668e7").subscribe(
                (res: any) => {
                    obs.next(res);
                    obs.complete();
                }, errors => {
                    obs.error(errors);
                    obs.complete();
                }
            )
        })
    }
}