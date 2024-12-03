import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';

@Component({
  selector: 'app-mar019-discount-hamper',
  templateUrl: './mar019-discount-hamper.component.html',
  styleUrls: ['./mar019-discount-hamper.component.scss']
})
export class Mar019DiscountHamperComponent implements OnInit, OnDestroy {

  ngUnsubscribe$ = new Subject<void>();
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
  listTaoMoi: { text: string, value: number }[] = [{
    text: 'Chương trình Combo',
    value: 2
  }, {
    text: 'Chương trình Giftset',
    value: 3
  }]

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
  defaultChuongTrinh = { text: '- Phân loại chương trình combo-giftset -', value: -1 }
  defaultDonVi = { text: '- Chọn đơn vị áp dụng -', value: -1 }
  defaultTaoMoi = { text: 'TẠO MỚI KHUYẾN MÃI', value: -1 }
  //current dropdown
  currentChuongTrinh: { text: string, value: number } = null//this.listChuongTrinh[0]
  currentDonVi: { text: string, value: number } = null//this.listDonVi[0]
  currentTaoMoi: { text: string, value: number } = null//this.listTaoMoi[0]
  //header1
  dangHieuLuc_checked = true
  hetHieuLuc_checked = false
  //header1
  dangSoanThao = true
  guiDuyet = false
  daDuyet = false
  ngungHienThi = false
  //header2
  searchForm: UntypedFormGroup
  //FILTER
  //header1
  filterTypeData: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [{ field: "TypeData", operator: "eq", value: 3 }]
  }
  filterCategory: FilterDescriptor = {
    field: "Category", operator: "eq", value: null
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
  filterTraVe: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 4
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

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false

  constructor(
    public menuService: PS_HelperMenuService,
    public service: MarketingService,
    public apiService: MarPromotionAPIService,
    public layoutApiService: LayoutAPIService,
    public layoutService: LayoutService,
  ) { }

  ngOnInit(): void {
    let that = this
    this.listChuongTrinh.push(...this.listTaoMoi)
    //load
    this.loadSearchForm()
    this.loadFilter()

    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
  
        // that.getData()
      }
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.getData();
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
    this.GetListPromotion()
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
      this.filterStatusID.filters.push(this.filterDangSoanThao,this.filterTraVe)

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
    this.gridDSState.skip = 1;
    this.loadFilter()
    this.GetListPromotion()
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.GetListPromotion()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.GetListPromotion()
  }
  //API  
  GetListPromotion() {
    this.loading = true;

    this.apiService.GetListPromotion(this.gridDSState, this.currentDonVi == null ? null : this.currentDonVi.value).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
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
  //update
  UpdatePromotion(properties: string[], promotion: DTOPromotionProduct = this.curPromotion) {
    this.loading = true;
    var ctx = "Cập nhật Khuyến mãi"

    var updateDTO: DTOUpdate = {
      "DTO": promotion,
      "Properties": properties
    }

    this.apiService.UpdatePromotion(updateDTO).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
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
  UpdatePromotionStatus(list: DTOPromotionProduct[] = [this.curPromotion], status: number) {
    this.loading = true;
    var ctx = "Cập nhật Tình trạng Khuyến mãi"

    this.apiService.UpdatePromotionStatus(list, status).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListPromotion()
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
  DeletePromotion(promotion: DTOPromotionProduct = this.curPromotion) {
    this.loading = true;
    var ctx = "Xóa chương trình khuyến mãi"

    this.apiService.DeletePromotion(promotion).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
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
        this.GetListPromotion()
      } else {
        this.currentTaoMoi = ev
        this.openPromotionDetail(true)
      }
    }
  }
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e

    this.loadFilter()
    this.GetListPromotion()
  }
  // onAdd(category?: number) {
  //   this.openPromotionDetail(true, category)
  // }
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
    this.gridDSState.skip = null;
    this.loadFilter();
    this.GetListPromotion()
  }
  //selection
  getSelectionPopup(selectedList: DTOPromotionProduct[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var canGuiDuyet_canXoa = selectedList.findIndex(s => (s.StatusID == 0 || s.StatusID == 4) && this.onCheckFields(this.curPromotion))

    if (canGuiDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1", Actived: true, LstChild: []
      })
    //
    if (this.isToanQuyen || this.isAllowedToVerify) {
      var canPheDuyet_canTraLai = selectedList.findIndex(s => (s.StatusID == 1 || s.StatusID == 3))

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
              // this.UpdatePromotion(["StatusID"], s)
              arr.push(s)
            }
          })
        else if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              // s.StatusID = 2
              // this.UpdatePromotion(["StatusID"], s)
              arr.push(s)
            }
          })
        else if (value == 0 || value == '0' || value == 4 || value == '4')//Trả về
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              // s.StatusID = 4
              // this.UpdatePromotion(["StatusID"], s)
              arr.push(s)
            }
          })
        else if (value == 3 || value == '3')//Ngưng hiển thị
          list.forEach(s => {
            if (s.StatusID == 2) {
              // s.StatusID = 3
              // this.UpdatePromotion(["StatusID"], s)
              arr.push(s)
            }
          })

        if (Ps_UtilObjectService.hasListValue(arr))
          this.UpdatePromotionStatus(arr, value)
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
    const ctx = 'CTKM';
  
    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
  
    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
  
    // Push "Chỉnh sửa" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && (statusID === 0 || statusID == 4) || canVerify && statusID === 1) {
      moreActionDropdown.push({
        Name: 'Chỉnh sửa',
        Code: 'pencil',
        Type: 'edit',
        Actived: true,
      });
    } else {
      // Nếu không thỏa điều kiện "Chỉnh sửa" thì push "Xem chi tiết"
      moreActionDropdown.push({
        Name: 'Xem chi tiết',
        Code: 'eye',
        Link: 'detail',
        Actived: true,
      });
    }
  
    // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4)) {
      if(this.onCheckFields(this.curPromotion)){
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Gửi duyệt',
          Code: 'redo',
          Link: '1',
          Actived: true,
          LstChild: [],
        });
      }
    }
  
    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    if (canVerify && (statusID === 1 || statusID === 3)) {
      if(this.onCheckFields(this.curPromotion)){
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Phê duyệt',
          Code: 'check-outline',
          Link: '2',
          Actived: true,
          LstChild: [],
        });
      }
  
      // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
      moreActionDropdown.push({
        Type: 'StatusID',
        Name: 'Trả về',
        Code: 'undo',
        Link: '4',
        Actived: true,
        LstChild: [],
      });
    }
  
    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    if (canVerify && statusID === 2) {
      moreActionDropdown.push({
        Name: 'Ngưng áp dụng',
        Type: 'StatusID',
        Code: 'minus-outline',
        Link: '3',
        Actived: true,
        LstChild: [],
      });
    }
  
    // Push "Xóa" khi có quyền tạo hoặc toàn quyền và statusID === 0
    if (canCreateOrAdmin && statusID === 0) {
      moreActionDropdown.push({
        Name: `Xóa ${ctx}`,
        Type: 'delete',
        Code: 'trash',
        Link: 'delete',
        Actived: true,
        LstChild: [],
      });
    }
  
    // Sắp xếp theo thứ tự: xem -> chỉnh sửa -> gửi -> duyệt -> ngưng -> trả về
    return moreActionDropdown;
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOPromotionProduct) {
    if (item.Code != 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.curPromotion = { ...item }
        this.onDeletePromotion()
      }
      else if (menu.Type == 'StatusID') {
        this.curPromotion = { ...item }
        // this.curPromotion.StatusID = parseInt(menu.Link)
        //this.UpdatePromotion(["StatusID"])
        this.UpdatePromotionStatus([this.curPromotion], parseInt(menu.Link))
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.curPromotion = { ...item }
        this.openPromotionDetail(false)
      }
    }
  }
  onCheckFields(promotion: DTOPromotionProduct){
    var isValid = true;
    if (!Ps_UtilObjectService.hasValueString(promotion.PromotionNo)) return isValid = false
    if (!Ps_UtilObjectService.hasValueString(promotion.VNPromotion)) return isValid = false;
    if (!Ps_UtilObjectService.hasValue(promotion.StartDate)) return isValid = false
    if (!Ps_UtilObjectService.hasValue(promotion.EndDate)) return isValid = false
    if (!Ps_UtilObjectService.hasValue(promotion.PromotionType)) return isValid = false
    if (!Ps_UtilObjectService.hasValue(promotion.VNSummary)) return isValid = false
    if (!Ps_UtilObjectService.hasValue(promotion.VNDescription)) return isValid = false
    if (!Ps_UtilObjectService.hasValue(Ps_UtilObjectService.removeImgRes(promotion.ImageSetting1))) return isValid = false
    if (!Ps_UtilObjectService.hasValue(Ps_UtilObjectService.removeImgRes(promotion.ImageSetting2))) return isValid = false
    if (!Ps_UtilObjectService.hasValue(promotion.TotalStore)) return isValid = false
    return isValid
  }
  //delete
  onDeletePromotion() {
    this.deleteDialogOpened = true
  }
  delete() {
    if (this.curPromotion.Code != 0)
      this.DeletePromotion()
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
      this.DeletePromotion(s)
    });
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //
  openPromotionDetail(isAdd: boolean) {
    this.menuService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((item: ModuleDataItem) => {
      this.service.isAdd = isAdd

      if (isAdd) {
        var prom = new DTOPromotionProduct()
        prom.TypeData = 3
        this.service.setCachePromotionDetail(prom)
      } else
        this.service.setCachePromotionDetail(this.curPromotion)

      var parent = item.ListMenu.find(f => f.Code.includes('discount-product')
        || f.Link.includes('discount-product'))

      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('mar019-discount-hamper')
          || f.Link.includes('mar019-discount-hamper'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('mar019-discount-hamper-detail')
            || f.Link.includes('mar019-discount-hamper-detail'))

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
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
