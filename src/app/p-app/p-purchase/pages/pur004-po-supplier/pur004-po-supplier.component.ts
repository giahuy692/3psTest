import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_AuthService, Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';

import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Router } from '@angular/router';
import DTOSynCart from 'src/app/p-app/p-ecommerce/shared/dto/DTOSynCart.dto';
import { EcomService } from 'src/app/p-app/p-ecommerce/shared/services/ecom.service';
import DTOItemCart2, { DTOPaymentCart } from 'src/app/p-app/p-ecommerce/shared/dto/DTOHachiCart';
import { PurPOAPIService } from '../../shared/services/pur-po-api.service';

@Component({
  selector: 'app-pur004-po-supplier',
  templateUrl: './pur004-po-supplier.component.html',
  styleUrls: ['./pur004-po-supplier.component.scss']
})
export class Pur004POSupplierComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true

  deleteDialogOpened = false
  deleteManyDialogOpened = false

  total = 0
  //object
  order = new DTOSynCart()
  listOrder: DTOSynCart[] = []
  deleteList: DTOSynCart[] = []
  //header1
  //step 1-3 là ordertypeid == 18 
  cbxList = [{
    Name: 'Đang tạo',
    Checked: true,
    Filter: {
      field: "Step", operator: "eq", value: 1
    }
  }, {
    Name: 'Đã gửi LGT',
    Checked: true,
    Filter: {
      field: "Step", operator: "eq", value: 2
    }
  }, {
    Name: 'Đang nhận',
    Checked: true,
    Filter: {
      field: "Step", operator: "eq", value: 3
    }
  }, {
    Name: 'Hoàn tất nhận',
    Checked: true,
    Filter: {
      field: "Step", operator: "eq", value: 4
    }
  }, {
    Name: 'Bị hủy',
    Checked: true,
    Filter: {
      field: "Step", operator: "eq", value: 5
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
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }

  filterSupplier: FilterDescriptor = {
    field: "Supplier", operator: "contains", value: null
  }
  filterCartNo: FilterDescriptor = {
    field: "CartNo", operator: "contains", value: null
  }
  //CALLBACK
  //rowItem action dropdown
  getActionDropdownCallback: Function
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
  subArr: Subscription[] = []

  constructor(
    public router: Router,
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: EcomService,
    public apiService: PurPOAPIService,
    public APP_AuthService: Ps_AuthService,
  ) { }

  ngOnInit(): void {
    let that = this
    
    this.loadSearchForm()

    var sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        this.loadFilter()
        // that.GetListGenOrder()
      }
    })

    let changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListGenOrder();
      }
    })
    this.subArr.push(sst, changePermissionAPI)
    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
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
    // this.loadStepFilter()
    // this.loadStatusIDFilter()//lật toán tử
    this.gridState.filter.filters.push(this.filterStatusID)
    //search box    
    if (Ps_UtilObjectService.hasValueString(this.filterSupplier.value))
      this.filterSearchBox.filters.push(this.filterSupplier)

    if (Ps_UtilObjectService.hasValueString(this.filterCartNo.value))
      this.filterSearchBox.filters.push(this.filterCartNo)

    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
  }
  // loadStepFilter() {
  //   this.filterStep.filters = []
  //   this.filterStep_OrderTypeID.filters = []

  //   this.cbxList.forEach((s, i) => {
  //     if (i < 3) {//lật toán tử
  //       s.Filter.operator = s.Checked ? 'eq' : 'neq'
  //       //!(A || B) = !A && !B
  //       if (s.Checked)//toán tử ||
  //         this.filterStep.filters.push(s.Filter)
  //       else//toán tử &&
  //         this.filterStep_OrderTypeID.filters.push(s.Filter)
  //     }
  //   })
  // }
  // loadStatusIDFilter() {
  //   //lật toán tử !(A || B) = !A && !B
  //   if (this.cbxList[3].Checked) {//toán tử ||
  //     this.cbxList[3].Filter.operator = 'eq'
  //     this.filterStatusID.logic = 'or'
  //   }
  //   else {//toán tử &&
  //     this.cbxList[3].Filter.operator = 'neq'
  //     this.filterStatusID.logic = 'and'
  //   }
  //   this.filterStatusID.filters = [this.cbxList[3].Filter, this.filterStep_OrderTypeID]
  // }
  //API
  GetListGenOrder() {
    this.loading = true;
    var ctx = 'Danh sách Đơn hàng'

    var sst = this.apiService.GetListReceiveOrder(1).subscribe(res => {//todo this.gridState
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
    this.subArr.push(sst)
  }

  UpdateOrder(prop: string[] = [], items = [this.order]) {
    this.loading = true;
    var ctx = 'Gửi PO cho LGT'

    // this.UpdateOrderStatus_sst = this.apiService.UpdateOrder(items, prop).subscribe(res => {
    //   if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
    //     this.isAdd = false
    //     this.layoutService.onSuccess(`${ctx} thành công`)
    //     this.channel = res.ObjectReturn
    //   } else
    //     this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

    //   this.loading = false;
    // }, () => {
    //   this.loading = false;
    //   this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    // });
  }

  DeleteOrder(item: DTOSynCart = this.order) {
    this.loading = true;
    var ctx = 'Hủy Đơn hàng'
  
    // var sst = this.apiService.DeleteGenOrder(item).subscribe(res => {
    //   if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
    //     this.layoutService.onSuccess(`${ctx} thành công`)
    //     this.deleteDialogOpened = false
    //     this.deleteManyDialogOpened = false
    //     this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
    //     // items.forEach(s => {
    //     //   var ex = this.listOrder.findIndex(f => f.Code == s.Code)

    //     //   if (ex != -1) {
    //     //     this.total--
    //     //     this.listOrder.splice(ex, 1)
    //     //   }
    //     // })
    //     // this.gridView.next({ data: this.listOrder, total: this.total });
    //   } else {
    //     this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
    //   }
    //   this.GetListGenOrder()
    //   this.loading = false;
    // }, () => {
    //   this.loading = false;
    //   this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    // });
    // this.subArr.push(sst)
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
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem) {
    moreActionDropdown = []
    this.order = { ...dataItem }
    var statusID = this.order.StatusID;

    //edit
    if (this.order.StatusID != 2 &&
      (
        (statusID != 0 && statusID != 4 && this.isAllowedToCreate) ||
        ((statusID == 0 || statusID == 4) && this.isAllowedToVerify)
      )
      //|| this.isAllowedToViewOnly
    )
      moreActionDropdown.push({ Name: "Xem PO", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa PO", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if (this.order.StatusID == 2 && (this.isToanQuyen || this.isAllowedToCreate) &&
      (statusID == 0 || statusID == 4)) {
      moreActionDropdown.push({ Name: "Gửi PO cho LGT", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
    }
    //
    // else if (this.isToanQuyen || this.isAllowedToVerifyProd) {
    //   if (this.order.StatusID == 2 && statusID == 1 && this.order.IsRightToOnsite) {
    //     moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
    //   }
    //   else if (this.order.StatusID == 2 && statusID == 2) {
    //     moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
    //   }
    //   else if (this.order.StatusID == 2 && statusID == 3) {
    //     if (this.order.IsRightToOnsite)
    //       moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })

    //     moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })
    //   }
    // }
    //delete
    if (this.order.StatusID == 2 && (statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xóa PO", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }

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
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi PO cho LGT", Code: "redo", Link: "1", Actived: true, LstChild: []
      })
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
        Name: "Xóa PO", Type: 'delete',
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
    var sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      var paymentCart = new DTOPaymentCart()
      var cart = new DTOItemCart2()

      // if (isAdd) {
      // var prom = new DTOSynCart()
      // this.service.setCacheSynCartDetail(prom)
      // } else
      // this.service.setCacheSynCartDetail(this.order)

      if (!isAdd) {
        Ps_UtilObjectService.copyProperty(this.order, cart)
        cart.Code = this.order.Code
      }
      paymentCart.Cart = cart
      // this.apiService.p_setCachePOMaster(paymentCart)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('pur-po')
        || f.Link.includes('pur-po'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('pur003-po-domestic')
          || f.Link.includes('pur003-po-domestic'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('pur003-po-domestic-detail')
            || f.Link.includes('pur003-po-domestic-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })

    this.subArr.push(sst)
  }
  //header
  refresh() {
    this.GetListGenOrder()
  }
  resetFilter() {
    //header
    this.searchForm.get('SearchQuery').setValue(null)
    //prod
    this.filterSupplier.value = null
    this.filterCartNo.value = null
    //
    this.cbxList[0].Checked = true
    this.cbxList[1].Checked = true
    this.cbxList[2].Checked = true
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
      this.filterSupplier.value = searchQuery
      this.filterCartNo.value = searchQuery
    } else {
      this.filterSupplier.value = null
      this.filterCartNo.value = null
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
  // AUTO RUN
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  ngOnDestroy(): void {
    this.subArr.forEach(s => {
      s?.unsubscribe()
    })
  }
}
