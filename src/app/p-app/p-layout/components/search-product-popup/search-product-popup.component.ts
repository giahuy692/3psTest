import { Component, OnInit, ViewChild } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LayoutAPIService } from '../../services/layout-api.service';
import { State, FilterDescriptor } from '@progress/kendo-data-query';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOProduct } from '../../dto/DTOProduct.dto';
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { DTOOrderDetail } from 'src/app/p-app/p-ecommerce/shared/dto/DTOOrderDetail';
import { MarStoreSystemAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-store-system-api.service';
import { DTOMAStore } from 'src/app/p-app/p-marketing/shared/dto/DTOMAStore.dto';

@Component({
  selector: 'app-search-product-popup',
  templateUrl: './search-product-popup.component.html',
  styleUrls: ['./search-product-popup.component.scss']
})
export class SearchProductPopupComponent implements OnInit {
  isOpen = false
  loading = false
  justLoad = true
  //product
  productList: DTOProduct[] = []
  currentProduct = new DTOProduct()
  productWebInCart = new DTOProduct()
  //warehouse
  warehouseIDList: number[] = [8, 7, 6, 5, 4, 3, 2, 1]
  warehouseStockList: DTOOrderDetail[] = []
  totalStock: number = 0
  //kendo
  pageSize: number = 50
  gridStateWH: State = { take: this.pageSize, filter: { filters: [], logic: 'and' } };
  gridDSState: State
  query: string = ''

  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterVNName: FilterDescriptor = {
    field: "VNName", operator: "contains", value: null
  }
  filterPoscode: FilterDescriptor = {
    field: "Poscode", operator: "contains", value: null
  }
  //element
  @ViewChild("combobox", { static: true }) combobox: ComboBoxComponent;

  constructor(public layoutService: LayoutService,
    public apiService: LayoutAPIService,
    public apiServiceMar: MarStoreSystemAPIService,) { }

  ngOnInit(): void {
  }
  //LOAD
  loadFilter() {
    this.gridDSState = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState.sort = null
    this.gridDSState.take = 25
    this.gridDSState.filter.logic = 'or'
    this.gridDSState.filter.filters = []

    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.gridDSState.filter.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterVNName.value))
      this.gridDSState.filter.filters.push(this.filterVNName)

    if (Ps_UtilObjectService.hasValueString(this.filterPoscode.value))
      this.gridDSState.filter.filters.push(this.filterPoscode)
  }
  getProductList(e) {//keydown.enter
    this.filterBarcode.value = this.query
    this.filterVNName.value = this.query
    this.filterPoscode.value = this.query
    this.loadFilter()
    this.p_GetListProduct();
  }
  getProductByCode(e: DTOProduct) {//selection change
    if (Ps_UtilObjectService.hasValue(e)) {
      this.currentProduct = e
      this.p_GetProductByCode()
      this.GetWebInCart()
      this.getWarehouseStockList()
    }
  }
  getWarehouseStockList() {
    this.warehouseStockList = []

    this.warehouseIDList.forEach(i => {
      this.p_GetStockInWareHouse(i)
    })
  }
  calculateTotalStock() {
    this.totalStock = this.totalStock = this.warehouseStockList.filter(s => Ps_UtilObjectService.hasValue(s)
      && Ps_UtilObjectService.hasValue(s?.Stock)).reduce((a, b) => a + b.Stock, 0)
  }
  //API
  getListStore() {
    this.loading = true;
    var ctx = 'Danh sách cửa hàng';

    this.apiServiceMar.GetListStore(this.gridStateWH).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var listStore: DTOMAStore[] = res.ObjectReturn.Data;
        //this.warehouseIDList = 
        listStore.map((e) => {
          if (!this.warehouseIDList.includes(e.Code))
            this.warehouseIDList.push(e.Code)

          return e.Code
        });

        //this.gridView.next({ data: this.listStore, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  p_GetListProduct() {
    this.loading = true
    var ctx = 'Tìm sản phẩm'

    this.apiService.GetListProduct(this.gridDSState).subscribe(res => {
      if (res != null && res.StatusCode == 0) {
        this.productList = res.ObjectReturn.Data
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại`)

      this.loading = false
    }, () => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    })
  }
  p_GetProductByCode() {
    this.loading = true
    var ctx = 'Lấy thông tin sản phẩm'

    this.apiService.GetProductByCode(this.currentProduct.Code).subscribe(res => {
      if (res != null && res.StatusCode == 0) {
        this.currentProduct = res.ObjectReturn
        this.layoutService.onError(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại`)

      this.loading = false
    }, () => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    })
  }
  p_GetStockInWareHouse(warehouse: number) {
    this.loading = true

    this.apiService.GetStockInWareHouse(this.currentProduct.Barcode, warehouse).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0 && Ps_UtilObjectService.hasValue(res.ObjectReturn[0])) {
        //nếu chưa có trong list thì add
        if (this.warehouseStockList.find(s => s.Warehouse == res.ObjectReturn[0].Warehouse) == undefined) {
          this.warehouseStockList.push(res.ObjectReturn[0] as DTOOrderDetail)
          this.calculateTotalStock()
        }
      }
      this.loading = false
    }, () => {
      this.loading = false
    })
  }
  GetWebInCart() {
    this.loading = true

    this.apiService.GetWebInCart(this.currentProduct.Barcode).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0
        && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
        this.productWebInCart = res.ObjectReturn
      }
      this.loading = false
    }, () => {
      this.loading = false
    })
  }
  //KENDO EVENT
  filterChange(e) {
    this.toggleCombobox(e)
  }
  valueChange(e: DTOProduct) {
    if (Ps_UtilObjectService.hasValue(e)) {
      this.query = e.Barcode
    }
  }
  //parse customValue thành object cho combobox dùng
  valueNormalizer = (text: Observable<string>) =>
    text.pipe(
      map((content: string) => {
        return {
          Code: 0,
          Barcode: content,
          VNName: content,
          Poscode: content
        } as DTOProduct
      })
    );
  //CLICK EVENT
  toggleCombobox(e) {
    if (!this.combobox.isOpen)
      this.combobox.toggle(true)
  }
  closeDialog() {
    this.layoutService.setSearchProductDialog(false)
  }
  //AUTO RUN
  isDialogOpen() {
    var isopen = this.layoutService.getSearchProductDialog()

    if (isopen && this.justLoad) {
      this.justLoad = false
      this.getListStore()
      // this.currentProduct = new DTOProduct()
    }

    return isopen
  }
}
