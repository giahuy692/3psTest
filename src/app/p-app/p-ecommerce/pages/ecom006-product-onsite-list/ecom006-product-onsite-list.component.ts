import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MatSidenav } from '@angular/material/sidenav';
import DTOChannel, { DTOChannelProduct } from '../../shared/dto/DTOChannel.dto';
import { EcomChannelAPIService } from '../../shared/services/ecom-channel-api.service';
import { EcomService } from '../../shared/services/ecom.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import DTOListProp_ObjReturn from 'src/app/p-app/p-marketing/shared/dto/DTOListProp_ObjReturn.dto';

@Component({
  selector: 'app-ecom006-product-onsite-list',
  templateUrl: './ecom006-product-onsite-list.component.html',
  styleUrls: ['./ecom006-product-onsite-list.component.scss']
})
export class Ecom006ProductOnsiteListComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true
  excelValid = true

  isAdd = true
  isAddProd = false
  //lock
  isLockAll = false
  isLockChannel = false
  isLockProd = false

  deleteDialogOpened = false
  deleteManyDialogOpened = false
  //
  total = 0
  contextIndex = 0
  context: string[] = ['Kênh bán hàng', 'Sản phẩm Onsite']
  //object
  channel = new DTOChannel()
  currentChannel = new DTOChannel()
  product = new DTOChannelProduct()
  //list
  listProduct: DTOChannelProduct[] = []
  deleteList: DTOChannelProduct[] = []
  listChannel: DTOChannel[] = []
  contextName: string[] = [this.channel.ChannelName, this.product.ProductName]
  //header2
  searchForm: UntypedFormGroup
  formSP: UntypedFormGroup;
  //FILTER
  //dropdown
  filterDropdown: CompositeFilterDescriptor = {
    logic: "and",
    filters: []
  }
  filterNoOfOnsite: FilterDescriptor = {
    field: "NoOfOnsite", operator: "eq", value: 0
  }
  filterNoOfWaiting: FilterDescriptor = {
    field: "NoOfWaiting", operator: "eq", value: 0
  }
  filterChannelCode: FilterDescriptor = {
    field: "Code", operator: "neq", value: this.channel.Code
  }
  //
  filterChannel: FilterDescriptor = {
    field: "Channel", operator: "eq", value: this.channel.Code
  }
  //header2
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterPoscode: FilterDescriptor = {
    field: "Poscode", operator: "contains", value: null
  }
  filterProductName: FilterDescriptor = {
    field: "ProductName", operator: "contains", value: null
  }
  //grid
  allowActionDropdown = ['detail', 'edit', 'delete']
  //grid
  pageSize = 25
  pageSizes = [this.pageSize]
  sort: SortDescriptor = { field: 'StatusID', dir: 'asc' }

  gridDSView = new Subject<any>();
  gridDSState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [this.sort]
  }
  //CALLBACK
  //grid data
  onPageChangeCallback: Function
  onSortChangeCallback: Function
  onFilterChangeCallback: Function
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
  //filter on grid
  listIsRightToOnsite = [{
    RightToOnsite: 'Đủ điều kiện Onsite', IsRightToOnsite: true
  }, {
    RightToOnsite: 'Chưa đủ điều kiện Onsite', IsRightToOnsite: false
  }]

  curItemIsRightToOnsite = { text: null, value: null }

  filterIsRightToOnsite: FilterDescriptor = {
    field: "IsRightToOnsite", operator: "eq", value: null
  }
  //
  listStatusID = [{
    StatusName: 'Đang soạn thảo', StatusID: 0
  }, {
    StatusName: 'Gửi duyệt', StatusID: 1
  }, {
    StatusName: 'Phê duyệt', StatusID: 2
  }, {
    StatusName: 'Ngưng hiển thị', StatusID: 3
  }, {
    StatusName: 'Trả lại', StatusID: 4
  }]

  curItemStatusID = { text: null, value: null }

  filterStatusID: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: null
  }
  //folder & file
  pickFileCallback: Function
  GetFolderCallback: Function
  uploadEventHandlerCallback: Function
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  @ViewChild('ecom006_product_onite_list') ecom006_product_onite_list
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  isAllowedToCreateProd = false
  isAllowedToVerifyProd = false
  // isAllowedToView = false
  isAllowedToViewOnly = false
  //Subscription
  changePermission_sst: Subscription
  getCacheChannelDetail_sst: Subscription
  ImportExcel_sst: Subscription
  GetTemplate_sst: Subscription
  UpdateProductQuantity_sst: Subscription

  GetChannelList_sst: Subscription
  GetChannel_sst: Subscription
  UpdateChannelStatus_sst: Subscription
  UpdateChannel_sst: Subscription
  DeleteChannel_sst: Subscription

  GetListProduct_sst: Subscription
  GetChannelProductByCode_sst: Subscription
  GetChannelProduct_sst: Subscription
  UpdateProduct_sst: Subscription
  UpdateStatusChannelProduct_sst: Subscription
  DeleteProduct_sst: Subscription
  changePermissionAPI: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    public service: EcomService,
    public apiService: EcomChannelAPIService,
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
        // [{ Action: 45, ActionName: "Tạo sản phẩm kênh bán hàng", ActionType: 4 },
        // { Action: 46, ActionName: "Duyệt sản phẩm kênh bán hàng", ActionType: 5 },
        // { Action: 47, ActionName: "Xem thông tin kênh bán hàng", ActionType: 6 }]

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToVerify = that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        //tạm thời dùng chung quyền Tạo
        // that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false        

        that.isAllowedToCreateProd = that.actionPerm.findIndex(s => s.ActionType == 4) > -1 || false
        that.isAllowedToVerifyProd = that.actionPerm.findIndex(s => s.ActionType == 5) > -1 || false
        // that.isAllowedToView = that.actionPerm.findIndex(s => s.ActionType == 6) > -1 || false
        //chỉ được xem NẾU có quyền xem VÀ ko có quyền nào khác, todo sau này xử lý thêm
        that.isAllowedToViewOnly = that.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(that.actionPerm.filter(s => s.ActionType != 6))
        // that.getCache()
      }
    })

    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        that.getCache()
			}
		})

    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    this.onFilterChangeCallback = this.filterChange.bind(this)
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
    this.getCacheChannelDetail_sst = this.service.getCacheChannelDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.channel = res
        this.isAdd = this.channel.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }
      this.GetChannelList()

      if (!this.isAdd || this.channel.Code != 0) {
        this.GetChannel()
        this.loadFilter()
        this.GetListProduct()
      }
    })
  }
  //Kendo FORM
  loadFormSanPham() {
    this.formSP = new UntypedFormGroup({
      'Barcode': new UntypedFormControl(this.product.Barcode, Validators.required),
      'MinQty': new UntypedFormControl(this.product.MinQty, Validators.required),
      'MaxQty': new UntypedFormControl(this.product.MaxQty, Validators.required),
    })
  }
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridDSState.take = this.pageSize

    this.filterChannel.value = this.channel.Code
    this.gridDSState.filter.filters = [this.filterChannel]
    this.filterSearchBox.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterPoscode.value))
      this.filterSearchBox.filters.push(this.filterPoscode)

    if (Ps_UtilObjectService.hasValueString(this.filterProductName.value))
      this.filterSearchBox.filters.push(this.filterProductName)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
    //grid header
    if (Ps_UtilObjectService.hasValue(this.filterStatusID.value))
      this.gridDSState.filter.filters.push(this.filterStatusID)

    if (Ps_UtilObjectService.hasValue(this.filterIsRightToOnsite.value))
      this.gridDSState.filter.filters.push(this.filterIsRightToOnsite)
  }
  resetFilter() {
    // //header2
    this.searchForm.get('SearchQuery').setValue(null)
    this.filterBarcode.value = null
    this.filterProductName.value = null
    this.filterPoscode.value = null

    this.gridDSState.sort = [this.sort]
    this.loadFilter()
    this.GetListProduct()
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.GetListProduct()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.GetListProduct()
  }
  filterChange(event: FilterDescriptor | CompositeFilterDescriptor) {
    // nếu dùng p-kendo-grid
    var ev1 = <CompositeFilterDescriptor>event
    // nếu dùng app-p-kendo-grid-dropdownlist
    var ev2 = <FilterDescriptor>event
    this.ecom006_product_onite_list.nativeElement.click()//giấu filter bằng click out

    if (Ps_UtilObjectService.hasValueString(ev1.logic)) {
      if (ev1.filters.length > 0) {
        var qwe = <CompositeFilterDescriptor>ev1.filters[0]

        if (qwe.filters.length > 0)
          ev2 = <FilterDescriptor>qwe.filters[0]
      }
    }

    if (ev2.field == "StatusID" || ev2.field == "StatusName") {
      if (Ps_UtilObjectService.hasValue(ev2.value)) {
        this.filterStatusID.value = ev2.value

        var statusID = this.listStatusID.find(s => s.StatusID == ev2.value)
        this.curItemStatusID = {
          "text": statusID != undefined ? statusID.StatusName : null,
          "value": ev2.value,
        }
      } else {
        this.filterStatusID.value = null
        this.curItemStatusID = null
      }
    }
    else if (ev2.field == "RightToOnsite" || ev2.field == "IsRightToOnsite") {
      if (Ps_UtilObjectService.hasValue(ev2.value)) {
        this.filterIsRightToOnsite.value = ev2.value

        var rightToOnsite = this.listIsRightToOnsite.find(s => s.IsRightToOnsite == ev2.value)
        this.curItemIsRightToOnsite = {
          "text": rightToOnsite != undefined ? rightToOnsite.RightToOnsite : null,
          "value": ev2.value,
        }
      } else {
        this.filterIsRightToOnsite.value = null
        this.curItemIsRightToOnsite = null
      }
    }

    this.loadFilter()
    this.GetListProduct()
  }
  //API  
  //CHANNEL
  GetChannelList() {
    this.loading = true;
    var ctx = 'Danh sách kênh bán hàng'

    var gridState: State = { ...this.layoutService.gridDSState }
    gridState.skip = 0
    gridState.take = 100
    this.filterChannelCode.value = this.channel.Code
    gridState.filter.filters = [this.filterNoOfOnsite, this.filterNoOfWaiting, this.filterChannelCode]
    gridState.filter.logic = 'and'

    this.GetChannelList_sst = this.apiService.GetChannelList(gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data)) {
          this.listChannel = res.ObjectReturn.Data;
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
  GetChannel() {
    this.loading = true;
    var ctx = 'Lấy kênh bán hàng'

    this.GetChannelList_sst = this.apiService.GetChannel(this.channel).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
          this.channel = res.ObjectReturn;
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
  UpdateChannelStatus(items: DTOChannel[] = [this.channel], statusID: number = this.channel.StatusID) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng Kênh bán hàng'

    this.UpdateChannelStatus_sst = this.apiService.UpdateChannelStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.GetChannel()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  UpdateChannel(prop: string[] = [], items: DTOChannel = this.channel) {
    this.loading = true;
    var ctx = 'Cập nhật Kênh bán hàng'

    if (prop.findIndex(s => s == 'Priority') == -1)
      prop.push('Priority')
    if (prop.findIndex(s => s == 'OrderBy') == -1)
      prop.push('OrderBy')

    this.UpdateChannelStatus_sst = this.apiService.UpdateChannel(items, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.channel = res.ObjectReturn
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  DeleteChannel(items: DTOChannel[] = [this.channel]) {
    this.loading = true;
    var ctx = 'Xóa kênh bán hàng'

    this.DeleteChannel_sst = this.apiService.DeleteChannel(items).subscribe(res => {
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

    this.GetListProduct_sst = this.apiService.GetListChannelProduct(this.gridDSState).subscribe(res => {
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

    this.GetChannelProductByCode_sst = this.apiService.GetChannelProductByCode(this.product.Barcode, this.channel.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(ctx + ' thành công')
        this.product = res.ObjectReturn;
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

    this.GetChannelProduct_sst = this.apiService.GetChannelProduct(this.product).subscribe(res => {
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
  p_UpdateProduct(prop: string[], item: DTOChannelProduct = this.product) {
    this.loading = true;
    var ctx = (this.isAddProd ? 'Thêm mới' : 'Cập nhật') + ' sản phẩm'

    this.UpdateProduct_sst = this.apiService.UpdateChannelProduct(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
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
  p_UpdateStatusChannelProduct(items: DTOChannelProduct[] = [this.product], statusID: number) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng Sản phẩm'

    this.UpdateStatusChannelProduct_sst = this.apiService.UpdateStatusChannelProduct(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListProduct()
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
  p_DeleteProduct(items: DTOChannelProduct[] = [this.product]) {
    this.loading = true;
    var ctx = "Xóa sản phẩm"

    this.DeleteProduct_sst = this.apiService.DeleteChannelProduct(items).subscribe(res => {
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
    var getfileName = 'ChannelProductTemplate.xlsx'
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
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
  }
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel Sản phẩm Onsite"

    this.apiService.ImportChannelProduct(file, this.channel.Code).subscribe(res => {
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
  //body
  updateStatus(statusID) {
    var newPro = { ...this.channel }
    //check trước khi áp dụng 
    if (statusID == 1 || statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(newPro.ImageSetting))
        this.layoutService.onError('Vui lòng chọn Icon Kênh')
      else if (!Ps_UtilObjectService.hasValueString(newPro.Brief))
        this.layoutService.onError('Vui lòng nhập Mã Kênh')
      else if (!Ps_UtilObjectService.hasValueString(newPro.ChannelName))
        this.layoutService.onError('Vui lòng nhập Tên Kênh')
      else if (!Ps_UtilObjectService.hasValue(newPro.Priority) || newPro.Priority < 1)
        this.layoutService.onError('Thứ tự phân bổ tồn kho phải lớn hơn 0')
      else if (!Ps_UtilObjectService.hasValue(newPro.OrderBy) || newPro.OrderBy < 1)
        this.layoutService.onError('Thứ tự hiển thị phải lớn hơn 0')
      else
        this.UpdateChannelStatus([newPro], statusID)
    }
    else
      this.UpdateChannelStatus([newPro], statusID)
  }
  onDeleteChannel() {
    this.contextIndex = 0
    this.contextName[0] = this.channel.ChannelName
    this.deleteDialogOpened = true
  }
  clickCheckbox(ev, prop: string, item?) {
    this.channel[prop] = ev.target.checked
    this.UpdateChannel([prop])
  }
  onDropdownlistClick(ev, prop) {
    this.currentChannel = ev
    this.channel.ParentID = this.currentChannel.Code
    this.channel.ParentName = this.currentChannel.ChannelName
    this.UpdateChannel([prop])
  }
  createNew() {
    //object
    this.channel = new DTOChannel()
    this.product = new DTOChannelProduct()
    //list
    this.listProduct = []
    this.gridDSView.next({ data: [], total: 0 })
    //bool
    this.isLockAll = false
    this.isLockChannel = false
    this.isLockProd = false
    this.checkProp()
    //
    this.isAdd = true
    this.isAddProd = false
    this.isFilterActive = true
    //num
    this.total = 0
    this.GetChannelList()
  }
  checkProp() {
    //cho phép edit khi Duyệt
    this.isLockAll = (this.isAllowedToViewOnly && !this.isToanQuyen) ||
      (this.channel.StatusID != 0 && this.channel.StatusID != 4 && this.isAllowedToCreate)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.channel.StatusID == 0 || this.channel.StatusID == 4) && this.isAllowedToVerify)//khóa khi tạo, trả nếu có quyền duyệt

    this.isLockChannel = (this.isAllowedToViewOnly && !this.isToanQuyen) || this.isAllowedToCreateProd || this.isAllowedToVerifyProd
    this.isLockProd = (this.isAllowedToViewOnly && !this.isToanQuyen) || this.isAllowedToCreate || this.isAllowedToVerify

    //this.selectable.enabled = this.channel.StatusID == 2 && (this.isToanQuyen || !this.isLockProd)
    //this.selectable.enabled = this.channel.StatusID == 2 && (this.isToanQuyen || this.isAllowedToCreate || this.isAllowedToVerify)
    this.currentChannel = this.listChannel.find(s => s.Code == this.channel.ParentID) || null
  }
  //channel img
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  pickFile(e: DTOCFFile, width, height) {
    var filePath = e?.PathFile.replace('~', '')
    this.channel.ImageSetting = filePath
    this.UpdateChannel(['ImageSetting'])
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
  syncStock(listProdID: number[] = [this.product.Product]) {
    this.loading = true
    var ctx = 'Xử lý Đồng bộ tồn'
    this.layoutService.onInfo('Đang ' + ctx + ". Đồng bộ có thể kéo dài khoảng 5 phút. Xin vui lòng chờ trước khi thử lại.", 10000)

    this.UpdateProductQuantity_sst = this.apiService.UpdateProductQuantity(listProdID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
          this.layoutService.onSuccess(ctx + ' thành công')
        }
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  syncImage() {
    this.loading = true
    var ctx = 'Xử lý Đồng bộ hình sản phẩm'

    this.UpdateProductQuantity_sst = this.marApiService.CropProductImage().subscribe(res => {
      this.loading = false;
      this.layoutService.onSuccess(ctx + ' thành công')
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
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
  getSelectionPopup(selectedList: DTOChannelProduct[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var hasRight = selectedList.findIndex(s => s.TypeData == 1 || s.TypeData == 2 ? s.IsRightToOnsite : s.TypeData == 3 || s.TypeData == 4) != -1
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreateProd) && hasRight)
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1", Actived: true, LstChild: []
      })
    //
    if (this.isToanQuyen || this.isAllowedToVerifyProd) {
      var canPheDuyet_canTraLai = selectedList.findIndex(s => (s.StatusID == 1 || s.StatusID == 3))

      if (canPheDuyet_canTraLai != -1) {
        if (hasRight)
          moreActionDropdown.push({
            Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
          })

        moreActionDropdown.push({
          Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
        })
      }
      var canStop = selectedList.findIndex(s => s.StatusID == 2)

      if (canStop != -1) {
        moreActionDropdown.push({
          Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
        })
        moreActionDropdown.push({
          Type: "syncStock", Name: "Đồng bộ tồn", Code: "redo", Link: "syncStock", Actived: true, LstChild: []
        })
      }
    }
    //delete
    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreateProd))
      moreActionDropdown.push({
        Name: "Xóa sản phẩm", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }

  onSelectedPopupBtnClick(btnType: string, list: DTOChannelProduct[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        var arr: DTOChannelProduct[] = []

        if (value == 1 || value == '1')//Gửi duyệt
          list.forEach(s => {
            if ((s.StatusID == 0 || s.StatusID == 4) &&
              (s.TypeData == 1 || s.TypeData == 2 ? s.IsRightToOnsite : s.TypeData == 3 || s.TypeData == 4)) {
              arr.push(s)
            }
          })
        else if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if ((s.StatusID == 1 || s.StatusID == 3) &&
              (s.TypeData == 1 || s.TypeData == 2 ? s.IsRightToOnsite : s.TypeData == 3 || s.TypeData == 4)) {
              s.ApprovedTime = new Date()
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

        if (Ps_UtilObjectService.hasListValue(arr))
          this.p_UpdateStatusChannelProduct(arr, value)
      }
      else if (btnType == "delete") {//Xóa
        this.onDeleteMany()
        this.deleteList = []

        list.forEach(s => {
          if (s.StatusID == 0 || s.StatusID == 4)
            this.deleteList.push(s)
        })
      }
      else if (btnType = 'syncStock') {
        var listProdID: number[] = []

        list.forEach(s => {
          if (s.StatusID == 2) {
            listProdID.push(s.Product)
          }
        })

        if (Ps_UtilObjectService.hasListValue(listProdID))
          this.syncStock(listProdID)
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOChannelProduct) {
    moreActionDropdown = []
    this.product = { ...dataItem }
    var statusID = this.product.StatusID;

    //edit
    if (this.channel.StatusID != 2 &&
      (
        (statusID != 0 && statusID != 4 && this.isAllowedToCreateProd) ||
        ((statusID == 0 || statusID == 4) && this.isAllowedToVerifyProd)
      )
      || this.isAllowedToViewOnly
    )
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if (this.channel.StatusID == 2 && (this.isToanQuyen || this.isAllowedToCreateProd) &&
      (statusID == 0 || statusID == 4) &&
      (this.product.TypeData == 1 || this.product.TypeData == 2 ? this.product.IsRightToOnsite : this.product.TypeData == 3 || this.product.TypeData == 4)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
    }
    //
    else if (this.isToanQuyen || this.isAllowedToVerifyProd) {
      if (this.channel.StatusID == 2 && statusID == 1 &&
        (this.product.TypeData == 1 || this.product.TypeData == 2 ? this.product.IsRightToOnsite : this.product.TypeData == 3 || this.product.TypeData == 4)) {
        moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
      }
      else if (this.channel.StatusID == 2 && statusID == 2) {
        moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
        moreActionDropdown.push({ Name: "Đồng bộ tồn", Code: "redo", Type: 'syncStock', Link: "syncStock", Actived: true })
      }
      else if (this.channel.StatusID == 2 && statusID == 3) {
        if (this.product.TypeData == 1 || this.product.TypeData == 2 ? this.product.IsRightToOnsite : this.product.TypeData == 3 || this.product.TypeData == 4)
          moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })

        moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })
      }
    }
    //delete
    if (this.channel.StatusID == 2 && (statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreateProd))
      moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }

  onActionDropdownClick(menu: MenuDataItem, item: DTOChannelProduct) {
    if (item.Code > 0) {
      if (menu.Type == 'StatusID') {
        var status = parseInt(menu.Link)

        if (!(item.TypeData == 1 || item.TypeData == 2 ? item.IsRightToOnsite : item.TypeData == 3 || item.TypeData == 4)
          && (status == 1 || status == 2))
          this.layoutService.onError('Sản phẩm ko đủ điều kiện Onsite')
        else {
          if (status == 2)
            item.ApprovedTime = new Date()

          this.p_UpdateStatusChannelProduct([item], status)
        }
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.product = { ...item }
        this.onEdit()
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.product = { ...item }
        this.onDeleteProduct()
      }
      else if (menu.Link == 'syncStock' || menu.Link == 'syncStock') {
        this.product = { ...item }
        this.syncStock([this.product.Product])
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
    if (this.contextIndex == 0 && this.channel.Code > 0)
      this.DeleteChannel()
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
    this.product = new DTOChannelProduct()
    this.loadFormSanPham()
    this.drawer.open()
  }
  onEdit() {
    this.isAddProd = false
    this.GetProduct()
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
          this.UpdateChannel([prop])
          break
      }
    }
  }
  onSubmitSP(): void {
    this.formSP.markAllAsTouched()

    if (this.formSP.valid) {
      if (this.product.MaxQty != 0 && this.product.MaxQty < this.product.MinQty)
        this.layoutService.onError(" Nếu Max khác 0 (không giới hạn), Max phải lớn hơn hoặc bằng Min")
      else
        this.p_UpdateProduct(['Product', 'Channel', 'MinQty', 'MaxQty'])
    }
    else
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
  }
  clearFormSanPham() {
    this.formSP.reset()
    this.product = new DTOChannelProduct()
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
    this.UpdateProductQuantity_sst?.unsubscribe()

    this.GetChannelList_sst?.unsubscribe()
    this.GetChannel_sst?.unsubscribe()
    this.UpdateChannelStatus_sst?.unsubscribe()
    this.UpdateChannel_sst?.unsubscribe()
    this.DeleteChannel_sst?.unsubscribe()

    this.GetListProduct_sst?.unsubscribe()
    this.GetChannelProductByCode_sst?.unsubscribe()
    this.GetChannelProduct_sst?.unsubscribe()
    this.UpdateProduct_sst?.unsubscribe()
    this.UpdateStatusChannelProduct_sst?.unsubscribe()
    this.DeleteProduct_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
