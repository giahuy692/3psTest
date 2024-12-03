import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
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
import { MarPolicyAPIService } from '../../shared/services/mar-Policy-api.service'; 
import { MarketingService } from '../../shared/services/marketing.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';

@Component({
  selector: 'app-mar012-policy-list',
  templateUrl: './mar012-policy-list.component.html',
  styleUrls: ['./mar012-policy-list.component.scss']
})
export class Mar012PolicyListComponent implements OnInit {
  @ViewChild('drawer') drawer: MatSidenav;
  // load data
  isLoading: boolean = false;
  justLoaded: boolean = true;

  onSortChangeCallback: Function;
  onPageChangeCallback: Function;

  total = 0
  pageSize = 50
  pageSizes = [this.pageSize]
  //

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
  sortBy: SortDescriptor[] = [{ field: 'CreateTime', dir: 'desc' }];

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

  filterVNTitle: FilterDescriptor = { field: "TitleVN", operator: "contains", value: null }
  filterENTitle: FilterDescriptor = { field: "TitleEN", operator: "contains", value: null }
  filterJPTitle: FilterDescriptor = { field: "TitleJP", operator: "contains", value: null }

  filterVNSummary: FilterDescriptor = { field: "SummaryVN", operator: "contains", value: null }
  filterENSummary: FilterDescriptor = { field: "SummaryEN", operator: "contains", value: null }
  filterJPSummary: FilterDescriptor = { field: "SummaryJP", operator: "contains", value: null }
  //

  // Policy
  Policy: DTOMAPost_ObjReturn = new DTOMAPost_ObjReturn();
  listPolicy: DTOMAPost_ObjReturn[];
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

  getListPolicy_sst: Subscription;
  getListCategory_sst: Subscription;

  updatePolicy_sst: Subscription;
  deletePolicy_sst: Subscription;

  PolicyCategory_sst: Subscription;
  changePermissionAPI: Subscription
  //

  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public apiService: MarPolicyAPIService,
    public apiServicePolicy: MarNewsProductAPIService
  ) { }

  ngOnInit(): void {
    let that = this;
    ;

    this.changePermission_sst = this.menuService.changePermission()
      .subscribe(
        (res: DTOPermission) => {
          if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
            that.justLoaded = false
            that.actionPerm = distinct(res.ActionPermission, "ActionType")

            that.isMaster = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
            that.isCreator = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
            that.isApprover = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

            // that.getListPolicy()
          }
        }
      )

       this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.getListPolicy()
      }
    })
    // Files
    this.pickFileCallback = this.pickFile.bind(this);
    this.GetFolderCallback = this.getFolder.bind(this);
    //

    this.onSortChangeCallback = this.onSortChange.bind(this);

    // Selects
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    //
  }

  // Response
  getListPolicy() {
    this.isLoading = true;
    var ctx = 'Danh sách chính sách';

    this.getListPolicy_sst = this.apiService.GetListPolicy(this.gridState)
      .subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.total = res.ObjectReturn.Total
          this.listPolicy = res.ObjectReturn.Data;

          this.gridView.next({ data: this.listPolicy, total: this.total });
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

        this.isLoading = false;
      }, () => {
        this.isLoading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
      });
  }
  onUpdatePolicy(item: DTOMAPost_ObjReturn, prop?: string[], statusID?: number, justStatusID: boolean = false) {
    this.isLoading = true;
    var ctx = 'Cập nhật'

    if (justStatusID) {
      ctx += ' tình trạng'
      item.StatusID = item.StatusName = null;

      this.updatePolicy_sst = this.apiService.UpdatePolicyStatus(item, statusID)
        .subscribe(res => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(`Đã cập nhật thành công ${ctx}`)
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
            this.getListPolicy()
          } else
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString}`)

          this.isLoading = false;
        }, () => {
          this.isLoading = false;
          this.layoutService.onError('Đã xảy ra lỗi khi cập nhật ' + ctx)
        })
    } else {
      ctx += ' chính sách'

      this.updatePolicy_sst = this.apiService.UpdatePolicy(item, prop)
        .subscribe(res => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(`Đã cập nhật thành công ${ctx}`)
            this.getListPolicy()
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

    this.PolicyCategory_sst = this.apiService.UpdatePolicyCategory(item, prop)
      .subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`Đã cập nhật thành công ${ctx}`)
          this.getListPolicy()
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString}`)

        this.isLoading = false;
      }, () => {
        this.isLoading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi cập nhật ' + ctx)
      })
  }
  //

  // Files Upload
  getFolder(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServicePolicy.GetFolderWithFile(childPath, 1)
  }
  pickFile(e: DTOCFFile) {
    this.layoutService.setFolderDialog(false)
  }
  onUploadFile() {
    this.layoutService.folderDialogOpened = true;
  }
  // 

  // Detail
  openDetail(isCreateNew: boolean, isLockAll: boolean = true) {
    this.service.isAdd = isCreateNew
    this.service.isLockAll = isLockAll

    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (isCreateNew) {
        var prom = new DTOMAPost_ObjReturn()
        this.service.setCachePolicyDetail(prom)
      } else
        this.service.setCachePolicyDetail(this.Policy)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('news-product')
        || f.Link.includes('news-product'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('policy-list')
          || f.Link.includes('policy-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('policy-detail')
            || f.Link.includes('policy-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //

  // Popup
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOMAPost_ObjReturn) {
    this.Policy = { ...dataItem }
    var statusID = this.Policy.StatusID;
    moreActionDropdown = []
    //edit
    if ((statusID != 0 && statusID != 4 && this.isCreator) ||
      ((statusID == 0 || statusID == 4) && this.isApprover) ||
      statusID == 2 || statusID == 3)
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if (statusID == 0 || statusID == 4) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
    }
    else if (statusID == 1 || statusID == 3) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
      )
    }
    else if (statusID == 2) {
      moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
    }
    //xoa
    // if ((statusID == 0 || statusID == 4))
    //   moreActionDropdown.push({ Name: "Xóa chính sách", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOMAPost_ObjReturn) {
    if (item.Code > 0) {
      this.Policy = { ...item }
      // this.Policy.StatusID = parseInt(menu.Link)

      if (menu.Type == 'StatusID') {
        if (this.Policy.StatusID == 1 || this.Policy.StatusID == 2) {
          if (!(Ps_UtilObjectService.hasValueString(this.Policy.ContentVN) || Ps_UtilObjectService.hasValueString(this.Policy.ContentJP) || Ps_UtilObjectService.hasValueString(this.Policy.ContentEN)))
            this.layoutService.onError(`"${this.Policy.TitleVN}" thiếu nội dung!`)
          else
            this.onUpdatePolicy(this.Policy, [,], parseInt(menu.Link), true)
        }
        else
          this.onUpdatePolicy(this.Policy, [,], parseInt(menu.Link), true)
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil') {
        this.openDetail(false, false)
      }
      else if (menu.Code == "eye" || menu.Link == 'detail') {
        this.openDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.deleteDialogOpened = true
      }
    }
  }
  //
  // Selects
  getSelectionPopup(selectedList: DTOMAPost_ObjReturn[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)
    var canTraLai_canXoa = selectedList.findIndex(s => s.StatusID == 3)

    if (canGuiDuyet_canXoa != -1 && (this.isMaster || this.isCreator))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1", Actived: true, LstChild: []
      })

    var canPheDuyet_canTraLai = selectedList.findIndex(s => s.StatusID == 1 || s.StatusID == 3)

    if (canPheDuyet_canTraLai != -1 && (this.isMaster || this.isApprover)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      },
        {
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
    this.getListPolicy();
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
            this.onUpdatePolicy(s, [,], value, true)
          })
        }
      }
    }
  }
  //

  ngOnDestroy(): void {
    this.getListPolicy_sst?.unsubscribe()
    this.deletePolicy_sst?.unsubscribe()
    this.updatePolicy_sst?.unsubscribe()

    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
