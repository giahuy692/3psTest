import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, State } from '@progress/kendo-data-query';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigAPIService } from '../../shared/services/config-api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOCargoStatus } from '../../shared/dto/DTOConfCargoStatus';
import { DomSanitizer } from '@angular/platform-browser';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-config007-cargo-status',
  templateUrl: './config007-cargo-status.component.html',
  styleUrls: ['./config007-cargo-status.component.scss']
})
export class Config007CargoStatusComponent {
  @ViewChild('formDrawer') public drawer: MatDrawer;
  
  loading:boolean = false
  selectedStatus: any;

  total = 0
  pageSize = 25
  pageSizes = [this.pageSize];
  
  
  gridState: State = { take: this.pageSize, filter: { filters: [], logic: 'and' }, }
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  // Dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //function grid
  onPageChangeCallback: Function

  selectable: SelectableSettings = {
    enabled: false,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  gridView = new Subject<any>();
  listCargoStatus: DTOCargoStatus[] = [];
  cargoStatus = new DTOCargoStatus()

  listLabel:any

  isShowOrder: boolean = false
  isShowLog: boolean = false
  isShowOnsite: boolean = false
  isShowSeller: boolean = false
  isShowBase: boolean = false

  //filter
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterProductName: FilterDescriptor = {
    field: "ProductName", operator: "contains", value: null
  }
  filterBrandName: FilterDescriptor = {
    field: "BrandName", operator: "contains", value: null
  }

  filterStatus: CompositeFilterDescriptor = { logic: 'or', filters: [] }

  filterStatusItem: FilterDescriptor = {
    field: "", operator: "eq", value: true
  }
  
  listStatus = [
    {Code:1,StatusName:'Tất cả', },
    {Code:2,StatusName:'T.tin đặt hàng',StatusField:'IsOrder',ListStatus:'ListOrder'},
    {Code:3,StatusName:'T.tin điều phối',StatusField:'IsLGT',ListStatus:'ListLGT'},
    {Code:4,StatusName:'T.tin onsite',StatusField:'IsOnsite',ListStatus:'ListOnsite'},
    {Code:5,StatusName:'T.tin bán sỉ',StatusField:'IsWholesale',ListStatus:'ListWholesale'},
    {Code:6,StatusName:'T.tin bán lẻ CH',StatusField:'IsRetail',ListStatus:'ListRetail'},
  ]
  listLabels = {
    'ListOrder': 'đặt hàng',
    'ListLGT': 'điều phối',
    'ListOnsite': 'onsite',
    'ListWholesale': 'bán sỉ',
    'ListRetail' : 'bán lẻ'
  };
  //endregion

  ngUnsubscribe = new Subject<void>();

  constructor(
    public apiService: ConfigAPIService,
    public layoutService: LayoutService,
    public domSanititizer: DomSanitizer,
    public menuService: PS_HelperMenuService,
  ){}
  
  ngOnInit(){
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onPageChangeCallback = this.pageChange.bind(this)

    this.selectedStatus = this.listStatus[0]
    // this.APIGetListProductStatus(this.gridState)

    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetListProductStatus(this.gridState)
      }
    })
  }

  //reload api
  loadData(){
    this.loadFilter();
    this.APIGetListProductStatus(this.gridState)
  }

  //click filter trên header
  onClickRadio(item){
    this.selectedStatus = item
    this.filterStatusItem.field = item.StatusField
    this.loadFilter();
    this.APIGetListProductStatus(this.gridState);
  }

  //trả về mảng thiếu điều kiện
  listOfGrid(dataItem): DTOCargoStatus[]{
    // console.log(dataItem)
    if(Ps_UtilObjectService.hasListValue(dataItem)){
      return dataItem.filter(s => s.Choose == true)
    }
  }
//trả về số lượng thiếu điều kiện
  itemOfDrawer(item): number{
    if(Ps_UtilObjectService.hasListValue(item)){
      return item.filter(s => s.Choose == true).length
    }
  }
 
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.filterStatus.filters = []
    let filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] }

    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      filterSearch.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterProductName.value))
      filterSearch.filters.push(this.filterProductName)

    if (Ps_UtilObjectService.hasValueString(this.filterBrandName.value))
      filterSearch.filters.push(this.filterBrandName)

    if (Ps_UtilObjectService.hasValueString(this.filterStatusItem.field))
      this.filterStatus.filters.push(this.filterStatusItem)


    if (this.filterStatus.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatus);
    }

    if (filterSearch.filters.length > 0) {
      this.gridState.filter.filters.push(filterSearch);
    }

  }

  resetFilter() {
    this.Search(null);

  }
  Search(event: any) {
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.filterBarcode.value = event;
      this.filterProductName.value = event;
      this.filterBrandName.value = event;

    } else {
      this.filterStatusItem.field = ''
      this.selectedStatus = this.listStatus[0]
      this.filterBarcode.value = null;
      this.filterProductName.value = null;
      this.filterBrandName.value = null;
    }
    this.loadFilter();
    this.APIGetListProductStatus(this.gridState);

  }
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.loadFilter();
    this.APIGetListProductStatus(this.gridState);
  }

  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOCargoStatus) {
    moreActionDropdown = []
    if (Ps_UtilObjectService.hasValue(dataItem) && dataItem.Code !== 0){
      moreActionDropdown.push({ Name: 'Xem chi tiết', Code: 'eye', Actived: true, })
    }
    return moreActionDropdown
  }

  onActionDropdownClick(menu: MenuDataItem, item: DTOCargoStatus) {
    if (menu.Code == "eye") {
      // localStorage.setItem("CargoStatus",JSON.stringify(item))
      this.cargoStatus = item

      this.openDrawer();

    }
  }

  errorOccurred: any = {};
  getRes(str: string, imageKey: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    if (this.errorOccurred[imageKey]) { return this.getResHachi(a); }
    else {
      return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
    }
  }

  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }

  handleError(imageKey: string) { this.errorOccurred[imageKey] = true; }

  openDrawer(){
     if(Ps_UtilObjectService.hasValue(this.cargoStatus)){
      this.isShowOrder = false
      this.isShowLog = false
      this.isShowOnsite = false
      this.isShowSeller = false
      this.isShowBase = false
      this.drawer.open();
     }
  }

  closeDrawer(){
    this.drawer.close();
  }

  //hiển thị thông tin trên drawer
  showInfo(show:boolean,showName:string){
    this[showName] = show
  }


  //tính phần trăm để css listStatus trên grid
  calculateGradientStyle(dataItem: any, listName: string) {
    const list = dataItem[listName];
    if (list) {
      const trueCount = list.filter((item: any) => item.Choose).length;
      const fillPercentage = (trueCount / list.length) * 100;
      const gradient = `linear-gradient(to left, #ffffff ${fillPercentage}%, #1a6634 ${fillPercentage}%)`;
      return { 'background-image': gradient };
    }
    return {};
  }

  
  APIGetListProductStatus(state: State) {
      this.loading = true;
      var ctx = 'Lấy danh sách Tình trạng hàng hóa'

      this.apiService.GetListProductStatus(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
            this.listCargoStatus = res.ObjectReturn.Data;
            this.gridView.next({ data: this.listCargoStatus, total: res.ObjectReturn.Total });
            this.listLabel = Object.keys(this.listLabels)
        }
        else{
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        }
        this.loading = false;
      }, (e) => {
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      });
    }


    ngOnDestroy():void{
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
      localStorage.removeItem('CargoStatus')
    }
}
