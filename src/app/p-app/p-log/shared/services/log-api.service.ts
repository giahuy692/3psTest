import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, DTOResponse, DTOConfig } from "src/app/p-lib";
import { LogApiConfigService } from "./log-api-config.service";

@Injectable({
	providedIn: 'root'
})
export class LogAPIService {

	constructor(
		public api: PS_CommonService,
		public config: LogApiConfigService,
	) { }
	//Product	
	GetProductByBarcode(code: string) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetProductByBarcode.method,
				that.config.getAPIList().GetProductByBarcode.url, JSON.stringify(code)).subscribe(
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
	UpdateProductHachi24hByID(code: number[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateProductHachi24hByID.method,
				that.config.getAPIList().UpdateProductHachi24hByID.url, JSON.stringify(code)).subscribe(
					(res: any) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					})
		});
	}
	DeleteProductHachi24hByID(code: number[]) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().DeleteProductHachi24hByID.method,
				that.config.getAPIList().DeleteProductHachi24hByID.url, JSON.stringify(code)).subscribe(
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
	ImportExcelAlbum(data: File, typeImport: number, code: number) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('TypeImport', typeImport.toString());
		form.append('Code', code.toString());

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelAlbum.method,
				that.config.getAPIList().ImportExcelAlbum.url, form, headers).subscribe(
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
	GetExcelAlbumn(typeImport: number, code: number) {
		let that = this;
		var param = {
			'TypeImport': typeImport,
			'Code': code
		}

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetExcelAlbumn.method,
				that.config.getAPIList().GetExcelAlbumn.url, JSON.stringify(param)
				, null, null, 'response', 'blob'
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
}
