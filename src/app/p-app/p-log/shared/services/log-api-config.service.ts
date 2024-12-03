//#region [begin using]
import { Injectable } from '@angular/core';
import { ApiMethodType, DTOAPI, DTOConfig } from 'src/app/p-lib';
import { EnumLGT } from 'src/app/p-lib/enum/lgt.enum';
//#endregion [end using]

@Injectable({
	providedIn: 'root'
})
export class LogApiConfigService {

	constructor() { }

	//#region [begin coding]
	//#endregion [end coding]

	getAPIList() {
		return {
			//Product				
			GetProductByBarcode: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumLGT.GetProductByBarcode
			}),
			UpdateProductHachi24hByID: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumLGT.UpdateProductHachi24hByID
			}),
			DeleteProductHachi24hByID: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumLGT.DeleteProductHachi24hByID
			}),
			//
			ImportExcelAlbum: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumLGT.ImportExcelAlbum
			}),
			GetExcelAlbumn: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumLGT.GetExcelAlbumn
			}),
		};
	}
}