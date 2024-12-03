import { MarHashtagAPIService } from './../../shared/services/mar-hashtag-api.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';

import { Subject, Subscription } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOMAHashtag } from '../../shared/dto/DTOMAHashtag.dto';
import { MarketingService } from '../../shared/services/marketing.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

@Component({
  selector: 'app-mar016-hashtag-list',
  templateUrl: './mar016-hashtag-list.component.html',
  styleUrls: ['./mar016-hashtag-list.component.scss']
})
export class Mar016HashtagListComponent implements OnInit {
  //////////////////////////////////Variables//////////////////////////////////
  // Dialog
  editCategory = false;
  deleteDialogOpened = false;
  deleteManyDialogOpened = false;
  //
  // Permission
  isToanQuyen = false;
  isAllowedToCreate = false;
  isAllowedToVerify = false;
  //
  // Grid
  loading = false
  justLoaded = true

  total = 0
  pageSize = 25
  pageSizes = [this.pageSize]

  onSelectCallback: Function
  onSortChangeCallback: Function
  onPageChangeCallback: Function

  gridView = new Subject<any>();
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  sortBy: SortDescriptor[] = [{
    field: 'CreateTime',
    dir: 'desc'
  }]
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //
  // Search
  searchForm: UntypedFormGroup;
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  //
  // Filters
  isFilterActive = true;
  
  listStatusID = [
		{ id: 0, status: 'Đang soạn thảo', isChecked: true }, 
		{ id: 2, status: 'Áp dụng', isChecked: false }, 
		{ id: 3, status: 'Ngưng áp dụng', isChecked: false },
		{ id: 4, status: 'Trả về', isChecked: false },
	]

  filterStatusID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterCategory: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  //
  filterCreateBy: FilterDescriptor = {
    field: "CreateBy", operator: "contains", value: null
  }
  //
  filterTagName: FilterDescriptor = {
    field: "TagName", operator: "contains", value: null
  }
  filterTagCode: FilterDescriptor = {
    field: "TagCode", operator: "contains", value: null
  }
  filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: "contains",
  };
  //
  // Popup
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  //
  // Dropdown
  allowActionDropdown = ['detail', 'edit', 'delete']
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //
  // Files
  pickFileCallback: Function
  GetFolderCallback: Function

  uploadEventHandlerCallback: Function
  //
  // Subscription
  changePermission_sst: Subscription
  changeModuleData_sst: Subscription

  GetListHashtag_sst: Subscription
  UpdateHashtag_sst: Subscription
  DeleteHashtag_sst: Subscription

  GetTotalProduct_sst: Subscription
  GetTotalPost_sst: Subscription

  ImportExcelHashtag_sst: Subscription
  GetTemplateHashtag_sst: Subscription
  changePermissionAPI: Subscription
  //
  // Hashtags
  Hashtag = new DTOMAHashtag()
  actionPerm: DTOActionPermission[] = []
  listHashtag: DTOMAHashtag[] = []
  listUpdateHashtag: DTOMAHashtag[] = []
  //
  //////////////////////////////////Variables//////////////////////////////////

  //////////////////////////////////Constructor//////////////////////////////////
  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public apiService: MarHashtagAPIService,
  ) { }
  //////////////////////////////////Constructor//////////////////////////////////

  //////////////////////////////////Functions//////////////////////////////////
  ngOnInit(): void {
    let that = this
    this.loadSearchForm();
    ;

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        // that.getData();
      }
    })
    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.getData();
      }
    })
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.onSortChange.bind(this);
    // Dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    //
    // Select
    this.onSelectCallback = this.selectChange.bind(this)
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    //
    // File
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //
  }
  // Grid
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListHashtag()
  }
  onSortChange(e: SortDescriptor[]) {
    this.gridState.sort = e;
    this.GetListHashtag();
  }
  //
  getData() {
    this.loadFilter();
    this.GetListHashtag()
  }
  // Grid

  // Filters, Search
  loadFilter() {
    this.pageSizes = [...this.service.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.sort = this.sortBy

    this.gridState.filter.filters = []
    this.filterSearchBox.filters = []
    this.filterStatusID.filters = []
    this.filterCategory.filters = []

    for (let statusItem of this.listStatusID) {
      if (statusItem.isChecked && statusItem.id == 0)
        this.filterStatusID.filters.push({
          field: "StatusID",
          operator: "eq",
          value: 4
        })
      

      if (statusItem.isChecked) {
        this.filterStatusID.filters.push({
          field: "StatusID",
          operator: "eq",
          value: statusItem.id
        })
      } 
    }

    if (this.filterStatusID.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatusID)
    }

    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterCreateBy.value))
      this.filterSearchBox.filters.push(this.filterCreateBy)
    //
    if (Ps_UtilObjectService.hasValueString(this.filterTagName.value))
      this.filterSearchBox.filters.push(this.filterTagName)
    if (Ps_UtilObjectService.hasValueString(this.filterTagCode.value))
      this.filterSearchBox.filters.push(this.filterTagCode)

    //
    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
  }
  resetFilter() {
    // this.currentType = [];
    this.searchForm.get('SearchQuery').setValue(null)
    this.listStatusID.map(s => {
      s.isChecked = s.id == 0;
    })
    this.search()
  }
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterTagName.value = searchQuery
      this.filterTagCode.value = searchQuery
      this.filterCreateBy.value = searchQuery
    } else {
      this.filterTagName.value = null
      this.filterTagCode.value = null
      this.filterCreateBy.value = null
    }
    this.loadFilter();
    this.GetListHashtag()
  }
  // Filters, Search

  // Buttons
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  selectedBtnChange(e?: boolean, index?: number) {
    if (e != null || index != null)
      this.listStatusID[index].isChecked = e;
    this.loadFilter();
    this.GetListHashtag();
  }
  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.value == -1;
  }
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  onImportExcel() {
    this.layoutService.setImportDialog(true)
  }
  uploadEventHandler(e: File) {
    this.ImportExcelHashtag(e)
  }
  onDownloadExcel() {
    this.DownloadExcel()
  }
  // Buttons
  
  // Get List Hashtag
  GetListHashtag() {
    this.loading = true;
    var ctx = 'Danh sách hashtag'

    this.GetListHashtag_sst = this.apiService.GetListHashtag(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listHashtag = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listHashtag, total: this.total });
      } else 
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  // Get List Hashtag

  // Get Update Status Of Hashtag
  getUpdateHashtagStatus(items = [this.Hashtag], StatusID: number) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'
    // this.Hashtag.StatusID = this.Hashtag.StatusName = null;

    this.UpdateHashtag_sst = this.apiService.UpdateHashtagStatus(items, StatusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.listUpdateHashtag = []
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListHashtag()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  // Get Update Status Of Hashtag

  // Update Status
  updateStatus(newPro: DTOMAHashtag, statusID: number) {
    var ctx = newPro.TagName;
    
    if (statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(newPro.TagName))
        this.layoutService.onError(`Vui lòng nhập tên hashtag "${ctx}"`)
      else if (!Ps_UtilObjectService.hasValueString(newPro.TagCode))
        this.layoutService.onError(`Vui lòng nhập mã hashtag "${ctx}"`)
      else
        this.listUpdateHashtag.push(newPro)
      // this.getUpdateHashtagStatus(newPro, statusID)
    }
    else
      this.listUpdateHashtag.push(newPro)
    // this.getUpdateHashtagStatus(newPro, statusID)
  }

  // Update Status

  // Delete Hashtag
  DeleteHashtag(items: DTOMAHashtag[] = [this.Hashtag]) {
    this.loading = true;
    var ctx = 'Xóa hashtag'

    this.DeleteHashtag_sst = this.apiService.DeleteHashtag(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        // var ex = this.listHashtag.findIndex(f => f.Code == item.Code)

        // if (ex != -1)
        //   this.listHashtag.splice(ex, 1)

        this.GetListHashtag()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  // Delete Hashtag

  // Import Excel
  ImportExcelHashtag(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.ImportExcelHashtag_sst = this.apiService.ImportExcelHashtag(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListHashtag()
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
  // Import Excel

  // Download Excel
  DownloadExcel() {
    this.loading = true
    var ctx = "Download Excel Template"
    var getfileName = "HashtagTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplateHashtag_sst = this.layoutApiService.GetTemplate(getfileName).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
      this.loading = false;
    });
  }
  // Download Excel

  // Close Delete Dialog
  closeDeleteDialog() {
    this.deleteManyDialogOpened = false
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  // Close Delete Dialog

  // Delete Hashtag(s)
  onDelete() {
    this.deleteDialogOpened = true
  }
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeleteHashtag(this.listUpdateHashtag)
  }
  // Delete Hashtag(s)
  
  // Open Hashtag Detail Page
  openDetail(isAdd: boolean, isLockAll: boolean = false) {
    this.service.isAdd = isAdd
    this.service.isLockAll = isLockAll

    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      // Check if create new hashtag or open selected hashtag detail
      if (isAdd) {
        var prom = new DTOMAHashtag()
        this.service.setCacheHashtagDetail(prom)
      } else
        this.service.setCacheHashtagDetail(this.Hashtag)

      // Find website menu
      var parent = item.ListMenu.find(f => f.Code.includes('website')

        || f.Link.includes('website'))
      // Find hashtag list in website
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) 
      {
        var detail = parent.LstChild.find(f => f.Code.includes('hashtag-list')

          || f.Link.includes('hashtag-list'))
          // Find hashtag detail in hashtag list
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) 
        {
          var detail2 = detail.LstChild.find(f => f.Code.includes('hashtag-detail')
            || f.Link.includes('hashtag-detail'))
          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  // Open Hashtag Detail Page

  // Grid Dropdown
  ///> Check StatusID of selected hashtag for displaying actions in dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOMAHashtag) {
    // Copy data of selected item
    this.Hashtag = { ...dataItem };
    var statusID = this.Hashtag.StatusID;
    moreActionDropdown = [];

    // Condition to display Detail Button
    // if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate) ||
    //   ((statusID == 0 || statusID == 4) && this.isAllowedToVerify) ||
    //   statusID == 2 || statusID == 3)
    //   moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })

    // Display Buttons For StatusID = 3 Or = 4
    if ((statusID == 3) && (this.isToanQuyen || this.isAllowedToCreate)) {
      moreActionDropdown.push(
        { Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true },
        { Name: "Áp dụng", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
        )
    }
    // Display Buttons For StatusID = 0
    else if ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push(
        { Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true },
        { Name: "Áp dụng", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
      )
    }
    // Display Buttons For StatusID = 2
    else if (statusID == 2 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push(
        { Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true },
        { Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true }
      )
    }
    // Display Delete Button
    if ((statusID == 0) && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xóa hashtag", Code: "trash", Type: 'delete', Actived: true })

    // Return Array After Checking Conditions 
    return moreActionDropdown
  }

  ///> Click Events In Dropdown
  onActionDropdownClick(menu: MenuDataItem, item: DTOMAHashtag) {
    if (item.Code >= 0) {
      // Copy data of selected item
      this.Hashtag = { ...item }
      // Check Type Of Selected Button
      ////> If Send To Verify Clicked
      if (menu.Type == 'StatusID') {
        var status = parseInt(menu.Link)

        this.updateStatus(this.Hashtag, status)
        if (Ps_UtilObjectService.hasListValue(this.listUpdateHashtag))
          this.getUpdateHashtagStatus([this.Hashtag], status)
      }
      
      ////> If Edit Or Detail Button Clicked, Open Detail Page
      else if (menu.Type == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Type == 'detail') {
        this.openDetail(false)
      }
      ////> If Delete Button Clicked, Execute onDelete()
      else if (menu.Type == 'delete' || menu.Code == 'trash') {
        this.onDelete()
      }
    }
  }
  // Grid Dropdown

  // Checkbox Selection Popup
  ///> Check Conditions To Define Which Buttons Will Be Displayed In Selection Popup
  getSelectionPopup(selectedList: DTOMAHashtag[]) {
    var moreActionDropdown = new Array<MenuDataItem>();

    // Check If Any Item(s) In Selected List Can Send To Verify
    var canApDung = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 3 || s.StatusID == 4);
    ////> Push Send To Verify Button To Array If Condition True 
    if (canApDung != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Áp dụng", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })

    // Check If Any Item(s) In Selected List Need To Be Verified Or Returned
    var canTraLai = selectedList.findIndex(s => s.StatusID == 3)
    ////> Push Return Button To Array If Condition True 
    if (canTraLai != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {//|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      moreActionDropdown.push({
        Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
      })
    }

    // Check If Any Item(s) In Selected List Need To Stop Displaying
    var canStop = selectedList.findIndex(s => s.StatusID == 2)
    ////> Push Stop Displaying Button To Array If Condition True 
    if (canStop != -1 && (this.isToanQuyen || this.isAllowedToVerify))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Ngưng áp dụng", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
      })
    
    // Check If Any Item(s) In Selected List Can Be Deleted
    var canXoa = selectedList.findIndex(s => s.StatusID == 0);
    ////> Push Delete Button To Array If Condition True 
    if ((canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate)))//|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      moreActionDropdown.push({
        Name: "Xóa Hashtag", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })
    
    return moreActionDropdown
  }

  ///> Select Events In Popup
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      // If Select To Change Status Of Hashtag
      if (btnType == "StatusID") {
        value = parseInt(value);
        if (value == 2) 
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 3 || s.StatusID == 4) {
              this.updateStatus(s, value)
            }
          })
        else if (value == 3) // Stop Displaying Button Clicked
        ////> StatusID That Can Stop Displaying
          list.forEach(s => {
            if (s.StatusID == 2) {
              this.updateStatus(s, value)
            }
          })
        else if (value == 4) // Return Button Clicked
        ////> StatusID That Can Be Returned
          list.forEach(s => {
            if (s.StatusID == 3) {
              this.updateStatus(s, value)
            }
          })
    
        // Check if listUpdateHashtag Array Has List Value
        if (Ps_UtilObjectService.hasListValue(this.listUpdateHashtag))
          // If Yes, Execute getUpdateHashtagStatus()
          this.getUpdateHashtagStatus(this.listUpdateHashtag, value)
      }
      else if (btnType == "delete") { // Delete Button Clicked
        // Open Confirm Dialog
        this.onDeleteMany()
        this.listUpdateHashtag = []

        // Only Hashtag With StatusID == 0 Can Be Deleted
        list.forEach(s => {
          if (s.StatusID == 0)
            this.listUpdateHashtag.push(s)
        })
      }
    }
  }
  // Checkbox Selection Popup

  ngOnDestroy(): void {
    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()

    this.GetListHashtag_sst?.unsubscribe()
    this.UpdateHashtag_sst?.unsubscribe()
    this.DeleteHashtag_sst?.unsubscribe()
  }
  //////////////////////////////////Functions//////////////////////////////////

}
