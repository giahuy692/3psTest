import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EcomService } from '../../shared/services/ecom.service';
import { EcomAPIService } from '../../shared/services/ecom-api.service';
import { DTOConfig, Ps_AuthService, Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { EcomSynCartAPIService } from '../../shared/services/ecom-syncart-api.service';
import DTOItemCart2, { CardHistoryDTO, DeliveryDTO, DistrictDTO, DTOBank, DTOCartCombo, DTOItemCartGifts, DTOItemCart_Coupon2, DTOItemCart_Gift2, DTOItemCart_Model2, DTOPayment, DTOPaymentCart, DTOTypeOfTransportation, ProvinceDTO, UserNotiDTO, WardDTO } from '../../shared/dto/DTOHachiCart';
import { EcomAppCartAPIService } from '../../shared/services/ecom-appcart-api.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DTOProduct } from 'src/app/p-app/p-layout/dto/DTOProduct.dto';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import * as $ from 'jquery'

@Component({
  selector: 'app-ecom010-cart-generate-detail',
  templateUrl: './ecom010-cart-generate-detail.component.html',
  styleUrls: ['./ecom010-cart-generate-detail.component.scss']
})
export class Ecom010CartGenerateDetailComponent implements OnInit, OnDestroy {
  //#region array
  cartNoti: UserNotiDTO[] = []
  PaymentList: DTOPayment[] = []
  deliveryList: DTOTypeOfTransportation[] = []
  deliveryItem = new DTOTypeOfTransportation()

  ListCartDetailState: DTOItemCart2[] = []
  cart24h: DTOItemCart2[] = []
  cartStandard: DTOItemCart2[] = []

  CartCombo: DTOCartCombo[] = []

  CouponState34: DTOItemCart_Coupon2[] = []
  CouponState5: DTOItemCart_Coupon2[] = []
  CouponListState: DTOItemCart_Coupon2[] = []//lst
  CouponListSelectedState: DTOItemCart_Coupon2[] = []

  // lstDeliveryState: DeliveryDTO[] = []
  // <!-- {Ps_UtilObjectService.hasListValue(lstDeliveryState) &&
  //   lstDeliveryState.sort((a, b) =>  return Number(b.IsDefault) - Number(a.IsDefault) })
  //       .map((item: DeliveryDTO, index: number) => {              return  -->
  lstProvinceState: ProvinceDTO[] = []
  lstDistrictState: DistrictDTO[] = []
  lstWardState: WardDTO[] = []

  GiftList: DTOItemCartGifts[] = []

  subArr: Subscription[] = []
  //#endregion
  //#region object
  PaymentCartState = new DTOPaymentCart()
  PaymentState = new DTOPayment()
  BankState = new DTOBank()

  CartDetailState = new DTOItemCart2()
  CartState = new DTOItemCart2()
  CartGift = new DTOItemCartGifts()

  CouponState = new DTOItemCart_Coupon2()

  // DeliveryState = new DeliveryDTO()
  curProvince = new ProvinceDTO()
  curDistrict = new DistrictDTO()
  curWard = new WardDTO()

  defProvince = new ProvinceDTO(-1, '--Chọn Tỉnh / Thành--')
  defDistrict = new DistrictDTO(-1, '--Chọn Quận / Huyện--')
  defWard = new WardDTO(-1, '--Chọn Phường / Xã--')

  CardState = new CardHistoryDTO()
  //#endregion
  //#region bool
  IsLoading = false
  isAdd = true
  isPayment = true

  isPopupCartCoupon = false
  isPopupDeleteCartCoupon = false
  showInvoice = false
  showCouponCondition = false

  isPopupDeleteDetail = false

  isShowAddressFormState = false
  IsDeleteAddressPopup = false
  //#endregion
  step = 3
  errCartCoupon = ''
  intervalRefresh

  onDataChangeCB: Function
  //#region form
  cartCouponForm: UntypedFormGroup = new UntypedFormGroup({
    'CouponCode': new UntypedFormControl(''),
  })
  invoiceForm: UntypedFormGroup
  addressForm: UntypedFormGroup
  //#endregion

  constructor(
    public service: EcomService,
    public layoutService: LayoutService,
    public apiService: EcomAPIService,
    public apiSynService: EcomSynCartAPIService,
    public APP_Cart: EcomAppCartAPIService,
    public APP_AuthService: Ps_AuthService,
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    // this.p_changeCart()
    // this.p_changeDetails()
    // this.p_changeCoupon()
    // this.p_changeTypeOfTransportation()

    // this.p_changeNoti()
    // this.p_changeGift()
    // this.p_changeCombo()
    // this.p_changePayment()

    let changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.p_changeCart()
        this.p_changeDetails()
        this.p_changeCoupon()
        this.p_changeTypeOfTransportation()

        this.p_changeNoti()
        this.p_changeGift()
        this.p_changeCombo()
        this.p_changePayment()
        this.APP_Cart.p_GetPayments()

        var a = this.APP_AuthService.getCacheUserInfo().subscribe((res) => {
          DTOConfig.Authen.userinfo = res
          this.p_getCachePayment()
        });
        this.subArr.push(a)
      }
    })

    this.onDataChangeCB = this.onDataChange.bind(this)
    // this.APP_Cart.p_GetPayments()

    // this.APP_AuthService.getUserInfo(DTOConfig.Authen.token).subscribe(res => {
    //   if (Ps_UtilObjectService.hasValue(res)) {
    //     DTOConfig.Authen.userinfo = res

    // let a = this.APP_AuthService.getCacheUserInfo().subscribe((res) => {
    //   DTOConfig.Authen.userinfo = res
    //   this.p_getCachePayment()
    // });


    //   }
    //   else
    //     this.layoutService.onError(`Không tìm thấy thông tin tài khoản người dùng hiện tại. Vui lòng đăng nhập lại`)
    // }, e => {
    //   this.layoutService.onError(`Không tìm thấy thông tin tài khoản người dùng hiện tại. Vui lòng đăng nhập lại`)
    // })
    this.subArr.push(changePermissonAPI)

    this.loadAddressForm()
    this.loadInvoiceForm()
  }

  ngOnDestroy() {
    this.subArr.forEach(e => {
      e?.unsubscribe()
    });

    this.PaymentCartState = new DTOPaymentCart()
    this.APP_Cart.p_setCachePayment(this.PaymentCartState)
    this.APP_Cart.p_deleteCachePayment()
  }
  //#region API
  loadCart(callAPI = true) {
    this.APP_Cart.loadCurrentCart(callAPI)
  }
  loadInvoiceForm() {
    this.invoiceForm = new UntypedFormGroup({
      'VATCompany': new UntypedFormControl(this.CartState.VATCompany, this.CartState.IsVAT ? Validators.required : []),
      'VATCode': new UntypedFormControl(this.CartState.VATCode, this.CartState.IsVAT ? Validators.required : []),
      'VATAddress': new UntypedFormControl(this.CartState.VATAddress, this.CartState.IsVAT ? Validators.required : []),
      'VATEmail': new UntypedFormControl(this.CartState.VATEmail, this.CartState.IsVAT ? [Validators.required, Validators.email] : []),
    })
  }
  loadAddressForm() {
    if (this.CartState.Province > 0 && Ps_UtilObjectService.hasListValue(this.lstProvinceState))
      this.curProvince = this.lstProvinceState.find(s => s.Code == this.CartState.Province) ?? new ProvinceDTO()
    if (this.CartState.District > 0 && Ps_UtilObjectService.hasListValue(this.lstDistrictState))
      this.curDistrict = this.lstDistrictState.find(s => s.Code == this.CartState.District) ?? new DistrictDTO()
    if (this.CartState.Ward > 0 && Ps_UtilObjectService.hasListValue(this.lstWardState))
      this.curWard = this.lstWardState.find(s => s.Code == this.CartState.Ward) ?? new WardDTO()

    this.addressForm = new UntypedFormGroup({
      'OrderBy': new UntypedFormControl(this.CartState.OrderBy, Validators.required),
      'OrderPhone': new UntypedFormControl(this.CartState.OrderPhone, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      'OrderEmail': new UntypedFormControl(this.CartState.OrderEmail, Validators.email),
      'ReceivedBy': new UntypedFormControl(this.CartState.ReceivedBy, Validators.required),
      'Cellphone': new UntypedFormControl(this.CartState.Cellphone, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      'Province': new UntypedFormControl(this.curProvince.Code > 0 ? this.curProvince : this.defProvince, [Validators.required, this.checkFormAddress]),
      'District': new UntypedFormControl(this.curDistrict.Code > 0 ? this.curDistrict : this.defDistrict, [Validators.required, this.checkFormAddress]),
      'Ward': new UntypedFormControl(this.curWard.Code > 0 ? this.curWard : this.defWard, [Validators.required, this.checkFormAddress]),
      'Address': new UntypedFormControl(this.CartState.Address, [Validators.required, Validators.minLength(1)]),
    })
  }
  createNew() {
    //#region array
    this.cartNoti = []
    // this.PaymentList: DTOPayment[] = []

    this.ListCartDetailState = []
    this.cart24h = []
    this.cartStandard = []

    this.CartCombo = []

    this.CouponState34 = []
    this.CouponState5 = []
    // this.CouponListState: DTOItemCart_Coupon2[] = []//lst
    this.CouponListSelectedState = []
    //#endregion
    //#region object
    this.PaymentCartState = new DTOPaymentCart()
    this.PaymentState = new DTOPayment()
    this.BankState = new DTOBank()

    this.CartDetailState = new DTOItemCart2()
    this.CartState = new DTOItemCart2()
    this.CartGift = new DTOItemCartGifts()

    this.CouponState = new DTOItemCart_Coupon2()
    //#endregion
    //#region bool
    this.isAdd = true
    this.isPayment = true

    this.isPopupCartCoupon = false
    this.isPopupDeleteCartCoupon = false
    this.showInvoice = false
    this.showCouponCondition = false

    this.isPopupDeleteDetail = false
    //#endregion
    this.errCartCoupon = ''
  }
  //#endregion  
  //#region subscribe
  p_getCachePayment() {
    const p_getCachePayment_sst = this.APP_Cart.p_getCachePayment().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.PaymentCartState = res
        this.isAdd = !(this.PaymentCartState.Cart.Code > 0)
        this.APP_Cart.p_setCart(this.PaymentCartState.Cart)
        this.APP_Cart.p_setCartDetails(this.PaymentCartState.CartDetails)
      }
      if (this.isAdd) {
        // this.PaymentCartState = new DTOPaymentCart()
        // this.APP_Cart.p_setCachePayment(this.PaymentCartState)
        // this.loadCart(false)
        this.createNew()
      } else
        this.loadCart()
    })
    this.subArr.push(p_getCachePayment_sst)
  }
  p_changeCart() {
    const changeCart_sst = this.APP_Cart.changeCart().subscribe((res: DTOItemCart2) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.CartState = res
        this.checkCartPayment()

        if (!this.isAdd)
          this.runRefreshTimer()
      }
    });
    this.subArr.push(changeCart_sst)
  }
  p_changeDetails() {
    const changeDetails_sst = this.APP_Cart.changeDetails().subscribe((res: Array<DTOItemCart2>) => {
      if (Ps_UtilObjectService.hasListValue(res))
        this.ListCartDetailState = res
      else
        this.ListCartDetailState = []

      this.splitDeliveryType(this.ListCartDetailState)
    });
    this.subArr.push(changeDetails_sst)
  }
  p_changeNoti() {
    const changeNoti_sst = this.APP_Cart.changeNoti().subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res))
        this.cartNoti = res
    })
    this.subArr.push(changeNoti_sst)
  }
  p_changeGift() {
    const changeGift_sst = this.APP_Cart.changeGift().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res))
        this.CartGift = res
    })
    this.subArr.push(changeGift_sst)
  }
  p_changeCombo() {
    const changeCombo_sst = this.APP_Cart.changeCombo().subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res))
        this.CartCombo = res
    })
    this.subArr.push(changeCombo_sst)
  }
  p_changeCoupon() {
    const changeCoupon_sst = this.APP_Cart.changeCoupon().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.CouponListSelectedState = res
        this.splitCouponType(res)
      }
      this.checkCoupon()
    })
    this.subArr.push(changeCoupon_sst)

    const changeListCoupon_sst = this.APP_Cart.changeListCoupon().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.CouponListState = res
      }
      this.checkCoupon()
    })
    this.subArr.push(changeListCoupon_sst)
  }
  p_changePayment() {
    const changePayment_sst = this.APP_Cart.changePayment().subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res)) {
        this.PaymentList = res
        this.checkCartPayment()
      }
    })
    this.subArr.push(changePayment_sst)
  }
  p_changeTypeOfTransportation() {
    const changeTypeOfTransportation_sst = this.APP_Cart.changeTypeOfTransportation().subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res)) {
        this.deliveryList = [...res]

        if (res.length == 1)
          this.deliveryItem = { ...res[0] }
        else {
          this.deliveryItem = { ...res[this.CartState.IsHachi24 ? 1 : 0] }
        }
      }
    })
    this.subArr.push(changeTypeOfTransportation_sst)
  }
  //#endregion
  //cart detail
  popupAddCart(data: DTOProduct) {
    var item = new DTOItemCart2()
    Ps_UtilObjectService.copyPropertyForce(data, item)
    item.OrderQuantity = 1
    item.CartID = this.CartState.Code
    //tạo cart rồi mới addCart
    if (this.isAdd)
      this.APP_Cart.p_GetCurrentCart(this.PaymentCartState).subscribe(s => {
        this.onDataChange(item, -1)
      })
    else
      this.onDataChange(item, -1)
  }
  onDataChange = (data: DTOItemCart2, idex: number, isIncrease = true, callApi = true) => {
    this.isAdd = false
    data.CartID = this.CartState.Code
    data.StaffID = DTOConfig.Authen.userinfo?.staffID
    var ctx = 'Cập nhật sản phẩm'

    if (callApi) {
      var AddCartBuyAgain_sst = this.APP_Cart.AddCartBuyAgain(data, isIncrease, false).subscribe(
        res => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(`${ctx} thành công`)
            this.service.setSearchProductDialog(false)
            this.loadCart()
          }
          else
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        }, e => {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
        }
      )
      this.subArr.push(AddCartBuyAgain_sst)
    }
    else {
      var newList = [...this.ListCartDetailState]
      // newList.splice(idex, 1, data)//step 1 cũ
      var i = newList.findIndex(s => s.Code == data.Code)
      newList.splice(i, 1, data)//step 1 + 3
      this.APP_Cart.p_setCartDetails(newList)

      if (!this.APP_AuthService.isLogin()) {
        var pay = { ...this.PaymentCartState }
        pay.CartDetails = [...newList]
        this.APP_Cart.p_setCachePayment(pay)
      }
    }
  }

  onDeleteCartDetail(data: DTOItemCart2) {
    this.CartDetailState = data
    this.isPopupDeleteDetail = true
  }

  DeleteCartDetail() {
    this.isPopupDeleteDetail = false
    var ctx = 'Xóa sản phẩm'
    var p_DeleteCartDetail_sst = this.APP_Cart.p_DeleteCartDetail(this.CartDetailState).subscribe(res => {
      this.loadCart()
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0)
        this.layoutService.onSuccess(`${ctx} thành công`)
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
    })
    this.subArr.push(p_DeleteCartDetail_sst)
  }
  //cart coupon
  splitCouponType = (list: DTOItemCart_Coupon2[]) => {
    const arr34: DTOItemCart_Coupon2[] = []
    const arr5: DTOItemCart_Coupon2[] = []

    list.map(s => {
      if (s.TypeData == 5)
        arr5.push(s)
      else if (s.TypeData == 3 || s.TypeData == 4) {
        arr34.push(s)
      }
    })

    if (Ps_UtilObjectService.hasValue(arr34))
      this.CouponState34 = arr34
    if (Ps_UtilObjectService.hasValue(arr5))
      this.CouponState5 = arr5
  }

  checkCoupon() {
    this.CouponListState.forEach(f => {
      return f.IsChoose = this.CouponListSelectedState.findIndex(s => s.CouponID == f.CouponID) > -1
    })
  }

  toggleCondition(show) {
    this.showCouponCondition = show
  }

  toggleCartCoupon() {
    if (!this.isPopupCartCoupon)
      this.errCartCoupon = null

    this.isPopupCartCoupon = !this.isPopupCartCoupon
  }

  submitCartCoupon(e) {
    var data = this.cartCouponForm.getRawValue()
    const params: DTOItemCart_Coupon2 = { ...data }
    this.CouponHandler(params, true)
  }

  applyCartCoupon(data: DTOItemCart_Coupon2, IsChoose) {
    const newitem: DTOItemCart_Coupon2 = { ...data };
    newitem.IsChoose = IsChoose;

    if (newitem.IsChoose)
      this.AddCartCoupon(newitem)
    else
      this.onDeleteCartCoupon(newitem)
  }

  CouponHandler = (data: DTOItemCart_Coupon2, IsAdd: boolean) => {
    this.errCartCoupon = null

    if (IsAdd) {
      const newitem: DTOItemCart_Coupon2 = { ...data };
      newitem.CartID = this.CartState.Code
      this.AddCartCoupon(newitem)
    }
    else {
      const newitem: DTOItemCart_Coupon2 = this.CouponListSelectedState.find(s => s.CouponID == data.CouponID)
      newitem.CartID = this.CartState.Code
      this.DeleteCartCoupon(newitem)
    }
  }

  AddCartCoupon = (coupon: DTOItemCart_Coupon2) => {
    coupon.ProductID = null
    var ctx = 'Áp dụng Coupon'

    if (!this.IsLoading) {
      this.IsLoading = true

      const p_AddCoupon_sst = this.APP_Cart.p_AddCoupon(coupon).subscribe(res => {
        this.IsLoading = false

        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)

          const newRes: DTOItemCart_Coupon2 = { ...res.ObjectReturn }
          newRes.IsChoose = true
          const newCouponList = [...this.CouponListState]
          //nếu coupon không tồn tại trong list coupon thì add vào
          const couponIndex = newCouponList.findIndex(s => s.CouponCode == newRes.CouponCode)

          if (couponIndex == -1) {
            newCouponList.splice(0, 0, newRes)
            this.CouponListState = newCouponList
          }

          if (newRes.TypeData == 5) {
            const newArr: DTOItemCart_Coupon2[] = [...this.CouponState5]
            newArr.push(newRes)
            this.CouponState5 = newArr
          } else if (newRes.TypeData == 3 || newRes.TypeData == 4) {
            const newArr: DTOItemCart_Coupon2[] = [...this.CouponState34]
            newArr.push(newRes)
            this.CouponState34 = newArr
          }
          this.cartCouponForm.reset({ CouponCode: "" });
          this.loadCart()
          this.errCartCoupon = null
        } else {
          this.errCartCoupon = res.ErrorString
          this.layoutService.onSuccess(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        }
      }, e => {
        this.IsLoading = false
        this.layoutService.onSuccess(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      })
      this.subArr.push(p_AddCoupon_sst)
    }
  }

  onDeleteCartCoupon(item) {
    this.CouponState = item
    this.isPopupDeleteCartCoupon = true
  }

  DeleteCartCoupon(coupon: DTOItemCart_Coupon2) {
    this.isPopupDeleteCartCoupon = false
    var ctx = 'Hủy Coupon'
    const p_DeleteCoupon_sst = this.APP_Cart.p_DeleteCoupon(coupon).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        coupon.IsChoose = false
        //nếu coupon tồn tại trong list coupon thì bỏ choose
        const newCouponList = [...this.CouponListState]
        const couponIndex = newCouponList.findIndex(s => s.CouponCode == coupon.CouponCode)

        if (couponIndex > -1) {
          newCouponList.splice(couponIndex, 1, coupon)
          this.CouponListState = newCouponList
        }
        //nếu coupon tồn tại trong list selected coupon thì bỏ 
        const newCouponListSec = [...this.CouponListSelectedState]
        const couponIndexSec = newCouponListSec.findIndex(s => s.CouponCode == coupon.CouponCode)

        if (couponIndexSec > -1) {
          newCouponListSec.splice(couponIndexSec, 1)
          this.CouponListSelectedState = newCouponListSec
        }

        if (coupon.TypeData == 5) {
          const newArr = [...this.CouponState5]
          newArr.splice(newArr.findIndex(s => s.ID == coupon.ID), 1)
          this.CouponState5 = newArr
        } else if (coupon.TypeData == 3 || coupon.TypeData == 4) {
          const newArr = [...this.CouponState34]
          newArr.splice(newArr.findIndex(s => s.ID == coupon.ID), 1)
          this.CouponState34 = newArr
        }
        this.loadCart()
        this.errCartCoupon = null
      } else {
        this.errCartCoupon = res.ErrorString
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
    })
    this.subArr.push(p_DeleteCoupon_sst)
  }
  //combo
  AddCartCombo(item) {//AddCart //AddCartCombo
    const prod: DTOItemCart2 = { ...item }
    prod.OrderQuantity = 1
    prod.ProductID = item.ID
    prod.StaffID = DTOConfig.Authen.userinfo?.staffID
    var ctx = 'Thêm Combo'

    const AddCartBuyAgain_sst = this.APP_Cart.AddCartBuyAgain(prod).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0)
        this.layoutService.onSuccess(`${ctx} thành công`)
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
    })
    this.subArr.push(AddCartBuyAgain_sst)
  }

  //address
  // loadAllDelivery = () => {
  //   const GetAllDelivery_sst = this.APP_Cart.GetAllDelivery().subscribe(res => {
  //     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
  //       this.lstDeliveryState = res.ObjectReturn
  //     } else {
  //       this.lstDeliveryState = []
  //       this.createNewAddress()
  //     }
  //   })
  //   this.subArr.push(GetAllDelivery_sst)
  // }
  // GetDelivery = (id: number) => {
  //   const GetDelivery_sst = this.APP_Cart.GetDelivery(id).subscribe(res => {
  //     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
  //       // setCartState(res.ObjectReturn)
  //       this.DeliveryState = res.ObjectReturn
  //     }
  //   });
  //   this.subArr.push(GetDelivery_sst)
  // }

  loadProvince = (loadAddress = false) => {
    const GetProvinces_sst = this.APP_Cart.GetProvinces().subscribe(res => {
      // const arr: Array<{ value: number, label: string }> = [];
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        // res.ObjectReturn.forEach((_item: ProvinceDTO) => {
        //   arr.push({ value: _item.Code, label: _item.ProvinceName })
        // })
        this.lstProvinceState = res.ObjectReturn

        if (this.CartState.Province > 0) {
          this.curProvince = this.lstProvinceState.find(s => s.Code == this.CartState.Province) ?? new ProvinceDTO()
          this.lstDistrictState = []
          this.loadDistrict(this.CartState.Province, loadAddress)
        }
        else if (loadAddress)
          this.loadAddressForm()
      }
      // setLstProvinceState(arr);
    })
    this.subArr.push(GetProvinces_sst)
  };

  loadDistrict = (IDProvince, loadAddress = false) => {
    if (IDProvince > 0) {
      const GetDistricts_sst = this.APP_Cart.GetDistricts(IDProvince).subscribe(res => {
        // const arr: Array<{ value: number, label: string }> = [];
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
          // res.ObjectReturn.forEach((_item: DistrictDTO) => {
          //   arr.push({ value: _item.Code, label: _item.DistrictName })
          // })
          this.lstDistrictState = res.ObjectReturn

          if (this.CartState.District > 0) {
            this.curDistrict = this.lstDistrictState.find(s => s.Code == this.CartState.District) ?? new DistrictDTO()
            this.lstWardState = []
            this.loadWard(this.CartState.District, loadAddress)
          }
          else if (loadAddress)
            this.loadAddressForm()
        }
        // setLstDistrictState(arr);
        this.subArr.push(GetDistricts_sst)
      });
    }
    else {
      // setLstDistrictState([]);
      this.lstDistrictState = []
    }
  };
  loadWard = (idDistrict, loadAddress) => {
    if (idDistrict > 0) {
      const GetWards_sst = this.APP_Cart.GetWards(idDistrict).subscribe(res => {
        // const arr: Array<{ value: number, label: string }> = [];
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
          // res.ObjectReturn.forEach((_item: WardDTO) => {
          //   arr.push({ value: _item.Code, label: _item.WardName })
          // })
          this.lstWardState = res.ObjectReturn
          this.curWard = this.lstWardState.find(s => s.Code == this.CartState.Ward) ?? new WardDTO()

          if (loadAddress)
            this.loadAddressForm()
        }
        // setLstWardState(arr);
        this.subArr.push(GetWards_sst)
      })
    }
    else {
      // setLstWardState([]);
      this.lstWardState = []
    }
  };

  thayDoiDiaChi() {
    this.step = 2
    this.CartState.Step = 2
    this.loadProvince(true)

    if (Ps_UtilObjectService.hasValueString(this.CartState.OrderPhone))
      this.GetCardByStaff(this.CartState.OrderPhone)
    // if (!Ps_UtilObjectService.hasListValue(this.lstDeliveryState))
    //   this.loadAllDelivery()
  }
  createNewAddress() {
    if (!this.isShowAddressFormState) {
      // this.DeliveryState = new DeliveryDTO()
      this.isShowAddressFormState = true
    }
    else {
      //đang cập nhật or tạo mới ko xử lý
      return;
    }
  }
  onClickEditAddress(item: DeliveryDTO) {
    if (!this.isShowAddressFormState) {
      // this.DeliveryState = { ...item }
      this.isShowAddressFormState = true
    }
    else {
      //đang cập nhật or tạo mới ko xử lý
      return;
    }
  }

  // onChonMacDinh(item: DeliveryDTO) {
  //   if (!item.IsDefault) {
  //     item.IsDefault = true;

  //     const UpdateDelivery_sst = this.APP_Cart.UpdateDelivery(item).subscribe(res => {
  //       if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
  //         const devList = [...this.lstDeliveryState]

  //         devList.map(s => {
  //           s.IsDefault = s.ID == item.ID
  //           return s
  //         })
  //         this.lstDeliveryState = devList
  //       }
  //     })
  //     this.subArr.push(UpdateDelivery_sst)
  //   }
  // }
  // onChangeItem = (item: DeliveryDTO, redirect = false) => {
  //   if (redirect)
  //     this.onClickGiaoDenDiaChi(item)
  //   else {
  //     this.DeliveryState = new DeliveryDTO()
  //     this.isShowAddressFormState = false
  //   }
  // }
  onDropdownlistClick(e, prop) {
    if (prop == 'Province') {
      this.curProvince = e
      this.curDistrict = new DistrictDTO()
      this.curWard = new WardDTO()
      this.CartState.Province = this.curProvince.Code
      this.CartState.District = null
      this.CartState.Ward = null
      this.loadDistrict(this.curProvince.Code, true)
    }
    else if (prop == 'District') {
      this.curDistrict = e
      this.curWard = new WardDTO()
      this.CartState.District = this.curDistrict.Code
      this.CartState.Ward = null
      this.loadWard(this.curDistrict.Code, true)
    }
    else if (prop == 'Ward') {
      this.curWard = e
      this.CartState.Ward = this.curWard.Code
      this.loadAddressForm()
    }
  }

  // onDeleteAddress(item: DeliveryDTO) {
  //   if (!item.IsDefault) {
  //     this.DeliveryState = { ...item }
  //     this.IsDeleteAddressPopup = true
  //   }
  // }
  // RemoveDelivery() {
  //   var ctx = 'Xóa địa chỉ'
  //   if (Ps_UtilObjectService.hasValue(this.DeliveryState) && Ps_UtilObjectService.hasValue(this.DeliveryState.ID)
  //     && this.DeliveryState.ID > 0) {
  //     this.IsLoading = true

  //     const RemoveDelivery_sst = this.APP_Cart.RemoveDelivery(this.DeliveryState.ID).subscribe(res => {
  //       if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
  //         // setPopupError("")
  //         this.layoutService.onSuccess(`${ctx} thành công`)
  //         this.IsLoading = false
  //         // handleClose(true)
  //         this.IsDeleteAddressPopup = false
  //       } else
  //         // setPopupError("Địa chỉ giao hàng không tồn tại. " + res.StatusCode)
  //         this.layoutService.onError("Địa chỉ giao hàng không tồn tại. " + res.StatusCode)
  //     }, err => {
  //       this.IsLoading = false
  //       // setPopupError("Đã xảy ra lỗi trong quá trình Xóa địa chỉ giao hàng.")
  //       this.layoutService.onError("Đã xảy ra lỗi trong quá trình Xóa địa chỉ giao hàng")
  //     });

  //     this.subArr.push(RemoveDelivery_sst)
  //   }
  // }

  onClickGiaoDenDiaChi(item: DeliveryDTO) {
    this.CartState.Cellphone = item.Cellphone
    this.CartState.Address = item.Address
    this.CartState.ReceivedBy = item.ReceivedBy
    this.CartState.UserID = item.UserID
    this.CartState.DeliveryID = item.ID
    this.CartState.Province = item.Province
    this.CartState.District = item.District
    this.CartState.Ward = item.Ward

    var ctx = 'Cập nhật địa chỉ'
    const UpdateCart_sst = this.APP_Cart.UpdateCart(this.CartState, [
      "Cellphone", "Address", "Province", "District", "Ward", "DeliveryID", "ReceivedBy"
    ]).subscribe(res => {
      if (res.StatusCode == 0) {
        this.step = 3
        this.CartState.Step = 3
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else
        this.layoutService.onError(`${ctx} thất bại. ${res.ErrorString}`)
    })
    this.subArr.push(UpdateCart_sst)
  }
  // handleSubmitAddress() {
  //   var data: DeliveryDTO = this.addressForm.getRawValue()

  //   if (Ps_UtilObjectService.hasValue(this.DeliveryState.ID)) {
  //     data.ID = this.DeliveryState.ID;

  //     const UpdateDelivery_sst = this.APP_Cart.UpdateDelivery(data).subscribe(res => {
  //       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0)
  //         this.onChangeItem(res.ObjectReturn, true);
  //     })
  //     this.subArr.push(UpdateDelivery_sst)
  //   } else {
  //     data.ID = 0

  //     const UpdateDelivery_sst = this.APP_Cart.UpdateDelivery(data).subscribe(res => {
  //       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0)
  //         this.onChangeItem(res.ObjectReturn, true);
  //     })
  //     this.subArr.push(UpdateDelivery_sst)
  //   }
  // }
  handleSubmitAddress() {
    this.addressForm.markAllAsTouched()

    if (this.addressForm.valid) {
      var data: DTOItemCart2 = this.addressForm.getRawValue()
      const newCart = { ...this.CartState }
      newCart.ReceivedBy = data.ReceivedBy
      newCart.Cellphone = data.Cellphone
      newCart.OrderBy = data.OrderBy
      newCart.OrderPhone = data.OrderPhone
      newCart.Address = data.Address
      newCart.StatusID = 3
      this.CartState = newCart

      const newPay = { ...this.PaymentCartState }
      newPay.Cart = newCart
      this.APP_Cart.p_setCachePayment(newPay)

      const p_GetCurrentCart_sst = this.APP_Cart.p_GetCurrentCart(newPay).subscribe(res => {
        this.layoutService.onSuccess('Cập nhật địa chỉ thành công')
        this.step = 3
        this.CartState.Step = 3
      }, e => {
        this.layoutService.onError('Cập nhật địa chỉ thất bại')
      })
      this.subArr.push(p_GetCurrentCart_sst)
    }
    else {
      this.layoutService.onError('Vui lòng điền vào trường bị thiếu')
    }
  }
  //payment
  checkCartPayment() {
    if (Ps_UtilObjectService.hasListValue(this.PaymentList) && this.CartState.PaymentID > 0)
      this.PaymentState = this.PaymentList.find(s => s.ID == this.CartState.PaymentID)
  }
  submitThanhToan() {
    if (this.CartState.IsVAT) {
      this.invoiceForm.markAllAsTouched()

      if (this.invoiceForm.invalid)
        this.layoutService.onError('Vui lòng điền vào Hóa đơn')
      else {
        var data = this.invoiceForm.getRawValue()

        this.CartState.IsVAT = true
        this.CartState.VATCode = data.VATCode ? data.VATCode : this.CartState.VATCode
        this.CartState.VATCompany = data.VATCompany ? data.VATCompany : this.CartState.VATCompany
        this.CartState.VATAddress = data.VATAddress ? data.VATAddress : this.CartState.VATAddress
        this.CartState.VATEmail = data.VATEmail ? data.VATEmail : this.CartState.VATEmail

        // console.log(this.CartState)
      }
    }

    if (!(this.CartState.Province > 0) || !(this.CartState.District > 0) || !(this.CartState.Ward > 0)
      || !Ps_UtilObjectService.hasValueString(this.CartState.Address)) {
      this.layoutService.onError('Vui lòng nhập địa chỉ')
      this.thayDoiDiaChi()
    }

    if (!(this.PaymentState.ID > 0))
      this.layoutService.onError('Vui lòng chọn Hình thức thanh toán')
    // else if ((this.PaymentState.ID == 2 || this.PaymentState.ID == 5) && !(this.BankState.ID > 0))
    //   this.layoutService.onError('Vui lòng chọn Ngân hàng thanh toán')

    // this.layoutService.onInfo('Đang kiểm tra thông tin...')
    if ((this.CartState.TotalAmount - this.CartState.PolicyMembership) <= 0) {//nếu giá trị mua hàng = 0
      // window.location.href = DTOConfig.appInfo.urlCart
      this.layoutService.onError('Vui lòng thêm sản phẩm vào giỏ hàng')
    } else {
      const paymentCart = new DTOPaymentCart()
      this.CartState.PaymentID = this.PaymentState ? this.PaymentState.ID : null
      this.CartState.BankID = this.BankState ? this.BankState.ID : null

      paymentCart.Cart = this.CartState
      paymentCart.CartDetails = this.ListCartDetailState
      paymentCart.CartCoupon = this.CouponListSelectedState

      // console.log(paymentCart.Cart)
      const PaymentCart_sst = this.APP_Cart.PaymentCart(paymentCart).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValueString(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess('Thanh toán thành công')

          // window.location.href = res.ObjectReturn
          // this.getCard(this.CartState.OrderPhone).subscribe(res => {
          //   this.CartState.UserID = Ps_UtilObjectService.hasValueString(res) ? res : this.CartState.OrderBy
          //   this.PaymentCartState.Cart = this.CartState
          //   this.APP_Cart.p_setCachePayment(this.PaymentCartState)
          //   this.loadCart()

          if ((String)(res.ObjectReturn).includes('gift') || (String)(res.ObjectReturn).includes('qua')) {
            this.getOrderGift()
            this.step = 4
            this.CartState.Step = 4
          }
          else
            this.openList()
          // })
        }
        else {
          // const payment = this.APP_Cart.newPayment(this.CartState)
          // this.APP_Cart.p_setCachePayment(payment)
          this.layoutService.onError("Đã xảy ra lỗi trong quá trình Đặt mua: " + res.ErrorString + ". Website sẽ chuyển hướng về Giỏ hàng của khách")
          // window.location.href = DTOConfig.appInfo.urlCart
          // window.location.reload()
          // this.loadCart()
        }
      }, e => {
        // const payment = this.APP_Cart.newPayment(this.CartState)
        // this.APP_Cart.p_setCachePayment(payment)
        this.layoutService.onError("Đã xảy ra lỗi trong quá trình Đặt mua: " + e + ". Website sẽ chuyển hướng về Giỏ hàng của khách")
        // window.location.href = DTOConfig.appInfo.urlCart
        // window.location.reload()
      })
      this.subArr.push(PaymentCart_sst)
    }
  }

  onClickDelivery(item: DTOTypeOfTransportation) {
    this.deliveryItem = { ...item }

    const paymentCart = new DTOPaymentCart()
    const newCart = { ...this.CartState }

    newCart.IsHachi24 = item.Code == 1
    paymentCart.Cart = newCart

    paymentCart.CartDetails = this.ListCartDetailState
    paymentCart.CartCoupon = this.CouponListSelectedState//this.CouponListState

    this.APP_Cart.p_setCachePayment(paymentCart)
    // APP_Cart.p_GetCurrentCart(paymentCart).subscribe();
    const UpdateCart_sst = this.APP_Cart.UpdateCart(newCart, ["IsHachi24"]).subscribe(res => {
      const p_GetCurrentCart_stt = this.APP_Cart.p_GetCurrentCart(paymentCart).subscribe();
      this.subArr.push(p_GetCurrentCart_stt)
    })
    this.subArr.push(UpdateCart_sst)
  }

  onClickPayment(payment: DTOPayment) {
    this.PaymentState = payment
    this.BankState = new DTOBank()
    this.CartState.PaymentID = payment.ID

    this.PaymentCartState.Cart = this.CartState
    this.APP_Cart.p_setCachePayment(this.PaymentCartState)
  }

  onClickBank(bank: DTOBank) {
    this.BankState = bank
  }

  toggleInvoice() {
    this.showInvoice = !this.showInvoice
    this.CartState.IsVAT = this.showInvoice

    if (this.showInvoice)
      this.loadInvoiceForm()
    else {
      this.CartState.VATAddress = ''
      this.CartState.VATCompany = ''
      this.CartState.VATCode = ''
      this.CartState.VATEmail = ''
    }
  }

  onInputChange(prop, ev) {
    if (prop == "ReceivedByIsOrderBy") {
      if (this.CartState.ReceivedByIsOrderBy)
        this.CartState.ReceivedByIsOrderBy = false
      else {
        this.CartState.ReceivedByIsOrderBy = true
        this.CartState.ReceivedBy = this.CartState.OrderBy
        this.CartState.Cellphone = this.CartState.OrderPhone
      }
    }
    else if (prop == "OrderBy" && this.CartState.ReceivedByIsOrderBy == true) {
      this.CartState[prop] = ev.target.value
      this.CartState.ReceivedBy = ev.target.value
    }
    else if (prop == "OrderPhone") {
      this.CartState[prop] = ev.target.value
      this.GetCardByStaff(ev.target.value)

      if (this.CartState.ReceivedByIsOrderBy == true)
        this.CartState.Cellphone = ev.target.value
    }
    else
      this.CartState[prop] = ev.target.value

    if (this.step == 2) {
      this.loadAddressForm()
      this.CartState.Step = 2
    }
    else if (this.step == 3 && this.showInvoice) {
      this.loadInvoiceForm()
      this.CartState.Step = 3
    }

    this.PaymentCartState.Cart = this.CartState
    this.APP_Cart.p_setCachePayment(this.PaymentCartState)
  }

  GetCardByStaff(Cellphone) {
    const GetCardByStaff_sst = this.APP_Cart.GetCardByStaff(Cellphone).subscribe(res => {//data.OrderPhone
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.CardState = res.ObjectReturn
        this.layoutService.onInfo('Số điện thoại trên thuộc về KHTT: ' + this.CardState.FullName, 4000)

        this.CartState.OrderBy = this.CardState.FullName
        this.CartState.MembershipID = this.CardState.CardNo
        this.CartState.DiscountMembership = this.CardState.CurrentDiscount

        if (this.CartState.ReceivedByIsOrderBy == true)
          this.CartState.ReceivedBy = this.CardState.FullName

        this.PaymentCartState.Cart = this.CartState
        this.APP_Cart.p_setCachePayment(this.PaymentCartState)
        this.loadAddressForm()
      }
      else {
      }
    })
    this.subArr.push(GetCardByStaff_sst)
  }
  //cart delivery type
  splitDeliveryType = (list: DTOItemCart2[]) => {
    const arrSd: DTOItemCart2[] = []
    const arr24: DTOItemCart2[] = []

    list.map(s => {
      if (s.IsHachi24 && s.DeliveryHachi24h)
        arr24.push(s)
      else
        arrSd.push(s)
    })

    this.cart24h = arr24
    this.cartStandard = arrSd
  }

  cartsAnyDelivery(arr: DTOItemCart2[]) {
    return arr.findIndex(s => s.CartDelivery == null) == -1
  }

  onChangeCartDelivery(index: number, item: DTOItemCart2, deliveryHachi24h: boolean) {
    const newItem = { ...item, DeliveryHachi24h: deliveryHachi24h }
    var ctx = 'Đổi phương thức giao hàng'

    const ChangeCartDelivery_sst = this.APP_Cart.ChangeCartDelivery(newItem).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.loadCart()
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
    })
    this.subArr.push(ChangeCartDelivery_sst)
  }
  //cart gift
  getOrderGift() {
    const GetOrderGifts_sst = this.APP_Cart.GetOrderGifts(this.CartState.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0)
        this.GiftList = res.ObjectReturn
    })
    this.subArr.push(GetOrderGifts_sst)
  }
  openInNewTab(url) {
    window.open(url, '_blank').focus();
  }

  onClickGift = (index: number, iLevel: number, iGift: number) => {
    const newList = [...this.GiftList]
    const cartGift = newList[index]
    const giftLevel = cartGift?.GiftLevels[iLevel]
    const gift = giftLevel?.GiftItems[iGift]

    if (gift.IsChoose) {//BỎ
      gift.IsChoose = false
      cartGift.RemainAmount = (cartGift.SaleAmount <= cartGift.RemainAmount ? cartGift.SaleAmount : cartGift.RemainAmount)
        + giftLevel.MinLevel * gift.Quantity
    }
    else {//CHỌN
      gift.IsChoose = true
      if (gift.Quantity <= 0 || !Ps_UtilObjectService.hasValue(gift.Quantity))
        gift.Quantity = 1

      cartGift.RemainAmount = (cartGift.SaleAmount <= cartGift.RemainAmount ? cartGift.SaleAmount : cartGift.RemainAmount)
        - giftLevel.MinLevel * gift.Quantity
    }
    this.GiftList = newList
  }

  handleClickMinusOrderQuantity = (index, iLevel, iGift) => {
    const newList = [...this.GiftList]
    const cartGift = newList[index]
    const giftLevel = cartGift?.GiftLevels[iLevel]
    const gift = giftLevel?.GiftItems[iGift]

    const oldQuan = gift.Quantity
    gift.Quantity--

    if (gift.Quantity <= 0) {
      cartGift.RemainAmount = (cartGift.SaleAmount <= cartGift.RemainAmount ? cartGift.SaleAmount : cartGift.RemainAmount)
        + giftLevel.MinLevel * oldQuan
      gift.Quantity = 0
      gift.IsChoose = false
    } else {
      if (gift.IsChoose) {
        cartGift.RemainAmount = (cartGift.SaleAmount <= cartGift.RemainAmount ? cartGift.SaleAmount : cartGift.RemainAmount) + giftLevel.MinLevel
      }
    }
    this.GiftList = newList
  }

  handleClickAddOrderQuantity = (index, iLevel, iGift) => {
    const newList = [...this.GiftList]
    const cartGift = newList[index]
    const giftLevel = cartGift?.GiftLevels[iLevel]
    const gift = giftLevel?.GiftItems[iGift]

    gift.Quantity++

    if (gift.IsChoose) {
      cartGift.RemainAmount = (cartGift.SaleAmount <= cartGift.RemainAmount ? cartGift.SaleAmount : cartGift.RemainAmount) - giftLevel.MinLevel
    }
    this.GiftList = newList
  }

  onChangeOrderQuantity = (index: number, iLevel: number, iGift: number, e) => {
    const newList = [...this.GiftList]
    const cartGift = newList[index]
    const giftLevel = cartGift?.GiftLevels[iLevel]
    const gift = giftLevel?.GiftItems[iGift]

    const quan = parseInt(e.target.value.trim(), 10);

    if (!Ps_UtilObjectService.hasValue(quan) || quan <= 0) {//BỎ
      cartGift.RemainAmount = (cartGift.SaleAmount <= cartGift.RemainAmount ? cartGift.SaleAmount : cartGift.RemainAmount)
        + giftLevel.MinLevel * gift.Quantity
      gift.Quantity = 0
      gift.IsChoose = false
    } else {
      //min = 0, max = remainAmount / minLevel
      const newQuan = //!Ps_UtilObjectService.hasValue(quan) || quan <= 0 ? 0 :
        quan * giftLevel.MinLevel > cartGift.RemainAmount ? Math.floor(cartGift.RemainAmount / giftLevel.MinLevel) : quan

      if (gift.IsChoose) {
        cartGift.RemainAmount = (cartGift.SaleAmount <= cartGift.RemainAmount ? cartGift.SaleAmount : cartGift.RemainAmount)
          + giftLevel.MinLevel * gift.Quantity - giftLevel.MinLevel * newQuan
      }
      gift.Quantity = newQuan < 0 ? 0 : newQuan
    }
    this.GiftList = newList
  }

  UpdateCartGift = (isChoose: boolean) => {
    const giftItems: DTOItemCart_Gift2[] = []
    var ctx = 'Chọn quà tặng'

    if (isChoose)
      this.GiftList.forEach(s => s.GiftLevels.forEach(ss => ss.GiftItems.forEach(sss => {
        if (sss.IsChoose)
          giftItems.push(sss)
      })))

    const UpdateCartGift_sst = this.APP_Cart.UpdateCartGift(this.CartState.Code, giftItems).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        // window.location.href = DTOConfig.appInfo.urlCartThanks + this.CartState.Code
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.openList()
      }
      else
        this.layoutService.onError(`${ctx} thất bại. ${res.ErrorString}`)
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}. ${e}`)
    })
    this.subArr.push(UpdateCartGift_sst)
  }
  //auto run
  runRefreshTimer() {
    let that = this

    if (that.intervalRefresh)
      clearInterval(that.intervalRefresh)

    if (Ps_UtilObjectService.hasValue(document.querySelector(".group-product-promotion-time .time"))) {
      const ms_in_sec = 1000

      $('.group-product-promotion-time .time').each(function () {
        const dates = [new Date().getTime(), new Date(that.CartState.StepDate).getTime()]
        const badges = $(this).children()

        that.intervalRefresh = setInterval(() => {
          //cooldown 1 sec
          dates[0] += ms_in_sec
          const diffTime = Math.abs(dates[0] - dates[1]);
          //tính giờ phút giay
          const days = diffTime / (24 * 60 * 60 * 1000);
          const hours = (days % 1) * 24;
          const minutes = (hours % 1) * 60;
          const secs = (minutes % 1) * 60;
          //gán giá trị mới
          badges[0].querySelector('.dayvalue').innerHTML = ~~hours + ''
          badges[1].querySelector('.hourvalue').innerHTML = ~~minutes + ''
          badges[2].querySelector('.minutevalue').innerHTML = ~~secs + ''

          if (hours <= 0 && minutes <= 0 && secs <= 0) {
            clearInterval(that.intervalRefresh)
            window.location.reload()
          }
        }, ms_in_sec)
      })
    }
  }

  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.value <= 0;
  }

  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }

  checkFormAddress = (c: UntypedFormControl) => {
    var address = c.value
    return address.Code > 0 ? null : { invalidateDate: true }
  }
  openSearchProd() {
    this.service.setSearchProductDialog(true)
  }
  openList() {
    this.APP_Cart.p_deleteCachePayment()

    var changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      // var paymentCart = new DTOPaymentCart()
      // this.APP_Cart.p_setCachePayment(paymentCart)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('ecom-cart')
        || f.Link.includes('ecom-cart'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('cart-generate-list')
          || f.Link.includes('cart-generate-list'))
        alert('Website sẽ chuyển hướng về Danh sách. Nhấn OK để tiếp tục')
        this.menuService.activeMenu(detail)
      }
    })
    this.subArr.push(changeModuleData_sst)
  }
  // handleClickDatHang() {

  // }
}

@Component({
  selector: 'CartDetail',
  template: `
  <div class="view-cart-table__row">
    <div class="item">
      <div class="col-name">
        <div class="d-flex">
          <div class="image">
            <div class="image-product">
              <img [src]="item.ImageSetting" class="rounded w-100" />
            </div>
            <div class="image-freeship"
              *ngIf="item.FreeShippingImage != null && item.FreeShippingImage != ''">
              <img [src]="item.FreeShippingImage" />
            </div>
          </div>
          <div class="info">
            <div class="info-name" [ngClass]="{'hetHang': !item.IsStock}">
              <span class="combo-icon" *ngIf="item.ListItem != null && item.ListItem.length > 0">
                <img src="assets/img/icon/combo.svg" alt="COMBO" />
              </span>
              <span class="hachi24h" *ngIf="item.IsStock && item.IsHachi24">
                <img src="assets/img/icon/hachi3h.svg" alt="hachi24" />
              </span>
              <span class="hachi24h" *ngIf="!item.IsStock && item.IsHachi24">
                <img src="assets/img/icon/hachi24h_disabled.svg" alt="hachi24" />
              </span>
              <a [href]="item.Alias">
                {{item.ProductName}}
              </a>
            </div>
            <div class="info-button">
              <div class="info-button--delete" (click)="onDeleteCartDetail(item)">
                <button class="">Xóa</button>
              </div>
              <div class="info-button--combo" *ngIf="item.ListItem != null && item.ListItem != ''"
                (click)="toggleDetailCombo()">
                <!-- onClick=handleClick} -->
                Xem các sản phẩm trong combo
                <span
                  [ngClass]="{'hachi-icon-up': showDetailCombo, 'hachi-icon-down': !showDetailCombo}">
                </span>
              </div>
              <div class="info-button--hethang" *ngIf="IsStock; else itemIsStock">
                Không đủ tồn
              </div>
              <ng-template #itemIsStock>
                <div class="info-button--hethang" *ngIf="!item.IsStock">
                  Hết hàng
                </div>
              </ng-template>

              <!-- <ViewTableCartModel *ngIf="item.ListModels != null && item.ListModels != []">
                itemCart=item} onChangeModel=onhandleChangeModel}
              </ViewTableCartModel> -->

              <div class="info-button--phanloai" *ngIf="item.ListModels != null && item.ListModels.length > 0">
                <div class="phan-loai" (click)="toggleDetailModel(true)">
                  <!-- onClick=()=> handleClickPopup(true);  -->
                  <span class="phan-loai-text">Phân loại mẫu</span>
                  <span [ngClass]="{'hachi-icon-up': isPopupDetailModel, 'hachi-icon-down': !isPopupDetailModel}">
                  </span>
                </div>

                <div class="phan-loai-value">
                  <ng-container *ngFor="let item of itemCart.ListModels; let index">
                    <!-- if (Ps_UtilObjectService.hasValue(itemCart.ModelID))
                    item.IsChoose = item.ID == itemCart.ModelID
                    else if (index == 0) {
                    //nếu chưa chọn mẫu thì lấy cái đầu tiên
                    itemCart.ModelID = item.ID
                    itemCart.ModelName = item.ModelName
                    item.IsChoose = true
                    } -->
                    <script>
                      if (itemCart.ModelID != null)
                        item.IsChoose = item.ID == itemCart.ModelID
                      else if (index == 0) {
                        //nếu chưa chọn mẫu thì lấy cái đầu tiên
                        itemCart.ModelID = item.ID
                        itemCart.ModelName = item.ModelName
                        item.IsChoose = true
                      }
                    </script>
                    <!-- if (item.IsChoose)
                    return item.ModelName
                    else
                    return "" -->
                    {{item.IsChoose ? item.ModelName : ''}}
                  </ng-container>
                </div>

                <div class="popup-phan-loai" [ngClass]="{'d-none': !isPopupDetailModel}">
                  <div class="hachi-popup">
                    <div class="hachi-popup-content">
                      <div class="btn-header">
                        <button type="button" class="btn-close ml-auto" (click)="toggleDetailModel(false)">
                          <span class="hachi-icon-close"></span>
                        </button>
                      </div>
                      <div class="hachi-popup-header"></div>
                      <div class="hachi-popup-body">
                        <div class="popup-phan-loai_content">
                          <div class="img-price">
                            <div class="phan-loai-image">
                              <img *ngFor="let item of itemCart.ListModels" class="rounded w-100"
                                [ngClass]="{'active': item.IsChoose}" [src]="itemCart.ImageSetting" />
                            </div>
                            <div class="name-price">
                              <div class="name">
                                <a [href]="itemCart.Alias">
                                  {{itemCart.ProductName}}
                                </a>
                              </div>
                              <!--- giá khuyến mãi -->
                              <div class="price" *ngIf="itemCart.UnitPrice != itemCart.BasePrice">
                                <div class="d-flex">
                                  <div class="price-promo">
                                    {{itemCart.UnitPrice | number: '1.'}}
                                    <span class="vnd"></span>
                                  </div>
                                  <div class="price-base">
                                    {{itemCart.BasePrice | number: '1.'}}
                                    <span class="vnd"></span>
                                  </div>
                                </div>
                              </div>
                              <!-- giá không khuyến mãi -->
                              <div class="price" *ngIf="itemCart.UnitPrice == itemCart.BasePrice">
                                <div class="price-active mr-3">
                                  {{itemCart.UnitPrice | number: '1.'}}
                                  <span class="vnd"></span>
                                </div>
                              </div>
                              <!-- giá vip -->
                              <div class="price_vip">
                                <span>Giá KHTT VIP</span>
                                <img src="assets/img/icon/triangle_right.svg" alt=">" />
                                <span class="price">
                                  {{itemCart.UnitPrice | number: '1.'}}
                                  <span class="vnd"></span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="popup-phan-loai_content"></div>
                        <div class="line"></div>
                        <div class="popup-phan-loai_content">
                          <div class="info_type">
                            <div>Chọn mẫu / kiểu</div>
                            <div>
                              <div class="list-type">
                                <span *ngFor="let item of itemCart.ListModels" class="badge"
                                  [ngClass]="{'active': item.IsChoose}" (click)="changeModel(item)">
                                  <!--  onClick=()=>  onhandleClickType(item); }} -->
                                  {{item.ModelName}}
                                </span>
                              </div>
                              <div class="info_remark">
                                Hachi Hachi sẽ liên lạc với quý khách nếu mẫu yêu thích đã hết
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <AlwaysScrollToBottom></AlwaysScrollToBottom>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-price">
        <ng-container *ngIf="item.IsPromotionVIP; else itemIsPromotionVIP">
          <ng-container *ngIf="isLogin; else isLoginBasePrice">
            <div class="UnitPrice">
              <span class="UnitPrice_vip">KM VIP </span>
              {{item.UnitPrice | number : '1.'}}đ
            </div>
            <div class="BasePrice gray">
              {{item.BasePrice | number : '1.'}}đ
            </div>
          </ng-container>
          <ng-template #isLoginBasePrice>
            <div class="BasePrice">
              {{item.BasePrice | number : '1.'}}đ
            </div>
            <div class="UnitPrice red">
              <span class="UnitPrice_vip">KM VIP </span>
              {{item.UnitPrice | number : '1.'}}đ
            </div>
          </ng-template>
        </ng-container>
        <ng-template #itemIsPromotionVIP>
          <div class="UnitPrice">
            {{item.UnitPrice | number : '1.'}}đ
          </div>
          <div class="BasePrice gray" *ngIf="item.UnitPrice != item.BasePrice && item.BasePrice > 0">
            {{item.BasePrice | number : '1.'}}đ
          </div>
        </ng-template>
      </div>
      <div class="col-quantity">
        <div class="group_quanlity">
          <div class="group-input">
            <button class="counter-minus" (click)="MinusDetailQuan()">
              <!-- onClick=handleClickMinusOrderQuantity} -->
              <span class="hachi-icon-minus"></span>
            </button>
            <input type="number" class="input" [value]="item.OrderQuantity"
              (change)="changeDetailQuan($event)" (blur)="blurDetailQuan()" />
            <!--  onChange=onChangeOrderQuantity} onBlur=onBlurOrderQuantity}  -->
            <button class="counter-plus" (click)="AddDetailQuan()">
              <!-- onClick=handleClickAddOrderQuantity} -->
              <span class="hachi-icon-plus"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- <ViewTableCartCoupon *ngIf="item.HasCoupon">
      item=item} lst=item.ListCoupon} lstSelected=item.ListCouponSelected}
    onChangeCoupon=onhandleChangeCoupon}
    </ViewTableCartCoupon> -->

    <CartDetailCoupon  *ngIf="item.HasCoupon" [item]="item"
    [lstSelected]="item.ListCouponSelected" 
    [lst]="item.ListCoupon"
    (onChangeCoupon)="onhandleChangeCoupon"
    ></CartDetailCoupon>
                
    <!-- <ViewTableCartGift *ngIf="item.ListGift != null && item.ListGift != []">
      itemCart=item}
    </ViewTableCartGift> -->

    <div class="danh-sach-qua-tang" *ngIf="item.ListGift != null && item.ListGift.length > 0">
      <div class="qua-tang" (click)="toggleDetailGift()">
        <!-- onClick=()=>  handleClickPopup(!isShowPopup) }} -->
        <div class="icon">
          <img src="assets/img/icon/icon_gift.svg" alt="" />
        </div>
        <div class="name">
          Sản phẩm có quà tặng kèm, vui lòng chọn sau khi hoàn tất đặt hàng
        </div>
        <div>
          <span [ngClass]="{'hachi-icon-up': isPopupDetailGift, 'hachi-icon-down' :!isPopupDetailGift}">
          </span>
        </div>
      </div>
      <div class="popup-qua-tang" [ngClass]="{'d-none': !isPopupDetailGift}">
        <div class="hachi-popup-content">
          <div class="hachi-popup-body">
            <div class="product-gift">
              <fieldset class="scheduler-border">
                <legend class="scheduler-border">
                  <span class="text">
                    {{itemCart.ListGift[0].GiftTitle}}
                  </span>
                </legend>
                <div class="lst-gift">
                  <OwlCarousel class='owl-theme'>
                    <!-- margin=5} nav dots=false} items=Width> 768 ? 4 : 2} navText=[
                    '<span class="hachi-icon-left"></span>', '<span class="hachi-icon-right"></span>']}  -->

                    <div class='item' *ngFor="let item of itemCart.ListGift">
                      <div class="item-gift">
                        <div class="item-gift-image">
                          <img src={{item.ImageSetting}} />
                        </div>
                      </div>
                    </div>
                  </OwlCarousel>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
        <AlwaysScrollToBottom></AlwaysScrollToBottom>
      </div>
    </div>

    <!-- <ViewTableCartCombo *ngIf="item.ListItem != null && item.ListItem != []">
      lst=item.ListItem} show=isShowCombo}
    </ViewTableCartCombo> -->

    <div class="danh-sach-combo" *ngIf="showDetailCombo && item.ListItem != null && item.ListItem.length > 0">
      <div class="item-combo" *ngFor="let item of item.ListItem">
        <div class="col-name">
          <div class="d-flex">
            <div class="image">
              <div class="image-product">
                <img [src]="item.ImageThumb" class="rounded w-100" />
              </div>
            </div>
            <div class="info">
              <div class="info-name">
                <a [href]="item.Alias">{{item.ProductName}}</a>
              </div>
              <div class="info-button">
                <div class="hachi-color-text-12">Thuộc combo</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-price">
        </div>
        <div class="col-quantity">
          <div class="group_quanlity">
            {{item.OrderQuantity > 0 ? (item.OrderQuantity | number: '1.') : 1}}
          </div>
        </div>
      </div>
    </div>
  </div>`,
  styleUrls: ['./ecom010-cart-generate-detail.component.scss']
})
export class Ecom010CartDetailComponent implements OnInit, OnDestroy {
  @Input() idex
  @Input() item
  @Input() itemCart
  @Output() OnDeleteCartDetail = new EventEmitter()
  @Input() onDataChange

  subArr: Subscription[] = []

  isLogin = false
  IsStock = false

  isPopupDeleteDetail = false
  isPopupDetailGift = false
  isPopupDetailModel = false
  showDetailCombo = false

  constructor(
    public service: EcomService,
    public layoutService: LayoutService,
    public apiService: EcomAPIService,
    public apiSynService: EcomSynCartAPIService,
    public APP_Cart: EcomAppCartAPIService,
  ) { }

  ngOnInit(): void {

  }
  ngOnDestroy() {
    this.subArr.forEach(e => {
      e?.unsubscribe()
    })
  }

  //cart detail
  onDeleteCartDetail(detail?) {
    this.OnDeleteCartDetail.emit(detail)
  }
  // DeleteCartDetail() {
  // }
  //detail quan
  MinusDetailQuan() {
    if (this.item.OrderQuantity <= 1)
      this.onDeleteCartDetail(this.item)
    else {
      const newItem: DTOItemCart2 = { ...this.item };
      newItem.OrderQuantity--
      this.checkProductStock(newItem)
    }
  }

  AddDetailQuan() {
    const newItem: DTOItemCart2 = { ...this.item };
    newItem.OrderQuantity++
    this.checkProductStock(newItem)
  }

  changeDetailQuan(e) {
    if (Ps_UtilObjectService.hasValue(e.target.value) && Ps_UtilObjectService.hasValueString(e.target.value.trim())) {
      this.item.OrderQuantity = parseInt(e.target.value.trim(), 10);
    } else {
      this.item.OrderQuantity = 0;
    }
    this.onDataChange(this.item, this.idex, false, false);
  }

  blurDetailQuan() {
    if (this.item.OrderQuantity == 0)
      this.onDeleteCartDetail(this.item)
    else //check stock            
      this.checkProductStock(this.item)
  }

  checkProductStock = (newItem: DTOItemCart2) => {
    // var ctx1 = 'Kiểm tra tồn'
    // const CheckProductStock_sst = this.APP_Cart.CheckProductStock(newItem).subscribe(res => {
    //   if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
    //     const stock = parseInt(res.ObjectReturn)
    //     this.layoutService.onInfo(`Đã ${ctx1}. Có ${stock} sản phẩm`)

    //     if (stock <= 0) {//hết hàng
    //       this.IsStock = false
    //       newItem.OrderQuantity = 0
    //       this.layoutService.onInfo(`Sản phẩm đã hết hàng`)
    //     }
    //     else if (stock >= newItem.OrderQuantity) {//ok
    //       this.IsStock = false
    //       this.layoutService.onInfo(`Sản phẩm đủ tồn`)
    //     }
    //     else {//ko đủ tồn
    //       this.IsStock = true
    //       newItem.OrderQuantity = stock
    //       this.layoutService.onInfo(`Sản phẩm không đủ tồn`)
    //     }

    //     setTimeout(() => {
    //       this.IsStock = false
    //     }, 3000);
    newItem.StaffID = DTOConfig.Authen.userinfo?.staffID
    var ctx2 = 'Thêm sản phẩm'

    const AddCartBuyAgain_sst = this.APP_Cart.AddCartBuyAgain(newItem, false, false).subscribe(res => {
      this.APP_Cart.loadCurrentCart()

      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0)
        this.layoutService.onSuccess(`${ctx2} thành công`)
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx2}: ${res.ErrorString}`)
    }, e => {
      this.layoutService.onSuccess(`Đã xảy ra lỗi khi ${ctx2}: ${e}`)
    });
    this.subArr.push(AddCartBuyAgain_sst)

    //   }
    //   else
    //     this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx1}: ${res.ErrorString}`)
    // }, e => {
    //   this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx1}: ${e}`)
    // })
    // this.subArr.push(CheckProductStock_sst)
  }
  //detail combo
  toggleDetailCombo() {
    this.showDetailCombo = !this.showDetailCombo
  }
  //detail gift
  toggleDetailGift() {
    this.isPopupDetailGift = !this.isPopupDetailGift
  }
  //detail model
  toggleDetailModel(show) {
    this.isPopupDetailModel = show
  }
  changeModel(data: DTOItemCart_Model2) {
    if (!data.IsChoose) {
      data.IsChoose = true

      this.item.ModelID = data.IsChoose ? data.ID : null;
      this.item.ModelName = data.IsChoose ? data.ModelName : null;
      this.item.ImageSetting = data.IsChoose ? data.ImageSetting : null

      const newItem: DTOItemCart2 = { ...this.item }
      newItem.StaffID = DTOConfig.Authen.userinfo?.staffID
      this.onDataChange(this.item, this.idex, false, false);
      var ctx = 'Đổi mẫu Sản phẩm'

      const AddCartBuyAgain_sst = this.APP_Cart.AddCartBuyAgain(newItem, false, false).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0)
          this.layoutService.onSuccess(`${ctx} thành công`)
        else
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }, e => {
        this.layoutService.onSuccess(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      })
      this.subArr.push(AddCartBuyAgain_sst)
    }
  }
  //detail coupon
  onhandleChangeCoupon(data: DTOItemCart2) {
    this.onDataChange(data, this.idex, false, false)
  }
}


@Component({
  selector: 'CartDetailCoupon',
  template: `  
  <div class="ma-giam-gia">
    <div class="icon">
      <img src="assets/img/icon/icon_coupon.svg" alt="" />
    </div>
    <div class="name">Mã giảm giá</div>
    <div class="danh-sach-ma-giam-gia" (click)="toggleDetailCoupon()">
      <!-- onClick=handleClickPopup} -->
      <script>
        if (lstSelected == null || lstSelected == undefined)
          lstSelected = []
      </script>
      <ng-container *ngFor="let item of lst">
        <script>
          // item.IsChoose = lstSelected[0]?.CouponID == item.CouponID
          //item.IsChoose = lstSelected.findIndex(s => s.CouponID == item.CouponID) > -1
        </script>
        <div class="bage-ma-giam-gia" [ngClass]="{'active': item.IsChoose}">
          {{item.CouponCode}}
        </div>
      </ng-container>
      <div *ngIf="lst.length > 1" class="bage-ma-giam-gia plus">
        +{{lst.length - 1}}
      </div>
      <span [ngClass]="{'hachi-icon-up': isPopupDetailCoupon, 'hachi-icon-down': !isPopupDetailCoupon}">
      </span>
    </div>

    <div class="popup-ma-giam-gia" [ngClass]="{'d-none': !isPopupDetailCoupon}">
      <div class="hachi-popup">
        <div class="hachi-popup-content">
          <div class="btn-header">
            <button type="button" class="btn-close ml-auto" (click)="toggleDetailCoupon(false)">
              <span class="hachi-icon-close"></span>
            </button>
          </div>
          <div class="hachi-popup-header">
            <div class="text-1">Mã giảm giá</div>
            <div class="text-2">Mỗi sản phẩm chỉ được áp dụng 1 mã giảm giá</div>
          </div>
          <div class="hachi-popup-body">
            <form class="hachi_form" (submit)="submitDetailCoupon($event)" [formGroup]="couponForm">
              <!-- onSubmit=handleSubmit(onSubmit)} -->
              <div>
                <input type="text" id="CouponCode"  formControlName="CouponCode"
                  autoComplete="off" placeholder="Nhập mã giảm giá" />
                <!-- ref=register( required: "Vui lòng nhập mã giảm giá"
                })}  -->
                <button type="submit">Áp dụng</button>
              </div>
              <!-- <ErrorMessage errors=errors} name="phone" 
            render=( messages })=> 
              return messages
              ? Object.entries(messages).map(([type, message]) => (
              <span  class="hachi-invalid-feedback mt-3">message}</span>
              )) : null;
              }}
              /> -->
              <span class="hachi-invalid-feedback mt-3"
                *ngIf="errDetailCoupon != '' && errDetailCoupon != null">{{errDetailCoupon}}</span>
            </form>
            <div class="list-ma-giam-gia">
              <ng-container *ngFor="let item of lst">
                <div class="item-ma-giam-gia" [ngClass]="{'active': item.IsChoose}">
                  <div class="code">
                    <div class="code-imge">
                      <img src="assets/img/icon/icon_coupon_big.svg" alt="" />
                    </div>
                    <div class="code-text">
                      {{item.CouponCode}}
                    </div>
                  </div>
                  <div class="info">
                    <div>
                      <div class="name">
                        {{item.CouponName}}
                      </div>
                      <div class="description" [title]="item.Description">
                        {{item.Description}}
                      </div>
                    </div>
                    <div class="hsd" *ngIf="item.ExpiredDate != null && item.ExpiredDate != ''">
                      HSD: {{item.ExpiredDate | date: 'd/M/yyyy'}}
                    </div>
                  </div>
                  <div class="button">
                    <div><span class="hachi-icon-information"></span></div>
                    <div class="apdung" (click)="applyDetailCoupon(item, true)">
                      <!-- onClick=()=>  onhandleClickApDung(item, true) }} -->
                      Áp dụng
                    </div>
                    <div class="bochon" (click)="applyDetailCoupon(item, false)">
                      <!-- onClick=()=>  onhandleClickApDung(item, false) }} -->
                      Bỏ chọn
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
        </div>

        <AlwaysScrollToBottom></AlwaysScrollToBottom>
      </div>
    </div>
  </div>`,
  styleUrls: ['./ecom010-cart-generate-detail.component.scss']
})
export class Ecom010CartDetailCouponComponent implements OnInit, OnChanges, OnDestroy {
  @Input() lst = []
  @Input() lstSelected = []
  @Input('item') cartDetail//cartDetail

  @Output() onChangeCoupon = new EventEmitter()

  loading = false
  isPopupDetailCoupon = false

  errDetailCoupon = ''

  couponForm: UntypedFormGroup = new UntypedFormGroup({
    'CouponCode': new UntypedFormControl(''),
  })

  cartState = new DTOItemCart2()
  subArr: Subscription[] = []

  constructor(
    public service: EcomService,
    public layoutService: LayoutService,
    public apiService: EcomAPIService,
    public apiSynService: EcomSynCartAPIService,
    public APP_Cart: EcomAppCartAPIService,
  ) { }

  ngOnInit(): void {
    var changeCart_sst = this.APP_Cart.changeCart().subscribe((res: DTOItemCart2) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.cartState = { ...res }
      }
    });

    this.subArr.push(changeCart_sst)
  }

  ngOnChanges() {
    this.lst.forEach(f => {
      return f.IsChoose = this.lstSelected.findIndex(s => s.CouponID == f.CouponID) > -1
    })
  }

  ngOnDestroy() {
    this.subArr.forEach(s =>
      s?.unsubscribe()
    )
  }

  loadCart = () => {
    this.APP_Cart.loadCurrentCart()
  }
  //detail coupon
  toggleDetailCoupon(show?) {
    this.isPopupDetailCoupon = show ? show : !this.isPopupDetailCoupon
  }

  submitDetailCoupon(e) {
    var data = this.couponForm.getRawValue()
    var params = new DTOItemCart_Coupon2();
    params = { ...data }
    this.applyDetailCoupon(params, true)
  }

  applyDetailCoupon(data, IsChoose) {
    this.errDetailCoupon = null
    const newitem: DTOItemCart_Coupon2 = { ...data };
    newitem.IsChoose = IsChoose;
    newitem.CartID = this.cartState.Code
    newitem.CartDetailID = this.cartDetail.Code
    newitem.ProductID = this.cartDetail.ProductID

    if (newitem.IsChoose)
      this.onAddItemCoupon(newitem)
    else
      this.onDeleteItemCoupon(newitem)
  }

  onAddItemCoupon(coupon: DTOItemCart_Coupon2) {
    coupon.ProductID = this.cartDetail.ProductID

    if (!this.loading) {
      this.loading = true

      const p_AddCoupon_sst = this.APP_Cart.p_AddCoupon(coupon, this.cartDetail).subscribe(res => {
        this.loading = false

        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          const newCoupon: DTOItemCart_Coupon2 = { ...res.ObjectReturn }
          newCoupon.IsChoose = true
          this.cartDetail.ListCouponSelected = [newCoupon]
          //nếu coupon không tồn tại trong list coupon thì add vào
          const couponIndex = this.cartDetail.ListCoupon.findIndex(s => s.CouponCode == newCoupon.CouponCode)

          if (couponIndex == -1)
            this.cartDetail.ListCoupon.splice(0, 0, newCoupon)

          this.couponForm.reset({ CouponCode: "" });
          this.onChangeCoupon.emit(this.cartDetail)
          this.isPopupDetailCoupon = false

          // if (APP_AuthService.isLogin())
          this.loadCart()
          // else
          //     reloadCart()
        } else {
          this.errDetailCoupon = res.ErrorString
          this.layoutService.onError(res.ErrorString)
        }
      }, err => {
        this.loading = false
      })
      this.subArr.push(p_AddCoupon_sst)
    }
  }

  onDeleteItemCoupon(coupon: DTOItemCart_Coupon2) {
    coupon.ID = this.lstSelected[0].ID
    coupon.Code = this.lstSelected[0].Code

    const p_DeleteCoupon_sst = this.APP_Cart.p_DeleteCoupon(coupon).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.cartDetail.ListCouponSelected = []
        this.onChangeCoupon.emit(this.cartDetail)
        this.isPopupDetailCoupon = false

        // if (APP_AuthService.isLogin())
        this.loadCart()
        // else
        //     reloadCart()
      } else
        this.errDetailCoupon = res.ErrorString
    })
    this.subArr.push(p_DeleteCoupon_sst)
  }
}