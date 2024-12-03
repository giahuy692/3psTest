import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Observable, Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MatSidenav } from '@angular/material/sidenav';
import { EcomService } from '../../shared/services/ecom.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import DTOListProp_ObjReturn from 'src/app/p-app/p-marketing/shared/dto/DTOListProp_ObjReturn.dto';
import DTOInport, { DTOInportProduct } from '../../shared/dto/DTOInport.dto';
import { EcomInportAPIService } from '../../shared/services/ecom-inport-api.service';
import { DTOWarehouse } from '../../shared/dto/DTOWarehouse';
import { map } from 'rxjs/operators';
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';

@Component({
  selector: 'app-ecom008-outport-detail',
  templateUrl: './ecom008-outport-detail.component.html',
  styleUrls: ['./ecom008-outport-detail.component.scss']
})
export class Ecom008OutportDetailComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true
  excelValid = true

  isAdd = true
  isAddProd = false
  isLockAll = false

  deleteDialogOpened = false
  deleteManyDialogOpened = false
  //
  total = 0
  mainWarehouse: number = null
  contextIndex = 0
  context: string[] = ['Chứng từ', 'Sản phẩm']
  //object
  inport = new DTOInport()
  product = new DTOInportProduct()
  warehouse: DTOWarehouse = null
  //list
  listWarehouse: DTOWarehouse[] = []
  listProduct: DTOInportProduct[] = []
  deleteList: DTOInportProduct[] = []
  contextName: string[] = [this.inport.DocumentNo, this.product.ProductName]
  //header2
  searchForm: UntypedFormGroup
  formSP: UntypedFormGroup;
  //FILTER
  //header2
  filterTransfer: FilterDescriptor = {
    field: "TransferID", operator: "eq", value: this.inport.Code
  }
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterPoscode: FilterDescriptor = {
    field: "PosCode", operator: "contains", value: null
  }
  filterProductName: FilterDescriptor = {
    field: "ProductName", operator: "contains", value: null
  }
  //grid
  allowActionDropdown = ['detail', 'edit', 'delete']
  //grid
  pageSize = 25
  pageSizes = [this.pageSize]
  sort: SortDescriptor = { field: 'ProductName', dir: 'asc' }

  gridDSView = new Subject<any>();
  gridDSState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: []//this.sort
  }
  filterWHName: FilterDescriptor = {
    field: "WHName", operator: "contains", value: null
  }
  filterWHCode: FilterDescriptor = {
    field: "WHCode", operator: "contains", value: null
  }
  //WAREHOUSE COMBOBOX
  @ViewChild("comboboxWH", { static: true }) combobox: ComboBoxComponent;

  gridStateWH: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'or' },
    sort: []//this.sort
  }
  //CALLBACK
  //grid data
  onPageChangeCallback: Function
  onSortChangeCallback: Function
  //rowItem action dropdown
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
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
  //folder & file
  pickFileCallback: Function
  GetFolderCallback: Function
  uploadEventHandlerCallback: Function
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  dataPerm: DTODataPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //Subscription
  changePermission_sst: Subscription
  getCacheInportDetail_sst: Subscription
  ImportExcel_sst: Subscription
  GetTemplate_sst: Subscription
  GetWarehouseWMS_sst: Subscription

  GetInportList_sst: Subscription
  GetInport_sst: Subscription
  UpdateInportStatus_sst: Subscription
  UpdateInport_sst: Subscription
  DeleteInport_sst: Subscription

  GetListProduct_sst: Subscription
  GetInportProductByCode_sst: Subscription
  GetInportProduct_sst: Subscription
  UpdateProduct_sst: Subscription
  DeleteProduct_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    public service: EcomService,
    public apiService: EcomInportAPIService,
    public marApiService: MarNewsProductAPIService,
    public layoutApiService: LayoutAPIService,
    public layoutService: LayoutService,
    ) { }

  ngOnInit(): void {
    let that = this
    //load
    this.loadSearchForm()
    this.loadFormSanPham()

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")
        that.dataPerm = res.DataPermission
        that.mainWarehouse = that.dataPerm.find(s => s.IsMain)?.Warehouse

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // that.getCache()
      }
    })

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.getCache()
      }
    })

    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //action dropdown    
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    //file
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
  }
  getCache() {
    this.getCacheInportDetail_sst = this.service.getCacheInportDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.inport = res
        this.isAdd = this.inport.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }

      if (!this.isAdd || this.inport.Code != 0) {
        this.GetInport()

        this.loadFilterWH()
        this.p_GetWarehouseWMS()

        this.loadFilter()
        this.GetListProduct()
      }
    })
  }
  //Kendo FORM
  loadFormSanPham() {
    this.formSP = new UntypedFormGroup({
      'Barcode': new UntypedFormControl(this.product.Barcode, Validators.required),
      'Price': new UntypedFormControl(this.product.Price, Validators.required),
      'Quantity': new UntypedFormControl(this.product.Quantity, Validators.required),
      'QtyRequest': new UntypedFormControl(this.product.QtyRequest, Validators.required),
      'RemarkTo': new UntypedFormControl(this.product.RemarkTo),
    })

    var today = new Date()
    //tính ngày hsd tối thiểu
    this.product.MinExpDate = Ps_UtilObjectService.hasValue(this.product.ExpDate)
      && Ps_UtilObjectService.hasValue(this.product.ExpDuration) && this.product.ExpDuration > 0 ?
      Ps_UtilObjectService.addHours(today,
        24 * this.product.ExpDuration / 100 *
        (this.product.ExpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : this.product.ExpDate
  }
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridDSState.take = this.pageSize
    this.gridDSState.filter.filters = []
    this.filterSearchBox.filters = []
    // this.filterStatusID.filters = []
    this.filterTransfer.value = this.inport.Code
    this.gridDSState.filter.filters.push(this.filterTransfer)
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterPoscode.value))
      this.filterSearchBox.filters.push(this.filterPoscode)

    if (Ps_UtilObjectService.hasValueString(this.filterProductName.value))
      this.filterSearchBox.filters.push(this.filterProductName)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
  }
  loadFilterWH() {
    this.gridStateWH.take = this.pageSize
    this.gridStateWH.filter.filters = []

    if (Ps_UtilObjectService.hasValueString(this.filterWHName.value))
      this.gridStateWH.filter.filters.push(this.filterWHName)

    if (Ps_UtilObjectService.hasValueString(this.filterWHCode.value))
      this.gridStateWH.filter.filters.push(this.filterWHCode)
  }
  resetFilter() {
    // //header2
    this.searchForm.get('SearchQuery').setValue(null)
    this.filterBarcode.value = null
    this.filterProductName.value = null
    this.filterPoscode.value = null

    // this.gridDSState.sort = [this.sort]
    this.loadFilter()
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.GetInport()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.GetInport()
  }
  //API  
  p_GetWarehouseWMS() {
    this.loading = true;

    this.GetWarehouseWMS_sst = this.layoutApiService.GetWarehouseWMS(this.gridStateWH).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn)
        && Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data) && res.StatusCode == 0) {
        this.listWarehouse = res.ObjectReturn.Data.filter(s => s.Code != 7);
        this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //Chứng từ
  GetInport() {
    this.loading = true;
    var ctx = 'Lấy chứng từ'

    this.GetInportList_sst = this.apiService.GetInport(this.inport).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
          this.inport = res.ObjectReturn;
          this.checkProp()
        }
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  UpdateInportStatus(items: DTOInport[] = [this.inport], statusID: number = this.inport.Status) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng Chứng từ'

    this.UpdateInportStatus_sst = this.apiService.UpdateInportStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.inport = res.ObjectReturn
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  UpdateInport(prop: string[] = [], items: DTOInport = this.inport) {
    this.loading = true;
    var ctx = 'Cập nhật Chứng từ'

    if (this.isAdd && prop.findIndex(s => s == 'FromWarehouse')) {
      prop.push('FromWarehouse')
      this.inport.FromWarehouse = this.mainWarehouse
    }

    this.UpdateInportStatus_sst = this.apiService.UpdateInportSent(items, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.inport = res.ObjectReturn
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  DeleteInport(items: DTOInport[] = [this.inport]) {
    this.loading = true;
    var ctx = 'Xóa chứng từ'

    this.DeleteInport_sst = this.apiService.DeleteInport(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.createNew()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  //PRODUCT
  GetListProduct() {
    this.loading = true;

    this.GetListProduct_sst = this.apiService.GetListInportProduct(this.gridDSState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listProduct = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridDSView.next({ data: this.listProduct, total: this.total });
      } else
        this.layoutService.onError('Đã xảy ra lỗi khi lấy Danh sách Sản phẩm')

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy Danh sách Sản phẩm')
    });
  }
  GetProductByCode() {
    this.loading = true;
    var ctx = 'Tìm sản phẩm'

    this.GetInportProductByCode_sst = this.apiService.GetInportProductByCode(this.product.Barcode, this.inport.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
          this.layoutService.onSuccess(ctx + ' thành công')
          this.product = res.ObjectReturn;
        }
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  GetProduct() {
    this.loading = true;
    var ctx = 'Tìm sản phẩm'

    this.GetInportProduct_sst = this.apiService.GetInportProduct(this.product).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
          this.layoutService.onSuccess(ctx + ' thành công')
          this.product = res.ObjectReturn;
        }
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  //update
  p_UpdateProduct(prop: string[], item: DTOInportProduct = this.product) {
    this.loading = true;
    var ctx = (this.isAddProd ? 'Thêm mới' : 'Cập nhật') + ' sản phẩm'

    this.UpdateProduct_sst = this.apiService.UpdateInportProduct(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.closeForm()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        item = res.ObjectReturn

        if (this.isAddProd) {
          this.listProduct.push(item)
          this.total++
        }
        else {
          var i = this.listProduct.findIndex(s => s.Code == item.Code)

          if (i > -1)
            this.listProduct.splice(i, 1, res.ObjectReturn)
        }

        this.gridDSView.next({ data: this.listProduct, total: this.total });
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
  p_DeleteProduct(items: DTOInportProduct[] = [this.product]) {
    this.loading = true;
    var ctx = "Xóa sản phẩm"

    this.DeleteProduct_sst = this.apiService.DeleteInportProduct(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        items.forEach(f => {
          var i = this.listProduct.findIndex(s => s.Code == f.Code)

          if (i > -1) {
            this.total--
            this.listProduct.splice(i, 1)
          }
        })

        this.gridDSView.next({ data: this.listProduct, total: this.total });
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
  //file
  p_DownloadExcel() {
    this.loading = true
    var getfileName = 'InportProductTemplate.xlsx'
    var ctx = "Download Excel Template"
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
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
      this.loading = false;
    });
  }
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel Sản phẩm Onsite"

    this.ImportExcel_sst = this.apiService.ImportInportProduct(file, this.inport.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListProduct()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        const arr = res.ObjectReturn as DTOListProp_ObjReturn[]
        let importComponent = this.layoutService.getImportDialogComponent()
        //set key để map list data vả list property
        // importComponent.rowKey = 'Barcode'
        //list data để hiện lên popup
        // importComponent.errorRows = arr.map(s => s.ObjReturn)
        //list property để báo lỗi bằng css
        // importComponent.errorCellsOfRow = arr.map(s => ({
        //   ListProperties: s.ListProperties, RowKey: (s.ObjReturn as DTOPromotionDetail).Barcode
        // }))

        // importComponent.diCustomGridRef.autoFitColumns()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        importComponent.importGridDSView.next({ data: arr, total: arr.length })
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    })
  }
  //CLICK EVENT
  //combobox
  filterChange(e) {
    this.toggleCombobox(e)
  }
  valueChange(e: DTOWarehouse) {
    if (Ps_UtilObjectService.hasValue(e)) {
      this.filterWHName.value = e.WHName
      this.filterWHCode.value = e.WHCode
    }
  }
  toggleCombobox(e) {
    if (!this.combobox.isOpen)
      this.combobox.toggle(true)
  }
  getWarehouseList(e) {//keydown.enter
    this.loadFilterWH()
    this.p_GetWarehouseWMS();
  }
  //parse customValue thành object cho combobox dùng
  valueNormalizer = (text: Observable<string>) =>
    text.pipe(
      map((content: string) => {
        return {
          Code: 0,
          WHCode: content,
          WHName: content,
        } as DTOWarehouse
      })
    );
  //body
  updateStatus(statusID) {
    var newPro = { ...this.inport }
    //check trước khi áp dụng 
    if (newPro.Status == 1 || newPro.Status == 2) {

      // if (!Ps_UtilObjectService.hasValueString(newPro.ImageSetting))
      //   this.layoutService.onError('Vui lòng chọn Icon Kênh')
      // else if (!Ps_UtilObjectService.hasValueString(newPro.Brief))
      //   this.layoutService.onError('Vui lòng nhập Mã Kênh')
      // else if (!Ps_UtilObjectService.hasValueString(newPro.InportName))
      //   this.layoutService.onError('Vui lòng nhập Tên Kênh')
      // else if (!Ps_UtilObjectService.hasValue(newPro.ParentID))
      //   this.layoutService.onError('Vui lòng chọn Phân nhóm Kênh')
      // else if (!Ps_UtilObjectService.hasValue(newPro.Priority))
      //   this.layoutService.onError('Vui lòng nhập Thứ tự phân bổ tồn kho')
      // else if (!Ps_UtilObjectService.hasValue(newPro.OrderBy))
      //   this.layoutService.onError('Vui lòng nhập Thứ tự hiển thị')
      // else
      this.UpdateInportStatus([newPro], statusID)
    }
    else
      this.UpdateInportStatus([newPro], statusID)
  }
  onDeleteInport() {
    this.contextIndex = 0
    this.contextName[0] = this.inport.DocumentNo
    this.deleteDialogOpened = true
  }
  clickCheckbox(ev, prop: string, item?) {
    this.inport[prop] = ev.target.checked
    this.UpdateInport([prop])
  }
  createNew() {
    //object
    this.inport = new DTOInport()
    this.product = new DTOInportProduct()
    //list
    this.listProduct = []
    this.gridDSView.next({ data: [], total: 0 })
    //bool
    this.isLockAll = false
    this.isAdd = true
    this.isAddProd = false
    this.isFilterActive = true
    //num
    this.total = 0
  }
  checkProp() {
    //cho phép edit khi Duyệt
    this.isLockAll = (this.inport.Status != 0 && this.inport.Status != 4 && this.isAllowedToCreate)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.inport.Status == 0 || this.inport.Status == 4) && this.isAllowedToVerify)//khóa khi tạo, trả nếu có quyền duyệt

    this.selectable.enabled = this.inport.Status != 2 && this.inport.Status != 3

    var wh = this.listWarehouse.find(s => s.Code == this.inport.ToWarehouse)

    if (Ps_UtilObjectService.hasValue(wh))
      this.warehouse = wh
  }
  //inport img
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  pickFile(e: DTOCFFile, width, height) {
    var filePath = e?.PathFile.replace('~', '')
    // this.inport.ImageSetting = filePath
    this.UpdateInport(['ImageSetting'])
    this.layoutService.setFolderDialog(false)
  }
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.marApiService.GetFolderWithFile(childPath, 12)
  }
  //header1
  downloadExcel() {
    this.p_DownloadExcel()
  }
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }
  //header2
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterPoscode.value = searchQuery
      this.filterBarcode.value = searchQuery
      this.filterProductName.value = searchQuery
    } else {
      this.filterPoscode.value = null
      this.filterBarcode.value = null
      this.filterProductName.value = null
    }

    this.loadFilter();
    this.GetListProduct()
  }
  //selection
  getSelectionPopup(selectedList: DTOInportProduct[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    // var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

    // if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
    if (this.inport.Status != 4 && this.inport.Status != 3)
      moreActionDropdown.push({
        Name: "Xóa sản phẩm", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: DTOInportProduct[], value: any) {
    if (list.length > 0) {
      if (btnType == "delete") {//Xóa
        this.onDeleteMany()
        this.deleteList = []

        list.forEach(s => {
          if (this.inport.Status != 4 && this.inport.Status != 3)
            this.deleteList.push(s)
        })
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOInportProduct) {
    moreActionDropdown = []
    this.product = { ...dataItem }
    // var statusID = this.product.StatusID;
    //edit
    if ((this.inport.Status == 4 || this.inport.Status == 3) //&&
      // (
      //   (statusID != 0 && statusID != 4 && this.isAllowedToCreate) ||
      //   ((statusID == 0 || statusID == 4) && this.isAllowedToVerify)
      // )
    )
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //delete
    if (this.inport.Status != 4 && this.inport.Status != 3)
      moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOInportProduct) {
    if (item.Code > 0) {
      if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.product = { ...item }
        this.onEdit()
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.product = { ...item }
        this.onDeleteProduct()
      }
    }
  }
  //delete
  onDeleteProduct() {
    this.contextIndex = 1
    this.contextName[1] = this.product.ProductName
    this.deleteDialogOpened = true
  }
  delete() {
    if (this.contextIndex == 0 && this.inport.Code > 0)
      this.DeleteInport()
    else if (this.contextIndex == 1 && this.product.Code > 0)
      this.p_DeleteProduct()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.p_DeleteProduct(this.deleteList)
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //
  onAdd() {
    this.isAddProd = true
    this.product = new DTOInportProduct()
    this.loadFormSanPham()
    this.drawer.open()
  }
  onEdit() {
    this.isAddProd = false
    // this.GetProduct()
    this.loadFormSanPham()
    this.drawer.open()
  }
  //FORM
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        case 'Barcode':
          if ((!this.isAdd && this.isAddProd) && this.drawer.opened
            && Ps_UtilObjectService.hasValueString(this.product.Barcode))
            this.GetProductByCode()
          break
        default:
          this.UpdateInport([prop])
          break
      }
    }
  }
  onDropdownlistClick(ev, prop?: string) {
    if (Ps_UtilObjectService.hasValueString(prop) && ev != null) {
      this.warehouse = ev
      this.inport.ToWarehouse = this.warehouse.Code
      this.inport.ToWarehouseName = this.warehouse.WHName
      this.UpdateInport([prop])
    }
  }
  onSubmitSP(): void {
    this.formSP.markAllAsTouched()

    if (this.formSP.valid) {
      if (this.product.Quantity > this.product.QtyRequest)
        this.layoutService.onError("Số lượng nhận nhiều hơn Số lượng chứng từ")
      else
        this.p_UpdateProduct(['Product', 'QtyRequest', 'Quantity', 'RemarkTo', 'Price'])
    }
    else
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
  }
  clearFormSanPham() {
    this.formSP.reset()
    this.product = new DTOInportProduct()
    this.loadFormSanPham()
  }
  closeForm() {
    this.clearFormSanPham()
    this.drawer.close()
  }
  //AUTORUN
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.ImportExcel_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()
    this.GetWarehouseWMS_sst?.unsubscribe()

    this.GetInportList_sst?.unsubscribe()
    this.GetInport_sst?.unsubscribe()
    this.UpdateInportStatus_sst?.unsubscribe()
    this.UpdateInport_sst?.unsubscribe()
    this.DeleteInport_sst?.unsubscribe()

    this.GetListProduct_sst?.unsubscribe()
    this.GetInportProductByCode_sst?.unsubscribe()
    this.GetInportProduct_sst?.unsubscribe()
    this.UpdateProduct_sst?.unsubscribe()
    this.DeleteProduct_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
