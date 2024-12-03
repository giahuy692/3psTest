import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, DTOResponse } from "src/app/p-lib";
import { MarketingApiConfigService } from "./marketing-api-config.service";

@Injectable({
	providedIn: 'root'
})
export class MarBestPriceAPIService {

	constructor(
		public api: PS_CommonService,
		public config: MarketingApiConfigService,
	) { }
	//Product	
	UpdateProductBestPriceByID(code: number[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateProductBestPriceByID.method,
				that.config.getAPIList().UpdateProductBestPriceByID.url, JSON.stringify(code)).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	DeleteProductBestPriceByID(code: number[]) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().DeleteProductBestPriceByID.method,
				that.config.getAPIList().DeleteProductBestPriceByID.url, JSON.stringify(code)).subscribe(
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
	//
	UpdateProductSpecialByID(code: number[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateProductSpecialByID.method,
				that.config.getAPIList().UpdateProductSpecialByID.url, JSON.stringify(code)).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	DeleteProductSpecialByID(code: number[]) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().DeleteProductSpecialByID.method,
				that.config.getAPIList().DeleteProductSpecialByID.url, JSON.stringify(code)).subscribe(
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
