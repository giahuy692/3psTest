import { Component, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { DTOProductPriceRequest } from '../../shared/dto/DTOProductPriceRequest.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { PurPriceRequestApiService } from '../../shared/services/pur-price-request-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { StaffApiService } from 'src/app/p-app/p-hri/shared/services/staff-api.service';
import { ConfigHamperApiService } from 'src/app/p-app/p-config/shared/services/config-hamper-api.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { EcomAPIService } from 'src/app/p-app/p-ecommerce/shared/services/ecom-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { Ps_UtilObjectService } from 'src/app/p-lib/utilities/utility.object';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { DTOPartnerProductWarehouse } from '../../shared/dto/DTOPartnerProductWarehouse .dto';
import { DTOConfGroup } from 'src/app/p-app/p-config/shared/dto/DTOConfHamperRequest';

@Component({
  selector: 'app-pur008-price-product-detail',
  templateUrl: './pur008-price-product-detail.component.html',
  styleUrls: ['./pur008-price-product-detail.component.scss']
})
export class Pur008PriceProductDetailComponent {
  @ViewChild('dropdown2') dropdown2: any
  @ViewChild('dropdown3') dropdown3: any
  @ViewChild('dropdown4') dropdown4: any
  @ViewChild('dropdown5') dropdown5: any
  @ViewChild('dropdownValueTM') dropdownValueTM: any
  @ViewChild('dropdownValueDT') dropdownValueDT: any
  @ViewChild('dropdownPur1') dropdownValuePur1: any
  @ViewChild('dropdownPur2') dropdownValuePur2: any

  loading: boolean = false
  isLock: boolean = false
  ngUnsubscribe = new Subject<void>;
  priceProduct = new DTOProductPriceRequest()
  today = new Date()

  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false


  // listGroupWebAo: any[] = []
  // listGroupWebDataAo:   { [key: string]: any[] } = {};
  // currentGroupWeb1Ao: { [key: number]: any } = {};
  // currentGroupWeb2Ao: { [key: number]: any } = {};

  constructor(
    public menuService: PS_HelperMenuService,
    public priceRequestAPI: PurPriceRequestApiService,
    public layoutService: LayoutService,
    public staffServiceAPI: StaffApiService,
    public configHamperAPI: ConfigHamperApiService,
    public layoutAPIService: LayoutAPIService,
    public ecomAPIService: EcomAPIService,
  ) { }

  ngOnInit(): void {
    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        //action permission
        this.isMaster = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        // this.isMaster = true
        // this.isCreator = true
        // this.isApprover = true
        //Chỉ được xem
        this.isAllowedToViewOnly = this.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(this.actionPerm.filter(s => s.ActionType != 6))
      }
    })
    // this.getProductPriceLocal();
    // this.getSupplier();

    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getProductPriceLocal();
        this.getSupplier();
      }
    })
  }



  getData() {
    this.getListPackingUnit('BaseUnit')
    this.getListPackingUnit('BuyerUnit', true)
    this.getListCurrency();
    this.getListCommercialTerm();
    this.getListGroupWeb(this.gridStateGroup)
  }

  //   openDetail(){
  //  this.menuService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: ModuleDataItem) => {
  //      var parent = item.ListMenu.find(f => f.Code == 'pur-po')
  //      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
  //        var detail = parent.LstChild.find(f => f.Code.includes('price-request-list')
  //          || f.Link.includes('price-request-list'))
  //        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
  //          var detail2 = detail.LstChild.find(f => f.Code.includes('price-request-detail')
  //            || f.Link.includes('price-request-detail'))
  //           this.menuService.activeMenu(detail2)
  //         }
  //      }
  //   })

  //   }


  //#region DIALOG
  dialogProduct: boolean = false
  closeDialog() {
    this.dialogProduct = false
  }
  openDialog() {
    this.dialogProduct = true
  }
  //#endregion


  //#region  ACTION
  isLockTax: boolean = true
  onclickTax() {
    this.isLockTax = !this.isLockTax;
  }

  getSupplier() {
    const supplier = JSON.parse(localStorage.getItem("PriceRequest"))
    if (Ps_UtilObjectService.hasValue(supplier) && supplier.Code !== 0) {
      this.supplierProduct = supplier
    }
  }

  loadData() {
    if (Ps_UtilObjectService.hasValue(this.priceProduct) && this.priceProduct.Code != 0) {
      this.GetProductPriceRequest(this.priceProduct, true);
    }
  }

  onDeleteProduct() {
    if (Ps_UtilObjectService.hasValue(this.priceProduct) && this.priceProduct.Code > 0) {
      this.DeleteProductPriceRequest([this.priceProduct]);
    }
  }

  supplierProduct = new DTOProductPriceRequest();
  statusPrice: number = 0
  isValidEffDate: boolean = false
  getProductPriceLocal() {
    const priceProduct = JSON.parse(localStorage.getItem("PriceProduct"))

    if (Ps_UtilObjectService.hasValue(priceProduct)) {
      if (Ps_UtilObjectService.hasValue(priceProduct.PriceStatus)) {
        this.statusPrice = priceProduct.PriceStatus
      }
      if (Ps_UtilObjectService.hasValue(priceProduct.IsValidDateUpdateStatusProduct)) {
        this.isValidEffDate = priceProduct.IsValidDateUpdateStatusProduct
      }

      if (priceProduct.Code !== 0) {
        this.GetProductPriceRequest(priceProduct, true);
      } else {
        this.priceProduct = new DTOProductPriceRequest();
        this.listWithoutConfig = []
        this.isLock = true
        this.currencyIn = null
        this.currencyOut = null
        this.currentBaseUnit = null
        this.currentBuyerUnit = null
        this.currentPurchasePrice = null
        this.currentSalePrice = null
        this.commercialTerm = null
        this.currencyAvg = null
        for (let level = 1; level <= 5; level++) {
          this[`currentGroupWeb${level}`] = { GroupName: '--Chọn--', Code: null };
        }
      }
    }
  }
  getImgRes(img: string) {
    return Ps_UtilObjectService.getImgRes(img)
  }


  //filter dropdown đơn vị
  listPackingUnit: any[] = []
  filteredBaseUnitList: any[] = [];
  filteredBuyerUnitList: any[] = [];
  gridStatePackingUnit: State = { filter: { filters: [], logic: 'and' }, }
  loadFilterPackingUnit(propName: string, firstLoad: boolean = false) {
    this.gridStatePackingUnit.filter.filters = [];
    let filterPackingUnit: CompositeFilterDescriptor = { logic: 'or', filters: [{ field: 'TypeData', operator: 'eq', value: 2 }] };
    let filterCode: FilterDescriptor = { field: 'Code', value: null, operator: 'eq', }


    // Lọc theo TypeData 1 và 2
    if (propName === 'BaseUnit') {
      filterPackingUnit.filters.push({
        logic: 'and',
        filters: [
          { field: 'TypeData', operator: 'eq', value: 1 },
        ]
      });
    } else {
      // if (propName === 'BuyerUnit') {
      // Nếu có giá trị trong BaseUnit, thêm điều kiện lọc theo Code của BaseUnit

      if (firstLoad) {
        if (Ps_UtilObjectService.hasValue(this.priceProduct.BaseUnit)) {
          filterCode.value = this.priceProduct.BaseUnit
          filterPackingUnit.filters.push({
            logic: 'and',
            filters: [
              { field: 'TypeData', operator: 'eq', value: 1 },
              filterCode,
            ]
          });
        }
        else {
          filterPackingUnit.filters.push({ field: 'TypeData', operator: 'eq', value: 2 },)
        }
      } else {
        if (Ps_UtilObjectService.hasValue(this.currentBaseUnit) && Ps_UtilObjectService.hasValue(this.currentBaseUnit.Code)) {
          filterPackingUnit.filters.push({
            logic: 'and',
            filters: [
              { field: 'TypeData', operator: 'eq', value: 1 },
              { field: 'Code', operator: 'eq', value: this.currentBaseUnit.Code }
            ]
          },)
        }
      }



      // }
    }

    this.gridStatePackingUnit.filter.filters.push(filterPackingUnit);
  }

  //Cập nhật item dropdown
  onDropdownClick(event, propName: string[]) {
    const updatePriceProduct = (property: string, code: any) => {
      this.priceProduct[property] = code;
      this.UpdateProductPriceRequest(this.priceProduct, propName);
    };
    switch (propName[0]) {
      case 'Origin':
      case 'BaseUnit':
        this.currentBaseUnit = event
        if (this.currentBaseUnit.TypeData !== 2) {
          this.getListPackingUnit('BuyerUnit');
        }
      case 'BuyerUnit':
      case 'GroupProduct':
      case 'CurrencyIn':
      case 'CurrencyAvg':
      case 'CurrencyOut':
      case 'Shipper':
      case 'CommercialTerm':
      case 'StatusID':
        updatePriceProduct(propName[0], event.Code);
        break;
      case 'GroupID1':
        //Nếu null thì update tất cả tránh trường hợp load lại vẫn chưa update lại groupID 
        this.priceProduct.GroupID2 = null
        this.priceProduct.GroupID3 = null
        this.priceProduct.GroupID4 = null
        this.priceProduct.GroupID = null
        if (event.Code == null) {
          this.priceProduct.GroupID1 = null
          this.currentGroupWeb1 = null
        }
        else {
          this.priceProduct.GroupID1 = event.Code
          const listLevel2 = this.listGroupWeb.filter(s => s.ParentID == event.Code)
          this.currentGroupWeb1 = event
          if (Ps_UtilObjectService.hasListValue(listLevel2)) {
            this.listGroupWebData.level2 = listLevel2
          } else {
            this.listGroupWebData.level2 = []
            this.dropdown2.source = []
          }
        }
        for (let level = 2; level <= 5; level++) {
          this[`currentGroupWeb${level}`] = null;
        }
        this.UpdateProductPriceRequest(this.priceProduct, ['GroupID1', 'GroupID2', 'GroupID3', 'GroupID4', 'GroupID'])
        break;
      case 'GroupID2':
        this.priceProduct.GroupID3 = null
        this.priceProduct.GroupID4 = null
        this.priceProduct.GroupID = null
        if (event.Code == null) {
          this.priceProduct.GroupID2 = null
          this.currentGroupWeb2 = null
        }
        else {
          this.priceProduct.GroupID2 = event.Code
          const listLevel3 = this.listGroupWeb.filter(s => s.ParentID == event.Code)
          this.currentGroupWeb2 = event
          if (Ps_UtilObjectService.hasListValue(listLevel3)) {
            this.listGroupWebData.level3 = listLevel3
          } else {
            this.listGroupWebData.level3 = []
            this.dropdown3.source = []
          }
        }
        for (let level = 3; level <= 5; level++) {
          this[`currentGroupWeb${level}`] = null;
        }
        this.UpdateProductPriceRequest(this.priceProduct, ['GroupID2', 'GroupID3', 'GroupID4', 'GroupID'])
        break;
      case 'GroupID3':
        this.priceProduct.GroupID4 = null
        this.priceProduct.GroupID = null
        if (event.Code == null) {
          this.priceProduct.GroupID3 = null
          this.currentGroupWeb3 = null
        }
        else {
          this.priceProduct.GroupID3 = event.Code
          const listLevel4 = this.listGroupWeb.filter(s => s.ParentID == event.Code)
          this.currentGroupWeb3 = event
          if (Ps_UtilObjectService.hasListValue(listLevel4)) {
            this.listGroupWebData.level4 = listLevel4
          } else {
            this.listGroupWebData.level4 = []
            this.dropdown4.source = []
          }
        }
        this.currentGroupWeb4 = null
        this.currentGroupWeb5 = null
        this.UpdateProductPriceRequest(this.priceProduct, ['GroupID3', 'GroupID4', 'GroupID'])
        break;
      case 'GroupID4':
        this.priceProduct.GroupID = null
        if (event.Code == null) {
          this.priceProduct.GroupID4 = null
          this.currentGroupWeb4 = null
        }
        else {
          this.priceProduct.GroupID4 = event.Code
          const listLevel5 = this.listGroupWeb.filter(s => s.ParentID == event.Code)
          this.currentGroupWeb4 = event

          if (Ps_UtilObjectService.hasListValue(listLevel5)) {
            this.listGroupWebData.level5 = listLevel5
          } else {
            this.listGroupWebData.level5 = []
            this.dropdown5.source = []
          }

        }
        this.currentGroupWeb5 = null
        this.UpdateProductPriceRequest(this.priceProduct, ['GroupID4', 'GroupID'])
        break;
      case 'GroupID':
        this.priceProduct.GroupID = event.Code;
        this.currentGroupWeb5 = event
        this.UpdateProductPriceRequest(this.priceProduct, ['GroupID'])
        break;
      default:
        break;
    }
  }

  // Lưu giá trị của checkbox
  onCheckBoxChange(event, item, list) {
    if (event.target.checked) {
      item.IsSelected = true
      if (item.Code == -1 || item.WHName == 'Tất cả') {
        list.forEach(s => {
          if (Ps_UtilObjectService.hasListValue(s.ListChild)) {
            s.ListChild.forEach(c => {
              c.IsSelected = true
            })
          }
        })
      }
      else {
        let allSelected = true;
        list.forEach(s => {
          if (Ps_UtilObjectService.hasListValue(s.ListChild)) {
            for (let i = 0; i < s.ListChild.length; i++) {
              if (s.ListChild[i].Code != -1 && s.ListChild[i].WHName != 'Tất cả' && s.ListChild[i].IsSelected == false) {
                allSelected = false;
                break;
              }
            }
            if (allSelected) {
              for (let i = 0; i < s.ListChild.length; i++) {
                if (s.ListChild[i].Code == -1 || s.ListChild[i].WHName == 'Tất cả') {
                  s.ListChild[i].IsSelected = true;
                }
              }
            }
          }
        })

      }
    }
    else {
      item.IsSelected = false
      if (item.Code == -1 || item.WHName == 'Tất cả') {
        list.forEach(s => {
          if (Ps_UtilObjectService.hasListValue(s.ListChild)) {
            s.ListChild.forEach(c => {
              c.IsSelected = false
            })
          }
        })
      }

      if (Ps_UtilObjectService.hasListValue(item.ListChild)) {
        item.ListChild.forEach(s => {
          s.IsSelected = false
        })
      } else {
        if (item.Code !== -1 || item.WHName !== 'Tất cả') {
          list.forEach(s => {
            if (Ps_UtilObjectService.hasListValue(s.ListChild)) {
              s.ListChild[0].IsSelected = false
            }
          })
        }
      }
    }
    this.priceProduct.WithoutConfig = JSON.stringify(list)
    this.UpdateProductPriceRequest(this.priceProduct, ['WithoutConfig']);

  }
  // Lấy thông tin sản phẩm
  onBlurTextboxByBarcode() {
    if (Ps_UtilObjectService.hasValueString(this.priceProduct.Barcode)) {
      this.priceProduct.Barcode = this.priceProduct.Barcode.replace(/\s+/g, '');
      this.GetProductPriceRequestByCode(this.priceProduct.Barcode, this.supplierProduct.Code)
    }
  }



  onBlurTextbox(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      if (prop == 'Bid' || prop == 'VATIn' || prop == 'UnitPrice' || prop == 'VATOut') {
        //Tính giá mua +VAT
        if (Ps_UtilObjectService.hasValueString(this.priceProduct.Bid)) {
          if (Ps_UtilObjectService.hasValueString(this.priceProduct.VATIn)) {
            const bid = this.priceProduct.Bid
            const VatIn = this.priceProduct.VATIn
            this.currentPurchasePrice = bid + ((bid * VatIn) / 100)
          } else {
            this.currentPurchasePrice = this.priceProduct.Bid
          }
        }
        //tính giá bán +VAT
        if (Ps_UtilObjectService.hasValueString(this.currentSalePrice)) {
          if (Ps_UtilObjectService.hasValueString(this.priceProduct.VATOut)) {
            const VatOut = this.priceProduct.VATOut
            this.priceProduct.UnitPrice = this.currentSalePrice / (1 + VatOut / 100)
          }
          else {
            this.priceProduct.UnitPrice = this.currentSalePrice
          }
        }

        // const margin = (((this.priceProduct.UnitPrice - this.priceProduct.Bid)/ this.priceProduct.UnitPrice)*100)
        // // console.log(margin)
        // if(!isNaN(margin) && isFinite(margin)){
        //   if ( margin % 1 !== 0) {
        //     // Nếu có số dư, sử dụng
        //     this.priceProduct.Margin = parseFloat(margin.toFixed(2))
        //   } else {
        //     // Nếu không có số dư, không sử dụng
        //     this.priceProduct.Margin =  margin
        //   }
        // }else{
        //   this.priceProduct.Margin =  null
        // }
      }


      switch (prop) {
        default:
          let moreProp = ''
          if (!Ps_UtilObjectService.hasValueString(this.priceProduct.Barcode)) {
            this.layoutService.onError("Barcode không được để trống")
          } else if (!Ps_UtilObjectService.hasValueString(this.priceProduct.ProductName)) {
            this.layoutService.onError("Tên sản phẩm không được để trống")
          } else if (!Ps_UtilObjectService.hasValueString(this.priceProduct.TaxCode) && prop == 'TaxCode') {
            this.priceProduct.TaxName = ''
            moreProp = 'TaxName'
          } else if (prop == 'VATOut') {
            moreProp = 'UnitPrice'
          }

          if (Ps_UtilObjectService.hasValueString(moreProp)) {
            this.UpdateProductPriceRequest(this.priceProduct, [prop, moreProp]);
          }
          else {
            this.UpdateProductPriceRequest(this.priceProduct, [prop])
          }
      }
    }
  }

  //Cập nhật tình trạng sản phẩm
  onUpdateStatusRequest(statusID) {
    if (Ps_UtilObjectService.hasValue(this.priceProduct) && this.priceProduct.Code != 0) {
      this.UpdateProductPriceRequestStatus([this.priceProduct], statusID)
    }
  }

  onAddNewPriceProduct() {
    var newPriceProduct = new DTOProductPriceRequest();
    localStorage.setItem("PriceProduct", JSON.stringify(newPriceProduct))
    this.dropdownValueTM.selectedValue = null
    this.dropdownValueDT.selectedValue = null
    this.dropdownValuePur1.selectedValue = null
    this.dropdownValuePur2.selectedValue = null
    this.getProductPriceLocal();
  }


  onBlurDateFormTo(name: string, event) {
    if (name == 'POFrom') {
      const poFrom = new Date(this.priceProduct.POFrom)
      // const poTo = new Date(this.priceProduct.POTo)
      this.minDatePO = new Date(poFrom.getFullYear(), poFrom.getMonth(), poFrom.getDate() + 1)
      // if(poFrom >= poTo){
      //   this.priceProduct.POTo = new Date(poFrom.getFullYear(), poFrom.getMonth(), poFrom.getDate() + 31)
      //   this.UpdateProductPriceRequest(this.priceProduct,[name,'POTo'])
      // }else{
      //   this.UpdateProductPriceRequest(this.priceProduct,[name])
      // }

    }
    else if (name == 'StoreFrom') {
      const storeFrom = new Date(this.priceProduct.StoreFrom)
      // const storeTo = new Date(this.priceProduct.StoreTo)
      this.minDateStore = new Date(storeFrom.getFullYear(), storeFrom.getMonth(), storeFrom.getDate() + 1)
      // if(storeFrom >= storeTo){
      //   this.priceProduct.StoreTo = new Date(storeFrom.getFullYear(), storeFrom.getMonth(), storeFrom.getDate() + 31)
      //   this.UpdateProductPriceRequest(this.priceProduct,[name,'StoreTo'])
      // }else{
      //   this.UpdateProductPriceRequest(this.priceProduct,[name])
      // }
    }
    this.UpdateProductPriceRequest(this.priceProduct, [name])
  }

  onCheckboxDateChange(event, propName) {
    if (event.target.checked) {
      this.priceProduct.IsDate = true
    }
    else {
      this.priceProduct.IsDate = false
    }
    this.UpdateProductPriceRequest(this.priceProduct, [propName])
  }

  //#endregion


  //#region API
  currentPurchasePrice: number
  currentSalePrice: number
  listWithoutConfig: DTOPartnerProductWarehouse[] = []
  minDatePO = new Date()
  minDateStore = new Date()
  effDate = new Date();
  GetProductPriceRequest(dto: DTOProductPriceRequest, isLoadData: boolean = false) {
    this.loading = true
    this.priceRequestAPI.GetProductPriceRequest(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.priceProduct = res.ObjectReturn

        //kiểm tra TaxCode
        if (Ps_UtilObjectService.hasValueString(this.priceProduct.TaxCode) &&
          Ps_UtilObjectService.hasValue(this.priceProduct.TaxID) && this.priceProduct.TaxID > 0) {
          this.isLockTax = false
        }

        if (!Ps_UtilObjectService.hasValue(this.priceProduct.MinQuantity)) {
          this.priceProduct.MinQuantity = 0
        }

        //lấy danh sách hạn chế bán hàng
        if (Ps_UtilObjectService.hasValueString(res.ObjectReturn.WithoutConfig)) {
          this.listWithoutConfig = JSON.parse(res.ObjectReturn.WithoutConfig)
        }
        //tính giá mua + VAT
        if (Ps_UtilObjectService.hasValueString(res.ObjectReturn.Bid)) {
          if (Ps_UtilObjectService.hasValueString(res.ObjectReturn.VATIn)) {
            const bid = res.ObjectReturn.Bid
            const VatIn = res.ObjectReturn.VATIn
            this.currentPurchasePrice = bid + ((bid * VatIn) / 100)
          } else {
            this.currentPurchasePrice = res.ObjectReturn.Bid
          }
        }
        //tính giá bán
        if (Ps_UtilObjectService.hasValueString(res.ObjectReturn.UnitPrice)) {
          if (Ps_UtilObjectService.hasValueString(res.ObjectReturn.VATOut)) {
            const unitPrice = res.ObjectReturn.UnitPrice
            const VatOut = res.ObjectReturn.VATOut
            this.currentSalePrice = unitPrice + ((unitPrice * VatOut) / 100)
          }
          else {
            this.currentSalePrice = res.ObjectReturn.UnitPrice
          }
        }

        //format date
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn.POFrom) && Ps_UtilObjectService.hasValue(res.ObjectReturn.POTo) ||
          Ps_UtilObjectService.hasValue(res.ObjectReturn.StoreFrom) && Ps_UtilObjectService.hasValue(res.ObjectReturn.StoreTo)
        ) {
          this.priceProduct.POFrom = new Date(res.ObjectReturn.POFrom)
          this.priceProduct.POTo = new Date(res.ObjectReturn.POTo)
          this.minDatePO = new Date(this.priceProduct.POFrom.getFullYear(), this.priceProduct.POFrom.getMonth(), this.priceProduct.POFrom.getDate() + 1)
          this.priceProduct.StoreFrom = new Date(res.ObjectReturn.StoreFrom)
          this.priceProduct.StoreTo = new Date(res.ObjectReturn.StoreTo)
          this.minDateStore = new Date(this.priceProduct.StoreFrom.getFullYear(), this.priceProduct.StoreFrom.getMonth(), this.priceProduct.StoreFrom.getDate() + 1)

        }
        else {
          var minDate = new Date(this.effDate.getFullYear(), this.effDate.getMonth(), this.effDate.getDate() + 1)
          this.minDatePO = minDate
          this.minDateStore = minDate
        }


        //phân quyền
        this.isLock = res.ObjectReturn.StatusID === 2 || this.statusPrice === 3 || this.statusPrice === 2 ||
          (res.ObjectReturn.StatusID === 0 && this.isApprover && !this.isCreator) ||
          (res.ObjectReturn.StatusID === 3 && this.isCreator && !this.isApprover) ||
          (this.isApprover && this.isCreator === false);

        if (isLoadData) {
          this.getData()
        }
        //end
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Sản phẩm báo giá:  ${res.ErrorString}`)
      }

      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Sản phẩm báo giá:  ${err}`)
    })
  }


  currentBaseUnit: any
  currentBuyerUnit: any
  getListPackingUnit(propName, firstLoad: boolean = false) {
    this.loading = true
    this.loadFilterPackingUnit(propName, firstLoad)
    this.configHamperAPI.GetListPackingUnit(this.gridStatePackingUnit).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (propName == 'BaseUnit') {
          this.filteredBaseUnitList = res.ObjectReturn.Data
          if (Ps_UtilObjectService.hasValue(this.priceProduct.BaseUnit)) {
            this.currentBaseUnit = this.filteredBaseUnitList.find(s => s.Code == this.priceProduct.BaseUnit)

          }
        } else {
          this.filteredBuyerUnitList = res.ObjectReturn.Data
          if (Ps_UtilObjectService.hasValue(this.priceProduct.BuyerUnit)) {
            this.currentBuyerUnit = this.filteredBuyerUnitList.find(s => s.Code == this.priceProduct.BuyerUnit)
            //trường hợp có code nhưng lại filter list lại không có
            if (!Ps_UtilObjectService.hasValue(this.currentBuyerUnit)) {
              if (Ps_UtilObjectService.hasListValue(this.filteredBaseUnitList)) {
                this.currentBuyerUnit = this.filteredBaseUnitList.find(s => s.Code == this.priceProduct.BuyerUnit)
                var arrTemp = []
                if (Ps_UtilObjectService.hasValue(this.currentBuyerUnit)) {
                  arrTemp.push(this.currentBuyerUnit)
                }
                this.filteredBuyerUnitList = [...arrTemp, ...this.filteredBuyerUnitList]
              }
            }

          }
        }

      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Đơn vị sản phẩm: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Đơn vị sản phẩm: ${err}`);
      this.loading = false
    })
  }

  listCurrency: any[] = []
  currencyIn: any
  currencyOut: any
  currencyAvg: any
  getListCurrency() {
    this.loading = true
    this.configHamperAPI.GetListCurrency().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCurrency = res.ObjectReturn
        // this.currency = res.ObjectReturn.filter(s => s.OrderBy = 0)
        if (Ps_UtilObjectService.hasValue(this.priceProduct.CurrencyIn)) {
          this.currencyIn = this.listCurrency.find(s => s.Code == this.priceProduct.CurrencyIn)

        }

        if (Ps_UtilObjectService.hasValue(this.priceProduct.CurrencyOut)) {
          this.currencyOut = this.listCurrency.find(s => s.Code == this.priceProduct.CurrencyOut)

        }


        if (Ps_UtilObjectService.hasValue(this.priceProduct.CurrencyAvg)) {
          this.currencyAvg = this.listCurrency.find(s => s.Code == this.priceProduct.CurrencyAvg)
        }

      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${err}`)
    })
  }

  listCommercialTerm: any[] = []
  commercialTerm: any
  getListCommercialTerm() {
    this.loading = true
    this.priceRequestAPI.GetListCommercialTerm().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCommercialTerm = res.ObjectReturn.Data
        if (Ps_UtilObjectService.hasValue(this.priceProduct.CommercialTerm)) {
          this.commercialTerm = this.listCommercialTerm.find(s => s.Code == this.priceProduct.CommercialTerm)
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Điều kiện Thương mại:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Điều kiện Thương mại:  ${err}`)
    })
  }

  listGroupWeb: DTOConfGroup[] = []
  listGroupWebData: { [key: string]: DTOConfGroup[] } = {};
  currentGroupWeb1: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb2: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb3: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb4: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb5: { [key: number]: DTOConfGroup } = {};
  gridStateGroup: State = {
    filter: { filters: [], logic: 'and' },
  }

  getListGroupWeb(state: State) {
    this.configHamperAPI.GetListGroup(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        const flatData = res.ObjectReturn.Data
        for (let level = 1; level <= 5; level++) {
          this.listGroupWebData[`level${level}`] = flatData.filter(item => item.Level == level)
        }

        // lấy item bằng với groupID của product
        const findMatchingItem = (level: number) => {
          const levelData = this.listGroupWebData[`level${level}`];
          const groupIDKey = level === 5 ? 'GroupID' : `GroupID${level}`;
          const matchingItem = levelData.find(s => {
            return s.Code === this.priceProduct[groupIDKey]
          });
          return matchingItem;
        };
        for (let level = 1; level <= 5; level++) {
          this[`currentGroupWeb${level}`] = findMatchingItem(level);
        }

        for (let i = 2; i <= 5; i++) {
          const levelKey = `level${i}`;
          const parentGroupKey = `currentGroupWeb${i - 1}`;
          if (Ps_UtilObjectService.hasValue(this[parentGroupKey])) {
            this.listGroupWebData[levelKey] = flatData.filter(item => item.ParentID == this[parentGroupKey].Code);
            // console.log(this.listGroupWebData[levelKey])
            if (this.listGroupWebData[levelKey].length == 0) {
              // console.log(levelKey)
              this.listGroupWebData[levelKey] = []

            }
          }
        }

        //   if(Ps_UtilObjectService.hasValue(this.currentGroupWeb2) && Ps_UtilObjectService.hasValue(this.currentGroupWeb1) &&
        //   this.currentGroupWeb2['ParentID'] != this.currentGroupWeb1['Code']){
        //    this.priceProduct.GroupID2 = null
        //    this.priceProduct.GroupID3 = null
        //    this.priceProduct.GroupID4 = null
        //    this.priceProduct.GroupID = null
        //    this.UpdateProductPriceRequest(this.priceProduct,['GroupID2','GroupID3','GroupID4','GroupID'],false)
        //  }
        //  else if(Ps_UtilObjectService.hasValue(this.currentGroupWeb3) && Ps_UtilObjectService.hasValue(this.currentGroupWeb2) &&
        //  this.currentGroupWeb3['ParentID'] != this.currentGroupWeb2['Code']){
        //   this.priceProduct.GroupID3 = null
        //   this.priceProduct.GroupID4 = null
        //   this.priceProduct.GroupID = null
        //   this.UpdateProductPriceRequest(this.priceProduct,['GroupID3','GroupID4','GroupID'],false)
        //  }
        //  else if(Ps_UtilObjectService.hasValue(this.currentGroupWeb4) && Ps_UtilObjectService.hasValue(this.currentGroupWeb3) &&
        //  this.currentGroupWeb4['ParentID'] != this.currentGroupWeb3['Code']){
        //    this.priceProduct.GroupID4 = null
        //    this.priceProduct.GroupID = null
        //   this.UpdateProductPriceRequest(this.priceProduct,['GroupID4','GroupID'],false)
        //  }
        //  else if(Ps_UtilObjectService.hasValue(this.currentGroupWeb5) && Ps_UtilObjectService.hasValue(this.currentGroupWeb4) &&
        //    this.currentGroupWeb5['ParentID'] != this.currentGroupWeb4['Code']){
        //    this.priceProduct.GroupID = null
        //   this.UpdateProductPriceRequest(this.priceProduct,['GroupID'],false)
        //  }



        this.listGroupWeb = flatData

      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy phân nhóm:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy phân nhóm:  ${err}`)
    })
  }



  UpdateProductPriceRequest(dto: DTOProductPriceRequest, prop: string[], hasNotice: boolean = true) {
    let ctx = `Cập nhật thông tin chi tiết Sản phẩm báo giá`
    this.loading = true;
    this.priceRequestAPI.UpdateProductPriceRequest(dto, prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (hasNotice) {
          if (dto.Code == 0) {
            this.priceProduct.Code = res.ObjectReturn.Code
          }
          for (let i = 0; i <= 4; i++) {
            if (i <= 4) {
              this.priceProduct[`GroupID${i}`] = res.ObjectReturn[`GroupID${i}`];
            }
            this.priceProduct[`GroupName${i + 1}`] = res.ObjectReturn[`GroupName${i + 1}`];
          }
          this.priceProduct.TypeDataName = res.ObjectReturn.TypeDataName
          this.priceProduct.TaxID = res.ObjectReturn.TaxID
          this.priceProduct.TaxName = res.ObjectReturn.TaxName
          this.priceProduct.MarginAmount = res.ObjectReturn.MarginAmount
          this.priceProduct.Margin = res.ObjectReturn.Margin
          this.layoutService.onSuccess(`${ctx} Thành công`)
        }
      } else {
        if (prop.length == 0) {
          this.onAddNewPriceProduct();
        }
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }

  UpdateProductPriceRequestStatus(items: DTOProductPriceRequest[] = [this.priceProduct], statusID = this.priceProduct.StatusID) {
    this.loading = true
    var ctx = 'Cập nhật tình trạng'
    this.priceRequestAPI.UpdateProductPriceRequestStatus(items, statusID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.GetProductPriceRequest(this.priceProduct, false)
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    }
    )
  }

  GetProductPriceRequestByCode(barcode: string, Code: number) {
    this.loading = true
    this.priceRequestAPI.GetProductPriceRequestByCode(barcode, Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValueString(res.ObjectReturn.WithoutConfig)) {
          this.listWithoutConfig = JSON.parse(res.ObjectReturn.WithoutConfig)
        }
        //format date
        //   if (Ps_UtilObjectService.hasValue(res.ObjectReturn.POFrom) || Ps_UtilObjectService.hasValue(res.ObjectReturn.POTo)||
        //   Ps_UtilObjectService.hasValue(res.ObjectReturn.StoreFrom) || Ps_UtilObjectService.hasValue(res.ObjectReturn.StoreTo)
        //  ){
        //        res.ObjectReturn.POFrom = new Date(res.ObjectReturn.POFrom)
        //        res.ObjectReturn.POTo = new Date(res.ObjectReturn.POTo)
        //        res.ObjectReturn.StoreFrom = new Date(res.ObjectReturn.StoreFrom)
        //        res.ObjectReturn.StoreTo = new Date(res.ObjectReturn.StoreTo)
        //        const poTo = new Date(poFrom.getFullYear(), poFrom.getMonth(), poFrom.getDate() + 31)
        //        // var newItem = new DTOProductPriceRequest()
        //          res.ObjectReturn.StoreFrom = poFrom
        //          res.ObjectReturn.StoreTo = poTo
        //          res.ObjectReturn.POFrom = poFrom
        //          res.ObjectReturn.POTo = poTo
        //  }
        const minDate = this.effDate
        this.minDateStore = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + 1)
        this.minDatePO = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + 1)
        this.priceProduct = res.ObjectReturn
        this.isLock = false
        this.getData();

        if (Ps_UtilObjectService.hasValueString(this.priceProduct.Barcode)) {
          if (!(Ps_UtilObjectService.hasValue(this.priceProduct.Bid) && this.priceProduct.Bid > 0)) {
            if (Ps_UtilObjectService.hasValue(this.priceProduct.LastBid) && this.priceProduct.LastBid > 0)
              this.priceProduct.Bid = this.priceProduct.LastBid
            else
              this.priceProduct.Bid = 1
          }

          // Tính margin
          // if(Ps_UtilObjectService.hasValue(this.priceProduct.Margin)){
          //   this.priceProduct.Margin = Math.ceil(this.priceProduct.Margin)
          // }else{
          //   const margin = ((( this.priceProduct.UnitPrice -  this.priceProduct.Bid)/  this.priceProduct.UnitPrice)*100)
          //   //set %
          //   if(!isNaN(margin) && isFinite(margin)){
          //       if ( margin % 1 !== 0) {
          //         this.priceProduct.Margin = parseFloat(margin.toFixed(2))
          //       } else {
          //         this.priceProduct.Margin =  margin
          //       }
          //   }else{
          //       this.priceProduct.Margin =  null
          //   }
          // }
          //tính giá mua + VAT
          if (Ps_UtilObjectService.hasValueString(this.priceProduct.Bid) && Ps_UtilObjectService.hasValueString(this.priceProduct.VATIn)) {
            const bid = this.priceProduct.Bid
            const VatIn = this.priceProduct.VATIn
            this.currentPurchasePrice = bid + ((bid * VatIn) / 100)
          }
          //tính giá bán
          if (Ps_UtilObjectService.hasValueString(this.priceProduct.UnitPrice) && Ps_UtilObjectService.hasValueString(this.priceProduct.VATOut)) {
            const unitPrice = this.priceProduct.UnitPrice
            const VatOut = this.priceProduct.VATOut
            this.currentSalePrice = unitPrice + ((unitPrice * VatOut) / 100)
          }

          this.UpdateProductPriceRequest(this.priceProduct, [])
        }


        //end
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Sản phẩm:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Sản phẩm:  ${err}`)
    })
  }


  DeleteProductPriceRequest(dto: DTOProductPriceRequest[]) {
    this.loading = true;
    var ctx = `Sản phẩm báo giá`
    this.priceRequestAPI.DeleteProductPriceRequest(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (res.StatusCode == 0) {
        this.layoutService.onSuccess(`Xóa thành công ${ctx}`);
        this.closeDialog()
        this.onAddNewPriceProduct();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${res.ErrorString}!`)
      }
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${error}!`);
      this.loading = false;
    }
    );
  }

  //#endregion


  // Unsubcribe
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }
}
