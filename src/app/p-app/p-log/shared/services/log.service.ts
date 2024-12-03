import { Injectable } from "@angular/core";
import { PS_CommonService, Ps_UtilCacheService } from "src/app/p-lib";
import { LogApiConfigService } from "./log-api-config.service";

@Injectable({
	providedIn: 'root'
})
export class LogService {
	folderDialogOpened: boolean = false

	isAdd: boolean = true
	isLockAll: boolean = false
	//string
	keyCacheLogProduct = 'conf_product'

	constructor(
		public api: PS_CommonService,
		public configService: LogApiConfigService,
		public cacheService: Ps_UtilCacheService,
	) { }
}
