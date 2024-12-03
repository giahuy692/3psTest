import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { DTOActionPermission } from './../../../p-layout/dto/DTOActionPermission';
import { DTOMACategory, DTOMAPost_ObjReturn } from './../../shared/dto/DTOMANews.dto';
import { from, Subject, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';

import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MarNewsAPIService } from '../../shared/services/mar-news-api.service';
import { MarketingService } from '../../shared/services/marketing.service';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { MatSidenav } from '@angular/material/sidenav';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { delay, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-mar011-news-list',
  templateUrl: './mar011-news-list.component.html',
  styleUrls: ['./mar011-news-list.component.scss']
})
export class Mar011NewsListComponent implements OnInit {
  // load data
  loading: boolean = false;
  justLoaded: boolean = true;

  @ViewChild('multiSelect') multiSelect;
  onSortChangeCallback: Function;
  onPageChangeCallback: Function;

  total = 0
  pageSize = 25
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
  };
  sortBy: SortDescriptor[] = [{
    field: 'CreateTime', dir: 'desc'
  }];

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //
  listStatusID: any[] = []

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
  //
  // News
  news: DTOMAPost_ObjReturn = new DTOMAPost_ObjReturn();
  listNews: DTOMAPost_ObjReturn[];
  //
  // Category
  editCategory: boolean = false;

  category: DTOMACategory
  listNewsCategory: DTOMACategory[] = [];
  listFilterNewsCategory: DTOMACategory[] = [];
  currentCategory: DTOMACategory[] = [];

  categoryName: string;
  categoryImageThumb: string
  //
  // Remove
  deleteDialogOpened: boolean = false;
  deleteManyDialogOpened: boolean = false;
  listUpdateNews: DTOMAPost_ObjReturn[] = []
  //
  // Selects
  allowActionDropdown = ['detail', 'edit', 'delete']

  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function

  onSelectCallback: Function;
  onSelectedPopupBtnCallback: Function;
  getSelectionPopupCallback: Function;
  //
  // subscription
  changePermission_sst: Subscription;
  changeModuleData_sst: Subscription;

  getListNews_sst: Subscription;
  getListCategory_sst: Subscription;

  updateNews_sst: Subscription;
  deleteNews_sst: Subscription;

  newsCategory_sst: Subscription;
  changePermissionAPI: Subscription
  //
  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,

    public layoutService: LayoutService,
    public apiService: MarNewsAPIService,
    public apiServiceNews: MarNewsProductAPIService
  ) { }

  ngOnInit(): void {
    let that = this;
    this.loadSearchForm();
    ;
    this.listStatusID = JSON.parse(JSON.stringify(this.service.filterStatusID))
    // Filters
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.onSortChange.bind(this);
    //
    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isMaster = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isCreator = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isApprover = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        // that.getData()
      }
    })

    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.getData()
      }
    })
    // Files
    this.pickFileCallback = this.pickFile.bind(this);
    this.GetFolderCallback = this.getFolder.bind(this);
    //
    // Selects
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    //
  }
  getData() {
    this.loadFilter();
    this.getListNews()
    this.getListNewsCategory()
  }
  // Response
  getListNews() {
    this.loading = true;
    var ctx = 'Danh sách bài viết';

    this.getListNews_sst = this.apiService.GetListNews(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.total = res.ObjectReturn.Total
        this.listNews = res.ObjectReturn.Data;

        this.gridView.next({ data: this.listNews, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  getListNewsCategory() {
    this.loading = true;
    var ctx = 'Danh sách phân nhóm';

    this.getListNews_sst = this.apiService.GetListNewsCategory().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listNewsCategory = res.ObjectReturn.Data;
        this.listFilterNewsCategory = res.ObjectReturn.Data;
        this.onMultiSelectFilter()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    }
    );
  }
  onDeleteNews(news: DTOMAPost_ObjReturn[]) {
    this.loading = true;
    var ctx = 'Xóa bài viết';

    this.deleteNews_sst = this.apiService.DeleteNews(news)
      .subscribe(
        res => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(ctx + ' thành công')
            this.deleteDialogOpened = false
            this.deleteManyDialogOpened = false

            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

            news.forEach(item => {
              var ex = this.listNews.indexOf(item)

              if (ex != -1)
                this.listNews.splice(ex, 1)
            })

            this.getListNews()
          } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
          }
          this.loading = false;
        }, () => {
          this.loading = false;
          this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
        }
      );
  }
  //
  // Response Update
  onUpdateNews(items: DTOMAPost_ObjReturn[] = [this.news], prop?: string[], statusID?: number, justStatusID: boolean = false) {
    this.loading = true;
    var ctx = 'Cập nhật'

    if (justStatusID) {
      ctx += ' tình trạng'
      // item.StatusID = item.StatusName = null;

      this.updateNews_sst = this.apiService.UpdateNewsStatus(items, statusID)
        .subscribe(res => {
          if (res.StatusCode == 0) {
            this.layoutService.onSuccess(`${ctx} thành công`)
            this.getListNews()
          } else
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

          this.loading = false;
        }, () => {
          this.loading = false;
          this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
        })
    } else {
      ctx += ' bài viết'

      this.updateNews_sst = this.apiService.UpdateNews(this.news, prop)
        .subscribe(res => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(`${ctx} thành công`)
            this.getListNews()
          } else
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

          this.loading = false;
        }, () => {
          this.loading = false;
          this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
        })
    }
  }
  onUpdateCategory(item, prop: string[]) {
    this.loading = true;
    var ctx = 'Cập nhật phân nhóm';

    this.newsCategory_sst = this.apiService.UpdateNewsCategory(item, prop)
      .subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)
          this.getListNewsCategory()
          this.loadFilter()
          this.getListNews()
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

        this.loading = false;
      }, () => {
        this.loading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
      })
  }
  //
  // Load data
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.getListNews()
  }
  onSortChange(e: SortDescriptor[]) {
    this.gridState.sort = e;
    this.getListNews();
  }

  onMultiSelectFilter() {
    const contains = (value) => (s: DTOMACategory) =>
      s.NewsCategory?.toLowerCase().indexOf(value?.toLowerCase()) !== -1;

    this.multiSelect?.filterChange.asObservable().pipe(
      switchMap((value) =>
        from([this.listNewsCategory]).pipe(
          tap(() => (this.loading = true)),
          delay(this.layoutService.typingDelay),
          map((data) => data.filter(contains(value)))
        )
      )
    ).subscribe((x) => {
      this.listFilterNewsCategory = x;
      this.loading = false
    });
  }
  //
  // Filters, Search Form
  loadFilter() {
    this.pageSizes = [...this.service.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.sort = this.sortBy

    this.gridState.filter.filters = []

    // StatusID
    this.filterStatusID.filters = []

    for (let statusItem of this.listStatusID) {
      if (statusItem.isChecked && statusItem.id == 0) {
        this.filterStatusID.filters.push({
          field: "StatusID",
          operator: "eq",
          value: 4
        })
      }

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
    //
    // Dropdown
    this.filterCategory.filters = [];

    if (this.currentCategory != null) {
      for (let categoryItem of this.currentCategory) {
        this.filterCategory.filters.push({
          field: "NewsCategory",
          operator: "eq",
          value: categoryItem.Code
        })
      }
    }

    if (this.filterCategory.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterCategory)
    }
    //
    //search box
    this.filterSearchBox.filters = []

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
    //
  }
  resetFilter() {
    this.currentCategory = [];
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
    this.getListNews()
  }
  //
  // Files Upload
  getFolder(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNews.GetFolderWithFile(childPath, 8)//CMS
  }
  pickFile(e: DTOCFFile) {
    this.category.ImageThumb = e?.PathFile
    this.categoryImageThumb = this.category.ImageThumb;
    this.layoutService.setFolderDialog(false)
  }
  onUploadFile() {
    this.layoutService.folderDialogOpened = true;
  }
  // Button
  updateCategory() {
    this.editCategory = false;
    this.category.ImageThumb = this.categoryImageThumb;
    this.category.NewsCategory = this.categoryName;

    this.filterCategory.filters = []
    this.currentCategory = []
    this.onUpdateCategory(this.category, ['ImageThumb', 'NewsCategory'])
  }
  selectedBtnChange(e?: boolean, index?: number) {
    if (e != null || index != null)
      this.listStatusID[index].isChecked = e;

    this.loadFilter();
    this.getListNews();
  }
  //
  // Detail
  openDetail(isCreateNew: boolean, isLockMode: boolean = false) {
    this.service.isAdd = isCreateNew
    this.service.isLockAll = isLockMode

    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (isCreateNew) {
        var prom = new DTOMAPost_ObjReturn()
        prom.Code = 0
        this.service.setCacheNewsDetail(prom)
      } else
        this.service.setCacheNewsDetail(this.news)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('news-product')
        || f.Link.includes('news-product'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('news-list')
          || f.Link.includes('news-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('news-detail')
            || f.Link.includes('news-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //
  // Dialog
  editCategoryDialog(e) {
    this.editCategory = true;
    this.category = e;

    this.categoryName = e.NewsCategory;
    this.categoryImageThumb = e.ImageThumb;
  }
  //
  // Popup
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOMAPost_ObjReturn) {
    this.news = { ...dataItem }
    var statusID = this.news.StatusID;
    moreActionDropdown = []
    //edit
    if ((statusID != 0 && statusID != 4 && this.isCreator) ||
      ((statusID == 0 || statusID == 4) && this.isApprover) ||
      statusID == 2 || statusID == 3)
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if ((statusID == 0 || statusID == 4) && (this.isMaster || this.isCreator)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
    }
    else if ((statusID == 1 || statusID == 3) && (this.isMaster || this.isApprover)) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
      )
    }
    else if (statusID == 2 && (this.isMaster || this.isApprover)) {
      moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
    }
    //xoa
    if ((statusID == 0 || statusID == 4) && (this.isMaster || this.isCreator))
      moreActionDropdown.push({ Name: "Xóa bài viết", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOMAPost_ObjReturn) {
    if (item.Code > 0) {
      this.news = { ...item }
      // this.news.StatusID = parseInt(menu.Link)

      if (menu.Type == 'StatusID') {
        var status = parseInt(menu.Link)
        this.updateStatus(this.news, status)

        if (Ps_UtilObjectService.hasListValue(this.listUpdateNews))
          this.onUpdateNews([this.news], [], status, true)
      }
      else if (menu.Code == "eye" || menu.Link == 'detail' || menu.Link == 'edit' || menu.Code == 'pencil') {
        this.openDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.listUpdateNews.push(this.news);
        this.deleteDialogOpened = true
      }
    }
  }
  getSelectionPopup(selectedList: DTOMAPost_ObjReturn[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)
    // var canTraLai_canXoa = selectedList.findIndex(s => s.StatusID == 3)

    if (canGuiDuyet_canXoa != -1 && (this.isMaster || this.isCreator))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1", Actived: true, LstChild: []
      })

    var canPheDuyet_canTraLai = selectedList.findIndex(s => s.StatusID == 1 || s.StatusID == 3)

    if (canPheDuyet_canTraLai != -1 && (this.isMaster || this.isApprover)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })
    }
    if (canPheDuyet_canTraLai != -1 && (this.isMaster || this.isApprover)) {//|| canTraLai_canXoa != -1 && (this.isMaster || this.isApprover)
      moreActionDropdown.push({
        Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
      })
    }

    var canStop = selectedList.findIndex(s => s.StatusID == 2)

    if (canStop != -1 && (this.isMaster || this.isApprover))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
      })

    if ((canGuiDuyet_canXoa != -1 && (this.isMaster || this.isCreator)))//|| canTraLai_canXoa != -1 && (this.isMaster || this.isCreator)
      moreActionDropdown.push({
        Name: "Xóa bài viết", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  //
  // Selects
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        if (value == 1 || value == '1')//Gửi duyệt
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 4) {
              // s.StatusID = 1
              // this.onUpdateNews(s, ...[,], s.StatusID, true)
              this.updateStatus(s, value)
            }
          })
        else if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              // s.StatusID = 2
              // this.onUpdateNews(s, ...[,], s.StatusID, true)
              this.updateStatus(s, value)
            }
          })
        else if (value == 4 || value == '4')//Trả về
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 2 || s.StatusID == 3) {
              // s.StatusID = 4
              // this.onUpdateNews(s, ...[,], s.StatusID, true)
              this.updateStatus(s, value)
            }
          })
        else if (value == 3 || value == '3')//Ngưng hiển thị
          list.forEach(s => {
            if (s.StatusID == 2) {
              // s.StatusID = 3
              // this.onUpdateNews(s, ...[,], s.StatusID, true)
              this.updateStatus(s, value)
            }
          })

        if (Ps_UtilObjectService.hasListValue(this.listUpdateNews))
          this.onUpdateNews(this.listUpdateNews, [], value, true)
      }
      else if (btnType == "delete") {//Xóa
        this.deleteManyDialogOpened = true
        this.listUpdateNews = []

        list.forEach(s => {
          if (s.StatusID == 0 || s.StatusID == 4)
            this.listUpdateNews.push(s)
        })
      }
    }
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
        this.listUpdateNews.push(newPro)
    }
    else
      this.listUpdateNews.push(newPro)
  }
  //
  ngOnDestroy(): void {
    this.getListNews_sst?.unsubscribe()
    this.deleteNews_sst?.unsubscribe()
    this.updateNews_sst?.unsubscribe()

    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
