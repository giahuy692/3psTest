import { Component, OnInit, ViewChild } from '@angular/core';
import { State, CompositeFilterDescriptor, FilterDescriptor, toDataSourceRequest, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { from, Subject, Subscription } from 'rxjs';
import { DTOECOMCart } from '../../shared/dto/DTOECOMCart.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { EcomService } from '../../shared/services/ecom.service';
import { EcomAPIService } from '../../shared/services/ecom-api.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOECOMCartCount } from '../../shared/dto/DTOECOMCartCount';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { CartOrderStatus } from '../../shared/dto/CartOrderStatus';
import { CartOrderType } from '../../shared/dto/CartOrderType';
import { Router } from '@angular/router';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { faPeopleArrows } from '@fortawesome/free-solid-svg-icons';
import { EcomChannelAPIService } from '../../shared/services/ecom-channel-api.service';
import DTOChannel from '../../shared/dto/DTOChannel.dto';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DTOMAStore } from 'src/app/p-app/p-marketing/shared/dto/DTOMAStore.dto';
import { EcomAppCartAPIService } from '../../shared/services/ecom-appcart-api.service';

@Component({
  selector: 'app-ecom001-online-order',
  templateUrl: './ecom001-online-order.component.html',
  styleUrls: ['./ecom001-online-order.component.scss']
})
export class Ecom001OnlineOrderComponent implements OnInit {
  //icon
  faPeopleArrows = faPeopleArrows
  //header1
  listStatus = [
    {
      Total: 0,
      StatusName: 'ĐH đang xử lý',
      Checked: true,
      Filter: { field: "OrderTypeID", operator: "eq", value: 13 }
    },
    {
      Total: 0,
      StatusName: 'ĐH treo',
      Checked: true,
      Filter: { field: "OrderTypeID", operator: "eq", value: 14 }
    },
    {
      Total: 0,
      StatusName: 'ĐH hoàn tất',
      Checked: false,
      Filter: { field: "OrderTypeID", operator: "eq", value: 15 }
    },
    {
      Total: 0,
      StatusName: 'ĐH hủy',
      Checked: false,
      Filter: { field: "OrderTypeID", operator: "eq", value: 16 }
    },
  ]

  addMenuList: any[] = [
    {
      text: 'Thêm mới đơn',
      value: 1,
    },
    {
      text: 'Đồng bộ đơn',
      value: 2,
    },
  ]
  templateMenuList: any[] = [
    {
      text: 'Template đơn hàng online',
      value: 1,
    },
    {
      text: 'Template hóa đơn thuế VAT',
      value: 2,
    },
  ]
  //
  syncOrderForm: FormGroup
  syncOrderDialog: boolean = false
  //header2
  hachi_24_checked = false
  //dialog
  deleteDialogOpened = false
  AssignWHPickupDialogOpened = false
  AssignUserDialogOpened = false

  deleteDialogCtx = ''
  selectedRowitemDialogOpened = false
  isFilterActive = true
  //popup  
  allowActionDropdown = ['edit', 'print', 'delete']
  //DTO
  order = new DTOECOMCart()
  //List DTO
  orderListCount = new Array<DTOECOMCartCount>()
  orderList = new Array<DTOECOMCart>()
  selectedOrderList = new Array<DTOECOMCart>()

  orderStatusList = new Array<DTOECOMCart>()
  orderWHNamePickupList = new Array<DTOMAStore>()
  paymentTypeList = new Array<DTOECOMCart>()
  onlineUserList = []
  //Grid
  loading = true
  pageSize: number = 25
  pageSizes: number[] = [this.pageSize]
  //Grid setting
  gridDSState: State = {}
  gridDSView = new Subject<any>();
  //sort
  sortByIsHachi24: SortDescriptor = {
    field: 'IsHachi24',
    dir: 'desc'
  }
  sortByStatusOrderBy: SortDescriptor = {
    field: 'StatusOrderBy',
    dir: 'asc'
  }

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  ////filter
  ///header1
  filterOrderTypeIDs: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  ///header2
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterCartNo: FilterDescriptor = {
    field: "CartNo", operator: "contains", value: null
  }
  filterReceivedBy: FilterDescriptor = {
    field: "ReceivedBy", operator: "contains", value: null
  }
  filterFullAddress: FilterDescriptor = {
    field: "FullAddress", operator: "contains", value: null
  }
  filterTrackingNo: FilterDescriptor = {
    field: "TrackingNo", operator: "contains", value: null
  }
  //checkbox
  filterIsHachi24: FilterDescriptor = {
    field: "IsHachi24", operator: "eq", value: true
  }
  filterChannels: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  @ViewChild('multiSelect') multiSelect
  //grid  
  filterStatusID_checked = false
  filterWHPickup_checked = false
  filterPayment_checked = false
  filterPaymentID_checked = false
  //
  filterStatusID: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: null
  }
  filterWHPickup: FilterDescriptor = {
    field: "WHPickUp", operator: "eq", value: null
  }
  filterPayment: FilterDescriptor = {
    field: "Payment", operator: "eq", value: null
  }
  filterPaymentID: FilterDescriptor = {
    field: "PaymentID", operator: "eq", value: null
  }
  //
  filterStatusIDItem = { "text": null, "value": null }
  filterWHPickupItem = { "text": null, "value": null }
  filterPaymentIDItem = { "text": null, "value": null }
  //header2
  listChannel: DTOChannel[] = []
  listFilterChannel: DTOChannel[] = []
  listSelectedChannel: DTOChannel[] = [...this.listChannel]
  //
  @ViewChild('ecom001_online_order') ecom001_online_order
  //CALLBACK
  //rowItem action dropdown
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onSortChangeCallback: Function
  onFilterChangeCallback: Function
  //
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  //
  uploadEventHandlerCallback: Function
  //perm
  dataPerm: DTODataPermission[] = []
  actionPerm: DTOActionPermission[] = []
  isAssignWHPickupAllowed = false
  isUploadDownloadAllowed = false
  isAdmin = false
  justLoaded = true
  //subscription
  subArr: Subscription[] = []

  constructor(public router: Router,
    public menuService: PS_HelperMenuService,
    public service: EcomService,
    public apiService: EcomAPIService,
    public apiChannelService: EcomChannelAPIService,
    public layoutService: LayoutService,
    public layoutAPIService: LayoutAPIService,
    public apiHachiService: EcomAppCartAPIService,
  ) { }

  ngOnInit(): void {
    let that = this
    this.loadFilter()

    let sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false
        that.dataPerm = distinct(res.DataPermission, "Warehouse")
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isAdmin = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAssignWHPickupAllowed = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isUploadDownloadAllowed = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        // that.getData()
      }
    })

    let changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        that.getData()
			}
		})

    this.subArr.push(sst, changePermissionAPI)
    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    this.onFilterChangeCallback = this.filterChange.bind(this)
    //select
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    //dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    //
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //form
    this.loadSyncOrderForm()
  }

  ngOnDestroy() {
    this.subArr.forEach(s => s?.unsubscribe())
  }
  ///API
  p_GetListOrdersCount() {
    this.loading = true;

    let sst = this.apiService.GetListOrdersCount().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.orderListCount = res.ObjectReturn;
        this.getDonHangCount()
      } else if (Ps_UtilObjectService.hasListValue(res)) {
        this.orderListCount = res;
        this.getDonHangCount()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_GetListOrderStatus() {
    this.loading = true;

    let sst = this.apiService.GetListOrderStatus().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.orderStatusList = []

        res.ObjectReturn.forEach(s => {
          var item = {
            "StatusName": s.StatusName,
            "StatusID": s.Code
          }
          this.orderStatusList.push(<DTOECOMCart>item)
        });
      } else if (Ps_UtilObjectService.hasListValue(res)) {
        this.orderStatusList = []

        res.forEach(s => {
          var item = {
            "StatusName": s.StatusName,
            "StatusID": s.Code
          }
          this.orderStatusList.push(<DTOECOMCart>item)
        });
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
        // res.ObjectReturn.Data.forEach(s => {
        //   var item = {
        //     "WHNamePickup": s.WHName,
        //     "WHPickup": s.Code
        //   }
        //   this.orderWHNamePickupList.push(<DTOMAStore>item)
        // });
        this.orderWHNamePickupList = res.ObjectReturn.Data
      }
      else if (Ps_UtilObjectService.hasListValue(res)) {
        this.orderWHNamePickupList = []
        // res.forEach(s => {
        //   var item = {
        //     "WHNamePickup": s.WHNamePickup,
        //     "WHPickup": s.Code
        //   }
        //   this.orderWHNamePickupList.push(<DTOMAStore>item)
        // });
        this.orderWHNamePickupList = res
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
        this.paymentTypeList = []

        res.ObjectReturn.forEach(s => {
          var item = {
            "TypeOfPayment": s.TypeOfPayment,
            "PaymentID": s.Code
          }
          this.paymentTypeList.push(<DTOECOMCart>item)
        });
      } else if (Ps_UtilObjectService.hasListValue(res)) {
        this.paymentTypeList = []

        res.forEach(s => {
          var item = {
            "TypeOfPayment": s.TypeOfPayment,
            "PaymentID": s.Code
          }
          this.paymentTypeList.push(<DTOECOMCart>item)
        });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  GetChannelList() {
    this.loading = true;
    var ctx = 'Danh sách kênh bán hàng'


    let filterDaDuyet: FilterDescriptor = {
      field: "StatusID", operator: "eq", value: 2
    }

    let gridState: State = {
      filter: { filters: [filterDaDuyet], logic: 'and' },
    }

    let sst = this.apiChannelService.GetChannelList(gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && Ps_UtilObjectService.hasValue(res.ObjectReturn.Data)) {
          this.listChannel = res.ObjectReturn.Data;
          this.listFilterChannel = res.ObjectReturn.Data;
          this.onMultiSelectFilter()
        }
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res?.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
    this.subArr.push(sst)
  }

  p_GetListOrders() {
    this.loading = true;

    let sst = this.apiService.GetListOrders(toDataSourceRequest(this.gridDSState)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.orderList = res.ObjectReturn.Data as DTOECOMCart[];
        this.gridDSView.next({ data: this.orderList, total: res.ObjectReturn.Total });
      } else {
        this.gridDSView.next({ data: [], total: 0 });
      }
      this.loading = false;
    }, () => {
      this.gridDSView.next({ data: [], total: 0 });
      this.loading = false;
    });
    this.subArr.push(sst)
  }
  //
  p_UpdateStatus(id: number, status: number) {//todo sau này loại cart khỏi grid theo filter để giảm tải api
    this.loading = true;
    var ctx = "Cập nhật tình trạng"
    var cartIDstatus = {
      "CartID": id,
      "Status": status,
    }

    let sst = this.apiService.UpdateStatus(cartIDstatus).subscribe(res => {
      this.loading = false;
      this.p_GetListOrders()

      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + res?.ErrorString + res.Message);
    }, (e) => {
      this.loading = false;
      this.p_GetListOrders()
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + e.Message)
    });
    this.subArr.push(sst)
  }

  p_UpdateListStatus(list: CartOrderStatus[]) {//todo sau này loại cart khỏi grid theo filter để giảm tải api
    this.loading = true;
    var ctx = "Cập nhật tình trạng"

    let sst = this.apiService.UpdateListStatus(list).subscribe(res => {
      this.loading = false;
      this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
      this.p_GetListOrders()

      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + res?.ErrorString)
    }, (e) => {
      this.loading = false;
      this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
      this.p_GetListOrders()
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + e.Message)
    });
    this.subArr.push(sst)
  }

  p_UpdateListOrderType(list: CartOrderType[], ctx: string) {
    this.loading = true;

    let sst = this.apiService.UpdateListOrderType(list).subscribe((res) => {
      this.loading = false;
      this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
      this.p_GetListOrders()

      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + res?.ErrorString)
    }, () => {
      this.loading = false;
      this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
      this.p_GetListOrders()
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    });
    this.subArr.push(sst)
  }

  p_SyncOrder(Channel: number, CartNo: string) {
    this.loading = true;
    var ctx = "Lấy đơn hàng " + CartNo
    var param = {
      "Channel": Channel,
      "CartNo": CartNo,
    }

    let sst = (Channel == 1 ? this.apiHachiService.SynOrder(CartNo) : this.apiService.SynOrder(param)).subscribe((res) => {
      this.loading = false;

      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.toggleSyncOrderDialog(false)
        this.p_GetListOrders()
      } else {
        var err = `Đã xảy ra lỗi khi ${ctx}: ` + res?.ErrorString
        this.layoutService.onError(err)
        this.syncOrderForm.setErrors({ apiError: err })
      }
    }, (e) => {
      this.loading = false;
      var err = `Đã xảy ra lỗi khi ${ctx}: ` + e?.Message
      this.layoutService.onError(err)
      this.syncOrderForm.setErrors({ apiError: err })
    });
    this.subArr.push(sst)
  }

  p_CancelOrder(id: number) {
    this.loading = true;
    var ctx = "Hủy đơn hàng"
    var cartID = {
      "CartID": id,
    }

    let sst = this.apiService.CancelOrder(cartID).subscribe((res) => {
      this.loading = false;
      this.closeDeleteDialog()
      this.p_GetListOrders()

      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + res?.ErrorString)
    }, () => {
      this.loading = false;
      this.closeDeleteDialog()
      this.p_GetListOrders()
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    }, () =>
      this.p_GetListOrders()
    );
    this.subArr.push(sst)
  }

  p_DeleteCart() {
    this.loading = true;
    var ctx = "Xóa đơn hàng"

    let sst = this.apiService.DeleteCart(this.order).subscribe((res) => {
      this.loading = false;
      this.closeDeleteDialog()

      if (Ps_UtilObjectService.hasValue(res)) {
        var i = this.orderList.findIndex(s => s.Code == this.order.Code)
        this.orderList.splice(i, 1)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.p_GetListOrders()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ` + res?.ErrorString)
      }
    }, () => {
      this.loading = false;
      this.closeDeleteDialog()
      this.p_GetListOrders()
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    });
    this.subArr.push(sst)
  }
  //file
  p_PrintPXK(list: number[]) {
    this.loading = true;
    var ctx = "In Phiếu Xuất Kho"

    let sst = this.apiService.PrintPXK(list).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_DownloadExcel() {
    this.loading = true
    var ctx = "Download Excel Template"
    var getfileName = "OnlineOrdersTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let sst = this.layoutAPIService.GetTemplate(getfileName).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let sst = this.layoutAPIService.ImportExcelOrders(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res?.ErrorString}`)
      } else {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      }
      this.loading = false;
      this.getData()
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }
  //get data
  getData() {
    this.GetChannelList()
    this.p_GetListOrdersCount()
    this.p_GetListOrderStatus()
    this.p_GetListOrderWHPickup()
    this.p_GetAllTypeOfPayment()
    this.p_GetListOrders()
  }

  loadSyncOrderForm() {
    this.syncOrderForm = new UntypedFormGroup({
      'Channel': new UntypedFormControl(null, Validators.required),
      'CartNo': new UntypedFormControl(null, Validators.required),
    })
    this.syncOrderForm.markAllAsTouched()
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.p_GetListOrders()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.p_GetListOrders()
  }
  filterChange(event: FilterDescriptor | CompositeFilterDescriptor) {
    // nếu dùng p-kendo-grid
    var ev1 = <CompositeFilterDescriptor>event
    // nếu dùng app-p-kendo-grid-dropdownlist
    var ev2 = <FilterDescriptor>event
    this.ecom001_online_order.nativeElement.click()//giấu filter bằng click out

    if (Ps_UtilObjectService.hasValueString(ev1.logic)) {
      if (ev1.filters.length > 0) {
        var qwe = <CompositeFilterDescriptor>ev1.filters[0]

        if (qwe.filters.length > 0)
          ev2 = <FilterDescriptor>qwe.filters[0]
      } else {//tạm thời dùng cách này vì chỉ có cái payment nhận filterChangeCallback của grid
        this.filterPayment_checked = false
      }
      // var rs;

      // ev1.filters.forEach(a => {
      //   a = <CompositeFilterDescriptor>a

      //   a.filters.forEach(b => {
      //     b = <FilterDescriptor>b

      //       if (b.field == "StatusName") {
      //         rs = b
      //       }
      //   })
      // })      
    }

    if (ev2.field == "StatusID" || ev2.field == "StatusName") {
      if (Ps_UtilObjectService.hasValue(ev2.value)) {
        this.filterStatusID_checked = true
        this.filterStatusID.value = ev2.value

        let item = this.orderStatusList.find(s => s.StatusID == ev2.value)
        this.filterStatusIDItem = {
          "text": item != undefined ? item.StatusName : null,
          "value": ev2.value,
        }
        // this.filterStatusID.operator = ev2.operator
        // this.filterStatusID.field = ev2.field
      } else {
        this.filterStatusID_checked = false
        this.filterStatusIDItem = null
      }
    }
    else if (ev2.field == "WHPickup" || ev2.field == "WHNamePickup") {
      if (Ps_UtilObjectService.hasValue(ev2.value)) {
        this.filterWHPickup_checked = true
        this.filterWHPickup.value = ev2.value

        let item = this.orderWHNamePickupList.find(s => s.Code == ev2.value)
        this.filterWHPickupItem = {
          "text": item != undefined ? item.WHName : null,
          "value": ev2.value,
        }
        // this.filterWHPickup.operator = ev2.operator
        // this.filterWHPickup.field = ev2.field
      } else {
        this.filterWHPickup_checked = false
        this.filterWHPickupItem = null
      }
    }
    else if (ev2.field == "PaymentID" || ev2.field == "TypeOfPayment") {
      if (Ps_UtilObjectService.hasValue(ev2.value)) {
        this.filterPaymentID_checked = true
        this.filterPaymentID.value = ev2.value

        var item = this.paymentTypeList.find(s => s.PaymentID == ev2.value)
        this.filterPaymentIDItem = {
          "text": item != undefined ? item.TypeOfPayment : null,
          "value": ev2.value,
        }
        // this.filterWHPickup.operator = ev2.operator
        // this.filterWHPickup.field = ev2.field
      } else {
        this.filterPaymentID_checked = false
        this.filterPaymentIDItem = null
      }
    }
    else if (ev2.field == "Payment") {
      if (Ps_UtilObjectService.hasValue(ev2.value)) {
        this.filterPayment_checked = true
        this.filterPayment.value = ev2.value
        this.filterPayment.operator = ev2.operator
      } else
        this.filterPayment_checked = false
    }

    this.loadFilter()
    this.p_GetListOrders()
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //filter
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridDSState = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState.sort = [this.sortByStatusOrderBy, this.sortByIsHachi24]
    this.gridDSState.take = this.pageSize

    this.gridDSState.filter.filters = []
    this.filterOrderTypeIDs.filters = []
    this.filterSearchBox.filters = []
    this.filterChannels.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterCartNo.value))
      this.filterSearchBox.filters.push(this.filterCartNo)

    if (Ps_UtilObjectService.hasValueString(this.filterReceivedBy.value))
      this.filterSearchBox.filters.push(this.filterReceivedBy)

    if (Ps_UtilObjectService.hasValueString(this.filterFullAddress.value))
      this.filterSearchBox.filters.push(this.filterFullAddress)

    if (Ps_UtilObjectService.hasValueString(this.filterTrackingNo.value))
      this.filterSearchBox.filters.push(this.filterTrackingNo)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
    //tình trạng
    this.listStatus.forEach(s => {
      if (s.Checked)
        this.filterOrderTypeIDs.filters.push(s.Filter)
    })
    if (this.filterOrderTypeIDs.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterOrderTypeIDs)
    //checkbox header 2
    if (this.hachi_24_checked)
      this.gridDSState.filter.filters.push(this.filterIsHachi24)
    //kênh bán hàng
    this.listSelectedChannel.forEach(s => {
      let f = { field: "Channel", operator: "eq", value: s.Code }
      this.filterChannels.filters.push(f)
    })
    if (this.filterChannels.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterChannels)
    //grid header
    if (this.filterStatusID_checked)
      this.gridDSState.filter.filters.push(this.filterStatusID)

    if (this.filterWHPickup_checked)
      this.gridDSState.filter.filters.push(this.filterWHPickup)

    if (this.filterPayment_checked)
      this.gridDSState.filter.filters.push(this.filterPayment)

    if (this.filterPaymentID_checked)
      this.gridDSState.filter.filters.push(this.filterPaymentID)
  }
  //action dropdown popup
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOECOMCart) {
    var item: DTOECOMCart = dataItem
    var statusID = item.StatusID;
    var orderTypeID = item.OrderTypeID

    var isPermited: boolean = !Ps_UtilObjectService.hasValue(item.WHPickup) || this.isAdmin ? true
      : this.dataPerm.findIndex(s => s.Warehouse == item.WHPickup) != -1
    //tìm dynamic action UpdateOrderType, 
    //nếu có thì splice 1 (remove), ko thì splice 0 (insert)
    var deleteCountOTI = moreActionDropdown.findIndex(s =>
      s.Code == "minus-outline" || s.Code == "reload") == -1 ? 0 : 1;
    //tìm dynamic action UpdateStatus, 
    var deleteCountSI = moreActionDropdown.findIndex(s => s.Code == "redo") == -1 ? 0 : 1;
    //check permission
    if (isPermited) {
      switch (orderTypeID) {
        case 13:
          moreActionDropdown.splice(2, deleteCountOTI,
            { Name: "Dừng xử lý", Code: "minus-outline", Link: "14", Actived: true, LstChild: [] })

          switch (statusID) {
            case 6:
              moreActionDropdown.splice(3, deleteCountSI,
                { Name: "Tiếp nhận đơn hàng", Code: "redo", Link: "7", Actived: true, LstChild: [] })
              break
            case 7:
              moreActionDropdown.splice(3, deleteCountSI,
                { Name: "Soạn hàng", Code: "redo", Link: "8", Actived: true, LstChild: [] })
              break
            case 9:
              moreActionDropdown.splice(3, deleteCountSI,
                { Name: "Hoàn tất đóng gói", Code: "redo", Link: "10", Actived: true, LstChild: [] })
              break
            case 10:
              moreActionDropdown.splice(3, deleteCountSI,
                { Name: "Giao nhà v/chuyển", Code: "redo", Link: "11", Actived: true, LstChild: [] })
              break
            case 25:
              moreActionDropdown.splice(3, deleteCountSI,
                { Name: "Giao nhà v/chuyển", Code: "redo", Link: "11", Actived: true, LstChild: [] })
              break
            case 26:
              moreActionDropdown.splice(3, deleteCountSI,
                { Name: "Giao nhà v/chuyển", Code: "redo", Link: "11", Actived: true, LstChild: [] })
              break
            case 11:
              moreActionDropdown.splice(3, deleteCountSI,
                { Name: "Hoàn tất giao hàng", Code: "redo", Link: "12", Actived: true, LstChild: [] })
              break
            case 17:
              moreActionDropdown.splice(3, deleteCountSI,
                { Name: "Khách đặt hàng", Code: "redo", Link: "6", Actived: true, LstChild: [] })
              break
            default:
              moreActionDropdown.splice(3, deleteCountSI)
              break
          }
          break
        case 14:
          moreActionDropdown.splice(2, deleteCountOTI,
            { Name: "Lấy lại đơn hàng", Code: "reload", Link: "13", Actived: true, LstChild: [] })

          moreActionDropdown.splice(3, deleteCountSI)
          break
        default:
          break
      }
    } else {
      moreActionDropdown.splice(2, deleteCountOTI)
      moreActionDropdown.splice(3, deleteCountSI)
    }

    // moreActionDropdown.splice(0, 1,
    //   { Name: dataItem.StatusName, Code: "redo", Link: statusID.toString(), Actived: true, LstChild: [] })

    moreActionDropdown.forEach((s) => {
      if (s.Code == "eye" || s.Link == 'detail') {
        //trường hợp Đơn hàng Hoàn tất, Hủy, ko exist trong DataPermission thì Xem chi tiết
        s.Actived = (item.OrderTypeID != 13 && item.OrderTypeID != 14) || !isPermited
      }
      else if (s.Code != 'print') {
        //Hiện 3 nút Sửa, UpdateStatus, Hủy, Xóa
        s.Actived = (item.OrderTypeID == 13 || item.OrderTypeID == 14) && isPermited
      }

      if (s.Code == 'print' || s.Link == 'print') {
        s.Name = "In lại PXK"
        s.Actived = item.StatusID != 6 && item.StatusID != 17 && isPermited
      }
      else if (s.Code == "trash" || s.Link == 'delete') {
        s.Name = statusID == 17 ? "Xóa đơn hàng" : "Hủy đơn hàng"
      }
    })
  }
  getSelectionPopup(selectedList: DTOECOMCart[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    var oneIsPermited: number = selectedList.findIndex(s => !Ps_UtilObjectService.hasValue(s.WHPickup)
      ? true : this.dataPerm.findIndex(d => d.Warehouse == s.WHPickup) != -1)

    if (oneIsPermited != -1 || this.isAdmin) {
      var active7 = selectedList.findIndex(s => s.StatusID == 6)

      if (active7 != -1)
        moreActionDropdown.push({
          Name: "Tiếp nhận đơn hàng", Type: "StatusID",
          Code: "flip-vertical", Link: "7", Actived: true, LstChild: []
        })

      var active8 = selectedList.findIndex(s => s.StatusID == 7)

      if (active8 != -1)
        moreActionDropdown.push({
          Name: "Soạn hàng", Type: "StatusID",
          Code: "flip-vertical", Link: "8", Actived: true, LstChild: []
        })

      var active12 = selectedList.findIndex(s => s.StatusID == 11)

      if (active12 != -1)
        moreActionDropdown.push({
          Name: "Hoàn tất giao hàng", Type: "StatusID",
          Code: "flip-vertical", Link: "12", Actived: true, LstChild: []
        })

      var canDeliver = selectedList.findIndex(s => [10, 25, 26].includes(s.StatusID))

      if (canDeliver != -1)
        moreActionDropdown.push({
          Name: "Giao nhà v/chuyển", Type: "StatusID",
          Code: "redo", Link: "11", Actived: true, LstChild: []
        })

      moreActionDropdown.push({
        Name: "Dừng xử lý", Type: "OrderTypeID",
        Code: "minus-outline", Link: "14", Actived: true, LstChild: []
      })
      moreActionDropdown.push({
        Name: "Hủy đơn hàng", Type: "OrderTypeID",
        Code: "trash", Link: "16", Actived: true, LstChild: []
      })
      if (this.isAssignWHPickupAllowed || this.isAdmin)
        moreActionDropdown.push({
          Name: "Giao đơn vị xử lý", Type: "WHPickup",
          Code: "toggle-full-screen-mode", Link: "", Actived: true, LstChild: []
        })

      var activeNot6And17 = selectedList.findIndex(s => s.StatusID != 6 && s.StatusID != 17)

      if (activeNot6And17 != -1)
        moreActionDropdown.push({
          Name: "In lại PXK", Type: "print",
          Code: "print", Link: "", Actived: true, LstChild: []
        })
    }
    return moreActionDropdown
  }
  ////CLICK EVENT  
  ///header1
  selectedBtnChange(e, btn) {
    if (btn == 'hachi_24_checked') {
      this[btn] = e
    } else if (typeof (btn) === 'number') {
      this.listStatus[btn].Checked = e
    }
    this.loadFilter()
    this.p_GetListOrders()
  }

  onAdd(addMenuItem?) {
    if (addMenuItem == 2)
      this.toggleSyncOrderDialog(true)
    else
      this.openOnlineOrderDetail(true)
  }

  onUploadFile() {
    this.layoutService.folderDialogOpened = true
  }

  downloadExcel(menuItem?) {
    if (menuItem.value == 2)
      alert('tính năng chưa phát triển')
    else
      this.p_DownloadExcel()
  }

  onImportExcel() {
    this.layoutService.setImportDialog(true)
  }

  toggleSyncOrderDialog(open: boolean) {
    this.syncOrderDialog = open
  }

  syncOrder() {
    var i = this.syncOrderForm.getRawValue()

    // if (Ps_UtilObjectService.hasValue(i)) {
    //   let obj = new CartAssignPickOrders()
    //   obj.ListOrders = this.selectedOrderList.map(s => s.Code)
    //   obj.StoreID = this.orderWHNamePickupList[i].WHPickup

    //   if (obj.ListOrders.length > 0 && Ps_UtilObjectService.hasValue(obj.StoreID))
    //     this.p_AssignPickOrders(obj)
    // }
    this.p_SyncOrder(i.Channel.Code, i.CartNo)
  }
  //header2
  resetFilter() {
    //header1
    this.listStatus[0].Checked = true
    this.listStatus[1].Checked = true
    this.listStatus[2].Checked = false
    this.listStatus[3].Checked = false
    //header2
    this.filterCartNo.value = null
    this.filterReceivedBy.value = null
    this.filterFullAddress.value = null
    this.filterTrackingNo.value = null

    this.hachi_24_checked = false
    //grid
    this.filterStatusID_checked = false
    this.filterWHPickup_checked = false
    this.filterPayment_checked = false
    this.filterPaymentID_checked = false
    //
    this.filterStatusIDItem = { "text": null, "value": null }
    this.filterWHPickupItem = { "text": null, "value": null }
    this.filterPaymentIDItem = { "text": null, "value": null }

    this.loadFilter()
    this.p_GetListOrders()
  }
  search(searchQuery) {
    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterCartNo.value = searchQuery
      this.filterReceivedBy.value = searchQuery
      this.filterFullAddress.value = searchQuery
      this.filterTrackingNo.value = searchQuery
    } else {
      this.filterCartNo.value = null
      this.filterReceivedBy.value = null
      this.filterFullAddress.value = null
      this.filterTrackingNo.value = null
    }

    this.loadFilter();
    this.p_GetListOrders()
  }

  onMultiSelectFilter() {
    const contains = (value) => (s: DTOChannel) =>
      s.ChannelName?.toLowerCase().indexOf(value?.toLowerCase()) !== -1;

    this.multiSelect?.filterChange.asObservable().pipe(
      switchMap((value) =>
        from([this.listChannel]).pipe(
          tap(() => (this.loading = true)),
          delay(this.layoutService.typingDelay),
          map((data) => data.filter(contains(value)))
        )
      )
    ).subscribe((x) => {
      this.listFilterChannel = x;
      this.loading = false
    });
  }
  //dropdown popup
  openOnlineOrderDetail(isAdd: boolean) {
    let sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      var group = item.ListMenu.find(f => f.Code.includes('ecom-order')
        || f.Link.includes('ecom001-online-order'))

      if (Ps_UtilObjectService.hasValue(group) && Ps_UtilObjectService.hasListValue(group.LstChild)) {
        var parent = group.LstChild.find(f => f.Code.includes('ecom001-online-order')
          || f.Link.includes('ecom001-online-order'))

        if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
          var detail = parent.LstChild.find(f => f.Code.includes('order-detail')
            || f.Link.includes('order-detail'))

          // this.service.isAdd = isAdd
          // this.service.currentCartOrder = isAdd ? new DTOECOMCart() : this.order

          var currentOrder = new DTOECOMCart()
          Ps_UtilObjectService.copyPropertyForce(this.order, currentOrder)

          localStorage.setItem('ecom001-online-order-detail', JSON.stringify(currentOrder, (k, v) => {
            return Ps_UtilObjectService.parseLocalDateTimeToString(k, v,
              ['OrderDate', 'EstDelivery', 'DeliveriedDate', 'CancelDate',
                'ProcessFrom', 'ProcessTo', 'RequestDate', 'DeliveredDate'])//todo cái nào date, cái nào datetime
          }))
          this.menuService.activeMenu(detail)
        }
      }
      else
        this.layoutService.onError(`Không tìm thấy tính năng 'ecom-order'`);
    })
    this.subArr.push(sst)
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOECOMCart) {
    if (item.Code > 0)
      this.order = item

    if (menu.Link == 'edit' || menu.Code == 'pencil') {
      this.openOnlineOrderDetail(false)
    }
    else if (menu.Link == 'delete' || menu.Code == 'trash') {
      this.deleteDialogOpened = true
      this.deleteDialogCtx = menu.Name
    }
    else if (menu.Link == 'print' || menu.Code == 'print')
      this.p_PrintPXK([item.Code])
    else if (menu.Link == 'detail' || menu.Code == 'eye') {
      this.openOnlineOrderDetail(false)
    }
    else if (menu.Code == 'minus-outline' || menu.Link == '14'
      || menu.Code == 'reload' || menu.Link == '13') {

      this.p_UpdateListOrderType([{
        Code: this.order.Code,
        OrderTypeID: parseInt(menu.Link)
      }], menu.Name)
    }
    else if (menu.Code == 'redo')
      this.p_UpdateStatus(item.Code, parseInt(menu.Link))
  }
  //selection popup
  onSelectedPopupBtnClick(btnType: string, list: DTOECOMCart[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        let arr = new Array<CartOrderStatus>()

        list.forEach(s => {
          if (!Ps_UtilObjectService.hasValue(s.WHPickup) || this.isAdmin
            ? true : this.dataPerm.findIndex(d => d.Warehouse == s.WHPickup) != -1) {
            if (value - s.StatusID == 1 || [25, 26].includes(s.StatusID)) {
              arr.push({ Code: s.Code, StatusID: value, StatusName: s.StatusName })
            }
          }
        })

        if (arr.length > 0)
          this.p_UpdateListStatus(arr)
      }
      else if (btnType == "OrderTypeID") {
        let arr = new Array<CartOrderType>()

        list.forEach(s => {
          if (value != s.OrderTypeID && !Ps_UtilObjectService.hasValue(s.WHPickup) || this.isAdmin
            ? true : this.dataPerm.findIndex(d => d.Warehouse == s.WHPickup) != -1) {
            arr.push({ Code: s.Code, OrderTypeID: value })
          }
        })

        if (arr.length > 0)
          this.p_UpdateListOrderType(arr, value)
      }
      else if (btnType == 'print') {
        let arr = new Array<number>()

        arr = list.filter(s => s.StatusID != 6 && s.StatusID != 17
          && !Ps_UtilObjectService.hasValue(s.WHPickup) || this.isAdmin
          ? true : this.dataPerm.findIndex(d => d.Warehouse == s.WHPickup) != -1).map(s => s.Code);

        if (arr.length > 0)
          this.p_PrintPXK(arr)
      }
      else if (btnType = "WHPickup") {
        this.AssignWHPickupDialogOpened = true
        this.selectedOrderList = list
      }
    }
  }
  //dialog
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  closeAssignUserDialog(refresh: boolean) {
    if (refresh) {
      this.getData()
    }
    this.AssignUserDialogOpened = false
  }
  closeAssignWHPickupDialog(refresh: boolean) {
    if (refresh) {
      this.getData()
      this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
    }
    this.AssignWHPickupDialogOpened = false
  }
  delete() {
    if (this.order.StatusID == 17)
      this.p_DeleteCart()
    else
      this.p_CancelOrder(this.order.Code)
  }
  //AUTO RUN  
  getDonHangCount() {
    if (Ps_UtilObjectService.hasListValue(this.orderListCount)) {
      var a = this.orderListCount.find(s => s.Code == 13)
      this.listStatus[0].Total = a != undefined ? a.NoOfOrder : 0

      var b = this.orderListCount.find(s => s.Code == 14)
      this.listStatus[1].Total = b != undefined ? b.NoOfOrder : 0
    }
  }
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }

  getImgRes(str: string) {
    return Ps_UtilObjectService.hasValueString(str) ? Ps_UtilObjectService.getImgRes(str) : null
  }
}
