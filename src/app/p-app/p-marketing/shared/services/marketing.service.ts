import { DTOMAStore } from '../dto/DTOMAStore.dto';
import { DTOMAPost_ObjReturn } from './../dto/DTOMANews.dto';
import { Injectable, Input } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from "src/app/p-lib";

import { UntypedFormBuilder } from '@angular/forms';
import { State } from '@progress/kendo-data-query';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { DTOMABanner } from '../dto/DTOMABanner.dto';
import { DTOMABannerGroup } from '../dto/DTOMABannerGroup.dto';
import { MarBannerAPIService } from './marbanner-api.service'
import DTOPromotionProduct from '../dto/DTOPromotionProduct.dto';
import DTOWebContent from '../dto/DTOWebContent.dto';
import DTOCouponPolicy, { DTODetailCouponPolicy } from "../dto/DTOCouponPolicy.dto";
import { DTOAlbum } from "../dto/DTOAlbum.dto";
import { DTOMAHashtag } from '../dto/DTOMAHashtag.dto';

@Injectable({
	providedIn: 'root'
})
export class MarketingService {
	loading: boolean = true
	excelValid: boolean = true
	deleteDialogOpened: boolean = false
	importDialogOpened: boolean = false
	folderDialogOpened: boolean = false

	webpageDialogOpened = new BehaviorSubject<boolean>(false)

	isAdd: boolean = false
	isLockAll: boolean = true
	//key cache
	keyCachePromotionDetail = "promotion_detail"
	keyCacheAlbumDetail = "mar_album_detail"
	keyCacheNewsProductDetail = "news_product_detail"
	keyCacheCouponPolicyDetail = "coupon_policy_detail"
	keyCacheBannerDetail = "mar_banner_detail"
	keyCachePostDetail = "mar_post_detail"
	keyCacheNewsDetail = "mar_news_detail"
	keyCachePolicyDetail = "mar_policy_detail"
	keyCacheIntroduceDetail = "mar_introduce_detail"
	keyCacheStoreDetail = "mar_store_detail"
	keyCacheHashtagDetail = "mar_hashtag_detail"
	//
	banner = new DTOMABanner()
	groupBanner = new DTOMABannerGroup()//
	// curPromotion = new DTOPromotionProduct()
	//banner
	itemBannerList = new Array<any>()
	filterList = new Array<any>()
	importBannerList = new Array<any>()
	filterImportList = new Array<any>()
	groupBannerList = new Array<DTOMABannerGroup>()
	invalidGroupBanner = new Array<DTOMABannerGroup>()
	//Grid view
	pageSize: number = 24
	pageSizes = [25, 50, 75, 100]
	gridDSView = new Subject<any>();
	importGridDSView = new Subject<any>();
	//Grid state
	gridDSState: State = {
		skip: 0, take: this.pageSize,
		filter: { filters: [], logic: 'and' },
		group: [],
		sort: [{ field: 'OrderBy', dir: 'asc' }]
	};
	importGridDSState: State = {
		skip: 0, take: this.pageSize,
		filter: { filters: [], logic: 'and' },
		group: [],
		sort: [{ field: 'OrderBy', dir: 'asc' }]
	};
	//Image
	restrictions: FileRestrictions = {
		allowedExtensions: ['jpg', 'jpeg', 'png', 'gif']
	};
	//element	
	importInput: Input;
	// Filters
	filterStatusID = [
		{ id: 0, status: 'Đang soạn thảo', isChecked: true }, 
		{ id: 1, status: 'Chờ duyệt', isChecked: false },
		{ id: 2, status: 'Đã duyệt', isChecked: true }, 
		{ id: 3, status: 'Ngưng hiển thị', isChecked: false },
		{ id: 4, status: 'Trả về', isChecked: false },
	]

	constructor(
		public api: PS_CommonService,
		
		public sanitizer: DomSanitizer,
		public formBuilder: UntypedFormBuilder,
		public bannerAPI: MarBannerAPIService,
		public cacheService: Ps_UtilCacheService
	) {

	}
	//CACHE	
	//promotion
	getCachePromotionDetail(): Observable<DTOPromotionProduct> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCachePromotionDetail).subscribe(res => {
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
	setCachePromotionDetail(data: DTOPromotionProduct): void {
		this.cacheService.setItem(this.keyCachePromotionDetail, data);
	}
	//album
	getCacheAlbumDetail(): Observable<DTOAlbum> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheAlbumDetail).subscribe(res => {
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
	setCacheAlbumDetail(data: DTOAlbum): void {
		this.cacheService.setItem(this.keyCacheAlbumDetail, data);
	}
	//news
	getCacheNewsProductDetail(): Observable<DTOWebContent> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheNewsProductDetail).subscribe(res => {
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
	setCacheNewsProductDetail(data: DTOWebContent): void {
		this.cacheService.setItem(this.keyCacheNewsProductDetail, data);
	}
	//coupon
	getCacheCouponPolicyDetail(): Observable<DTODetailCouponPolicy> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheCouponPolicyDetail).subscribe(res => {
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
	setCacheCouponPolicyDetail(data: DTOCouponPolicy): void {
		this.cacheService.setItem(this.keyCacheCouponPolicyDetail, data);
	}
	//album
	getCacheBannerDetail(): Observable<DTOMABanner> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheBannerDetail).subscribe(res => {
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
	setCacheBanneretail(data: DTOMABanner): void {
		this.cacheService.setItem(this.keyCacheBannerDetail, data);
	}
	//webpage popup
	setWebpageDialogPopup(webpageDialogOpened: boolean) {
		this.webpageDialogOpened.next(webpageDialogOpened);
	}
	getWebpageDialogPopup() {
		return this.webpageDialogOpened.asObservable()
	}
	// Post
	getCachePostDetail(): Observable<DTOMAPost_ObjReturn> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCachePostDetail).subscribe(res => {
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
	setCachePostDetail(data: DTOMAPost_ObjReturn): void {
		this.cacheService.setItem(this.keyCachePostDetail, data);
	}
	// News
	getCacheNewsDetail(): Observable<DTOMAPost_ObjReturn> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheNewsDetail).subscribe(res => {
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
	setCacheNewsDetail(data: DTOMAPost_ObjReturn): void {
		this.cacheService.setItem(this.keyCacheNewsDetail, data);
	}
	// Policy
	getCachePolicyDetail(): Observable<DTOMAPost_ObjReturn> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCachePolicyDetail).subscribe(res => {
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
	setCachePolicyDetail(data: DTOMAPost_ObjReturn): void {
		this.cacheService.setItem(this.keyCachePolicyDetail, data);
	}
	// Introduce
	getCacheIntroduceDetail(): Observable<DTOMAPost_ObjReturn> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheIntroduceDetail).subscribe(res => {
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
	setCacheIntroduceDetail(data: DTOMAPost_ObjReturn): void {
		this.cacheService.setItem(this.keyCacheIntroduceDetail, data);
	}
	// Store
	getCacheStoreDetail(): Observable<DTOMAStore> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheStoreDetail).subscribe(res => {
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
	setCacheStoreDetail(data: DTOMAStore): void {
		this.cacheService.setItem(this.keyCacheStoreDetail, data);
	}
	// Hashtag
	getCacheHashtagDetail(): Observable<DTOMAHashtag> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheHashtagDetail).subscribe(res => {
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
	setCacheHashtagDetail(data: DTOMAHashtag): void {
		this.cacheService.setItem(this.keyCacheHashtagDetail, data);
	}
}
