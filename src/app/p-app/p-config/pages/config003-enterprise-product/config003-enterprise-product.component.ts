import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchFilterGroupComponent } from 'src/app/p-app/p-layout/components/search-filter-group/search-filter-group.component';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigAPIService } from '../../shared/services/config-api.service';
import { DTOConfProduct } from '../../shared/dto/DTOConfProduct';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ConfigService } from '../../shared/services/config.service';
import { ConfigHamperApiService } from '../../shared/services/config-hamper-api.service';
import { DTOHamperRequest } from '../../shared/dto/DTOConfHamperRequest';

@Component({
  selector: 'app-config003-enterprise-product',
  templateUrl: './config003-enterprise-product.component.html',
  styleUrls: ['./config003-enterprise-product.component.scss']
})
export class Config003EnterpriseProductComponent implements OnInit, OnDestroy {

  @ViewChild(SearchFilterGroupComponent) searchFilterGroup: SearchFilterGroupComponent;

  // common variable

  isFilterActive = true
  loading: boolean = false

  //Permission
  justLoaded = true
  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  excelValid = true

  daDuyet_checked: boolean = true
  NgungApDung_checked: boolean = false


  // fiter

  placeholder: string = 'Tìm theo barcode, tên sản phẩm, thương hiệu'
  TextSearch: string

  // array
  actionPerm: DTOActionPermission[] = []
  listProduct: DTOConfProduct[] = []
  listHamper: DTOConfProduct[] = []
  listGift: DTOConfProduct[] = []


  //dropdown
  listModeArray: any[] = [{
    text: 'Sản phẩm',
    value: 0,
    Icon: 'shopping-cart'
  }, {
    text: 'Hamper',
    value: 1,
    Icon: 'gifts'
  }, {
    text: 'Quà tặng',
    value: 2,
    Icon: 'gift'
  }]
  currentListMode = this.listModeArray[0]

  //end array

  // Object
  curProd = new DTOConfProduct()

  // end Object 


  //Unsubcribe
  ngUnsubscribe = new Subject<void>();
  //end Unsubcribe

  // end common variable

  // grid
  gridView = new Subject<any>();
  pageSize = 25
  pageSizes = [this.pageSize]
  allowActionDropdown = []
  skip = 0;
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }

  //danh sách Sản phẩm
  tempSearchSP: any
  filterSearchBoxSP: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  filterTypeDataSP: FilterDescriptor = {
    field: "TypeData", operator: "eq", value: 1
  }
  //danh sách Hamper
  filterSearchBoxHP: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  tempSearchHP: any;
  filterTypeDataHP: FilterDescriptor = {
    field: "TypeData", operator: "eq", value: 4
  }

  //danh sách quà tặng
  filterSearchBoxQT: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  tempSearchQT: any;
  filterTypeDataQT: FilterDescriptor = {
    field: "TypeData", operator: "eq", value: 2
  }

  //
  //status
  filterStatus: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterStatus_daDuyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 2
  }
  filterStatus_Ngung: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 3
  }
  //CallBack SP
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  onPageChangeCallback: Function
  uploadEventHandlerCallback: Function



  // end grid

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public apiService: ConfigAPIService,
    public service: ConfigService,
    public apiHamperService: ConfigHamperApiService,
  ) { }

  ngOnInit(): void {
    let that = this

    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
      }
    })


    this.onPageChangeCallback = this.pageChange.bind(this)
    //dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)

    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.onGetListProduct()
      }
    })
    // this.onGetListProduct()
  }

  //Api
  //GET
  //Lấy danh sách sản phẩm
  GetListBaseProduct(state: State) {
    this.loading = true;
    var ctx = 'Lấy danh sách '

    this.apiService.GetListBaseProduct(state, this.TextSearch).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      console
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (this.currentListMode.value == 0) {
          ctx += 'Sản phẩm'
          this.listProduct = res.ObjectReturn.Data;
          this.gridView.next({ data: this.listProduct, total: res.ObjectReturn.Total });
        }
        else if (this, this.currentListMode.value == 1) {
          ctx += 'Hamper'
          this.listHamper = res.ObjectReturn.Data;
          this.gridView.next({ data: this.listHamper, total: res.ObjectReturn.Total });
        }
        else {
          ctx += 'Quà tặng'
          this.listGift = res.ObjectReturn.Data;
          this.gridView.next({ data: this.listGift, total: res.ObjectReturn.Total });
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

  //END GET

  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.apiService.ImportExcelProduct2(file).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListBaseProduct(this.gridState)
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

  // end Api

  UpdateProductStatus(items: DTOConfProduct[], statusID: number) {
    this.loading = true
    var ctx = 'Cập nhật tình trạng'

    this.apiHamperService.UpdateProductStatus(items as DTOHamperRequest[], statusID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        }

        this.loading = false;
        this.GetListBaseProduct(this.gridState)
      }, () => {
        this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
        this.loading = false;
        this.GetListBaseProduct(this.gridState)
      })
  }
  // logic

  // hearder 2
  //load Filter danh sách sản phẩm
  loadFilter(TypeOf: number) {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.filterStatus.filters = []

    if (TypeOf == 0) {
      this.gridState.filter.filters = [this.filterTypeDataSP]

      if (Ps_UtilObjectService.hasListValue(this.filterSearchBoxSP.filters)) {
        if (this.tempSearchSP[0].value != '') {
          this.gridState.filter.filters.push(this.filterSearchBoxSP);
        }
      }
    } else if (TypeOf == 1) {
      this.gridState.filter.filters = [this.filterTypeDataHP]

      if (Ps_UtilObjectService.hasListValue(this.filterSearchBoxHP.filters)) {
        if (this.tempSearchHP[0].value != '') {
          this.gridState.filter.filters.push(this.filterSearchBoxHP);
        }
      }
    } else {
      this.gridState.filter.filters = [this.filterTypeDataQT]

      if (Ps_UtilObjectService.hasListValue(this.filterSearchBoxQT.filters)) {
        if (this.tempSearchQT[0].value != '') {
          this.gridState.filter.filters.push(this.filterSearchBoxQT);
        }
      }
    }

    //status

    if (this.daDuyet_checked) {
      this.filterStatus.filters.push(this.filterStatus_daDuyet)
    }

    if (this.NgungApDung_checked) {
      this.filterStatus.filters.push(this.filterStatus_Ngung)
    }

    if (this.filterStatus.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatus)
    }
  }
  //end hearder 2

  //grid

  onGetListProduct() {
    this.loadFilter(this.currentListMode.value)
    this.GetListBaseProduct(this.gridState)
  }

  // dssp

  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    moreActionDropdown = []

    if (dataItem.Code != 0) {
      this.curProd = { ...dataItem }

      if (this.isToanQuyen || this.isAllowedToCreate) {
        moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "Detail", Actived: true })
      }

      if (this.isToanQuyen || this.isAllowedToVerify) {
        if (dataItem.StatusID == 2)
          moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Link: "3", Type: 'StatusID', Actived: true })
        else
          moreActionDropdown.push({ Name: "Duyệt áp dụng", Code: "check-outline", Link: "2", Type: 'StatusID', Actived: true })
      }
    }
    return moreActionDropdown
  }
  //end grid

  // end logic

  // Action

  // header 1

  loadPage() {
    this.searchFilterGroup.resetFilter();
    // this.onGetListProduct()
  }

  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e
    this.gridState.skip = 0
    this.loadFilter(this.currentListMode.value)
    this.GetListBaseProduct(this.gridState)
  }

  onDropdownlistClick(e) {
    this.currentListMode = e
    if (this.currentListMode.value == 0) {
      this.placeholder = 'Tìm theo barcode, tên sản phẩm, thương hiệu'
    }
    else if (this.currentListMode.value == 1) {
      this.placeholder = 'Tìm theo barcode, tên Hamper, sản phẩm thuộc hamper'
    }
    else {
      this.placeholder = 'Tìm theo barcode, tên quà tặng, thương hiệu'
    }
    this.loadFilter(this.currentListMode.value)
    this.searchFilterGroup.resetFilter();
  }

  importExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  downloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "ProductInfTemplate2.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.apiHamperService.GetTemplate(getfilename).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
  }

  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }

  // end header 1

  // header 2

  handleSearch(value: string) {
    this.TextSearch = value
    this.gridState.skip = 0
    this.loadFilter(this.currentListMode.value);
    this.GetListBaseProduct(this.gridState)
  }

  resetFilter() {
    this.TextSearch = ''
    this.daDuyet_checked = true
    this.NgungApDung_checked = false
    this.gridState.skip = 0
    this.loadFilter(this.currentListMode.value);
    this.GetListBaseProduct(this.gridState)
  }

  // end hearder 2

  // GRID
  // danh sách sp

  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListBaseProduct(this.gridState)
  }

  onActionDropdownClick(menu: MenuDataItem, item: DTOConfProduct) {
    if (item.Code != 0) {
      this.curProd = { ...item }

      if (menu.Code == "eye" || menu.Link == 'detail') {
        this.openDetail(true, this.currentListMode.value)
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil') {
        this.openDetail(false, item.TypeData)
      }
      else if (menu.Type == 'StatusID') {
        this.UpdateProductStatus([item], parseInt(menu.Link))
      }
    }
  }

  // danh sách HP

  // danh sách QT

  openDetail(isLockAll: boolean, typeData: number) {
    this.menuService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: ModuleDataItem) => {
      this.service.isLockAll = isLockAll
      // this.service.setCacheConfProduct(this.curProd)


      var parent = item.ListMenu.find(f => f.Link.includes('config002-hamper-request'))


      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {

        var detail = parent.LstChild.find(f => f.Link.includes('config003-enterprise-product'))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Link.includes('config003-enterprise-product-detail'))
          // this.curProd['TypeOf'] = typeData
          localStorage.setItem("Hamper", JSON.stringify(this.curProd))

          this.menuService.activeMenu(detail2)
        }
        // }
      }
    })
  }

  //END GRID

  // end Action

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
