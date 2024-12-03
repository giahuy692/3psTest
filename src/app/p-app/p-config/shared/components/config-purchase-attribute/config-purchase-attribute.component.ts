import { ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DTOChangeHistory } from '../../dto/DTOConfChangeHistory';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { ConfigService } from '../../services/config.service';
import { DTODetailConfProduct } from '../../dto/DTOConfProduct';
import { takeUntil } from 'rxjs/operators';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { ConfigAPIService } from '../../services/config-api.service';
import { EcomAPIService } from 'src/app/p-app/p-ecommerce/shared/services/ecom-api.service';
import { DTOSupplier } from 'src/app/p-app/p-purchase/shared/dto/DTOSupplier';
import { PurSupplierApiServiceService } from 'src/app/p-app/p-purchase/shared/services/pur-supplier-api.service.service';
import { PurPriceRequestApiService } from 'src/app/p-app/p-purchase/shared/services/pur-price-request-api.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-config-purchase-attribute',
  templateUrl: './config-purchase-attribute.component.html',
  styleUrls: ['./config-purchase-attribute.component.scss']
})
export class ConfigPurchaseAttributeComponent {
  @Input() disable = false

  //Lịch sử thay đổi NCC
  @ViewChild('customSupplierTemplate', { static: true }) customSupplierTemplate: TemplateRef<any>;
  @ViewChild('customEffectiveTemplate', { static: true }) customEffectiveTemplate: TemplateRef<any>;
  @ViewChild('customBillTemplate', { static: true }) customBillTemplate: TemplateRef<any>;
  //Lịch sử thay đổi giá mua hàng
  @ViewChild('customPurchaseTemplate', { static: true }) customPurchaseTemplate: TemplateRef<any>;
  @ViewChild('customPurchasePriceTemplate', { static: true }) customPurchasePriceTemplate: TemplateRef<any>;
  @ViewChild('customPurchaseEffectiveTemplate', { static: true }) customPurchaseEffectiveTemplate: TemplateRef<any>;

  titleSupplier: string = 'LỊCH SỬ THAY ĐỔI NHÀ CUNG CẤP'
  titlePurchase: string = 'LỊCH SỬ THAY ĐỔI GIÁ MUA HÀNG'
  showPopupSupplier: boolean = false;
  showPopupPurchase: boolean = false;

  selectedSupplier = new DTOSupplier();
  selectedShipper: any

  Item = {
    Barcode: '',
    ProductName: '',
    ImageThum: ''
  }
  columnConfigSupplier: any[] = [];

  columnConfigPurchase: any[] = [];

  ngUnSubcribes = new Subject<void>();

  loading = false
  total = 0;
  gridViewHTNCC = new Subject<any>();
  gridViewHTPS = new Subject<any>();
  listChangeHistory: DTOChangeHistory[] = []
  product = new DTODetailConfProduct()

  constructor(
    public apiService: ConfigHamperApiService,
    public hamperService: ConfigHamperService,
    public configAPIService: ConfigAPIService,
    public layoutService: LayoutService,
    public service: ConfigService,
    public ecomAPIService: EcomAPIService,
    public purAPIService: PurSupplierApiServiceService,
    public menuService: PS_HelperMenuService,
    public priceRequestAPI: PurPriceRequestApiService,
  ) { }

  ngOnInit(): void {
    // this.getProduct();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnSubcribes)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getProduct();
      }
    })
  }



  getProduct() {
    this.hamperService.getHamperRequest().pipe(takeUntil(this.ngUnSubcribes)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.product = res
        this.disable = this.product['isApprover'] && this.product['isCreator'] ? false : this.product['isApprover'] ? true : false;
        // console.log(this.product)
        this.getAllData()

      }
    })
  }


  getAllData() {
    this.getListCurrency();
    this.getListCommercialTerm();
    this.GetAllShippers();
    this.GetListSupplierTree();
  }

  listShipper: any[] = []
  GetAllShippers() {
    this.loading = true
    this.ecomAPIService.GetAllShippers().pipe(takeUntil(this.ngUnSubcribes)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listShipper = res.ObjectReturn
        if (Ps_UtilObjectService.hasValue(this.product.Shipper)) {
          this.selectedShipper = this.listShipper.find(s => s.Code == this.product.Shipper)
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Shipper:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Shipper:  ${err}`)
    })
  }

  listSupplier: DTOSupplier[] = []
  GetListSupplierTree() {
    let ctx = `Lấy danh sách Đối tác`
    this.loading = true;
    this.purAPIService.GetListSupplierTree().pipe(takeUntil(this.ngUnSubcribes)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listSupplier = res.ObjectReturn
        if (Ps_UtilObjectService.hasValue(this.product.Supplier)) {
          this.selectedSupplier = this.listSupplier.find(s => s.Code == this.product.Supplier)
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }


  GetListChangeHistory(Code: number, TypeData: number) {
    this.loading = true;
    this.apiService.GetListChangeHistory(Code, TypeData).pipe(takeUntil(this.ngUnSubcribes)).subscribe(res => {
      if (res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn)) {
          this.listChangeHistory = res.ObjectReturn;
          this.total = res.ObjectReturn.length;
          if (TypeData == 2) {
            this.gridViewHTNCC.next({ data: this.listChangeHistory, total: this.total })
          } else {
            this.gridViewHTPS.next({ data: this.listChangeHistory, total: this.total })
          }
        }
      } else {
        if (TypeData == 1) {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy Lịch sử thay đổi NCC: ${res.ErrorString}`)
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy Lịch sử thay đổi giá mua hàng: ${res.ErrorString}`)
        }

      }

      this.loading = false;
    }, (error) => {
      this.loading = false
      if (TypeData == 0) {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Lịch sử thay đổi NCC: ${error}`)
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Lịch sử thay đổi giá mua hàng: ${error}`)
      }
    })
  }

  listCurrency: any[] = []
  currencyIn: any
  currencyOut: any
  currencyAvg: any
  getListCurrency() {
    this.loading = true
    this.apiService.GetListCurrency().pipe(takeUntil(this.ngUnSubcribes)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCurrency = res.ObjectReturn
        // this.currency = res.ObjectReturn.filter(s => s.OrderBy = 0)
        if (Ps_UtilObjectService.hasValue(this.product.CurrencyIn)) {
          this.currencyIn = this.listCurrency.find(s => s.Code == this.product.CurrencyIn)
        }

        if (Ps_UtilObjectService.hasValue(this.product.CurrencyAvg)) {
          this.currencyAvg = this.listCurrency.find(s => s.Code == this.product.CurrencyAvg)
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
    this.priceRequestAPI.GetListCommercialTerm().pipe(takeUntil(this.ngUnSubcribes)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCommercialTerm = res.ObjectReturn.Data
        if (Ps_UtilObjectService.hasValue(this.product.CommercialTerm)) {
          this.commercialTerm = this.listCommercialTerm.find(s => s.Code == this.product.CommercialTerm)
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

  updateProduct(prop: string[], product = this.product) {
    this.loading = true
    this.configAPIService.UpdateProduct(product, prop).pipe(takeUntil(this.ngUnSubcribes)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess("Cập nhật thành công thuộc tính Mua hàng của Sản phẩm")
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thuộc tính Mua hàng của Sản phẩm:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thuộc tính Mua hàng của Sản phẩm:  ${err}`)
    })
  }

  onBlurTextbox(propName: string) {
    if (Ps_UtilObjectService.hasValueString(propName)) {
      switch (propName) {
        default:
          this.updateProduct([propName], this.product)
          break
      }
    }
  }

  valueChange(e, sellName: string) {
    switch (sellName) {
      default:
        if (e.target.checked)
          this.product[sellName] = true
        else
          this.product[sellName] = false
        this.updateProduct([sellName], this.product)
        break;
    }

  }


  //value change
  onDropdownlistClick(event, propName: string[]) {
    switch (propName[0]) {
      case 'Supplier':
        this.product.Supplier = event.Code;
        this.updateProduct(propName, this.product);
        break;
      case 'Shipper':
        this.product.Shipper = event.Code;
        this.updateProduct(propName, this.product);
        break;
    }
  }

  //Popup Lịch sử thay đổi NCC
  OpenDialogNCC() {
    this.GetListChangeHistory(this.product.Code, 2)
    this.columnConfigSupplier = [
      { title: 'Nhà cung cấp', class: 'col_1', field: 'PartnerName', cellTemplate: this.customSupplierTemplate },
      { title: 'Thời gian hiệu lực', class: 'col_2', field: 'EffectiveTo', cellTemplate: this.customEffectiveTemplate },
      { title: 'Đơn hàng cuối cùng', class: 'col_3', field: 'LastPO', cellTemplate: this.customBillTemplate },
    ]
    this.Item = {
      Barcode: this.product.Barcode,
      ProductName: this.product.ProductName,
      ImageThum: this.product.ImageSetting,
    }
    this.showPopupSupplier = true;

  }
  closeDialog() {
    this.showPopupSupplier = false;
    this.showPopupPurchase = false;
  }
  //Popup Lịch sử thay đổi giá mua hàng
  OpenDialogPurchase() {
    this.GetListChangeHistory(this.product.Code, 1)
    this.columnConfigPurchase = [
      { title: 'Nhà cung cấp', class: 'col_1', field: 'PartnerName', cellTemplate: this.customPurchaseTemplate },
      { title: 'Giá mua hàng', class: 'col_2', field: 'BuyedPrice', cellTemplate: this.customPurchasePriceTemplate },
      { title: 'Ngày hiệu lực', class: 'col_3', field: 'EffDate', cellTemplate: this.customPurchaseEffectiveTemplate },
    ]
    this.Item = {
      Barcode: this.product.Barcode,
      ProductName: this.product.ProductName,
      ImageThum: this.product.ImageSetting,
    }
    this.showPopupPurchase = true;
  }

  checkTodate(data) {
    const today = new Date().toISOString().split('T')[0];
    const day = new Date(data).toISOString().split('T')[0];
    if (day == today) {
      return true
    } else {
      return false
    }
  }


  ngOnDestroy(): void {
    this.ngUnSubcribes.next();
    this.ngUnSubcribes.complete();
  }
}
