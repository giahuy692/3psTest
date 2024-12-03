import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem, MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import DTOWebContent from '../../shared/dto/DTOWebContent.dto';
import { MarketingService } from '../../shared/services/marketing.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';

@Component({
  selector: 'app-mar003-news-product',
  templateUrl: './mar003-news-product.component.html',
  styleUrls: ['./mar003-news-product.component.scss']
})
export class Mar003NewsProductComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true
  deleteDialogOpened = false
  deleteManyDialogOpened = false
  total = 0
  //object
  listNewsProduct: DTOWebContent[] = []
  deleteList: DTOWebContent[] = []
  listWareHouse: DTOWarehouse[] = []
  curWebContent = new DTOWebContent()
  //header1
  dangSoanThao = true
  guiDuyet = false
  daDuyet = false
  ngungHienThi = false
  dangSoanThao_count = 0
  guiDuyet_count = 0
  ngungHienThi_count = 0
  //header2
  searchForm: UntypedFormGroup
  //FILTER
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
  //header2
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterVNName: FilterDescriptor = {
    field: "VNName", operator: "contains", value: null
  }
  filterPoscode: FilterDescriptor = {
    field: "Poscode", operator: "contains", value: null
  }
  //grid
  allowActionDropdown = ['detail', 'edit', 'delete']
  //grid
  pageSize = 25
  pageSizes = [this.pageSize]
  gridDSView = new Subject<any>();
  gridDSState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [{ field: 'WebContentCreated', dir: 'desc' }]
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
  changePermission_sst: Subscription
  changeModuleData_sst: Subscription
  GetListWebContent_sst: Subscription
  UpdateWebContentStatus_sst: Subscription
  UpdateWebContent_sst: Subscription
  DeleteWebContent_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    public service: MarketingService,
    public apiService: MarNewsProductAPIService,
    public layoutApiService: LayoutAPIService,
    public layoutService: LayoutService,
    ) { }

  ngOnInit(): void {
    let that = this
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
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }
  getData() {
    this.GetListWebContent()
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
    // search box
    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterPoscode.value))
      this.filterSearchBox.filters.push(this.filterPoscode)

    if (Ps_UtilObjectService.hasValueString(this.filterVNName.value))
      this.filterSearchBox.filters.push(this.filterVNName)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
    // checkbox header 1
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
  }
  resetFilter() {
    //header1
    this.dangSoanThao = true
    this.guiDuyet = false
    this.daDuyet = false
    this.ngungHienThi = false
    // //header2
    this.searchForm.get('SearchQuery').setValue(null)
    this.filterBarcode.value = null
    this.filterVNName.value = null
    this.filterPoscode.value = null

    this.gridDSState.sort = [{ field: 'WebContentCreated', dir: 'desc' }]
    this.loadFilter()
    this.GetListWebContent()
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.GetListWebContent()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.GetListWebContent()
  }
  //API  
  GetListWebContent() {
    this.loading = true;

    this.GetListWebContent_sst = this.apiService.GetListWebContent(this.gridDSState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listNewsProduct = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridDSView.next({ data: this.listNewsProduct, total: this.total });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  UpdateWebContent(properties: string[], webcontent: DTOWebContent = this.curWebContent) {
    this.loading = true;
    var ctx = "Cập nhật Khuyến mãi"

    var updateDTO: DTOUpdate = {
      "DTO": webcontent,
      "Properties": properties
    }

    this.UpdateWebContent_sst = this.apiService.UpdateWebContent(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        webcontent = res.ObjectReturn
        var i = this.listNewsProduct.findIndex(s => s.Code == webcontent.Code)

        if (i > -1)
          this.listNewsProduct.splice(i, 1, res.ObjectReturn)

        this.gridDSView.next({ data: this.listNewsProduct, total: this.total });
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
  UpdateWebContentStatus(statusID: number, webcontent: DTOWebContent = this.curWebContent) {
    this.loading = true;
    var ctx = "Cập nhật Khuyến mãi"

    this.UpdateWebContentStatus_sst = this.apiService.UpdateWebContentStatus(webcontent, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        webcontent = res.ObjectReturn
        var i = this.listNewsProduct.findIndex(s => s.Code == webcontent.Code)

        if (i > -1)
          this.listNewsProduct.splice(i, 1, res.ObjectReturn)

        this.gridDSView.next({ data: this.listNewsProduct, total: this.total });
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
  DeleteWebContent(webcontent: DTOWebContent = this.curWebContent) {
    this.loading = true;
    var ctx = "Xóa chương trình khuyến mãi"

    this.DeleteWebContent_sst = this.apiService.DeleteWebContent(webcontent.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        var i = this.listNewsProduct.findIndex(s => s.Code == webcontent.Code)

        if (i > -1) {
          this.total--
          this.listNewsProduct.splice(i, 1)
          this.gridDSView.next({ data: this.listNewsProduct, total: this.total });
        }
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
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e

    this.loadFilter()
    this.GetListWebContent()
  }
  selectedBtnChange2(checked: boolean, filter: FilterDescriptor) {
    if (checked != null)
      this.ngungHienThi = checked
  }
  //header2
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterPoscode.value = searchQuery
      this.filterBarcode.value = searchQuery
      this.filterVNName.value = searchQuery
    } else {
      this.filterPoscode.value = null
      this.filterBarcode.value = null
      this.filterVNName.value = null
    }

    this.loadFilter();
    this.GetListWebContent()
  }
  //selection
  getSelectionPopup(selectedList: DTOWebContent[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

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
        Name: "Xóa bài viết", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: DTOWebContent[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        if (value == 1 || value == '1')//Gửi duyệt
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 4) {
              s.StatusID = 1
              this.UpdateWebContentStatus(1, s)
            }
          })
        else if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              s.StatusID = 2
              this.UpdateWebContentStatus(2, s)
            }
          })
        else if (value == 4 || value == '4')//Trả về
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              s.StatusID = 4
              this.UpdateWebContentStatus(4, s)
            }
          })
        else if (value == 3 || value == '3')//Ngưng hiển thị
          list.forEach(s => {
            if (s.StatusID == 2) {
              s.StatusID = 3
              this.UpdateWebContentStatus(3, s)
            }
          })
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
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOWebContent) {
    moreActionDropdown = []
    this.curWebContent = { ...dataItem }
    var statusID = this.curWebContent.StatusID;
    //edit
    if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate && !this.isAllowedToVerify) ||
      ((statusID == 0 || statusID == 4) && this.isAllowedToVerify && !this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if ((this.isToanQuyen || this.isAllowedToCreate) && (statusID == 0 || statusID == 4)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
    }
    //
    else if (this.isToanQuyen || this.isAllowedToVerify) {
      if (statusID == 1) {
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
    //delete
    if ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xóa bài viết", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOWebContent) {
    if (item.Code != 0) {
      if (menu.Type == 'StatusID') {
        this.curWebContent = { ...item }
        this.curWebContent.StatusID = parseInt(menu.Link)
        this.UpdateWebContentStatus(parseInt(menu.Link))
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.curWebContent = { ...item }
        this.onDeleteWebContent()
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.curWebContent = { ...item }
        this.openNewsProductDetail(false)
      }
    }
  }
  //delete
  onDeleteWebContent() {
    this.deleteDialogOpened = true
  }
  delete() {
    if (this.curWebContent.Code != 0)
      this.DeleteWebContent()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteManyPromotion() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.deleteList.forEach(s => {
      this.DeleteWebContent(s)
    });
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //
  openNewsProductDetail(isAdd: boolean) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      this.service.isAdd = isAdd

      if (isAdd) {
        var wc = new DTOWebContent()
        // prom.Category = this.currentTaoMoi.value
        // prom.CategoryName = this.currentTaoMoi.text
        this.service.setCacheNewsProductDetail(wc)
      }
      else
        this.service.setCacheNewsProductDetail(this.curWebContent)

      var parent = item.ListMenu.find(f => f.Code.includes('news-product')
        || f.Link.includes('news-product'))

      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('news-product')
          || f.Link.includes('news-product'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('news-product-detail')
            || f.Link.includes('news-product-detail'))

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
    this.changePermission_sst?.unsubscribe()
    this.changeModuleData_sst?.unsubscribe()
    this.GetListWebContent_sst?.unsubscribe()
    this.UpdateWebContentStatus_sst?.unsubscribe()
    this.UpdateWebContent_sst?.unsubscribe()
    this.DeleteWebContent_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
