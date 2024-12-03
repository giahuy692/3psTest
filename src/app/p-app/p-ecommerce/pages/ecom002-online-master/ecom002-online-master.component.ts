import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { State, FilterDescriptor, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { EcomService } from '../../shared/services/ecom.service';
import { EcomAPIService } from '../../shared/services/ecom-api.service';
import { Router } from '@angular/router';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOECOMCart } from '../../shared/dto/DTOECOMCart.dto';
import { DTOWarehouse } from '../../shared/dto/DTOWarehouse';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOOrderDetail } from '../../shared/dto/DTOOrderDetail';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-ecom002-online-master',
  templateUrl: './ecom002-online-master.component.html',
  styleUrls: ['./ecom002-online-master.component.scss']
})
export class Ecom002OnlineMasterComponent implements OnInit, OnDestroy {
  loading = true
  isFilterActive = true
  tongSLDat: number = 0
  //dropdown
  listModeArray: any[] = [{
    text: 'Danh sách sản phẩm',
    value: true
  }, {
    text: 'Danh sách đơn hàng',
    value: false
  }]
  currentListMode = this.listModeArray[0]
  //sanpham
  listSanPhamChuaTaoDon: DTOOrderDetail[] = []
  listSanPhamChuaTaoDonSelected: DTOOrderDetail[] = []
  listSanPhamDaTaoDon: DTOOrderDetail[] = []
  sanPhamCanTaoDon = new DTOOrderDetail()
  //donhang
  orderList: DTOECOMCart[] = []
  listOrderMaster: DTOECOMCart[] = []
  //header1
  sanPhamChuaTaoDon_checked = true
  sanPhamDaTaoDon_checked = true
  donHangDaTao_checked = true
  sanPhamChuaTaoDon_count = 0
  sanPhamDaTaoDon_count = 0
  donHangDaTao_count = 0
  //header2
  SKU_KGV_hidden = false
  SKU_PVT_hidden = false
  SKU_KGV_checked = true
  SKU_PVT_checked = true
  SKU_KGV_count = 0
  SKU_PVT_count = 0
  effDate: Date = new Date()
  listWH: DTOWarehouse[] = []
  //
  searchForm: UntypedFormGroup
  //grid
  gridHeaderWidth = '60px'

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //grid1
  gridDSView1 = new Subject<any>();
  gridDSState1: State
  pageSize = 10
  pageSizes = [this.pageSize, 25, 50, 75, 100]
  //grid2
  gridDSView2 = new Subject<any>();
  gridDSState2: State
  pageSize2 = 25
  pageSizes2 = [this.pageSize2, 50, 75, 100]
  //grid3
  gridDSView3 = new Subject<any>();
  gridDSState3: State
  pageSize3 = 25
  pageSizes3 = [this.pageSize3, 50, 75, 100]
  //FILTER
  ///header 2
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterVNName: FilterDescriptor = {
    field: "VNName", operator: "contains", value: null
  }
  filterBrand: FilterDescriptor = {
    field: "Brand", operator: "contains", value: null
  }
  filterDocumentNo: FilterDescriptor = {
    field: "DocumentNo", operator: "contains", value: null
  }
  //ngày tạo
  filterEffDate: FilterDescriptor = {
    field: "EffDate", operator: "eq", value: this.effDate
  }
  filterRequestDate: FilterDescriptor = {
    field: "RequestDate", operator: "eq", value: this.effDate
  }
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  //Callback
  onSortChangeCallback1: Function
  onSortChangeCallback2: Function

  onPageChangeCallback1: Function
  onPageChangeCallback2: Function
  onPageChangeCallback3: Function

  getActionDropdownCallback3: Function
  onActionDropdownClickCallback3: Function

  onSelectCallback1: Function
  getSelectionPopupCallback1: Function
  onSelectedPopupBtnCallback1: Function

  onSelectCallback3: Function
  getSelectionPopupCallback3: Function
  onSelectedPopupBtnCallback3: Function
  //SUBSCRIPTION
  count: number = 0
  changePermission_sst: Subscription
  changeModuleData_sst: Subscription
  CreateTransferMater_sst: Subscription
  ExportListOfMaster_sst: Subscription
  ExportCurrentMaster_sst: Subscription

  GetECOMWH_sst: Subscription
  GetCurrentMaster_sst: Subscription
  GetONLTransferMater_sst: Subscription
  GetONLListTransferMater_sst: Subscription
  GetListOrdersByProduct_sst: Subscription

  constructor(
    public router: Router,
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public service: EcomService,
    public apiService: EcomAPIService,) { }

  ngOnInit(): void {
    let that = this
    this.effDate.setHours(0, 0, 0, 0)
    this.loadSearchForm()
    this.loadFilter()

    this.changePermission_sst = this.menuService.changePermission().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && this.count == 0) {
        that.p_GetECOMWH()
        that.getData()
        this.count++
      }
    })
    //callback
    this.getActionDropdownCallback3 = this.getActionDropdown3.bind(this)
    this.onActionDropdownClickCallback3 = this.onActionDropdownClick3.bind(this)

    this.getSelectionPopupCallback3 = this.getSelectionPopup3.bind(this)
    this.onSelectCallback3 = this.selectChange3.bind(this)
    this.onSelectedPopupBtnCallback3 = this.onSelectedPopupBtnClick3.bind(this)

    this.getSelectionPopupCallback1 = this.getSelectionPopup1.bind(this)
    this.onSelectCallback1 = this.selectChange1.bind(this)
    this.onSelectedPopupBtnCallback1 = this.onSelectedPopupBtnClick1.bind(this)

    this.onSortChangeCallback1 = this.sortChange1.bind(this)
    this.onSortChangeCallback2 = this.sortChange2.bind(this)

    this.onPageChangeCallback1 = this.pageChange1.bind(this)
    this.onPageChangeCallback2 = this.pageChange2.bind(this)
    this.onPageChangeCallback3 = this.pageChange3.bind(this)
  }
  ngOnDestroy() {
    this.changePermission_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changeModuleData_sst?.unsubscribe()
    this.CreateTransferMater_sst?.unsubscribe()
    this.ExportListOfMaster_sst?.unsubscribe()
    this.ExportCurrentMaster_sst?.unsubscribe()

    this.GetECOMWH_sst?.unsubscribe()
    this.GetCurrentMaster_sst?.unsubscribe()
    this.GetONLTransferMater_sst?.unsubscribe()
    this.GetONLListTransferMater_sst?.unsubscribe()
    this.GetListOrdersByProduct_sst?.unsubscribe()
  }
  //KENDO
  //filter
  loadFilter1() {
    this.gridDSState1 = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState1.sort = null
    this.gridDSState1.take = this.pageSize
    this.gridDSState1.filter.filters = []
    this.filterSearchBox.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterVNName.value))
      this.filterSearchBox.filters.push(this.filterVNName)

    if (Ps_UtilObjectService.hasValueString(this.filterBrand.value))
      this.filterSearchBox.filters.push(this.filterBrand)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState1.filter.filters.push(this.filterSearchBox)

    if (Ps_UtilObjectService.hasValueString(this.filterEffDate.value))
      this.gridDSState1.filter.filters.push(this.filterEffDate)
  }
  loadFilter2() {
    this.gridDSState2 = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState2.sort = null
    this.gridDSState2.take = this.pageSize2
    this.gridDSState2.filter.filters = []
    this.filterSearchBox.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterVNName.value))
      this.filterSearchBox.filters.push(this.filterVNName)

    if (Ps_UtilObjectService.hasValueString(this.filterBrand.value))
      this.filterSearchBox.filters.push(this.filterBrand)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState2.filter.filters.push(this.filterSearchBox)

    this.gridDSState2.filter.filters.push(this.filterEffDate)
  }
  loadFilter3() {
    this.gridDSState3 = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState3.sort = null
    this.gridDSState3.take = this.pageSize3
    this.gridDSState3.filter.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterDocumentNo.value))
      this.gridDSState3.filter.filters.push(this.filterDocumentNo)

    this.gridDSState3.filter.filters.push(this.filterRequestDate)
  }
  //
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchOrder': new UntypedFormControl(''),
    })
  }
  //change event
  sortChange1(event: SortDescriptor[]) {
    this.gridDSState1.sort = event
    this.p_GetCurrentMaster()
  }
  sortChange2(event: SortDescriptor[]) {
    this.gridDSState2.sort = event
    this.p_GetONLTransferMater()
  }
  pageChange1(event: PageChangeEvent) {
    this.gridDSState1.skip = event.skip;
    this.gridDSState1.take = this.pageSize = event.take
    this.p_GetCurrentMaster()
  }
  pageChange2(event: PageChangeEvent) {
    this.gridDSState2.skip = event.skip;
    this.gridDSState2.take = this.pageSize2 = event.take
    this.p_GetONLTransferMater()
  }
  pageChange3(event: PageChangeEvent) {
    this.gridDSState3.skip = event.skip;
    this.gridDSState3.take = this.pageSize3 = event.take
    this.p_GetONLListTransferMater()
  }
  //action dropdown popup
  getActionDropdown3(moreActionDropdown: MenuDataItem[]) {
    moreActionDropdown = [{
      Name: 'Download Đơn hàng', Code: 'download', Actived: true, Link: 'download'
    },
    {
      Name: 'Hoàn tất Đơn hàng', Code: 'flip-vertical', Actived: true,
    }]

    return moreActionDropdown
  }
  getSelectionPopup1() {
    var moreActionDropdown = new Array<MenuDataItem>()

    moreActionDropdown.push({
      Name: 'Tạo Đơn hàng Master', Code: 'plus', Type: 'plus',
      Link: 'plus', Actived: true, LstChild: []
    })

    return moreActionDropdown
  }
  getSelectionPopup3() {
    var moreActionDropdown = new Array<MenuDataItem>()

    moreActionDropdown.push({
      Name: 'Download Đơn hàng', Code: 'download', Type: 'download',
      Link: 'download', Actived: true, LstChild: []
    })
    moreActionDropdown.push({
      Name: 'Hoàn tất Đơn hàng', Code: 'flip-vertical', Type: 'flip-vertical',
      Link: 'flip-vertical', Actived: true, LstChild: []
    })

    return moreActionDropdown
  }
  //API
  p_GetECOMWH() {
    this.loading = true

    this.GetECOMWH_sst = this.apiService.GetECOMWH().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listWH = res.ObjectReturn
        this.getAllowListWarehouse()
      }
      this.loading = false
    }, e => {
      this.loading = false
    })
  }
  p_GetCurrentMaster() {
    this.loading = true

    this.GetCurrentMaster_sst = this.apiService.GetCurrentMaster(this.gridDSState1).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listSanPhamChuaTaoDon = res.ObjectReturn.Data
        this.gridDSView1.next({ data: this.listSanPhamChuaTaoDon, total: res.ObjectReturn.Total });
      }
      else if (Ps_UtilObjectService.hasValue(res)) {
        this.listSanPhamChuaTaoDon = res.Data
        this.gridDSView1.next({ data: this.listSanPhamChuaTaoDon, total: res.Total });
      }
      this.loading = false
    }, () => {
      this.loading = false
    })
  }
  p_GetONLTransferMater() {
    this.loading = true

    this.GetONLTransferMater_sst = this.apiService.GetONLTransferMater(this.gridDSState2).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listSanPhamDaTaoDon = res.ObjectReturn.Data
        this.gridDSView2.next({ data: this.listSanPhamDaTaoDon, total: res.ObjectReturn.Total });
      }
      this.loading = false
    }, () => {
      this.loading = false
    })
  }
  p_GetONLListTransferMater() {
    this.loading = true

    this.GetONLListTransferMater_sst = this.apiService.GetONLListTransferMater(this.gridDSState3).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listOrderMaster = res.ObjectReturn.Data
        this.gridDSView3.next({ data: this.listOrderMaster, total: res.ObjectReturn.Total });
      }
      this.loading = false
    }, () => {
      this.loading = false
    })
  }
  p_GetListOrdersByProduct() {
    this.loading = true

    this.GetListOrdersByProduct_sst = this.apiService.GetListOrdersByProduct(this.sanPhamCanTaoDon).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.orderList = res.ObjectReturn
        this.tongSLDat = this.orderList.reduce((a, b) => a + (b.TotalAmount || 0), 0)
      }
      this.loading = false
    }, () => {
      this.loading = false
    })
  }
  p_CreateTransferMater(arr: DTOOrderDetail[]) {
    this.loading = true
    var ctx = 'Tạo Đơn hàng Master'

    this.CreateTransferMater_sst = this.apiService.CreateTransferMater(arr).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.p_GetCurrentMaster()
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false
    }, () => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    })
  }
  p_ExportListOfMaster(codes: number[]) {
    this.loading = true
    var ctx = 'Download Đơn hàng'
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.ExportListOfMaster_sst = this.apiService.ExportListOfMaster(codes).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false
    })
  }
  p_ExportCurrentMaster() {
    this.loading = true
    var ctx = "Xuất ra Excel"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.ExportCurrentMaster_sst = this.apiService.ExportCurrentMaster().subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
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
  //
  loadFilter() {
    this.loadFilter1();
    this.loadFilter2();
    this.loadFilter3();
  }
  getData() {
    this.p_GetCurrentMaster()
    this.p_GetONLTransferMater()
    this.p_GetONLListTransferMater()
  }
  getAllowListWarehouse() {
    var kgv = this.listWH.findIndex(s => s.WHCode.includes('KGV'))
    this.SKU_KGV_hidden = kgv == -1

    var pvt = this.listWH.findIndex(s => s.WHCode.includes('NVT'))
    this.SKU_PVT_hidden = pvt == -1
  }
  //CLICK EVENT
  //header1
  onDropdownlistClick(e) {
    this.currentListMode = e
  }
  selectedBtnChange(e, str) {
    if (str == 'sanPhamChuaTaoDon_btn') {
      this.sanPhamChuaTaoDon_checked = e
    } else if (str == 'sanPhamDaTaoDon_btn') {
      this.sanPhamDaTaoDon_checked = e
    } else if (str == 'donHangDaTao_btn') {
      this.donHangDaTao_checked = e
    } else if (str == 'SKU_KGV_btn') {
      this.SKU_KGV_checked = e
    } else if (str == 'SKU_PVT_btn') {
      this.SKU_PVT_checked = e
    }
  }
  createOrderMaster() {
    if (this.listSanPhamChuaTaoDonSelected.length > 0)
      this.p_CreateTransferMater(this.listSanPhamChuaTaoDonSelected)
  }
  //header2
  resetFilter() {
    //header1
    this.sanPhamChuaTaoDon_checked = true
    this.sanPhamDaTaoDon_checked = true
    this.donHangDaTao_checked = true
    //header2
    this.SKU_KGV_checked = true
    this.SKU_PVT_checked = true
    this.effDate = new Date()

    this.searchForm.get('SearchOrder').setValue(null)
    this.filterBarcode.value = null
    this.filterVNName.value = null
    this.filterBrand.value = null
    this.filterDocumentNo.value = null

    this.loadFilter()
    this.getData()
  }
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchOrder

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterBarcode.value = searchQuery
      this.filterVNName.value = searchQuery
      this.filterBrand.value = searchQuery
      this.filterDocumentNo.value = searchQuery
    } else {
      this.filterBarcode.value = null
      this.filterVNName.value = null
      this.filterBrand.value = null
      this.filterDocumentNo.value = null
    }
    this.loadFilter()
    this.getData()
  }
  //popup
  onActionDropdownClick3(menu: MenuDataItem, item: DTOECOMCart) {
    if (item.Code > 0) {
      if (menu.Code == 'download') {
        this.p_ExportListOfMaster([item.Code])
      } else if (menu.Code == 'flip-vertical') {//todo
        //this.
      }
    }
  }
  onSelectedPopupBtnClick1(btnType: string, list: DTOOrderDetail[]) {
    if (list.length > 0) {
      if (btnType == 'plus') {
        this.p_CreateTransferMater(this.listSanPhamChuaTaoDonSelected)
      }
    }
  }
  onSelectedPopupBtnClick3(btnType: string, list: DTOECOMCart[]) {
    if (list.length > 0) {
      if (btnType == 'flip-vertical') {
        //todo
      } else {
        let arr = new Array<number>()

        arr = list.map(s => s.Code);
        this.p_ExportListOfMaster(arr)
      }
    }
  }
  //grid
  viewSoLuongSanPhamCanTaoDon(orderDetail: DTOOrderDetail) {
    this.sanPhamCanTaoDon = orderDetail
    this.p_GetListOrdersByProduct()
    this.drawer.open();
  }
  //drawer  
  closeForm() {
    this.orderList = []
    this.drawer.close()
  }
  openOnlineOrderDetail(order: DTOECOMCart) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      this.service.isAdd = false
      this.service.currentCartOrder = order

      var parent = item.ListMenu.find(f => f.Code.includes('ecom001-online-order')
        || f.Link.includes('ecom001-online-order'))

      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('order-detail')
          || f.Link.includes('order-detail'))

        this.menuService.activeMenu(detail)
      }
    })
  }
  //AUTO RUN
  onDatepickerChange(str) {
    if (Ps_UtilObjectService.hasValueString(str)) {
      this.filterEffDate.value = this.effDate
      this.filterRequestDate.value = this.effDate
    } else {
      this.filterEffDate.value = null
      this.filterRequestDate.value = null
    }
    this.loadFilter()
    this.getData()
  }
  rowCallback3 = ({ dataItem }) => {
    var item = <DTOECOMCart>dataItem
    if (item.FromWarehouse == 1 || item.FromWarehouseName.includes('42')) {
      return {
        hidden: !this.SKU_KGV_checked || this.SKU_KGV_hidden
      }
      // } else if (item.FromWarehouse == 6 || item.FromWarehouseName.toLowerCase().includes('pvt')) {
    } else if (item.FromWarehouse == 5 || item.FromWarehouseName.toLowerCase().includes('nvt')) {
      return {
        hidden: !this.SKU_PVT_checked || this.SKU_PVT_hidden
      }
    }
  }
  selectChange1(e, isSelectedRowitemDialogVisible) {
    this.listSanPhamChuaTaoDonSelected = Ps_UtilObjectService.hasValue(e) ? e : []
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  selectChange3(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
}
