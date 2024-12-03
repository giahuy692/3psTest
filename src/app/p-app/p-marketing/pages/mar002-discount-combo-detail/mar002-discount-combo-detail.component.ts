import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons'
import { Subject, Subscription } from 'rxjs';
import { State, CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { SelectableSettings, PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MatSidenav } from '@angular/material/sidenav';
import DTOPromotionProduct, { DTOPromotionType, DTODayOfWeek, DTOGroupOfCard, DTOPromotionDetail } from '../../shared/dto/DTOPromotionProduct.dto';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarPromotionAPIService } from '../../shared/services/marpromotion-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DomSanitizer } from '@angular/platform-browser';
import { DTOEmbedVideo } from '../../shared/dto/DTOEmbedVideo.dto';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-mar002-discount-combo-detail',
  templateUrl: './mar002-discount-combo-detail.component.html',
  styleUrls: ['./mar002-discount-combo-detail.component.scss']
})
export class Mar002DiscountComboDetailComponent implements OnInit, OnDestroy {
  that = this
  loading = false
  isLockAll = false
  isFilterActive = true

  isAdd = true
  isAddDetail = false
  isEditCombo = false
  //
  isNhomtheDisable = true
  isGiovangDisable = true
  //dialog
  deleteDialogOpened = false
  importDialogOpened = false
  excelValid = true;
  //num
  curLanguage = 1
  curImgSetting = 1
  total = 0
  totalCombo = 0
  pickFileMode = 0//0 = combo image, 1 = editor image
  contextIndex = 1
  //string
  context = ["Khuyến mãi", "Sản phẩm Khuyến mãi", "Combo Khuyến mãi"]
  //date
  today = new Date()
  StartDate: Date = null
  EndDate: Date = null
  lastDate: Date = null
  //object
  curPromotion = new DTOPromotionProduct()
  //combo
  listCombo: DTOPromotionDetail[] = []
  curCombo = new DTOPromotionDetail()
  //product
  listDetail: DTOPromotionDetail[] = []
  curPromotionDetail = new DTOPromotionDetail()
  //icon
  faCheckCircle = faCheckCircle
  faSlidersH = faSlidersH
  //dropdown
  listTaoMoi: { text: string, value: number }[] = [{
    text: 'Chương trình Combo',
    value: 2
  }, {
    text: 'Chương trình Giftset',
    value: 3
  }]
  //
  listPromotionType: DTOPromotionType[] = []
  listWareHouse: DTOWarehouse[] = []
  listDayOfWeek: DTODayOfWeek[] = []
  listGroupOfCard: DTOGroupOfCard[] = []
  //
  defaultTaoMoi = { text: 'TẠO MỚI', value: -1 }
  currentTaoMoi: { text: string, value: number } = null
  defaultPhanNhom: DTOPromotionType = new DTOPromotionType(-1, '- Chọn phân nhóm -')
  curPromotionType: DTOPromotionType = null
  //search box combo
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterVNName: FilterDescriptor = {
    field: "VNName", operator: "contains", value: null
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterPosCode: FilterDescriptor = {
    field: "PosCode", operator: "contains", value: null
  }
  //search box san pham
  filterSearchBox2: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterVNName2: FilterDescriptor = {
    field: "VNName", operator: "contains", value: null
  }
  filterBarcode2: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterPosCode2: FilterDescriptor = {
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
      filters: [{ field: 'Promotion', operator: 'eq', value: this.curPromotion.Code }]
    }
  }
  //grid combo
  pageSizeCombo = 25
  pageSizesCombo = [this.pageSizeCombo]
  gridViewCombo = new Subject<any>();
  gridStateCombo: State = {
    skip: 0, take: this.pageSizeCombo,
    filter: {
      logic: 'and',
      filters: [{ field: 'Promotion', operator: 'eq', value: this.curPromotion.Code }]
    }
  }
  //form
  allowActionDropdown = ['detail', 'edit', 'delete']
  form: UntypedFormGroup;
  searchForm: UntypedFormGroup
  searchForm2: UntypedFormGroup
  //CALLBACK
  //folder & file
  pickFileCallback: Function
  GetFolderCallback: Function
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
  @ViewChild('gridNhomHang') gridNhomHang: GridComponent;

  curImgItem: { path: string, isThumb: boolean } = { path: '', isThumb: true }
  images: { path: string, isThumb: boolean }[] = []
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  subArr: Subscription[] = []

  constructor(
    public service: MarketingService,
    public apiService: MarPromotionAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public sanitizer: DomSanitizer,
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    let that = this
    this.listWareHouse.push(new DTOWarehouse(7, 'Website hachihachi.com.vn', false))
    this.listWareHouse.push(new DTOWarehouse(-1, 'Tất cả cửa hàng', false))
    //cache
    var changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.getCache()
      }
    })
    let changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache()
      }
    })
    this.subArr.push(changePermission_sst, changePermissonAPI)
    //load
    this.loadForm()
    this.loadSearchForm()
    this.loadSearchForm2()
    //CALLBACK
    //file
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetPromotionFolderDrillWithFile.bind(this)
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
  ngOnDestroy(): void {
    this.subArr.forEach(s => { s?.unsubscribe() })
  }
  //cache  
  getCache() {
    var getCachePromotionDetail_sst = this.service.getCachePromotionDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.curPromotion = res
        this.isAdd = this.curPromotion.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }
      this.p_GetListPromotionType()
      this.p_GetDonViApDung()
      this.p_GetListGroupOfCard()
      this.p_GetDayOfWeek()

      if (//!this.isAdd || 
        this.curPromotion.Code != 0) {
        this.loadFilterCombo()
        this.p_GetListPromotionCombo()
      }
    })
    this.subArr.push(getCachePromotionDetail_sst)
  }
  //#region Kendo FORM
  loadForm() {
    if (this.curPromotionDetail.LastDate != null)
      this.lastDate = new Date(this.curPromotionDetail.LastDate)

    this.form = new UntypedFormGroup({
      'Barcode': new UntypedFormControl({ value: this.curPromotionDetail.Barcode, disabled: !this.isAddDetail || this.isLockAll }, Validators.required),
      'LastDate': new UntypedFormControl(this.lastDate, [this.checkMinDate]),
      'Quantity': new UntypedFormControl(this.curPromotionDetail.Quantity, Validators.required),
      'MaxQuantity': new UntypedFormControl(this.curPromotionDetail.MaxQuantity),
      'PriceDiscount': new UntypedFormControl(this.curPromotionDetail.PriceDiscount, Validators.required),
      'Price': new UntypedFormControl({ value: this.curPromotionDetail.Price, disabled: true }),
      'SellQty': new UntypedFormControl({ value: this.curPromotionDetail.SellQty, disabled: true }, Validators.required),
      'StockQty': new UntypedFormControl(this.curPromotionDetail.StockQty),
      'DiscountAmount': new UntypedFormControl({ value: this.curPromotionDetail.DiscountAmount, disabled: true }),
      'DiscountPercent': new UntypedFormControl({ value: this.curPromotionDetail.DiscountPercent, disabled: true }),
      'StatusID': new UntypedFormControl(this.curPromotionDetail.StatusID),
      'Remark': new UntypedFormControl(this.curPromotionDetail.Remark),
    })
  }

  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }

  loadSearchForm2() {
    this.searchForm2 = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }

  // isValidDate = (c: FormControl) => {
  //   const DATE_REGEXP = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
  //   return DATE_REGEXP.test(c.value) || c.value === '' ? null : {
  //     validateEmail: {
  //       valid: false
  //     }
  //   };
  // }

  checkMinDate = (c: UntypedFormControl) => {
    var date = c.value
    return Ps_UtilObjectService.hasValueString(date) ?
      new Date(date).getTime() >= this.today.getTime() ? null
        : { invalidateDate: true } : null
  }
  //#endregion Kendo FORM

  //#region KENDO GRID
  loadFilterCombo() {
    this.pageSizesCombo = [...this.service.pageSizes]
    this.gridStateCombo = {
      take: this.pageSizeCombo,
      filter: {
        logic: 'and',
        filters: [{ field: 'Promotion', operator: 'eq', value: this.curPromotion.Code }]
      }
    }
    this.filterSearchBox.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterVNName.value))
      this.filterSearchBox.filters.push(this.filterVNName)

    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (this.filterSearchBox.filters.length > 0)
      this.gridStateCombo.filter.filters.push(this.filterSearchBox)
  }

  loadFilter() {
    this.pageSizes = [...this.service.pageSizes]
    this.gridDSState = {
      take: this.pageSize,
      filter: {
        logic: 'and',
        filters: [
          { field: 'Promotion', operator: 'eq', value: this.curPromotion.Code },
          { field: 'Bundle', operator: 'eq', value: this.curCombo.Code }
        ]
      }
    }
    this.filterSearchBox2.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterVNName2.value))
      this.filterSearchBox2.filters.push(this.filterVNName2)

    if (Ps_UtilObjectService.hasValueString(this.filterBarcode2.value))
      this.filterSearchBox2.filters.push(this.filterBarcode2)

    if (Ps_UtilObjectService.hasValueString(this.filterPosCode2.value))
      this.filterSearchBox2.filters.push(this.filterPosCode2)

    if (this.filterSearchBox2.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox2)
  }
  //paging
  pageChange(event: PageChangeEvent) {
    if (this.isEditCombo) {
      this.gridDSState.skip = event.skip;
      this.gridDSState.take = this.pageSize = event.take
      this.p_GetListPromotionDetail()
    } else {
      this.gridStateCombo.skip = event.skip;
      this.gridStateCombo.take = this.pageSizeCombo = event.take
      this.p_GetListPromotionCombo()
    }
  }
  sortChange(event: SortDescriptor[]) {
    if (this.isEditCombo) {
      this.gridDSState.sort = event
      this.p_GetListPromotionDetail()
    } else {
      this.gridStateCombo.sort = event
      this.p_GetListPromotionCombo()
    }
  }
  //#endregion KENDO GRID

  //API  
  //#region Promotion
  p_GetPromotionByCode() {
    this.loading = true;

    var GetPromotionByCode_sst = this.apiService.GetPromotionByCode(this.curPromotion.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curPromotion = res.ObjectReturn;
        this.checkPromotionProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(GetPromotionByCode_sst)
  }

  p_GetListPromotionType() {
    this.loading = true;

    var GetListPromotionType_sst = this.apiService.GetListPromotionType().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPromotionType = res.ObjectReturn;
        if (!this.isAdd)
          this.p_GetPromotionByCode()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(GetListPromotionType_sst)
  }

  p_UpdatePromotion(properties: string[], promotion: DTOPromotionProduct = this.curPromotion) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " khuyến mãi"

    if (this.isAdd)
      properties.push('Category')

    var updateDTO: DTOUpdate = {
      "DTO": promotion,
      "Properties": properties
    }

    var UpdatePromotion_sst = this.apiService.UpdatePromotion(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curPromotion = res.ObjectReturn

        this.checkPromotionProp()
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
    this.subArr.push(UpdatePromotion_sst)
  }

  p_UpdatePromotionStatus(list: DTOPromotionProduct[] = [this.curPromotion], status: number) {
    this.loading = true;
    var ctx = "Cập nhật Tình trạng Khuyến mãi"

    let sst = this.apiService.UpdatePromotionStatus(list, status).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.p_GetPromotionByCode()
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

  p_DeletePromotionCombo() {
    this.loading = true;
    var ctx = "Xóa khuyến mãi"

    var DeletePromotionCombo_sst = this.apiService.DeletePromotionCombo(this.curPromotion).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.createNewPromotion()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(DeletePromotionCombo_sst)
  }
  //#endregion Promotion

  //#region Promotion Extension
  p_GetListGroupOfCard() {
    this.loading = true;

    var GetPromotionListGroupOfCard_sst = this.apiService.GetPromotionListGroupOfCard(this.curPromotion.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listGroupOfCard = res.ObjectReturn;
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(GetPromotionListGroupOfCard_sst)
  }

  p_GetDayOfWeek() {
    this.loading = true;

    var GetPromotionDayOfWeek_sst = this.apiService.GetPromotionDayOfWeek(this.curPromotion.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        (res.ObjectReturn as DTODayOfWeek[]).forEach(s => {
          if (Ps_UtilObjectService.hasValueString(s.From))
            s.From = new Date(s.From)

          if (Ps_UtilObjectService.hasValueString(s.To))
            s.To = new Date(s.To)

          this.listDayOfWeek.push(s)
        })
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(GetPromotionDayOfWeek_sst)
  }

  p_GetDonViApDung() {
    this.loading = true;

    var GetPromotionWareHouse_sst = this.apiService.GetPromotionWareHouse(this.curPromotion.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var rs = (res.ObjectReturn as DTOWarehouse[])
        var rsWeb = rs.find(s => s.WH == 7)

        if (rsWeb != undefined) {
          this.listWareHouse[0].Code = rsWeb.Code
          this.listWareHouse[0].Promotion = rsWeb.Promotion
          this.listWareHouse[0].Partner = rsWeb.Partner
          this.listWareHouse[0].IsSelected = rsWeb.IsSelected
        }

        rs.forEach(s => {
          if (s.WH != 7 && this.listWareHouse.findIndex(f => f.WH == s.WH) == -1) {
            this.listWareHouse.push(s)
          }
        })
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(GetPromotionWareHouse_sst)
  }

  p_UpdatePromotionWH(updateDTO: DTOWarehouse) {
    this.loading = true;
    var ctx = "Cập nhật Đơn vị áp dụng"
    updateDTO.Promotion = this.curPromotion.Code

    var UpdatePromotionWH_sst = this.apiService.UpdatePromotionWH(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var wh = this.listWareHouse.find(s => s.WH == updateDTO.WH)

        if (wh != undefined)
          wh.Code = res.ObjectReturn.Code

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
    this.subArr.push(UpdatePromotionWH_sst)
  }

  p_UpdatePromotionListOfCard(updateDTO: DTOGroupOfCard) {
    this.loading = true;
    var ctx = "Cập nhật Nhóm thẻ áp dụng"
    updateDTO.Promotion = this.curPromotion.Code

    var UpdatePromotionListOfCard_sst = this.apiService.UpdatePromotionListOfCard(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var group = this.listGroupOfCard.find(s => s.GroupCard == updateDTO.GroupCard)

        if (group != undefined)
          group.Code = res.ObjectReturn.Code

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
    this.subArr.push(UpdatePromotionListOfCard_sst)
  }

  p_UpdatePromotionDayOfWeek(updateDTO: DTODayOfWeek) {
    this.loading = true;
    var ctx = "Cập nhật Giờ vàng"
    updateDTO.Promotion = this.curPromotion.Code

    var UpdatePromotionDayOfWeek_sst = this.apiService.UpdatePromotionDayOfWeek(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var wh = this.listDayOfWeek.find(s => s.Config == updateDTO.Config)

        if (wh != undefined)
          wh.Code = res.ObjectReturn.Code

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
    this.subArr.push(UpdatePromotionDayOfWeek_sst)
  }
  //#endregion Promotion Extension

  //#region Product in Combo
  p_GetListPromotionDetail() {
    this.loading = true;

    var GetListPromotionDetail_sst = this.apiService.GetListPromotionDetail(this.gridDSState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listDetail = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridDSView.next({ data: this.listDetail, total: this.total });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(GetListPromotionDetail_sst)
  }

  p_GetPromotionProduct() {
    if (Ps_UtilObjectService.hasValueString(this.curPromotionDetail.Barcode) && this.drawer.opened) {
      this.loading = true;
      var ctx = "Tìm sản phẩm"

      var GetComboProduct_sst = this.apiService.GetComboProduct(this.curPromotionDetail.Barcode, this.curCombo.Code, this.curPromotionDetail.Code).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.curPromotionDetail = res.ObjectReturn;
          this.layoutService.onSuccess(`${ctx} thành công`)
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

        this.loading = false;
      }, () => {
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      });
      this.subArr.push(GetComboProduct_sst)
    }
  }

  p_UpdatePromotionDetail(detail: DTOPromotionDetail[] = [this.curPromotionDetail]) {
    this.loading = true;
    this.isAddDetail = this.curPromotionDetail.Code == 0
    var ctx = (this.isAddDetail ? "Thêm" : "Cập nhật") + " Sản phẩm"
    this.curPromotionDetail.Promotion = this.curPromotion.Code
    this.curPromotionDetail.Bundle = this.curCombo.Code

    var UpdatePromotionDetail_sst = this.apiService.UpdatePromotionDetail(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.p_GetPromotionCombo()

        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        let arr = res.ObjectReturn as DTOPromotionDetail[]

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

        this.p_GetListPromotionDetail()
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
    this.subArr.push(UpdatePromotionDetail_sst)
  }

  p_DeletePromotionDetail(detail: DTOPromotionDetail[] = [this.curPromotionDetail]) {
    this.loading = true;
    var ctx = "Xóa Sản phẩm"
    this.curPromotionDetail.Promotion = this.curPromotion.Code
    // detail.Promotion = this.curPromotion.Code

    var DeletePromotionDetail_sst = this.apiService.DeletePromotionDetail(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.p_GetPromotionCombo()

        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        detail.forEach(s => {
          var i = this.listDetail.findIndex(f => f.Code == s.Code)

          if (i > -1) {
            this.total--
            this.listDetail.splice(i, 1)
            // this.gridDSView.next({ data: this.listDetail, total: this.total });
          }
        })

        // var i = this.listDetail.findIndex(s => s.Code == detail.Code)

        // if (i > -1) {
        //   this.total--
        //   this.listDetail.splice(i, 1)
        this.gridDSView.next({ data: this.listDetail, total: this.total });
        this.p_GetListPromotionDetail()
        // }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(DeletePromotionDetail_sst)
  }
  //#endregion Product in Combo

  //#region combo
  p_GetListPromotionCombo() {
    this.loading = true;

    var GetListPromotionCombo_sst = this.apiService.GetListPromotionCombo(this.gridStateCombo).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCombo = res.ObjectReturn.Data;
        this.totalCombo = res.ObjectReturn.Total
        this.gridViewCombo.next({ data: this.listCombo, total: this.totalCombo });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(GetListPromotionCombo_sst)
  }

  p_GetPromotionCombo() {
    this.loading = true;
    let that = this

    var GetPromotionCombo_sst = this.apiService.GetPromotionCombo(this.curCombo.Barcode, this.curPromotion.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curCombo = res.ObjectReturn;
        this.checkComboProp()
        var loaded = this.checkIframeLoaded(that)
        // If we are here, it is not loaded. Set things up so we check   the status again in 100 milliseconds
        if (!loaded)
          window.setTimeout(() => this.checkIframeLoaded(that), 1000);
      }

      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(GetPromotionCombo_sst)
  }

  p_UpdatePromotionCombo(combo: DTOPromotionDetail[] = [this.curCombo]) {
    this.loading = true;
    var ctx = (this.curCombo.Code == 0 ? "Thêm" : "Cập nhật") + " Combo"
    this.curCombo.Promotion = this.curPromotion.Code
    this.curCombo.TypeData = 3//this.curPromotion.TypeData

    if (this.curCombo.Code == 0)
      this.curCombo.StatusID = 0

    var UpdatePromotionCombo_sst = this.apiService.UpdatePromotionCombo(combo).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        let arr = res.ObjectReturn as DTOPromotionDetail[]

        if (this.isEditCombo) {
          this.curCombo = arr[0]
        } else {
          arr.forEach(s => {
            if (s.Code == 0) {
              this.totalCombo++
              this.listCombo.push(s)
            }
            else {
              var i = this.listCombo.findIndex(s => s.Code == s.Code)

              if (i > -1)
                this.listCombo.splice(i, 1, s)
            }
          })
          this.gridViewCombo.next({ data: this.listCombo, total: this.totalCombo });
        }

        if (this.isEditCombo)
          this.checkComboProp()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(UpdatePromotionCombo_sst)
  }

  p_DeleteCombo(combo: DTOPromotionDetail[] = [this.curCombo]) {
    this.loading = true;
    var ctx = "Xóa Combo"
    this.curCombo.Promotion = this.curPromotion.Code
    // combo.Promotion = this.curPromotion.Code

    var DeleteCombo_sst = this.apiService.DeleteCombo(combo).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.isEditCombo = false
        this.deleteDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        combo.forEach(s => {
          var i = this.listCombo.findIndex(f => f.Code == s.Code)

          if (i > -1) {
            this.totalCombo--
            this.listCombo.splice(i, 1)
            // this.gridViewCombo.next({ data: this.listCombo, total: this.totalCombo });
          }
        })
        // var i = this.listCombo.findIndex(s => s.Code == combo.Code)

        // if (i > -1) {
        //   this.totalCombo--
        //   this.listCombo.splice(i, 1)
        this.gridViewCombo.next({ data: this.listCombo, total: this.totalCombo });
        // }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
    this.subArr.push(DeleteCombo_sst)
  }
  //#endregion combo

  //#region api File & Folder
  GetPromotionFolderDrillWithFile() {
    if (this.layoutService.getFolderDialog())
      return this.apiService.GetPromotionFolderDrillWithFile()
  }

  p_DownloadExcel(getfileName) {
    this.loading = true
    var ctx = "Download Excel Template"
    // var getfileName = "PromotionDetailsTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    var GetTemplate_sst = this.layoutApiService.GetTemplate(getfileName).subscribe(res => {
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
    this.subArr.push(GetTemplate_sst)
  }

  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"
    var p_ImportExcel_sst

    if (this.isEditCombo)//import sản phẩm cho combo
      p_ImportExcel_sst = this.apiService.ImportExcelComboGiftsetProduct(file, this.curCombo.Code).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.p_GetPromotionCombo()
          this.loadFilter()
          this.p_GetListPromotionDetail()

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
    else//import combo cho promo
      p_ImportExcel_sst = this.apiService.ImportExcelListComboGiftset(file, this.curPromotion.Code).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.loadFilterCombo()
          this.p_GetListPromotionCombo()

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
    this.subArr.push(p_ImportExcel_sst)
  }
  //#endregion api File & Folder

  //CLICK EVENT
  //#region Header1
  viewDetailPromotion() {
    this.isEditCombo = false
    this.p_GetListPromotionCombo()
  }

  updatePromotionStatus(statusID: number) {
    if (this.isEditCombo) {
      var newCombo = { ...this.curCombo }
      newCombo.StatusID = this.curCombo.StatusID == 1 ? 2 : 1
      this.p_UpdatePromotionCombo([newCombo])
    } else {
      var newPro = { ...this.curPromotion }
      // newPro.StatusID = statusID
      //check trước khi áp dụng
      if (statusID == 1 || statusID == 2) {
        let warehouse7 = this.listWareHouse.find(s => s.WH == 7 && s.IsSelected) != undefined

        if (!Ps_UtilObjectService.hasValueString(newPro.PromotionNo))
          this.layoutService.onError('Vui lòng nhập Mã khuyến mãi')
        else if (!Ps_UtilObjectService.hasValueString(newPro.VNPromotion))
          this.layoutService.onError('Vui lòng nhập Tên chương trình khuyến mãi')
        else if (!Ps_UtilObjectService.hasValue(newPro.PromotionType))
          this.layoutService.onError('Vui lòng chọn Phân nhóm khuyến mãi')

        else if (!Ps_UtilObjectService.hasValueString(newPro.StartDate))
          this.layoutService.onError('Vui lòng chọn Ngày bắt đầu cho Thời gian hiệu lực')
        else if (!Ps_UtilObjectService.hasValueString(newPro.EndDate))
          this.layoutService.onError('Vui lòng chọn Ngày kết thúc cho Thời gian hiệu lực')

        else if (this.listWareHouse.find(s => s.IsSelected == true) == undefined)
          this.layoutService.onError('Vui lòng chọn Đơn vị áp dụng')
        //nếu có chọn đơn vị web hachi thì check mô tả và hình
        else if (warehouse7 && !Ps_UtilObjectService.hasValueString(newPro.VNSummary))
          this.layoutService.onError('Vui lòng nhập Mô tả chương trình khuyến mãi')
        else if (warehouse7 && !Ps_UtilObjectService.hasValueString(newPro.ImageSetting1))
          this.layoutService.onError('Vui lòng chọn Hình nhỏ')
        else if (warehouse7 && !Ps_UtilObjectService.hasValueString(newPro.ImageSetting2))
          this.layoutService.onError('Vui lòng nhập Hình lớn')

        else if (!this.isNhomtheDisable && this.listGroupOfCard.find(s => s.IsSelected == true) == undefined)
          this.layoutService.onError('Vui lòng chọn Nhóm thẻ áp dụng')
        else if (!this.isGiovangDisable && this.listDayOfWeek.find(s => s.IsSelected == true) == undefined)
          this.layoutService.onError('Vui lòng chọn Ngày trong tuần cho Giờ vàng')
        //nếu có ngày được chọn mà không ghi thời gian  
        else if (this.listDayOfWeek.find(s => (!Ps_UtilObjectService.hasValueString(s.From) || (!Ps_UtilObjectService.hasValueString(s.To)))
          && s.IsSelected) != undefined) {
          this.layoutService.onError('Vui lòng chọn Từ (giờ), Đến (giờ) cho Ngày trong tuần')
        }

        else if (this.listCombo.length == 0)
          this.layoutService.onError('Vui lòng Thêm Combo Khuyến mãi')
        else if (this.listCombo.findIndex(s => !Ps_UtilObjectService.hasListValue(s.ListProductInCombo)) != -1)
          this.layoutService.onError('Vui lòng Thêm Sản phẩm cho Combo Khuyến mãi')
        else
          // this.p_UpdatePromotion(['StatusID'], newPro)
          this.p_UpdatePromotionStatus([newPro], statusID)
      }
      else
        // this.p_UpdatePromotion(['StatusID'], newPro)
        this.p_UpdatePromotionStatus([newPro], statusID)
    }
  }

  createNewPromotion() {
    //object
    this.curPromotion = new DTOPromotionProduct()
    this.curPromotion.Category = 8
    this.curPromotion.CategoryName = 'Bó gói'
    this.curPromotionType = null
    this.curPromotion.TypeData = 2// this.currentTaoMoi.value

    this.curPromotionDetail = new DTOPromotionDetail()
    this.curCombo = new DTOPromotionDetail()
    //list san pham
    this.listDetail = []
    this.gridDSView.next({ data: [], total: 0 })
    //list combo
    this.listCombo = []
    this.gridViewCombo.next({ data: [], total: 0 })
    //
    // this.listWareHouse.map(s => s.IsSelected = false)
    this.listWareHouse = []
    this.p_GetDonViApDung()

    this.listGroupOfCard.map(s => {
      s.IsSelected = false
      s.Point = 0
    })
    this.listDayOfWeek.map(s => {
      s.IsSelected = false
      s.From = null
      s.To = null
    })
    //bool
    this.loading = false
    this.isLockAll = false
    this.isFilterActive = true
    this.isAdd = true
    this.isAddDetail = true
    this.isNhomtheDisable = true
    this.isGiovangDisable = true
    //num
    this.curLanguage = 1
    this.curImgSetting = 0
    this.total = 0
    this.totalCombo = 0
    //date
    this.today = new Date()
    this.StartDate = null
    this.EndDate = null
    this.lastDate = null
  }

  createNewPromotionCombo() {
    this.curCombo = new DTOPromotionDetail()
    this.curCombo.TypeData = 3//parseInt(JSON.stringify(this.curPromotion.TypeData))
    //img
    this.images = []
    this.curImgItem.path = ''
    this.curImgItem.isThumb = true
    //list san pham
    this.listDetail = []
    this.gridDSView.next({ data: [], total: 0 })
  }

  onHeaderDropdownlistClick(ev) {
    if (this.isEditCombo) {
      this.currentTaoMoi = ev
      this.createNewPromotionCombo()
    } else {
      this.currentTaoMoi = ev
      this.createNewPromotion()
    }
  }

  print() {
    // if (this.currentOrder.Code > 0)
    // this.p_PrintPXK([this.currentOrder.Code])
  }
  //#endregion Header1

  //#region Header2
  downloadExcel(file) {
    this.p_DownloadExcel(file)
  }

  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  onAdd() {
    this.isAddDetail = true;
    this.clearForm()
    this.curPromotionDetail = new DTOPromotionDetail()
    this.loadForm()
    this.drawer.open();
  }

  onAddCombo() {
    this.isEditCombo = true
    this.isAddDetail = false;
    this.createNewPromotionCombo()
    this.scrollToTop()
  }
  //#endregion Header2

  //#region User Event THÔNG TIN CHƯƠNG TRÌNH COMBO-GIFTSET
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }

  onDropdownlistClick(e, dropdownName: string) {
    switch (dropdownName) {
      case 'PromotionType':
        this.curPromotionType = e
        this.curPromotion.PromotionType = this.curPromotionType.Code
        // this.curPromotion.PromotionType = this.curPromotionType.TypeData
        this.curPromotion.PromotionTypeName = this.curPromotionType.PromotionType
        this.isCheckboxAllowByPromotionType()
        this.p_UpdatePromotion([dropdownName])
        break
      default:
        this.p_UpdatePromotion([dropdownName])
        break
    }
  }

  onUploadFile(imgSetting: number) {
    this.curImgSetting = imgSetting
    this.pickFileMode = 0
    this.layoutService.folderDialogOpened = true
  }

  deleteFile(imgSetting: number) {
    this.curPromotion[`ImageSetting${imgSetting}`] = null
    this.p_UpdatePromotion([`ImageSetting${imgSetting}`])
  }
  //#endregion User Event THÔNG TIN CHƯƠNG TRÌNH COMBO-GIFTSET

  //#region User Event THÔNG TIN COMBO
  clickCheckbox(ev, prop: string, item: Object) {
    switch (prop) {
      case 'WHName':
        var wh = item as DTOWarehouse
        if (wh.WH == -1) {
          this.listWareHouse.map(s => {
            if (s.WH != 7 && s.WH != -1) {
              s.IsSelected = ev.target.checked
              this.p_UpdatePromotionWH(s)
            }
          })
        } else {
          wh.IsSelected = ev.target.checked
          this.p_UpdatePromotionWH(wh)
        }
        break
      case 'GroupName':
        var gr = item as DTOGroupOfCard
        gr.IsSelected = ev.target.checked
        this.p_UpdatePromotionListOfCard(gr)
        break
      case 'DayOfWeek':
        var dow = item as DTODayOfWeek
        dow.IsSelected = ev.target.checked
        this.p_UpdatePromotionDayOfWeek(dow)
        break
      case 'IsHachi24h':
        this.curCombo.IsHachi24h = ev.target.checked
        this.p_UpdatePromotionCombo()
        break
      default:
        break
    }
  }
  //#endregion User Event THÔNG TIN COMBO

  //#region User Event DS SẢN PHẨM TRONG COMBO-GIFTSET
  onUploadComboImg() {
    this.pickFileMode = 2
    this.layoutService.folderDialogOpened = true
  }

  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterVNName.value = searchQuery
      this.filterBarcode.value = searchQuery
      this.filterPosCode.value = searchQuery
    } else {
      this.filterVNName.value = null
      this.filterBarcode.value = null
      this.filterPosCode.value = null
    }

    this.loadFilterCombo();
    this.p_GetListPromotionCombo()
  }

  search2() {
    var val = this.searchForm2.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterVNName2.value = searchQuery
      this.filterBarcode2.value = searchQuery
      this.filterPosCode2.value = searchQuery
    } else {
      this.filterVNName2.value = null
      this.filterBarcode2.value = null
      this.filterPosCode2.value = null
    }

    this.loadFilter();
    this.p_GetListPromotionDetail()
  }

  toggleComboDetail(item: DTOPromotionDetail) {
    if (item['ShowCombo'] == true)
      item['ShowCombo'] = false
    else
      item['ShowCombo'] = true
  }

  rowCallback = ({ dataItem }) => {
    var item = <DTOPromotionDetail>dataItem

    return {
      showCombo: item['ShowCombo'] == true
    }
  }
  //#endregion User Event DS SẢN PHẨM TRONG COMBO-GIFTSET

  //#region On Edit
  onEditCombo(obj: DTOPromotionDetail) {
    this.isEditCombo = true
    this.curCombo = { ...obj }
    this.p_GetPromotionCombo()
    this.loadFilter()
    this.p_GetListPromotionDetail()
    this.scrollToTop()
  }

  onEdit(obj: DTOPromotionDetail) {
    this.isAddDetail = false
    this.curPromotionDetail = { ...obj }
    this.loadForm()
    this.drawer.open();
  }
  //#endregion On Edit

  //#region On Delete
  onDeletePromotion() {
    if (this.isEditCombo)
      this.contextIndex = 2
    else
      this.contextIndex = 0

    this.deleteDialogOpened = true
  }

  onDeleteDetail(obj: DTOPromotionDetail) {
    this.contextIndex = 1
    this.curPromotionDetail = { ...obj };
    this.deleteDialogOpened = true
  }

  onDeleteCombo(obj: DTOPromotionDetail) {
    this.contextIndex = 2
    this.curCombo = { ...obj };
    this.deleteDialogOpened = true
  }
  //#endregion On Delete

  //#region FORM button
  onSubmit(): void {
    this.form.markAllAsTouched()

    if (this.form.valid) {
      var val: DTOPromotionDetail = this.form.getRawValue()
      this.curPromotionDetail.StatusID = val.StatusID
      this.curPromotionDetail.LastDate = val.LastDate
      this.p_UpdatePromotionDetail()
    }
    else if (!this.form.controls.LastDate.valid)
      this.layoutService.onError("Date sản phẩm phải lớn hơn hoặc bằng Ngày hiện tại")
    else
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
  }

  clearForm() {
    this.curPromotionDetail = new DTOPromotionDetail()
    this.form.reset()
    this.loadForm()
  }

  closeForm() {
    this.clearForm()
    this.drawer.close()
  }
  //#endregion FORM button

  //POPUP
  //#region action dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOPromotionDetail) {
    var item: DTOPromotionDetail = dataItem
    var statusID = item.StatusID;
    moreActionDropdown = []
    //nếu UI đang là Chi tiết combo thì Detail ko có update status
    //nếu UI đang là Chi tiết combo thì Detail xử lý theo Sản phẩm trong Combo
    if (this.isEditCombo) {
      if (this.curCombo.StatusID != 0)
        moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
      else if (this.curCombo.StatusID == 0)
        moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })

      if (this.curCombo.StatusID == 0)
        moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Link: "delete", Actived: true })
    }
    else {
      if (this.curPromotion.StatusID != 0)
        moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
      else if (this.curPromotion.StatusID == 0)
        moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })

      if (statusID != 2) {
        moreActionDropdown.push({ Name: "Áp dụng", Code: "redo", Link: "1", Actived: true })
      }
      else {
        moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Link: "2", Actived: true })
      }

      if (this.curPromotion.StatusID == 0)
        moreActionDropdown.push({ Name: "Xóa combo", Code: "trash", Link: "delete", Actived: true })
    }

    return moreActionDropdown
  }

  onActionDropdownClick(menu: MenuDataItem, item: DTOPromotionDetail) {
    if (item.Code != 0) {//ko dùng > 0 vì combo gen code < 0
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        if (this.isEditCombo)
          this.onDeleteDetail(item)
        else
          this.onDeleteCombo(item)
      }
      else if (menu.Code == 'redo' || menu.Code == 'minus-outline') {
        if (this.isEditCombo) {
          this.curPromotionDetail = { ...item }
          this.curPromotionDetail.StatusID = parseInt(menu.Link)
          this.p_UpdatePromotionDetail()
        } else {
          this.curCombo = { ...item }
          this.curCombo.StatusID = parseInt(menu.Link)
          this.p_UpdatePromotionCombo()
        }
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil'
        || menu.Code == "eye" || menu.Link == 'detail') {
        if (this.isEditCombo)
          this.onEdit(item)
        else
          this.onEditCombo(item)
      }
    }
  }
  //#endregion action dropdown

  //#region Selection 
  getSelectionPopup(selectedList: DTOPromotionDetail[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    if (this.isEditCombo) {

      if (!this.isLockAll)
        moreActionDropdown.push({
          Name: "Xóa sản phẩm", Type: "delete",
          Code: "trash", Link: "delete", Actived: true
        })
    }
    else {
      if (selectedList.findIndex(s => s.StatusID == 2) != -1)
        moreActionDropdown.push({
          Name: "Áp dụng", Type: "StatusID",
          Code: "check-outline", Link: "1", Actived: true
        })

      if (selectedList.findIndex(s => s.StatusID == 1) != -1)
        moreActionDropdown.push({
          Name: "Ngưng áp dụng", Type: "StatusID",
          Code: "minus-outline", Link: "2", Actived: true
        })

      if (!this.isLockAll)
        moreActionDropdown.push({
          Name: "Xóa combo", Type: "delete",
          Code: "trash", Link: "delete", Actived: true
        })
    }
    return moreActionDropdown
  }

  onSelectedPopupBtnClick(btnType: string, list: DTOPromotionDetail[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        let arr = []
        //áp dụng
        if (value == 1 || value == '1') {
          list.forEach(s => {
            if (s.StatusID != 1) {
              s.StatusID = 1
              s.Promotion = this.curPromotion.Code
              arr.push(s)
            }
          })
        }//ngưng áp dụng 
        else {
          list.forEach(s => {
            if (s.StatusID == 1) {
              s.StatusID = 2
              s.Promotion = this.curPromotion.Code
              s.Bundle = this.curCombo.Code
              arr.push(s)
            }
          })
        }

        if (arr.length > 0) {
          // this.p_UpdatePromotionDetail(arr)

          if (this.isEditCombo) {
            this.p_UpdatePromotionDetail(arr)
          }
          else {
            this.p_UpdatePromotionCombo(arr)
          }
        }
      }
      else if (btnType == "delete" && !this.isLockAll) {
        if (this.isEditCombo) {
          if (this.curCombo.StatusID == 0) {
            let arr = []

            list.forEach(s => {
              arr.push(s)
              // if (s.StatusID == 2)
              // this.p_DeletePromotionDetail(s)
            })

            if (arr.length > 0)
              this.p_DeletePromotionDetail(arr)
          }
        }
        else {
          let arr = []

          list.forEach(s => {
            arr.push(s)
            // if (s.StatusID == 2)
            // this.p_DeletePromotionDetail(s)
          })

          if (arr.length > 0)
            this.p_DeleteCombo(arr)
        }
      }
    }
  }

  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //#endregion Selection

  //#region DIALOG button
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }

  closeImportDialog() {
    this.importDialogOpened = false
    this.excelValid = true;
  }

  delete() {
    if (this.contextIndex == 0)
      this.p_DeletePromotionCombo()
    else if (this.contextIndex == 1)
      this.p_DeletePromotionDetail()
    else if (this.contextIndex == 2)
      this.p_DeleteCombo()
  }

  pickFile(e: DTOCFFile, width, height) {
    var filePath = e?.PathFile.replace('~', '')

    if (this.pickFileMode == 0) {
      this.curPromotion[`ImageSetting${this.curImgSetting}`] = filePath
      this.p_UpdatePromotion([`ImageSetting${this.curImgSetting}`])
    }
    else if (this.pickFileMode == 1) {
      this.layoutService.getEditor().embedImgURL(e, width, height)
    }
    else if (this.pickFileMode == 2) {
      this.curCombo.ImageSetting = filePath
      this.p_UpdatePromotionCombo()
    }

    this.layoutService.setFolderDialog(false)
  }
  //#endregion DIALOG button

  //#region validate
  checkPromotionProp() {
    this.isLockAll = (this.curPromotion.StatusID == 2 || this.curPromotion.StatusID == 3) || //khóa khi duyệt, ngưng
      (this.curPromotion.StatusID != 0 && this.curPromotion.StatusID != 4 && this.isAllowedToCreate && !this.isAllowedToVerify)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.curPromotion.StatusID == 0 || this.curPromotion.StatusID == 4) && this.isAllowedToVerify && !this.isAllowedToCreate)//khóa khi tạo, trả nếu có quyền duyệt

    if (Ps_UtilObjectService.hasValueString(this.curPromotion.StartDate))
      this.StartDate = new Date(this.curPromotion.StartDate)

    if (Ps_UtilObjectService.hasValueString(this.curPromotion.EndDate))
      this.EndDate = new Date(this.curPromotion.EndDate)

    this.curPromotionType = this.listPromotionType.find(s => s.Code == this.curPromotion.PromotionType)
    this.isCheckboxAllowByPromotionType()
  }

  checkComboProp() {
    this.mapImageOnSlide()
  }

  disableListGroupOfCard() {
    this.listGroupOfCard.forEach(s => {
      if (s.IsSelected) {
        s.IsSelected = false
        this.p_UpdatePromotionListOfCard(s)
      }
    })
  }

  disableListDayOfWeek() {
    this.listDayOfWeek.forEach(s => {
      if (s.IsSelected) {
        s.IsSelected = false
        this.p_UpdatePromotionDayOfWeek(s)
      }
    })
  }

  isItemDisabled(itemArgs: { dataItem: DTOPromotionType; index: number }) {
    return itemArgs.dataItem.Code == -1;
  }
  //#endregion validate

  //#region User Event
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        case 'Barcode':
          if (this.isEditCombo && this.isAddDetail && this.drawer.opened && Ps_UtilObjectService.hasValueString(this.curPromotionDetail.Barcode))
            this.p_GetPromotionProduct()
          else
            this.p_UpdatePromotionCombo()
          break
        case 'Point':
          var gr = item as DTOGroupOfCard
          this.p_UpdatePromotionListOfCard(gr)
          break
        default:
          if (this.isEditCombo)
            this.p_UpdatePromotionCombo()
          else
            this.p_UpdatePromotion([prop])
          break
      }
    }
  }

  onEditorValueChange(val) {
    switch (this.curLanguage) {
      case 1:
        this.curCombo.WebContentVN = val
        break;
      case 2:
        this.curCombo.WebContentJP = val
        break;
      default:
        this.curCombo.WebContentEN = val
        break;
    }
  }

  saveWebContent() {
    this.p_UpdatePromotionCombo()
  }

  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      if (prop == 'From' || prop == 'To') {
        let dow = item as DTODayOfWeek
        this.p_UpdatePromotionDayOfWeek(dow)
      }
      else if (prop == 'LastDate') {
        this.curPromotionDetail.LastDate = this.lastDate
      }
      else {
        this.curPromotion[prop] = this[prop]
        this.p_UpdatePromotion([prop])
      }
    }
  }

  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }

  viewImage(img) {
    this.curImgItem = { ...img }
  }

  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  //#endregion User Event

  //#region AUTORUN
  mapImageOnSlide() {
    this.images = []
    this.images.push({ path: this.curCombo.ImageSetting, isThumb: true })
    this.curImgItem = this.images[0];

    if (Ps_UtilObjectService.hasListValue(this.curCombo.ListImageInCombo))
      this.images.push(...this.curCombo.ListImageInCombo.map(e => {
        return {
          path: e.URLImage, isThumb: false,
        }
      }))
  }

  isCheckboxAllowByPromotionType() {
    // if (this.curPromotionType != null)
    if (Ps_UtilObjectService.hasValue(this.curPromotionType))
      // switch (this.curPromotionType.TypeData) {
      switch (this.curPromotionType.Code) {
        case 3:// 14://KM Shock
          this.isGiovangDisable = false
          this.isNhomtheDisable = false
          break
        // case 15:
        //   this.isNhomtheDisable = true
        //   this.isGiovangDisable = false
        //   this.disableListGroupOfCard()
        //   break
        case 2://13://KM VIP 
          this.isGiovangDisable = true//cũ
          this.isNhomtheDisable = false
          this.disableListDayOfWeek()
          break
        case 4://11://KM Giờ Vàng 
          this.isNhomtheDisable = true
          this.isGiovangDisable = false
          this.disableListGroupOfCard()
          break
        default://1// 12://KM thường // ẩn hết
          this.isGiovangDisable = true
          this.isNhomtheDisable = true
          this.disableListDayOfWeek()
          this.disableListGroupOfCard()
          break
      }
  }

  calculateDiscountOnForm(PriceDiscount) {
    this.curPromotionDetail.DiscountAmount = this.curPromotionDetail.Price - PriceDiscount
    this.curPromotionDetail.DiscountPercent = this.curPromotionDetail.Price > 0 ?
      this.curPromotionDetail.DiscountAmount / this.curPromotionDetail.Price * 100 : 0
  }

  scrollToTop() {
    document.getElementsByClassName("header-1")[0].scrollIntoView({ block: "nearest", behavior: "smooth" })
  }

  getSumQuan(arr: DTOPromotionDetail[]) {
    return arr.reduce((a, b) => a + b.Quantity, 0);
  }

  getRes(str) {
    return Ps_UtilObjectService.getImgRes(str)
  }
  //#endregion AutoRun

  //embed img  
  onUploadImg() {
    this.pickFileMode = 1
    // this.layoutService.folderDialogOpened = true//ko cần open nữa vì editor đã open
  }

  myVidNumber: number = 0

  checkIframeLoaded(myClass) {
    // let that = this
    const iframe = (document.querySelector('.k-editor-content .k-iframe') as HTMLIFrameElement)
    const iframeDoc = Ps_UtilObjectService.hasValue(iframe) ? iframe.contentDocument || iframe.contentWindow.document : null;
    // Check if loading is complete
    if (Ps_UtilObjectService.hasValue(iframeDoc) && iframeDoc.readyState == 'complete') {
      const ifr = iframe.contentDocument.querySelectorAll(`.yt_embed_vid`)

      if (Ps_UtilObjectService.hasListValue(ifr)) {
        for (var i = 0; i < ifr.length; i++) {
          const ele = ifr[i]

          var id = ele.id
          var h = ele.clientHeight
          var w = ele.clientWidth
          var src = ele.getAttribute('src')
          var index = id.replace('vid_', '');

          var item = new DTOEmbedVideo()
          item.ID = parseInt(index)
          item.Height = h
          item.Width = w
          item.URL = src

          if (myClass.myVidNumber < item.ID)
            this.myVidNumber = item.ID + 1

          myClass.addVideoHoverListener(id, index, item)
        }

        return true;
      } else
        return false
    } else
      return false
  }
}
