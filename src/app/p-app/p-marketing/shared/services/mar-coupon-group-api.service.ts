import { DTOMACouponGroupService } from './../dto/DTOMACouponGroup.service';
import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOResponse, PS_CommonService, Ps_UtilObjectService } from 'src/app/p-lib';
import { MarketingApiConfigService } from './marketing-api-config.service';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';

@Injectable({
  providedIn: 'root'
})
export class MarCouponGroupAPIService {

  constructor(
    public api: PS_CommonService,
    public config: MarketingApiConfigService,
  ) { }

  GetListCouponGroup (state: State) {
    let that = this;

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListCouponGroup.method,
        that.config.getAPIList().GetListCouponGroup.url, JSON.stringify(toDataSourceRequest(state))).subscribe(
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
GetListAllCouponGroup (state: State) {
	let that = this;
	
    return new Observable<DTOResponse>(obs => {
		that.api.connect(that.config.getAPIList().GetListCouponGroup.method,
        that.config.getAPIList().GetListCouponGroup.url, JSON.stringify(toDataSourceRequest(state))).subscribe(
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
  GetCouponGroup (code: number) {
	let that = this;
	return new Observable<DTOResponse>(obs => {
		that.api.connect(that.config.getAPIList().GetCouponGroup.method,
			that.config.getAPIList().GetCouponGroup.url, JSON.stringify({ 'Code': code })).subscribe(
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
  UpdateCouponGroup (item: DTOMACouponGroupService, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': item,
			'Properties': prop
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCouponGroup.method,
				that.config.getAPIList().UpdateCouponGroup.url, JSON.stringify(param,
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
	DeleteCouponGroup (item: DTOMACouponGroupService[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteCouponGroup.method,
				that.config.getAPIList().DeleteCouponGroup.url, JSON.stringify(item)).subscribe(
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
