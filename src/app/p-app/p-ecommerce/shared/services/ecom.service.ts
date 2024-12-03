import { Injectable, Input } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from "src/app/p-lib";
import { EcommerceApiConfigService } from './ecommerce-api-config.service';
import { DTOECOMCart } from '../dto/DTOECOMCart.dto';
import DTOChannel from "../dto/DTOChannel.dto";
import DTOInport from "../dto/DTOInport.dto";
import DTOSynCart from "../dto/DTOSynCart.dto";
import { DTOChannelGroup } from "../dto/DTOChannelGroup.dto";

@Injectable({
	providedIn: 'root'
})
export class EcomService {
	// loading: boolean = true
	// excelValid: boolean = true
	isAdd: boolean = true
	searchProductDialogOpened: boolean = false //false

	deleteDialogOpened: boolean = false
	importDialogOpened: boolean = false
	folderDialogOpened: boolean = false
	webpageDialogOpened: boolean = false
	//string
	keyCacheChannelDetail = 'ecom_channel_detail'
	keyCacheGroupChannelDetail = 'ecom_groupChannel_detail'
	keyCacheInportDetail = 'ecom_inport_detail'
	keyCacheSynCartDetail = 'ecom_syncart_detail'
	//
	currentCartOrder = new DTOECOMCart()
	//banner
	itemBannerList = new Array<any>()
	filterList = new Array<any>()
	importBannerList = new Array<any>()
	filterImportList = new Array<any>()
	//Grid view
	// pageSize: number = 25
	// pageSizes: number[] = [this.pageSize, 50, 75, 100]
	// gridDSView = new Subject<any>();
	// importGridDSView = new Subject<any>();
	//Grid state
	// gridDSState: State = {
	// 	skip: 0, take: this.pageSize,
	// 	filter: { filters: [], logic: 'and' },
	// 	group: [],
	// 	sort: [{ field: 'OrderBy', dir: 'asc' }]
	// };
	// importGridDSState: State = {
	// 	skip: 0, take: this.pageSize,
	// 	filter: { filters: [], logic: 'and' },
	// 	group: [],
	// 	sort: [{ field: 'OrderBy', dir: 'asc' }]
	// };
	// //Image
	// restrictions: FileRestrictions = {
	// 	allowedExtensions: ['jpg', 'jpeg', 'png', 'gif']
	// };
	//element	
	importInput: Input;

	constructor(
		public api: PS_CommonService,
		public configService: EcommerceApiConfigService,
		public cacheService: Ps_UtilCacheService,
	) { }
	//cart search product dialog
	setSearchProductDialog(dialogOpened: boolean) {
		this.searchProductDialogOpened = dialogOpened
	}
	getSearchProductDialog() {
		return this.searchProductDialogOpened
	}
	//cache

	//Nhóm Kênh bán hàng
	getCacheGroupChannel(): Observable<DTOChannelGroup> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheGroupChannelDetail).subscribe(res => {
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
	setCacheGroupChannel(data: DTOChannelGroup): void {
		this.cacheService.setItem(this.keyCacheGroupChannelDetail, data);
	}


	//Kênh bán hàng
	getCacheChannelDetail(): Observable<DTOChannel> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheChannelDetail).subscribe(res => {
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
	setCacheChannelDetail(data: DTOChannel): void {
		this.cacheService.setItem(this.keyCacheChannelDetail, data);
	}
	//Chứng từ
	getCacheInportDetail(): Observable<DTOInport> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheInportDetail).subscribe(res => {
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
	setCacheInportDetail(data: DTOInport): void {
		this.cacheService.setItem(this.keyCacheInportDetail, data);
	}
	//Giỏ hàng
	getCacheSynCartDetail(): Observable<DTOSynCart> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheSynCartDetail).subscribe(res => {
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
	setCacheSynCartDetail(data: DTOSynCart): void {
		this.cacheService.setItem(this.keyCacheSynCartDetail, data);
	}
	//sorting
	// sortChange(itemBannerList, filterList, gridDSView, gridDSState,
	// 	sort: SortDescriptor[], gridName?: string) {
	// 	gridDSState.sort = sort;
	// 	if (gridName == null) {
	// 		this.loadList(itemBannerList, filterList, gridDSView, gridDSState);
	// 	} else {
	// 		this.loadListExcel(itemBannerList, filterList, gridDSView, gridDSState);
	// 	}
	// }
	// //paging
	// pageChange(itemBannerList, filterList, gridDSView, gridDSState,
	// 	event: PageChangeEvent, gridName?: string) {
	// 	gridDSState.skip = event.skip;
	// 	if (gridName == null) {
	// 		this.loadList(itemBannerList, filterList, gridDSView, gridDSState);
	// 	} else {
	// 		this.loadListExcel(itemBannerList, filterList, gridDSView, gridDSState);
	// 	}
	// }
	// //filtering
	// filterChange(itemBannerList, filterList, gridDSView, gridDSState,
	// 	filter: CompositeFilterDescriptor, gridName?: string) {
	// 	gridDSState.filter = filter;
	// 	if (gridName == null) {
	// 		this.loadList(itemBannerList, filterList, gridDSView, gridDSState)
	// 	} else {
	// 		this.loadListExcel(itemBannerList, filterList, gridDSView, gridDSState);
	// 	}
	// }
	//loading
	// loadList(itemBannerList, filterList, gridDSView, gridDSState) {
	// 	filterList = filterBy(itemBannerList, gridDSState.filter)

	// 	gridDSView.next({
	// 		data: orderBy(filterList
	// 			.slice(gridDSState.skip,
	// 				gridDSState.skip + this.pageSize),
	// 			gridDSState.sort),
	// 		total: filterList.length
	// 	});
	// }
	// loadListExcel(importBannerList, filterImportList, importGridDSView, importGridDSState) {
	// 	filterImportList = filterBy(importBannerList, importGridDSState.filter)

	// 	importGridDSView.next({
	// 		data: orderBy(filterImportList
	// 			.slice(importGridDSState.skip,
	// 				importGridDSState.skip + this.pageSize),
	// 			importGridDSState.sort),
	// 		total: filterImportList.length
	// 	});
	// }
}
