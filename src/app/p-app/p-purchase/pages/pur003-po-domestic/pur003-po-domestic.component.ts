import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct, toDataSourceRequest, orderBy } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_AuthService, Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings as GridSelectableSettings } from '@progress/kendo-angular-grid';
import { SelectableSettings as TreeListSelectableSettings } from '@progress/kendo-angular-treelist'

import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';

import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Router } from '@angular/router';
import { EcomService } from 'src/app/p-app/p-ecommerce/shared/services/ecom.service';
import { EcomAppCartAPIService } from 'src/app/p-app/p-ecommerce/shared/services/ecom-appcart-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTODomesticOrders } from '../../shared/dto/DTODomesticOrders.dto';
import { PurPOAPIService } from '../../shared/services/pur-po-api.service';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-pur003-po-domestic',
  templateUrl: './pur003-po-domestic.component.html',
  styleUrls: ['./pur003-po-domestic.component.scss']
})
export class Pur003PODomesticComponent implements OnInit, OnDestroy {

  //#region DATA
  gridView = new Subject<any>();
  listOrder: DTODomesticOrders[] = [];
  dataOrder: DTODomesticOrders = new DTODomesticOrders;
  listUpdateOrder: DTODomesticOrders[] = [];
  //#endregion


  //#region FILTER
  tempSearch: any;
  filterSearchBox: CompositeFilterDescriptor = { logic: 'or', filters: [] };
  filterStatus: CompositeFilterDescriptor = { logic: 'or', filters: [] }
  filterOrderType: CompositeFilterDescriptor = { logic: 'or', filters: [] }
  filterInvoiceReturn: CompositeFilterDescriptor = { logic: 'or', filters: [] }
  filterOrderTypeDropdown: FilterDescriptor = { field: 'OrderTypeID', operator: 'eq', value: 1 }
  filterStatusDropdown: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: null }
  filterStatusCancel: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 3 };

  filterNoOfReturnedInvoice: FilterDescriptor = { field: 'NoOfReturnedInvoice', operator: 'gt', value: 0 }
  filterNoOfWaitingInvoice: FilterDescriptor = { field: 'NoOfWaitingInvoice', operator: 'gt', value: 0 }

  valueCheckboxOrderFilter: boolean = false;
  isDisableCheckbox: boolean = false;
  //#endregion


  //#region FILTER BUTTON & DROPDOWN HEADER 1
  listStatus: DTOStatus[] = [];
  listStatusOrigin: DTOStatus[] = [];
  listStatusType: DTOStatus[] = [];
  listStatusCopy: DTOStatus[] = []; //dùng để search trong dropdown
  defaultOrderTypeDropdown: DTOStatus
  // defaultStatusDropdown: { Code: number, StatusName: string, TypeData: number, OrderBy: number }

  //#endregion


  //#region FILTER DATE HEADER 2
  optionFilterDate = [
    { text: " Từ", value: 1 },
    { text: " Trước", value: 2 }
  ]
  currentFilterValue: { text: string, value: number } = { text: 'Từ', value: 1 }
  filterDate: Date
  //#endregion


  //#region GRID
  isLoading: boolean = false
  pageSize = 25; skip = 0; total = 0
  pageSizes = [this.pageSize]
  sortBy: SortDescriptor = { field: 'Code', dir: 'desc' }
  gridState: State = {
    take: this.pageSize,
    sort: [this.sortBy],
    filter: { filters: [], logic: 'and' },
    skip: this.skip
  }

  isProcessing: boolean = true;
  isSearchDropdown: boolean = true;
  //#endregion


  //#region GRID DATA CHANGE
  onPageChangeCallback: Function
  onFilterChangeCallback: Function
  // onSortChangeCallback: Function
  //#endregion


  //#region SELECT ITEM GRID
  selectable: GridSelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  getSelectionPopupCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  isFilterActive = true
  //#endregion


  //#region MORE ACTION DRODOWN
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
  //#endregion


  //#region UNSUBCRIBE
  Unsubscribe = new Subject<void>
  //#endregion


  //#region PERMISSION 
  isAllPers: boolean = false
  isCanCreate: boolean = false
  isCanApproved: boolean = false
  justLoadedPer: boolean = true
  dataPerm: DTODataPermission[] = [];
  actionPerm: DTOActionPermission[] = [];
  //#endregion


  //#region DIALOG DELETE / CANCEL
  openedDia: boolean = false
  openedDiaCancel: boolean = false
  //#endregion


  constructor(
    public router: Router,
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: EcomService,
    public apiService: EcomAppCartAPIService,
    public APP_AuthService: Ps_AuthService,
    private layoutServiceAPI: LayoutAPIService,
    private PurPOAPIService: PurPOAPIService,
    private changeDetector: ChangeDetectorRef,

  ) { }

  ngOnInit() {
    // dropdown action
    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onActionDropdownClickCallback = this.onActionDropdown.bind(this);

    // on change event
    this.onPageChangeCallback = this.onChangePage.bind(this);

    let that = this;

    // permission
    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && that.justLoadedPer) {
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');
        that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        that.justLoadedPer = false;
      }
    });

    this.onLoadFilter();
    // this.getAPI();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getAPI();
      }
    })
    this.currentFilterValue = this.optionFilterDate[0];

  }


  //Dùng này để tránh lỗi NG0100
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  //#region ========== GET DATA ==========================
  getAPI() { //Gọi api
    this.APIGetListStatus(13);
    this.APIGetListStatus(14);
    this.APIGetListDomesticOrders(this.gridState);
  }

  //Breadcum: nhấn vào breadcum thì gọi hàm này
  onReloadData() {
    this.APIGetListDomesticOrders(this.gridState);
  }
  //#endregion


  //#region ========== ON CHANGES PAGE ===================
  //Khi nhấn chuyển trang qua trên tool pager thì hàm này được gọi
  onChangePage(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.APIGetListDomesticOrders(this.gridState);
  }
  //#endregion


  //#region ========== OPEN DETAIL ===================
  //Hàm dùng để chuyển vào trang chi tiết và set data trên localstorage để trang detail lấy được thông tin item được chọn 
  onOpenDetail(isAddNew: boolean, dataItem?: DTODomesticOrders) {
    event.stopPropagation()
    this.menuService.changeModuleData().pipe(takeUntil(this.Unsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code.includes('pur-po') && f.Link.includes('/pur/pur008-price-request-list'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('pur003-po-domestic') || f.Link.includes('/pur/pur003-po-domestic'))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('pur003-po-domestic-detail') || f.Link.includes('/pur/pur003-po-domestic-detail'))
          if (isAddNew) { //trường hợp thêm mới
            var addNewPost = new DTODomesticOrders()
            localStorage.setItem("PODomestic", JSON.stringify(addNewPost))
          } else { //trường hợp lấy in4 item từ danh sách
            localStorage.setItem("PODomestic", JSON.stringify(dataItem))
          }
          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //#endregion


  //#region ========== FILTER ========================

  // Xử lý filter checkbox 
  onBlurCheckbox(e) {
    this.gridState.skip = 0
    this.onLoadFilter();
    this.APIGetListDomesticOrders(this.gridState);
  }


  //Reset filter
  @ViewChild('dropdownStatus') dropdownStatus: any
  onResetFilter() {
    this.currentFilterValue = this.optionFilterDate[0]
    this.defaultOrderTypeDropdown = { ... this.listStatusType[0] } //tạo ra bộ nhớ mới, không ảnh hưởng tới mảng chính
    // this.defaultStatusDropdown = { ...this.listStatus[0] }
    this.valueCheckboxOrderFilter = false;
    this.isDisableCheckbox = false;
    this.filterOrderTypeDropdown = { field: 'OrderTypeID', operator: 'eq', value: 1 };
    this.filterStatusDropdown = { field: 'StatusID', operator: 'eq', value: null };
    this.filterDate = null;
    this.dateString = '';
    this.gridState.skip = 0;
    this.typeAfBe = 1;

    this.onLoadFilter()
    this.APIGetListDomesticOrders(this.gridState);
    this.dropdownStatus.reset();
  }


  //Select dropdown OrderType: Chọn item trong dropdown order type trên header
  selectionDropdownOrderType(e: any) {
    this.gridState.skip = 0 //reset lại page
    this.filterOrderTypeDropdown = { field: 'OrderTypeID', operator: 'eq', value: e.OrderBy };

    // Lọc các status theo orderType
    if (Ps_UtilObjectService.hasListValue(this.listStatusOrigin)) {

      this.listStatus = this.listStatusOrigin.filter((x) => {

        if (this.filterOrderTypeDropdown.value == 1) {  // Các status thuộc orderType "Đơn hàng đang xử lý"
          return x.OrderBy !== 8 && x.OrderBy !== 9;
        }
        else if (this.filterOrderTypeDropdown.value == 2) {  // Các status thuộc orderType "Đơn hàng bị hủy"
          return x.OrderBy !== 8 && x.OrderBy !== 9;
        }
        else if (this.filterOrderTypeDropdown.value == 3) {  // Các status thuộc orderType "Đơn hàng kết thúc giao hàng"
          return x.OrderBy == -1 || x.OrderBy == 8 || x.OrderBy == 9;
        }

      });
      this.listStatusCopy = this.listStatus;
    }


    this.filterStatusDropdown.value = null;
    this.dropdownStatus.reset();


    if (e.OrderBy == 2 || e.OrderBy == 3) {
      this.valueCheckboxOrderFilter = false;
      this.filterInvoiceReturn.filters = [];
    }

    this.isSearchDropdown = e.OrderBy == 3 ? false : true;
    this.isDisableCheckbox = e.OrderBy == 1 ? false : true;

    this.onLoadFilter();
    this.APIGetListDomesticOrders(this.gridState)


    //#region Code cũ
    //Xử lý filter Tình trạng "Đơn hàng đang xử lý"
    // if (e.OrderBy == 1) {
    //   let temp = this.filterStatus.filters.some((item: any) => {
    //     return item.value === 8;
    //   });

    //   if (temp == true) {
    //   this.filterStatusDropdown.value = null;
    //   this.dropdownStatus.reset();
    //   }
    // }


    //Xử lý filter Tình trạng "Đơn hàng bị hủy"
    // if (e.OrderBy == 2) {
    // this.valueCheckboxOrderFilter = false;
    // this.filterInvoiceReturn.filters = [];

    // let temp = this.filterStatus.filters.some((item: any) => {
    //   return item.value === 8 || item.value === 9;
    // });

    // if (temp == true) {
    // this.filterStatusDropdown.value = null;
    // this.dropdownStatus.reset();
    // }
    // }


    //Xử lý filter Tình trạng "Đơn hàng kết thúc giao hàng"
    // this.isSearchDropdown = e.OrderBy == 3 ? false : true;
    // this.isDisableCheckbox = e.OrderBy == 1 ? false : true;
    // if (e.OrderBy == 3) {
    //   this.valueCheckboxOrderFilter = false;
    //   this.filterInvoiceReturn.filters = [];

    // let temp = this.filterStatus.filters.some((item: any) => {
    //   return item.value === 8 || item.value === 9;
    // });

    // if (temp == false) {
    // this.filterStatusDropdown.value = null;
    // this.dropdownStatus.reset();
    // }
    // }
    //#endregion

  }


  //Select dropdown Status: Chọn item trong dropdown tình trạng trên header grid
  selectionDropdownStatus(e: any) {
    this.gridState.skip = 0 //reset lại page
    this.filterStatusDropdown = { field: 'StatusID', operator: 'eq', value: e.OrderBy };
    this.onLoadFilter();
    this.APIGetListDomesticOrders(this.gridState)
  }


  //Dùng khi cần set trạng thái cho các filter
  onLoadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.filterInvoiceReturn.filters = [];
    this.filterStatus.filters = [];
    this.filterOrderType.filters = [];


    // filter OrderType
    if (Ps_UtilObjectService.hasListValue(this.filterOrderTypeDropdown.value)) {
      if (this.filterOrderTypeDropdown.value == 3) {
        const isExistOrdetype = this.filterOrderType.filters.some((item: any) => item.value === 2);
        if (!isExistOrdetype) {
          this.filterOrderType.filters.push(this.filterOrderTypeDropdown)
        }
      } else {
        this.filterOrderType.filters.push(this.filterOrderTypeDropdown);
      }
    }


    // filter status
    if (Ps_UtilObjectService.hasListValue(this.filterStatusDropdown.value)) {
      if (this.filterStatusDropdown.value == -1) {

        if (this.filterOrderTypeDropdown.value == 1) {
          this.filterOrderTypeDropdown = { field: 'OrderTypeID', operator: 'eq', value: 1 }
        } else if (this.filterOrderTypeDropdown.value == 2) {
          this.filterOrderTypeDropdown = { field: 'OrderTypeID', operator: 'eq', value: 2 }
        } else if (this.filterOrderTypeDropdown.value == 3) {
          this.filterOrderTypeDropdown = { field: 'OrderTypeID', operator: 'eq', value: 3 }
        }

      } else {
        if (this.filterStatusDropdown.value != 3) {
          this.filterStatus.filters.push(this.filterStatusDropdown)
        } else {
          const isExist = this.filterStatus.filters.some((item: any) => item.value === 3);
          if (!isExist) {
            this.filterStatus.filters.push(this.filterStatusCancel)
          }
        }
      }
    }


    //filter order have issue
    if (this.valueCheckboxOrderFilter == true) {
      this.filterInvoiceReturn.filters.push(this.filterNoOfReturnedInvoice, this.filterNoOfWaitingInvoice, this.filterStatusCancel)

      // const isExistStatus = this.filterStatus.filters.some((item: any) => item.value === 3);
      // if (!isExistStatus) {
      //   this.filterInvoiceReturn.filters.push(this.filterStatusCancel)
      // }
    }

    // search 
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this.gridState.filter.filters.push(this.filterSearchBox);
      }
    }

    // orderType
    if (this.filterOrderType.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterOrderType);
    }

    // status 
    if (this.filterStatus.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatus);
    }

    // issue
    if (this.filterInvoiceReturn.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterInvoiceReturn);
    }

    //filter của date
    if (Ps_UtilObjectService.hasValueString(this.dateString)) {
      if (this.typeAfBe == 1)
        this.gridState.filter.filters.push(this.filterFrom);
      else
        this.gridState.filter.filters.push(this.filterAfter);
    }

    // console.log(toDataSourceRequest(this.gridState));
  }
  //#endregion


  //#region ========== SEARCH ========================
  onSearch(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (event.filters[0].value === '') {
        this.gridState.skip = 0
        this.onLoadFilter();
        this.APIGetListDomesticOrders(this.gridState)
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = 0
        this.onLoadFilter();
        this.APIGetListDomesticOrders(this.gridState)
      }
    }

  }

  onSearchDropdown(e: string) { //search trong dropdown
    this.listStatus = this.listStatusCopy.filter(
      (s: any) => s.StatusName.toLowerCase().indexOf(e.toLowerCase()) !== -1
    )
  }
  //#endregion


  //#region ========== DROPDOWN FILTER DATE ==========
  filterDay: CompositeFilterDescriptor = { logic: 'or', filters: [] }
  filterAfter: FilterDescriptor = { field: 'OrderedTime', operator: 'lt', value: '2' }
  filterFrom: FilterDescriptor = { field: 'OrderedTime', operator: 'gte', value: '1' }
  dateString: string = '';
  typeAfBe: number = this.optionFilterDate[0].value; //loại từ/trước

  //Chọn dropdown từ/trước sẽ gọi hàm này
  onDropdownFilterDate(event: any) {
    this.typeAfBe = event.value;
    if (Ps_UtilObjectService.hasValueString(this.filterDate)) {
      if (event.value == 1) //from
        this.filterFrom.value = this.dateString
      else  //before
        this.filterAfter.value = this.dateString

      this.onLoadFilter();
      this.APIGetListDomesticOrders(this.gridState)
    }
  }


  //Chọn datepicker thì sẽ gọi hàm này
  onDatepickerChange(event: Date) {
    this.filterDate = event;
    this.gridState.skip = 0 //reset lại page
    this.dateString = formatDate(this.filterDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
    if (this.typeAfBe == 1) //from
      this.filterFrom.value = this.dateString
    else  //before
      this.filterAfter.value = this.dateString

    this.onLoadFilter();
    this.APIGetListDomesticOrders(this.gridState)

  }
  //#endregion


  //#region ========== ACTION DROPDOWN =============== 
  //Hiện các option cho item tương ứng trên danh sách
  getActionDropdown(ActionsDropdown: MenuDataItem[], item: DTODomesticOrders) {
    this.dataOrder = item;
    ActionsDropdown.length = 0

    if (this.isAllPers || this.isCanCreate) { // User có toàn quyền hoặc quyền tạo

      //Item có tình trạng: ĐST 
      if (item.StatusID == 1) {
        ActionsDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true });

        if (item.SKU > 0 && item.TotalQuantity > 0) {
          ActionsDropdown.push({ Name: "Gửi đặt hàng", Code: "sendOrder", Type: 'StatusID', Link: "2", Actived: true });
        }

        if (item.SKU == 0 || item.SKU == null) {
          ActionsDropdown.push({ Name: "Xóa đặt hàng", Code: "trash", Link: "delete", Actived: true });
        }
      }

      //Item có tình trạng:  từ gửi NCC tới đang giao hàng
      if (item.StatusID > 1 && item.StatusID < 9 && item.StatusID != 8) {
        ActionsDropdown.push({ Name: "Xem đặt hàng", Code: "eye", Link: "Detail", Actived: true });

        if (item.OrderTypeID == 1) {
          ActionsDropdown.push({ Name: "Hủy đặt hàng", Code: "cancel", Type: 'OrderTypeID', Link: "2", Actived: true });
        }
      }


      //Item có tình trạng giao hàng thành công
      if (item.StatusID == 8) {
        ActionsDropdown.push({ Name: "Xem đặt hàng", Code: "eye", Link: "Detail", Actived: true });
      }

      //Item có tình trạng hoàn tất một phần
      if (item.StatusID == 9) {
        ActionsDropdown.push({ Name: "Xem đặt hàng", Code: "eye", Link: "Detail", Actived: true });

        if (item.OrderTypeID == 1) {
          ActionsDropdown.push({ Name: "Kết thúc đơn hàng", Code: "finish", Type: 'OrderTypeID', Link: "3", Actived: true });
        }
      }
    }
    else if (this.isCanApproved) {
      ActionsDropdown.push({ Name: "Xem đặt hàng", Code: "eye", Link: "Detail", Actived: true });
    }
    return ActionsDropdown
  }



  //Thực hiện action cho option được hiện
  onActionDropdown(menu: MenuDataItem, item: DTODomesticOrders) {
    if (item.Code != 0) {
      if (menu.Name == 'Xóa đặt hàng' || menu.Code == 'trash') {
        this.openedDia = true;
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Link == 'Detail' || menu.Code == 'eye') {
        this.onOpenDetail(false, item)
      }
      else if (menu.Type == 'StatusID') { //Chuyển trạng thái
        let dataUpdate = { ...item }
        let typeParam = parseInt(menu.Link)
        this.checkFieldRequired(item) // Check các trường bắt buộc

        if (Ps_UtilObjectService.hasListValue(this.listUpdateOrder)) {
          let objectStatusID: { [key: string]: any } = { 'StatusID': typeParam };
          this.APIUpdateDomesticOrdersStatus([dataUpdate], objectStatusID, null)
        }

      }
      else if (menu.Type == 'OrderTypeID') {
        if (menu.Name == "Hủy đặt hàng" && menu.Code == "cancel") {
          this.openedDiaCancel = true;
        } else {
          let dataUpdate = { ...item }
          let typeParam = parseInt(menu.Link)
          dataUpdate.OrderTypeID = typeParam;

          let objectOrderTypeID: { [key: string]: any } = { 'OrderTypeID': typeParam };
          this.APIUpdateDomesticOrdersStatus([dataUpdate], null, objectOrderTypeID);
        }
      }
    }
  }
  //#endregion


  //#region ========== CHECK FIELD =============== 
  //Kiểm tra các trường còn thiếu và thông báo trên UI
  checkFieldRequired(data: DTODomesticOrders) {
    this.listUpdateOrder = []
    if (!Ps_UtilObjectService.hasValueString(data.Supplier))
      this.layoutService.onWarning(`Vui lòng nhập Mã nhà cung cấp!`)
    else if (!Ps_UtilObjectService.hasValueString(data.SupplierName))
      this.layoutService.onWarning(`Vui lòng nhập Tên nhà cung cấp!`)
    else if (!Ps_UtilObjectService.hasValueString(data.OrderedTime))
      this.layoutService.onWarning(`Vui lòng chọn thời gian hiển thị!`)
    else if (!Ps_UtilObjectService.hasValueString(data.SKU))
      this.layoutService.onWarning(`Không thể yêu cầu vì đơn hàng không có sản phẩm!`)
    else
      this.listUpdateOrder.push(data)
  }
  //#endregion


  //#region ========== DIALOG DELETE / CANCEL ================
  //Hàm xử lý action xóa trong dialog
  onDeleteDialog(status: string) {
    if (status == 'yes') {
      this.APIDeleteDemesticOrders([this.dataOrder])
    }
    this.openedDia = false;
  }

  //Hàm xử lý action hủy trong dialog
  onCancelDialog(status: string) {
    if (status == 'yes') {
      this.APIUpdateDomesticOrdersStatus([this.dataOrder], null, { 'OrderTypeID': 2 });
    }
    this.openedDiaCancel = false;
  }
  //#endregion


  //#region ========== API ===========================


  /**
   * Lấy danh sách trạng thái
   * @param typeData là Type của danh sách trạng thái cần lấy
   */
  APIGetListStatus(typeData: number) {
    this.isLoading = true
    this.layoutServiceAPI.GetListStatus(typeData).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (typeData == 13) {
          this.listStatusType = res.ObjectReturn;
          this.defaultOrderTypeDropdown = this.listStatusType[0]; // lấy giá trị mặc định cho dropdown filter trên header
        } else if (typeData == 14) {
          let add = { Code: -1, StatusName: 'Tất cả', TypeData: -1, OrderBy: -1 };
          res.ObjectReturn.unshift(add)
          this.listStatusOrigin = res.ObjectReturn;

          if (Ps_UtilObjectService.hasListValue(this.listStatusType)) {

            this.listStatus = this.listStatusOrigin.filter((x) => {

              if (this.defaultOrderTypeDropdown.OrderBy == 1) {// Các status thuộc orderType "Đơn hàng đang xử lý"
                return x.OrderBy !== 8 && x.OrderBy !== 9;
              }
              else if (this.defaultOrderTypeDropdown.OrderBy == 2) {  // Các status thuộc orderType "Đơn hàng bị hủy"
                return x.OrderBy !== 8 && x.OrderBy !== 9;
              }
              else if (this.defaultOrderTypeDropdown.OrderBy == 3) {  // Các status thuộc orderType "Đơn hàng kết thúc giao hàng"
                return x.OrderBy == 8 || x.OrderBy == 9;
              }

            });
            this.listStatusCopy = this.listStatus;
          }
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tình trạng: ${res.ErrorString}`)
      }
      this.isLoading = false;
    }, err => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tình trạng:  ${err}`)
      this.isLoading = false;
    })
  }


  /**
   * Lấy danh sách đơn hàng
   * @param Filter là kendoFilter
   */
  APIGetListDomesticOrders(Filter: State) {
    this.isLoading = true;
    this.PurPOAPIService.GetListDomesticOrders(Filter).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.listOrder = res.ObjectReturn.Data;
          this.total = res.ObjectReturn.Total
          this.gridView.next({ data: this.listOrder, total: this.total })
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách mua hàng nội địa: ${res.ErrorString} `);
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách mua hàng nội địa: ${error} `);
      }
    )
  }


  /**
   * Cập nhật trạng thái đơn hàng
   * @param listItem danh sách đơn hàng muốn cập nhật Status/OrderType
   * @param objectStatusID object của Status muốn cập nhật. VD: objectStatusID = { 'StatusID': 2 };
   * @param objectOrderTypeID object của orderType muốn cập nhật. VD: objectOrderTypeID = { 'OrderTypeID': 3 };
   */
  APIUpdateDomesticOrdersStatus(listItem: DTODomesticOrders[], objectStatusID: object, objectOrderTypeID: object) {
    this.PurPOAPIService.UpdateDomesticOrdersStatus(listItem, objectStatusID, objectOrderTypeID).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess('Cập nhật trạng thái đơn hàng thành công!');
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog(); //đóng popup
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật đơn hàng nội địa: ${res.ErrorString} `);
        }
        this.isLoading = false;
        this.APIGetListDomesticOrders(this.gridState);
      },
      (error) => {
        this.isLoading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật đơn hàng nội địa: ${error} `);
        this.APIGetListDomesticOrders(this.gridState);
      }
    )
  }


  /**
   * Cập nhập thông tin đơn hàng
   * @param item là đơn hàng hiện tại
   * @param prop là mảng các trường cần cập nhật thông tin của đơn hàng
   */
  APIUpdateDomesticOrder(item: DTODomesticOrders, prop: string[]) {
    var ctx = 'Cập nhật thông tin đơn hàng'
    this.isLoading = true;
    this.PurPOAPIService.UpdateDomesticOrder(item, prop).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`);
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.isLoading = false;
        this.APIGetListDomesticOrders(this.gridState);
      },
      (error) => {
        this.isLoading = false;
        this.layoutService.onError(`2Đã xảy ra lỗi khi ${ctx}: ${error}`)
        this.APIGetListDomesticOrders(this.gridState);
      })
  }


  /**
   * Xóa đơn hàng
   * @param listItem là mảng các đơn hàng cần xóa
   */
  APIDeleteDemesticOrders(listItem: DTODomesticOrders[]) {
    this.PurPOAPIService.DeleteDemesticOrders(listItem).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess('Xóa đơn hàng thành công!');
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog(); //đóng popup
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa đơn hàng nội địa: ${res.ErrorString} `);
        }
        this.isLoading = false;
        this.APIGetListDomesticOrders(this.gridState);
      },
      (error) => {
        this.isLoading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa đơn hàng nội địa: ${error} `);
        this.APIGetListDomesticOrders(this.gridState);
      }
    )
  }
  //#endregion


  // ================= DESTROY SUB ==========
  ngOnDestroy() {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }

}