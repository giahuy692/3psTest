import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from "src/app/p-lib";
import { DTOBrand } from "../dto/DTOBrand.dto";
import { DTOSupplier } from "../dto/DTOSupplier";

@Injectable({
	providedIn: 'root'
})

export class PurService {
	isAdd = true
	keyCacheBrandDetail = 'pur_brand_detail'

	isReloadData: boolean = false
	private _menuSupplier$: Observable<DTOSupplier>;
	private _menuSupplierObserver: Subject<DTOSupplier> = new Subject<DTOSupplier>();
	private reloadSuccessSource: Subject<void> = new Subject<void>();
	public reloadSuccess$: Observable<void> = this.reloadSuccessSource.asObservable();


	constructor(
		public api: PS_CommonService,		
		public cacheService: Ps_UtilCacheService
	) {
		this._menuSupplier$ = new Observable<DTOSupplier>((observer) => {
			this._menuSupplierObserver.subscribe(observer);
		});
	}
	//brand
	getCacheBrandDetail(): Observable<DTOBrand> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheBrandDetail).subscribe(res => {
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
	setCacheBrandDetail(data: DTOBrand): void {
		this.cacheService.setItem(this.keyCacheBrandDetail, data);
	}

	// partner

	// lấy dữ liệu của nhà cung cấp 
	getSupplier(): Observable<DTOSupplier> {
		return this._menuSupplier$;
	}

	// Gán thông tin nhà cung cấp
	activeSupplier(Supplier: DTOSupplier) {
		this._menuSupplierObserver.next(Supplier)
	}

	reloadData(active: boolean){
		return this.isReloadData = active
	}

	// load lại dữ liệu
	triggerReloadSuccess() {
		this.reloadSuccessSource.next();
	}
	
}
