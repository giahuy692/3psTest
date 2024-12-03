import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTODomesticOrders } from 'src/app/p-app/p-purchase/shared/dto/DTODomesticOrders.dto';
import { DTOOrderDelivery } from 'src/app/p-app/p-purchase/shared/dto/DTOOrderDelivery.dto';
import { DTOOrderInvoice } from 'src/app/p-app/p-purchase/shared/dto/DTOOrderInvoice.dto';
import { DTOOrderProducts, DTOStoreAndWH } from 'src/app/p-app/p-purchase/shared/dto/DTOOrderProducts.dto';
import { PurPOAPIService } from 'src/app/p-app/p-purchase/shared/services/pur-po-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib/utilities/utility.object';
import { formatDate } from '@angular/common';
import { DTOPUROrderInvoiceDetails } from 'src/app/p-app/p-purchase/shared/dto/DTOPUROrderInvoiceDetails';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

@Component({
  selector: 'app-log002-domestic-receiving-detail',
  templateUrl: './log002-domestic-receiving-detail.component.html',
  styleUrls: ['./log002-domestic-receiving-detail.component.scss']
})
export class Log002DomesticReceivingDetailComponent implements OnInit, OnDestroy{

  @ViewChild('formDrawer') public drawer: MatDrawer;
  
  //#region  Grid
    loading: boolean = false
    gridView = new Subject<any>();
    gridViewInfo = new Subject<any>();
    total = 0
    pageSize = 25
    pageSizes = [this.pageSize];
    
    gridState: State = { take: this.pageSize, filter: { filters: [], logic: 'and' }, }

    selectable: SelectableSettings = {
      enabled: true,
      mode: 'multiple',
      drag: false,
      checkboxOnly: true,
    }

    filterListOrderProduct: FilterDescriptor = {
      field: "OrderMaster", operator: "eq", value: 0
    }

    //search prod
    filterSearchBox: CompositeFilterDescriptor = {
      logic: 'or',
      filters: [],
    };

  //#endregion


  //#region  permission
    isToanQuyen: boolean = false
    isAllowedToCreate: boolean = false
    isAllowedToVerify: boolean = false
    justLoaded: boolean = true
    actionPerm: DTOActionPermission[] = []
   //#endregion
 
   isFilterActive:boolean = true
   isDetailOrder: boolean = true
   isEditQuantityDivision: boolean = false
   isEditPersonalContact: boolean = false
   isEditPersonalContactPhone: boolean = false
   isEditInvoNo : {[key: number]: boolean}  = {}
   isEditDate: {[key: number]: boolean}  = {}
   isEditQuanity: {[key: number]: boolean}  = {}
   ishasOrderDelivery: boolean = false
   dialogAddProduct:boolean = false

   
  //#region Callback Function
    onSelectCallback: Function
    onSelectedPopupBtnCallback: Function
    getSelectionPopupCallback: Function
    // Dropdown
    onActionDropdownClickCallback: Function
    getActionDropdownCallback: Function
    uploadEventHandlerCallback: Function
    //function grid
    onPageChangeCallback: Function
  //#endregion

  unsubscribe = new Subject<void>();

  //#region Arrary
  listUnit: any[] = []
  listWareHouse: DTOStoreAndWH[] = []
  listWareHouseDefault: DTOStoreAndWH[] = []
  ListDetailPOProduct: DTOOrderProducts[] = []
  ListOrderInvoiced: DTOOrderInvoice[] = []

  allowActionDropdown = ['delete']
  arrBtnStatus: { text: string, class: string, code: string, link?: any, type?: string, image?: string }[] = [];
  //#endregion
  
  //#region Object
  DomesticOrder: DTODomesticOrders = new DTODomesticOrders()
  ProductOrder: DTOOrderProducts = new DTOOrderProducts()
  OrderDelivery: DTOOrderDelivery = new DTOOrderDelivery()
  InvoiceCode: number = 0
  itemCurrGrid: DTOStoreAndWH
  orderProductObj: DTOOrderProducts = new DTOOrderProducts()
  orderInvo: DTOOrderInvoice = new DTOOrderInvoice()
  selectedUnit: any

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
    Discount: new FormControl(''),
    DiscountAmount: new FormControl(0),
    TotalPrice: new FormControl(0),
    VAT: new FormControl(0),
    VATAmount: new FormControl(0),
    ListStoreAndWH: new FormControl([]),
    RemarkSupplier: new FormControl(''),
    RemarkWarehouse: new FormControl(''),
    OrderMaster: new FormControl(0),
    Supplier: new FormControl(0),
    Product: new FormControl(0),
    DateMin: new FormControl(''),
    DatePercent: new FormControl(0),
    DiscountAmout: new FormControl(0),
    BasePrice: new FormControl(0),
    Unit: new FormControl(0),
    UnitName: new FormControl(''),
    AmountBeforeVAT: new FormControl(0),
    AmountAfterVAT: new FormControl(0),
  });
  //#endregion

  domesticOrder = new DTODomesticOrders()
  tempSearch: any;

  constructor(
    public menuService: PS_HelperMenuService,
    public domSanititizer: DomSanitizer,
    public layoutService: LayoutService,
    public apiServicePur: PurPOAPIService,
    public layoutAPI: LayoutAPIService
    ){}


  ngOnInit():void {
    this.menuService.changePermission().pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        this.justLoaded = false
        this.actionPerm = distinct(res.ActionPermission, "ActionType")

        this.isToanQuyen = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        this.isAllowedToCreate = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        this.isAllowedToVerify = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        //test permission
        // this.isToanQuyen =  false
        // this.isAllowedToCreate =  true
        // this.isAllowedToVerify = true
        this.getActionDropdownCallback = this.getActionDropdown.bind(this)
        this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
        this.onPageChangeCallback = this.onPageChange.bind(this)
        this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
        this.onSelectCallback = this.selectChange.bind(this)
        this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
        this.uploadEventHandlerCallback = this.onUploadEventHandler.bind(this)
      }
      // this.GetCacheDODomestic()
      
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetCacheDODomestic()
      }
    })
  }


  //#region Logic

  // lấy thông tin đơn hàng từ Cache
  GetCacheDODomestic() {
    let res = JSON.parse(localStorage.getItem('DOdomestic'))
    if (Ps_UtilObjectService.hasValue(res)) {
      this.DomesticOrder = res
      this.onLoadPage()
    }
  }

  /**
   * Hàm get data khi load page
   */
  onLoadPage(){
    if(this.isFilterActive){
      // lấy thông tin đơn hàng
      this.APIGetDomesticOrder() // Lấy thông tin đơn hàng -> Lấy thông tin đăng ký giao hàng
      this.onLoadFilter() // set filter
      this.APIGetListOrderProduct()
    }
  }

  /**
   * Hàm load filter
   */
  onLoadFilter(){
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

  /**
   * Hàm tìm kiếm của Block 'CHI TIẾT SẢN PHẨM GIAO HÀNG' : 'CHI TIẾT SẢN PHẨM ĐẶT HÀNG'
   * @param event filter nhân từ component trả về
   */
  handleSearch(event){
    if (event.filters && event.filters.length > 0){
      if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
      }
      this.gridState.skip = 1
      this.onLoadFilter()
      this.APIGetListOrderProduct()
    }
    
  }

  /**
   * Hàm đổi view
   * @param view : view muốn hiển thị
   */
  onClickView(view:string){
    this.filterSearchBox.filters = null
    if(view == 'order'){
      this.isDetailOrder = false
      this.APIGetListOrderInvoice()
    }else{
      this.isDetailOrder = true
      this.onLoadFilter()
      this.APIGetListOrderProduct()
    }
  }

  /**
   * Hàm mở drawer
   */
  openDrawer(){
    this.drawer.open();
  }

  /**
   * Hàm đóng drawer
   */
  closeDrawer(){
    this.drawer.close();
  }

  //#region các hàm xử lý link ảnh
  errorOccurred: any = {};

  /**
   * Hàm xử lý link ảnh
   * @param str link ảnh
   * @param imageKey key của ảnh
   * @returns Ảnh bắt đầu http://172.16.10.251:89/
   */
  getResImg(str: string, imageKey: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    if (this.errorOccurred[imageKey]) { return this.getResHachi(a); }
    else {
      return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
    }
  }

  /**
   * Hàm xử lý khi link bị ảnh bị lỗi
   * @param imageKey key của ảnh
   */
  handleError(imageKey: string) { this.errorOccurred[imageKey] = true; }

  /**
   * 
   * @param str link ảnh
   * @returns trả về link ảnh hachihachi
   */
  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }

  /**
   * 
   * @param startusid ID status
   * @param type OrderTypeID | invoiceStatus
   * @returns màu sắc tương ứng
   */
  getColor(startusid: number, type: string): string {
    if (type == 'OrderTypeID') {
      switch (startusid) {
        case 1:
          return '#1A6634';
        case 2:
          return '#D82C12';
        case 3:
          return '#26282E';
        default:
          return '#959DB3'; // Màu mặc định hoặc không áp dụng màu
      }
    }
    if (type == 'invoiceStatus') {
      switch (startusid) {
        case 1:
          return '#26282E';
        case 2:
          return '#008cd7';
        case 3:
          return '#FFB900';
        case 4:
          return '#EB273A';
        case 5:
          return '#FFB900';
        case 6:
          return '#1a6634';
        default:
          return '#26282E'; // Màu mặc định hoặc không áp dụng màu
        }
      }
    }   

    /**
     * Hàm chèn khoảng cách số
     * @param input số
     * @returns số
     */
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

    /**
     * 
     * @param type 2 hoặc khác 2
     * @param str tên biến
     * @param index index của biến nếu có
     */
    onEdit(type: number, str: string, index?: number): void {
      if (type === 2) {
        this[str][index] = !this[str][index];
      } else {
        this[str] = !this[str];
      }
    }

    /**
     * Hàm check xem invoice có danh sách sản phẩm không
     * @param item DTOOrderInvoice
     * @returns true hoặc false
     */
    isHasListDetail(item: DTOOrderInvoice) {
      if (Ps_UtilObjectService.hasListValue(item.ListProduct)) {
        return true
      }
      return false
    }

    // hàm render button chuyển tình trạng
    displayStatusBtn(data: DTOOrderInvoice){
      this.arrBtnStatus = [];
      this.orderInvo = data
      if((this.orderInvo.StatusID == 1 || this.orderInvo.StatusID == 4)){
        this.arrBtnStatus.push(
          {text: 'Thêm sản phẩm', class: 'greenText', code: 'k-icon k-i-plus', link: 0, type: "add"},
          {text: 'Gửi hóa đơn', class: '', code: '', link: 2, type: "send", image:'assets/img/icon/icon_sendOrange.svg'}
        );
      }

      if(!(this.orderInvo.StatusID == 1 || this.orderInvo.StatusID == 4 || this.orderInvo.StatusID == 6)){
        this.arrBtnStatus.push(
          {text: 'Trả hóa đơn', class: 'greenText', code: 'k-icon k-i-undo', link: 4, type: "return"},
          {text: 'Hoàn tất nhận hàng hóa đơn', class: 'greenText', code: 'k-icon k-i-check-outline', link: 6, type: "succes"}
        );
      }
      return this.arrBtnStatus       
    }

  //#endregion

  //#region Update
    /**
     * Hàm xử lý cập nhật trường
     * @param prop biến muốn cập nhật giá trị
     * @param isDomestic true là cập nhật thông tin của PO, false là cập nhật thông tin của hóa đơn
     * @param Data dữ liệu cần cập nhật
     */
  onUpdateTestFierd(prop: string) {  
      this.APIUpdateDomesticOrder(this.DomesticOrder, [prop])
  }

  /**
   * Hàm cập nhật hóa đơn
   * @param dto hóa đơn
   */
  onBlurInvoice(dto: DTOOrderInvoice){
      this.APIUpdateInvoice(dto)
  }

  /**
   * Hàm xử lý cập nhật hóa đơn
   * @param dto sản phẩm trong hóa đơn
   */
  onBlurInvoiceProduct(dto: DTOPUROrderInvoiceDetails){
    this.APIUpdateInvoiceProduct(dto)
  }

  /**
   * Hàm cập nhật ngày phát hành
   * @param event sự kiện của component
   * @param Item hóa đơn
   */
  onDatepickerChange(event, Item: DTOOrderInvoice){
    Item.InvoiceDate = formatDate(event, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
    this.APIUpdateInvoice(Item)
  }

  /**
   * Hàm disabled ngày rơi vòa T7 và CN
   * @param date ngày
   * @returns true | false
   */
  disabledDates = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  /**
   * Cập nhật trạng thái của hóa đơn
   * @param action hành động mà người dùng bấm vào
   */
  HandleActionIconList(action: { text?: string, class?: string, code?: string, link?: any, type?: string, image?: string }, orderInvoice: DTOOrderInvoice): void {
    // Nếu là người dùng muốn thêm một sản phẩm vào hóa đơn
    if(action.type === 'add') {
        // Xét properties để biết được là gọi api AddInvoiceProduct trong trường hợp nào
        this.InvoiceCode = orderInvoice.Code;
        // ----------
        this.openDialogAddProduct(this.InvoiceCode);

        return;
    }

    // Nếu là cập nhật trạng thái thì gọi api
    this.APIUpdateInvoiceStatus([orderInvoice], action.link);
}
  //#endregion

  //#region Dawer
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  /**
   * Hàm tính tổng sô lượng Warehouse
   * @param list danh sách kho
   * @returns tổng số lượng Warehouse
   */
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
          this.layoutService.onWarning('Không thể nhập vượt quá só lượng kho online !!!')
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

  /**
   * Hàm chỉnh sửa DTOStoreAndWH
   * @param item DTOStoreAndWH
   */
  onEditQuantityDivision(item: DTOStoreAndWH) {
    this.itemCurrGrid = item
    if (item.WHName != this.listWareHouse[this.listWareHouse.length - 1].WHName) {
      this.isEditQuantityDivision = true;
    }
  }

  /**
   * Hàm cập nhật drawer
   */
  onUpdateForm() {
    this.orderProductObj = this.orderProductForm.value

    if (!Ps_UtilObjectService.hasValueString(this.orderProductObj.Barcode)) {
      this.layoutService.onWarning('Vui lòng nhập mã sản phẩm !')
    }
    else {
      if (this.DomesticOrder.StatusID == 1) {
        this.orderProductObj.ModifiedQuantity = this.orderProductObj.Quantity
        this.orderProductObj.ConfirmedQuantity = this.orderProductObj.Quantity
      }
      else if (this.DomesticOrder.StatusID == 4) {
        this.orderProductObj.ConfirmedQuantity = this.orderProductObj.ModifiedQuantity

      }
      this.APIUpdateOrderProduct(this.orderProductObj);
    }
  }

  //  Hàm double click input grid
  onDoubleClick(item: DTOStoreAndWH) {
    this.itemCurrGrid = item
    if (item.WHName != this.listWareHouse[this.listWareHouse.length - 1].WHName) {
      this.isEditQuantityDivision = true;
    }

  }

  //#endregion

  //#region Grid action

  /**
   * Lấy danh sách item hiển thị lên dropdown
   * @param moreActionDropdown danh sách các action của dropdown
   * @param dataItem date của item được bấm vào
   * @returns danh sách action được phép hiển thị
   */
    getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any){
      moreActionDropdown = []
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: 'detail', Actived: true })
      return moreActionDropdown
    }


    /**
     * Hàm xử lý action người dúng bấm vào
     * @param menu là action mà người dùng bấm vào
     * @param item là data mà người dùng chọn để thực hiện action
     */
    onActionDropdownClick(menu: MenuDataItem, item: any){
      if (menu.Code == "eye" || menu.Link == 'detail') {
        this.orderProductForm.patchValue(item)
        this.APIGetListWareHouse(item)
        this.openDrawer()
      }
    }

    /**
     * Hàm xử lý khi người dùng chuyển trang
     * @param event sự kiện chuyển trang
     */
    onPageChange(event: PageChangeEvent) {
      this.gridState.skip = event.skip;
      this.gridState.take = this.pageSize = event.take
      this.onLoadFilter()
      this.APIGetListOrderProduct()
    }

    /**
     * Hàm lấy danh sách action của popup chọn nhiều của grid
     * @returns 
     */
    getSelectionPopup() {
      this.isFilterActive = !this.isFilterActive
      var moreActionDropdown = new Array<MenuDataItem>()
  
      if (!this.dialogAddProduct &&(this.isToanQuyen || this.isAllowedToCreate)) {
        moreActionDropdown.push({ Type: "add", Name: "Tạo hóa đơn VAT", Code: "plus", Link: "add", Actived: true })
      } else{
        moreActionDropdown = []
      }
  
      return moreActionDropdown
    }

    /**
     * Xử lý chọn nhiều
     * @param isSelectedRowitemDialogVisible trạng thái true (đang chọn nhiều item) và ngược lại
     */
    selectChange(isSelectedRowitemDialogVisible: boolean) {
      this.isFilterActive = !isSelectedRowitemDialogVisible
    }

    productsInInvoice: DTOOrderProducts[] | DTOPUROrderInvoiceDetails[] = null
    productsAdd: DTOOrderProducts[] | DTOPUROrderInvoiceDetails[]= null
    dialogConfirmAddProduct: boolean = false;

    /**
     * Hàm xử lý khi người dụng bấm vào action xử lý một lần nhiều item
     * @param list danh sách các item được chọn
     */
    onSelectedPopupBtnClick(btnType: string, list: DTOOrderProducts[], value: string) {
      this.isFilterActive = !this.isFilterActive 
      this.productsAdd = list
      // Kiểm tra xem có item nào có InInvoice = true không
      const hasInInvoice = list.some(item => item.InInvoice === true);
      this.InvoiceCode = 0
      if (hasInInvoice) {
        this.productsInInvoice = list.filter(item => item.InInvoice === true);
        this.dialogConfirmAddProduct = true;
      } else {
        this.APIAddInvoiceProduct({Delivery: this.OrderDelivery?.Code, Invoice: this.InvoiceCode, ListProduct: list.filter(v => !v.InLockInv)}) // Thêm sản phẩm vừa chọn để tạo
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.dialogConfirmAddProduct = false
      }
    }

    /**
     * Hàm xử lý khi người dùng chọn sản phảm để tạo hóa đơn
     * @param list danh sách sản phẩm
     */
    handleSelectedDialogBtnClick(list: DTOOrderProducts[] | DTOPUROrderInvoiceDetails[]){
      this.APIAddInvoiceProduct({Delivery: this.OrderDelivery?.Code, Invoice: this.InvoiceCode, ListProduct: list}) // Thêm sản phẩm vừa chọn để tạo
      this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
      this.dialogConfirmAddProduct = false
    }

  //#endregion

  //#region Popup

  // Hàm mở dialog

  /**
   * 
   * @param Code Code = 0 thì là cho lấy danh sách sản phẩm cho nút TẠO HÓA ĐƠN
   * Code != 0 là danh sách sản phẩm có cùng VAT với HĐ (Code lúc này là Invoice code)
   */
  openDialogAddProduct(Code: number){
    this.APIGetListProductNotIncludedInvoice({"Code": Code, OrderDeliveryID: this.OrderDelivery?.Code})
    this.dialogAddProduct = true
  }

  // Hàm đóng dialog
  closeDialog(){
    this.dialogAddProduct = false;
    this.dialogConfirmAddProduct = false;
    this.productsInInvoice = []
  }

  /**
   * Hàm them sản phẩm vào hóa đơn từ dialog
   * @param Delivery bằng 1 (Tạo mới hoá đơn cùng sản phẩm) | bằng null (Thêm sản phẩm vào hoá đơn)
   * @param Invoice bằng null (Tạo mới hoá đơn cùng sản phẩm) | bằng 2 (Thêm sản phẩm vào hoá đơn)
   */

/**
 * Hàm xử lý khi người dùng thêm sản phẩm vào hóa đơn
 * @param Delivery code của phiếu đăng ký giao
 * @param Invoice code của hóa đơn
 * @returns 
 */
  onComfirmAddInvoiceProduct(Delivery?: number, Invoice?: number){
    if(!this.ishasOrderDelivery){
      return this.layoutService.onWarning('Đơn hàng chưa đăng ký giao hàng!');
    }
    if(Ps_UtilObjectService.hasListValue(this.ListSelectedRowitem)){
      this.productsAdd = this.ListSelectedRowitem
      // Kiểm tra xem có item nào có InInvoice = true không
      const hasInInvoice = this.ListSelectedRowitem.some(item => item.IsInInv === true);
      if (hasInInvoice) {
        this.productsInInvoice = this.ListSelectedRowitem.filter(item => item.IsInInv === true);
        this.InvoiceCode = Invoice
        this.OrderDelivery.Code = Delivery
        this.dialogConfirmAddProduct = true;
      } else {
        this.APIAddInvoiceProduct({Delivery: Delivery, Invoice: Invoice, ListProduct: this.ListSelectedRowitem}) // Thêm sản phẩm vừa chọn để tạo
        this.dialogConfirmAddProduct = false
      }
    }
    else {
      this.layoutService.onWarning('Vui lòng chọn sản phẩm muốn thêm vào hóa đơn');
    }
  }

  ListSelectedRowitem:DTOPUROrderInvoiceDetails []
  /**
   * Lấy danh sách item được checked
   * @param SelectedRowitem danh sách các item được checked
   */
  getSelectedRowitem(SelectedRowitem: []){
    this.ListSelectedRowitem = SelectedRowitem
  }

  // Kiểm tra tất cả các hóa đơn đã hoàn thành chưa
  hasAllInvoiceComplete(){
    return this.ListOrderInvoiced.length > 0 && this.ListOrderInvoiced.every(item => item.StatusID === 6);
  }
  //#endregion

  /**
   * Hàm check danh sách sản phẩm có InLockInv = true không
   * @param list danh sách sản phẩm của PO
   * @returns 
   */
  areAllItemsInLockInvTrue(list: DTOOrderProducts[]) {
    return list.every(item => item.InLockInv === true);
  }
  

    //#region API

    // API Lấy thông tin đơn hàng (dùng lại service module mua hàng)
    loadingDomesticOrder: boolean = false;

    APIGetDomesticOrder() {
      this.loadingDomesticOrder = true
      this.apiServicePur.GetDomesticOrder(this.DomesticOrder).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
        this.loadingDomesticOrder = false
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.DomesticOrder = res.ObjectReturn
          if(this.DomesticOrder.OrderTypeID === 1 && this.DomesticOrder.StatusID >= 6){
            this.APIGetDeliveryOrder();
          }
          this.APIGetListOrderInvoice()
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${res.ErrorString}`)
        }
      }, (error) => {
        this.loadingDomesticOrder = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${error} `)
      })
    }

    // API Cập nhập thông tin đơn hàng
    APIUpdateDomesticOrder(item: DTODomesticOrders, prop: string[]) {
      this.loadingDomesticOrder = true;
      var ctx = 'Cập nhật thông tin đơn hàng'

      this.apiServicePur.UpdateDomesticOrder(item, prop).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        this.loadingDomesticOrder = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.DomesticOrder = res.ObjectReturn
          this.isEditPersonalContact = false
          this.layoutService.onSuccess(`${ctx}`);
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }, (error) => {
        this.loadingDomesticOrder = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      })
    }

    /**
     * API cập nhật sản phẩm đặt hàng
     * @param dataUpdate sẳn phẩm
     */
    APIUpdateOrderProduct(dataUpdate: DTOOrderProducts) {
      const noticeE = 'Đã xảy ra lỗi khi cập nhật sản phẩm';
      const noticeS = 'Cập nhật sản phẩm thành công';
  
      dataUpdate.OrderMaster = this.DomesticOrder.Code
      dataUpdate.Supplier = this.DomesticOrder.Supplier
      this.apiServicePur.UpdateOrderProduct(dataUpdate).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.orderProductForm.patchValue(res.ObjectReturn)
          this.orderProductObj = new DTOOrderProducts()
          this.onLoadPage()
          this.closeDrawer()
          this.layoutService.onSuccess(noticeS)
          // this.APIGetListWareHouse(res.ObjectReturn)
        }
        else {
          this.layoutService.onError(`${noticeE}: ${res.ErrorString}`);
          this.orderProductObj = new DTOOrderProducts()
          this.closeDrawer()
        }
      }, (errors) => {
        this.layoutService.onError(`${noticeE}: ${errors}`);
        this.orderProductObj = new DTOOrderProducts()
        this.closeDrawer()
      })
    }

    // API Lấy danh sách THÔNG TIN GIAO NHẬN ĐƠN HÀNG
    loadingDeliveryOrder: boolean = false;

    APIGetDeliveryOrder (){
      this.loadingDeliveryOrder = true
      this.apiServicePur.GetDeliveryOrder(this.DomesticOrder).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
        this.loadingDeliveryOrder = false
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.OrderDelivery = res.ObjectReturn
          if(Ps_UtilObjectService.hasValue(this.OrderDelivery) && this.OrderDelivery.StatusID > 1){
            this.ishasOrderDelivery = true
          } else{
            this.ishasOrderDelivery = false
          }
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${res.ErrorString}`)
        }
      }, (error) => {
        this.loadingDeliveryOrder = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin đơn hàng: ${error} `)
      })
    }

    // API lấy danh sách thông tin chi tiết đơn hàng
    APIGetListOrderProduct() {
      this.loading = true;
      var ctx = 'Danh sách sản phẩm'
      this.apiServicePur.GetListOrderProduct(this.gridState).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        this.loading = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.ListDetailPOProduct = res.ObjectReturn.Data;
          this.total = res.ObjectReturn.Total
          this.gridView.next({ data: this.ListDetailPOProduct, total: this.total });
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)
      }, (error) => {
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${error}`)
      })
    }

    
  // API lấy danh sách cửa hàng
  APIGetListWareHouse(dataOrderProduct: DTOOrderProducts) {
  //let countQuantity = 0
    this.apiServicePur.GetListWareHouse(dataOrderProduct).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.listWareHouse = res.ObjectReturn
        this.listWareHouseDefault = JSON.parse(JSON.stringify(res.ObjectReturn))
        this.orderProductForm.controls['ListStoreAndWH'].patchValue(this.listWareHouse)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách kho hàng: ${res.ErrorString}`)
      }
    }, (errors) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách kho hàng: ${errors}`)
    })
  }

  // api lấy danh sách hóa đơn
  hasDifferentStatusID: boolean = false;
  loadingOrderInvoice: boolean = false;

  APIGetListOrderInvoice(){
    this.loadingOrderInvoice = true
    this.apiServicePur.GetListOrderInvoice(this.DomesticOrder).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      this.loadingOrderInvoice = false
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        
      this.ListOrderInvoiced = res.ObjectReturn.map(item => ({
        ...item,
        isEditInvoiceNo: false,
        isEditDate: false
      }));
      this.hasDifferentStatusID = this.ListOrderInvoiced.some(item => item.StatusID !== 1)
        this.gridViewInfo.next({ data: this.ListOrderInvoiced, total: this.ListOrderInvoiced.length});
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách hóa đơn: ${res.ErrorString}`)
      }
    }, (error) => {
      this.loadingOrderInvoice = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách hóa đơn: ${error} `)
    })
  }

  // api tạo hóa đơn từ DO
  APIGenerateInvoice(){
    if(!this.ishasOrderDelivery){
      return this.layoutService.onWarning('Đơn hàng chưa đăng ký giao hàng!');
    }
    this.loadingOrderInvoice = true;
    this.apiServicePur.GenerateInvoice(this.OrderDelivery).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      this.loadingOrderInvoice = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Tạo hóa đơn từ DO thành công`)
        this.APIGetDomesticOrder();
        this.APIGetListOrderInvoice()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi tạo hóa đơn từ DO: ${res.ErrorString}`)
      }
    }, (errors) => {
        this.loadingOrderInvoice = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi tạo hóa đơn từ DO: ${errors}`)
    })
  }

  // tạo hóa đơn theo VAT

  APIGenerateInvoiceByVAT(){
    if(!this.ishasOrderDelivery){
      return this.layoutService.onWarning('Đơn hàng chưa đăng ký giao hàng!');
    }
    this.loadingOrderInvoice = true;
    this.apiServicePur.GenerateInvoiceByVAT(this.OrderDelivery).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      this.loadingOrderInvoice = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Tạo hóa đơn theo % VAT thành công`)
        this.APIGetDomesticOrder();
        this.APIGetListOrderInvoice()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi tạo hóa đơn theo % VAT: ${res.ErrorString}`)
      }
    }, (errors) => {
        this.loadingOrderInvoice = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi tạo hóa đơn theo % VAT: ${errors}`)
    })
  }

  // cập nhập thông tin hóa đơn
  APIUpdateInvoice(orderInvo : DTOOrderInvoice){
    this.loadingOrderInvoice = true;
    this.apiServicePur.UpdateInvoice(orderInvo).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      this.loadingOrderInvoice = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Cập nhật thông tin hóa đơn thành công`)
        // this.APIGetListOrderInvoice()
        if(this.DomesticOrder.OrderTypeID === 1 && this.DomesticOrder.StatusID >= 6){
          this.APIGetDeliveryOrder();
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin hóa đơn: ${res.ErrorString}`)
      }
    }, (errors) => {
        this.loadingOrderInvoice = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin hóa đơn: ${errors}`)
    })
  }

  // Cập nhật SL của sản phẩm trong hóa đơn
  APIUpdateInvoiceProduct(product: DTOPUROrderInvoiceDetails){
    this.loadingOrderInvoice = true;
    this.apiServicePur.UpdateInvoiceProduct(product).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      this.loadingOrderInvoice = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Cập nhật số lượng sản phẩm thành công`)
        this.APIGetListOrderInvoice()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật số lượng sản phẩm: ${res.ErrorString}`)
      }
    }, (errors) => {
        this.loadingOrderInvoice = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật số lượng sản phẩm: ${errors}`)
    })
  }

  /**
	 * Cập nhật trạng thái của hóa đơn
	 * @param listdto danh sách hóa đơn cần cập nhật trạng thái
	 * @param statusID trạng thái cần cập nhật
	 * @returns objectReturn
	 */
  APIUpdateInvoiceStatus(listOrderInvo : DTOOrderInvoice[], statusID: number){
    this.loadingOrderInvoice = true;
    this.apiServicePur.UpdateInvoiceStatus(listOrderInvo, statusID).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      this.loadingOrderInvoice = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Cập nhật trạng thái hóa đơn thành công`)
        if(statusID == 6){
          this.APIGetDomesticOrder()
        }
        this.APIGetListOrderInvoice()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hóa đơn: ${res.ErrorString}`)
      }
    }, (errors) => {
        this.loadingOrderInvoice = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hóa đơn: ${errors}`)
    })
  }

  	/**
	 * Tạo mới hoá đơn cùng sản phẩm / Thêm sản phẩm vào hoá đơn
	 * @param item Nếu tạo mới thì Delivery = Code của OrderDeliviry và Invoice = null, ListProduct luôn có 
   * | Nếu thêm sản phẩm và tạo HD VAT Delivery = Code của OrderDeliviry, Invoice = 0, ListProduct luôn có
	 * | Nếu thêm sản phẩm vào hóa đơn Delivery = Code của OrderDeliviry, Invoice = 2, ListProduct luôn có
	 */
  APIAddInvoiceProduct(item : { "Delivery": number, "Invoice"?: number, "ListProduct": DTOPUROrderInvoiceDetails[] | DTOOrderProducts[]}){
    if(!this.ishasOrderDelivery) 
      return this.layoutService.onWarning('PO chưa đăng ký giao hàng!')
    this.loadingOrderInvoice = true;
    this.apiServicePur.AddInvoiceProduct(item).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      this.loadingOrderInvoice = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${Ps_UtilObjectService.hasValue(item.Delivery) ? 'Tạo hóa đơn' : 'Thêm sản phẩm vào hóa đơn'} thành công`)
        this.isDetailOrder ? this.APIGetListOrderProduct() : this.APIGetListOrderInvoice()
        this.dialogAddProduct = false;
      }
      else {
        this.APIGetListProductNotIncludedInvoice({"Code": this.InvoiceCode, OrderDeliveryID: this.OrderDelivery?.Code})
        this.layoutService.onError(`Đã xảy ra lỗi khi ${Ps_UtilObjectService.hasValue(item.Delivery) ? 'tạo hóa đơn' : 'thêm sản phẩm vào hóa đơn'}: ${res.ErrorString}`)
      }
    }, (errors) => {
        this.loadingOrderInvoice = false;
        this.APIGetListProductNotIncludedInvoice({"Code": this.InvoiceCode, OrderDeliveryID: this.OrderDelivery?.Code})
        this.layoutService.onError(`Đã xảy ra lỗi khi  ${Ps_UtilObjectService.hasValue(item.Delivery) ? 'tạo hóa đơn' : 'thêm sản phẩm vào hóa đơn'}: ${errors}`)
    })
  }

  gridPopup = new Subject<any>();
  /**
	 * Lấy dach sách sản phẩm trong popup THÊM HÀNG HÓA VÀO HÓA ĐƠN
	 * @param item // Lấy tất cả sp trong OrderDeliveryID thì {"Code": 0, "OrderDeliveryID": ... }
	 * Lấy tất cả sp trong OrderDeliveryID theo hoá đơn (1 VAT hoặc nhiều VAT) {"Code": 1, "OrderDeliveryID": ... }
	 */
  APIGetListProductNotIncludedInvoice(item : { "Code": number, "OrderDeliveryID": number }){
    if(!Ps_UtilObjectService.hasValue(item.OrderDeliveryID)) 
      return this.layoutService.onWarning('PO chưa đăng ký giao hàng, nên không có sản phẩm!')
    this.loadingOrderInvoice = true;
    this.apiServicePur.GetListProductNotIncludedInvoice(item).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      this.loadingOrderInvoice = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.gridPopup.next({ data: res.ObjectReturn, total: res.ObjectReturn.length });
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách sản phẩm đặt mua: ${res.ErrorString}`)
      }
    }, (errors) => {
        this.loadingOrderInvoice = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách sản phẩm đặt mua: ${errors}`)
    })
  }

  //#endregion

  //#region Excel
  excelValid: boolean = true

  /**
  * Hàm xử lý download excel
  * @param file excel
  */
  onDownloadExcelPromotionHamperDetail(file) {
    this.APIDownloadExcelInvoice(file)
  }

  /**
   * Hàm xử lý import excel
   */
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  onUploadEventHandler(e: File) {
    this.APIImportExcelInvoice(e)
  }

  APIImportExcelInvoice(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.apiServicePur.ImportOrderProduct(file, this.DomesticOrder.Code).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
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

  APIDownloadExcelInvoice(getfileName) {
    this.loading = true
    var ctx = "Download Excel Template"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.layoutAPI.GetTemplate(getfileName).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}: ` + f.error.ExceptionMessage)
      this.loading = false;
    });
  }

/**
   * Cập nhật trạng thái đơn hàng
   * @param item đơn hàng muốn cập nhật tình trạng
   * @param numberType ID trạng thái 
   * @param type loại cập nhật tình trạng *cập nhật theo orderType hoặc theo status*
   */
  APIUpdateDomesticOrdersStatus(listItem: DTODomesticOrders[], objectStatusID: object, objectOrderTypeID: object) {
    this.loading = true

    this.apiServicePur.UpdateDomesticOrdersStatus(listItem, objectStatusID, objectOrderTypeID).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Cập nhật tình trạng đơn hàng thành công`)
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật tình trạng đơn hàng: ${res.ErrorString}`)
      }
      this.onLoadPage()
      this.loading = false
    }, (error) => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật tình trạng đơn hàng: ${error} `)
    })
  }
  //#endregion

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
  
}
