import { DTOUpdate } from './../../../p-ecommerce/shared/dto/DTOUpdate';
import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOResponse, PS_CommonService, Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOMAPost_ObjReturn } from '../dto/DTOMANews.dto';
import { MarketingApiConfigService } from './marketing-api-config.service';

@Injectable({
  providedIn: 'root'
})
export class MarNewsAPIService {

  constructor
    (
      private api: PS_CommonService,
      private config: MarketingApiConfigService,
  ) { }

  GetListNews(state: State) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListNews.method,
          that.config.getAPIList().GetListNews.url,
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

  GetListNewsCategory() {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListNewsCategory.method,
          that.config.getAPIList().GetListNewsCategory.url,
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

  GetListCMSNewsCategory(TypeData: number) {
    let that = this;
    let param = {
      TypeData: TypeData
    }


    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListCMSNewsCategory.method,
          that.config.getAPIList().GetListCMSNewsCategory.url,
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
  

  GetNews(code: number) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetNews.method,
          that.config.getAPIList().GetNews.url,
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

  UpdateNewsStatus(items: DTOMAPost_ObjReturn[], statusID: number) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdateNewsStatus.method,
          that.config.getAPIList().UpdateNewsStatus.url,
          JSON.stringify({ ListDTO: items, StatusID: statusID })
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

  UpdateNews(item: DTOMAPost_ObjReturn, prop: string[]) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdateNews.method,
          that.config.getAPIList().UpdateNews.url,
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
  UpdateNewsCategory(item, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      "DTO": item,
      "Properties": prop
    }

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdateNewsCategory.method,
          that.config.getAPIList().UpdateNewsCategory.url,
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
  DeleteNews(item: DTOMAPost_ObjReturn[]) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().DeleteNews.method,
          that.config.getAPIList().DeleteNews.url,
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
   
  GetListCMSNews(state: State) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetListCMSNews.method,
          that.config.getAPIList().GetListCMSNews.url,
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
  UpdateCMSNews(item: DTOMAPost_ObjReturn, prop: string[]) {
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().UpdateCMSNews.method,
          that.config.getAPIList().UpdateCMSNews.url,
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
  GetCMSNews(item: DTOMAPost_ObjReturn){
    let that = this;

    return new Observable<DTOResponse>(
      obs => {
        that.api.connect(
          that.config.getAPIList().GetCMSNews.method,
          that.config.getAPIList().GetCMSNews.url,
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
