import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';

import { Subject, Subscription } from 'rxjs';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import DTOCouponPolicy from 'src/app/p-app/p-marketing/shared/dto/DTOCouponPolicy.dto';
import DTOPromotionProduct from 'src/app/p-app/p-marketing/shared/dto/DTOPromotionProduct.dto';
import { MarCouponPolicyAPIService } from 'src/app/p-app/p-marketing/shared/services/marcoupon-policy-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOVoucherType } from '../../shared/dto/DTOVoucherType.dto';
import { SaleVoucherAPIService } from '../../shared/services/sale-voucher-api.service';
import { SaleService } from '../../shared/services/sale.service';

@Component({
  selector: 'app-sale002-gift-voucher-list',
  templateUrl: './sale002-gift-voucher-list.component.html',
  styleUrls: ['./sale002-gift-voucher-list.component.scss']
})
export class Sale002GiftVoucherListComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true
  deleteDialogOpened = false
  deleteManyDialogOpened = false
  //
  total = 0
  today = new Date()
  //object
  deleteList: DTOCouponPolicy[] = []
  listCoupon: DTOCouponPolicy[] = []
  curCoupon = new DTOCouponPolicy()
  //dropdown
  listChuongTrinh: DTOVoucherType[] = [
    new DTOVoucherType(
      null,
      'Tất cả'
    )
  ]
  listWareHouse: DTOWarehouse[] = []

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
  defaultChuongTrinh = new DTOVoucherType(-1, 'Phân nhóm phiếu mua hàng')
  defaultDonVi = { text: 'Đơn vị tiếp nhận', value: -1 }
  //current dropdown
  currentChuongTrinh: DTOVoucherType = null
  currentDonVi: { text: string, value: number } = null
  //header1
  cbxList = [{
    Name: 'Đang soạn thảo',
    Checked: true,
    Filter: {
      field: "StatusID", operator: "eq", value: 0
    }
  }, {
    Name: 'Phê duyệt',
    Checked: false,
    Filter: {
      field: "StatusID", operator: "eq", value: 2
    }
  }, {
    Name: 'Ngưng hiển thị',
    Checked: false,
    Filter: {
      field: "StatusID", operator: "eq", value: 3
    }
  }]
  //header2
  searchForm: UntypedFormGroup
  //FILTER
  filterWHCode: FilterDescriptor = {
    field: "WHCode", operator: "eq", value: null
  }
  //header1
  filterTypeOfVoucher: FilterDescriptor = {
    field: "TypeOfVoucher", operator: "eq", value: null
  }
  filterStatusID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }

  filterTraVe: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 4
  }
  //header2
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterPrefix: FilterDescriptor = {
    field: "Prefix", operator: "contains", value: null
  }
  filterCouponNameVN: FilterDescriptor = {
    field: "CouponNameVN", operator: "contains", value: null
  }
  //grid
  allowActionDropdown = ['detail', 'edit', 'delete']
  //grid
  pageSize = 25
  pageSizes = [this.pageSize]
  sort: SortDescriptor = { field: 'Code', dir: 'desc' }
  //todo sort theo ngày phát hành != startdate, tạm thời dùng code

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
  changeModuleData_sst: Subscription
  changePermission_sst: Subscription
  changePermissionAPI: Subscription

  GetListVoucher_sst: Subscription
  GetWarehouse_sst: Subscription
  GetListVoucherType_sst: Subscription

  UpdateCouponIssued_sst: Subscription
  UpdateCouponIssuedStatus_sst: Subscription
  DeleteCouponIssued_sst: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    public service: SaleService,
    public apiService: SaleVoucherAPIService,
    public apiCouponService: MarCouponPolicyAPIService,
    public layoutApiService: LayoutAPIService,
    public layoutService: LayoutService,
    ) { }

  ngOnInit(): void {
    let that = this
    
    // this.listChuongTrinh.push(...this.listTaoMoi)
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

    this.changePermissionAPI =  this.menuService.changePermissionAPI().subscribe((res) => {
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
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }
  getData() {
    this.p_GetDonViApDung()
    this.p_GetListVoucherType()
    this.GetListVoucher()
  }
  //load  
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridDSState.take = this.pageSize
    this.gridDSState.filter.filters = []
    this.filterStatusID.filters = []
    this.filterSearchBox.filters = []
    //coupon đơn vị lọc NGOÀI filter
    //PMH lọc TRONG filter
    if (Ps_UtilObjectService.hasValue(this.currentDonVi) && Ps_UtilObjectService.hasValue(this.currentDonVi.value)) {
      this.filterWHCode.value = this.currentDonVi.value
      this.gridDSState.filter.filters.push(this.filterWHCode)
    }
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterPrefix.value))
      this.filterSearchBox.filters.push(this.filterPrefix)

    if (Ps_UtilObjectService.hasValueString(this.filterCouponNameVN.value))
      this.filterSearchBox.filters.push(this.filterCouponNameVN)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
    //checkbox header 1
    this.cbxList.forEach(s => {
      if (s.Checked) {
        this.filterStatusID.filters.push(s.Filter)

        if (s.Filter.value == 0)
          this.filterStatusID.filters.push(this.filterTraVe)
      }
    })

    if (this.filterStatusID.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterStatusID)
    //dropdown header 1
    if (this.currentChuongTrinh != null && this.currentChuongTrinh.Code != null) {
      this.filterTypeOfVoucher.value = this.currentChuongTrinh.Code
      this.gridDSState.filter.filters.push(this.filterTypeOfVoucher)
    }
  }
  resetFilter() {
    //header1
    this.currentChuongTrinh = null
    this.currentDonVi = null
    this.filterTypeOfVoucher.value = null

    this.cbxList[0].Checked = true
    this.cbxList[1].Checked = false
    // //header2
    this.searchForm.get('SearchQuery').setValue(null)
    this.filterPrefix.value = null
    this.filterCouponNameVN.value = null

    this.gridDSState.sort = [this.sort]
    this.loadFilter()
    this.GetListVoucher()
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.GetListVoucher()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.GetListVoucher()
  }
  //API  
  GetListVoucher() {
    this.loading = true;
    //tạm thời filter trong state vì khi truyền WHCode ngoài filter bị sai
    this.GetListVoucher_sst = this.apiService.GetListVoucher(this.gridDSState, null).subscribe(res => {// this.currentDonVi == null ? null : this.currentDonVi.value
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
        this.listWareHouse = res//.filter(s => s.Code != 7);
        this.listDonVi.push(...this.listWareHouse
          .map(s => { return { text: s.WHName, value: s.Code, sub: true } }))
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetListVoucherType() {
    this.loading = true;

    this.GetListVoucherType_sst = this.apiService.GetListVoucherType().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listChuongTrinh.push(...res.ObjectReturn)
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //update
  p_UpdateCouponIssued(properties: string[], coupon: DTOCouponPolicy = this.curCoupon) {
    this.loading = true;
    var ctx = "Cập nhật Đợt phát hành"

    var updateDTO: DTOUpdate = {
      "DTO": coupon,
      "Properties": properties
    }

    this.UpdateCouponIssued_sst = this.apiCouponService.UpdateCouponIssued(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.GetListVoucher()
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
  P_UpdateCouponIssuedStatus(statusID: number, list: DTOCouponPolicy[] = [this.curCoupon]) {
    this.loading = true;
    var ctx = "Cập nhật tình trạng Đợt phát hành"

    this.UpdateCouponIssuedStatus_sst = this.apiCouponService.UpdateCouponIssuedStatus(list, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.GetListVoucher()
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
  //delete
  p_DeleteCouponIssued(coupons: DTOCouponPolicy[] = [this.curCoupon]) {
    this.loading = true;
    var ctx = "Xóa Đợt phát hành"

    this.DeleteCouponIssued_sst = this.apiCouponService.DeleteCouponIssued(coupons).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.GetListVoucher()
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

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
        this.GetListVoucher()
      }
      // else {
      //   this.currentTaoMoi = ev
      //   this.openDetail(true)
      // }
    }
  }
  selectedBtnChange(e, index: number) {
    this.cbxList[index].Checked = e

    this.loadFilter()
    this.GetListVoucher()
  }
  //header2
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterPrefix.value = searchQuery
      this.filterCouponNameVN.value = searchQuery
    } else {
      this.filterPrefix.value = null
      this.filterCouponNameVN.value = null
    }

    this.loadFilter();
    this.GetListVoucher()
  }
  //selection
  getSelectionPopup(selectedList: DTOPromotionProduct[]) {//Voucher chỉ có bước Tạo, Duyệt, Ngưng
    var moreActionDropdown = new Array<MenuDataItem>()
    var canDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0)

    if (canDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify))//isAllowedToCreate
      moreActionDropdown.push({
        Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })
    //
    var canTraLai = selectedList.findIndex(s => s.StatusID == 2)

    if (canTraLai != -1 && (this.isToanQuyen || this.isAllowedToVerify))
      moreActionDropdown.push({
        // Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
        Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
      })
    //delete  
    if (canDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Name: "Xóa Đợt phát hành", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: DTOCouponPolicy[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        var lst = []

        if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 3)
              if (this.UpdateCouponIssuedStatus(value, s))
                lst.push(s)
          })
        else if (value == 3 || value == '3')//Ngưng
          list.forEach(s => {
            if (s.StatusID == 2)
              if (this.UpdateCouponIssuedStatus(value, s))
                lst.push(s)
          })
        // else if (value == 4 || value == '4')//Trả về
        //   list.forEach(s => {
        //     if (s.StatusID == 2)
        //       if (this.UpdateCouponIssuedStatus(value, s))
        //         lst.push(s)
        //   })

        if (Ps_UtilObjectService.hasListValue(lst))
          this.P_UpdateCouponIssuedStatus(value, lst)
      }
      else if (btnType == "delete") {//Xóa
        this.onDeleteManyPromotion()
        this.deleteList = []

        list.forEach(s => {
          if (s.StatusID == 0 || s.StatusID == 4)
            this.deleteList.push(s)
        })
      }
    }
  }
  //
  UpdateCouponIssuedStatus(statusID: number, item) {
    var newPro = { ...item }
    //check trước khi duyệt
    if (statusID == 2) {
      var TheoNgay = this.checkTheoNgay(item)

      if (!Ps_UtilObjectService.hasValueString(newPro.CouponNameVN)) {
        this.layoutService.onError('Vui lòng nhập Tên phiếu')
        return false
      }
      else if (!Ps_UtilObjectService.hasValue(newPro.TypeOfVoucher)) {
        this.layoutService.onError('Vui lòng chọn Phân loại')
        return false
      }
      else if (!Ps_UtilObjectService.hasValue(newPro.WHCode)) {
        this.layoutService.onError('Vui lòng chọn Đơn vị')
        return false
      }
      // else if (!Ps_UtilObjectService.hasValueString(newPro.DescriptionVN)) {
      //   this.layoutService.onError('Vui lòng nhập Diễn giải')
      //   return false
      // }
      // cho null Diễn giải VÀ Số Seri
      // else if (!Ps_UtilObjectService.hasValueString(newPro.SerialNo)) {
      //   this.layoutService.onError('Vui lòng nhập Số seri')
      //   return false
      // }
      else if (!Ps_UtilObjectService.hasValueString(newPro.Prefix)) {
        this.layoutService.onError('Vui lòng nhập Mã bắt đầu')
        return false
      }
      else if (!Ps_UtilObjectService.hasValue(newPro.NoOfRelease) || newPro.NoOfRelease <= 0) {
        this.layoutService.onError('Số lượng phát hành phải lớn hơn 0')
        return false
      }

      else if (!Ps_UtilObjectService.hasValue(newPro.VoucherAmount) || newPro.VoucherAmount <= 0) {
        this.layoutService.onError('Mệnh giá phải lớn hơn 0')
        return false
      }
      // else if (!Ps_UtilObjectService.hasValue(newPro.UnitPrice) || newPro.UnitPrice <= 0) {
      //   this.layoutService.onError('Giá bán phải lớn hơn 0')
      //   return false
      // }

      else if (!TheoNgay && Ps_UtilObjectService.hasValue(newPro.PeriodDay) && newPro.PeriodDay <= 0) {
        this.layoutService.onError('Vui lòng nhập Thời gian hiệu lực')
        return false
      }
      else if (TheoNgay && !Ps_UtilObjectService.hasValueString(newPro.EndDate)) {
        this.layoutService.onError('Vui lòng chọn Ngày kết thúc cho Thời gian hiệu lực')
        return false
      }

      else if (!Ps_UtilObjectService.hasValue(newPro.NoInTransaction) || newPro.NoInTransaction <= 0) {
        this.layoutService.onError('Số lượt dùng tối đa/1 giao dịch phải lớn hơn 0')
        return false
      }
      else
        return true
      // this.p_UpdateCouponIssued(['StatusID'], newPro)
    }
    else
      return true
    // this.p_UpdateCouponIssued(['StatusID'], newPro)
  }

  checkTheoNgay(couponPolicy: DTOCouponPolicy) {
    return couponPolicy.PeriodDay == null || couponPolicy.PeriodDay <= 0
  }

  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOCouponPolicy) {//Voucher chỉ có bước Tạo, Duyệt, Ngưng
    moreActionDropdown = []
    this.curCoupon = { ...dataItem }
    var statusID = this.curCoupon.StatusID;
    //edit
    if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate) ||
      ((statusID == 0 || statusID == 4) && this.isAllowedToVerify))
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if ((this.isToanQuyen || this.isAllowedToVerify) && (statusID == 0)) {//isAllowedToCreate
      moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
    }
    //
    else if ((this.isToanQuyen || this.isAllowedToVerify) && statusID == 2) {
      // moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })
      moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
    }
    //delete
    if ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xóa đợt phát hành", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOCouponPolicy) {
    if (item.Code > 0) {
      this.curCoupon = { ...item }

      if (menu.Type == 'StatusID') {
        var status = parseInt(menu.Link)

        if (this.UpdateCouponIssuedStatus(status, item))
          this.P_UpdateCouponIssuedStatus(status, [this.curCoupon])
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.openDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
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
  onDeleteManyPromotion() {
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
        prom.TypeData = 2
        this.service.setCacheGiftVoucher(prom)
      } else
        this.service.setCacheGiftVoucher(this.curCoupon)
      //group
      var parent = item.ListMenu.find(f => f.Code.includes('pos')
        || f.Link.includes('sale'))
      //function
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('gift-voucher-list')
          || f.Link.includes('gift-voucher-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('gift-voucher-detail')
            || f.Link.includes('gift-voucher-detail'))

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

    this.GetListVoucher_sst?.unsubscribe()
    this.GetWarehouse_sst?.unsubscribe()
    this.GetListVoucherType_sst?.unsubscribe()

    this.UpdateCouponIssued_sst?.unsubscribe()
    this.UpdateCouponIssuedStatus_sst?.unsubscribe()
    this.DeleteCouponIssued_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}

