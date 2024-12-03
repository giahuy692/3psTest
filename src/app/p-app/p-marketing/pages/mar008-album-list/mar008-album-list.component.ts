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
import { MarAlbumAPIService } from '../../shared/services/mar-album-api.service';
import { MarketingService } from '../../shared/services/marketing.service';
import { DTOAlbum } from '../../shared/dto/DTOAlbum.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';

@Component({
  selector: 'app-mar008-album-list',
  templateUrl: './mar008-album-list.component.html',
  styleUrls: ['./mar008-album-list.component.scss']
})
export class Mar008AlbumListComponent implements OnInit, OnDestroy {
  loading = false
  isAdd = true
  isFilterActive = true
  deleteDialogOpened = false
  deleteManyDialogOpened = false
  total = 0
  //object
  album = new DTOAlbum()
  listAlbum: DTOAlbum[] = []
  deleteList: DTOAlbum[] = []
  //header1
  dangSoanThao = true
  daDuyet = false
  ngungHienThi = false
  //header
  searchForm: UntypedFormGroup
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
  filterDaDuyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 2
  }
  filterNgungHienThi: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 3
  }
  filterTraLai: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 4
  }
  //filder prod
  filterIsSpecial: FilterDescriptor = {
    field: "IsSpecial", operator: "eq", value: 0
  }
  filterNoOfChilds: FilterDescriptor = {
    field: "NoOfChilds", operator: "eq", value: 0
  }
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterAlbumNameVN: FilterDescriptor = {
    field: "AlbumNameVN", operator: "contains", value: null
  }
  filterAlbumNameEN: FilterDescriptor = {
    field: "AlbumNameEN", operator: "contains", value: null
  }
  filterAlbumNameJP: FilterDescriptor = {
    field: "AlbumNameJP", operator: "contains", value: null
  }
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
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
  GetListAlbum_sst: Subscription
  UpdateAlbumStatus_sst: Subscription
  DeleteAlbum_sst: Subscription
  changeModuleData_sst: Subscription
  changePermission_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: MarketingService,
    public apiService: MarAlbumAPIService,
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
        // that.GetListAlbum()
      }
    })

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.GetListAlbum()
      }
    })
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
    this.gridState.filter.filters = [this.filterIsSpecial, this.filterNoOfChilds]
    this.filterSearchBox.filters = []
    this.filterStatusID.filters = []
    //checkbox header 1 status id
    if (this.dangSoanThao) {
      this.filterStatusID.filters.push(this.filterDangSoanThao)
      this.filterStatusID.filters.push(this.filterTraLai)
    }

    if (this.daDuyet)
      this.filterStatusID.filters.push(this.filterDaDuyet)

    if (this.ngungHienThi)
      this.filterStatusID.filters.push(this.filterNgungHienThi)

    if (this.filterStatusID.filters.length > 0)
      this.gridState.filter.filters.push(this.filterStatusID)
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterAlbumNameVN.value))
      this.filterSearchBox.filters.push(this.filterAlbumNameVN)

    if (Ps_UtilObjectService.hasValueString(this.filterAlbumNameEN.value))
      this.filterSearchBox.filters.push(this.filterAlbumNameEN)

    if (Ps_UtilObjectService.hasValueString(this.filterAlbumNameJP.value))
      this.filterSearchBox.filters.push(this.filterAlbumNameJP)

    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
  }
  //API
  GetListAlbum() {
    this.loading = true;
    var ctx = 'Danh sách Chủ đề nổi bật'

    this.GetListAlbum_sst = this.apiService.GetListAlbum(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listAlbum = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listAlbum, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  UpdateAlbumStatus(statusID: number, items = [this.album]) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'

    this.UpdateAlbumStatus_sst = this.apiService.UpdateAlbumStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListAlbum()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  DeleteAlbum(items = [this.album]) {
    this.loading = true;
    var ctx = 'Xóa chủ đề'

    this.DeleteAlbum_sst = this.apiService.DeleteAlbum(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        items.forEach(s => {
          var ex = this.listAlbum.findIndex(f => f.Code == s.Code)

          if (ex != -1)
            this.listAlbum.splice(ex, 1)
        })
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.GetListAlbum()
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
    this.GetListAlbum()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.GetListAlbum()
  }
  //DROPDOWN popup
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem) {
    this.album = { ...dataItem }
    var statusID = this.album.StatusID;
    moreActionDropdown = []
    //ALBUM cho phép EDIT sau khi Duyệt
    if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate)
      || ((statusID == 0 || statusID == 4) && this.isAllowedToVerify))
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
    else if (((statusID == 1 || statusID == 2) && (this.isToanQuyen || this.isAllowedToVerify))
      || ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate)))
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
    //ALBUM ko có bước Gửi duyệt
    if (this.isToanQuyen || this.isAllowedToVerify) {
      if (statusID == 0 || statusID == 4) {
        moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
      }
      else if (statusID == 2) {
        moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
      }
      else if (statusID == 3) {
        moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
        moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })
      }
    }
    //ALBUM cho phép EDIT sau khi Duyệt
    if ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xóa thương hiệu", Code: "trash", Link: "delete", Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item) {
    if (item.Code > 0) {
      this.album = { ...item }

      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDelete()
      }
      else if (menu.Type == 'StatusID') {
        this.album.StatusID = parseInt(menu.Link)
        this.UpdateAlbumStatus(this.album.StatusID)
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.album = { ...item }
        this.openDetail(false)
      }
    }
  }
  //selection
  getSelectionPopup(selectedList: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    var canDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

    if (canDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })
    }

    var canNgung = selectedList.findIndex(s => s.StatusID == 2)

    if (canNgung != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
      })
    }

    var canTra = selectedList.findIndex(s => s.StatusID == 3)

    if (canTra != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
      })
    }

    if (canDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate)) {
      moreActionDropdown.push({
        Name: "Xóa chủ đề", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })
    }

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        // if (value == 1 || value == '1')//Gửi duyệt
        //   list.forEach(s => {
        //     if (s.StatusID == 0) {
        //       s.StatusID = 1
        //       this.UpdateAlbumStatus(s)
        //     }
        //   })
        // else 
        if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 3 || s.StatusID == 4) {
              s.StatusID = 2
              this.UpdateAlbumStatus(s)
            }
          })
        else if (value == 4 || value == '4')//Trả về
          list.forEach(s => {
            if (s.StatusID == 3 || s.StatusID == 1) {
              s.StatusID = 4
              this.UpdateAlbumStatus(s)
            }
          })
        else if (value == 3 || value == '3')//Ngưng hiển thị
          list.forEach(s => {
            if (s.StatusID == 2) {
              s.StatusID = 3
              this.UpdateAlbumStatus(s)
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
  //CLICK EVENT  
  //header 1
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e

    this.loadFilter()
    this.GetListAlbum()
  }
  openDetail(isAdd: boolean) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (isAdd) {
        var prom = new DTOAlbum()
        this.service.setCacheAlbumDetail(prom)
      } else
        this.service.setCacheAlbumDetail(this.album)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('coupon-list')
        || f.Link.includes('coupon-list'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('album-list')
          || f.Link.includes('album-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('album-detail')
            || f.Link.includes('album-detail'))

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
    this.filterAlbumNameVN.value = null
    this.filterAlbumNameEN.value = null
    this.filterAlbumNameJP.value = null

    this.loadFilter()
    this.GetListAlbum()
  }
  //
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterAlbumNameVN.value = searchQuery
      this.filterAlbumNameEN.value = searchQuery
      this.filterAlbumNameJP.value = searchQuery
    } else {
      this.filterAlbumNameVN.value = null
      this.filterAlbumNameEN.value = null
      this.filterAlbumNameJP.value = null
    }

    this.loadFilter();
    this.GetListAlbum()
  }
  //delete
  onDelete() {
    this.deleteDialogOpened = true
    this.drawer.close()
  }
  delete() {
    if (this.album.Code > 0)
      this.DeleteAlbum()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeleteAlbum(this.deleteList)
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
    this.GetListAlbum_sst?.unsubscribe()
    this.UpdateAlbumStatus_sst?.unsubscribe()
    this.DeleteAlbum_sst?.unsubscribe()
    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
