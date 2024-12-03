import { Component, OnInit, EventEmitter, Output, OnDestroy, Input } from '@angular/core';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, State } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTOConfHamperProducts, DTOHamperRequest } from '../../dto/DTOConfHamperRequest';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';


@Component({
  selector: 'app-config-product-list',
  templateUrl: './config-product-list.component.html',
  styleUrls: ['./config-product-list.component.scss']
})
export class ConfigProductListComponent {
  @Output() openDrawerEvent = new EventEmitter<void>();
  @Input() hasAction: boolean = true
  @Output() dataChanged: EventEmitter<any> = new EventEmitter();
  


  loading: boolean = false
  disableSearch = false
  dialogOpen = false
  excelValid: boolean = true

  total = 0
  pageSize = 25
  pageSizes = [this.pageSize]


  gridView = new Subject<any>();
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  //DTO
  hamper = new DTOHamperRequest()
  listHamper: DTOHamperRequest[] = []

  selectedItem:any
  //unSubcribe 
  ngUnsubscribe = new Subject<void>();
  //select
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  //search prod

  filterChildBarcode: FilterDescriptor = {
    field: "ChildBarcode", operator: "contains", value: null
  }
  filterChildName: FilterDescriptor = {
    field: "ChildName", operator: "contains", value: null
  }
  filterBrandName: FilterDescriptor = {
    field: "BrandName", operator: "contains", value: null
  }
  //#endregion prod
  //CALLBACK
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onSortChangeCallback: Function
  onFilterChangeCallback: Function

  //export import
  pickFileCallback: Function;
  getFolderCallback: Function;
  uploadEventHandlerCallback: Function
  //grid select
  getSelectionPopupCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getActionDropdownCallback: Function

  constructor(
    public layoutService: LayoutService,
    public hamperAPIService: ConfigHamperApiService,
    public hamperService: ConfigHamperService,
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getHamperRequest();
      }
    })

    this.reloadDataFrom();
    // this.getHamperRequest();
  }


//region getData
  onDataChange(newData: DTOHamperRequest) {
    // Khi có sự thay đổi dữ liệu, phát sự kiện thông báo đến component cha
    this.dataChanged.emit(newData);
  }
 
  reloadDataFrom() {
    this.hamperService.reloadList$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.loadFilter();
      this.getListProductHamper();
    });
  }

  openDrawerFromParent() {
    this.openDrawerEvent.emit();
  }

  getHamperRequest() {
    this.hasAction = false
    this.disableSearch = true
    this.hamperService.getHamperRequest().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.disableSearch = false
        if(Ps_UtilObjectService.hasValueString(res.Company) && res.Company > 0){
          this.hasAction = false
        }
        else{
          this.hasAction = true
        }
        this.hamper = res
        this.checkEmit()
      }
    })
  }

  checkEmit() {
    if (this.hamper.Code != 0) {
      if(!this.hamper['hasUpdateStatus']){
        this.loadFilter();
        this.getListProductHamper();
      }
      if (this.hamper.StatusID == 2 || this.hamper.StatusID == 3 || this.hamper['isDisable']) {
        this.hasAction = false
      }
    }
    else {
      this.disableSearch = true
      this.hasAction = false
      this.loadFilter();
      this.getListProductHamper();
    }
  }
//endRegion


//Region List Product
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];

    let filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] }

    if (Ps_UtilObjectService.hasValueString(this.filterChildBarcode.value))
      filterSearch.filters.push(this.filterChildBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterChildName.value))
      filterSearch.filters.push(this.filterChildName)

    if (Ps_UtilObjectService.hasValueString(this.filterBrandName.value))
      filterSearch.filters.push(this.filterBrandName)

    if (filterSearch.filters.length > 0) {
      this.gridState.filter.filters.push(filterSearch);
    }

  }

  resetFilter() {
    this.Search(null);
  }
  Search(event: any) {
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.filterChildBarcode.value = event;
      this.filterChildName.value = event;
      this.filterBrandName.value = event;

    } else {
      this.filterChildBarcode.value = null;
      this.filterChildName.value = null;
      this.filterBrandName.value = null;
    }
    this.loadFilter();
    this.getListProductHamper();

  }
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.loadFilter();
    this.getListProductHamper();
  }

  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    moreActionDropdown = []
    var statusID = this.hamper.StatusID
    if (statusID == 2 || statusID == 3)
      moreActionDropdown.push({ Name: 'Xem chi tiết', Code: 'detail', Type: 'eye', Actived: true, })
    if (statusID == 0 || statusID == 4 || statusID == null || statusID == 1)
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "edit", Type: 'pencil', Actived: true },)
    if (statusID == 0 || statusID == 4)
      moreActionDropdown.push({ Name: "Xóa", Code: "delete", Type: 'trash', Actived: true })

    return moreActionDropdown
  }

  onActionDropdownClick(menu: MenuDataItem, item: any) {
    if (menu.Code == "edit" || menu.Type == "pencil" || menu.Code == "detail" || menu.Type == "eye") {
      this.hamperService.activeProductInHamper(item)
      this.openDrawerFromParent();

    }
    else if (menu.Code == "delete" || menu.Type == "trash") {
      this.selectedItem = item
      this.openDialog();
    }
  }
  
  //endRegion


//Region call API
  DeleteHamperRequestProduct(code: number,parent:number) {
    this.loading = true
    this.hamperAPIService.DeleteHamperRequestProduct(code,parent).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.loadFilter();
        this.getListProductHamper();
        this.layoutService.onSuccess("Xóa thành công sản phẩm ra khỏi danh sách")
        this.hamperService.ReloadApplyCompany();
        
        this.closeDialog();
      } else {
        this.layoutService.onError(`Đã xày ra lỗi khi xóa ra khỏi danh sách: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Đã xày ra lỗi khi xóa ra khỏi danh sách: ${err}`);
      this.loading = false
    })
  }


  getListProductHamper() {
    this.loading = true
    var isEnterPrise: boolean
    this.gridState.filter.filters.push({ field: "Parent", operator: "eq", value: this.hamper.Code })
    if(Ps_UtilObjectService.hasValueString(this.hamper.Company)){
      isEnterPrise = false
    }
    else{
      isEnterPrise = true
    }
    this.hamperAPIService.GetListProductHamper(this.gridState,isEnterPrise).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listHamper = res.ObjectReturn.Data
        this.onDataChange(res.ObjectReturn.Data)
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listHamper, total: this.total });
      } else {
        this.layoutService.onError(`Lỗi lấy danh sách sản phẩm thuộc Hamper: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Lỗi lấy danh sách sản phẩm thuộc Hamper: ${err}`);
      this.loading = false
    })
  }

  //endRegion


  //Region handle button
  closeDialog(){
    this.dialogOpen = false
  }

  openDialog(){
    this.dialogOpen = true
  }

  Delete(){
    this.DeleteHamperRequestProduct(this.selectedItem.Code,this.selectedItem.Parent)
  }

  addNewItem() {
    const newItem = new DTOConfHamperProducts();
    this.hamperService.activeProductInHamper(newItem);
    this.openDrawerFromParent();
  }

  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  uploadEventHandler(e: File) {
    this.p_ImportExcel(e);
  }

  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

   this.hamperAPIService.ImportExcelProductForHamper(file, this.hamper.Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.getListProductHamper()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
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
    var getfileName = 'ProductForHamperTemplate.xlsx'
    this.layoutService.onInfo(`Đang xử lý ${ctx}`);

    this.hamperAPIService.GetTemplate(getfileName).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
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
  //endRegion


  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
