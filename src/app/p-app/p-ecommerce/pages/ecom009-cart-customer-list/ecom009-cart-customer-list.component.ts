import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Router } from '@angular/router';
import DTOSynCart from '../../shared/dto/DTOSynCart.dto';
import { EcomService } from '../../shared/services/ecom.service';
import { EcomSynCartAPIService } from '../../shared/services/ecom-syncart-api.service';

@Component({
  selector: 'app-ecom009-cart-customer-list',
  templateUrl: './ecom009-cart-customer-list.component.html',
  styleUrls: ['./ecom009-cart-customer-list.component.scss']
})
export class Ecom009CartCustomerListComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true

  total = 0
  today = new Date()
  oneWeekAgo = Ps_UtilObjectService.subtractDays(this.today, 7)
  //object
  order = new DTOSynCart()
  listOrder: DTOSynCart[] = []
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
  allowActionDropdown = ['detail']
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
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  GetListClientOrder_sst: Subscription
  changeModuleData_sst: Subscription
  changePermission_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public router: Router,
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: EcomService,
    public apiService: EcomSynCartAPIService,
  ) { }

  ngOnInit(): void {
    let that = this
    this.today.setHours(23, 59, 59)
    this.oneWeekAgo.setHours(0, 0, 0)
    this.loadSearchForm()

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        this.loadFilter()
        // that.GetListClientOrder()
      }
    })

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.GetListClientOrder()
      }
    })
    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
  }
  //load  
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
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
  GetListClientOrder() {
    this.loading = true;
    var ctx = 'Danh sách Giỏ hàng'

    this.GetListClientOrder_sst = this.apiService.GetListClientOrder(this.gridState).subscribe(res => {
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
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListClientOrder()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.GetListClientOrder()
  }
  //DROPDOWN popup
  onActionDropdownClick(menu: MenuDataItem, item: DTOSynCart) {
    if (item.ID > 0) {
      this.order = { ...item }

      if (menu.Code == "eye" || menu.Link == 'detail') {
        this.openDetail(false)
      }
    }
  }
  //CLICK EVENT  
  //header 1
  selectedBtnChange(e, index: number) {
    this.cbxList[index].Checked = e
    this.loadFilter()
    this.GetListClientOrder()
  }
  openDetail(isAdd: boolean) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (isAdd) {
        var prom = new DTOSynCart()
        this.service.setCacheSynCartDetail(prom)
      } else
        this.service.setCacheSynCartDetail(this.order)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('ecom-cart')
        || f.Link.includes('ecom-cart'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('cart-customer-list')
          || f.Link.includes('cart-customer-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('cart-customer-detail')
            || f.Link.includes('cart-customer-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //header
  refresh() {
    this.GetListClientOrder()
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
    this.GetListClientOrder()
  }
  clearDate(prop: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this[prop].value = null
      this.loadFilter()
      this.GetListClientOrder()
    }
  }
  //
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.loadFilter()
      this.GetListClientOrder()
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
    this.GetListClientOrder()
  }
  // AUTO RUN
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  ngOnDestroy(): void {
    this.GetListClientOrder_sst?.unsubscribe()
    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
