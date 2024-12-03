import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, State, distinct } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOConfProduct } from '../../shared/dto/DTOConfProduct';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ConfigService } from '../../shared/services/config.service';
import { ConfigAPIService } from '../../shared/services/config-api.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { LogAPIService } from 'src/app/p-app/p-log/shared/services/log-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-config001-product-list',
  templateUrl: './config001-product-list.component.html',
  styleUrls: ['./config001-product-list.component.scss']
})
export class Config001ProductListComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true
  //object
  curProd = new DTOConfProduct()
  //list
  listProduct: DTOConfProduct[] = []
  listHamper: DTOConfProduct[] = []
  listGift: DTOConfProduct[] = []

  //   
  isToanQuyen: boolean = false
  isAllowedToCreate: boolean = false
  isAllowedToVerify: boolean = false
  justLoaded: boolean = true
  actionPerm: DTOActionPermission[] = []
  //dropdown
  listModeArray: any[] = [{
    text: 'Sản phẩm',
    value: 0
  }, {
    text: 'Hamper',
    value: 1
  }, {
    text: 'Quà tặng',
    value: 2
  }]
  currentListMode = this.listModeArray[0]
  //header1
  dangKinhDoanh_checked = true
  ngungKinhDoanh_checked = false
  catCode_Checked = false
  dangKinhDoanh_count = 0
  ngungKinhDoanh_count = 0
  //header2
  searchKey: string
  //grid
  allowActionDropdown = ['detail']
  //GRID
  //#region prod
  pageSize = 50
  pageSizes = [this.pageSize]

  gridView = new Subject<any>();
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  //filder prod
  filterTypeData: FilterDescriptor = {
    field: "TypeData", operator: "eq", value: 1
  }
  //#endregion prod
  //#region hamper
  pageSizeH = 50
  pageSizesH = [this.pageSizeH]

  gridViewH = new Subject<any>();
  gridStateH: State = {
    take: this.pageSizeH,
    filter: { filters: [], logic: 'and' },
  }
  //filder prod
  filterTypeDataH: FilterDescriptor = {
    field: "TypeData", operator: "eq", value: 4
  }
  //#endregion hamper
  //#region gift
  pageSizeG = 50
  pageSizesG = [this.pageSizeG]

  gridViewG = new Subject<any>();
  gridStateG: State = {
    take: this.pageSizeG,
    filter: { filters: [], logic: 'and' },
  }
  //filder gift
  filterTypeDataG: FilterDescriptor = {
    field: "TypeData", operator: "eq", value: 2
  }
  //#endregion gift
  //status
  filterStatus: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterStatus_catCode: FilterDescriptor = {
    field: "Status", operator: "eq", value: 0
  }
  // filterStatus_dang: FilterDescriptor = {
  //   field: "Status", operator: "eq", value: 2
  // }
  filterStatus_dang: CompositeFilterDescriptor = {
    logic: "or",
    filters: [
      // {
      //   field: "Status", operator: "eq", value: 1
      // },
      {
        field: "Status", operator: "eq", value: 2
      }
    ]
  }
  // filterStatus_ngung: FilterDescriptor = {
  //   field: "Status", operator: "eq", value: 3
  // }
  filterStatus_ngung: CompositeFilterDescriptor = {
    logic: "or",
    filters: [
      // {
      //   field: "Status", operator: "eq", value: 2
      // },
      {
        field: "Status", operator: "eq", value: 3
      }
    ]
  }
  //CALLBACK
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onSortChangeCallback: Function
  onFilterChangeCallback: Function

  uploadEventHandlerCallback: Function
  //
  subscribe = new Subject<void>();

  constructor(
    public router: Router,
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: ConfigService,
    public apiService: ConfigAPIService,
    public apiLogService: LogAPIService,
    public domSanititizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    let that = this
    // this.onGetListProduct()
    this.menuService.changePermission().pipe(takeUntil(this.subscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        // that.onGetListProduct()
      }
    })
    this.menuService.changePermissionAPI().pipe(takeUntil(this.subscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.onGetListProduct()
      }
    })
    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)

  }
  //filter
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.filter.filters = [this.filterTypeData]
    this.filterStatus.filters = []
    //status
    if (this.catCode_Checked) {
      this.filterStatus.filters.push(this.filterStatus_catCode)
    }

    if (this.dangKinhDoanh_checked) {
      this.filterStatus.filters.push(this.filterStatus_dang)
      // this.filterStatus.filters.push(this.filterStatus_dang1)
    }

    if (this.ngungKinhDoanh_checked) {
      this.filterStatus.filters.push(this.filterStatus_ngung)
      // this.filterStatus.filters.push(this.filterStatus_ngung1)
    }

    if (this.filterStatus.filters.length > 0)
      this.gridState.filter.filters.push(this.filterStatus)
  }

  loadFilterHamper() {
    this.pageSizesH = [...this.layoutService.pageSizes]
    this.gridStateH.take = this.pageSizeH
    this.gridStateH.filter.filters = [this.filterTypeDataH]
    this.filterStatus.filters = []
    //status
    if (this.catCode_Checked) {
      this.filterStatus.filters.push(this.filterStatus_catCode)
    }
    if (this.dangKinhDoanh_checked) {
      this.filterStatus.filters.push(this.filterStatus_dang)
      // this.filterStatus.filters.push(this.filterStatus_dang1)
    }

    if (this.ngungKinhDoanh_checked) {
      this.filterStatus.filters.push(this.filterStatus_ngung)
      // this.filterStatus.filters.push(this.filterStatus_ngung1)
    }

    if (this.filterStatus.filters.length > 0)
      this.gridStateH.filter.filters.push(this.filterStatus)
  }

  loadFilterGift() {
    this.pageSizesG = [...this.layoutService.pageSizes]
    this.gridStateG.take = this.pageSizeG
    this.gridStateG.filter.filters = [this.filterTypeDataG]
    this.filterStatus.filters = []
    //status
    if (this.catCode_Checked) {
      this.filterStatus.filters.push(this.filterStatus_catCode)
    }
    if (this.dangKinhDoanh_checked) {
      this.filterStatus.filters.push(this.filterStatus_dang)
      // this.filterStatus.filters.push(this.filterStatus_dang1)
    }

    if (this.ngungKinhDoanh_checked) {
      this.filterStatus.filters.push(this.filterStatus_ngung)
      // this.filterStatus.filters.push(this.filterStatus_ngung1)
    }

    if (this.filterStatus.filters.length > 0)
      this.gridStateG.filter.filters.push(this.filterStatus)
  }
  //API
  GetListProduct(state: State) {
    this.loading = true;
    var ctx = 'Lấy danh sách '

    this.apiService.GetListProduct(state, this.searchKey).pipe(takeUntil(this.subscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (this.currentListMode.value == 0) {
          ctx += 'Sản phẩm'
          this.listProduct = res.ObjectReturn.Data;
          this.gridView.next({ data: this.listProduct, total: res.ObjectReturn.Total });
        }
        else if (this, this.currentListMode.value == 1) {
          ctx += 'Hamper'
          this.listHamper = res.ObjectReturn.Data;
          this.gridViewH.next({ data: this.listHamper, total: res.ObjectReturn.Total });
        }
        else {
          ctx += 'Quà tặng'
          this.listGift = res.ObjectReturn.Data;
          this.gridViewG.next({ data: this.listGift, total: res.ObjectReturn.Total });
        }
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, (e) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
    });
  }

  p_DownloadExcel() {
    this.loading = true
    var ctx = "Download Excel Template"
    var getfileName = 'ProductInfTemplate2.xlsx'
    // var getfileName = 'ProductInfTemplate2.xlsx'
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.layoutApiService.GetTemplate(getfileName)
      .pipe(takeUntil(this.subscribe)).subscribe(res => {
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

  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.apiService.ImportExcelProduct2(file).pipe(takeUntil(this.subscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.onGetListProduct()
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
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    if (this.currentListMode.value == 0) {
      this.gridState.skip = event.skip;
      this.gridState.take = this.pageSize = event.take
      this.GetListProduct(this.gridState)
    }
    else if (this.currentListMode.value == 1) {
      this.gridStateH.skip = event.skip;
      this.gridStateH.take = this.pageSizeH = event.take
      this.GetListProduct(this.gridStateH)
    }
    else {
      this.gridStateG.skip = event.skip;
      this.gridStateG.take = this.pageSizeG = event.take
      this.GetListProduct(this.gridStateG)
    }
  }

  sortChange(event: SortDescriptor[]) {
    if (this.currentListMode.value == 0) {
      this.gridState.sort = event
      this.GetListProduct(this.gridState)
    }
    else if (this.currentListMode.value == 1) {
      this.gridStateH.sort = event
      this.GetListProduct(this.gridStateH)
    }
    else {
      this.gridStateG.sort = event
      this.GetListProduct(this.gridStateG)
    }
  }
  //DROPDOWN popup
  onActionDropdownClick(menu: MenuDataItem, item: DTOConfProduct) {
    if (item.Code != 0) {
      this.curProd = { ...item }

      if (menu.Code == "eye" || menu.Link == 'detail') {
        this.openDetail(true, item.TypeData)
      }
      // else if (menu.Link == 'edit' || menu.Code == 'pencil') {
      //   this.openDetail(false, item.TypeData)
      // }
    }
  }
  //CLICK EVENT
  onGetListProduct() {
    if (this.currentListMode.value == 0) {
      this.loadFilter()
      this.GetListProduct(this.gridState)
    }
    else if (this.currentListMode.value == 1) {
      this.loadFilterHamper()
      this.GetListProduct(this.gridStateH)
    }
    else {
      this.loadFilterGift()
      this.GetListProduct(this.gridStateG)
    }
  }
  //header1
  onDropdownlistClick(e) {
    this.currentListMode = e

    if (this.currentListMode.value == 0) {
      this.loadFilter()
      this.GetListProduct(this.gridState)
    }
    else if (this.currentListMode.value == 1) {
      this.loadFilterHamper()
      this.GetListProduct(this.gridStateH)
    }
    else {
      this.loadFilterGift()
      this.GetListProduct(this.gridStateG)
    }
  }

  selectedBtnChange(e, str) {
    this[str] = e
    this.onGetListProduct()
  }
  //file
  downloadExcel() {
    this.p_DownloadExcel()
  }
  onImportExcel() {
    this.layoutService.setImportDialog(true)
  }
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }
  //header2
  resetFilter() {
    //header1
    this.dangKinhDoanh_checked = true
    this.catCode_Checked = false
    this.ngungKinhDoanh_checked = false
    //header2
    this.searchKey = ''
    //load
    this.onGetListProduct()
  }
  //
  search(str: string) {
    this.searchKey = str
    this.onGetListProduct()
  }
  //popup
  openDetail(isLockAll: boolean, typeData: number) {
    this.menuService.changeModuleData().pipe(takeUntil(this.subscribe)).subscribe((item: ModuleDataItem) => {
      this.service.isLockAll = isLockAll
      this.service.setCacheConfProduct(this.curProd)

      var group = item.ListMenu.find(f => f.Code.includes('erpproduct')
        || f.Link.includes('product-list'))

      if (Ps_UtilObjectService.hasValue(group) && Ps_UtilObjectService.hasListValue(group.LstChild)) {
        var parent = group.LstChild.find(f => f.Code.includes('product-list')
          || f.Link.includes('product-list'))

        if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
          if (typeData == 4) {
            var detail = parent.LstChild.find(f => f.Code.includes('hamper-detail')
              || f.Link.includes('hamper-detail'))

            this.menuService.activeMenu(detail)
          }
          else {
            var detail = parent.LstChild.find(f => f.Code.includes('product-detail')
              || f.Link.includes('product-detail'))

            this.menuService.activeMenu(detail)
          }
        }
      }
    })
  }

  errorOccurred: boolean = false;
  getRes(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    if (this.errorOccurred) {
      return this.getResHachi(a);
    } else {
      return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
    }
  }

  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }

  handleError() {
    // Thực hiện xử lý lỗi bằng cách hiển thị ảnh từ getResHachi
    this.errorOccurred = true; // Đánh dấu rằng đã xảy ra lỗi để tránh lặp lại việc xử lý khi gặp lỗi nhiều lần
  }
  // AUTO RUN
  ngOnDestroy(): void {
    this.subscribe.next();
    this.subscribe.complete();
  }
}
