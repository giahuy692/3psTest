import { Injectable } from "@angular/core";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { PS_CommonService, DTOResponse } from "src/app/p-lib";
import { DTOAction } from "../dto/DTOAction";
import { DTOCompany } from "../dto/DTOCompany";
import { DTOFunction } from "../dto/DTOFunction";
import { DTOModule } from "../dto/DTOModule";
import { DTOSubFunction } from "../dto/DTOSubFunction";
import { DeveloperApiConfigService } from "./developer-api-config.service";
import { DTOAPI } from "../dto/DTOAPI";

@Injectable({
	providedIn: 'root'
})
export class DeveloperAPIService {

	constructor(
		public api: PS_CommonService,
		public config: DeveloperApiConfigService,
	) { }
	//#region API Company

	// API GetListCompany
	// Các trường bắt buộc gridState và keyword
	GetListCompany(gridState: State, keyword: string = '') {
		let that = this;
		var param = {
			Filter: toDataSourceRequest(gridState),
			Keyword: keyword
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListCompany.method,
				that.config.getAPIList().GetListCompany.url, JSON.stringify(param)).subscribe(
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

	// API Update company
	// Các trường bắt buộc Code, Bieft, VNName, URLLogo
	UpdateCompany(dtoCompany: DTOCompany) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCompany.method,
				that.config.getAPIList().UpdateCompany.url, JSON.stringify(dtoCompany)).subscribe(
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

	// Delete company
	// Các trường bắt buộc Code
	DeleteCompany(dtoCompany: DTOCompany) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteCompany.method,
				that.config.getAPIList().DeleteCompany.url, JSON.stringify(dtoCompany)).subscribe(
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

	//#region system
	// API GetListSysStructureTree
	GetListSysStructureTree() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListSysStructureTree.method,
				that.config.getAPIList().GetListSysStructureTree.url, JSON.stringify({})).subscribe(
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

	// API GetListModuleTree
	// Các trường bắt buộc :
	// "{Level: 1, DTOModule (Code)} - Item hiện tại trên drawer
	// {Level: 2} - Lấy hết"
	// Trong DTO trường bắt buộc là Code
	// Level là trường bắt buộc
	GetListModuleTree(level: number, dtoModule?: DTOModule) {
		let param = {
			"Level": level,
			"DTO": dtoModule
		}
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListModuleTree.method,
				that.config.getAPIList().GetListModuleTree.url, JSON.stringify(param)).subscribe(
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

	// API GetListActionTree
	// các trường bắt buộc DTOAction {Code} - Item hiện tại trên drawer
	GetListActionTree(dtoAction: DTOAction) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListActionTree.method,
				that.config.getAPIList().GetListActionTree.url, JSON.stringify(dtoAction)).subscribe(
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

	// API UpdateModule
	// Các trường bắt buộc Vietnamese, Code, ModuleID, IsVisible
	UpdateModule(dtoModule: DTOModule) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateModule.method,
				that.config.getAPIList().UpdateModule.url, JSON.stringify(dtoModule)).subscribe(
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

	// API DeleteModule
	// Các trường bắt buộc Code
	DeleteModule(dtoModule: DTOModule) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteModule.method,
				that.config.getAPIList().DeleteModule.url, JSON.stringify(dtoModule)).subscribe(
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

	// API UpdateFunction
	// Các trường bắt buộc Vietnamese, Code, ModuleID, DLLPackage, TypeData
	UpdateFunction(dtoFunction: DTOFunction) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateFunction.method,
				that.config.getAPIList().UpdateFunction.url, JSON.stringify(dtoFunction)).subscribe(
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

	// API DeleteFunction
	// Các trường bắt buộc Code
	DeleteFunction(dtoFunction: DTOFunction) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteFunction.method,
				that.config.getAPIList().DeleteFunction.url, JSON.stringify(dtoFunction)).subscribe(
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

	// API DeleteSupFunction
	// Các trường bắt buộc Code
	DeleteSupFunction(dtoSubFunc: DTOSubFunction) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteSupFunction.method,
				that.config.getAPIList().DeleteSupFunction.url, JSON.stringify(dtoSubFunc)).subscribe(
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

	// API UpdateSupFunction
	// Các trường bắt buộc TypeData, TypePopup, OrderBy, Code, DataID, DataName, IsSelected
	UpdateSupFunction(dtoSubFunc: DTOSubFunction) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateSupFunction.method,
				that.config.getAPIList().UpdateSupFunction.url, JSON.stringify(dtoSubFunc)).subscribe(
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

	// API UpdateAction
	// Các trường bắt buộc Code, ActionName, ModuleID, FunctionID, TypeData, IsVisible
	UpdateAction(dtoAction: DTOAction) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateAction.method,
				that.config.getAPIList().UpdateAction.url, JSON.stringify(dtoAction)).subscribe(
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

	// API DeleteAction
	// Các trường bắt buộc Code
	DeleteAction(dtoAction: DTOAction) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteAction.method,
				that.config.getAPIList().DeleteAction.url, JSON.stringify(dtoAction)).subscribe(
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
	//#endregion

	//#regionAPI
	//lấy list module
	GetListModuleAPITree(state: State = {}) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListModuleAPITree.method,
				that.config.getAPIList().GetListModuleAPITree.url, JSON.stringify(toDataSourceRequest(state))).subscribe(
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
	//tạm tách ra để dùng cho Phân quyền
	// GetListModuleAPITree2(state: State = {}) {
	// 	let that = this;
	// 	return new Observable<DTOResponse>(obs => {
	// 		that.api.connect(that.config.getAPIList().GetListModuleAPITree.method,
	// 			that.config.getAPIList().GetListModuleAPITree.url, JSON.stringify(toDataSourceRequest(state))).subscribe(
	// 				(res: DTOResponse) => {
	// 					obs.next(res);
	// 					obs.complete();
	// 				}, errors => {
	// 					obs.error(errors);
	// 					obs.complete();
	// 				}
	// 			)
	// 	});
	// }
	//update api
	UpdateAPI(dtoAPI: DTOAPI) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateAPI.method,
				that.config.getAPIList().UpdateAPI.url, JSON.stringify(dtoAPI)).subscribe(
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

	// delete api - phải có code
	DeleteAPI(dtoAPI: DTOAPI) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteAPI.method,
				that.config.getAPIList().DeleteAPI.url, JSON.stringify(dtoAPI)).subscribe(
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
