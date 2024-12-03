import { Injectable } from "@angular/core";
import { PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from "src/app/p-lib";
import { UntypedFormBuilder } from '@angular/forms';
import { ConfigApiConfigService } from "./config-api-config.service";
import { DTOConfProduct, DTODetailConfProduct } from "../dto/DTOConfProduct";
import { Observable } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class ConfigService {
	isAdd: boolean = true
	isLockAll: boolean = false
	//string
	keyCacheConfigProduct = 'conf_product'

	constructor(
		public api: PS_CommonService,
		public formBuilder: UntypedFormBuilder,
		public configService: ConfigApiConfigService,
		public cacheService: Ps_UtilCacheService,
	) { }
	//cache
	getCacheConfProduct(): Observable<DTODetailConfProduct> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheConfigProduct).subscribe(res => {
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
	setCacheConfProduct(data: DTOConfProduct | DTODetailConfProduct): void {
		this.cacheService.setItem(this.keyCacheConfigProduct, data);
	}
}
