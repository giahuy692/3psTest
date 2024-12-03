import { Injectable } from "@angular/core";
import { DTOResponse, PS_CommonService, Ps_UtilObjectService } from "src/app/p-lib";
import { PurApiConfigService } from './pur-api-config.service';
import { Observable } from 'rxjs';
import { DTOExportReport } from '../dto/DTOPurReport';
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { DTOBrand } from "../dto/DTOBrand.dto";
import { DTOUpdate } from "src/app/p-app/p-ecommerce/shared/dto/DTOUpdate";

@Injectable({
	providedIn: 'root'
})
export class PurBrandAPIService {

	constructor(
		public api: PS_CommonService,
		public config: PurApiConfigService,
	) { }
	//BRAND
	//get
	GetListBrand(grid: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListBrand.method,
				that.config.getAPIList().GetListBrand.url,
				JSON.stringify(toDataSourceRequest(grid))).subscribe(
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
	GetBrand(code: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetBrand.method,
				that.config.getAPIList().GetBrand.url, JSON.stringify({ 'Code': code })).subscribe(
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
	//update
	UpdateBrand(dto: DTOBrand, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': dto,
			'Properties': prop
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateBrand.method,
				that.config.getAPIList().UpdateBrand.url, JSON.stringify(param,
					(k, v) => Ps_UtilObjectService.parseDateToString(k, v, ['ApprovedTime', 'CreatedTime'])))
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
	UpdateBrandStatus(dto: DTOBrand[], statusID: number) {
		let that = this;
		var param = {
			"ListDTO": dto,
			"StatusID": statusID
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateBrandStatus.method,
				that.config.getAPIList().UpdateBrandStatus.url, JSON.stringify(param,
					(k, v) => Ps_UtilObjectService.parseDateToString(k, v, ['ApprovedTime', 'CreatedTime'])))
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
	//merge
	MergeBrand(dto: DTOBrand[], selectedDTO: DTOBrand) {
		let that = this;
		var param = {
			"ListDTO": dto,
			"SelectedDTO": selectedDTO
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().MergeBrand.method,
				that.config.getAPIList().MergeBrand.url, JSON.stringify(param,
					(k, v) => Ps_UtilObjectService.parseDateToString(k, v, ['ApprovedTime', 'CreatedTime'])))
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
	//delete
	DeleteBrand(dto: DTOBrand[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteBrand.method,
				that.config.getAPIList().DeleteBrand.url, JSON.stringify(dto)).subscribe(
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
