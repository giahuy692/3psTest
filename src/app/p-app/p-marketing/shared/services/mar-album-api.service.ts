import { Injectable } from "@angular/core";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { DTOUpdate } from "src/app/p-app/p-ecommerce/shared/dto/DTOUpdate";
import { PS_CommonService, DTOResponse, Ps_UtilObjectService } from "src/app/p-lib";
import { DTOAlbum, DTOAlbumDetail } from "../dto/DTOAlbum.dto";
import { MarketingApiConfigService } from "./marketing-api-config.service";

@Injectable({
	providedIn: 'root'
})
export class MarAlbumAPIService {

	constructor(
		public api: PS_CommonService,
		public config: MarketingApiConfigService,
	) { }
	//ALBUM
	//get	
	GetListAlbum(gridState: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListAlbum.method,
				that.config.getAPIList().GetListAlbum.url,
				JSON.stringify(toDataSourceRequest(gridState))).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	GetAlbum(code: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetAlbum.method,
				that.config.getAPIList().GetAlbum.url, JSON.stringify({ 'Code': code })).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	//update
	UpdateAlbum(dto: DTOAlbum, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': dto,
			'Properties': prop
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateAlbum.method,
				that.config.getAPIList().UpdateAlbum.url, JSON.stringify(param,
					(key, val) => Ps_UtilObjectService.parseDateToString(key, val, ['ApprovedTime', 'CreateTime']))
			).subscribe(
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
	UpdateAlbumStatus(dto: DTOAlbum[], statusID: number) {
		let that = this;
		var param = {
			"ListDTO": dto,
			"StatusID": statusID
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateAlbumStatus.method,
				that.config.getAPIList().UpdateAlbumStatus.url, JSON.stringify(param,
					(key, val) => Ps_UtilObjectService.parseDateToString(key, val, ['ApprovedTime', 'CreateTime']))
			).subscribe(
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
	//delete
	DeleteAlbum(items: DTOAlbum[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteAlbum.method,
				that.config.getAPIList().DeleteAlbum.url, JSON.stringify(items)).subscribe(
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
	//DETAIL
	//get
	GetListAlbumDetails(gridState: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListAlbumDetails.method,
				that.config.getAPIList().GetListAlbumDetails.url,
				JSON.stringify(toDataSourceRequest(gridState))).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	GetAlbumDetails(code: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetAlbumDetails.method,
				that.config.getAPIList().GetAlbumDetails.url, JSON.stringify({ 'Code': code })).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	GetAlbumDetailsByBarcode(album: number, barcode: string) {
		let that = this;
		var param = {
			'Barcode': barcode,
			'AlbumID': album
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetAlbumDetailsByBarcode.method,
				that.config.getAPIList().GetAlbumDetailsByBarcode.url, JSON.stringify(param)).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	//update
	UpdateAlbumDetails(items: DTOAlbumDetail[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateAlbumDetails.method,
				that.config.getAPIList().UpdateAlbumDetails.url, JSON.stringify(items)).subscribe(
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
	//delete
	DeleteAlbumDetails(items: DTOAlbumDetail[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteAlbumDetails.method,
				that.config.getAPIList().DeleteAlbumDetails.url, JSON.stringify(items)).subscribe(
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
