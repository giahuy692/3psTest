import { Injectable } from '@angular/core';
import { ApiMethodType, DTOAPI, DTOConfig } from 'src/app/p-lib';
import { EnumPurchase } from 'src/app/p-lib/enum/purchase.enum';

@Injectable({
	providedIn: 'root'
})
export class PurApiConfigService {

	constructor() { }

	getAPIList() {
		return {
			//brand
			GetListBrand: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListBrand
			}),
			GetBrand: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetBrand
			}),
			UpdateBrand: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateBrand
			}),
			DeleteBrand: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.DeleteBrand
			}),
			UpdateBrandStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateBrandStatus
			}),
			MergeBrand: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.MergeBrand
			}),
			//report
			GetReports: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetReports
			}),
			ExportReport: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.ExportReport
			}),
			//PUR PO
			GetListReceivePartner: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListReceivePartner
			}),
			//PO order
			GetListReceiveOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListReceiveOrder
			}),
			GetReceiveOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetReceiveOrder
			}),
			UpdateOrderReceiving: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateOrderReceiving
			}),
			//PO invoice	
			GetListReceiveInvoice: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListReceiveInvoice
			}),
			GetReceiveInvoice: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetReceiveInvoice
			}),
			UpdateInvoiceReceiving: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateInvoiceReceiving
			}),
			//PO product	
			GetListReceiveProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListReceiveProduct
			}),
			GetReceiveProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetReceiveProduct
			}),
			UpdateProductReceiving: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateProductReceiving
			}),
			//PO supplier
			GetListSupplierTree: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListSupplierTree
			}),
			GetSupplier: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetSupplier
			}),
			UpdateSupplier: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateSupplier
			}),
			GetListReason: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListReason
			}),
			DeleteSupplier: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.DeleteSupplier
			}),
			GetListSupplierContact: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListSupplierContact
			}),
			UpdateSupplierContact: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateSupplierContact
			}),
			DeleteSupplierContact: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.DeleteSupplierContact
			}),
			GetTemplateEmail: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetTemplateEmail
			}),
			UpdateTemplateEmail: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateTemplateEmail
			}),
			// POProduct
			GetListPOProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListPOProduct
			}),
			GetListBuyedHistory: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListBuyedHistory
			}),
			GetListChangePriceHistory: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListChangePriceHistory
			}),

			//PriceRequest
			GetListPriceRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListPriceRequest
			}),
			GetPriceRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetPriceRequest
			}),
			UpdatePriceRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdatePriceRequest
			}),
			DeletePriceRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.DeletePriceRequest
			}),
			UpdatePriceRequestStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdatePriceRequestStatus
			}),

			//productRequest
			//PriceRequest
			GetListProductPriceRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListProductPriceRequest
			}),
			GetProductPriceRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetProductPriceRequest
			}),
			UpdateProductPriceRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateProductPriceRequest
			}),
			UpdateProductPriceRequestStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateProductPriceRequestStatus
			}),
			DeleteProductPriceRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.DeleteProductPriceRequest
			}),
			GetProductPriceRequestByCode: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetProductPriceRequestByCode
			}),
			GetListCommercialTerm: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListCommercialTerm
			}),

			ImportExcelProductPriceRequest: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.ImportExcelProductPriceRequest
			}),
			GetListSupplier: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListSupplier
			}),
			

			// PO Domestic Orders
			GetListOrderProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListOrderProduct
			}),
			ImportOrderProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.ImportOrderProduct
			}),
			UpdateOrderProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateOrderProduct
			}),

			GetListDomesticOrders: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListDomesticOrders
			}),

			GetDeliveryOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetDeliveryOrder 
			}),

			UpdateDomesticOrdersStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateDomesticOrdersStatus
			}),

			DeleteDemesticOrders: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.DeleteDemesticOrders
			}),

			DeleteOrderProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.DeleteOrderProduct
			}),

			GetExcelAlbumn: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetExcelAlbumn
			}),

			PrintOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.PrintOrder
			}),
			GetOrderProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetOrderProduct
			}),

			PrintOrderDetail: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.PrintOrderDetail
			}),

			UpdateDomesticOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateDomesticOrder
			}),

			GetDomesticOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetDomesticOrder
			}),

			GetListWareHouse: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListWareHouse
			}),

			GetListOrderInvoice: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListOrderInvoice
			}),

			DuplicatePOCancel: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.DuplicatePOCancel 
			}),

			GenerateInvoice: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GenerateInvoice
			}),

			GenerateInvoiceByVAT: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GenerateInvoiceByVAT
			}),

			UpdateInvoiceProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateInvoiceProduct
			}),
			
			AddInvoiceProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.AddInvoiceProduct
			}),

			GetListProductNotIncludedInvoice: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.GetListProductNotIncludedInvoice
			}),

			UpdateDeliveryOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateDeliveryOrder
			}),

			UpdateInvoice: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateInvoice
			}),

			UpdateInvoiceStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.UpdateInvoiceStatus
			}),

			ImportExcelInvoice: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumPurchase.ImportExcelInvoice
			}),
		};
	}
}