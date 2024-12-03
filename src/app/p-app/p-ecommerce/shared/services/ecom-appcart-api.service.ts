import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DTOConfig, DTOResponse, Ps_AuthService, PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from "src/app/p-lib";
import DTOItemCart2, { DeliveryDTO, DTOCartCombo, DTOCart_Properties, DTOCoupon_Cart_CartCoupon, DTOItemCartGifts, DTOItemCart_Coupon2, DTOItemCart_Gift2, DTOPayment, DTOPaymentCart, DTOTypeOfTransportation, UserNotiDTO } from "../dto/DTOHachiCart";
import { EcomHachiApiConfigService } from "./ecomhachi-api-config.service";
import * as $ from 'jquery'
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import DTOSynCart from "../dto/DTOSynCart.dto";
import { LayoutService } from "src/app/p-app/p-layout/services/layout.service";

@Injectable({
	providedIn: 'root'
})
export class EcomAppCartAPIService {
	private keyCachePayment: string;
	private url: string
	private statusID: number
	//tooltip
	public _showAdd: BehaviorSubject<boolean>;
	private _showDel: BehaviorSubject<boolean>;
	private _showEdit: BehaviorSubject<boolean>;
	//cart
	private _dataCart: BehaviorSubject<DTOItemCart2>;
	public _paymentCart: DTOPaymentCart;
	//detail
	private _dataDetails: BehaviorSubject<Array<DTOItemCart2>>;
	public _dataDetailsLength: BehaviorSubject<number>;
	private _listCarts: Array<DTOItemCart2>;
	private _curDetail: BehaviorSubject<DTOItemCart2>

	private _dataNoti: BehaviorSubject<Array<UserNotiDTO>>
	private _dataCombo: BehaviorSubject<Array<DTOCartCombo>>
	private _dataGift: BehaviorSubject<DTOItemCartGifts>
	private _dataCoupon: BehaviorSubject<Array<DTOItemCart_Coupon2>>
	private _listCoupon: BehaviorSubject<Array<DTOItemCart_Coupon2>>

	private _typeOfTransportation: BehaviorSubject<Array<DTOTypeOfTransportation>>
	private _popupCart: BehaviorSubject<boolean>;
	private _dataPayment: BehaviorSubject<Array<DTOPayment>>

	constructor(public common: PS_CommonService,
		public cacheService: Ps_UtilCacheService,
		public config: EcomHachiApiConfigService,
		public api: PS_CommonService,
		public auth: Ps_AuthService,
		public layoutService: LayoutService,
	) {
		this.url = window.location.href
		this.statusID = this.getCartStep()
		this.keyCachePayment = "ps_cartpayment";

		this._showAdd = new BehaviorSubject(null);
		this._showDel = new BehaviorSubject(null);
		this._showEdit = new BehaviorSubject(null);

		this._paymentCart = new DTOPaymentCart();
		this._listCarts = [];

		this._dataDetails = new BehaviorSubject([]);
		this._dataDetailsLength = new BehaviorSubject(0);
		this._curDetail = new BehaviorSubject(null)
		this._dataCart = new BehaviorSubject(null);

		this._dataNoti = new BehaviorSubject(null);
		this._dataCombo = new BehaviorSubject(null);
		this._dataGift = new BehaviorSubject(null);
		this._dataCoupon = new BehaviorSubject(null);
		this._listCoupon = new BehaviorSubject(null);

		this._dataPayment = new BehaviorSubject([]);
		this._popupCart = new BehaviorSubject<boolean>(false);
		this._typeOfTransportation = new BehaviorSubject([])
	}

	getCartStep() {
		const ele = $("#hachi-page__body")
		const step = ele.attr('step')
		return Ps_UtilObjectService.hasValue(step) ? Number(step) : 3
	}

	loadCurrentCart(getCurrentCart = true): void {
		var staffID = DTOConfig.Authen.userinfo?.staffID
		//load danh sách sản phẩm từ cache
		this.p_getCachePayment().subscribe(rs => {
			if (this.auth.isLogin()) {
				//TH1: đã login và có cache
				if (Ps_UtilObjectService.hasValue(rs)) {
					rs.Cart.StatusID = this.statusID
					rs.Cart.StaffID = staffID
					this._paymentCart.TotalItemQuantity = rs.TotalItemQuantity
					this._dataDetailsLength.next(rs.TotalItemQuantity)

					if (getCurrentCart)
						this.p_loadCurrentCart(rs);
				}
				else {
					//TH2: đã login ko có cache
					this._paymentCart.Cart.StatusID = this.statusID
					this._paymentCart.Cart.StaffID = staffID
					this._paymentCart.TotalItemQuantity = 0

					if (getCurrentCart)
						this.p_loadCurrentCart(this._paymentCart);
				}
			} else {
				//TH3: chưa đăng nhập
				if (Ps_UtilObjectService.hasValue(rs)) {
					rs.Cart.StatusID = this.statusID
					rs.Cart.StaffID = staffID
					this._paymentCart.Cart = rs.Cart;

					this._paymentCart.CartDetails = rs.CartDetails;
					this._paymentCart.CartCoupon = rs.CartCoupon;
					this._paymentCart.CartNoti = rs.CartNoti;
					this._paymentCart.CartCombo = rs.CartCombo;

					this._paymentCart.TotalItemQuantity = rs.TotalItemQuantity
					this._dataDetailsLength.next(rs.TotalItemQuantity)

					if (getCurrentCart)
						this.p_loadCurrentCart(rs);
				} else {
					this._paymentCart.Cart.StatusID = this.statusID
					this._paymentCart.Cart.StaffID = staffID
					this._paymentCart.CartDetails = [];
					this._paymentCart.CartCoupon = [];
					this._paymentCart.CartNoti = []
					this._paymentCart.CartCombo = []
					this._paymentCart.TotalItemQuantity = 0

					if (getCurrentCart)
						this.p_loadCurrentCart(this._paymentCart);
				}
				this.p_setCartDetails(this._paymentCart.CartDetails);
			}
		});
	}

	addHandler(data: DTOItemCart2, isIncrement = true, showAdd = true) {
		const quanDiff = [0]
		this._curDetail.next(data)

		if (this._listCarts.length == 0 && data.OrderQuantity > 0) {
			this._listCarts.push(data);
			quanDiff[0] = data.OrderQuantity
		} else {
			const item = this._listCarts.find(e => e.ProductID == data.ProductID);
			if (Ps_UtilObjectService.hasValue(item)) {

				if (isIncrement) {
					quanDiff[0] = data.OrderQuantity
					item.OrderQuantity += data.OrderQuantity;
				} else {
					quanDiff[0] = data.OrderQuantity - item.OrderQuantity
					item.OrderQuantity = data.OrderQuantity;
				}
			} else {
				this._listCarts.push(data);
				quanDiff[0] = data.OrderQuantity
			}
		}

		this._paymentCart.TotalItemQuantity += quanDiff[0]

		this._dataDetailsLength.next(this._paymentCart.TotalItemQuantity)
		this.p_setCartDetails(this._listCarts);

		if (showAdd)
			this.showAddTooltip()

		if (!this.auth.isLogin()) {
			this._paymentCart.CartDetails = [...this._listCarts]
		}
		this.p_setCachePayment(this._paymentCart)
		// this.loadCartDetail(1, false, true)
	}

	AddCartBuyAgain(data: DTOItemCart2, isIncrement = true, showAdd = true): Observable<DTOResponse> {
		if (!(data.StaffID > 0))
			return new Observable<DTOResponse>(obs => {
				obs.next({ StatusCode: 1, ErrorString: 'Không tìm thấy mã nhân viên tư vấn. Vui lòng đăng nhập lại.', Exception: null, ObjectReturn: null })
				obs.complete()
			})

		if (this.auth.isLogin() || this._paymentCart.Cart.Code > 0) {
			data.CartID = this._paymentCart.Cart.Code

			return new Observable<any>(obs => {
				this.AddCart(data).subscribe(res => {
					if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
						if (Ps_UtilObjectService.hasValue(res.ObjectReturn.ItemData))
							this.addHandler(res.ObjectReturn.ItemData, isIncrement, showAdd)
						else
							this.addHandler(data, isIncrement, showAdd)
					}
					obs.next(res)
					obs.complete()
				})
			})
		}
		else {
			return new Observable<any>(obs => {
				this.addHandler(data, isIncrement, showAdd)

				const dto = new DTOResponse()
				dto.ObjectReturn = data
				dto.StatusCode = 0

				obs.next(dto)
				obs.complete()
			})
		}
	}
	//set
	p_setCartDetails(data: Array<DTOItemCart2>) {//DTOItemCart
		this._listCarts = [...data]
		this._dataDetails.next(data)
	}
	p_setCart(data: DTOItemCart2) {
		this._dataCart.next(data)
	}
	//get detail
	changeDetailsLength(): Observable<number> {
		return this._dataDetailsLength.asObservable();
	}
	changeDetails(): Observable<Array<DTOItemCart2>> {//DTOItemCart
		return this._dataDetails.asObservable();
	}
	changeDetail(): Observable<DTOItemCart2> {
		return this._curDetail.asObservable();
	}
	//get
	changeCombo(): Observable<Array<DTOCartCombo>> {
		return this._dataCombo.asObservable();
	}
	changeNoti(): Observable<Array<UserNotiDTO>> {
		return this._dataNoti.asObservable();
	}
	changeGift(): Observable<DTOItemCartGifts> {
		return this._dataGift.asObservable();
	}
	changeCoupon(): Observable<Array<DTOItemCart_Coupon2>> {
		return this._dataCoupon.asObservable();
	}
	changeListCoupon(): Observable<Array<DTOItemCart_Coupon2>> {
		return this._listCoupon.asObservable();
	}
	changePayment(): Observable<Array<DTOPayment>> {
		return this._dataPayment.asObservable();
	}
	changeCart(): Observable<DTOItemCart2> {
		return this._dataCart.asObservable();
	}
	changeTypeOfTransportation(): Observable<Array<DTOTypeOfTransportation>> {
		return this._typeOfTransportation.asObservable();
	}
	//popup cart
	changePopupCart(): Observable<boolean> {
		return this._popupCart.asObservable();
	}
	openPopupCart() {
		this.p_activePopup(true);
	}
	closePopupCart() {
		this.p_activePopup(false);
	}
	private p_activePopup(data: boolean): void {
		this._popupCart.next(data)
	}
	//tooltip
	showAddTooltip() {
		this._showAdd.next(true)
		setTimeout(() => this._showAdd.next(false), 1500)
	}
	showEditTooltip() {
		this._showEdit.next(true)
		setTimeout(() => this._showEdit.next(false), 2000)
	}
	showDelTooltip() {
		this._showDel.next(true)
		setTimeout(() => this._showDel.next(false), 2000)
	}
	changeShowAdd(): Observable<boolean> {
		return this._showAdd.asObservable();
	}
	changeShowDel(): Observable<boolean> {
		return this._showDel.asObservable();
	}
	changeShowEdit(): Observable<boolean> {
		return this._showEdit.asObservable();
	}
	//#region 
	public p_getCachePayment(): Observable<DTOPaymentCart> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCachePayment).subscribe(res => {
				if (Ps_UtilObjectService.hasValue(res))
					obs.next(JSON.parse(res.value).value);
				else {
					obs.next(null);
				}
				obs.complete()
			}, () => {
				obs.next(null);
				obs.complete()
			});
		});
	}
	public p_setCachePayment(data: DTOPaymentCart): void {
		this.cacheService.setItem(this.keyCachePayment, data);
	}
	public p_deleteCachePayment(): void {
		this.cacheService.removeItem(this.keyCachePayment);
	}
	//
	private p_loadCurrentCart(pay: DTOPaymentCart) {
		this.p_GetCurrentCart(pay).subscribe()
	}
	// public p_GetCurrentCartNoOfProduct() {
	// 	return new Observable<number>(obs => {
	// 		this.GetCurrentCartNoOfProduct().subscribe(res => {
	// 			if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res)) {
	// 				this._paymentCart.TotalItemQuantity += res.ObjectReturn
	// 				this._dataDetailsLength.next(this._paymentCart.TotalItemQuantity)
	// 				this.p_setCachePayment(this._paymentCart)
	// 			}
	// 			obs.next(this._paymentCart.TotalItemQuantity)
	// 			obs.complete()
	// 		}, () => {
	// 			obs.next(this._paymentCart.TotalItemQuantity)
	// 			obs.complete()
	// 		})
	// 	})
	// }
	public p_GetCurrentCart(pay: DTOPaymentCart) {
		if (pay.Cart.IsVAT == null)
			pay.Cart.IsVAT = false

		pay.Cart.StaffID = DTOConfig.Authen.userinfo?.staffID

		return new Observable<DTOPaymentCart>(obs => {
			this.layoutService.onInfo('Đang xử lý Lấy dữ liệu Giỏ hàng', 10000)

			this.GetCurrentCart(pay).subscribe(res => {
				if (Ps_UtilObjectService.hasValue(res)) {
					if (res.StatusCode == 0) {
						this.layoutService.onSuccess('Lấy dữ liệu Giỏ hàng thành công', 5000)
						const rs = res.ObjectReturn as DTOPaymentCart
						const newPay = { ...pay }

						newPay.Cart = rs.Cart
						newPay.CartDetails = rs.CartDetails
						newPay.CartCoupon = rs.CartCoupon
						newPay.CartCombo = rs.CartCombo
						newPay.CartNoti = rs.CartNoti
						newPay.TotalItemQuantity = rs.TotalItemQuantity
						newPay.TypeOfTransportation = rs.TypeOfTransportation

						//clear cache sau để tránh api add list cũ vào db
						if (this.auth.isLogin()) {
							newPay.CartDetails = []
							newPay.CartCoupon = []
							newPay.CartCombo = []
							newPay.CartNoti = []
						}

						this.p_setCart(rs.Cart)
						this.p_setCartDetails(rs.CartDetails);

						this._dataCoupon.next(rs.CartCoupon)
						this._listCoupon.next(rs.ListCoupon)
						this._dataCombo.next(rs.CartCombo)
						this._dataNoti.next(rs.CartNoti)
						this._typeOfTransportation.next(rs.TypeOfTransportation)
						this._dataDetailsLength.next(rs.TotalItemQuantity)

						this._paymentCart = { ...newPay }
						this.p_setCachePayment(newPay)
						obs.next(rs)
						obs.complete()
					}
					else if (res.StatusCode == 3) {//trùng hoặc ko có giỏ hàng
						const newPay = this.newPayment(pay.Cart);
						this.p_setCachePayment(newPay)
						obs.next(newPay)
						obs.complete()
					}
				}
			}, () => {
				const newPay = this.newPayment(pay.Cart);
				this.p_setCachePayment(newPay)
				obs.next(newPay)
				obs.complete()
			})
		})
	}

	public newPayment(CartState: DTOItemCart2) {
		const payment = new DTOPaymentCart()
		payment.Cart.OrderBy = CartState.OrderBy
		payment.Cart.OrderPhone = CartState.OrderPhone
		payment.Cart.OrderEmail = CartState.OrderEmail
		payment.Cart.ReceivedByIsOrderBy = CartState.ReceivedByIsOrderBy

		if (CartState.ReceivedByIsOrderBy) {
			payment.Cart.ReceivedBy = CartState.OrderBy
			payment.Cart.Cellphone = CartState.OrderPhone
		} else {
			payment.Cart.ReceivedBy = CartState.ReceivedBy
			payment.Cart.Cellphone = CartState.Cellphone
		}

		payment.Cart.Province = CartState.Province
		payment.Cart.District = CartState.District
		payment.Cart.Ward = CartState.Ward
		payment.Cart.Address = CartState.Address
		payment.TotalItemQuantity = 0
		return payment
	}

	public p_GetPayments() {
		this.GetPayments().subscribe(res => {
			if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0)
				this._dataPayment.next([...res.ObjectReturn])
		})
	}
	deleteHandler(item: DTOItemCart2) {
		const deleted = this._listCarts.findIndex(s => s.ProductID == item.ProductID)
		this._listCarts.splice(deleted, 1)
		this._paymentCart.TotalItemQuantity = this._listCarts.reduce((a, { OrderQuantity }) => a + OrderQuantity, 0)
		this._dataDetailsLength.next(this._paymentCart.TotalItemQuantity)
		this.p_setCartDetails(this._listCarts)
		this.showDelTooltip()

		if (!this.auth.isLogin()) {
			this._paymentCart.CartDetails = [...this._listCarts]
		}
		this.p_setCachePayment(this._paymentCart)
		// this.loadCartDetail(1, false, true)
	}
	public p_DeleteCartDetail(item: DTOItemCart2) {
		if (this.auth.isLogin() || this._paymentCart.Cart.Code > 0) {
			item.CartID = this._paymentCart.Cart.Code

			return new Observable<any>(obs => {
				this.DeleteCartDetail(item).subscribe(res => {
					if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
						this.deleteHandler(item)
					}
					obs.next(res)
					obs.complete()
				})
			})
		}
		else {
			this.deleteHandler(item)
			return new Observable<any>(obs => {
				obs.next(null)
				obs.complete()
			})
		}
	}
	public p_AddCoupon(coupon: DTOItemCart_Coupon2, detail: DTOItemCart2 = null): Observable<DTOResponse> {
		const param = new DTOCoupon_Cart_CartCoupon()
		param.SelectedCoupon = coupon
		param.Cart = this._paymentCart.Cart
		param.CartCoupon = this._paymentCart.CartCoupon
		param.SelectedCartDetail = detail

		return new Observable<DTOResponse>(obs => {
			this.AddCoupon(param).subscribe(res => {
				if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
					//clear cache sau để tránh api add list cũ vào db
					if (this.auth.isLogin()) {
						const newPay = { ...this._paymentCart }
						newPay.CartCoupon = []
						this.p_setCachePayment(newPay)
					}
					else {//nếu là coupon của cart
						if (coupon.ProductID == null) {
							this._paymentCart.CartCoupon.push(res.ObjectReturn)
							this.p_setCachePayment(this._paymentCart)
							this._dataCoupon.next([...this._paymentCart.CartCoupon])
						}
						else {//nếu là coupon của sp
							const prod = this._listCarts.find(s => s.ProductID == coupon.ProductID)

							if (prod != undefined) {
								prod.ListCouponSelected = [coupon]
								this._paymentCart.CartDetails = [...this._listCarts]
								this.p_setCachePayment(this._paymentCart)
							}
						}
					}
				}
				obs.next(res)
				obs.complete()
			})
		})
	}
	public p_DeleteCoupon(coupon: DTOItemCart_Coupon2): Observable<DTOResponse> {
		const param = new DTOCoupon_Cart_CartCoupon()
		param.SelectedCoupon = coupon
		param.Cart = this._paymentCart.Cart
		param.CartCoupon = this._paymentCart.CartCoupon

		return new Observable<DTOResponse>(obs => {
			this.DeleteCoupon(param).subscribe(res => {
				if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
					//nếu là coupon của cart
					if (coupon.ProductID == null) {
						const deleted = this._paymentCart.CartCoupon.findIndex(s => s.CouponCode == coupon.CouponCode)

						if (deleted != -1) {
							this._paymentCart.CartCoupon.splice(deleted, 1)
							this.p_setCachePayment(this._paymentCart)
							this._dataCoupon.next([...this._paymentCart.CartCoupon])
						}
					}
					else {//nếu là coupon của sp
						const deleted = this._paymentCart.CartCoupon.findIndex(s => s.CouponCode == coupon.CouponCode)

						if (deleted != -1) {
							this._paymentCart.CartCoupon.splice(deleted, 1)
							this.p_setCachePayment(this._paymentCart)
						}
					}
					// }
				}
				obs.next(res)
				obs.complete()
			})
		})
	}
	//
	// data: DTOResponse = JSON.parse('{"StatusCode":0,"ErrorString":null,"ObjectReturn":{"Cart":{"Code":27642,"StatusID":1,"ReceivedBy":"Khang Phạm","Cellphone":"0813173003","Province":45,"District":512,"Ward":8695,"Address":"địa chỉ Hachi 3PS test, đừng giao hàng","FullAddress":"địa chỉ Hachi 3PS test, đừng giao hàng, P. 1, Quận Gò Vấp, Thành phố Hồ Chí Minh","PaymentID":1,"PaymentMethod":"Thanh toán tiền mặt khi nhận hàng - COD","OrderNo":"H88027642","OrderBy":"Khang Phạm","OrderPhone":null,"OrderEmail":null,"OrderDate":"2022-10-15T00:00:00","EstDelivery":null,"DeliveryID":10055,"BankID":null,"IsVAT":false,"VATCode":null,"VATCompany":null,"VATAddress":null,"VATEmail":null,"TotalAmount":261000.0,"MembershipID":"CE000259","PolicyMembership":0.0,"DiscountMembership":0.0,"CouponPaid":0.0,"ShippingFee":50000.0,"ShippingDiscount":20000.0,"Payment":291000.0,"Remark":null},"CartDetails":[{"Barcode":"4977794005831","ImageSetting":"https://hachihachi.com.vn/Uploads/_6/productimage/_crop/4977794005831.jpg","ProductName":"Bảng trang trí 23x11.8cm","IsStock":true,"IsMoreThanStock":false,"ModelName":"","ListModels":[],"ListCouponSelected":[],"ListCoupon":[],"HasCoupon":false,"ListGift":[],"ListItem":[],"DeliveryHachi24h":false,"IsPromotionVIP":false,"Alias":"/binh-hoa-tuong-do-trang-tri/bang-trang-tri-23x118cm","ShippingFee":20000.0,"IsFinish":false,"Code":56271,"CartID":27642,"CartDelivery":31542,"StatusID":1,"ProductID":23480,"ModelID":null,"OrderQuantity":3.0,"ShippedQuantity":3.0,"DeleteQty":0.0,"UnitPrice":18000.0,"BasePrice":40000.0,"PromotionDetailID":183622,"ComboQty":1.0,"RefID":null,"RefNo":null,"RefName":null,"Remark":null,"TypeData":1,"IsHachi24":false,"CBM":0.0,"IsPriceAdj":false,"IsQtyAdj":false,"IsApproved":true},{"Barcode":"4903367303196","ImageSetting":"https://hachihachi.com.vn/Uploads/_6/productimage/_crop/4903367303196.jpg","ProductName":"Bột giặt quần áo, tã cho bé Rocket 1kg","IsStock":true,"IsMoreThanStock":false,"ModelName":"","ListModels":[],"ListCouponSelected":[],"ListCoupon":[],"HasCoupon":false,"ListGift":[],"ListItem":[],"DeliveryHachi24h":true,"IsPromotionVIP":false,"Alias":"/rua-binh-giat-quan-ao/bot-giat-quan-ao-ta-cho-be-rocket-1kg","ShippingFee":30000.0,"IsFinish":false,"Code":56273,"CartID":27642,"CartDelivery":31541,"StatusID":1,"ProductID":22592,"ModelID":null,"OrderQuantity":3.0,"ShippedQuantity":3.0,"DeleteQty":0.0,"UnitPrice":69000.0,"BasePrice":139000.0,"PromotionDetailID":183880,"ComboQty":1.0,"RefID":null,"RefNo":null,"RefName":null,"Remark":null,"TypeData":1,"IsHachi24":true,"CBM":0.0,"IsPriceAdj":false,"IsQtyAdj":false,"IsApproved":true}],"CartCoupon":[{"CouponName":"Trợ ship 20k - ĐH từ 200k","Description":"Áp dụng cho đơn hàng từ 200.000đ","StartDate":"2022-05-13T00:00:00","ExpiredDate":"2022-12-31T00:00:00","IsPercent":false,"IsPrivate":false,"CardID":null,"CouponBaseAmount":20000.0,"Code":19296,"CartID":27642,"CouponID":272977,"CouponCode":"ESHIPKT1","CartDetailID":null,"ProductID":null,"TypeData":4,"CouponAmount":20000.0,"IsUse":false}],"ListCoupon":[{"CouponName":"Trợ ship 20k - ĐH từ 200k","Description":"Áp dụng cho đơn hàng từ 200.000đ","StartDate":"2022-05-13T00:00:00","ExpiredDate":"2022-12-31T00:00:00","IsPercent":false,"IsPrivate":false,"CardID":null,"CouponBaseAmount":20000.0,"Code":272977,"CartID":0,"CouponID":272977,"CouponCode":"ESHIPKT1","CartDetailID":null,"ProductID":null,"TypeData":4,"CouponAmount":20000.0,"IsUse":true},{"CouponName":"Trợ ship 50k - ĐH từ 2 triệu","Description":"Áp dụng cho đơn hàng từ 2 triệu","StartDate":"2022-05-13T00:00:00","ExpiredDate":"2022-12-31T00:00:00","IsPercent":false,"IsPrivate":false,"CardID":null,"CouponBaseAmount":50000.0,"Code":272978,"CartID":0,"CouponID":272978,"CouponCode":"ESHIPKT2","CartDetailID":null,"ProductID":null,"TypeData":4,"CouponAmount":50000.0,"IsUse":false},{"CouponName":"Giảm tối đa 1 triệu đồng","Description":"Giảm 10% đơn web từ 500K, Giảm tối đa 1 triệu đồng","StartDate":"2022-10-01T00:00:00","ExpiredDate":"2022-10-31T00:00:00","IsPercent":true,"IsPrivate":false,"CardID":null,"CouponBaseAmount":10.0,"Code":273862,"CartID":0,"CouponID":273862,"CouponCode":"EHLP103","CartDetailID":null,"ProductID":null,"TypeData":3,"CouponAmount":10.0,"IsUse":false},{"CouponName":"Giảm tối đa 25.000đ","Description":"Giảm 5% đơn web từ 300K, Giảm tối đa 25.000đ","StartDate":"2022-10-01T00:00:00","ExpiredDate":"2022-10-31T00:00:00","IsPercent":true,"IsPrivate":false,"CardID":null,"CouponBaseAmount":5.0,"Code":273863,"CartID":0,"CouponID":273863,"CouponCode":"EHLP051","CartDetailID":null,"ProductID":null,"TypeData":3,"CouponAmount":5.0,"IsUse":false},{"CouponName":"Áp dụng cho đơn hàng từ 2 triệu","Description":"Áp dụng cho đơn hàng từ 2 triệu","StartDate":"2022-05-13T00:00:00","ExpiredDate":"2022-12-31T00:00:00","IsPercent":false,"IsPrivate":false,"CardID":null,"CouponBaseAmount":50000.0,"Code":273873,"CartID":0,"CouponID":273873,"CouponCode":"ESHIPKT4","CartDetailID":null,"ProductID":null,"TypeData":4,"CouponAmount":50000.0,"IsUse":false}],"CartNoti":[],"TotalItemQuantity":6.0,"CartCombo":[]}}')

	public GetCurrentCart(pay?: DTOPaymentCart) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetCurrentCart.method,
				that.config.getAPIList().GetCurrentCart.url, JSON.stringify(pay))
				.subscribe((res: any) => {
					//obs.next(this.data);
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	// public GetCurrentCartNoOfProduct() {
	// 	let that = this;
	// 	return new Observable<DTOResponse>(obs => {
	// 		that.api.connect(that.config.getAPIList().GetCurrentCartNoOfProduct.method,
	// 			that.config.getAPIList().GetCurrentCartNoOfProduct.url, null)
	// 			.subscribe((res: any) => {
	// 				obs.next(res);
	// 				obs.complete();
	// 			}, errors => {
	// 				obs.error(errors);
	// 				obs.complete();
	// 			})
	// 	});
	// }
	public UpdateCart(item: DTOItemCart2, property: string[]) {
		const cart_prop: DTOCart_Properties = {
			Cart: item,
			Properties: property
		}

		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCart.method,
				that.config.getAPIList().UpdateCart.url, JSON.stringify(cart_prop))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public ChangeCartDelivery(data: DTOItemCart2) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ChangeCartDelivery.method,
				that.config.getAPIList().ChangeCartDelivery.url, JSON.stringify(data))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	// public GetPrepaidCart(orderID: number) {
	// 	const param = {
	// 		"OrderID": orderID
	// 	}

	// 	let that = this;
	// 	return new Observable<DTOResponse>(obs => {
	// 		that.api.connect(that.config.getAPIList().GetPrepaidCart.method,
	// 			that.config.getAPIList().GetPrepaidCart.url, JSON.stringify(param))
	// 			.subscribe((res: any) => {
	// 				obs.next(res);
	// 				obs.complete();
	// 			}, errors => {
	// 				obs.error(errors);
	// 				obs.complete();
	// 			})
	// 	});
	// }
	public CheckProductStock(item: DTOItemCart2) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().CheckProductStock.method,
				that.config.getAPIList().CheckProductStock.url, JSON.stringify(item))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public AddCart(prod: DTOItemCart2) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().AddCart.method,
				that.config.getAPIList().AddCart.url, JSON.stringify(prod))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public DeleteCartDetail(item: DTOItemCart2) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteCartDetail.method,
				that.config.getAPIList().DeleteCartDetail.url, JSON.stringify(item))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public AddCoupon(item: DTOCoupon_Cart_CartCoupon) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().AddCoupon.method,
				that.config.getAPIList().AddCoupon.url, JSON.stringify(item))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public DeleteCoupon(item: DTOCoupon_Cart_CartCoupon) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteCoupon.method,
				that.config.getAPIList().DeleteCoupon.url, JSON.stringify(item))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	//API PAYMENT
	public GetPayments() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetPayments.method,
				that.config.getAPIList().GetPayments.url, null)
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public PaymentCart(pay: DTOPaymentCart) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().PaymentCart.method,
				that.config.getAPIList().PaymentCart.url, JSON.stringify(pay))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	//#region API GIFT
	// public GetCartGifts() {
	// 	let that = this;
	// 	return new Observable<DTOResponse>(obs => {
	// 		that.api.connect(that.config.getAPIList().GetCartGifts.method,
	// 			that.config.getAPIList().GetCartGifts.url, null)
	// 			.subscribe((res: any) => {
	// 				obs.next(res);
	// 				obs.complete();
	// 			}, errors => {
	// 				obs.error(errors);
	// 				obs.complete();
	// 			})
	// 	});
	// }
	public GetOrderGifts(CartID: number) {
		const id = { "CartID": CartID }

		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetOrderGifts.method,
				that.config.getAPIList().GetOrderGifts.url, JSON.stringify(id))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public UpdateCartGift(CartID: number, giftList: DTOItemCart_Gift2[]) {
		const param = {
			"CartID": CartID,
			"GiftItems": giftList
		}

		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCartGift.method,
				that.config.getAPIList().UpdateCartGift.url, JSON.stringify(param))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	//#endregion
	//#region địa chỉ giỏ hàng
	// public getProvince() {
	// 	let that = this;
	// 	return new Observable<any>(obs => {
	// 		that.api.connect(that.config.getAPIList().GetProvince.method,
	// 			that.config.getAPIList().GetProvince.url, null)
	// 			.subscribe((res: any) => {
	// 				obs.next(res);
	// 				obs.complete();
	// 			}, errors => {
	// 				obs.error(errors);
	// 				obs.complete();
	// 			})
	// 	});
	// }
	// public getDistrict() {
	// 	let that = this;
	// 	return new Observable<any>(obs => {
	// 		that.api.connect(that.config.getAPIList().GetDistrict.method,
	// 			that.config.getAPIList().GetDistrict.url, null)
	// 			.subscribe((res: any) => {
	// 				obs.next(res);
	// 				obs.complete();
	// 			}, errors => {
	// 				obs.error(errors);
	// 				obs.complete();
	// 			})
	// 	});
	// }
	// public getWard() {
	// 	let that = this;
	// 	return new Observable<any>(obs => {
	// 		that.api.connect(that.config.getAPIList().GetWard.method,
	// 			that.config.getAPIList().GetWard.url, null)
	// 			.subscribe((res: any) => {
	// 				obs.next(res);
	// 				obs.complete();
	// 			}, errors => {
	// 				obs.error(errors);
	// 				obs.complete();
	// 			})
	// 	});
	// }
	public GetProvinces() {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetProvinces.method,
				that.config.getAPIList().GetProvinces.url, null)
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public GetDistricts(provinceID: number) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetDistricts.method,
				that.config.getAPIList().GetDistricts.url, JSON.stringify({ ProvinceID: provinceID }))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public GetWards(districtID: number) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetWards.method,
				that.config.getAPIList().GetWards.url, JSON.stringify({ DistrictID: districtID }))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	//#endregion	
	//#region delivery
	public GetAllDelivery(): Observable<DTOResponse> {
		// return this.common.getData<DTOResponse>(this._apiConfig.getAPIList().ProfileGetAllDelivery, null);
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ProfileGetAllDelivery.method,
				that.config.getAPIList().ProfileGetAllDelivery.url, null)
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public RemoveDelivery(id: number): Observable<DTOResponse> {
		// return this.common.Post_GetData<DTOResponse>(this._apiConfig.getAPIList().ProfileRemoveDelivery, { ID: id });
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ProfileRemoveDelivery.method,
				that.config.getAPIList().ProfileRemoveDelivery.url, JSON.stringify({ ID: id }))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public UpdateDelivery(deli: DeliveryDTO): Observable<DTOResponse> {
		// return this.common.Post_GetData<DTOResponse>(this._apiConfig.getAPIList().ProfileUpdateDelivery, deli);
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ProfileUpdateDelivery.method,
				that.config.getAPIList().ProfileUpdateDelivery.url, JSON.stringify(deli))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public GetDelivery(id: number): Observable<DTOResponse> {
		// return this.common.Post_GetData<DTOResponse>(this._apiConfig.getAPIList().ProfileGetDelivery, { ID: id });
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ProfileGetDelivery.method,
				that.config.getAPIList().ProfileGetDelivery.url, JSON.stringify({ ID: id }))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	//#endregion
	public GetListProduct(req: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListProduct.method,
				that.config.getAPIList().GetListProduct.url, JSON.stringify(toDataSourceRequest(req)))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	public GetProductByBarcode(barcode: string) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetProductByBarcode.method,
				that.config.getAPIList().GetProductByBarcode.url, JSON.stringify(barcode))
				.subscribe((res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				})
		});
	}
	//Syn Gen Cart
	GetListGenOrder(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListGenOrder.method,
				that.config.getAPIList().GetListGenOrder.url,
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
	DeleteGenOrder(cart: DTOSynCart) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteGenOrder.method,
				that.config.getAPIList().DeleteGenOrder.url,
				JSON.stringify(cart)).subscribe(
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
	// public GetCardByPhone(cellPhone: string) {
	// 	const cPhone = { "CellPhone": cellPhone }
	// 	// return this.common.Post_GetData<BackendDTO>(this._apiConfig.getAPIList().GetCardByPhone, cPhone);
	// 	let that = this;
	// 	return new Observable<DTOResponse>(obs => {
	// 		that.api.connect(that.config.getAPIList().GetCardByPhone.method,
	// 			that.config.getAPIList().GetCardByPhone.url,
	// 			JSON.stringify(cPhone)).subscribe(
	// 				(res: any) => {
	// 					obs.next(res);
	// 					obs.complete();
	// 				}, errors => {
	// 					obs.error(errors);
	// 					obs.complete();
	// 				}
	// 			)
	// 	});
	// }
	public GetCardByStaff(cellPhone: string) {
		const cPhone = { "CellPhone": cellPhone }
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetCardByStaff.method,
				that.config.getAPIList().GetCardByStaff.url,
				JSON.stringify(cPhone)).subscribe(
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
	AssignCartStaff(staffID: number) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().AssignCartStaff.method,
				that.config.getAPIList().AssignCartStaff.url, JSON.stringify({ OldStaffID: DTOConfig.Authen.userinfo?.staffID, NewStaffID: staffID })).subscribe(
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
	SynOrder(orderNo: string) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().SynOrder.method,
				that.config.getAPIList().SynOrder.url, JSON.stringify(orderNo)).subscribe(
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
	public getuserbyphone(cellPhone: string) {
		const cPhone = { "PhoneNumber": cellPhone }
		// return this.common.Post_GetData<BackendDTO>(this._apiConfig.getAPIList().GetCardByPhone, cPhone);
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().getuserbyphone.method,
				that.config.getAPIList().getuserbyphone.url,
				JSON.stringify(cPhone)).subscribe(
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
