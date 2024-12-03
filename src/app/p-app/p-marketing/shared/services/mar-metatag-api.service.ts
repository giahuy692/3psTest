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
import { DTODetailConfProduct } from 'src/app/p-app/p-config/shared/dto/DTOConfProduct';
import DTOMAPost_ObjReturn from '../dto/DTOMANews.dto';
import { DTOMetaTag } from '../dto/DTOMetaTag.dto';


@Injectable({
  providedIn: 'root'
})
export class MarMetatagApiService {

  constructor(
    public api: PS_CommonService,
    public config: MarketingApiConfigService
  ) { }

  UpdateProductMetaTag(item: DTODetailConfProduct) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateProductMetaTag.method,
          that.config.getAPIList().UpdateProductMetaTag.url,
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
  

  UpdateNewsMetaTag(item: DTOMAPost_ObjReturn) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateNewsMetaTag.method,
          that.config.getAPIList().UpdateNewsMetaTag.url,
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
  

  UpdateProductMetaTagStatus(item: DTODetailConfProduct[], StatusID: number) {
    let that = this;
    var param = {
      ListDTO: item,
      StatusID: StatusID,
    };

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateProductMetaTagStatus.method,
          that.config.getAPIList().UpdateProductMetaTagStatus.url,
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

  UpdateNewsMetaTagStatus(item: DTOMAPost_ObjReturn[], StatusID: number) {
    let that = this;
    var param = {
      ListDTO: item,
      StatusID: StatusID,
    };

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateNewsMetaTagStatus.method,
          that.config.getAPIList().UpdateNewsMetaTagStatus.url,
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

  GetListMetaTagCategory(){
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListMetaTagCategory.method,
          that.config.getAPIList().GetListMetaTagCategory.url,
          JSON.stringify({})
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

  GetListMetaTag(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
            that.api.connect(that.config.getAPIList().GetListMetaTag.method,
                    that.config.getAPIList().GetListMetaTag.url,
                    JSON.stringify(toDataSourceRequest(gridState))).subscribe(
                            (res: any) => {
                                    obs.next(res);
                                    obs.complete();
                            }, errors => {
                                    obs.error(errors);
                                    obs.complete();
                            })
    });
}



UpdateMetaTag(item: DTOMetaTag) {
  let that = this;

  return new Observable<DTOResponse>((obs) => {
    that.api
      .connect(
        that.config.getAPIList().UpdateMetaTag.method,
        that.config.getAPIList().UpdateMetaTag.url,
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



UpdateMetaTagStatus(item: DTOMetaTag[], StatusID: number) {
  let that = this;
  var param = {
    ListDTO: item,
    StatusID: StatusID,
  };

  return new Observable<DTOResponse>((obs) => {
    that.api
      .connect(
        that.config.getAPIList().UpdateMetaTagStatus.method,
        that.config.getAPIList().UpdateMetaTagStatus.url,
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
}
