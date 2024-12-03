import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';

import { Subject, Subscription } from 'rxjs';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOCoupon, DTOCouponMembership, DTOCouponWarehouse, DTODetailCouponPolicy } from 'src/app/p-app/p-marketing/shared/dto/DTOCouponPolicy.dto';
import { MarCouponPolicyAPIService } from 'src/app/p-app/p-marketing/shared/services/marcoupon-policy-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOVoucherType } from '../../shared/dto/DTOVoucherType.dto';
import { SaleVoucherAPIService } from '../../shared/services/sale-voucher-api.service';
import { SaleService } from '../../shared/services/sale.service';

@Component({
  selector: 'app-sale002-gift-voucher-detail',
  templateUrl: './sale002-gift-voucher-detail.component.html',
  styleUrls: ['./sale002-gift-voucher-detail.component.scss']
})
export class Sale002GiftVoucherDetailComponent implements OnInit, OnDestroy {
  //icon
  faCheckCircle = faCheckCircle
  faSlidersH = faSlidersH
  //load or lock
  loading = false
  isLockAll = false
  isFilterActive = true
  TheoNgay = false
  //add or edit
  isAdd = true
  showCouponGrid = false
  //dialog
  deleteDialogOpened = false
  importDialogOpened = false
  excelValid = true;
  //number
  curLanguage = 1
  total = 0
  thoiGianHieuLuc = 30
  //date
  EndDate: Date = null
  today: Date = new Date()
  minDate: Date = Ps_UtilObjectService.addDays(this.today, 7)
  //object
  couponPolicy = new DTODetailCouponPolicy()
  coupon = new DTOCoupon()
  //list
  listCoupon: DTOCoupon[] = []
  //string
  contextIndex = -1
  context = ["Phiếu mua hàng Coupon"]
  contextName = [this.couponPolicy.CouponNameVN]
  //dropdown
  curVoucherType: DTOVoucherType = null
  defVoucherType = new DTOVoucherType(-1, '- Chọn phân loại - ')
  listVoucherType: DTOVoucherType[] = []

  curDonVi: DTOWarehouse = null
  defDonVi = new DTOWarehouse(-1, '- Chọn đơn vị - ', false)
  listDonVi: DTOWarehouse[] = []
  //warehouse
  // curWareHouse: DTOWarehouse = null
  // defWareHouse = new DTOWarehouse(-1, '- Chọn đơn vị - ', false)
  listWareHouse: DTOCouponWarehouse[] = []
  //search coupon
  filterSearchBoxCP: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterVoucherNo: FilterDescriptor = {
    field: "VoucherNo", operator: "contains", value: null
  }
  //
  filterVoucherIssue: FilterDescriptor = {
    field: "VoucherIssue", operator: "eq", value: this.couponPolicy.Code
  }
  //grid coupon
  pageSizeCP = 25
  pageSizesCP = [this.pageSizeCP]

  gridViewCP = new Subject<any>();
  gridStateCP: State = {
    skip: 0, take: this.pageSizeCP,
    filter: {
      logic: 'and',
      filters: [this.filterVoucherIssue]
    }
  }
  //form
  allowActionDropdown = ['detail', 'edit', 'delete']
  searchFormCP: UntypedFormGroup
  //CALLBACK
  //folder & file
  uploadEventHandlerCallback: Function
  //rowItem action dropdown
  getActionDropdownCallbackCP: Function
  onActionDropdownClickCallbackCP: Function
  //paging
  onPageChangeCallbackCP: Function
  //sorting
  onSortChangeCallbackCP: Function
  //grid select
  getSelectionPopupCallbackCP: Function
  onSelectCallbackCP: Function
  onSelectedPopupBtnCallbackCP: Function
  //select
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  changePermission_sst: Subscription
  getCacheGiftVoucher_sst: Subscription
  changePermissionAPI: Subscription

  GetCouponIssuedByCode_sst: Subscription
  UpdateCouponIssued_sst: Subscription
  UpdateCouponIssuedStatus_sst: Subscription
  DeleteCouponIssued_sst: Subscription

  GetListVoucherType_sst: Subscription
  GetWarehouse_sst: Subscription
  UpdateCouponIssuedWH_sst: Subscription

  GetListCoupon_sst: Subscription
  UpdateCouponStatus_sst: Subscription
  GetTemplate_sst: Subscription

  constructor(
    public service: SaleService,
    public apiService: MarCouponPolicyAPIService,
    public apiVoucherService: SaleVoucherAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    let that = this
    
    this.listWareHouse.push(new DTOCouponWarehouse(7, 'Website hachihachi.com.vn', false))
    this.listWareHouse.push(new DTOCouponWarehouse(-1, 'Tất cả cửa hàng', false))
    //cache
    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.getCache()
      }
    })

    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache()
			}
		})
    //search form
    this.loadSearchFormCP()
    //CALLBACK
    //file
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //paging
    this.onPageChangeCallbackCP = this.pageChangeCoupon.bind(this)
    //sorting
    this.onSortChangeCallbackCP = this.sortChangeCoupon.bind(this)
    //action dropdown    
    this.onActionDropdownClickCallbackCP = this.onActionDropdownClickCP.bind(this)
    this.getActionDropdownCallbackCP = this.getActionDropdownCP.bind(this)
    //select
    this.getSelectionPopupCallbackCP = this.getSelectionPopupCP.bind(this)
    this.onSelectCallbackCP = this.selectChangeCP.bind(this)
    this.onSelectedPopupBtnCallbackCP = this.onSelectedPopupBtnClickCP.bind(this)
  }
  //load  
  getCache() {
    this.getCacheGiftVoucher_sst = this.service.getCacheGiftVoucher().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.couponPolicy = { ...res }
        this.isAdd = this.couponPolicy.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }
      this.getData()
    })
  }
  getData() {
    this.p_GetWarehouse()
    this.p_GetListVoucherType()
    this.p_GetCouponIssuedWareHouse()

    if (!this.isAdd || this.couponPolicy.Code > 0) {
      this.GetCouponIssuedByCode()
      // this.GetListCouponIssuedProduct()
    }
  }
  //Kendo FORM  
  loadSearchFormCP() {
    this.searchFormCP = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  //KENDO GRID
  loadFilterCoupon() {
    this.pageSizesCP = [...this.layoutService.pageSizes]
    this.gridStateCP.take = this.pageSizeCP
    this.filterVoucherIssue.value = this.couponPolicy.Code
    this.gridStateCP.filter.filters = [this.filterVoucherIssue]
    this.gridStateCP.sort = []
    this.filterSearchBoxCP.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterVoucherNo.value))
      this.filterSearchBoxCP.filters.push(this.filterVoucherNo)

    if (this.filterSearchBoxCP.filters.length > 0)
      this.gridStateCP.filter.filters.push(this.filterSearchBoxCP)
  }
  //paging
  pageChangeCoupon(event: PageChangeEvent) {
    this.gridStateCP.skip = event.skip;
    this.gridStateCP.take = this.pageSizeCP = event.take
    this.GetListCoupon()
  }
  //sorting
  sortChangeCoupon(event: SortDescriptor[]) {
    this.gridStateCP.sort = event
    this.GetListCoupon()
  }
  //API  
  //coupon policy
  GetCouponIssuedByCode() {
    this.loading = true;

    this.GetCouponIssuedByCode_sst = this.apiService.GetCouponIssuedByCode(this.couponPolicy.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.couponPolicy = res.ObjectReturn;
        this.checkCouponPolicyProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  UpdateCouponIssued(properties: string[] = ["TypeOfVoucher", "StatusID", "TypeData"], coupon: DTODetailCouponPolicy = this.couponPolicy) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " Phiếu mua hàng"

    if (properties.findIndex(s => s == "TypeOfVoucher") == -1)
      properties.push("TypeOfVoucher")

    if (properties.findIndex(s => s == "StatusID") == -1)
      properties.push("StatusID")

    if (properties.findIndex(s => s == "TypeData") == -1)
      properties.push("TypeData")

    var updateDTO: DTOUpdate = {
      "DTO": coupon,
      "Properties": properties
    }

    this.UpdateCouponIssued_sst = this.apiService.UpdateCouponIssued(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.couponPolicy = res.ObjectReturn
        // this.checkCouponPolicyProp()
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      
      // this.p_GetWarehouse()
      this.checkCouponPolicyProp()
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  p_UpdateCouponIssuedStatus(statusID: number, list: DTODetailCouponPolicy[] = [this.couponPolicy]) {
    this.loading = true;
    var ctx = "Cập nhật tình trạng Đợt phát hành"

    this.UpdateCouponIssuedStatus_sst = this.apiService.UpdateCouponIssuedStatus(list, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.couponPolicy.StatusID = statusID
        this.checkCouponPolicyProp()
        this.GetCouponIssuedByCode()

        if (statusID == 2)//nếu duyệt thì lấy list coupon con
          this.GetListCoupon()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  p_UpdateCouponStatus(statusID: number, list: DTOCoupon[] = [this.coupon]) {
    this.loading = true;
    var ctx = "Cập nhật tình trạng Phiếu mua hàng"

    this.UpdateCouponStatus_sst = this.apiService.UpdateCouponStatus(list, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.GetListCoupon()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        // this.couponPolicy.StatusID = statusID
        // this.checkCouponPolicyProp()
        // this.GetCouponIssuedByCode()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }

  DeleteCouponIssued(coupon: DTODetailCouponPolicy = this.couponPolicy) {
    this.loading = true;
    var ctx = "Xóa Phiếu mua hàng"

    this.DeleteCouponIssued_sst = this.apiService.DeleteCouponIssued([coupon]).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.createNew()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  //dropdown
  p_GetWarehouse() {
    this.loading = true;

    this.GetWarehouse_sst = this.layoutApiService.GetWarehouse().subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res)) {
        this.listDonVi = res//.filter(s => s.Code != 7);
        this.checkCouponPolicyProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetListVoucherType() {
    this.loading = true;

    this.GetListVoucherType_sst = this.apiVoucherService.GetListVoucherType().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listVoucherType = res.ObjectReturn
        this.checkCouponPolicyProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //warehouse
  p_GetCouponIssuedWareHouse() {
    this.loading = true;

    this.GetWarehouse_sst = this.apiService.GetCouponIssuedWareHouse(this.couponPolicy.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var rs = (res.ObjectReturn as DTOCouponWarehouse[])
        var rsWeb = rs.find(s => s.WH == 7)

        if (rsWeb != undefined) {
          this.listWareHouse[0].Code = rsWeb.Code
          this.listWareHouse[0].VoucherIssue = rsWeb.VoucherIssue
          this.listWareHouse[0].IsSelected = rsWeb.IsSelected
        }
        // this.listWareHouse[1]['IsExpand'] = rs.findIndex(s => s.WH != 7) != -1

        rs.forEach(s => {
          if (s.WH != 7 && this.listWareHouse.findIndex(f => f.WH == s.WH) == -1) {
            this.listWareHouse.push(s)
          }
        })
        this.checkCouponPolicyProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  UpdateCouponIssuedWH(updateDTO: DTOCouponWarehouse) {
    this.loading = true;
    var ctx = "Cập nhật Đơn vị áp dụng"
    updateDTO.VoucherIssue = this.couponPolicy.Code

    this.UpdateCouponIssuedWH_sst = this.apiService.UpdateCouponIssuedWH(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var wh = this.listWareHouse.find(s => s.WH == updateDTO.WH)

        if (wh != undefined)
          wh.Code = res.ObjectReturn.Code

        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  //coupon
  GetListCoupon() {
    this.loading = true;

    this.GetListCoupon_sst = this.apiService.GetListCoupon(this.gridStateCP).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCoupon = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridViewCP.next({ data: this.listCoupon, total: this.total });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //file
  p_DownloadExcel(getfileName) {
    this.loading = true
    var ctx = "Download Excel Template"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.layoutApiService.GetTemplate(getfileName).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
  }
  //CLICK EVENT
  //header1
  toggleGridCoupon() {
    this.showCouponGrid = !this.showCouponGrid

    if (this.showCouponGrid) {
      this.loadFilterCoupon()
      this.GetListCoupon()
    }
  }
  print() {
    // if (this.currentOrder.Code > 0) 
    //   this.p_PrintPXK([this.currentOrder.Code])
  }
  updatePromotionStatus(statusID: number) {
    var newPro = { ...this.couponPolicy }
    //check trước khi duyệt
    if (statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(newPro.CouponNameVN))
        this.layoutService.onError('Vui lòng nhập Tên phiếu')
      else if (!Ps_UtilObjectService.hasValue(newPro.TypeOfVoucher))
        this.layoutService.onError('Vui lòng chọn Phân loại')
      else if (!Ps_UtilObjectService.hasValue(newPro.WHCode))
        this.layoutService.onError('Vui lòng chọn Đơn vị')
      // else if (!Ps_UtilObjectService.hasValueString(newPro.DescriptionVN))
      //   this.layoutService.onError('Vui lòng nhập Diễn giải')
      // cho null Diễn giải VÀ Số Seri
      // else if (!Ps_UtilObjectService.hasValueString(newPro.SerialNo))
      //   this.layoutService.onError('Vui lòng nhập Số seri')
      else if (this.listWareHouse.find(s => s.IsSelected) == undefined)
        this.layoutService.onError('Vui lòng chọn Đơn vị áp dụng')
      else if (this.listWareHouse.findIndex(s => s.IsSelected && s.WH == 7) >= 0 && !Ps_UtilObjectService.hasValueString(newPro.DescriptionVN))//chỉ khi chọn Kho Online
        this.layoutService.onError('Vui lòng nhập Diễn giải')

      else if (!Ps_UtilObjectService.hasValueString(newPro.Prefix))
        this.layoutService.onError('Vui lòng nhập Mã bắt đầu')
      else if (!Ps_UtilObjectService.hasValue(newPro.NoOfRelease) || newPro.NoOfRelease <= 0)
        this.layoutService.onError('Số lượng phát hành phải lớn hơn 0')

      else if (!Ps_UtilObjectService.hasValue(newPro.VoucherAmount) || newPro.VoucherAmount <= 0)
        this.layoutService.onError('Mệnh giá phải lớn hơn 0')
      // else if (!Ps_UtilObjectService.hasValue(newPro.UnitPrice) || newPro.UnitPrice <= 0)
      //   this.layoutService.onError('Giá bán phải lớn hơn 0')

      else if (!this.TheoNgay && !Ps_UtilObjectService.hasValue(newPro.PeriodDay) && newPro.PeriodDay <= 0)
        this.layoutService.onError('Vui lòng nhập Thời gian hiệu lực')
      else if (this.TheoNgay && !Ps_UtilObjectService.hasValueString(newPro.EndDate))
        this.layoutService.onError('Ngày kết thúc cho Thời gian hiệu lực')

      // else if (!Ps_UtilObjectService.hasValue(newPro.NoInTransaction) || newPro.NoInTransaction <= 0)
      //   this.layoutService.onError('Số lượt dùng tối đa/1 giao dịch phải lớn hơn 0')
      else
        this.p_UpdateCouponIssuedStatus(statusID, [newPro])
    }
    else
      this.p_UpdateCouponIssuedStatus(statusID, [newPro])
  }
  createNew() {
    //object
    this.couponPolicy = new DTODetailCouponPolicy()
    this.couponPolicy.TypeData = 2//coupon là 1
    //array
    this.listCoupon = []
    this.gridViewCP.next({ data: [], total: 0 })    
    //dropdown
    this.curVoucherType = null
    this.curDonVi = null
    //checkbox    
    // this.listWareHouse.map(s => s.IsSelected = false)
    this.listWareHouse = []
    this.listWareHouse.push(new DTOCouponWarehouse(7, 'Website hachihachi.com.vn', false))
    this.listWareHouse.push(new DTOCouponWarehouse(-1, 'Tất cả cửa hàng', false))
    this.p_GetWarehouse()
    this.p_GetCouponIssuedWareHouse()
    //bool
    this.isLockAll = false
    this.isFilterActive = true
    this.isAdd = true
    this.TheoNgay = false
    //num
    this.curLanguage = 1
    this.total = 0
    //date
    this.today = new Date()
    this.EndDate = null

    this.checkCouponPolicyProp()
  }
  //body1
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  onDeletePromotion() {
    this.contextIndex = 0
    this.contextName[this.contextIndex] = this.couponPolicy.CouponNameVN
    this.deleteDialogOpened = true
  }
  onDropdownlistClick(ev, prop: string) {
    if (prop == 'WHCode') {
      var item = { ...this.couponPolicy }
      item.WHName = ev.WHName
      item.WHCode = ev.Code
      this.UpdateCouponIssued(['WHCode'], item)
    }
    else if (prop == 'TypeOfVoucher') {
      var item = { ...this.couponPolicy }
      item.TypeOfVoucher = ev.Code
      item.TypeOfVoucherName = ev.VoucherType
      this.UpdateCouponIssued(['TypeOfVoucher'], item)
    }
  }
  //body2
  clickCheckbox(ev, prop: string, item?: any, parent?: any) {
    switch (prop) {
      case 'TheoNgay':
        var checked = ev.target.checked

        if (checked) {
          this.couponPolicy.PeriodDay = null
          this.EndDate = new Date(this.minDate)
          this.couponPolicy.EndDate = new Date(this.minDate)
        }
        else {
          this.couponPolicy.EndDate = null
          this.EndDate = null
          this.couponPolicy.PeriodDay = this.thoiGianHieuLuc
        }

        this.UpdateCouponIssued(['PeriodDay', 'EndDate'])
        break
      case 'WHName':
        var wh = item as DTOCouponWarehouse
        if (wh.WH == -1) {
          this.listWareHouse.map(s => {
            if (s.WH != 7 && s.WH != -1) {
              s.IsSelected = ev.target.checked
              this.UpdateCouponIssuedWH(s)
            }
          })
        } else {
          wh.IsSelected = ev.target.checked
          this.UpdateCouponIssuedWH(wh)
        }
        break
      default:
        this.couponPolicy[prop] = ev.target.checked
        this.UpdateCouponIssued([prop])
        break
    }
  }
  //body 4
  searchCoupon() {
    var val = this.searchFormCP.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterVoucherNo.value = searchQuery
    } else {
      this.filterVoucherNo.value = null
    }

    this.loadFilterCoupon();
    this.GetListCoupon()
  }
  //POPUP
  //action dropdown
  getActionDropdownCP(moreActionDropdown: MenuDataItem[], dataItem: DTOCoupon) {
    var item: DTOCoupon = dataItem
    var statusID = item.StatusID;
    moreActionDropdown = []

    if (statusID == 3)
      moreActionDropdown.push({ Name: "Áp dụng", Code: "check-outline", Link: "2", Type: "StatusID", Actived: true })
    else if (statusID == 2)
      moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Link: "3", Type: "StatusID", Actived: true })

    return moreActionDropdown
  }
  //click action dropdown
  onActionDropdownClickCP(menu: MenuDataItem, item: DTOCoupon) {
    if (item.Code > 0) {
      if (menu.Type == 'StatusID') {
        this.coupon = { ...item }
        this.p_UpdateCouponStatus(parseInt(menu.Link), [item])
      }
    }
  }
  //selection 
  getSelectionPopupCP(selectedList: DTOCoupon[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    if (selectedList.findIndex(s => s.StatusID == 3) != -1)
      moreActionDropdown.push({
        Name: "Áp dụng", Type: "StatusID",
        Code: "check-outline", Link: "2", Actived: true
      })

    if (selectedList.findIndex(s => s.StatusID == 2) != -1)
      moreActionDropdown.push({
        Name: "Ngưng áp dụng", Type: "StatusID",
        Code: "minus-outline", Link: "3", Actived: true
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClickCP(btnType: string, list: DTOCouponMembership[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        let arr = []
        // áp dụng
        if (value == 2 || value == '2') {
          list.forEach(s => {
            if (s.StatusID == 3) {
              s.VoucherIssue = this.couponPolicy.Code
              arr.push(s)
            }
          })
        }//ngưng áp dụng 
        else if (value == 3 || value == '3') {
          list.forEach(s => {
            if (s.StatusID == 2) {
              s.VoucherIssue = this.couponPolicy.Code
              arr.push(s)
            }
          })
        }

        if (arr.length > 0)
          this.p_UpdateCouponStatus(value, arr)
      }
    }
  }
  selectChangeCP(isSelecting) {
    this.isFilterActive = !isSelecting
  }
  //DIALOG button
  //delete
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  delete() {
    if (this.contextIndex == 0)
      this.DeleteCouponIssued()
  }
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  //AUTORUN
  //value change
  checkCouponPolicyProp() {//Voucher chỉ có Soạn, Duyệt và Ngưng
    this.isLockAll = (this.couponPolicy.StatusID == 2 || this.couponPolicy.StatusID == 3) || //khóa khi duyệt, ngưng
      ((this.couponPolicy.StatusID == 3 || this.couponPolicy.StatusID == 2) && !this.isAllowedToVerify && !this.isToanQuyen)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.couponPolicy.StatusID == 0 || this.couponPolicy.StatusID == 4) && !this.isAllowedToCreate && !this.isToanQuyen)//khóa khi tạo, trả nếu có quyền duyệt

    if (Ps_UtilObjectService.hasValueString(this.couponPolicy.EndDate))
      this.EndDate = new Date(this.couponPolicy.EndDate)

    if (Ps_UtilObjectService.hasValue(this.couponPolicy.WHCode))
      this.curDonVi = this.listDonVi.find(s => s.Code == this.couponPolicy.WHCode)

    if (Ps_UtilObjectService.hasValue(this.couponPolicy.TypeOfVoucher))
      this.curVoucherType = this.listVoucherType.find(s => s.Code == this.couponPolicy.TypeOfVoucher)

    //if (this.isAdd)
      this.TheoNgay = this.couponPolicy.PeriodDay == null || this.couponPolicy.PeriodDay <= 0

    //check Tất cả cửa hàng 
    if(Ps_UtilObjectService.hasListValue(this.listWareHouse)){
      var tatCa = this.listWareHouse.filter(s => s.WH != -1 && s.WH != 7)
      this.listWareHouse[1].IsSelected = tatCa.findIndex(s => !s.IsSelected) == -1
    }
    
    this.selectable.enabled = this.isLockAll
  }
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {

      switch (prop) {
        default:
          this.UpdateCouponIssued([prop])
          break
      }
    }
  }
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.couponPolicy[prop] = this[prop]
      this.UpdateCouponIssued([prop])
    }
  }
  //auto run
  uploadEventHandler(e: File) {
    //todo import?
  }
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.getCacheGiftVoucher_sst?.unsubscribe()

    this.GetCouponIssuedByCode_sst?.unsubscribe()
    this.UpdateCouponIssued_sst?.unsubscribe()
    this.UpdateCouponIssuedStatus_sst?.unsubscribe()
    this.DeleteCouponIssued_sst?.unsubscribe()

    this.GetWarehouse_sst?.unsubscribe()
    this.UpdateCouponIssuedWH_sst?.unsubscribe()

    this.GetListCoupon_sst?.unsubscribe()
    this.UpdateCouponStatus_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
