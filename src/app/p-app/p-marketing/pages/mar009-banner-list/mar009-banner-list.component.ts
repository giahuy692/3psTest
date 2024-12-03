import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';

import { MatSidenav } from '@angular/material/sidenav';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { MarketingService } from '../../shared/services/marketing.service';
import { DTOMABanner } from '../../shared/dto/DTOMABanner.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Router } from '@angular/router';
import { MarBannerAPIService } from '../../shared/services/marbanner-api.service';

@Component({
  selector: 'app-mar009-banner-list',
  templateUrl: './mar009-banner-list.component.html',
  styleUrls: ['./mar009-banner-list.component.scss']
})
export class Mar009BannerListComponent implements OnInit, OnDestroy {
  loading = false
  isAdd = true
  isFilterActive = true
  excelValid = true

  deleteDialogOpened = false
  deleteManyDialogOpened = false

  total = 0
  //object
  banner = new DTOMABanner()
  listBanner: DTOMABanner[] = []
  deleteList: DTOMABanner[] = []
  //header1
  dangSoanThao = true
  guiDuyet = false
  daDuyet = false
  ngungHienThi = false
  //header
  searchForm: UntypedFormGroup
  StartDate: Date = null
  EndDate: Date = null
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
    field: 'OrderBy', dir: 'asc'
  }
  //header1
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
  //filder date
  filterStartDate: FilterDescriptor = {
    field: "StartDate", operator: "gte", value: null
  }
  filterEndDate: FilterDescriptor = {
    field: "EndDate", operator: "lte", value: null
  }
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterBannerGroupName: FilterDescriptor = {
    field: "BannerGroupName", operator: "contains", value: null
  }
  filterVNTitle: FilterDescriptor = {
    field: "VNTitle", operator: "contains", value: null
  }
  filterENTitle: FilterDescriptor = {
    field: "ENTitle", operator: "contains", value: null
  }
  filterJPTitle: FilterDescriptor = {
    field: "JPTitle", operator: "contains", value: null
  }
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
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

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  GetListBanner_sst: Subscription
  UpdateBannerStatus_sst: Subscription
  DeleteBanner_sst: Subscription

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
    public service: MarketingService,
    public apiService: MarBannerAPIService,
  ) { }

  ngOnInit(): void {
    let that = this
    
    this.loadFilter()
    this.loadSearchForm()

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // that.GetListBanner()
      }
    })

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.GetListBanner()
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
    this.pageSizes = [...this.service.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.sort = [this.sortBy]

    this.gridState.filter.filters = []
    this.filterSearchBox.filters = []
    this.filterStatusID.filters = []
    //checkbox header 1 status id
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
      this.gridState.filter.filters.push(this.filterStatusID)
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterBannerGroupName.value))
      this.filterSearchBox.filters.push(this.filterBannerGroupName)

    if (Ps_UtilObjectService.hasValueString(this.filterVNTitle.value))
      this.filterSearchBox.filters.push(this.filterVNTitle)

    if (Ps_UtilObjectService.hasValueString(this.filterENTitle.value))
      this.filterSearchBox.filters.push(this.filterENTitle)

    if (Ps_UtilObjectService.hasValueString(this.filterJPTitle.value))
      this.filterSearchBox.filters.push(this.filterJPTitle)

    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
    //date      
    if (Ps_UtilObjectService.hasValueString(this.filterStartDate.value))
      this.gridState.filter.filters.push(this.filterStartDate)

    if (Ps_UtilObjectService.hasValueString(this.filterEndDate.value))
      this.gridState.filter.filters.push(this.filterEndDate)
  }
  //API
  GetListBanner() {
    this.loading = true;
    var ctx = 'Danh sách Banner'

    this.GetListBanner_sst = this.apiService.GetListBanner(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listBanner = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listBanner, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  UpdateBannerStatus(items: DTOMABanner[] = [this.banner], statusID: number) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'

    this.UpdateBannerStatus_sst = this.apiService.UpdateBannerStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListBanner()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  DeleteBanner(items: DTOMABanner[] = [this.banner]) {
    this.loading = true;
    var ctx = 'Xóa banner'

    this.DeleteBanner_sst = this.apiService.DeleteBanner(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        items.forEach(s => {
          var ex = this.listBanner.findIndex(f => f.Code == s.Code)

          if (ex != -1) {
            this.total--
            this.listBanner.splice(ex, 1)
          }
        })
        this.gridView.next({ data: this.listBanner, total: this.total });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.GetListBanner()
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
    var getfilename = "CreateBanners.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.apiService.GetTemplate(getfilename).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
  }
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.ImportExcel_sst = this.apiService.ImportExcel(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListBanner()
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
    // this.ImportExcel_sst = this.apiService.ImportExcel(e).subscribe(res => {
    //   this.loading = true
    //   if (res != null) {
    //     // this.itemList = res;
    //     // this.importGridDSView.next({ data: this.itemList, total: res.length });
    //   } else {
    //     // this.importGridDSView.next({ data: [], total: 0 });
    //   }
    //   this.loading = false;
    // }, () => {
    //   // this.importGridDSView.next({ data: [], total: 0 });
    //   this.loading = false;
    // })
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListBanner()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.GetListBanner()
  }
  //DROPDOWN popup
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOMABanner) {
    moreActionDropdown = []
    this.banner = { ...dataItem }
    var statusID = this.banner.StatusID;
    //edit
    if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate) ||
      ((statusID == 0 || statusID == 4) && this.isAllowedToVerify) ||
      statusID == 2 || statusID == 3)
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if (statusID == 0 || statusID == 4) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "2", Actived: true })
    }
    else if (statusID == 1 || statusID == 3) {
      moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
    }
    else if (statusID == 2) {
      moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
    }
    if (statusID == 3) {
      moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })
    }
    //xoa
    if ((statusID == 0 || statusID == 4))
      moreActionDropdown.push({ Name: "Xóa banner", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item) {
    if (item.Code > 0) {
      this.banner = { ...item }
      if (menu.Type == 'StatusID') {
        this.UpdateBannerStatus([this.banner], parseInt(menu.Link))
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
  getSelectionPopup(selectedList: DTOMABanner[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1", Actived: true, LstChild: []
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

    var canStop = selectedList.findIndex(s => s.StatusID == 2)

    if (canStop != -1 && (this.isToanQuyen || this.isAllowedToVerify))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
      })

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Name: "Xóa banner", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        var arr = []

        if (value == 1 || value == '1')//Gửi duyệt
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 4) {
              arr.push(s)
            }
          })
        else if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              arr.push(s)
            }
          })
        else if (value == 4 || value == '4')//Trả về
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              arr.push(s)
            }
          })
        else if (value == 3 || value == '3')//Ngưng hiển thị
          list.forEach(s => {
            if (s.StatusID == 2) {
              arr.push(s)
            }
          })

        if (Ps_UtilObjectService.hasListValue(arr))
          this.UpdateBannerStatus(arr, value)
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
  //CLICK EVENT  
  //header 1
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e

    this.loadFilter()
    this.GetListBanner()
  }
  importExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  openDetail(isAdd: boolean) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (isAdd) {
        var prom = new DTOMABanner()
        this.service.setCacheBanneretail(prom)
      } else
        this.service.setCacheBanneretail(this.banner)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('news-product')
        || f.Link.includes('news-product'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('banner-list')
          || f.Link.includes('banner-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('banner-detail')
            || f.Link.includes('banner-detail'))

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
    this.filterVNTitle.value = null
    this.filterENTitle.value = null
    this.filterJPTitle.value = null
    this.filterBannerGroupName.value = null
    //
    this.dangSoanThao = true
    this.guiDuyet = false
    this.daDuyet = false
    this.ngungHienThi = false
    //
    this.filterStartDate.value = null
    this.filterEndDate.value = null

    this.loadFilter()
    this.GetListBanner()
  }
  clearDate(prop: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this[prop].value = null
      this.loadFilter()
      this.GetListBanner()
    }
  }
  //
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.loadFilter()
      this.GetListBanner()
    }
  }
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterBannerGroupName.value = searchQuery
      this.filterVNTitle.value = searchQuery
      this.filterENTitle.value = searchQuery
      this.filterJPTitle.value = searchQuery
    } else {
      this.filterBannerGroupName.value = null
      this.filterVNTitle.value = null
      this.filterENTitle.value = null
      this.filterJPTitle.value = null
    }

    this.loadFilter();
    this.GetListBanner()
  }
  //delete
  onDelete() {
    this.deleteDialogOpened = true
    this.drawer.close()
  }
  delete() {
    if (this.banner.Code > 0)
      this.DeleteBanner()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeleteBanner(this.deleteList)
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

  getImgRes(str: string){
    return Ps_UtilObjectService.hasValueString(str) ? Ps_UtilObjectService.getImgRes(str): null
  }
  ngOnDestroy(): void {
    this.GetListBanner_sst?.unsubscribe()
    this.UpdateBannerStatus_sst?.unsubscribe()
    this.DeleteBanner_sst?.unsubscribe()

    this.GetTemplate_sst?.unsubscribe()
    this.ImportExcel_sst?.unsubscribe()
    this.ExportExcel_sst?.unsubscribe()

    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
