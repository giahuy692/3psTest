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
import { DTOCategoryWeb } from '../dto/DTOCategoryWeb.dto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';

@Injectable({
  providedIn: 'root',
})
export class MarCategoryWebAPIService {
  constructor(
    private api: PS_CommonService,
    private config: MarketingApiConfigService,
    private http: HttpClient,
    public layoutConfig: LayoutApiConfigService,

  ) { }

  GetListWebTree(filter: State) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListGroupWebTree.method,
          that.config.getAPIList().GetListGroupWebTree.url,
          JSON.stringify(toDataSourceRequest(filter))
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

  GetListGroupWeb(data: DTOCategoryWeb) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListGroupWeb.method,
          that.config.getAPIList().GetListGroupWeb.url,
          JSON.stringify(data)
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

  GetGroupWeb(data: DTOCategoryWeb) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api.connect(
        that.config.getAPIList().GetGroupWeb.method,
        that.config.getAPIList().GetGroupWeb.url,
        JSON.stringify(data)
      ).subscribe(
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

  UpdateGroupWeb(data: DTOCategoryWeb) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateGroupWeb.method,
          that.config.getAPIList().UpdateGroupWeb.url,
          JSON.stringify(data)
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
    })
  }

  DeleteGroupWeb(data: DTOCategoryWeb[]) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteGroupWeb.method,
          that.config.getAPIList().DeleteGroupWeb.url,
          JSON.stringify(data)
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
    })
  }
  
  //get template 

  GetTemplate(fileName: string) {
    let that = this;

    return new Observable<any>(obs => {
        that.api.connect(that.layoutConfig.getAPIList().GetTemplate.method,
            that.layoutConfig.getAPIList().GetTemplate.url, JSON.stringify(fileName)
            , null, null, 'response', 'blob'
        ).subscribe(
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

  ImportExcel(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelGroupWeb.method,
				that.config.getAPIList().ImportExcelGroupWeb.url, form, headers).subscribe(
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
