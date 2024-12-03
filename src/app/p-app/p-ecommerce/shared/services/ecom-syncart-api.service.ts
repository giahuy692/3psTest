import { Injectable } from "@angular/core";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { DTOResponse, PS_CommonService } from "src/app/p-lib";
import DTOSynCart from "../dto/DTOSynCart.dto";
import { DTOUpdate } from "../dto/DTOUpdate";
import { EcommerceApiConfigService } from './ecommerce-api-config.service';

@Injectable({
	providedIn: 'root'
})
export class EcomSynCartAPIService {

	constructor(
		public api: PS_CommonService,
		public config: EcommerceApiConfigService,
	) { }

	VNPayIPNRecall(id: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().VNPayIPNRecall.method,
				that.config.getAPIList().VNPayIPNRecall.url, id).subscribe(
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
	//Syn Customer Cart
	GetListClientOrder(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListClientOrder.method,
				that.config.getAPIList().GetListClientOrder.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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
	GetClientOrder(id: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetClientOrder.method,
				that.config.getAPIList().GetClientOrder.url, id).subscribe(
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

	UpdateClientOrder(item: DTOSynCart, prop: string[]) {
		let that = this;

		var param: DTOUpdate = {
			DTO: item,
			Properties: prop,
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateClientOrder.method,
				that.config.getAPIList().UpdateClientOrder.url, JSON.stringify(param)).subscribe(
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
	//detail
	GetOrderDetails(id: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetSynOrderDetails.method,
				that.config.getAPIList().GetSynOrderDetails.url, JSON.stringify({ "CartID": id })).subscribe(
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
	GetOrderGift(id: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetSynOrderGift.method,
				that.config.getAPIList().GetSynOrderGift.url, JSON.stringify({ "CartID": id })).subscribe(
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
	GetListOrderCoupon(id: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListOrderCoupon.method,
				that.config.getAPIList().GetListOrderCoupon.url, id).subscribe(
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
	//dropdown
	GetProvinces() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetProvinces.method,
				that.config.getAPIList().GetProvinces.url, {}).subscribe(
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
	GetDistricts(id: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetDistricts.method,
				that.config.getAPIList().GetDistricts.url, JSON.stringify({ ProvinceID: id })).subscribe(
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
	GetWards(id: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetWards.method,
				that.config.getAPIList().GetWards.url, JSON.stringify({ DistrictID: id })).subscribe(
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
	GetPayments() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetPayments.method,
				that.config.getAPIList().GetPayments.url, {}).subscribe(
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
