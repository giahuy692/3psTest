import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { DTOUpdate } from "src/app/p-app/p-ecommerce/shared/dto/DTOUpdate";
import { PS_CommonService, DTOResponse, Ps_UtilObjectService, DTOConfig } from "src/app/p-lib";
import { DTOPosPrice, DTOPosPriceDetail } from "../dto/DTOPosPrice.dto";
import { SaleApiConfigService } from "./sale-api-config.service";

@Injectable({
	providedIn: 'root'
})
export class SaleAPIService {

	constructor(
		public api: PS_CommonService,
		public config: SaleApiConfigService,
	) { }
	//pos price	
	GetListPOSPriceAdj(gridState: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPOSPriceAdj.method,
				that.config.getAPIList().GetListPOSPriceAdj.url,
				JSON.stringify(toDataSourceRequest(gridState))).subscribe(
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
	GetPOSPriceAdj(code: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetPOSPriceAdj.method,
				that.config.getAPIList().GetPOSPriceAdj.url, JSON.stringify({ 'Code': code })).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	UpdatePOSPriceAdj(dto: DTOPosPrice, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			DTO: dto,
			Properties: prop
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdatePOSPriceAdj.method,
				that.config.getAPIList().UpdatePOSPriceAdj.url, JSON.stringify(param,
					(k, v) => Ps_UtilObjectService.parseDateToString(k, v, ['CreateTime', 'ApprovedTime', 'EffDate'])))
				.subscribe(
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
	UpdatePOSPriceAdjStatus(dto: DTOPosPrice[], statusID: number) {
		let that = this;
		var param = {
			"ListDTO": dto,
			"StatusID": statusID
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdatePOSPriceAdjStatus.method,
				that.config.getAPIList().UpdatePOSPriceAdjStatus.url, JSON.stringify(param,
					(k, v) => Ps_UtilObjectService.parseDateToString(k, v, ['CreateTime', 'ApprovedTime', 'EffDate'])))
				.subscribe(
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
	DeletePOSPriceAdj(code: DTOPosPrice[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeletePOSPriceAdj.method,
				that.config.getAPIList().DeletePOSPriceAdj.url, JSON.stringify(code)).subscribe(
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
	//pos detail
	GetListPOSPriceAdjDetails(gridState: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPOSPriceAdjDetails.method,
				that.config.getAPIList().GetListPOSPriceAdjDetails.url,
				JSON.stringify(toDataSourceRequest(gridState))).subscribe(
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
	GetPOSPriceAdjDetails(code: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetPOSPriceAdjDetails.method,
				that.config.getAPIList().GetPOSPriceAdjDetails.url,
				JSON.stringify({ 'Code': code })).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	GetPOSPriceAdjDetailsByBarcode(barcode: string, posPrice: number) {
		let that = this;
		var param = {
			'Barcode': barcode,
			'POSPrice': posPrice
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetPOSPriceAdjDetailsByBarcode.method,
				that.config.getAPIList().GetPOSPriceAdjDetailsByBarcode.url,
				JSON.stringify(param)).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	UpdatePOSPriceAdjDetails(dto: DTOPosPriceDetail[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdatePOSPriceAdjDetails.method,
				that.config.getAPIList().UpdatePOSPriceAdjDetails.url, JSON.stringify(dto,
					(k, v) => Ps_UtilObjectService.parseDateToString(k, v, ['ApprovedTime']))).subscribe(
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
	DeletePOSPriceAdjDetails(dto: DTOPosPriceDetail[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeletePOSPriceAdjDetails.method,
				that.config.getAPIList().DeletePOSPriceAdjDetails.url, JSON.stringify(dto)).subscribe(
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
	//file
	ImportExcelPriceAdjDetails(data: File, POSPrice: number) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('POSPrice', POSPrice.toString());

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelPriceAdjDetails.method,
				that.config.getAPIList().ImportExcelPriceAdjDetails.url, form, headers).subscribe(
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
