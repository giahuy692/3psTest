import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  State,
} from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { DTOHRPolicyMaster } from '../../dto/DTOHRPolicyMaster.dto';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOHRPolicyTask } from '../../dto/DTOHRPolicyTask.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { takeUntil } from 'rxjs/operators';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { PageChangeEvent } from '@progress/kendo-angular-treelist';
import { PKendoGridComponent } from 'src/app/p-app/p-layout/components/p-kendo-grid/p-kendo-grid.component';
import { SearchFilterGroupComponent } from 'src/app/p-app/p-layout/components/search-filter-group/search-filter-group.component';

@Component({
  selector: 'app-hr-task-adder',
  templateUrl: './hr-task-adder.component.html',
  styleUrls: ['./hr-task-adder.component.scss'],
})
export class HrTaskAdderComponent implements OnInit, OnDestroy, OnChanges {
  /** GIA TRI DONG MO DIALOG
   * @type {boolean}
   */
  @Input() isOpenDialog: boolean = false;

  /**
   * ITEM POLICYMASTER
   * @type {DTOHRPolicyMaster}
   */
  @Input() PolicyMaster: DTOHRPolicyMaster = new DTOHRPolicyMaster();

  /**
   * Danh sách công vieejc đã có trong chính sahcs
   * @type {DTOHRPolicyTask}
   */
  @Input() DataPolicyTask: DTOHRPolicyTask[];

  @Output() closed: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('grid') grid: PKendoGridComponent;
  @ViewChild('search') search: SearchFilterGroupComponent;

  //region Policy
  ListPolicy: DTOHRPolicyMaster[] = [];

  // CHÚA GIÁ TRỊ ĐƯỢC CHỌN CỦA DROPDOWN
  currentPolicy: { Code: number; PolicyName: string };

  // end region

  // region Grid
  gridView = new Subject<any>();
  pageSize = 25;
  pageSizes = [this.pageSize];
  skip = 0;
  // pageSizes=[this.pageSize];
  isLoading: boolean = false;

  tempSearch: {
    field: string;
    operator: string;
    value: number;
    ignoreCase: boolean;
  };
  selectedItem: DTOHRPolicyTask[] = [];

  // MẢNG CHỨA DANH SÁCH TẤT CẢ CÁC CÔNG VIỆC ĐỂ CẬP NHẬT TẤT CẢ
  ListDataBiding: DTOHRPolicyTask[] = [];
  ListPolicyTask: DTOHRPolicyTask[] = [];

  // SELECTABLE GRID SETTING
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };

  // GRID STATE
  gridState: State = {
    skip: this.skip,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  };

  // GRID STATE SYSTEM
  gridStateSys: State = {
    skip: this.skip,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  };

  gridStatePolicy: State = {
    filter: { filters: [], logic: 'and' },
  };

  // BIEN KIEM TRA CAC TRUONG CAN FILTER CHO CHINH SACH
  FilterFields: string[] = ['TaskName', 'Description'];

  // KIỂM TRA HIỂN THỊ CỘT NẾU LÀ POLICYTASK VÀ SYSTEMTASK
  hiddenTask: boolean = true;

  //  GẮN GIÁ TRỊ ITEM KHI CHỌN VÀO INPUT TRÊN GRID
  getSelectedRowitem(SelectedRowitem: []) {
    this.selectedItem = SelectedRowitem;
  }

  // end region

  // search filter box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  // DROP DOWN FILTER BOX
  filterPolicy: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  //UNSUBCRIBE
  Unsubscribe = new Subject<void>();

  //#region LYCYCLEHOOK
  constructor(
    private layoutService: LayoutService,
    private apiPolicyService: HriTransitionApiService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isOpenDialog && changes.isOpenDialog.currentValue === true) {
      this.onInitCallAPI();
      // this.APIGetListPolicy;
    }
  }

  ngOnInit(): void {
    this.onCheckTtileDialog();
    this.onPageChangeCallback = this.onPageChange.bind(this);
    // this.onLoadFilter();
  }

  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
    this.selectedItem = [];
  }

  //#endregion

  // HÀM GỌI API KHO MỞ DIALOG

  //#region HÀM CHẠY INIT
  //  CHÍNH SÁCH HỆ THỐNG - SAMPLE DATA
  samplePolicy: DTOHRPolicyMaster = {
    Code: -1,
    PolicyID: '',
    PolicyName: 'Hệ thống',
    EffDate: '',
    Description: '',
    TypeApply: 1,
    Status: 0,
    StatusName: 'Đang soạn thảo',
    NumOfTask: null,
    TypeData: null,
    ListPositionName: [],
  };

  onInitCallAPI() {
    this.FilterFields = ['TaskName', 'Description'];

    if (this.PolicyMaster.TypeData == 1) {
      this.onInitOnBoarding();
    } else if (this.PolicyMaster.TypeData == 2) {
      this.onInitOffBoarding();
    }

    this.APIGetListSYSTaskInFunction(this.gridStateSys);
    this.onInitFilterPolicy();
    this.APIGetListPolicy(this.gridStatePolicy);
  }
  // FILTER CHO ONBOARDING
  onInitOnBoarding() {
    const DLLPackage: FilterDescriptor = {
      field: 'DLLPackage',
      operator: 'contains',
      value: 'hri021-policy-onboarding-list',
    };
    const IsFunctionTaskActive: FilterDescriptor = {
      field: 'IsFunctionTaskActive',
      operator: 'eq',
      value: true,
    };
    const IsActive: FilterDescriptor = {
      field: 'IsActive',
      operator: 'eq',
      value: true,
    };

    this.gridStateSys.filter.filters.push(
      DLLPackage,
      IsFunctionTaskActive,
      IsActive
    );
  }

  // FILTER CHO OFFBOARDING
  onInitOffBoarding() {
    const DLLPackage: FilterDescriptor = {
      field: 'DLLPackage',
      operator: 'contains',
      value: 'hri021-policy-offboarding-list',
    };
    const IsFunctionTaskActive: FilterDescriptor = {
      field: 'IsFunctionTaskActive',
      operator: 'eq',
      value: true,
    };
    const IsActive: FilterDescriptor = {
      field: 'IsActive',
      operator: 'eq',
      value: true,
    };

    this.gridStateSys.filter.filters.push(
      DLLPackage,
      IsFunctionTaskActive,
      IsActive
    );
  }

  onInitFilterPolicy() {
    const status: FilterDescriptor = {
      field: 'Status',
      operator: 'eq',
      value: 2,
    };
    const typeData: FilterDescriptor = {
      field: 'TypeData',
      operator: 'eq',
      value: this.PolicyMaster.TypeData,
    };
    const typeApply: FilterDescriptor = {
      field: 'TypeApply',
      operator: 'eq',
      value: this.PolicyMaster.TypeApply,
    };
    this.gridStatePolicy.filter.filters.push(status, typeData, typeApply);
    // console.log('grid state', toDataSourceRequest(this.gridStatePolicy));
  }

  // FILTER DROPDOWN INIT
  // onFilterInit() {
  //   if (this.PolicyMaster.TypeData == 1) {
  //     this.onInitOnBoarding();
  //   } else if (this.PolicyMaster.TypeData == 2) {
  //     this.onInitOffBoarding();
  //   }

  //   // this.APIGetListSYSTaskInFunction(this.gridStateSys);
  // }

  //#endregion

  //#region PAGE CHANGE
  //PAGE CHANGE
  onPageChangeCallback: Function;
  onPageChange(event: PageChangeEvent) {
    this.onLoadFilter();
    if (this.currentPolicy.Code == -1) {
      this.gridStateSys.skip = event.skip;
      this.gridStateSys.take = event.take;
      this.pageSize = event.take;
      this.APIGetListSYSTaskInFunction(this.gridStateSys);
    } else {
      this.gridState.skip = event.skip;
      this.gridState.take = event.take;
      this.pageSize = event.take;
      this.APIGetListHRPolicyTask(this.gridState);
    }
  }
  //#endregion
  //#region HÀM CHECK
  // KIỂM TRA GẮN TITLE DIALOG
  title: string = '';
  // HÀM KIỂM TRA TITLE
  onCheckTtileDialog() {
    this.PolicyMaster.TypeApply == 1
      ? (this.title = 'THÊM CÔNG VIỆC CÓ SẲN')
      : (this.title = 'THÊM CÔNG VIỆC TỪ CHÍNH SÁCH KHÁC');
  }

  checkDataUpdate() {
    this.ListDataBiding.every;
  }

  // HÀM KIỂM TRA XEM CÓ CÔNG VIỆC ĐƯỢC CHỌN HAY KHÔNG , DISABLED NÚT CẬP NHẬT

  isButtonDisabled(): boolean {
    return !this.selectedItem || this.selectedItem.length === 0;
  }

  // HÀM SET FONT CHỮ CHO CỘT THỰC HIỆN BỞI
  checkAssigneeBy(name: string): string {
    if (name === 'Hệ thống') {
      return 'font-style: italic;';
    }
    if (name === 'Nhân sự áp dụng') {
      return 'font-weight: 600;';
    }
  }
  // HÀM KIỂM TRA VÀ GẮN STYLE CHO TEXT
  styleForSystem() {
    const listPopupElement = document.querySelectorAll('kendo-popup');
    const popup =
      listPopupElement[listPopupElement.length - 1]?.querySelector(
        'kendo-list'
      );
    const listli = popup?.querySelectorAll('li');
    if (listli) {
      // listli[0].style.display = 'none';
      listli[0].style.fontWeight = '600';
      listli[0].style.borderBottom = '1px solid black';
    }
  }

  // ham kiem tra de  hien thi dialog
  isCheckVisibilityDialog() {
    return this.isOpenDialog ? 'visible' : 'hidden';
  }
  //#endregion

  //region dropdownlist+seach

  // SỰ KIỆN CHỌN DROPDOWN
  /**
   *
   * @param event SỰ KIẾN DROPDƠN
   */
  onDropdownlistClick(event: any) {
    if (event.Code == null) {
      return;
    }
    this.currentPolicy = null;
    this.search.clear();
    this.filterSearchBox.filters = [];
    this.grid.clearSelection();
    this.currentPolicy = event;

    // console.log('event code click', this.filterSearchBox.filters);

    const filter: FilterDescriptor = {
      field: 'Policy',
      operator: 'eq',
      value: this.currentPolicy.Code,
    };
    this.filterPolicy.filters = [filter];

    this.onLoadFilter();
    if (this.currentPolicy.Code == -1) {
      this.hiddenTask = true;
      this.FilterFields = ['TaskName', 'Description'];
      this.APIGetListSYSTaskInFunction(this.gridStateSys);
    } else {
      this.APIGetListHRPolicyTask(this.gridState);
      this.FilterFields = [ 'TaskName', 'Description', 'AssigneeBy'];
      this.hiddenTask = false;
    }
  }

  /**
   * HÀM XỬ LÍ SỰ KIỆN SEARCH
   * @param event SỰ KIỆN SEARCH
   */
  handleSearch(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (event.filters[0].value === '') {
        this.gridState.skip = null;
        this.onLoadFilter();
        if (Ps_UtilObjectService.hasValue(this.currentPolicy?.Code))
          if (this.currentPolicy?.Code == -1) {
            this.APIGetListSYSTaskInFunction(this.gridStateSys);
          } else {
            this.APIGetListHRPolicyTask(this.gridState);
          }
        // API -----------
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = null;
        this.onLoadFilter();
        if (this.currentPolicy.Code == -1) {
          this.APIGetListSYSTaskInFunction(this.gridStateSys);
        } else {
          this.APIGetListHRPolicyTask(this.gridState);
        }
        // API------------
      }
    }
  }
  //   end region

  //#region FILTER
  // HÀM KIỂM TRA PUSH CÁC GIÁ TRỊ FILTER VÀO GRIDSTATE
  onLoadFilter() {
    // reset filler
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.gridStateSys.filter.filters = [];
    this.selectedItem = null;

    if (this.PolicyMaster.TypeData == 1) {
      this.onInitOnBoarding();
    } else if (this.PolicyMaster.TypeData == 2) {
      this.onInitOffBoarding();
    }

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this.gridState.filter.filters.push(this.filterSearchBox);
        this.gridStateSys.filter.filters.push(this.filterSearchBox);
      }
    }
    if (this.filterPolicy.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterPolicy);
    }
  }

  /**
   * HÀM LỌC DỮ LIỆU
   * @param data DANH SÁCH CÔNG VIỆC
   * @param DataPolicyTask DANH SÁCH CÔNG VIỆC POLICY TASK ĐÃ CÓ TRONG POLICY
   * @returns
   */
  filterListDataBiding(
    data: DTOHRPolicyTask[],
    DataPolicyTask: DTOHRPolicyTask[]
  ): DTOHRPolicyTask[] {
    return data.filter((item) => {
      if (!DataPolicyTask) return true;
      return !DataPolicyTask.some(
        (task) =>
          task.TaskName === item.TaskName &&
          task.Description === item.Description
      );
    });
  }

  //#endregion

  //#region CẬP NHẬT CÔNG VIỆC
  // HÀM CẬP NHẬT THÊM CÔNG VIỆC ĐƯỢC CHỌN
  onUpdateTask() {
    let updatedItem = [...this.selectedItem];
    this.FilterFields = [];
    let updateProperties: string[] = [
      'Code',
      'Policy',
      'TaskName',
      'PositionAssignee',
      'PositionAssignee',
      'SystemAssignee',
      'TypeAssignee',
      'AssigneeBy',
      'DateDuration',
      'ListStaffType',
      'OrderBy',
      'HasException',
      'ListException',
      'DLLPackage',
      'Description',
    ];
    if (Ps_UtilObjectService.hasValue(updatedItem)) {
      updatedItem.forEach((item) => {
        if (item && typeof item === 'object') {
          item.Code = 0;
          item.Policy = this.PolicyMaster.Code;
          if (
            Ps_UtilObjectService.hasValue((item as any).IsFunctionTaskActive)
          ) {
            item.TypeAssignee = 1;
            item.SystemAssignee = (item as any).TaskFunction;
          } else if (
            Ps_UtilObjectService.hasValue(item.PositionAssignee) &&
            Ps_UtilObjectService.hasValue(item.SystemAssignee)
          ) {
            item.TypeAssignee = 3;
          } else if (
            Ps_UtilObjectService.hasValue(item.PositionAssignee) &&
            !Ps_UtilObjectService.hasValue(item.SystemAssignee)
          ) {
            item.TypeAssignee = 2;
          }
        }
      });
      let sizeUpdateData = updatedItem.length;
      if (sizeUpdateData === 1) {
        this.APIUpdateHRPolicyTask(updatedItem[0], updateProperties);
      } else if (sizeUpdateData > 1) {
        this.APIUpdateHRListPolicyTask(updatedItem);
      }
    }
    updatedItem = null;
    this.selectedItem = null;
    this.gridStatePolicy.filter.filters = [];
  }

  // HÀM CẬP NHẬT TẤT CẢ CÔNG VIỆC
  onUpdateAll() {
    let updateData = [...this.ListDataBiding];
    if (Ps_UtilObjectService.hasListValue(updateData)) {
      updateData.forEach((item) => {
        if (item && typeof item === 'object') {
          item.Code = 0;
          item.Policy = this.PolicyMaster.Code;
          if (
            Ps_UtilObjectService.hasValue((item as any).IsFunctionTaskActive)
          ) {
            item.TypeAssignee = 1;
            item.SystemAssignee = (item as any).TaskFunction;
          } else if (
            Ps_UtilObjectService.hasValue(item.PositionAssignee) &&
            Ps_UtilObjectService.hasValue(item.SystemAssignee)
          ) {
            item.TypeAssignee = 3;
          } else if (
            Ps_UtilObjectService.hasValue(item.PositionAssignee) &&
            !Ps_UtilObjectService.hasValue(item.SystemAssignee)
          ) {
            item.TypeAssignee = 2;
          }
        }
      });
      this.APIUpdateHRListPolicyTask(updateData);
    } else {
      this.selectedItem = null;
      updateData = null;
    }
    this.gridStatePolicy.filter.filters = [];
  }
  //#endregion

  //region API

  // HÀM GỌI API LẤY DANH SÁCH POLICY DROPDOWN
  /**
   *
   * @param state : kendo filter
   * @returns
   */
  APIGetListPolicy(state: State) {
    return this.apiPolicyService
      .GetListHRPolicy(null, state)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode === 0
          ) {
            this.ListPolicy = res.ObjectReturn.Data;
            this.ListPolicy.unshift(this.samplePolicy);
            this.currentPolicy = {
              Code: this.ListPolicy[0].Code,
              PolicyName: this.ListPolicy[0].PolicyName,
            };
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách chính sách: ${res.ErrorString} `
            );
          }
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách chính sách: ${error} `
          );
        }
      );
  }
  // HÀM GỌI API LẤY DANH SÁCH CÔNG VIỆC

  /**
   *
   * @param state
   * STATE LÀ GRIDSTATE
   */

  APIGetListHRPolicyTask(state: State) {
    this.isLoading = true;
    var ctx = 'Policty ';
    this.apiPolicyService
      .GetListHRPolicyTask(state)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            let data = res.ObjectReturn.Data;
            this.ListDataBiding = this.filterListDataBiding(
              data,
              this.DataPolicyTask
            );

            this.gridView.next({
              data: this.ListDataBiding,
              total: this.ListDataBiding.length,
            });
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`
            );
          }
          this.isLoading = false;
        },
        (err) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${err}`
          );
          this.isLoading = false;
        }
      );
  }

  //HÀM GỌI API LẤY DANH SÁCH CÔNG VIỆC CỦA HỆ THỐNG
  /**
   *
   * @param state : KENDO FILTER {DLLPackage,IsFunctionTaskActive: true, IsActive: true}
   */
  APIGetListSYSTaskInFunction(state: State) {
    const ctx = 'công việc từ chính sách khác';
    this.isLoading = true;
    this.apiPolicyService
      .GetListSYSTaskInFunction(state)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            let data = res.ObjectReturn.Data;
            this.ListDataBiding = this.filterListDataBiding(
              data,
              this.DataPolicyTask
            );

            this.gridView.next({
              data: this.ListDataBiding,
              total: this.ListDataBiding.length,
            });
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`
            );
          }
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách  ${ctx}: ${error} `
          );
        }
      );
  }

  // HÀM GỌI API CẬP NHẬT CÔNG VIỆC ĐƠN
  /**
   *
   * @param DTO  ITEM CẦN CẬP NHẬT CÓ DTO LÀ POLICYTASK
   * @param propertiess CÁC TRƯỜNG YÊU CẦU ĐỂ CÓ THỂ CẬP NHẬT TASK
   */
  APIUpdateHRPolicyTask(DTO: DTOHRPolicyTask, propertiess?: any) {
    const ctx = 'công việc có sẳn';
    this.isLoading = true;
    this.apiPolicyService
      .UpdateHRPolicyTask(DTO, propertiess)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(`Cập nhật ${ctx} thành công`);
            this.onCloseDialog(1);
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString}`
            );
          }
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật ${ctx}: ${error}`
          );
          this.isLoading = true;
        }
      );
  }

  // HÀM GỌI API CẬP NHẬT NHIỀU CÔNG VIỆC
  /**
   *
   * @param DTO DANH SÁCH ITEM CÔNG VIỆC DTOPOLICYTASK
   */
  APIUpdateHRListPolicyTask(DTO: DTOHRPolicyTask[]) {
    const ctx = 'tất cả công việc có sẳn';
    this.isLoading = true;
    this.apiPolicyService
      .UpdateHRListPolicyTask(DTO)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(`Cập nhật ${ctx} thành công`);
            this.selectedItem = [];
            this.onCloseDialog(1);
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString}`
            );
          }
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật ${ctx}: ${error}`
          );
          this.isLoading = true;
        }
      );
  }

  // HÀM GỌI API LẤY DANH SÁCH CÔNG VIỆC CỦA CHÍNH SÁCH

  // end region

  // HÀM ĐÓNG DIALOG
  /**
   *
   * @param typeClose LOẠI ĐÓNG DIALOG : LÀ CẬP NHẬT , ĐÓNG
   */
  onCloseDialog(typeClose: number) {
    this.isOpenDialog = false;
    this.selectedItem = [];
    this.currentPolicy = null;
    // this.handleSearch(null);
    this.search.clear();
    this.closed.emit(typeClose);
    this.grid.clearSelection();
    this.gridStatePolicy.filter.filters = [];
    this.gridStateSys.filter.filters = [];
  }
}
