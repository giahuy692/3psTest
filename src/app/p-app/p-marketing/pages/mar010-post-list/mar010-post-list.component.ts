import { DTOMAPost_ObjReturn, DTOMACategory } from './../../shared/dto/DTOMANews.dto';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, distinct, FilterDescriptor } from '@progress/kendo-data-query';

import { from, Subject, Subscription } from 'rxjs';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MarPostAPIService } from '../../shared/services/mar-post-api.service';
import { MarketingService } from '../../shared/services/marketing.service';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { delay, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-mar010-post-list',
  templateUrl: './mar010-post-list.component.html',
  styleUrls: ['./mar010-post-list.component.scss']
})
export class Mar010PostListComponent implements OnInit {
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
  @ViewChild('multiSelect') multiSelect;

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
  listStatusID: any[] = []

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
  filterVNTitle: FilterDescriptor = {
    field: "TitleVN", operator: "contains", value: null
  }
  filterENTitle: FilterDescriptor = {
    field: "TitleEN", operator: "contains", value: null
  }
  filterJPTitle: FilterDescriptor = {
    field: "TitleJP", operator: "contains", value: null
  }
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
  //
  // Subscription
  changePermission_sst: Subscription
  changeModuleData_sst: Subscription

  GetListBlog_sst: Subscription
  UpdateBlog_sst: Subscription
  DeleteBlog_sst: Subscription

  GetListCategory_sst: Subscription
  //
  // Blogs
  Blog = new DTOMAPost_ObjReturn()
  actionPerm: DTOActionPermission[] = []
  listBlog: DTOMAPost_ObjReturn[] = []
  listUpdateBlog: DTOMAPost_ObjReturn[] = []
  //
  // Category
  category: DTOMACategory = new DTOMACategory()
  BlogCategoryList: DTOMACategory[]
  listFilterBlogCategory: DTOMACategory[]

  categoryName: string=''
  categoryImageThumb: string=''

  defaultType = { NewsCategory: 'Chọn phân nhóm', Code: -1, Typdata: null, ImageThumb: '' }
  currentType: DTOMACategory[] = [];
  //
  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public apiService: MarPostAPIService,
    public apiServiceBlog: MarNewsProductAPIService,
  ) { }

  ngOnInit(): void {
    let that = this
    this.loadSearchForm();
    ;
    this.listStatusID = JSON.parse(JSON.stringify(this.service.filterStatusID))

    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.onSortChange.bind(this);

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        that.getData()
      }
    })
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
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
    //
  }
  // Grid
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListBlog()
  }
  onSortChange(e: SortDescriptor[]) {
    this.gridState.sort = e;
    this.GetListBlog();
  }
  
  onMultiSelectFilter() {
    const contains = (value) => (s:DTOMACategory) =>
      s.NewsCategory?.toLowerCase().indexOf(value?.toLowerCase()) !== -1;

    this.multiSelect?.filterChange.asObservable().pipe(
      switchMap((value) =>
        from([this.BlogCategoryList]).pipe(
          tap(() => (this.loading = true)),
          delay(this.layoutService.typingDelay),
          map((data) => data.filter(contains(value)))
        )
      )
    ).subscribe((x) => {
      this.listFilterBlogCategory = x;
      this.loading = false
    });
  }
  //
  getData() {
    this.loadFilter();
    this.GetListBlog()
    this.GetListCategory();
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

    if (this.currentType != null) {
      for (let categoryItem of this.currentType) {
        this.filterCategory.filters.push(
          {
            field: "NewsCategory",
            operator: "eq",
            value: categoryItem.Code
          }
        )
      }
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
    this.currentType = [];
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
    this.GetListBlog()
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
    this.GetListBlog();
  }
  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.value == -1;
  }
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  //
  // Response
  GetListBlog() {
    this.loading = true;
    var ctx = 'Danh sách bài viết'

    this.GetListBlog_sst = this.apiService.GetListBlog(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listBlog = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listBlog, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  getUpdateBlogStatus(items = [this.Blog], StatusID: number) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'
    // this.Blog.StatusID = this.Blog.StatusName = null;

    this.UpdateBlog_sst = this.apiService.UpdateBlogStatus(items, StatusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.listUpdateBlog = []
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListBlog()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  updateStatus(newPro: DTOMAPost_ObjReturn, statusID: number) {
    var ctx = newPro.Code

    if (statusID != 0 && statusID != 4) {
      if (!Ps_UtilObjectService.hasValueString(newPro.TitleVN))
        this.layoutService.onError(`Bài viết "${ctx}" thiếu tiêu đề!`)
      else if (!Ps_UtilObjectService.hasValueString(newPro.SummaryVN))
        this.layoutService.onError(`Bài viết "${ctx}" thiếu miêu tả!`)
      else if (!Ps_UtilObjectService.hasValueString(newPro.ContentVN))
        this.layoutService.onError(`Bài viết "${ctx}" thiếu nội dung!`)
      else if (!Ps_UtilObjectService.hasValueString(newPro.PostDate))
        this.layoutService.onError(`Bài viết "${ctx}" thiếu ngày post!`)
      else if (!Ps_UtilObjectService.hasValueString(newPro.ImageSetting1))
        this.layoutService.onError(`Bài viết "${ctx}" thiếu ảnh đại diện!`)
      // else if (!Ps_UtilObjectService.hasValueString(newPro.ImageSetting2))
      //   this.layoutService.onError(`Bài viết "${ctx}" thiếu ảnh nền 1!`)
      else if (!Ps_UtilObjectService.hasValueString(newPro.ImageSetting3))
        this.layoutService.onError(`Bài viết "${ctx}" thiếu ảnh nền 2!`)
      else
        this.listUpdateBlog.push(newPro)
      // this.getUpdateBlogStatus(newPro, statusID)
    }
    else
      this.listUpdateBlog.push(newPro)
    // this.getUpdateBlogStatus(newPro, statusID)
  }
  DeleteBlog(items: DTOMAPost_ObjReturn[] = [this.Blog]) {
    this.loading = true;
    var ctx = 'Xóa bài viết'

    this.DeleteBlog_sst = this.apiService.DeleteBlog(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        // var ex = this.listBlog.findIndex(f => f.Code == item.Code)

        // if (ex != -1)
        //   this.listBlog.splice(ex, 1)

        this.GetListBlog()
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
  // Category
  GetListCategory() {
    this.loading = true;
    var ctx = 'Danh sách phân nhóm'

    this.GetListCategory_sst = this.apiService.GetListBlogCategory().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.BlogCategoryList = res.ObjectReturn.Data;
        this.listFilterBlogCategory = res.ObjectReturn.Data;
        this.onMultiSelectFilter()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  getUpdateCategory(item, prop: string[]) {
    this.loading = true;
    var ctx = 'Cập nhật phân nhóm'

    this.UpdateBlog_sst = this.apiService.UpdateBlogCategory(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListCategory()
        this.loadFilter()
        this.GetListBlog()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  updateCategory() {
    this.editCategory = false;

    this.category.NewsCategory = this.categoryName
    this.category.ImageThumb = this.categoryImageThumb
    this.filterCategory.filters = []
    this.currentType = []

    this.getUpdateCategory(this.category, ['NewsCategory', 'ImageThumb'])
  }
  //
  // Dialog
  editCategoryDialog(e) {
    this.editCategory = true;
    this.category = e;

    this.categoryName = e.NewsCategory;
    this.categoryImageThumb = e.ImageThumb;
  }
  closeDeleteDialog() {
    this.deleteManyDialogOpened = false
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //
  // Delete item
  onDelete() {
    this.deleteDialogOpened = true
  }
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeleteBlog(this.listUpdateBlog)
  }
  //
  // Detail
  openDetail(isAdd: boolean, isLockAll: boolean = false) {
    this.service.isAdd = isAdd
    this.service.isLockAll = isLockAll

    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (isAdd) {
        var prom = new DTOMAPost_ObjReturn()
        this.service.setCachePostDetail(prom)
      } else
        this.service.setCachePostDetail(this.Blog)
      //group
      var parent = item.ListMenu.find(f => f.Code.includes('news-product')
        || f.Link.includes('news-product'))
      //function
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('post-list')
          || f.Link.includes('post-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('post-detail')
            || f.Link.includes('post-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //
  // Popup
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOMAPost_ObjReturn) {
    this.Blog = { ...dataItem }
    var statusID = this.Blog.StatusID;
    moreActionDropdown = []
    //edit
    if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate) ||
      ((statusID == 0 || statusID == 4) && this.isAllowedToVerify) ||
      statusID == 2 || statusID == 3)
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
    }
    else if ((statusID == 1 || statusID == 3) && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
      )
    }
    else if (statusID == 2 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
    }
    //xoa
    if ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xóa bài viết", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOMAPost_ObjReturn) {
    if (item.Code > 0) {
      this.Blog = { ...item }
      // this.Blog.StatusID = parseInt(menu.Link)

      if (menu.Type == 'StatusID') {
        var status = parseInt(menu.Link)
        this.updateStatus(this.Blog, status)

        if (Ps_UtilObjectService.hasListValue(this.listUpdateBlog))
          this.getUpdateBlogStatus([this.Blog], status)
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.openDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDelete()
      }
    }
  }
  //
  // Selection
  getSelectionPopup(selectedList: DTOMAPost_ObjReturn[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)
    // var canTraLai_canXoa = selectedList.findIndex(s => s.StatusID == 3)

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1", Actived: true, LstChild: []
      })

    var canPheDuyet_canTraLai = selectedList.findIndex(s => s.StatusID == 1 || s.StatusID == 3)

    if (canPheDuyet_canTraLai != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })
    }
    if (canPheDuyet_canTraLai != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {//|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      moreActionDropdown.push({
        Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
      })
    }

    var canStop = selectedList.findIndex(s => s.StatusID == 2)

    if (canStop != -1 && (this.isToanQuyen || this.isAllowedToVerify))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
      })

    if ((canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate)))//|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      moreActionDropdown.push({
        Name: "Xóa bài viết", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        if (value == 1 || value == '1')//Gửi duyệt
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 4) {
              // s.StatusID = 1
              this.updateStatus(s, value)
            }
          })
        else if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              // s.StatusID = 2
              this.updateStatus(s, value)
            }
          })
        else if (value == 4 || value == '4')//Trả về
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              // s.StatusID = 4
              this.updateStatus(s, value)
            }
          })
        else if (value == 3 || value == '3')//Ngưng hiển thị
          list.forEach(s => {
            if (s.StatusID == 2) {
              // s.StatusID = 3
              this.updateStatus(s, value)
            }
          })

        if (Ps_UtilObjectService.hasListValue(this.listUpdateBlog))
          this.getUpdateBlogStatus(this.listUpdateBlog, value)
      }
      else if (btnType == "delete") {//Xóa
        this.onDeleteMany()
        this.listUpdateBlog = []

        list.forEach(s => {
          if (s.StatusID == 0 || s.StatusID == 4)
            this.listUpdateBlog.push(s)
        })
      }
    }
  }
  //
  // Files
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceBlog.GetFolderWithFile(childPath, 8)//CMS
  }
  pickFile(e: DTOCFFile) {
    this.category.ImageThumb = e?.PathFile
    this.categoryImageThumb = this.category.ImageThumb;
    this.layoutService.setFolderDialog(false)
  }
  //
  ngOnDestroy(): void {
    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()

    this.GetListBlog_sst?.unsubscribe()
    this.UpdateBlog_sst?.unsubscribe()
    this.DeleteBlog_sst?.unsubscribe()
  }
}
