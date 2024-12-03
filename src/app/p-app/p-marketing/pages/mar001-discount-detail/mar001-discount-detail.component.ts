import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons'
import { Subject, Subscription } from 'rxjs';
import { State, CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { SelectableSettings, PageChangeEvent, GridComponent, CancelEvent, SaveEvent, RemoveEvent, EditEvent } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MatSidenav } from '@angular/material/sidenav';
import DTOPromotionProduct, { DTOPromotionType, DTODayOfWeek, DTOGroupOfCard, DTOPromotionDetail, DTOPromotionInv, DTOPromotionInvDetail } from '../../shared/dto/DTOPromotionProduct.dto';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarPromotionAPIService } from '../../shared/services/marpromotion-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import DTOListProp_ObjReturn from '../../shared/dto/DTOListProp_ObjReturn.dto';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-mar001-discount-detail',
  templateUrl: './mar001-discount-detail.component.html',
  styleUrls: ['./mar001-discount-detail.component.scss']
})

export class Mar001DiscountDetailComponent implements OnInit, OnDestroy {
  loading = false
  isLockAll = false
  isFilterActive = true
  isAdd = true
  isAddDetail = true
  isAddInv = false
  //
  isNhomtheDisable = true
  isGiovangDisable = true
  //dialog
  deleteDialogOpened = false
  importDialogOpened = false
  excelValid = true;
  //num
  curLanguage = 1
  curImgSetting = 0
  total = 0
  maxInv = 1
  //string
  contextIndex = 1
  context = ["Khuyến mãi", "Sản phẩm Khuyến mãi", "Giá trị Nhóm hàng"]
  //date
  today = new Date()
  StartDate: Date = null
  EndDate: Date = null
  lastDate: Date = null
  //object
  curPromotion = new DTOPromotionProduct()
  listDetail: DTOPromotionDetail[] = []
  curPromotionDetail = new DTOPromotionDetail()
  promotionInv = new DTOPromotionInv()
  promotionInvDetail = new DTOPromotionInvDetail()
  //icon
  faCheckCircle = faCheckCircle
  faSlidersH = faSlidersH
  //dropdown
  listTaoMoi: { text: string, value: number }[] = []

  listPromotionType: DTOPromotionType[] = []
  listWareHouse: DTOWarehouse[] = []
  listDayOfWeek: DTODayOfWeek[] = []
  listGroupOfCard: DTOGroupOfCard[] = []
  //
  defaultTaoMoi = { text: 'TẠO MỚI KHUYẾN MÃI', value: -1 }
  currentTaoMoi: { text: string, value: number } = {
    value: 1,
    text: 'KM Thường'
  }
  defaultPhanNhom: DTOPromotionType = new DTOPromotionType(-1, '- Chọn phân nhóm -')
  curPromotionType: DTOPromotionType = null
  //search box
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
  //grid nhóm hàng
  gridView = new Subject<any>();
  gridState: State = {
    skip: 0, take: 0,
  }
  //form
  allowActionDropdown = ['detail', 'edit', 'delete']
  form: UntypedFormGroup;
  searchForm: UntypedFormGroup
  formInv: UntypedFormGroup
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
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  dataPerm: DTODataPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  changePermission_sst: Subscription
  getCachePromotionDetail_sst: Subscription
  GetTemplate_sst: Subscription
  ImportExcelPromotionDetail_sst: Subscription

  GetPromotionByCode_sst: Subscription
  GetListPromotionType_sst: Subscription
  GetPromotionProduct_sst: Subscription
  GetListPromotionDetail_sst: Subscription

  GetPromotionInv_sst: Subscription
  GetPromotionListGroupOfCard_sst: Subscription
  GetPromotionWareHouse_sst: Subscription
  GetPromotionDayOfWeek_sst: Subscription

  UpdatePromotion_sst: Subscription
  UpdatePromotionDetail_sst: Subscription

  UpdatePromotionWH_sst: Subscription
  UpdatePromotionListOfCard_sst: Subscription
  UpdatePromotionDayOfWeek_sst: Subscription
  UpdatePromotionInv_sst: Subscription

  DeletePromotionDetail_sst: Subscription
  DeletePromotion_sst: Subscription
  DeletePromotionInv_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public service: MarketingService,
    public apiService: MarPromotionAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    let that = this
    this.listWareHouse.push(new DTOWarehouse(7, 'Website hachihachi.com.vn', false))
    this.listWareHouse.push(new DTOWarehouse(-1, 'Tất cả cửa hàng', false))
    //cache
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
        // this.getCache()
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
        this.getCache()
      }
    })
    //load
    this.loadForm()
    this.loadSearchForm()
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
  //load  
  getCache() {
    this.getCachePromotionDetail_sst = this.service.getCachePromotionDetail().subscribe(res => {
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

      if (!this.isAdd || this.curPromotion.Code != 0) {
        this.loadFilter()
        this.p_GetListPromotionDetail()

        if (this.curPromotion.Category == 7)
          this.p_GetPromotionInv()
      }
    })
  }
  //Kendo FORM
  loadForm() {
    if (this.curPromotionDetail.LastDate != null)
      this.lastDate = new Date(this.curPromotionDetail.LastDate)

    this.form = new UntypedFormGroup({
      'Barcode': new UntypedFormControl({ value: this.curPromotionDetail.Barcode, disabled: !this.isAddDetail || this.isLockAll }, Validators.required),
      'LastDate': new UntypedFormControl(this.lastDate, [this.checkMinDate]),
      'Quantity': new UntypedFormControl(!(this.curPromotionDetail.Quantity > 0) ? 1 : this.curPromotionDetail.Quantity, Validators.required),
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
  //KENDO GRID
  loadFilter() {
    this.pageSizes = [...this.service.pageSizes]
    this.gridDSState = {
      take: this.pageSize,
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

    if (Ps_UtilObjectService.hasValueString(this.filterPosCode.value))
      this.filterSearchBox.filters.push(this.filterPosCode)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
  }
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.p_GetListPromotionDetail()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.p_GetListPromotionDetail()
  }
  //
  loadFormInv() {
    this.formInv = new UntypedFormGroup({
      'Code': new UntypedFormControl(this.promotionInvDetail.Code),
      'Promotion': new UntypedFormControl(this.curPromotion.Code),
      'MinInv': new UntypedFormControl({
        value: this.promotionInvDetail.MinInv,
        disabled: this.promotionInv.PromotionDetails.length >= 1
      }, [Validators.required, Validators.min(this.maxInv)]),
      'MaxInv': new UntypedFormControl(this.promotionInvDetail.MaxInv),
      'ProValue': new UntypedFormControl(this.promotionInvDetail.ProValue, Validators.required),
      'IsInvAmount': new UntypedFormControl(this.promotionInv.IsInvAmount),
      'IsProAmount': new UntypedFormControl(this.promotionInv.IsProAmount),
    });
  }
  addHandler(): void {
    // Close the current edited row, if any.
    this.isAddInv = true
    this.closeEditor(this.gridNhomHang);
    // Define all editable fields validators and default values
    this.promotionInvDetail = new DTOPromotionInvDetail()
    let max = 1
    this.promotionInv.PromotionDetails.forEach(s => {
      if (s.MaxInv > max)
        max = s.MaxInv
    })
    this.maxInv = max
    this.promotionInvDetail.MinInv = max
    this.promotionInvDetail.Promotion = this.curPromotion.Code
    this.loadFormInv()
    // Show the new row editor, with the `FormGroup` build above
    // this.gridNhomHang.addRow(this.formInv)
    //add row at bottom
    this.promotionInv.PromotionDetails.push(this.promotionInvDetail)
    this.gridNhomHang.editRow(this.promotionInv.PromotionDetails.length - 1, this.formInv)
  }
  editHandler({ sender, dataItem, rowIndex }: EditEvent): void {
    this.isAddInv = false
    // Close the current edited row, if any.
    this.closeEditor(sender);
    // Define all editable fields validators and default values
    this.promotionInvDetail = { ...dataItem };
    this.loadFormInv()
    // Put the row in edit mode, with the `FormGroup` build above
    sender.editRow(rowIndex, this.formInv);
  }
  saveHandler({ sender, dataItem, formGroup, isNew, rowIndex }: SaveEvent): void {
    // Collect the current state of the form.
    // The `formGroup` argument is the same as was provided when calling `editRow`.
    const invDetail: DTOPromotionInvDetail = formGroup.getRawValue();
    const max = invDetail.MaxInv
    const min = invDetail.MinInv
    const details = this.promotionInv.PromotionDetails

    if (formGroup.invalid)
      this.layoutService.onError("'Từ giá trị' nhỏ nhất phải là: " + this.maxInv)

    else if (Ps_UtilObjectService.hasValue(max) && max > 0 && max <= min)
      this.layoutService.onError("Nếu có 'Đến giá trị' thì phải lớn hơn 'Từ giá trị' là: " + min)

    else if (!isNew && rowIndex < details.length - 1 && Ps_UtilObjectService.hasValue(max)
      && max > 0 && Ps_UtilObjectService.hasValue(details[rowIndex + 1].MaxInv)
      && details[rowIndex + 1].MaxInv > 0 && max >= details[rowIndex + 1].MaxInv)
      this.layoutService.onError("Nếu có 'Đến giá trị' thì phải nhỏ hơn 'Đến giá trị' của dòng tiếp theo là: " + details[rowIndex + 1].MaxInv)

    else {
      if (!isNew) {
        // Reflect changes immediately
        Object.assign(dataItem, invDetail);
      }
      this.promotionInvDetail = invDetail
      this.p_UpdatePromotionInv()
      sender.closeRow(rowIndex);
    }
  }
  cancelHandler({ sender, rowIndex }: CancelEvent): void {
    if (this.isAddInv) {
      this.promotionInv.PromotionDetails.pop()
      this.closeEditor(sender)
    }
    else
      // Close the editor for the given row
      this.closeEditor(sender, rowIndex);
  }
  removeHandler({ dataItem }: RemoveEvent): void {
    this.promotionInvDetail = dataItem
    this.contextIndex = 2
    this.deleteDialogOpened = true
  }
  private closeEditor(list: GridComponent, rowIndex?): void {
    list.closeRow(rowIndex);
    this.isAddInv = false
    this.promotionInvDetail = new DTOPromotionInvDetail();
    // this.formInv = undefined;
  }
  //API  
  p_GetPromotionByCode() {
    this.loading = true;

    this.GetPromotionByCode_sst = this.apiService.GetPromotionByCode(this.curPromotion.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curPromotion = res.ObjectReturn;
        this.checkPromotionProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetListPromotionType() {
    this.loading = true;

    this.GetListPromotionType_sst = this.apiService.GetListPromotionType().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPromotionType = res.ObjectReturn;
        if (!this.isAdd)
          this.p_GetPromotionByCode()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetListGroupOfCard() {
    this.loading = true;

    this.GetPromotionListGroupOfCard_sst = this.apiService.GetPromotionListGroupOfCard(this.curPromotion.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listGroupOfCard = res.ObjectReturn;
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetDayOfWeek() {
    this.loading = true;

    this.GetPromotionDayOfWeek_sst = this.apiService.GetPromotionDayOfWeek(this.curPromotion.Code).subscribe(res => {
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
  }
  p_GetDonViApDung() {
    this.loading = true;

    this.GetPromotionWareHouse_sst = this.apiService.GetPromotionWareHouse(this.curPromotion.Code).subscribe(res => {
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
  }
  //update
  p_UpdatePromotion(properties: string[], promotion: DTOPromotionProduct = this.curPromotion) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " khuyến mãi"

    if (this.isAdd)
      properties.push('Category')

    var updateDTO: DTOUpdate = {
      "DTO": promotion,
      "Properties": properties
    }
    console.log('update', promotion.StartDate)
    this.UpdatePromotion_sst = this.apiService.UpdatePromotion(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curPromotion = res.ObjectReturn

        if (this.isAdd)
          this.gridView.next({ data: this.promotionInv.PromotionDetails, total: this.promotionInv.PromotionDetails.length })

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
  p_DeletePromotion() {
    this.loading = true;
    var ctx = "Xóa khuyến mãi"

    this.DeletePromotion_sst = this.apiService.DeletePromotion(this.curPromotion).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.curPromotion = res.ObjectReturn
        this.createNewPromotion()
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
  p_UpdatePromotionWH(updateDTO: DTOWarehouse) {
    this.loading = true;
    var ctx = "Cập nhật Đơn vị áp dụng"
    updateDTO.Promotion = this.curPromotion.Code

    this.UpdatePromotionWH_sst = this.apiService.UpdatePromotionWH(updateDTO).subscribe(res => {
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
  }
  p_UpdatePromotionListOfCard(updateDTO: DTOGroupOfCard) {
    this.loading = true;
    var ctx = "Cập nhật Nhóm thẻ áp dụng"
    updateDTO.Promotion = this.curPromotion.Code

    this.UpdatePromotionListOfCard_sst = this.apiService.UpdatePromotionListOfCard(updateDTO).subscribe(res => {
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
  }
  p_UpdatePromotionDayOfWeek(updateDTO: DTODayOfWeek) {
    this.loading = true;
    var ctx = "Cập nhật Giờ vàng"
    updateDTO.Promotion = this.curPromotion.Code

    this.UpdatePromotionDayOfWeek_sst = this.apiService.UpdatePromotionDayOfWeek(updateDTO).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var wh = this.listDayOfWeek.find(s => s.Config == updateDTO.Config)

        if (wh != undefined)
          wh.Code = res.ObjectReturn.Code

        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.resetTimeOfDay(updateDTO)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
      this.resetTimeOfDay(updateDTO)
    });
  }

  resetTimeOfDay(dto: DTODayOfWeek) {
    var dow = this.listDayOfWeek.find(s => s.Code == dto.Code && s.IsSelected == dto.IsSelected)

    if (Ps_UtilObjectService.hasValue(dow)) {
      dow.From = null
      dow.To = null
    }
  }
  //promotion detail
  p_GetListPromotionDetail() {
    this.loading = true;

    this.GetListPromotionDetail_sst = this.apiService.GetListPromotionDetail(this.gridDSState).subscribe(res => {
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
  p_GetPromotionProduct() {
    this.loading = true;
    var ctx = "Tìm sản phẩm"

    this.GetPromotionProduct_sst = this.apiService.GetPromotionProduct(this.curPromotionDetail.Barcode, this.curPromotion.Code).subscribe(res => {
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
  }
  p_UpdatePromotionDetail(detail: DTOPromotionDetail[] = [this.curPromotionDetail]) {
    this.loading = true;
    this.isAddDetail = this.curPromotionDetail.Code == 0
    var ctx = (this.isAddDetail ? "Thêm" : "Cập nhật") + " Sản phẩm"
    this.curPromotionDetail.Promotion = this.curPromotion.Code

    this.UpdatePromotionDetail_sst = this.apiService.UpdatePromotionDetail(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
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
  p_DeletePromotionDetail(detail: DTOPromotionDetail[] = [this.curPromotionDetail]) {
    this.loading = true;
    var ctx = "Xóa Sản phẩm"
    this.curPromotionDetail.Promotion = this.curPromotion.Code
    // detail.Promotion = this.curPromotion.Code

    this.DeletePromotionDetail_sst = this.apiService.DeletePromotionDetail(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
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
  }
  //promotion inv  
  p_GetPromotionInv() {
    this.loading = true;

    this.GetPromotionInv_sst = this.apiService.GetPromotionInv(this.curPromotion.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.promotionInv = res.ObjectReturn;
      }
      this.gridView.next({ data: this.promotionInv.PromotionDetails, total: this.promotionInv.PromotionDetails.length });
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_UpdatePromotionInv(invDetail = this.promotionInvDetail, checkMinInv = true) {
    this.loading = true;
    var ctx = (this.isAddInv ? 'Thêm' : "Cập nhật") + " Giá trị nhóm hàng"
    invDetail.Promotion = this.curPromotion.Code

    this.UpdatePromotionInv_sst = this.apiService.UpdatePromotionInv(invDetail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        //không cần push vào list nữa vì đã push vào list trong addHandler
        var i = this.promotionInv.PromotionDetails.findIndex(s => s.Code == invDetail.Code)

        if (i > -1) {
          this.promotionInv.PromotionDetails.splice(i, 1, res.ObjectReturn)

          //check is edit ? và MaxInv có giá trị > 0
          if (!this.isAddInv && checkMinInv && i < this.promotionInv.PromotionDetails.length - 1
            && Ps_UtilObjectService.hasValue(res.ObjectReturn.MaxInv)
            && res.ObjectReturn.MaxInv > 0) {
            //tính lại giá trị TỪ của row tiếp theo nếu row tiếp theo tồn tại
            let nextRow = this.promotionInv.PromotionDetails[i + 1]
            nextRow.MinInv = res.ObjectReturn.MaxInv
            this.p_UpdatePromotionInv(nextRow)
          }
        }
        this.gridView.next({ data: this.promotionInv.PromotionDetails, total: this.promotionInv.PromotionDetails.length });
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.isAddInv = false
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  p_DeletePromotionInv() {
    this.loading = true;
    var ctx = "Xóa Giá trị nhóm hàng"
    this.promotionInvDetail.Promotion = this.curPromotion.Code

    this.DeletePromotionInv_sst = this.apiService.DeletePromotionInv(this.promotionInvDetail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var i = this.promotionInv.PromotionDetails.findIndex(s => s.Code == this.promotionInvDetail.Code)

        if (i > -1) {
          this.promotionInv.PromotionDetails.splice(i, 1)
          this.gridView.next({ data: this.promotionInv.PromotionDetails, total: this.promotionInv.PromotionDetails.length });
        }

        this.deleteDialogOpened = false
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
  //file
  GetPromotionFolderDrillWithFile() {
    return this.apiService.GetPromotionFolderDrillWithFile()
  }
  p_DownloadExcel() {
    this.loading = true
    var ctx = "Download Excel Template"
    var getfileName = "PromotionDetailsTemplate.xlsx"
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
    var ctx = "Import Excel"

    this.ImportExcelPromotionDetail_sst = this.apiService.ImportExcelPromotionDetail(file, this.curPromotion.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.loadFilter()
        this.p_GetListPromotionDetail()

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
  //header1
  updatePromotionStatus(statusID: number) {
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

      else if (this.listWareHouse.find(s => s.IsSelected) == undefined)
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
      else if (this.listDayOfWeek.find(s => (!Ps_UtilObjectService.hasValue(s.From) || (!Ps_UtilObjectService.hasValue(s.To))
      ) && s.IsSelected) != undefined) {
        this.layoutService.onError('Vui lòng chọn Từ (giờ), Đến (giờ) cho Ngày trong tuần')
      }

      else if (this.listDetail.length == 0)
        this.layoutService.onError('Vui lòng Thêm Sản phẩm Khuyến mãi')
      else
        // this.p_UpdatePromotion(['StatusID'], newPro)
        this.p_UpdatePromotionStatus([newPro], statusID)
    }
    else
      // this.p_UpdatePromotion(['StatusID'], newPro)
      this.p_UpdatePromotionStatus([newPro], statusID)
  }
  createNewPromotion() {
    //object
    this.curPromotion = new DTOPromotionProduct()
    this.curPromotion.Category = this.currentTaoMoi.value
    this.curPromotion.CategoryName = this.currentTaoMoi.text
    this.curPromotion.TypeData = 1
    this.curPromotionType = null

    this.curPromotionDetail = new DTOPromotionDetail()
    this.promotionInv = new DTOPromotionInv()
    this.promotionInvDetail = new DTOPromotionInvDetail()
    //array
    this.listDetail = []
    this.gridDSView.next({ data: [], total: 0 })
    this.gridView.next({ data: [], total: 0 })

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
    //date
    this.today = new Date()
    this.StartDate = null
    this.EndDate = null
    this.lastDate = null
  }
  onHeaderDropdownlistClick(ev) {
    this.currentTaoMoi = ev
    this.createNewPromotion()
  }
  print() {
    // if (this.currentOrder.Code > 0)
    // this.p_PrintPXK([this.currentOrder.Code])
  }
  //header2
  ExportExcel() {
    this.loading = true
    var ctx = "Export Excel Chi tiết Chương trình"
    var getfileName = 'ExportListPromotionDetails'
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.apiService.ExportListPromotionDetails(this.curPromotion.Code).subscribe(res => {
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
    this.curPromotionDetail = new DTOPromotionDetail()
    this.loadForm()
    this.drawer.open();
  }
  //body1
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
    this.layoutService.folderDialogOpened = true
  }
  deleteFile(imgSetting: number) {
    this.curPromotion[`ImageSetting${imgSetting}`] = null
    this.p_UpdatePromotion([`ImageSetting${imgSetting}`])
  }
  //body2
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
      default:
        break
    }
  }
  //body3.1
  updateListPromotionInv(prop: string, val: boolean) {
    this.promotionInv.PromotionDetails.forEach(s => {
      s[prop] = val
      this.p_UpdatePromotionInv(s, false)
    })
  }
  //body3.2
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

    this.loadFilter();
    this.p_GetListPromotionDetail()
  }
  onEdit(obj: DTOPromotionDetail) {
    this.isAddDetail = false
    this.curPromotionDetail = { ...obj }
    this.loadForm()
    this.drawer.open();
  }
  onDeletePromotion() {
    this.contextIndex = 0
    this.deleteDialogOpened = true
  }
  onDeleteDetail(obj: DTOPromotionDetail) {
    this.contextIndex = 1
    this.curPromotionDetail = { ...obj };
    this.deleteDialogOpened = true
  }
  //FORM button
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
  //POPUP
  //action dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOPromotionDetail) {
    moreActionDropdown = []
    var item: DTOPromotionDetail = dataItem
    var statusID = item.StatusID;
    //
    if (this.curPromotion.StatusID != 0)
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
    else
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
    //status
    // if (this.isToanQuyen || this.isAllowedToVerify) {
    if (statusID != 1) {
      moreActionDropdown.push({ Name: "Áp dụng", Code: "redo", Link: "1", Actived: true })
    }
    else {
      moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Link: "2", Actived: true })
    }
    // }
    //delete
    if (this.curPromotion.StatusID == 0)
      moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Link: "delete", Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOPromotionDetail) {
    if (item.Code > 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDeleteDetail(item)
      }
      else if (menu.Code == 'redo' || menu.Code == 'minus-outline') {
        this.curPromotionDetail = { ...item }
        this.curPromotionDetail.StatusID = parseInt(menu.Link)
        this.p_UpdatePromotionDetail()
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil'
        || menu.Code == "eye" || menu.Link == 'detail') {
        this.onEdit(item)
      }
    }
  }
  //selection 
  getSelectionPopup(selectedList: DTOPromotionDetail[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

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
        Name: "Xóa sản phẩm", Type: "delete",
        Code: "trash", Link: "delete", Actived: true
      })

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
              arr.push(s)
            }
          })
        }

        if (arr.length > 0)
          this.p_UpdatePromotionDetail(arr)
      }
      else if (btnType == "delete" && !this.isLockAll) {
        if (this.curPromotion.StatusID == 0) {
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
    if (this.contextIndex == 2)
      this.p_DeletePromotionInv()
    else if (this.contextIndex == 0)
      this.p_DeletePromotion()
    else if (this.contextIndex == 1)
      this.p_DeletePromotionDetail()
  }
  pickFile(e: DTOCFFile) {
    this.curPromotion[`ImageSetting${this.curImgSetting}`] = Ps_UtilObjectService.removeImgRes(e?.PathFile)
    this.layoutService.setFolderDialog(false)
    this.p_UpdatePromotion([`ImageSetting${this.curImgSetting}`])
  }
  //AUTORUN
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
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        case 'Barcode':
          if (this.drawer.opened && this.isAddDetail && Ps_UtilObjectService.hasValueString(this.curPromotionDetail.Barcode))
            this.p_GetPromotionProduct()
          break
        case 'Point':
          var gr = item as DTOGroupOfCard
          this.p_UpdatePromotionListOfCard(gr)
          break
        default:
          this.p_UpdatePromotion([prop])
          break
      }
    }
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
        if (prop == "StartDate")
          this.StartDate.setHours(0, 0, 0)
        else if (prop == "EndDate")
          this.EndDate.setHours(23, 59, 59)

        console.log(prop, this[prop])

        this.curPromotion[prop] = this[prop]
        this.p_UpdatePromotion([prop])
      }
    }
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  //
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
  isItemDisabled(itemArgs: { dataItem: DTOPromotionType; index: number }) {
    return itemArgs.dataItem.Code == -1;
  }
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }
  calculateDiscountOnForm(PriceDiscount) {
    this.curPromotionDetail.DiscountAmount = this.curPromotionDetail.Price - PriceDiscount
    this.curPromotionDetail.DiscountPercent = this.curPromotionDetail.Price > 0 ?
      this.curPromotionDetail.DiscountAmount / this.curPromotionDetail.Price * 100 : 0
  }
  setIsAddInv() {
    this.isAddInv = true
  }
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.getCachePromotionDetail_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()
    this.ImportExcelPromotionDetail_sst?.unsubscribe()

    this.GetPromotionByCode_sst?.unsubscribe()
    this.GetListPromotionType_sst?.unsubscribe()
    this.GetPromotionProduct_sst?.unsubscribe()
    this.GetListPromotionDetail_sst?.unsubscribe()

    this.GetPromotionInv_sst?.unsubscribe()
    this.GetPromotionListGroupOfCard_sst?.unsubscribe()
    this.GetPromotionWareHouse_sst?.unsubscribe()
    this.GetPromotionDayOfWeek_sst?.unsubscribe()

    this.UpdatePromotion_sst?.unsubscribe()
    this.UpdatePromotionDetail_sst?.unsubscribe()

    this.UpdatePromotionWH_sst?.unsubscribe()
    this.UpdatePromotionListOfCard_sst?.unsubscribe()
    this.UpdatePromotionDayOfWeek_sst?.unsubscribe()
    this.UpdatePromotionInv_sst?.unsubscribe()

    this.DeletePromotionDetail_sst?.unsubscribe()
    this.DeletePromotion_sst?.unsubscribe()
    this.DeletePromotionInv_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
