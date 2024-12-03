import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, State, distinct } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOMACategory, DTOMAPost_ObjReturn } from 'src/app/p-app/p-marketing/shared/dto/DTOMANews.dto';
import { takeUntil } from 'rxjs/operators';
import { MarNewsAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-news-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { HriSalaryService } from '../../shared/services/hr-salary.service';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { MarPostAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-post-api.service';

@Component({
  selector: 'app-hri020-news-list',
  templateUrl: './hri020-news-list.component.html',
  styleUrls: ['./hri020-news-list.component.scss']
})
export class Hri020NewsListComponent implements OnInit {


  //filter
  isDrafting: boolean = true
  isSent: boolean = true
  isApproval: boolean = false
  isStop: boolean = false

  filterStatus: CompositeFilterDescriptor = { logic: 'or', filters: [] }
  filterIsDrafting: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 0 }
  filterIsSent: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 1 }
  filterIsApproval: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 2 }
  filterIsStop: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 3 }
  filterIsReturn: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 4 }
  filterTypeData: FilterDescriptor = { field: 'TypeData', operator: 'eq', value: 7 };
  // search 
  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  tempSearch: any;

  // grid
  listNews: DTOMAPost_ObjReturn[] = []
  gridView = new Subject<any>();
  isLoading: boolean = false
  pageSize = 25; skip = 0; total = 0
  pageSizes = [this.pageSize]
  sortBy: SortDescriptor = {
    field: 'Code',
    dir: 'desc'
  }
  gridState: State = {
    take: this.pageSize,
    sort: [this.sortBy],
    filter: { filters: [], logic: 'and' },
    skip: this.skip
  }

  allowActionDropdown = []
  //CallBack
  uploadEventHandlerCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onFilterChangeCallback: Function
  //grid select
  getSelectionPopupCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function

  //select grid setting
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  isFilterActive = true


  // more action dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  dataPost: DTOMAPost_ObjReturn = new DTOMAPost_ObjReturn



  //dialog delete
  opened: boolean = false
  listDelete: any[] = []

  //dialog update categories
  editCategory = false;

  //permission 
  isAllPers: boolean = false
  isCanCreate: boolean = false
  isCanApproved: boolean = false
  justLoaded: boolean = true
  dataPerm: DTODataPermission[] = [];
  actionPerm: DTOActionPermission[] = [];

  //update status
  listUpdatePost: DTOMAPost_ObjReturn[] = []



  // Dropdown category
  listCategoryCMS: DTOMACategory[] = []
  curCate: any
  categoryName: string = ''
  filterSettings: DropDownFilterSettings = {
    caseSensitive: true,
    operator: "contains",
  };

  filterCategory: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  };

  //unsubcribe
  Unsubscribe = new Subject<void>
  constructor(
    public menuService: PS_HelperMenuService,
    public apiService: MarNewsAPIService,
    public apiServiceMarPost: MarPostAPIService,
    public layoutService: LayoutService,
    public salaryService: HriSalaryService,
    private changeDetector: ChangeDetectorRef,

  ) { }
  //dùng này để tránh lỗi ng0100
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }
  ngOnInit() {
    let that = this
    //grid dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)

    //grid tool page
    this.onPageChangeCallback = this.onPageChange.bind(this)


    //grid select
    this.onSelectCallback = this.selectItem.bind(this)
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)



    // phân quyền  
    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && that.justLoaded) {
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');
        that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;

        // this.isAllPers = true
        // this.isCanCreate = false
        // this.isCanApproved = false
        that.justLoaded = false;
      }
    });

    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.getData()
			}
		})

  }


  getData() {
    this.onLoadFilter()
    this.APIGetListCMSNews()
    this.APIGetListCMSNewsCategory()
  }

  //#region ======== BREAD CUM
  reloadData() {
    this.onLoadFilter()
    this.APIGetListCMSNews()
  }
  //#endregion


  //#region ======== SEARCH FILTER

  //xử lý search
  onSearch(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (event.filters[0].value === '') {
        this.gridState.skip = 0
        this.onLoadFilter();
        this.APIGetListCMSNews()
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = 0
        this.onLoadFilter();
        this.APIGetListCMSNews()
      }
    }
  }

  //reset search
  onResetFilter() {
    this.isDrafting = true
    this.isSent = true
    this.isApproval = false
    this.isStop = false
    this.gridState.skip = 0
    this.curCate = []
    this.onLoadFilter()
    this.APIGetListCMSNews()
  }


  //filter
  //load filter
  onLoadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.filter.filters = []

    this.filterStatus.filters = []
    this.filterCategory.filters = []
    //status
    if (this.isDrafting) {
      this.filterStatus.filters.push(this.filterIsDrafting)
      this.filterStatus.filters.push(this.filterIsReturn)
    }

    if (this.isSent) {
      this.filterStatus.filters.push(this.filterIsSent)
    }

    if (this.isApproval) {
      this.filterStatus.filters.push(this.filterIsApproval)
    }
    if (this.isStop) {
      this.filterStatus.filters.push(this.filterIsStop)
    }

    if (this.filterStatus.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatus)
    }

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this.gridState.filter.filters.push(this.filterSearchBox);
      }
    }

    // Category
    if (this.curCate != null) {
      for (let cateItem of this.curCate) {
        this.filterCategory.filters.push({
          field: "NewsCategory",
          operator: "eq",
          value: cateItem.Code
        });
      }
    }

    if (this.filterCategory.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterCategory)
    }

    //lọc ra typeData =7 cho chính sách C&B và phân loại chính sách Nhân sự
    this.gridState.filter.filters.push(this.filterTypeData)

  }


  //chọn vào btn filter
  selectedFilter(e: any, type: string) {
    this[type] = e
    this.gridState.skip = 0
    this.onLoadFilter()
    this.APIGetListCMSNews()
  }
  //#endregion


  //#region ======== OPEN DETAIL

  // chuyển vào trang sau và set cache
  onOpenDetail(isAdd: boolean, SelectItem?: any) {
    event.stopPropagation()
    this.menuService.changeModuleData().pipe(takeUntil(this.Unsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code.includes('hriPolicy') || f.Link.includes('hri020-news-list'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('hri020-news-list') || f.Link.includes('hri020-news-list'))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('hri020-news-detail') || f.Link.includes('hri020-news-detail'))
          if (isAdd) {
            var addNewPost = new DTOMAPost_ObjReturn()

            this.salaryService.setCacheNewsDetail(addNewPost)
            localStorage.setItem("HRPolicy", JSON.stringify(addNewPost))
          } else {
            this.salaryService.setCacheNewsDetail(SelectItem)
            localStorage.setItem("HRPolicy", JSON.stringify(SelectItem))
          }
          this.menuService.activeMenu(detail2)
        }
      }
    })
  }

  //#endregion

  //#region ======== GRID
  onPageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.APIGetListCMSNews()
  }
  //#endregion

  //#region ======== DROPDOWN ACTION MORE
  getActionDropdown(ActionsDropdown: MenuDataItem[], dataItem: DTOMAPost_ObjReturn) {
    ActionsDropdown = []
    ActionsDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "Detail", Actived: true })

    if (this.isCanCreate || this.isAllPers) { //toàn quyền và quyền tạo
      if (dataItem.StatusID == 0 || dataItem.StatusID == 4) { //tình trạng đang soạn / trả về
        ActionsDropdown.shift()
        ActionsDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
        ActionsDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
      }

      if (dataItem.StatusID == 0) { //tình trạng đang soạn  
        ActionsDropdown.push({ Name: "Xóa", Code: "trash", Link: "delete", Actived: true })

      }

    }

    if (this.isCanApproved || this.isAllPers) {//có quyền duyệt
      if (dataItem.StatusID == 1) { //tình trạng gửi duyệt
        ActionsDropdown.shift()
        ActionsDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
      }

      if (dataItem.StatusID == 1 || dataItem.StatusID == 3) { //tình trạng gửi duyệt / ngưng
        ActionsDropdown.push(
          { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
          { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
        )
      }

      if (dataItem.StatusID == 2) { //tình trạng đã duyệt
        ActionsDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })

      }

    }

    return ActionsDropdown
  }


  onActionDropdownClick(menu: MenuDataItem, item: DTOMAPost_ObjReturn) {
    this.listDelete = []
    this.dataPost = item
    if (item.Code != 0) {
      if (menu.Name == 'Xóa' || menu.Code == 'trash') {
        this.opened = true;
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Link == 'Detail' || menu.Code == 'eye') {
        this.onOpenDetail(false, item)
      }
      else if (menu.Type == 'StatusID') { //chuyển trạng thái
        let dataUpdate = { ...item }
        let statusID = parseInt(menu.Link)
        this.checkFieldRequire(dataUpdate)

        if (Ps_UtilObjectService.hasListValue(this.listUpdatePost)) {
          this.APIUpdateStatusNew([dataUpdate], statusID)
        }
      }
    }
  }


  //hàm check trường thiếu và đẩy vào mảng update status
  checkFieldRequire(newsPost: DTOMAPost_ObjReturn) {
    this.listUpdatePost = []

    if (!Ps_UtilObjectService.hasValueString(newsPost.TitleVN)) {
      this.layoutService.onWarning(`Vui lòng nhập tiêu đề Tiếng Việt!`)
    }
    else if (!Ps_UtilObjectService.hasValueString(newsPost.NewsCategoryName)) {
      this.layoutService.onWarning(`Vui lòng chọn phân nhóm!`)
    }
    else if (!Ps_UtilObjectService.hasValueString(newsPost.PostDate))
      this.layoutService.onWarning(`Vui lòng chọn thời gian hiển thị!`)
    else {
      this.listUpdatePost.push(newsPost)
    }

  }
  //#endregion


  //#region ======== POPUP SELECTION CHECKBOX
  // hàm select checkbox để khi hiện dialog chuyển trạng thái thì ẩn search/filter đi
  selectItem(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }

  // hàm hiện các button trạng thái cho popup checkbox
  getSelectionPopup(arrItem: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    //tìm item có tình trạng ...
    var canSent = arrItem.findIndex(s => (s.StatusID == 0 || s.StatusID == 4) && s.MetaTitle) //đang soạn/trả về có thể gửi duyệt
    var canAppro_Return = arrItem.findIndex(s => s.StatusID == 1 || s.StatusID == 3) //gửi duyệt có thể duyệt/trả về
    var canStop = arrItem.findIndex(s => s.StatusID == 2) // duyệt có thể ngưng
    var canDel = arrItem.findIndex(s => s.StatusID == 0) // đang soạn có thể xóa


    if (canSent != -1 && (this.isAllPers || this.isCanCreate)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true }
      )
    }

    if (canAppro_Return != -1 && (this.isAllPers || this.isCanApproved)) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
      )
    }

    if (canStop != -1 && (this.isAllPers || this.isCanApproved)) {
      moreActionDropdown.push(
        { Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true }
      )
    }

    if (canDel != -1 && (this.isAllPers || this.isCanCreate)) {
      moreActionDropdown.push(
        { Name: "Xóa", Code: "trash", Type: 'Delete', Link: "delete", Actived: true }
      )
    }
    return moreActionDropdown
  }

  //hàm xử lý action của các button trong popup checkbox
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    // console.log("list: ", list);

    let arr = []
    let StatusID: number = -1
    if (list.length > 0) {
      if (btnType == "StatusID") {
        if (value == 1 || value == '1') {//Gửi duyệt
          arr = []
          list.forEach(s => {
            if ((s.StatusID == 0 || s.StatusID == 4) && s.MetaTitle) {
              arr.push(s);
            }
          })
          StatusID = 1
        }
        else if (value == 2 || value == '2') {//Phê duyệt
          arr = []
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              arr.push(s);
            }
          })
          StatusID = 2
        }
        else if (value == 4 || value == '4') {//Trả về
          arr = []
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              arr.push(s);
            }
          })
          StatusID = 4
        }
        else if (value == 3 || value == '3') {//Ngưng hiển thị
          arr = []
          list.forEach(s => {
            if (s.StatusID == 2) {
              arr.push(s);
            }
          })
          StatusID = 3
        }

        if (Ps_UtilObjectService.hasListValue(arr)) {
          this.APIUpdateStatusNew(arr, StatusID)
        }
      }

      // else
      if (btnType == "Delete") {//Xóa
        this.opened = true
        this.listDelete = []

        list.forEach(s => {
          if (s.StatusID == 0)
            this.listDelete.push(s)
        })
      }
    }
  }

  //#endregion

  //#region ======== DIALOG DELETE
  onCloseDialog(): void {
    this.opened = false;
  }

  onDeleteDialog(status: string): void {
    if (status == 'yes') {

      if (Ps_UtilObjectService.hasListValue(this.listDelete)) { //xóa từ popup checkbox
        this.APIDeleteNew(this.listDelete)
      } else { // xóa từ dropdown action
        this.APIDeleteNew([this.dataPost])
      }
      this.opened = false;
    } else {
      this.opened = false;
    }
  }
  //#endregion

  //#region ======== DIALOG UPDATE CATEGORY

  category: DTOMACategory = new DTOMACategory()
  updateCategory() {
    this.editCategory = false;
    this.category.NewsCategory = this.categoryName
    this.filterCategory.filters = []
    this.curCate = []
    this.APIUpdateCategory(this.category, ['NewsCategory'])
  }
  //#endregion

  //#region ======== DROPDOWN CATEGORY
  selectedBtnChange(e?: boolean, index?: number) {
    this.onLoadFilter();
    this.APIGetListCMSNews();
  }

  editCategoryDialog(e) {
    this.editCategory = true;
    this.categoryName = e.NewsCategory;
    this.category = e
  }

  //#endregion


  //#region ======== API
  // get list new 
  APIGetListCMSNews() {
    this.isLoading = true;
    const ctx = 'danh sách bài viết chính sách'

    this.apiService.GetListCMSNews(this.gridState).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.total = res.ObjectReturn.Total
        this.listNews = res.ObjectReturn.Data;

        this.gridView.next({ data: this.listNews, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.isLoading = false;
    }, (erros) => {
      this.isLoading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${erros} `)

    });
  }

  // Update category
  APIUpdateCategory(item, prop: string[]) {

    var ctx = 'Cập nhật phân nhóm'
    this.apiServiceMarPost.UpdateBlogCategory(item, prop).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.APIGetListCMSNewsCategory()
        this.onLoadFilter()
        this.APIGetListCMSNews()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    });
  }

  // Update policy news
  APIUpdateStatusNew(dataUpdate: DTOMAPost_ObjReturn[], StatusID: number) {
    const ctx = 'bài viết chính sách'
    this.isLoading = true;
    this.apiService.UpdateNewsStatus(dataUpdate, StatusID).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        this.isLoading = false;

        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`Cập nhật trạng thái ${ctx} thành công`)
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái ${ctx}: ${res.ErrorString}`)
        }
        this.APIGetListCMSNews()
      },
      (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái ${ctx}: ${error}`)
        this.isLoading = true;
        this.APIGetListCMSNews()
      }
    )
  }

  //Delete policy
  APIDeleteNew(dataDelete: DTOMAPost_ObjReturn[]) {
    const ctx = 'bài viết chính sách'
    this.isLoading = true;
    this.apiService.DeleteNews(dataDelete).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        this.isLoading = false;
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`Xóa ${ctx} thành công`)
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${res.ErrorString}`)
        }
        this.APIGetListCMSNews()
      },
      (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${error}`)
        this.isLoading = true;
        this.APIGetListCMSNews()
      }
    )
  }


  //Get list Categories CMS
  APIGetListCMSNewsCategory() {

    var ctx = 'Danh sách phân nhóm'

    this.apiService.GetListCMSNewsCategory(7).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCategoryCMS = res.ObjectReturn;
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${error}`)
    });
  }

  //#endregion


  //destroy
  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }

}
