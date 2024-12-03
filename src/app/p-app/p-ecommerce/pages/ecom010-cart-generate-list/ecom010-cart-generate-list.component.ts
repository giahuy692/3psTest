import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOConfig, Ps_AuthService, Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Router } from '@angular/router';
import DTOSynCart from '../../shared/dto/DTOSynCart.dto';
import { EcomService } from '../../shared/services/ecom.service';
import { EcomAppCartAPIService } from '../../shared/services/ecom-appcart-api.service';
import DTOItemCart2, { DTOPaymentCart } from '../../shared/dto/DTOHachiCart';
import { faPeopleArrows } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-ecom010-cart-generate-list',
  templateUrl: './ecom010-cart-generate-list.component.html',
  styleUrls: ['./ecom010-cart-generate-list.component.scss']
})
export class Ecom010CartGenerateListComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true

  deleteDialogOpened = false
  deleteManyDialogOpened = false
  AssignUserDialogOpened = false

  faPeopleArrows = faPeopleArrows
  total = 0

  today = new Date()
  oneWeekAgo = Ps_UtilObjectService.subtractDays(this.today, 7)
  //object
  order = new DTOSynCart()
  listOrder: DTOSynCart[] = []
  deleteList: DTOSynCart[] = []
  //header1
  //step 1-3 là ordertypeid == 18 
  cbxList = [{
    Name: 'B1: Tạo mới',
    Checked: true,
    Filter: {
      field: "Step", operator: "eq", value: 1
    }
  }, {
    Name: 'B2: Nhập địa chỉ giao hàng',
    Checked: true,
    Filter: {
      field: "Step", operator: "eq", value: 2
    }
  }, {
    Name: 'B3: Chọn thanh toán',
    Checked: true,
    Filter: {
      field: "Step", operator: "eq", value: 3
    }
  }, {
    Name: 'Thanh toán không thành công',
    Checked: true,
    Filter: {
      field: "OrderTypeID", operator: "eq", value: 13
    }
  }, {
    Name: 'Đơn hàng Hachi 3H',
    Checked: false,
    Filter: {
      field: "IsHachi24", operator: "eq", value: true
    }
  }]
  //header
  searchForm: UntypedFormGroup
  //grid
  allowActionDropdown = ['edit', 'delete']
  //GRID
  //prod
  pageSize = 50
  pageSizes = [this.pageSize]

  gridView = new Subject<any>();
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  //
  sortBy: SortDescriptor = {
    field: 'StatusDate', dir: 'desc'
  }
  filterStatusID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterStep: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterStep_OrderTypeID: CompositeFilterDescriptor = {
    logic: "and",
    filters: []
  }
  //header1
  filterOrderTypeID18: FilterDescriptor = {
    field: "OrderTypeID", operator: "eq", value: 18
  }
  filterStaffID: FilterDescriptor = {
    field: "StaffID", operator: "eq", value: DTOConfig.Authen.userinfo?.staffID
  }
  //filder date
  filterStatusDateStart: FilterDescriptor = {
    field: "StatusDate", operator: "gte", value: this.oneWeekAgo
  }
  filterStatusDate: FilterDescriptor = {
    field: "StatusDate", operator: "lte", value: this.today
  }
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }

  filterOrderBy: FilterDescriptor = {
    field: "OrderBy", operator: "contains", value: null
  }
  filterAddress: FilterDescriptor = {
    field: "Address", operator: "contains", value: null
  }
  filterCartNo: FilterDescriptor = {
    field: "CartNo", operator: "contains", value: null
  }
  //CALLBACK
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onSortChangeCallback: Function
  onFilterChangeCallback: Function
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
  GetListGenOrder_sst: Subscription
  DeleteOrder_sst: Subscription
  changeModuleData_sst: Subscription
  changePermission_sst: Subscription
  subArr: Subscription[] = []

  constructor(
    public router: Router,
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: EcomService,
    public apiService: EcomAppCartAPIService,
    public APP_AuthService: Ps_AuthService,
  ) { }

  ngOnInit(): void {
    this.today.setHours(23, 59, 59)
    this.oneWeekAgo.setHours(0, 0, 0)
    this.loadSearchForm()


    // this.APP_AuthService.getUserInfo(DTOConfig.Authen.token).subscribe(res => {
    //   if (Ps_UtilObjectService.hasValue(res)) {
    //     DTOConfig.Authen.userinfo = res

    let a = this.APP_AuthService.getCacheUserInfo().subscribe((res) => {
      DTOConfig.Authen.userinfo = res
      this.getPermission()
    });
    //   }
    //   else
    //     this.layoutService.onError(`Không tìm thấy thông tin tài khoản người dùng hiện tại. Vui lòng đăng nhập lại`)
    // }, e => {
    //   this.layoutService.onError(`Không tìm thấy thông tin tài khoản người dùng hiện tại. Vui lòng đăng nhập lại`)
    // })
    this.subArr.push(a)
    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }
  //load  
  getPermission() {
    let that = this

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        that.getData()
      }
    })
  }
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  getData() {
    this.loadFilter()
    this.GetListGenOrder()
  }
  //filter
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.sort = [this.sortBy]

    this.gridState.filter.filters = []
    this.filterSearchBox.filters = []
    this.filterStatusID.filters = []
    this.filterStep.filters = []
    //checkbox header 1
    this.loadStepFilter()
    this.loadStatusIDFilter()
    this.gridState.filter.filters.push(this.filterStatusID)
    //staffid
    this.filterStaffID.value = DTOConfig.Authen.userinfo?.staffID
    this.gridState.filter.filters.push(this.filterStaffID)
    //ishachi24
    if (this.cbxList[4].Checked)
      this.gridState.filter.filters.push(this.cbxList[4].Filter)
    //search box    
    if (Ps_UtilObjectService.hasValueString(this.filterOrderBy.value))
      this.filterSearchBox.filters.push(this.filterOrderBy)

    if (Ps_UtilObjectService.hasValueString(this.filterCartNo.value))
      this.filterSearchBox.filters.push(this.filterCartNo)

    if (Ps_UtilObjectService.hasValueString(this.filterAddress.value))
      this.filterSearchBox.filters.push(this.filterAddress)

    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
    //date      
    if (Ps_UtilObjectService.hasValueString(this.filterStatusDateStart.value)) {
      this.filterStatusDateStart.value.setHours(0, 0, 0)
      this.gridState.filter.filters.push(this.filterStatusDateStart)
    }

    if (Ps_UtilObjectService.hasValueString(this.filterStatusDate.value)) {
      this.filterStatusDate.value.setHours(23, 59, 59)
      this.gridState.filter.filters.push(this.filterStatusDate)
    }
  }
  loadStepFilter() {
    this.filterStep.filters = []
    this.filterStep_OrderTypeID.filters = []

    this.cbxList.forEach((s, i) => {
      if (i < 3) {//lật toán tử
        s.Filter.operator = s.Checked ? 'eq' : 'neq'
        //!(A || B) = !A && !B
        if (s.Checked)//toán tử ||
          this.filterStep.filters.push(s.Filter)
        else//toán tử &&
          this.filterStep_OrderTypeID.filters.push(s.Filter)
      }
    })

    if (this.filterStep.filters.length > 0) {//nếu chọn 1 trong 3 Step
      this.filterOrderTypeID18.operator = 'eq'
      this.filterStep_OrderTypeID.filters.push(this.filterStep)
    }
    else {//nếu ko chọn Step nào
      this.filterOrderTypeID18.operator = 'neq'
    }
    this.filterStep_OrderTypeID.filters.push(this.filterOrderTypeID18)
  }
  loadStatusIDFilter() {
    //lật toán tử !(A || B) = !A && !B
    if (this.cbxList[3].Checked) {//toán tử ||
      this.cbxList[3].Filter.operator = 'eq'
      this.filterStatusID.logic = 'or'
    }
    else {//toán tử &&
      this.cbxList[3].Filter.operator = 'neq'
      this.filterStatusID.logic = 'and'
    }
    this.filterStatusID.filters = [this.cbxList[3].Filter, this.filterStep_OrderTypeID]
  }
  //API
  GetListGenOrder() {
    this.loading = true;
    var ctx = 'Danh sách Giỏ hàng'

    this.GetListGenOrder_sst = this.apiService.GetListGenOrder(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listOrder = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listOrder, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  DeleteOrder(item: DTOSynCart = this.order) {
    this.loading = true;
    var ctx = 'Hủy Giỏ hàng'

    this.DeleteOrder_sst = this.apiService.DeleteGenOrder(item).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        // items.forEach(s => {
        //   var ex = this.listOrder.findIndex(f => f.Code == s.Code)

        //   if (ex != -1) {
        //     this.total--
        //     this.listOrder.splice(ex, 1)
        //   }
        // })
        // this.gridView.next({ data: this.listOrder, total: this.total });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.GetListGenOrder()
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListGenOrder()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.GetListGenOrder()
  }
  //DROPDOWN popup
  onActionDropdownClick(menu: MenuDataItem, item: DTOSynCart) {
    if (item.Code > 0) {
      this.order = { ...item }

      if (menu.Code == "eye" || menu.Link == 'detail' || menu.Code == 'pencil' || menu.Link == 'edit') {
        this.openDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDelete()
      }
    }
  }

  //selection
  getSelectionPopup(selectedList: DTOSynCart[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canNhanHang_canXoa = selectedList.findIndex(s => s.StatusID == 1)

    // if (canNhanHang_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
    //   moreActionDropdown.push({
    //     Type: "StatusID", Name: "Xuất hàng", Code: "redo", Link: "1", Actived: true, LstChild: []
    //   })
    // //
    // if (this.isToanQuyen || this.isAllowedToVerify) {
    //   var canHoanTat = selectedList.findIndex(s => s.StatusID == 2)

    //   if (canHoanTat != -1)
    //     moreActionDropdown.push({
    //       Type: "StatusID", Name: "Hoàn tất xuất hàng", Code: "check-outline", Link: "2", Actived: true, LstChild: []
    //     })

    //   var canChot = selectedList.findIndex(s => s.StatusID == 2)

    //   if (canChot != -1)
    //     moreActionDropdown.push({
    //       Type: "StatusID", Name: "Chốt số liệu", Code: "lock", Link: "4", Actived: true, LstChild: []
    //     })
    // }
    //delete
    if (canNhanHang_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Name: "Hủy Giỏ hàng", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == "delete") {//Hủy
        this.onDelete()
        this.deleteList = []

        list.forEach(s => {
          if (s.StatusID == 0)
            this.deleteList.push(s)
        })
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //CLICK EVENT  
  //header 1
  selectedBtnChange(e, index: number) {
    this.cbxList[index].Checked = e
    this.loadFilter()
    this.GetListGenOrder()
  }
  openDetail(isAdd: boolean = true) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      var paymentCart = new DTOPaymentCart()
      var cart = new DTOItemCart2()

      // if (isAdd) {
      // var prom = new DTOSynCart()
      // this.service.setCacheSynCartDetail(prom)
      // } else
      // this.service.setCacheSynCartDetail(this.order)

      if (!isAdd) {
        Ps_UtilObjectService.copyPropertyForce(this.order, cart)
        cart.Code = this.order.Code
      }
      paymentCart.Cart = cart
      this.apiService.p_setCachePayment(paymentCart)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('ecom-cart')
        || f.Link.includes('ecom-cart'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('cart-generate-list')
          || f.Link.includes('cart-generate-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('cart-generate-detail')
            || f.Link.includes('cart-generate-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //header
  refresh() {
    this.GetListGenOrder()
  }
  resetFilter() {
    //header
    this.searchForm.get('SearchQuery').setValue(null)
    //prod
    this.filterOrderBy.value = null
    this.filterCartNo.value = null
    this.filterAddress.value = null
    //
    this.cbxList[0].Checked = true
    this.cbxList[1].Checked = true
    this.cbxList[2].Checked = false
    this.cbxList[3].Checked = false
    this.cbxList[4].Checked = false

    this.loadFilter()
    this.GetListGenOrder()
  }
  clearDate(prop: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this[prop].value = null
      this.loadFilter()
      this.GetListGenOrder()
    }
  }
  //
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.loadFilter()
      this.GetListGenOrder()
    }
  }
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterOrderBy.value = searchQuery
      this.filterCartNo.value = searchQuery
      this.filterAddress.value = searchQuery
    } else {
      this.filterOrderBy.value = null
      this.filterCartNo.value = null
      this.filterAddress.value = null
    }

    this.loadFilter();
    this.GetListGenOrder()
  }
  //delete
  onDelete() {
    this.deleteDialogOpened = true
  }
  delete() {
    if (this.order.Code > 0)
      this.DeleteOrder()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    // this.DeleteOrder(this.deleteList)
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //dialog  
  closeAssignUserDialog(refresh: boolean) {
    if (refresh) {
      this.getData()
    }
    this.AssignUserDialogOpened = false
  }
  // AUTO RUN
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  ngOnDestroy(): void {
    this.GetListGenOrder_sst?.unsubscribe()
    this.DeleteOrder_sst?.unsubscribe()
    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.subArr.forEach(s => s?.unsubscribe())
  }
}
