import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings,
} from '@progress/kendo-angular-grid';
import {
  CompositeFilterDescriptor,
  distinct,
  FilterDescriptor,
  orderBy,
  SortDescriptor,
  State,
} from '@progress/kendo-data-query';
import {
  MenuDataItem,
  ModuleDataItem,
} from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { takeUntil } from 'rxjs/operators';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { HriDecisionApiService } from '../../services/hri-decision-api.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Subject, Subscription } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DomSanitizer } from '@angular/platform-browser';
import { DTOPayroll } from '../../dto/DTOPayroll.dto';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DTOHRDecisionTask } from '../../dto/DTOHRDecisionTask.dto';
import { SearchFilterGroupComponent } from 'src/app/p-app/p-layout/components/search-filter-group/search-filter-group.component';
import { linkVerticalIcon } from '@progress/kendo-svg-icons';
import { DTOHRDecisionTaskLog } from '../../dto/DTOHRDecisionTaskLog.dto';
import { PKendoTextboxComponent } from 'src/app/p-app/p-layout/components/p-kendo-textbox/p-textbox.component';
import { StaffApiService } from '../../services/staff-api.service';
import { DTOListHR } from '../../dto/DTOPersonalInfo.dto';
import { DTOPosition } from '../../dto/DTOPosition.dto';
import { DTOEmployee, DTOEmployeeDetail } from '../../dto/DTOEmployee.dto';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { DTOHRDecisionProfile } from '../../dto/DTOHRDecisionProfile.dto';

@Component({
  selector: 'app-hr-boarding-list',
  templateUrl: './hr-boarding-list.component.html',
  styleUrls: ['./hr-boarding-list.component.scss'],
})
export class HrBoardingListComponent {
  //#region Input Output
  @Input() Module: number = 1; // 1: Onboard | 2: Offboard

  /**
   * 1 Chuẩn bị Onboarding/Offboarding
   * 2 Onboarding/Offboarding
   * 3 Ngưng Onboarding/Offboarding
   * 4 Onboarded/Offboarded
   */
  @Input() StepProcess: number = 1;

  //#endregion

  @ViewChild('searchFilterGroup') searchFilterGroup: SearchFilterGroupComponent;

  DecisionProfile = new DTOHRDecisionProfile();

  //#region permission
  isToanQuyen = false;
  isAllowedToCreate = false;
  isAllowedToVerify = false;
  justLoaded = true;
  actionPerm: DTOActionPermission[] = [];
  dataPerm: DTODataPermission[] = [];
  //#endregion
  //#region variable status
  isFilterActive = true;
  //#endregion

  // Grid Callback function
  getActionDropdownCallback: Function;
  onActionDropdownClickCallback: Function;
  getSelectionPopupCallback: Function;
  onSelectedPopupBtnCallback: Function;
  onSelectCallback: Function;
  onPageChangeCallback: Function;

  // Subscription CallAPi
  arrUnsubscribe: Subscription[] = [];

  //#region Filter
  // - state variable
  isOverdue: boolean = true; // Quá hạn
  isInProgress: boolean = true; // Đang thực hiện
  isCompleted: boolean = false; // Hoàn tất
  isSuspended: boolean = false; // Ngưng thực hiện
  isNotExecuted: boolean = false; // Không thực hiện
  isOpenDrawer: boolean = false; // Mở drawer

  //#region variable drawer
  isEdit: boolean = false;
  isView: boolean = false;
  currentDrawer: number; //1 : chua thuc hien; 2: khong thuc hien; 3: dang thuc hien ; 4: cho duyet ; 5: ngung thuc hien; 6: hoan tat
  isOpenReason: boolean = false;
  labelReason: string = '';
  disabledApprPos: boolean = false;
  numOfDateOverDuo: number = 0;
  numOfDateImplement: number = 0;
  oldApprovedPositionID: number = 0;
  listReason: DTOListHR[] = [];

  //#endregion

  //- filter variable
  // filterOverdue: FilterDescriptor = {
  //   field: 'IsOverdue',
  //   operator: 'eq',
  //   value: true,
  //   ignoreCase: true,
  // }; // Lọc Quá hạn
  filterInProgress: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 3,
    ignoreCase: true,
  }; // Lọc Đang thực hiện
  filterCompleted: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 6,
    ignoreCase: true,
  }; // Lọc Hoàn tất
  filterSuspended: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 5,
    ignoreCase: true,
  }; // Lọc Ngưng thực hiện
  filterNotExecuted: FilterDescriptor = {
    field: 'Status',
    operator: 'eq',
    value: 2,
    ignoreCase: true,
  }; // Lọc Không thực hiện
  isFilterDisable: boolean = false;
  //#endregion

  //#region boolean variable
  openedPopupBoarding: boolean = false;
  isLoading: boolean = false;
  //#endregion

  curDateFilterOperator: any = {
    Code: 1,
    TypeFilter: 'từ',
    ValueFilter: 'gte',
  };
  curDateFilterValue: Date;
  filtersGroup: string[] = [
    'StaffID',
    'FullName',
    'DepartmentName',
    'LocationName',
    'PositionName',
  ];
  handleFilterChange(value: any, property: string) {
    if (this.StepProcess == 2 && this.activeViewTasks) {
      this.curDateFilterValue = null;
    }
    this[property] = value;
    this.onLoadFilter();
  }

  handleOperatorChange(value: any, property: string) {
    if (Ps_UtilObjectService.hasValue(this.curDateFilterValue)) {
      this[property] = value;
      this.onLoadFilter();
    }
  }

  // variable grid staff
  ListPickedBoardingProfile: DTOHRDecisionProfile[] = [];
  gridData: DTOHRDecisionTask[] = [];
  gridTask: DTOHRDecisionTask[] = [];
  gridTaskResult: GridDataResult;
  listTaskLog: DTOHRDecisionTaskLog[] = [];

  // varible dropdown
  gridStateStaff: State = { filter: { logic: 'and', filters: [] } };

  listTypeStaff: DTOListHR[] = [];
  listPosition: DTOPosition[] = [];

  total: number = 0;
  page: number = 1;
  pageSize: number = 25;
  pageSizes: number[] = [25, 50, 75, 100];
  valueSearch: string = '';
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };
  allowActionDropdown = ['detail'];
  //- filter reset
  // sortByFromDate: SortDescriptor = {
  //   field: 'FromDate',
  //   dir: 'desc',
  // };
  filterReturned = {
    field: 'Status',
    operator: 'eq',
    value: 4,
    ignoreCase: true,
  };

  ResetState: State = {
    skip: 0,
    filter: { filters: [], logic: 'or' },
    take: this.pageSize,
    sort: [],
  };

  gridState: State = {
    skip: null,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [],
  };

  filterStatusID: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  filterTypeTask: CompositeFilterDescriptor = {
    logic: 'and',
    filters: [],
  };

  filterNumOfDate: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  //#region unsubcribe
  ngUnsubscribe$ = new Subject<void>();
  //#endregion

  //#region filter header 2
  tempSearch: {
    field: string;
    operator: string;
    value: number;
    ignoreCase: boolean;
  };
  currentDecisionType: {
    Code: number;
    DecisionType: number;
    DecisionTypeName: string;
  } = { Code: null, DecisionType: null, DecisionTypeName: 'Tất cả' };
  ListDecisionType: {
    Code: number;
    DecisionType: number;
    DecisionTypeName: string;
  }[] = [];
  ListDateFilterOperator = [
    { Code: 1, TypeFilter: 'từ', ValueFilter: 'gte' },
    { Code: 2, TypeFilter: 'trước', ValueFilter: 'lt' },
  ];

  // Filter keyword của input search
  SearchPositionTerm = '';
  //Filter bằng composite của input search
  SearchTermComposite: CompositeFilterDescriptor = { logic: 'or', filters: [] };
  //#endregion

  //#region đối tượng được chọn
  DecisionTaskForm: FormGroup; // form công việc của view công việc
  BoardingProfile: DTOHRDecisionTask = new DTOHRDecisionTask();
  //#endregion

  // Unsubcribe
  unsubscribe = new Subject<void>();

  //new 
  defautEmployeeFilter: any = { FullName: '-- Chọn --', Code: -1 }
  isLoadingEmployee: boolean = false
  isDropdownAssignee: boolean = true;
  isDropdownPositionAssignee: boolean = true;

  typeData: number = 1; // enum bước của On/Off board
  typeProfile: number = 1; // enum On/Off board

  DataHRDecisionTaskOrigin: DTOHRDecisionTask = new DTOHRDecisionTask()
  DataHRDecisionTask: DTOHRDecisionTask = new DTOHRDecisionTask()

  listHR: DTOListHR[] = []; // Danh sách loại nhân sự áp dụng
  listHRFiltered: DTOListHR[] = []; // Danh sách loại nhân sự áp dụng

  defaultHR: DTOListHR


  listStatusDropdownFitler = []

  //#region variable drawer
  isCreate: boolean = false


  //#region DATE
  minEndDate: Date = new Date()
  dateRemain: number = 0

  deadlineDate: number = 0
  titleReason: string = ''

  resquestChangeStatus: boolean = false
  isDatePickerChange: boolean = false

  listStatusDropdown = [
    { Status: 1, StatusName: 'Chưa thực hiện', actionName: 'Mở lại' },
    { Status: 2, StatusName: 'Không thực hiện', actionName: 'Không thực hiện' },
    { Status: 3, StatusName: 'Đang thực hiện', actionName: 'Mở lại' },
    { Status: 4, StatusName: 'Chờ duyệt', actionName: 'Gửi duyệt' },
    { Status: 5, StatusName: 'Ngưng thực hiện', actionName: 'Ngưng thực hiện' },
    { Status: 6, StatusName: 'Hoàn tất', actionName: 'Hoàn tất' }
  ];




  constructor(
    private menuService: PS_HelperMenuService,
    private layoutService: LayoutService,
    public domSanititizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private decisionAPIService: HriDecisionApiService,
    private apiHr: StaffApiService,
    public staffApiService: StaffApiService,
    private hriTransitionService: HriTransitionApiService,
    private formBuilder: FormBuilder
  ) { }

  //#region Init
  ngOnInit(): void {
    let that = this;

    //action dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this);

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this);
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this);

    this.onSortChangeCallback = this.sortChange.bind(this);

    this.onSelectCallback = this.selectChange.bind(this);
    this.onPageChangeCallback = this.pageChange.bind(this);
    // this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this);
    this.menuService
      .changePermission()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((res: DTOPermission) => {
        if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
          that.justLoaded = false;
          that.actionPerm = distinct(res.ActionPermission, 'ActionType');

          that.isToanQuyen =
            that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          that.isAllowedToCreate =
            that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          that.isAllowedToVerify =
            that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        }
      });
    // this.isLoading = true;

    this.menuService
      .changePermissionAPI()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res)) {
          that.loadDefault();

          this.APIGetListEmployee(0);
          this.APIGetListHRTypeStaff();
          this.APIGetListHRPolicyPosition();
          this.APIGetListHR()
          this.APIGetListHRDecisionProfile()
          this.APIGetListHRReasonStop()

          this.DecisionTaskForm = this.fb.group({
            Code: [0, Validators.required],
            TaskName: ['', Validators.required],
            Description: [''],
            OrderBy: [0],
            DateDuration: [0],
            IsLeaderMonitor: [false],
            StartDate: [''],
            EndDate: [''],
            Petition: [null],
            DecisionProfile: [null],
            ListOfTypeStaff: [null],
            Task: [null],
            Remark: [''],
            TypeData: [null],
            TypeDataName: [null],
            PositionAssignee: [null],
            AssigneeBy: [''],
            TypeAssignee: [null],
            Assignee: [null],
            AssigneeName: [''],
            AsigneeStaffID: [null],
            PositionApprovedName: [''],
            PositionApproved: [null],
            ApproveStaffID: [null],
            ApproveStaffName: [null],
            ListDecisionTaskLog: [[]], // Assuming this is an array of objects
            SuccessDate: [null],
            SentDate: [null],
            RecipientStaffName: [null],
            RecipientStaffID: [null],
            DecisionTypeName: [null],
            Reason: [null],
            ReasonDescription: [null],
          });
        }
      });
  }

  //#endregion

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  loadDefault() {
    if (this.StepProcess == 2 && this.activeViewTasks) {
      this.isOverdue = true; // Quá hạn
      this.isInProgress = true; // Đang thực hiện
      this.isCompleted = false; // Hoàn tất
      this.isSuspended = false; // Ngưng thực hiện
      this.isNotExecuted = false; // Không thực hiện
      this.filterInProgress = this.createFilter('Status', 'eq', 3, true);
    }
    this.filterSearchBox.filters = [];
    this.currentDecisionType = {
      Code: null,
      DecisionType: null,
      DecisionTypeName: 'Tất cả',
    };
    this.curDateFilterOperator = {
      Code: 1,
      TypeFilter: 'từ',
      ValueFilter: 'gte',
    };
    this.curDateFilterValue = null;
    this.gridState.skip = 0;
    this.onLoadFilterDecisionType();
    this.onLoadFilter();
  }

  loadDataBreadcumb() {
    if (this.isFilterActive) {
      this.onLoadFilter();
    }
  }

  /**
   * Hàm nhận giá trị từ pagination khi chuyển trang
   * @param event
   */
  onPageChange(event: PageChangeEvent) {
    this.page = event.skip;
    this.pageSize = event.take;
    this.gridState.skip = event.skip;
    this.gridState.take = event.take;

    this.onLoadFilter();
  }

  /**
   * Hàm xử lí khi user tiến hành filter
   * @param filterDescriptor
   */
  onFilterChange(filterDescriptor: any) {
    this.page = 1;
    this.gridState.skip = 0;
    this.gridState.filter.filters = [];
    if (filterDescriptor.filters[0]?.value != '') {
      this.gridState.filter.filters = [filterDescriptor];
    }
    this.onLoadFilter();
  }

  /**
   * Quyết định tuyền dụng	1
      Quyết định điều chuyển	2
      Quyết định sa thải	3
      Quyết định nghỉ việc	4
   */
  onLoadFilterDecisionType() {
    this.ListDateFilterOperator = [];
    this.ListDecisionType = [];
    this.ListDecisionType.push({
      Code: null,
      DecisionType: null,
      DecisionTypeName: 'Tất cả',
    });
    this.ListDateFilterOperator.push(
      { Code: 1, TypeFilter: 'từ', ValueFilter: 'gte' },
      { Code: 2, TypeFilter: 'trước', ValueFilter: 'lt' }
    );

    if (this.StepProcess > 1) {
      this.ListDateFilterOperator.push({
        Code: 3,
        TypeFilter: 'vào',
        ValueFilter: 'eq',
      });
    }

    if (this.Module == 1) {
      this.ListDecisionType.push({
        Code: 1,
        DecisionType: 1,
        DecisionTypeName: 'Tuyển dụng',
      });
      this.ListDecisionType.push({
        Code: 2,
        DecisionType: 2,
        DecisionTypeName: 'Điều chuyển',
      });
    } else {
      this.ListDecisionType.push({
        Code: 2,
        DecisionType: 2,
        DecisionTypeName: 'Điều chuyển',
      });
      this.ListDecisionType.push({
        Code: 4,
        DecisionType: 4,
        DecisionTypeName: 'Nghỉ việc',
      });
    }

    if (this.activeViewTasks) {
      this.ListDecisionType = [
        {
          Code: 1,
          DecisionType: 1,
          DecisionTypeName: 'Tháng',
        },
        {
          Code: 2,
          DecisionType: 2,
          DecisionTypeName: 'Tuần',
        },
        {
          Code: 3,
          DecisionType: 3,
          DecisionTypeName: 'Ngày',
        },
      ];
      this.currentDecisionType = {
        Code: 2,
        DecisionType: 2,
        DecisionTypeName: 'Tuần',
      };
    }
  }

  //#region filter group

  onLoadFilter() {
    // reset filler
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.filterTypeTask.filters = [];
    this.filterStatusID.filters = [];
    this.filterNumOfDate.filters = [];

    // Add filter cho checkbox header 2
    if (
      Ps_UtilObjectService.hasValue(this.StepProcess) &&
      this.activeViewStaff
    ) {
      this.gridState.filter.filters.push({
        field: 'Status',
        operator: 'eq',
        value: this.StepProcess,
        ignoreCase: true,
      });
    }

    // Chỉ thêm khi đang ở view nhân sự
    if (this.activeViewStaff) {
      this.gridState.filter.filters.push({
        field: 'BoardingType',
        operator: 'eq',
        value: this.Module,
        ignoreCase: true,
      });
    }

    if (this.activeViewTasks) {
    //   // Công việc quá hạn
    //   if (this.isOverdue) {
    //     this.filterStatusID.filters.push(this.filterOverdue);
    //   }

      // Công việc đang thực hiện
      if (this.isInProgress) {
        this.filterStatusID.filters.push(this.filterInProgress);
      }

      // Công việc hoàn tất
      if (this.isCompleted) {
        this.filterStatusID.filters.push(this.filterCompleted);
      }

      // Công việc ngưng thực hiện
      if (this.isSuspended) {
        this.filterStatusID.filters.push(this.filterSuspended);
      }

      // Công việc không  thực hiện
      if (this.isNotExecuted) {
        this.filterStatusID.filters.push(this.filterNotExecuted);
      }
    }

    if (this.filterStatusID.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatusID);
    }
    

    // filter search
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      this.gridState.filter.filters.push(this.filterSearchBox);
    }

    // Filter phân loại
    if (
      Ps_UtilObjectService.hasValue(this.currentDecisionType.DecisionType) &&
      this.activeViewStaff
    ) {
      let filter = {
        field: 'DecisionType',
        operator: 'eq',
        value: this.currentDecisionType.DecisionType,
        ignoreCase: true,
      };
      this.gridState.filter.filters.push(filter);
    }

    // Filter 'công việc theo'
    if (
      Ps_UtilObjectService.hasValue(this.currentDecisionType.DecisionType) &&
      this.activeViewTasks
    ) {
      // Filter công việc theo tháng
      if (this.currentDecisionType.DecisionType == 1) {
        const monthRange = this.getStartAndEndOfMonth();
        this.filterTypeTask.filters.push(
          { field: 'EndDate', operator: 'gte', value: monthRange.startOfMonth },
          { field: 'EndDate', operator: 'lte', value: monthRange.endOfMonth }
        );
      }

      // Filter công việc theo tuần
      if (this.currentDecisionType.DecisionType == 2) {
        const weekRange = this.getStartAndEndOfWeek();
        this.filterTypeTask.filters.push(
          { field: 'EndDate', operator: 'gte', value: weekRange.startOfWeek },
          { field: 'EndDate', operator: 'lte', value: weekRange.endOfWeek }
        );
      }
    }

    // Filter ngày bắt đầu/ngừng/boaded - filter công việc theo ngày
    if (Ps_UtilObjectService.hasValue(this.curDateFilterValue)) {
      let filter = {
        field: this.activeViewStaff ? 'StartDate' : 'EndDate',
        operator: this.curDateFilterOperator.ValueFilter,
        value: this.curDateFilterValue.toDateString(),
        ignoreCase: true,
      };
      this.gridState.filter.filters.push(filter);
    }

    if (this.filterTypeTask.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterTypeTask);
    }

    // Số ngày boarded/boarding
    if (
      Ps_UtilObjectService.hasValueString(this.NumOfDateStart) &&
      (this.StepProcess == 3 || this.StepProcess == 4)
    ) {
      this.filterNumOfDate.filters.push({
        field: 'NumOfDate',
        operator: 'gte', // lớn hơn hoặc bằng
        value: this.NumOfDateStart,
      });
    }

    if (
      Ps_UtilObjectService.hasValueString(this.NumOfDateEnd) &&
      (this.StepProcess == 3 || this.StepProcess == 4)
    ) {
      this.filterNumOfDate.filters.push({
        field: 'NumOfDate',
        operator: 'lte', // nhỏ hơn hoặc bằng
        value: this.NumOfDateEnd,
      });
    }

    if (this.filterNumOfDate.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterNumOfDate);
    }

    // Nếu là bước boarding và gọi api theo view
    if (this.StepProcess == 2 && this.activeViewTasks) {
      this.APIGetListHRTaskGroup();
    } else {
      this.APIGetListHRDecisionProfile();
    }
  }

  // Tính ngày bắt đầu và kết thúc của tuần hiện tại
  getStartAndEndOfWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Lấy ngày trong tuần (0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)
    const startOfWeek = new Date(today); // Bắt đầu từ ngày hôm nay
    const endOfWeek = new Date(today);

    // Nếu là Chủ Nhật, tính về thứ Hai của tuần trước
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    // Tính ngày bắt đầu (Thứ Hai)
    startOfWeek.setDate(today.getDate() - daysToMonday);
    // Tính ngày kết thúc (Chủ Nhật)
    endOfWeek.setDate(today.getDate() + daysToSunday);

    return { startOfWeek, endOfWeek };
  }

  // Tính ngày bắt đầu và kết thúc của tháng hiện tại
  getStartAndEndOfMonth() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày 1 của tháng
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối cùng của tháng

    return { startOfMonth, endOfMonth };
  }

  /**
   *
   * @param field trường dữ liệu
   * @param operator toán tử filter
   * @param value Giá trị cho filter đó
   * @param ignoreCase logic tìm kiếm
   * @returns FilterDescriptor
   */
  createFilter(
    field: string,
    operator: string,
    value: any,
    ignoreCase: boolean = true
  ) {
    return {
      field: field,
      operator: operator,
      value: value,
      ignoreCase: ignoreCase,
    };
  }

  //- Handle search
  handleFilterChangeSearch(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (event.filters[0].value === '') {
        this.gridState.skip = 0;
        this.onLoadFilter();
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = 0;
        this.onLoadFilter();
      }
    }
  }

  // Handle lắng nghe sự thay đổi của checkbox
  selectedChangeCheckbox(event: any, typebtn: string) {
    this[typebtn] = event;
  }

  filterChange(filterName: string, event: any) {
    this[filterName] = event;
    this.gridState.skip = 0;
    this.onLoadFilter();
  }

  //#endregion filter group

  //#region funcionCallback grid
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible;
  }

  onAddDays(date: string | Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOPayroll) {
    moreActionDropdown = [];

    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;

    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;

    // Push "Chỉnh sửa" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canVerify) {
      moreActionDropdown.push({
        Name: 'Chỉnh sửa',
        Code: 'pencil',
        Type: 'edit',
        Actived: true,
      });
    } else {
      // Nếu không thỏa điều kiện "Chỉnh sửa" thì push "Xem chi tiết"
      moreActionDropdown.push({
        Name: 'Xem chi tiết',
        Code: 'eye',
        Link: 'detail',
        Actived: true,
      });
    }

    // Push "Boarding" khi có quyền duyệt hoặc toàn quyền và nếu là bước chuẩn bị
    if (canVerify && this.StepProcess == 1) {
      moreActionDropdown.push({
        Type: 'Status',
        Name:
          this.Module == 1 && this.StepProcess == 1
            ? 'Onboarding'
            : 'Offboarding',
        Code: 'power-off',
        Link: '2',
        Actived: true,
        LstChild: [],
      });
    }

    // // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    // if (canVerify && this.Payroll.Code > 0 && (statusID === 1 || statusID === 3)) {
    //   if(Ps_UtilObjectService.hasValueString(this.Payroll.SalaryName) &&Ps_UtilObjectService.isValidDate2(this.Payroll.EffDate) && this.Payroll.NoOfEmployee > 0){
    //     moreActionDropdown.push({
    //       Type: 'StatusID',
    //       Name: 'Phê duyệt',
    //       Code: 'check-outline',
    //       Link: '2',
    //       Actived: true,
    //       LstChild: [],
    //     });
    //   }

    //   // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    //   moreActionDropdown.push({
    //     Type: 'StatusID',
    //     Name: 'Trả về',
    //     Code: 'undo',
    //     Link: '4',
    //     Actived: true,
    //     LstChild: [],
    //   });
    // }

    // // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    // if (canVerify && this.Payroll.Code > 0 && statusID === 2) {
    //   moreActionDropdown.push({
    //     Name: 'Ngưng áp dụng',
    //     Type: 'StatusID',
    //     Code: 'minus-outline',
    //     Link: '3',
    //     Actived: true,
    //     LstChild: [],
    //   });
    // }

    // // Push "Xóa" khi có quyền tạo hoặc toàn quyền và statusID === 0
    // if (canCreateOrAdmin && this.Payroll.Code > 0 && this.Payroll.NoOfEmployee == 0 && statusID === 0) {
    //   moreActionDropdown.push({
    //     Name: `Xóa ${ctx}`,
    //     Type: 'delete',
    //     Code: 'trash',
    //     Link: 'delete',
    //     Actived: true,
    //     LstChild: [],
    //   });
    // }

    // Sắp xếp theo thứ tự: xem -> chỉnh sửa -> gửi -> duyệt -> ngưng -> trả về
    return moreActionDropdown;
  }

  // Action dropdownlist
  onActionDropdownClick(menu: MenuDataItem, item: DTOHRDecisionProfile) {
    this.ListPickedBoardingProfile = [];
    if (item.Code.toString().length > 0) {
      if (menu.Link == '2') {
        this.ListPickedBoardingProfile.push(item);
        this.openedPopupBoarding = true;
      }

      if (
        menu.Link == 'edit' ||
        menu.Code == 'pencil' ||
        menu.Code == 'eye' ||
        menu.Link == 'detail'
      ) {
        // Nếu là view xem theo công việc thì xem chi tiết hoặc chỉnh sửa sẽ mởi drawer
        if (this.activeViewTasks) {
          this.isOpenDrawer = true;
        }
        // Nếu là view xem theo nhân sự thì khi bấm xem chi tiết hoặc chỉnh sửa sẽ navigate vào trang chi tiết
        else {
          this.DecisionProfile = item;

          const urls = {
            1: {
              1: 'hri028-pre-onboarding',
              2: 'hri029-onboarding',
              3: 'hri031-stop-onboarding',
              4: 'hri030-onboarded',
            },
            2: {
              1: 'hri032-pre-offboarding',
              2: 'hri033-offboarding',
              3: 'hri035-stop-offboarding',
              4: 'hri034-offboarded',
            },
          };

          // Lấy URL từ đối tượng urls dựa trên DecisionType và StepProcess
          const URL = urls[this.Module]?.[this.StepProcess] || '';

          // Mở chi tiết nếu URL tồn tại
          if (URL) {
            localStorage.setItem('HRDecisionProfile', JSON.stringify(item));
            this.openDetail(URL);
          }
        }
      }
    }
  }

  getSelectionPopup(selectedList: DTOHRDecisionProfile[]) {
    var moreActionDropdown = new Array<MenuDataItem>();
    this.ListPickedBoardingProfile = selectedList;

    // Push action onboarding/offboarding
    if (this.isToanQuyen || this.isAllowedToVerify) {
      moreActionDropdown.push({
        Type: 'Status',
        Name:
          this.Module == 1 && this.StepProcess == 1
            ? 'Onboarding'
            : 'Offboarding',
        Code: 'power-off',
        Link: '2',
        Actived: true,
        LstChild: [],
      });
    }

    return moreActionDropdown;
  }

  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (btnType == 'Status') {
      // Trạng thái phê duyệt
      if (value == 2 || value == '2') {
        this.ListPickedBoardingProfile = list;
        this.openedPopupBoarding = true;
      }
    }
  }

  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take;
  }
  //#endregion funcionCallback grid

  // // Thêm mới
  // onAdd() {
  //   this.Payroll = new DTOPayroll(null);
  //   sessionStorage.setItem('Payroll', JSON.stringify(this.Payroll));
  //   this.openDetail('detail');
  // }

  /**
   * Mở trang chi tiết
   * @param link tên của UI mới chuyển trang
   */
  openDetail(link: string) {
    let changeModuleData_sst = this.menuService
      .changeModuleData()
      .subscribe((item: ModuleDataItem) => {
        sessionStorage.setItem(
          'DecisionProfile',
          JSON.stringify(this.DecisionProfile)
        );
        var parent = item.ListMenu.find((f) =>
          f.Code.includes(this.Module == 1 ? 'hriOnboard' : 'hriOffboard')
        );
        if (
          Ps_UtilObjectService.hasValue(parent) &&
          Ps_UtilObjectService.hasListValue(parent.LstChild)
        ) {
          var detail = parent.LstChild.find(
            (f) =>
              f.Code.includes(`${link}-list`) || f.Link.includes(`${link}-list`)
          );

          var detail1 = detail.LstChild.find(
            (f) =>
              f.Code.includes(`${link}-detail`) ||
              f.Link.includes(`${link}-detail`)
          );

          this.menuService.activeMenu(detail1);
        }
      });
    this.arrUnsubscribe.push(changeModuleData_sst);
  }

  //#region switch view
  activeViewStaff: boolean = true;
  activeViewTasks: boolean = false;

  /**
   * Chuyển view xem boarding
   * @param view bao gồm 2 view: activeViewStaff | activeViewTasks
   */
  changeView(viewActive: string, viewUnavailable: string) {
    this[viewActive] = true;
    this[viewUnavailable] = false;

    // Set lại trường search theo view cho component search-filter-group
    if(this.activeViewStaff){
      this.filtersGroup = ['StaffID', 'FullName', 'DepartmentName', 'LocationName', 'PositionName', ] 
    } else {
      this.filtersGroup = ['TaskName', 'Description', 'FullName', 'StaffID', 'ApprovedID', 'ApprovedName', 'AssigneeID', 'AssigneeName'];
    }

    this.filterSearchBox.filters = [] // reset filter search
    this.curDateFilterValue = null;
    this.currentDecisionType = {
      Code: null,
      DecisionType: null,
      DecisionTypeName: 'Tất cả',
    };
    this.curDateFilterOperator = {
      Code: 1,
      TypeFilter: 'từ',
      ValueFilter: 'gte',
    };

    if(this.activeViewTasks){
      this.getTypeBoarding();
    }
    this.searchFilterGroup.value = '';
    this.onLoadFilterDecisionType();
    this.onLoadFilter();
  }
  //#endregion

  //#region TASK LOG
  isShowDialogTaskLog: boolean = false;

  icons = { linkVertical: linkVerticalIcon };

  statusDrawer: number = 0;

  ListDecisionTask: DTOHRDecisionTask[] = [];
  DataDecisionTask: DTOHRDecisionTask = new DTOHRDecisionTask();

  DataDrawer: DTOHRDecisionTask;

  handleOpenTaskLog() {
    // FILTER TASKLOG
    const filterListTaskLogState: State = {
      filter: { filters: [], logic: 'and' },
    };

    const filterTaskLog: FilterDescriptor = {
      field: 'DecisionTask',
      operator: 'eq',
      value: this.MultiForm.value.Code,
      ignoreCase: true,
    };

    // filterListTaskLog.filters.push(filterTaskLog);
    filterListTaskLogState.filter.filters.push(filterTaskLog);
    this.APIGetListHRDecisionTaskLog(filterListTaskLogState);
    this.isShowDialogTaskLog = true;
  }

  handleCloseTaskLog() {
    this.isShowDialogTaskLog = false;
  }

  handleCloseDrawer(): void {
    this.isOpenDrawer = false;
    this.isView = false;
    this.isEdit = false;
    this.MultiForm.reset();
    this.DecisionProfile = this.MultiForm.value;
    this.dateRemain = 0
    this.isDatePickerChange = false
  }

  handleOpenDrawer(): void {
    // this.isView = false;
    // this.isEdit = false;
    // this.MultiForm = this.onLoadForm();
    // this.onSetStatusForm();

    // this.isOpenDrawer = true;
    // this.onGetStatusDropdown();

    // const assignee = this.MultiForm.get('PositionAssignee').value
    // if(assignee){
    //   this.gridStateStaff.filter.filters = [{field: 'CurrentPosition', operator: 'eq', value: assignee}]
    //   this.APIGetListEmployee(0)
    // }

    //Lấy ngày làm
    this.handleCalDate(this.MultiForm.get("StartDate").value, this.MultiForm.get("EndDate").value)
    this.handleCalDeadline(this.MultiForm.get("EndDate").value)

    this.isOpenDrawer = true
    this.openDatePicker()
    this.onGetStatusDropdown()

    console.log(this.MultiForm)
  }

  mockDataResource = [
    {
      resourceName: 'Máy tính xách tay',
      resourceType: 'Thiết bị điện tử',
      price: 15000000,
    },
    {
      resourceName: 'Máy chiếu',
      resourceType: 'Thiết bị văn phòng',
      price: 5000000,
    },
    {
      resourceName: 'Bàn làm việc',
      resourceType: 'Nội thất',
      price: 2000000,
    },
    {
      resourceName: 'Tủ hồ sơ',
      resourceType: 'Nội thất',
      price: 2500000,
    },
    {
      resourceName: 'Điện thoại di động',
      resourceType: 'Thiết bị điện tử',
      price: 10000000,
    },
    {
      resourceName: 'Ghế văn phòng',
      resourceType: 'Nội thất',
      price: 1200000,
    },
    {
      resourceName: 'Máy in',
      resourceType: 'Thiết bị văn phòng',
      price: 3000000,
    },
  ];

  /**
   * Kiểm tra xe trên drawer show thực hiện bởi hệ thống không
   * @returns
   */
  handleCheckTaskOfSystem(): boolean {
    return false;
  }

  //#endregion

  //#region tài sản thu hồi
  handleAssetRecovery(
    action: string,
    inputRef?: PKendoTextboxComponent,
    data?: { PositionName: string; Code: number; ID: string }
  ) {
    if (action == 'add') {
      this.currentListPosition.unshift({ PositionName: '', Code: 0, ID: null });
    }

    if (action == 'trash') {
      this.currentListPosition.filter((v) => {
        v !== data;
      });
      this.layoutService.onError(`Xóa thành công`);
    }
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

  /**
   * Hàm get loại data cho task list
   */
  getTypeDataTaskList(): number {
    if (this.StepProcess == 1) {
      if (this.Module == 1) {
        return 1;
      } else {
        return 2;
      }
    } else if (this.StepProcess == 2) {
      if (this.Module == 1) {
        return 3;
      } else {
        return 4;
      }
    } else if (this.StepProcess == 3) {
      if (this.Module == 1) {
        return 7;
      } else {
        return 8;
      }
    } else if (this.StepProcess == 4) {
      if (this.Module == 1) {
        return 5;
      } else {
        return 6;
      }
    }
  }
  //#endregion

  //#region Pôpup
  //- Kích hoạt Boarding
  handlePopupBoading() {
    this.APIUpdateHRDecisionProfileStatus(this.ListPickedBoardingProfile, 2);
    this.openedPopupBoarding = false;
  }
  //#endregion

  //#region column số ngày boarding
  isExpandFilterNumOfDate: boolean = false;
  NumOfDateStart: number = null;
  NumOfDateEnd: number = null;
  popupAnchor: any; // lưu anchor
  //#endregion

  //#region hàm xử lý popup

  //- popup onboarding/offboarding
  // Hàm này sẽ trả về danh sách tên và mã của các item bị ẩn dưới dạng chuỗi
  onGetRemainingItemsTooltip(): string {
    return this.ListPickedBoardingProfile.slice(2)
      .map((item) => `${item.FullName} - ${item.StaffID}`)
      .join('\n');
  }

  //#endregion

  /**
   * Hàm tính số ngày còn lại của task
   */
  getLeftDateTask(endDate: string): number {
    const end = new Date(endDate);
    const currentDate = new Date(new Date());

    // Đặt thời gian của cả hai ngày thành nửa đêm
    end.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Tính số ngày khác biệt
    const diffInTime = currentDate.getTime() - end.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

    return diffInDays;
  }

  //#region API
  /**
   * API lấy danh sách hồ sơ boarding
   */
  APIGetListHRDecisionProfile() {
    const apiText =
      'Chuẩn bị ' + (this.Module == 1 ? 'Onboarding' : 'Offboarding');
    this.isLoading = true;
    this.decisionAPIService
      .GetListHRDecisionProfile(this.gridState)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.gridData = res.ObjectReturn.Data;
            this.total = res.ObjectReturn.Total;
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách hồ sơ ${apiText}: ` +
              res.ErrorString
            );
          }
        },
        (err) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách hồ sơ ${apiText}: ${err}`
          );
        }
      );
  }

  /**
   * Lấy danh sách công việc boarding
   * @param filter State
   * @param isOverdue công việc quá hạn
   * @param isWorking công việc đang thực hiện
   * @param isDone công việc hoàn tất
   * @param isPause công việc ngưng
   * @param isNot công không thực hiện
   * @param keyWord từ khóa muốn tìm kiếm
   */
  APIGetListHRTaskGroup() {
    this.isLoading = true;
    this.decisionAPIService
      .GetListHRTaskGroup(
        this.gridState,
        this.isOverdue
      )
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isLoading = false;

          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.gridTask = res.ObjectReturn.Data;
            this.gridTaskResult = {
              data: orderBy(this.gridTask, this.sort),
              total: this.gridTask.length,
            };
            this.onLoadFilterDate(this.gridTask);
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách công việc: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách công việc: ${err}`
          );
        }
      );
  }

  /**
   * API lấy danh sách hồ sơ boarding
   */
  APIUpdateHRDecisionProfileStatus(
    listDTO: DTOHRDecisionProfile[],
    status: number
  ) {
    const apiText = this.Module == 1 ? 'Onboarding' : 'Offboarding';
    // this.isLoading = true;
    this.decisionAPIService
      .UpdateHRDecisionProfileStatus(listDTO, status)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          // this.isLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.APIGetListHRDecisionProfile();
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi tình trạng hồ sơ ${apiText}: ` +
                res.ErrorString
            );
          }
        },
        (err) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi tình trạng hồ sơ ${apiText}: ${err}`
          );
        }
      );
  }

  APIGetListHRDecisionTaskLog(filter: State) {
    this.decisionAPIService
      .GetListHRDecisionTaskLog(filter)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isLoading = false;

          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.listTaskLog = res.ObjectReturn.Data;
            this.listTaskLog.sort((a, b) => (b.OrderBy || 0) - (a.OrderBy || 0));
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy lịch sử thay đổi: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy lịch sử thay đổi: ${err}`
          );
        }
      );
  }

  APIGetListHRTypeStaff() {
    const typeData = 5; // Định nghĩa giá trị chính xác của typeData
    this.apiHr
      .GetListHR(typeData)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode === 0
          ) {
            this.listTypeStaff = res.ObjectReturn;
          } else[`Đã xảy ra lỗi khi lấy danh sách : ${res.ErrorString}`];
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật trạng thái : ${error}`
          );
        }
      );
  }

  listEmployee: DTOEmployee[] = [];
  listEmployeeFilter: DTOEmployee[] = [];

  /**
   * API Get EMployee
   * 0 default
   * 1 assignee
   * 2 approve
   */
  APIGetListEmployee(status: 0 | 1 | 2) {
    this.listEmployeeFilter = [];
    this.isLoadingEmployee = true;

    this.staffApiService.GetListEmployee(this.gridStateStaff).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && res.StatusCode == 0) {
        this.listEmployee = res.ObjectReturn.Data;
        this.listEmployeeFilter = res.ObjectReturn.Data;
        // Kiểm tra nếu listEmployeeFilter rỗng
        if (!this.listEmployeeFilter || this.listEmployeeFilter.length === 0) {
          if (status == 1) {
            this.MultiForm.controls['Assignee'].reset(); // Reset về giá trị mặc định
            this.isDropdownAssignee = true; // Disable Dropdown
          } else if (status == 2) {
            this.MultiForm.controls['Approved'].reset(); // Reset về giá trị mặc định
            this.isDropdownPositionAssignee = true; // Disable Dropdown
          }

        } else {
          if (status == 1) {
            this.isDropdownAssignee = false; // Enable Dropdown
          } else if (status == 2) {
            this.isDropdownPositionAssignee = false;
          }

        }

      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân viên: ${res.ErrorString}`);
      }
      this.isLoadingEmployee = false;
    }, (error) => {
      this.isLoadingEmployee = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân viên: ${error}`);
    });
  }

  /**
* API lấy danh sách chức danh áp dụng
*/
  APIGetListHRReasonStop() {
    this.staffApiService
      .GetListHR(23)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res) => {
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.listReason = res.ObjectReturn;
        }
      }, (error) => {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi lấy danh sách chức danh áp dụng: ${error}`
        );
      });
  }


  APIUpdateHRDecisionTask(data: DTOHRDecisionTask) {
    // this.isLoading = true;
    this.decisionAPIService
      .UpdateHRDecisionTask(data)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess('Thêm công việc thành công');
            this.APIGetListHRTaskGroup();
            this.handleCloseDrawer()
            
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi ${this.isEdit ? 'Cập nhật' : 'Thêm mới'
              } công việc  ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi ${this.isEdit ? 'Cập nhật' : 'Thêm mới'
            }  công việc )}: ${err}`
          );
        }
      );
  }

  /**
* API lấy danh sách chức danh áp dụng
*/
  APIGetListHR() {
    this.staffApiService
      .GetListHR(5)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res) => {
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.listHR = res.ObjectReturn;
          this.listHRFiltered = res.ObjectReturn;
        }
      }, (error) => {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi lấy danh sách chức danh áp dụng: ${error}`
        );
      });
  }

  /**
   * Filter dropdown
   */
  handleFilter(value, searchFields: any, textField: string) {
    if (Ps_UtilObjectService.hasListValue(this.listEmployee)) {
      if (Ps_UtilObjectService.hasListValue(searchFields)) {
        this.listEmployeeFilter = this.listEmployee.filter((s) =>
          searchFields.some((field) => {
            const fieldValue = s[field];
            return (
              fieldValue &&
              Ps_UtilObjectService.containsString(fieldValue.toString(), value)
            );
          })
        );
      } else {
        this.listEmployeeFilter = this.listEmployee.filter((s) =>
          Ps_UtilObjectService.containsString(s[textField], value)
        );
      }
    }
  }

  // API lấy danh sách chức danh

  APIGetListHRPolicyPosition() {
    this.hriTransitionService
      .GetListHRPolicyPosition()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.currentListPosition = res.ObjectReturn;
          }
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách chức danh: ${error}`
          );
        }
      );
  }
  //#endregion

  //#region DRAWER

  // SET CURRENT VALUE DROPDOWN
  currentListPosition: { PositionName: string; Code: number; ID: string }[] =
    [];

  listStatusDrodpown: { Status: number; StatusName: String }[] = [];
  // onGetStatusDropdown() {
  //   this.listStatusDrodpown = [];
  //   if (Ps_UtilObjectService.hasValue(this.DecisionProfile.Status)) {
  //     let Status = this.DecisionProfile.Status;
  //     const stop = { Status: 5, StatusName: 'Ngưng thực hiện' };
  //     const noImplement = { Status: 2, StatusName: 'Không thực hiện' };
  //     const sentAppr = { Status: 4, StatusName: 'Gửi duyệt' };
  //     const implement = { Status: 3, StatusName: 'Đang thực hiện' };
  //     const done = { Status: 6, StatusName: 'Hoàn tất' };
  //     const defaultIpl = { Status: 1, StatusName: 'Chưa thực hiện' };

  //     if (this.isView || this.isEdit) {
  //       switch (Status) {
  //         case 1:
  //           this.listStatusDrodpown.push(defaultIpl);
  //           this.listStatusDrodpown.push(stop);
  //           this.listStatusDrodpown.push(done);
  //           break;
  //         case 2:
  //           this.listStatusDrodpown.push(noImplement);
  //           this.listStatusDrodpown.push(implement);
  //           break;
  //         case 3:
  //           this.listStatusDrodpown.push(implement);
  //           this.listStatusDrodpown.push(stop);
  //           this.listStatusDrodpown.push(sentAppr);
  //           break;
  //         case 4:
  //           this.listStatusDrodpown.push(sentAppr);
  //           this.listStatusDrodpown.push(done);
  //           break;
  //         case 5:
  //           this.listStatusDrodpown.push(stop);
  //           this.listStatusDrodpown.push(implement);
  //           break;
  //         case 6:
  //           this.listStatusDrodpown.push(done);

  //           break;
  //         default:
  //         // code block
  //       }
  //     } else if (this.StepProcess == 1) {
  //       this.listStatusDrodpown.push(defaultIpl);
  //     } else {
  //       this.listStatusDrodpown.push(implement);
  //     }
  //     return this.listStatusDrodpown;
  //   }
  // }

  /**
 * Get action dropdown status drawer
 */
  onGetStatusDropdown() {
    this.listStatusDropdownFitler = []; // Khởi tạo danh sách lọc rỗng

    const statusMap = new Map<number, number[]>([
      [1, [1, 2]], // Chưa thực hiện, Không thực hiện
      [2, [2, 3]], // Không thực hiện, Đang thực hiện
      [3, this.Module === 1 ? [3, 5, 6] : [3, 5, 4]], // Đang thực hiện tùy theo module
      [4, [4, 6]], // Chờ duyệt, Hoàn tất
      [5, [5, 3]], // Ngưng thực hiện, Đang thực hiện
      [6, [6]] // Hoàn tất
    ]);
    
    if (Ps_UtilObjectService.hasValue(this.DataHRDecisionTask.Status)) {
      const statuses = statusMap.get(this.DataHRDecisionTask.Status) || [];
      this.listStatusDropdownFitler = this.listStatusDropdown.filter(status =>
        statuses.includes(status.Status)
      );
    }
    
  }
  

  onSetStatusForm() {
    if (this.StepProcess == 1) {
      this.MultiForm.get('Status').setValue(1);
    } else {
      this.MultiForm.get('Status').setValue(3);
    }
  }

  //#region FORM

  MultiForm: UntypedFormGroup;

  onLoadForm(): UntypedFormGroup {
    const form = this.formBuilder.group({});
    const dto = new DTOHRDecisionTask();

    Object.keys(dto).forEach((key) => {
      const value = dto[key];
      if (key === 'Code' || key === 'Status') {
        form.addControl(
          key,
          this.formBuilder.control(dto[key], Validators.required)
        );
      } else {
        form.addControl(key, this.formBuilder.control(value));
      }
    });

    return form;
  }
  //#endregion

  //#region HANDLE DROPDOWN DRAWER
  onDropdownClick(event, prop: string) {
    const formControl = this.MultiForm.get(prop);
    switch (prop) {
      case 'ListOfTypeStaff':
        formControl?.setValue(`[${[event]}]`);
        break;

      case 'Status':
        this.getTitleReason(event)
        if (this.MultiForm.get("Status").value != this.DataHRDecisionTaskOrigin.Status) {
          this.resquestChangeStatus = true
          this.MultiForm.get("Reason")?.reset();
          this.MultiForm.get("ReasonDescription")?.reset();
        } else {
          this.resquestChangeStatus = false
          this.MultiForm.get('Reason')?.setValue(this.DataHRDecisionTaskOrigin.Reason);
          this.MultiForm.get('ReasonDescription')?.setValue(this.DataHRDecisionTaskOrigin.ReasonDescription);
        }
        break;

      case 'PositionAssignee':
        if (event) {
          this.gridStateStaff.filter.filters = [{ field: 'CurrentPosition', operator: 'eq', value: event }];
          this.APIGetListEmployee(1);
          formControl?.setValue(event);
        } else {
          this.MultiForm.get("Assignee")?.reset();
          this.isDropdownAssignee = true;
        }
        break;

      case 'PositionApproved':
        if (event) {
          this.gridStateStaff.filter.filters = [{ field: 'CurrentPosition', operator: 'eq', value: event }];
          this.APIGetListEmployee(2);
          formControl?.setValue(event);
        } else {
          this.MultiForm.get("PositionApproved")?.reset();
          this.isDropdownPositionAssignee = true;
        }
        break;

      case 'IsLeaderMonitor':
        const status = event.isTrusted
        formControl?.setValue(status);
        break
      
      case 'ListHRDecisionProfile':
        formControl?.setValue(event);
        break

      default:
        formControl?.setValue(event);
        break;
    }
  }

  onDatepickerChange(event, prop: string) {
    if (event instanceof Date) {
      this.isDatePickerChange = true
      this.MultiForm.get(prop)?.setValue(event.toISOString());
      this.handleCalDate(this.MultiForm.get("StartDate").value, this.MultiForm.get("EndDate").value)
      this.handleCalDeadline(this.MultiForm.get("EndDate").value)
    } else {
      console.error("Sự kiện không phải là đối tượng Date:", event);
    }
  }

  /**
 * Calculate date remain
 */
  handleCalDate(createTime: any, endDate: any) {
    // Đảm bảo startDate và endDate là đối tượng Date
    let normalizedStartDate: Date
    let normalizedEndDate: Date

    // if (!endDate) {
    //   normalizedEndDate = Ps_UtilObjectService.addDays(new Date(), 1)
    // }else{

    // }
    normalizedStartDate = new Date()
    normalizedEndDate = new Date(endDate)

    // Kiểm tra nếu normalizedStartDate và normalizedEndDate là ngày hợp lệ
    if (isNaN(normalizedStartDate.getTime()) || isNaN(normalizedEndDate.getTime())) {
      // console.log("Ngày không hợp lệ")
      return 0; // Hoặc xử lý lỗi phù hợp
    }

    // Đặt giờ về 00:00:00
    normalizedStartDate.setHours(0, 0, 0, 0);
    normalizedEndDate.setHours(0, 0, 0, 0);

    if (!normalizedStartDate || !normalizedEndDate || normalizedEndDate < normalizedStartDate) {
      return 0;
    } else {
      if(createTime && !this.isDatePickerChange){
        let normalizedCreateTime: Date = new Date(createTime)
        normalizedCreateTime.setHours(0, 0, 0, 0);
        this.dateRemain = Ps_UtilObjectService.getDaysLeft(normalizedCreateTime, normalizedEndDate);
      }else{
        this.dateRemain = Ps_UtilObjectService.getDaysLeft(normalizedStartDate, normalizedEndDate);
      }
    }

  }

  /**
   * Calculate deadline
   */
  handleCalDeadline(endDate: any) {
    const curDate = new Date()
    const normalizedEndDate = new Date(endDate)

    if (!endDate) {
      this.deadlineDate = 0
    } else {
      curDate.setHours(0, 0, 0, 0);
      normalizedEndDate.setHours(0, 0, 0, 0);

      this.deadlineDate = Ps_UtilObjectService.getDaysLeft(normalizedEndDate, curDate);
    }


  }

  /**
* Datepicke change
*/
  openDatePicker() {
    let startDateValue = '';
    startDateValue = new Date().toISOString();
    

    // Chuyển đổi startDateValue thành ngày và tính toán minEndDate
    const startDate = startDateValue ? new Date(startDateValue) : null;

    if (startDate && !isNaN(startDate.getTime())) {
      this.minEndDate = Ps_UtilObjectService.addDays(startDate, 1); // Ngày hợp lệ
    } else {
      this.minEndDate = null; // Ngày không hợp lệ hoặc không có giá trị
    }
  }

  onCheckedLeader() {
    if (this.MultiForm.value.IsLeaderMonitor) {
      this.disabledApprPos = false;
      this.MultiForm.get('IsLeaderMonitor').setValue(false);
      if (
        this.oldApprovedPositionID !== 0 ||
        Ps_UtilObjectService.hasValue(this.oldApprovedPositionID)
      ) {
        this.MultiForm.get('ApprovedPositionID').setValue(
          this.oldApprovedPositionID
        );
      }
    } else if (this.MultiForm.value.IsLeaderMonitor == false) {
      this.MultiForm.get('IsLeaderMonitor').setValue(true);
      this.disabledApprPos = true;
      this.MultiForm.get('ApprovedPositionID').setValue(null);
    }
  }

  onCalcNumByEndDate(dataItem) {
    const task = dataItem.ListHRDecisionTaskLog.find((l) => l.Status == 4);
    const sendDate = task ? task.LastModifiedTime : null;
    const endDate = new Date(dataItem.EndDate);
    endDate.setHours(0, 0, 0, 0);

    if (Ps_UtilObjectService.hasValue(sendDate)) {
      sendDate.setHours(0, 0, 0, 0);
    }
    const newDate = new Date();
    newDate.setHours(0, 0, 0, 0);

    if (
      (!task &&
        dataItem.Status == 3 &&
        Ps_UtilObjectService.getDaysLeft(endDate, newDate) > 0) ||
      (task && Ps_UtilObjectService.getDaysLeft(endDate, sendDate) > 0)
    ) {
      this.numOfDateOverDuo =
        Ps_UtilObjectService.getDaysLeft(endDate, newDate) ||
        Ps_UtilObjectService.getDaysLeft(endDate, sendDate);
    }
  }

  onSubmit() {
    const data = this.MultiForm.value;

    if (
      !Ps_UtilObjectService.hasValue(data.TaskName) ||
      data.TaskName.trim() === ''
    ) {
      this.layoutService.onError('Tên công việc không được để trống .');
    } else if (!Ps_UtilObjectService.hasValue(data.Assignee)) {
      this.layoutService.onError('Thực hiện bởi không được để trống .');
    } else if (
      !Ps_UtilObjectService.hasValue(data.EndDate) ||
      data.EndDate.trim() === ''
    ) {
      this.layoutService.onError('Hoàn tất hết ngày không được để trống .');
    } else if (
      !Ps_UtilObjectService.hasValue(data.RecipientStaffID) &&
      !Ps_UtilObjectService.hasListValue(data.ListHRDecisionProfile) &&
      data.RecipientStaffID.trim() === ''
    ) {
      this.layoutService.onError('Nhân sự áp dụng không được để trống .');
    } else {
      const code = data.ListOfTypeStaff?.Code;

      data.ListOfTypeStaff = `[${[code]}]`;
      data.TypeDecision = this.StepProcess;
      // data.BoardingType = this.Module;
      this.APIUpdateHRDecisionTask(data);
      this.handleCloseDrawer();
    }
  }

  //#endregion

  //#endregion
  //#region --------------------------------------------

  //#region HIEU HANDLE

  /** HÀM XỬ LÝ LẤY NGÀY  CỦA CÁC ITEM
   * @param listDecisionTask DANH SÁCH GRID ITEM
   */
  onLoadFilterDate(listDecisionTask: DTOHRDecisionTask[]) {
    this.onGetEndDate(listDecisionTask);
  }

  /**
   *HÀM LẤY DANH SÁCH PROFILE KHI HOVER VÀO TRẠNG THÁI Ở COLUM GRID CÔNG VIỆC
   @param dataItem DATAITEM
   @param Status TRẠNG THÁI HOVER VÀO
   * @returns
   */
  onGetListProfileByStatus(dataItem: any, Status: number): string {
    let filteredProfiles: DTOHRDecisionTask[] = [];

    //LOGIC XỬ LÝ LẤY ITEM
    dataItem.ListChild.forEach((profile) => {
      const task = profile.ListHRDecisionTaskLog.find((l) => l.Status == 4);
      const sendDate = task ? task.LastModifiedTime : null;
      const newDate = new Date();
      newDate.setHours(0, 0, 0, 0);

      if (Status == profile.Status && Status !== 7) {
        filteredProfiles = [];

        filteredProfiles.push(profile);
      } else if (Status == 7) {
        if (
          (profile.Status == 3 &&
            Ps_UtilObjectService.getDaysLeft(profile.EndDate, newDate) > 0) ||
          (task &&
            Ps_UtilObjectService.getDaysLeft(profile.EndDate, sendDate) > 0)
        ) {
          filteredProfiles = [];
          filteredProfiles.push(profile);
        }
      }
    });

    //HIỂN THỊ ITEM DƯỚI DẠNG FULLNAME | ID , VÀ XUỐNG HÀNG
    const data = filteredProfiles
      .map((item) => `${item.FullName} | ${item.StaffID}`)
      .join('\n');
    return data;
  }

  /**
   * HÀM TRẢ RA GIÁ TRỊ END DATE GẦN NHẤT
   *@param dataItem DATAITEM
   * @returns
   */
  onGetEndDate(listDecisionTask: DTOHRDecisionTask[]) {
    let minEndDate: Date;

    listDecisionTask.forEach((s) => {
      if (Ps_UtilObjectService.hasListValue(s.ListChild)) {
        minEndDate = s.ListChild.reduce((minDate, current) => {
          const currentEndDate = new Date(current.EndDate);
          if (!minDate) {
            return currentEndDate;
          }
          return currentEndDate < minDate ? currentEndDate : minDate;
        }, null as Date | null);
      }

      // SET TRƯỜNG ẢO
      s.EndDate = minEndDate.toISOString();
      return minEndDate?.toISOString();
    });
  }

  /**
   * HÀM XỬ LÝ NGÀY QUÁ HẠN GẦN NHẤT
   * @param dataItem DATAITEM
   * @returns
   */
  onGetOverDueDate(dataItem: DTOHRDecisionTask) {
    if (Ps_UtilObjectService.hasListValue(dataItem.ListChild)) {
      let minEndDate: Date;
      let filteredProfiles: DTOHRDecisionTask[] = [];

      // LOGIC LẤY NGÀY QUÁ HẠN
      dataItem.ListChild.filter((profile) => {
        const task = profile.ListHRDecisionTaskLog.find((l) => l.Status == 4);
        const sendDate = task ? task.LastModifiedTime : null;
        if (
          profile.Status == 3 &&
          Ps_UtilObjectService.getDaysLeft(profile.EndDate, new Date()) > 0
        ) {
          filteredProfiles.push(profile);
        } else if (
          task &&
          Ps_UtilObjectService.getDaysLeft(profile.EndDate, sendDate) > 0
        ) {
          filteredProfiles.push(profile);
        }
      });

      // LOGIC XỬ LÝ NGÀY QUÁ HẠN GẦN NHẤT
      let proFileCheck: DTOHRDecisionTask = new DTOHRDecisionTask();
      minEndDate = filteredProfiles.reduce((minDate, current) => {
        proFileCheck = current;
        let currentEndDate = new Date(current.EndDate);
        if (!minDate) {
          return currentEndDate;
        }
        if (currentEndDate < minDate) {
          return currentEndDate;
        } else {
          return minDate;
        }
        // return currentEndDate < minDate ? currentEndDate : minDate;
      }, null as Date | null);

      //LOGIC XỬ LÝ TÍNH NGÀY QUÁ HẠN
      if (Ps_UtilObjectService.hasValue(minEndDate)) {
        minEndDate.setHours(0, 0, 0, 0);
        let newDate = new Date();
        newDate.setHours(0, 0, 0, 0);

        const numOfDay = Ps_UtilObjectService.getDaysDiff(minEndDate, newDate);
        if (numOfDay <= 3) {
          return numOfDay;
        } else {
          return minEndDate?.toISOString();
        }
      }
    }
  }

  /**
   * HÀM XỬ LÝ TEXT HIỂN THỊ ĐỐI VỚI QUÁ HẠN (KIỂM TRA NUMBER HOẶC STRING)
   * @param dataItem DATAITEM
   * @returns
   */
  onGetOverDueText(dataItem: DTOHRDecisionTask): string {
    let result = this.onGetOverDueDate(dataItem);
    let overdueText: string;
    if (!Ps_UtilObjectService.hasValue(result)) {
      result = 0;
    }
    if (typeof result === 'number') {
      overdueText = result + ' ngày';
    } else if (typeof result === 'string') {
      const date = new Date(result);
      overdueText = date.toLocaleDateString('vi-VN');
    }
    return overdueText;
  }

  onSortChangeCallback: Function;

  public sort: SortDescriptor[] = [
    {
      field: 'EndDate',
    },
  ];

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.gridTaskResult = {
      data: orderBy(this.gridTask, this.sort),
      total: this.gridTask.length,
    };
  }

  onClickEditTask(e: any) {
    this.DecisionProfile = e.item;

    this.isOpenDrawer = true;
    this.MultiForm = this.onLoadForm();
    this.MultiForm.patchValue(this.DecisionProfile);

    // XỬ LÝ SỬA DATA TYPESTAFF ĐỂ BIDING LÊN DROPDOWN
    const typeStaff = this.MultiForm.value.ListOfTypeStaff;

    if (typeof typeStaff == 'string') {
      const num = Number(typeStaff.replace(/[\[\]]/g, ''));
      this.MultiForm.get('ListOfTypeStaff')?.setValue(num);
    }

    // LƯU DATA CHỨC DANH PHÊ DUYỆT
    const ApprovedPositionID = this.MultiForm.value.ApprovedPositionID;
    if (Ps_UtilObjectService.hasValue(ApprovedPositionID)) {
      this.oldApprovedPositionID = ApprovedPositionID;
    }

    this.onCalcNumByEndDate(e.item);

    // KIỂM TRA MỞ DRAWER
    if (e.status === 'View') {
      this.isView = true;
      this.isEdit = false;
    } else if (e.status === 'Edit') {
      this.isEdit = true;
      this.isView = false;
    }
    this.onCheckStatusDrawer(this.DecisionProfile);
  }

  onCheckStatusDrawer(dataItem: DTOHRDecisionProfile) {
    let Status = dataItem.Status;
    if (Status) {
      switch (Status) {
        case 1:
          this.currentDrawer = 1;
          break;
        case 2:
          this.currentDrawer = 2;
          break;
        case 3:
          this.currentDrawer = 3;
          break;
        case 4:
          this.currentDrawer = 4;
          break;
        case 5:
          this.currentDrawer = 5;

          break;
        case 6:
          this.currentDrawer = 6;

          break;
        default:
      }
    } else {
    }
    // KIỂM TRA STATUS ĐỂ BIDING LIST STATUS CHO DROPDOWN
    this.onGetStatusDropdown();
  }

  /**
   * Hàm lấy enum bước và loại của On/Off board
   */
  getTypeBoarding(){
    if(this.Module == 1){
      this.typeProfile = 1;
      this.typeData = 3;
    } else if(this.Module == 2){
      this.typeProfile = 2;
      this.typeData = 4;
    }
  }


  //#region PHU NEW


  checkChangeStatus() {
    if (this.MultiForm.get('Status').value == this.DataHRDecisionTaskOrigin.Status) {
      return false
    } else {
      return true
    }
  }

  shouldShowElement(): boolean {
    return (
      (this.checkChangeStatus() && this.MultiForm.get('Status').value != 6) ||
      (this.DataHRDecisionTask?.ListHRDecisionTaskLog.length > 1 &&
        this.statusDrawer != 0 && this.MultiForm.get('Status').value != 6)
    );
  }

  handleGetHR(HR: string) {
    if (HR) {
      return JSON.parse(HR)[0]
    }
  }

  handleUpdateTask(option: 'Thêm mới' | 'Cập nhật') {
    const data = this.MultiForm.value

    if (!Ps_UtilObjectService.hasValueString(data.TaskName)) {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${option} công việc: Nhập thiếu tên công việc`);
      return;
    }
    if (data.TypeAssignee != 1) {
      if (!Ps_UtilObjectService.hasValueString(data.Assignee)) {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${option} công việc: Chọn thiếu người thực hiện`);
        return;
      }
    }

    if (!Ps_UtilObjectService.hasValueString(data.EndDate)) {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${option} công việc: Chọn thiếu ngày hoàn tất`);
      return;
    }

    if (this.checkChangeStatus()) {
      if (data.Status != 6) {
        if (!Ps_UtilObjectService.hasValueString(data.Reason)) {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${option} công việc: Vui lòng chọn lý do`);
          return;
        } else {
          if (data.Reason == 104) {
            if (!Ps_UtilObjectService.hasValueString(data.ReasonDescription)) {
              this.layoutService.onError(`Đã xảy ra lỗi khi ${option} công việc: Vui lòng nhập mô tả lý do`);
              return;
            }
          }

        }
      }

    }
    if (option == "Thêm mới") {
      // data.DecisionProfile = this.DataHRDecisionProfileMaster.Code
      data.Code = 0
      // data.ListHRDecisionProfile = []
    }

    if (JSON.stringify(data) === JSON.stringify(this.DataHRDecisionTaskOrigin)) {
      this.handleCloseDrawer()
      return
    }
    this.resquestChangeStatus = false
    this.APIUpdateHRDecisionTask(data)
  }


  getTitleReason(status: number) {
    const item = this.listStatusDropdown.find(item => item.Status == status)
    if (item) {
      this.titleReason = item.actionName
    }
  }

  handleGetAction(data) {
    this.DataHRDecisionTask = data.item
    // this.DataHRDecisionTask.DecisionProfile = this.DataHRDecisionProfileMaster.Code
    if (data.status == "Edit") {
      this.isEdit = true
      this.isView = false
      this.isCreate = false
      if(this.DataHRDecisionTask.PositionAssignee){
        this.isDropdownAssignee = false
      }
    } else {
      this.isEdit = false
      this.isView = true
      this.isCreate = false
    }
    this.statusDrawer = 1
    this.MultiForm = this.onLoadForm();
    this.MultiForm.patchValue(this.DataHRDecisionTask);
    this.DataHRDecisionTaskOrigin = this.MultiForm.value
    this.getTitleReason(this.DataHRDecisionTask.Status)
    this.handleOpenDrawer()
  }

  handleGetNew() {
    // if (data.status == 13) {
    //   this.statusDrawer = 0
    //   this.isEdit = false
    //   this.isView = false
    //   this.isCreate = true
    //   this.MultiForm = this.onLoadForm();
    //   this.MultiForm.patchValue(new DTOHRDecisionTask);
    //   // if(this.DataHRDecisionProfileMaster.Status == 1){
    //   //   this.MultiForm.patchValue({
    //   //     Status: 1
    //   //   })
    //   // }else if(this.DataHRDecisionProfileMaster.Status == 2){
    //   //   this.MultiForm.patchValue({
    //   //     Status: 3
    //   //   })
    //   // }
    //   this.DataHRDecisionTaskOrigin = this.MultiForm.value
    //   this.handleOpenDrawer()
    // }

    this.statusDrawer = 0
    this.isEdit = false
    this.isView = false
    this.isCreate = true
    this.MultiForm = this.onLoadForm();
    this.MultiForm.patchValue(new DTOHRDecisionTask);
    // if(this.DataHRDecisionProfileMaster.Status == 1){
    //   this.MultiForm.patchValue({
    //     Status: 1
    //   })
    // }else if(this.DataHRDecisionProfileMaster.Status == 2){
    // this.MultiForm.patchValue({
    //   Status: 3
    // })
    // }
    this.MultiForm.patchValue({
      Status: 3
    })

    this.MultiForm.patchValue({
      ListOfTypeStaff: `[${[2]}]`
    })
    this.DataHRDecisionTaskOrigin = this.MultiForm.value
    this.handleOpenDrawer()
  }

  //#endregion

  //#region Destroy
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  //#endregion
}
