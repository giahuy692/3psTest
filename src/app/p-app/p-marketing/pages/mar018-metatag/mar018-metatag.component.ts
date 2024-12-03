import { Component, OnInit, ViewChild } from '@angular/core';
import { MarketingService } from 'src/app/p-app/p-marketing/shared/services/marketing.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { ConfigAPIService } from 'src/app/p-app/p-config/shared/services/config-api.service';
import { MarPostAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-post-api.service';
import { State, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { from, Subject, Subscription } from 'rxjs';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent } from '@progress/kendo-angular-treelist';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MarHashtagAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-hashtag-api.service';
import { DTODetailConfProduct } from 'src/app/p-app/p-config/shared/dto/DTOConfProduct';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOMAPost_ObjReturn } from 'src/app/p-app/p-marketing/shared/dto/DTOMANews.dto';
import { MarMetatagApiService } from '../../shared/services/mar-metatag-api.service';
import { DTOMetaTag, DTOMetaTagCategory } from '../../shared/dto/DTOMetaTag.dto';
import { MatSidenav } from '@angular/material/sidenav';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { MarNewsAPIService } from '../../shared/services/mar-news-api.service';

@Component({
  selector: 'app-mar018-metatag',
  templateUrl: './mar018-metatag.component.html',
  styleUrls: ['./mar018-metatag.component.scss']
})
export class Mar018MetatagComponent implements OnInit {
  //bool
  isAdd: boolean = true
  loading: boolean = false
  justLoaded: boolean = true

  isLockAll: boolean = false
  isFilterActive: boolean = true;
  excelValid: boolean = true

  deleteDialogOpened = false;
  deleteManyDialogOpened = false;
  //drawer
  @ViewChild('formDrawer') drawer: MatSidenav;

  //Search TextboxDrawer
  searchTerm: string = ''

  filterBarcode: FilterDescriptor = { field: "Barcode", operator: "contains", value: null }
  filterPoscode: FilterDescriptor = { field: "Poscode", operator: "contains", value: null }
  filterProductName: FilterDescriptor = { field: "ProductName", operator: "contains", value: null }

  filterTitleVN: FilterDescriptor = { field: "TitleVN", operator: "contains", value: null }

  filterCategoryName: FilterDescriptor = { field: "CategoryName", operator: "contains", value: null }
  filterPageName: FilterDescriptor = { field: "PageName", operator: "contains", value: null }
  filterAlias: FilterDescriptor = { field: "Alias", operator: "contains", value: null }

  //header 1
  listStatus: any[] = [{
    StatusName: 'Đang soạn thảo',
    Checked: true,
    Filter: { logic: 'or', filters: [{ field: "MetaStatus", operator: "eq", value: 0 }, { field: "MetaStatus", operator: "eq", value: 4 }] }
  }, {
    StatusName: 'Đã duyệt',
    Checked: false,
    Filter: { field: "MetaStatus", operator: "eq", value: 2 }
  }, {
    StatusName: 'Ngưng hiển thị',
    Checked: false,
    Filter: { field: "MetaStatus", operator: "eq", value: 3 }
  }]

  filterMetaStatus: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  //header 2
  defaultMetaCategory: DTOMetaTagCategory = { Code: 1, Name: 'Phân nhóm sản phẩm' }
  listMetaCategory: DTOMetaTagCategory[] = [this.defaultMetaCategory];
  listFilterMetaCategory: DTOMetaTagCategory[] = [this.defaultMetaCategory];
  selectedMetaCategory: DTOMetaTagCategory[] = [this.defaultMetaCategory];

  filterCategoryID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterPhanNhomSP: FilterDescriptor = {
    field: "Category", operator: "eq", value: 1
  }

  @ViewChild('multiSelect') multiSelect;
  //permision
  isMaster = false
  isCreator = false
  isVerifier = false
  isViewOnly = false
  actionPerm: DTOActionPermission[] = []

  //DTO Product and post
  listProduct: DTODetailConfProduct[] = [];
  listPost: DTOMAPost_ObjReturn[] = [];
  listMetaTag: DTOMetaTag[] = [];

  //subscription
  subArr: Subscription[] = []
  // Popup grid
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  // Dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //function grid
  onPageChangeCallback: Function
  //file
  pickFileCallback: Function;
  getFolderCallback: Function;
  uploadEventHandlerCallback: Function

  //Dropdown Menu Cho metatag
  dropDownMenu: Array<{ icon: string, name: string, id: number, item: any, list: any[] }> = [
    { icon: 'icon-product.svg', name: 'Sản phẩm', id: 1, item: new DTODetailConfProduct(), list: [] },
    { icon: 'icon-post.svg', name: 'Bài viết', id: 2, item: new DTOMAPost_ObjReturn(), list: [] },
    { icon: 'icon-config.svg', name: 'Cấu hình', id: 3, item: new DTOMetaTag(), list: [] },
  ]
  defaultMenu: { icon: string, name: string, id: number, item: any, list: any[] } = { ...this.dropDownMenu[0] };
  selectedMenu: { icon: string, name: string, id: number, item: any, list: any[] } = { ...this.dropDownMenu[0] };
  //Grid footer
  total = 0
  pageSize = 25
  pageSizes = [this.pageSize]
  //GridView
  gridViewSP = new Subject<any>();
  gridViewBV = new Subject<any>();
  gridViewCH = new Subject<any>();

  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  //select
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  constructor(
    public serviceMar: MarketingService,
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public apiService: MarHashtagAPIService,
    public apiProductService: ConfigAPIService,
    public apiPostService: MarNewsAPIService,
    public apiMetatagService: MarMetatagApiService) { }

  ngOnInit(): void {
    let sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false
        this.actionPerm = distinct(res.ActionPermission, "ActionType");

        this.isMaster = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        this.isCreator = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        this.isVerifier = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        this.isViewOnly = !this.isMaster && !this.isCreator && !this.isVerifier

        // this.loadFilter();
        // this.getData();
      }
    })
    let changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.loadFilter();
        this.getData();
      }
    })
    this.subArr.push(sst, changePermissionAPI)
    this.onPageChangeCallback = this.pageChange.bind(this)
    //action dropdown    
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    //selection popup
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)

    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
  }

  onMultiSelectFilter() {
    const contains = (value) => (s: DTOMetaTagCategory) =>
      s.Name?.toLowerCase().indexOf(value?.toLowerCase()) !== -1;

    this.multiSelect?.filterChange.asObservable().pipe(
      switchMap((value) =>
        from([this.listMetaCategory]).pipe(
          tap(() => (this.loading = true)),
          delay(this.layoutService.typingDelay),
          map((data) => data.filter(contains(value)))
        )
      )
    ).subscribe((x) => {
      this.listFilterMetaCategory = x;
      this.loading = false
    });
  }

  onDropdownlistClick(e) {
    this.selectedMenu = e
    this.loadFilter();
    this.getData();
  }

  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];

    if (this.selectedMenu.id != 3)
      this.gridState.filter.filters.push({ field: "MetaStatus", operator: "neq", value: null })

    this.filterMetaStatus.filters = []
    this.filterCategoryID.filters = [];
    let filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] }
    // Áp dụng bộ lọc từ các button
    this.listStatus.forEach(s => {
      if (s.Checked)
        this.filterMetaStatus.filters.push(s.Filter)
    })
    // Áp dụng bộ lọc từ select nếu nó được kích hoạt
    if (this.selectedMenu.id == 3) {
      this.selectedMetaCategory.forEach(s => {
        this.filterCategoryID.filters.push({ field: 'Category', operator: 'eq', value: s.Code })
      })
    }
    //lọc tìm kiếm
    if (this.selectedMenu.id == 1) {
      if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
        filterSearch.filters.push(this.filterBarcode)

      if (Ps_UtilObjectService.hasValueString(this.filterPoscode.value))
        filterSearch.filters.push(this.filterPoscode)

      if (Ps_UtilObjectService.hasValueString(this.filterProductName.value))
        filterSearch.filters.push(this.filterProductName)
    }
    //
    if (this.selectedMenu.id == 2)
      if (Ps_UtilObjectService.hasValueString(this.filterTitleVN.value))
        filterSearch.filters.push(this.filterTitleVN)
    //
    if (this.selectedMenu.id == 3) {
      if (Ps_UtilObjectService.hasValueString(this.filterAlias.value))
        filterSearch.filters.push(this.filterAlias)

      if (Ps_UtilObjectService.hasValueString(this.filterPageName.value))
        filterSearch.filters.push(this.filterPageName)

      if (Ps_UtilObjectService.hasValueString(this.filterCategoryName.value))
        filterSearch.filters.push(this.filterCategoryName)

      if (this.filterCategoryID.filters.length > 0) {
        this.gridState.filter.filters.push(this.filterCategoryID);
      }
    }
    // Thêm bộ lọc vào gridState.filter.filters
    if (this.filterMetaStatus.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterMetaStatus);
    }


    if (filterSearch.filters.length > 0) {
      this.gridState.filter.filters.push(filterSearch);
    }
  }

  getData() {
    if (this.selectedMenu.id == 1)
      this.getListProduct();
    else if (this.selectedMenu.id == 2)
      this.GetListCMSNews();
    else {
      this.getListMetaTag();

      if (!Ps_UtilObjectService.hasListValue(this.listMetaCategory) || this.listMetaCategory.length <= 1)
        this.getListMetaTagCategory()
    }
  }

  resetFilter() {
    //header1
    this.listStatus[0].Checked = true
    this.listStatus[1].Checked = false
    this.listStatus[2].Checked = false
    this.selectedMetaCategory = [this.defaultMetaCategory];
    this.Search(null)
  }

  selectedBtnChange(e, statusIndex) {
    this.listStatus[statusIndex].Checked = e
    this.loadFilter();
    this.getData()
  }

  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.getData()
  }

  Search(event: any) {
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.filterBarcode.value = event;
      this.filterPoscode.value = event;
      this.filterProductName.value = event;
      this.filterTitleVN.value = event;
      this.filterPageName.value = event;
      this.filterCategoryName.value = event;
      this.filterAlias.value = event;
    } else {
      this.filterBarcode.value = null;
      this.filterPoscode.value = null;
      this.filterProductName.value = null;
      this.filterTitleVN.value = null;
      this.filterPageName.value = null;
      this.filterCategoryName.value = null;
      this.filterAlias.value = null;
    }
    this.loadFilter()
    this.getData()
  }
  //drawer
  SearchDrawer(e?) {
    if (Ps_UtilObjectService.hasValueString(this.searchTerm)) {
      if (this.selectedMenu.id == 1) {
        this.filterBarcode.value = this.filterPoscode.value = this.filterProductName.value = this.searchTerm

        let gridState: State = {
          take: 1,
          filter: {
            logic: 'and', filters: [
              { field: "MetaStatus", operator: "eq", value: null },
              { logic: 'or', filters: [this.filterBarcode, this.filterPoscode, this.filterProductName] }
            ]
          }
        }
        this.getListProduct(gridState)
      }

      else if (this.selectedMenu.id == 2) {
        this.filterTitleVN.value = this.searchTerm

        let gridState: State = {
          take: 1,
          filter: {
            logic: 'and', filters: [
              { field: "MetaStatus", operator: "eq", value: null },
              { logic: 'or', filters: [this.filterTitleVN] }
            ]
          }
        }
        this.GetListCMSNews(gridState)
      }

      else {
        this.filterCategoryName.value = this.searchTerm
        this.filterPageName.value = this.searchTerm

        let gridState: State = {
          take: 1,
          filter: {
            logic: 'and', filters: [
              { field: "MetaStatus", operator: "eq", value: null },
              { logic: 'or', filters: [this.filterCategoryName, this.filterPageName] }
            ]
          }
        }
        this.getListMetaTag(gridState)
      }
    }
    else {
      this.layoutService.onError("Vui lòng nhập vào khung tìm kiếm");
      this.resetDrawerValues();
    }
  }

  resetDrawerValues() {
    //product
    this.dropDownMenu[0].item = new DTODetailConfProduct()
    //post
    this.dropDownMenu[1].item = new DTOMAPost_ObjReturn()
    //meta
    this.dropDownMenu[2].item = new DTOMetaTag()
    //
    this.selectedMenu.item = { Code: 0 }
    this.searchTerm = null
    //TODO nó chưa clear form???
  }

  openDrawer(isAdd: boolean) {
    this.isAdd = isAdd
    this.checkprop()
    this.drawer.open();
  }
  closeDrawer() {
    this.isAdd = false
    this.resetDrawerValues();
    this.drawer.close();
  }
  checkprop() {
    let status = this.selectedMenu.item.MetaStatus

    this.isLockAll = status == 2 || this.isViewOnly
      || ((status == 0 || status == 4) && !this.isCreator && !this.isMaster)
      || (status == 3 && !this.isVerifier && !this.isMaster)
  }

  openDialog() {
    this.deleteDialogOpened = true;
  }

  //  CALL API 
  //Meta Config Page
  getListMetaTagCategory() {
    this.loading = true;
    let sst = this.apiMetatagService.GetListMetaTagCategory().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listMetaCategory = res.ObjectReturn;
        this.listFilterMetaCategory = res.ObjectReturn;
        this.onMultiSelectFilter()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  getListMetaTag(gridState?: State) {
    this.loading = true;
    var ctx = 'Tìm trang cấu hình'

    let sst = this.apiMetatagService.GetListMetaTag(gridState == null ? this.gridState : gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (gridState == null) {
          this.listMetaTag = res.ObjectReturn.Data;
          this.total = res.ObjectReturn.Total
          const filteredMetaTags = this.listMetaTag.filter(meta => meta.Code > 0);
          this.gridViewCH.next({ data: filteredMetaTags, total: this.total });
        }
        else {
          if (Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data)) {
            this.selectedMenu.item = res.ObjectReturn.Data[0]
            this.layoutService.onSuccess(`${ctx} thành công`)
          } else
            this.layoutService.onError(`${ctx} thất bại`)
        }
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  //GET LIST PRODUCT
  getListProduct(gridState?: State) {
    this.loading = true;
    var ctx = 'Tìm sản phẩm'

    let sst = this.apiProductService.GetListProduct(gridState == null ? this.gridState : gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (gridState == null) {
          this.listProduct = res.ObjectReturn.Data;
          this.total = res.ObjectReturn.Total
          this.gridViewSP.next({ data: this.listProduct, total: this.total });
        }
        else {
          if (Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data)) {
            this.selectedMenu.item = res.ObjectReturn.Data[0]
            this.layoutService.onSuccess(`${ctx} thành công`)
          } else
            this.layoutService.onError(`${ctx} thất bại`)
        }
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      this.loading = false;
    }, (e) => {
      this.loading = false;
      if (gridState != null)
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
    });
    this.subArr.push(sst)
  }

  //GET LIST POST
  GetListCMSNews(gridState?: State) {
    this.loading = true;
    var ctx = 'Tìm bài viết'

    let sst = this.apiPostService.GetListCMSNews(gridState == null ? this.gridState : gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (gridState == null) {
          this.listPost = res.ObjectReturn.Data;
          this.total = res.ObjectReturn.Total
          this.gridViewBV.next({ data: this.listPost, total: this.total });
        }
        else {
          if (Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data)) {
            this.selectedMenu.item = res.ObjectReturn.Data[0]
            this.layoutService.onSuccess(`${ctx} thành công`)
          } else
            this.layoutService.onError(`${ctx} thất bại`)
        }
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      this.loading = false;
    }, (e) => {
      this.loading = false;
      if (gridState != null)
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
    });
    this.subArr.push(sst)
  }

  //UPDATE PRODUCT METATAG
  updateProductMetaTag(item: DTODetailConfProduct, callGetApi: boolean) {
    if (this.drawer.opened && !this.isMetaValid(item, false))
      return;

    let sst = this.apiMetatagService.UpdateProductMetaTag(item).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess('Cập nhật Meta sản phẩm thành công');
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.closeDrawer();
      } else
        this.layoutService.onError('Đã xảy ra lỗi khi cập nhật Meta sản phẩm');

      this.loading = false;

      if (callGetApi) {
        this.getListProduct()
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.selectedMenu.list = []
        this.layoutService.onSuccess('Xóa Meta tất cả sản phẩm được chọn thành công');
      }
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi cập nhật Meta sản phẩm');
    });
    this.subArr.push(sst)
    // }
  }

  //UPDATE NEWS METATAG
  updateNewsMetaTag(item: DTOMAPost_ObjReturn, callGetApi: boolean) {
    if (this.drawer.opened && !this.isMetaValid(item, false))
      return;

    let sst = this.apiMetatagService.UpdateNewsMetaTag(item).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess('Cập nhật post sản phẩm thành công');
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.closeDrawer();
      } else
        this.layoutService.onError('Đã xảy ra lỗi khi cập nhật post sản phẩm');

      this.loading = false;

      if (callGetApi) {
        this.GetListCMSNews()
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.selectedMenu.list = []
        this.layoutService.onSuccess('Xóa Meta tất cả bài viết được chọn thành công');
      }
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi cập nhật post sản phẩm');
    });
    this.subArr.push(sst)
    // }
  }

  updateMetatag(item: DTOMetaTag, callGetApi: boolean) {
    if (this.drawer.opened && !this.isMetaValid(item, false))
      return;

    let sst = this.apiMetatagService.UpdateMetaTag(item).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess('Cập nhật meta Metatag thành công');
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.closeDrawer();
      } else
        this.layoutService.onError('Đã xảy ra lỗi khi cập nhật thẻ Metatag cho Trang cấu hình');

      this.loading = false;

      if (callGetApi) {
        this.getListMetaTag()
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.selectedMenu.list = []
        this.layoutService.onSuccess('Xóa Meta tất cả trang cấu hình được chọn thành công');
      }
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi cập nhật thẻ Metatag cho Trang cấu hình');
    });
    this.subArr.push(sst)
    // }
  }

  //UPDATE STATUS
  updateProductMetaTagStatus(items: DTODetailConfProduct[] = [this.selectedMenu.item], statusID: number) {
    this.loading = true
    var ctx = 'Cập nhật tình trạng'

    let sst = this.apiMetatagService.UpdateProductMetaTagStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.getListProduct();
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    })
    this.subArr.push(sst)
  }

  updateNewsMetaTagStatus(items: DTOMAPost_ObjReturn[] = [this.selectedMenu.item], statusID: number) {
    this.loading = true
    var ctx = 'Cập nhật tình trạng'

    let sst = this.apiMetatagService.UpdateNewsMetaTagStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListCMSNews();
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    })
    this.subArr.push(sst)
  }

  updateMetaTagStatus(items: DTOMetaTag[] = [this.selectedMenu.item], statusID: number) {
    this.loading = true
    var ctx = 'Cập nhật tình trạng'

    let sst = this.apiMetatagService.UpdateMetaTagStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.getListMetaTag();
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    })
    this.subArr.push(sst)
  }

  //Hàm phân luồng cập nhật 
  onUpdateMeta() {
    if (this.selectedMenu.id == 1)
      this.updateProductMetaTag(this.selectedMenu.item, true)
    else if (this.selectedMenu.id == 2)
      this.updateNewsMetaTag(this.selectedMenu.item, true)
    else
      this.updateMetatag(this.selectedMenu.item, true)
  }

  onUpdateMetaStatus(list: any[] = [], status: number) {
    if (this.selectedMenu.id == 1)
      this.updateProductMetaTagStatus(list, status)
    else if (this.selectedMenu.id == 2)
      this.updateNewsMetaTagStatus(list, status)
    else
      this.updateMetaTagStatus(list, status)
  }
  //Hàm phân luồng xóa
  deleteMeta(item: any = this.selectedMenu.item, callGetApi: boolean = true) {
    item.MetaTitle = item.MetaKeyword = item.MetaDescription = ""
    item.MetaStatus = null

    if (this.selectedMenu.id == 1)
      this.updateProductMetaTag(item, callGetApi);
    else if (this.selectedMenu.id == 2)
      this.updateNewsMetaTag(item, callGetApi);
    else
      this.updateMetatag(item, callGetApi);
  }

  deleteManyMeta() {
    this.selectedMenu.list.forEach((s, i) => {
      s.MetaKeyword = s.MetaTitle = s.MetaDescription = ''
      let callGetApi = i == this.selectedMenu.list.length - 1
      this.deleteMeta(s, callGetApi)
    })
  }
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    var MetaStatus = dataItem.MetaStatus;
    moreActionDropdown = []

    if ((MetaStatus == 0 || MetaStatus == 4) && (this.isMaster || this.isCreator)
      || (MetaStatus == 3 && (this.isMaster || this.isVerifier)))
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    else
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    //status
    if ((MetaStatus == 0 || MetaStatus == 3 || MetaStatus == 4) && (this.isMaster || this.isVerifier))
      moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'MetaStatus', Link: "2", Actived: true })

    if (MetaStatus == 2 && (this.isMaster || this.isVerifier))
      moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'MetaStatus', Link: "3", Actived: true })

    if (MetaStatus == 3 && (this.isMaster || this.isVerifier))
      moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'MetaStatus', Link: "4", Actived: true })
    //xoa
    if ((MetaStatus == 0 || MetaStatus == 4) && (this.isMaster || this.isCreator))
      moreActionDropdown.push({ Name: "Xóa thông tin Meta", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }

  onActionDropdownClick(menu: MenuDataItem, item: any) {
    if (item.Code != 0) {
      this.selectedMenu.item = { ...item }

      if (menu.Type == 'MetaStatus') {
        var status = parseInt(menu.Link)

        if (!this.isMetaValid(item))
          return;

        if (this.selectedMenu.id == 1)
          this.updateProductMetaTagStatus([this.selectedMenu.item], status)
        else if (this.selectedMenu.id == 2)
          this.updateNewsMetaTagStatus([this.selectedMenu.item], status)
        else
          this.updateMetaTagStatus([this.selectedMenu.item], status)
      }

      else if (menu.Code == "eye" || menu.Type == 'detail' || menu.Type == 'edit' || menu.Code == 'pencil') {
        this.openDrawer(false);
      }
      else if (menu.Type == 'delete' || menu.Code == 'trash') {
        this.openDialog();
      }
    }
  }

  getSelectionPopup(selectedList: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>();

    // Check If Any Item(s) In Selected List Can Be Verified
    var canApDung = selectedList.findIndex(s => s.MetaStatus == 0 || s.MetaStatus == 3 || s.MetaStatus == 4);
    ////> Push Send To Verify Button To Array If Condition True 
    if (canApDung != -1 && (this.isMaster || this.isCreator))
      moreActionDropdown.push({ Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: [] })

    // Check If Any Item(s) In Selected List Need To Be Returned
    var canTraLai = selectedList.findIndex(s => s.MetaStatus == 3)
    ////> Push Return Button To Array If Condition True 
    if (canTraLai != -1 && (this.isMaster || this.isVerifier))
      moreActionDropdown.push({ Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: [] })

    // Check If Any Item(s) In Selected List Need To Stop Displaying
    var canStop = selectedList.findIndex(s => s.MetaStatus == 2)
    ////> Push Stop Displaying Button To Array If Condition True 
    if (canStop != -1 && (this.isMaster || this.isVerifier))
      moreActionDropdown.push({ Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: [] })

    // Check If Any Item(s) In Selected List Can Be Deleted
    var canXoa = selectedList.findIndex(s => s.MetaStatus == 0 || s.MetaStatus == 4);
    ////> Push Delete Button To Array If Condition True 
    if ((canXoa != -1 && (this.isMaster || this.isCreator)))
      moreActionDropdown.push({ Name: "Xóa thẻ Meta", Type: 'delete', Code: "trash", Link: "delete", Actived: true, LstChild: [] })

    return moreActionDropdown
  }
  //

  // Select Events In Popup
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {// If Select To Change Status Of Hashtag
        var newList = []

        if (value == 2) // Verify Button Clicked > StatusID That Can Be Verified
          list.filter(s => {
            if (s.MetaStatus == 0 || s.MetaStatus == 3 || s.MetaStatus == 4) {
              if (this.isMetaValid(s))
                newList.push(s)
            }
          })
        else if (value == 3) // Stop Displaying Button Clicked > StatusID That Can Stop Displaying
          list.filter(s => {
            if (s.MetaStatus == 2)
              newList.push(s)
          })
        else // Return Button Clicked > StatusID That Can Be Returned
          list.forEach(s => {
            if (s.MetaStatus == 3)
              newList.push(s)
          })

        if (Ps_UtilObjectService.hasListValue(newList))
          this.onUpdateMetaStatus(newList, value)
      }
      else if (btnType == "delete") { // Delete Button Clicked
        list.forEach(s => {
          if (s.MetaStatus == 0 || s.MetaStatus == 4)
            this.selectedMenu.list.push(s)
        })
        if (Ps_UtilObjectService.hasListValue(this.selectedMenu.list))
          this.deleteManyDialogOpened = true
      }
    }
  }

  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }

  //Import excel
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  uploadEventHandler(e: File) {
    this.p_ImportExcel(e);
  }

  p_ImportExcel(file) {
    this.loading = true;
    var ctx = 'Import Excel';

    //import excel of product
    let sst = this.apiProductService.ImportExcelProduct(file).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        // this.getListProduct();
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.setImportDialogMode(1);
        this.layoutService.setImportDialog(false);
        this.layoutService.getImportDialogComponent().inputBtnDisplay();
      } else {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`
        );
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`);
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  // download excel template
  downloadExcel() {
    this.loading = true;
    var ctx = 'Download Excel Template';
    var getfileName = 'MetaTemplate.xlsx'
    this.layoutService.onInfo(`Đang xử lý ${ctx}`);

    let sst = this.layoutApiService.GetTemplate(getfileName).subscribe((res) => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`);
      } else {
        this.layoutService.onError(`${ctx} thất bại`);
      }
      this.loading = false;
    }, (f) => {
      this.layoutService.onError(
        `Xảy ra lỗi khi ${ctx}. `
      );
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  //error checking
  isMetaValid(metaItem: any, checkAll: boolean = true) {
    let rs = true;

    if (metaItem.MetaStatus != 2)
      rs = true
    else if (checkAll) {
      if ((!Ps_UtilObjectService.hasValueString(metaItem.MetaKeyword)
        && !Ps_UtilObjectService.hasValueString(metaItem.MetaDescription))
        // || !Ps_UtilObjectService.hasValueString(metaItem.MetaTitle)
      ) {
        rs = false
      }
    }
    else if (!Ps_UtilObjectService.hasValueString(metaItem.MetaKeyword)
      && !Ps_UtilObjectService.hasValueString(metaItem.MetaDescription)
      // && !Ps_UtilObjectService.hasValueString(metaItem.MetaTitle)
    )
      rs = false

    if (!rs)
      this.layoutService.onError('Thẻ Meta của item "' +
        (this.selectedMenu.id == 1 ? metaItem.Barcode
          : this.selectedMenu.id == 2 ? metaItem.TitleVN
            : metaItem.PageName)
        + '" không đầy đủ thông tin')

    return rs
  }
  //img
  isValidImg(url) {
    return Ps_UtilObjectService.hasValueString(url)
  }

  getHachiImg(url) {
    return Ps_UtilObjectService.getImgResHachi(url)
  }
}
