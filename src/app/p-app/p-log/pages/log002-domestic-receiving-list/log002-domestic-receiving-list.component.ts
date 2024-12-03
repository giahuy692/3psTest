import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { SortDescriptor, State, distinct, CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib/utilities/utility.object';
import { Router } from '@angular/router';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';
import { PurPOAPIService } from 'src/app/p-app/p-purchase/shared/services/pur-po-api.service';
import { DTODomesticOrders } from 'src/app/p-app/p-purchase/shared/dto/DTODomesticOrders.dto';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-log002-domestic-receiving-list',
  templateUrl: './log002-domestic-receiving-list.component.html',
  styleUrls: ['./log002-domestic-receiving-list.component.scss']
})
export class Log002DomesticReceivingListComponent implements OnInit, AfterViewInit{

  // region permission
  isToanQuyen: boolean = false
  isAllowedToCreate: boolean = false
  isAllowedToVerify: boolean = false
  justLoaded: boolean = true
  actionPerm: DTOActionPermission[] = []

  pageSize = 25; skip = 0; total = 0
  pageSizes = [this.pageSize]
  sortBy: SortDescriptor = { field: 'Code', dir: 'desc' }
  gridState: State = {
    take: this.pageSize,
    sort: [this.sortBy],
    filter: { filters: [], logic: 'and' },
    skip: this.skip
  }


  onSortChangeCallback: Function
  onSelectCallback: Function
  // Dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //function grid
  onPageChangeCallback: Function

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  unsubscribe = new Subject<void>;

  constructor(
    public menuService: PS_HelperMenuService,
    private router: Router,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    private layoutServiceAPI: LayoutAPIService,
    private changeDetector: ChangeDetectorRef,
    private PurPOAPIService: PurPOAPIService,
  ) { }


  ngOnInit(): void {
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
      }
    })


    this.onPageChangeCallback = this.onPageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)

    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)

    this.menuService.changePermissionAPI().pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetListStatus(13)
        this.APIGetListStatus(14)
      }
    })
    // this.APIGetListStatus(13)
    // this.APIGetListStatus(14)


  }

  ngAfterViewInit(){
    this.changeDetector.detectChanges();
  }

    //#region FILTER
    filterStatus: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: null };
    
    //#region isea
    CompFilterOrderIssue: CompositeFilterDescriptor = { logic: 'or', filters: [] }
    filterNoOfReturnedInvoice: FilterDescriptor = { field: 'NoOfReturnedInvoice', operator: 'gt', value: 0 }
    filterNoOfWaitingInvoice: FilterDescriptor = { field: 'NoOfWaitingInvoice', operator: 'gt', value: 0 }
    filterPoCancel: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 3 }
    
    //- Filter search
    tempSearch: any;
    filterSearchBox: CompositeFilterDescriptor = { logic: 'or', filters: [] };


    //- Filter tình trạng ở header grid
    filterDescriptorStatusDropdown: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: null }
    filterDescriptorStatusID1: FilterDescriptor = { field: 'StatusID', operator: 'neq', value: 1 }
    
    //- Filter ngày giao nhận hàng
    CompFilterDescDelivery: CompositeFilterDescriptor = { logic: 'and', filters: [] }
    filterOrderTypeDropdown: FilterDescriptor = { field: 'OrderTypeID', operator: 'eq', value: 1 }
    filterDescriptorAfterDate: FilterDescriptor = { field: 'ReceivingStart', operator: 'lt', value: null }
    filterDescriptorFromDate: FilterDescriptor = { field: 'ReceivingStart', operator: 'gte', value: null }
    //#endregion

    //- Filter khung thời gian giao hàng 
    filterDescriptorDeliveryTimeFrame: FilterDescriptor = { field: 'DeliveryPeriod', operator: 'eq', value: null }

  //#region Load filter
  onLoadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.CompFilterOrderIssue.filters.length = 0
    this.CompFilterDescDelivery.filters.length = 0


    //- Filter loại PO
    if(Ps_UtilObjectService.hasValue(this.currentStatusHeader1)){
      this.filterOrderTypeDropdown.value = this.currentStatusHeader1?.OrderBy
      this.gridState.filter.filters.push(this.filterOrderTypeDropdown)
    } 
    
    // Filter kế hoạch nhận hàng từ ngày
    if(Ps_UtilObjectService.hasValue(this.currentDateFilterOperator)  && this.currentDateFilterOperator?.Code == 1 && this.currentDate){
      this.CompFilterDescDelivery.filters.push(this.filterDescriptorFromDate)
    }

    // Filter kế hoạch nhận hàng trước ngày
    if(Ps_UtilObjectService.hasValue(this.currentDateFilterOperator) && this.currentDateFilterOperator?.Code == 2 && this.currentDate){
      this.CompFilterDescDelivery.filters.push(this.filterDescriptorAfterDate)
    }

    // Filter khung thời gian giao hàng
    if (Ps_UtilObjectService.hasValue(this.currentDeliveryTimeFrame?.Code)) {
      this.CompFilterDescDelivery.filters.push(this.filterDescriptorDeliveryTimeFrame)
    }

    // Filter PO có vấn đề
    if (this.currentFilterCheckbox && this.currentStatusHeader1?.OrderBy == 1) {
      this.CompFilterOrderIssue.filters.push(this.filterNoOfReturnedInvoice, this.filterNoOfWaitingInvoice, this.filterPoCancel)
    }

    // Hợp nhật filter
    if (Ps_UtilObjectService.hasListValue(this.CompFilterOrderIssue.filters)) {
      this.gridState.filter.filters.push(this.CompFilterOrderIssue)
    }

    if (Ps_UtilObjectService.hasListValue(this.CompFilterDescDelivery.filters)) {
      this.gridState.filter.filters.push(this.CompFilterDescDelivery)
    }

    // Filter tình trạng
    if (Ps_UtilObjectService.hasListValue(this.currentStatusHeaderGrid) && this.currentStatusHeaderGrid.OrderBy > 0) {
      this.filterDescriptorStatusDropdown.value = this.currentStatusHeaderGrid?.OrderBy
      this.gridState.filter.filters.push(this.filterDescriptorStatusDropdown)
    } 
    // Không lấy các PO đang soạn thảo
    else if(this.currentStatusHeader1?.OrderBy == 1){
      this.gridState.filter.filters.push(this.filterDescriptorStatusID1)
    }

    //- Filter search
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters) 
      && Ps_UtilObjectService.hasValueString(this.tempSearch[0].value?.trim())) {
        this.gridState.filter.filters.push(this.filterSearchBox);
    }
    this.APIGetListDomesticOrders(this.gridState)

  }
  //#endregion

  

  //#region DateTimepikcer
  currentDate: Date = null;
  //Chọn datepicker thì sẽ gọi hàm này
  onDatepickerChange(event: Date) {
    this.currentDate = event;
    
    // Nếu lọc theo từ
      this.filterDescriptorFromDate.value = formatDate(this.currentDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');

    // Nếu lọc theo trước
      this.filterDescriptorAfterDate.value = formatDate(this.currentDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');

    this.onLoadFilter();

  }
  //#endregion

  //#region filter-dropdown-list
  ListDateFilterOperator = [{ Code: 1, TypeFilter: 'từ' }, { Code: 2, TypeFilter: 'trước' }];
  currentDateFilterOperator: { Code: number, TypeFilter: string } = this.ListDateFilterOperator[0];
  
  ListDeliveryTimeFrame = [{ Code: 1, TimeRange: '08:30 - 11:30' }, { Code: 2, TimeRange: '13:30 - 16:30' }];
  currentDeliveryTimeFrame: { Code: number, TimeRange: string } = { Code: null, TimeRange: null };


  // Hàm xử lý chọn lọc tình trạng ở header của grid
  currentStatusHeaderGrid: DTOStatus = { Code: -1, StatusName: 'Tất cả', TypeData: -1, OrderBy: -1 };
  onItemStatusGridClick(status: DTOStatus){
    this.currentStatusHeaderGrid = status;
    this.filterStatus.value = this.currentStatusHeaderGrid.OrderBy;
    this.onLoadFilter();
  }

  handleFilterStatus(value: string) {
    this.dataFilterTypeData14 = this.ListTypeData14.filter(
      (s) => s.StatusName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  // Hàm xử lý 
  currentFilterCheckbox:boolean = false;

  onClickCheckbox(e: any){
    this.currentFilterCheckbox = e.target.checked;
    this.changeDetector.detectChanges();
    this.onLoadFilter()
  }

  // Hàm xử lý chọn toán tử lọc ngày bắt đầu nhận hàng
  selectionDateFilterOperatorChange(event: { Code: number, TypeFilter: string }){
    this.currentDateFilterOperator = event;
    if(Ps_UtilObjectService.hasValue(this.currentDate)){
      this.onLoadFilter();
    }
  }

  // Hàm xử lý chọn khung giờ giao hàng
  selectionDeliveryTimeFrameChange(event: {Code: number, TimeRange: string}){
    this.currentDeliveryTimeFrame = event
    this.filterDescriptorDeliveryTimeFrame.value = event.TimeRange
    this.onLoadFilter();
  }

  // Hàm xử lý chọn loại PO
  onSelectionOrderType(event: DTOStatus){
    this.currentStatusHeader1 = event;

    this.currentStatusHeaderGrid = null;
    // Nếu như đang loại PO khác loại đang xử lý thì reset lại tình trạng lọc ở header và checkbox
    if(this.currentStatusHeader1.OrderBy != 1){
      this.currentFilterCheckbox = false 
    }

    this.gridState.skip = 1

    this.onFilterListStatus();

    this.onLoadFilter();
  }

  // Xử lý xem đang filter theo loại nào và xử lý list status phù hợp với loại đơn hàng đó
  onFilterListStatus(){{
    if(this.currentStatusHeader1?.OrderBy == 1){
      this.dataFilterTypeData14 = this.ListTypeData14.filter(item => item?.OrderBy < 8);
    }

    if(this.currentStatusHeader1?.OrderBy == 2){
      this.dataFilterTypeData14 = this.ListTypeData14
    }

    if(this.currentStatusHeader1?.OrderBy == 3){
      this.dataFilterTypeData14 = this.ListTypeData14.filter(item => item?.OrderBy == 8 || item?.OrderBy == 9);
    }
  }}
  //#endregion

  //#region search-filter-group
  handleSearch(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
      }
      this.gridState.skip = 1;
      this.onLoadFilter();
    }
  }

  //- Handle reset
  onResetFilter() {
    this.gridState.skip = 0;
    this.currentDate = null;
    this.currentDateFilterOperator = {...this.ListDateFilterOperator[0]};
    this.currentStatusHeader1 = {...this.ListTypeData13[0]};
    this.currentDeliveryTimeFrame = { Code: null, TimeRange: null };
    this.currentFilterCheckbox = false;
    this.currentStatusHeaderGrid = { Code: -1, StatusName: 'Tất cả', TypeData: -1, OrderBy: -1 };
    this.changeDetector.detectChanges();

    this.onLoadFilter();
  }
  //#endregion

  //region Grid
    

  onPageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.onLoadFilter();
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.onLoadFilter();
  }

  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    moreActionDropdown = [{ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true }]
    return moreActionDropdown
  }

  onActionDropdownClick(menu: MenuDataItem, item: any) {
    if (item.Code > 0 && (menu.Code == "eye" || menu.Link == 'detail')) {
      localStorage.setItem("DOdomestic", JSON.stringify(item))
      this.openDetail()
    }
  }

  openDetail() {
      this.menuService.changeModuleData().pipe(takeUntil(this.unsubscribe)).subscribe((item: ModuleDataItem) => {
       var parent = item.ListMenu.find(f => f.Code == 'inbound')
       if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
         var detail = parent.LstChild.find(f => f.Code.includes('log002-domestic-receiving-list')
           || f.Link.includes('log002-domestic-receiving-list'))

         if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
           var detail2 = detail.LstChild.find(f => f.Code.includes('log002-domestic-receiving-detail')
             || f.Link.includes('log002-domestic-receiving-detail'))
           this.menuService.activeMenu(detail2)
         }
       }
     })
  }

  //#endregion




  //region call API
  //Lấy danh sách trạng thái
  
  loadingOrderType: boolean = false;
  ListTypeData13: DTOStatus[] = [];
  currentStatusHeader1: DTOStatus =  this.ListTypeData13[0]

  dataFilterTypeData14: DTOStatus[] = [];
  ListTypeData14: DTOStatus[] = [];
  
  // Api chi gọi 1 lần khi vào trang
  APIGetListStatus(typeData: number) {
    this.loadingOrderType = true
    this.layoutServiceAPI.GetListStatus(typeData).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      this.loadingOrderType = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (typeData == 13) {
          this.ListTypeData13 = res.ObjectReturn;
          this.currentStatusHeader1 = this.ListTypeData13[0]; // lấy giá trị mặc định cho dropdown filter trên header
          this.onLoadFilter() // Vì khi mới vào trang api sẽ được gọi 2 lần, để loadFilter ở đây để lấy được đúng ds
        } else if (typeData == 14) {
          let add = { Code: -1, StatusName: 'Tất cả', TypeData: -1, OrderBy: -1 };
          res.ObjectReturn.unshift(add) // Thêm item tất cả và bỏ PO đang soạn thảo 
          this.ListTypeData14 = res.ObjectReturn.filter(item => item?.OrderBy !== 1);
          this.currentStatusHeaderGrid = this.ListTypeData14[0]
          this.dataFilterTypeData14 = this.ListTypeData14.slice();
          this.onFilterListStatus();
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tình trạng: ${res.ErrorString}`)
      }
    }, err => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tình trạng:  ${err}`)
      this.loadingOrderType = false;
    })
  }

  //Lấy danh sách đơn hàng
  isLoading: boolean = false;
  ListPO: DTODomesticOrders[] = [];
  gridView = new Subject<any>();

  APIGetListDomesticOrders(Filter: State) {
    this.isLoading = true;
    this.PurPOAPIService.GetListDomesticOrders(Filter).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.gridView.next({ data: res.ObjectReturn.Data, total: res.ObjectReturn.Total })
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhận hàng nội địa: ${res.ErrorString} `);
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhận hàng nội địa: ${error} `);
      }
    )
  }
  //endregion

  //#region UNSUBCRIBE
  Unsubscribe = new Subject<void>
  //#endregion
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
