import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { State, groupBy, GroupDescriptor, GroupResult } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { EcomService } from '../../shared/services/ecom.service';
import { EcomAPIService } from '../../shared/services/ecom-api.service';
import { DTOOrderDetail } from '../../shared/dto/DTOOrderDetail';
import { MatSidenav } from '@angular/material/sidenav';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOCoupon } from '../../shared/dto/DTOCoupon';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOGiftProduct } from '../../shared/dto/DTOGiftProduct';
import { DTOGift } from '../../shared/dto/DTOGift';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { EcomSynCartAPIService } from '../../shared/services/ecom-syncart-api.service';
import DTOSynCart from '../../shared/dto/DTOSynCart.dto';
import { DTOECOMChannel } from '../../shared/dto/DTOECOMChannel.dto';
import DTOSynProvince from '../../shared/dto/DTOLSProvince.dto';
import DTOSynDistrict from '../../shared/dto/DTOLSDistrict.dto';
import DTOSynWard from '../../shared/dto/DTOLSWard.dto';
import DTOSynPayment from '../../shared/dto/DTOCOLSTypeOfPayment.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-ecom009-cart-customer-detail',
  templateUrl: './ecom009-cart-customer-detail.component.html',
  styleUrls: ['./ecom009-cart-customer-detail.component.scss']
})
export class Ecom009CartCustomerDetailComponent implements OnInit, OnDestroy {
  context: string = ""
  contextObjectName: string = ""
  ctxDonhang = "giỏ hàng"
  ctxCoupon = "coupon"
  ctxSanpham = "sản phẩm"
  ctxQuatang = "quà tặng"
  //
  isAdd = false
  isAddItem = false
  isAddSp = true
  //validate
  isLockAll = true
  canEditPayment = false
  isBillFormValid = false

  grid1Null = true
  grid2Null = true
  //
  curOrder = new DTOSynCart()
  createdDate: Date = null
  //sanpham
  orderDetails: DTOOrderDetail[] = []
  orderDetailsGroups: GroupResult[] = []
  currentOrderDetail = new DTOOrderDetail()
  //coupon
  couponList: DTOCoupon[] = []
  currentCoupon = new DTOCoupon()
  //quatang
  giftList: DTOOrderDetail[] = []
  currentGift = new DTOOrderDetail()

  giftProductList: DTOGiftProduct[] = []
  giftBillList: DTOGiftProduct[] = []
  //Dropdown List
  channelList: DTOECOMChannel[] = []
  channelListInhouse: DTOECOMChannel[] = []

  provinceList: DTOSynProvince[] = []
  districtList: DTOSynDistrict[] = []
  wardList: DTOSynWard[] = []
  paymentList: DTOSynPayment[] = []

  currentChannel = new DTOECOMChannel()
  currentProvince = new DTOSynProvince()
  currentDistrict = new DTOSynDistrict()
  currentWard = new DTOSynWard()
  curPayment = new DTOSynPayment()
  //Grid
  loading = false
  pageable1 = true
  pageable2 = true
  pageSize: number = 50
  pageSizes: number[] = [this.pageSize]
  //Grid setting
  gridDSState1: State
  gridDSState2: State
  gridDSState3: State
  gridDSView1 = new Subject<any>();
  gridDSView2 = new Subject<any>();
  gridDSView3 = new Subject<any>();
  groups: GroupDescriptor[] = [{ field: "IsSubOrder24h" }];
  //popup  
  allowActionDropdown = ['detail']
  //CALLBACK
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  //grid data change
  onPageChangeCallback: Function
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  //FORM
  form: UntypedFormGroup;
  //SUB
  getCacheSynCartDetail_sst: Subscription
  VNPayIPNRecall_sst: Subscription
  //dropdown
  GetListChannel_sst: Subscription
  GetPayments_sst: Subscription
  //address
  GetProvinces_sst: Subscription
  GetDistricts_sst: Subscription
  GetWards_sst: Subscription
  //order 
  GetClientOrder_sst: Subscription
  UpdateOrder_sst: Subscription
  //detail
  GetOrderStatus_sst: Subscription
  GetOrderDetails_sst: Subscription
  GetOrderDetailByID_sst: Subscription
  GetProduct_sst: Subscription
  //coupon
  GetListCartCoupon_sst: Subscription
  //gift
  GetOrderGift_sst: Subscription
  GetGiftProduct_sst: Subscription
  GetGiftBill_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public service: EcomService,
    public layoutService: LayoutService,
    public apiService: EcomAPIService,
    public apiSynService: EcomSynCartAPIService,
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    this.loadFilter1()
    this.loadFilter2()
    this.loadFilter3()

    // this.getCache()
    this.loadForm()

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache()
      }
    })
    //callback
    // this.onPageChangeCallback = this.pageChange.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
  }
  getCache() {
    this.getCacheSynCartDetail_sst = this.service.getCacheSynCartDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.curOrder = res
        this.isAdd = this.curOrder.ID == 0
      }

      if (!this.isAdd || this.curOrder.ID != 0) {
        this.getData()
      }
    })
  }
  ngOnDestroy() {
    //dropdown
    this.GetListChannel_sst?.unsubscribe()
    this.GetPayments_sst?.unsubscribe()
    //address
    this.GetProvinces_sst?.unsubscribe()
    this.GetDistricts_sst?.unsubscribe()
    this.GetWards_sst?.unsubscribe()
    //order 
    this.getCacheSynCartDetail_sst?.unsubscribe()
    this.GetClientOrder_sst?.unsubscribe()
    this.UpdateOrder_sst?.unsubscribe()
    //detail
    this.GetOrderStatus_sst?.unsubscribe()
    this.GetOrderDetails_sst?.unsubscribe()
    this.GetOrderDetailByID_sst?.unsubscribe()
    this.GetProduct_sst?.unsubscribe()
    //coupon
    this.GetListCartCoupon_sst?.unsubscribe()
    //gift
    this.GetOrderGift_sst?.unsubscribe()
    this.GetGiftProduct_sst?.unsubscribe()
    this.GetGiftBill_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
  //filter
  loadPageSizes() {
    this.pageSizes = [...this.layoutService.pageSizes]
  }
  loadFilter1() {
    this.gridDSState1 = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState1.sort = null
    this.gridDSState1.take = this.pageSize
    this.gridDSState1.filter.filters = []
  }
  loadFilter2() {
    this.gridDSState2 = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState2.sort = null
    this.gridDSState2.take = this.pageSize
    this.gridDSState2.filter.filters = []
  }
  loadFilter3() {
    this.gridDSState3 = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState3.sort = null
    this.gridDSState3.take = 0
    this.gridDSState3.filter.filters = []
  }
  //API
  //dropdown
  p_GetListChannel() {
    this.loading = true;

    this.GetListChannel_sst = this.apiService.GetListChannel().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.channelList = res.ObjectReturn;
        this.channelListInhouse = this.channelList.filter(s => s.Inhouse)
        this.currentChannel = this.channelList.find(s => s.Code == 1)
      } else if (Ps_UtilObjectService.hasListValue(res)) {
        this.channelList = res;
        this.channelListInhouse = this.channelList.filter(s => s.Inhouse)
        this.currentChannel = this.channelList.find(s => s.Code == 1)
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetPayments() {
    this.loading = true;

    this.GetPayments_sst = this.apiSynService.GetPayments().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.paymentList = res.ObjectReturn;
        this.paymentList.unshift(new DTOSynPayment(null, ' -- chọn -- '))

        if (!this.isAdd)
          this.getPaymentTypeFromOrder()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //address
  p_GetProvinces() {
    this.loading = true;

    this.GetProvinces_sst = this.apiSynService.GetProvinces().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.provinceList = res.ObjectReturn;
        this.provinceList.unshift(new DTOSynProvince(null, ' -- chọn -- '))

        if (!this.isAdd)
          this.getProvinceFromOrder()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetDistricts(province: number) {
    this.loading = true;

    this.GetDistricts_sst = this.apiSynService.GetDistricts(province).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.districtList = res.ObjectReturn;
        this.districtList.unshift(new DTOSynDistrict(null, ' -- chọn -- '))

        if (!this.isAdd)
          this.getDistrictFromOrder()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetWards(district: number) {
    this.loading = true;

    this.GetWards_sst = this.apiSynService.GetWards(district).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.wardList = res.ObjectReturn;
        this.wardList.unshift(new DTOSynWard(null, ' -- chọn -- '))

        if (!this.isAdd)
          this.getWardFromOrder()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //order
  VNPayIPNRecall() {
    this.loading = true;
    var ct = 'Kiểm tra thanh toán'

    this.VNPayIPNRecall_sst = this.apiSynService.VNPayIPNRecall(this.curOrder.ID).subscribe(res => {
      this.loading = false;

      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ct} thành công: ${res.ObjectReturn}`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ct}: ${res.ErrorString}`)
    }, e => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ct}: ${e}`)
    });
  }
  GetClientOrder() {
    this.loading = true;

    this.GetClientOrder_sst = this.apiSynService.GetClientOrder(this.curOrder.ID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curOrder = res.ObjectReturn;

        if (Ps_UtilObjectService.hasValue(this.curOrder.CreatedDate))
          this.createdDate = new Date(this.curOrder.CreatedDate)

        this.checkIsOrderLock()
        this.getProvinceFromOrder()
        this.getPaymentTypeFromOrder()

        if (Ps_UtilObjectService.hasValue(this.curOrder.Province))
          this.p_GetDistricts(this.curOrder.Province)

        if (Ps_UtilObjectService.hasValue(this.curOrder.District)) {
          this.p_GetWards(this.curOrder.District)
        }
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_UpdateClientOrder(prop: string[], getOrderDetail: boolean) {
    this.loading = true;
    var ctx = "Cập nhật giỏ hàng"

    this.UpdateOrder_sst = this.apiSynService.UpdateClientOrder(this.curOrder, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.curOrder = res.ObjectReturn
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      if (getOrderDetail)
        this.p_GetOrderDetails()

      this.isAdd = false
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  //detail
  p_GetOrderDetails() {
    this.loading = true;

    this.GetOrderDetails_sst = this.apiSynService.GetOrderDetails(this.curOrder.ID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.orderDetails = res.ObjectReturn;
      }
      else if (Ps_UtilObjectService.hasListValue(res)) {
        this.orderDetails = res;
      }
      this.SplitOrderDetailsToGrids()
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetOrderDetailByID() {
    this.loading = true;
    var ctx = "sản phẩm"

    this.GetOrderDetailByID_sst = this.apiService.GetOrderDetailByID(this.currentOrderDetail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.currentOrderDetail = res.ObjectReturn;
        // this.currentOrderDetailEdit = res;
        this.layoutService.onSuccess(`Tìm thấy ${ctx}`)
      } else
        this.layoutService.onError(`Không tìm thấy ${ctx}`)

      this.calculateThanhTienOnForm()
      this.loadForm()
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Barcode của ${ctx} không hợp lệ`)
      this.loading = false;
    });
  }
  //coupon
  p_GetListCartCoupon() {
    this.loading = true;

    this.GetListCartCoupon_sst = this.apiSynService.GetListOrderCoupon(this.curOrder.ID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.couponList = res.ObjectReturn;
      }
      else if (Ps_UtilObjectService.hasListValue(res)) {
        this.couponList = res;
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //Gift
  p_GetOrderGift() {
    this.loading = true;

    this.GetOrderGift_sst = this.apiSynService.GetOrderGift(this.curOrder.ID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.giftList = res.ObjectReturn;
      } else if (Ps_UtilObjectService.hasListValue(res)) {
        this.giftList = res
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetGiftProduct() {
    this.loading = true;

    this.GetGiftProduct_sst = this.apiService.GetGiftProduct(this.curOrder.ID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.giftProductList = res.ObjectReturn;
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetGiftBill() {
    this.loading = true;

    this.GetGiftBill_sst = this.apiService.GetGiftBill(this.curOrder.ID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.giftBillList = res.ObjectReturn;
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  getData() {
    this.p_GetPayments()
    this.p_GetProvinces()

    if (this.isAdd)
      this.pageable1 = this.pageable2 = false
    else {
      this.GetClientOrder()
      this.p_GetListChannel()
      this.p_GetListCartCoupon()
      this.p_GetOrderDetails()
      this.p_GetOrderGift()
    }
  }

  getPaymentTypeFromOrder() {
    var payment = this.paymentList.find(s => s.ID == this.curOrder.PaymentID)
    this.curPayment = payment != undefined ? payment : new DTOSynPayment()
  }
  getProvinceFromOrder() {
    var province = this.provinceList.find(s => s.ID == this.curOrder.Province)
    this.currentProvince = province != undefined ? province : new DTOSynProvince()
  }
  getDistrictFromOrder() {
    var district = this.districtList.find(s => s.ID == this.curOrder.District)
    this.currentDistrict = district != undefined ? district : new DTOSynDistrict()
  }
  getWardFromOrder() {
    var ward = this.wardList.find(s => s.ID == this.curOrder.Ward)
    this.currentWard = ward != undefined ? ward : new DTOSynWard()
  }

  checkIsOrderLock() {
    this.canEditPayment = this.curOrder.StatusID == 2 && this.curOrder.OrderTypeID == 13
    this.isLockAll = this.curOrder.OrderTypeID == 13 || this.curOrder.OrderTypeID != 18
  }
  SplitOrderDetailsToGrids() {
    this.orderDetailsGroups = <GroupResult[]>groupBy(this.orderDetails, this.groups)

    var rs1 = this.orderDetailsGroups.find(s => s.value == true)

    if (rs1 != undefined) {
      this.grid1Null = false
      var items1 = rs1.items
      var total1 = items1.length
      this.pageable1 = total1 > 100
      this.gridDSView1.next({ data: items1, total: total1 })
    } else
      this.grid1Null = true

    var rs2 = this.orderDetailsGroups.find(s => s.value == false)

    if (rs2 != undefined) {
      this.grid2Null = false
      var items2 = rs2.items
      var total2 = items2.length
      this.pageable2 = total2 > 100
      this.gridDSView2.next({ data: items2, total: total2 })
    } else
      this.grid2Null = true
  }
  //Kendo FORM
  loadForm() {
    this.form = new UntypedFormGroup({
      'Barcode': new UntypedFormControl({ value: this.currentOrderDetail.Barcode, disabled: true }),
      'IsHachi24h': new UntypedFormControl({ value: this.currentOrderDetail.IsHachi24h, disabled: true }),
      'ImageSetting': new UntypedFormControl(this.currentOrderDetail.ImageSetting),
      'ShippedQuantity': new UntypedFormControl({ value: this.currentOrderDetail.ShippedQuantity, disabled: true }),
      'UnitPrice': new UntypedFormControl({ value: this.currentOrderDetail.UnitPrice, disabled: true }),
      'BasePrice': new UntypedFormControl({ value: this.currentOrderDetail.BasePrice, disabled: true }),
      'ThanhTien': new UntypedFormControl({ value: 0, disabled: true }),
    })
    this.calculateThanhTienOnForm()
  }
  ///CLICK EVENT
  //header  
  //THÔNG TIN giỏ hàng
  onDropdownlistClick(e, dropdownName: string) {
    if (dropdownName == 'PaymentID') {
      this.curPayment = e
      this.curOrder.PaymentID = this.curPayment.ID
      this.p_UpdateClientOrder([dropdownName], false)
    }
  }
  onEdit(isaddsp: boolean) {
    this.isAddItem = false
    this.isAddSp = isaddsp;
    this.drawer.open();

    if (isaddsp)
      this.p_GetOrderDetailByID()
    else {
      this.p_GetGiftProduct()
      this.p_GetGiftBill()
    }
  }
  //popup
  onActionDropdownClick(menu: MenuDataItem, item: DTOOrderDetail) {
    if (item.Code > 0)
      if (menu.Link == 'detail' || menu.Code == 'eye') {
        this.currentOrderDetail = item
        // this.currentOrderDetailEdit = item
        this.onEdit(true)
      }
  }
  clearForm() {
    this.currentOrderDetail = new DTOOrderDetail()
    this.form.reset()
    this.loadForm()
  }
  closeForm() {
    this.clearForm()
    this.drawer.close()
  }
  calculateThanhTienOnForm(ev?) {
    this.form.get('ThanhTien').setValue(
      this.currentOrderDetail.ShippedQuantity *
      (Ps_UtilObjectService.hasValue(this.currentOrderDetail.UnitPrice) ?
        this.currentOrderDetail.UnitPrice : this.currentOrderDetail.BasePrice)
    )
  }
  checkGiftSumOfProduct(prod: DTOGiftProduct, obj: DTOGift) {
    if (Ps_UtilObjectService.hasValue(obj.IsChecked)) {
      var sum = prod.ListOfGift.filter(s => s.IsChecked != undefined
        && s.IsChecked == true).reduce((a, b) => a + (b.OrderQuantity || b.MinQuantity), 0)

      if (sum == 0)
        this.isBillFormValid = false
      else {
        var gift = this.giftList.find(s => s.ProductID == obj.Gift)
        if (gift != undefined)
          sum += gift.OrderQuantity

        if (sum > prod.Max) {
          this.layoutService.onError('Sản phẩm "' + prod.VName
            + '" chỉ cho phép Tối đa ' + prod.Max + ' Quà tặng')
          this.isBillFormValid = false
        }
        else
          this.isBillFormValid = true
      }
    }
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
}