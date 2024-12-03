import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { State, groupBy, GroupDescriptor, GroupResult, distinct } from '@progress/kendo-data-query';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { EcomService } from '../../shared/services/ecom.service';
import { EcomAPIService } from '../../shared/services/ecom-api.service';
import { DTOECOMChannel } from '../../shared/dto/DTOECOMChannel.dto';
import { DTOLSProvince } from '../../shared/dto/DTOLSProvince.dto';
import { DTOCOLSTypeOfPayment } from '../../shared/dto/DTOCOLSTypeOfPayment.dto';
import { DTOLSDistrict } from '../../shared/dto/DTOLSDistrict.dto';
import { DTOLSWard } from '../../shared/dto/DTOLSWard.dto';
import { DTOShipper } from '../../shared/dto/DTOShipper';
import { DTOECOMCart } from '../../shared/dto/DTOECOMCart.dto';
import { DTOOrderDetail } from '../../shared/dto/DTOOrderDetail';
import { MatSidenav } from '@angular/material/sidenav';
import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { DTOUpdate } from '../../shared/dto/DTOUpdate';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOCoupon } from '../../shared/dto/DTOCoupon';
import { CartOrderStatus } from '../../shared/dto/CartOrderStatus';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOGiftProduct } from '../../shared/dto/DTOGiftProduct';
import { DTOGift } from '../../shared/dto/DTOGift';
import { CartOrderType } from '../../shared/dto/CartOrderType';
import { Router } from '@angular/router';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { faPeopleArrows } from '@fortawesome/free-solid-svg-icons';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';

@Component({
  selector: 'app-ecom001-online-order-detail',
  templateUrl: './ecom001-online-order-detail.component.html',
  styleUrls: ['./ecom001-online-order-detail.component.scss']
})
export class Ecom001OnlineOrderDetailComponent implements OnInit, OnDestroy {
  context: string = ""
  contextObjectName: string = ""

  ctxDonhang = "đơn hàng"
  ctxCoupon = "coupon"
  ctxSanpham = "sản phẩm"
  ctxQuatang = "quà tặng"
  //icon
  faPeopleArrows = faPeopleArrows
  //
  isAdd = true
  isAddItem = true
  isAddSp = true
  //validate
  isLockAll = false
  isAdmin = false
  isAssignWHPickupAllowed = false
  statusIsLowerThan8 = false
  statusIsLowerThan10 = false
  isBillFormValid = false

  dataPerm: DTODataPermission[] = []
  actionPerm: DTOActionPermission[] = []

  grid1Null = true
  grid2Null = true
  //
  currentOrder = new DTOECOMCart()
  orderDate: Date = null
  nextStatus = new CartOrderStatus()
  //sanpham
  orderDetails: DTOOrderDetail[] = []
  orderDetailsGroups: GroupResult[] = []
  currentOrderDetail = new DTOOrderDetail()
  //coupon
  couponList: DTOCoupon[] = []
  currentCoupon = new DTOCoupon()
  currentDeleteCoupon = new DTOCoupon()
  //quatang
  giftList: DTOOrderDetail[] = []
  selectedGiftList: DTOOrderDetail[] = []
  currentGift = new DTOOrderDetail()

  giftProductList: DTOGiftProduct[] = []
  giftBillList: DTOGiftProduct[] = []
  //Dropdown List
  channelList: DTOECOMChannel[] = []
  channelListInhouse: DTOECOMChannel[] = []

  shipperList: DTOShipper[] = []
  provinceList: DTOLSProvince[] = []
  districtList: DTOLSDistrict[] = []
  wardList: DTOLSWard[] = []
  paymentTypeList: DTOCOLSTypeOfPayment[] = []

  Channel = new DTOECOMChannel()
  ShipmentID = new DTOShipper()
  Province = new DTOLSProvince()
  District = new DTOLSDistrict()
  Ward = new DTOLSWard()
  PaymentID = new DTOCOLSTypeOfPayment()

  orderWHNamePickupList = new Array<DTOECOMCart>()
  //Grid
  loading = false
  pageable1 = true
  pageable2 = true

  pageSize: number = 50
  pageSizes: number[] = [this.pageSize]
  //Grid setting
  gridDSState1: State
  gridDSState2: State

  gridDSView1 = new Subject<any>();
  gridDSView2 = new Subject<any>();

  groups: GroupDescriptor[] = [{ field: "IsSubOrder24h" }];

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //
  orderStatusList: DTOStatus[] = []
  //popup  
  allowActionDropdown = ['edit', 'delete']
  //CALLBACK
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  getSelectionPopupCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  //dialog
  deleteDialogOpened = false
  AssignWHPickupDialogOpened = false
  //FORM
  form: UntypedFormGroup;
  //SUB
  //dropdown
  subArr: Subscription[] = []

  constructor(
    public service: EcomService,
    public layoutService: LayoutService,
    public apiService: EcomAPIService,
    public router: Router,
    public menuService: PS_HelperMenuService) { }

  ngOnInit(): void {
    this.checkIsAllowedToAssignWHPickup()

    var cacheOrder = localStorage.getItem('ecom001-online-order-detail')
    // var EOOD: {
    //   isAdd: boolean,
    //   currentOrder: DTOECOMCart
    // }

    if (Ps_UtilObjectService.hasValueString(cacheOrder)) {
      var tempOrder = JSON.parse(cacheOrder)
      // this.isAdd = EOOD.isAdd

      if (Ps_UtilObjectService.hasValue(tempOrder))
        Ps_UtilObjectService.copyPropertyForce(tempOrder, this.currentOrder)

      this.isAdd = !(this.currentOrder.Code > 0)
    }
    // else {
    //   this.isAdd = this.service.isAdd

    //   if (!this.isAdd) {
    //     Ps_UtilObjectService.copyPropertyForce(this.service.currentCartOrder, this.currentOrder)
    //     this.currentCoupon.Cart = this.currentOrder.Code
    //   }
    // }

    // EOOD = {
    //   isAdd: this.isAdd,
    //   currentOrder: this.currentOrder
    // }

    // localStorage.setItem('ecom001-online-order-detail',
    //   JSON.stringify(EOOD, (k, v) => {
    //     return Ps_UtilObjectService.parseLocalDateTimeToString(k, v,
    //       ['OrderDate', 'EstDelivery', 'DeliveriedDate', 'CancelDate',
    //         'ProcessFrom', 'ProcessTo', 'RequestDate', 'DeliveredDate'])//todo cái nào date, cái nào datetime
    //   }))

    // this.loadPageSizes()
    this.loadFilter1()
    this.loadFilter2()
    // this.loadFilter3()

    let changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.getData()
			}
		})
    // this.getData()

    this.loadForm()
    //callback
    // this.onPageChangeCallback = this.pageChange.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    // this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)

    this.subArr.push(changePermissionAPI)
  }
  ngOnDestroy() {
    localStorage.removeItem('ecom001-online-order-detail')
    this.subArr.map(s => s?.unsubscribe())
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
  // loadFilter3() {
  //   this.gridDSState3 = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
  //   this.gridDSState3.sort = null
  //   this.gridDSState3.take = 0
  //   this.gridDSState3.filter.filters = []
  // }
  //API
  //dropdown
  p_GetListChannel() {
    this.loading = true;

    let sst = this.apiService.GetListChannel().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.channelList = res.ObjectReturn;
        this.channelListInhouse = this.channelList.filter(s => s.Inhouse)

        if (this.isAdd)
          this.Channel = this.channelList[2]
      }
      else if (Ps_UtilObjectService.hasListValue(res)) {
        this.channelList = res;
        this.channelListInhouse = this.channelList.filter(s => s.Inhouse)

        if (this.isAdd)
          this.Channel = this.channelList[2]
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_GetAllShippers() {
    this.loading = true;

    let sst = this.apiService.GetAllShippers().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.shipperList = res.ObjectReturn;
        this.shipperList.unshift({ Code: null, VNName: ' -- chọn -- ' })
      } else if (Ps_UtilObjectService.hasListValue(res)) {
        this.shipperList = res;
        this.shipperList.unshift({ Code: null, VNName: ' -- chọn -- ' })
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }
  p_GetAllTypeOfPayment() {
    this.loading = true;

    let sst = this.apiService.GetAllTypeOfPayment().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.paymentTypeList = res.ObjectReturn;
        this.paymentTypeList.unshift({ Code: null, TypeOfPayment: ' -- chọn -- ' })
      }
      else if (Ps_UtilObjectService.hasListValue(res)) {
        this.paymentTypeList = res;
        this.paymentTypeList.unshift({ Code: null, TypeOfPayment: ' -- chọn -- ' })
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_GetListOrderWHPickup() {
    this.loading = true;

    let sst = this.apiService.GetListOrderWHPickup().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data) && res.StatusCode == 0) {
        this.orderWHNamePickupList = []

        res.ObjectReturn.Data.forEach(s => {
          var item = {
            "WHNamePickup": s.WHNamePickup,
            "WHPickup": s.Code
          }
          this.orderWHNamePickupList.push(<DTOECOMCart>item)
        });
      }
      else if (Ps_UtilObjectService.hasListValue(res)) {
        this.orderWHNamePickupList = []

        res.forEach(s => {
          var item = {
            "WHNamePickup": s.WHNamePickup,
            "WHPickup": s.Code
          }
          this.orderWHNamePickupList.push(<DTOECOMCart>item)
        });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }
  //address
  p_GetAllProvinceInVietName() {
    this.loading = true;

    let sst = this.apiService.GetAllProvinceInVietName().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.provinceList = res.ObjectReturn;
        this.provinceList.unshift({ Code: null, VNProvince: ' -- chọn -- ' })
      }
      else if (Ps_UtilObjectService.hasListValue(res)) {
        this.provinceList = res;
        this.provinceList.unshift({ Code: null, VNProvince: ' -- chọn -- ' })
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_GetAllDistrictInProvince(province: number) {
    this.loading = true;

    let sst = this.apiService.GetAllDistrictInProvince(province).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.districtList = Ps_UtilObjectService.hasListValue(res.ObjectReturn) ? res.ObjectReturn
          : Ps_UtilObjectService.hasListValue(res) ? res : [];
        this.districtList.unshift({ Code: null, VNDistrict: ' -- chọn -- ' })

        if (!this.isAdd)
          this.getDistrictFromOrder()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_GetAllWardInDistrict(district: number) {
    this.loading = true;

    let sst = this.apiService.GetAllWardInDistrict(district).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.wardList = Ps_UtilObjectService.hasListValue(res.ObjectReturn) ? res.ObjectReturn
          : Ps_UtilObjectService.hasListValue(res) ? res : [];
        this.wardList.unshift({ Code: null, VNWard: ' -- chọn -- ' })

        if (!this.isAdd)
          this.getWardFromOrder()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }
  //order
  p_GetOrder() {
    this.loading = true;

    let sst = this.apiService.GetOrder(this.currentOrder.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        var temp: DTOECOMCart = Ps_UtilObjectService.hasValue(res.ObjectReturn) ? res.ObjectReturn
          : Ps_UtilObjectService.hasValue(res) ? res : this.currentOrder

        Ps_UtilObjectService.copyPropertyForce(temp, this.currentOrder)

        if (Ps_UtilObjectService.hasValue(this.currentOrder.OrderDate))
          this.orderDate = new Date(this.currentOrder.OrderDate)

        this.checkIsOrderLock()
        this.getNextStatusFromOrder()
        this.getChannelFromOrder()
        this.getShipperFromOrder()
        this.getProvinceFromOrder()
        this.getPaymentTypeFromOrder()

        if (Ps_UtilObjectService.hasValue(this.currentOrder.Province))
          this.p_GetAllDistrictInProvince(this.currentOrder.Province)

        if (Ps_UtilObjectService.hasValue(this.currentOrder.District)) {
          this.p_GetAllWardInDistrict(this.currentOrder.District)
        }
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_UpdateOrder(properties: string[], getOrderDetail: boolean) {
    this.loading = true;
    var ctx = (this.isAdd ? "Thêm mới" : "Cập nhật") + " đơn hàng"

    var upOrder: DTOUpdate = {
      "DTO": this.currentOrder,
      "Properties": properties
    }

    let sst = this.apiService.UpdateOrder(upOrder).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        Ps_UtilObjectService.copyPropertyForce(Ps_UtilObjectService.hasValue(res.ObjectReturn) ? res.ObjectReturn
          : Ps_UtilObjectService.hasValue(res) ? res : this.currentOrder, this.currentOrder)

        this.layoutService.onSuccess(`${ctx} thành công`)
        this.isAdd = false

        if (getOrderDetail)
          this.p_GetOrderDetails()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res?.ErrorString}`)

      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_UpdateStatus() {
    this.loading = true;
    var ctx = "Cập nhật tình trạng"
    var cartIDstatus = {
      "CartID": this.currentOrder.Code,
      "Status": this.nextStatus.StatusID,
    }

    let sst = this.apiService.UpdateStatus(cartIDstatus).subscribe(res => {
      this.loading = false;
      this.checkIsOrderLock()
      this.getNextStatusFromOrder()
      this.p_GetOrder()

      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + res?.ErrorString)
    }, (e) => {
      this.loading = false;
      this.checkIsOrderLock()
      this.getNextStatusFromOrder()
      this.p_GetOrder()
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + e.Message)
    });
    this.subArr.push(sst)
  }

  p_UpdateListOrderType(status: number, ctx: string) {
    this.loading = true;

    var cot: CartOrderType = {
      Code: this.currentOrder.Code,
      OrderTypeID: status
    }

    let sst = this.apiService.UpdateListOrderType([cot]).subscribe((res) => {
      this.loading = false;
      this.p_GetOrder()

      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + res?.ErrorString)
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
      this.p_GetOrder()
    });
    this.subArr.push(sst)
  }

  p_DeleteCart() {
    this.loading = true;
    var ctx = "Xóa đơn hàng"

    let sst = this.apiService.DeleteCart(this.currentOrder).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + res?.ErrorString)

      this.loading = false;
      this.createNewOrder()
      this.closeDeleteDialog()
    }, () => {
      this.createNewOrder()
      this.closeDeleteDialog()
      this.p_GetOrderDetails()//todo sao lại có hàm này ở đây?
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(sst)
  }
  //detail
  p_GetOrderStatus() {
    this.loading = true;

    let sst = this.apiService.GetOrderStatus(this.currentOrder.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        // this.gridDSView3.next({ data: res.ObjectReturn, total: res.ObjectReturn.length })
        this.orderStatusList = res.ObjectReturn
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_GetOrderDetails() {
    this.loading = true;

    let sst = this.apiService.GetOrderDetails(this.currentOrder.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.orderDetails = res.ObjectReturn;
      }
      this.SplitOrderDetailsToGrids()
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_GetOrderDetailByID() {
    this.loading = true;
    var ctx = "sản phẩm"

    let sst = this.apiService.GetOrderDetailByID(this.currentOrderDetail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.currentOrderDetail = Ps_UtilObjectService.hasValue(res.ObjectReturn) ? res.ObjectReturn
          : Ps_UtilObjectService.hasValue(res) ? res : this.currentOrderDetail;
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
    this.subArr.push(sst)
  }

  p_GetProduct() {
    this.loading = true;
    var ctx = "sản phẩm"

    let sst = this.apiService.GetProduct(this.currentOrder.Code, this.currentOrderDetail.Barcode).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        // this.currentOrderDetail = Ps_UtilObjectService.hasValue(res.ObjectReturn) ? res.ObjectReturn
        //   : Ps_UtilObjectService.hasValue(res) ? res : this.currentOrderDetail;
        this.currentOrderDetail = res.ObjectReturn
        this.layoutService.onSuccess(`Tìm thấy ${ctx}`)
      }
      else if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValueString(res.Barcode)) {
        this.currentOrderDetail = res
        this.layoutService.onSuccess(`Tìm thấy ${ctx}`)
      }
      else
        this.layoutService.onError(`Không tìm thấy ${ctx} với barcode ${this.currentOrderDetail.Barcode}, lỗi: ${res?.ErrorString}, ${res?.Messsage}`)

      this.calculateThanhTienOnForm()
      this.loading = false;
    }, (e) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi tìm ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_UpdateCartDetail() {
    this.loading = true;
    var ctx = (this.isAdd ? "Thêm mới" : "Cập nhật") + " sản phẩm"

    let sst = this.apiService.UpdateCartDetail(this.currentOrderDetail).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res?.ErrorString}`)

      this.loading = false;
      this.p_GetOrder()

      // if (res != null) {
      //   if (this.currentOrderDetail.Code == 0) {
      //     this.orderDetails.push(res)
      //     this.SplitOrderDetailsToGrids()
      //   } else
      //     this.p_GetOrderDetails()
      // } else
      this.p_GetOrderDetails()
      this.closeForm()
    }, (e) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
      this.p_GetOrder()

      // if (res != null) {
      //   if (this.currentOrderDetail.Code == 0) {
      //     this.orderDetails.push(res)
      //     this.SplitOrderDetailsToGrids()
      //   } else
      //     this.p_GetOrderDetails()
      // } else
      this.p_GetOrderDetails()
      this.closeForm()
    });
    this.subArr.push(sst)
  }

  p_DeleteCartDetail() {
    this.loading = true;
    var ctx = "Xóa sản phẩm"

    let sst = this.apiService.DeleteCartDetail(this.currentOrderDetail).subscribe(res => {
      this.p_GetOrder()

      if (Ps_UtilObjectService.hasValue(res)) {
        var i = this.orderDetails.findIndex(s => s.Code == this.currentOrderDetail.Code)
        this.orderDetails.splice(i, 1)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.p_GetOrderDetails()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res?.ErrorString}`)
      }

      this.layoutService.onSuccess(`${ctx} thành công`)
      this.closeDeleteDialog()
      this.loading = false;
    }, (e) => {
      this.p_GetOrder()
      this.p_GetOrderDetails()
      this.closeDeleteDialog()
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(sst)
  }
  //coupon
  p_GetListCartCoupon() {
    this.loading = true;

    let sst = this.apiService.GetListCartCoupon(this.currentOrder.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.couponList = res.ObjectReturn;
      }
      else if (Ps_UtilObjectService.hasListValue(res)) {
        this.couponList = res
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_UpdateCartCoupon() {
    this.loading = true;
    var ctx = "Thêm mới coupon"
    this.currentCoupon.Cart = this.currentOrder.Code

    let sst = this.apiService.UpdateCartCoupon(this.currentCoupon).subscribe(res => {
      this.p_GetOrder()

      var temp = Ps_UtilObjectService.hasValue(res.ObjectReturn) ? res.ObjectReturn
        : Ps_UtilObjectService.hasValue(res) ? res : null;

      if (Ps_UtilObjectService.hasValue(temp)) {
        this.couponList.push(temp);
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.p_GetListCartCoupon()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res?.ErrorString}`)
      }

      this.currentCoupon.CouponNo = ""
      this.layoutService.onSuccess(`${ctx} thành công`)
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
      this.p_GetOrder()
      this.p_GetListCartCoupon()
      this.currentCoupon.CouponNo = ""
    });
    this.subArr.push(sst)
  }

  p_DeleteCartCoupon() {
    this.loading = true;
    var ctx = "Xóa coupon"

    let sst = this.apiService.DeleteCartCoupon(this.currentDeleteCoupon).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        var cp = this.couponList.findIndex(s => s.Code == this.currentDeleteCoupon.Code)
        this.couponList.splice(cp, 1)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.p_GetListCartCoupon()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res?.ErrorString}`)
      }

      this.closeDeleteDialog()
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
      this.p_GetListCartCoupon()
      this.closeDeleteDialog()
    });
    this.subArr.push(sst)
  }
  //Gift
  p_GetOrderGift() {
    this.loading = true;

    let sst = this.apiService.GetOrderGift(this.currentOrder.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.giftList = res.ObjectReturn;
      }
      else if (Ps_UtilObjectService.hasListValue(res)) {
        this.giftList = res;
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_GetGiftProduct() {
    this.loading = true;

    let sst = this.apiService.GetGiftProduct(this.currentOrder.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.giftProductList = res.ObjectReturn;
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_GetGiftBill() {
    this.loading = true;

    let sst = this.apiService.GetGiftBill(this.currentOrder.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.giftBillList = res.ObjectReturn;
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_UpdateCartGift() {
    this.loading = true;
    var ctx = "Cập nhật Quà tặng"

    let sst = this.apiService.UpdateCartGift(this.selectedGiftList).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi ${ctx}: ${res?.ErrorString}`)

      this.loading = false;
      this.p_GetOrderGift()
      this.drawer.close()
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi ${ctx}`)
      this.loading = false;
      this.p_GetOrderGift()
      this.drawer.close()
    });
    this.subArr.push(sst)
  }

  p_DeleteCartGift() {
    this.loading = true;
    var ctx = "Xóa Quà tặng"

    let sst = this.apiService.DeleteCartGift(this.currentGift).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        var i = this.giftList.findIndex(s => s.Code == this.currentGift.Code)
        this.giftList.splice(i, 1)
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
      } else {
        this.p_GetOrderGift()
        this.layoutService.onError(`Đã xảy ra lỗi ${ctx}: ${res?.ErrorString}`)
      }

      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi ${ctx}`)
      this.loading = false;
      this.p_GetOrderGift()
      this.deleteDialogOpened = false
    });
    this.subArr.push(sst)
  }
  //File  
  p_PrintPXK(list: number[]) {
    this.loading = true;
    var ctx = "In Phiếu Xuất Kho"

    let sst = this.apiService.PrintPXK(list).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi ${ctx}: ${res?.ErrorString}`)

      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_PrintLabel(list: number[]) {
    this.loading = true;
    var ctx = "In Mã Vận Đơn"

    let sst = this.apiService.PrintLabel(list).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi ${ctx}: ${res?.ErrorString}`)

      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(sst)
  }
  //
  getData() {
    this.getNextStatusFromOrder()
    this.p_GetListChannel()
    this.p_GetAllShippers()
    this.p_GetAllTypeOfPayment()
    this.p_GetAllProvinceInVietName()
    this.p_GetListOrderWHPickup()

    if (this.isAdd)
      this.pageable1 = this.pageable2 = false
    else {
      this.p_GetOrder()
      this.p_GetOrderStatus()
      this.p_GetListCartCoupon()
      this.p_GetOrderDetails()
      this.p_GetOrderGift()
    }
  }

  getNextStatusFromOrder() {
    switch (this.currentOrder.StatusID) {
      case 6:
        this.nextStatus.StatusID = 7
        this.nextStatus.StatusName = 'Tiếp nhận đơn hàng'
        break
      case 7:
        this.nextStatus.StatusID = 8
        this.nextStatus.StatusName = 'Soạn hàng'
        break
      // case 8:
      //   this.nextStatus.StatusID = 9
      //   this.nextStatus.StatusName = 'Kiểm tra xuất hàng'
      //   break
      case 9:
        this.nextStatus.StatusID = 10
        this.nextStatus.StatusName = 'Hoàn tất đóng gói'
        break
      case 10:
        this.nextStatus.StatusID = 11
        this.nextStatus.StatusName = 'Giao nhà v/chuyển'
        break
      case 25:
        this.nextStatus.StatusID = 11
        this.nextStatus.StatusName = 'Giao nhà v/chuyển'
        break
      case 26:
        this.nextStatus.StatusID = 11
        this.nextStatus.StatusName = 'Giao nhà v/chuyển'
        break
      case 11:
        this.nextStatus.StatusID = 12
        this.nextStatus.StatusName = 'Hoàn tất giao hàng'
        break
      case 17:
        this.nextStatus.StatusID = 6
        this.nextStatus.StatusName = 'Khách đặt hàng'
        break
      default:
        this.nextStatus.StatusID = 0
        this.nextStatus.StatusName = ''
        break
    }
  }

  getChannelFromOrder() {
    if (Ps_UtilObjectService.hasListValue(this.channelList)) {
      var channel = this.channelList.find(s => s.Code == this.currentOrder.Channel)
      this.Channel = channel != undefined ? channel : this.channelList[2]
    }
  }
  getShipperFromOrder() {
    if (Ps_UtilObjectService.hasListValue(this.shipperList)) {
      var shipper = this.shipperList.find(s => s.Code == this.currentOrder.ShipmentID)
      this.ShipmentID = shipper != undefined ? shipper : new DTOShipper()
    }
  }
  getPaymentTypeFromOrder() {
    if (Ps_UtilObjectService.hasListValue(this.paymentTypeList)) {
      var PaymentID = this.paymentTypeList.find(s => s.Code == this.currentOrder.PaymentID)
      this.PaymentID = PaymentID != undefined ? PaymentID : new DTOCOLSTypeOfPayment()
    }
  }
  getProvinceFromOrder() {
    if (Ps_UtilObjectService.hasListValue(this.provinceList)) {
      var province = this.provinceList.find(s => s.Code == this.currentOrder.Province)
      this.Province = province != undefined ? province : new DTOLSProvince()
    }
  }
  getDistrictFromOrder() {
    if (Ps_UtilObjectService.hasListValue(this.districtList)) {
      var district = this.districtList.find(s => s.Code == this.currentOrder.District)
      this.District = district != undefined ? district : new DTOLSDistrict()
    }
  }
  getWardFromOrder() {
    if (Ps_UtilObjectService.hasListValue(this.wardList)) {
      var ward = this.wardList.find(s => s.Code == this.currentOrder.Ward)
      this.Ward = ward != undefined ? ward : new DTOLSWard()
    }
  }

  checkIsOrderLock() {
    var permission = localStorage.getItem('Permission')

    if (Ps_UtilObjectService.hasValueString(permission)) {
      var perm: DTOPermission = JSON.parse(permission)
      this.dataPerm = distinct(perm.DataPermission, 'Warehouse')
    }

    var isPermited: boolean = !Ps_UtilObjectService.hasValue(this.currentOrder.WHPickup) || this.isAdmin ? true
      : this.dataPerm.findIndex(s => s.Warehouse == this.currentOrder.WHPickup) != -1
    //isPermited = true
    this.statusIsLowerThan8 = false
    this.statusIsLowerThan10 = false
    this.isLockAll = false

    if (!isPermited) {
      this.isLockAll = true
    } else {
      if (this.currentOrder.IsLock) {
        if (this.currentOrder.OrderTypeID == 13) {
          //#region  luồng cũ
          // if (this.currentOrder.StatusID < 8) {
          //   this.isLockAll = true
          //   //cho phép sửa  ghi chú đơn hàng, đơn vị v/chuyển
          //   this.statusIsLowerThan8 = true
          // } else if (this.currentOrder.StatusID < 10) {
          //   this.isLockAll = true
          //   //cho phép sửa  mã vận đơn
          //   this.statusIsLowerThan10 = true
          // } else
          //   this.isLockAll = true
          //#endregion
          if (this.currentOrder.StatusID < 11 || this.currentOrder.StatusID == 17) {
            this.isLockAll = true
            //cho phép sửa  ghi chú đơn hàng, đơn vị v/chuyển
            this.statusIsLowerThan8 = true
            //cho phép sửa  mã vận đơn
            this.statusIsLowerThan10 = true
          } else
            this.isLockAll = true

        } else
          this.isLockAll = true
      }
    }
  }
  checkIsAllowedToAssignWHPickup() {
    var permission = localStorage.getItem('Permission')

    if (Ps_UtilObjectService.hasValueString(permission)) {
      var perm: DTOPermission = JSON.parse(permission)
      this.actionPerm = distinct(perm.ActionPermission, 'ActionType')
    }

    this.isAssignWHPickupAllowed = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
    this.isAdmin = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
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
      'Barcode': new UntypedFormControl(this.currentOrderDetail.Barcode, Validators.required),
      'IsHachi24h': new UntypedFormControl({ value: this.currentOrderDetail.IsHachi24h, disabled: true }),
      'ImageSetting': new UntypedFormControl(this.currentOrderDetail.ImageSetting),
      'ShippedQuantity': new UntypedFormControl(this.currentOrderDetail.ShippedQuantity, Validators.required),
      'UnitPrice': new UntypedFormControl({ value: this.currentOrderDetail.UnitPrice, disabled: true }),
      'BasePrice': new UntypedFormControl({ value: this.currentOrderDetail.BasePrice, disabled: true }),
      'ThanhTien': new UntypedFormControl({ value: 0, disabled: true }),
    })
    this.calculateThanhTienOnForm()
  }
  ///CLICK EVENT
  //header
  print() {
    if (this.currentOrder.Code > 0)
      this.p_PrintPXK([this.currentOrder.Code])
  }

  onAssignWHPickup() {
    this.AssignWHPickupDialogOpened = true
  }

  updateOrderType(orderTypeID: number) {
    if (orderTypeID == 14)
      this.p_UpdateListOrderType(13, 'Lấy lại Đơn hàng')
    else if (orderTypeID == 13)
      this.p_UpdateListOrderType(14, 'Dừng xử lý Đơn hàng')
    else
      this.p_UpdateListOrderType(16, 'Hủy đơn hàng')
  }

  updateStatus() {
    if (this.currentOrder.Code > 0)
      this.p_UpdateStatus()
  }

  onDeleteOrder() {
    this.context = this.ctxDonhang
    this.contextObjectName = this.currentOrder.CartNo
    this.deleteDialogOpened = true
  }

  createNewOrder() {
    this.context = ''
    this.contextObjectName = ''
    this.orderDate = null

    this.isAdd = true
    this.isAddItem = true

    this.grid1Null = true
    this.grid2Null = true
    //order
    this.currentOrder = new DTOECOMCart()
    this.getNextStatusFromOrder()
    //validate
    this.checkIsOrderLock()
    this.isBillFormValid = false
    //coupon
    this.couponList = []
    this.currentCoupon.CouponNo = ''
    this.currentCoupon.Cart = 0
    //detail
    this.orderDetails = []
    this.orderDetailsGroups = []
    this.currentOrderDetail = new DTOOrderDetail()
    //gift
    this.giftList = []
    this.selectedGiftList = []
    this.currentGift = new DTOOrderDetail()

    this.giftProductList = []
    this.giftBillList = []
    //dropdown
    this.Channel = this.channelList[2]
    this.ShipmentID = new DTOShipper()
    this.Province = new DTOLSProvince()
    this.District = new DTOLSDistrict()
    this.Ward = new DTOLSWard()
    this.PaymentID = new DTOCOLSTypeOfPayment()
  }
  //THÔNG TIN ĐƠN HÀNG
  onDropdownlistClick(e, dropdownName: string) {
    this[dropdownName] = e
    this.currentOrder[dropdownName] = this[dropdownName].Code

    switch (dropdownName) {
      case 'Province':
        this.wardList = []
        this.Ward = new DTOLSWard()
        this.p_GetAllDistrictInProvince(this.currentOrder.Province)
        break
      case 'District':
        this.wardList = []
        this.Ward = new DTOLSWard()
        this.p_GetAllWardInDistrict(this.currentOrder.District)
        break
      default:
        break
    }
    this.p_UpdateOrder([dropdownName], false)
    // if (dropdownName == 'Channel') {
    // this.Channel = e
    // this.currentOrder.Channel = this.Channel.Code
    // this.p_UpdateOrder(['Channel'], false)
    // }
    // else if (dropdownName == 'Shipper') {
    //   this.ShipmentID = e
    //   this.currentOrder.ShipmentID = this.ShipmentID.Code
    //   this.p_UpdateOrder(['ShipmentID'], false)
    // }
    // else if (dropdownName == 'PaymentID') {
    //   this.PaymentID = e
    //   this.currentOrder.PaymentID = this.PaymentID.Code
    //   this.p_UpdateOrder(['PaymentID'], false)
    // }
    // else if (dropdownName == 'Province') {
    //   this.Province = e
    //   this.currentOrder.Province = this.Province.Code
    //   this.p_UpdateOrder(['Province'], false)
    //   this.p_GetAllDistrictInProvince(this.currentOrder.Province)
    //   this.wardList = []
    //   this.Ward = new DTOLSWard()
    // }
    // else if (dropdownName == 'District') {
    //   this.District = e
    //   this.currentOrder.District = this.District.Code
    //   this.p_UpdateOrder(['District'], false)
    //   this.p_GetAllWardInDistrict(this.currentOrder.District)
    // }
    // else if (dropdownName == 'Ward') {
    //   this.Ward = e
    //   this.currentOrder.Ward = this.Ward.Code
    //   this.p_UpdateOrder(['Ward'], false)
    // }
  }

  onDeleteCoupon(cp: DTOCoupon) {
    this.context = this.ctxCoupon
    this.currentDeleteCoupon = cp
    this.contextObjectName = this.currentDeleteCoupon.CouponNo
    this.deleteDialogOpened = true
  }

  onDeleteGift(gift: DTOOrderDetail) {
    this.context = this.ctxQuatang
    this.currentGift = gift
    this.contextObjectName = this.currentGift.VNName
    this.deleteDialogOpened = true
  }

  printLabel() {
    if ((this.isLockAll && !this.statusIsLowerThan10) || !(this.currentOrder.Code != 0 && Ps_UtilObjectService.hasValueString(this.currentOrder.TrackingNo)))
      this.layoutService.onError('Đơn hàng có Tình trạng không hợp lý hoặc không có Mã vận đơn')

    if (this.currentOrder.Code != 0 && Ps_UtilObjectService.hasValueString(this.currentOrder.TrackingNo))
      this.p_PrintLabel([this.currentOrder.Code])
  }
  //dialog
  closeDeleteDialog() {
    this.deleteDialogOpened = false
    this.context = ''
    this.contextObjectName = ''
  }

  closeAssignWHPickupDialog(refresh: boolean) {
    if (refresh) {
      this.getData()
    }
    this.AssignWHPickupDialogOpened = false
  }

  delete() {
    if (this.context == this.ctxCoupon) {
      this.p_DeleteCartCoupon()
    }
    else if (this.context == this.ctxSanpham) {
      this.p_DeleteCartDetail()
    }
    else if (this.context == this.ctxQuatang) {
      this.p_DeleteCartGift()
    }
    else if (this.context == this.ctxDonhang) {
      this.p_DeleteCart()
    }
  }
  //THÔNG TIN CHI TIẾT ĐƠN HÀNG
  onAdd(isaddsp: boolean) {
    this.isAddItem = true
    this.isAddSp = isaddsp;
    this.clearForm()
    this.drawer.open();
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
      if (menu.Link == 'edit' || menu.Code == 'pencil') {
        this.currentOrderDetail = item
        // this.currentOrderDetailEdit = item
        this.onEdit(true)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.currentOrderDetail = item
        // this.currentOrderDetailEdit = item
        this.context = this.ctxSanpham
        this.contextObjectName = this.currentOrderDetail.VNName
        this.deleteDialogOpened = true
      }
  }
  onSelectedPopupBtnClick(list: DTOOrderDetail[]) {
    if (list.length > 0) {
      //todo
    }
  }
  //FORM button
  syncStatus() {
    alert('tính năng Đồng bộ tình trạng đơn đang phát triển')
  }
  updateOrderDetail() {
    this.form.markAllAsTouched();

    if (this.form.status == 'INVALID') {
      if (this.currentOrderDetail.ShippedQuantity <= 0)
        this.layoutService.onError("Số lượng phải lớn hơn 0")
      else
        this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
    } else {
      this.p_UpdateCartDetail()
    }
  }

  updateCartGift() {
    this.selectedGiftList = []

    this.giftProductList.forEach(p => p.ListOfGift.forEach(s => {
      var asd = new DTOOrderDetail()
      asd.Cart = this.currentOrder.Code
      asd.ProductID = s.Gift
      asd.ShippedQuantity = asd.ShippedQuantity = s.OrderQuantity

      this.selectedGiftList.push(asd)
    }))

    this.giftBillList.forEach(p => p.ListOfGift.forEach(s => {
      var asd = new DTOOrderDetail()
      asd.Cart = this.currentOrder.Code
      asd.ProductID = s.Gift
      asd.ShippedQuantity = asd.ShippedQuantity = s.OrderQuantity

      this.selectedGiftList.push(asd)
    }))

    this.p_UpdateCartGift()
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
  //AUTORUN
  onTextboxLoseFocus(prop: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        case 'CouponNo':
          if (Ps_UtilObjectService.hasValueString(this.currentCoupon.CouponNo))
            this.p_UpdateCartCoupon()
          break
        case 'Barcode':
          if (Ps_UtilObjectService.hasValueString(this.currentOrderDetail.Barcode)
            && Ps_UtilObjectService.hasValue(this.currentOrder.Code) && this.drawer.opened)
            this.p_GetProduct()
          break
        case 'OrderPhone':
          this.p_UpdateOrder([prop], true)
          break
        default:
          this.p_UpdateOrder([prop], false)
          break
      }
    }
  }

  onTextboxGiftLoseFocus(prod: DTOGiftProduct, obj: DTOGift) {
    var quantity = obj.OrderQuantity

    if (Ps_UtilObjectService.hasValue(quantity)) {
      var min = obj.MinQuantity
      var max = obj.MaxQuantity

      if (quantity < min) {
        obj.OrderQuantity = min
        this.layoutService.onInfo('Số lượng tối thiểu của Quà tặng "'
          + obj.VNGift + '" là ' + min)
      } else if (quantity > max) {
        obj.OrderQuantity = max
        this.layoutService.onInfo('Số lượng tối đa của Quà tặng "'
          + obj.VNGift + '" là ' + max)
      }
    }
    this.checkGiftSumOfProduct(prod, obj)
  }

  onCheckboxGiftValueChange(prod: DTOGiftProduct, obj: DTOGift, ev?) {
    this.checkGiftSumOfProduct(prod, obj)
  }

  onDatepickerChange(prop: string, ev?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.currentOrder.OrderDate = this.orderDate
      this.p_UpdateOrder([prop], false)
    }
  }

  selectedBtnChange(prop: string, e) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.currentOrder.IsAnonymous = e
      this.p_UpdateOrder([prop], false)
    }
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