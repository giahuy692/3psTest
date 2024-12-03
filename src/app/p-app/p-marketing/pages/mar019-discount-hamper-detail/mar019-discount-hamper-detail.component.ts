import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import DTOListProp_ObjReturn from '../../shared/dto/DTOListProp_ObjReturn.dto';
import { takeUntil } from 'rxjs/operators';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MarPromotionInforComponent } from '../../shared/components/mar-discount-infor/mar-promotion-infor.component';
import { ModuleDataAdmin } from 'src/app/p-app/p-layout/p-sitemaps/menu.data-admin';
import { MarConditionApplyComponent } from '../../shared/components/mar-condition-apply/mar-condition-apply.component';

@Component({
  selector: 'app-mar019-discount-hamper-detail',
  templateUrl: './mar019-discount-hamper-detail.component.html',
  styleUrls: ['./mar019-discount-hamper-detail.component.scss']
})
export class Mar019DiscountHamperDetailComponent implements OnInit, OnDestroy {
  @ViewChild('promotionInfor') promotionInforRef: MarPromotionInforComponent;
  @ViewChild('conditionApply') conditionApplyRef: MarConditionApplyComponent;

  loading: boolean = false
  isLockAll: boolean = false
  isFilterActive: boolean = true
  isAdd: boolean = true
  isAddDetail: boolean = true
  expanded: boolean = false
  isloadPromotionInfo: boolean = false;
  //
  isGroupOfCardDisabled: boolean = true
  isGoldenHourDisabled: boolean = true
  //dialog
  deleteDialogOpened: boolean = false
  importDialogOpened: boolean = false
  excelValid: boolean = true;
  //num
  curLanguage:number = 1
  curImgSetting:number = 0
  total:number = 0
  //string
  contextIndex:number = 1
  context: string[] = ["Khuyến mãi", "Sản phẩm Khuyến mãi", "Giá trị Nhóm hàng"]
  //date
  today = new Date()
  StartDate: Date = null
  EndDate: Date = null
  lastDate: Date = null
  //object
  curPromotion: DTOPromotionProduct = new DTOPromotionProduct();
  curPromotionDetail: DTOPromotionDetail = new DTOPromotionDetail();
  //dropdown
  listTaoMoi: { text: string, value: number }[] = []
  
  listPromotionType: DTOPromotionType[] = []
  listWareHouse: DTOWarehouse[] = []
  listDayOfWeek: DTODayOfWeek[] = []
  listGroupOfCard: DTOGroupOfCard[] = []
  listHamper: DTOPromotionDetail[] = []
  //
  defaultTaoMoi = { text: 'TẠO MỚI KHUYẾN MÃI', value: -1 }
  currentTaoMoi: { text: string, value: number } = null
  defaultPhanNhom: DTOPromotionType = new DTOPromotionType(-1, '- Chọn phân nhóm -')
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
  // filterPosCode: FilterDescriptor = {
  //   field: "PosCode", operator: "contains", value: null
  // }
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

  //#permision
  justLoaded:boolean = true
  actionPerm: DTOActionPermission[] = []
  dataPerm: DTODataPermission[] = []

  isToanQuyen:boolean = false;
  isAllowedToCreate:boolean = false;
  isAllowedToVerify:boolean = false;
  isCallOnlyListHamper:boolean = true;
  //#endregion

  //#region unsubcribe
  ngUnsubscribe$ = new Subject<void>();
  //#endregion

  constructor(
    public service: MarketingService,
    public apiMarService: MarPromotionAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    let that = this
    this.listWareHouse.push(new DTOWarehouse(7, 'Website hachihachi.com.vn', false))
    this.listWareHouse.push(new DTOWarehouse(-1, 'Tất cả cửa hàng', false))
    //cache
    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        that.dataPerm = distinct(res.DataPermission, "Warehouse")

        // this.getCache()
       
      }
    })
    //load
    this.onLoadForm()
    this.onLoadSearchForm()
    //CALLBACK
    //file
    // this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.onGetPromotionFolderDrillWithFile.bind(this)
    this.uploadEventHandlerCallback = this.onUploadEventHandler.bind(this)
    //grid data    
    this.onPageChangeCallback = this.onPageChange.bind(this)
    this.onSortChangeCallback = this.onSortChange.bind(this)
    //action dropdown    
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.onGetActionDropdown.bind(this)
    //select
    this.getSelectionPopupCallback = this.onGetSelectionPopup.bind(this)
    this.onSelectCallback = this.onSselectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }

  //Kendo FORM
  onLoadForm() {
    if (this.curPromotionDetail.LastDate != null)
      this.lastDate = new Date(this.curPromotionDetail.LastDate)

    this.form = new UntypedFormGroup({
      'Barcode': new UntypedFormControl({ value: this.curPromotionDetail.Barcode, disabled: false }, Validators.required),
      'VNName': new UntypedFormControl({ value: this.curPromotionDetail.VNName}),
      'Quantity': new UntypedFormControl({value:!(this.curPromotionDetail.Quantity > 0)  ? this.curPromotionDetail.Quantity : 1, disabled: false}, Validators.required),
      'MaxQuantity': new UntypedFormControl({value: Ps_UtilObjectService.hasValue(this.curPromotionDetail.MaxQuantity) ? this.curPromotionDetail.MaxQuantity : 0, disabled: false}),
      'PriceDiscount': new UntypedFormControl({value: this.curPromotionDetail.PriceDiscount, disabled: true}, Validators.required),
      'Price': new UntypedFormControl({ value: this.curPromotionDetail.Price, disabled: true }),
      'DiscountAmount': new UntypedFormControl({ value: this.curPromotionDetail.DiscountAmount, disabled: true }),
      'DiscountPercent': new UntypedFormControl({ value: this.curPromotionDetail.DiscountPercent, disabled: true }),
      'StatusID': new UntypedFormControl({value: this.curPromotionDetail.StatusID, disabled: false}),
      'Remark': new UntypedFormControl({value: this.curPromotionDetail.Remark, disabled: false}),
    })
  }

  onLoadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }

  /**
   * Tính tổng giá khuyến mãi của hamper được thêm vào CTKM
   * @param listProduct danh sách hamper cần tính giá khuyến mãi
   */
  onCalculateTotalPriceDiscount(listProduct: DTOPromotionDetail[]) {
    // Sử dụng reduce để tính tổng giá trị PriceDiscount
    const priceDiscountHamper = Ps_UtilObjectService.hasValue(listProduct.reduce((total, currentItem) => total + currentItem.PriceDiscount, 0)) ? listProduct.reduce((total, currentItem) => total + currentItem.PriceDiscount, 0) : 0;
    // Cập nhật giá trị PriceDiscount trong form
    this.form.get('PriceDiscount').patchValue(priceDiscountHamper);
    this.calculateDiscountOnForm(priceDiscountHamper)
  }
  
  // Hàm load lại trang
  onLoadPage(){
    this.promotionInforRef.loadData();
    this.conditionApplyRef.loadData();
    this.APIGetListHamper();
  }

 
  //KENDO GRID
  // Hàm load filter
  onLoadFilter() {
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
      this.filterSearchBox.filters.push(this.filterVNName);

    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode);

    // if (Ps_UtilObjectService.hasValueString(this.filterPosCode.value))
    //   this.filterSearchBox.filters.push(this.filterPosCode)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox);

    this.APIGetListHamper()
  }

  //# Hàm xử lý khi người dùng bấm xem chi tiết trên grid
  onToggleHamperDetail(item: DTOPromotionDetail) {
    if (item['ShowProductDetail'] == true)
      item['ShowProductDetail'] = false
    else
      item['ShowProductDetail'] = true
  }

  onRowCallback = ({ dataItem }) => {
    var item = <DTOPromotionDetail>dataItem

    return {
      showHamper: item['ShowProductDetail']
    }
  }
  //#endregion

  //paging
  // Hàm xử lý khi người dùng chuyển trang trong grid
  onPageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.APIGetListHamper()
  }
  onSortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.APIGetListHamper()
  }
 
  //promotion detail
  APIGetListHamper() {
    // this.ngUnsubscribe$.next();
    // this.ngUnsubscribe$.complete(); 
    this.loading = true;
    var ctx = `Đã xảy ra lỗi khi lấy danh sách danh sách hamper`
    let a = this.apiMarService.GetListHamper(this.gridDSState).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (res.ErrorString != null) {
        this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
      }
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listHamper = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridDSView.next({ data: this.listHamper, total: this.total });
        // let arr = this.fakeData;
        // this.gridDSView.next({ data: arr, total: this.total });
        // a.unsubscribe();
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`${ctx}: ${error}`)
    });
  }
  APIGetHamperByBarcode() {
    this.loading = true;
    var ctx = "Tìm sản phẩm"

    this.apiMarService.GetHamperByBarcode(this.curPromotionDetail.Barcode.replace(/\s+/g, ''), this.curPromotion.Code, true).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      this.loading = false;
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curPromotionDetail = res.ObjectReturn;
        this.curPromotionDetail.StatusID = 1
        this.curPromotionDetail.StatusID == 0 ? this.curPromotionDetail.StatusID = 1 : null;
        !Ps_UtilObjectService.hasValue(this.curPromotionDetail.Quantity) || this.curPromotionDetail.Quantity <= 0 ? this.curPromotionDetail.Quantity = 1 : null;
        !Ps_UtilObjectService.hasValue(this.curPromotionDetail.MaxQuantity) ? this.curPromotionDetail.MaxQuantity = 0 : null;
        !Ps_UtilObjectService.hasValue(this.curPromotionDetail.PriceDiscount) ? this.curPromotionDetail.PriceDiscount = 0 : null;
        this.curPromotionDetail.ListProduct.filter(v => !Ps_UtilObjectService.hasValue(v.PriceDiscount)).forEach(x => {
          x.PriceDiscount = 0
        })
        this.isAddDetail ?  this.curPromotionDetail.Code = 0 : null
        this.form.patchValue(this.curPromotionDetail)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    });
  }
  APIUpdatePromotionDetail(detail: DTOPromotionDetail[]) {
    this.loading = true;
    // this.isAddDetail = this.curPromotionDetail.Code == 0
    var ctx = (this.isAddDetail ? "Thêm" : "Cập nhật") + " Sản phẩm"
    // this.curPromotionDetail.Promotion = this.curPromotion.Code

    this.apiMarService.UpdatePromotionDetail(detail).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
        this.APIGetListHamper();

        this.gridDSView.next({ data: this.listHamper, total: this.total });
        this.isAddDetail = false

        if (this.drawer.opened)
          this.onCloseForm()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.APIGetListHamper();
      }
      
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
      this.APIGetListHamper();
    });
  }
  APIDeletePromotionDetail(detail: DTOPromotionDetail[] = this.curPromotionDetail.ListProduct) {
    this.loading = true;
    var ctx = "Xóa Sản phẩm"
    this.curPromotionDetail.Promotion = this.curPromotion.Code
    // detail.Promotion = this.curPromotion.Code

    this.apiMarService.DeletePromotionDetail(detail).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        this.APIGetListHamper();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.deleteDialogOpened = false
        this.APIGetListHamper();
      }
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
      this.deleteDialogOpened = false
      this.APIGetListHamper();
    });
  }
  APIExportExcelPromotion() {
    this.loading = true
    var ctx = "Xuất Excel"
    var getfileName = "HamperPromotionReport.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)
    this.apiMarService.ExportHamperPromotionReport(this.curPromotion.Code).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      this.loading = false;
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      }
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
      this.loading = false;
    });

  }
  //file
  onGetPromotionFolderDrillWithFile() {
    return this.apiMarService.GetPromotionFolderDrillWithFile()
  }

  APIDownloadExcelPromotionHamperDetail(getfileName) {
    this.loading = true
    var ctx = "Download Excel Template"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.layoutApiService.GetTemplate(getfileName).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
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

  // APIImportExcelPromotionDetail(file) {
  //   this.loading = true
  //   var ctx = "Import Excel"

  //   this.apiMarService.ImportExcelPromotionDetail(file, this.curPromotion.Code).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
  //     if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
  //       this.onLoadFilter()
  //       this.APIGetListHamper()

  //       this.layoutService.onSuccess(`${ctx} thành công`)
  //       this.layoutService.setImportDialogMode(1)
  //       this.layoutService.setImportDialog(false)
  //       this.layoutService.getImportDialogComponent().inputBtnDisplay()
  //     } else {
  //       const arr = res.ObjectReturn as DTOListProp_ObjReturn[]
  //       let importComponent = this.layoutService.getImportDialogComponent()
      
  //       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
  //       importComponent.importGridDSView.next({ data: arr, total: arr.length })
  //     }
  //     this.loading = false;
  //   }, (error) => {
  //     this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
  //     this.loading = false;
  //   })
  // }

  APIImportExcelPromotionHamper(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.apiMarService.ImportExcelPromotionHamper(file, this.curPromotion.Code).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      this.loading = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.onLoadFilter()

        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        const arr = res.ObjectReturn as DTOListProp_ObjReturn[]
        let importComponent = this.layoutService.getImportDialogComponent()
      
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        importComponent.importGridDSView.next({ data: arr, total: arr.length })
      }
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
    })
  }
  //CLICK EVENT
  //header1
  onUpdatePromotionStatus(item: any) {
    this.isGroupOfCardDisabled = this.curPromotion.PromotionType !== 2;
    this.isGoldenHourDisabled = this.curPromotion.PromotionType !== 4;
    this.curPromotion.ImageSetting2 = Ps_UtilObjectService.removeImgRes(this.curPromotion.ImageSetting2)
    this.curPromotion.ImageSetting1 = Ps_UtilObjectService.removeImgRes(this.curPromotion.ImageSetting1)
    var newPro = { ...this.curPromotion }
    // newPro.StatusID = statusID
    //check trước khi áp dụng
    if ((this.isAllowedToCreate || this.isToanQuyen) && item.statusID == 1 
      || (this.isAllowedToVerify || this.isToanQuyen) && item.statusID == 2) {
      let warehouse7 = Ps_UtilObjectService.hasValue(this.listWareHouse.find(s => s.WH == 7 && s.IsSelected))
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

      else if (!Ps_UtilObjectService.hasValue(this.listWareHouse.find(s => s.IsSelected)))
        this.layoutService.onError('Vui lòng chọn Đơn vị áp dụng')
      //nếu có chọn đơn vị web hachi thì check mô tả và hình
      else if (!Ps_UtilObjectService.hasValueString(newPro.VNSummary))
        this.layoutService.onError('Vui lòng nhập Mô tả chương trình khuyến mãi')
      else if (!Ps_UtilObjectService.hasValueString(newPro.ImageSetting2))
        this.layoutService.onError('Vui lòng nhập Hình lớn')
      else if ((!this.isGroupOfCardDisabled || this.curPromotion.PromotionType === 3) && !Ps_UtilObjectService.hasValue(this.listGroupOfCard.find(s => s.IsSelected == true)))
        this.layoutService.onError('Vui lòng chọn Nhóm thẻ áp dụng')
      else if ((!this.isGoldenHourDisabled || this.curPromotion.PromotionType === 3) && !Ps_UtilObjectService.hasValue(this.listDayOfWeek.find(s => s.IsSelected == true)))
        this.layoutService.onError('Vui lòng chọn Ngày trong tuần cho Giờ vàng')
      //nếu có ngày được chọn mà không ghi thời gian  
      else if (this.listDayOfWeek.find(s => (!Ps_UtilObjectService.hasValue(s.From) || (!Ps_UtilObjectService.hasValue(s.To))
      ) && s.IsSelected) != undefined) {
        this.layoutService.onError('Vui lòng chọn Từ (giờ), Đến (giờ) cho Ngày trong tuần')
      }
      else if (!Ps_UtilObjectService.hasListValue(this.listHamper))
        this.layoutService.onError('Vui lòng Thêm Sản phẩm Khuyến mãi')
      else
        // this.p_UpdatePromotion(['StatusID'], newPro)
        // this.p_onUpdatePromotionStatus([newPro], item.statusID)
        this.promotionInforRef.onUpdatePromotionStatus(item)
      } else if(item.type == 'delete'){
        this.onDeletePromotion();
      } else if(item.type == 'new'){
        this.onResetData();
      } else{
        this.promotionInforRef.onUpdatePromotionStatus(item)
      }
      
  }

  getRes(str: string) {
    return Ps_UtilObjectService.getImgRes(str)
  }

  onResetData(){
    this.conditionApplyRef.createNewPromotion();
    this.onCreateNewPromotion();
    this.promotionInforRef.createNewPromotion();
  }

  onCreateNewPromotion() {

    this.curPromotionDetail = new DTOPromotionDetail()
    this.curPromotion.TypeData = 3
    //array
    this.listHamper = []
    this.gridDSView.next({ data: [], total: 0 })
    this.gridView.next({ data: [], total: 0 })

    //bool
    this.isLockAll = false
    this.isFilterActive = true
    this.isAdd = true
    this.isAddDetail = false
    this.expanded = true;
  }

  onHeaderDropdownlistClick(ev) {
    this.currentTaoMoi = ev
    this.onCreateNewPromotion()
  }
 
  //#region header1 
  //- create array button UpdateStatus
  listActionStatus: { text: string, class: string, code: string, link?: number, type?: string }[] = [];
  onGetListActionPromotion(value: { text: string, class: string, code: string, link?: number, type?: string }[]){
    this.listActionStatus = value;
  }

  /**
   * Hàm lấy thông tin của CTKM
   * @param value CTKM
   */
  onGetPromotion(value: DTOPromotionProduct){
    this.curPromotion = value;
    this.conditionApplyRef.curPromotion = this.curPromotion;
    this.conditionApplyRef.isCheckboxAllowByPromotionType();
    this.conditionApplyRef.getCachePromotionDetail();
    if(value.Code !== 0 && this.isCallOnlyListHamper){
      this.isCallOnlyListHamper = false;
      this.onLoadFilter();
    }
    this.onCheckPermistion();
    
    if(this.curPromotion.Code == 0){
      this.onCreateNewPromotion()
    }
  }

  /**
   * Kiểm tra quyền sử dụng chức năng
   */
  onCheckPermistion(){
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
    const statusID = this.curPromotion.StatusID;
  
    // Kiểm tra điều kiện "Chỉnh sửa"
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4 ) || canVerify && statusID === 1) {
      this.isLockAll = false; // Cho phép chỉnh sửa
    } else {
      this.isLockAll = true; // Bị disabled
    }
  }

  /**
   * Hàm lấy danh sách đơn vị áp dụng
   * @param value Danh sách đơn vị áp dụng
   */
  onGetListWareHouse(value: DTOWarehouse[]){
    this.listWareHouse = value;
  }

  /**
   * Hàm lấy danh sách nhóm thẻ áp dụng
   * @param value nhóm thẻ áp dụng
   */
  onGetListGroupOfCard(value: DTOGroupOfCard[]){
    this.listGroupOfCard = value;
  }

  /**
   * Hàm lấy danh sách ngày trong tuần
   * @param value ngày trong tuần
   */
  onGetListDayOfWeek(value: DTODayOfWeek[]){
    this.listDayOfWeek = value;
  }

  /**
   * Hàm chuyển trang
   */
  onNavigatePage(){
    let parent = ModuleDataAdmin.find( v => v.Code == 'mar');
    let detail = parent.ListMenu.find( v => v.Code == 'mar-promotion');
    let detail1 = detail.LstChild.find( v => v.Code == 'mar019-discount-hamper');
    this.menuService.activeMenu(detail1);
  }

  /**
   * Hàm export excel chi tiết CTKM
   */
  onExportExcelPromotionDetail(){
    this.APIExportExcelPromotionDetail()
  }

  /**
   * API expoert excel 
   */
  APIExportExcelPromotionDetail() {
    this.loading = true
    var ctx = "Export Excel Chi tiết Chương trình"
    var getfileName = 'ExportListPromotionDetails'
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.apiMarService.ExportListPromotionDetails(this.curPromotion.Code).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
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
  //#endregion

  //#region header2

  /**
  * Hàm xử lý download excel
  * @param file excel
  */
  onDownloadExcelPromotionHamperDetail(file) {
    this.APIDownloadExcelPromotionHamperDetail(file)
  }

  /**
   * Hàm xử lý import excel
   */
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  /**
   * Thêm mới hamper vào CTKM
   */
  onAddHamper() {
    this.isAddDetail = true;
    this.expanded = true;
    this.onClearForm()
    this.curPromotionDetail = new DTOPromotionDetail()
    this.onLoadForm()
    this.drawer.open();
  }


  //#endregion
  //body3.2
  SearchQuery: string = ''

  /**
   * Hàm xử lý tìm kiếm hanoer
   */
  onSearch() {
    if (Ps_UtilObjectService.hasValueString(this.SearchQuery)) {
      this.filterVNName.value = this.SearchQuery
      this.filterBarcode.value = this.SearchQuery
      // this.filterPosCode.value = searchQuery
    } else {
      this.filterVNName.value = null
      this.filterBarcode.value = null
      // this.filterPosCode.value = null
    }

    this.onLoadFilter();

  }

  /**
   * Hàm xứ lý form cho hamper
   * @param obj hamper
   * @param menu action người dùng chọn
   */
  onEdit(obj: DTOPromotionDetail, menu: MenuDataItem) {
    this.curPromotionDetail = { ...obj }
    if(menu.Code == "eye"){
      this.form.disable();
    } else {
      this.onLoadForm()
    }
    this.drawer.open();
  }

  /**
   * Hàm xóa CTKM
   */
  onDeletePromotion() {
    this.contextIndex = 0
    this.deleteDialogOpened = true
  }

  /**
   * Hàm xóa sản phẩm hamper
   * @param obj Hamper
   */
  onDeleteDetail(obj: DTOPromotionDetail) {
    this.contextIndex = 1
    this.curPromotionDetail = { ...obj };
    this.deleteDialogOpened = true
  }


  //FORM button
  /**
   * Hàm xử lý submit form drawer
   */
  onSubmit(): void {
    this.form.markAllAsTouched()
    if (this.form.valid) {
      var val: DTOPromotionDetail = this.form.getRawValue()
      this.curPromotionDetail.StatusID = val.StatusID
      this.curPromotionDetail.Promotion = this.curPromotion.Code
      this.curPromotionDetail.LastDate = val.LastDate
      this.APIUpdatePromotionDetail([this.curPromotionDetail])
    }
    else
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
  }

  /**
   * Hàm reset form drawer
   */
  onClearForm() {
    this.curPromotionDetail = new DTOPromotionDetail()
    this.form.reset()
    this.onLoadForm()
  }

  /**
   * Hàm đóng form drawer
   */
  onCloseForm() {
    this.onClearForm()
    this.drawer.close()
  }
  //POPUP
  //action dropdown
  onGetActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOPromotionDetail) {
    moreActionDropdown = []
    var item: DTOPromotionDetail = dataItem
    var statusID = item.StatusID;
   
    if(this.isToanQuyen || this.isAllowedToVerify || this.isAllowedToCreate){
      if(this.curPromotion.StatusID == 0 || this.curPromotion.StatusID == 4 ){
        moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
      } else{
        moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
      }
    }
    //status
    // if (this.isToanQuyen || this.isAllowedToVerify) {
    if(this.curPromotion.StatusID == 2 && (this.isToanQuyen || this.isAllowedToVerify)){
      if (statusID != 1) {
        moreActionDropdown.push({ Name: "Áp dụng", Code: "redo", Link: "1", Actived: true })
      }
      else {
        moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Link: "2", Actived: true })
      }
    }
    // }
    //delete
    if (!this.isLockAll)
      moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Link: "delete", Actived: true })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOPromotionDetail) {
    if (item.Code != 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDeleteDetail(item)
      }
      else if (menu.Code == 'redo' || menu.Code == 'minus-outline') {
        this.curPromotionDetail = { ...item }
        this.curPromotionDetail.StatusID = parseInt(menu.Link)
        this.APIUpdatePromotionDetail([this.curPromotionDetail])
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil'
        || menu.Code == "eye" || menu.Link == 'detail') {

        this.isAddDetail =  menu.Link == 'edit' || menu.Code == 'pencil' ?  false : true
        this.expanded  =  menu.Link == 'edit' || menu.Code == 'pencil' ?  true : false
        this.onEdit(item, menu)
      }
    }
  }
  //selection 
  onGetSelectionPopup(selectedList: DTOPromotionDetail[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    if (selectedList.findIndex(s => s.StatusID == 2) != -1 && this.curPromotion.StatusID == 2)
      moreActionDropdown.push({
        Name: "Áp dụng", Type: "StatusID",
        Code: "check-outline", Link: "1", Actived: true
      })

    if (selectedList.findIndex(s => s.StatusID == 1) != -1 && this.curPromotion.StatusID == 2)
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
          this.APIUpdatePromotionDetail(arr)
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
            this.APIDeletePromotionDetail(arr)
        }
      }
    }
  }
  onSselectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //DIALOG button
  onCloseDeleteDialog() {
    this.deleteDialogOpened = false
  }

  delete() {
    // if (this.contextIndex == 2)
      // this.p_DeletePromotionInv()
    if (this.contextIndex == 0){
      this.promotionInforRef.APIDeletePromotion()
      this.onResetData();
      this.deleteDialogOpened = false;
    }
    else if (this.contextIndex == 1){
      this.APIDeletePromotionDetail();
    }
  }
  
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        case 'Barcode':
          if (this.drawer.opened && Ps_UtilObjectService.hasValue(this.curPromotionDetail.Barcode))
            if(Ps_UtilObjectService.hasValueString(this.form.get('Barcode').value)){
              this.APIGetHamperByBarcode()
            }
          break
       
      }
    }
  }
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
    
       if (prop == 'LastDate') {
        this.curPromotionDetail.LastDate = this.lastDate
      }
    
    }
  }

  onKeydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
 
  isItemDisabled(itemArgs: { dataItem: DTOPromotionType; index: number }) {
    return itemArgs.dataItem.Code == -1;
  }

  onUploadEventHandler(e: File) {
    this.APIImportExcelPromotionHamper(e)
  }

  /**
   * Hàm tính chiết khấu của sản phẩm
   * @param PriceDiscount giá khuyển mãi
   */
  calculateDiscountOnForm(PriceDiscount: number) {
    this.curPromotionDetail.DiscountAmount = this.curPromotionDetail.Price - PriceDiscount
    this.curPromotionDetail.DiscountPercent = this.curPromotionDetail.Price > 0 ?
      this.curPromotionDetail.DiscountAmount / this.curPromotionDetail.Price * 100 : 0
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
