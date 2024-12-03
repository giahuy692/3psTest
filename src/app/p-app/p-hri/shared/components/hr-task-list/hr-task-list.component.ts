import { Text } from '@progress/kendo-drawing';
import { HriDecisionApiService } from './../../services/hri-decision-api.service';
import { DTOHRPolicyTask } from './../../dto/DTOHRPolicyTask.dto';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, Renderer2, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { GridDataResult, SelectableSettings, PageChangeEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, SortDescriptor, State } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOResponse, Ps_UtilObjectService } from 'src/app/p-lib';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { takeUntil } from 'rxjs/operators';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOHRPolicyPosition } from '../../dto/DTOHRPolicyPosition.dto';
import { DTOHRPolicyLocation } from '../../dto/DTOHRPolicyLocation.dto';
import { DTOHRPolicyTypeStaff } from '../../dto/DTOHRPolicyTypeStaff.dto';
import { DTOHRPolicyMaster } from '../../dto/DTOHRPolicyMaster.dto';
import { ConfigAPIService } from 'src/app/p-app/p-config/shared/services/config-api.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';
import { TransitionService } from '../../services/transition.service';
import { PKendoGridComponent } from 'src/app/p-app/p-layout/components/p-kendo-grid/p-kendo-grid.component';
import { TreeListComponent } from '@progress/kendo-angular-treelist';
import { DTOHRDecisionTask } from '../../dto/DTOHRDecisionTask.dto';
import { DomSanitizer } from '@angular/platform-browser';
import { DTOHRDecisionProfile } from '../../dto/DTOHRDecisionProfile.dto';
import { StaffApiService } from '../../services/staff-api.service';
import { DTOListHR } from '../../dto/DTOPersonalInfo.dto';
import { TextAreaComponent } from '@progress/kendo-angular-inputs';
import { DTOEmployee } from '../../dto/DTOEmployee.dto';
import { DTOHRDecisionTaskLog } from '../../dto/DTOHRDecisionTaskLog.dto';

type HRPolicyItem = DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff;

/**
 * ### Component provide a list of task with required input:
 * - policyMaster: Object policy master
 * - typeApply
 * ### Component provide output:
 * - onClickButtonAdd: Event click buttons Add
 * - onClickToolBox: Event click buttons action in tool box
 * - isSelectingGrid: Event click check box
 * - addedTask: Event click added task
 * - numOfTaskAfterChangeData: Event is called when list policy task change and return number of task after change
 */

@Component({
  selector: 'app-hr-task-list',
  templateUrl: './hr-task-list.component.html',
  styleUrls: ['./hr-task-list.component.scss']
})
export class HrTaskListComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  //#region Input, Ouput & Variables
  // SUBJECT
  destroy = new Subject<any>(); // Use to unscribe


  // INPUT
  @Input() policyMaster: DTOHRPolicyMaster = new DTOHRPolicyMaster(); // Object policy master
  @Input() typeApplyPosition: number = 1; // Phạm vi áp dụng
  @Input({ required: true }) typeList: number = 1; // loại danh sách
  @Input() typeProfile: number = 1; // loại boarding

  // Pre-Onboard	1	
  // Pre-Offboard	2	
  // Onboarding	3	
  // Offboarding	4	
  // Onboarded	5	
  // Offboarded	6	
  // Ngưng Onboarded	7	
  // Ngưng Offboarded	8	
  @Input() typeData: number = 1;

  @Input() listDecisionTask: DTOHRDecisionTask[]; // list decision task
  @Input() ListHRDecisionProfile: DTOHRDecisionProfile[]; //list decision profile
  @Input() decisionProfile: DTOHRDecisionProfile; // object decision profile
  @Input() decisionTask: DTOHRDecisionTask; // object decision task





  // VARIABLE
  justLoaded: boolean = true;
  actionPerm: DTOActionPermission[] = [];
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false // Right just to view
  isExpanded: boolean = true; // Column can expand
  isLoading: boolean = false; // loading of list 
  isLoadingDropDown: boolean = false; //loading of dropdown 
  isLoadingTree: boolean = false; // loading of tree list
  isOpenDialogAddTask: boolean = false; // Open dialog add task
  isOpenPopupConfirmDelete: boolean = false; // open popup confirm delete task
  isSelectingItemGrid: boolean = false;
  isShowHeader: boolean = false; // show header list
  selectedRowitemDialogOpened = false // Open dialog when select multiple item
  seletedTaskToDelete: DTOHRPolicyTask | DTOHRDecisionTask; // policy task will be deleted
  isDecisionTaskToDelete: boolean = false; // boolean decision task will be deleted
  seletedToolBox: DTOHRPolicyTask; // ToolBox selected
  selectedTaskDeleteException: DTOHRPolicyTask; // Task chứa ngoại lệ chuẩn bị bị xóa
  selectedPolicyTaskLimit: HRPolicyItem; // Selected policy task limit to delete
  selectable: SelectableSettings = { enabled: true, mode: 'multiple', drag: false, checkboxOnly: true }; // Setting for selection of grid
  selectedRowitemPopupCallback: Function; // Function callback to selecte item in grid
  clearSelectedRowitemCallback: Function; // Function callback to clear selected item
  uploadEventHandlerCallback: Function // Function callback to import list policy task
  pageSize: number = 25; // pageSize in start
  count: number = 0; // Number of selected items
  initiallyExpanded: boolean = true; // Default treelist is expanded or not
  addPolicyTaskType: number = 1;
  afterAddedTask: boolean = false;
  errorOccurred: any = {};
  currentDate = new Date(); // Khởi tạo ngày hiện tại
  typeMasterDetail: number = 0; //Grid có detail hay không? 0 là không, 1 là có
  pageable: boolean = false; //Grid có pagination hay không? 
  isConfirmDialogShow: boolean = false; // Hiển thị dialog confirm
  isChangedDialogShow: boolean = false; // Hiển thị dialog changed
  isConfirmDialogSent: boolean = false; // Hiển thị dialog send/success
  codeConfirmDialog: number = 1; // 1 Mở lại, 2 Ngưng thực hiện, 3 Thực hiện bởi, 4 Duyệt bởi
  unsubscribe = new Subject<void>;
  isObligatoryReason: boolean = false; // Có bắt buộc nhập mô tả không
  valueReason: { Code: number, Text: string } = null; // Lý do
  valueAssignee: { Code: number, Text: string } = {
    Code: 0,
    Text: ""
  }; // Assignee được chọn
  valueApprove: { Code: number, Text: string } = {
    Code: 0,
    Text: ""
  }; // Approve được chọn
  valueEmployee: DTOEmployee = null; // Nhân sự được chọn
  isShowStoppedTask: boolean = false;
  isShowPopUpSelect: boolean = false;


  // LIST
  listTask: GridDataResult // List all type task
  listPolicyTask: GridDataResult; // List Policy task
  listSeletedTaskToDelete: string[] = []; // list task will be deleted when select multiple item
  selectedKeys: number[] = []; // List code of selected policy task
  selectedRowitem: DTOHRPolicyTask[] | DTOHRDecisionTask[] = []; // List selected policy task or deicison task
  // selectedRowitemDecision: DTOHRDecisionTask[] = []; // List selected decision task
  btnList: MenuDataItem[] = [] // Button list when selected multiple tasks
  expandedDetailKeys: number[] = [];
  pageSizes: number[] = [25, 50, 75, 100]; // list pagesize
  listTaskHasException: DTOHRPolicyTask[] = []; // list task has exception
  listReason: DTOListHR[] = [];
  listNameSelected: { mainTitle: string, extraPositions: string, extraTitle: string };
  listTaskName: string[] = [];
  listEmployee: DTOEmployee[] = [];
  originalListEmployee: DTOEmployee[] = [];
  ItemEmployeeSelect: DTOEmployee = null;
  listPositionApprove: { Code: number, Text: string }[] = [];
  listPositionAssignee: { Code: number, Text: string }[] = [];
  defaultOption: { Code: number, Text: string } = {
    Code: 0,
    Text: '-- Chọn --'
  };
  defaultOptionEmployee: DTOEmployee = new DTOEmployee();
  statusImport: number = 0;
  listSelectItemTask: DTOHRDecisionTask[] | DTOHRPolicyTask[];
  listItemCanChange: DTOHRDecisionTask[];


  // STATE AND FILTERS
  gridState: State = { skip: null, take: null, filter: { logic: 'and', filters: [] }, sort: [{ "field": "OrderBy", "dir": "asc" }] } // State
  gridStateTask: State = { filter: { logic: 'and', filters: [] }, sort: [{ "field": "OrderBy", "dir": "asc" }] } // State
  gridStateStaff: State = { filter: { logic: "and", filters: [] } }
  filterSearchTask: CompositeFilterDescriptor = { logic: 'or', filters: [] } // Filter search

  @Output() onClickButtonAdd = new EventEmitter() // Event click buttons Add
  @Output() onClickToolBox = new EventEmitter() // Event click buttons action in tool box
  @Output() isSelectingGrid = new EventEmitter() // Event click check box
  @Output() addedTask = new EventEmitter() // Event click added task
  @Output() numOfTaskAfterChangeData = new EventEmitter() // Event is called when list policy task change
  @Output() onClickEditTask = new EventEmitter() // Event click action edit
  @Output() isSelectItems = new EventEmitter() // Event click selection items



  onPageChangeCallback: Function;
  onActionDropDownClickCallback: Function;
  getActionDropdownCallback: Function;
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  onSelectCallback: Function
  onSortChangeCallback: Function
  //#endregion


  @ViewChildren('anchor') anchors: QueryList<ElementRef>;
  @ViewChildren('search') childSearch: any;
  @ViewChildren('grid') childGrid: PKendoGridComponent;
  @ViewChildren('tree') childTree: TreeListComponent;
  @ViewChildren('detailTemplate') childDetailTemplate: ElementRef;
  @ViewChild("remark") valueRemark: TextAreaComponent;


  constructor(
    public menuService: PS_HelperMenuService,
    private hriTransitionService: HriTransitionApiService,
    private hriDecisionApiService: HriDecisionApiService,
    private layoutService: LayoutService,
    public apiService: ConfigAPIService,
    public layoutApiService: LayoutAPIService,
    public marService: MarBannerAPIService,
    public transitionService: TransitionService,
    public domSanititizer: DomSanitizer,
    private renderer: Renderer2,
    private el: ElementRef,
    private staffService: StaffApiService
  ) { }


  //#region Lifecycle Hooks
  ngAfterViewInit(): void {
    // this.applyGridChangesToDOM();
  }

  ngOnInit(): void {
    if (this.typeList == 1) {
      this.typeMasterDetail = 1;
      this.pageable = true;
    } else {
      this.gridState = this.gridStateTask;
    }

    // Check permission
    this.menuService.changePermission().pipe(takeUntil(this.destroy)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        this.isMaster = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        //Chỉ được xem
        this.isAllowedToViewOnly = this.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(this.actionPerm.filter(s => s.ActionType != 6))
      }
    })

    // Type of adding policy task
    this.addPolicyTaskType = this.policyMaster?.TypeApply;
    this.isLoading = true;

    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.onInitState();
        this.onFilterData();
        // Kiểm tra loại danh sách
        // Nếu là danh sách công việc của chính sách
        if (this.typeList == 1) {
          this.isShowHeader = true;
          this.typeMasterDetail = 1;
        }
        else if (this.typeList == 2) {
          this.gridState.skip = null;
          this.gridState.take = null;
          //Tạm thời vì chưa có API
          // this.APIGetListHRDecisionTask();
          if (Ps_UtilObjectService.hasListValue(this.listDecisionTask)) {
            this.listTask = { data: this.listDecisionTask, total: this.listDecisionTask.length };
            this.isLoading = false;
          }
        }
        else if (this.typeList == 3) {
          this.gridState.skip = null;
          this.gridState.take = null;
          this.pageSize = 0;
          this.getTypeProfile();
          // this.APIGetListHRDecisionTask();
          this.isShowHeader = true;
          if (this.typeData == 5 || this.typeData == 6 || this.typeData == 7 || this.typeData == 8) {
            this.selectable.enabled = false;
          }
        }
      }
    })


    this.clearSelectedRowitemCallback = this.onClearSelection.bind(this);
    this.selectedRowitemPopupCallback = this.onSelectedPopupBtnClick.bind(this);
    this.uploadEventHandlerCallback = this.uploadEventHand.bind(this);
    this.getSelectionPopupCallback = this.getSelectionPopupAction.bind(this);
    this.onSelectedPopupBtnCallback = this.onSelectionActionItemClick.bind(this);
    this.onSelectCallback = this.onGridItemSelect.bind(this);
    this.onSortChangeCallback = this.sortChange.bind(this);


    let canDeleteTask = false;

    // Kiểm tra trạng thái của policyMaster
    if ([0, 4].includes(this.policyMaster.Status)) {
      // Nếu status là 0 hoặc 4 và người dùng là creator hoặc master
      canDeleteTask = this.isCreator || this.isMaster;
    } else if (this.policyMaster.Status === 1) {
      // Nếu status là 1 và người dùng là approver
      canDeleteTask = this.isApprover || this.isMaster;
    }

    // Đặt btnList dựa trên canDeleteTask
    this.btnList = canDeleteTask ? [{ Code: 'trash', Name: 'Xóa công việc', Type: "1", Actived: true }] : [];

    // this.handleApplyGridChangesToDOM();

    this.transitionService.getDataStatusImport().pipe(takeUntil(this.destroy)).subscribe(data => {
      this.statusImport = data
    })

    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onPageChangeCallback = this.onPageChange.bind(this);
    this.onActionDropDownClickCallback = this.onActionDropdownClick.bind(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.typeList == 1) {
      if (changes['typeApply']) {
        this.addPolicyTaskType = changes['typeApply'].currentValue;
      }
      if (changes['policyMaster']) {
        this.policyMaster = JSON.parse(localStorage.getItem('HrPolicyMaster'));
        this.gridState.filter.filters = [{ field: 'Policy', operator: 'eq', value: this.policyMaster.Code }];

        if (this.policyMaster.Status === 0 || this.policyMaster.Status === 4) {
          if (!this.isCreator && !this.isMaster) {
            this.selectable.enabled = false;
          }
          else {
            this.selectable.enabled = true;
          }
        }
        else if (this.policyMaster.Status === 1) {
          if (!this.isApprover && !this.isMaster) {
            this.selectable.enabled = false;
          }
          else {
            this.selectable.enabled = true;
          }
        }
        else if (this.policyMaster.Status === 2 || this.policyMaster.Status === 3) {
          this.selectable.enabled = false;
        }
        else {
          this.selectable.enabled = true;
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  //#endregion


  //#region API
  // This function provide policy task list from service after call API GetListHRPolicyTask
  APIGetListHRPolicyTask() {
    this.isLoading = true;
    if (!Ps_UtilObjectService.hasValue(this.policyMaster.Code)) {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công việc: Chưa có code chính sách`);
      this.isLoading = false;
      return;
    }
    this.hriTransitionService.GetListHRPolicyTask(this.gridState).pipe(takeUntil(this.destroy)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listTask = { data: res.ObjectReturn.Data, total: res.ObjectReturn.Total };
        this.listTaskHasException = res.ObjectReturn.Data.filter(task => task.HasException);
        this.numOfTaskAfterChangeData.emit(this.listTask.data);

        // Sau khi thêm công việc từ danh sách công việc có sẵn
        if (this.afterAddedTask) {
          this.addedTask.emit(this.listTask.data);
          this.afterAddedTask = false;
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công việc: " ${res.ErrorString}`);
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công việc: " ${error}`);
    });
  }

  /**
   * The event is called when delete policy task
   * @param listDTO List of task need to delete
   */
  APIDeleteHRPolicyTask(listDTO: DTOHRPolicyTask[]) {
    const apiText = "Xoá công việc"
    this.hriTransitionService.DeleteHRPolicyTask(listDTO).pipe(takeUntil(this.destroy)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công');
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`)
      }
      this.onClearSelection();
      this.closePopupConfirmDeleteTask();
      this.onFilterData();
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
      this.closePopupConfirmDeleteTask();
      this.onClearSelection();
      this.onFilterData();
    })
  }

  /**
   * This function provide exception policy of task service after call API GetListHRTaskException
   * @param task task need to get list exception
   */
  APIGetListHRTaskException(task: DTOHRPolicyTask) {
    if (!Ps_UtilObjectService.hasListValue(task.ListException)) {
      this.hriTransitionService.GetListHRTaskException(task).pipe(takeUntil(this.destroy)).subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          task.ListException = res.ObjectReturn;
          task.ListException?.forEach(item => item.Level = 1)
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ngoại lệ công việc: " ${res.ErrorString}`);
        }
        this.isLoadingTree = false;
      }, (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ngoại lệ công việc: " ${error}`);
        this.isLoadingTree = false;
      });
    }
  }

  /**
   * The event is called when delete policy limit task
   * @param dto Policy limit want to delete
   */
  APIDeleteHRPolicyLimit(dto: HRPolicyItem) {
    let text = "";
    if (this.onIdentifyDTO(dto) === 'DTOHRPolicyPosition') {
      text = 'Xóa chức danh ngoại lệ';
    }
    else if (this.onIdentifyDTO(dto) === 'DTOHRPolicyLocation') {
      text = 'Xóa địa điểm ngoại lệ';
    }
    else if (this.onIdentifyDTO(dto) === 'DTOHRPolicyTypeStaff') {
      text = 'Xóa loại nhân sự';
    }
    else {
      text = 'Xóa'
    }
    this.hriTransitionService.DeleteHRPolicyLimit(dto).pipe(takeUntil(this.destroy)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(text + ' thành công');
        // this.selectedTaskDeleteException.ListException = [];
        // this.APIGetListHRTaskException(this.selectedTaskDeleteException);
        this.onFilterData();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${text}: ${res.ErrorString}`)
      }
      this.closePopupConfirmDeleteTask();
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${text}: ${err}`);
      this.closePopupConfirmDeleteTask();
      this.onFilterData();
    })
  }

  /**
   * This function is called when update a object HRPolicyItem
   * @param dto object policy limit want to update status
   */
  APIUpdateHRPolicyLimitStatus(dto: HRPolicyItem) {
    const apiText = "Ngưng áp dụng ngoại lệ"
    dto.Status = 3;
    dto.StatusName = 'Ngưng áp dụng'
    this.hriTransitionService.UpdateHRPolicyLimitStatus(dto).pipe(takeUntil(this.destroy)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công');
        this.onFilterData();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`);
        this.onFilterData();
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
      this.onFilterData();
    })
  }

  /**
 * API import chức danh bằng excel
 * @param file PolicyApplyTemplate
 */
  APIImportExcelPosition(file) {
    this.isLoading = true
    var ctx = "Import Excel"

    this.hriTransitionService.ImportHRPolicyTask(file, this.policyMaster.Code).pipe(takeUntil(this.destroy)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && !Ps_UtilObjectService.hasValueString(res.ErrorString)) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.setImportDialogMode(1);
        this.layoutService.setImportDialog(false);
        this.layoutService.getImportDialogComponent().inputBtnDisplay();
        this.onFilterData();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }
      this.isLoading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      this.isLoading = false;
    })
  }

  /**
 * API lấy danh sách lý do
 */
  APIGetListHR() {
    let enumCode;
    if (this.codeConfirmDialog == 1) {
      enumCode = 24;
    } else if (this.codeConfirmDialog == 2) {
      enumCode = 23;
    } else if (this.codeConfirmDialog == 8) {
      enumCode = 23;
    }

    this.staffService.GetListHR(enumCode).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listReason = res.ObjectReturn
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy lý do: ' + res.ErrorString);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy lý do: ${err}`);
      })
  }

  // This function provide policy task list from service after call API GetListHRDecisionTask
  APIGetListHRDecisionTask() {
    this.isLoading = true;
    if (this.typeList == 3) {
      if (this.decisionProfile.Status !== 1) {
        this.checkShowStoppedTask();
      }
    }
    this.hriDecisionApiService.GetListHRDecisionTask(this.gridState).pipe(takeUntil(this.destroy)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listTask = { data: res.ObjectReturn.Data, total: res.ObjectReturn.Total };
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công việc: " ${res.ErrorString}`);
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công việc: " ${error}`);
    });
  }

  //Get List Employee
  APIGetListEmployee() {
    this.isLoadingDropDown = true;
    this.staffService.GetListEmployee(this.gridStateStaff).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listEmployee = res.ObjectReturn.Data;
        this.defaultOptionEmployee.Code = 0;
        this.defaultOptionEmployee.FirstName = "-- Chọn --";
        // const isInclude: boolean = this.listEmployee.some(item => item.Code == 0);
        this.originalListEmployee = this.listEmployee;
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân viên: ${res.ErrorString}`)
      }
      this.isLoadingDropDown = false;
    }, (error) => {
      this.isLoading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân viên: ${error} `)
    })

  }

  //Update List HR DecisionTask
  APIUpdateListHRDecisionTask(listDTO: DTOHRDecisionTask[], properties: string[]) {
    this.isLoading = true;
    this.hriDecisionApiService
      .UpdateListHRDecisionTask(listDTO, properties).pipe(takeUntil(this.destroy)).subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess('Cập nhật công việc thành công')
            this.toggleClosedDialog();
            this.APIGetListHRDecisionTask();
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật công việc: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật công việc: ` + err
          );
        }
      );
  }

  //Delete List HR DecisionTask
  APIDeleteHRDecisionTask() {
    let listDTO: DTOHRDecisionTask[] = this.selectedRowitem as DTOHRDecisionTask[];
    console.log(listDTO)
    this.hriDecisionApiService.DeleteHRDecisionTask(listDTO).pipe(takeUntil(this.destroy)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess('Xóa công việc thành công');
        this.closePopupConfirmDeleteTask();
        this.onFilterData();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa công việc: ${res.ErrorString}`)
      }
      this.closePopupConfirmDeleteTask();
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi xóa công việc: ${err}`);
      this.closePopupConfirmDeleteTask();
      this.onFilterData();
    })
  }
  //#endregion


  //#region Import và export
  // Import từ file excel
  onImportExcel() {
    this.transitionService.setDataStatusImport(2)
    if (this.statusImport == 2) {
      this.layoutService.setImportDialog(true);
      this.layoutService.setExcelValid(true);
    }

  }

  // Export ra file excel
  onExportExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "PolicyTaskTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)
    // this.isLoading = true;

    this.marService.GetTemplate(getfilename).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        Ps_UtilObjectService.getFile(res)
        this.layoutService.onSuccess(`${ctx} thành công`);
      }
      this.isLoading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.isLoading = false;
    });
  }

  uploadEventHand(e: File) {
    this.APIImportExcelPosition(e)
  }
  //#endregion


  //#region Hàm dùng chung 
  /**
   * Display button of exception
   * @param type button delete or stop
   * @returns true if availabel 
   */
  onCheckDisplayButtonException(type: string): boolean {
    // Chỉ quyền xem
    const canViewOnly = !this.isApprover && !this.isMaster && !this.isCreator;
    if (canViewOnly) {
      return false;
    }

    const creatorOrMaster = this.isCreator || this.isMaster;
    const approverOrMaster = this.isApprover || this.isMaster;

    // Đối với nút Xóa
    if (type === 'delete') {
      return (
        (this.policyMaster.Status === 0 || this.policyMaster.Status === 4) && creatorOrMaster ||
        this.policyMaster.Status === 1 && approverOrMaster
      );
    }

    // Đối với nút ngưng hiển thị
    if (type === 'stop') {
      return this.policyMaster.Status === 2 && (this.isApprover || this.isMaster);
    }

    return false;
  }

  /**
   * Display group button add
   * @returns true if availabel
   */
  onCheckDisplayGroupButtonAdd() {
    if (!this.isApprover && !this.isMaster && !this.isCreator) {
      return false;
    }

    if (this.policyMaster.Status == 0 || this.policyMaster.Status == 4) {
      if (this.isCreator || this.isMaster) {
        return true;
      }
    }
    if (this.policyMaster.Status == 1) {
      if (this.isApprover || this.isMaster) {
        return true;
      }
    }
    return false;
  }

  /**
   * Display component
   * @returns true if availabel
   */
  onCheckDisplayPolicyTask() {
    if (this.typeList == 1 || this.typeList == 3) {
      if (this.typeList == 1) {
        if (this.policyMaster?.Code !== 0) {
          return true;
        }
      } else {
        // if (this.decisionMaster?.Code !== 0) {
        return true;
        // }
      }
      return false;
    } else {
      return true;
    }
  }

  /**
   * This function provide optional output whenever click on buttons add
   * @param button Type of button is ExistingTask or NewTask. 
   * - 10 is 'Thêm công việc có sẵn'
   * - 11 is 'Thêm công việc từ chính sách khác'
   * - 12 is 'Thêm mới công việc policy'
   * - 13 is 'Thêm mới công việc decision'

   */
  onClickButtonHeader(button: 10 | 11 | 12 | 13) {
    console.log(this.isCreator)
    console.log(this.isMaster)
    console.log(this.isApprover)
    if (button !== 13) {
      if (button == 10 || button == 11) {
        this.isOpenDialogAddTask = true;
      }
      this.onClickButtonAdd.emit({ item: new DTOHRPolicyTask(), status: button });
    } else {
      this.onClickButtonAdd.emit({ item: new DTOHRDecisionTask(), status: button });

    }

  }

  /**
   * Hàm dùng để set style theo đúng nội dung text
   * @param name name of assignee
   */
  onCheckAssigneeBy(name: string): string {
    if (name === 'Hệ thống') {
      return 'font-style: italic;';
    }
  }

  /**
   * This function identifies the input object as DTOHRPolicyLocation, DTOHRPolicyPosition, or DTOHRPolicyTypeStaff or DTOHRDecisionTask
   * @param dto object to identify
   * @returns the type of the object as a string
   */
  onIdentifyDTO(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff | DTOHRDecisionTask): string {
    if (!dto) { return 'Unknown'; }

    // Nếu là DTOHRPolicyPosition
    if ('PositionName' in dto && Ps_UtilObjectService.hasValueString(dto['PositionName'])) {
      return 'DTOHRPolicyPosition';
    }

    // Nếu là DTOHRPolicyLocation
    if ('LocationName' in dto && Ps_UtilObjectService.hasValueString(dto['LocationName'])) {
      return 'DTOHRPolicyLocation';
    }

    // Nếu là DTOHRPolicyTypeStaff
    if ('TypeStaffName' in dto && dto['PositionName'] == null && dto['LocationName'] == null && Ps_UtilObjectService.hasValueString(dto['TypeStaffName'])) {
      return 'DTOHRPolicyTypeStaff';
    }

    // Nếu là DTOHRDecisionTask
    if ('ListHRDecisionProfile' in dto && dto['PositionName'] == null && dto['LocationName'] == null && Ps_UtilObjectService.hasValueString(dto['TypeStaffName'])) {
      return 'DTOHRDecisionTask';
    }

    return 'Unknown';
  }

  //Kiểm tra đó là dto gì
  public isDTOCheck(item: any, isWhatDTO: 'DTOHRDecisionTask'): item is DTOHRDecisionTask;
  public isDTOCheck(item: any, isWhatDTO: 'DTOHRPolicyTask'): item is DTOHRPolicyTask;
  public isDTOCheck(item: any, isWhatDTO: 'DTOHRDecisionProfile'): item is DTOHRDecisionProfile;
  public isDTOCheck(item: any, isWhatDTO: string): boolean {
    if (!item) {
      return false;
    }
    switch (isWhatDTO) {
      case 'DTOHRDecisionTask':
        return 'ListOfTypeStaff' in item;
      case 'DTOHRPolicyTask':
        return 'HasException' in item;
      case 'DTOHRDecisionProfile':
        return 'ListStatusTask' in item;
      default:
        return false;
    }
  }

  /**
   * This function is called when want to get icon base on DTO
   * @param dto object want to check DTO
   * @returns class of kendo icon
   */
  getIconByDTO(dto: HRPolicyItem): string {
    if (this.onIdentifyDTO(dto) === 'DTOHRPolicyPosition') {
      return 'user';
    }
    if (this.onIdentifyDTO(dto) === 'DTOHRPolicyLocation') {
      return 'location-dot';
    }
    if (this.onIdentifyDTO(dto) === 'DTOHRPolicyTypeStaff') {
      return 'user-group';
    }
    return 'triangle-exclamation';
  }

  /**
   * This function is called when want to get name of obj but don't know what type of obj
   * @returns obj.PositionName | obj.LocationName | obj.TypeStaffName
   */
  getNameDTO() {
    const obj = this.selectedPolicyTaskLimit;
    if (this.onIdentifyDTO(obj) === 'DTOHRPolicyPosition') {
      return obj['PositionName'];
    }
    else if (this.onIdentifyDTO(obj) === 'DTOHRPolicyLocation') {
      return obj['LocationName'];
    }
    else if (this.onIdentifyDTO(obj) === 'DTOHRPolicyTypeStaff') {
      return obj['TypeStaffName'];
    }
    return 'Ngoại lệ';
  }

  // Sự kiện khi click ra ngoài màn hình
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.tool-box')) {
      this.seletedToolBox = null;
      const cell9s = document.querySelectorAll('td.k-table-td[aria-colindex="9"]');
      cell9s?.forEach(cell => cell.classList.remove('active'));
      const cell10s = document.querySelectorAll('td.k-table-td[aria-colindex="10"]');
      cell10s?.forEach(cell => cell.classList.remove('active'));
    }

    if ((event.target as HTMLElement).closest('.exception')) {
      const spanElement = event.target as HTMLElement;
      const targetCode = spanElement?.getAttribute('code-task');

      const cell0s = document.querySelectorAll('td.k-table-td[aria-colindex="1"]');
      cell0s.forEach(cell => {
        const aElement = cell.querySelector('a');
        if (aElement) {
          if (aElement.getAttribute('code-task') === targetCode) {
            aElement.click();
          }
        }
      })


    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Tab' && this.count > 0) {
      event.preventDefault();
    }
  }

  /**
   * This function make dialog add task close. 1. call api
   * @param e 
   */
  closeDialogAddTask(value: number) {
    this.isOpenDialogAddTask = false;
    if (value == 1) {
      this.expandedDetailKeys = [];
      this.afterAddedTask = true;
      this.APIGetListHRPolicyTask();
      const listTemp = this.listTask.data;
      this.listTask.data = [];
      this.listTask.total = listTemp.length;

      listTemp.forEach(item => {
        this.listTask.data.push(item);
      })
    }
  }

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
   * Hàm đổi màu chữ và icon nếu quá hạn
   */
  getColorExpired(endDate: string): string {
    return (this.currentDate > new Date(endDate)) && (this.typeData !== 1 && this.typeData !== 2) ? 'rgba(235, 39, 58, 1)' : 'black';
  }

  /**
   * Hàm trả về true nếu task bị quá hạn
   */
  getExpired(endDate: string): boolean {
    if ((this.currentDate > new Date(endDate)) && (this.typeData !== 1 && this.typeData !== 2)) {
      return true;
    }
    return false;
  }

  /**
   * Hàm tính số ngày còn lại của task
   */
  getLeftDateTask(endDate: string): number {
    const end = new Date(endDate);
    const currentDate = new Date(this.currentDate);

    // Đặt thời gian của cả hai ngày thành nửa đêm
    end.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Tính số ngày khác biệt
    const diffInTime = end.getTime() - currentDate.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

    return diffInDays;
  }


  /**
   * Hàm đổi màu color tùy vào số ngày còn lại
   */
  getColorLeftDate(leftDate: number): string {
    if (leftDate <= 4 && leftDate > 1) {
      return "#F1802E";
    } else if (leftDate <= 1) {
      return "#EB273A";
    }
    return "#000000";
  }

  /**
 * Hàm lấy danh sách action tùy tình trạng
 */
  getActionList(codeStatus: number): string[] {
    const creatorOrMaster = this.isCreator || this.isMaster;
    const approverOrMaster = this.isApprover || this.isMaster;
    let listAction: string[] = [];
    if (approverOrMaster || creatorOrMaster) {
      if (codeStatus == 3) {
        if (this.typeData == 3) {
          listAction.push("k-i-check-circle");
        } else if (this.typeData == 4) {
          listAction.push("k-i-redo");
        }
        listAction.push("k-i-minus-outline");
      }
      else if (codeStatus == 1) {
        if(creatorOrMaster){
          listAction.push("k-i-minus-outline");
        }
      }
      else if (codeStatus == 4) {
        listAction.push("k-i-check-circle");
      }
      else if (codeStatus == 6) {
        listAction.push("k-i-preview");
      }
      else if (codeStatus == 2 || codeStatus == 5) {
        if (this.typeData == 1 || this.typeData == 2 || this.typeData == 3 || this.typeData == 4) {
          if(this.typeList == 3 && this.decisionProfile.Status == 1){
            if(creatorOrMaster){
              listAction.push("k-i-reset-sm");
            }
          } 
          else if(this.typeList == 3 && this.decisionProfile.Status == 2){
            if(approverOrMaster){
              listAction.push("k-i-reset-sm");
            }
          }
          else{
            listAction.push("k-i-reset-sm");
          }

        } else {
          listAction.push("k-i-preview");
        }
      }
    }
    else {
      listAction.push("k-i-preview");
    }
    return listAction;
  }
  //#endregion


  //#region Filter
  /**
   * - This function will return list filters in CompositeFilterDescriptor
   * - Field to compare is defined at hr-task-list component
   * @param event 
   */
  handleSearchTask(event: any) {
    if (!Ps_UtilObjectService.hasValueString(event.filters[0]?.value)) {
      this.filterSearchTask.filters = [];
    }
    else {
      this.filterSearchTask.filters = event.filters;
      if (this.typeList == 1) {
        this.gridState.skip = null;
        this.gridState.take = null;
      }
    }
    this.onFilterData();
  }

  /**
   * This function make filter all
   */
  onFilterData() {
    //Nếu loại danh sách là danh sách công việc trong chính sách
    if (this.typeList == 1) {
      const policyMas = JSON.parse(localStorage.getItem('HrPolicyMaster'));
      this.gridState.filter.filters = [{ field: 'Policy', operator: 'eq', value: policyMas.Code }];
      this.gridState.sort = [{ "field": "OrderBy", "dir": "asc" }];

      // Kiểm tra nếu có filterSearchTask mới push
      if (Ps_UtilObjectService.hasListValue(this.filterSearchTask.filters)) {
        this.gridState.filter.filters.push(this.filterSearchTask);
      }
      this.APIGetListHRPolicyTask();
    }

    if (this.typeList == 3) {
      this.gridState.filter.filters = [];
      this.gridState.filter.filters.push({ field: 'DecisionProfile', operator: 'eq', value: this.decisionProfile.Code });
      this.gridState.sort = [{ "field": "OrderBy", "dir": "asc" }];
      // Kiểm tra nếu có filterSearchTask mới push
      if (Ps_UtilObjectService.hasListValue(this.filterSearchTask.filters)) {
        this.gridState.filter.filters.push(this.filterSearchTask);
      }

      this.APIGetListHRDecisionTask();
    }
    // this.childGrid.modifyExpandCollapseOnGrid();
  }

  // Init State
  onInitState() {
    if (this.typeList == 1) {
      const policyMas = JSON.parse(localStorage.getItem('HrPolicyMaster'));
      this.gridState = {
        skip: null,
        take: null,
        filter: {
          logic: 'and',
          filters: [{ field: 'Policy', operator: 'eq', value: policyMas.Code }]
        },
        sort: [{ "field": "OrderBy", "dir": "asc" }]
      }
    }
  }

  /**
   * Reset toàn bộ grid
   */
  onResetAll() {
    this.pageSize = this.pageSizes[0];
    this.childSearch.length = 0
    this.childSearch.first.value = ''
    this.filterSearchTask.filters = [];
    this.onInitState();
    this.onFilterData();
  }

  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event;
    if (this.typeList == 1) {
      this.APIGetListHRPolicyTask();
    }
    else if (this.typeList == 2 || this.typeList == 3) {
      this.APIGetListHRDecisionTask();
    }
    // this.GetListGenOrder()
  }
  //#endregion


  //#region Xử lý list
  /**
   * Hàm nhận giá trị từ grid khi item được chọn
   * @param isSelected 
   */
  onGridItemSelect(isSelected: boolean) {
    this.isSelectingItemGrid = isSelected;
    this.isSelectingGrid.emit(isSelected);
    this.isSelectItems.emit(isSelected);
  }

  /**
   * Hàm lấy các action cho popup giữa màn hình khi chọn vào checkbox
   * @param arrItem 
   * @returns MenuDataItem[]
   */
  getSelectionPopupAction(arrItem: any[]) {
    if (this.typeList == 1) {
      if (this.policyMaster.Status === 0 || this.policyMaster.Status === 4) {
        if (this.isCreator || this.isMaster) {
          return [{ Name: "Xóa công việc", Code: "trash", Type: 'Delete', Link: "delete", Actived: true }];
        }
      }
      // Đối với Gửi duyệt
      if (this.policyMaster.Status === 1) {
        // Chỉ với quyền duyệt và toàn quyền
        if (this.isApprover || this.isMaster) {
          return [{ Name: "Xóa công việc", Code: "trash", Type: 'Delete', Link: "delete", Actived: true }];
        }
      }
    }
    else if (this.typeList == 2 || this.typeList == 3) {
      console.log(arrItem)
      let listAction: any[] = [];
      let itemStatus = 0;

      arrItem.find(item => {
        itemStatus = item.ListHRDecisionTaskLog[0].Status;

        if ((itemStatus !== 6 && item.TypeAssignee !== 1) && !this.isAllowedToViewOnly) {
          if (this.handleCheckItemList(listAction, "Thực hiện bởi")) {
            listAction.push({ Name: "Thực hiện bởi", Code: "user", Type: 'AssigneeBy', Link: "assigneeBy", Actived: true });
          }

          if (this.typeProfile == 2) {
            if (this.handleCheckItemList(listAction, "Duyệt bởi")) {
              listAction.push({ Name: "Duyệt bởi", Code: "paste", Type: 'ApprovedBy', Link: "approvedBy", Actived: true });
            }
          }
        }

        if ((this.isApprover || this.isMaster) && itemStatus == 3) {
          if (this.handleCheckItemList(listAction, "Ngưng thực hiện")) {
            listAction.push({ Name: "Ngưng thực hiện", Code: "minus-outline", Type: 'Stop', Link: "stop", Actived: true });
          }

          if (this.typeProfile == 1) {
            if (this.handleCheckItemList(listAction, "Hoàn tất")) {
              listAction.push({ Name: "Hoàn tất", Code: "check-circle", Type: 'Success', Link: "success", Actived: true });
            }
          } 
          
          else if (this.typeProfile == 2) {
            if (this.handleCheckItemList(listAction, "Gửi duyệt")) {
              listAction.push({ Name: "Gửi duyệt", Code: "redo", Type: 'Sent', Link: "sent", Actived: true });
            }

          }
        }

        if ((this.isApprover || this.isMaster || this.isCreator) && (itemStatus == 2 || itemStatus == 5)) {
          if(this.typeList == 3 && Ps_UtilObjectService.hasValue(this.decisionProfile)){
            if(this.decisionProfile.Status == 1 && (this.isCreator || this.isMaster)){
              if (this.handleCheckItemList(listAction, "Mở lại")) {
                listAction.push({ Name: "Mở lại", Code: "reset", Type: 'Open', Link: "open", Actived: true });
              }
            }

            if(this.decisionProfile.Status == 1 && (this.isApprover || this.isMaster)){
              if (this.handleCheckItemList(listAction, "Mở lại")) {
                listAction.push({ Name: "Mở lại", Code: "reset", Type: 'Open', Link: "open", Actived: true });
              }
            }
          }

          if (itemStatus == 2 && (Ps_UtilObjectService.hasValue(this.decisionProfile) && this.decisionProfile.Status == 1)) {
            if (item.Task == null && !Ps_UtilObjectService.hasValue(item.TypeData) && (this.isCreator || this.isMaster)) {
              if (this.handleCheckItemList(listAction, "Xóa công việc")) {
                listAction.push({ Name: "Xóa công việc", Code: "trash", Type: 'Delete', Link: "delete", Actived: true });
              }
            }
          }
        }

        if ((this.isApprover || this.isMaster) && itemStatus == 4) {
          if (this.handleCheckItemList(listAction, "Duyệt")) {
            listAction.push({ Name: "Duyệt", Code: "check-circle", Type: 'Approve', Link: "approve", Actived: true });
          }
        }

        if ((this.isCreator || this.isMaster) && itemStatus == 1) {
          if (this.handleCheckItemList(listAction, "Không thực hiện")) {
            listAction.push({ Name: "Không thực hiện", Code: "minus-outline", Type: 'NotDo', Link: "notDo", Actived: true });
          }

          if (item.Task == null && !Ps_UtilObjectService.hasValue(item.TypeData) && (this.isCreator || this.isMaster)) {
            if (this.handleCheckItemList(listAction, "Xóa công việc")) {
              listAction.push({ Name: "Xóa công việc", Code: "trash", Type: 'Delete', Link: "delete", Actived: true });
            }
          }
        }
      })

      // Đảm bảo "Thực hiện bởi" và "Duyệt bởi" nằm cuối cùng
      listAction = listAction.filter(action => action.Name !== "Thực hiện bởi" && action.Name !== "Duyệt bởi")
        .concat(
          listAction.filter(action => action.Name === "Thực hiện bởi" || action.Name === "Duyệt bởi")
        );

      this.addDividerBeforeUserBox();
      return listAction;
    }
    return [];
  }

  /**
   * Hàm kiểm tra list action đã có action đó chưa?
   */
  handleCheckItemList(listItem: any[], name: string): boolean {
    return !listItem.some(item => item.Name === name);
  }

  /**
   * Hàm dùng để thực hiện các action trên popup chọn nhiều
   * @param btnType loại button
   * @param listSelectedItem danh sách item được chọn
   * @param value 
   */
  onSelectionActionItemClick(btnType: string, listSelectedItem: any[], value: any) {
    let listName: string[] = [];
    let listAssignee: { Code: number, Text: string }[] = [];
    let listApprove: { Code: number, Text: string }[] = [];
    this.listSelectItemTask = listSelectedItem;

    if (this.typeList == 2) {
      listSelectedItem.map(item => listName.push(item.FullName));
    } else if (this.typeList == 3) {
      listName.push(this.decisionProfile.FullName + ' - ' + this.decisionProfile.StaffID);
    }

    if (btnType === 'Delete') {
      if (this.typeList !== 1) {
        this.isDecisionTaskToDelete = true;
      }
      this.selectedRowitem = listSelectedItem;
      this.isOpenPopupConfirmDelete = true;
    }
    else if (btnType === 'Open') {
      this.codeConfirmDialog = 1;
      listName = [];
      listSelectedItem.map(item => listName.push(item.TaskName))
      this.APIGetListHR();
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogShow = true;
    }

    else if (btnType === 'Stop') {
      this.codeConfirmDialog = 2;
      if (this.typeList == 3) {
        listName = [];
        listSelectedItem.map(item => listName.push(item.TaskName))
      }
      this.APIGetListHR();
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogShow = true;
    }

    else if (btnType === 'NotDo') {
      this.codeConfirmDialog = 8;
      if (this.typeList == 3) {
        listName = [];
        listSelectedItem.map(item => listName.push(item.TaskName))
      }
      this.APIGetListHR();
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogShow = true;
    }

    else if (btnType === 'AssigneeBy') {
      this.codeConfirmDialog = 3;
      listSelectedItem.forEach(item => {
        if (item.TypeAssignee !== 1) {
          // Kiểm tra nếu item.PositionAssignee đã tồn tại trong listAssignee
          const isDuplicate = listAssignee.some(assignee => assignee.Code === item.PositionAssignee);
          if (!isDuplicate) {
            // Nếu chưa tồn tại, push item mới vào listAssignee
            listAssignee.push({
              Code: item.PositionAssignee,
              Text: item.AssigneePositionName
            });
          }
        }
      });

      if (this.typeList == 2) {
        listName = [];
        listSelectedItem.map(item => listName.push(item.FullName + ' - ' + item.StaffID));
      }
      else if (this.typeList == 3) {
        listName = [];
        listSelectedItem.map(item => listName.push(item.TaskName));
      }

      this.APIGetListEmployee();
      this.listPositionAssignee = listAssignee;
      this.listNameSelected = this.formatListName(listName);
      this.isChangedDialogShow = true;
    }

    else if (btnType === 'ApprovedBy') {
      this.codeConfirmDialog = 4;
      listSelectedItem.map(item => {
        // if (listApprove.some(itemApp => itemApp.Code !== item.Code)) {
        listApprove.push({
          Code: item.PositionApproved,
          Text: item.ApprovedPositionName
        });
        // }
      });

      if (this.typeList == 2) {
        listName = [];
        listSelectedItem.map(item => listName.push(item.FullName + ' - ' + item.StaffID));
      }
      else if (this.typeList == 3) {
        listName = [];
        listSelectedItem.map(item => listName.push(item.TaskName));
      }

      this.APIGetListEmployee();
      this.listPositionApprove = listApprove;
      this.listNameSelected = this.formatListName(listName);
      this.isChangedDialogShow = true;
    }
    else if (btnType === 'Sent') {
      if (this.typeList == 2) {
        listName = [];
        listSelectedItem.map(item => listName.push(item.FullName + ' - ' + item.StaffID));
      }
      else if (this.typeList == 3) {
        listName = [];
        listName.push(this.decisionProfile.FullName + ' - ' + this.decisionProfile.StaffID);
      }
      this.codeConfirmDialog = 5;
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogSent = true;
    }
    else if (btnType === 'Success') {
      if (this.typeList == 2) {
        listName = [];
        listSelectedItem.map(item => listName.push(item.FullName + ' - ' + item.StaffID));
      }
      else if (this.typeList == 3) {
        listName = [];
        listName.push(this.decisionProfile.FullName + ' - ' + this.decisionProfile.StaffID);
      }
      this.codeConfirmDialog = 6;
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogSent = true;
    }

    else if (btnType === 'Approve') {
      this.codeConfirmDialog = 7;
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogSent = true;
    }
  }

  /**
  //  * Hàm dùng để lấy danh sách ngoại lệ sau khi chọn xem chi tiết ngoại lệ
   * @param task 
   */
  callData(task: DTOHRPolicyTask) {
    this.APIGetListHRTaskException(task);
  }

  /**
   * Hàm dùng để thêm class vào cho tr của grid
   * @param context 
   * @returns 
   */
  rowCallback = (context: RowClassArgs) => {
    if (this.typeList == 1 && this.isDTOCheck(context.dataItem, 'DTOHRPolicyTask')) {
      return {
        'has-exception': context.dataItem.HasException === true,
        'none-exception-1': context.dataItem.HasException === false && this.typeApplyPosition === 1,
        'none-exception-2': context.dataItem.HasException === false && this.typeApplyPosition === 2,
        'item-onboarding': this.policyMaster.TypeData === 1,
        'item-offboarding': this.policyMaster.TypeData === 2,
      }
    }

    else if ((this.typeList == 2 || this.typeList == 3)) {
      if (Ps_UtilObjectService.hasListValue(context.dataItem.ListHRDecisionTaskLog)) {
        return {
          'item-send': context.dataItem.ListHRDecisionTaskLog[0]?.Status == 4,
          'item-complete': context.dataItem.ListHRDecisionTaskLog[0]?.Status == 6,
          'item-stop': context.dataItem.ListHRDecisionTaskLog[0]?.Status == 2
            || context.dataItem.ListHRDecisionTaskLog[0]?.Status == 5
        };
      }
    }

  };

  /**
   * Hàm dùng để thêm class vào cho grid
   * @returns 
   */
  handleSetClassGrid = () => {
    return {
      'grid-type-1': this.typeApplyPosition === 1,
      'grid-type-2': this.typeApplyPosition === 2,
      'grid-onboarding': this.policyMaster.TypeData === 1,
      'grid-offboarding': this.policyMaster.TypeData === 2,
      'grid-noinput': this.policyMaster.Status === 2 || this.policyMaster.Status === 3,
      'grid-approve': this.policyMaster.Status === 2,
      'grid-stop': this.policyMaster.Status === 3,
      'selecting-item': this.isSelectingItemGrid
    };
  };

  /**
  * Hàm dùng để thêm class vào cho tr của treelist
  * @param context 
  * @returns 
  */
  handleSetClassRowTreeList = (context: RowClassArgs) => {
    return {
      'row-level-1': context.dataItem.Level === 1
    }
  }


  /**
   * Delete all task exception of this policy Master
   */
  handleDeleteAllTaskException() {
    const list: DTOHRPolicyTask[] = this.listTask.data?.filter((task: DTOHRPolicyTask) => task.HasException);
    if (list.length > 0) {
      this.APIDeleteHRPolicyTask(list);
    }
  }

  /**
   * Clear list policy task into []
   */
  handleClearListPolicyTask() {
    this.listTask = { data: [], total: 0 };
  }

  /**
   * Have task exception?
   * @param task task want to check exception
   * @returns true or false
   */
  hasException(task: DTOHRPolicyTask) {
    // If policy has task exception
    if (task.HasException) {
      return true;
    }
    return false;
  }

  /**
   * This function is called when want to get number of list staff type
   * @param task task want to check
   * @returns number of list staff type
   */
  getNumOfListStaffType(task: DTOHRPolicyTask) {
    if (task && Ps_UtilObjectService.hasListValue(task.ListStaffType)) {
      const count: number = task.ListStaffType.length;
      return count;
    }
    return 0;
  }

  /**
   * This function provides an available action list for a DTOHRPolicyTask that can handle it
   * @returns list of actions
   */
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOHRDecisionTask | DTOHRPolicyTask): MenuDataItem[] {
    const actionEdit: MenuDataItem = { Name: "Chỉnh sửa", Code: "pencil", Actived: true };
    const actionView: MenuDataItem = { Name: "Xem chi tiết", Code: "eye", Actived: true };
    const actionDelete: MenuDataItem = { Name: "Xóa công việc", Code: "trash", Actived: true };
    const actionSend: MenuDataItem = { Name: "Gửi duyệt", Code: "redo", Actived: true };
    const actionStop: MenuDataItem = { Name: "Ngưng thực hiện", Code: "minus-outline", Actived: true };
    const actionNotDo: MenuDataItem = { Name: "Không thực hiện", Code: "minus-outline", Actived: true };
    const actionComplete: MenuDataItem = { Name: "Hoàn tất", Code: "check-circle", Actived: true };
    const actionApprove: MenuDataItem = { Name: "Duyệt", Code: "check-circle", Actived: true };
    const actionOpen: MenuDataItem = { Name: "Mở lại", Code: "reset", Actived: true };

    const creatorOrMaster = this.isCreator || this.isMaster;
    const approverOrMaster = this.isApprover || this.isMaster;

    if (this.typeList == 1) {
      switch (this.policyMaster.Status) {
        case 0: // Đang soạn thảo
        case 4: // Trả về
          return creatorOrMaster ? [actionEdit, actionDelete] : [actionView];

        case 1: // Gửi duyệt
          return approverOrMaster ? [actionEdit, actionDelete] : [actionView];

        case 2: // Duyệt áp dụng
        case 3: // Ngưng hiển thị
          return [actionView];

        default:
          return !this.isApprover && !this.isMaster && !this.isCreator ? [actionView] : [];
      }
    }
    else if (this.typeList == 2 || this.typeList == 3) {
      let valueCheck = 0;
      if (this.isDTOCheck(dataItem, 'DTOHRDecisionTask')) {
        valueCheck = dataItem.ListHRDecisionTaskLog[0]?.Status;

        switch (valueCheck) {
          case 1: // Chưa thực hiện
            if (Ps_UtilObjectService.hasValue(dataItem.Task)) {
              return creatorOrMaster ? [actionEdit, actionNotDo] : [actionView];
            } else {
              return creatorOrMaster ? [actionEdit, actionNotDo, actionDelete] : [actionView];
            }
          case 3: // Đang thực hiện
            if (this.typeProfile == 1 || this.typeData == 1 || this.typeData == 3) {
              return approverOrMaster ? [actionEdit, actionStop, actionComplete,] : [actionView];
            } else if (this.typeProfile == 2 || this.typeData == 2 || this.typeData == 4) {
              return approverOrMaster ? [actionEdit, actionStop, actionSend,] : [actionView];
            }
          case 4: //Chờ duyệt
            return approverOrMaster ? [actionView, actionApprove] : [actionView];
          case 2: // Không thực hiện
          case 5: // Ngưng thực hiện
            if (this.typeData == 1 || this.typeData == 2) {
              return creatorOrMaster ? [actionView, actionOpen] : [actionView];
            } else {
              return approverOrMaster ? [actionEdit, actionOpen] : [actionView];
            }
          case 6: // Hoàn tất
            return [actionView];

          default:
            return !this.isApprover && !this.isMaster && !this.isCreator ? [actionView] : [];
        }
      }
    }
  }

  /**
   * Hàm xử lý thêm div divier trước "Thực hiện bởi", "Duyệt bởi"
   */
  addDividerBeforeUserBox(): void {
    setTimeout(() => {
      const boxBtns = this.el.nativeElement.querySelectorAll('.box.box-btn');
      for (let i = 0; i < boxBtns.length; i++) {
        const boxBtn = boxBtns[i] as HTMLElement;
        if (boxBtn.querySelector('.k-i-user')) {
          const previousElement = boxBtn.previousElementSibling;

          // Kiểm tra xem phần tử trước đó có phải là divider hay không
          if (previousElement && previousElement.classList.contains('divider')) {
            break; // Đã có divider, dừng lại không thêm nữa
          }

          const divider = this.renderer.createElement('div');
          this.renderer.addClass(divider, 'divider');
          const parent = boxBtn.parentNode;
          if (parent) {
            this.renderer.insertBefore(parent, divider, boxBtn);
          }
          break; // Dừng vòng lặp sau khi đã thêm divider
        }
      }
    }, 1);
  }


  /**
   * Check xem có thể dùng check box để xóa công việc hay không
   * @returns true nếu có thể
   */
  onCheckDeletableTask() {
    if (this.policyMaster.Status === 0 || this.policyMaster.Status === 4) {
      if (this.isCreator || this.isMaster) {
        return true;
      }
    }

    if (this.policyMaster.Status === 1) {
      if (this.isApprover || this.isMaster) {
        return true;
      }
    }

    return false;
  }

  /**
   * The event onclick on action dropdown list callback function
   * @param action button action is clicked
   * @param item task will be handle
   */
  onActionDropdownClick(action: MenuDataItem, item: DTOHRPolicyTask | DTOHRDecisionTask) {
    let listName: string[] = [];
    this.listSelectItemTask = [];
    if (this.typeList == 1) {
      this.listSelectItemTask = this.listSelectItemTask as DTOHRPolicyTask[];
      this.listSelectItemTask.push(item as DTOHRPolicyTask);
    } else {
      this.listSelectItemTask = this.listSelectItemTask as DTOHRDecisionTask[];
      this.listSelectItemTask.push(item as DTOHRDecisionTask);
    }

    if (action.Code === 'trash') {
      if (this.typeList == 1) {
        this.seletedTaskToDelete = item as DTOHRPolicyTask;
      } else {
        let listItem: DTOHRDecisionTask[] = [];
        this.isDecisionTaskToDelete = true;
        this.seletedTaskToDelete = item as DTOHRDecisionTask;
        listItem.push(item as DTOHRDecisionTask);
        this.selectedRowitem = listItem;
      }
      this.isOpenPopupConfirmDelete = true;
    }
    else if (action.Code === 'pencil') {
      if (this.typeList == 1) {
        this.onClickToolBox.emit({ item: item, status: 13 });
      }
      else {
        this.onClickEditTask.emit({ item: item as DTOHRDecisionTask, status: 'Edit' })
      }
    }
    else if (action.Code === 'eye') {
      if (this.typeList == 1) {
        this.onClickToolBox.emit({ item: item, status: 14 });
      }
      else {
        this.onClickEditTask.emit({ item: item as DTOHRDecisionTask, status: 'View' })
      }
    }
    else if (action.Code === 'reset') {
      listName.push(item.TaskName);
      this.codeConfirmDialog = 1;
      this.APIGetListHR();
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogShow = true;
    }
    else if (action.Code === 'minus-outline') {
      if (this.decisionProfile.Status == 1) {
        if (this.typeList == 2) {
          item = item as DTOHRDecisionTask
          listName.push(item.FullName);
        } else if (this.typeList == 3) {
          listName.push(this.decisionProfile.FullName);
        }
        this.codeConfirmDialog = 8;
      }
      else {
        listName.push(item.TaskName);
        this.codeConfirmDialog = 2;
      }
      this.APIGetListHR();
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogShow = true;
    }
    else if (action.Code === 'check-circle') {
      item = item as DTOHRDecisionTask;

      if (this.typeList == 2) {
        listName.push(item.FullName + ' - ' + item.StaffID);
      } else if (this.typeList == 3) {
        listName.push(this.decisionProfile.FullName + ' - ' + this.decisionProfile.StaffID);
      }

      if (action.Name == "Duyệt") {
        this.codeConfirmDialog = 5;
      } else {
        this.codeConfirmDialog = 6;
      }
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogSent = true;
    }
    else if (action.Code === 'redo') {
      item = item as DTOHRDecisionTask;
      listName.push(item.FullName + ' - ' + item.StaffID);

      this.codeConfirmDialog = 7;
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogSent = true;
    }
    // else if (action.Code === 'close-outline') {
    //   listName.push(this.decisionProfile.FullName);
    //   this.codeConfirmDialog = 8;
    //   this.APIGetListHR();
    //   this.listNameSelected = this.formatListName(listName);
    //   this.isConfirmDialogShow = true;
    // }
  }

  /**
   * This function is called whenever toggle on toolbox (...)
   * @param dataItem task is handled
   */
  toggleToolBox(dataItem: DTOHRPolicyTask) {
    if (this.seletedToolBox !== dataItem) {
      this.seletedToolBox = dataItem;
    } else {
      this.seletedToolBox = null;
    }

    // Remove 'active' class from all cells
    const cell9s = document.querySelectorAll('td.k-table-td[aria-colindex="9"]');
    cell9s.forEach(cell => cell.classList.remove('active'));

    const cell10s = document.querySelectorAll('td.k-table-td[aria-colindex="10"]');
    cell10s.forEach(cell => cell.classList.remove('active'));

    const cell11s = document.querySelectorAll('td.k-table-td[aria-colindex="11"]');
    cell11s.forEach(cell => cell.classList.remove('active'));

    // Add 'active' class to the clicked cell
    const cell9 = (event.target as HTMLElement).closest('td.k-table-td[aria-colindex="9"]');
    if (cell9) {
      cell9.classList.add('active');
    }

    // Add 'active' class to the clicked cell
    const cell10 = (event.target as HTMLElement).closest('td.k-table-td[aria-colindex="10"]');
    if (cell10) {
      cell10.classList.add('active');
    }

    // Add 'active' class to the clicked cell
    const cell11 = (event.target as HTMLElement).closest('td.k-table-td[aria-colindex="11"]');
    if (cell11) {
      cell11.classList.add('active');
    }
  }

  /**
   * The event is called whenever wanna close popup confirm delete 
   */
  closePopupConfirmDeleteTask() {
    this.isOpenPopupConfirmDelete = false;
    this.seletedTaskToDelete = null;
    this.selectedPolicyTaskLimit = null;
    this.selectedTaskDeleteException = null;
    this.isDecisionTaskToDelete = false;
    this.selectedRowitem = [];
  }

  /**
   * The event is called whenever wanna delete task
   */
  handleDeleteListPolicyTask() {
    let listDeletePolicyTask: DTOHRPolicyTask[] = [];
    if (this.seletedTaskToDelete) {
      listDeletePolicyTask.push(this.seletedTaskToDelete as DTOHRPolicyTask);
    }
    else {
      this.selectedRowitem.forEach(item => {
        if (this.isDTOCheck(item, 'DTOHRPolicyTask')) {
          listDeletePolicyTask = this.selectedRowitem as DTOHRPolicyTask[];
        }
        return;
      })
    }
    this.APIDeleteHRPolicyTask(listDeletePolicyTask);
    this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
  }

  expandDetailsBy = (dataItem: any): number => {
    return dataItem;
  };

  /**
   * This event is called whenever want to clear all selection
   */
  onClearSelection() {
    this.count = 0;
    this.selectedKeys = [];
    this.selectedRowitem = [];
    this.selectedRowitemDialogOpened = false;
    this.listSeletedTaskToDelete = [];

    const pagers = document.querySelectorAll('kendo-pager');
    pagers?.forEach(item => {
      item.classList.remove('disabled');
    })

    this.isSelectingGrid.emit(false);
  }

  /**
   * The event is called whenever click button that on popup when click items on grid
   * @param btnType button will be appeared on dialog when select multiple item
   */
  onSelectedPopupBtnClick(btnType: string) {
    // Delete list task
    if (btnType === "1") {
      this.isOpenPopupConfirmDelete = true;
      this.listSeletedTaskToDelete = (this.selectedRowitem as (DTOHRPolicyTask | DTOHRDecisionTask)[])
        ?.filter((item): item is DTOHRPolicyTask => 'Policy' in item)
        .map(item => item.TaskName);
    }
  }

  /**
   * The event is called whenever toggle on pager of grid
   * @param event 
   */
  onPageChange(event: PageChangeEvent) {
    this.pageSize = event.take;
    this.gridState.skip = event.skip;
    this.gridState.take = event.take;
    if (this.typeList == 1) {
      this.APIGetListHRPolicyTask();
    } else {
      this.APIGetListHRDecisionTask();
    }
  }

  /**
   * Fetch data ra list
   * @param item 
   * @returns 
   */
  fetchChildren = (item?: HRPolicyItem): HRPolicyItem[] | undefined => {
    if (item && item.ListException) {
      let children: HRPolicyItem[] = [];
      if (Ps_UtilObjectService.hasListValue(item.ListException)) {
        children.push(...item.ListException)
      }
      return children;
    }
    return undefined;
  };

  /**
   * Check that item has children or not
   * @param item obj need check
   * @returns 
   */
  hasChildren = (item: HRPolicyItem): boolean => {
    const children = this.fetchChildren(item);
    return children !== undefined && children.length > 0;
  };

  /**
   * Check item in exception task can be deleted
   * @param dto task need to check
   * @returns true if deleteable
   */
  onCheckDeletableException(dto: HRPolicyItem): boolean {
    const creatorOrMaster = this.isCreator || this.isMaster;
    const approverOrMaster = this.isApprover || this.isMaster;

    // Quyền xem
    if (!creatorOrMaster && !approverOrMaster) {
      return false;
    }

    // Nếu không chứa ngoại lệ con
    if (!Ps_UtilObjectService.hasListValue(dto.ListException)) {
      // Đối với Đang soạn thảo hoặc Trả về
      if (this.policyMaster.Status == 0 || this.policyMaster.Status == 4) {
        if (creatorOrMaster) {
          return true;
        }
      }

      // Đối với Gửi duyệt
      if (this.policyMaster.Status == 1 && approverOrMaster) {
        return true;
      }
    }
    return false
  }

  /**
   * This function is called when click on delete policy task exception button 
   * @param dto task limit want to handle
   */
  toogleButtonPolicyTaskLimit(dto: HRPolicyItem, action: 'delete' | 'stop', task?: DTOHRPolicyTask) {
    this.selectedTaskDeleteException = task;
    // Delete policy task exception
    if (action === 'delete') {
      this.selectedPolicyTaskLimit = dto;
      this.isOpenPopupConfirmDelete = true;
    }

    // Stop policy task exception
    else if (action === 'stop') {
      this.APIUpdateHRPolicyLimitStatus(dto);
    }
  }

  /**
   * Hàm dùng để lấy các loại nhân sự áp dụng để hover title
   * @param task 
   */
  getListStaffTypeTitle(task: DTOHRPolicyTask) {
    const list: string[] = task?.ListStaffType.map(item => item.TypeStaffName);
    return list.slice(1).join(',\n');
  }

  /**
   * Hàm dùng để lấy các công việc cần xóa để hover
   * @param task 
   */
  getListTaskTitle() {
    const list: string[] = this.selectedRowitem.map(item => item.TaskName);
    return list.slice(2).join(',\n');
  }

  /**
   * Hàm set typeProfile (On/Off) dựa theo input typeData
   */
  getTypeProfile() {
    if (this.typeData == 1 || this.typeData == 3 || this.typeData == 5 || this.typeData == 7) {
      this.typeProfile = 1;
    } else if (this.typeData == 2 || this.typeData == 4 || this.typeData == 6 || this.typeData == 8) {
      this.typeProfile = 2;
    }
  }

  /**
   * Hàm lấy danh sách tên công việc khi select nhiều công việc
   * @returns trả về danh sách tên công việc
   */
  getListTaskName(item: DTOHRDecisionTask): string[] {
    let listTaskName: string[] = [];
    listTaskName.push(item.TaskName);
    // this.selectedRowitem.map(item => listTaskName.push(item.TaskName));
    return listTaskName;
  }

  /**
   * Hàm format từ list string công việc thành "công việc chính + x công việc"
   * @param listTaskName Danh sách công việc
   * @returns Đối tượng chứa mainTitle (Công việc chính), extraPositions (Chuỗi "+ x công việc"), extraTitle (Chuỗi title khi hover vào "+ x công việc")
   */
  formatListName(listName: string[]): { mainTitle: string, extraPositions: string, extraTitle: string } {
    let mainTitle = listName[0] || '';
    let extraPositions = '';
    let extraTitle = '';

    // Nếu có nhiều hơn một công việc, tạo chuỗi "x công việc" và title chi tiết
    if (listName.length > 1) {
      const quantityPos = listName.length; // Sử dụng trực tiếp chiều dài của mảng

      if (this.isConfirmDialogSent) {
        extraPositions = `${quantityPos} nhân sự`;
      }
      else {
        if (this.typeList == 3) {
          extraPositions = `${quantityPos} công việc`;
        }
        else if (this.typeList == 2) {
          extraPositions = `${quantityPos} nhân sự`;
        }
      }
      extraTitle = listName.join('\n');
    }

    // console.log(mainTitle)
    // console.log(extraPositions)
    // console.log(extraTitle)
    return { mainTitle, extraPositions, extraTitle };
  }


  /**
   * Hàm lấy value reason khi change select
   * @param value value reason được chọn
   */
  getValueChangeDropdown(value: { Code: number, Text: string }) {
    console.log(value)
    this.valueReason = value;
    if (this.codeConfirmDialog == 1) {
      if (value.Code == 109) {
        this.isObligatoryReason = true;
      }
      else {
        this.isObligatoryReason = false;
      }
    }
    else if (this.codeConfirmDialog == 2) {
      if (value.Code == 104) {
        this.isObligatoryReason = true;
      }
      else {
        this.isObligatoryReason = false;
      }
    }
    else if (this.codeConfirmDialog == 3) {
      this.valueAssignee = value;
    }
    else if (this.codeConfirmDialog == 4) {
      this.valueApprove = value;
    }
    else if (this.codeConfirmDialog == 8) {
      if (value.Code == 104) {
        this.isObligatoryReason = true;
      }
      else {
        this.isObligatoryReason = false;
      }
    }
  }

  /**
   * Hàm lấy giá trị nhân sự được chọn từ dropdown
   * @param value item nhân sự được chọn 
   */
  getValueChangeEmployee(value: DTOEmployee) {
    console.log(value);
    this.valueEmployee = value;
  }


  /**
  * Hàm toggle popup ngưng tuyển dụng/ điều chuyển
  */
  toggleClosedDialog() {
    this.isConfirmDialogShow = false;
    this.isChangedDialogShow = false;
    this.isConfirmDialogSent = false;
    this.isObligatoryReason = false;
    this.valueReason = null;
    this.valueRemark = null;
    this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
  }

  /**
   * Hàm confirm dialog ngưng/không/mở công việc
   */
  onDiaglogConfirm() {
    if (this.isObligatoryReason) {
      if (!Ps_UtilObjectService.hasValueString(this.valueRemark.value)) {
        if (this.codeConfirmDialog == 1) {
          this.layoutService.onError(`Đã xảy ra lỗi khi mở lại công việc: Chưa nhập mô tả`);
        } else if (this.codeConfirmDialog == 2) {
          this.layoutService.onError(`Đã xảy ra lỗi khi ngưng thực hiện công việc: Chưa nhập mô tả`);
        } else if (this.codeConfirmDialog == 8) {
          this.layoutService.onError(`Đã xảy ra lỗi khi chuyển sang không thực hiện công việc: Chưa nhập mô tả`);
        }
      } else {
        console.log(this.listSelectItemTask)
        this.getListCanChangedStatus(this.listSelectItemTask);
        this.toggleClosedDialog();
        this.isConfirmDialogShow = false;
      }
    } else {
      if (!Ps_UtilObjectService.hasValue(this.valueReason) || !Ps_UtilObjectService.hasValue(this.valueReason.Code)) {
        if (this.codeConfirmDialog == 1) {
          this.layoutService.onError(`Đã xảy ra lỗi khi mở lại công việc: Chưa chọn lí do`);
        } else if (this.codeConfirmDialog == 2) {
          this.layoutService.onError(`Đã xảy ra lỗi khi ngưng thực hiện công việc: Chưa chọn lí do`);
        } else if (this.codeConfirmDialog == 8) {
          this.layoutService.onError(`Đã xảy ra lỗi khi chuyển sang không thực hiện công việc: Chưa chọn lí do`);
        }
      } else {
        this.getListCanChangedStatus(this.listSelectItemTask);
        this.toggleClosedDialog();
      }
    }
  }

  /**
   * Hàm confirm dialog thay đổi thực hiện/duyệt bởi
   */
  onDialogConfirmChangedInfo() {
    if (Ps_UtilObjectService.hasValue(this.valueEmployee)) {
      if (this.codeConfirmDialog == 3) {
        if (this.valueAssignee.Code == 0) {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin công việc: Chưa chọn chức danh thực hiện`);
        } else {
          this.getListCanChangedStatus(this.listSelectItemTask);
          this.toggleClosedDialog();
        }
      }
      else if (this.codeConfirmDialog == 4) {
        if (this.valueApprove.Code == 0) {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin công việc: Chưa chọn chức danh duyệt`);
        } else {
          this.getListCanChangedStatus(this.listSelectItemTask);
          this.toggleClosedDialog();
        }
      }
    } else{
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin công việc: Chưa chọn nhân sự`);
    }
  }

  /**
 * Hàm confirm dialog duyệt/gửi duyệt/hoàn tất công việc
 */
  onDialogConfirmTask() {
    this.getListCanChangedStatus(this.listSelectItemTask);
    this.toggleClosedDialog();
  }

  /**
   * Hàm chuyển trạng thái tất cả công việc tùy vào trạng thái được chuyển của profile
   */
  ChangeStatusAllTask() {
    let listProperties: string[] = [];
    let listTaskCanChange: DTOHRDecisionTask[] = [];
    this.listTask.data.map((task: DTOHRDecisionTask) => {
      if (this.decisionProfile.Status == 1) {
        listProperties.push('Status');
        if (task.Status == 1) {
          task.Status = 3;
          listTaskCanChange.push(task);
        }
      }
    })
    console.log(listTaskCanChange)
    this.APIUpdateListHRDecisionTask(listTaskCanChange, listProperties);
  }


  /**
   * Hàm kiểm tra dữ liệu string cho bên dom
   * @param value dữ liệu string cần được kiểm tra
   * @returns 
   */
  checkValueString(value: string): boolean{
    if(Ps_UtilObjectService.hasValueString(value)){
      return true;
    } else {
      return false;
    }
  }


  getEndDateByTimeDoing(timeDoing: string): Date | null {
    const daysToAdd = parseInt(timeDoing, 10);
  
    if (isNaN(daysToAdd)) {
      // Nếu tham số không hợp lệ, trả về null
      return null;
    }
  
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + daysToAdd);
  
    return currentDate; // Trả về đối tượng Date
  }

  /**
   * Hàm check danh sách có thể đổi trạng thái
   */
  getListCanChangedStatus(listData: DTOHRDecisionTask[] | DTOHRPolicyTask[]) {
    let listProperties: string[] = [];
    let listCanChange: DTOHRPolicyTask[] | DTOHRDecisionTask[] = [];
    let listPolicyTaskCanChange: DTOHRDecisionTask[] = [];
    let listDecisionTaskCanChange: DTOHRDecisionTask[] = [];

    //Mở lại
    if (this.codeConfirmDialog == 1) {
      listProperties.push('Status', 'Reason', 'ReasonDescription');
      listData.map(item => {
        if (item.Status == 2 || item.Status == 5) {
          if (item.Status == 2) {
            item.Status = 1;
          } else {
            item.Status = 3;
          }
          item.Reason = this.valueReason.Code;
          item.ReasonDescription = this.valueRemark.value;
          listCanChange.push(item);
        }
      })
    }
    //Ngưng thực hiện
    else if (this.codeConfirmDialog == 2) {
      listProperties.push('Status', 'Reason', 'ReasonDescription');
      listData.map(item => {
        if (item.Status == 3) {
          item.Status = 5;
          item.Reason = this.valueReason.Code;
          item.ReasonDescription = this.valueRemark.value;
          listCanChange.push(item);
        }
      })
    }
    //Thực hiện bởi
    else if (this.codeConfirmDialog == 3) {
      listProperties.push('Assignee', 'AssigneeID', 'AssigneeName');
      listData.map(item => {
        if (item.PositionAssignee == this.valueAssignee.Code && (item.TypeAssignee !== 1 && item.Status !== 6)) {
          item.Assignee = this.valueEmployee.Code;
          item.AssigneeID = this.valueEmployee.StaffID;
          item.AssigneeName = this.valueEmployee.LastName + ' ' + this.valueEmployee.MiddleName + ' ' + this.valueEmployee.FirstName
          listCanChange.push(item);
        }
      })
    }
    //Duyệt bởi
    else if (this.codeConfirmDialog == 4) {
      listProperties.push('Approved', 'ApprovedID', 'ApprovedName');
      listData.map(item => {
        if ((item.PositionApproved == this.valueApprove.Code) && item.Status !== 6) {
          item.Approved = this.valueEmployee.Code;
          item.ApprovedID = this.valueEmployee.StaffID;
          item.ApprovedName = this.valueEmployee.LastName + ' ' + this.valueEmployee.MiddleName + ' ' + this.valueEmployee.FirstName
          listCanChange.push(item);
        }
      })
    }
    //Duyệt công việc
    else if (this.codeConfirmDialog == 5) {
      listProperties.push('Status');
      listData.map(item => {
        if (item.Status == 4) {
          item.Status = 6;
          listCanChange.push(item);
        }
      })
    }
    //Hoàn tất công việc
    else if (this.codeConfirmDialog == 6) {
      listProperties.push('Status');
      listData.map(item => {
        if (item.Status == 3) {
          item.Status = 6;
          listCanChange.push(item);
        }
      })
    }
    //Gửi duyệt công việc
    else if (this.codeConfirmDialog == 7) {
      listProperties.push('Status');
      listData.map(item => {
        if (item.Status == 3) {
          item.Status = 4;
          listCanChange.push(item);
        }
      })
    }
    //Không thực hiện
    else if (this.codeConfirmDialog == 8) {
      listProperties.push('Status', 'Reason', 'ReasonDescription');
      listData.map(item => {
        if (item.Status == 1) {
          item.Status = 2;
          item.Reason = this.valueReason.Code;
          item.ReasonDescription = this.valueRemark.value;
          listCanChange.push(item);
        }
      })
    }

    this.listItemCanChange = listCanChange as DTOHRDecisionTask[];
    console.log(this.listItemCanChange);
    this.APIUpdateListHRDecisionTask(this.listItemCanChange, listProperties);
  }

  /**
   * Hàm đổi màu dialog
   * @returns 
   */
  getColorDialog(): string {
    if (this.codeConfirmDialog == 1 || this.codeConfirmDialog == 8) {
      return "rgba(241, 128, 46, 1)";
    } else if (this.codeConfirmDialog == 2) {
      return "rgba(216, 44, 18, 1)";
    } else if (this.codeConfirmDialog == 3 || this.codeConfirmDialog == 4) {
      return "rgba(26, 102, 52, 1)";
    }
  }


  handleFilter(value: string) {
    const searchValue = value.toLowerCase();
    this.listEmployee = this.originalListEmployee.filter((s) => {
      const fullName = `${s.LastName} ${s.MiddleName} ${s.FirstName}`.toLowerCase();
      return (
        fullName.includes(searchValue) ||
        (s.StaffID && s.StaffID.toLowerCase().includes(searchValue))
      );
    });
  }



  /**
   * Hàm trả về string quyết định
   * @param code enum type
   * @returns 
   */
  getTypeDecision(code: number): string {
    switch (code) {
      case 1:
        return "Tuyền dụng"
      case 2:
        return "Điều chuyển"
      case 3:
        return "Sa thải"
      case 4:
        return "Nghỉ việc"
      default:
        return "Tuyền dụng"
    }
  }

  /**
   * Hàm check status task log
   * @param status code status
   * @param code enum status muốn check
   * @returns 
   */
  checkStatusTaskLog(item: DTOHRDecisionTask, code: number): boolean {
    let status: number = 0;
    if (item.ListHRDecisionTaskLog.length > 0) {
      status = item.ListHRDecisionTaskLog[0].Status;

      if (status == code) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Hàm trả về code status dựa vào tên status
   * @param statusName tên status được truyền vào
   * @returns 
   */
  // getCodeStatusTaskLog(statusName: string): number {
  //   switch (statusName) {
  //     case "Chưa thực hiện":
  //       return 1;
  //     case "Không thực hiện":
  //       return 2;
  //     case "Đang thực hiện":
  //       return 3;
  //     case "Chờ duyệt":
  //       return 4;
  //     case "Ngưng thực hiện":
  //       return 5;
  //     case "Hoàn tất":
  //       return 6;
  //   }
  // }

  /**
   * Hàm trả về ngày khởi tạo của trạng thái cần tìm
   * @param listStatusTaskLog danh sách trạng thái công việc được truyền vào
   * @param codeStatus code của trạng thái cần tìm
   * @returns 
   */
  getCreateTimeOfStatusLog(listStatusTaskLog: DTOHRDecisionTaskLog[], codeStatus: number): string {
    let createTime = "";
    const itemTaskLog = listStatusTaskLog.find(item => item.Status === codeStatus)

    if (itemTaskLog) {
      createTime = itemTaskLog?.CreatedTime;
    }

    // listStatusTaskLog.find(item => item.Status == codeStatus){
    //   createTime = item.CreatedTime
    // }
    // for (let i = listStatusTaskLog.length; i >= 0; i++) {
    //   if (listStatusTaskLog[i]?.Status === codeStatus) {
    //     createTime = listStatusTaskLog[i]?.CreatedTime;
    //     break;
    //   }
    // }
    return createTime;
  }


  /**
   * Hàm xử lý show hoặc không show các công việc "Không", "Ngưng" thực hiện
   */
  onShowStoppedTask() {
    this.isShowStoppedTask = !this.isShowStoppedTask;
    (document.getElementById('checkStopTask') as HTMLInputElement).checked = this.isShowStoppedTask;
    this.gridState.filter.filters = [];
    this.gridState.filter.filters.push({ field: 'DecisionProfile', operator: 'eq', value: this.decisionProfile.Code });
    this.APIGetListHRDecisionTask();
  }

  /**
   * Hàm kiểm tra show hoặc không show các công việc "Không", "Ngưng" thực hiện
   */
  checkShowStoppedTask() {
    if (!this.isShowStoppedTask) {
      if (this.decisionProfile.Status !== 1) {
        this.gridState.filter.filters.push({
          logic: 'and',
          filters: [
            { field: 'Status', operator: 'neq', value: 2 },
            { field: 'Status', operator: 'neq', value: 5 }
          ]
        });
      }
    } else {
      this.gridState.filter.filters.push({ field: 'Status', operator: 'neq', value: 0 });
    }
  }


  sortListByStatus(inputList: any[], targetStatus: number): any[] {
    return inputList.sort((a, b) => {
      const now = new Date(); // Ngày hiện tại

      if (targetStatus === 7) {
        // So sánh nếu Status = 7
        const aOverdue = a.EndDate && new Date(a.EndDate) <= now; // Quá hạn hoặc bằng
        const bOverdue = b.EndDate && new Date(b.EndDate) <= now; // Quá hạn hoặc bằng

        // Đưa các item quá hạn lên đầu
        if (aOverdue && !bOverdue) {
          return -1;
        }
        if (bOverdue && !aOverdue) {
          return 1;
        }
      }

      // Logic thông thường theo Status
      if (a.Status === targetStatus && b.Status !== targetStatus) {
        return -1;
      }
      if (b.Status === targetStatus && a.Status !== targetStatus) {
        return 1;
      }

      // Giữ nguyên thứ tự nếu không khớp điều kiện
      return 0;
    });
  }

  requestSortData(targetStatus: number): void {
    this.listTask.data = this.sortListByStatus(this.listTask.data, targetStatus);
  }

  /**
   * Hàm xử lý khi click vào action trên list
   * @param codeAction code của action được chọn
   */
  onActionList(codeAction: string, item: DTOHRDecisionTask) {
    let listName: string[] = [];
    this.listSelectItemTask = [];
    this.listSelectItemTask = this.listSelectItemTask as DTOHRDecisionTask[];
    this.listSelectItemTask.push(item);

    if (codeAction == "k-i-preview") {
      this.onClickEditTask.emit({ item: item, status: 'View' })
    }
    // else if (codeAction == "k-i-close-outline") {
    //   listName.push(this.decisionProfile.FullName);
    //   this.APIGetListHR();
    //   this.codeConfirmDialog = 8;
    //   this.listNameSelected = this.formatListName(listName);
    //   this.isConfirmDialogShow = true;
    // }
    else if (codeAction == "k-i-minus-outline") {
      if (this.decisionProfile.Status == 1) {
        if (this.typeList == 2) {
          item = item as DTOHRDecisionTask
          listName.push(item.FullName);
        } else if (this.typeList == 3) {
          listName.push(this.decisionProfile.FullName);
        }
        this.codeConfirmDialog = 8;
      }
      else {
        listName.push(item.TaskName);
        this.codeConfirmDialog = 2;
      }
      this.APIGetListHR();
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogShow = true;
    }
    else if (codeAction == "k-i-redo") {
      listName.push(item.FullName + ' - ' + item.StaffID);
      this.codeConfirmDialog = 5;
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogSent = true;
    }
    else if (codeAction == "k-i-check-circle") {
      if (this.typeList == 2) {
        listName.push(item.FullName + ' - ' + item.StaffID);
      } else if (this.typeList == 3) {
        listName.push(this.decisionProfile.FullName + ' - ' + this.decisionProfile.StaffID);
      }
      this.codeConfirmDialog = 6;
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogSent = true;
    }
    else if (codeAction == "k-i-reset-sm") {
      listName.push(item.TaskName);
      this.codeConfirmDialog = 1;
      this.APIGetListHR();
      this.listNameSelected = this.formatListName(listName);
      this.isConfirmDialogShow = true;
    }

  }

  

  //#endregion
}

