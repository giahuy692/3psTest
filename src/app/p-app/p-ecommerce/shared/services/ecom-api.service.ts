import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, Ps_UtilObjectService, DTOResponse, DTOConfig } from "src/app/p-lib";
import { EcommerceApiConfigService } from './ecommerce-api-config.service';
import { CartOrderStatus } from '../dto/CartOrderStatus';
import { CartOrderType } from '../dto/CartOrderType';
import { DTOOrderDetail } from '../dto/DTOOrderDetail';
import { DTOUpdate } from '../dto/DTOUpdate';
import { DTOCoupon } from '../dto/DTOCoupon';
import { DTOECOMCart } from '../dto/DTOECOMCart.dto';
import { toDataSourceRequest, State } from '@progress/kendo-data-query';
import { CartAssignPickOrders } from '../dto/CartAssignPickOrders';
import { DTODeadLink } from "../dto/DTODeadLink";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
	providedIn: 'root'
})
export class EcomAPIService {

	constructor(
		public api: PS_CommonService,
		public config: EcommerceApiConfigService,
	) { }
	//List
	GetListOrders(dataSrcReq) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListOrders.method,
				that.config.getAPIList().GetListOrders.url, JSON.stringify(dataSrcReq)).subscribe(
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
	GetListOrdersCount() {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListOrdersCount.method,
				that.config.getAPIList().GetListOrdersCount.url, {}).subscribe(
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
	GetListOrderStatus() {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListOrderStatus.method,
				that.config.getAPIList().GetListOrderStatus.url, {}).subscribe(
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
	GetListOrderWHPickup() {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListOrderWHPickup.method,
				that.config.getAPIList().GetListOrderWHPickup.url, {}).subscribe(
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
	GetListOrdersByProduct(detail: DTOOrderDetail) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListOrdersByProduct.method,
				that.config.getAPIList().GetListOrdersByProduct.url, JSON.stringify(detail)).subscribe(
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
	//Order
	GetOrder(CartID: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetOrder.method,
				that.config.getAPIList().GetOrder.url, JSON.stringify({ 'CartID': CartID })).subscribe(
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
	GetOrderStatus(CartID: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetOrderStatus.method,
				that.config.getAPIList().GetOrderStatus.url, JSON.stringify({ 'CartID': CartID })).subscribe(
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
	//Detail
	GetOrderDetails(CartID: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetOrderDetails.method,
				that.config.getAPIList().GetOrderDetails.url, JSON.stringify({ 'CartID': CartID })).subscribe(
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
	GetOrderDetailByID(orderDetail: DTOOrderDetail) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetOrderDetailByID.method,
				that.config.getAPIList().GetOrderDetailByID.url,
				JSON.stringify(orderDetail))
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
	//Modify
	UpdateStatus(obj) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateStatus.method,
				that.config.getAPIList().UpdateStatus.url, JSON.stringify(obj)).subscribe(
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
	UpdateListStatus(obj: CartOrderStatus[]) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateListStatus.method,
				that.config.getAPIList().UpdateListStatus.url, JSON.stringify(obj)).subscribe(
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
	UpdateListOrderType(obj: CartOrderType[]) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateListOrderType.method,
				that.config.getAPIList().UpdateListOrderType.url, JSON.stringify(obj)).subscribe(
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
	SynOrder(obj) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().SynOrder.method,
				that.config.getAPIList().SynOrder.url, JSON.stringify(obj)).subscribe(
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
	CancelOrder(obj) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().CancelOrder.method,
				that.config.getAPIList().CancelOrder.url, JSON.stringify(obj)).subscribe(
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
	UpdateOrder(obj: DTOUpdate) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateOrder.method,
				that.config.getAPIList().UpdateOrder.url, JSON.stringify(obj,
					(k, v) => {
						return Ps_UtilObjectService.parseLocalDateTimeToString(k, v,
							['OrderDate', 'EstDelivery', 'DeliveriedDate', 'CancelDate',
								'ProcessFrom', 'ProcessTo', 'RequestDate', 'DeliveredDate'])//todo cái nào date, cái nào datetime
					}))
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
	DeleteCart(obj: DTOECOMCart) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().DeleteCart.method,
				that.config.getAPIList().DeleteCart.url, JSON.stringify(obj)).subscribe(
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
	//Coupon
	GetListCartCoupon(orderCode: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListCartCoupon.method,
				that.config.getAPIList().GetListCartCoupon.url, JSON.stringify(orderCode)).subscribe(
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
	UpdateCartCoupon(cp: DTOCoupon) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateCartCoupon.method,
				that.config.getAPIList().UpdateCartCoupon.url, JSON.stringify(cp)).subscribe(
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
	DeleteCartCoupon(cp: DTOCoupon) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().DeleteCartCoupon.method,
				that.config.getAPIList().DeleteCartCoupon.url, JSON.stringify(cp)).subscribe(
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
	//File
	PrintPXK(list: number[]) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().PrintPXK.method,
				that.config.getAPIList().PrintPXK.url, JSON.stringify(list)).subscribe(
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
	PrintLabel(list: number[]) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().PrintLabel.method,
				that.config.getAPIList().PrintLabel.url, JSON.stringify(list)).subscribe(
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
	ExportShipper365(list: number[]) {
		let that = this;

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ExportShipper365.method,
				that.config.getAPIList().ExportShipper365.url, JSON.stringify(list)
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
	ExportCurrentMaster() {
		let that = this;

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ExportCurrentMaster.method,
				that.config.getAPIList().ExportCurrentMaster.url, {}
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
	//Dropdown list
	GetListChannel() {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListChannel.method,
				that.config.getAPIList().GetListChannel.url, {}).subscribe(
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
	GetAllShippers() {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetAllShippers.method,
				that.config.getAPIList().GetAllShippers.url, {}).subscribe(
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
	GetAllProvinceInVietName() {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetAllProvinceInVietName.method,
				that.config.getAPIList().GetAllProvinceInVietName.url, {}).subscribe(
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
	GetAllDistrictInProvince(id: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetAllDistrictInProvince.method,
				that.config.getAPIList().GetAllDistrictInProvince.url, JSON.stringify(id)).subscribe(
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
	GetAllWardInDistrict(id: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetAllWardInDistrict.method,
				that.config.getAPIList().GetAllWardInDistrict.url, JSON.stringify(id)).subscribe(
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
	GetAllTypeOfPayment() {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetAllTypeOfPayment.method,
				that.config.getAPIList().GetAllTypeOfPayment.url, {}).subscribe(
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
	//Product
	GetProduct(cartID: number, barcode: string) {
		let that = this;
		var prod = {
			"CartID": cartID,
			"Barcode": barcode
		}

		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetProduct.method,
				that.config.getAPIList().GetProduct.url, JSON.stringify(prod)).subscribe(
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
	UpdateCartDetail(detail: DTOOrderDetail) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateCartDetail.method,
				that.config.getAPIList().UpdateCartDetail.url, JSON.stringify(detail,
					(k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['EffDate']) }))
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
	DeleteCartDetail(detail: DTOOrderDetail) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().DeleteCartDetail.method,
				that.config.getAPIList().DeleteCartDetail.url, JSON.stringify(detail)).subscribe(
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
	//Gift
	GetOrderGift(cartID: number) {
		let that = this;
		var cart = {
			"CartID": cartID
		}

		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetOrderGift.method,
				that.config.getAPIList().GetOrderGift.url, JSON.stringify(cart)).subscribe(
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
	GetGiftProduct(cart: number) {
		let that = this;
		var c = {
			"Cart": cart
		}
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetGiftProduct.method,
				that.config.getAPIList().GetGiftProduct.url, JSON.stringify(c)).subscribe(
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
	GetGiftBill(cart: number) {
		let that = this;
		var c = {
			"Cart": cart
		}

		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetGiftBill.method,
				that.config.getAPIList().GetGiftBill.url, JSON.stringify(c)).subscribe(
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
	UpdateCartGift(giftList: DTOOrderDetail[]) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateCartGift.method,
				that.config.getAPIList().UpdateCartGift.url, JSON.stringify(giftList,
					(k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['EffDate']) }))
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
	DeleteCartGift(gift: DTOOrderDetail) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().DeleteCartGift.method,
				that.config.getAPIList().DeleteCartGift.url, JSON.stringify(gift)).subscribe(
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
	//order master
	GetECOMWH() {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetECOMWH.method,
				that.config.getAPIList().GetECOMWH.url, {}).subscribe(
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
	GetCurrentMaster(state: State) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetCurrentMaster.method,
				that.config.getAPIList().GetCurrentMaster.url,
				JSON.stringify(toDataSourceRequest(state)))
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
	GetONLTransferMater(state: State) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetONLTransferMater.method,
				that.config.getAPIList().GetONLTransferMater.url,
				JSON.stringify(toDataSourceRequest(state)))
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
	GetONLListTransferMater(state: State) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetONLListTransferMater.method,
				that.config.getAPIList().GetONLListTransferMater.url,
				JSON.stringify(toDataSourceRequest(state)))
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
	ExportListOfMaster(arr: number[]) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ExportListOfMaster.method,
				that.config.getAPIList().ExportListOfMaster.url, JSON.stringify(arr)
				, null, null, 'response', 'blob').subscribe(
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
	CreateTransferMater(arr: DTOOrderDetail[]) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().CreateTransferMater.method,
				that.config.getAPIList().CreateTransferMater.url, JSON.stringify(arr,
					(k, v) => Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['EffDate'])))
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
	//assign	
	AssignPickOrders(obj: CartAssignPickOrders) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().AssignPickOrders.method,
				that.config.getAPIList().AssignPickOrders.url, JSON.stringify(obj)).subscribe(
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
	GetStaffOnline() {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetStaffOnline.method,
				that.config.getAPIList().GetStaffOnline.url, {}).subscribe(
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
	AssignUsers(staffID: number) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().AssignUsers.method,
				that.config.getAPIList().AssignUsers.url, JSON.stringify({ StaffID: staffID })).subscribe(
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
	//DEAD LINK
	GetListDeadLink(state: State) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListDeadLink.method,
				that.config.getAPIList().GetListDeadLink.url, JSON.stringify(
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
	UpdateDeadLink(link: DTODeadLink) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateDeadLink.method,
				that.config.getAPIList().UpdateDeadLink.url, JSON.stringify(link)).subscribe(
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
	DeleteDeadLink(links: DTODeadLink[]) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().DeleteDeadLink.method,
				that.config.getAPIList().DeleteDeadLink.url, JSON.stringify(links)).subscribe(
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
	ImportDeadLink(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().ImportDeadLink.method,
				that.config.getAPIList().ImportDeadLink.url, form, headers).subscribe(
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
