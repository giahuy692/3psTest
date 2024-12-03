import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOResponse, PS_CommonService } from 'src/app/p-lib';
import { DTOMAPost_ObjReturn } from '../dto/DTOMANews.dto';
import { MarketingApiConfigService } from './marketing-api-config.service';

@Injectable({
  providedIn: 'root'
})
export class MarIntroduceAPIService {
  constructor(
    private api: PS_CommonService,
    private config: MarketingApiConfigService,
  ) { }

  GetListIntroduce(state: State) {
    let that = this;

    return new Observable<DTOResponse>(obs => {
      that.api.connect(
        that.config.getAPIList().GetListIntroduce.method,
        that.config.getAPIList().GetListIntroduce.url,
        JSON.stringify(toDataSourceRequest(state))
      ).subscribe((res: any) => {
        obs.next(res);
        obs.complete();
      }, errors => {
        obs.error(errors);
        obs.complete();
      })
    })
  }
  GetListIntroduceCategory() {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListIntroduceCategory.method,
          that.config.getAPIList().GetListIntroduceCategory.url,
          JSON.stringify({})
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

  GetIntroduce(code: number) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetIntroduce.method,
          that.config.getAPIList().GetIntroduce.url,
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

  UpdateIntroduceStatus(item: DTOMAPost_ObjReturn, statusID: number) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdateIntroduceStatus.method,
          that.config.getAPIList().UpdateIntroduceStatus.url,
          JSON.stringify({ ListDTO: [item], StatusID: statusID })
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

  UpdateIntroduce(item: DTOMAPost_ObjReturn, prop: string[]) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdateIntroduce.method,
          that.config.getAPIList().UpdateIntroduce.url,
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
  UpdateIntroduceCategory(item, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      "DTO": item,
      "Properties": prop
    }

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdateIntroduceCategory.method,
          that.config.getAPIList().UpdateIntroduceCategory.url,
          JSON.stringify(param)
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
  DeleteIntroduce(item: DTOMAPost_ObjReturn[]) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().DeleteIntroduce.method,
          that.config.getAPIList().DeleteIntroduce.url,
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
