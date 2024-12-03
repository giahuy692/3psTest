//#region [begin using]
import { Injectable } from '@angular/core';
import { ApiMethodType, DTOAPI, DTOConfig } from 'src/app/p-lib';
import { EnumEcommerce } from 'src/app/p-lib/enum/ecommerce.enum';
//#endregion [end using]

@Injectable({
	providedIn: 'root'
})
export class EcommerceApiConfigService {

	constructor() { }

	//#region [begin coding]
	//#endregion [end coding]

	getAPIList() {
		return {
			//List
			GetListOrders: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListOrders
			}),
			GetListOrdersCount: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListOrdersCount
			}),
			GetListOrderStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListOrderStatus
			}),
			GetListOrderWHPickup: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListOrderWHPickup
			}),
			GetListOrdersByProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListOrdersByProduct
			}),
			//Detail
			GetOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetOrder
			}),
			GetOrderStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetOrderStatus
			}),
			GetOrderDetails: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetOrderDetails
			}),
			GetOrderDetailByID: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetOrderDetailByID
			}),
			//Modify
			UpdateStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateStatus
			}),
			UpdateListStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateListStatus
			}),
			UpdateListOrderType: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateListOrderType
			}),
			CancelOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.CancelOrder
			}),
			UpdateOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateOrder
			}),
			SynOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.SynOrder
			}),
			DeleteCart: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteCart
			}),
			//Coupon			
			GetListCartCoupon: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListCartCoupon
			}),
			UpdateCartCoupon: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateCartCoupon
			}),
			DeleteCartCoupon: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteCartCoupon
			}),
			//File
			PrintPXK: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.PrintPXK
			}),
			PrintLabel: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.PrintLabel
			}),
			ExportShipper365: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ExportShipper365
			}),
			ExportCurrentMaster: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ExportCurrentMaster
			}),
			//Dropdown List		
			GetListChannel: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListChannel
			}),
			GetAllShippers: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetAllShippers
			}),
			GetAllProvinceInVietName: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetAllProvinceInVietName
			}),
			GetAllDistrictInProvince: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetAllDistrictInProvince
			}),
			GetAllWardInDistrict: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetAllWardInDistrict
			}),
			GetAllTypeOfPayment: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetAllTypeOfPayment
			}),
			//Product
			GetProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetProduct
			}),
			UpdateCartDetail: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateCartDetail
			}),
			DeleteCartDetail: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteCartDetail
			}),
			//Gift
			GetOrderGift: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetOrderGift
			}),
			GetGiftBill: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetGiftBill
			}),
			GetGiftProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetGiftProduct
			}),
			UpdateCartGift: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateCartGift
			}),
			DeleteCartGift: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteCartGift
			}),
			//order master			
			GetECOMWH: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetECOMWH
			}),
			GetCurrentMaster: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetCurrentMaster
			}),
			GetONLTransferMater: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetONLTransferMater
			}),
			GetONLListTransferMater: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetONLListTransferMater
			}),
			ExportListOfMaster: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ExportListOfMaster
			}),
			CreateTransferMater: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.CreateTransferMater
			}),
			//assign
			AssignPickOrders: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.AssignPickOrders
			}),
			GetStaffOnline: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetStaffOnline
			}),
			AssignUsers: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.AssignUsers
			}),
			//dead link			
			GetListDeadLink: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListDeadLink
			}),
			UpdateDeadLink: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateDeadLink
			}),
			DeleteDeadLink: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteDeadLink
			}),
			ImportDeadLink: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ImportDeadLink
			}),
			//kenh ban hang
			GetChannelList: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetChannelList
			}),
			GetChannel: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetChannel
			}),
			UpdateChannelStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateChannelStatus
			}),
			UpdateChannel: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateChannel
			}),
			DeleteChannel: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteChannel
			}),
			GetListChannelGroup: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListChannelGroup
			}),
			GetListChildChannelGroup: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListChildChannelGroup
			}),
			GetListChannelInGroup: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListChannelInGroup
			}),
			GetListPriority: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListPriority
			}),
			UpdateChannelGroup: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateChannelGroup
			}),
			DeleteChannelGroup: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteChannelGroup
			}),

			GetListChannelNew: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListChannelNew
			}),

			ErpUpdateChannelStatus: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ErpUpdateChannelStatus
			}),

			ErpUpdateChannel: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ErpUpdateChannel
			}),


			ErpDeleteChannel: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ErpDeleteChannel
			}),

			GetListChannelGroupTwoLevel: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListChannelGroupTwoLevel
			}),

			//channel prod
			GetListChannelProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListChannelProduct
			}),
			GetChannelProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetChannelProduct
			}),
			GetChannelProductByCode: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetChannelProductByCode
			}),
			UpdateStatusChannelProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateStatusChannelProduct
			}),
			UpdateChannelProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateChannelProduct
			}),
			DeleteChannelProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteChannelProduct
			}),
			UpdateProductQuantity: new DTOAPI({
				method: ApiMethodType.post,
				// url: DTOConfig.appInfo.apiconf + "product/UpdateProductQuantity"
				url: EnumEcommerce.UpdateProductQuantity
			}),
			ImportChannelProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ImportChannelProduct
			}),
			//Chứng từ điều chuyển	
			GetListTransferReceive: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListTransferReceive
			}),
			GetTransferReceive: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetTransferReceive
			}),
			UpdateStatusTransferReceive: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateStatusTransferReceive
			}),
			UpdateTransferReceive: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateTransferReceive
			}),
			UpdateTransferSent: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateTransferSent
			}),
			DeleteTransferReceive: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteTransferReceive
			}),
			//Sản phẩm GetInport
			GetListTransferReceiveDetail: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListTransferReceiveDetail
			}),
			GetTransferReceiveDetail: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetTransferReceiveDetail
			}),
			GetTransferReceiveDetailByCode: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetTransferReceiveDetailByCode
			}),
			UpdateInportProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateTransferReceiveDetail
			}),
			DeleteInportProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteTransferReceiveDetail
			}),
			ImportInportProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ImportTransferReceiveDetail
			}),
			//Syn Cart			
			VNPayIPNRecall: new DTOAPI({
				method: ApiMethodType.post,
				url: DTOConfig.appInfo.apiecHachi + "VNPayIPNRecall"
			}),
			//Syn Customer Cart
			GetListClientOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListClientOrder
			}),
			GetClientOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetClientOrder
			}),
			UpdateClientOrder: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateClientOrder
			}),
			//syn cart detail
			GetSynOrderDetails: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetSynOrderDetails
			}),
			GetSynOrderGift: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetSynOrderGift
			}),
			GetListOrderCoupon: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListOrderCoupon
			}),
			//syn cart dropdowns
			GetProvinces: {
				url: DTOConfig.appInfo.apiecHachi + "api/config/GetProvinces",
				method: ApiMethodType.post,
			},
			GetDistricts: {
				url: DTOConfig.appInfo.apiecHachi + "api/config/GetDistricts",
				method: ApiMethodType.post,
			},
			GetWards: {
				url: DTOConfig.appInfo.apiecHachi + "api/config/GetWards",
				method: ApiMethodType.post,
			},
			GetPayments: {
				url: DTOConfig.appInfo.apiecHachi + "api/config/GetPayments",
				method: ApiMethodType.post,
			},
			// sản phẩm kênh kinh doanh
			ImportChannelGroupProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.ImportChannelGroupProduct
			}),
			GetListProductChannelGroup: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListProductChannelGroup
			}),
			GetChannelGroupProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetChannelGroupProduct
			}),
			DeleteChannelGroupProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.DeleteChannelGroupProduct
			}),
			GetListChannelGroupProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.GetListChannelGroupProduct
			}),
			UpdateStatusChannelGroupProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateStatusChannelGroupProduct
			}),
			UpdateChannelGroupProduct: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumEcommerce.UpdateChannelGroupProduct
			}),
		};
	}
}