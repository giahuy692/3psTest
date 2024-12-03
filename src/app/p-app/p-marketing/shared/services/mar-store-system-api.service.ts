import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOResponse, PS_CommonService } from 'src/app/p-lib';
import { DTOMAStore } from '../dto/DTOMAStore.dto';
import { MarketingApiConfigService } from './marketing-api-config.service';

@Injectable({
  providedIn: 'root'
})
export class MarStoreSystemAPIService {

  constructor(
    private api: PS_CommonService,
    private config: MarketingApiConfigService,
  ) { }

  GetListStore(state: State) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListStore.method,
          that.config.getAPIList().GetListStore.url,
          JSON.stringify(toDataSourceRequest(state))
        ).subscribe(
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
  GetListProvince(req?: State) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListProvince.method,
          that.config.getAPIList().GetListProvince.url,
          JSON.stringify(toDataSourceRequest(req))
        ).subscribe(
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
  GetListCountry(req?: State) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListCountry.method,
          that.config.getAPIList().GetListCountry.url,
          JSON.stringify(toDataSourceRequest(req))
        ).subscribe(
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

  GetStore(code: number) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetStore.method,
          that.config.getAPIList().GetStore.url,
          JSON.stringify({ Code: code })
        ).subscribe(
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

  UpdateStore(item: DTOMAStore, prop: string[]) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdateStore.method,
          that.config.getAPIList().UpdateStore.url,
          JSON.stringify({ DTO: item, Properties: prop })
        ).subscribe(
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
  
  DeleteStore(item: DTOMAStore[]) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().DeleteStore.method,
          that.config.getAPIList().DeleteStore.url,
          JSON.stringify(item)
        ).subscribe(
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