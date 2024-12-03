import { Component,ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PurPriceRequestApiService } from '../../shared/services/pur-price-request-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { takeUntil } from 'rxjs/operators';
import { DTOPriceRequest } from '../../shared/dto/DTOPriceRequest.dto';
import { DTOProductPriceRequest } from '../../shared/dto/DTOProductPriceRequest.dto';
import { ChangeDetectorRef } from '@angular/core';
import { DTOPartner } from '../../shared/dto/DTOPartner';
import { PurSupplierApiServiceService } from '../../shared/services/pur-supplier-api.service.service';
import { DTOSupplier } from '../../shared/dto/DTOSupplier';
import { FormControl, FormGroup } from '@angular/forms';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { StaffApiService } from 'src/app/p-app/p-hri/shared/services/staff-api.service';
import { ConfigHamperApiService } from 'src/app/p-app/p-config/shared/services/config-hamper-api.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

import { EcomAPIService } from 'src/app/p-app/p-ecommerce/shared/services/ecom-api.service';
import { DTOPartnerProductWarehouse } from '../../shared/dto/DTOPartnerProductWarehouse .dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { Router } from '@angular/router';


@Component({
  selector: 'app-pur008-price-request-detail',
  templateUrl: './pur008-price-request-detail.component.html',
  styleUrls: ['./pur008-price-request-detail.component.scss']
})
export class Pur008PriceRequestDetailComponent {
  
  @ViewChild('formDrawer') public drawer: MatDrawer;
  @ViewChild('effDateValue') effdateValue;

  loading: boolean = false
  isLockAllDetail: boolean = false
  isLockAllForm: boolean = false
  
  gridView = new Subject<any>();
  total = 0
  pageSize = 25
  pageSizes = [this.pageSize];
  
  gridState: State = { take: this.pageSize, filter: { filters: [], logic: 'and' }, }
  gridStatePackingUnit: State = { filter: { filters: [], logic: 'and' },}
  gridStateGroup: State = { filter: { filters: [], logic: 'and' },}

  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  // Dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //function grid
  onPageChangeCallback: Function

  uploadEventHandlerCallback: Function

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  ngUnsubscribe = new Subject<void>;

  price = new DTOPriceRequest();
  priceProduct = new DTOProductPriceRequest()

  listProductRequest: DTOProductPriceRequest[] = []

  listSupplier: DTOSupplier[] = []

  effDate: Date
  today = new Date()

  // permission
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false


  // priceProductForm: FormGroup = new FormGroup({
  //   ProductName:new FormControl(null),
  //   URLImage: new FormControl(''),
  //   Barcode:new FormControl(null),
  //   Poscode: new FormControl(null),
  //   LastPO:new FormControl(null),
  //   GroupName1:new FormControl(null),
  //   GroupName2:new FormControl(null),
  //   GroupName3:new FormControl(null),
  //   OriginName:new FormControl(null),
  //   BrandName:new FormControl(null),
  //   StatusName: new FormControl(null),
  //   StatusDescription:new FormControl(null),
  //   COPartner:new FormControl(null),
  //   TypeDataName: new FormControl(null),
  //   PartnerID: new FormControl(null),
  //   PartnerName: new FormControl(null),
  //   CurrentCOPartner:new FormControl(null),
  //   Margin: new FormControl(null),
  //   BaseBarcode: new FormControl(null),
  //   Origin:new FormControl(null),
  //   BaseUnit:new FormControl(null),
  //   BuyerUnit:new FormControl(null),
  //   BaseUnitL:new FormControl(null),
  //   BaseUnitW:new FormControl(null),
  //   BaseUnitH:new FormControl(null),
  //   BaseUnitWeight:new FormControl(null),
  //   InnerL:new FormControl(null),
  //   InnerW:new FormControl(null),
  //   InnerH:new FormControl(null),
  //   InnerWeight:new FormControl(null),
  //   InnerBase:new FormControl(null),
  //   CartonL:new FormControl(null),
  //   CartonW:new FormControl(null),
  //   CartonH:new FormControl(null),
  //   CartonWeight:new FormControl(null),
  //   CartonBase:new FormControl(null),
  //   GroupID:new FormControl(null),
  //   WebExpiredDate:new FormControl(null),
  //   VNSpec:new FormControl(null),
  //   VATIn:new FormControl(null),
  //   CurrencyIn:new FormControl(null),
  //   VATOut:new FormControl(null),
  //   CurrencyOut:new FormControl(null),
  //   QtyMore:new FormControl(null),
  //   QtyMonthSale:new FormControl(null),
  //   AmountMonthSale:new FormControl(null),
  //   QtyFirstOrder:new FormControl(null),
  //   Shipper:new FormControl(null),
  //   StoreFrom:new FormControl(null),
  //   StoreTo:new FormControl(null),
  //   ENName:new FormControl(null),
  //   FirstPO:new FormControl(null),
  //   JPName:new FormControl(null),
  //   POFrom:new FormControl(''),
  //   POTo:new FormControl(''),
  //   WithoutConfig:new FormControl(null),
  //   CommercialTerm:new FormControl(null),
  //   AvgPrice:new FormControl(null),
  //   CurrencyAvg:new FormControl(null),
  //   MakerName:new FormControl(null),
  //   ENMaterial:new FormControl(null),
  //   Code:new FormControl(0),
  //   Company: new FormControl(null),
  //   PartnerProductMaster: new FormControl(null),
  //   COProduct:new FormControl(null),
  //   LastBid: new FormControl(null),
  //   Bid: new FormControl(null),
  //   OldPrice: new FormControl(null),
  //   UnitPrice: new FormControl(null),
  //   Remark: new FormControl(null),
  //   TypeData: new FormControl(null),
  //   StatusID: new FormControl(0),

  //   //form binding object
  //   OriginItem: new FormControl(null),
  //   BaseUnitItem: new FormControl(null),
  //   BuyerUnitItem: new FormControl(null),
  //   GroupIDItem: new FormControl(null),

  //   CurrencyInItem: new FormControl(null),
  //   CurrencyAvgItem: new FormControl(null),
  //   CurrencyOutItem: new FormControl(null),
  //   ShipperItem: new FormControl(null),
  //   CommercialTermItem: new FormControl(null),
  //   StatusItem: new FormControl(null),
  // });
  


  constructor(
    public menuService: PS_HelperMenuService,
    public priceRequestAPI: PurPriceRequestApiService,
    public purAPIService: PurSupplierApiServiceService,
    public layoutService: LayoutService,
    public cdr: ChangeDetectorRef,
    public StaffServiceAPI: StaffApiService,
    public configHamperAPI: ConfigHamperApiService,
    public layoutAPIService: LayoutAPIService,
    public ecomAPIService: EcomAPIService,
  ){}

  ngOnInit():void{
    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        //action permission
        this.isMaster = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        // this.isMaster = true
        // this.isCreator = false
        // this.isApprover = false
        //Chỉ được xem
        this.isAllowedToViewOnly = this.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(this.actionPerm.filter(s => s.ActionType != 6))
      }
  })

    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    this.onPageChangeCallback = this.onPageChange.bind(this)

    this.onSelectCallback = this.selectItem.bind(this)

    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetPriceRequest();
      }
    })
    // this.GetPriceRequest();
    this.cdr.detectChanges();

    // this.GetListSupplierTree();
  }

  // onKeyDown(event: KeyboardEvent): void {
  //   if (event.key === 'Enter') {
  //     event.preventDefault();
  //   }
  // }
  // openDrawer(){
  //   this.drawer.open();
  //   // this.getDataDrawer();
  // }
  // closeDrawer(){
  //   this.drawer.close()
  // }

  //Hàm chuyển trang
  openDetail(isNew:boolean = false) {
    this.menuService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: ModuleDataItem) => {
     var parent = item.ListMenu.find(f => f.Code == 'pur-po')
     if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
       var detail = parent.LstChild.find(f => f.Code.includes('price-request-list')
         || f.Link.includes('price-request-list'))

       if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
         var detail2 = detail.LstChild.find(f => f.Code.includes('price-request-detail')
           || f.Link.includes('price-request-detail'))
         if(Ps_UtilObjectService.hasValue(detail2) && Ps_UtilObjectService.hasListValue(detail2.LstChild)){
          var detail3 = detail2.LstChild.find(f => f.Code.includes('price-product-detail')
          || f.Link.includes('price-product-detail'))
          this.menuService.activeMenu(detail3)
          const priceProduct = {...this.priceProduct,PriceStatus: this.price.StatusID, IsValidDateUpdateStatusProduct:  this.isValidDateUpdateStatusProduct}
          localStorage.setItem("PriceProduct", JSON.stringify(priceProduct))
          if(isNew){
            var newPriceProduct = new DTOProductPriceRequest();
            localStorage.setItem("PriceProduct", JSON.stringify(newPriceProduct))
          }
         }
         
       }
     }
   })
 }

  minDatePO: Date
  minDateStore: Date

  lockBarcode:boolean = false
  isLockStatus:boolean = false

  onAddNewItemForm(){
    // this.router.navigate(['/pur', 'pur008-price-product-detail', 1]);
    // this.openDrawer();
    // this.priceProductForm.reset();
    // this.priceProductForm.patchValue({Code: 0})
    // this.isLockAllForm = true
    // this.lockBarcode = false
    // this.isLockStatus = true
    this.openDetail(true);
  }

  loadData(){
    if(Ps_UtilObjectService.hasValue(this.price) && this.price.Code != 0){
      this.GetPriceRequest()
      this.GetListSupplier();
    }
  }

  //hàm disable các action khác khi chọn checkbox trên grid
  isFilterActive:boolean = true
  selectItem(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }

  //#region filter
	filterPartnerProductMaster: FilterDescriptor = { field: 'PartnerProductMaster', value: null, operator: 'eq', ignoreCase: false }
  
  // Xử lý load filter cho danh sách
  loadFilter(){
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.filter.filters = []
    if(Ps_UtilObjectService.hasValueString(this.price.Code)){
      this.filterPartnerProductMaster.value = this.price.Code
      this.gridState.filter.filters.push(this.filterPartnerProductMaster)
    }

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      this.gridState.filter.filters.push(this.filterSearchBox);
    }
  }

  // Xử lý tìm kiếm
  handleSearch(event: any){
    if (event.filters && event.filters.length > 0){
      if (event.filters[0].value === '') {
        this.filterSearchBox.filters = []
        this.gridState.skip = 0
        this.loadFilter();
        this.GetListProductPriceRequest(this.gridState)
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.gridState.skip = 0
        this.loadFilter();
        this.GetListProductPriceRequest(this.gridState)
      }
    }
  }

  // Xử lý data khi chuyển trang trong danh sách
  onPageChange(event: PageChangeEvent){
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.loadFilter();
    this.GetListProductPriceRequest(this.gridState)
  }

  //#endregion

  //#region  dialog
  dialog:boolean = false
  dialogMany:boolean = false
  dialogForm:boolean = false
  dialogRequest: boolean = false
  
  openDialogForm(){
    this.dialogForm = true
  }

  openDialogRequest(){
    this.dialogRequest = true
  }

  closeDialog(){
    this.dialog = false
    this.dialogMany = false
    this.dialogForm = false
    this.dialogRequest = false
  }
  //#endregion


  //#region action
  onDeleteRequest(){
    if(Ps_UtilObjectService.hasValue(this.price) && this.price.Code > 0){
      this.DeletePriceRequest([this.price]);
    }
  }

  onDelete(type:number){
    if(type == 1){
      if(Ps_UtilObjectService.hasValue(this.priceProduct) && this.priceProduct.Code > 0){
        this.DeleteProductPriceRequest([this.priceProduct]);
      }
    }
    // else{
    //   if(Ps_UtilObjectService.hasValue(this.priceProductForm.value) && this.priceProductForm.value.Code > 0){
    //     this.DeleteProductPriceRequest([this.priceProductForm.value]);
    //   }
    // }
  }

  onDeleteManyItem(){
    if(Ps_UtilObjectService.hasListValue(this.listDelete)){
      this.DeleteProductPriceRequest(this.listDelete)
    }
  }


  isValidDateUpdateStatus: boolean = false;
  isValidDateUpdateStatusProduct: boolean = false
  checkDateUpdateStatus(effDate){
    let today = new Date();
    today.setHours(0,0,0,0);
    effDate.setHours(0,0,0,0);
    if(effDate > today){
      this.isValidDateUpdateStatus = true
      this.isValidDateUpdateStatusProduct = true
    } else {
      this.isValidDateUpdateStatusProduct = false
        if(this.price.StatusID == 3){
          this.isValidDateUpdateStatus = false
        }else{
          this.isValidDateUpdateStatus = true
        }
    }
  }


  onUpdateStatusRequest(statusID){
    if(Ps_UtilObjectService.hasValue(this.price) && this.price.Code != 0 && Ps_UtilObjectService.hasValue(this.price.COPartner)){
      if(statusID == 1 || statusID == 2){
        if(!Ps_UtilObjectService.hasListValue(this.listProductRequest)){
          this.layoutService.onError("Bạn chưa thêm sản phẩm vào đề nghị")
        }
        // else if(this.isValidDateUpdateStatusProduct == false){
        //   this.layoutService.onError("Ngày hiệu lực không hợp lệ")
        // }
        else{
          //Kiểm tra giá trị của item khi update
          var listItem = []
          this.listProductRequest.forEach((item) => {
            let isValid = true;
            let invalidFields = [];
            if(Ps_UtilObjectService.hasValueString(item.TaxCode) && !Ps_UtilObjectService.hasValueString(item.TaxName)){
              isValid = false;
              invalidFields.push('Tên khai quan/xuất hóa đơn');
            }
            if(statusID == 2){
              if (!Ps_UtilObjectService.hasValueString(item.Barcode)) {
                isValid = false;
                invalidFields.push('Barcode');
              } else if (!Ps_UtilObjectService.hasValueString(item.ProductName)) {
                isValid = false;
                invalidFields.push('Tên sản phẩm ( tiếng Việt )');
              }else if (!Ps_UtilObjectService.hasValueString(item.UnitPrice) && item.UnitPrice <= 0  ||
               !Ps_UtilObjectService.hasValueString(item.Bid) || item.Bid <= 0 ||
               !Ps_UtilObjectService.hasValueString(item.AvgPrice) || item.AvgPrice <= 0) {
                isValid = false;
                invalidFields.push('Giá cả');
              }else if (!Ps_UtilObjectService.hasValueString(item.BuyerUnit) || !Ps_UtilObjectService.hasValueString(item.BaseUnit)) {
                isValid = false;
                invalidFields.push('Đơn vị');
              } else if (!Ps_UtilObjectService.hasValueString(item.VATIn) || !Ps_UtilObjectService.hasValueString(item.VATOut)) {
                isValid = false;
                invalidFields.push('VAT (%)');
              } else if (!Ps_UtilObjectService.hasValueString(item.CurrencyIn) || !Ps_UtilObjectService.hasValueString(item.CurrencyAvg) || !Ps_UtilObjectService.hasValueString(item.CurrencyOut)) {
                isValid = false;
                invalidFields.push('Đồng tiền');
              }else if(!Ps_UtilObjectService.hasValueString(item.QtyMore) || item.QtyMore <= 0 ||
              !Ps_UtilObjectService.hasValueString(item.QtyMonthSale) || item.QtyMonthSale <= 0 ||
              !Ps_UtilObjectService.hasValueString(item.AmountMonthSale) || item.AmountMonthSale <= 0 ||
              !Ps_UtilObjectService.hasValueString(item.QtyFirstOrder) || item.QtyFirstOrder <= 0 ||
              !Ps_UtilObjectService.hasValueString(item.MinQuantity) || item.MinQuantity <= 0
            ){
                isValid = false;
                invalidFields.push('Số lượng hoặc Doanh thu');
              }
            }

            if (!isValid) {
              listItem.push({ item, invalidFields });
            }
          })


          if (Ps_UtilObjectService.hasListValue(listItem)) {
            const firstInvalidItem = listItem[0];
            const invalidFieldsList = firstInvalidItem.invalidFields;
            this.layoutService.onWarning(`Sản phẩm ${firstInvalidItem.item.ProductName} chưa nhập đầy đủ thông tin về ${invalidFieldsList}`);
          } else {
            this.UpdatePriceRequestStatus([this.price], statusID);
          }

        }
      }else{
        this.UpdatePriceRequestStatus([this.price],statusID)
      }

    }
  }


 
  //Xử lý thêm các action vào dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOProductPriceRequest){
    moreActionDropdown = []
    var statusID = dataItem.StatusID
    this.priceProduct = dataItem

    if(this.isLockAllDetail){
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
      if(this.price.StatusID == 2 && (this.isMaster || this.isApprover) && this.isValidDateUpdateStatusProduct){
        if(statusID == 2){
          moreActionDropdown.push( { Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true },)
        }
        else if(statusID == 3){
          moreActionDropdown.push( { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },)
        }
      }
    }else{
      if((this.price.StatusID == 0 || this.price.StatusID == 4) && (this.isMaster || this.isCreator)){
        moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true },)
      }
      if(this.price.StatusID == 1  && (this.isMaster || this.isApprover)){
        moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true },)
      }
      if(statusID == 0 && this.price.StatusID == 0 && (this.isMaster || this.isCreator)){
        moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Type: 'delete', Actived: true })
      }
    }

     
    
  return moreActionDropdown
  }

  //Xử lý action trong dropdown của item
  onActionDropdownClick(menu: MenuDataItem, item: any){
    if (item.Code > 0) {
      if (menu.Type == 'StatusID') {
        this.UpdateProductPriceRequestStatus([this.priceProduct], parseInt(menu.Link))
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.openDetail();
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
       this.dialog = true
      }
    }
  }

  //Xử lý hiện action trên popup khi đang selection
  getSelectionPopup(arrItem: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    //tìm item có tình trạng
    const soan = arrItem.findIndex(s => s.StatusID == 0)
    const approve = arrItem.findIndex(s => s.StatusID == 2)
    const stop = arrItem.findIndex(s => s.StatusID == 3) 

    if(this.isLockAllDetail){
      if(this.price.StatusID == 2 && (this.isMaster || this.isApprover) && this.isValidDateUpdateStatusProduct){
        if(approve != -1){
          moreActionDropdown.push( { Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true },)
        }
        if(stop != -1){
          moreActionDropdown.push( { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },)
        }
      }
    }
    else{
      if((soan != -1 && this.price.StatusID == 0) && (this.isMaster || this.isCreator)){
        moreActionDropdown.push({ Name: "Xóa sản phẩm", Code: "trash", Type: 'Delete',  Actived: true })
      }
    }
    return moreActionDropdown
  }


  listDelete: DTOProductPriceRequest[] = []
  //hàm xử lý action của các button trong popup checkbox
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    let arr = []
    let StatusID: number = -1
    if (list.length > 0) {
     
      if (value == 2 || value == '2') {//Phê duyệt
          arr = []
          list.forEach(s => {
            if (s.StatusID == 3 || s.StatusID == 0) {
              arr.push(s);
            }
          })
          StatusID = 2
        }
        else if (value == 3 || value == '3') {//Ngưng hiển thị
          arr = []
          list.forEach(s => {
            if (s.StatusID == 2) {
              arr.push(s);
            }
          })
          StatusID = 3
        }

        if (Ps_UtilObjectService.hasListValue(arr)) {
          this.UpdateProductPriceRequestStatus(arr, StatusID)
        }
    }

      // else
      if (btnType == "Delete") {//Xóa
        this.listDelete = []
        list.forEach(s => {
          if (s.StatusID == 0)
            this.listDelete.push(s)
            this.dialogMany = true
        })
      }
  }


onAddNewPrice(){
  var newPrice = new DTOPriceRequest();
  localStorage.setItem("PriceRequest", JSON.stringify(newPrice))
  this.GetPriceRequest();
  this.isLockAllDetail = false
  this.disableSearch = false
  // this.effDate = null
}

// getDataDrawer(){
//   this.getListPackingUnit('BaseUnit')
//   this.getListPackingUnit('BuyerUnit')

//   this.APIGetListCountry()
//   this.getListGroupWeb();
//   this.getListCurrency();
//   this.GetListStatus(4);
//   if(this.price.TypeData == 22){
//     this.GetAllShippers();
//     this.GetListCommercialTerm();
//   }
// }

//region search supplier
filteredPartner: DTOPartner[] = [];


callFirstApi: boolean = true
//hàm filter combobox nhà cung cấp
handleFilter(value) {
  if(Ps_UtilObjectService.hasValueString(value)){
    if(this.callFirstApi){
      this.GetListSupplier();
      this.callFirstApi = false
    }
    setTimeout(() => {
      let lowerCaseValue = value.toLowerCase();
      if(Ps_UtilObjectService.hasListValue(this.listSupplier)){
        this.filteredPartner = this.listSupplier.filter(result => {
          return (
            (Ps_UtilObjectService.hasValueString(result.PartnerID) && result.PartnerID.toLowerCase().includes(lowerCaseValue)) ||
            (Ps_UtilObjectService.hasValueString(result.VNName) && result.VNName.toLowerCase().includes(lowerCaseValue))
          );
        });
      }
    },1000)

    }
    else{
      this.filteredPartner = this.listSupplier
    }
}

// hàm cập nhật nhà cung cấp
onSupplierChange(value: DTOSupplier) {
 if(Ps_UtilObjectService.hasValue(value)){
  const currentDate = new Date();
  this.price.PartnerName = value.VNName
  this.price.PartnerID = value.PartnerID
  this.price.COPartner = value.Code
  this.price.TypeData = value.TypeData
  this.price.Remark = ''
  this.price.EffDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2);
  this.UpdatePriceRequest(['COPartner','EffDate'], this.price)
  this.disableSearch = true
}else{
  this.filteredPartner = this.listSupplier
}

}
//#endregion


//Xử lý cập nhật khi blur ra ngoài textbox
onBlurTextbox(prop: string, item?) {
  if (Ps_UtilObjectService.hasValueString(prop)) {
    switch (prop) {
      default:
        this.UpdatePriceRequest([prop], this.price)
      }  
  }
}

//datepicker change value
onDatepickerChange(prop: string, ev?) {
      if (Ps_UtilObjectService.hasValueString(prop)) {
        this.price.EffDate = this.effDate
        this.UpdatePriceRequest([prop], this.price);
      }
}

// onTextboxBlurBarcode(){
//   if (Ps_UtilObjectService.hasValueString(this.priceProductForm.value.Barcode) && this.priceProductForm.value.Code == 0) {
//       this.GetProductPriceRequestByCode(this.priceProductForm.value.Barcode,this.price.Code)
//   }
// }

// onDropdownClick(event,propName:string){
//   switch(propName) {
//     case 'Origin':
//       this.priceProductForm.patchValue({ Origin: event.Code });
//       break;
//     case 'BaseUnit':
//       this.priceProductForm.patchValue({ BaseUnit: event.Code });
//       this.getListPackingUnit('BuyerUnit');
//       break;
//     case 'BuyerUnit':
//       this.priceProductForm.patchValue({ BuyerUnit: event.Code });
//       break;
//     case 'GroupProduct':
//       this.priceProductForm.patchValue({ GroupID: event.Code });
//       break;
//     case 'CurrencyIn':
//       this.priceProductForm.patchValue({ CurrencyIn: event.Code });
//       break;
//     case 'CurrencyAvg':
//       this.priceProductForm.patchValue({ CurrencyAvg: event.Code });
//       break;
//     case 'CurrencyOut':
//       this.priceProductForm.patchValue({ CurrencyOut: event.Code });
//       break;
//     case 'Shipper':
//       this.priceProductForm.patchValue({ Shipper: event.Code });
//       break;
//     case 'CommercialTerm':
//       this.priceProductForm.patchValue({ CommercialTerm: event.Code });
//       break;
//     case 'StatusID':
//       this.priceProductForm.patchValue({ StatusID: event.OrderBy });
//       break;
//     default:
      
//       break;
//   }
// }

// blurDateFormTo(name:string,event){
//   if(name == 'POFrom'){
//     const poForm = new Date(this.priceProductForm.value.POFrom)
//     const poTo = new Date(this.priceProductForm.value.POTo)
//     if(poTo <= poForm){
//         this.minDatePO = new Date(poForm.getFullYear(), poForm.getMonth(), poForm.getDate() + 1)
//         this.priceProductForm.patchValue({POTo: this.minDatePO})
//     }
//   }else{
//     const storeForm = new Date(this.priceProductForm.value.StoreFrom)
//     const storeTo = new Date(this.priceProductForm.value.StoreTo)
//     if(storeTo <= storeForm){
//         this.minDateStore = new Date(storeForm.getFullYear(), storeForm.getMonth(), storeForm.getDate() + 1)
//         this.priceProductForm.patchValue({StoreTo: this.minDateStore})
//     }
//   }
// }

// onBlurMargin(name:string){
//   if(Ps_UtilObjectService.hasValue(name)){
//     const priceProduct: DTOProductPriceRequest = this.priceProductForm.value
//     const margin = (((priceProduct.UnitPrice - priceProduct.Bid)/ priceProduct.UnitPrice)*100)
//     // console.log(margin)
//     if(!isNaN(margin) && isFinite(margin)){
//       if ( margin % 1 !== 0) {
//         // Nếu có số dư, sử dụng
//         this.priceProductForm.patchValue({Margin: Math.ceil(margin)})
//       } else {
//         // Nếu không có số dư, không sử dụng
//         this.priceProductForm.patchValue({Margin: margin})
//       }
//     }else{
//       this.priceProductForm.patchValue({Margin: null})
//     }
//   }
// }


// currentList: DTOPartnerProductWarehouse[] = []
// onCheckBoxChange(event,item,list){
//   if(event.target.checked){
//       item.IsSelected = true
//       if(item.Code == -1 || item.WHName == 'Tất cả'){
//         list.forEach(s => {
//           if(Ps_UtilObjectService.hasListValue(s.ListChild)){
//             s.ListChild.forEach(c => {
//               c.IsSelected = true
//             })
//           }
//         })
//       }
//       else{
//         //todo
//       }
//   }
//   else{
//     item.IsSelected = false
//     if(item.Code == -1 || item.WHName == 'Tất cả'){
//       list.forEach(s => {
//         if(Ps_UtilObjectService.hasListValue(s.ListChild)){
//           s.ListChild.forEach(c => {
//             c.IsSelected = false
//           })
//         }
//       })
//     }

//     if(Ps_UtilObjectService.hasListValue(item.ListChild)){
//       item.ListChild.forEach(s => {
//         s.IsSelected = false
//     })
//     }else{
//       if(item.Code !== -1 || item.WHName !== 'Tất cả'){
//         list.forEach(s => {
//           if(Ps_UtilObjectService.hasListValue(s.ListChild)){
//             s.ListChild[0].IsSelected = false
//           }
//         })
//       }
//     }
//   }
//   const listJson = JSON.stringify(list)
//   this.priceProductForm.patchValue({WithoutConfig: listJson})
  
// }

// listPackingUnit: any[] = []
// filteredBaseUnitList: any[] = [];
// filteredBuyerUnitList: any[] = [];

// loadFilterPackingUnit(propName: string) {
//   this.gridStatePackingUnit.filter.filters = [];
//   let filterPackingUnit: CompositeFilterDescriptor = { logic: 'or', filters: [] };
//     // Lọc theo TypeData 1 và 2
//     if (propName === 'BaseUnit') {
//       filterPackingUnit.filters.push({
//         logic: 'or',
//         filters: [
//           { field: 'TypeData', operator: 'eq', value: 1 },
//           { field: 'TypeData', operator: 'eq', value: 2 }
//         ]
//       });
//     } else {

//       if (propName === 'BuyerUnit') {
//         // Nếu có giá trị trong BaseUnit, thêm điều kiện lọc theo Code của BaseUnit
//         filterPackingUnit.filters.push({
//           logic: 'and',
//           filters: [
//             { field: 'TypeData', operator: 'eq', value: 2 }
//           ]
//         });
//         if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.BaseUnit)){
//           filterPackingUnit.filters.push({
//             logic: 'and',
//             filters: [
//               { field: 'TypeData', operator: 'eq', value: 1 },
//               { field: 'Code', operator: 'eq', value: this.priceProductForm.value.BaseUnit }
//             ]
//           },) 
//         }
//       }
//     }

//     this.gridStatePackingUnit.filter.filters.push(filterPackingUnit);
// }

//#endregion


//#region API

  disableSearch: boolean = false
GetPriceRequest() {
    this.loading = true
    var price = JSON.parse(localStorage.getItem("PriceRequest"))
    if (Ps_UtilObjectService.hasValue(price) && price.Code != 0) {
    this.priceRequestAPI.GetPriceRequest(price).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.price = res.ObjectReturn
            this.loadFilter();
            this.GetListProductPriceRequest(this.gridState)
          if (Ps_UtilObjectService.hasValue(this.price.EffDate)) {
            this.effDate = new Date(this.price.EffDate)
            this.checkDateUpdateStatus(this.effDate)
          }

          if(Ps_UtilObjectService.hasValue(this.price.COPartner) && this.price.COPartner > 0){
            this.GetListSupplier();
            this.disableSearch = true
            this.callFirstApi = false
          }

          

          if((this.price.StatusID == 2 || this.price.StatusID == 3)){
            this.isLockAllDetail = true
          }else {
            const isCreatorCondition = this.price.StatusID === 0 || this.price.StatusID === 4;
            const isApproverCondition = this.price.StatusID === 1;
            this.isLockAllDetail = (this.isApprover && this.isCreator) ? false : this.isApprover ? !isApproverCondition : (this.isCreator) ? !isCreatorCondition : false;
          }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Đề nghị báo giá:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Đề nghị báo giá:  ${err}`)
    })
  }else{
    this.loading = false
    this.price = new DTOPriceRequest();
    this.effDate = null
    this.selectedSupplier = null
    if(Ps_UtilObjectService.hasValue(this.effdateValue)){
      this.effdateValue.value = null
    }
  }
}

GetListProductPriceRequest(state: State) {
  this.loading = true;
  var ctx = "Thông tin chi tiết Đề nghị"
  this.priceRequestAPI.GetListProductPriceRequest(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
      this.listProductRequest = res.ObjectReturn.Data
      this.total = res.ObjectReturn.Total
      this.gridView.next({ data: this.listProductRequest, total: this.total });
    } else {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`)
    }
    this.loading = false
  }, (err) => {
    this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${err}`);
    this.loading = false
  })
}

//lọc mảng đệ quy thành mảng phẳng
// flatten(arr = []) {
//   let result = [];
//   arr.forEach((item) => {
//       if (Ps_UtilObjectService.hasListValue(item.ListSuppliers)) {
//           result.push(item, ...this.flatten(item.ListSuppliers));
//       } else {
//           result.push(item);
//       }
//   });
//   return result;
// }

selectedSupplier = new DTOSupplier();
GetListSupplier() {
  let ctx = `Lấy danh sách Đối tác`
  this.loading = true;
  this.priceRequestAPI.GetListSupplier().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.listSupplier = res.ObjectReturn
          this.filteredPartner =  res.ObjectReturn
          //gán partner
          const findPartner =  this.listSupplier.find(s => {
            if(s.Code == this.price.COPartner){
              return s
            }
          })
          if(Ps_UtilObjectService.hasValue(findPartner)){
            this.selectedSupplier = findPartner
            this.price.TypeData = findPartner.TypeData
             //gán typeData = 22 de test ui
          }
         
          // console.log(this.price)
      } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
  }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
  })
}

UpdatePriceRequest(prop: string[], price = this.price) {
  this.priceRequestAPI.UpdatePriceRequest(price, prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
      this.layoutService.onSuccess("Cập nhật thành công thông Đề nghị báo giá");
      this.price = res.ObjectReturn
      if (Ps_UtilObjectService.hasValue(this.price.EffDate)) {
        this.effDate = new Date(this.price.EffDate)
        this.checkDateUpdateStatus(this.effDate)
      }
      localStorage.setItem("PriceRequest", JSON.stringify(res.ObjectReturn))
    }
    else {
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Đề nghị báo giá:  ${res.ErrorString}`)
    }
    this.loading = false
  }, err => {
    this.loading = false
    this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Đề nghị báo giá:  ${err}`)
  })
}

UpdateProductPriceRequest(dto: DTOProductPriceRequest,prop: string[]) {
  let ctx = `Cập nhật thông tin chi tiết Sản phẩm báo giá`
  this.loading = true;
  this.priceRequestAPI.UpdateProductPriceRequest(dto,prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} Thành công`)
        this.loadFilter()
        this.GetListProductPriceRequest(this.gridState)
        this.drawer.close();
      } else {
        this.loadFilter()
        this.GetListProductPriceRequest(this.gridState)
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
           
      }
      this.loading = false;
  }, (error) => {
      this.loadFilter()
      this.GetListProductPriceRequest(this.gridState)
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
  })
}


listWithoutConfig: DTOPartnerProductWarehouse[] = []
// GetProductPriceRequest(dto: DTOProductPriceRequest) {
//   this.loading = true
//   this.priceRequestAPI.GetProductPriceRequest(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
    
//         if(Ps_UtilObjectService.hasValue(res.ObjectReturn.Margin)){
//           res.ObjectReturn.Margin = Math.ceil(res.ObjectReturn.Margin)
//         }

//         if(Ps_UtilObjectService.hasValueString(res.ObjectReturn.WithoutConfig) && this.price.TypeData == 21){
//             this.listWithoutConfig = JSON.parse(res.ObjectReturn.WithoutConfig)
//         }


//         //format date
//       if (Ps_UtilObjectService.hasValue(res.ObjectReturn.POFrom) || Ps_UtilObjectService.hasValue(res.ObjectReturn.POTo)||
//        Ps_UtilObjectService.hasValue(res.ObjectReturn.StoreFrom) || Ps_UtilObjectService.hasValue(res.ObjectReturn.StoreTo)
//       ){
//             res.ObjectReturn.POFrom = new Date(res.ObjectReturn.POFrom)
//             res.ObjectReturn.POTo = new Date(res.ObjectReturn.POTo)
//             res.ObjectReturn.StoreFrom = new Date(res.ObjectReturn.StoreFrom)
//             res.ObjectReturn.StoreTo = new Date(res.ObjectReturn.StoreTo)
//             this.minDatePO =  new Date(res.ObjectReturn.POFrom.getFullYear(), res.ObjectReturn.POFrom.getMonth(), res.ObjectReturn.POFrom.getDate() + 1)
//             this.minDateStore =  new Date(res.ObjectReturn.StoreFrom.getFullYear(), res.ObjectReturn.StoreFrom.getMonth(), res.ObjectReturn.StoreFrom.getDate() + 1)
//       }
//       //end

      
//       if(res.ObjectReturn.StatusID == 2  || this.isLockAllDetail){
//         this.isLockAllForm = true
//       }else{
//         this.isLockAllForm = false
//       }

//       this.lockBarcode = this.isLockAllForm
//       this.isLockStatus = false
//       // this.disableBarcode = true
//       this.priceProductForm.patchValue(res.ObjectReturn)
//       this.getDataDrawer()
      
//     }
//     else {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Đề nghị:  ${res.ErrorString}`)
//     }

//     this.loading = false
//   }, err => {
//     this.loading = false
//     this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Đề nghị:  ${err}`)
//   })
// }

// GetProductPriceRequestByCode(barcode:string,Code: number) {
//   this.loading = true
//   this.priceRequestAPI.GetProductPriceRequestByCode(barcode,Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//       if(Ps_UtilObjectService.hasValue(res.ObjectReturn.Margin)){
//         res.ObjectReturn.Margin = Math.ceil(res.ObjectReturn.Margin)
//       }

//       if(Ps_UtilObjectService.hasValueString(res.ObjectReturn.WithoutConfig) && this.price.TypeData == 21){
//           this.listWithoutConfig = JSON.parse(res.ObjectReturn.WithoutConfig)
//       }
//       this.isLockStatus = false


//       //format date
//     if (Ps_UtilObjectService.hasValue(res.ObjectReturn.POFrom) || Ps_UtilObjectService.hasValue(res.ObjectReturn.POTo)||
//      Ps_UtilObjectService.hasValue(res.ObjectReturn.StoreFrom) || Ps_UtilObjectService.hasValue(res.ObjectReturn.StoreTo)
//     ){
//           res.ObjectReturn.POFrom = new Date(res.ObjectReturn.POFrom)
//           res.ObjectReturn.POTo = new Date(res.ObjectReturn.POTo)
//           res.ObjectReturn.StoreFrom = new Date(res.ObjectReturn.StoreFrom)
//           res.ObjectReturn.StoreTo = new Date(res.ObjectReturn.StoreTo)
//           const poFrom = this.effDate
//           const poTo = new Date(poFrom.getFullYear(), poFrom.getMonth(), poFrom.getDate() + 30)
//           // var newItem = new DTOProductPriceRequest()
//           if(this.price.TypeData == 21){
//             this.minDateStore = new Date(poFrom.getFullYear(), poFrom.getMonth(), poFrom.getDate() + 1)
//             res.ObjectReturn.StoreFrom = poFrom
//             res.ObjectReturn.StoreTo = poTo
//           }else{
//             this.minDatePO = new Date(poFrom.getFullYear(), poFrom.getMonth(), poFrom.getDate() + 1)
//             res.ObjectReturn.POFrom = poFrom
//             res.ObjectReturn.POTo = poTo
//           }
//     }

//     //end
//       this.isLockAllForm = false
//       // this.disableBarcode = false
//       this.priceProductForm.patchValue(res.ObjectReturn)
//       this.getDataDrawer()
//     }
//     else {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Sản phẩm:  ${res.ErrorString}`)
//     }
//     this.loading = false
//   }, err => {
//     this.loading = false
//     this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Sản phẩm:  ${err}`)
//   })
// }

// listCountry: DTOListCountry[] = []
// APIGetListCountry() {
//   let ctx = `Lấy danh sách quốc gia`
//   this.loading = true;
//   this.StaffServiceAPI.GetListCountry().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//           this.listCountry = res.ObjectReturn.Data
//          if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.Origin)){
//           const originObj = this.listCountry.find(s => s.Code == this.priceProductForm.value.Origin)
//           this.priceProductForm.patchValue({OriginItem: originObj})
//          }else{
//           this.priceProductForm.patchValue({OriginItem: null})
//          }
//       } else {
//           this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//       }
//       this.loading = false;
//   }, (error) => {
//       this.loading = false;
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
//   })
// }


// getListPackingUnit(propName) {
//   this.loading = true
//   this.loadFilterPackingUnit(propName)
//   this.configHamperAPI.GetListPackingUnit(this.gridStatePackingUnit).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//       if(propName == 'BaseUnit'){
//         this.filteredBaseUnitList = res.ObjectReturn.Data
//           if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.BaseUnit)){
//           const baseUnitObj = this.filteredBaseUnitList.find(s => s.Code == this.priceProductForm.value.BaseUnit)
//           this.priceProductForm.patchValue({BaseUnitItem: baseUnitObj})
//         }else{
//           this.priceProductForm.patchValue({BaseUnitItem: null})
//         }
//       }else{
//         this.filteredBuyerUnitList = res.ObjectReturn.Data
//           if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.BuyerUnit)){
//             const buyerUnitObj = this.filteredBuyerUnitList.find(s => s.Code == this.priceProductForm.value.BuyerUnit)
//             this.priceProductForm.patchValue({BuyerUnitItem: buyerUnitObj})
//           }else{
//             this.priceProductForm.patchValue({BuyerUnitItem: null})
//           }
//       }
      
//     } else {
//       this.layoutService.onError(`Lỗi lấy danh sách Đơn vị sản phẩm: ${res.ErrorString}`)
//     }
//     this.loading = false
//   }, (err) => {
//     this.layoutService.onError(`Lỗi lấy danh sách Đơn vị sản phẩm: ${err}`);
//     this.loading = false
//   })
// }


// listCurrency:any[] = []
// getListCurrency() {
//   this.loading = true
//   this.configHamperAPI.GetListCurrency().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//       this.listCurrency = res.ObjectReturn
//       // this.currency = res.ObjectReturn.filter(s => s.OrderBy = 0)
//       if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.CurrencyIn)){
//         const currencyIn = this.listCurrency.find(s => s.Code == this.priceProductForm.value.CurrencyIn)
//         this.priceProductForm.patchValue({CurrencyInItem: currencyIn})
//       }else{
//         this.priceProductForm.patchValue({CurrencyInItem: null})
//       }

//       if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.CurrencyOut)){
//         const currencyOut = this.listCurrency.find(s => s.Code == this.priceProductForm.value.CurrencyOut)
//         this.priceProductForm.patchValue({CurrencyOutItem: currencyOut})
//       }
//       else{
//         this.priceProductForm.patchValue({CurrencyOutItem: null})
//       }

//       if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.CurrencyAvg)){
//         const currencyAvg = this.listCurrency.find(s => s.Code == this.priceProductForm.value.CurrencyAvg)
//         this.priceProductForm.patchValue({CurrencyAvgItem: currencyAvg})
//       }
//       else{
//         this.priceProductForm.patchValue({CurrencyAvgItem: null})
//       }

//     }
//     else {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${res.ErrorString}`)
//     }
//     this.loading = false
//   }, err => {
//     this.loading = false
//     this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${err}`)
//   })
// }

// listGroupWeb: DTOConfGroup[] = []
// searchTree(dataList, targetCode) {
//   for (const item of dataList) {
//     if (item.Code === targetCode) {
//       return item;
//     }

//     if (item.ListGroup && item.ListGroup.length > 0) {
//       const foundItem = this.searchTree(item.ListGroup, targetCode);
//       if (foundItem) {
//         return foundItem;
//       }
//     }
//   }

//   return null; // Trả về null nếu không tìm thấy
// }

// getListGroupWeb(){
//   this.loading = true
//   this.configHamperAPI.GetListGroup(this.gridStateGroup).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//       this.listGroupWeb = res.ObjectReturn.Data;
//       // GroupIDItem
//       if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.GroupID)){
//         const groupIDObj = this.searchTree(this.listGroupWeb,this.priceProductForm.value.GroupID)
//         if(Ps_UtilObjectService.hasValue(groupIDObj)){
//           this.priceProductForm.patchValue({GroupIDItem: groupIDObj})
//         }
//       }else{
//           this.priceProductForm.patchValue({GroupIDItem: this.listGroupWeb[0], GroupID: this.listGroupWeb[0].Code})
//       }
//   }
//     else{
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm:  ${res.ErrorString}`)
//     }
//     this.loading = false
//   }, err => {
//     this.loading = false
//     this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm:  ${err}`)
//   })
// }

// listStatus: DTOStatus[] = []
// GetListStatus(statusID: number) {
//   this.loading = true;
//   this.layoutAPIService.GetListStatus(statusID).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
//     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.listStatus = res.ObjectReturn.filter(s => s.OrderBy !== 0 && s.OrderBy !== 1 && s.OrderBy !== 4);

//         if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.StatusID)){
//           const statusID = res.ObjectReturn.find(s => s.OrderBy == this.priceProductForm.value.StatusID)
//           this.priceProductForm.patchValue({StatusItem: statusID})
//         }
//         else{
//           const defaultStatus = this.listStatus.find(s => s.OrderBy == 2)
//           this.priceProductForm.patchValue({StatusItem: defaultStatus})
//         }
//     }
//       else{
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${res.ErrorString}`)
//       }
//       this.loading = false
//     }, err => {
//       this.loading = false
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${err}`)
//     })
// }

// listShipper: any[] = []
// GetAllShippers() {
//   this.loading = true
//   this.ecomAPIService.GetAllShippers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//       this.listShipper = res.ObjectReturn
//       if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.Shipper)){
//         const shipper = this.listShipper.find(s => s.Code == this.priceProductForm.value.Shipper)
//         this.priceProductForm.patchValue({ShipperItem: shipper})
//       }
//       else{
//         this.priceProductForm.patchValue({ShipperItem: null})
//       }
//     }
//     else {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Shipper:  ${res.ErrorString}`)
//     }
//     this.loading = false
//   }, err => {
//     this.loading = false
//     this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Shipper:  ${err}`)
//   })
// }

// listCommercialTerm: any[] = []
// GetListCommercialTerm() {
//   this.loading = true
//   this.priceRequestAPI.GetListCommercialTerm().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
//     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//       this.listCommercialTerm = res.ObjectReturn.Data
//       if(Ps_UtilObjectService.hasValue(this.priceProductForm.value.CommercialTerm)){
//         const commercialTerm = this.listCommercialTerm.find(s => s.Code == this.priceProductForm.value.CommercialTerm)
//         this.priceProductForm.patchValue({CommercialTermItem: commercialTerm})
//       }
//       else{
//         this.priceProductForm.patchValue({CommercialTermItem: null})
//       }
//     }
//     else {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ĐK Thương mại:  ${res.ErrorString}`)
//     }
//     this.loading = false
//   }, err => {
//     this.loading = false
//     this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ĐK Thương mại:  ${err}`)
//   })
// }

UpdateProductPriceRequestStatus(items: DTOProductPriceRequest[] = [this.priceProduct], statusID = this.priceProduct.StatusID){
  this.loading = true
  var ctx = 'Cập nhật tình trạng'
    this.priceRequestAPI.UpdateProductPriceRequestStatus(items, statusID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.loadFilter()
        this.GetListProductPriceRequest(this.gridState);
     } else{
       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
       this.loadFilter()
       this.GetListProductPriceRequest(this.gridState);
     }

      this.loading = false;
    },() =>{
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
      this.loadFilter()
      this.GetListProductPriceRequest(this.gridState);
    }
    )
  
}

DeleteProductPriceRequest(dto:DTOProductPriceRequest[]){
  var ctx = `Đề nghị báo giá`
  this.priceRequestAPI.DeleteProductPriceRequest(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
    if (res.StatusCode == 0) {
      this.layoutService.onSuccess(`Xóa thành công ${ctx}`);
      this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
      this.closeDialog();
      this.loadFilter();
      this.GetListProductPriceRequest(this.gridState);

    }else{
      this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${res.ErrorString}!`)
       this.loadFilter()
       this.GetListProductPriceRequest(this.gridState);
    }
    },(error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${error}!`);
      this.loadFilter()
      this.GetListProductPriceRequest(this.gridState);
    }
  );
}


DeletePriceRequest(dto:DTOPriceRequest[]){
  var ctx = `Đề nghị báo giá`
  this.priceRequestAPI.DeletePriceRequest(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
    if (res.StatusCode == 0) {
      this.layoutService.onSuccess(`Xóa thành công ${ctx}`);
      this.closeDialog();
      this.onAddNewPrice();
    }else{
      this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${res.ErrorString}!`)
    
    }
    },(error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${error}!`);
    }
  );
}

UpdatePriceRequestStatus(items: DTOPriceRequest[] = [this.price], statusID = this.price.StatusID){
  this.loading = true
  var ctx = 'Cập nhật tình trạng'
    this.priceRequestAPI.UpdatePriceRequestStatus(items, statusID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.GetPriceRequest()
       
     } else{
       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
       this.GetPriceRequest()
     }
      this.loading = false;
    },(err) =>{
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}!`)
      this.GetPriceRequest()
    }
    )
  
}



  //#endregion

  getRes(str: string) {
    return Ps_UtilObjectService.getImgRes(str)
  }


  // Mở dialog import
  excelValid: boolean = true
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  // Xử lý sự kiện upload
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e);
  }


  // Xử lý import file
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"
   this.priceRequestAPI.ImportExcelProductPriceRequest(file,this.price.Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
        this.loadFilter()
        this.GetListProductPriceRequest(this.gridState)
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    })
  }

  // download excel template
  downloadExcel() {
    this.loading = true;
    var ctx = 'Download Excel Template';
    var getfileName = 'PartnerProductRequestTemplate.xlsx'
    this.layoutService.onInfo(`Đang xử lý ${ctx}`);

    this.configHamperAPI.GetTemplate(getfileName).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`);
      } else {
        this.layoutService.onError(`${ctx} thất bại`);
      }
      this.loading = false;
    }, (f) => {
      this.layoutService.onError(
        `Xảy ra lỗi khi ${ctx}. `
      );
      this.loading = false;
    });
  }
  //#endregion


  // Unsubcribe
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  
}
