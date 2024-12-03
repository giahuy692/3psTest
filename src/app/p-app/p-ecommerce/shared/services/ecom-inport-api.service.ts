import { Injectable } from "@angular/core";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { DTOResponse, PS_CommonService, Ps_UtilObjectService } from "src/app/p-lib";
import DTOInport, { DTOInportProduct } from "../dto/DTOInport.dto";
import { DTOUpdate } from "../dto/DTOUpdate";
import { EcommerceApiConfigService } from './ecommerce-api-config.service';

@Injectable({
	providedIn: 'root'
})
export class EcomInportAPIService {

	constructor(
		public api: PS_CommonService,
		public config: EcommerceApiConfigService,
	) { }
	//Inport
	GetListInport(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListTransferReceive.method,
				that.config.getAPIList().GetListTransferReceive.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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
	GetInport(item: DTOInport) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetTransferReceive.method,
				that.config.getAPIList().GetTransferReceive.url,
				JSON.stringify(item.Code)).subscribe(
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

	UpdateInportStatus(obj: DTOInport[], statusID: number) {
		let that = this;
		var param = {
			'ListDTO': obj,
			'StatusID': statusID
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateStatusTransferReceive.method,
				that.config.getAPIList().UpdateStatusTransferReceive.url,
				JSON.stringify(param)).subscribe(
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

	UpdateInportReceive(obj: DTOInport, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': obj,
			'Properties': prop
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateTransferReceive.method,
				that.config.getAPIList().UpdateTransferReceive.url,
				JSON.stringify(param, (k, v) => Ps_UtilObjectService.parseDateToString(k, v, [])))
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
	UpdateInportSent(obj: DTOInport, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': obj,
			'Properties': prop
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateTransferSent.method,
				that.config.getAPIList().UpdateTransferSent.url,
				JSON.stringify(param, (k, v) => Ps_UtilObjectService.parseDateToString(k, v, [])))
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

	DeleteInport(obj: DTOInport[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteTransferReceive.method,
				that.config.getAPIList().DeleteTransferReceive.url,
				JSON.stringify(obj)).subscribe(
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
	//product
	GetListInportProduct(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListTransferReceiveDetail.method,
				that.config.getAPIList().GetListTransferReceiveDetail.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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
	GetInportProduct(item: DTOInportProduct) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetTransferReceiveDetail.method,
				that.config.getAPIList().GetTransferReceiveDetail.url,
				JSON.stringify({ 'Code': item.Code })).subscribe(
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
	GetInportProductByCode(barcode: string, Inport: number) {
		let that = this;
		var param = {
			'Barcode': barcode,
			'TransferID': Inport
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetTransferReceiveDetailByCode.method,
				that.config.getAPIList().GetTransferReceiveDetailByCode.url, JSON.stringify(param)).subscribe(
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

	UpdateInportProduct(obj: DTOInportProduct, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': obj,
			'Properties': prop
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateInportProduct.method,
				that.config.getAPIList().UpdateInportProduct.url,
				JSON.stringify(param, (k, v) => Ps_UtilObjectService.parseDateToString(k, v, [])))
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

	DeleteInportProduct(obj: DTOInportProduct[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteInportProduct.method,
				that.config.getAPIList().DeleteInportProduct.url,
				JSON.stringify(obj)).subscribe(
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
	ImportInportProduct(data: File, Inport: number) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('Inport', Inport.toString());

		// var headers = new HttpHeaders()
		// headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportInportProduct.method,
				that.config.getAPIList().ImportInportProduct.url, form).subscribe(
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
