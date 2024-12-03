import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';

import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { SaleAPIService } from '../../shared/services/sale-api.service';
import { SaleService } from '../../shared/services/sale.service';
import { DTOPosPrice } from '../../shared/dto/DTOPosPrice.dto';

@Component({
  selector: 'app-sale001-policy-list',
  templateUrl: './sale001-policy-list.component.html',
  styleUrls: ['./sale001-policy-list.component.scss']
})
export class Sale001PolicyListComponent implements OnInit, OnDestroy {
  loading = false
  isAdd = true
  isFilterActive = true
  deleteDialogOpened = false
  deleteManyDialogOpened = false
  total = 0
  //object
  posPrice = new DTOPosPrice()
  listPosPrice: DTOPosPrice[] = []
  deleteList: DTOPosPrice[] = []
  //header 1
  dangSoanThao = true
  guiDuyet = false
  daDuyet = false
  //header 2
  searchForm: UntypedFormGroup
  //grid
  allowActionDropdown = ['detail', 'delete']
  //GRID
  //prod
  pageSize = 50
  pageSizes = [this.pageSize]

  gridView = new Subject<any>();
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  sortBy: SortDescriptor = {
    field: 'EffDate',
    dir: 'desc'
  }
  //status
  filterStatus: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterStatus_dang: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 0
  }
  filterStatus_gui: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 1
  }
  filterStatus_duyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 2
  }
  filterStatus_tra: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 4
  }
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterAdjName: FilterDescriptor = {
    field: "AdjName", operator: "contains", value: null
  }
  filterRemark: FilterDescriptor = {
    field: "Remark", operator: "contains", value: null
  }
  //CALLBACK
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
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
  changePermission_sst: Subscription
  changePermissionAPI: Subscription
  changeModuleData_sst: Subscription
  GetListPOSPriceAdj_sst: Subscription
  GetProductByBarcode_sst: Subscription

  UpdatePOSPriceAdjStatus_sst: Subscription
  DeletePOSPriceAdjHachi24hByID_sst: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public service: SaleService,
    public apiService: SaleAPIService,
  ) { }

  ngOnInit(): void {
    let that = this
    
    this.loadFilter()
    this.loadSearchForm()
    //cache
    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.GetListPOSPriceAdj()
      }
    })

    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListPOSPriceAdj()
			}
		})
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

    this.filterStatus.filters = [this.filterStatus_tra]
    this.filterSearchBox.filters = []
    //status
    if (this.dangSoanThao)
      this.filterStatus.filters.push(this.filterStatus_dang)

    if (this.guiDuyet)
      this.filterStatus.filters.push(this.filterStatus_gui)

    if (this.daDuyet)
      this.filterStatus.filters.push(this.filterStatus_duyet)

    if (this.filterStatus.filters.length > 0)
      this.gridState.filter.filters.push(this.filterStatus)
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterAdjName.value))
      this.filterSearchBox.filters.push(this.filterAdjName)

    if (Ps_UtilObjectService.hasValueString(this.filterRemark.value))
      this.filterSearchBox.filters.push(this.filterRemark)

    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
  }
  //API
  GetListPOSPriceAdj() {
    this.loading = true;

    this.GetListPOSPriceAdj_sst = this.apiService.GetListPOSPriceAdj(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPosPrice = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listPosPrice, total: this.total });
      } else
        this.layoutService.onError('Đã xảy ra lỗi khi lấy Danh sách Sản phẩm')

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy Danh sách Sản phẩm')
    });
  }
  UpdatePOSPriceAdjStatus(items: any[] = [this.posPrice], statusID: number = this.posPrice.StatusID) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'

    this.UpdatePOSPriceAdjStatus_sst = this.apiService.UpdatePOSPriceAdjStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        // items.forEach(s => {
        //   var ex = this.listPosPrice.findIndex(f => f.Code == s.Code)

        //   if (ex != -1) {
        //     this.listPosPrice[ex].StatusID = s.statusID
        //     this.listPosPrice[ex].StatusName = s.StatusName
        //   }
        // })
        // this.gridView.next({ data: this.listPosPrice, total: this.total });
        this.GetListPOSPriceAdj()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  DeletePOSPriceAdj(items = [this.posPrice]) {
    this.loading = true;
    var ctx = 'Xóa đợt thay đổi giá'

    this.DeletePOSPriceAdjHachi24hByID_sst = this.apiService.DeletePOSPriceAdj(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        items.forEach(s => {
          var ex = this.listPosPrice.findIndex(f => f.Code == s.Code)

          if (ex != -1) {
            this.listPosPrice.splice(ex, 1)
            this.total--
          }
        })
        this.gridView.next({ data: this.listPosPrice, total: this.total });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.GetListPOSPriceAdj()
      }
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
    this.GetListPOSPriceAdj()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.GetListPOSPriceAdj()
  }
  //selection
  getSelectionPopup(selectedList: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1",
        Actived: true, LstChild: []
      })

    var canPheDuyet_canTraLai = selectedList.findIndex(s => s.StatusID == 1 || s.StatusID == 3)

    if (canPheDuyet_canTraLai != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })

      moreActionDropdown.push({
        Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
      })
    }

    // var canStop = selectedList.findIndex(s => s.StatusID == 2)

    // if (canStop != -1 && (this.isToanQuyen || this.isAllowedToVerify))
    //   moreActionDropdown.push({
    //     Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
    //   })

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Name: "Xóa", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        if (value == 1 || value == '1') {//Gửi duyệt
          var arr = []

          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 4) {
              s.StatusID = 1
              s.StatusName = 'Gửi duyệt'
              arr.push(s)
            }
          })

          if (arr.length > 0)
            this.UpdatePOSPriceAdjStatus(arr)
        }
        else if (value == 2 || value == '2') {//Phê duyệt
          var arr = []

          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              s.StatusID = 2
              s.StatusName = 'Phê duyệt'
              arr.push(s)
            }
          })

          if (arr.length > 0)
            this.UpdatePOSPriceAdjStatus(arr)
        }
        else if (value == 4 || value == '4') {//Trả về
          var arr = []

          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              s.StatusID = 4
              s.StatusName = 'Trả về'
              arr.push(s)
            }
          })

          if (arr.length > 0)
            this.UpdatePOSPriceAdjStatus(arr)
        }
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
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    this.posPrice = { ...dataItem }
    var statusID = this.posPrice.StatusID;
    moreActionDropdown = []
    //
    if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate)
      || ((statusID == 0 || statusID == 4) && this.isAllowedToVerify))
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
    else if (((statusID == 1 || statusID == 2) && (this.isToanQuyen || this.isAllowedToVerify))
      || ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate)))
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
    //status
    if (statusID == 0 || statusID == 4) {
      if (this.isToanQuyen || this.isAllowedToCreate)
        moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Link: "1", Type: "StatusID", Actived: true })
    }
    else if (statusID == 1 || statusID == 3) {
      if (this.isToanQuyen || this.isAllowedToVerify) {
        moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Link: "2", Type: "StatusID", Actived: true })
        moreActionDropdown.push({ Name: "Trả về", Code: "undo", Link: "4", Type: "StatusID", Actived: true })
      }
    }
    //delete
    if ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xóa", Code: "trash", Link: "delete", Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: any) {
    if (item.Code > 0) {
      if (menu.Type == 'StatusID') {
        this.posPrice = { ...item }
        this.posPrice.StatusID = parseInt(menu.Link)
        this.posPrice.StatusName = menu.Name
        this.UpdatePOSPriceAdjStatus([this.posPrice])
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.posPrice = { ...item }
        this.openDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.posPrice = { ...item }
        this.onDelete()
      }
    }
  }
  //CLICK EVENT
  //header 1
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e

    this.loadFilter()
    this.GetListPOSPriceAdj()
  }
  openDetail(isAdd: boolean) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      this.service.isAdd = isAdd

      if (isAdd) {
        var prom = new DTOPosPrice()
        this.service.setCachePosPrice(prom)
      } else
        this.service.setCachePosPrice(this.posPrice)

      var parent = item.ListMenu.find(f => f.Code.includes('sale001-policy-list')
        || f.Link.includes('sale001-policy-list'))

      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('sale001-policy-list')
          || f.Link.includes('sale001-policy-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('sale001-policy-detail')
            || f.Link.includes('sale001-policy-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //header 2
  resetFilter() {
    //header
    this.searchForm.get('SearchQuery').setValue(null)
    //prod
    this.filterBarcode.value = null
    this.filterAdjName.value = null
    this.filterRemark.value = null

    this.loadFilter()
    this.GetListPOSPriceAdj()
  }
  //
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterBarcode.value = searchQuery
      this.filterAdjName.value = searchQuery
      this.filterRemark.value = searchQuery
    } else {
      this.filterBarcode.value = null
      this.filterAdjName.value = null
      this.filterRemark.value = null
    }

    this.loadFilter();
    this.GetListPOSPriceAdj()
  }
  //delete
  onDelete() {
    this.deleteDialogOpened = true
  }
  delete() {
    if (this.posPrice.Code > 0)
      this.DeletePOSPriceAdj()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeletePOSPriceAdj(this.deleteList)
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
    this.changePermission_sst?.unsubscribe()
    this.changeModuleData_sst?.unsubscribe()
    this.GetListPOSPriceAdj_sst?.unsubscribe()
    this.GetProductByBarcode_sst?.unsubscribe()
    this.UpdatePOSPriceAdjStatus_sst?.unsubscribe()
    this.DeletePOSPriceAdjHachi24hByID_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
