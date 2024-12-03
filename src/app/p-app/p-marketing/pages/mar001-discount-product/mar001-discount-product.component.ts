import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem, MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { MarPromotionAPIService } from '../../shared/services/marpromotion-api.service';
import DTOPromotionProduct from '../../shared/dto/DTOPromotionProduct.dto';
import { MarketingService } from '../../shared/services/marketing.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOConfig, Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';

@Component({
  selector: 'app-mar001-discount-product',
  templateUrl: './mar001-discount-product.component.html',
  styleUrls: ['./mar001-discount-product.component.scss']
})
export class Mar001DiscountProductComponent implements OnInit, OnDestroy {
  loading = false
  isFilterActive = true
  deleteDialogOpened = false
  deleteManyDialogOpened = false
  total = 0
  resIP = DTOConfig.appInfo.res
  //object
  listPromotion: DTOPromotionProduct[] = []
  deleteList: DTOPromotionProduct[] = []
  listWareHouse: DTOWarehouse[] = []//DTO
  curPromotion = new DTOPromotionProduct()
  //dropdown
  listTaoMoi: { text: string, value: number }[] = []

  listChuongTrinh: any[] = [{
    text: 'Tất cả',
    value: null
  }]

  listDonVi: any[] = [{
    text: 'Tất cả',
    value: null
  }, {
    text: 'Website hachihachi.com.vn',
    value: 7
  }, {
    text: 'Hệ thống cửa hàng',
    value: -1
  }]
  //default dropdown
  defaultChuongTrinh = { text: '- Chọn chương trình khuyến mãi -', value: -1 }
  defaultDonVi = { text: '- Chọn đơn vị áp dụng -', value: -1 }
  defaultTaoMoi = { text: 'TẠO MỚI KHUYẾN MÃI', value: -1 }
  //current dropdown
  currentChuongTrinh: { text: string, value: number } = null//this.listChuongTrinh[0]
  currentDonVi: { text: string, value: number } = null//this.listDonVi[0]
  currentTaoMoi: { text: string, value: number } = null//this.listTaoMoi[0]
  //header1
  dangHieuLuc_checked = true
  hetHieuLuc_checked = false
  dangHieuLuc_count = 0
  //header1
  dangSoanThao = true
  guiDuyet = false
  daDuyet = false
  ngungHienThi = false
  //header2
  searchForm: UntypedFormGroup
  //FILTER
  //header1
  filterCategory: FilterDescriptor = {
    field: "Category", operator: "eq", value: null
  }
  filterTypeData: FilterDescriptor = {
    field: "TypeData", operator: "eq", value: 1
  }
  filterRemainDay: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterRemainDay_lt0: FilterDescriptor = {
    field: "RemainDay", operator: "lt", value: 0
  }
  filterRemainDay_gte0: FilterDescriptor = {
    field: "RemainDay", operator: "gte", value: 0
  }
  //header1
  filterStatusID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterDangSoanThao: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 0
  }
  filterGuiDuyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 1
  }
  filterDaDuyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 2
  }
  filterNgungHienThi: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 3
  }
  //header2
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterPromotionName: FilterDescriptor = {
    field: "PromotionName", operator: "contains", value: null
  }
  filterSummary: FilterDescriptor = {
    field: "Summary", operator: "contains", value: null
  }
  filterPromotionNo: FilterDescriptor = {
    field: "PromotionNo", operator: "contains", value: null
  }
  //grid
  allowActionDropdown = ['detail', 'edit', 'delete']
  //grid
  pageSize = 25
  pageSizes = [this.pageSize]
  gridDSView = new Subject<any>();
  gridDSState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [{ field: 'StatusID', dir: 'asc' }, { field: 'RemainDay', dir: 'asc' }]
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
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  dataPerm: DTODataPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  changePermission_sst: Subscription
  changeModuleData_sst: Subscription
  GetListPromotion_stt: Subscription
  GetWarehouse_sst: Subscription
  DeletePromotion_sst: Subscription
  UpdatePromotion_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    public service: MarketingService,
    public apiService: MarPromotionAPIService,
    public layoutApiService: LayoutAPIService,
    public layoutService: LayoutService,
  ) { }

  ngOnInit(): void {
    let that = this
    //load
    this.loadSearchForm()
    this.loadFilter()

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        that.dataPerm = distinct(res.DataPermission, "Warehouse")

        // var arrNew = [{
        //   text: 'Khuyến mãi giảm giá sản phẩm',
        //   value: 5
        // }, {
        //   text: 'Thanh lý sản phẩm',
        //   value: 6
        // }, {
        //   text: 'Chiết khấu theo nhóm hàng',
        //   value: 7
        // }]

        // if (that.dataPerm.findIndex(s => s.Warehouse == 0) != -1) {
        //   this.listTaoMoi.push(...arrNew)
        // } else {
        //   if (that.dataPerm.findIndex(s => s.Warehouse == 1) != -1)
        //     this.listTaoMoi.push(arrNew[0])
        //   if (that.dataPerm.findIndex(s => s.Warehouse == 2) != -1)
        //     this.listTaoMoi.push(arrNew[1])
        //   if (that.dataPerm.findIndex(s => s.Warehouse == 3) != -1)
        //     this.listTaoMoi.push(arrNew[2])
        // }

        // that.listChuongTrinh.push(...that.listTaoMoi)
        // that.getData()
      }
    })

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        var arrNew = [{
          text: 'Khuyến mãi giảm giá sản phẩm',
          value: 5
        }, {
          text: 'Thanh lý sản phẩm',
          value: 6
        }, {
          text: 'Chiết khấu theo nhóm hàng',
          value: 7
        }]

        if (that.dataPerm.findIndex(s => s.Warehouse == 0) != -1) {
          this.listTaoMoi.push(...arrNew)
        } else {
          if (that.dataPerm.findIndex(s => s.Warehouse == 1) != -1)
            this.listTaoMoi.push(arrNew[0])
          if (that.dataPerm.findIndex(s => s.Warehouse == 2) != -1)
            this.listTaoMoi.push(arrNew[1])
          if (that.dataPerm.findIndex(s => s.Warehouse == 3) != -1)
            this.listTaoMoi.push(arrNew[2])
        }

        that.listChuongTrinh.push(...that.listTaoMoi)
        that.getData()
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
  }
  getData() {
    this.p_GetDonViApDung()
    this.p_GetListPromotion()
  }
  //load  
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadFilter() {
    this.pageSizes = [...this.service.pageSizes]
    this.gridDSState.take = this.pageSize
    this.gridDSState.filter.filters = []
    this.filterRemainDay.filters = []
    this.filterSearchBox.filters = []
    this.filterStatusID.filters = []
    //
    this.gridDSState.filter.filters.push(this.filterTypeData)
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterPromotionName.value))
      this.filterSearchBox.filters.push(this.filterPromotionName)

    if (Ps_UtilObjectService.hasValueString(this.filterSummary.value))
      this.filterSearchBox.filters.push(this.filterSummary)

    if (Ps_UtilObjectService.hasValueString(this.filterPromotionNo.value))
      this.filterSearchBox.filters.push(this.filterPromotionNo)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
    //checkbox header 1
    if (this.hetHieuLuc_checked)
      this.filterRemainDay.filters.push(this.filterRemainDay_lt0)

    if (this.dangHieuLuc_checked)
      this.filterRemainDay.filters.push(this.filterRemainDay_gte0)

    if (this.filterRemainDay.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterRemainDay)
    //checkbox header 1 status id
    if (this.dangSoanThao)
      this.filterStatusID.filters.push(this.filterDangSoanThao)

    if (this.guiDuyet)
      this.filterStatusID.filters.push(this.filterGuiDuyet)

    if (this.daDuyet)
      this.filterStatusID.filters.push(this.filterDaDuyet)

    if (this.ngungHienThi)
      this.filterStatusID.filters.push(this.filterNgungHienThi)

    if (this.filterStatusID.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterStatusID)
    //dropdown header 1
    if (this.currentChuongTrinh != null) {
      this.filterCategory.value = this.currentChuongTrinh.value
      this.gridDSState.filter.filters.push(this.filterCategory)
    }
  }
  resetFilter() {
    //header1
    this.currentChuongTrinh = null
    this.currentDonVi = null
    this.filterCategory.value = null

    this.dangHieuLuc_checked = true
    this.hetHieuLuc_checked = false

    this.dangSoanThao = true
    this.guiDuyet = false
    this.daDuyet = false
    this.ngungHienThi = false
    // //header2
    this.searchForm.get('SearchQuery').setValue(null)
    this.filterPromotionName.value = null
    this.filterPromotionNo.value = null
    this.filterSummary.value = null

    this.gridDSState.sort = [{ field: 'StatusID', dir: 'asc' }, { field: 'RemainDay', dir: 'asc' }]
    this.loadFilter()
    this.p_GetListPromotion()
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.p_GetListPromotion()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.p_GetListPromotion()
  }
  //API  
  p_GetListPromotion() {
    this.loading = true;

    this.GetListPromotion_stt = this.apiService.GetListPromotion(this.gridDSState, this.currentDonVi == null ? null : this.currentDonVi.value).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPromotion = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridDSView.next({ data: this.listPromotion, total: this.total });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetDonViApDung() {
    this.loading = true;

    this.GetWarehouse_sst = this.layoutApiService.GetWarehouse().subscribe((res: DTOWarehouse[]) => {
      if (res != null) {
        this.listWareHouse = res.filter(s => s.Code != 7);
        this.listDonVi.push(...this.listWareHouse
          .map(s => { return { text: s.WHName, value: s.Code, sub: true } }))
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //update
  p_UpdatePromotion(properties: string[], promotion: DTOPromotionProduct = this.curPromotion) {
    this.loading = true;
    var ctx = "Cập nhật Khuyến mãi"

    var updateDTO: DTOUpdate = {
      "DTO": promotion,
      "Properties": properties
    }

    this.UpdatePromotion_sst = this.apiService.UpdatePromotion(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        promotion = res.ObjectReturn
        var i = this.listPromotion.findIndex(s => s.Code == promotion.Code)

        if (i > -1)
          this.listPromotion.splice(i, 1, res.ObjectReturn)

        this.gridDSView.next({ data: this.listPromotion, total: this.total });
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
  p_UpdatePromotionStatus(list: DTOPromotionProduct[] = [this.curPromotion], status: number) {
    this.loading = true;
    var ctx = "Cập nhật Tình trạng Khuyến mãi"

    let sst = this.apiService.UpdatePromotionStatus(list, status).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.p_GetListPromotion()
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
  p_DeletePromotion(promotion: DTOPromotionProduct = this.curPromotion) {
    this.loading = true;
    var ctx = "Xóa chương trình khuyến mãi"

    this.DeletePromotion_sst = this.apiService.DeletePromotion(promotion).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        var i = this.listPromotion.findIndex(s => s.Code == promotion.Code)

        if (i > -1) {
          this.total--
          this.listPromotion.splice(i, 1)
          this.gridDSView.next({ data: this.listPromotion, total: this.total });
        }
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
  //CLICK EVENT
  //header1
  onDropdownlistClick(ev, currentDropdown?: string) {
    if (currentDropdown != null) {
      if (currentDropdown != 'currentTaoMoi') {
        this[currentDropdown] = ev
        this.loadFilter()
        this.p_GetListPromotion()
      } else {
        this.currentTaoMoi = ev
        this.openPromotionDetail(true)
      }
    }
  }
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e
    this.loadFilter()
    this.p_GetListPromotion()
  }
  //header2
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterSummary.value = searchQuery
      this.filterPromotionName.value = searchQuery
      this.filterPromotionNo.value = searchQuery
    } else {
      this.filterSummary.value = null
      this.filterPromotionName.value = null
      this.filterPromotionNo.value = null
    }

    this.loadFilter();
    this.p_GetListPromotion()
  }
  //selection
  getSelectionPopup(selectedList: DTOPromotionProduct[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canGuiDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1",
        Actived: true, LstChild: []
      })
    //
    if (this.isToanQuyen || this.isAllowedToVerify) {
      var canPheDuyet_canTraLai = selectedList.findIndex(s => s.StatusID == 1 || s.StatusID == 3)

      if (canPheDuyet_canTraLai != -1) {
        moreActionDropdown.push({
          Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
        })

        moreActionDropdown.push({
          Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
        })
      }
      var canStop = selectedList.findIndex(s => s.StatusID == 2)

      if (canStop != -1)
        moreActionDropdown.push({
          Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
        })
    }
    //delete
    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Name: "Xóa chương trình", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: DTOPromotionProduct[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        var arr = []

        if (value == 1 || value == '1')//Gửi duyệt
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 4) {
              // s.StatusID = 1
              // this.p_UpdatePromotion(["StatusID"], s)
              arr.push(s)
            }
          })
        else if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              // s.StatusID = 2
              // this.p_UpdatePromotion(["StatusID"], s)
              arr.push(s)
            }
          })
        else if (value == 0 || value == '0' || value == 4 || value == '4')//Trả về
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              // s.StatusID = 4
              // this.p_UpdatePromotion(["StatusID"], s)
              arr.push(s)
            }
          })
        else if (value == 3 || value == '3')//Ngưng hiển thị
          list.forEach(s => {
            if (s.StatusID == 2) {
              // s.StatusID = 3
              // this.p_UpdatePromotion(["StatusID"], s)
              arr.push(s)
            }
          })
          
        if (Ps_UtilObjectService.hasListValue(arr))
        this.p_UpdatePromotionStatus(arr, value)
      }
      else if (btnType == "delete") {//Xóa
        this.onDeleteManyPromotion()
        this.deleteList = []

        list.forEach(s => {
          if (s.StatusID == 0)
            this.deleteList.push(s)
        })
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOPromotionProduct) {
    moreActionDropdown = []
    this.curPromotion = { ...dataItem }
    var statusID = this.curPromotion.StatusID;
    //edit
    if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate) ||
      ((statusID == 0 || statusID == 4) && this.isAllowedToVerify))
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    //status
    if ((this.isToanQuyen || this.isAllowedToCreate) && (statusID == 0 || statusID == 4)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
    }
    //
    else if (this.isToanQuyen || this.isAllowedToVerify) {
      if (statusID == 1) {
        moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
      }
      else if (statusID == 2) {
        moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
      }
      else if (statusID == 3) {
        moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })

        moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })
      }
    }
    //delete
    if ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({ Name: "Xóa chương trình", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOPromotionProduct) {
    if (item.Code > 0) {
      if (menu.Type == 'StatusID') {
        this.curPromotion = { ...item }
        // this.curPromotion.StatusID = parseInt(menu.Link)
        // this.p_UpdatePromotion(["StatusID"])
        this.p_UpdatePromotionStatus([this.curPromotion],  parseInt(menu.Link))
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.curPromotion = { ...item }
        this.openPromotionDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.curPromotion = { ...item }
        this.onDeletePromotion()
      }
    }
  }
  //delete
  onDeletePromotion() {
    this.deleteDialogOpened = true
  }
  delete() {
    if (this.curPromotion.Code > 0)
      this.p_DeletePromotion()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteManyPromotion() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.deleteList.forEach(s => {
      this.p_DeletePromotion(s)
    });
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //
  openPromotionDetail(isAdd: boolean) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      this.service.isAdd = isAdd

      if (isAdd) {
        var prom = new DTOPromotionProduct()
        prom.Category = this.currentTaoMoi.value
        prom.CategoryName = this.currentTaoMoi.text
        prom.TypeData = 1
        this.service.setCachePromotionDetail(prom)
      } else
        this.service.setCachePromotionDetail(this.curPromotion)

      var parent = item.ListMenu.find(f => f.Code.includes('discount-product')
        || f.Link.includes('discount-product'))

      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('discount-product')
          || f.Link.includes('discount-product'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('discount-detail')
            || f.Link.includes('discount-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //AUTORUN
  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.value == -1;
  }
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.changeModuleData_sst?.unsubscribe()
    this.GetWarehouse_sst?.unsubscribe()
    this.GetListPromotion_stt?.unsubscribe()
    this.UpdatePromotion_sst?.unsubscribe()
    this.DeletePromotion_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
