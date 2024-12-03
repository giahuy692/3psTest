import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageChangeEvent } from '@progress/kendo-angular-treelist';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  SortDescriptor,
  State,
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
import { HriDecisionApiService } from '../../shared/services/hri-decision-api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DTOHRPetitionMaster } from '../../shared/dto/DTOHRPetitionMaster.dto';
import { data } from 'jquery';

@Component({
  selector: 'app-hri025-resignation-request-list',
  templateUrl: './hri025-resignation-request-list.component.html',
  styleUrls: ['./hri025-resignation-request-list.component.scss'],
})
export class Hri025ResignationRequestListComponent implements OnInit {
  //common variable
  isLoading = false;
  isAdd = true;
  isFilterActive = true;
  tempSearch: any;
  excelValid = true;
  isFilterDisable: false;
  curDateFilterValue: any = null;
  Unsubscribe = new Subject<void>();
  isDeletePetitionDialogShow = false;
  itemPetition: DTOHRPetitionMaster = null;

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
  dangsoan_checked = false;
  dangsoan_count = 0;
  guidon_checked = true;
  guidon_count = 0;
  chapnhan_checked = false;
  chapnhan_count = 0;
  tuchoi_checked = false;
  tuchoi_count = 0;
  rutdon_checked = false;
  rutdon_count = 0;

  // app-search-filter-group
  placeholder = 'Tìm theo mã, lý do đề nghị, họ và tên, vị trí của nhân sự';

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
    value: 1,
  };
  filterStatus_guidon: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 2,
  };
  filterStatus_chapnhan: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 4,
  };
  filterStatus_tuchoi: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 5,
  };
  filterStatus_rutdon: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 3,
  };
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  filterTypeData: FilterDescriptor = {
    field: 'TypeData',
    operator: 'eq',
    value: 1,
  };

  //#region ==================================
  //#endregion

  //#region LifecycleHook

  constructor(
    public layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
    private apiService: HriDecisionApiService,
    public domSanititizer: DomSanitizer,
    private decisionService: HriDecisionApiService
  ) { }
  ngOnInit(): void {
    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onActionDropdownClickCallback = this.onActionDropdown.bind(this);
    this.onPageChangeCallback = this.onChangePage.bind(this);

    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      this.isLoading = false;
			if (Ps_UtilObjectService.hasValue(res)) {
        this.onLoadFilter();
        this.APIGetListHRPetitionMaster(this.gridState);
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
      this.APIGetListHRPetitionMaster(this.gridState);
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
    this.APIGetListHRPetitionMaster(this.gridState);
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
        this.APIGetListHRPetitionMaster(this.gridState);
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = 0;
        this.onLoadFilter();
        this.APIGetListHRPetitionMaster(this.gridState);
      }
    }
  }
  // HÀM XỬ LÍ FILTER
  onLoadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];

    this.filterStatus.filters = [];
    // TYPEDATA CỦA ĐỀ NGHỊ
    this.gridState.filter.filters.push(this.filterTypeData);

    //status
    if (this.dangsoan_checked) {
      this.filterStatus.filters.push(this.filterStatus_dangsoan);
    }

    if (this.guidon_checked) {
      this.filterStatus.filters.push(this.filterStatus_guidon);
    }

    if (this.chapnhan_checked) {
      this.filterStatus.filters.push(this.filterStatus_chapnhan);
    }

    if (this.tuchoi_checked) {
      this.filterStatus.filters.push(this.filterStatus_tuchoi);
    }
    if (this.rutdon_checked) {
      this.filterStatus.filters.push(this.filterStatus_rutdon);
    }
    if (this.filterStatus.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatus);
    }
    // SEARCH BÕ
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this.gridState.filter.filters.push(this.filterSearchBox);
      }
    }
    // FILTER DATE DROPDOWN
    if (Ps_UtilObjectService.hasValueString(this.dateString)) {
      if (this.typeAfBe == 1)
        this.gridState.filter.filters.push(this.filterFrom);
      else this.gridState.filter.filters.push(this.filterAfter);
    }
  }

  // Xử lý reset filter
  onResetFilter() {
    this.guidon_checked = true;
    this.dangsoan_checked = false;
    this.chapnhan_checked = false;
    this.tuchoi_checked = false;
    this.rutdon_checked = false;
    this.gridState.skip = 0;
    this.curDateFilterValue = null;
    this.currentFilterValue = this.optionFilterDate[0];
    this.dateString = '';

    this.onLoadFilter();
    this.APIGetListHRPetitionMaster(this.gridState);
  }

  // CHỌN DROPDOWN TỪ/TRƯỚC
  filterDay: CompositeFilterDescriptor = { logic: 'or', filters: [] };
  filterAfter: FilterDescriptor = {
    field: 'SentDate',
    operator: 'lt',
    value: '2',
  };
  filterFrom: FilterDescriptor = {
    field: 'SentDate',
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
      this.APIGetListHRPetitionMaster(this.gridState);
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
    this.APIGetListHRPetitionMaster(this.gridState);
  }

  /**
   * pages change
   * @param event EVENT
   */ onChangePage(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take;
    this.APIGetListHRPetitionMaster(this.gridState);
  }
  //#endregion

  //#region ==================================
  //#endregion

  //#region FunctionPopup
  dataPetition: any = [];
  // permission
  isAllPer: boolean = false;
  isCanCreate: boolean = false;

  /**
   * HÀM THÊM CHỨC NĂNG CHO POPUP
   * @param moreActionDropdown ACTION CỦA POPUP
   * @param dataItem DATAITEM CLICK
   * @returns
   */
  getActionDropdown(
    moreActionDropdown: MenuDataItem[],
    dataItem: DTOHRPetitionMaster
  ) {
    this.dataPetition = dataItem;
    var statusID = this.dataPetition.Status;
    moreActionDropdown = [];

    if (statusID == 1 || statusID == 2) {
      moreActionDropdown.push({
        Name: 'Chỉnh sửa',
        Code: 'edit',
        Link: '2',
        Type: 'StatusID',
        Actived: true,
      });
    } else {
      moreActionDropdown.push({
        Name: 'Xem chi tiết',
        Code: 'eye',
        Link: 'detail',
        Actived: true,
      });
    }

    if (statusID == 1) {
      moreActionDropdown.push({
        Name: 'Xóa đơn',
        Code: 'trash',
        Link: 'delete',
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
  onActionDropdown(menu: MenuDataItem, dataItem: DTOHRPetitionMaster) {
    if (dataItem.Code !== 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.itemPetition = dataItem;
        this.isDeletePetitionDialogShow = true;
      }
      else if (menu.Code == "edit"){
        this.onOpenDetail(false, dataItem);
      }
      else if (menu.Code == "eye"){
        this.onOpenDetail(false, dataItem);
      }
    } 
  }

  /**
   * HÀM XỬ LÍ MỞ TRANG CHI TIẾT , CHUYỂN TRANG
   * @param isAddNew NẾU LÀ TẠO MỚI :TRUE
   * @param dataItem DATAITEM NẾU LÀ CHỈNH SỬA
   */
  onOpenDetail(isAddNew: boolean, dataItem?: DTOHRPetitionMaster) {
    // event.stopPropagation();

    this.menuService
      .changeModuleData()
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe((item: ModuleDataItem) => {
        var parent = item.ListMenu.find(
          (f) =>
            f.Code.includes('hriRequest') ||
            f.Link.includes('hri025-resignation-request-list')
        );

        if (
          Ps_UtilObjectService.hasValue(parent) &&
          Ps_UtilObjectService.hasListValue(parent.LstChild)
        ) {
          var detail = parent.LstChild.find(
            (f) =>
              f.Code.includes('hri025-resignation-request-list') ||
              f.Link.includes('hri025-resignation-request-list')
          );

          if (
            Ps_UtilObjectService.hasValue(detail) &&
            Ps_UtilObjectService.hasListValue(detail.LstChild)
          ) {
            var detail2 = detail.LstChild.find(
              (f) =>
                f.Code.includes('hri025-resignation-request-detail') ||
                f.Link.includes('hri025-resignation-request-detail')
            );

            if (isAddNew) {
              var addNew: DTOHRPetitionMaster = new DTOHRPetitionMaster();
              addNew.IsSelf = false;
              localStorage.setItem('HrPetitionMaster', JSON.stringify(addNew));
            } else {
              localStorage.setItem(
                'HrPetitionMaster',
                JSON.stringify(dataItem)
              );
            }
            this.menuService.activeMenu(detail2);
          }
        }
      });
  }

  /**
   * HÀM ĐÓNG POPUP CONFIRM
   */
  toggleDialog() {
    this.isDeletePetitionDialogShow = !this.isDeletePetitionDialogShow;
  }

  /**
   * HÀM XỬ LÝ KHI CONFIRM XÓA ĐƠN
   */
  onDiaglogConfirm() {
    this.APIDeleteHRPetition(this.itemPetition);
  }

  //#endregion

  //#region image
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

  /**
   * HÀM XỬ LÍ COLOR CHO STATUS
   * @param statusName STATUSNAME
   * @returns
   */
  getStatusColor(statusName: string): string {
    const colorMap = {
      'Gửi đơn': 'color-blue',
      'Đang soạn thảo': 'black',
      'Chấp nhận': 'color-darkgreen',
      'Rút đơn': 'color-badred',
      'Từ chối': 'color-badred',
    };
    return colorMap[statusName] || 'black'; //DEFAULT COLOR
  }
  //#region API

  /**
   * HÀM API LẤY DANH SÁCH ĐỀ NGHỊ NGHỈ VIỆC
   * @param Filter KENDO FILTER
   */
  APIGetListHRPetitionMaster(Filter: State) {
    this.isLoading = true;
    this.apiService
      .GetListHRPetitionMaster(Filter)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            let listPetition = res.ObjectReturn.Data;
            this.total = res.ObjectReturn.Total;
            this.gridView.next({ data: listPetition, total: this.total });
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách đề nghị nghỉ việc: ${res.ErrorString} `
            );
          }
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách đề nghị nghỉ việc: ${error} `
          );
        }
      );
  }

  /**
 * HÀM API XÓA ĐƠN ĐỀ NGHỊ
 * @param DTOHRPetitionMaster đơn đề nghị cần xóa
 */
  APIDeleteHRPetition(DTOHRPetitionMaster: DTOHRPetitionMaster) {
    this.isDeletePetitionDialogShow = false;
    this.decisionService
      .DeleteHRPetition(DTOHRPetitionMaster)
      .pipe(takeUntil(this.Unsubscribe  ))
      .subscribe(
        (res) => {
          this.isDeletePetitionDialogShow = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(`Xoá đơn đề nghị thành công`);
            this.APIGetListHRPetitionMaster(this.gridState);
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi xoá đơn đề nghị: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.isDeletePetitionDialogShow = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi xoá đơn đề nghị: ${err}`
          );
        }
      );
  }

  //#endregion
}
