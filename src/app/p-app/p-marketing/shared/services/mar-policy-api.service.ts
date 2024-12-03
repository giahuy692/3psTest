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
export class MarPolicyAPIService {

  constructor(
    private api: PS_CommonService,
    private config: MarketingApiConfigService,
  ) { }
  
  GetListPolicy (state: State)
  {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListPolicy.method,
          that.config.getAPIList().GetListPolicy.url,
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
  GetListPolicyCategory ()
  {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListPolicyCategory.method,
          that.config.getAPIList().GetListPolicyCategory.url,
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

  GetPolicy (code: number)
  {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetPolicy.method,
          that.config.getAPIList().GetPolicy.url,
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

  UpdatePolicyStatus (item: DTOMAPost_ObjReturn, statusID: number)
  {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdatePolicyStatus.method,
          that.config.getAPIList().UpdatePolicyStatus.url,
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

  UpdatePolicy (item: DTOMAPost_ObjReturn, prop: string[])
  {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdatePolicy.method,
          that.config.getAPIList().UpdatePolicy.url,
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
  UpdatePolicyCategory (item, prop: string[])
  {
    let that = this;
    var param: DTOUpdate = {
      "DTO": item,
      "Properties": prop
    }

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdatePolicyCategory.method,
          that.config.getAPIList().UpdatePolicyCategory.url,
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
  DeletePolicy (item: DTOMAPost_ObjReturn[])
  {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().DeletePolicy.method,
          that.config.getAPIList().DeletePolicy.url,
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
