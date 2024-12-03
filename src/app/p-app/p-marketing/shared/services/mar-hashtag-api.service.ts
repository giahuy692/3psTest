import { DTOMAHashtag } from './../dto/DTOMAHashtag.dto';
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
import { DTODetailConfProduct } from 'src/app/p-app/p-config/shared/dto/DTOConfProduct';
import { DTOMAPost_ObjReturn } from '../dto/DTOMANews.dto';
import { param } from 'jquery';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MarHashtagAPIService {
  constructor(
    public api: PS_CommonService,
    public config: MarketingApiConfigService
  ) {}

  GetListHashtag(state: State) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHashtag.method,
          that.config.getAPIList().GetListHashtag.url,
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
  GetHashtag(code: number) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHashtag.method,
          that.config.getAPIList().GetHashtag.url,
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
  GetHashtagProduct(item: DTODetailConfProduct) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHashtagProduct.method,
          that.config.getAPIList().GetHashtagProduct.url,
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
  GetHashtagBlog(titleVN: string) {
    let that = this;
    var param = new DTOMAPost_ObjReturn();
    param.TitleVN = titleVN;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHashtagBlog.method,
          that.config.getAPIList().GetHashtagBlog.url,
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
  // GetListHashtagCategory() {
  // 	let that = this;
  // 	return new Observable<DTOResponse>(obs => {
  // 		that.api.connect(that.config.getAPIList().GetListHashtagCategory.method,
  // 			that.config.getAPIList().GetListHashtagCategory.url, JSON.stringify({"page": 1})).subscribe(
  // 				(res: any) => {
  // 					obs.next(res);
  // 					obs.complete();
  // 				}, errors => {
  // 					obs.error(errors);
  // 					obs.complete();
  // 				}
  // 			)
  // 	});
  // }
  UpdateHashtag(item: DTOMAHashtag, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: item,
      Properties: prop,
    };

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHashtag.method,
          that.config.getAPIList().UpdateHashtag.url,
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
  UpdateHashtagStatus(item: DTOMAHashtag[], StatusID: number) {
    let that = this;
    var param = {
      ListDTO: item,
      StatusID: StatusID,
    };

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHashtagStatus.method,
          that.config.getAPIList().UpdateHashtagStatus.url,
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
  // UpdateHashtagCategory(item: DTOMAPost_ObjReturn, prop: string[]) {
  // 	let that = this;
  // 	var param: DTOUpdate = {
  // 		'DTO': item,
  // 		'Properties': prop
  // 	}

  // 	return new Observable<DTOResponse>(obs => {
  // 		that.api.connect(that.config.getAPIList().UpdateHashtagCategory.method,
  // 			that.config.getAPIList().UpdateHashtagCategory.url, JSON.stringify(param))
  // 			.subscribe(
  // 				(res: any) => {
  // 					obs.next(res);
  // 					obs.complete();
  // 				}, errors => {
  // 					obs.error(errors);
  // 					obs.complete();
  // 				}
  // 			)
  // 	});
  // }
  DeleteHashtag(item: DTOMAHashtag[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteHashtag.method,
          that.config.getAPIList().DeleteHashtag.url,
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

  ImportExcelHashtag(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelHashtag.method,
				that.config.getAPIList().ImportExcelHashtag.url, form, headers).subscribe(
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

  ImportExcelHashtagProduct(data: File, hashtag: number) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('Hashtag', hashtag.toString());
		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelHashtagProduct.method,
				that.config.getAPIList().ImportExcelHashtagProduct.url, form, headers).subscribe(
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
