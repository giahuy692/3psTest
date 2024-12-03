import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem, MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import DTOPromotionProduct from '../../shared/dto/DTOPromotionProduct.dto';
import { MarketingService } from '../../shared/services/marketing.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';

import DTOCouponPolicy from '../../shared/dto/DTOCouponPolicy.dto';
import { MarCouponPolicyAPIService } from '../../shared/services/marcoupon-policy-api.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';

@Component({
  selector: 'app-mar004-coupon-list',
  templateUrl: './mar004-coupon-list.component.html',
  styleUrls: ['./mar004-coupon-list.component.scss']
})
export class Mar004CouponListComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true
  deleteDialogOpened = false
  deleteManyDialogOpened = false
  total = 0
  //object
  deleteList: DTOCouponPolicy[] = []
  listCoupon: DTOCouponPolicy[] = []
  listWareHouse: DTOWarehouse[] = []//DTO
  curCoupon = new DTOCouponPolicy()
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

  listChuongTrinh: any[] = [{
    text: 'Tất cả',
    value: null
  }]

  listDonVi: any[] = [{
    text: 'Tất cả',
    value: null
  }, {
    text: 'Website hachihachi.com.vn',
    value: 7
  }, {
    text: 'Hệ thống cửa hàng',
    value: -1
  }]
  //default dropdown
  defaultChuongTrinh = { text: '- Chọn phân loại coupon -', value: -1 }
  defaultDonVi = { text: '- Chọn đơn vị áp dụng -', value: -1 }
  defaultTaoMoi = { text: 'TẠO MỚI', value: -1 }
  //current dropdown
  currentChuongTrinh: { text: string, value: number } = null//this.listChuongTrinh[0]
  currentDonVi: { text: string, value: number } = null//this.listDonVi[0]
  currentTaoMoi: { text: string, value: number } = null//this.listTaoMoi[0]
  //header1
  dangHieuLuc_checked = true
  hetHieuLuc_checked = false
  dangHieuLuc_count = 0
  //header1
  dangSoanThao = true
  guiDuyet = false
  daDuyet = false
  ngungHienThi = false
  //header2
  searchForm: UntypedFormGroup
  //FILTER
  //header1
  filterTypeOfVoucher: FilterDescriptor = {
    field: "TypeOfVoucher", operator: "eq", value: null
  }
  filterStatusID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }

  filterDangSoanThao: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 0
  }
  filterGuiDuyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 1
  }
  filterDaDuyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 2
  }
  filterNgungHienThi: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 3
  }
  filterTraLai: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 4
  }
  //header2
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterCouponNameVN: FilterDescriptor = {
    field: "CouponNameVN", operator: "contains", value: null
  }
  filterPrefix: FilterDescriptor = {
    field: "Prefix", operator: "contains", value: null
  }
  filterSummaryVN: FilterDescriptor = {
    field: "SummaryVN", operator: "contains", value: null
  }
  //grid
  allowActionDropdown = ['detail', 'edit', 'delete']
  //grid
  pageSize = 25
  pageSizes = [this.pageSize]
  sort: SortDescriptor = { field: 'EndDate', dir: 'asc' }

  gridDSView = new Subject<any>();
  gridDSState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [this.sort]
  }
  //CALLBACK
  //grid data
  onPageChangeCallback: Function
  onSortChangeCallback: Function
  //rowItem action dropdown
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
  //grid select
  getSelectionPopupCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  //select
  selectable: SelectableSettings = {
    enabled: false,
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
  changeModuleData_sst: Subscription
  changePermission_sst: Subscription
  GetListCouponIssued_sst: Subscription
  GetWarehouse_sst: Subscription

  UpdateCouponIssued_sst: Subscription
  UpdateCouponIssuedStatus_sst: Subscription
  DeleteCouponIssued_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    public service: MarketingService,
    public apiService: MarCouponPolicyAPIService,
    public layoutApiService: LayoutAPIService,
    public layoutService: LayoutService
    ) { }

  ngOnInit(): void {
    let that = this    
    this.listChuongTrinh.push(...this.listTaoMoi)
    //load
    this.loadSearchForm()
    this.loadFilter()

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // that.getData()
      }
    })

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.getData()
      }
    })
    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //action dropdown    
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    //select KO CHO SELECT NHIỀU VÌ RÀNG BUỘC QUÁ NHIỀU DỮ LIỆU
    // this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    // this.onSelectCallback = this.selectChange.bind(this)
    // this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }
  getData() {
    this.p_GetDonViApDung()
    this.GetListCouponIssued()
  }
  //load  
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadFilter() {
    this.pageSizes = [...this.service.pageSizes]
    this.gridDSState.take = this.pageSize
    this.gridDSState.filter.filters = []
    this.filterStatusID.filters = []
    this.filterSearchBox.filters = []
    this.filterStatusID.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterCouponNameVN.value))
      this.filterSearchBox.filters.push(this.filterCouponNameVN)

    if (Ps_UtilObjectService.hasValueString(this.filterPrefix.value))
      this.filterSearchBox.filters.push(this.filterPrefix)

    if (Ps_UtilObjectService.hasValueString(this.filterSummaryVN.value))
      this.filterSearchBox.filters.push(this.filterSummaryVN)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
    //checkbox header 1
    if (this.dangSoanThao) {
      this.filterStatusID.filters.push(this.filterDangSoanThao)
      this.filterStatusID.filters.push(this.filterTraLai)
    }

    if (this.guiDuyet)
      this.filterStatusID.filters.push(this.filterGuiDuyet)

    if (this.daDuyet)
      this.filterStatusID.filters.push(this.filterDaDuyet)

    if (this.ngungHienThi)
      this.filterStatusID.filters.push(this.filterNgungHienThi)

    if (this.filterStatusID.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterStatusID)
    //dropdown header 1
    if (this.currentChuongTrinh != null) {
      this.filterTypeOfVoucher.value = this.currentChuongTrinh.value
      this.gridDSState.filter.filters.push(this.filterTypeOfVoucher)
    }
  }
  resetFilter() {
    //header1
    this.currentChuongTrinh = null
    this.currentDonVi = null
    this.filterTypeOfVoucher.value = null

    this.dangHieuLuc_checked = true
    this.hetHieuLuc_checked = false

    this.dangSoanThao = true
    this.guiDuyet = false
    this.daDuyet = false
    this.ngungHienThi = false
    // //header2
    this.searchForm.get('SearchQuery').setValue(null)
    this.filterCouponNameVN.value = null
    this.filterSummaryVN.value = null
    this.filterPrefix.value = null

    this.gridDSState.sort = [this.sort]
    this.loadFilter()
    this.GetListCouponIssued()
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.GetListCouponIssued()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.GetListCouponIssued()
  }
  //API  
  GetListCouponIssued() {
    this.loading = true;

    this.GetListCouponIssued_sst = this.apiService.GetListCouponIssued(this.gridDSState, this.currentDonVi == null ? null : this.currentDonVi.value).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCoupon = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridDSView.next({ data: this.listCoupon, total: this.total });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetDonViApDung() {
    this.loading = true;

    this.GetWarehouse_sst = this.layoutApiService.GetWarehouse().subscribe((res: DTOWarehouse[]) => {
      if (res != null) {
        this.listWareHouse = res.filter(s => s.Code != 7);
        this.listDonVi.push(...this.listWareHouse
          .map(s => { return { text: s.WHName, value: s.Code, sub: true } }))
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //update
  p_UpdateCouponIssued(properties: string[], coupon: DTOCouponPolicy = this.curCoupon) {
    this.loading = true;
    var ctx = "Cập nhật Chính sách Coupon"

    var updateDTO: DTOUpdate = {
      "DTO": coupon,
      "Properties": properties
    }

    this.UpdateCouponIssued_sst = this.apiService.UpdateCouponIssued(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        coupon = res.ObjectReturn
        var i = this.listCoupon.findIndex(s => s.Code == coupon.Code)

        if (i > -1)
          this.listCoupon.splice(i, 1, res.ObjectReturn)

        this.gridDSView.next({ data: this.listCoupon, total: this.total });
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
  P_UpdateCouponIssuedStatus(statusID: number, list: DTOCouponPolicy[] = [this.curCoupon]) {
    this.loading = true;
    var ctx = "Cập nhật tình trạng Đợt phát hành"

    this.UpdateCouponIssuedStatus_sst = this.apiService.UpdateCouponIssuedStatus(list, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.GetListCouponIssued()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        // coupon = res.ObjectReturn
        // var i = this.listCoupon.findIndex(s => s.Code == coupon.Code)

        // if (i > -1)
        //   this.listCoupon.splice(i, 1, res.ObjectReturn)

        // this.gridDSView.next({ data: this.listCoupon, total: this.total });
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
  p_DeleteCouponIssued(coupons: DTOCouponPolicy[] = [this.curCoupon]) {
    this.loading = true;
    var ctx = "Xóa Chính sách Coupon"

    this.DeleteCouponIssued_sst = this.apiService.DeleteCouponIssued(coupons).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListCouponIssued()
        // var i = this.listCoupon.findIndex(s => s.Code == coupon.Code)

        // if (i > -1) {
        //   this.total--
        //   this.listCoupon.splice(i, 1)
        //   this.gridDSView.next({ data: this.listCoupon, total: this.total });
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
  //CLICK EVENT
  //header1
  onDropdownlistClick(ev, currentDropdown?: string) {
    if (currentDropdown != null) {
      if (currentDropdown != 'currentTaoMoi') {
        this[currentDropdown] = ev
        this.loadFilter()
        this.GetListCouponIssued()
      } else {
        this.currentTaoMoi = ev
        this.openDetail(true)
      }
    }
  }
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e

    this.loadFilter()
    this.GetListCouponIssued()
  }
  //header2
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterPrefix.value = searchQuery
      this.filterCouponNameVN.value = searchQuery
      this.filterSummaryVN.value = searchQuery
    } else {
      this.filterPrefix.value = null
      this.filterCouponNameVN.value = null
      this.filterSummaryVN.value = null
    }

    this.loadFilter();
    this.GetListCouponIssued()
  }
  //selection
  getSelectionPopup(selectedList: DTOPromotionProduct[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0)// || s.StatusID == 4

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1",
        Actived: true, LstChild: []
      })
    //
    if (this.isToanQuyen || this.isAllowedToVerify) {
      var canPheDuyet_canTraLai = selectedList.findIndex(s => s.StatusID == 1 || s.StatusID == 3)

      if (canPheDuyet_canTraLai != -1) {
        moreActionDropdown.push({
          Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
        })

        moreActionDropdown.push({
          Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
        })
      }

      var canStop = selectedList.findIndex(s => s.StatusID == 2)

      if (canStop != -1)
        moreActionDropdown.push({
          Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
        })
    }
    //delete  
    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Name: "Xóa chương trình", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: DTOCouponPolicy[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        if (value == 1 || value == '1')//Gửi duyệt
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 4) {
              s.StatusID = 1
              this.p_UpdateCouponIssued(["StatusID"], s)
            }
          })
        else if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              s.StatusID = 2
              this.p_UpdateCouponIssued(["StatusID"], s)
            }
          })
        else if (value == 4 || value == '4')//Trả về
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              s.StatusID = 4
              this.p_UpdateCouponIssued(["StatusID"], s)
            }
          })
        else if (value == 3 || value == '3')//Ngưng hiển thị
          list.forEach(s => {
            if (s.StatusID == 2) {
              s.StatusID = 3
              this.p_UpdateCouponIssued(["StatusID"], s)
            }
          })
      }
      else if (btnType == "delete") {//Xóa
        this.onDeleteMany()
        this.deleteList = []

        list.forEach(s => {
          if (s.StatusID == 0 || s.StatusID == 4)
            this.deleteList.push(s)
        })
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOCouponPolicy) {
    moreActionDropdown = []
    this.curCoupon = { ...dataItem }
    var statusID = this.curCoupon.StatusID;
    //edit
    if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate) ||
      ((statusID == 0 || statusID == 4) && this.isAllowedToVerify))
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status KO CHO UPDATE Ở LIST VÌ RÀNG BUỘC QUÁ NHIỀU DỮ LIỆU
    // if ((this.isToanQuyen || this.isAllowedToCreate) && (statusID == 0 || statusID == 4)) {
    //   moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
    // }
    // //
    // else if (this.isToanQuyen || this.isAllowedToVerify) {
    //   if (statusID == 1) {
    //     moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
    //   }
    //   else if (statusID == 2) {
    //     moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
    //   }
    //   else if (statusID == 3) {
    //     moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })

    //     moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })
    //   }
    // }
    //delete
    if ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xóa chính sách", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOCouponPolicy) {
    if (item.Code > 0) {
      // if (menu.Type == 'StatusID') {
      //   this.curCoupon = { ...item }
      //   this.curCoupon.StatusID = parseInt(menu.Link)
        
      //   // this.p_UpdateCouponIssued(["StatusID"])
      // }
      // else 
      if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.curCoupon = { ...item }
        this.openDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.curCoupon = { ...item }
        this.onDeleteCouponIssued()
      }
    }
  }
  //delete
  onDeleteCouponIssued() {
    this.deleteDialogOpened = true
  }
  delete() {
    if (this.curCoupon.Code > 0)
      this.p_DeleteCouponIssued()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.p_DeleteCouponIssued(this.deleteList)
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //
  openDetail(isAdd: boolean) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      this.service.isAdd = isAdd

      if (isAdd) {
        var prom = new DTOCouponPolicy()
        prom.TypeOfVoucher = this.currentTaoMoi.value
        prom.TypeOfVoucherName = this.currentTaoMoi.text
        prom.TypeData = 1
        this.service.setCacheCouponPolicyDetail(prom)
      } else
        this.service.setCacheCouponPolicyDetail(this.curCoupon)
      //group
      var parent = item.ListMenu.find(f => f.Code.includes('coupon-list')
        || f.Link.includes('coupon-list'))
      //function
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('coupon-list')
          || f.Link.includes('coupon-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('coupon-detail')
            || f.Link.includes('coupon-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //AUTORUN
  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.value == -1;
  }
  ngOnDestroy(): void {
    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.GetListCouponIssued_sst?.unsubscribe()
    this.GetWarehouse_sst?.unsubscribe()

    this.UpdateCouponIssued_sst?.unsubscribe()
    this.UpdateCouponIssuedStatus_sst?.unsubscribe()
    this.DeleteCouponIssued_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
