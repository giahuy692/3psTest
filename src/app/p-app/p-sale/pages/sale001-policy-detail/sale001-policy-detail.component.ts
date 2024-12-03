import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { State, CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MatSidenav } from '@angular/material/sidenav';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { SaleService } from '../../shared/services/sale.service';
import { SaleAPIService } from '../../shared/services/sale-api.service';
import { DTOPosPrice, DTOPosPriceDetail } from '../../shared/dto/DTOPosPrice.dto';
import DTOListProp_ObjReturn from 'src/app/p-app/p-marketing/shared/dto/DTOListProp_ObjReturn.dto';

@Component({
  selector: 'app-sale001-policy-detail',
  templateUrl: './sale001-policy-detail.component.html',
  styleUrls: ['./sale001-policy-detail.component.scss']
})
export class Sale001PolicyDetailComponent implements OnInit, OnDestroy {
  loading = false
  isLockAll = false
  isFilterActive = true
  isAdd = true
  isAddDetail = true
  //dialog
  deleteDialogOpened = false
  deleteManyDialogOpened = false
  importDialogOpened = false
  excelValid = true;
  //num
  curLanguage = 1
  total = 0
  //date
  today = new Date()
  tomorrow: Date = Ps_UtilObjectService.addHours(this.today, 24)
  EffDate: Date = null
  //object
  posPrice = new DTOPosPrice()
  listDetail: DTOPosPriceDetail[] = []
  deleteList: DTOPosPriceDetail[] = []
  posPriceDetail = new DTOPosPriceDetail()
  //string
  contextIndex = 1
  context = ["Đợt phát hành", "Sản phẩm"]
  contextName = [this.posPrice.AdjName, this.posPriceDetail.ProductName]
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterProductName: FilterDescriptor = {
    field: "ProductName", operator: "contains", value: null
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterPosCode: FilterDescriptor = {
    field: "PosCode", operator: "contains", value: null
  }
  //grid sản phẩm
  pageSize = 25
  pageSizes = [this.pageSize]

  gridDSView = new Subject<any>();
  gridDSState: State = {
    skip: 0, take: this.pageSize,
    filter: {
      logic: 'and',
      filters: [{ field: 'POSPrice', operator: 'eq', value: this.posPrice.Code }]
    }
  }
  //form
  allowActionDropdown = ['detail', 'edit', 'delete']
  form: UntypedFormGroup;
  searchForm: UntypedFormGroup
  //CALLBACK
  //folder & file
  uploadEventHandlerCallback: Function
  //rowItem action dropdown
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onSortChangeCallback: Function
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
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  changePermission_sst: Subscription
  changePermissionAPI: Subscription
  getCachePosPrice_sst: Subscription
  GetTemplate_sst: Subscription
  ImportExcelPriceAdjDetails_sst: Subscription

  GetPOSPriceAdj_sst: Subscription
  GetPOSPriceAdjDetailsByBarcode_sst: Subscription
  GetListPOSPriceAdjDetails_sst: Subscription

  UpdatePOSPriceAdj_sst: Subscription
  UpdatePOSPriceAdjStatus_sst: Subscription
  UpdatePOSPriceAdjDetails_sst: Subscription

  DeletePOSPriceAdjDetails_sst: Subscription
  DeletePOSPriceAdj_sst: Subscription

  constructor(
    public service: SaleService,
    public apiService: SaleAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    let that = this
    
    //cache
    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.getCache()
      }
    })

    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache()
			}
		})
    //load
    this.loadForm()
    this.loadSearchForm()
    //CALLBACK
    //file
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //grid data    
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //action dropdown    
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }
  //load  
  getCache() {
    this.getCachePosPrice_sst = this.service.getCachePosPrice().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.posPrice = res
        this.isAdd = this.posPrice.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }

      if (!this.isAdd || this.posPrice.Code != 0) {
        this.GetPOSPriceAdj()
        this.loadFilter()
        this.GetListPOSPriceAdjDetails()
      }
    })
  }
  //Kendo FORM
  loadForm() {
    if (this.posPriceDetail.StatusID == 0)
      this.posPriceDetail.StatusID = 1

    this.form = new UntypedFormGroup({
      'Barcode': new UntypedFormControl(this.posPriceDetail.Barcode, Validators.required),
      'NewPrice': new UntypedFormControl(this.posPriceDetail.NewPrice, Validators.required),
      'StatusID': new UntypedFormControl(this.posPriceDetail.StatusID, Validators.required),
      'Remark': new UntypedFormControl(this.posPriceDetail.Remark),
    })
  }
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  //KENDO GRID
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridDSState = {
      take: this.pageSize,
      filter: {
        logic: 'and',
        filters: [{ field: 'POSPrice', operator: 'eq', value: this.posPrice.Code }]
      }
    }
    this.filterSearchBox.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterProductName.value))
      this.filterSearchBox.filters.push(this.filterProductName)

    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterPosCode.value))
      this.filterSearchBox.filters.push(this.filterPosCode)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
  }
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.GetListPOSPriceAdjDetails()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.GetListPOSPriceAdjDetails()
  }
  //API  
  GetPOSPriceAdj() {
    this.loading = true;

    this.GetPOSPriceAdj_sst = this.apiService.GetPOSPriceAdj(this.posPrice.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.posPrice = res.ObjectReturn;
        this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //update
  UpdatePOSPriceAdjStatus(item: DTOPosPrice[] = [this.posPrice], statusID = this.posPrice.StatusID) {
    this.loading = true;
    var ctx = "Cập nhật trạng thái Đợt phát hành"

    this.UpdatePOSPriceAdjStatus_sst = this.apiService.UpdatePOSPriceAdjStatus(item, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        // this.posPrice.StatusID = statusID
        // this.checkProp()
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.GetPOSPriceAdj()
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
  UpdatePOSPriceAdj(prop: string[], item: DTOPosPrice = this.posPrice) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " đợt phát hành"

    this.UpdatePOSPriceAdj_sst = this.apiService.UpdatePOSPriceAdj(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.posPrice = res.ObjectReturn
        this.checkProp()
        this.isAdd = false
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
  DeletePOSPriceAdj() {
    this.loading = true;
    var ctx = "Xóa đợt phát hành"

    this.DeletePOSPriceAdj_sst = this.apiService.DeletePOSPriceAdj([this.posPrice]).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.createNew()
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
  //promotion detail
  GetListPOSPriceAdjDetails() {
    this.loading = true;

    this.GetListPOSPriceAdjDetails_sst = this.apiService.GetListPOSPriceAdjDetails(this.gridDSState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listDetail = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridDSView.next({ data: this.listDetail, total: this.total });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  GetPOSPriceAdjDetailsByBarcode() {
    this.loading = true;
    var ctx = "Tìm sản phẩm"

    this.GetPOSPriceAdjDetailsByBarcode_sst = this.apiService.GetPOSPriceAdjDetailsByBarcode(this.posPriceDetail.Barcode, this.posPrice.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.posPriceDetail = res.ObjectReturn;
        this.loadForm()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    });
  }
  UpdatePOSPriceAdjDetails(detail: any[] = [this.posPriceDetail]) {
    this.loading = true;
    this.isAddDetail = this.posPriceDetail.Code == 0
    var ctx = (this.isAddDetail ? "Thêm" : "Cập nhật") + " Sản phẩm"
    this.posPriceDetail.POSPrice = this.posPrice.Code

    this.UpdatePOSPriceAdjDetails_sst = this.apiService.UpdatePOSPriceAdjDetails(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        let arr = res.ObjectReturn as DTOPosPriceDetail[]

        arr.forEach(s => {
          if (this.isAddDetail) {
            this.total++
            this.listDetail.push(s)
          }
          else {
            var i = this.listDetail.findIndex(f => f.Code == s.Code)

            if (i > -1)
              this.listDetail.splice(i, 1, s)
          }
        })

        this.gridDSView.next({ data: this.listDetail, total: this.total });
        this.isAddDetail = false

        if (this.drawer.opened)
          this.closeForm()
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
  DeletePOSPriceAdjDetail(detail: any[] = [this.posPriceDetail]) {
    this.loading = true;
    var ctx = "Xóa Sản phẩm"
    this.posPriceDetail.POSPrice = this.posPrice.Code

    this.DeletePOSPriceAdjDetails_sst = this.apiService.DeletePOSPriceAdjDetails(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        detail.forEach(s => {
          var i = this.listDetail.findIndex(f => f.Code == s.Code)

          if (i > -1) {
            this.total--
            this.listDetail.splice(i, 1)
          }
        })
        this.gridDSView.next({ data: this.listDetail, total: this.total });
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
    var ctx = "Download Excel Template"
    var getfileName = "POSPriceAdjTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.layoutApiService.GetTemplate(getfileName).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        // this.layoutService.onError(`${ctx} thất bại`)
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, f => {
      // this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.ImportExcelPriceAdjDetails_sst = this.apiService.ImportExcelPriceAdjDetails(file, this.posPrice.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListPOSPriceAdjDetails()
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
        //   ListProperties: s.ListProperties, RowKey: (s.ObjReturn as DTOPosPriceDetail).Barcode
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
  //header1
  updatePromotionStatus(statusID: number) {
    var newPro = { ...this.posPrice }
    newPro.StatusID = statusID
    //check trước khi áp dụng
    if (newPro.StatusID == 1 || newPro.StatusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(newPro.AdjName))
        this.layoutService.onError('Vui lòng nhập Tên đợt thay đổi giá bán lẻ')
      else if (!Ps_UtilObjectService.hasValueString(newPro.AdjReason))
        this.layoutService.onError('Vui lòng nhập Lý do thay đổi giá bán lẻ')
      // else if (!Ps_UtilObjectService.hasValueString(newPro.Remark))// cho phep Ghi chu null
      //   this.layoutService.onError('Vui lòng chọn Ghi chú')

      else if (!Ps_UtilObjectService.hasValueString(newPro.EffDate))
        this.layoutService.onError('Vui lòng chọn Thời gian hiệu lực')
      else if (newPro.EffDate.valueOf() < this.tomorrow.valueOf())
        this.layoutService.onError('Thời gian hiệu lực phải bắt đầu từ Ngày mai')
      else if (this.listDetail.length == 0)
        this.layoutService.onError('Vui lòng Thêm Sản phẩm Đổi giá')
      else
        this.UpdatePOSPriceAdjStatus([newPro], statusID)
    }
    else
      this.UpdatePOSPriceAdjStatus([newPro], statusID)
  }
  createNew() {
    //object
    this.posPrice = new DTOPosPrice()
    this.posPriceDetail = new DTOPosPriceDetail()
    //array
    this.listDetail = []
    this.gridDSView.next({ data: [], total: 0 })
    //bool
    this.isLockAll = false
    this.isFilterActive = true
    this.isAdd = true
    this.isAddDetail = true
    //num
    this.total = 0
    //date
    this.today = new Date()
    this.tomorrow = Ps_UtilObjectService.addHours(this.today, 24)
    this.EffDate = null
  }
  //header
  downloadExcel() {
    this.p_DownloadExcel()
  }
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  onAdd() {
    this.isAddDetail = true;
    this.clearForm()
    this.drawer.open();
  }
  //body
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterProductName.value = searchQuery
      this.filterBarcode.value = searchQuery
      this.filterPosCode.value = searchQuery
    } else {
      this.filterProductName.value = null
      this.filterBarcode.value = null
      this.filterPosCode.value = null
    }

    this.loadFilter();
    this.GetListPOSPriceAdjDetails()
  }
  onEdit(obj: DTOPosPriceDetail) {
    this.isAddDetail = false
    this.posPriceDetail = { ...obj }
    this.loadForm()
    this.drawer.open();
  }
  onDelete() {
    this.contextIndex = 0
    this.contextName[this.contextIndex] = this.posPrice.AdjName
    this.deleteDialogOpened = true
  }
  onDeleteDetail(obj: DTOPosPriceDetail) {
    this.contextIndex = 1
    this.posPriceDetail = { ...obj };
    this.contextName[this.contextIndex] = this.posPriceDetail.ProductName
    this.deleteDialogOpened = true
  }
  //FORM button
  onSubmit(): void {
    this.form.markAllAsTouched()

    if (this.form.valid) {
      var val: DTOPosPriceDetail = this.form.getRawValue()
      this.posPriceDetail.StatusID = val.StatusID
      this.UpdatePOSPriceAdjDetails()
    }
    else
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
  }
  clearForm() {
    this.form.reset()
    this.posPriceDetail = new DTOPosPriceDetail()
    this.loadForm()
  }
  closeForm() {
    this.clearForm()
    this.drawer.close()
  }
  //POPUP
  //action dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOPosPriceDetail) {
    var item: DTOPosPriceDetail = dataItem
    var statusID = item.StatusID;
    moreActionDropdown = []
    //
    if (this.posPrice.StatusID == 2)
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
    else if (this.posPrice.StatusID != 2)
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
    //status
    if (this.posPrice.StatusID != 2 && (this.isToanQuyen || this.isAllowedToVerify)) {
      if (statusID != 1) {
        moreActionDropdown.push({ Name: "Áp dụng", Code: "redo", Link: "1", Actived: true })
      }
      else {
        moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Link: "2", Actived: true })
      }
    }
    //delete
    if (this.posPrice.StatusID == 0)
      moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Link: "delete", Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOPosPriceDetail) {
    if (item.Code > 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDeleteDetail(item)
      }
      else if (menu.Code == 'redo' || menu.Code == 'minus-outline') {
        this.posPriceDetail = { ...item }
        this.posPriceDetail.StatusID = parseInt(menu.Link)
        this.UpdatePOSPriceAdjDetails()
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil'
        || menu.Code == "eye" || menu.Link == 'detail') {
        this.onEdit(item)
      }
    }
  }
  //selection 
  getSelectionPopup(selectedList: DTOPosPriceDetail[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    if (selectedList.findIndex(s => s.StatusID == 2) != -1 && this.posPrice.StatusID != 2)
      moreActionDropdown.push({
        Name: "Áp dụng", Type: "StatusID",
        Code: "check-outline", Link: "1", Actived: true
      })

    if (selectedList.findIndex(s => s.StatusID == 1) != -1 && this.posPrice.StatusID != 2)
      moreActionDropdown.push({
        Name: "Ngưng áp dụng", Type: "StatusID",
        Code: "minus-outline", Link: "2", Actived: true
      })

    if (!this.isLockAll && this.posPrice.StatusID == 0)
      moreActionDropdown.push({
        Name: "Xóa sản phẩm", Type: "delete",
        Code: "trash", Link: "delete", Actived: true
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: DTOPosPriceDetail[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        let arr = []
        //áp dụng
        if (value == 1 || value == '1') {
          list.forEach(s => {
            if (s.StatusID != 1) {
              s.StatusID = 1
              s.POSPrice = this.posPrice.Code
              arr.push(s)
            }
          })
        }//ngưng áp dụng 
        else {
          list.forEach(s => {
            if (s.StatusID == 1) {
              s.StatusID = 2
              s.POSPrice = this.posPrice.Code
              arr.push(s)
            }
          })
        }

        if (arr.length > 0)
          this.UpdatePOSPriceAdjDetails(arr)
      }
      else if (btnType == "delete" && !this.isLockAll) {
        if (this.posPrice.StatusID == 0) {
          this.onDeleteMany()
          this.deleteList = []

          list.forEach(s => {
            if (s.StatusID == 2)
              this.deleteList.push(s)
          })
        }
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //DIALOG button
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  delete() {
    if (this.contextIndex == 0)
      this.DeletePOSPriceAdj()
    else if (this.contextIndex == 1)
      this.DeletePOSPriceAdjDetail()
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeletePOSPriceAdjDetail(this.deleteList)
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //AUTORUN
  checkProp() {
    this.isLockAll = this.posPrice.StatusID == 2 || this.posPrice.StatusID == 3
      || (this.posPrice.StatusID == 1 && this.isAllowedToCreate)//khóa khi gửi
      || (this.posPrice.StatusID == 4 && this.isAllowedToVerify)//khóa khi trả

    if (Ps_UtilObjectService.hasValueString(this.posPrice.EffDate))
      this.EffDate = new Date(this.posPrice.EffDate)
  }
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        case 'Barcode':
          if (this.drawer.opened && Ps_UtilObjectService.hasValueString(this.posPriceDetail.Barcode))
            this.GetPOSPriceAdjDetailsByBarcode()
          break
        default:
          this.UpdatePOSPriceAdj([prop])
          break
      }
    }
  }
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.posPrice[prop] = this[prop]
      this.UpdatePOSPriceAdj([prop])
    }
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  //
  calculateOnForm() {
    this.posPriceDetail.AdjPercent = this.posPriceDetail.OldPrice > 0 ?
      (this.posPriceDetail.OldPrice - this.posPriceDetail.NewPrice) / this.posPriceDetail.OldPrice : 0
  }
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.getCachePosPrice_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()
    this.ImportExcelPriceAdjDetails_sst?.unsubscribe()

    this.GetPOSPriceAdj_sst?.unsubscribe()
    this.GetPOSPriceAdjDetailsByBarcode_sst?.unsubscribe()
    this.GetListPOSPriceAdjDetails_sst?.unsubscribe()

    this.UpdatePOSPriceAdj_sst?.unsubscribe()
    this.UpdatePOSPriceAdjStatus_sst?.unsubscribe()
    this.UpdatePOSPriceAdjDetails_sst?.unsubscribe()

    this.DeletePOSPriceAdjDetails_sst?.unsubscribe()
    this.DeletePOSPriceAdj_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
