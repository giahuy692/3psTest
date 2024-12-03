import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PurSupplierApiServiceService } from '../../shared/services/pur-supplier-api.service.service';
import { DTOChangHitory, DTOHitory, DTOPartnerProduct } from '../../shared/dto/DTOPartnerProduct.dto';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import { PurService } from '../../shared/services/pur.service';
import { DTOSupplier } from '../../shared/dto/DTOSupplier';

@Component({
  selector: 'app-pur007-partner-product',
  templateUrl: './pur007-partner-product.component.html',
  styleUrls: ['./pur007-partner-product.component.scss']
})
export class Pur007PartnerProductComponent implements OnInit, OnDestroy{

  @ViewChild('drawerRight') public DrawerRightComponent: DrawerComponent;
 
  // region boolean
  expandedRight: boolean = false
  loading: boolean = false
  isOpenDetail: boolean = false
  isBuy: boolean = false
  isFisrtCallAPI: boolean = true

  // endregion
  DrawerHearder: string = "Lịch sử giá mua"
  columnTitle1: string = "Ngày hiệu lực"
  columnTitle2: string = "Người phê duyệt"
  columnTitle3: string = "Giá mua"
  keyword: string = ""
  //region String
  tempSearch: any;


  // endregion
  
  // region permission
  isToanQuyen: boolean = false
  isAllowedToCreate: boolean = false
  isAllowedToVerify: boolean = false
  justLoaded: boolean = true
  actionPerm: DTOActionPermission[] = []
  // endregion

  // region Object
  // Danh sach san pham dat mua
  ListPOProduct:  DTOPartnerProduct[] =[]
  POProduct = new  DTOPartnerProduct()

  // Danh sach ben trong drawer
  ChangeHistory = new DTOChangHitory()
  ListChangeHistory: DTOHitory[] = []

  // 
  Supplier: DTOSupplier = new DTOSupplier();

  // endregion
  
  // region grid Danh sach san pham dat mua
  gridView:BehaviorSubject<any> = new BehaviorSubject<any>({ data: [], total: 0 });
  pageSize = 25
  pageSizes = [this.pageSize]
  allowActionDropdown = []
  skip = 0;
  total = 0
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  //endregion

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  filterPartner: FilterDescriptor = {
    field: "COPartner", operator: "eq", value: 0
  }

  // region grid Danh sach ben trong drawer
  gridViewDrawer:BehaviorSubject<any> = new BehaviorSubject<any>({ data: [], total: 0 });
  pageSizeDrawer = 25
  pageSizesDrawer = [this.pageSizeDrawer]
  skipDrawer = 0;
  totalDrawer = 0
  gridStateDrawer: State = {
    take: this.pageSizeDrawer,
    filter: { filters: [], logic: 'and' },
  }
  //endregion

  //region CallBack
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  onPageChangeCallback: Function
  onPageChangeDrawerCallback: Function
  //endregion

  // region Subscription
  Unsubscribe = new Subject<void>();
  // endregion

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public apiService: PurSupplierApiServiceService,
    public purService: PurService,
  ){}


  ngOnInit(): void {
    let that = this

    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
      }
    })

    this.onPageChangeCallback = this.onPageChange.bind(this)
    this.onPageChangeDrawerCallback = this.onPageChangeDrawer.bind(this)

    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    // this.GetCache()
    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetCache();
      }
    })
  }


  // Gọi Service lấy data từ obsevable
  GetCache(){
    this.purService.getSupplier().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)){
        this.Supplier = res
        this.filterPartner.value = this.Supplier.Code
        if(this.isFisrtCallAPI){
          this.GetData()
          this.isFisrtCallAPI = false
        }
      }
    })
  }

  GetData(){
    this.onLoadFilter()
    this.APIGetListPOProduct()
  }


  //#region API
  APIGetListPOProduct(){
    this.loading = true
    this.apiService.GetListPOProduct(this.gridState, this.keyword).pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ListPOProduct = res.ObjectReturn.Data
        this.total = res.ObjectReturn.Total;
        this.gridView.next({data: this.ListPOProduct, total: this.total})
      } else{
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách sản phẩm đặt mua: " ${res.ErrorString}`);
      }
      this.loading = false
    }, (error)=>{
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách sản phẩm đặt mua: ${error}`);
    })
  }

  APIGetListChangePriceHistory(){
    this.loading = true
    this.apiService.GetListChangePriceHistory(this.gridStateDrawer).pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ChangeHistory = res.ObjectReturn
        this.ListChangeHistory = this.ChangeHistory.ListHistory
        this.totalDrawer = this.ChangeHistory.ListHistory.length;
        this.gridViewDrawer.next({data: this.ListChangeHistory, total: this.totalDrawer})
      } else{
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy lịch sử giá mua: " ${res.ErrorString}`);
      }
      this.loading = false
    }, (error)=>{
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy lịch sử giá mua: ${error}`);
    })
  }

  APIGetListBuyedHistory(){
    this.loading = true
    this.apiService.GetListBuyedHistory(this.gridStateDrawer).pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ChangeHistory = res.ObjectReturn
        this.ListChangeHistory = this.ChangeHistory.ListHistory
        this.totalDrawer = this.ChangeHistory.ListHistory.length;
        this.gridViewDrawer.next({data: this.ListChangeHistory, total: this.totalDrawer})
      } else{
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy lịch sử mua hàng: " ${res.ErrorString}`);
      }
      this.loading = false
    }, (error)=>{
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy lịch sử mua hàng: ${error}`);
    })
  }
  //#endregion
  
  
  //#region Filter
  onLoadFilter(){
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.filter.filters = []

    if(this.filterPartner.value != 0){
      this.gridState.filter.filters.push(this.filterPartner)
    }

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters) && this.tempSearch[0].value != '') {
      // if (this.tempSearch[0].value != '') {
      this.gridState.filter.filters.push(this.filterSearchBox);
      // }
    }
  }

  onLoadDrawerFilter(){
    this.pageSizesDrawer = [...this.layoutService.pageSizes]
    this.gridStateDrawer.take = this.pageSizeDrawer
  }

  onLoadPage(){
    this.onResetFilter()
  }

  handleSearch(event){
    if (event.filters && event.filters.length > 0){
      if (event.filters[0].value === '') {
        this.gridState.skip = 0
        this.GetData()
      }
      else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = 0
        this.GetData()
      }
    }
  }

  onResetFilter(){
    this.gridState.skip = 0
    this.keyword = ""
    this.GetData()
  }

  onPageChange(event: PageChangeEvent){
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.APIGetListPOProduct()
  }
  //#endregion


  //#region Drawer
  onCloseDrawer(){
    this.DrawerRightComponent.toggle()
  }
   
  onPageChangeDrawer(event: PageChangeEvent){
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    if(this.isBuy){
      this.onLoadDrawerFilter()
      this.APIGetListBuyedHistory()
    } else{
      this.onLoadDrawerFilter()
      this.APIGetListChangePriceHistory()
    }
  }
  //#endregion


  //#region Action dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any){
    moreActionDropdown = []

    if(this.isAllowedToCreate || this.isAllowedToVerify || this.isToanQuyen){
      moreActionDropdown.push(
        { Name: "Lịch sử giá mua", Code: "eye", Link: "1", Actived: true },
        { Name: "Lịch sử mua hàng", Code: "eye", Link: "2", Actived: true }
      )
    }
 
    return moreActionDropdown
  }

  onActionDropdownClick(menu: MenuDataItem, item: any){
    this.POProduct = item
    this.DrawerHearder = menu.Name
    if(menu.Link == "2"){
      this.columnTitle1 = "Đơn hàng"
      this.columnTitle2 = "Ngày mua hàng"
      this.onLoadDrawerFilter()
      this.APIGetListBuyedHistory()
      this.isBuy = true
    } else {
      this.onLoadDrawerFilter()
      this.APIGetListChangePriceHistory()
      this.isBuy = false
    }
    this.DrawerRightComponent.toggle()
  }
  //#endregion


  // Unsubcribe
  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}
