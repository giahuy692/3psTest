import { DTOMAPost_ObjReturn } from './../dto/DTOMANews.dto';
import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import {
  DTOConfig,
  DTOResponse,
  PS_CommonService,
  Ps_UtilObjectService,
} from 'src/app/p-lib';
import { MarketingApiConfigService } from './marketing-api-config.service';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MarPostAPIService {
  constructor(
    public api: PS_CommonService,
    public config: MarketingApiConfigService
  ) {}

  GetListBlog(state: State) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListBlog.method,
          that.config.getAPIList().GetListBlog.url,
          JSON.stringify(toDataSourceRequest(state))
        )
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          },
          (errors) => {
            obs.error(errors);
            obs.complete();
          }
        );
    });
  }
  GetBlog(code: number) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetBlog.method,
          that.config.getAPIList().GetBlog.url,
          JSON.stringify({ Code: code })
        )
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          },
          (errors) => {
            obs.error(errors);
            obs.complete();
          }
        );
    });
  }
  GetListBlogCategory() {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListBlogCategory.method,
          that.config.getAPIList().GetListBlogCategory.url,
          JSON.stringify({ page: 1 })
        )
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          },
          (errors) => {
            obs.error(errors);
            obs.complete();
          }
        );
    });
  }
  UpdateBlog(item: DTOMAPost_ObjReturn, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: item,
      Properties: prop,
    };

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateBlog.method,
          that.config.getAPIList().UpdateBlog.url,
          JSON.stringify(param, (k, v) =>
            Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['StatusID'])
          )
        )
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          },
          (errors) => {
            obs.error(errors);
            obs.complete();
          }
        );
    });
  }
  UpdateBlogStatus(item: DTOMAPost_ObjReturn[], StatusID: number) {
    let that = this;
    var param = {
      ListDTO: item,
      StatusID: StatusID,
    };

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateBlogStatus.method,
          that.config.getAPIList().UpdateBlogStatus.url,
          JSON.stringify(param)
        )
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          },
          (errors) => {
            obs.error(errors);
            obs.complete();
          }
        );
    });
  }
  UpdateBlogCategory(item: DTOMAPost_ObjReturn, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: item,
      Properties: prop,
    };

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateBlogCategory.method,
          that.config.getAPIList().UpdateBlogCategory.url,
          JSON.stringify(param)
        )
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          },
          (errors) => {
            obs.error(errors);
            obs.complete();
          }
        );
    });
  }
  DeleteBlog(item: DTOMAPost_ObjReturn[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteBlog.method,
          that.config.getAPIList().DeleteBlog.url,
          JSON.stringify(item)
        )
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          },
          (errors) => {
            obs.error(errors);
            obs.complete();
          }
        );
    });
  }

  ImportExcelBlog(data: File) {
    let that = this;
    var form: FormData = new FormData();
    form.append('file', data);
    var headers = new HttpHeaders();
    headers = headers.append('Company', DTOConfig.cache.companyid);

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().ImportExcelBlog.method,
          that.config.getAPIList().ImportExcelBlog.url,
          form,
          headers
        )
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          },
          (errors) => {
            obs.error(errors);
            obs.complete();
          }
        );
    });
  }
}
