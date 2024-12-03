import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild, ViewContainerRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { State, distinct, FilterDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { DTODomesticOrders } from '../../shared/dto/DTODomesticOrders.dto';
import { PurPOAPIService } from '../../shared/services/pur-po-api.service';
import { DTOOrderProducts, DTOStoreAndWH } from '../../shared/dto/DTOOrderProducts.dto';
import { PurSupplierApiServiceService } from '../../shared/services/pur-supplier-api.service.service';
import { DTOSupplier } from '../../shared/dto/DTOSupplier';
import { formatDate } from '@angular/common';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigHamperApiService } from 'src/app/p-app/p-config/shared/services/config-hamper-api.service';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import { DTOOrderDelivery } from '../../shared/dto/DTOOrderDelivery.dto';
import { Day } from '@progress/kendo-date-math';
import { DTOOrderInvoice } from '../../shared/dto/DTOOrderInvoice.dto';
import { PopupComponent } from '@progress/kendo-angular-popup';
import { DatePickerComponent } from '@progress/kendo-angular-dateinputs';
import { QueueApiService } from 'src/app/p-lib/services/queue-api.service';
import { verify } from 'crypto';

@Component({
  selector: 'app-pur003-po-domestic-detail',
  templateUrl: './pur003-po-domestic-detail.component.html',
  styleUrls: ['./pur003-po-domestic-detail.component.scss']
})

export class Pur003PODomesticDetailComponent implements OnInit, OnDestroy, AfterViewInit{
  @ViewChild('formDrawer') public DrawerRightComponent: DrawerComponent;
  @ViewChild('popupContainer', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;
  @ViewChild('datepickerStart', { static: false }) datepickerStart!: DatePickerComponent;
  @ViewChild('datepickerEnd', { static: false }) datepickerEnd!: DatePickerComponent;
  @ViewChild('datepickerMin', { static: false }) datepickerMin!: DatePickerComponent;

  //#region permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //#endregion

  //#region variable boolean
  isAdd: boolean = false
  loading: boolean = false
  isUpdateLoading: boolean = false
  isChangePageEmail: boolean = false;
  isChangePageInvoice: boolean = false;
  isFilterActive: boolean = true;
  hasListOrderProduct: boolean = false
  excelValid: boolean = true
  isEditPercen: boolean = false
  isOverPriced: boolean = false
  expandedRight: boolean = false
  isautoCollapse: boolean = false
  isHasMiniDate: boolean = false
  isDeleteInDrawer: boolean = false
  ishasOrderDelivery: boolean = false
  ishasListInvo: boolean = false

  openedPopupProduct: boolean = false
  openedPopupPO: boolean = false
  openedPopupPOCannel: boolean = false
  

  errorOccurred: any = {};

  isAddNewProduct: boolean = false // biến trạng thái khi bấm thêm mới sản phẩm
  isEdit: boolean = false // biến trạng thái khi bấm chỉnh sửa
  isGetProduct: boolean = false // biến trạng thái khi get sản phẩm
  isEditQuantityDivision: boolean = false
  isUpdate: boolean = false
  //#endregion

  //#region Object
  selectedSupplier: DTOSupplier = new DTOSupplier()
  SupplierDefaule: any = {
    PartnerID: 'Tìm kiếm theo mã và tên nhà cung cấp',
    Code: -1,
    VNName: ''
  }
  selectedAddress = new DTOStoreAndWH()
  selectedUnit: any
  DomesticOrder = new DTODomesticOrders()
  DomesticOrderDefault = new DTODomesticOrders()
  OrderDelivery = new DTOOrderDelivery()
  ProductOrder = new DTOOrderProducts()
  Supplier = new DTOSupplier()

  orderProductObj: DTOOrderProducts = new DTOOrderProducts()
  itemCurrGrid: DTOStoreAndWH // biến lưu item selected grid

  typePopup: { type: string, title: string } = { type: 'xóa', title: "XÓA ĐƠN HÀNG?" }

  //#endregion

  //#region String
  KeyWord: string = '';
  //#endregion

  //#region Number
  ProductNumber: number = 0
  //#endregion

  //#region Date
  startDateWork: Date
  endDateWork: Date
  DateOrder: Date
  Today: Date = new Date()
  DateMin: Date
  DateOrderMin: Date
  startDateWorkMin: Date
  OrderDate: Date
  expirationDate: Date
  //#endregion

  //#region Array
  ListDetailPOProduct: DTOOrderProducts[] = []
  ListOrderInvoiced: DTOOrderInvoice[] = []
  listProductDelete: DTOOrderProducts[] = []
  listSupplierTree: DTOSupplier[] = []
  listSupplier: DTOSupplier[] = []
  listSupplierfilter: DTOSupplier[] = []
  arrBtnStatus: { text: string, class: string, code: string, link?: any, type?: string, image?: string }[] = [];
  listUnit: any[] = []
  listWareHouse: DTOStoreAndWH[] = []
  listWareHouseAddress: DTOStoreAndWH[] = []
  listWareHouseDefault: DTOStoreAndWH[] = []
  disabledDates: Day[] = [Day.Saturday, Day.Sunday];


  //#endregion

  //#region Grid
  pageSize = 25
  pageSizes = [this.pageSize]
  allowActionDropdown = ['delete']

  gridView = new Subject<any>();
  gridViewInfo = new Subject<any>();
  ngUnsubscribe = new Subject<void>;
  skip = 0;
  total = 0
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  filterListOrderProduct: FilterDescriptor = {
    field: "OrderMaster", operator: "eq", value: 0
  }

  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  filterPackingUnitType1: FilterDescriptor = { field: 'TypeData', operator: 'eq', value: 1 }
  filterPackingUnitType2: FilterDescriptor = { field: 'TypeData', operator: 'eq', value: 2 }


  gridStatePackingUnit: State = { filter: { filters: [
    this.filterPackingUnitType1,
    this.filterPackingUnitType2
  ], logic: 'or' }}
 
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //#endregion 

  //#region From
  orderProductForm: FormGroup = new FormGroup({
    Code: new FormControl(0),
    ImageThumb: new FormControl(''),
    ProductName: new FormControl(''),
    Barcode: new FormControl(''),
    Poscode: new FormControl(''),
    ReceivedQuantity: new FormControl(0),
    Quantity: new FormControl(0),
    ModifiedQuantity: new FormControl(0),
    ConfirmedQuantity: new FormControl(0),
    Price: new FormControl(0),
    Bid: new FormControl(0),
    Discount: new FormControl(0),
    DiscountAmount: new FormControl(0),
    VATAmount: new FormControl(0),
    VAT: new FormControl(0),
    ListStoreAndWH: new FormControl([]),
    RemarkSupplier: new FormControl(''),
    RemarkWarehouse: new FormControl(''),
    OrderMaster: new FormControl(0),
    Supplier: new FormControl(0),
    Product: new FormControl(0),
    DateMin: new FormControl(''),
    DatePercent: new FormControl(0),
    BasePrice: new FormControl(0),
    Unit: new FormControl(0),
    UnitName: new FormControl(''),
    AmountBeforeVAT: new FormControl(0),
    AmountAfterVAT: new FormControl(0),
    DateDuration: new FormControl(0)
  });
  //#endregion

  //#region Funtion CallBack
  uploadEventHandlerCallback: Function
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  onPageChangeCallback: Function
  onFilterChangeCallback: Function
  GetFolderCallback: Function
  pickFileCallback: Function
  getSelectionPopupCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  tempSearch: any;
  //#endregion

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public apiService: PurPOAPIService,
    public PurSupplierApiService: PurSupplierApiServiceService,
    public apiServiceBlog: MarNewsProductAPIService,
    public domSanititizer: DomSanitizer,
    public configHamperAPI: ConfigHamperApiService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private queueApiService: QueueApiService,
  ){
    
    if(Ps_UtilObjectService.hasValue(this.viewContainerRef)){
      // // Clear any existing views in the container
      this.viewContainerRef.clear();
    
      // Create the component factory for the PopupComponent
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PopupComponent);
      
      // Use the factory to create a new component and insert it into the container
      this.viewContainerRef.createComponent(componentFactory);
    }
  }
  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
 

  ngOnInit(): void {
    let that = this
    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        // this.GetCachePODomestic()
      }
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetCachePODomestic();
      }
    })

    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //callback
    this.onPageChangeCallback = this.onPageChange.bind(this)
    //dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)

    //folder
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)

  }

  //#region API
  // API Lấy thông tin đơn hàng
  loadingDomesticOrder: boolean = false
  APIGetDomesticOrder() {
    this.loadingDomesticOrder = true
    this.apiService.GetDomesticOrder(this.DomesticOrder).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.DomesticOrder = res.ObjectReturn
        this.DomesticOrderDefault = JSON.parse(JSON.stringify(res.ObjectReturn))
        this.OrderDate = new Date(this.DomesticOrder.OrderedTime)
        if(this.DomesticOrder.StatusID == 1){
          this.CheckDisplayDate()
        }
        
        if(this.DomesticOrder.StatusID >= 6){
          this.APIGetDeliveryOrder()
        }
        this.displayStatusBtn()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${res.ErrorString}`)
      }
      this.loadingDomesticOrder = false
    }, (error) => {
      this.loadingDomesticOrder = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${error} `)
    })
  }
  
  // API Lấy danh sách nhà cung cấp
  APIGetListSupplierTree() {
    this.loading = true

    this.PurSupplierApiService.GetListSupplierTree().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listSupplierTree = res.ObjectReturn
        this.listSupplier = this.flattenTree(this.listSupplierTree)
        this.listSupplierfilter = this.listSupplier
        this.listSupplierfilter.unshift(this.SupplierDefaule)
        this.selectedSupplier = this.listSupplier.find(Supplier => {
          if(Ps_UtilObjectService.hasValue(this.DomesticOrder.Supplier)){
            if (Supplier.Code == this.DomesticOrder.Supplier) {
              return Supplier
            } 
          } else{
            this.selectedSupplier = new DTOSupplier()
          }
        })
        this.Supplier = { ...this.selectedSupplier }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhà cung cấp: ${res.ErrorString}`)
      }
      this.loading = false
    }, (error) => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhà cung cấp: ${error} `)
    })
  }

  // API lấy danh sách thông tin chi tiết đơn hàng
  APIGetListOrderProduct() {
    this.loading = true;
    var ctx = 'Danh sách sản phẩm'
    this.apiService.GetListOrderProduct(this.gridState).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.loading = false;
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ListDetailPOProduct = res.ObjectReturn.Data;
        if (!Ps_UtilObjectService.hasValueString(this.KeyWord)) {
          if (Ps_UtilObjectService.hasListValue(this.ListDetailPOProduct)) {
            this.hasListOrderProduct = true
          } else {
            this.hasListOrderProduct = false
          }
        }
        this.displayStatusBtn()
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.ListDetailPOProduct, total: this.total });
      } else{
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)
      }
    }, (error) => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx +' : '+ error)
    })
  }

  // API Export excel thông tin chi tiết đơn hàng
  APIExportExcel() {
    this.loading = true
    var ctx = "Xuất Excel"
    var getfileName = "AlbumnTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.apiService.GetExcelAlbumn(3, 0).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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

  loadingUpdateStatusDomesticOrder: boolean = false
  // API cập nhật tình trạng đơn hàng
  APIUpdateDomesticOrdersStatus(item: DTODomesticOrders, statusID, orderTypeID) {
    this.loadingUpdateStatusDomesticOrder = true

    this.apiService.UpdateDomesticOrdersStatus([item], statusID, orderTypeID).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Cập nhật tình trạng đơn hàng thành công`)
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật tình trạng đơn hàng: ${res.ErrorString}`) 
      }
      this.onLoadPage()
      this.loadingUpdateStatusDomesticOrder = false
    }, (error) => {
      this.loadingUpdateStatusDomesticOrder = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật tình trạng đơn hàng: ${error} `)
    })
  }

  // // API Cập nhập thông tin đơn hàng
  // APIUpdateDomesticOrder(item: DTODomesticOrders, prop: string[]) {
  //   this.loading = true;
  //   var ctx = 'Cập nhật thông tin đơn hàng'

  //   this.apiService.UpdateDomesticOrder(item, prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
  //       this.DomesticOrder = res.ObjectReturn
  //       this.DomesticOrderDefault = JSON.parse(JSON.stringify(res.ObjectReturn))

  //       if (this.isAdd) {
  //         this.isAdd = false
  //       }
      
  //       if(this.DomesticOrder.StatusID == 1){
  //         this.CheckDisplayDate()
  //       }

  //       this.selectedSupplier = this.listSupplier.find(Supplier => {
  //         if(Ps_UtilObjectService.hasValue(this.DomesticOrder.Supplier)){
  //           if (Supplier.Code == this.DomesticOrder.Supplier) {
  //             return Supplier
  //           } 
  //         } else{
  //           this.selectedSupplier = new DTOSupplier()
  //         }
  //       })

  //       // if(!this.DomesticOrder.IsSendEmail){
  //       //   this.onChangePageBtn(false, 'isChangePageEmail')
  //       // }

  //       if(Ps_UtilObjectService.hasValue(this.DomesticOrder.DeliveryLocation)){
  //         this.selectedAddress = this.listWareHouseAddress.find(selectAddress => selectAddress.Code == this.DomesticOrder.DeliveryLocation)
  //       } else{
  //         this.selectedAddress = new DTOStoreAndWH()
  //       }
  //       this.Supplier = { ...this.selectedSupplier }
  //       this.OrderDate = new Date(this.DomesticOrder.OrderedTime)
        
   
  //       this.displayStatusBtn()
  //       this.layoutService.onSuccess(`${ctx}`);
  //     } else {
  //       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
  //     }
  //     this.loading = false;
  //   }, () => {
  //     this.loading = false;
  //     this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
  //   })
  // }

  // API Tải template excel danh sách thôn tin chi tiết đơn hàng
  APIGetTemplate() {
    var ctx = "Tải Excel Template"
    var getfilename = "OrderProductTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.apiService.GetTemplate(getfilename).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
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

  //  API Import excel thông tin chi tiết đơn hàng
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.apiService.ImportOrderProduct(file, this.DomesticOrder.Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.onLoadPage()
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      this.loading = false;
    })
  }

  // API lấy danh sách cửa hàng
  APIGetListWareHouse(dataOrderProduct: DTOOrderProducts) {
  //let countQuantity = 0
    this.apiService.GetListWareHouse(dataOrderProduct).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        
        this.listWareHouse = res.ObjectReturn
        if(!Ps_UtilObjectService.hasListValue(this.listWareHouseAddress)){
          this.listWareHouseAddress = JSON.parse(JSON.stringify(res.ObjectReturn))
          this.selectedAddress = this.listWareHouseAddress.find(selectAddress => selectAddress.Code == this.DomesticOrder.DeliveryLocation)
        }
        this.listWareHouseDefault = JSON.parse(JSON.stringify(res.ObjectReturn))
     
        if (this.listWareHouse.length > 0) {
        
          if(this.isEdit){
            let tongsoluong = this.sumQuanity(this.listWareHouse)
            if(tongsoluong == this.ProductOrder.Quantity){
              this.listWareHouse = this.listWareHouse.filter(i => i.WHName != 'Kho Online' )
            } 
          }

          if(this.isAddNewProduct){
            this.listWareHouse.find(i => {
              if(i.WHName == 'Kho Online'){
                i.Quantity = 1
              }
             })
          }

          this.orderProductForm.controls['ListStoreAndWH'].patchValue(this.listWareHouse)
        }

      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách kho hàng: ${res.ErrorString}`)
      }
    }, (errors) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách kho hàng: ${errors}`)
    })
  }

  APIGetProduct(dataOrderProduct: DTOOrderProducts) {
    dataOrderProduct.OrderMaster = this.DomesticOrder.Code
    dataOrderProduct.Supplier = this.DomesticOrder.Supplier
    this.apiService.GetOrderProduct(dataOrderProduct).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        res.ObjectReturn.BasePrice = res.ObjectReturn.Bid
        res.ObjectReturn.Quantity = 1

        res.ObjectReturn.VATAmount = ((res.ObjectReturn.VAT * res.ObjectReturn.BasePrice) / 100) 
        res.ObjectReturn.AmountBeforeVAT = (res.ObjectReturn.BasePrice * res.ObjectReturn.Quantity)
        res.ObjectReturn.AmountAfterVAT = ((res.ObjectReturn.VATAmount + res.ObjectReturn.AmountBeforeVAT) * res.ObjectReturn.Quantity)

        this.isGetProduct = true
        // this.isAddNewProduct = true

        this.orderProductForm.patchValue(res.ObjectReturn)
        this.APIGetListWareHouse(res.ObjectReturn)
        if(Ps_UtilObjectService.hasValue(res.ObjectReturn.DateDuration)){
          this.expirationDate = this.addDays(this.OrderDate, res.ObjectReturn.DateDuration)
        }
        if (!Ps_UtilObjectService.hasListValue(this.listUnit)) {
          this.APIGetListPackingUnit()
        }
      }
      else {
        resets()
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy sản phẩm: ${res.ErrorString}`)
      }
    }, (errors) => {
      resets()
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy sản phẩm: ${errors}`)
    })

    const resets = () => {
      this.isGetProduct = false
      this.isEdit = false
      this.orderProductObj = new DTOOrderProducts()
      this.orderProductForm.patchValue(this.orderProductObj)
      this.listWareHouse = []
      this.orderProductForm.patchValue(this.orderProductObj)
    }
  }

  APIUpdateOrderProduct(dataUpdate: DTOOrderProducts) {
    const noticeE = 'Đã xảy ra lỗi khi';
    const noticeS = 'Cập nhật sản phẩm thành công';
    const noticeA = ' Thêm mới sản phẩm thành công';
    let notice = '';
    this.isUpdateLoading = true

    dataUpdate.OrderMaster = this.DomesticOrder.Code
    dataUpdate.Supplier = this.DomesticOrder.Supplier
    this.apiService.UpdateOrderProduct(dataUpdate).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.orderProductForm.patchValue(res.ObjectReturn)
        this.orderProductObj = new DTOOrderProducts()
        this.DrawerRightComponent.toggle()
        if (dataUpdate.Code == 0) {
          notice = noticeA
          this.isAddNewProduct = false
        }
        else {
          notice = noticeS
          this.isEdit = false
        }
        this.isGetProduct = false
        this.layoutService.onSuccess(notice)
        // this.APIGetListWareHouse(res.ObjectReturn)
      }
      else {
        checkError()
        this.layoutService.onError(`${notice}: ${res.ErrorString}`);
        this.orderProductObj = new DTOOrderProducts()
        this.DrawerRightComponent.toggle()
      }
      this.DateMin = null
      this.onLoadPage()
      this.isUpdateLoading = false
      this.isUpdate = false
    }, (errors) => {
      checkError()
      this.layoutService.onError(`${notice}: ${errors}`);
      this.orderProductObj = new DTOOrderProducts()
      this.DrawerRightComponent.toggle()
      this.isUpdateLoading = false
      this.isUpdate = false
    })

    const checkError = () => {

      this.isGetProduct = false
      if (dataUpdate.Code == 0) {
        notice = noticeE + ' thêm mới sản phẩm'
      }
      else {
        notice = noticeE + ' cập nhật sản phẩm'
        this.isEdit = false
      }
    }
  }

  //  API Xóa sản phẩm trong danh sách thôn tin đơn hàng
  APIDeleteOrderProduct(ListProduct: DTOOrderProducts[]) {
    this.loading = true;
    var ctx = 'sản phẩm'

    this.apiService.DeleteOrderProduct(ListProduct).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isEdit = false
        this.onLoadPage()
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.layoutService.onSuccess('Xóa sản phẩm thành công');
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${res.ErrorString}`)
      this.loading = false;
    }, (errors) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${errors}`)
    })
  }

  // API Xóa đơn hàng
  APIDeleteDemesticOrders(item: DTODomesticOrders) {
    this.loadingDomesticOrder = true;
    var ctx = `đơn hàng ${item.OrderNo}`

    this.apiService.DeleteDemesticOrders([item]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = true
        this.onLoadPage()
        this.layoutService.onSuccess(`Xóa ${ctx} thành công`);
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${res.ErrorString}`)
      this.loadingDomesticOrder = false;
    }, (errors) => {
      this.loadingDomesticOrder = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${errors}`)
    })
  }

  // API lấy đơn vị sản phẩm
  APIGetListPackingUnit(){
    this.loading = true
    this.configHamperAPI.GetListPackingUnit(this.gridStatePackingUnit).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listUnit = res.ObjectReturn.Data
      } else {
        this.layoutService.onError(`Lỗi lấy danh sách Đơn vị sản phẩm: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Lỗi lấy danh sách Đơn vị sản phẩm: ${err}`);
      this.loading = false
    })
  }

  // API Lấy THÔNG TIN GIAO NHẬN ĐƠN HÀNG
  APIGetDeliveryOrder (){
    this.loading = true
    this.apiService.GetDeliveryOrder(this.DomesticOrder).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.OrderDelivery = res.ObjectReturn
        if(Ps_UtilObjectService.hasValue(this.OrderDelivery) && this.OrderDelivery.StatusID == 2){
          this.ishasOrderDelivery = true
          if(Ps_UtilObjectService.hasListValue(this.OrderDelivery.ListInvoice)){
            this.ishasListInvo = true
            this.displayStatusBtn()
          } else{
            this.ishasListInvo = false
          }
        } else{
          this.ishasOrderDelivery = false
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin giao nhận đơn hàng: ${res.ErrorString}`)
      }
      this.loading = false
    }, (error) => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin giao nhận đơn hàng: ${error} `)
    })
  }

  // API lấy danh sách hóa đơn
  APIGetListOrderInvoice(){
    this.loading = true
    this.apiService.GetListOrderInvoice(this.DomesticOrder).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.loading = false
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ListOrderInvoiced = res.ObjectReturn
        this.total = this.ListOrderInvoiced.length
        this.gridViewInfo.next({ data: this.ListOrderInvoiced, total: this.total });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách hóa đơn: ${res.ErrorString}`)
      }
    }, (error) => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách hóa đơn: ${error} `)
    })
  }

  // API hủy và tạo PO tương tự
  APIDuplicatePOCancel(){
    this.loadingDomesticOrder = true
    this.apiService.DuplicatePOCancel(this.DomesticOrder).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.DomesticOrder = res.ObjectReturn
        localStorage.setItem("PODomestic", JSON.stringify(this.DomesticOrder))
        this.layoutService.onSuccess('Hủy và tạo PO tương tự thành công')
        this.onLoadPage()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${res.ErrorString}`)
      }
      this.loadingDomesticOrder = false
    }, (error) => {
      this.loadingDomesticOrder = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${error} `)
    })
  }

  //#endregion

  //#region Logic

  // lấy thông tin đơn hàng từ Cache
  GetCachePODomestic() {
    let res = JSON.parse(localStorage.getItem('PODomestic'))
    if (Ps_UtilObjectService.hasValue(res)) {
      this.DomesticOrder = res
      if (this.DomesticOrder.Code != 0) {
        this.isAdd = false
      } else {
        this.isAdd = true
      }
      this.onLoadPage()
    }
  }

  onCreateNew() {
    this.isAdd = true

    if (this.isChangePageEmail) {
      this.isChangePageEmail = false
    }

    // clear nội dung block thông tin đơn hàng
    const today = new Date()
    this.DomesticOrder = new DTODomesticOrders();
    this.selectedSupplier = null
    this.Supplier = null
    this.hasListOrderProduct = false
    this.DomesticOrder.IsSendEmail = false
    this.isChangePageInvoice = false

    // clear danh sách thông tin chi tiết đơn hàng
    this.ListDetailPOProduct = []
    this.gridView.next({ data: this.ListDetailPOProduct, total: this.total })

    // lấy thông tin đơn hàng
    // lấy thông tin nhà cung cấp
    if (!Ps_UtilObjectService.hasListValue(this.listSupplierTree)) {
      this.APIGetListSupplierTree()
    }
    // lấy thông tin địa chỉ giao hàng
    this.selectedAddress = new DTOStoreAndWH()
    this.startDateWork = null
    this.endDateWork = null
    this.DateOrder = null
    if(!Ps_UtilObjectService.hasListValue(this.listWareHouse)){
      this.APIGetListWareHouse(this.ProductOrder)
    }

  }

  displayStatusBtn() {
    this.arrBtnStatus = [];
      if ((this.isAllowedToCreate || this.isToanQuyen) && (this.DomesticOrder.StatusID == 1) && !this.hasListOrderProduct && this.DomesticOrder.OrderTypeID != 3) {
        this.arrBtnStatus.push({
          text: 'XÓA ĐẶT HÀNG',
          class: 'k-button btn-hachi btnXoa',
          code: 'k-icon k-i-trash',
          link: 3,
          type: "delete"
        });
      }

      if ((this.isAllowedToCreate || this.isToanQuyen) && this.DomesticOrder.OrderTypeID == 1 && this.DomesticOrder.StatusID != 1) {
        this.arrBtnStatus.push({
          text: 'HỦY ĐẶT HÀNG',
          class: 'k-button btn-hachi btnHuy',
          code: 'k-icon k-i-minus-outline',
          link: 0,
          type: "Cancel"
        });
      }

      if ((this.isAllowedToCreate || this.isToanQuyen) && (this.DomesticOrder.StatusID == 1) && this.hasListOrderProduct && this.DomesticOrder.OrderTypeID != 3) {
        this.arrBtnStatus.push({
          text: 'GỬI ĐẶT HÀNG',
          class: 'k-button btn-hachi btnGuiDuyet',
          code: '',
          link: 2,
          type: "Send",
          image: "assets/img/icon/icon_sendGreen.svg",
        });
      }

      if (this.ishasListInvo && !this.isChangePageInvoice && this.DomesticOrder.StatusID >= 6 && !this.isChangePageEmail) {
        this.arrBtnStatus.push({
          text: 'HÓA ĐƠN VAT',
          class: 'k-button btn-hachi btnGuiDuyet',
          code: '',
          link: 0,
          type: "onChangePage"
        });
      }
  
      if (this.isChangePageEmail || this.isChangePageInvoice) {
        let item = 
        {
          text: 'CHI TIẾT ĐƠN HÀNG',
          class: 'k-button btn-hachi btnGuiDuyet',
          code: '',
          link: 0,
          type: "isChangePageEmail"
        };
        if(this.isChangePageEmail){
          item.type = 'isChangePageEmail'
        } else{
          item.type = 'isChangePageInvoice'
        }
        this.arrBtnStatus.push(item)
      }

      if ((this.isAllowedToCreate || this.isToanQuyen)) {
        this.arrBtnStatus.push({
          text: 'TẠO MỚI',
          class: 'k-button btn-hachi hachi-primary',
          code: 'k-icon k-i-plus',
          link: 0,
          type: "CreateNew"
        });
      }
    
  }

  // chuyên danh sách nhà cung cấp từ dạng tree sang dạng phẳng
  flattenTree(tree: DTOSupplier[]): DTOSupplier[] {
    let flatList: DTOSupplier[] = [];

    tree.forEach(node => {
      if (node.StatusID == 0) {// lọc nhà cung cấp đang hợp tác
        flatList.push(node); // Thêm nút hiện tại vào mảng phẳng
        if (node.ListSuppliers) {
          flatList = flatList.concat(this.flattenTree(node.ListSuppliers)); // Gộp các nút con vào mảng phẳng
        }
      }
    });
    return flatList;
  }


  onLoadFilter() {
    this.gridState.skip = 0
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.filter.filters = []
    if (Ps_UtilObjectService.hasValue(this.DomesticOrder.Code)) {
      this.filterListOrderProduct.value = this.DomesticOrder.Code
      this.gridState.filter.filters.push(this.filterListOrderProduct)
    }
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this.gridState.filter.filters.push(this.filterSearchBox);
      }
    }
  }

  getColor(startusid: number, type: string): string {
  if (type == 'OrderTypeID') {
    switch (startusid) {
      case 1:
      case 3:
        return '#1A6634';
      case 2:
        return '#D82C12';
      default:
        return '#959DB3'; // Màu mặc định hoặc không áp dụng màu
    }
  }
  }

  onEdit(str: string){
    console.log(this.isFilterActive)
    if(this.isFilterActive){
      this[str] = !this[str]
    }
  }

  insertSpacesInPhoneNumber(input: string): string {
    if (!input) return '';

    // Loại bỏ tất cả các ký tự không phải số từ chuỗi số điện thoại
    const cleanedNumber = input.replace(/\D/g, '');

    // Chèn khoảng trắng sau ba chữ số đầu tiên
    const firstPart = cleanedNumber.substring(0, 3);
    const secondPart = cleanedNumber.substring(3, 6); 
    const restPart = cleanedNumber.substring(6);

    const formattedNumber = `${firstPart} ${secondPart} ${restPart}`;

    return formattedNumber;
  }

  GetUniTName(data: number){
    if(Ps_UtilObjectService.hasValue(data)){
      this.selectedUnit = this.listUnit.find(i => i.Code == data)
      return this.selectedUnit.VNPackingUnit
    }
    return ''
  }

  isHasListDetail(item) {
    if (Ps_UtilObjectService.hasListValue(item.ListProduct)) {
      return true
    }
    return false
  }

  CheckDisplayDate(){
    if(this.DomesticOrder.IsSendAuto == false || this.DomesticOrder.IsSendAuto == null ){
      this.DateOrder = null
      if(Ps_UtilObjectService.hasValue(this.datepickerStart.value)){
        this.datepickerStart.value = null
      }
      if(Ps_UtilObjectService.hasValue(this.datepickerEnd.value)){
        this.datepickerEnd.value = null
      }
    } else{
      this.DateOrder = new Date(this.DomesticOrder.OrderedTime)
      this.startDateWork = new Date(this.DomesticOrder.ReceivingStart)
      this.endDateWork = new Date(this.DomesticOrder.ReceivingEnd)  
      this.DateOrderMin = new Date(this.DateOrder.getFullYear(), this.DateOrder.getMonth(), this.DateOrder.getDate() + 1)
      this.startDateWorkMin = new Date(this.startDateWork.getFullYear(), this.startDateWork.getMonth(), this.startDateWork.getDate() + 1)

    }
  }

  //#endregion

  //#region Header Action
  
  onLoadPage() {
    if (this.isAdd) {
      // Tải lại trang khi tạo mới
      this.onCreateNew()
    } else {
      // lấy thông tin đơn hàng
      this.APIGetDomesticOrder()
      if (!Ps_UtilObjectService.hasListValue(this.listSupplierTree)) {
        this.APIGetListSupplierTree()
      }

      if(!this.isChangePageInvoice){
        // lấy danh sách thông tin chi tiết
        this.onLoadFilter()
        this.APIGetListOrderProduct()
      }

      if(!Ps_UtilObjectService.hasListValue(this.listWareHouseAddress) && this.DomesticOrder.StatusID == 1){
        this.APIGetListWareHouse(this.ProductOrder)
      }
    }
  }

  onExportExcel() {
    this.APIExportExcel()
  }

  onUpdateStatus(item: { text: string, class: string, code: string, link?: any, type?: string }) {
    // if (item.type == 'Send') {
    //   if (!Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailTo) && this.DomesticOrder.IsSendEmail) {
    //     this.layoutService.onWarning('Vui lòng nhập email người nhận!!!')
    //   } 
    //   else if (!Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailContent) && this.DomesticOrder.IsSendEmail) {
    //     this.layoutService.onWarning('Vui lòng nhập nội dung email!!!')
    //   } else if (Ps_UtilObjectService.hasListValue(this.ListDetailPOProduct)) {
    //     this.isOverPriced = this.ListDetailPOProduct.some(product => {
    //       if (product.BasePrice > product.Bid) {
    //         return true
    //       }
    //       return false
    //     })
    //     if (this.isOverPriced) {
    //       this.layoutService.onWarning('Có sản phẩm vượt giá trần. Vui lòng kiểm tra lại !!!')
    //     } else if(!Ps_UtilObjectService.hasValueString(this.DomesticOrder.ContactPhone) || !Ps_UtilObjectService.hasValueString(this.DomesticOrder.Contact) || !Ps_UtilObjectService.hasValueString(this.DomesticOrder.WHName)){
    //       this.layoutService.onWarning('Vui lòng nhập đầy đủ thông tin liên hệ')
    //     } else {
    //       this.APIUpdateDomesticOrdersStatus(this.DomesticOrder, {'StatusID': 2} , {'OrderTypeID': this.DomesticOrder.OrderTypeID})
    //     }
    //   } 
    // } 
    // else if (item.type == 'Return') {
    //   this.APIUpdateDomesticOrdersStatus(this.DomesticOrder, {'StatusID':  item.link} , {'OrderTypeID': this.DomesticOrder.OrderTypeID})
    // } 
    // else if (item.type == 'delete') {
    //   this.typePopup = { type: 'xóa', title: "XÓA ĐẶT HÀNG?" }
    //   this.onToggleDialog(true, 'openedPopupPO')
    // } 
    // else if (item.type == "CreateNew") {
    //   this.onCreateNew()
    // } 
    // else if(item.type == 'Cancel'){
    //   this.typePopup = { type: 'hủy', title: "HỦY ĐẶT HÀNG?" }
    //   this.onToggleDialog(true, 'openedPopupPOCannel')
    // }
    // else if(item.type == 'onChangePage'){
    //   this.onChangePageBtn(true, 'isChangePageInvoice')
    // } 
    // else{
    //   this[item.type] = false
    //   this.filterSearchBox.filters = []
    //   this.onLoadFilter()
    //   this.APIGetListOrderProduct()
    // }


    switch (item.type) {
      case 'Send':
        if (!Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailTo) && this.DomesticOrder.IsSendEmail) {
          this.layoutService.onWarning('Vui lòng nhập email người nhận!!!')
        } 
        else if (!Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailContent) && this.DomesticOrder.IsSendEmail) {
          this.layoutService.onWarning('Vui lòng nhập nội dung email!!!')
        } else if (Ps_UtilObjectService.hasListValue(this.ListDetailPOProduct)) {
          this.isOverPriced = this.ListDetailPOProduct.some(product => {
            if (product.BasePrice > product.Bid) {
              return true
            }
            return false
          })
          if (this.isOverPriced) {
            this.layoutService.onWarning('Có sản phẩm vượt giá trần. Vui lòng kiểm tra lại !!!')
          } else if(!Ps_UtilObjectService.hasValueString(this.DomesticOrder.ContactPhone) || !Ps_UtilObjectService.hasValueString(this.DomesticOrder.Contact) || !Ps_UtilObjectService.hasValueString(this.DomesticOrder.WHName)){
            this.layoutService.onWarning('Vui lòng nhập đầy đủ thông tin liên hệ')
          } else {
            this.APIUpdateDomesticOrdersStatus(this.DomesticOrder, {'StatusID': 2} , {'OrderTypeID': this.DomesticOrder.OrderTypeID})
          }
        } 
        break;
      case 'Return':
        this.APIUpdateDomesticOrdersStatus(this.DomesticOrder, {'StatusID':  item.link} , {'OrderTypeID': this.DomesticOrder.OrderTypeID})
        break;
      case 'delete':
        this.typePopup = { type: 'xóa', title: "XÓA ĐẶT HÀNG?" }
        this.onToggleDialog(true, 'openedPopupPO')
        break;
      case 'CreateNew':
        this.onCreateNew()
        break;
      case 'Cancel':
        this.typePopup = { type: 'hủy', title: "HỦY ĐẶT HÀNG?" }
        this.onToggleDialog(true, 'openedPopupPOCannel')
        break;
      case 'onChangePage':
        this.onChangePageBtn(true, 'isChangePageInvoice')
        break;
      default:
        this[item.type] = false
        this.filterSearchBox.filters = []
        this.onLoadFilter()
        this.APIGetListOrderProduct()
        break;
    }
  }

  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  onDownloadExcel() {
    this.APIGetTemplate()
  }
  //#endregion
  
  //#region FilterSupplier
  handleFilterSupplier(event){
    this.listSupplierfilter.shift()
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.listSupplierfilter = this.listSupplier.filter(result => 
        (result.PartnerID && result.PartnerID.toLowerCase().includes(event.toLowerCase())) ||
        (result.InvName && result.InvName.toLowerCase().includes(event.toLowerCase()))
      );  
    } else {
      this.listSupplierfilter = this.listSupplier
    }
    if(Ps_UtilObjectService.hasListValue(this.listSupplierfilter)){
      this.listSupplierfilter.unshift(this.SupplierDefaule)
    }
  }

  openPopupFilterSupplier(){

    // Clear any existing views in the container
    this.viewContainerRef.clear();
    
    // Create the component factory for the PopupComponent
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PopupComponent);
    
    // Use the factory to create a new component and insert it into the container
    this.viewContainerRef.createComponent(componentFactory);
  }

  onSupplierChange(event: DTOSupplier){
    const prop = ['SupplierName', 'Supplier']
    if (Ps_UtilObjectService.hasValue(event)) {
      this.DomesticOrder.SupplierName = event.VNName
      this.DomesticOrder.Supplier = event.Code
      this.handleUpdateOrderInformation(prop, 'nhà cung cấp')
    }
  }

  public itemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.Code == -1
  } 
  //#endregion

  //#region DateChange
  onDatepickerChange(event, prop: string, message?: string){
    const UpdateTimeString = formatDate(event, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
    if(prop == 'DateMin'){
      let miniDay: number = 0
      this.orderProductForm.controls['DateMin'].setValue(UpdateTimeString)

      if(Ps_UtilObjectService.hasValue(this.orderProductForm.controls['DateDuration'].value)
        && this.orderProductForm.controls['DateDuration'].value > 0 
        && Ps_UtilObjectService.hasValue(this.OrderDate)){

        // tính số ngày tối thiểu = ngày được chọn - ngày hẹn gửi đơn hàng
        miniDay = this.CountDateBetween(this.OrderDate, event)
        // tính % date tối thiểu = (số ngày tối thiểu / số ngày sử dụng) * 100
        this.orderProductForm.controls['DatePercent'].patchValue(
          ((miniDay / this.orderProductForm.controls['DateDuration'].value)) * 100
        )
      } else{
        this.orderProductForm.controls['DatePercent'].setValue(null)
      }

    } else{
      this.DomesticOrder[prop] = UpdateTimeString
      this.handleUpdateOrderInformation([prop], message)  
    }
  }

  /**
   * Hàm xử lý tính số ngày giữa hai ngày truyền vào
   * @param numOfDate số ngày được tính
   * @param startDate Ngày bắt đầu todate | startDateWork
   * @param endDate Ngày bắt đầu startDateWork | endDateWork
   */
  CountDateBetween(startDate: Date, endDate: Date){
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    if(endDate > startDate){
      if(Ps_UtilObjectService.hasValue(startDateOnly) && Ps_UtilObjectService.hasValue(endDateOnly)){
        const differenceMilliseconds = endDateOnly.getTime() - startDateOnly.getTime();
        var numOfDate = differenceMilliseconds/ (1000 * 60 * 60 * 24);
      }
    } 
    return numOfDate
  }

  //#endregion

  //#region update Block Thong tin dat hang
  handleUpdateOrderInformation(props: string[], message: string){
    let newProps: string[] = [];
    newProps = props
    this.queueApiService.addApiQueue(this.DomesticOrder, newProps, 'UpdateDomesticOrder', message, this.setCache.bind(this));
  }

  setCache(v: DTODomesticOrders){
    this.DomesticOrder = v
    this.DomesticOrderDefault = JSON.parse(JSON.stringify(v))

    if (this.isAdd) {
      this.isAdd = false
      localStorage.setItem("PODomestic", JSON.stringify(this.DomesticOrder))
    }
  
    if(this.DomesticOrder.StatusID == 1){
      this.CheckDisplayDate()
    }

    this.selectedSupplier = this.listSupplier.find(Supplier => {
      if(Ps_UtilObjectService.hasValue(this.DomesticOrder.Supplier)){
        if (Supplier.Code == this.DomesticOrder.Supplier) {
          return Supplier
        } 
      } 
    })

    if(Ps_UtilObjectService.hasValue(this.DomesticOrder.DeliveryLocation)){
      this.selectedAddress = this.listWareHouseAddress.find(selectAddress => selectAddress.Code == this.DomesticOrder.DeliveryLocation)
    } else{
      this.selectedAddress = new DTOStoreAndWH()
    }
    this.Supplier = { ...this.selectedSupplier }
    this.OrderDate = new Date(this.DomesticOrder.OrderedTime)
    

    this.displayStatusBtn()
  }

  onDropdownlistClick(value: any, type: number){
    if(type == 1){
      this.DomesticOrder.DeliveryLocation = value.Code
      this.DomesticOrder.DeliveryAddress = value.Address
      this.handleUpdateOrderInformation(['DeliveryLocation', 'DeliveryAddress'], 'Địa chỉ giao hàng')
    } else{
      this.orderProductForm.controls['Unit'].setValue(value)
    }
  }
  //#endregion

  //#region TextBox
  onUpdateTestFierd(prop: string[]) {
    if(prop[0] == 'DiscountPOPercent'){
      this.isEditPercen = false
    } 
    if(prop[0] == 'ContactPhone'){
      if(this.DomesticOrder.ContactPhone != this.DomesticOrderDefault.ContactPhone && this.DomesticOrder.ContactPhone != '' ){
        let checkphonenumber = this.DomesticOrder.ContactPhone.replace(/ /g, "")
        if(checkphonenumber.length != 10){
          this.DomesticOrder.ContactPhone = this.DomesticOrderDefault.ContactPhone
          this.layoutService.onWarning('Vui lòng nhập đầy đủ số điện thoại liên hệ!')
        } else{
          this.handleUpdateOrderInformation(prop, 'Điện thoại liên hệ')
        }
      } else{
        this.DomesticOrder.ContactPhone = this.DomesticOrderDefault.ContactPhone
        this.layoutService.onWarning('Vui lòng nhập đầy đủ số điện thoại liên hệ!')
      }
    } else if(prop[0] == 'ReceivingFromOrdered' || prop[0] == 'ReceivingPeriod'){
      if(this.DomesticOrder[prop[0]] == 0 || this.DomesticOrder[prop[0]] == null){
        this.layoutService.onWarning('Số ngày làm việc không được bằng 0 hoặc bỏ trống!!!')
        this.DomesticOrder[prop[0]] = this.DomesticOrderDefault[prop[0]]
      } else{
        this.handleUpdateOrderInformation(prop, 'Số ngày làm việc')
      }
    } else{
      this.handleUpdateOrderInformation(prop, 'Chiết khấu đơn hàng')
    }
  
  }
  //#endregion

  //#region Checkbox
  onCheckboxClick(prop: string, message?: string) {
    if(prop == 'isHasMiniDate'){
      this.isHasMiniDate = !this.isHasMiniDate 
      if(!this.isHasMiniDate){
        this.orderProductForm.controls['DatePercent'].setValue(null)
        this.DateMin = null
        this.datepickerMin.value = null
        this.orderProductForm.controls['DateMin'].setValue(null)
      } else{
        if(!this.isAddNewProduct && Ps_UtilObjectService.hasValue(this.ProductOrder.DateMin)){
          this.DateMin = new Date(this.ProductOrder.DateMin)
        } else{
          this.DateMin = null
        }
        this.orderProductForm.controls['DatePercent'].patchValue(this.ProductOrder.DatePercent)
      }
    } else{
      if(this.DomesticOrder.IsSendAuto == false){
        this.DateOrder = null
        this.startDateWork = null
        this.endDateWork = null
      }
      this.DomesticOrder[prop] = !this.DomesticOrder[prop]
      this.handleUpdateOrderInformation([prop], message)  
    }
  }
  //#endregion

  //#region Image
  getResImg(str: string, imageKey: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    if (this.errorOccurred[imageKey]) { return this.getResHachi(a); }
    else {
      return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
    }
  }
  handleError(imageKey: string) { this.errorOccurred[imageKey] = true; }

  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }
  //#endregion

  //#region FilterProduct
  handleSearch(event){
    console.log(event)
    if (event.filters && event.filters.length > 0){
    //   if (event.filters[0].value === '') {
    //     this.gridState.skip = 0
    //   } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.KeyWord = event.filters[0].value
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = 0
    //   }
      this.onLoadFilter()
      this.APIGetListOrderProduct()
    }
  }
  //#endregion

  //#region Grid Action
  onAddNewProduct(){
    this.orderProductObj = new DTOOrderProducts()
    this.orderProductObj.Quantity = 1
    this.ProductOrder = new DTOOrderProducts()
    this.isAddNewProduct = true
    this.isHasMiniDate = false
    this.orderProductForm.reset()
    this.DateMin = null
    this.orderProductForm.patchValue(this.orderProductObj)
    this.listWareHouse = []
    this.DrawerRightComponent.toggle()
  }

  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }

  onPageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    if (!this.isAdd) {
      this.onLoadFilter()
      this.APIGetListOrderProduct()
    }
  }

  onActionDropdownClick(menu: MenuDataItem, item: any) {
    this.ProductOrder = item
    if (menu.Link == 'delete' || menu.Code == 'trash') {
      this.typePopup = { type: 'xóa', title: "XÓA SẢN PHẨM?" }
      this.ProductNumber = 0
      this.onToggleDialog(true, 'openedPopupProduct', false)
    }
    if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Link == 'detail' || menu.Code == 'eye') {
      if(Ps_UtilObjectService.hasValue(this.DateMin) || this.ProductOrder.DatePercent){
        this.isHasMiniDate = true
      } else{
        this.isHasMiniDate = false
      }
      if(Ps_UtilObjectService.hasValue(item.DateDuration)){
        this.expirationDate = this.addDays(this.OrderDate, item.DateDuration)
      }
      this.orderProductForm.patchValue(item)
      this.APIGetListWareHouse(item)
      if (!Ps_UtilObjectService.hasListValue(this.listUnit)) {
        this.APIGetListPackingUnit()
      }
      if(menu.Link == 'edit' || menu.Code == 'pencil'){
        this.isAddNewProduct = false
        this.isEdit = true
        if(Ps_UtilObjectService.hasValueString(item.DateMin)){
          this.DateMin = new Date(item.DateMin)
        }
      }
      this.ProductNumber = 0
      this.DrawerRightComponent.toggle()
    }
  }

  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    moreActionDropdown = []
    this.ProductOrder = dataItem

    if ((this.isToanQuyen || this.isAllowedToCreate) && this.DomesticOrder.OrderTypeID == 1 && this.DomesticOrder.StatusID != 3 && this.DomesticOrder.StatusID != 5) {
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
      if((this.DomesticOrder.StatusID == 1)){
        moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Link: "delete", Actived: true })
      }
    } else {
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
    }
    return moreActionDropdown
  }

  getSelectionPopup(selectedList: any[]) {
    this.listProductDelete = selectedList
    if (Ps_UtilObjectService.hasListValue(this.listProductDelete)) {
      this.ProductNumber = this.listProductDelete.length
    } else {
      this.ProductNumber = 0
    }
    this.isFilterActive = !this.isFilterActive
    var moreActionDropdown = new Array<MenuDataItem>()

    if ((this.isToanQuyen || this.isAllowedToCreate)) {
      moreActionDropdown.push({ Type: "delete", Name: "Xóa sản phẩm", Code: "trash", Link: "delete", Actived: true })
    }

    return moreActionDropdown
  }

  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }

  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (Ps_UtilObjectService.hasListValue(list)) {
      if (btnType == "delete") {
        this.onToggleDialog(true, 'openedPopupProduct', false)
      }
    }
  }
  //#endregion

  //#region Drawer
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  onBlurBarcode() {
    this.orderProductObj = this.orderProductForm.value
    // let  hasSpace: boolean = this.orderProductObj.Barcode.includes(" ");
    this.orderProductObj.Barcode.replace(/\s+/g, '')

    if (!Ps_UtilObjectService.hasValueString(this.orderProductObj.Barcode)) {
      this.layoutService.onWarning('Vui lòng nhập mã sản phẩm !')
      this.isGetProduct = false
      this.isEdit = false
      this.orderProductObj = new DTOOrderProducts()
      this.orderProductForm.patchValue(this.orderProductObj)
      this.listWareHouse = []
    } 
    else {
      this.APIGetProduct(this.orderProductObj)
    }
  }

  blurChangeQuantity() {
    if(this.orderProductForm.controls['Quantity'].value > 0){
      // tính thành tiền trươc VAT
      this.orderProductForm.controls['AmountBeforeVAT'].setValue(
        this.orderProductForm.controls['Quantity'].value * this.orderProductForm.controls['BasePrice'].value
      )
      
      if (this.orderProductForm.controls['Quantity'].value) {
        // set lại số lượng chia tại các kho hàng = 0
        for (let i = 0; i < this.listWareHouse.length - 1; i++) {
          this.listWareHouse[i].Quantity = 0
        }
        // set kho online bằng số lượng
        if(this.listWareHouse.length != this.listWareHouseDefault.length){
          let KhoOnline = this.listWareHouseDefault.filter(i => i.WHName == 'Kho Online')
          this.listWareHouse.push(KhoOnline[0])
        }
        this.listWareHouse.find(i => {
          if(i.WHName == 'Kho Online'){
            i.Quantity = this.orderProductForm.controls['Quantity'].value
          }
        })
      }

      if(this.orderProductForm.controls['Discount'].value){
        this.onCalculate(this.orderProductForm.controls['AmountBeforeVAT'].value, 'DiscountAmount', 'Discount', false)
      } else {
        this.onCalculate(this.orderProductForm.controls['AmountBeforeVAT'].value, 'VATAmount', 'VAT', false)
      }
    } else{
      this.layoutService.onWarning('Vui lòng nhập số lượng sản phẩm !!!')
    }
    
  }

  // Hàm tính giá sau thuế, chiết khấu
  onCalculate(price: number, TypeString: string, TypeCalculta: string, Precent: boolean) {
    // nếu là tính phần trăm bằng nhập vào giá tiền (chiết khấu hoăc vat)
    if(Precent){
      this.orderProductForm.controls[TypeString].patchValue(
        (100 - ((price - this.orderProductForm.controls[TypeCalculta].value) / price) * 100)
      )
    } 
    // tính giá tiền chiết khấu bằng nhập (% chiết khấu hoặc %VAT)
    else{
      this.orderProductForm.controls[TypeString].patchValue(
        price * (this.orderProductForm.controls[TypeCalculta].value / 100)
      ) 
    }

    this.orderProductForm.controls['VATAmount'].patchValue(
      (price - this.orderProductForm.controls['DiscountAmount'].value) * (this.orderProductForm.controls['VAT'].value / 100)
    ) 

    this.orderProductForm.controls['AmountAfterVAT'].patchValue(
      (price - this.orderProductForm.controls['DiscountAmount'].value + this.orderProductForm.controls['VATAmount'].value) 
    ) 

  }

  sumQuanity(list: DTOStoreAndWH[]){
    let tongsoluong =  0
    list.forEach(i =>{
      if(Ps_UtilObjectService.hasValue(i.Quantity) && i.WHName != 'Kho Online'){
        tongsoluong = tongsoluong + i.Quantity
      }
    })
    return tongsoluong
  }
   // Hàm này tính số lượng chia 
  blurInputGrid(listWarehouse = [], item: DTOStoreAndWH) {
    let tongsoluong = this.sumQuanity(listWarehouse)
    this.isEditQuantityDivision = false
    let KhoOnline = this.listWareHouseDefault.filter(i => i.WHName == 'Kho Online')
    // nếu số lường mua lơn hơn số lương chia thì cho số còn lại vào kho online
    if(this.orderProductForm.controls['Quantity'].value - tongsoluong > 0){

      if(this.listWareHouse.length != this.listWareHouseDefault.length){
        this.listWareHouse.push(KhoOnline[0])
      }

      this.listWareHouse.find(i => {
        if(i.WHName == 'Kho Online'){
          i.Quantity = this.orderProductForm.controls['Quantity'].value - tongsoluong
        }
      })

    } else if (this.orderProductForm.controls['Quantity'].value - tongsoluong == 0){

      // xóa kho onlne
      this.listWareHouse = this.listWareHouse.filter(i => i.WHName != 'Kho Online')
      
    }  else if (this.orderProductForm.controls['Quantity'].value - tongsoluong < 0) {
      this.listWareHouse.find(i =>{
        if(i.Code == item.Code){
          i.Quantity = 0
          this.layoutService.onWarning('Không thể nhập vượt quá số lượng kho online !!!')
        }

        if(this.listWareHouse.length != this.listWareHouseDefault.length ){
          KhoOnline[0].Quantity = this.orderProductForm.controls['Quantity'].value + (item.Quantity - tongsoluong)
          if(KhoOnline[0].Quantity > 0){
            this.listWareHouse.push(KhoOnline[0])
          }
        }
        if(i.WHName == 'Kho Online'){
          i.Quantity = this.orderProductForm.controls['Quantity'].value - this.sumQuanity(this.listWareHouse)
        } 
      })
    }
    
  }

  addDays(date: Date, days: number): Date {
    let result = new Date(date);
    result.setTime(result.getTime() + (days * 24 * 60 * 60 * 1000));
    return result;
  }

  // hàm tính ngày và phần trăm ngày tối thiểu
  onCalculateMinDate(){

    if((this.orderProductForm.controls['DatePercent'].value <= 100)){  
      if((Ps_UtilObjectService.hasValue(this.orderProductForm.controls['DateDuration'].value) 
        && this.orderProductForm.controls['DateDuration'].value > 0) && Ps_UtilObjectService.hasValue(this.OrderDate)){
         let miniDay: number = 0
         // tính số ngày tối thiểu = số ngày sử dùng kể từ ngày sản xuất * Phần trăm  ngày tối thiểu
         miniDay = this.orderProductForm.controls['DateDuration'].value * ((this.orderProductForm.controls['DatePercent'].value) / 100)
         
         // tính ngày tối thiểu = ngày hẹn gửi đơn hàng + số ngày tối thiểu
         this.DateMin = this.addDays(this.OrderDate, miniDay);
         this.orderProductForm.controls['DateMin'].patchValue(formatDate(this.DateMin, 'yyyy-MM-ddTHH:mm:ss', 'en-US'));
      }
    } else{
      this.orderProductForm.controls['DatePercent'].patchValue(100)
      this.onCalculateMinDate()
      this.layoutService.onWarning('Vui lòng nhập phần trăm ngày tối thiểu không được vượt quá 100%')
    }
    
  }


  //  Hàm double click input grid
  onClick(item: DTOStoreAndWH) {
    this.itemCurrGrid = item
    if (item.WHName != this.listWareHouse[this.listWareHouse.length - 1].WHName) {
      this.isEditQuantityDivision = true;
    }
  }

  onCloseForm() {
    this.DateMin = null
    this.isAddNewProduct = false
    this.isEdit = false
    this.isGetProduct = false
    this.listWareHouse = []
    this.isEditQuantityDivision = false
    this.DrawerRightComponent.toggle()
  }

  onUpdateForm() {
    this.orderProductObj = this.orderProductForm.value
    if( this.orderProductObj.DatePercent == 0 ){
      this.orderProductObj.DatePercent = null
    }
    if (!Ps_UtilObjectService.hasValueString(this.orderProductObj.Barcode)) {
      this.layoutService.onWarning('Vui lòng nhập mã sản phẩm !')
    }
    else if(((this.isAddNewProduct && this.isGetProduct) || (this.isEdit) ) ){
      this.isUpdate = true
      this.APIUpdateOrderProduct(this.orderProductObj);
    }
  }
  //#endregion

  //#region Email
  onChangePageBtn(event: boolean, Page: string) {
    if(Page == 'isChangePageInvoice'){
      this.isChangePageEmail = false
      this.APIGetListOrderInvoice()
    } else{
      this.isChangePageInvoice = false
    }
    this[Page] = event
    this.displayStatusBtn()  
  }

  onCheckBlockEmail(prop: string[]) {
    let isMailToValid = true;
    let isMailCCValid = true;

    if (!Ps_UtilObjectService.isValidEmail(this.DomesticOrder.EmailTo) && prop[0] === 'EmailTo') {
      isMailToValid = false
      //this.DomesticOrder.EmailTo = ""
      this.layoutService.onWarning('Vui lòng nhập đúng định dạng email')
    }
    if (!Ps_UtilObjectService.isValidEmail(this.DomesticOrder.EmailCc) && prop[0] === 'EmailCc') {
      //this.DomesticOrder.EmailCc = ""
      isMailCCValid = false
      this.layoutService.onWarning('Vui lòng nhập đúng định dạng email')
    }
    if (!Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailContent) && prop[0] === 'EmailContent') {
      this.layoutService.onWarning('Vui lòng nhập nội dung email')
    }

    if (isMailToValid && prop[0] === 'EmailTo') {
      this.handleUpdateOrderInformation(prop, 'Email người nhận')
    }
    if (isMailCCValid && prop[0] === 'EmailCc') {
      this.handleUpdateOrderInformation(prop, '')
    }
    if (Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailContent) && prop[0] === 'EmailContent') {
      this.handleUpdateOrderInformation(prop, 'nội dung email')
    }
  }

  onSaveEditor(e: string) {
    this.DomesticOrder.EmailContent = e
    this.onCheckBlockEmail(['EmailContent'])
  }

  GetFolderWithFile(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceBlog.GetFolderWithFile(childPath, 18)
  }
  pickFile(e: DTOCFFile, width, height) {
    this.layoutService.getEditor().embedImgURL(e, width, height)
    this.layoutService.setFolderDialog(false)
  }
  
  //#endregion

  //#region Popup
  onToggleDialog(event, strCheck: string, isDrawer?: boolean) {
    this[strCheck] = event
    this.isDeleteInDrawer = isDrawer
  }

  onDeleteDialog(strCheck: string, type?: number) {
    if (strCheck == 'openedPopupProduct') {
      if(this.isDeleteInDrawer){
        this.DrawerRightComponent.toggle()
      }
      if (this.ProductOrder.Code != 0 && !Ps_UtilObjectService.hasListValue(this.listProductDelete)) {
        this.APIDeleteOrderProduct([this.ProductOrder])
      } else{
        this.APIDeleteOrderProduct(this.listProductDelete)
      }
    } 
    else if(strCheck == 'openedPopupPOCannel'){
      this.isChangePageEmail = false
      this.isChangePageInvoice = false
      if(type == 2){
        this.APIDuplicatePOCancel()
      }else{
        this.APIUpdateDomesticOrdersStatus(this.DomesticOrder, null, {'OrderTypeID': 2})
      }
    } 
    else {
      if (this.typePopup.type == 'xóa') {
        this.APIDeleteDemesticOrders(this.DomesticOrder)
      }
    }
    this[strCheck] = false
  }
    

  //#endregion

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}




// export class Pur003PODomesticDetailComponent implements OnInit, OnDestroy {
//   @ViewChild('formDrawer') public drawer: MatDrawer;

//   // region Boolean
//   isAdd: boolean = false
//   loading: boolean = false
//   HasDetail: boolean = true
//   isChangePage: boolean = false;
//   isExceedLimit: boolean = false;
//   isFilterActive: boolean = true;
//   expandedRight: boolean = false
//   isautoCollapse: boolean = false
//   isOverPriced: boolean = false
//   TaolichHen_checked: boolean = false
//   excelValid: boolean = true
//   openedPopupProduct: boolean = false
//   openedPopupPO: boolean = false
//   hasListOrderProduct: boolean = false
//   ExplanStates: { [key: string]: boolean } = {};
//   // endregion

//   // region string
//   KeyWord: string = '';
//   ProductNumber: number = 0
//   // endregion

//   // region Date
//   today: Date = new Date()
//   filterDate: Date
//   CreCelendar: Date | string
//   // endregion

//   // region Grid
//   pageSize = 25
//   pageSizes = [this.pageSize]
//   allowActionDropdown = ['delete']

//   gridView = new Subject<any>();
//   gridViewInfo = new Subject<any>();
//   skip = 0;
//   total = 0
//   gridState: State = {
//     take: this.pageSize,
//     filter: { filters: [], logic: 'and' },
//   }
//   filterListOrderProduct: FilterDescriptor = {
//     field: "OrderMaster", operator: "eq", value: 0
//   }


//   //CALLBACK
//   uploadEventHandlerCallback: Function
//   //rowItem action dropdown
//   onActionDropdownClickCallback: Function
//   getActionDropdownCallback: Function
//   //grid data change
//   onPageChangeCallback: Function
//   onSortChangeCallback: Function
//   onFilterChangeCallback: Function
//   //grid select
//   getSelectionPopupCallback: Function
//   onSelectCallback: Function
//   onSelectedPopupBtnCallback: Function
//   //select
//   selectable: SelectableSettings = {
//     enabled: true,
//     mode: 'multiple',
//     drag: false,
//     checkboxOnly: true,
//   }
//   // endregion

//   //region permision
//   justLoaded = true
//   actionPerm: DTOActionPermission[] = []

//   isToanQuyen = false
//   isAllowedToCreate = false
//   isAllowedToVerify = false
//   //endregion

//   //#region data form trong drawer của Trường
//   orderProductForm: FormGroup = new FormGroup({
//     Code: new FormControl(0),
//     ImageThumb: new FormControl(''),
//     ProductName: new FormControl(''),
//     Barcode: new FormControl(''),
//     Poscode: new FormControl(''),
//     ReceivedQuantity: new FormControl(0),
//     Quantity: new FormControl(0),
//     ModifiedQuantity: new FormControl(0),
//     ConfirmedQuantity: new FormControl(0),
//     Price: new FormControl(0),
//     Bid: new FormControl(0),
//     Discount: new FormControl(''),
//     DiscountAmount: new FormControl(0),
//     TotalPrice: new FormControl(0),
//     VAT: new FormControl(0),
//     ListStoreAndWH: new FormControl([]),
//     RemarkSupplier: new FormControl(''),
//     RemarkWarehouse: new FormControl(''),
//     OrderMaster: new FormControl(0),
//     Supplier: new FormControl(0),
//     Product: new FormControl(0),
//   });
//   //#endregion
//   // region Subject
//   ngUnsubscribe = new Subject<void>;
//   // endregion

//   // region Array
//   ListDetailPOProduct: DTOOrderProducts[] = []
//   ListOrderReceiving: DTOOrderReceiving[] = []
//   listProductDelete: DTOOrderProducts[] = []
//   listSupplierTree: DTOSupplier[] = []
//   listSupplier: DTOSupplier[] = []
//   listSupplierfilter: DTOSupplier[] = []

//   typePopup: { type: string, title: string } = { type: 'xóa', title: "XÓA ĐƠN HÀNG?" }


//   arrBtnStatus: { text: string, class: string, code: string, link?: any, type?: string }[] = [];

//   ListTime = [
//     { Code: 1, text: "AM (Sáng)", value: 'AM' },
//     { Code: 2, text: "PM (Tối)", value: 'PM' }
//   ]
//   // endregion

//   // region Object
//   DomesticOrder = new DTODomesticOrders()
//   ProductOrder = new DTOOrderProducts()
//   selectedSupplier = new DTOSupplier()
//   Supplier = new DTOSupplier()
//   // endregion

//   SelectedTime: { Code: number, text: string, value: string }

//   // Callback Function Folder
//   GetFolderCallback: Function
//   pickFileCallback: Function

//   constructor(
//     public menuService: PS_HelperMenuService,
//     public layoutService: LayoutService,
//     public apiService: PurPOAPIService,
//     public PurSupplierApiService: PurSupplierApiServiceService,
//     public apiServiceBlog: MarNewsProductAPIService,
//     public domSanititizer: DomSanitizer
//   ) { }
//   ngOnInit(): void {
//     let that = this
//     this.SelectedTime = this.ListTime[0]
//     this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DTOPermission) => {
//       if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
//         that.justLoaded = false
//         that.actionPerm = distinct(res.ActionPermission, "ActionType")

//         that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
//         that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
//         that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

//         this.GetCachePODomestic()
//       }
//     })

//     this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
//     //callback
//     this.onPageChangeCallback = this.onPageChange.bind(this)
//     //dropdown
//     this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
//     this.getActionDropdownCallback = this.getActionDropdown.bind(this)
//     //select
//     this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
//     this.onSelectCallback = this.selectChange.bind(this)
//     this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)

//     //folder
//     this.pickFileCallback = this.pickFile.bind(this)
//     this.GetFolderCallback = this.GetFolderWithFile.bind(this)

//   }

//   //----------------------API----------------------------//

//   // lấy thông tin đơn hàng từ Cache
//   GetCachePODomestic() {
//     const res = JSON.parse(localStorage.getItem('PODomestic'))
//     if (Ps_UtilObjectService.hasValue(res)) {
//       this.DomesticOrder = res
//       if (this.DomesticOrder.Code != 0) {
//         this.isAdd = false
//       } else {
//         this.isAdd = true
//       }
//       this.onLoadPage()
//     }
//   }

//   // API Lấy danh sách nhà cung cấp
//   APIGetListSupplierTree() {
//     this.loading = true

//     this.PurSupplierApiService.GetListSupplierTree().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
//       if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.listSupplierTree = res.ObjectReturn
//         this.listSupplier = this.flattenTree(this.listSupplierTree)
//         this.listSupplierfilter = this.listSupplier
//         this.selectedSupplier = this.listSupplier.find(Supplier => {
//           if (Supplier.ShortName == this.DomesticOrder.SupplierID || Supplier.PartnerID == this.DomesticOrder.SupplierID) {
//             return Supplier
//           }
//         })
//         this.Supplier = { ...this.selectedSupplier }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhà cung: ${res.ErrorString}`)
//       }
//       this.loading = false
//     }, (error) => {
//       this.loading = false
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhà cung: ${error} `)
//     })
//   }

//   // API Lấy thông tin đơn hàng
//   APIGetDomesticOrder() {
//     this.loading = true

//     this.apiService.GetDomesticOrder(this.DomesticOrder).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
//       if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.DomesticOrder = res.ObjectReturn

//         if (Ps_UtilObjectService.hasValue(this.DomesticOrder.OrderedTime)) {
//           this.CreCelendar = new Date(this.DomesticOrder.OrderedTime)
//         } else {
//           this.CreCelendar = new Date()
//         }
//         if (Ps_UtilObjectService.hasValue(this.DomesticOrder.EstDeliveredTime)) {
//           this.filterDate = new Date(this.DomesticOrder.EstDeliveredTime)
//         } else {
//           this.filterDate = new Date()
//         }
//         this.TaolichHen_checked = this.DomesticOrder.IsSendEmail
//         this.filterListOrderProduct.value = this.DomesticOrder.Code
//         if (Ps_UtilObjectService.hasValue(this.DomesticOrder.EstDeliveredPeriod)) {
//           this.SelectedTime = this.ListTime.find(time => {
//             if (time.value == this.DomesticOrder.EstDeliveredPeriod) {
//               return time
//             }
//           })
//         }
//         this.displayStatusBtn()
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${res.ErrorString}`)
//       }
//       this.loading = false
//     }, (error) => {
//       this.loading = false
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${error} `)
//     })
//   }

//   // API lấy danh sách thông tin chi tiết đơn hàng
//   APIGetListOrderProduct() {
//     this.loading = true;
//     var ctx = 'Danh sách sản phẩm'
//     this.apiService.GetListOrderProduct(this.gridState, this.KeyWord).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.ListDetailPOProduct = res.ObjectReturn.Data;
//         if (!Ps_UtilObjectService.hasValueString(this.KeyWord)) {
//           if (Ps_UtilObjectService.hasListValue(this.ListDetailPOProduct)) {
//             this.hasListOrderProduct = true
//           } else {
//             this.hasListOrderProduct = false
//           }
//         }
//         this.displayStatusBtn()
//         this.total = res.ObjectReturn.Total
//         this.gridView.next({ data: this.ListDetailPOProduct, total: this.total });
//       } else
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)
//       this.loading = false;
//     }, () => {
//       this.loading = false;
//       this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
//     })
//   }

//   // API Lấy danh sách thông tin giao nhận đơn hàng
//   APIGetListOrderReceiving() {
//     this.loading = true;
//     var ctx = 'danh sách giao nhận đơn hàng'

//     this.apiService.GetListOrderReceiving(this.DomesticOrder).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.ListOrderReceiving = res.ObjectReturn
//         this.gridViewInfo.next({ data: this.ListOrderReceiving, total: this.ListOrderReceiving.length })
//       } else
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)
//       this.loading = false;
//     }, () => {
//       this.loading = false;
//       this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
//     })
//   }

//   // API Tải template excel danh sách thôn tin chi tiết đơn hàng
//   APIGetTemplate() {
//     var ctx = "Tải Excel Template"
//     var getfilename = "OrderProductTemplate.xlsx"
//     this.layoutService.onInfo(`Đang xử lý ${ctx}`)

//     this.apiService.GetTemplate(getfilename).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//       if (res != null) {
//         Ps_UtilObjectService.getFile(res)
//         this.layoutService.onSuccess(`${ctx} thành công`)
//       } else {
//         this.layoutService.onError(`${ctx} thất bại`)
//       }
//       this.loading = false;
//     }, f => {
//       this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
//       this.loading = false;
//     });
//   }

//   // API Cập nhập thông tin đơn hàng
//   APIUpdateDomesticOrder(item: DTODomesticOrders, prop: string[]) {
//     this.loading = true;
//     var ctx = 'Cập nhật thông tin đơn hàng'

//     this.apiService.UpdateDomesticOrder(item, prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.DomesticOrder = res.ObjectReturn
//         if (this.isAdd) {
//           this.isAdd = false
//         }
//         this.selectedSupplier = this.listSupplier.find(Supplier => {
//           if (Supplier.ShortName == this.DomesticOrder.SupplierID || Supplier.PartnerID == this.DomesticOrder.SupplierID) {
//             return Supplier
//           }
//         })
//         this.TaolichHen_checked = this.DomesticOrder.IsSendEmail
//         this.Supplier = { ...this.selectedSupplier }
//         this.displayStatusBtn()
//         this.filterDate = new Date(this.DomesticOrder.EstDeliveredTime)
//         this.CreCelendar = new Date(this.DomesticOrder.OrderedTime)
//         this.layoutService.onSuccess(`${ctx}`);
//       } else
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//       this.loading = false;
//     }, () => {
//       this.loading = false;
//       this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
//     })
//   }

//   // API cập nhật tình trạng đơn hàng
//   APIUpdateDomesticOrdersStatus(item: DTODomesticOrders, statusID: number) {
//     this.loading = true

//     this.apiService.UpdateDomesticOrdersStatus([item], statusID).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
//       if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.onLoadPage()
//         this.layoutService.onSuccess(`Cập nhật đơn hàng tình trạng đơn hàng thành công`)
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật đơn hàng tình trạng đơn hàng: ${res.ErrorString}`)
//       }
//       this.loading = false
//     }, (error) => {
//       this.loading = false
//       this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật đơn hàng tình trạng đơn hàng: ${error} `)
//     })
//   }

//   // API Xóa sản phẩm trong danh sách thôn tin đơn hàng
//   APIDeleteOrderProduct(ListProduct: DTOOrderProducts[]) {
//     this.loading = true;
//     var ctx = 'sản phẩm'

//     this.apiService.DeleteOrderProduct(ListProduct).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.onLoadPage()
//         this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
//         this.layoutService.onSuccess('Xóa sản phẩm thành công');
//       } else
//         this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${res.ErrorString}`)
//       this.loading = false;
//     }, () => {
//       this.loading = false;
//       this.layoutService.onError('Đã xảy ra lỗi khi xóa ' + ctx)
//     })
//   }

//   // API Xóa đơn hàng
//   APIDeleteDemesticOrders(item: DTODomesticOrders) {
//     this.loading = true;
//     var ctx = `đơn hàng ${item.OrderNo}`

//     this.apiService.DeleteDemesticOrders([item]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.isAdd = true
//         this.onLoadPage()
//         this.layoutService.onSuccess('Xóa sản phẩm thành công');
//       } else
//         this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${res.ErrorString}`)
//       this.loading = false;
//     }, () => {
//       this.loading = false;
//       this.layoutService.onError('Đã xảy ra lỗi khi xóa ' + ctx)
//     })
//   }

//   // API Import excel thông tin chi tiết đơn hàng
//   p_ImportExcel(file) {
//     this.loading = true
//     var ctx = "Import Excel"

//     this.apiService.ImportOrderProduct(file, this.DomesticOrder.Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
//         this.layoutService.onSuccess(`${ctx} thành công`)
//         this.layoutService.setImportDialogMode(1)
//         this.layoutService.setImportDialog(false)
//         this.onLoadPage()
//         this.layoutService.getImportDialogComponent().inputBtnDisplay()
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
//       this.loading = false;
//     })
//   }

//   // API Export excel thông tin chi tiết đơn hàng
//   APIExportExcel() {
//     this.loading = true
//     var ctx = "Xuất Excel"
//     var getfileName = "AlbumnTemplate.xlsx"
//     this.layoutService.onInfo(`Đang xử lý ${ctx}`)

//     this.apiService.GetExcelAlbumn(3, 0).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//       if (res != null) {
//         Ps_UtilObjectService.getFile(res, getfileName)
//         this.layoutService.onSuccess(`${ctx} thành công`)
//       } else {
//         this.layoutService.onError(`${ctx} thất bại`)
//       }
//       this.loading = false;
//     }, f => {
//       this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
//       this.loading = false;
//     });
//   }

//   // API In thông tin chi tiết đơn hàng
//   APIPrintOrderDetail(list: number[]) {
//     this.loading = true;
//     var ctx = "in phiếu đơn hàng"

//     this.apiService.PrintOrderDetail(list).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
//       if (Ps_UtilObjectService.hasValue(res)) {
//         this.layoutService.onSuccess(`${ctx} thành công`)
//       } else
//         this.layoutService.onError(`Đã xảy ra lỗi ${ctx}: ${res?.ErrorString}`)

//       this.loading = false;
//     }, () => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
//       this.loading = false;
//     });
//   }

//   //#----------------------END-API----------------------------//


//   // ---------------------BLOCK-HEADER-----------------------//

//   onChangePageBtn(event: boolean) {
//     this.isChangePage = event
//     if (!this.isChangePage) {
//       this.onLoadPage()
//     }
//   }

//   //Hàm Tải lại trang
//   onLoadPage() {
//     if (this.isAdd) {
//       // Tải lại trang khi tạo mới
//       this.onCreateNew()
//     } else {
//       // lấy thông tin đơn hàng
//       this.APIGetDomesticOrder()
//       if (!Ps_UtilObjectService.hasListValue(this.listSupplierTree)) {
//         this.APIGetListSupplierTree()
//       }


//       // lấy danh sách thông tin chi tiết
//       this.onLoadFilter()
//       this.APIGetListOrderProduct()

//       // lấy danh sách giao nhận đơn hàng
//       this.APIGetListOrderReceiving()
//     }
//   }

//   onDatepickerChange123(value){

//   }

//   // Hàm in
  // onPrintOrder() {
  //   this.APIPrintOrderDetail([this.DomesticOrder.Code])
  // }

//   //Hàm cập nhập tìm trạng đơn hàng
//   onUpdateStatus(item: { text: string, class: string, code: string, link?: any, type?: string }) {

//     if (item.type == 'Send') {
//       if (this.DomesticOrder.IsSendEmail) {
//         if (!Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailTo)) {
//           this.layoutService.onWarning('Vui lòng nhập email người nhận!!!')
//         } 
//         else if (!Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailContent)) {
//           this.layoutService.onWarning('Vui lòng nhập nội dung email!!!')
//         } else {
//           this.  CheckOverPrice()
//         }
//       } else{
//         this.CheckOverPrice()
//       }
      
//     } else if (item.type == 'Return') {
//       this.APIUpdateDomesticOrdersStatus(this.DomesticOrder, item.link)
//     } else if (item.type == 'Cancel') {
//       this.typePopup = { type: 'hủy', title: "HỦY ĐƠN HÀNG?" }
//       this.onToggleDialog(true, 'openedPopupPO')
//     } else if (item.type == "CreateNew") {
//       this.onCreateNew()
//     }

//   }

//   CheckOverPrice(){
//     if (Ps_UtilObjectService.hasListValue(this.ListDetailPOProduct)) {
//       this.isOverPriced = this.ListDetailPOProduct.some(product => {
//         if (product.Price > product.Bid) {
//           return true
//         }
//         return false
//       })
//       if (this.isOverPriced) {
//         this.layoutService.onWarning('Có sản phẩm vượt giá trần. Vui lòng kiểm tra lại !!!')
//       } else {
//         this.APIUpdateDomesticOrdersStatus(this.DomesticOrder, 2)
//       }
//     }
//   }

//   // Hàm tạo mới đơn hàng
//   onCreateNew() {
//     this.isAdd = true

//     if (this.isChangePage) {
//       this.isChangePage = false
//     }

//     // clear nội dung block thông tin đơn hàng
//     const today = new Date()
//     this.DomesticOrder = new DTODomesticOrders();
//     this.selectedSupplier = null
//     this.Supplier = null
//     this.CreCelendar = new Date()
//     this.filterDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) //Thời gian dự kiến NCC giao hàng cách một tuần
//     this.TaolichHen_checked = false
//     this.hasListOrderProduct = false
//     this.SelectedTime = this.ListTime[0]


//     // clear danh sách thông tin chi tiết đơn hàng
//     this.ListDetailPOProduct = []
//     this.gridView.next({ data: this.ListDetailPOProduct, total: this.total })

//     // clear danh sách giao nhận đơn hàng
//     this.ListOrderReceiving = []
//     this.gridViewInfo.next({ data: this.ListOrderReceiving, total: this.total })

//     // lấy thông tin đơn hàng
//     if (!Ps_UtilObjectService.hasListValue(this.listSupplierTree)) {
//       this.APIGetListSupplierTree()
//     }
//   }

//   // Hàm Export excel
//   onExportExcel() {
//     this.APIExportExcel()
//   }

//   //------------------END-BLOCK-HEADER-----------------------//

//   //---------------------BLOCK-ORDERINFO---------------------//

//   // chuyên danh sách nhà cung cấp từ dạng tree sang dạng phẳng
//   flattenTree(tree: DTOSupplier[]): DTOSupplier[] {
//     let flatList: DTOSupplier[] = [];

//     tree.forEach(node => {
//       if (node.StatusID == 0) {// lọc nhà cung cấp đang hợp tác
//         flatList.push(node); // Thêm nút hiện tại vào mảng phẳng
//         if (node.ListSuppliers) {
//           flatList = flatList.concat(this.flattenTree(node.ListSuppliers)); // Gộp các nút con vào mảng phẳng
//         }
//       }
//     });

//     return flatList;
//   }
//   // Hàm sử lý khi chọn mã nhà cung cấp
//   onSupplierChange(event: DTOSupplier) {
//     const prop = ['SupplierName', 'SupplierID', 'Supplier']
//     if (Ps_UtilObjectService.hasValue(event)) {
//       this.DomesticOrder.SupplierName = event.VNName
//       this.DomesticOrder.SupplierID = event.ShortName
//       this.DomesticOrder.Supplier = event.Code
//       if (this.isAdd) {
//         const CreateNewOrderTime = new Date()
//         prop.push('OrderedTime')
//         prop.push('EstDeliveredPeriod')
//         const CreateNewOrderTimeString = formatDate(CreateNewOrderTime, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//         this.DomesticOrder.OrderedTime = CreateNewOrderTimeString
//         this.DomesticOrder.EstDeliveredPeriod = this.SelectedTime.value
//         this.isAdd = false
//       }
//       this.APIUpdateDomesticOrder(this.DomesticOrder, prop)
//     }
//     // cập nhật thông tin đơn hàng

//   }
//   onBlurSupplierChange(event: DTOSupplier) {
//     if (!Ps_UtilObjectService.hasValue(event)) {
//       this.selectedSupplier = this.Supplier
//     }
//   }

//   onCheckboxClick(strCheck: string) {
//     // lỗi chưa cập nhật
//     this[strCheck] = !this[strCheck]
//     this.DomesticOrder.IsSendEmail = this[strCheck]
//     this.APIUpdateDomesticOrder(this.DomesticOrder, ['IsSendEmail'])
//   }

//   onDropdownlistClick(value) {
//     this.SelectedTime = value
//     this.DomesticOrder.EstDeliveredPeriod = this.SelectedTime.value
//     this.APIUpdateDomesticOrder(this.DomesticOrder, ['EstDeliveredPeriod'])
//   }

//   handleFilter(event) {
//     if (Ps_UtilObjectService.hasValueString(event)) {
//       this.listSupplierfilter = this.listSupplier.filter(result => {
//         if (Ps_UtilObjectService.hasValueString(result.PartnerID)) {
//           return result.PartnerID.includes(event)
//         }
//       });
//     } else {
//       this.listSupplierfilter = this.listSupplier
//     }
//   }

//   // Hàm cập nhật DatePicker
//   onDatepickerChange(event, prop: string[]) {
//     if (Ps_UtilObjectService.hasValue(event)) {
//       if (prop[0] == 'OrderedTime') {
//         const EstDeliveredTime = new Date(event.getTime() + 7 * 24 * 60 * 60 * 1000)
//         const EstDeliveredTimeString = formatDate(EstDeliveredTime, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//         this.DomesticOrder.EstDeliveredTime = EstDeliveredTimeString
//         prop.push('EstDeliveredTime')
//       }
//       const CreateTimeString = formatDate(event, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//       this.DomesticOrder[prop[0]] = CreateTimeString
//       this.APIUpdateDomesticOrder(this.DomesticOrder, prop)
//     }
//   }

//   // Hiện màu tình trạng
//   getColor(startusid: number, type: string): string {
//     if (type == 'OrderTypeID') {
//       switch (startusid) {
//         case 1:
//         case 2:
//           return '#23282c';
//         case 3:
//           return '#EB273A';
//         default:
//           return '#959DB3'; // Màu mặc định hoặc không áp dụng màu
//       }
//     }
//     if (type == 'StatusID') {
//       switch (startusid) {
//         case 1:
//         case 5:
//           return '#23282c';
//         case 2:
//           return '#008cd7';
//         case 3:
//         case 7:
//           return '#316e00';
//         case 4:
//         case 6:
//           return '#FFB900';
//         default:
//           return '#959DB3'; // Màu mặc định hoặc không áp dụng màu
//       }
//     }
//   }

//   // Hàm cập nhật TextBox
//   onUpdateTestFierd(prop) {
//     this.APIUpdateDomesticOrder(this.DomesticOrder, prop)
//   }

//   //-----------------END-BLOCK-ORDERINFO---------------------//

//   //----------------BLOCK-LIST-ORDERINFO---------------------//

//   handleSearchChange(event) {
//     this.KeyWord = event
//     this.onLoadFilter()
//     this.APIGetListOrderProduct()
//   }

//   onImportExcel() {
//     this.layoutService.setImportDialog(true)
//     this.layoutService.setExcelValid(this.excelValid)
//   }

//   onDownloadExcel() {
//     this.APIGetTemplate()
//   }

//   uploadEventHandler(e: File) {
//     this.p_ImportExcel(e)
//   }

//   onPageChange(event: PageChangeEvent) {
//     this.gridState.skip = event.skip;
//     this.gridState.take = this.pageSize = event.take
//     if (!this.isAdd) {
//       this.onLoadFilter()
//       this.APIGetListOrderProduct()
//     }
//   }

//   onActionDropdownClick(menu: MenuDataItem, item: any) {
//     if (menu.Link == 'delete' || menu.Code == 'trash') {
//       this.typePopup = { type: 'xóa', title: "XÓA ĐƠN HÀNG?" }
//       this.onToggleDialog(true, 'openedPopupProduct')
//     }
//     if (menu.Link == 'edit' || menu.Code == 'pencil') {
//       this.orderProductForm.patchValue(item)
//       this.APIGetListWareHouse(item)
//       this.isEdit = true
//      this.DrawerRightComponent.toggle()
//     }
//     if (menu.Link == 'detail' || menu.Code == 'eye') {
//       this.orderProductForm.patchValue(item)
//       this.APIGetListWareHouse(item)
//       this.drawer.open()
//     }
//   }

//   getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
//     moreActionDropdown = []
//     this.ProductOrder = dataItem

//     if ((this.isToanQuyen || this.isAllowedToCreate) && (this.DomesticOrder.StatusID == 1 || this.DomesticOrder.StatusID == 4) && this.DomesticOrder.OrderTypeID == 1) {
//       moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
//       moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Link: "delete", Actived: true })
//     } else {
//       moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
//     }
//     return moreActionDropdown
//   }

//   getSelectionPopup(selectedList: any[]) {
//     this.listProductDelete = selectedList
//     if (Ps_UtilObjectService.hasListValue(this.listProductDelete)) {
//       this.ProductNumber = this.listProductDelete.length
//     } else {
//       this.ProductNumber = 0
//     }
//     this.isFilterActive = !this.isFilterActive
//     var moreActionDropdown = new Array<MenuDataItem>()

//     if ((this.isToanQuyen || this.isAllowedToCreate)) {
//       moreActionDropdown.push({ Type: "delete", Name: "Xóa sản phẩm", Code: "trash", Link: "delete", Actived: true })
//     }

//     return moreActionDropdown
//   }

//   selectChange(isSelectedRowitemDialogVisible) {
//     this.isFilterActive = !isSelectedRowitemDialogVisible
//   }

//   onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
//     if (Ps_UtilObjectService.hasListValue(list)) {
//       if (btnType == "delete") {
//         this.onToggleDialog(true, 'openedPopupProduct')
//       }
//     }
//   }

//   //---------------END-BLOCK-LIST-ORDERINFO------------------//

//   onLoadFilter() {
//     this.gridState.skip = 0
//     this.pageSizes = [...this.layoutService.pageSizes]
//     this.gridState.take = this.pageSize
//     this.gridState.filter.filters = []
//     if (Ps_UtilObjectService.hasValue(this.DomesticOrder.Code)) {
//       this.filterListOrderProduct.value = this.DomesticOrder.Code
//       this.gridState.filter.filters.push(this.filterListOrderProduct)
//     }
//   }

//   ExceedLimit(price, basePrice) {
//     if (price > basePrice) return true
//     return false
//   }

//   isHasSupplier() {
//     if (!Ps_UtilObjectService.hasValueString(this.DomesticOrder.SupplierName) &&
//       !Ps_UtilObjectService.hasValueString(this.DomesticOrder.SupplierID)) {
//       return true
//     } else {
//       return false
//     }
//   }

//   displayStatusBtn() {
//     this.arrBtnStatus = [];
//     if (this.DomesticOrder.OrderTypeID != 3) {
//       if ((this.isAllowedToCreate || this.isToanQuyen) && (this.DomesticOrder.StatusID == 4)) {
//         this.arrBtnStatus.push({
//           text: 'HỦY ĐƠN HÀNG',
//           class: 'k-button btn-hachi btnHuy',
//           code: 'cancel',
//           link: 3,
//           type: "Cancel"
//         });
//       }

//       if ((this.isAllowedToCreate || this.isToanQuyen) && (this.DomesticOrder.StatusID == 1 || this.DomesticOrder.StatusID == 4) && this.hasListOrderProduct) {
//         this.arrBtnStatus.push({
//           text: 'GỬI ĐƠN HÀNG NCC',
//           class: 'k-button btn-hachi btnGuiDuyet',
//           code: 'redo',
//           link: 2,
//           type: "Send"
//         });
//       }

//       if ((this.isAllowedToVerify || this.isToanQuyen) && (this.DomesticOrder.StatusID == 2)) {
//         this.arrBtnStatus.push({
//           text: 'LẤY LẠI ĐIỀU CHỈNH ĐƠN HÀNG',
//           class: 'k-button btn-hachi btnTraVe',
//           code: 'undo',
//           link: 4,
//           type: "Return"
//         });
//       }

//       if ((this.isAllowedToCreate || this.isToanQuyen)) {
//         this.arrBtnStatus.push({
//           text: 'TẠO MỚI',
//           class: 'k-button btn-hachi hachi-primary',
//           code: 'plus',
//           link: 0,
//           type: "CreateNew"
//         });
//       }
//     }
//   }


//   isSend() {
//     if (this.DomesticOrder.OrderTypeID == 1) {
//       if (this.DomesticOrder.StatusID == 1 || this.DomesticOrder.StatusID == 4) {
//         return false
//       } else {
//         return true
//       }
//     } else if (this.DomesticOrder.OrderTypeID == 2 || this.DomesticOrder.OrderTypeID == 3) {
//       return true
//     }
//   }

//   isHasListDetail(item) {
//     if (Ps_UtilObjectService.hasListValue(item.ListInvoice)) {
//       return true
//     }
//     return false
//   }

//   onDeleteDialog(strCheck: string) {
//     if (strCheck == 'openedPopupProduct') {
//         if (this.ProductOrder.Code != 0 && !Ps_UtilObjectService.hasListValue(this.listProductDelete)) {
//           this.APIDeleteOrderProduct([this.ProductOrder])
//         } else{
//           this.APIDeleteOrderProduct(this.listProductDelete)
//         }
//     } else {
//       if (this.typePopup.type == 'xóa') {
//         this.APIDeleteDemesticOrders(this.DomesticOrder)
//       } else {
//         this.DomesticOrder.OrderTypeID = 3
//         this.APIUpdateDomesticOrder(this.DomesticOrder, ['OrderTypeID'])
//       }
//     }
//     this[strCheck] = false

//   }

//   onToggleDialog(event, strCheck: string) {
//     this[strCheck] = event
//   }

//   onToggleDetail(event) {
//     this.ExplanStates[event.InvoiceNo] = !this.ExplanStates[event.InvoiceNo]
//   }


//   //#region khu vực trường xử lý

//   isAddNewProduct: boolean = false // biến trạng thái khi bấm thêm mới sản phẩm
//   orderProductObj: DTOOrderProducts = new DTOOrderProducts()
//   isEdit: boolean = false // biến trạng thái khi bấm chỉnh sửa
//   isGetProduct: boolean = false // biến trạng thái khi get sản phẩm
//   listWareHouse: DTOStoreAndWH[] = []
//   isEditQuantityDivision: boolean = false
//   //#region API
//   APIGetProduct(dataOrderProduct: DTOOrderProducts) {
//     dataOrderProduct.OrderMaster = this.DomesticOrder.Code
//     dataOrderProduct.Supplier = this.DomesticOrder.Supplier
//     this.apiService.GetOrderProduct(dataOrderProduct).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         res.ObjectReturn.Price = res.ObjectReturn.Bid
//         res.ObjectReturn.Quantity = 1

//         res.ObjectReturn.TotalPrice = (res.ObjectReturn.VAT * res.ObjectReturn.Price) / 100
//         res.ObjectReturn.DiscountAmount = res.ObjectReturn.Bid - res.ObjectReturn.Price
//         if (res.ObjectReturn.Bid > 0 && res.ObjectReturn.Bid - res.ObjectReturn.Price != 0) {
//           res.ObjectReturn.Discount = ((res.ObjectReturn.Bid - res.ObjectReturn.Price) * 100) / res.ObjectReturn.Bid
//         }
//         else {
//           res.ObjectReturn.Discount = 0
//         }

//         this.isGetProduct = true
//         this.orderProductForm.patchValue(res.ObjectReturn)
//         this.APIGetListWareHouse(res.ObjectReturn)
//       }
//       else {
//         resets()
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy sản phẩm: ${res.ErrorString}`)
//       }
//     }, (errors) => {
//       resets()
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy sản phẩm: ${errors}`)
//     })

//     const resets = () => {
//       this.orderProductForm.reset()
//       //this.orderProductObj.Barcode = ""
//       this.orderProductForm.patchValue(this.orderProductObj)
//     }
//   }

//   APIGetListWareHouse(dataOrderProduct: DTOOrderProducts) {
//     //let countQuantity = 0

//     this.apiService.GetListWareHouse(dataOrderProduct).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.listWareHouse = res.ObjectReturn
//         if (this.listWareHouse.length > 0) {
//           if (dataOrderProduct.Code == 0) {
//             this.listWareHouse[this.listWareHouse.length - 1].Quantity = dataOrderProduct.Quantity

//           } else {

//             if (dataOrderProduct.Quantity != dataOrderProduct.ModifiedQuantity) {
//               this.listWareHouse[this.listWareHouse.length - 1].Quantity = dataOrderProduct.ModifiedQuantity
//             }
//             // else {
//             //   this.listWareHouse[this.listWareHouse.length - 1].Quantity = dataOrderProduct.Quantity
//             // }
//           }
//           this.orderProductForm.controls['ListStoreAndWH'].patchValue(this.listWareHouse)
//         }

//       }
//       else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách kho hàng: ${res.ErrorString}`)
//       }
//     }, (errors) => {
//       this.layoutService.onError(`Đã xảy ra khi lấy danh sách kho hàng: ${errors}`)
//     })
//   }

//   APIUpdateOrderProduct(dataUpdate: DTOOrderProducts) {
//     const noticeE = 'Đã xảy ra lỗi khi';
//     const noticeS = 'Cập nhật sản phẩm thành công';
//     const noticeA = ' Thêm mới sản phẩm thành công';
//     let notice = '';

//     dataUpdate.OrderMaster = this.DomesticOrder.Code
//     dataUpdate.Supplier = this.DomesticOrder.Supplier
//     this.apiService.UpdateOrderProduct(dataUpdate).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.orderProductForm.patchValue(res.ObjectReturn)
//         this.orderProductObj = new DTOOrderProducts()
//         this.onLoadPage()
//         this.DrawerRightComponent.toggle()
//         if (dataUpdate.Code == 0) {
//           notice = noticeA
//           this.isAddNewProduct = false
//         }
//         else {
//           notice = noticeS
//           this.isEdit = false
//         }
//         this.isGetProduct = false
//         this.layoutService.onSuccess(notice)
//         // this.APIGetListWareHouse(res.ObjectReturn)
//       }
//       else {
//         checkError()
//         this.layoutService.onError(`${notice}: ${res.ErrorString}`);
//         this.orderProductObj = new DTOOrderProducts()
//         this.drawer.close()
//       }
//     }, (errors) => {
//       checkError()
//       this.layoutService.onError(`${notice}: ${errors}`);
//       this.orderProductObj = new DTOOrderProducts()
//       this.drawer.close()
//     })

//     const checkError = () => {

//       this.isGetProduct = false
//       if (dataUpdate.Code == 0) {
//         notice = noticeE + ' thêm mới sản phẩm'
//       }
//       else {
//         notice = noticeE + ' cập nhật sản phẩm'
//         this.isEdit = false
//       }
//     }
//   }
//   //#endregion

//   //#region Handle
//   onAddNewProduct() {
//     this.orderProductObj = new DTOOrderProducts()
//     this.orderProductObj.Quantity = 1
//     this.isAddNewProduct = true
//     this.orderProductForm.reset()
//     this.orderProductForm.patchValue(this.orderProductObj)
//     this.listWareHouse = []
//     this.drawer.open()
//   }

//   // Hàm tính giá sau thuế, chiết khấu
//   onCalculate(vat: number, price: number, bid: number) {

//     this.orderProductForm.controls['TotalPrice'].patchValue((vat * price) / 100)
//     this.orderProductForm.controls['DiscountAmount'].patchValue(bid - price)
//     if (bid > 0 && bid - price != 0) {
//       this.orderProductForm.controls['Discount'].patchValue((bid - price) * 100 / bid)
//     }
//     else {
//       this.orderProductForm.controls['Discount'].patchValue(0)
//     }
//   }

//   // Hàm double click input grid
//   itemCurrGrid: DTOStoreAndWH // biến lưu item selected grid
//   onDoubleClick(item: DTOStoreAndWH) {
//     this.itemCurrGrid = item
//     if (item.WHName != this.listWareHouse[this.listWareHouse.length - 1].WHName) {
//       this.isEditQuantityDivision = true;
//     }

//   }

//   // Hàm này tính số lượng chia 
//   blurInputGrid(listWarehouse = [], item: DTOStoreAndWH) {
//     let tongsoluong = 0
//     this.isEditQuantityDivision = false
//     let lastItemQuantity = 0

//     const checkItem = () => {
//       listWarehouse.find(s => {
//         if (s.WHName == item.WHName) {
//           s.Quantity = 0

//         }
//       })
//     }

//     const handleCalculate = () => {
//       for (let i = 0; i < listWarehouse.length - 1; i++) {
//         tongsoluong += listWarehouse[i].Quantity
//       }

//       if (this.DomesticOrder.StatusID == 4 && this.orderProductForm.controls['Quantity'].value != this.orderProductForm.controls['ModifiedQuantity'].value) {
//         lastItemQuantity = this.orderProductForm.controls['ModifiedQuantity'].value - tongsoluong
//       }
//       else if (this.DomesticOrder.StatusID == 4 || this.DomesticOrder.StatusID == 1) {
//         lastItemQuantity = this.orderProductForm.controls['Quantity'].value - tongsoluong
//       }

//       if (lastItemQuantity < 0) {
//         this.layoutService.onWarning('Lưu ý tổng số lượng chia phải nhỏ hơn số lượng đặt mua')
//         checkItem()
//       }
//       else {
//         this.listWareHouse[this.listWareHouse.length - 1].Quantity = lastItemQuantity
//         this.orderProductForm.controls['ListStoreAndWH'].patchValue(listWarehouse)
//       }
//     }


//     if (listWarehouse.length > 0) {
//       if (this.DomesticOrder.StatusID == 4 && this.orderProductForm.controls['Quantity'].value != this.orderProductForm.controls['ModifiedQuantity'].value) {
//         if (item.Quantity > this.orderProductForm.controls['ModifiedQuantity'].value) {
//           this.layoutService.onWarning('Số lượng chia phải nhỏ hơn hoặc bằng số lượng đặt mua');
//           checkItem()
//         } else {
//           handleCalculate();
//         }
//       } else if (this.DomesticOrder.StatusID == 4 || this.DomesticOrder.StatusID == 1) {
//         if (item.Quantity > this.orderProductForm.controls['Quantity'].value) {
//           this.layoutService.onWarning('Số lượng chia phải nhỏ hơn hoặc bằng số lượng đặt mua');
//           checkItem()
//         } else {
//           handleCalculate();
//         }
//       }
//     }
//   }

//   // Hàm blur cho trường số lượng đặt mua, khi thay đổi số lượng đặt mua thay đổi giá trị chi của item cuối
//   blurChangeQuantity() {

//     if (this.DomesticOrder.StatusID == 4 && this.orderProductForm.controls['Quantity'].value != this.orderProductForm.controls['ModifiedQuantity'].value) {
//       this.listWareHouse[this.listWareHouse.length - 1].Quantity = this.orderProductForm.controls['ModifiedQuantity'].value

//       for (let i = 0; i < this.listWareHouse.length - 1; i++) {
//         this.listWareHouse[i].Quantity = 0
//       }
//     }
//     else if (this.DomesticOrder.StatusID == 4 || this.DomesticOrder.StatusID == 1) {
//       this.listWareHouse[this.listWareHouse.length - 1].Quantity = this.orderProductForm.controls['Quantity'].value
//     }

//   }

//   onCheckBlockEmail(prop: string[]) {
//     let isMailToValid = true;
//     let isMailCCValid = true;

//     if (!Ps_UtilObjectService.isValidEmail(this.DomesticOrder.EmailTo) && prop[0] === 'EmailTo') {
//       isMailToValid = false
//       //this.DomesticOrder.EmailTo = ""
//       this.layoutService.onWarning('Vui lòng nhập đúng định dạng email')
//     }
//     if (!Ps_UtilObjectService.isValidEmail(this.DomesticOrder.EmailCc) && prop[0] === 'EmailCc') {
//       //this.DomesticOrder.EmailCc = ""
//       isMailCCValid = false
//       this.layoutService.onWarning('Vui lòng nhập đúng định dạng email')
//     }
//     if (!Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailContent) && prop[0] === 'EmailContent') {
//       this.layoutService.onWarning('Vui lòng nhập nội dung email')
//     }

//     if (isMailToValid && prop[0] === 'EmailTo') {
//       this.APIUpdateDomesticOrder(this.DomesticOrder, prop)
//     }
//     if (isMailCCValid && prop[0] === 'EmailCc') {
//       this.APIUpdateDomesticOrder(this.DomesticOrder, prop)
//     }
//     if (Ps_UtilObjectService.hasValueString(this.DomesticOrder.EmailContent) && prop[0] === 'EmailContent') {
//       this.APIUpdateDomesticOrder(this.DomesticOrder, prop)
//     }


//   }

//   onSaveEditor(e: string) {
//     this.DomesticOrder.EmailContent = e
//     this.onCheckBlockEmail(['EmailContent'])
//   }

//   // func get folder///
//   GetFolderWithFile(childPath: string) {
//     if (this.layoutService.getFolderDialog())
//       return this.apiServiceBlog.GetFolderWithFile(childPath, 18)
//   }
//   pickFile(e: DTOCFFile, width, height) {
//     this.layoutService.getEditor().embedImgURL(e, width, height)
//     this.layoutService.setFolderDialog(false)
//   }
//   //endregion

//   //#region Drawer
//   // onKeyDown(event: KeyboardEvent): void {
//   //   if (event.key === 'Enter') {
//   //     event.preventDefault();
//   //   }
//   // }

//   onBlurBarcode() {
//     this.orderProductObj = this.orderProductForm.value
//     if (!Ps_UtilObjectService.hasValueString(this.orderProductObj.Barcode)) {
//       //this.orderProductForm
//       this.layoutService.onWarning('Vui lòng nhập mã sản phẩm !')
//     }
//     else {
//       this.APIGetProduct(this.orderProductObj)
//     }
//   }

//   onCloseForm() {
//     this.isAddNewProduct = false
//     this.isEdit = false
//     this.isGetProduct = false
//     this.listWareHouse = []
//     this.drawer.close()
//   }

//   onUpdateForm() {
//     this.orderProductObj = this.orderProductForm.value

//     if (!Ps_UtilObjectService.hasValueString(this.orderProductObj.Barcode)) {
//       this.layoutService.onWarning('Vui lòng nhập mã sản phẩm !')
//     }
//     else {
//       if (this.DomesticOrder.StatusID == 1) {
//         this.orderProductObj.ModifiedQuantity = this.orderProductObj.Quantity
//         this.orderProductObj.ConfirmedQuantity = this.orderProductObj.Quantity

//       }
//       else if (this.DomesticOrder.StatusID == 4) {
//         this.orderProductObj.ConfirmedQuantity = this.orderProductObj.ModifiedQuantity

//       }
//       this.APIUpdateOrderProduct(this.orderProductObj);
//     }


//   }

//   onKeyDown(event: KeyboardEvent): void {
//     if (event.key === 'Enter') {
//       event.preventDefault();
//     }
//   }

//   //#endregion

//   //#region auto run function
//   errorOccurred: boolean = false;
//   getResImg(img: string) {
//     let a  = Ps_UtilObjectService.removeImgRes(img);
//     if (this.errorOccurred) {
//       return this.getResHachi(a);
//     } else {
//       return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
//     }  
//   }

//   getResHachi(str: string) {
//     let a  = Ps_UtilObjectService.removeImgRes(str);
//     return Ps_UtilObjectService.getImgResHachi(a);
//   }

//   handleError() {
//     // Thực hiện xử lý lỗi bằng cách hiển thị ảnh từ getResHachi
//     this.errorOccurred = true; // Đánh dấu rằng đã xảy ra lỗi để tránh lặp lại việc xử lý khi gặp lỗi nhiều lần
//   }
//   //#endregion

//   //#endregion
//   ngOnDestroy(): void {
//     this.ngUnsubscribe.next();
//     this.ngUnsubscribe.complete();
//   }

// }

