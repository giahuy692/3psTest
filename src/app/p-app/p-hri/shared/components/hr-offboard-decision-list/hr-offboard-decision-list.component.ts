import { formatDate } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  SortDescriptor,
  State,
  distinct,
} from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  MenuDataItem,
  ModuleDataItem,
} from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { HriDecisionApiService } from '../../services/hri-decision-api.service';
import { DTOHRDecisionMaster } from '../../dto/DTOHRDecisionMaster.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { SearchFilterGroupComponent } from 'src/app/p-app/p-layout/components/search-filter-group/search-filter-group.component';

@Component({
  selector: 'app-hr-offboard-decision-list',
  templateUrl: './hr-offboard-decision-list.component.html',
  styleUrls: ['./hr-offboard-decision-list.component.scss'],
})
export class HrOffboardDecisionListComponent {
  /**
   * Nhận vào giá trị number để kiểm tra loại của list
   * @type {number} Nếu là 1 : dùng cho danh sách quyết định nghỉ việc / 2 : dùng cho danh sách quyết định sa thải
   */
  @Input() TypeList: number = 1;

  //common variable
  isLoading = false;
  isAdd = true;
  isFilterActive = true;
  tempSearch: any;
  excelValid = true;
  isFilterDisable: false;
  curDateFilterValue: any = null;
  Unsubscribe = new Subject<void>();
  currentList: String = '';

  // DIALOG CONFIRM
  openConfirm: boolean = false;
  dataDelete: DTOHRDecisionMaster = new DTOHRDecisionMaster();

  // Data dropdown của filter ngày hiệu lực
  optionFilterDate = [
    { text: 'từ', value: 1 },
    { text: 'trước', value: 2 },
  ];
  currentFilterValue: { text: string; value: number } = {
    text: 'từ',
    value: 1,
  };
  filterDate: Date;

  //header1
  dangsoan_checked = true;
  dangsoan_count = 0;
  guiduyet_checked = true;
  guiduyet_count = 0;
  duyetapdung_checked = false;
  duyetapdung_count = 0;
  ngungapdung_checked = false;
  ngungapdung_count = 0;

  // app-search-filter-group
  placeholder = 'Tìm theo mã, tên của nhân sự hoặc mã quyết định';

  // GRID
  gridView = new Subject<any>();
  pageSize = 25;
  pageSizes = [this.pageSize];
  allowActionDropdown = [];

  skip = 0;
  sortBy: SortDescriptor = {
    field: 'Code',
    dir: 'asc',
  };
  gridState: State = {
    take: this.pageSize,
    sort: [this.sortBy],
    filter: { filters: [], logic: 'and' },
    skip: this.skip,
  };
  // grid data change
  onPageChangeCallback: Function;
  //rowItem action dropdown
  onActionDropdownClickCallback: Function;
  getActionDropdownCallback: Function;
  //grid select
  getSelectionPopupCallback: Function;
  onSelectCallback: Function;
  onSelectedPopupBtnCallback: Function;

  total = 0;

  // FILTER
  //status
  filterStatus: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  filterStatus_dangsoan: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 0,
  };
  filterStatus_guiduyet: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 1,
  };
  filterStatus_duyetapdung: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 2,
  };
  filterStatus_ngungapdung: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 3,
  };
  filterStatus_trave: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 4,
  };

  // TypeData
  filterTypeData: FilterDescriptor = {
    field: 'TypeData',
    operator: 'eq',
    value: 0,
  };

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  //#region PERMISSION
  isAllPers: boolean = false;
  isCanCreate: boolean = false;
  isCanApproved: boolean = false;
  justLoaded: boolean = true;
  dataPerm: DTODataPermission[] = [];
  actionPerm: DTOActionPermission[] = [];
  //#endregion
  @ViewChild('search') search: SearchFilterGroupComponent;

  //#region ==================================
  //#endregion

  //#region LifecycleHook

  constructor(
    public layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
    public domSanititizer: DomSanitizer,
    private apiService: HriDecisionApiService
  ) {}
  ngOnInit(): void {
    if (this.TypeList == 1) {
      this.currentList = 'resignation';
    } else {
      this.currentList = 'termination';
    }

    this.menuService
      .changePermission()
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe((res: DTOPermission) => {
        if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
          this.actionPerm = distinct(res.ActionPermission, 'ActionType');
          this.isAllPers =
            this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          this.isCanCreate =
            this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          this.isCanApproved =
            this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;

          // this.isAllPers = false
          // this.isCanCreate = false
          // this.isCanApproved = true

          this.justLoaded = false;
        }
      });

    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onActionDropdownClickCallback = this.onActionDropdown.bind(this);
    this.onPageChangeCallback = this.onChangePage.bind(this);

    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      this.isLoading = false;
			if (Ps_UtilObjectService.hasValue(res)) {
        this.onLoadFilter();
        this.APIGetListHRDecisionMaster(this.gridState, this.filterTypeData.value);
			}
		})
   
  }

  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
  //#endregion

  onLoadPage() {
    if (this.isFilterActive) {
      this.onLoadFilter();
      this.APIGetListHRDecisionMaster(
        this.gridState,
        this.filterTypeData.value
      );
    }
  }

  //#region ===========================================
  //#endregion

  //#region FILTER

  /**
   *
   * @param e VALUE CLICK
   * @param strCheck TYPE CHECKED
   */
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e;
    this.gridState.skip = 0;
    this.onLoadFilter();
    this.APIGetListHRDecisionMaster(this.gridState, this.filterTypeData.value);
  }

  // Xử lý tìm kiếm
  /**
   *
   * @param event EVENT SEARCH
   */
  handleSearch(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (event.filters[0].value === '') {
        this.gridState.skip = 0;
        this.onLoadFilter();
        this.APIGetListHRDecisionMaster(
          this.gridState,
          this.filterTypeData.value
        );
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = 0;
        this.onLoadFilter();
        this.APIGetListHRDecisionMaster(
          this.gridState,
          this.filterTypeData.value
        );
      }
    }
  }

  // HÀM XỬ LÍ FILTER
  onLoadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];

    this.filterStatus.filters = [];
    // TYPEDATA CỦA QUYẾT ĐỊNH
    if (this.currentList == 'resignation') this.filterTypeData.value = 4;
    else this.filterTypeData.value = 3;

    // this.gridState.filter.filters.push(this.filterTypeData);

    //status
    if (this.dangsoan_checked) {
      this.filterStatus.filters.push(this.filterStatus_dangsoan);
      this.filterStatus.filters.push(this.filterStatus_trave);
    }

    if (this.guiduyet_checked) {
      this.filterStatus.filters.push(this.filterStatus_guiduyet);
    }

    if (this.duyetapdung_checked) {
      this.filterStatus.filters.push(this.filterStatus_duyetapdung);
    }

    if (this.ngungapdung_checked) {
      this.filterStatus.filters.push(this.filterStatus_ngungapdung);
    }

    if (this.filterStatus.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatus);
    }

    this.onLoadFilterHeader2('gridState')
    // console.log(toDataSourceRequest(this.gridState));
  }

  // Dùng khi xuất
  exportState: State = {
    filter: { filters: [], logic: 'and' },
  };
  onLoadFilterHeader2(filNamle: string){
    // SEARCH BOX
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this[filNamle].filter.filters.push(this.filterSearchBox);
      }
    }

    // FILTER DATE DROPDOWN
    if (Ps_UtilObjectService.hasValueString(this.dateString)) {
      if (this.typeAfBe == 1)
        this[filNamle].filter.filters.push(this.filterFrom);
      else this[filNamle].filter.filters.push(this.filterAfter);
    }
  }

  // Xử lý reset filter
  onResetFilter() {
    this.guiduyet_checked = true;
    this.dangsoan_checked = true;
    this.duyetapdung_checked = false;
    this.ngungapdung_checked = false;
    this.gridState.skip = 0;
    this.curDateFilterValue = null;
    this.currentFilterValue = this.optionFilterDate[0];
    this.dateString = '';
    this.filterDate=null;
    // this.tempSearch = '';

    this.onLoadFilter();
    this.APIGetListHRDecisionMaster(this.gridState, this.filterTypeData.value);
  }

  // CHỌN DROPDOWN TỪ/TRƯỚC
  filterDay: CompositeFilterDescriptor = { logic: 'or', filters: [] };
  filterAfter: FilterDescriptor = {
    field: 'EffDate',
    operator: 'lt',
    value: '2',
  };
  filterFrom: FilterDescriptor = {
    field: 'EffDate',
    operator: 'gte',
    value: '1',
  };
  dateString: string = '';
  typeAfBe: number = this.optionFilterDate[0].value;

  /**
   * HÀM XỬ LÍ DROPDOWN TỪ TRƯỚC
   * @param event EVENT
   */
  onDropdownFilterDate(event: any) {
    this.typeAfBe = event.value;
    if (Ps_UtilObjectService.hasValueString(this.filterDate)) {
      if (event.value == 1)
        //from
        this.filterFrom.value = this.dateString;
      //before
      else this.filterAfter.value = this.dateString;

      this.onLoadFilter();
      this.APIGetListHRDecisionMaster(
        this.gridState,
        this.filterTypeData.value
      );
    }
  }

  /**
   * CHỌN DATE PICKER
   * @param event EVENT
   */
  onDatepickerChange(event: Date) {
    this.filterDate = event;
    this.gridState.skip = 0;
    this.dateString = formatDate(
      this.filterDate,
      'yyyy-MM-ddTHH:mm:ss',
      'en-US'
    );
    if (this.typeAfBe == 1) this.filterFrom.value = this.dateString;
    else this.filterAfter.value = this.dateString;
    this.onLoadFilter();
    this.APIGetListHRDecisionMaster(this.gridState, this.filterTypeData.value);
  }

  /**
   * pages change
   * @param event EVENT
   */
  onChangePage(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take;
    this.APIGetListHRDecisionMaster(this.gridState, this.filterTypeData.value);
  }
  //#endregion

  //#region ==================================
  //#endregion

  //#region FunctionPopup
  dataPetition: any = [];

  /**
   * HÀM THÊM CHỨC NĂNG CHO POPUP
   * @param moreActionDropdown ACTION CỦA POPUP
   * @param dataItem DATAITEM CLICK
   * @returns
   */
  getActionDropdown(
    moreActionDropdown: MenuDataItem[],
    dataItem: DTOHRDecisionMaster
  ) {
    this.dataDelete = dataItem;
    let status = dataItem.Status;
    moreActionDropdown = [];

    // Action CHỈNH SỬA VÀ XEM CHI TIẾT
    if (
      ((status == 0 || status == 4) && (this.isCanCreate || this.isAllPers)) ||
      (status == 1 && (this.isCanApproved || this.isAllPers))
    )
      moreActionDropdown.push({
        Name: 'Chỉnh sửa',
        Code: 'pencil',
        Type: 'edit',
        Actived: true,
      });
    else
      moreActionDropdown.push({
        Name: 'Xem chi tiết',
        Code: 'eye',
        Type: 'detail',
        Actived: true,
      });

    // Nhóm action đổi tình trạng
    if ((status == 0 || status == 4) && (this.isCanCreate || this.isAllPers)) {
      moreActionDropdown.push({
        Name: 'Gửi duyệt',
        Code: 'redo',
        Type: 'Status',
        Link: '1',
        Actived: true,
      });
    } else if (
      (status == 1 ||
        (status == 3 &&
          Ps_UtilObjectService.getDaysLeft(new Date(), dataItem.EffDate) >
            0)) &&
      (this.isCanApproved || this.isAllPers)
    ) {
      moreActionDropdown.push({
        Name: 'Trả về',
        Code: 'undo',
        Type: 'Status',
        Link: '4',
        Actived: true,
      });
      moreActionDropdown.push({
        Name: 'Phê duyệt',
        Code: 'check-outline',
        Type: 'Status',
        Link: '2',
        Actived: true,
      });
    } else if (status == 2 && (this.isCanApproved || this.isAllPers)) {
      moreActionDropdown.push({
        Name: 'Ngưng áp dụng',
        Code: 'minus-outline',
        Type: 'Status',
        Link: '3',
        Actived: true,
      });
    }

    // NGƯNG ÁP DỤNG KHI CHƯA TỚI NGÀY HIỆU LỰC
    if (status == 3 && !Ps_UtilObjectService.hasValue(dataItem.EffDate)) {
      moreActionDropdown.push({
        Name: 'Trả về',
        Code: 'undo',
        Type: 'Status',
        Link: '4',
        Actived: true,
      });
      moreActionDropdown.push({
        Name: 'Phê duyệt',
        Code: 'check-outline',
        Type: 'Status',
        Link: '2',
        Actived: true,
      });
    }
    return moreActionDropdown;
  }

  /**
   * HÀM XỬ LÍ CHỌN CHỨC NĂNG TRÊN POPUP
   * @param menu MENU DATAITEM
   * @param dataItem DATAITEM CLICK
   */
  onActionDropdown(menu: MenuDataItem, dataItem: DTOHRDecisionMaster) {
    const link = menu.Link;
    if (dataItem.Code !== 0) {
      // VÀO TRANG CHI TIẾT
      if (
        menu.Link == 'edit' ||
        menu.Code == 'pencil' ||
        menu.Link == 'detail' ||
        menu.Code == 'eye'
      )
        this.onOpenDetail(false, dataItem);

      // CẬP NHẬT TRẠNG THÁI
      if (parseInt(link) == 1 || parseInt(link) == 2) {
        if (this.onCheckField(dataItem))
          this.APIUpdateHRDecisionMasterStatus([dataItem], parseInt(link));
      } else if (parseInt(link) == 3 || parseInt(link) == 4) {
        this.APIUpdateHRDecisionMasterStatus([dataItem], parseInt(link));
      }
      if (menu.Name == 'Xóa' || menu.Code == 'trash') {
        // XOÁ
        this.openConfirm = true;
      }
    }
  }

  /**
   * HÀM KIỂM TRA FIELD CỦA DATAITEM -> TRẢ VỀ GIÁ TRỊ TRUE FALSE
   * @param dataItem DATAITEM
   * @returns
   */
  onCheckField(dataItem: DTOHRDecisionMaster) {
    let type: String = '';
    if (this.currentList == 'termination') type = 'Sa thải';
    else if (this.currentList == 'resignation') type = 'Nghỉ việc';
    let ctx = `Đã xảy ra lỗi khi cập nhật trạng thái ${type} của quyết định ${dataItem.DecisionID}: thiếu `;
    if (!Ps_UtilObjectService.hasValueString(dataItem.StaffID)) {
      this.layoutService.onError(ctx + 'Thông tin nhân sự');
      return false;
    } else if (!Ps_UtilObjectService.hasValueString(dataItem.EffDate)) {
      this.layoutService.onError(ctx + 'Ngày hiệu lực');
      return false;
    } else if (!Ps_UtilObjectService.hasValueString(dataItem.ReasonName)) {
      this.layoutService.onError(ctx + `Lý do ${type}`);
      return false;
    }
    return true;
  }

  /**
   * HÀM XỬ LÍ MỞ TRANG CHI TIẾT , CHUYỂN TRANG
   * @param isAddNew NẾU LÀ TẠO MỚI :TRUE
   * @param dataItem DATAITEM NẾU LÀ CHỈNH SỬA
   */
  onOpenDetail(isAddNew: boolean, dataItem?: DTOHRDecisionMaster) {
    // event.stopPropagation();
    var TypeData: number = -1;
    this.menuService
      .changeModuleData()
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe((item: ModuleDataItem) => {
        var parent = item.ListMenu.find(
          (f) =>
            f.Code.includes('hriDecision') ||
            f.Link.includes('"hri023-decision-hiring-list"')
        );
        if (
          Ps_UtilObjectService.hasValue(parent) &&
          Ps_UtilObjectService.hasListValue(parent.LstChild)
        ) {
          if (this.currentList == 'resignation') {
            TypeData = 4;
            var detail = parent.LstChild.find(
              (f) =>
                f.Code.includes('hri026-resignation-decision-list') ||
                f.Link.includes('hri026-resignation-decision-list')
            );
          } else if (this.currentList == 'termination') {
            TypeData = 3;
            var detail = parent.LstChild.find(
              (f) =>
                f.Code.includes('hri027-termination-decision-list') ||
                f.Link.includes('hri027-termination-decision-list')
            );
          }

          if (
            Ps_UtilObjectService.hasValue(detail) &&
            Ps_UtilObjectService.hasListValue(detail.LstChild)
          ) {
            var detail2 = detail.LstChild.find(
              (f) =>
                f.Code.includes('hri026-resignation-decision-detail') ||
                f.Link.includes('hri026-resignation-decision-detail') ||
                f.Code.includes('hri027-termination-decision-detail') ||
                f.Link.includes('hri027-termination-decision-detail')
            );

            if (isAddNew) {
              var addNew: DTOHRDecisionMaster = new DTOHRDecisionMaster();
              addNew.TypeData = TypeData;
              localStorage.setItem('HrDecisionMaster', JSON.stringify(addNew));
            } else {
              dataItem.TypeData = TypeData;
              localStorage.setItem(
                'HrDecisionMaster',
                JSON.stringify(dataItem)
              );
            }
            this.menuService.activeMenu(detail2);
          }
        }
      });
  }

  /**
   *  HÀM XỬ LÍ XOÁ QUYẾT ĐỊNH
   * @param status TRẠNG THÁI CLICK DIALOG
   */
  onDeleteDialog(status: string): void {
    if (status == 'yes') {
      this.APIDeleteHRDecisionMaster([this.dataDelete]);
    }
    this.openConfirm = false;
  }

  //#endregion

  //#region Image
  errorOccurred: any = {};

  // HÀM XỬ LÍ HÌNH ẢNH
  getResImg(str: string, imageKey: string) {
    if (Ps_UtilObjectService.hasValueString(str)) {
      let a = Ps_UtilObjectService.removeImgRes(str);
      if (this.errorOccurred[imageKey]) {
        return this.getResHachi(a);
      } else {
        return this.domSanititizer.bypassSecurityTrustResourceUrl(
          Ps_UtilObjectService.getImgRes(a)
        );
      }
    } else {
      return '../../../../../assets/img/icon/icon-nonImageThumb.svg';
    }
  }
  // HÀM HANDLE ERROR CỦA HÌNH ẢNH
  handleError(imageKey: string) {
    this.errorOccurred[imageKey] = true;
  }

  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }
  //#endregion

  //#region API

  /**
   *  API LẤY DANH SÁCH QUYẾT ĐỊNH
   * @param Filter Kendo Filter
   * @param Keyword
   */
  APIGetListHRDecisionMaster(Filter: State, TypeData: number) {
    let ctx: string = '';
    if (this.currentList == 'resignation') ctx = 'nghỉ việc';
    else ctx = 'sa thải';

    this.isLoading = true;
    this.apiService
      .GetListHRDecisionMaster(Filter, null, TypeData)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            let listDecision = res.ObjectReturn.Data;
            this.total = res.ObjectReturn.Total;
            this.gridView.next({ data: listDecision, total: this.total });
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách quyết định ${ctx}: ${res.ErrorString} `
            );
          }
        },
        (error) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách quyết định ${ctx}: ${error} `
          );
        }
      );
  }

  /**
   * API XOÁ QUYẾT ĐỊNH
   * @param ListDTO DANH SÁCH DATA DELETE
   */
  APIDeleteHRDecisionMaster(ListDTO: DTOHRDecisionMaster[]) {
    let ctx: string = 'Quyết định';
    this.apiService
      .DeleteHRDecisionMaster(ListDTO)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(`Xoá ${ctx} thành công`);
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi xoá ${ctx}: ${res.ErrorString} `
            );
          }
          this.APIGetListHRDecisionMaster(
            this.gridState,
            this.filterTypeData.value
          );
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi xoá ${ctx}: ${error} `);
        }
      );
  }

  /**
   * API CẬP NHẬT STATUS QUYẾT ĐỊNH
   * @param listDTO DTO DATAITEM
   * @param reqStatus STATUS CẦN UPDATE
   */
  APIUpdateHRDecisionMasterStatus(
    listDTO: DTOHRDecisionMaster[],
    reqStatus: number
  ) {
    let ctx: string = 'trạng thái Quyết định';
    this.apiService
      .UpdateHRDecisionMasterStatus(listDTO, reqStatus)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(`Cập nhật ${ctx} thành công`);
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString} `
            );
          }
          this.APIGetListHRDecisionMaster(
            this.gridState,
            this.filterTypeData.value
          );
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật ${ctx}: ${error} `
          );
        }
      );
  }

  /**
   * Xuất excel nhân sự quyết định nghỉ việc được duyệt
   */
  APIGetHRStaffLeaveReportExcel() {
    this.onLoadFilterHeader2('exportState')
    this.isLoading = true
    var ctx = "Xuất Excel"
    var getfileName = "StaffLeaveReportExcel.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.apiService.GetHRStaffLeaveReportExcel(this.exportState).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      this.isLoading = false;
      if (Ps_UtilObjectService.hasValue(res)) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
    }, f => {
      this.isLoading = false;
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
    });
  }

  /**
   * Xuất word nhân sự quyết định nghỉ việc được duyệt
   */
  APIGetHRStaffLeaveReportWord() {
    this.onLoadFilterHeader2('exportState')
    this.isLoading = true
    var ctx = "Xuất Excel"
    var getfileName = "StaffLeaveReportWord"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.apiService.GetHRStaffLeaveReportWord(this.exportState).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      this.isLoading = false;
      if (Ps_UtilObjectService.hasValue(res)) {
        Ps_UtilObjectService.getFile(res, getfileName,1)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
    }, f => {
      this.isLoading = false;
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
    });
  }

  //#endregion
}
