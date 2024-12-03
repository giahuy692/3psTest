import { Component, OnInit, ViewChild } from '@angular/core';
import { MarketingService } from '../../shared/services/marketing.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Subject, Subscription } from 'rxjs';
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, State, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DTOMAKeyword } from '../../shared/dto/DTOMAKeyword.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { MatSidenav } from '@angular/material/sidenav';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MarKeywordApiService } from '../../shared/services/mar-keyword-api.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';

@Component({
  selector: 'app-mar018-search-keyword',
  templateUrl: './mar018-search-keyword.component.html',
  styleUrls: ['./mar018-search-keyword.component.scss']
})
export class Mar018SearchKeywordComponent implements OnInit {
  //////////////////////////////////Variables//////////////////////////////////
  // Dialog
  deleteDialogOpened = false;
  deleteManyDialogOpened = false;
  //
  // Drawer
  @ViewChild('formDrawer') drawer: MatSidenav;
  isButtonActive = false;
  isImageShow = true;
  startDate: Date
  finishDate: Date
  //
  // Folder
  //
  // Permission
  isMaster = false;
  isCreator = false;
  isVerifier = false;
  // 
  // Grid
  isAdd = true
  isLockAll = true
  loading = false
  justLoaded = true

  total = 0
  pageSize = 50
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
    field: 'StatusID',
    dir: 'asc'
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
    { id: 2, status: 'Đã duyệt', isChecked: false },
    { id: 3, status: 'Ngưng hiển thị', isChecked: false },
    { id: 4, status: 'Trả về', isChecked: false },
  ];
  listStatusDropdown: DTOStatus[] = []

  filterStatusID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterCategory: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  //
  filterKeywordVN: FilterDescriptor = {
    field: "KeywordVN", operator: "contains", value: null
  }
  filterKeywordEN: FilterDescriptor = {
    field: "KeywordEN", operator: "contains", value: null
  }
  filterKeywordJP: FilterDescriptor = {
    field: "KeywordJP", operator: "contains", value: null
  }
  filterAlias: FilterDescriptor = {
    field: "AliasVN", operator: "contains", value: null
  }
  //
  filterOrderBy: FilterDescriptor = {
    field: "OrderBy", operator: "contains", value: null
  }
  filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: "contains",
  };
  // Update Search Keyword Form
  searchKeywordForm: UntypedFormGroup;
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
  // Folder
  pickFileCallback: Function
  GetFolderCallback: Function
  //
  // Subscription
  changePermission_sst: Subscription
  changeModuleData_sst: Subscription

  GetListKeyword_sst: Subscription

  UpdateKeyword_sst: Subscription
  UpdateKeywordStatus_sst: Subscription

  DeleteKeyword_sst: Subscription
  changePermissionAPI: Subscription
  //
  // DTO
  Keyword = new DTOMAKeyword()
  initialKeyword = new DTOMAKeyword();
  actionPerm: DTOActionPermission[] = []
  listKeyword: DTOMAKeyword[] = []
  listUpdateKeyword: DTOMAKeyword[] = []
  //
  //////////////////////////////////Variables//////////////////////////////////

  //////////////////////////////////Constructor//////////////////////////////////
  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public layoutAPIService: LayoutAPIService,
    public apiService: MarKeywordApiService
  ) { }
  //////////////////////////////////Constructor//////////////////////////////////

  //////////////////////////////////Functions//////////////////////////////////

  ngOnInit(): void {
    let that = this
    this.loadSearchForm();
    this.loadForm();
    

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isMaster = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isCreator = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isVerifier = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

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
    // Folder
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
  }
  // Grid
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListKeyword()
  }
  onSortChange(e: SortDescriptor[]) {
    this.gridState.sort = e;
    this.GetListKeyword();
  }
  //
  getData() {
    this.loadFilter();
    this.GetListKeyword();
    this.GetListStatus()
  }
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
    if (Ps_UtilObjectService.hasValueString(this.filterKeywordVN.value))
      this.filterSearchBox.filters.push(this.filterKeywordVN)
    if (Ps_UtilObjectService.hasValueString(this.filterKeywordJP.value))
      this.filterSearchBox.filters.push(this.filterKeywordJP)
    if (Ps_UtilObjectService.hasValueString(this.filterKeywordEN.value))
      this.filterSearchBox.filters.push(this.filterKeywordEN)
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
      this.filterKeywordVN.value = searchQuery;
      this.filterKeywordEN.value = searchQuery;
      this.filterKeywordJP.value = searchQuery;
    } else {
      this.filterKeywordVN.value = null;
      this.filterKeywordEN.value = null;
      this.filterKeywordJP.value = null;
    }
    this.loadFilter();
    this.GetListKeyword()
  }
  //

  // Edit Keyword
  loadForm() {
    this.searchKeywordForm = new UntypedFormGroup({
      'SearchKeyword': new UntypedFormControl(this.Keyword.KeywordVN, { validators: [Validators.required] }),
      'KeywordAlias': new UntypedFormControl(this.Keyword.AliasVN, { validators: [Validators.required] }),
      'StartDate': new UntypedFormControl(this.Keyword.StartDate != null ? new Date(this.Keyword.StartDate) : null, { validators: [Validators.required] }),
      'FinishDate': new UntypedFormControl(this.Keyword.FinishDate != null ? new Date(this.Keyword.FinishDate) : null),
      'OrderBy': new UntypedFormControl(this.Keyword.OrderBy),
      'StatusID': new UntypedFormControl(this.Keyword.StatusID),
    });
  }
  allControlsHaveValues() {
    const formControls = this.searchKeywordForm.controls;
    return Object.keys(formControls).every(controlName => {
      if (controlName !== 'FinishDate') {
        const control = formControls[controlName];
        return control.value && control.value !== '' && control.value !== undefined;
      }
      return true;
    });
  }
  clearForm() {
    this.Keyword = new DTOMAKeyword();
    this.searchKeywordForm.reset()
    this.loadForm()
  }
  closeForm() {
    this.drawer.close();
    this.clearForm()
  }
  //

  // Buttons
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  selectedBtnChange(e?: boolean, index?: number) {
    if (e != null || index != null)
      this.listStatusID[index].isChecked = e;
    this.loadFilter();
    this.GetListKeyword();
  }
  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    var statusID = itemArgs.dataItem.Keyword.StatusID
    var isAdd = itemArgs.dataItem.Keyword.Code == 0
    var isMaster = itemArgs.dataItem.isMaster
    var isCreator = itemArgs.dataItem.isCreator
    var isVerifier = itemArgs.dataItem.isVerifier

    switch (itemArgs.dataItem.OrderBy) {
      case 0://soạn
        if (statusID > 0)
          return true
        break;
      // case 1://gửi
      //   if ((statusID != 0 && statusID != 4) || (!isCreator && !isMaster))
      //     return true
      //   break;
      case 2://duyệt
        if ((statusID != 0 && statusID != 4 && statusID != 3 && statusID != 2) || (!isVerifier && !isMaster) || isAdd)
          return true
        break;
      case 3://ngưng
        if ((statusID != 2 && statusID != 3) || (!isVerifier && !isMaster) || isAdd)
          return true
        break;
      case 4://trả
        if ((statusID != 3 && statusID != 4) || (!isVerifier && !isMaster) || isAdd)
          return true
        break;
    }

    return false;
  }
  //
  GetListStatus() {
    var sst = this.layoutAPIService.GetListStatus(4).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listStatusDropdown = res.ObjectReturn.filter(s => s.OrderBy != 1)
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Trạng thái: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi kết nối với máy chủ: ${err}`);
    })
  }
  // Get List Keyword
  GetListKeyword() {
    this.loading = true;
    var ctx = 'Danh sách keyword'

    this.GetListKeyword_sst = this.apiService.GetListSearchKeyword(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listKeyword = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listKeyword, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  //

  // Update Keyword
  updateKeyword(prop: any) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " keyword đề nghị";
    this.Keyword.StartDate = this.startDate
    this.Keyword.FinishDate = this.finishDate

    if (this.isAdd) {
      if (this.searchKeywordForm.get("SearchKeyword").value !== '') {
        this.p_UpdateKeyword(ctx)
        this.drawer.close()
        this.loading = false
      }
      else
        this.layoutService.onError('Vui lòng điền tên cho Keyword đề nghị')
    }
    else if (!this.isAdd) {
      if (JSON.stringify(this.Keyword) !== JSON.stringify(this.initialKeyword)) {
        if (Ps_UtilObjectService.hasValueString(prop) || Ps_UtilObjectService.hasValue(prop))
          this.p_UpdateKeyword(ctx);
      }
      else {
        this.loading = false;
      }
    }
    this.loading = false;
  }
  //
  p_UpdateKeyword(ctx) {
    this.UpdateKeyword_sst = this.apiService.UpdateSearchKeyword(this.Keyword).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.GetListKeyword();
        this.drawer.close()
      } else
        this.layoutService.onError(`${ctx} thất bại`)
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError(`${ctx} thất bại`)
    })
  }
  // Get Update Status Of Keyword
  getUpdateSearchKeywordStatus(items = [this.Keyword], StatusID: number) {
    if (this.drawer.opened && !this.allControlsHaveValues()) {
      this.loading = false;
      this.layoutService.onError('Vui lòng cập nhật đầy đủ thông tin keyword đề nghị');
      return;
    }
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'

    this.UpdateKeywordStatus_sst = this.apiService.UpdateStatusSearchKeyword(items, StatusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.listUpdateKeyword = []
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListKeyword()
        this.drawer.close()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  //

  // Update Status
  updateStatus(newPro: DTOMAKeyword, statusID: number) {
    var ctx = newPro.KeywordVN;

    if (statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(newPro.KeywordVN))
        this.layoutService.onError(`Vui lòng điền tên cho keyword đề nghị "${ctx}"`)
      else if (!Ps_UtilObjectService.hasValueString(newPro.AliasVN))
        this.layoutService.onError(`Vui lòng điền link cho keyword đề nghị "${ctx}"`)
      else if (!Ps_UtilObjectService.hasValue(newPro.StartDate))
        this.layoutService.onError(`Vui lòng nhập ngày bắt đầu keyword đề nghị "${ctx}"`)
      else
        this.listUpdateKeyword.push(newPro)
    }
    else
      this.listUpdateKeyword.push(newPro)
  }
  //

  // Delete Keyword
  DeleteKeyword(items: DTOMAKeyword[] = [this.Keyword]) {
    this.loading = true;
    var ctx = 'Xóa keyword'

    this.DeleteKeyword_sst = this.apiService.DeleteSearchKeyword(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListKeyword()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  //

  // Close Delete Dialog
  closeDeleteDialog() {
    this.deleteManyDialogOpened = false
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //

  // Delete Hashtag(s) Event
  onDelete() {
    this.deleteDialogOpened = true
  }
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeleteKeyword(this.listUpdateKeyword)
  }
  //

  // Open Drawer
  onAdd(isAdd: boolean, isLockAll: boolean) {
    this.isAdd = isAdd;
    this.isLockAll = isLockAll;
    if (isAdd) {
      this.Keyword = new DTOMAKeyword();
      this.isButtonActive = false;
    }
    else {
      this.startDate = this.Keyword.StartDate != null ? new Date(this.Keyword.StartDate) : null
      this.finishDate = this.Keyword.FinishDate != null ? new Date(this.Keyword.FinishDate) : null
      this.isButtonActive = true;
    }
    this.initialKeyword = { ...this.Keyword };
    //gán vào item dropdown để truyền qua ItemDisabled Callback
    this.listStatusDropdown.forEach(s => {
      s['Keyword'] = this.initialKeyword
      s['isMaster'] = this.isMaster
      s['isCreator'] = this.isCreator
      s['isVerifier'] = this.isVerifier
    })
    this.drawer.open();
  }
  //
  validImg(str) {
    return Ps_UtilObjectService.hasValueString(Ps_UtilObjectService.removeImgRes(str))
  }
  // Grid Dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOMAKeyword) {
    // Copy data of selected item
    this.Keyword = { ...dataItem };
    var statusID = this.Keyword.StatusID;
    this.Keyword.StartDate = this.Keyword.StartDate != null ? new Date(this.Keyword.StartDate) : null
    this.Keyword.FinishDate = this.Keyword.FinishDate != null ? new Date(this.Keyword.FinishDate) : null
    moreActionDropdown = [];
    // Display Edit & Send To Verify Buttons 
    // Display Buttons For StatusID = 3 Or = 4
    if ((statusID == 3) && (this.isMaster || this.isCreator)) {
      moreActionDropdown.push(
        { Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true },
        { Name: "Áp dụng", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
      )
    }
    // Display Buttons For StatusID = 0
    else if ((statusID == 0 || statusID == 4) && (this.isMaster || this.isVerifier)) {
      moreActionDropdown.push(
        { Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true },
        { Name: "Áp dụng", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
      )
    }
    // Display Buttons For StatusID = 2
    else if (statusID == 2 && (this.isMaster || this.isVerifier)) {
      moreActionDropdown.push(
        { Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true },
        { Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true }
      )
    }
    // Display Delete Button
    if ((statusID == 0) && (this.isMaster || this.isCreator))
      moreActionDropdown.push({ Name: "Xóa keyword", Code: "trash", Type: 'delete', Actived: true })

    // Return Array After Checking Conditions 
    return moreActionDropdown
  }
  //
  // Click Events In Dropdown
  onActionDropdownClick(menu: MenuDataItem, item: DTOMAKeyword) {
    if (item.Code > 0) {
      // Copy data of selected item
      this.Keyword = { ...item }
      // Parse Link Value Of Selected Button To Interger
      // Then Assign To StatusID of this.Keyword
      // Check Type Of Selected Button
      ////> If Send To Verify Clicked

      if (menu.Type == 'StatusID') {
        var status = parseInt(menu.Link) // Value: menu.Link == 2 || menu.Link == 3 || menu.Link == 4;
        this.updateStatus(this.Keyword, status)

        if (Ps_UtilObjectService.hasListValue(this.listUpdateKeyword))
          this.getUpdateSearchKeywordStatus([this.Keyword], status)
      }
      ////> If Edit Or Detail Button Clicked, Open Detail Page
      else if (menu.Type == 'edit' || menu.Code == 'pencil') {
        this.onAdd(false, false);
      }
      else if (menu.Code == "eye" || menu.Type == 'detail') {
        this.onAdd(false, true)
      }
      ////> If Delete Button Clicked, Execute onDelete()
      else if (menu.Type == 'delete' || menu.Code == 'trash') {
        this.onDelete()
      }
    }
  }
  //
  // Checkbox Selection Popup
  getSelectionPopup(selectedList: DTOMAKeyword[]) {
    var moreActionDropdown = new Array<MenuDataItem>();

    // Check If Any Item(s) In Selected List Can Send To Verify
    var canApDung = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 3 || s.StatusID == 4);
    ////> Push Send To Verify Button To Array If Condition True 
    if (canApDung != -1 && (this.isMaster || this.isCreator))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Áp dụng", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })

    // Check If Any Item(s) In Selected List Need To Be Verified Or Returned
    var canTraLai = selectedList.findIndex(s => s.StatusID == 3)
    ////> Push Return Button To Array If Condition True 
    if (canTraLai != -1 && (this.isMaster || this.isVerifier)) {//|| canTraLai_canXoa != -1 && (this.isMaster || this.isVerifier)
      moreActionDropdown.push({
        Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
      })
    }

    // Check If Any Item(s) In Selected List Need To Stop Displaying
    var canStop = selectedList.findIndex(s => s.StatusID == 2)
    ////> Push Stop Displaying Button To Array If Condition True 
    if (canStop != -1 && (this.isMaster || this.isVerifier))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Ngưng áp dụng", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
      })

    // Check If Any Item(s) In Selected List Can Be Deleted
    var canXoa = selectedList.findIndex(s => s.StatusID == 0);
    ////> Push Delete Button To Array If Condition True 
    if ((canXoa != -1 && (this.isMaster || this.isCreator)))//|| canTraLai_canXoa != -1 && (this.isMaster || this.isVerifier)
      moreActionDropdown.push({
        Name: "Xóa Keyword", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  //

  // Select Events In Popup
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      // If Select To Change Status Of Hashtag
      if (btnType == "StatusID") {
        if (value == 2 || value == '2') // Verify Button Clicked
          ////> StatusID That Can Be Verified
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 3 || s.StatusID == 4) {
              this.updateStatus(s, value)
            }
          })
        else if (value == 3 || value == '3') // Stop Displaying Button Clicked
          ////> StatusID That Can Stop Displaying
          list.forEach(s => {
            if (s.StatusID == 2) {
              this.updateStatus(s, value)
            }
          })
        else if (value == 4 || value == '4') // Return Button Clicked
          ////> StatusID That Can Be Returned
          list.forEach(s => {
            if (s.StatusID == 3) {
              this.updateStatus(s, value)
            }
          })

        if (Ps_UtilObjectService.hasListValue(this.listUpdateKeyword))
          this.getUpdateSearchKeywordStatus(this.listUpdateKeyword, value)
      }
      else if (btnType == "delete") { // Delete Button Clicked
        // Open Confirm Dialog
        this.onDeleteMany()
        this.listUpdateKeyword = []

        // Only Hashtag With StatusID == 0 Can Be Deleted
        list.forEach(s => {
          if (s.StatusID == 0)
            this.listUpdateKeyword.push(s)
        })
      }
    }
  }
  //
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  //
  // Folder
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }

  onClearImg() {
    this.Keyword.ImageThumb = "";
  }

  pickFile(e: DTOCFFile, width, height) {
    this.Keyword.ImageThumb = e?.PathFile.replace('~', '')
    this.layoutService.setFolderDialog(false)
  }
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiService.GetFolderWithFile(childPath, 8)
  }
  OnCheckDate(value: any, type: string) {
    if (type === 'StartDate') {
      if (this.finishDate == null) {
        this.Keyword.StartDate = new Date(value);
        this.updateKeyword(this.Keyword.StartDate);
      }
      else if (this.finishDate !== null && (new Date(value).getTime() > new Date(this.Keyword.FinishDate).getTime()))
        this.layoutService.onError('Ngày bắt đầu không hợp lệ')
      else {
        this.Keyword.StartDate = new Date(value);
        this.finishDate = this.Keyword.FinishDate;
        this.updateKeyword(this.Keyword.StartDate);
      }
    }
    else if (type === 'FinishDate') {
      if (new Date(value).getTime() < new Date(this.Keyword.StartDate).getTime() && this.Keyword.StartDate != null)
        this.layoutService.onError('Ngày kết thúc không hợp lệ')
      else
        this.Keyword.FinishDate = new Date(value);
      this.updateKeyword(this.Keyword.FinishDate);
    }
  }
  //
  ngOnDestroy(): void {
    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()

    this.GetListKeyword_sst?.unsubscribe()
    this.UpdateKeyword_sst?.unsubscribe()
    this.DeleteKeyword_sst?.unsubscribe()
    this.UpdateKeywordStatus_sst?.unsubscribe()
  }
}
