//#region [begin using]
import { Injectable } from '@angular/core';
import { ApiMethodType, DTOAPI, DTOConfig } from 'src/app/p-lib';
import { EnumConfig } from 'src/app/p-lib/enum/config.enum';
//#endregion [end using]

@Injectable({
	providedIn: 'root'
})
export class ConfigApiConfigService {

	constructor() { }

	//#region [begin coding]
	//#endregion [end coding]

	getAPIList() {
		return {
			//Product	
			GetListProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListProduct
			}),
			GetProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetProduct
			}),
			UpdateProductListTag: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateProductListTag
			}),
			UpdateProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateProduct
			}),
			UpdateBaseProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateBaseProduct
			}),
			ImportExcelProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.ImportExcelProduct
			}),
			ImportExcelProduct2: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.ImportExcelProduct2
			}),

			//Hamper
			GetListHamperRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListHamperRequest
			}),
			UpdateProductStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateProductStatus
			}),
			ImportExcelHamper: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.ImportExcelHamper
			}),
			GetListChangeHistory: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListChangeHistory
			}),
			GetHamperRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetHamperRequest
			}),
			GetListProductHamper: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListProductHamper
			}),
			GetListApplyCompany: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListApplyCompany
			}),
			GetProductForHamper: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetProductForHamper
			}),
			UpdateHamperRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateHamperRequest
			}),
			DeleteBaseHamperProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.DeleteBaseHamperProduct
			}),
			GetListProductSticker: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListProductSticker
			}),
			UpdateProductSticker: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateProductSticker
			}),
			GetListCurrency: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListCurrency
			}),
			GetListPackingUnit: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListPackingUnit
			}),
			DeleteProductSticker: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.DeleteProductSticker
			}),
			UpdateBaseHamperProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateBaseHamperProduct
			}),
			GetListGroup: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListGroup
			}),
			DeleteProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.DeleteProduct
			}),
			DeleteHamperRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.DeleteHamperRequest
			}),
			DeleteHamperRequestProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.DeleteHamperRequestProduct
			}),

			UpdateProductImage: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateProductImage
			}),

			DeleteProductImage: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.DeleteProductImage
			}),
			ImportExcelProductForHamper: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.ImportExcelProductForHamper
			}),




			// baseProduct
			GetListBaseProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListBaseProduct
			}),
			GetBaseProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetBaseProduct
			}),

			//#region phân quyền
			GetListRoleByDepartment: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListRoleByDepartment
			}),
			GetListSysStructurePermissionTree: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListSysStructurePermissionTree
			}),
			GetPermission: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetPermission
			}),
			UpdatePermission: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdatePermission
			}),
			DeletePermission: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.DeletePermission
			}),

			GetListDepartment: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListDepartment,
			}),
			//#endregion
			// Role
			GetListRoles: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListRoles
			}),
			UpdateRoles: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateRoles
			}),
			DeleteRoles: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.DeleteRoles
			}),

			//#regionPartner
			GetListPartnerTree: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListPartnerTree
			}),
			GetListPartnerDropdown: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListPartnerDropdown
			}),
			GetPartner: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetPartner
			}),
			UpdatePartner: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdatePartner
			}),
			DeletePartner: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.DeletePartner
			}),

			GetListAPIByModuleFunction: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListAPIByModuleFunction
			}),
			GetListProductStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListProductStatus
			}),

			// Personal Profile Enterprise
			GetListHRPersonalProfile: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListHRPersonalProfile
			}),
			GetHRPersonalProfile: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetHRPersonalProfile
			}),
			UpdateHRPersonalProfile: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateHRPersonalProfile
			}),
			UpdateHRPersonalCertificate: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateHRPersonalCertificate
			}),
			UpdateHRPersonalContact: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateHRPersonalContact
			}),
			UpdateHRPersonalAddress: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.UpdateHRPersonalAddress
			}),

			//#region Personal
			GetPersonalAddress: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetPersonalAddress
			}),

			GetPersonalCertificate: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetPersonalCertificate
			}),

			GetPersonalContact: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetPersonalContact
			}),

			GetListHR: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListHR
			}),

			GetListCountry: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListCountry
			}),

			GetListProvince: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListProvince
			}),

			GetListDistrict: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListDistrict
			}),

			GetListWard: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumConfig.GetListWard
			}),
			//#endregion
			
		};
	}
}