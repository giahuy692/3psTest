import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';

import { MatSidenav } from '@angular/material/sidenav';
import { DTOConfProduct } from 'src/app/p-app/p-config/shared/dto/DTOConfProduct';
import { ConfigService } from 'src/app/p-app/p-config/shared/services/config.service';
import { ConfigAPIService } from 'src/app/p-app/p-config/shared/services/config-api.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { LogAPIService } from 'src/app/p-app/p-log/shared/services/log-api.service';
import { MarBestPriceAPIService } from '../../shared/services/mar-bestprice-api.service';
import { DTOAlbum } from '../../shared/dto/DTOAlbum.dto';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';
import { MarAlbumAPIService } from '../../shared/services/mar-album-api.service';

@Component({
  selector: 'app-mar006-bestprice-list',
  templateUrl: './mar006-bestprice-list.component.html',
  styleUrls: ['./mar006-bestprice-list.component.scss']
})
export class Mar006BestpriceListComponent implements OnInit, OnDestroy {
  loading = false
  isAdd = true
  isFilterActive = true
  deleteDialogOpened = false
  deleteManyDialogOpened = false
  //numb
  total = 0
  curLanguage = 1
  //object
  album = new DTOAlbum()
  curProd = new DTOConfProduct()
  listProduct: DTOConfProduct[] = []
  deleteList: DTOConfProduct[] = []
  //header
  searchForm: UntypedFormGroup
  form: UntypedFormGroup;
  //grid
  allowActionDropdown = ['detail', 'delete']
  //GRID
  //prod
  pageSize = 50
  pageSizes = [this.pageSize]

  gridView = new Subject<any>();
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  //filder prod
  filterIsBestPrice: FilterDescriptor = {
    field: "IsBestPrice", operator: "eq", value: 1
  }
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterProductName: FilterDescriptor = {
    field: "ProductName", operator: "contains", value: null
  }
  filterBrandName: FilterDescriptor = {
    field: "BrandName", operator: "contains", value: null
  }
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  //CALLBACK
  uploadEventHandlerCallback: Function
  pickFileCallback: Function
  GetFolderCallback: Function
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onSortChangeCallback: Function
  onFilterChangeCallback: Function
  //grid select
  getSelectionPopupCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  //select
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //
  GetAlbum_sst: Subscription
  GetListProduct_sst: Subscription
  GetProductByBarcode_sst: Subscription

  UpdateAlbum_sst: Subscription
  UpdateProductBestPriceByID_sst: Subscription
  DeleteProductBestPriceByID_sst: Subscription

  GetTemplate_sst: Subscription
  ImportExcelAlbum_sst: Subscription
  ExportExcel_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: ConfigService,
    public apiConfService: ConfigAPIService,
    public apiLogService: LogAPIService,
    public apiServiceNews: MarNewsProductAPIService,
    public apiService: MarBestPriceAPIService,
    public apiServiceAlbum: MarAlbumAPIService,
  ) { }

  ngOnInit(): void {
    
    this.loadFilter()
    this.loadSearchForm()
    this.loadForm()

    // this.GetAlbum()
    // this.GetListProduct()

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetAlbum()
        this.GetListProduct()
      }
    })
    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    //
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
  }
  //load  
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadForm() {
    this.form = new UntypedFormGroup({
      'Barcode': new UntypedFormControl(this.curProd.Barcode, Validators.required),
      'Code': new UntypedFormControl(this.curProd.Code, Validators.required),
    })
  }
  //filter
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.filter.filters = [this.filterIsBestPrice]
    this.filterSearchBox.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterProductName.value))
      this.filterSearchBox.filters.push(this.filterProductName)

    if (Ps_UtilObjectService.hasValueString(this.filterBrandName.value))
      this.filterSearchBox.filters.push(this.filterBrandName)

    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
  }
  //API
  //album
  GetAlbum() {
    this.loading = true;

    this.GetAlbum_sst = this.apiServiceAlbum.GetAlbum(-1).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.album = res.ObjectReturn;
        // this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  UpdateAlbum(prop: string[], item: DTOAlbum = this.album) {
    this.loading = true;
    var ctx = "Cập nhật Best Price"

    if (prop.findIndex(s => s == "SummaryVN") == -1)
      prop.push('SummaryVN')

    if (prop.findIndex(s => s == "SummaryJP") == -1)
      prop.push('SummaryJP')

    if (prop.findIndex(s => s == "SummaryEN") == -1)
      prop.push('SummaryEN')

    this.UpdateAlbum_sst = this.apiServiceAlbum.UpdateAlbum(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.album = res.ObjectReturn
        // this.checkProp()
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  //product
  GetListProduct() {
    this.loading = true;

    this.GetListProduct_sst = this.apiConfService.GetListProduct(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listProduct = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listProduct, total: this.total });
      } else
        this.layoutService.onError('Đã xảy ra lỗi khi lấy Danh sách Sản phẩm')

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy Danh sách Sản phẩm')
    });
  }
  GetProductByBarcode(prod = this.curProd) {
    this.loading = true;

    this.GetProductByBarcode_sst = this.apiLogService.GetProductByBarcode(prod.Barcode).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curProd = res.ObjectReturn
      } else
        this.layoutService.onError('Đã xảy ra lỗi khi lấy dữ liệu')

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy dữ liệu')
    });
  }
  UpdateProduct(prodID = [this.curProd.Code]) {
    this.loading = true;

    this.UpdateProductBestPriceByID_sst = this.apiService.UpdateProductBestPriceByID(prodID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListProduct()
      } else
        this.layoutService.onError('Đã xảy ra lỗi khi lấy dữ liệu')

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy dữ liệu')
    });
  }
  DeleteProduct(prodID = [this.curProd.Code]) {
    this.loading = true;
    var ctx = 'Xóa sản phẩm'

    this.DeleteProductBestPriceByID_sst = this.apiService.DeleteProductBestPriceByID(prodID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(ctx + ' thành công')
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        prodID.forEach(s => {
          var ex = this.listProduct.findIndex(f => f.Code == s)

          if (ex != -1)
            this.listProduct.splice(ex, 1)
        })
        if (this.drawer.opened)
          this.closeForm()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.GetListProduct()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  //file
  p_DownloadExcel() {
    this.loading = true
    var ctx = "Download Excel Template"
    var getfileName = "AlbumnTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.layoutApiService.GetTemplate(getfileName).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
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
  exportExcel() {
    this.loading = true
    var ctx = "Xuất Excel"
    var getfileName = "AlbumnTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.ExportExcel_sst = this.apiLogService.GetExcelAlbumn(1, 0).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
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
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.ImportExcelAlbum_sst = this.apiLogService.ImportExcelAlbum(file, 1, 0).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListProduct()
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
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNews.GetFolderWithFile(childPath, 10)
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListProduct()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.GetListProduct()
  }
  //DROPDOWN popup
  onActionDropdownClick(menu: MenuDataItem, item: DTOConfProduct) {
    if (item.Code > 0) {
      this.curProd = { ...item }

      if (menu.Code == "eye" || menu.Link == 'detail') {
        this.onEdit()
      }
      else if (menu.Code == 'trash' || menu.Link == 'delete') {
        this.onDelete()
      }
    }
  }
  //selection
  getSelectionPopup(selectedList: DTOConfProduct[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    if (selectedList.findIndex(s => s.Status == 0))
      moreActionDropdown.push({
        Name: "Xóa", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: DTOConfProduct[], value: any) {
    if (list.length > 0) {
      if (btnType == "delete") {//Xóa
        this.deleteList = []

        list.forEach(s => {
          // if (s.Status == 0)
            this.deleteList.push(s)
        })
        this.onDeleteMany()
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //CLICK EVENT
  //body
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  onEditorValueChange(val) {
    switch (this.curLanguage) {
      case 1:
        this.album.SummaryVN = val
        break;
      case 2:
        this.album.SummaryJP = val
        break;
      default:
        this.album.SummaryEN = val
        break;
    }
  }
  saveWebContent() {
    this.UpdateAlbum(['SummaryVN', 'SummaryEN', 'SummaryJP'])
  }
  pickFile(e: DTOCFFile, width, height) {
    this.album.ImgSetting = e?.PathFile.replace('~', '')
    this.UpdateAlbum(['ImgSetting'])
    this.layoutService.setFolderDialog(false)
  }
  //header
  downloadExcel() {
    this.p_DownloadExcel()
  }
  onImportExcel() {
    this.layoutService.setImportDialog(true)
  }
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }
  //header
  resetFilter() {
    //header
    this.searchForm.get('SearchQuery').setValue(null)
    //prod
    this.filterBarcode.value = null
    this.filterProductName.value = null
    this.filterBrandName.value = null

    this.loadFilter()
    this.GetListProduct()
  }
  //
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterBarcode.value = searchQuery
      this.filterProductName.value = searchQuery
      this.filterBrandName.value = searchQuery
    } else {
      this.filterBarcode.value = null
      this.filterProductName.value = null
      this.filterBrandName.value = null
    }

    this.loadFilter();
    this.GetListProduct()
  }
  //drawer
  onAdd() {
    this.isAdd = true;
    this.clearForm()
    this.drawer.open();
  }
  onEdit() {
    this.isAdd = false
    this.loadForm()
    this.drawer.open();
  }
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        case 'Barcode':
          if (this.drawer.opened && Ps_UtilObjectService.hasValueString(this.curProd.Barcode))
            this.GetProductByBarcode()
          break
        default:
          this.UpdateAlbum([prop])
          break
      }
    }
  }
  onSubmit(): void {
    this.form.markAllAsTouched()

    if (this.form.valid) {
      this.UpdateProduct()
    }
    else
      // this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
      this.layoutService.onSuccess("Vui lòng điền vào trường bị thiếu")
  }
  clearForm() {
    this.form.reset()
    this.curProd = new DTOConfProduct()
    this.loadForm()
  }
  closeForm() {
    this.clearForm()
    this.drawer.close()
  }
  //delete
  onDelete() {
    this.deleteDialogOpened = true
    this.drawer.close()
  }
  delete() {
    if (this.curProd.Code != 0)
      this.DeleteProduct()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    var list = this.deleteList.map(s => s.Code)
    this.DeleteProduct(list)
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  // AUTO RUN
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  ngOnDestroy(): void {
    this.GetAlbum_sst?.unsubscribe()
    this.GetListProduct_sst?.unsubscribe()
    this.GetProductByBarcode_sst?.unsubscribe()

    this.UpdateAlbum_sst?.unsubscribe()
    this.UpdateProductBestPriceByID_sst?.unsubscribe()
    this.DeleteProductBestPriceByID_sst?.unsubscribe()

    this.GetTemplate_sst?.unsubscribe()
    this.ImportExcelAlbum_sst?.unsubscribe()
    this.ExportExcel_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
