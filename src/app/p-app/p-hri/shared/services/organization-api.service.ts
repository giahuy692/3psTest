import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DTOConfig, DTOResponse, PS_CommonService } from "src/app/p-lib";
import { HriApiConfigService } from "./hri-api-config.service";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { DTODepartment } from "../dto/DTODepartment.dto";
import { DTOLocation } from "../dto/DTOLocation.dto";
import { DTOPosition } from "../dto/DTOPosition.dto";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
	providedIn: 'root'
})
export class OrganizationAPIService {

	constructor(
		public api: PS_CommonService,
		public config: HriApiConfigService,
	) { }
	//#region Cơ cấu tổ chức
	GetListDepartmentTree(filter: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListDepartmentTree.method,
				that.config.getAPIList().GetListDepartmentTree.url,
				JSON.stringify(toDataSourceRequest(filter))).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	GetListDepartment(dto: DTODepartment) {
		let that = this;
		return new Observable<DTODepartment[]>(obs => {
			that.api.connect(that.config.getAPIList().GetListDepartment.method,
				that.config.getAPIList().GetListDepartment.url,
				JSON.stringify(dto)).subscribe(
					(res: DTODepartment[]) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	UpdateDepartment(obj: DTODepartment) {
		let that = this;
		return new Observable<DTODepartment>(obs => {
			that.api.connect(that.config.getAPIList().UpdateDepartment.method,
				that.config.getAPIList().UpdateDepartment.url,
				JSON.stringify(obj)).subscribe(
					(res: DTODepartment) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	DeleteDepartment(arr: DTODepartment[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteDepartment.method,
				that.config.getAPIList().DeleteDepartment.url,
				JSON.stringify(arr)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	//#endregion Cơ cấu tổ chức

	//#region Điểm làm việc
	GetListLocationTree(filter: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListLocationTree.method,
				that.config.getAPIList().GetListLocationTree.url,
				JSON.stringify(toDataSourceRequest(filter))).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	GetListLocation(dto: DTOLocation) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListLocation.method,
				that.config.getAPIList().GetListLocation.url,
				JSON.stringify(dto)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	UpdateLocation(obj: DTOLocation) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateLocation.method,
				that.config.getAPIList().UpdateLocation.url,
				JSON.stringify(obj)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	DeleteLocation(arr: DTOLocation[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteLocation.method,
				that.config.getAPIList().DeleteLocation.url,
				JSON.stringify(arr)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	//#endregion Điểm làm việc

	//#region Chức danh
	GetListPositionTree(filter: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPositionTree.method,
				that.config.getAPIList().GetListPositionTree.url,
				JSON.stringify(toDataSourceRequest(filter))).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	GetListPosition(dto: DTOPosition) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPosition.method,
				that.config.getAPIList().GetListPosition.url,
				JSON.stringify(dto)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	GetListPositionIndirect(dto: DTOPosition) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPositionIndirect.method,
				that.config.getAPIList().GetListPositionIndirect.url,
				JSON.stringify(dto)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	GetListPositionGroup() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPositionGroup.method,
				that.config.getAPIList().GetListPositionGroup.url, {}).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	GetListPositionRole() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPositionRole.method,
				that.config.getAPIList().GetListPositionRole.url, {}).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	AddPositionRole(obj: DTOPosition) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().AddPositionRole.method,
				that.config.getAPIList().AddPositionRole.url,
				JSON.stringify(obj)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	UpdatePosition(obj: DTOPosition) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdatePosition.method,
				that.config.getAPIList().UpdatePosition.url,
				JSON.stringify(obj)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}

	DeletePosition(arr: DTOPosition[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeletePosition.method,
				that.config.getAPIList().DeletePosition.url,
				JSON.stringify(arr)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	//#endregion Chức danh

	ImportExcelDepartment(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		//Để any bởi vì res trả về là số 0 nếu thành công - res cũ
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelDepartment.method,
				that.config.getAPIList().ImportExcelDepartment.url, form, headers).subscribe(
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

	//#region import data
	ImportExcelLocation(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelLocation.method,
				that.config.getAPIList().ImportExcelLocation.url, form, headers).subscribe(
					(res: DTOResponse) => {
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
