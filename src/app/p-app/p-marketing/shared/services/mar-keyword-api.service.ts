import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import {
  DTOConfig,
  DTOResponse,
  PS_CommonService,
  Ps_UtilObjectService,
} from 'src/app/p-lib';
import { MarketingApiConfigService } from './marketing-api-config.service';
import { DTOMAKeyword } from '../dto/DTOMAKeyword.dto';
import { DTOCFFolder } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';

@Injectable({
  providedIn: 'root'
})
export class MarKeywordApiService {

  constructor(
    public api: PS_CommonService,
    public config: MarketingApiConfigService
  ) { }

  GetListSearchKeyword(state: State) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListSearchKeyword.method,
          that.config.getAPIList().GetListSearchKeyword.url,
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

  GetSearchKeyword(code: number) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetSearchKeyword.method,
          that.config.getAPIList().GetSearchKeyword.url,
          JSON.stringify(code)
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

  UpdateSearchKeyword(item: DTOMAKeyword) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateSearchKeyword.method,
          that.config.getAPIList().UpdateSearchKeyword.url,
          JSON.stringify(item, (k, v) =>
            Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['StartDate', 'FinishDate'])
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

  UpdateStatusSearchKeyword(item: DTOMAKeyword[], StatusID: number) {
    let that = this;
    var param = {
      ListDTO: item,
      StatusID: StatusID,
    };

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateStatusSearchKeyword.method,
          that.config.getAPIList().UpdateStatusSearchKeyword.url,
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

  DeleteSearchKeyword(item: DTOMAKeyword[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteSearchKeyword.method,
          that.config.getAPIList().DeleteSearchKeyword.url,
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

  GetFolderWithFile(childPath: string = '', id: number) {
    let that = this;
    //nếu có id > 0 thì get folder root, nếu có path thì get folder con
    let param = {
      'ID': Ps_UtilObjectService.hasValueString(childPath) ? 0 : id,//news = 8
      'Folder': childPath
    }
    return new Observable<DTOCFFolder>(obs => {
      that.api.connect(that.config.getAPIList().GetFolderWithFile.method,
        that.config.getAPIList().GetFolderWithFile.url, JSON.stringify(param)).subscribe(
          (res: DTOCFFolder) => {
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
