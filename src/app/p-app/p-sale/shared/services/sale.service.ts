import { Injectable, Input } from "@angular/core";
import { PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from "src/app/p-lib";

import { FormBuilder } from '@angular/forms';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { DomSanitizer } from '@angular/platform-browser';
import { SaleApiConfigService } from "./sale-api-config.service";
import { Observable } from "rxjs";
import { DTOPosPrice } from "../dto/DTOPosPrice.dto";
import DTOCouponPolicy, { DTODetailCouponPolicy } from "src/app/p-app/p-marketing/shared/dto/DTOCouponPolicy.dto";

@Injectable({
	providedIn: 'root'
})
export class SaleService {
	isAdd: boolean = true
	isLockAll: boolean = false
	//string
	keyCachePosPrice = 'mar_pos_price'
	keyCacheGiftVoucher = 'mar_gift_voucher'

	constructor(
		public api: PS_CommonService,
		public configService: SaleApiConfigService,
		public cacheService: Ps_UtilCacheService,
	) { }
	//cache
	//pos price
	getCachePosPrice(): Observable<DTOPosPrice> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCachePosPrice).subscribe(res => {
				if (Ps_UtilObjectService.hasValue(res))
					obs.next(JSON.parse(res.value).value);
				else {
					obs.next(null);
				}
				obs.complete()
			}, () => {
				obs.next(null);
				obs.complete()
			});
		});
	}
	setCachePosPrice(data: DTOPosPrice): void {
		this.cacheService.setItem(this.keyCachePosPrice, data);
	}
	//voucher
	getCacheGiftVoucher(): Observable<DTODetailCouponPolicy> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheGiftVoucher).subscribe(res => {
				if (Ps_UtilObjectService.hasValue(res))
					obs.next(JSON.parse(res.value).value);
				else {
					obs.next(null);
				}
				obs.complete()
			}, () => {
				obs.next(null);
				obs.complete()
			});
		});
	}
	setCacheGiftVoucher(data: DTOCouponPolicy | DTODetailCouponPolicy): void {
		this.cacheService.setItem(this.keyCacheGiftVoucher, data);
	}
}
