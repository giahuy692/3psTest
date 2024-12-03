import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';

import { Subject, Subscription } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOMAPost_ObjReturn } from '../../shared/dto/DTOMANews.dto';
import { MarIntroduceAPIService } from '../../shared/services/mar-introduce-api.service';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';

@Component({
  selector: 'app-mar013-introduce-list',
  templateUrl: './mar013-introduce-list.component.html',
  styleUrls: ['./mar013-introduce-list.component.scss']
})
export class Mar013IntroduceListComponent implements OnInit {
  @ViewChild('drawer') drawer: MatSidenav;
  // load data
  isLoading: boolean = false;
  justLoaded: boolean = true;

  pageSize = 50
  pageSizes = [this.pageSize]
  //
  listStatusID: any[] = []

  // Permission
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;

  actionPerm: DTOActionPermission[]
  //

  // Files
  pickFileCallback: Function;
  GetFolderCallback: Function;
  //

  // Filters, Search Form, Sort
  isFilterActive: boolean = true;

  searchForm: UntypedFormGroup;
  gridView = new Subject<any>();

  gridState: State = {
    take: this.pageSize,
    filter: {
      filters: [], logic: 'and'
    }
  }
  sortBy: SortDescriptor[] = [{ field: 'Code', dir: 'asc' }];

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  filterStatusID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterCategory: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: "contains",
  };

  filterSearchBox: CompositeFilterDescriptor = { logic: "or", filters: [] }
  //
  filterCreateBy: FilterDescriptor = {
    field: "CreateBy", operator: "contains", value: null
  }
  //
  filterVNTitle: FilterDescriptor = { field: "TitleVN", operator: "contains", value: null }
  filterENTitle: FilterDescriptor = { field: "TitleEN", operator: "contains", value: null }
  filterJPTitle: FilterDescriptor = { field: "TitleJP", operator: "contains", value: null }
  //
  filterSummaryVN: FilterDescriptor = {
    field: "SummaryVN", operator: "contains", value: null
  }
  filterSummaryEN: FilterDescriptor = {
    field: "SummaryEN", operator: "contains", value: null
  }
  filterSummaryJP: FilterDescriptor = {
    field: "SummaryJP", operator: "contains", value: null
  }

  // Introduce
  Introduce: DTOMAPost_ObjReturn = new DTOMAPost_ObjReturn();
  listIntroduce: DTOMAPost_ObjReturn[];
  //

  // Remove
  deleteDialogOpened: boolean = false;
  deleteManyDialogOpened: boolean = false;

  deleteList: DTOMAPost_ObjReturn[] = []
  //

  // Selects
  allowActionDropdown = ['delete']

  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function

  onSelectCallback: Function;
  onSelectedPopupBtnCallback: Function;
  getSelectionPopupCallback: Function;
  //

  // subscription
  changePermission_sst: Subscription;
  changeModuleData_sst: Subscription;

  getListIntroduce_sst: Subscription;
  getListCategory_sst: Subscription;

  updateIntroduce_sst: Subscription;
  deleteIntroduce_sst: Subscription;

  IntroduceCategory_sst: Subscription;
  changePermissionAPI: Subscription
  //

  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,

    public layoutService: LayoutService,
    public apiService: MarIntroduceAPIService,
    public apiServiceIntroduce: MarNewsProductAPIService
  ) { }

  ngOnInit(): void {
    let that = this;
    this.loadSearchForm();
    ;
    this.listStatusID = JSON.parse(JSON.stringify(this.service.filterStatusID))

    this.changePermission_sst = this.menuService.changePermission()
      .subscribe(
        (res: DTOPermission) => {
          if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
            that.justLoaded = false
            that.actionPerm = distinct(res.ActionPermission, "ActionType")

            that.isMaster = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
            that.isCreator = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
            that.isApprover = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

            // that.loadFilter()
            // that.getListIntroduce()
          }
        }
      )

    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.loadFilter()
        that.getListIntroduce()
      }
    })
    // Files
    this.pickFileCallback = this.pickFile.bind(this);
    this.GetFolderCallback = this.getFolder.bind(this);
    //

    // Selects, Dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    //
  }

  // Response Get
  getListIntroduce(gridState = this.gridState) {
    this.isLoading = true;
    var ctx = 'Danh sách phần giới thiệu';

    this.getListIntroduce_sst = this.apiService.GetListIntroduce(gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listIntroduce = res.ObjectReturn.Data;

        this.gridView.next({ data: this.listIntroduce, total: null });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  //

  // Response Update
  onUpdateIntroduce(item: DTOMAPost_ObjReturn, prop?: string[], statusID?: number, justStatusID: boolean = false) {
    this.isLoading = true;
    var ctx = 'Cập nhật'

    if (justStatusID) {
      ctx += ' tình trạng'
      item.StatusID = item.StatusName = null;

      this.updateIntroduce_sst = this.apiService.UpdateIntroduceStatus(item, statusID).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`Đã cập nhật thành công ${ctx}`)
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
          this.getListIntroduce()
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString}`)

        this.isLoading = false;
      }, () => {
        this.isLoading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi cập nhật ' + ctx)
      })
    }
    else {
      ctx += ' tin tức'

      this.updateIntroduce_sst = this.apiService.UpdateIntroduce(item, prop).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`Đã cập nhật thành công ${ctx}`)
          this.getListIntroduce()
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString}`)

        this.isLoading = false;
      }, () => {
        this.isLoading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi cập nhật ' + ctx)
      })
    }
  }
  onUpdateCategory(item, prop: string[]) {
    this.isLoading = true;
    var ctx = 'Cập nhật phân nhóm';

    this.IntroduceCategory_sst = this.apiService.UpdateIntroduceCategory(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Đã cập nhật thành công ${ctx}`)
        this.getListIntroduce()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString}`)

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi cập nhật ' + ctx)
    })
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

    if (this.filterCategory.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterCategory)
    }
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterCreateBy.value))
      this.filterSearchBox.filters.push(this.filterCreateBy)
    //
    if (Ps_UtilObjectService.hasValueString(this.filterVNTitle.value))
      this.filterSearchBox.filters.push(this.filterVNTitle)

    if (Ps_UtilObjectService.hasValueString(this.filterENTitle.value))
      this.filterSearchBox.filters.push(this.filterENTitle)

    if (Ps_UtilObjectService.hasValueString(this.filterJPTitle.value))
      this.filterSearchBox.filters.push(this.filterJPTitle)
    //
    if (Ps_UtilObjectService.hasValueString(this.filterSummaryVN.value))
      this.filterSearchBox.filters.push(this.filterSummaryVN)

    if (Ps_UtilObjectService.hasValueString(this.filterSummaryEN.value))
      this.filterSearchBox.filters.push(this.filterSummaryEN)

    if (Ps_UtilObjectService.hasValueString(this.filterSummaryJP.value))
      this.filterSearchBox.filters.push(this.filterSummaryJP)
    //
    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
  }
  resetFilter() {
    this.searchForm.get('SearchQuery').setValue(null)
    this.listStatusID.map(s => {
      s.isChecked = s.id == 0
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
      this.filterVNTitle.value = searchQuery
      this.filterENTitle.value = searchQuery
      this.filterJPTitle.value = searchQuery
      this.filterSummaryVN.value = searchQuery
      this.filterSummaryEN.value = searchQuery
      this.filterSummaryJP.value = searchQuery
      this.filterCreateBy.value = searchQuery
    } else {
      this.filterVNTitle.value = null
      this.filterENTitle.value = null
      this.filterJPTitle.value = null
      this.filterSummaryVN.value = null
      this.filterSummaryEN.value = null
      this.filterSummaryJP.value = null
      this.filterCreateBy.value = null
    }
    this.loadFilter();
    this.getListIntroduce()
  }

  selectedBtnChange(e?: boolean, index?: number) {
    if (e != null || index != null)
      this.listStatusID[index].isChecked = e;

    this.loadFilter();
    this.getListIntroduce();
  }
  // Files Upload
  getFolder(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceIntroduce.GetFolderWithFile(childPath, 1)
  }
  pickFile(e: DTOCFFile) {
    this.layoutService.setFolderDialog(false)
  }
  onUploadFile() {
    this.layoutService.folderDialogOpened = true;
  }
  //
  checkValue(str: string) {
    return Ps_UtilObjectService.hasValueString(str)
  }

  // Detail
  openDetail(isCreateNew: boolean) {
    this.service.isAdd = isCreateNew

    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (isCreateNew) {
        var prom = new DTOMAPost_ObjReturn()
        this.service.setCacheIntroduceDetail(prom)
      } else
        this.service.setCacheIntroduceDetail(this.Introduce)
      //Introduce
      var parent = item.ListMenu.find(f => f.Code.includes('mar-intro')
        || f.Link.includes('mar-intro'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('introduce-list')
          || f.Link.includes('introduce-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('introduce-detail')
            || f.Link.includes('introduce-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //

  // Popup
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOMAPost_ObjReturn) {
    this.Introduce = { ...dataItem }
    var statusID = this.Introduce.StatusID;

    var deleteCount = moreActionDropdown.findIndex(s =>
      s.Code == "minus-outline" || s.Code == "redo" || s.Code == 'check-outline') == -1 ? 0 : 1;

    var traLaiDeleteCount = moreActionDropdown.findIndex(s =>
      s.Code == 'undo') == -1 ? 0 : 1;
    //nếu toàn quyền
    // if (this.isToanQuyen) {
    if (statusID == 0 || statusID == 4) {
      moreActionDropdown.splice(2, deleteCount,
        {
          Name: "Gửi duyệt", Code: "redo", Link: "1", Type: 'StatusID',
          Actived: this.isMaster || this.isCreator, LstChild: []
        })
      moreActionDropdown.splice(3, traLaiDeleteCount)
    }
    else if (statusID == 1 || statusID == 3) {
      moreActionDropdown.splice(2, deleteCount,
        {
          Name: "Phê duyệt", Code: "check-outline", Link: "2", Type: 'StatusID',
          Actived: this.isMaster || this.isApprover, LstChild: []
        })

      moreActionDropdown.splice(3, traLaiDeleteCount,
        {
          Name: "Trả về", Code: "undo", Link: "4", Type: 'StatusID',
          Actived: this.isMaster || this.isApprover, LstChild: []
        })
    }
    else if (statusID == 2) {
      moreActionDropdown.splice(2, deleteCount,
        {
          Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Type: 'StatusID',
          Actived: this.isMaster || this.isApprover, LstChild: []
        })
      moreActionDropdown.splice(3, traLaiDeleteCount)
    }

    moreActionDropdown.forEach((s) => {
      if (s.Code == "eye" || s.Link == 'detail') {
        s.Actived = (statusID != 0 && statusID != 4 && this.isCreator)
          || ((statusID == 0 || statusID == 4) && this.isApprover)
      }
      else if (s.Code == 'pencil' || s.Link == 'edit') {
        s.Actived = ((statusID == 1 || statusID == 2) && (this.isMaster || this.isApprover))
          || ((statusID == 0 || statusID == 4) && (this.isMaster || this.isCreator))
      }
    })
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOMAPost_ObjReturn) {
    if (item.Code > 0) {
      this.Introduce = { ...item }
      this.Introduce.StatusID = parseInt(menu.Link)

      if (menu.Type == 'StatusID') {
        // Check Detail
        if ((this.Introduce.StatusID == 1 || this.Introduce.StatusID == 2) && this.Introduce.OrderBy != 2) {
          if (!Ps_UtilObjectService.hasValueString(this.Introduce.ImageSetting1.trim())) {
            this.layoutService.onError(`Bài viết thiếu nội dung!`)
          }
          else
            this.onUpdateIntroduce(this.Introduce, ...[,], parseInt(menu.Link), true)
        }
        else
          this.onUpdateIntroduce(this.Introduce, ...[,], parseInt(menu.Link), true)
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil') {
        this.openDetail(false)
      }
      else if (menu.Code == "eye" || menu.Link == 'detail') {
        this.openDetail(false)
      }
    }
  }
  //
  // Selects
  getSelectionPopup(selectedList: DTOMAPost_ObjReturn[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

    if (canGuiDuyet_canXoa != -1 && (this.isMaster || this.isCreator))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1", Actived: true, LstChild: []
      })

    var canPheDuyet_canTraLai = selectedList.findIndex(s => s.StatusID == 1 || s.StatusID == 3)

    if (canPheDuyet_canTraLai != -1 && (this.isMaster || this.isApprover)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })

      moreActionDropdown.push({
        Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
      })
    }

    var canStop = selectedList.findIndex(s => s.StatusID == 2)

    if (canStop != -1 && (this.isMaster || this.isApprover))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  onSortChange(e: SortDescriptor[]) {
    this.gridState.sort = e;
    this.getListIntroduce();
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

        if (Ps_UtilObjectService.hasListValue(arr)) {
          arr.forEach(s => {
            this.onUpdateIntroduce(s, ...[,], value, true)
          })
        }
      }
    }
  }
  //
  getRes(str) {
    return Ps_UtilObjectService.getImgResHachi(str)
  }

  ngOnDestroy(): void {
    this.getListIntroduce_sst?.unsubscribe()
    this.deleteIntroduce_sst?.unsubscribe()
    this.updateIntroduce_sst?.unsubscribe()

    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
  }
}