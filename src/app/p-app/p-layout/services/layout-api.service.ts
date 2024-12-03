import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, DTOConfig, Ps_UtilObjectService, DTOResponse } from "src/app/p-lib";
import { HttpHeaders } from '@angular/common/http';
import { LayoutApiConfigService } from './layout-api-config.service';
import { DTOLSCompany } from '../dto/DTOLSCompany.dto';
import DTOSYSModule from '../dto/DTOSYSModule.dto';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';

@Injectable({
	providedIn: 'root'
})
export class LayoutAPIService {

	constructor(
		public api: PS_CommonService,
		public config: LayoutApiConfigService,
	) { }
	//ThongTinNhanSu
	GetCompany() {
		let that = this;
		return new Observable<Array<DTOLSCompany>>(obs => {
			that.api.connect(that.config.getAPIList().GetCompany.method,
				that.config.getAPIList().GetCompany.url, {}).subscribe(
					(res: DTOLSCompany[]) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetModule() {
		let that = this;
		return new Observable<Array<DTOSYSModule>>(obs => {
			that.api.connect(that.config.getAPIList().GetModule.method,
				that.config.getAPIList().GetModule.url, {}).subscribe(
					(res: DTOSYSModule[]) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetPermission(idFunc: number) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetPermission.method,
				that.config.getAPIList().GetPermission.url, JSON.stringify(idFunc)).subscribe(
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
	GetPermissionDLL(DLLpackage: string) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetPermissionDLL.method,
				that.config.getAPIList().GetPermissionDLL.url, JSON.stringify(DLLpackage)).subscribe(
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
	//warehouse
	GetWarehouse() {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetWarehouse.method,
				that.config.getAPIList().GetWarehouse.url, {}).subscribe(
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
	GetWarehouseWMS(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetWarehouseWMS.method,
				that.config.getAPIList().GetWarehouseWMS.url,
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
	//
	GetListProduct(state: State) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetListProduct.method,
				that.config.getAPIList().GetListProduct.url, JSON.stringify(
					toDataSourceRequest(state))).subscribe(
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
	GetProductByCode(code: number) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetProductByCode.method,
				that.config.getAPIList().GetProductByCode.url, JSON.stringify({ Code: code })).subscribe(
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
	GetStockInWareHouse(barcode: string, warehouse: number) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetStockInWareHouse.method,
				that.config.getAPIList().GetStockInWareHouse.url,
				JSON.stringify({ Barcode: barcode, Warehouse: warehouse })).subscribe(
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
	GetWebInCart(barcode: string) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetWebInCart.method,
				that.config.getAPIList().GetWebInCart.url,
				JSON.stringify({ Barcode: barcode })).subscribe(
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
	GetTemplate(fileName: string) {
		let that = this;

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetTemplate.method,
				that.config.getAPIList().GetTemplate.url, JSON.stringify(fileName)
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
	ImportExcel(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcel.method,
				that.config.getAPIList().ImportExcel.url, form, headers).subscribe(
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
	ImportExcelWithFunctionID(data: File, functionID: number) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('FunctionID', functionID.toString());

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelWithFunctionID.method,
				that.config.getAPIList().ImportExcelWithFunctionID.url, form, headers).subscribe(
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

	ImportExcelOrders(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelOrders.method,
				that.config.getAPIList().ImportExcelOrders.url, form, headers).subscribe(
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
	GetListStatus(typeData: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListStatus.method,
				that.config.getAPIList().GetListStatus.url,
				JSON.stringify({ "TypeData": typeData })).subscribe(
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
