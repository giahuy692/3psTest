import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Router } from '@angular/router';
import DTOInport from '../../shared/dto/DTOInport.dto';
import { EcomInportAPIService } from '../../shared/services/ecom-inport-api.service';
import { EcomService } from '../../shared/services/ecom.service';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';

@Component({
  selector: 'app-ecom008-outport-list',
  templateUrl: './ecom008-outport-list.component.html',
  styleUrls: ['./ecom008-outport-list.component.scss']
})
export class Ecom008OutportListComponent implements OnInit, OnDestroy {
  loading = false
  isAdd = true
  isFilterActive = true
  excelValid = true

  deleteDialogOpened = false
  deleteManyDialogOpened = false

  total = 0
  mainWarehouse: number = null
  //object
  inport = new DTOInport()
  listInport: DTOInport[] = []
  deleteList: DTOInport[] = []
  //header1
  cbxList = [{
    Name: 'Tạo mới',
    Checked: true,
    Filter: {
      field: "Status", operator: "eq", value: 1
    }
  }, {
    Name: 'Đang xuất hàng',
    Checked: true,
    Filter: {
      field: "Status", operator: "eq", value: 2
    }
  }, {
    Name: 'Chờ chốt số liệu',
    Checked: false,
    Filter: {
      field: "Status", operator: "eq", value: 3
    }
  }, {
    Name: 'Hoàn tất',
    Checked: false,
    Filter: {
      field: "Status", operator: "eq", value: 4
    }
  }, {
    Name: 'Chứng từ bị hủy',
    Checked: false,
    Filter: {
      field: "Status", operator: "eq", value: 5
    }
  }]
  //header
  searchForm: UntypedFormGroup
  RequestDate: Date = null
  DeliveredDate: Date = null
  //grid
  allowActionDropdown = ['delete']
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
    field: 'Status', dir: 'asc'
  }
  //header1
  filterStatusID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterFromWarehouse: FilterDescriptor = {
    field: "FromWarehouse", operator: "eq", value: this.mainWarehouse
  }
  //filder date
  filterRequestDate: FilterDescriptor = {
    field: "RequestDate", operator: "gte", value: null
  }
  filterDeliveredDate: FilterDescriptor = {
    field: "DeliveredDate", operator: "lte", value: null
  }
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }

  filterToWarehouseName: FilterDescriptor = {
    field: "ToWarehouseName", operator: "contains", value: null
  }
  filterRefNo: FilterDescriptor = {
    field: "RefNo", operator: "contains", value: null
  }
  filterDocumentNo: FilterDescriptor = {
    field: "DocumentNo", operator: "contains", value: null
  }
  //CALLBACK
  uploadEventHandlerCallback: Function
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
  dataPerm: DTODataPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  GetListInport_sst: Subscription
  UpdateInportStatus_sst: Subscription
  DeleteInport_sst: Subscription

  GetTemplate_sst: Subscription
  ImportExcel_sst: Subscription
  ExportExcel_sst: Subscription

  changeModuleData_sst: Subscription
  changePermission_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public router: Router,
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: EcomService,
    public apiService: EcomInportAPIService,
  ) { }

  ngOnInit(): void {
    let that = this
    this.loadSearchForm()

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")
        that.dataPerm = res.DataPermission
        that.mainWarehouse = that.dataPerm.find(s => s.IsMain)?.Warehouse

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        this.loadFilter()
        // that.GetListInport()
      }
    })

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.GetListInport()
      }
    })

    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
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

    this.filterFromWarehouse.value = this.mainWarehouse
    this.gridState.filter.filters = [this.filterFromWarehouse]

    this.filterSearchBox.filters = []
    this.filterStatusID.filters = []
    //checkbox header 1 status id
    this.cbxList.forEach(s => {
      if (s.Checked)
        this.filterStatusID.filters.push(s.Filter)
    })

    if (this.filterStatusID.filters.length > 0)
      this.gridState.filter.filters.push(this.filterStatusID)
    //search box    
    if (Ps_UtilObjectService.hasValueString(this.filterToWarehouseName.value))
      this.filterSearchBox.filters.push(this.filterToWarehouseName)

    if (Ps_UtilObjectService.hasValueString(this.filterDocumentNo.value))
      this.filterSearchBox.filters.push(this.filterDocumentNo)

    if (Ps_UtilObjectService.hasValueString(this.filterRefNo.value))
      this.filterSearchBox.filters.push(this.filterRefNo)

    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
    //date      
    if (Ps_UtilObjectService.hasValueString(this.filterRequestDate.value))
      this.gridState.filter.filters.push(this.filterRequestDate)

    if (Ps_UtilObjectService.hasValueString(this.filterDeliveredDate.value))
      this.gridState.filter.filters.push(this.filterDeliveredDate)
  }
  //API
  GetListInport() {
    this.loading = true;
    var ctx = 'Danh sách Chứng từ'

    this.GetListInport_sst = this.apiService.GetListInport(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listInport = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listInport, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  UpdateInportStatus(items: DTOInport[] = [this.inport], statusID: number) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'

    this.UpdateInportStatus_sst = this.apiService.UpdateInportStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListInport()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  DeleteInport(items: DTOInport[] = [this.inport]) {
    this.loading = true;
    var ctx = 'Hủy Chứng từ'

    this.DeleteInport_sst = this.apiService.DeleteInport(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        items.forEach(s => {
          var ex = this.listInport.findIndex(f => f.Code == s.Code)

          if (ex != -1) {
            this.total--
            this.listInport.splice(ex, 1)
          }
        })
        this.gridView.next({ data: this.listInport, total: this.total });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.GetListInport()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  //file
  downloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "CreateInports.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.layoutApiService.GetTemplate(getfilename).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
      this.loading = false;
    });
  }
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.ImportExcel_sst = this.layoutApiService.ImportExcel(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListInport()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    })
  }
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListInport()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.GetListInport()
  }
  //DROPDOWN popup
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOInport) {
    moreActionDropdown = []
    this.inport = { ...dataItem }
    var statusID = this.inport.Status;
    //edit
    if (statusID == 4
      // (statusID != 1 && statusID != 4 && this.isAllowedToCreate) ||
      // ((statusID == 1 || statusID == 4) && this.isAllowedToVerify)
    )
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if (this.isToanQuyen || this.isAllowedToVerify) {
      if (statusID == 1) {
        moreActionDropdown.push({ Name: "Xuất hàng", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
      }
      else if (statusID == 2) {
        moreActionDropdown.push({ Name: "Hoàn tất xuất hàng", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
      }
      else if (statusID == 3) {
        moreActionDropdown.push({ Name: "Chốt số liệu", Code: "lock", Type: 'StatusID', Link: "3", Actived: true })
      }
    }
    //delete
    if (statusID == 0)
      moreActionDropdown.push({ Name: "Hủy chứng từ", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item) {
    if (item.Code > 0) {
      this.inport = { ...item }

      if (menu.Type == 'StatusID') {
        this.UpdateInportStatus([this.inport], parseInt(menu.Link))
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.openDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDelete()
      }
    }
  }
  //selection
  getSelectionPopup(selectedList: DTOInport[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canNhanHang_canXoa = selectedList.findIndex(s => s.Status == 1)
    
    if (canNhanHang_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Xuất hàng", Code: "redo", Link: "1", Actived: true, LstChild: []
      })
    //
    if (this.isToanQuyen || this.isAllowedToVerify) {
      var canHoanTat = selectedList.findIndex(s => s.Status == 2)

      if (canHoanTat != -1)
        moreActionDropdown.push({
          Type: "StatusID", Name: "Hoàn tất xuất hàng", Code: "check-outline", Link: "2", Actived: true, LstChild: []
        })

      var canChot = selectedList.findIndex(s => s.Status == 2)

      if (canChot != -1)
        moreActionDropdown.push({
          Type: "StatusID", Name: "Chốt số liệu", Code: "lock", Link: "4", Actived: true, LstChild: []
        })
    }
    //delete
    if (canNhanHang_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Name: "Hủy chứng từ", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        var arr = []

        if (value == 2 || value == '2')//XUẤT HÀNG
          list.forEach(s => {
            if (s.StatusID == 1) {
              arr.push(s)
            }
          })
        else if (value == 3 || value == '3')//HOÀN TẤT NHẬP HÀNG
          list.forEach(s => {
            if (s.StatusID == 2) {
              arr.push(s)
            }
          })
        else if (value == 4 || value == '4')//CHỐT SỐ LIỆU
          list.forEach(s => {
            if (s.StatusID == 3) {
              arr.push(s)
            }
          })

        if (Ps_UtilObjectService.hasListValue(arr))
          this.UpdateInportStatus(arr, value)
      }
      else if (btnType == "delete") {//Hủy
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
    this.GetListInport()
  }
  importExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  openDetail(isAdd: boolean) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (isAdd) {
        var prom = new DTOInport()
        this.service.setCacheInportDetail(prom)
      } else
        this.service.setCacheInportDetail(this.inport)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('ecom-op')
        || f.Link.includes('ecom-op'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('outport-list')
          || f.Link.includes('outport-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('outport-detail')
            || f.Link.includes('outport-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //header
  resetFilter() {
    //header
    this.searchForm.get('SearchQuery').setValue(null)
    //prod
    this.filterToWarehouseName.value = null
    this.filterDocumentNo.value = null
    this.filterRefNo.value = null
    //
    this.cbxList[0].Checked = true
    this.cbxList[1].Checked = true
    this.cbxList[2].Checked = false
    this.cbxList[3].Checked = false
    this.cbxList[4].Checked = false
    //
    this.filterRequestDate.value = null
    this.filterDeliveredDate.value = null

    this.loadFilter()
    this.GetListInport()
  }
  clearDate(prop: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this[prop].value = null
      this.loadFilter()
      this.GetListInport()
    }
  }
  //
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.loadFilter()
      this.GetListInport()
    }
  }
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterToWarehouseName.value = searchQuery
      this.filterDocumentNo.value = searchQuery
      this.filterRefNo.value = searchQuery
    } else {
      this.filterToWarehouseName.value = null
      this.filterDocumentNo.value = null
      this.filterRefNo.value = null
    }

    this.loadFilter();
    this.GetListInport()
  }
  //delete
  onDelete() {
    this.deleteDialogOpened = true
  }
  delete() {
    if (this.inport.Code > 0)
      this.DeleteInport()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeleteInport(this.deleteList)
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
    this.GetListInport_sst?.unsubscribe()
    this.UpdateInportStatus_sst?.unsubscribe()
    this.DeleteInport_sst?.unsubscribe()

    this.GetTemplate_sst?.unsubscribe()
    this.ImportExcel_sst?.unsubscribe()
    this.ExportExcel_sst?.unsubscribe()

    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
