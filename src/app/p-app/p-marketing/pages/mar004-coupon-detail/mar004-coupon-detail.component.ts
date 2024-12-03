import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons'
import { Subject, Subscription } from 'rxjs';
import { State, CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MatSidenav } from '@angular/material/sidenav';
import { MarketingService } from '../../shared/services/marketing.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarCouponPolicyAPIService } from '../../shared/services/marcoupon-policy-api.service';
import { DTOCounponRounting, DTOCoupon, DTOCouponMembership, DTOCouponProduct, DTOCouponWarehouse, DTODetailCouponPolicy } from '../../shared/dto/DTOCouponPolicy.dto';
import { EcomAPIService } from 'src/app/p-app/p-ecommerce/shared/services/ecom-api.service';
import { DTOLSProvince } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSProvince.dto';
import DTOListProp_ObjReturn from '../../shared/dto/DTOListProp_ObjReturn.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';
import { DTOLSDistrict } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSDistrict.dto';

@Component({
  selector: 'app-mar004-coupon-detail',
  templateUrl: './mar004-coupon-detail.component.html',
  styleUrls: ['./mar004-coupon-detail.component.scss']
})
export class Mar004CouponDetailComponent implements OnInit, OnDestroy {
  that = this
  //icon
  faCheckCircle = faCheckCircle
  faSlidersH = faSlidersH
  //load or lock
  loading = false
  isLockAll = false
  isFilterActive = true
  //add or edit
  isAdd = true
  isAddSanPham = true
  isAddDoiTuong = true
  //checkbox
  showCouponGrid = false
  //dialog
  isDialogDiemGiaoHang = false
  deleteDialogOpened = false
  importDialogOpened = false
  excelValid = true;
  //number
  curLanguage = 1
  curNoti = 1

  totalSP = 0
  totalDT = 0
  totalCP = 0
  //date
  StartDate: Date = null
  EndDate: Date = null
  SMSSendDate: Date = null
  AppSendDate: Date = null
  today: Date = new Date()
  fourHoursFromNow: Date = Ps_UtilObjectService.addMinutes(this.today, 1)
  //object
  couponPolicy = new DTODetailCouponPolicy()
  membership = new DTOCouponMembership()
  coupon = new DTOCoupon()
  sanpham = new DTOCouponProduct()
  //list
  listMembership: DTOCouponMembership[] = []
  listSanPham: DTOCouponProduct[] = []
  listCoupon: DTOCoupon[] = []
  provinceList: DTOLSProvince[] = []
  routingList: DTOCounponRounting[] = []
  //string
  contextIndex = -1
  context = ["Chính sách Coupon", "Sản phẩm", "Đối tượng nhận Coupon"]
  contextName = [this.couponPolicy.CouponNameVN, this.sanpham.ProductName, this.membership.FullName]
  //dropdown
  listTaoMoi: { text: string, value: number }[] = [{
    text: 'Coupon giảm giá theo sản phẩm',
    value: 1
  }, {
    text: 'Coupon giảm giá VẬN CHUYỂN theo sản phẩm',
    value: 2
  }, {
    text: 'Coupon giảm giá đơn hàng',
    value: 3
  }, {
    text: 'Coupon giảm giá VẬN CHUYỂN đơn hàng',
    value: 4
  }]

  listWareHouse: DTOCouponWarehouse[] = []
  listLocalStore: DTOCouponWarehouse[] = []
  //
  defaultTaoMoi = { text: 'TẠO MỚI', value: -1 }
  currentTaoMoi: { text: string, value: number } = null
  //search san pham
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterVNName: FilterDescriptor = {
    field: "VNName", operator: "contains", value: null
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterPosCode: FilterDescriptor = {
    field: "PosCode", operator: "contains", value: null
  }
  //search doi tuong
  filterSearchBoxDT: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterFullName: FilterDescriptor = {
    field: "FullName", operator: "contains", value: null
  }
  filterCellPhone: FilterDescriptor = {
    field: "CellPhone", operator: "contains", value: null
  }
  filterMembershipNo: FilterDescriptor = {
    field: "MembershipNo", operator: "contains", value: null
  }
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
  //grid sản phẩm
  pageSize = 25
  pageSizes = [this.pageSize]

  gridViewSP = new Subject<any>();
  gridStateSP: State = {
    skip: 0, take: this.pageSize,
    filter: {
      logic: 'and',
      filters: [this.filterVoucherIssue]
    }
  }
  //grid đối tượng
  pageSizeDT = 25
  pageSizesDT = [this.pageSizeDT]

  gridViewDT = new Subject<any>();
  gridStateDT: State = {
    skip: 0, take: this.pageSizeDT,
    filter: {
      logic: 'and',
      filters: [this.filterVoucherIssue]
    }
  }
  //grid coupon
  pageSizeCP = 25
  pageSizesCP = [this.pageSize]

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
  formSP: UntypedFormGroup;
  formDT: UntypedFormGroup;

  searchForm: UntypedFormGroup
  searchFormDT: UntypedFormGroup
  searchFormCP: UntypedFormGroup
  //CALLBACK
  //folder & file
  pickFileCallback: Function
  GetFolderCallback: Function
  uploadEventHandlerCallback: Function
  //rowItem action dropdown
  getActionDropdownCallbackDT: Function
  getActionDropdownCallbackCP: Function
  onActionDropdownClickCallbackDT: Function
  onActionDropdownClickCallbackCP: Function
  //paging
  onPageChangeCallback: Function
  onPageChangeCallbackDT: Function
  onPageChangeCallbackCP: Function
  //sorting
  onSortChangeCallback: Function
  onSortChangeCallbackDT: Function
  onSortChangeCallbackCP: Function
  //grid select
  getSelectionPopupCallbackDT: Function
  getSelectionPopupCallbackCP: Function
  onSelectCallbackDT: Function
  onSelectCallbackCP: Function
  onSelectedPopupBtnCallbackDT: Function
  onSelectedPopupBtnCallbackCP: Function
  //select
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  changePermission_sst: Subscription
  getCacheCouponPolicyDetail_sst: Subscription
  GetCouponIssuedByCode_sst: Subscription
  UpdateCouponIssued_sst: Subscription
  UpdateCouponIssuedStatus_sst: Subscription
  DeleteCouponIssued_sst: Subscription

  GetCouponIssuedWareHouse_sst: Subscription
  UpdateCouponIssuedWH_sst: Subscription

  GetAllProvinceInVietName_sst: Subscription
  GetAllDistrictInProvince_sst: Subscription
  UpdateCouponIssuedRounting_sst: Subscription
  DeleteCouponIssuedRounting_sst: Subscription
  GetListCouponIssuedMembership_sst: Subscription

  DeleteCouponIssuedProduct_sst: Subscription
  GetCouponIssuedProduct_sst: Subscription
  GetListCoupon_sst: Subscription
  UpdateCouponStatus_sst: Subscription
  GetTemplate_sst: Subscription
  ImportExcelCouponIssueMembership_sst: Subscription
  ImportExcelCouponIssueProduct_sst: Subscription

  UpdateCouponIssuedProduct_sst: Subscription
  GetListCouponIssuedProduct_sst: Subscription
  DeleteCouponIssuedMembership_sst: Subscription
  UpdateCouponIssuedMembership_sst: Subscription
  GetMembershipByPhone_sst: Subscription
  GetCouponIssuedMembership_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public service: MarketingService,
    public apiServiceEcom: EcomAPIService,
    public apiService: MarCouponPolicyAPIService,
    public apiServiceNews: MarNewsProductAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    let that = this
    this.listWareHouse.push(new DTOCouponWarehouse(7, 'Website hachihachi.com.vn', false))
    this.listWareHouse.push(new DTOCouponWarehouse(-1, 'Tất cả cửa hàng', false))
    //đã thêm 1 phút để nó lớn hơn NOW, set giây về 0
    this.fourHoursFromNow.setSeconds(0);
    //update giá trị min của Thời điểm gửi thông báo mối 1ph
    setInterval(() => {
      this.fourHoursFromNow = Ps_UtilObjectService.addMinutes(new Date(), 1)
      this.fourHoursFromNow.setSeconds(0);
    }, 60 * 1000)
    //cache
    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        this.getCache()
      }
    })
    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {        
        this.getCache()
      }
    })
    //edit form
    this.loadFormSanPham()
    this.loadFormDoiTuong()
    //search form
    this.loadSearchForm()
    this.loadSearchFormDT()
    this.loadSearchFormCP()
    //CALLBACK
    //file
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //paging
    this.onPageChangeCallback = this.pageChangeSanPham.bind(this)
    this.onPageChangeCallbackDT = this.pageChangeDoiTuong.bind(this)
    this.onPageChangeCallbackCP = this.pageChangeCoupon.bind(this)
    //sorting
    this.onSortChangeCallback = this.sortChangeSanPham.bind(this)
    this.onSortChangeCallbackDT = this.sortChangeDoiTuong.bind(this)
    this.onSortChangeCallbackCP = this.sortChangeCoupon.bind(this)
    //action dropdown    
    this.onActionDropdownClickCallbackDT = this.onActionDropdownClickDT.bind(this)
    this.onActionDropdownClickCallbackCP = this.onActionDropdownClickCP.bind(this)
    this.getActionDropdownCallbackDT = this.getActionDropdownDT.bind(this)
    this.getActionDropdownCallbackCP = this.getActionDropdownCP.bind(this)
    //select
    this.getSelectionPopupCallbackDT = this.getSelectionPopupDT.bind(this)
    this.getSelectionPopupCallbackCP = this.getSelectionPopupCP.bind(this)
    this.onSelectCallbackDT = this.selectChangeDT.bind(this)
    this.onSelectCallbackCP = this.selectChangeCP.bind(this)
    this.onSelectedPopupBtnCallbackDT = this.onSelectedPopupBtnClickDT.bind(this)
    this.onSelectedPopupBtnCallbackCP = this.onSelectedPopupBtnClickCP.bind(this)
  }
  //load  
  getCache() {
    this.getCacheCouponPolicyDetail_sst = this.service.getCacheCouponPolicyDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.couponPolicy = res
        this.isAdd = this.couponPolicy.Code == 0

        var taoMoi = this.listTaoMoi.find(s => s.value == res.TypeOfVoucher)
        this.currentTaoMoi = taoMoi != undefined ? taoMoi : null

        if (this.isAdd)//tạo mới để tránh trường hơp DTO của list != DTO của detail -> thiếu trường -> 1 số cái check sai
        {
          this.createNew()
          this.couponPolicy.TypeOfVoucher = res.TypeOfVoucher
          this.couponPolicy.TypeOfVoucherName = res.TypeOfVoucherName
        }
      }
      else {
        this.isAdd = this.service.isAdd
        this.couponPolicy.TypeOfVoucher = Ps_UtilObjectService.hasValue(this.currentTaoMoi) ? this.currentTaoMoi.value : this.listTaoMoi[0].value
        this.couponPolicy.TypeOfVoucherName = Ps_UtilObjectService.hasValue(this.currentTaoMoi) ? this.currentTaoMoi.text : this.listTaoMoi[0].text
      }
      this.getData()
    })
  }
  getData() {
    this.p_GetCouponIssuedWareHouse()

    if (!this.isAdd || this.couponPolicy.Code > 0) {
      this.GetCouponIssuedByCode()

      this.loadFilterSanPham()
      this.GetListCouponIssuedProduct()

      this.loadFilterDoiTuong()
      this.GetListCouponIssuedMembership()
    }
  }
  //Kendo FORM
  loadFormSanPham() {
    this.formSP = new UntypedFormGroup({
      'Barcode': new UntypedFormControl(this.sanpham.Barcode, Validators.required),
      'MinQty': new UntypedFormControl(this.sanpham.MinQty, Validators.required),
      // 'MaxQty': new FormControl(this.sanpham.MaxQty, Validators.required),
      'Code': new UntypedFormControl(this.sanpham.Code),
      'VoucherIssue': new UntypedFormControl(this.sanpham.VoucherIssue),
      'ProductID': new UntypedFormControl(this.sanpham.ProductID),
      'ProductName': new UntypedFormControl(this.sanpham.ProductName),
      'ImageSetting': new UntypedFormControl(this.sanpham.ImageSetting),
    })
  }
  loadFormDoiTuong() {
    this.formDT = new UntypedFormGroup({
      'CellPhone': new UntypedFormControl(this.membership.CellPhone, Validators.required),
      'StatusID': new UntypedFormControl(this.membership.StatusID, Validators.required),
      'Code': new UntypedFormControl(this.membership.Code),
      'VoucherIssue': new UntypedFormControl(this.membership.VoucherIssue),
      'MembershipID': new UntypedFormControl(this.membership.MembershipID),
      'MembershipNo': new UntypedFormControl(this.membership.MembershipNo),
      'FullName': new UntypedFormControl(this.membership.FullName),
    })
  }
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadSearchFormDT() {
    this.searchFormDT = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadSearchFormCP() {
    this.searchFormCP = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  //KENDO GRID
  loadFilterSanPham() {
    this.pageSizes = [...this.service.pageSizes]
    this.gridStateSP.take = this.pageSize
    this.filterVoucherIssue.value = this.couponPolicy.Code
    this.gridStateSP.filter.filters = [this.filterVoucherIssue]
    this.filterSearchBox.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterVNName.value))
      this.filterSearchBox.filters.push(this.filterVNName)

    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterPosCode.value))
      this.filterSearchBox.filters.push(this.filterPosCode)

    if (this.filterSearchBox.filters.length > 0)
      this.gridStateSP.filter.filters.push(this.filterSearchBox)
  }
  loadFilterDoiTuong() {
    this.pageSizesDT = [...this.service.pageSizes]
    this.gridStateDT.take = this.pageSizeDT
    this.filterVoucherIssue.value = this.couponPolicy.Code
    this.gridStateDT.filter.filters = [this.filterVoucherIssue]
    this.filterSearchBoxDT.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterFullName.value))
      this.filterSearchBoxDT.filters.push(this.filterFullName)

    if (Ps_UtilObjectService.hasValueString(this.filterCellPhone.value))
      this.filterSearchBoxDT.filters.push(this.filterCellPhone)

    if (Ps_UtilObjectService.hasValueString(this.filterMembershipNo.value))
      this.filterSearchBoxDT.filters.push(this.filterMembershipNo)

    if (this.filterSearchBoxDT.filters.length > 0)
      this.gridStateDT.filter.filters.push(this.filterSearchBoxDT)
  }
  loadFilterCoupon() {
    this.pageSizesCP = [...this.service.pageSizes]
    this.gridStateCP.take = this.pageSizeCP
    this.filterVoucherIssue.value = this.couponPolicy.Code
    this.gridStateCP.filter.filters = [this.filterVoucherIssue]
    this.gridStateCP.sort = [{ field: 'EndDate', dir: 'asc' }]
    this.filterSearchBoxCP.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterVoucherNo.value))
      this.filterSearchBoxCP.filters.push(this.filterVoucherNo)

    if (this.filterSearchBoxCP.filters.length > 0)
      this.gridStateCP.filter.filters.push(this.filterSearchBoxCP)
  }
  //paging
  pageChangeSanPham(event: PageChangeEvent) {
    this.gridStateSP.skip = event.skip;
    this.gridStateSP.take = this.pageSize = event.take
    this.GetListCouponIssuedProduct()
  }
  pageChangeDoiTuong(event: PageChangeEvent) {
    this.gridStateDT.skip = event.skip;
    this.gridStateDT.take = this.pageSizeDT = event.take
    this.GetListCouponIssuedMembership()
  }
  pageChangeCoupon(event: PageChangeEvent) {
    this.gridStateCP.skip = event.skip;
    this.gridStateCP.take = this.pageSizeCP = event.take
    this.GetListCoupon()
  }
  //sorting
  sortChangeSanPham(event: SortDescriptor[]) {
    this.gridStateSP.sort = event
    this.GetListCouponIssuedProduct()
  }
  sortChangeDoiTuong(event: SortDescriptor[]) {
    this.gridStateDT.sort = event
    this.GetListCouponIssuedMembership()
  }
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
  UpdateCouponIssued(properties: string[] = ["TypeOfVoucher", "StatusID"], coupon: DTODetailCouponPolicy = this.couponPolicy) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " chính sách"

    if (properties.findIndex(s => s == "AppContent") == -1)
      properties.push('AppContent')

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
        this.checkCouponPolicyProp()
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
  DeleteCouponIssued(coupon: DTODetailCouponPolicy = this.couponPolicy) {
    this.loading = true;
    var ctx = "Xóa Chính sách Coupon"

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
  //warehouse
  p_GetCouponIssuedWareHouse() {
    this.loading = true;

    this.GetCouponIssuedWareHouse_sst = this.apiService.GetCouponIssuedWareHouse(this.couponPolicy.Code).subscribe(res => {
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
          if (s.WH != 7) {
            if (this.listWareHouse.findIndex(f => f.WH == s.WH) == -1)
              this.listWareHouse.push(s)

            if (this.listLocalStore.findIndex(f => f.WH == s.WH) == -1)
              this.listLocalStore.push(s)
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
  //rounting
  p_GetAllProvinceInVietName() {
    this.loading = true;

    this.GetAllProvinceInVietName_sst = this.apiServiceEcom.GetAllProvinceInVietName().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.provinceList = res.ObjectReturn;
        this.provinceList.unshift({ Code: null, VNProvince: ' -- Chọn -- ' })
      } else if (Ps_UtilObjectService.hasListValue(res)) {
        this.provinceList = res;
        this.provinceList.unshift({ Code: null, VNProvince: ' -- Chọn -- ' })
      }

      if (Ps_UtilObjectService.hasListValue(this.routingList) && Ps_UtilObjectService.hasListValue(this.provinceList))
        this.routingList.forEach(s => {
          var pro = this.provinceList.find(f => f.Code == s.Province)

          if (Ps_UtilObjectService.hasValue(pro))
            pro.IsSelected = true
        })
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetAllDistrictInProvince(province: DTOLSProvince) {
    this.loading = true;

    this.GetAllDistrictInProvince_sst = this.apiServiceEcom.GetAllDistrictInProvince(province.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        province.ListChild = res.ObjectReturn;

        this.routingList.forEach(s => {
          var dis = province.ListChild.find(f => f.Code == s.District)

          if (Ps_UtilObjectService.hasValue(dis))
            dis.IsSelected = true
        })
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  UpdateCouponIssuedRounting(detail: DTOCounponRounting[] = []) {
    this.loading = true;
    var ctx = "Cập nhật Điểm giao hàng"

    this.UpdateCouponIssuedRounting_sst = this.apiService.UpdateCouponIssuedRounting(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.closeDialogDiemGiaoHang()

        this.routingList = []
        this.GetCouponIssuedByCode()
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
  DeleteCouponIssuedRounting(detail: DTOCounponRounting[] = []) {
    this.loading = true;
    var ctx = "Xóa Điểm giao hàng"

    this.DeleteCouponIssuedRounting_sst = this.apiService.DeleteCouponIssuedRounting(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.closeDialogDiemGiaoHang()
        //bỏ select trên popup
        detail.forEach(s => {
          //nếu là tỉnh thành
          if (!Ps_UtilObjectService.hasValue(s.District) || s.District <= 0) {
            let index = this.provinceList.findIndex(f => f.Code == s.Province)

            if (index > -1)
              this.provinceList[index].IsSelected = false
          }//nếu là quận huyện
          else {
            let pIn = this.provinceList.findIndex(f => f.Code == s.Province)

            if (pIn > -1) {
              let dIn = this.provinceList[pIn].ListChild.findIndex(f => f.Code == s.District)

              if (dIn > -1) {
                this.provinceList[pIn].ListChild[dIn].IsSelected = false
              }
            }
          }
        })

        this.routingList = []
        this.GetCouponIssuedByCode()
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
  //coupon membership
  GetListCouponIssuedMembership() {
    this.loading = true;

    this.GetListCouponIssuedMembership_sst = this.apiService.GetListCouponIssuedMembership(this.gridStateDT).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listMembership = res.ObjectReturn.Data;
        this.totalDT = res.ObjectReturn.Total
        this.gridViewDT.next({ data: this.listMembership, total: this.totalDT });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  GetCouponIssuedMembership(membership = this.membership) {
    this.loading = true;

    this.GetCouponIssuedMembership_sst = this.apiService.GetCouponIssuedMembership(membership.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.membership = res.ObjectReturn
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  GetMembershipByPhone(membership = this.membership) {
    this.loading = true;
    var ctx = "Tìm Đối tượng nhận Coupon"

    this.GetMembershipByPhone_sst = this.apiService.GetMembershipByPhone(membership.CellPhone).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.membership = res.ObjectReturn
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  UpdateCouponIssuedMembership(detail: DTOCouponMembership[] = [this.membership]) {
    this.loading = true;
    this.isAddDoiTuong = this.membership.Code == 0
    var ctx = (this.isAddDoiTuong ? "Thêm" : "Cập nhật") + " Đối tượng"
    this.membership.VoucherIssue = this.couponPolicy.Code

    this.UpdateCouponIssuedMembership_sst = this.apiService.UpdateCouponIssuedMembership(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        // let arr = res.ObjectReturn as DTOCouponMembership[]

        // if (this.isAddDoiTuong) {//vì chỉ có mode add 1 item nên ko cần xử lý add trong loop
        //   this.totalDT++
        //   this.membership.Code = arr[0].Code
        //   this.listMembership.push(this.membership)
        // }
        // else
        //   arr.forEach(s => {
        //     var i = this.listMembership.findIndex(f => f.Code == s.Code)

        //     if (i > -1)
        //       this.listMembership.splice(i, 1, s)
        //   })

        // this.gridViewDT.next({ data: this.listMembership, total: this.totalDT });
        this.isAddDoiTuong = false

        if (this.drawer.opened)
          this.closeForm()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
      this.loadFilterDoiTuong()
      this.GetListCouponIssuedMembership()
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
      this.loadFilterDoiTuong()
      this.GetListCouponIssuedMembership()
    });
  }
  DeleteCouponIssuedMembership(detail: DTOCouponMembership[] = [this.membership]) {
    this.loading = true;
    var ctx = "Xóa Đối tượng"
    this.membership.VoucherIssue = this.couponPolicy.Code

    this.DeleteCouponIssuedMembership_sst = this.apiService.DeleteCouponIssuedMembership(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        // detail.forEach(s => {
        //   var i = this.listMembership.findIndex(f => f.Code == s.Code)

        //   if (i > -1) {
        //     this.totalDT--
        //     this.listMembership.splice(i, 1)
        //     // this.gridViewDT.next({ data: this.listMembership, total: this.total });
        //   }
        // })

        // var i = this.listMembership.findIndex(s => s.Code == detail.Code)

        // if (i > -1) {
        //   this.total--
        //   this.listMembership.splice(i, 1)
        // this.gridViewDT.next({ data: this.listMembership, total: this.totalDT });
        // }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.GetListCouponIssuedMembership()
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
      this.GetListCouponIssuedMembership()
    });
  }
  //product
  GetListCouponIssuedProduct() {
    this.loading = true;

    this.GetListCouponIssuedProduct_sst = this.apiService.GetListCouponIssuedProduct(this.gridStateSP).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listSanPham = res.ObjectReturn.Data;
        this.totalSP = res.ObjectReturn.Total
        this.gridViewSP.next({ data: this.listSanPham, total: this.totalSP });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  UpdateCouponIssuedProduct(detail: DTOCouponProduct[] = [this.sanpham]) {
    this.loading = true;
    this.isAddSanPham = this.membership.Code == 0
    var ctx = (this.isAddSanPham ? "Thêm" : "Cập nhật") + " Sản phẩm"
    this.sanpham.VoucherIssue = this.couponPolicy.Code

    this.UpdateCouponIssuedProduct_sst = this.apiService.UpdateCouponIssuedProduct(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        let arr = res.ObjectReturn as DTOCouponProduct[]

        if (this.isAddSanPham) {//vì chỉ có mode add 1 item nên ko cần xử lý add trong loop
          this.totalSP++
          this.sanpham.Code = arr[0].Code
          this.listSanPham.push(this.sanpham)
        }
        else
          arr.forEach(s => {
            var i = this.listSanPham.findIndex(f => f.Code == s.Code)

            if (i > -1)
              this.listSanPham.splice(i, 1, s)
          })

        this.gridViewSP.next({ data: this.listSanPham, total: this.totalSP });
        this.isAddSanPham = false

        if (this.drawer.opened)
          this.closeForm()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
      this.loadFilterSanPham()
      this.GetListCouponIssuedProduct()
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
      this.loadFilterSanPham()
      this.GetListCouponIssuedProduct()
    });
  }
  DeleteCouponIssuedProduct(detail: DTOCouponProduct[] = [this.sanpham]) {
    this.loading = true;
    var ctx = "Xóa Sản phẩm"
    this.sanpham.VoucherIssue = this.couponPolicy.Code

    this.DeleteCouponIssuedProduct_sst = this.apiService.DeleteCouponIssuedProduct(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        detail.forEach(s => {
          var i = this.listSanPham.findIndex(f => f.Code == s.Code)

          if (i > -1) {
            this.totalSP--
            this.listSanPham.splice(i, 1)
            // this.gridViewSP.next({ data: this.listMembership, total: this.total });
          }
        })

        // var i = this.listMembership.findIndex(s => s.Code == detail.Code)

        // if (i > -1) {
        //   this.total--
        //   this.listMembership.splice(i, 1)
        this.gridViewSP.next({ data: this.listSanPham, total: this.totalSP });
        // }
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
  p_GetCouponIssuedProduct() {
    this.loading = true;
    var ctx = "Tìm sản phẩm"

    this.GetCouponIssuedProduct_sst = this.apiService.GetCouponIssuedProduct(this.sanpham).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        // var sp: DTOPromotionDetail = res.ObjectReturn
        this.sanpham = res.ObjectReturn
        // this.sanpham.Barcode = sp.Barcode;
        // this.sanpham.ProductName = sp.VNName;
        // this.sanpham.ProductID = sp.Product;
        // this.sanpham.MinQty = sp.Quantity;
        // this.sanpham.MaxQty = sp.MaxQuantity;
        // this.sanpham.ImageSetting = sp.ImageSetting;
        this.loadFormSanPham()
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    });
  }
  //coupon
  GetListCoupon() {
    this.loading = true;

    this.GetListCoupon_sst = this.apiService.GetListCoupon(this.gridStateCP).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCoupon = res.ObjectReturn.Data;
        this.totalCP = res.ObjectReturn.Total
        this.gridViewCP.next({ data: this.listCoupon, total: this.totalCP });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  UpdateCouponStatus(status: number, statusName: string, detail: DTOCoupon[] = [this.coupon]) {
    this.loading = true;
    var ctx = statusName + " Coupon"

    this.UpdateCouponStatus_sst = this.apiService.UpdateCouponStatus(detail, status).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
      this.GetListCoupon()
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
      this.GetListCoupon()
    });
  }
  //file
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNews.GetFolderWithFile(childPath, 8)
  }
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
  p_ImportExcelCouponIssueMembership(file) {
    this.loading = true
    var ctx = "Import Excel Đối tượng nhận coupon"

    this.ImportExcelCouponIssueMembership_sst = this.apiService.ImportExcelCouponIssueMembership(file, this.couponPolicy.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListCouponIssuedMembership()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        const arr = res.ObjectReturn as DTOListProp_ObjReturn[]
        let importComponent = this.layoutService.getImportDialogComponent()
        //set key để map list data vả list property
        // importComponent.rowKey = 'Barcode'
        //list data để hiện lên popup
        // importComponent.errorRows = arr.map(s => s.ObjReturn)
        //list property để báo lỗi bằng css
        // importComponent.errorCellsOfRow = arr.map(s => ({
        //   ListProperties: s.ListProperties, RowKey: (s.ObjReturn as DTOPromotionDetail).Barcode
        // }))

        // importComponent.diCustomGridRef.autoFitColumns()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        importComponent.importGridDSView.next({ data: arr, total: arr.length })
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    })
  }
  p_ImportExcelCouponIssueProduct(file) {
    this.loading = true
    var ctx = "Import Excel Sản phẩm"

    this.ImportExcelCouponIssueProduct_sst = this.apiService.ImportExcelCouponIssueProduct(file, this.couponPolicy.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListCouponIssuedProduct()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        const arr = res.ObjectReturn as DTOListProp_ObjReturn[]
        let importComponent = this.layoutService.getImportDialogComponent()
        //set key để map list data vả list property
        // importComponent.rowKey = 'Barcode'
        //list data để hiện lên popup
        // importComponent.errorRows = arr.map(s => s.ObjReturn)
        //list property để báo lỗi bằng css
        // importComponent.errorCellsOfRow = arr.map(s => ({
        //   ListProperties: s.ListProperties, RowKey: (s.ObjReturn as DTOPromotionDetail).Barcode
        // }))

        // importComponent.diCustomGridRef.autoFitColumns()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        importComponent.importGridDSView.next({ data: arr, total: arr.length })
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    })
  }
  ExportExcelCoupon() {
    this.loading = true
    var ctx = "Export Excel Coupon"
    var getfileName = 'ExportListCoupon'
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.apiService.ExportListCoupon(this.couponPolicy.Code).subscribe(res => {
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
  updateStatus(statusID: number) {
    var newPro = { ...this.couponPolicy }
    // newPro.StatusID = statusID
    //check trước khi gửi duyệt
    if (statusID == 1 || statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(newPro.Prefix))
        this.layoutService.onError('Vui lòng nhập Mã bắt đầu coupon')
      else if (!Ps_UtilObjectService.hasValue(newPro.NoOfRelease) || newPro.NoOfRelease <= 0)
        this.layoutService.onError('Số lượng phát hành phải lớn hơn 0')
      else if (!Ps_UtilObjectService.hasValueString(newPro.CouponNameVN))
        this.layoutService.onError('Vui lòng nhập Tên coupon')

      else if (!Ps_UtilObjectService.hasValue(newPro.VoucherAmount) || newPro.VoucherAmount <= 0)
        this.layoutService.onError('Giá trị coupon phải lớn hơn 0')
      else if (!Ps_UtilObjectService.hasValueString(newPro.SummaryVN))
        this.layoutService.onError('Vui lòng nhập Mô tả điều kiện áp dụng')

      else if (!Ps_UtilObjectService.hasValueString(newPro.StartDate))
        this.layoutService.onError('Vui lòng chọn Ngày bắt đầu cho Thời gian hiệu lực')
      else if (!Ps_UtilObjectService.hasValueString(newPro.EndDate))
        this.layoutService.onError('Vui lòng chọn Ngày kết thúc cho Thời gian hiệu lực')

      else if (this.listWareHouse.find(s => s.IsSelected) == undefined)
        this.layoutService.onError('Vui lòng chọn Đơn vị áp dụng')
      else if (this.listWareHouse.findIndex(s => s.IsSelected && s.WH == 7) >= 0 && !Ps_UtilObjectService.hasValueString(newPro.DescriptionVN))//chỉ khi chọn Kho Online
        this.layoutService.onError('Vui lòng nhập Diễn giải')

      else if (!Ps_UtilObjectService.hasValue(newPro.NoOfAllowed) || newPro.NoOfAllowed <= 0)
        this.layoutService.onError('Số lượt dùng của Coupon phải lớn hơn 0')
      // else if (!Ps_UtilObjectService.hasValue(newPro.NoInTransaction) || newPro.NoInTransaction <= 0)
      //   this.layoutService.onError('Số lượt dùng tối đa/1 giao dịch phải lớn hơn 0')

      else if ((!this.couponPolicy.IsPublic) && !Ps_UtilObjectService.hasListValue(this.listMembership))
        this.layoutService.onError('Vui lòng Thêm Đối tượng nhận coupon')
      else if (((this.couponPolicy.TypeOfVoucher == 2 || this.couponPolicy.TypeOfVoucher == 4)
        && !this.couponPolicy.IsAllRouting) && !Ps_UtilObjectService.hasListValue(this.couponPolicy.ListRouting))
        this.layoutService.onError('Vui lòng Chọn điểm giao hàng')

      else if ((!this.couponPolicy.IsPublic && newPro.IsSMSSending) && !Ps_UtilObjectService.hasValueString(newPro.SMSContent))
        this.layoutService.onError('Vui lòng nhập Template SMS')
      else if ((!this.couponPolicy.IsPublic && newPro.IsSMSSending) && !Ps_UtilObjectService.hasValueString(newPro.SMSSendDate))
        this.layoutService.onError('Vui lòng chọn Thời điểm gởi SMS')

      else if ((newPro.IsAppSending) && !Ps_UtilObjectService.hasValueString(newPro.AppTitle))
        this.layoutService.onError('Vui lòng nhập Tiêu đề thông báo trên app mobile')
      else if ((newPro.IsAppSending) && !Ps_UtilObjectService.hasValueString(newPro.AppContent))
        this.layoutService.onError('Vui lòng nhập Nội dung thông báo trên app mobile')
      else if ((newPro.IsAppSending) && !Ps_UtilObjectService.hasValueString(newPro.AppSendDate))
        this.layoutService.onError('Vui lòng chọn Thời điểm gởi thông báo trên App mobile')
      else if ((newPro.IsAppSending) && !Ps_UtilObjectService.hasValue(newPro.AppObjType))
        this.layoutService.onError('Vui lòng chọn Đối tượng gởi thông báo')

      else if ((this.couponPolicy.TypeOfVoucher == 1 || this.couponPolicy.TypeOfVoucher == 2)
        && !Ps_UtilObjectService.hasListValue(this.listSanPham))
        this.layoutService.onError('Vui lòng Thêm Sản phẩm Khuyến mãi')
      else
        this.p_UpdateCouponIssuedStatus(statusID, [newPro])
    }
    else
      this.p_UpdateCouponIssuedStatus(statusID, [newPro])
  }
  createNew() {
    //object
    this.couponPolicy = new DTODetailCouponPolicy()
    this.couponPolicy.TypeOfVoucher = Ps_UtilObjectService.hasValue(this.currentTaoMoi) ? this.currentTaoMoi.value : this.listTaoMoi[0].value
    this.couponPolicy.TypeOfVoucherName = Ps_UtilObjectService.hasValue(this.currentTaoMoi) ? this.currentTaoMoi.text : this.listTaoMoi[0].text
    this.couponPolicy.TypeData = 1

    this.membership = new DTOCouponMembership()
    this.sanpham = new DTOCouponProduct()
    //array
    this.listMembership = []
    this.listSanPham = []
    this.listCoupon = []
    this.routingList = []

    this.gridViewSP.next({ data: [], total: 0 })
    this.gridViewDT.next({ data: [], total: 0 })
    this.gridViewCP.next({ data: [], total: 0 })
    //checkbox
    // this.listWareHouse.map(s => s.IsSelected = false)
    this.listWareHouse = []
    this.listWareHouse.push(new DTOCouponWarehouse(7, 'Website hachihachi.com.vn', false))
    this.listWareHouse.push(new DTOCouponWarehouse(-1, 'Tất cả cửa hàng', false))
    this.p_GetCouponIssuedWareHouse()

    this.provinceList.map(s => {
      s.IsSelected = false;

      if (Ps_UtilObjectService.hasListValue(s.ListChild))
        s.ListChild.map(ss => {
          ss.IsSelected = false
        })
    })
    //bool
    this.isLockAll = false
    this.isFilterActive = true
    this.excelValid = true

    this.isAdd = true
    this.isAddSanPham = true
    this.isAddDoiTuong = true
    //num
    this.curLanguage = 1
    this.contextIndex = 1

    this.totalSP = 0
    this.totalDT = 0
    this.totalCP = 0
    //date
    this.today = new Date()
    this.StartDate = null
    this.EndDate = null
    this.SMSSendDate = null
    this.AppSendDate = null

    this.checkCouponPolicyProp()
  }
  onHeaderDropdownlistClick(ev) {
    this.currentTaoMoi = ev
    this.createNew()
  }
  //header2
  downloadExcelSanPham() {
    this.p_DownloadExcel("CouponIssuedProductTemplate.xlsx")
  }
  onImportExcelSanPham() {
    this.contextIndex = 1
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  onAddSanPham(isAdd = true, item?) {
    this.contextIndex = 1
    this.isAddSanPham = isAdd;
    this.isAddDoiTuong = false

    this.clearFormSanPham()

    if (!isAdd) {
      this.sanpham = { ...item }
      this.p_GetCouponIssuedProduct()
    }
    this.drawer.open();
  }
  //header 3
  downloadExcelDoiTuong() {
    this.p_DownloadExcel("CouponIssuedMembershipTemplate.xlsx")
  }
  onImportExcelDoiTuong() {
    this.contextIndex = 2
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  onAddDoiTuong() {
    this.contextIndex = 2
    this.isAddDoiTuong = true;
    this.isAddSanPham = false
    this.clearFormDoiTuong()
    this.drawer.open();
  }
  //body1
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  onDelete() {
    this.contextIndex = 0
    this.contextName[this.contextIndex] = this.couponPolicy.CouponNameVN
    this.deleteDialogOpened = true
  }
  openDialogDiemGiaoHang() {
    this.isDialogDiemGiaoHang = true

    if (!Ps_UtilObjectService.hasListValue(this.provinceList))
      this.p_GetAllProvinceInVietName()
  }
  //body2
  checkboxHasChild(WH) {
    if (WH == -1) {
      var checkedBox = this.listWareHouse.filter(s => { return s.IsSelected && (s.WH != -1 && s.WH != 7) }).length
      return checkedBox > 0 && checkedBox < this.listLocalStore.length
    }

    return false
  }
  changeNotiTab(index: number) {
    this.curNoti = index
  }
  clickCheckbox(ev, prop: string, item?: any, parent?: any) {
    switch (prop) {
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
      case 'AppObjType':
        this.couponPolicy.AppObjType = ev.target.value
        this.UpdateCouponIssued(['AppObjType'])
        break
      case 'IsPublic':
        this.couponPolicy.IsPublic = ev.target.value === 'true'
        this.couponPolicy.IdentifiedMember = false
        this.UpdateCouponIssued(['IsPublic', 'IdentifiedMember'])
        break
      case 'NoOfReleaseForAll':
        this.couponPolicy.NoOfReleaseForAll = ev.target.value === 'true'
        this.UpdateCouponIssued(['NoOfReleaseForAll'])
        break
      case 'TypeOfDistribution':
        this.couponPolicy.TypeOfDistribution = ev.target.value == 1 ? 1 : 0
        this.UpdateCouponIssued(['TypeOfDistribution'])
        break
      case 'IsAllRouting':
        var check = ev.target.value === 'true'

        if (check) {
          var lst = this.routingList.filter(s => s.IsSelected)

          if (Ps_UtilObjectService.hasListValue(lst))
            this.DeleteCouponIssuedRounting(lst)
        }

        break
      case 'VNProvince':
        //1. xử lý trên provinceList
        var itemP: DTOLSProvince = { ...item }
        itemP.IsSelected = ev.target.checked
        var pIndex = this.provinceList.findIndex(s => s.Code == itemP.Code)//Province

        if (pIndex != -1)
          this.provinceList[pIndex].IsSelected = itemP.IsSelected
        //nếu bỏ chọn Tỉnh thành thì bỏ hết Quận huyện
        if (!itemP.IsSelected) {
          if (Ps_UtilObjectService.hasListValue(itemP.ListChild))
            itemP.ListChild.map(s => s.IsSelected = false)

          if (pIndex != -1 && Ps_UtilObjectService.hasListValue(this.provinceList[pIndex].ListChild)) {
            this.provinceList[pIndex].ListChild.map(s => s.IsSelected = false)
          }
        }
        //2. xử lý trên routingList
        itemP.IsSelected = ev.target.checked
        var routing = this.routingList.find(s => s.Province == itemP.Code && s.District == null)
        //nếu tồn tại trong couponPolicy
        if (Ps_UtilObjectService.hasValue(routing)) {
          routing.IsSelected = itemP.IsSelected
          //nếu bỏ check Tỉnh thành thì bỏ hết Quận huyện
          if (!itemP.IsSelected)
            this.routingList.map(s => {
              if (s.Province == routing.Province && s.District > 0)
                s.IsSelected = false
            })
        }
        else if (itemP.IsSelected) {
          var newRout = new DTOCounponRounting()
          newRout.IsSelected = true
          newRout.VoucherIssue = this.couponPolicy.Code
          newRout.Province = itemP.Code
          newRout.ProvinceName = itemP.VNProvince

          this.routingList.push(newRout)
        }
        break
      case 'VNDistrict':
        //1. xử lý trên provinceList
        var itemD: DTOLSDistrict = { ...item }
        var itemParent: DTOLSProvince = { ...parent }
        itemD.IsSelected = ev.target.checked
        var pIndex = this.provinceList.findIndex(s => s.Code == itemD.Province)

        if (pIndex != -1) {
          //nếu chọn Quận huyện thì chọn Tỉnh thành
          if (itemD.IsSelected) {
            itemParent.IsSelected = true
            this.provinceList[pIndex].IsSelected = true
          }

          if (Ps_UtilObjectService.hasListValue(this.provinceList[pIndex].ListChild)) {
            var dIndex = this.provinceList[pIndex].ListChild.findIndex(d => d.Code == itemD.Code)

            if (dIndex != -1)
              this.provinceList[pIndex].ListChild[dIndex].IsSelected = itemD.IsSelected
          }
        }
        //2. xử lý trên routingList
        itemD.IsSelected = ev.target.checked
        var routing = this.routingList.find(s => s.District == itemD.Code)
        //nếu tồn tại trong couponPolicy
        if (Ps_UtilObjectService.hasValue(routing)) {
          routing.IsSelected = itemD.IsSelected
        }
        else if (itemD.IsSelected) {
          var newRout = new DTOCounponRounting()//rout quận huyện
          newRout.IsSelected = true
          newRout.VoucherIssue = this.couponPolicy.Code
          newRout.Province = itemD.Province
          newRout.District = itemD.Code
          newRout.DistrictName = itemD.VNDistrict

          this.routingList.push(newRout)
          //nếu chọn Quận huyện thì chọn Tỉnh thành
          var routParent = this.routingList.find(s => s.Province == itemD.Province && s.District == null)

          if (Ps_UtilObjectService.hasValue(routParent)) {
            routParent.IsSelected = itemD.IsSelected
          }
          else if (itemD.IsSelected) {
            var newRoutP = new DTOCounponRounting()//rout tỉnh thành
            newRoutP.IsSelected = true
            newRoutP.VoucherIssue = this.couponPolicy.Code
            newRoutP.Province = itemParent.Code
            newRoutP.ProvinceName = itemParent.VNProvince

            this.routingList.push(newRoutP)
          }
        }
        break
      case 'IsAutoNo':
        this.couponPolicy[prop] = ev.target.checked

        if (!(this.couponPolicy.AutoNoRange > 0))
          this.couponPolicy.AutoNoRange = 1

        this.UpdateCouponIssued([prop, 'AutoNoRange'])
        break
      default:
        this.couponPolicy[prop] = ev.target.checked
        this.UpdateCouponIssued([prop])
        break
    }
  }
  searchSanPham() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterVNName.value = searchQuery
      this.filterBarcode.value = searchQuery
      this.filterPosCode.value = searchQuery
    } else {
      this.filterVNName.value = null
      this.filterBarcode.value = null
      this.filterPosCode.value = null
    }

    this.loadFilterSanPham();
    this.GetListCouponIssuedProduct()
  }
  onDeleteSanPham(obj: DTOCouponProduct) {
    this.contextIndex = 1
    this.sanpham = { ...obj };
    this.contextName[this.contextIndex] = this.sanpham.ProductName
    this.deleteDialogOpened = true
  }
  //body3
  searchDoiTuong() {
    var val = this.searchFormDT.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterCellPhone.value = searchQuery
      this.filterFullName.value = searchQuery
      this.filterMembershipNo.value = searchQuery
    } else {
      this.filterCellPhone.value = null
      this.filterFullName.value = null
      this.filterMembershipNo.value = null
    }

    this.loadFilterDoiTuong();
    this.GetListCouponIssuedMembership()
  }
  onEditDoiTuong(obj: DTOCouponMembership) {
    this.contextIndex = 2
    this.isAddSanPham = false
    this.isAddDoiTuong = false
    this.membership = { ...obj }
    this.GetCouponIssuedMembership()
    this.loadFormDoiTuong()
    this.drawer.open();
  }
  onDeleteDoiTuong(obj: DTOCouponMembership) {
    this.contextIndex = 2
    this.membership = { ...obj };
    this.contextName[this.contextIndex] = this.membership.FullName
    this.deleteDialogOpened = true
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
  //FORM button
  onSubmitSP(): void {
    this.formSP.markAllAsTouched()

    if (this.formSP.valid) {
      this.UpdateCouponIssuedProduct()
    }
    else
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
  }
  onSubmitDT(): void {
    this.formDT.markAllAsTouched()

    if (this.formDT.valid) {
      this.UpdateCouponIssuedMembership()
    }
    else
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
  }
  clearFormSanPham() {
    this.formSP.reset()
    this.sanpham = new DTOCouponProduct()
    this.loadFormSanPham()
  }
  clearFormDoiTuong() {
    this.formDT.reset()
    this.membership = new DTOCouponMembership()
    this.loadFormDoiTuong()
  }
  closeForm() {
    this.clearFormSanPham()
    this.drawer.close()
  }
  //POPUP
  //action dropdown
  getActionDropdownDT(moreActionDropdown: MenuDataItem[], dataItem: DTOCouponMembership) {
    moreActionDropdown = []
    var item: DTOCouponMembership = dataItem
    var statusID = item.StatusID;
    //
    if (this.couponPolicy.StatusID != 0)
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
    //status
    if (statusID != 1)
      moreActionDropdown.push({ Name: "Áp dụng", Code: "redo", Link: "1", Type: "StatusID", Actived: true })
    else
      moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Link: "2", Type: "StatusID", Actived: true })
    //delete
    if (this.couponPolicy.StatusID == 0)
      moreActionDropdown.push({ Name: "Xóa đối tượng", Code: "trash", Link: "delete", Actived: true })

    return moreActionDropdown
  }
  getActionDropdownCP(moreActionDropdown: MenuDataItem[], dataItem: DTOCoupon) {
    var item: DTOCoupon = dataItem
    var statusID = item.StatusID;
    moreActionDropdown = []

    if (statusID != 2)
      moreActionDropdown.push({ Name: "Áp dụng", Code: "redo", Link: "2", Type: "StatusID", Actived: true })
    else
      moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Link: "3", Type: "StatusID", Actived: true })

    return moreActionDropdown
  }
  //click action dropdown
  onActionDropdownClickDT(menu: MenuDataItem, item: DTOCouponMembership) {
    if (item.Code > 0) {
      if (menu.Type == 'StatusID') {
        this.membership = { ...item }
        this.membership.StatusID = parseInt(menu.Link)
        this.UpdateCouponIssuedMembership()
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil'
        || menu.Code == "eye" || menu.Link == 'detail') {
        this.onEditDoiTuong(item)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDeleteDoiTuong(item)
      }
    }
  }
  onActionDropdownClickCP(menu: MenuDataItem, item: DTOCoupon) {
    if (item.Code > 0) {
      if (menu.Type == 'StatusID') {
        this.UpdateCouponStatus(parseInt(menu.Link), menu.Name, [item])
      }
      // else if (menu.Link == 'edit' || menu.Code == 'pencil'
      //   || menu.Code == "eye" || menu.Link == 'detail') {
      //   this.onEditDoiTuong(item)
      // }
      // else if (menu.Link == 'delete' || menu.Code == 'trash') {
      //   this.onDeleteDoiTuong(item)
      // }
    }
  }
  //selection 
  getSelectionPopupDT(selectedList: DTOCouponMembership[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    if (selectedList.findIndex(s => s.StatusID == 2) != -1)
      moreActionDropdown.push({
        Name: "Áp dụng", Type: "StatusID",
        Code: "check-outline", Link: "1", Actived: true
      })

    if (selectedList.findIndex(s => s.StatusID == 1) != -1)
      moreActionDropdown.push({
        Name: "Ngưng áp dụng", Type: "StatusID",
        Code: "minus-outline", Link: "2", Actived: true
      })

    if (!this.isLockAll)
      moreActionDropdown.push({
        Name: "Xóa đối tượng", Type: "delete",
        Code: "trash", Link: "delete", Actived: true
      })

    return moreActionDropdown
  }
  getSelectionPopupCP(selectedList: DTOCoupon[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    if (selectedList.findIndex(s => s.StatusID != 2) != -1)
      moreActionDropdown.push({
        Name: "Áp dụng", Type: "StatusID",
        Code: "check-outline", Link: "2", Actived: true
      })

    if (selectedList.findIndex(s => s.StatusID == 2) != -1)
      moreActionDropdown.push({
        Name: "Ngưng áp dụng", Type: "StatusID",
        Code: "minus-outline", Link: "3", Actived: true
      })

    // if (!this.isLockAll)
    //   moreActionDropdown.push({
    //     Name: "Xóa đối tượng", Type: "delete",
    //     Code: "trash", Link: "delete", Actived: true
    //   })

    return moreActionDropdown
  }
  onSelectedPopupBtnClickDT(btnType: string, list: DTOCouponMembership[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        let arr = []
        //áp dụng
        if (value == 1 || value == '1') {
          list.forEach(s => {
            if (s.StatusID != 1) {
              s.StatusID = 1
              s.VoucherIssue = this.couponPolicy.Code
              arr.push(s)
            }
          })
        }//ngưng áp dụng 
        else if (value == 2 || value == '2') {
          list.forEach(s => {
            if (s.StatusID == 1) {
              s.StatusID = 2
              s.VoucherIssue = this.couponPolicy.Code
              arr.push(s)
            }
          })
        }

        if (arr.length > 0)
          this.UpdateCouponIssuedMembership(arr)
      }
      else if (btnType == "delete" && !this.isLockAll) {
        if (this.couponPolicy.StatusID == 0) {
          let arr = []
          //xóa ngưng áp dụng 
          list.forEach(s => {
            if (s.StatusID != 1) {
              arr.push(s)
            }
          })

          if (arr.length > 0)
            this.DeleteCouponIssuedMembership(arr)
        }
      }
    }
  }
  onSelectedPopupBtnClickCP(btnType: string, list: DTOCouponMembership[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        let arr = []
        //áp dụng
        if (value == 1 || value == '1') {
          list.forEach(s => {
            if (s.StatusID != 1) {
              s.StatusID = 1
              s.VoucherIssue = this.couponPolicy.Code
              arr.push(s)
            }
          })
        }//ngưng áp dụng 
        else if (value == 2 || value == '2') {
          list.forEach(s => {
            if (s.StatusID == 1) {
              s.StatusID = 2
              s.VoucherIssue = this.couponPolicy.Code
              arr.push(s)
            }
          })
        }

        if (arr.length > 0)
          this.UpdateCouponStatus(value, value == 1 ? 'Áp dụng' : 'Ngưng áp dụng', arr)
      }
      // else if (btnType == "delete" && !this.isLockAll) {
      //   if (this.couponPolicy.StatusID == 0) {
      //     let arr = []
      //     //xóa ngưng áp dụng 
      //     list.forEach(s => {
      //       if (s.StatusID != 1) {
      //         arr.push(s)
      //       }
      //     })

      //     if (arr.length > 0)
      //       this.DeleteCouponIssuedMembership(arr)
      //   }
      // }
    }
  }
  selectChangeDT(deactive) {
    this.isFilterActive = !deactive
  }
  selectChangeCP(deactive) {
    this.isFilterActive = !deactive
  }
  //DIALOG button
  //delete
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  delete() {
    if (this.contextIndex == 0)
      this.DeleteCouponIssued()
    else if (this.contextIndex == 1)
      this.DeleteCouponIssuedProduct()
    else if (this.contextIndex == 2)
      this.DeleteCouponIssuedMembership()
  }
  //diem giao hang
  closeDialogDiemGiaoHang() {
    this.isDialogDiemGiaoHang = false
  }
  updateDiemGiaoHang() {
    var listUpdate = []
    var listDelete = []

    this.routingList.forEach(s => {
      if (s.IsSelected)
        listUpdate.push(s)
      else
        listDelete.push(s)
    })

    if (Ps_UtilObjectService.hasListValue(listUpdate))
      this.UpdateCouponIssuedRounting(listUpdate)

    if (Ps_UtilObjectService.hasListValue(listDelete))
      this.DeleteCouponIssuedRounting(listDelete)
  }
  deleteDiemGiaoHang(item: DTOCounponRounting) {
    //nếu là tỉnh thành thì xóa luôn quận huyện
    if (!Ps_UtilObjectService.hasValue(item.District) || item.District <= 0) {
      var list = this.couponPolicy.ListRouting.filter(s => s.Province == item.Province)

      if (Ps_UtilObjectService.hasListValue(list))
        this.DeleteCouponIssuedRounting(list)
    }
    else//nếu là quận huyện
      this.DeleteCouponIssuedRounting([item])
  }
  toggleExpandTinhThanh(item: DTOLSProvince, expand: boolean) {
    item.IsExpanded = expand

    if (expand && !Ps_UtilObjectService.hasListValue(item.ListChild)) {
      this.p_GetAllDistrictInProvince(item)
    }
  }

  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  pickFile(e: DTOCFFile, width, height) {
    this.layoutService.getEditor().embedImgURL(e, width, height)
    this.layoutService.setFolderDialog(false)
  }
  //AUTORUN
  //value change
  checkCouponPolicyProp() {
    this.isLockAll = (this.couponPolicy.StatusID == 2 || this.couponPolicy.StatusID == 3) || //khóa khi duyệt, ngưng
      (this.couponPolicy.StatusID != 0 && this.couponPolicy.StatusID != 4 && this.isAllowedToCreate && !this.isAllowedToVerify)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.couponPolicy.StatusID == 0 || this.couponPolicy.StatusID == 4) && this.isAllowedToVerify && !this.isAllowedToCreate)//khóa khi tạo, trả nếu có quyền duyệt

    if (Ps_UtilObjectService.hasValueString(this.couponPolicy.StartDate))
      this.StartDate = new Date(this.couponPolicy.StartDate)

    if (Ps_UtilObjectService.hasValueString(this.couponPolicy.EndDate))
      this.EndDate = new Date(this.couponPolicy.EndDate)

    if (Ps_UtilObjectService.hasValueString(this.couponPolicy.AppSendDate))
      this.AppSendDate = new Date(this.couponPolicy.AppSendDate)

    if (Ps_UtilObjectService.hasValueString(this.couponPolicy.SMSSendDate))
      this.SMSSendDate = new Date(this.couponPolicy.SMSSendDate)

    if (Ps_UtilObjectService.hasListValue(this.couponPolicy.ListRouting)) {
      this.routingList = []
      //orderBy [{ field: 'Province' }, { field: 'District' }])
      this.couponPolicy.ListRouting.sort(function (a, b) {
        return a.Province - b.Province || a.District - b.District;
      });

      this.routingList = [...this.couponPolicy.ListRouting]
      this.routingList.map(s => s.IsSelected = true)
    }
    //check Tất cả cửa hàng 
    if (Ps_UtilObjectService.hasListValue(this.listWareHouse)) {
      var tatCa = this.listWareHouse.filter(s => s.WH != -1 && s.WH != 7)
      this.listWareHouse[1].IsSelected = tatCa.findIndex(s => !s.IsSelected) == -1
    }

    this.selectable.enabled = this.isLockAll
  }
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        case 'Barcode':
          if ((this.isAddSanPham && !this.isAddDoiTuong) && this.drawer.opened
            && Ps_UtilObjectService.hasValueString(this.sanpham.Barcode))
            this.p_GetCouponIssuedProduct()
          break
        case 'CellPhone':
          if ((this.isAddDoiTuong && !this.isAddSanPham) && this.drawer.opened
            && Ps_UtilObjectService.hasValueString(this.membership.CellPhone))
            this.GetMembershipByPhone()
          break
        default:
          this.UpdateCouponIssued([prop])
          break
      }
    }
  }
  onEditorValueChange(val) {
    this.couponPolicy.AppContent = val
  }
  saveWebContent() {
    this.UpdateCouponIssued(['AppContent'])
  }
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.couponPolicy[prop] = this[prop]
      this.UpdateCouponIssued([prop])
    }
  }
  onDatetimepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this[prop].setSeconds(0)
      this.couponPolicy[prop] = this[prop]
      this.UpdateCouponIssued([prop])
    }
  }
  //auto run
  uploadEventHandler(e: File) {
    if (this.contextIndex == 2)
      this.p_ImportExcelCouponIssueMembership(e)
    else if (this.contextIndex == 1)
      this.p_ImportExcelCouponIssueProduct(e)
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.getCacheCouponPolicyDetail_sst?.unsubscribe()
    this.GetCouponIssuedByCode_sst?.unsubscribe()
    this.UpdateCouponIssued_sst?.unsubscribe()
    this.UpdateCouponIssuedStatus_sst?.unsubscribe()
    this.DeleteCouponIssued_sst?.unsubscribe()

    this.GetCouponIssuedWareHouse_sst?.unsubscribe()
    this.UpdateCouponIssuedWH_sst?.unsubscribe()

    this.GetAllProvinceInVietName_sst?.unsubscribe()
    this.GetAllDistrictInProvince_sst?.unsubscribe()
    this.UpdateCouponIssuedRounting_sst?.unsubscribe()
    this.DeleteCouponIssuedRounting_sst?.unsubscribe()
    this.GetListCouponIssuedMembership_sst?.unsubscribe()

    this.DeleteCouponIssuedProduct_sst?.unsubscribe()
    this.GetCouponIssuedProduct_sst?.unsubscribe()
    this.GetListCoupon_sst?.unsubscribe()
    this.UpdateCouponStatus_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()
    this.ImportExcelCouponIssueMembership_sst?.unsubscribe()
    this.ImportExcelCouponIssueProduct_sst?.unsubscribe()

    this.UpdateCouponIssuedProduct_sst?.unsubscribe()
    this.GetListCouponIssuedProduct_sst?.unsubscribe()
    this.DeleteCouponIssuedMembership_sst?.unsubscribe()
    this.UpdateCouponIssuedMembership_sst?.unsubscribe()
    this.GetMembershipByPhone_sst?.unsubscribe()
    this.GetCouponIssuedMembership_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
