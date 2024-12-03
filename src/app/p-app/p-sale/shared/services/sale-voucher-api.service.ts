import { Injectable } from "@angular/core";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { DTOUpdate } from "src/app/p-app/p-ecommerce/shared/dto/DTOUpdate";
import DTOCouponPolicy, { DTODetailCouponPolicy } from "src/app/p-app/p-marketing/shared/dto/DTOCouponPolicy.dto";
import { PS_CommonService, DTOResponse } from "src/app/p-lib";
import { SaleApiConfigService } from "./sale-api-config.service";

@Injectable({
	providedIn: 'root'
})
export class SaleVoucherAPIService {

	constructor(
		public api: PS_CommonService,
		public config: SaleApiConfigService,
	) { }
	//voucher
	GetListVoucher(gridState: State, donviCode?: number) {
		let that = this;
		var param = {
			WHCode: donviCode,
			Filter: toDataSourceRequest(gridState)
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListVoucher.method,
				that.config.getAPIList().GetListVoucher.url, JSON.stringify(param)).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	
	GetListVoucherType() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListVoucherType.method,
				that.config.getAPIList().GetListVoucherType.url, {}).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
}
