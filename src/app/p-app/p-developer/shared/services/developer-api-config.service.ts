//#region [begin using]
import { Injectable } from '@angular/core';
import { ApiMethodType } from 'src/app/p-lib';
import { EnumDeveloper } from 'src/app/p-lib/enum/developer.enum';
//#endregion [end using]

@Injectable({
	providedIn: 'root'
})
export class DeveloperApiConfigService {

	constructor() { }

	getAPIList() {
		return {
			//Developer chart
			GetListCompany: {
				url: EnumDeveloper.GetListCompany,
				method: ApiMethodType.post,
			},
			UpdateCompany: {
				url: EnumDeveloper.UpdateCompany,
				method: ApiMethodType.post,
			},
			DeleteCompany: {
				url: EnumDeveloper.DeleteCompany,
				method: ApiMethodType.post,
			},
			GetListSysStructureTree: {
				url: EnumDeveloper.GetListSysStructureTree,
				method: ApiMethodType.post,
			},
			GetListModuleTree: {
				url: EnumDeveloper.GetListModuleTree,
				method: ApiMethodType.post,
			},
			GetListActionTree: {
				url: EnumDeveloper.GetListActionTree,
				method: ApiMethodType.post,
			},
			UpdateModule: {
				url: EnumDeveloper.UpdateModule,
				method: ApiMethodType.post,
			},
			DeleteModule: {
				url: EnumDeveloper.DeleteModule,
				method: ApiMethodType.post,
			},
			UpdateFunction: {
				url: EnumDeveloper.UpdateFunction,
				method: ApiMethodType.post,
			},
			DeleteFunction: {
				url: EnumDeveloper.DeleteFunction,
				method: ApiMethodType.post,
			},
			UpdateSupFunction: {
				url: EnumDeveloper.UpdateSupFunction,
				method: ApiMethodType.post,
			},
			DeleteSupFunction: {
				url: EnumDeveloper.DeleteSupFunction,
				method: ApiMethodType.post,
			},
			UpdateAction: {
				url: EnumDeveloper.UpdateAction,
				method: ApiMethodType.post,
			},
			DeleteAction: {
				url: EnumDeveloper.DeleteAction,
				method: ApiMethodType.post,
			},
			GetListModuleAPITree: {
				url: EnumDeveloper.GetListModuleAPITree,
				method: ApiMethodType.post,
			},

			UpdateAPI: {
				url: EnumDeveloper.UpdateAPI,
				method: ApiMethodType.post,
			},
			DeleteAPI: {
				url: EnumDeveloper.DeleteAPI,
				method: ApiMethodType.post,
			},
		};
	}
}