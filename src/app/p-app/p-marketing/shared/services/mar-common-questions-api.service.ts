import { DTOMAPost_ObjReturn } from './../dto/DTOMANews.dto';
import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOResponse, PS_CommonService, Ps_UtilObjectService } from 'src/app/p-lib';
import { MarketingApiConfigService } from './marketing-api-config.service';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';

@Injectable({
  providedIn: 'root'
})
export class MarCommonQuestionsAPIService {

  constructor(
    public api: PS_CommonService,
    public config: MarketingApiConfigService,
  ) { }

  GetListQuestion (state: State) {
    let that = this;

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListQuestion.method,
        that.config.getAPIList().GetListQuestion.url, JSON.stringify(toDataSourceRequest(state))).subscribe(
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
  GetQuestion (code: number) {
	let that = this;
	return new Observable<DTOResponse>(obs => {
		that.api.connect(that.config.getAPIList().GetQuestion.method,
			that.config.getAPIList().GetQuestion.url, JSON.stringify({ 'Code': code })).subscribe(
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
GetListQuestionCategory() {
	let that = this;
	return new Observable<DTOResponse>(obs => {
		that.api.connect(that.config.getAPIList().GetListQuestionCategory.method,
			that.config.getAPIList().GetListQuestionCategory.url, JSON.stringify({"page": 1})).subscribe(
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
  UpdateQuestion (item: DTOMAPost_ObjReturn, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': item,
			'Properties': prop
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateQuestion.method,
				that.config.getAPIList().UpdateQuestion.url, JSON.stringify(param,
					(k, v) => Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['StatusID'])))
				.subscribe(
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
  UpdateQuestionStatus(item: DTOMAPost_ObjReturn[], StatusID: number) {
		let that = this;
		var param = {
			'ListDTO': item,
			'StatusID': StatusID,
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateQuestionStatus.method,
				that.config.getAPIList().UpdateQuestionStatus.url, JSON.stringify(param))
				.subscribe(
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
	UpdateQuestionCategory(item: DTOMAPost_ObjReturn, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': item,
			'Properties': prop
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateQuestionCategory.method,
				that.config.getAPIList().UpdateQuestionCategory.url, JSON.stringify(param))
				.subscribe(
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
	DeleteQuestion (item: DTOMAPost_ObjReturn[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteQuestion.method,
				that.config.getAPIList().DeleteQuestion.url, JSON.stringify(item)).subscribe(
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
