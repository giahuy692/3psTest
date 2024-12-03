//#region [begin using]
import { Injectable } from '@angular/core';
import { ApiMethodType, DTOAPI, DTOConfig } from 'src/app/p-lib';
import { EnumSales } from 'src/app/p-lib/enum/sales.enum';
//#endregion [end using]

@Injectable({
	providedIn: 'root'
})
export class SaleApiConfigService {

	constructor() { }

	//#region [begin coding]
	//#endregion [end coding]

	getAPIList() {
		return {
			//pos price				
			GetListPOSPriceAdj: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.GetListPOSPriceAdj
			}),
			GetPOSPriceAdj: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.GetPOSPriceAdj
			}),
			UpdatePOSPriceAdj: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.UpdatePOSPriceAdj
			}),
			UpdatePOSPriceAdjStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.UpdatePOSPriceAdjStatus
			}),
			DeletePOSPriceAdj: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.DeletePOSPriceAdj
			}),
			//pos detail
			GetListPOSPriceAdjDetails: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.GetListPOSPriceAdjDetails
			}),
			GetPOSPriceAdjDetails: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.GetPOSPriceAdjDetails
			}),
			GetPOSPriceAdjDetailsByBarcode: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.GetPOSPriceAdjDetailsByBarcode
			}),
			UpdatePOSPriceAdjDetails: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.UpdatePOSPriceAdjDetails
			}),
			DeletePOSPriceAdjDetails: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.DeletePOSPriceAdjDetails
			}),
			//file
			ImportExcelPriceAdjDetails: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.ImportExcelPriceAdjDetails
			}),
			//voucher
			GetListVoucher: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.GetListVoucher
			}),
			GetListVoucherType: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumSales.GetListVoucherType
			}),
		};
	}
}