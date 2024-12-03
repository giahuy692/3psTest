import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DTOResponse, Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { distinct } from '@progress/kendo-data-query';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import { minusOutlineIcon } from '@progress/kendo-svg-icons';
import { HrTaskListComponent } from '../hr-task-list/hr-task-list.component';
import { DTOHRPolicyMaster } from '../../dto/DTOHRPolicyMaster.dto';
import { DTOHRPolicyPosition } from '../../dto/DTOHRPolicyPosition.dto';
import { DTOHRPolicyTask } from '../../dto/DTOHRPolicyTask.dto';
import { DTOHRPolicyDepartment } from '../../dto/DTOHRPolicyDepartment.dto';
import { DTOListHR } from '../../dto/DTOPersonalInfo.dto';
import { DTOHRPolicyLocation } from '../../dto/DTOHRPolicyLocation.dto';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { StaffApiService } from '../../services/staff-api.service';
import { DTOHRPolicyTypeStaff } from '../../dto/DTOHRPolicyTypeStaff.dto';
import { RowClassArgs, TreeListComponent } from '@progress/kendo-angular-treelist';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { HrApplicablePositionListComponent } from '../hr-applicable-position-list/hr-applicable-position-list.component';

@Component({
  selector: 'app-hr-policy-detail',
  templateUrl: './hr-policy-detail.component.html',
  styleUrls: ['./hr-policy-detail.component.scss'],
})
export class HrPolicyDetailComponent implements OnInit, OnDestroy {
  @Input({ required: true }) typeData: number;
  destroy$ = new Subject<void>();
  @ViewChild('inputID', { static: false }) inputID!: ElementRef;
  @ViewChild('drawer') childDrawer!: DrawerComponent;
  @ViewChild('gridTaskList') childGridTaskList!: HrTaskListComponent;
  @ViewChild('treeException') childTreeException!: TreeListComponent;
  @ViewChild('nameTask') nameTaskTextBox: TextBoxComponent;
  @ViewChild('listPostitionApply') childListPostitionApply!: HrApplicablePositionListComponent

  //Action 0: Add, 1: Update
  action: number = 0;

  //Data
  dataHrPolicyMaster: DTOHRPolicyMaster;
  dataHRPolicyPosition = new DTOHRPolicyPosition();
  dataHRPolicyTask = new DTOHRPolicyTask(); // Công việc mặc định (gốc)
  dataHRPolicyTaskHandler = new DTOHRPolicyTask(); // Công việc để thao tác (handle)
  tempHRPolicyPosition: DTOHRPolicyPosition;
  arrBtnStatus: any = [];
  listHRPolicyApply: DTOHRPolicyDepartment[];

  justLoaded: boolean = true;
  actionPerm: DTOActionPermission[] = [];
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false;
  isReadonlyFormTask: boolean = false; // Có readonly tất cả các input bên trong drawer chứa task hay không
  isSystemTask: boolean = false;
  initiallyExpanded: boolean = true; // Default treelist is expanded or not
  isExpanded: boolean = true; // Column can expand
  isOpenPopupConfirmDelete: boolean = false; // open popup confirm delete task
  isLoadingTreeException: boolean = false; // Loading của treelist ngoại lệ
  isLeaderMonitor: boolean = false; // Là trưởng đơn vị, quản lý điểm làm việc

  //Drawer
  isOpenDrawer: boolean = false;
  //kiểm tra disable checkbox
  isDisableCheckbox: boolean = true;
  istDisablCheckboxLocation: boolean = false;

  requestDelete: boolean = false;
  requestChangeStatus: boolean = false;
  requestLoadListPosition: boolean = false;
  requestLoadInfoBlock: boolean = false
  requestCreate: boolean = false;
  dataLocation: DTOHRPolicyLocation = new DTOHRPolicyLocation();

  //status drawer
  // status = 0: xem chức danh, status = 1: thêm chức danh, status = 2: chỉnh sửa chức danh
  statusDrawer: number = 0;

  //Temp
  tempPositionID: string = '';

  // CONTEXT
  typeDataPolicyMaster: number = 1; // Loại chính sách. 1: OnBoarding -- 2: OffBoarding
  typeApplyPolicyMaster: number = 1; // Phạm vi áp dụng. 1: Chức danh được chỉ định -- 2: Toàn bộ chức danh
  statusPolicyMaster: number = 1; // Trạng thái của chính sách. 0: Đang soạn thảo -- 1: Gởi duyệt -- 2: Áp dụng -- 3: Ngừng -- 4: Trả về
  typeTaskAssignee: number = 0; // Loại đảm nhận công việc. 1: Hệ thống -- 2: Chức danh -- 3: Nhân sự áp dụng
  globalCounter: number = 0 // Số dùng để generate 

  //DIALOG
  isDialogShow: boolean = false;
  isDialogConfirmClose: boolean = false; // Dialog hiển thị có chắc chắn đóng hay không
  currentListPosition: { PositionName: string; Code: number }[] = []; // Danh sách chức danh
  currentListApprovedPosition: { PositionName: string; Code: number }[] = []; // Danh sách chức danh duyệt bởi
  selectedPosition: { PositionName: string; Code: number } = {
    PositionName: '',
    Code: null,
  }; // Chức danh
  selectedApproved: { PositionName: string; Code: number } = {
    PositionName: '',
    Code: null,
  }; // Duyệt bởi
  selectedListStaffType: { ListName: string; Code: number }[] = []; // Danh sách nhân sự áp dụng
  listHR: DTOListHR[] = []; // Danh sách loại nhân sự áp dụng
  listHRFiltered: DTOListHR[] = []; // Danh sách loại nhân sự áp dụng
  selectedPolicyTaskLimit:
    | DTOHRPolicyPosition
    | DTOHRPolicyLocation
    | DTOHRPolicyTypeStaff; // Selected policy task limit to delete
  seletedTaskToDelete: DTOHRPolicyTask; // task will be deleted
  isAfterEdit: boolean = false; // Biến biết được hành động sau đó là cập nhật chứ không phải đóng
  isOpenDialogAddException: boolean = false; // Mở dialog thêm ngoại lệ
  isDisableBlock: boolean = false;
  listPositionNameTypeAssignee3: { PositionName: string; Code: number }[] = [];
  listExceptionLocal:
    | DTOHRPolicyLocation[]
    | DTOHRPolicyPosition[]
    | DTOHRPolicyTypeStaff[] = [];

  //WAIT
  //Tránh spam
  waitting: boolean = false;

  //Xử lí khi check vào input location
  listOriginalLocation: DTOHRPolicyLocation[] = [];

  icons = { minusOutline: minusOutlineIcon };

  positionStatusString: string = ''

  constructor(
    private layoutService: LayoutService,
    private hriTransitionService: HriTransitionApiService,
    public menuService: PS_HelperMenuService,
    private apiServiceStaff: StaffApiService
  ) { }

  //#region Hooks
  ngOnInit(): void {
    this.handleGetCache();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        if (this.dataHrPolicyMaster?.Code != 0) {
          this.APIGetHRPolicy(this.dataHrPolicyMaster);
        }
        this.dataHrPolicyMaster.TypeData = this.typeData;



        // Lấy danh sách thực hiện bởi
        this.APIGetListHRPolicyPosition();

        // Lấy danh sách nhân sự áp dụng
        this.APIGetListHR();

        // Lấy ngữ cảnh hiện tại của component
        this.handleGetCurrentContext();

        // this.listPostitionApply.APIGetListHRPolicyApply(this.dataHrPolicyMaster)

      

        // Thêm nhân sự áp dụng
        this.listPositionNameTypeAssignee3 = [];
        this.listPositionNameTypeAssignee3.push({
          PositionName: 'Nhân sự áp dụng',
          Code: -1,
        });

        this.tempHRPolicyPosition = this.dataHRPolicyPosition;
      }
    })
    this.menuService
      .changePermission()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: DTOPermission) => {
        if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
          this.justLoaded = false;
          this.actionPerm = distinct(res.ActionPermission, 'ActionType');
          this.isMaster =
            this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          this.isCreator =
            this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          this.isApprover =
            this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
          //Chỉ được xem
          this.isAllowedToViewOnly =
            this.actionPerm.findIndex((s) => s.ActionType == 6) > -1 &&
            !Ps_UtilObjectService.hasListValue(
              this.actionPerm.filter((s) => s.ActionType != 6)
            );
        }
      });
  }
  //#endregion

  /**
   * Hàm kiểm tra có phải quyền xem hay không
   * @returns
   */
  isViewer(): boolean {
    if (!this.isMaster && !this.isApprover && !this.isCreator) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Cập hật value khi khởi đậu
   */
  handleSetValueTemp(): void {
    this.tempPositionID = this.dataHrPolicyMaster.PolicyID;
  }

  /**
   * Hàm load lại data
   */
  handleloadData(e: any): void {
    if (this.dataHrPolicyMaster.Code != 0) {
      this.APIGetHRPolicy(this.dataHrPolicyMaster);
      this.childListPostitionApply.APIGetListHRPolicyApply(this.dataHrPolicyMaster)
      this.requestLoadInfoBlock = !this.requestLoadInfoBlock
    }
  }

  //#region API
  /**
   * API lấy danh sách chức danh
   */
  APIGetListHRPolicyPosition() {
    this.hriTransitionService
      .GetListHRPolicyPosition()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.currentListPosition = [
            ...this.listPositionNameTypeAssignee3,
            ...res.ObjectReturn,
          ];

          this.currentListApprovedPosition = res.ObjectReturn;
        }
      }, (error) => {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi lấy danh sách chức danh: ${error}`
        );
      });
  }

  /**
   * API lấy danh sách chức danh áp dụng
   */
  APIGetListHR() {
    this.apiServiceStaff
      .GetListHR(5)
      .pipe(takeUntil(this.destroy$))
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
   * API Lấy công việc cụ thể
   * @param dto Task cần lấy chi tiết
   */
  APIGetHRPolicyTask(dto: DTOHRPolicyTask) {
    this.hriTransitionService
      .GetHRPolicyTask(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          // this.dataHRPolicyTask = res.ObjectReturn;
          this.dataHRPolicyTaskHandler = res.ObjectReturn;
          if (Ps_UtilObjectService.hasValue(this.dataHRPolicyTaskHandler.IsLeaderMonitor)) {
            this.isLeaderMonitor = this.dataHRPolicyTaskHandler.IsLeaderMonitor;
          }
          else {
            this.isLeaderMonitor = false;
          }
        }
      });
  }

  /**
   * API cập nhật công việc
   * @param DTO POLICY Task
   * @param propertiess trường muốn cập nhật
   */
  APIUpdateHRPolicyTask(DTO: DTOHRPolicyTask, propertiess?: string[], option?: 'Thêm mới' | 'Cập nhật') {
    const text = 'công việc';
    this.hriTransitionService.UpdateHRPolicyTask(DTO, propertiess).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (
        Ps_UtilObjectService.hasValue(res) &&
        Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
        res.StatusCode == 0
      ) {
        this.childGridTaskList.APIGetListHRPolicyTask();
        // let listTemp = this.childGridTaskList.listPolicyTask.data;
        // this.childGridTaskList.listPolicyTask.data = [];
        // this.childGridTaskList.listPolicyTask.total = listTemp?.length;
        // listTemp.forEach(item => {
        //   this.childGridTaskList.listPolicyTask.data.push(item);
        // })
        this.layoutService.onSuccess(`${option} ${text} thành công`);
        this.handleCloseDrawer();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${option} ${text}: ${res.ErrorString}`);
        this.dataHRPolicyTask.ListException = this.dataHRPolicyTaskHandler.ListException;
      }
      this.isAfterEdit = false;
    },
      (error) => {
        this.isAfterEdit = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${option} ${text}: ${error}`);
        this.dataHRPolicyTask.ListException = this.dataHRPolicyTaskHandler.ListException;
      }
    );
  }

  /**
   * This function is called when update a object DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff
   * @param dto object policy limit want to update status
   */
  APIUpdateHRPolicyLimitStatus(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff) {
    const apiText = 'Ngưng áp dụng ngoại lệ';
    dto.Status = 3;
    dto.StatusName = 'Ngưng áp dụng';
    this.hriTransitionService.UpdateHRPolicyLimitStatus(dto).pipe(takeUntil(this.destroy$)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công');
        this.APIGetListHRTaskException(this.dataHRPolicyTaskHandler);
        this.childGridTaskList.onFilterData();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
      }
    );
  }

  /**
   * The event is called when delete policy task
   * @param listDTO List of task need to delete
   */
  APIDeleteHRPolicyTask(listDTO: DTOHRPolicyTask[]) {
    const apiText = 'Xoá công việc';
    this.hriTransitionService
      .DeleteHRPolicyTask(listDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: DTOResponse) => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.dataHrPolicyMaster.NumOfTask -= listDTO.length;
            this.layoutService.onSuccess(apiText + ' thành công');
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`
            );
          }
          this.isAfterEdit = true;
          this.handleCloseDrawer();
          this.handleClosePopupConfirmDeleteTask();
          this.childGridTaskList.onFilterData();
        },
        (err) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
          this.handleClosePopupConfirmDeleteTask();
        }
      );
  }

  /**
   * The event is called when delete policy limit task
   * @param dto Policy limit want to delete
   */
  APIDeleteHRPolicyLimit(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff) {
    let text = '';
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
      text = 'Xóa';
    }
    this.hriTransitionService.DeleteHRPolicyLimit(dto).pipe(takeUntil(this.destroy$)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(text + ' thành công');
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${text}: ${res.ErrorString}`);
      }
      this.handleClosePopupConfirmDeleteTask();
      this.childGridTaskList.onFilterData();
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${text}: ${err}`);
        this.handleClosePopupConfirmDeleteTask();
      }
    );
  }

  /**
   * This function provide exception policy of task service after call API GetListHRTaskException
   * @param task task need to get list exception
   */
  APIGetListHRTaskException(task: DTOHRPolicyTask) {
    this.isLoadingTreeException = true;
    if (task.HasException) {
      this.hriTransitionService.GetListHRTaskException(task).pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          // Deep copy để tránh việc tham chiếu đến cùng một object
          res.ObjectReturn?.forEach(item => item.Level = 1);

          this.dataHRPolicyTask.ListException = JSON.parse(JSON.stringify(res.ObjectReturn));
          this.dataHRPolicyTaskHandler.ListException = JSON.parse(JSON.stringify(res.ObjectReturn));
          this.listExceptionLocal = JSON.parse(JSON.stringify(res.ObjectReturn));

          this.handleAddTempIdToObjects(this.listExceptionLocal);

          this.isLoadingTreeException = false;
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ngoại lệ công việc: " ${res.ErrorString}`);
          this.isLoadingTreeException = false;
        }
      },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ngoại lệ công việc: " ${error}`);
          this.isLoadingTreeException = false;
        }
      );
    }
    else {
      this.isLoadingTreeException = false;
    }
  }

  /**
   * Lấy cache chính sách
   */
  handleGetCache() {
    const result = localStorage.getItem('HrPolicyMaster');
    if (Ps_UtilObjectService.hasValue(result)) {
      this.dataHrPolicyMaster = JSON.parse(result);
      if (this.dataHrPolicyMaster.Code == 0) {
        this.action = 0;
      }
      else {
        this.action = 1;
      }
    }
  }

  /**
   * API lấy thông tin chính sách
   * @param req DTO chính sách
   */
  APIGetHRPolicy(req: DTOHRPolicyMaster) {

    this.hriTransitionService
      .GetHRPolicy(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.requestLoadInfoBlock = false
            this.dataHrPolicyMaster = res.ObjectReturn;
            localStorage.setItem(
              'HrPolicyMaster',
              JSON.stringify(this.dataHrPolicyMaster)
            );
            this.handleGetCurrentContext();
          } else {
            this.requestLoadInfoBlock = false
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy Thông tin chính sách: ${res.ErrorString}`
            );
          }

          this.setupBtnStatus();
        },
        (err) => {
          this.requestLoadInfoBlock = false
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy Thông tin chính sách: ${err}`
          );
        }
      );
  }

  /**
   * API cập nhật trạng thái chính sách
   * @param listDTO  chính sách muốn cập nhật
   * @param reqStatus status muốn cập nhật
   */
  APIUpdateHRPolicyStatus(listDTO: DTOHRPolicyMaster[], reqStatus: number) {
    const apiText = 'Cập nhật trạng thái chính sách';
    this.hriTransitionService
      .UpdateHRPolicyStatus(listDTO, reqStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: DTOResponse) => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            // this.APIGetHRPolicy(this.dataHrPolicyMaster)
            this.layoutService.onSuccess(apiText + ' thành công');
            this.layoutService
              .getSelectionPopupComponent()
              .closeSelectedRowitemDialog();
            localStorage.setItem(
              'HrPolicyMaster',
              JSON.stringify(this.dataHrPolicyMaster)
            );
            this.handleloadData(this.dataHrPolicyMaster);
            this.statusPolicyMaster = this.dataHrPolicyMaster.Status;
            this.childGridTaskList.onFilterData();
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`
            );
          }
        },
        (err) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
        }
      );
  }

  /**
   * API lấy chức danh áp dụng
   * @param req
   */
  APIGetHRPolicyPosition(req: DTOHRPolicyPosition) {
    req.Policy = this.dataHrPolicyMaster.Code;
    this.hriTransitionService
      .GetHRPolicyPosition(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.dataHRPolicyPosition = res.ObjectReturn;
            this.tempPositionID = this.dataHRPolicyPosition.PositionID;
          } else {
            this.dataHRPolicyPosition = new DTOHRPolicyPosition();
            this.tempPositionID = '';
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy Thông tin chính sách: ${res.ErrorString}`
            );
          }

          this.setupBtnStatus();
        },
        (err) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy Thông tin chính sách: ${err}`
          );
        }
      );
  }

  /**
   * API lấy chức danh áp dụng
   * @param req
   */
  APIGetHRPolicyApply(req: DTOHRPolicyPosition) {
    this.hriTransitionService
      .GetHRPolicyApply(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.dataHRPolicyPosition = res.ObjectReturn[0];
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy thông tin chức danh áp dụng: ${res.ErrorString}`
            );
          }

          this.listOriginalLocation = JSON.parse(
            JSON.stringify(this.dataHRPolicyPosition.ListLocation)
          );
          this.setupBtnStatus();
        },
        (err) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy thông tin chức danh áp dụng: ${err}`
          );
        }
      );
  }

  /**
   * Hàm thực hiện update một chức danh trong chính sách
   * @param req thông tin chính sách
   */
  APIUpdateHRPolicyLimit(req: DTOHRPolicyPosition) {
    this.waitting = true;
    const apiText = this.positionStatusString;
    req.Policy = this.dataHrPolicyMaster.Code;
    req.TypeData = 4;
    this.hriTransitionService
      .UpdateHRPolicyLimit(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: DTOResponse) => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(apiText + ' thành công');
            this.layoutService
              .getSelectionPopupComponent()
              .closeSelectedRowitemDialog();
            this.handleCloseDrawer();
            // Gọi lại một lần nữa để lấy data mới nhất xử lí
            // this.APIGetHRPolicy(this.dataHrPolicyMaster)
            this.handleLoadListPosition();
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`
            );
          }
          this.waitting = false;
        },
        (err) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
        }
      );

    this.positionStatusString = ""
  }

  /**
   * API xoá chính sách
   * @param listDTO danh sách chính sách cần xoá
   * @returns
   */
  APIDeleteHRPolicy(listDTO: DTOHRPolicyMaster[]) {
    const apiText = 'Xoá chính sách';
    this.hriTransitionService
      .DeleteHRPolicy(listDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: DTOResponse) => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(apiText + ' thành công');
            this.layoutService
              .getSelectionPopupComponent()
              .closeSelectedRowitemDialog();
            this.dataHrPolicyMaster = new DTOHRPolicyMaster();
            localStorage.setItem(
              'HrPolicyMaster',
              JSON.stringify(this.dataHrPolicyMaster)
            );
            this.setupBtnStatus();
            this.handleCloseDialog();
            this.listHRPolicyApply = [];
            // this. = false
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`
            );
          }
        },
        (err) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
        }
      );
  }
  //#endregion

  //#region Drawer
  handleChangeStatusApprovedBy() {
    this.isLeaderMonitor = !this.isLeaderMonitor;
    this.selectedApproved = {
      PositionName: '',
      Code: null,
    }
  }

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
   * Hàm dùng để lấy số lượng công việc sau khi change data danh sách công việc
   * @param value 
   */
  handleGetNumOfTaskAfterChangeData(value: any) {
    this.dataHrPolicyMaster.NumOfTask = value.length;
  }

  handleAddNewPosition(): void {
    if (this.waitting) {
      return;
    }
    // Nếu là của công việc
    if (this.handleGetTypeOfDrawer(this.statusDrawer)?.Type === 1) {
      {
        this.handleOptionChangeDataPolicyTask(this.dataHRPolicyTaskHandler, 'Thêm mới');
        return;
      }
    }
    // Nếu là của chức danh áp dụng
    let breakPoint: Boolean = false;
    if (this.listHRPolicyApply) {
      this.listHRPolicyApply?.forEach((element) => {
        element.ListPosition.forEach((child) => {
          if (child.Position == this.dataHRPolicyPosition.Position) {
            breakPoint = true;
          }
        });
      });
    }

    if (this.requestCreate) {
      // Trường hợp isCreate là true, thêm trực tiếp mà không cần kiểm tra listHRPolicyApply
      this.positionStatusString = "Thêm mới chức danh"
      this.APIUpdateHRPolicyLimit(this.dataHRPolicyPosition);

    } else {
      // Trường hợp isCreate là false, cần kiểm tra listHRPolicyApply trước khi thêm
      let breakPoint: boolean = false;
      if (this.dataHRPolicyPosition.Position) {
        if (this.listHRPolicyApply?.length > 0) {
          this.listHRPolicyApply.forEach((element) => {
            element.ListPosition.forEach((child) => {
              if (child.Position === this.dataHRPolicyPosition.Position) {
                breakPoint = true;
              }
            });
          });

          if (breakPoint) {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi Thêm chức danh: Chức danh đã có trong chính sách`
            );
          } else {
            this.positionStatusString = "Thêm mới chức danh"
            this.APIUpdateHRPolicyLimit(this.dataHRPolicyPosition);
          }
        } else {
          this.positionStatusString = "Thêm mới chức danh"
          this.APIUpdateHRPolicyLimit(this.dataHRPolicyPosition);
        }
      } else {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi Thêm chức danh: Không tìm thấy chức danh`
        );
      }
    }
  }

  /**
   * Cập nhật chức danh
   */
  handleUpdatePosition(): void {
    // Nếu là chỉnh sửa công việc
    if (this.statusDrawer == 13) {
      this.isAfterEdit = true;
      this.handleOptionChangeDataPolicyTask(this.dataHRPolicyTaskHandler, 'Cập nhật');
      return;
    }
    if (
      this.handleCheckArraysAreEqualByIsChecked(
        this.dataHRPolicyPosition.ListLocation,
        this.listOriginalLocation
      )
    ) {
      // this.layoutService.onWarning(
      //   'Vui lòng thay đổi thông tin trước khi cập nhật'
      // );
      this.handleCloseDrawer()
      return;
    }

    // Nếu là cập nhật chức danh
    let checkPoint = 0;
    this.dataHRPolicyPosition.ListLocation.forEach((element) => {
      if (element.IsChecked == true) {
        checkPoint += 1;
        element.TypeData = 5;
      }
    });

    // if (this.tempHRPolicyPosition.ListLocation.length == checkPoint) {
    //   this.layoutService.onWarning('Vui lòng thay đổi thông tin trước khi cập nhật')
    //   return
    // }
    this.positionStatusString = "Cập nhật chức danh"
    this.APIUpdateHRPolicyLimit(this.dataHRPolicyPosition);

  }

  handleCheckArraysAreEqualByIsChecked(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].IsChecked !== arr2[i].IsChecked) return false;
    }

    return true;
  }

  /**
   * Hàm thực hiện xóa chức danh trên drawer
   */
  handleDeletePosition(): void {
    if (this.statusDrawer == 13) {
      this.seletedTaskToDelete = this.dataHRPolicyTaskHandler;
      this.isOpenPopupConfirmDelete = true;
      return;
    }
    this.requestDelete = !this.requestDelete;
  }

  /**
   * Hàm thực hiện gửi tín hiệu xuống component để đổi trạng thái location
   */
  handleChangeStatusLocation(locaton: DTOHRPolicyLocation): any {
    this.requestChangeStatus = !this.requestChangeStatus;
    this.dataLocation = locaton;
  }

  /**
   * Hàm thay đổi giá trị của status
   * @param status status muốn thay đổi
   */
  handleUpdateStatusPolicy(status: number) {
    if (status == 1 || status == 2) {
      if (
        !Ps_UtilObjectService.hasValueString(this.dataHrPolicyMaster.PolicyName)
      ) {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi cập nhật trạng thái chính sách: Chính sách chưa có tiêu đề`
        );
        return;
      }
      if (
        !Ps_UtilObjectService.hasListValue(this.listHRPolicyApply) &&
        this.dataHrPolicyMaster.TypeApply == 1
      ) {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi cập nhật trạng thái chính sách: Chính sách chưa có chức danh đối với phạm vi chức danh được chỉ định`
        );
        return;
      }

      if (
        !Ps_UtilObjectService.hasValue(this.dataHrPolicyMaster.NumOfTask) ||
        this.dataHrPolicyMaster.NumOfTask == 0
      ) {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi cập nhật trạng thái chính sách: Chính sách chưa có công việc`
        );
        return;
      }
    }
    this.APIUpdateHRPolicyStatus([this.dataHrPolicyMaster], status);
  }

  /**
   * Thực hiện setup các button hiển th
   */
  setupBtnStatus() {
    this.arrBtnStatus = [];
    if (this.dataHrPolicyMaster.Code != 0) {
      if (
        (this.dataHrPolicyMaster.Status == 0 ||
          this.dataHrPolicyMaster.Status == 4) &&
        (this.isMaster || this.isCreator)
      ) {
        this.arrBtnStatus.push({
          text: 'GỬI DUYỆT',
          class: 'k-button btn-hachi hachi-primary',
          code: 'redo',
          link: 1,
        });
      }

      if (
        (this.dataHrPolicyMaster.Status == 1 ||
          (this.dataHrPolicyMaster.Status == 3 &&
            this.handleCheckReturnPolicy(this.dataHrPolicyMaster))) &&
        (this.isMaster || this.isApprover)
      ) {
        this.arrBtnStatus.push({
          text: 'TRẢ VỀ',
          class: 'k-button btn-hachi hachi-warning hachi-secondary',
          code: 'undo',
          link: 4,
        });
      }
      if (
        (this.dataHrPolicyMaster.Status == 1 ||
          (this.dataHrPolicyMaster.Status == 3 &&
            this.handleCheckReturnPolicy(this.dataHrPolicyMaster))) &&
        (this.isMaster || this.isApprover)
      ) {
        // this.arrBtnStatus.push({
        //   text: 'TRẢ VỀ',
        //   class: 'k-button btn-hachi hachi-warning hachi-secondary',
        //   code: 'undo',
        //   link: 4,
        // });

        this.arrBtnStatus.push({
          text: 'PHÊ DUYỆT',
          class: 'k-button btn-hachi hachi-primary',
          code: 'check-outline',
          link: 2,
        });
      }

      if (
        this.dataHrPolicyMaster.Status == 2 &&
        (this.isMaster || this.isApprover)
      ) {
        this.arrBtnStatus.push({
          text: 'NGƯNG ÁP DỤNG',
          class: 'k-button btn-hachi hachi-warning',
          code: 'minus-outline',
          link: 3,
        });
      }
    }
  }

  handleLoadBreadCrumb() {
    this.handleloadData(true);
    if (this.dataHrPolicyMaster.Code !== 0) {
      this.childGridTaskList.APIGetListHRPolicyTask();
      this.requestLoadInfoBlock = true
    }
  }

  /**
   * Hàm dùng để kiểm tra grid công việc có đang được chọn nhiều item hay không
   * @param value
   */
  onCheckSelectingGrid(value: any) {
    this.isDisableBlock = value;
  }

  /**
   * Hàm dùng để đóng dialog exception
   */
  handleCloseDialogException() {
    this.isOpenDialogAddException = false;
    this.dataHRPolicyTaskHandler.ListException = JSON.parse(JSON.stringify(this.listExceptionLocal));
  }

  /**
   * hàm dùng để thêm vào từng phần tử 1 property tạm thời hỗ trợ cho chức năng xóa ngoại lệ
   * @param data 
   */
  handleAddTempIdToObjects = (data: DTOHRPolicyTypeStaff[] | DTOHRPolicyLocation[] | DTOHRPolicyPosition[]): void => {
    data.forEach((obj) => {
      (obj as any).tempId = `temp_${this.globalCounter++}`; // Gán tempId duy nhất cho mỗi đối tượng
      if (obj.ListException) {
        this.handleAddTempIdToObjects(obj.ListException); // Gọi đệ quy để thêm tempId vào ListException
      }
    });
  };

  /**
   * Hàm dùng để xóa các tempId ra khỏi object
   * @param objects 
   */
  handleRemoveTempIdFromObjects(objects: any[]): void {
    if (!Ps_UtilObjectService.hasListValue(objects)) { return; }
    objects.forEach((obj) => {
      // Xóa thuộc tính tempId nếu tồn tại
      delete obj.tempId;

      // Nếu object có ListException, thực hiện đệ quy để xóa tempId trong các object con
      if (obj.ListException && obj.ListException.length > 0) {
        this.handleRemoveTempIdFromObjects(obj.ListException);
      }
    });
  }

  /**
   * Hàm dùng để xóa 1 object bất kỳ bằng tempId
   * @param list Danh sách cần duyệt qua
   * @param tempIdToRemove tempId của object cần xóa
   * @returns list mới sau khi xóa
   */
  handleRemoveObjectByTempId(list: any[], tempIdToRemove: string): any[] {
    for (let i = 0; i < list.length; i++) {
      if (list[i].tempId === tempIdToRemove) {
        list.splice(i, 1);
        return list;
      } else if (list[i].ListException && list[i].ListException.length > 0) {
        list[i].ListException = this.handleRemoveObjectByTempId(list[i].ListException, tempIdToRemove);
      }
    }
    return list;
  }

  /**
   * Hàm dùng để lấy data mới nhất và fetch lên lại list
   */
  onReFetchTreeList() {
    const list: any[] = this.listExceptionLocal;
    this.listExceptionLocal = [];

    list.forEach(item => {
      this.listExceptionLocal.push(item);
    })
  }

  /**
   * Hàm dùng để gán lại giá trị cho listException từ null sang []
   * @param list List cần duyệt qua
   */
  handleNormalizeListException(list: any[]): void {
    list.forEach(item => {
      // Nếu ListException là null, gán lại thành []
      if (item.ListException === null) {
        item.ListException = [];
      }

      // Nếu ListException có giá trị, kiểm tra các object bên trong
      if (Array.isArray(item.ListException) && item.ListException.length > 0) {
        this.handleNormalizeListException(item.ListException);
      }
    });
  }

  /**
   * Hàm dùng để lấy danh sách ngoại lệ sau khi thêm từ dialog thêm ngoại lệ
   * @param list 
   */
  handleGetDataListException(list: any[]) {
    this.listExceptionLocal = [];
    list.forEach(item => {
      delete item.Level;
      item.Level = 1;
    })

    list.forEach(item => this.listExceptionLocal.push(item));
    this.handleAddTempIdToObjects(this.listExceptionLocal);
    this.dataHRPolicyTaskHandler.ListException = this.listExceptionLocal;

    this.isOpenDialogAddException = false;
  }

  /**
   * Hàm dùng để lấy loại của drawer là chính sách hay công việc
   * @param statusDrawer trạng thái được truyền vào là số được quy định sẵn
   * @returns
   */
  handleGetTypeOfDrawer(statusDrawer: number) {
    // Thuộc về chức danh
    const listStatusPolicyButton: number[] = [1, 2, 3, 4];
    if (listStatusPolicyButton.includes(statusDrawer)) {
      return { Type: 0, Name: 'Thông tin chức danh' };
    }

    // Thuộc về công việc. 12: Thêm mới -- 13: Chỉnh sửa -- 14: Xem chi tiết
    const listStatusPolicyTaskButton: number[] = [12, 13, 14];
    if (listStatusPolicyTaskButton.includes(statusDrawer)) {
      return { Type: 1, Name: 'Thông tin công việc' };
    }
  }

  /**
   * Hàm dùng để search dropdown multiselect loại nhân sự áp dụng
   * @param searchTerm dữ liệu search
   */
  onFilterListHR(searchTerm: string): void {
    const contains =
      (value: string) => (item: { ListName: string; Code: number }) =>
        item.ListName.toLowerCase().includes(value.toLowerCase());

    this.listHRFiltered = this.listHR.filter(contains(searchTerm));
  }

  /**
   * Hàm dùng để thêm mới hoặc cập nhật công việc
   * @param task công việc
   * @param option Thêm mới | Cập nhật
   */
  handleOptionChangeDataPolicyTask(task: DTOHRPolicyTask, option: 'Thêm mới' | 'Cập nhật') {
    // Thêm DLLPackage
    const SubMenu = localStorage.getItem('SubMenu');
    if (task.DLLPackage !== SubMenu) {
      const ModuleAPI = JSON.parse(localStorage.getItem('ModuleAPI'));
      const listModule: any[] = ModuleAPI?.['ListGroup'];
      listModule?.forEach((item) => {
        if (item.ModuleID == 'hriPolicy') {
          const listItem = item?.['ListFunctions'];
          listItem.some((item2) => {
            if (item2?.DLLPackage == SubMenu) {
              task.DLLPackage = item2?.['DLLPackage'];
            }
            return;
          });
        }
      });
    }

    // Kiểm tra các required input
    if (!Ps_UtilObjectService.hasValueString(task.TaskName)) {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${this.isAfterEdit ? 'cập nhật' : 'tạo mới'} công việc: Nhập thiếu tên công việc`);
      this.isAfterEdit = false;
      return;
    }
    if (!Ps_UtilObjectService.hasValueString(task.TypeAssignee)) {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${this.isAfterEdit ? 'cập nhật' : 'tạo mới'} công việc: Nhập thiếu thực hiện bởi`);
      this.isAfterEdit = false;
      return;
    }
    if (!Ps_UtilObjectService.hasListValue(task.DateDuration)) {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${this.isAfterEdit ? 'cập nhật' : 'tạo mới'} công việc: Nhập thiếu thời gian hoàn tất`);
      this.isAfterEdit = false;
      return;
    }

    if (!Ps_UtilObjectService.hasListValue(task.ListStaffType) && this.dataHrPolicyMaster.TypeApply == 1) {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${this.isAfterEdit ? 'cập nhật' : 'tạo mới'} công việc: Chọn ít nhất 1 loại nhân sự`);
      this.isAfterEdit = false;
      return;
    }
    if (this.typeDataPolicyMaster == 2 && !Ps_UtilObjectService.hasValueString(task.PositionApproved) && !this.isLeaderMonitor) {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${this.isAfterEdit ? 'cập nhật' : 'tạo mới'} công việc: Nhập thiếu Duyệt bởi`);
      this.isAfterEdit = false;
      return;
    }

    // Chuyển thời gian hoàn tất, thứ tự thực hiện sang number
    if (Ps_UtilObjectService.hasValueString(task.DateDuration)) {
      task.DateDuration = Number(task.DateDuration);
    }
    if (Ps_UtilObjectService.hasValueString(task.OrderBy)) {
      task.OrderBy = Number(task.OrderBy);
    }

    // Code chính sách của công việc
    this.dataHRPolicyTaskHandler.Policy = this.dataHrPolicyMaster.Code;

    // Là trưởng đơn vị, Q.lý điểm làm việc
    this.dataHRPolicyTaskHandler.IsLeaderMonitor = this.isLeaderMonitor;

    // Khởi tạo properties
    const properties: string[] = ['Policy'];

    if (this.dataHRPolicyTask.DLLPackage !== this.dataHRPolicyTaskHandler.DLLPackage) {
      this.onPushProperty(properties, task, 'DLLPackage');
    }

    if (option == 'Cập nhật') {
      this.dataHRPolicyTaskHandler.Code = task.Code;
    }

    this.dataHRPolicyTask.DLLPackage = this.dataHRPolicyTaskHandler.DLLPackage;

    if (!Ps_UtilObjectService.hasListValue(this.dataHRPolicyTaskHandler.ListException)) {
      this.dataHRPolicyTaskHandler.ListException = null;
    }
    if (!Ps_UtilObjectService.hasListValue(this.dataHRPolicyTask.ListException)) {
      this.dataHRPolicyTask.ListException = null;
    }

    // Sau khi chọn item trong dropdown Thực hiện bởi
    if (this.dataHRPolicyTaskHandler.TypeAssignee == 2 && this.dataHRPolicyTaskHandler.AssigneeBy !== this.dataHRPolicyTask.AssigneeBy) {
      this.dataHRPolicyTaskHandler.PositionAssignee = this.selectedPosition?.Code;
      this.dataHRPolicyTaskHandler.AssigneeBy = this.selectedPosition?.PositionName;
      this.onPushProperty(properties, task, 'AssigneeBy');
      this.onPushProperty(properties, task, 'PositionAssignee');
    }

    if (this.dataHRPolicyTaskHandler.TypeAssignee == 3 && this.dataHRPolicyTaskHandler.TypeAssignee !== this.dataHRPolicyTask.TypeAssignee) {
      this.dataHRPolicyTaskHandler.PositionAssignee = null;
      this.dataHRPolicyTaskHandler.SystemAssignee = null;
      properties.push('TypeAssignee');
      properties.push('SystemAssignee');
      properties.push('PositionAssignee');
    }

    // Push vào properties nếu như có thấy sự thay đổi
    if (this.dataHRPolicyTaskHandler.TaskName !== this.dataHRPolicyTask.TaskName) {
      this.onPushProperty(properties, task, 'TaskName');
    }
    if (this.dataHRPolicyTaskHandler.Description !== this.dataHRPolicyTask.Description) {
      this.onPushProperty(properties, task, 'Description');
    }
    if (this.dataHRPolicyTaskHandler.DateDuration !== this.dataHRPolicyTask.DateDuration) {
      this.onPushProperty(properties, task, 'DateDuration');
    }
    if (this.dataHRPolicyTaskHandler.OrderBy !== this.dataHRPolicyTask.OrderBy || option === 'Thêm mới') {
      this.onPushProperty(properties, task, 'OrderBy');
    }
    if (this.dataHRPolicyTaskHandler.PositionApproved !== this.dataHRPolicyTask.PositionApproved) {
      this.onPushProperty(properties, task, 'PositionApproved');
    }

    if (option == 'Thêm mới') {
      this.onPushProperty(properties, task, 'DateDuration');
    }

    // Riêng đối với
    if (Ps_UtilObjectService.hasListValue(task.ListStaffType) && this.dataHRPolicyTaskHandler.ListStaffType !== this.dataHRPolicyTask.ListStaffType && this.dataHrPolicyMaster.TypeApply == 1) {
      properties.push('ListStaffType');
    }

    // Xóa trường tempId ra khỏi object trước khi cập nhật
    this.handleRemoveTempIdFromObjects(this.listExceptionLocal);

    // Kiểm tra listException rỗng
    if (!Ps_UtilObjectService.hasListValue(this.listExceptionLocal)) {
      this.listExceptionLocal = [];
    }
    if (!Ps_UtilObjectService.hasListValue(this.dataHRPolicyTaskHandler.ListException)) {
      this.dataHRPolicyTaskHandler.ListException = [];
    }
    if (!Ps_UtilObjectService.hasListValue(this.dataHRPolicyTask.ListException)) {
      this.dataHRPolicyTask.ListException = [];
    }

    if (this.dataHRPolicyTask.IsLeaderMonitor == null && !this.dataHRPolicyTaskHandler.IsLeaderMonitor) {
      this.dataHRPolicyTask.IsLeaderMonitor = false;
    }

    if (JSON.stringify(this.listExceptionLocal) !== JSON.stringify(this.dataHRPolicyTask.ListException)) {
      this.handleRemoveTempIdFromObjects(this.listExceptionLocal);
      task.ListException = this.listExceptionLocal;
      properties.push('ListException');
    }

    if (this.dataHRPolicyTask.IsLeaderMonitor !== this.dataHRPolicyTaskHandler.IsLeaderMonitor) {
      properties.push('IsLeaderMonitor');
      
      if(this.dataHRPolicyTaskHandler.IsLeaderMonitor){
        this.dataHRPolicyTaskHandler.PositionApproved = null;
        properties.push('PositionApproved');
      }
    }

    this.handleNormalizeListException(task.ListException);
    this.handleNormalizeListException(this.listExceptionLocal);
    this.handleNormalizeListException(this.dataHRPolicyTask.ListException);
    this.handleNormalizeListException(this.dataHRPolicyTaskHandler.ListException);

    task = this.dataHRPolicyTaskHandler;

    task.ListException = this.listExceptionLocal;

    // Kiểm tra có sự thay đổi hay không
    if (JSON.stringify(this.dataHRPolicyTask) === JSON.stringify(this.dataHRPolicyTaskHandler) && this.isAfterEdit && JSON.stringify(this.dataHRPolicyTask.ListException) === JSON.stringify(this.listExceptionLocal)) {
      this.handleCloseDrawer();
      return;
    }

    // Thực hiện update
    this.APIUpdateHRPolicyTask(task, properties, option);
  }

  /**
   * Hàm dùng để truyền property vào obj DTOHRPolicyTask để cập nhật
   * @param listPros list cần truyền
   * @param object Object chứa property
   * @param property
   */
  onPushProperty(listPros: string[], object: DTOHRPolicyTask, property: string) {
    if (
      Ps_UtilObjectService.hasValueString(object[property]) ||
      Ps_UtilObjectService.hasValue(object[property])
    ) {
      listPros.push(property);
    }
  }

  /**
   * Hàm dùng để lấy dữ liệu từ các input công việc
   * @param value giá trị nhận được sau khi value change
   * @param field trường dùng để gán giá trị vào
   */
  handleGetValueTaskFromInput(value: any, field: string) {
    switch (field) {
      // Nếu là bộ phận thực hiện công việc
      case 'assigneeby': {
        if (this.listPositionNameTypeAssignee3.includes(value)) {
          this.dataHRPolicyTaskHandler.TypeAssignee = 3;
          this.selectedPosition = value;
          this.dataHRPolicyTaskHandler.AssigneeBy = null;
        } else {
          // Nếu là chức danh áp dụng
          this.dataHRPolicyTaskHandler.TypeAssignee = 2;
          this.selectedPosition = {
            PositionName: value.PositionName,
            Code: value.Position,
          };
          this.dataHRPolicyTaskHandler.AssigneeBy = value.PositionName;
        }
        break;
      }

      // Nếu là duyệt bởi
      case 'approvedBy': {
        this.selectedApproved = {
          PositionName: value.PositionName,
          Code: value.Position,
        };

        this.dataHRPolicyTaskHandler.PositionApproved = value.Position;

        break;
      }

      // Nếu là mô tả công việc
      case 'description': {
        this.dataHRPolicyTaskHandler.Description = value;
        break;
      }

      // Nếu là danh sách loại nhân sự
      case 'liststafftype': {
        const list: DTOHRPolicyTypeStaff[] = [];
        this.selectedListStaffType.forEach((item) => {
          let itemTemp: DTOHRPolicyTypeStaff = new DTOHRPolicyTypeStaff();
          if (item) {
            itemTemp.TypeStaff = item.Code;
            itemTemp.TypeData = 6;
            itemTemp.PolicyTask = 0;
            itemTemp.TypeStaffName = item.ListName;
            // itemTemp.PolicyTask = this.dataHRPolicyTaskHandler.Policy;
            list.push(itemTemp);
          }
        });

        this.dataHRPolicyTaskHandler.ListStaffType = list;
        break;
      }
    }
  }

  /**
   * Hàm dùng để kiểm tra input có readonly hay không
   * @param field input sẽ bị readonly nếu return TRUE
   * @returns true nếu readonly
   */
  onCheckReadOnlyInputPolicyTask(field: string) {
    // Trường hợp loại đảm nhận công việc là HỆ THỐNG
    if (this.typeTaskAssignee == 1) {
      if (field == 'TaskName' || field == 'Description' || field == 'AssigneeBy' || field == 'ApprovedBy' || field == 'dropdownApprovedBy') {
        return true;
      }
    }

    // Trường hợp check vào "Là trưởng đơn vị, Q.lý điểm làm việc"
    if (this.isLeaderMonitor) {
      if (field === 'dropdownApprovedBy') {
        return true;
      }
    }

    // Chỉ quyền xem
    if (!this.isApprover && !this.isCreator && !this.isMaster) {
      return true;
    }

    // Trường hợp readonly toàn bộ input
    if (this.isReadonlyFormTask || this.statusPolicyMaster == 2 || this.statusPolicyMaster == 3) {
      return true;
    }

    // Nếu trạng thái là Gửi duyệt
    if (this.statusPolicyMaster == 1) {
      // Quyền duyệt và Toàn quyền
      if (this.isMaster || this.isApprover) {
        return false;
      }
      return true;
    }

    // Trường hợp check vào "Là trưởng đơn vị, Q.lý điểm làm việc"
    if (this.isLeaderMonitor) {
      if (field === 'dropdownApprovedBy') {
        return true;
      }
    }

    return false;
  }

  /**
   * Hàm dùng để khi mở dropdown Thực hiện bởi thì style cho 'Nhân sự áp dụng'
   */
  onStyleForApplyHR() {
    const listPopupElement = document.querySelectorAll('kendo-popup');
    const popup =
      listPopupElement[listPopupElement.length - 1]?.querySelector(
        'kendo-list'
      );
    const listli = popup?.querySelectorAll('li');
    if (listli) {
      listli[0].style.display = 'none';
      listli[1].style.fontWeight = '600';
      listli[1].style.borderBottom = '1px solid black';
    }
  }

  // Fetch data ra list
  fetchChildren = (item?: any): any[] => {
    if (item && item.ListException) {
      let children: any[] = [];
      if (Ps_UtilObjectService.hasListValue(item.ListException)) {
        children.push(...item.ListException);
      }
      return children;
    }
    return item;
  };

  // Check that item has children or not
  hasChildren = (item: any): boolean => {
    const children = this.fetchChildren(item);
    return children && children.length > 0;
  };

  /**
   * This function identifies the input object as DTOHRPolicyLocation, DTOHRPolicyPosition, or DTOHRPolicyTypeStaff
   * @param dto object to identify
   * @returns the type of the object as a string
   */
  onIdentifyDTO(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff): string {
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

    return 'Unknown';
  }

  /**
   * This function is called when click on delete policy task exception button
   * @param dto task limit want to handle
   */
  handleToogleButtonPolicyTaskLimit(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff, action: 'delete' | 'stop') {
    // Stop policy task exception
    if (action === 'stop') {
      this.APIUpdateHRPolicyLimitStatus(dto);
    }
  }

  /**
   * Check item in exception task can be deleted
   * @param dto task need to check
   * @returns true if deleteable
   */
  handleCheckDeletable(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff): boolean {
    if (!Ps_UtilObjectService.hasListValue(dto.ListException)) {
      if (this.statusPolicyMaster == 0 || this.statusPolicyMaster == 1) {
        if (this.isCreator || this.isMaster) {
          return true;
        }
      } else if (this.statusPolicyMaster == 4) {
        if (this.isApprover || this.isMaster) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  // The event is called whenever wanna close popup confirm delete
  handleClosePopupConfirmDeleteTask() {
    this.isOpenPopupConfirmDelete = false;
    this.seletedTaskToDelete = null;
    this.selectedPolicyTaskLimit = null;
  }

  /**
   * The event is called whenever wanna delete task
   */
  handleDeleteListPolicyTask() {
    let listToDelete: DTOHRPolicyTask[] = [];
    if (this.seletedTaskToDelete) {
      listToDelete.push(this.seletedTaskToDelete);
    }
    this.APIDeleteHRPolicyTask(listToDelete);
  }

  // This function is called when want to get name of obj but don't know what type of obj
  handleGetNameDTO() {
    const obj = this.selectedPolicyTaskLimit;
    if (this.onIdentifyDTO(obj) === 'DTOHRPolicyPosition') {
      return obj['PositionName'];
    } else if (this.onIdentifyDTO(obj) === 'DTOHRPolicyLocation') {
      return obj['LocationName'];
    } else if (this.onIdentifyDTO(obj) === 'DTOHRPolicyTypeStaff') {
      return obj['TypeStaffName'];
    }
    return 'Ngoại lệ';
  }

  /**
   * Hàm dùng để mở dialog thêm ngoại lệ công việc
   */
  handleOpenDialogAddException() {
    this.isOpenDialogAddException = true;
  }

  /**
   * Kiểm tra có cho thêm ngoại lệ hay không
   * @returns
   */
  handleCheckAddException() {
    if (this.statusPolicyMaster == 0 || this.statusPolicyMaster == 1) {
      if (this.isCreator || this.isMaster) {
        return true;
      }
    } else if (this.statusPolicyMaster == 4) {
      if (this.isApprover || this.isMaster) {
        return true;
      }
    }
    return false;
  }
  //#endregion

  //#region Other
  /**
 * This function is called when want to get icon base on DTO
 * @param dto object want to check DTO
 * @returns class of kendo icon
 */
  getIconByDTO(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff): string {
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
   * Check sau khi công việc được thêm thì get lại API
   */
  handleCheckAddedTask(list: DTOHRPolicyTask[]) {
    // this.APIGetHRPolicy(this.dataHrPolicyMaster);
    this.dataHrPolicyMaster.NumOfTask = list.length;
  }

  // Hàm dùng để lấy ngữ cảnh hiện tại của component, lưu trữ những biến cần thiết
  handleGetCurrentContext() {
    this.typeDataPolicyMaster = this.dataHrPolicyMaster.TypeData;
    this.typeApplyPolicyMaster = this.dataHrPolicyMaster.TypeApply;
    this.statusPolicyMaster = this.dataHrPolicyMaster.Status;
  }
  //#endregion
  /**
   * Thực hiện nhận tín hiệu create chính sách của component
   * @param e
   */
  handleGetStatusCreate(e: any): void {
    this.requestCreate = true;
    this.APIGetHRPolicy(e);
    this.handleLoadListPosition();
  }

  /**
   * Thực nhận tín hiệu và mở drawer thông tin chính sách
   * @param status
   */
  handleGiveAction(status: any): void {
    // Nếu là công việc
    if (this.handleGetTypeOfDrawer(status.status)?.Type === 1) {
      if (this.nameTaskTextBox) {
        this.nameTaskTextBox.focus();
      }

      this.handleOpenDrawer(status.status);

      this.dataHRPolicyTask = status.item;
      // this.dataHRPolicyTaskHandler = status.item;

      // Nếu là THÊM MỚI CÔNG VIỆC
      if (status.status == 12) {
        this.listExceptionLocal = null;
      }

      // Nếu là CHỈNH SỬA hoặc XEM CHI TIẾT
      else if (status.status == 13 || status.status == 14) {
        this.APIGetHRPolicyTask(status.item);
        this.listExceptionLocal = [];
        // Binding danh sách ngoại lệ
        if (status.item['HasException']) { // Nếu có ngoại lệ thì gọi API lấy danh sách ngoại lệ
          this.isLoadingTreeException = true;
          this.APIGetListHRTaskException(status.item);

          if (Ps_UtilObjectService.hasListValue(status.item['ListException'])) {
            this.listExceptionLocal = status.item['ListException'];
            this.handleAddTempIdToObjects(this.listExceptionLocal)
          }
        }
        else {  // Nếu không có ngoại lệ
          this.dataHRPolicyTaskHandler.ListException = [];
          this.dataHRPolicyTask.ListException = [];
          this.listExceptionLocal = [];
        }

        // Bind Thực hiện bởi hệ thống
        if (status?.item.TypeAssignee == 1) {
          this.isSystemTask = true;
        }

        // Bind Thực hiện bởi ra dropdown
        this.selectedPosition = {
          PositionName: status?.item.AssigneeBy,
          Code: status?.item.PositionAssignee,
        };

        // Bind duyệt bởi
        this.selectedApproved = {
          PositionName: status?.item.PositionApprovedName,
          Code: status?.item.PositionApproved,
        }

        // Bind Là trưởng đơn vị, quản lý điểm làm việc
        if (this.typeDataPolicyMaster == 2) {
          this.isLeaderMonitor = status?.item.IsLeaderMonitor;
        }
        else {
          this.isLeaderMonitor = null;
        }

        // Bind Loại nhân sự áp dụng
        let listTypeStaff: { ListName: string; Code: number }[] = [];
        status.item.ListStaffType.forEach((item: DTOHRPolicyTypeStaff) => {
          let typeStaff: { ListName: string; Code: number } = {
            ListName: item.TypeStaffName,
            Code: item.TypeStaff,
          };
          listTypeStaff.push(typeStaff);
        });

        if (status.item.TypeAssignee == 3) {
          this.selectedPosition = {
            PositionName: 'Nhân sự áp dụng',
            Code: -1,
          }
        }

        // Binh Là trưởng đơn vị, Q.lý điểm làm việc
        this.isLeaderMonitor = status.item.IsLeaderMonitor;

        this.selectedListStaffType = listTypeStaff;
      }

      this.typeTaskAssignee = status.item.TypeAssignee;
      // this.dataHRPolicyTask = status.item;
      return;
    }

    //Chính sách
    if (status.status >= 0 && status.status <= 4) {
      if (status.status == 0) {
        this.handleCloseDrawer();
      } else {
        if (status.item) {
          this.tempHRPolicyPosition = status.item;
          this.APIGetHRPolicyApply(status.item);
        } else {
          this.dataHRPolicyPosition = new DTOHRPolicyPosition();
        }
        this.handleOpenDrawer(status.status);
      }
    }
    // this.openDrawer(status.status)
  }

  handleGetListHRPolicyApply(e: DTOHRPolicyDepartment[]) {
    this.listHRPolicyApply = e;
  }

  handleLoadListPosition(): void {
    if (this.dataHrPolicyMaster?.Code !== 0 && this.dataHrPolicyMaster?.TypeApply == 1) {
      this.childListPostitionApply?.APIGetListHRPolicyApply(this.dataHrPolicyMaster)
    }
  }

  /**
   * Mở drawer
   * @param status trạng thái muốn mở của drawer
   */
  handleOpenDrawer(status: number): void {
    this.statusDrawer = status;
    this.isOpenDrawer = true;
  }

  onFucusID(e: any) {
    // const inputElement = this.inputID.nativeElement as HTMLInputElement
    // console.log(inputElement);
  }

  /**
   * Đóng drawer
   */
  handleCloseDrawer(): void {
    this.handleRemoveTempIdFromObjects(this.listExceptionLocal)
    this.handleRemoveTempIdFromObjects(this.dataHRPolicyTaskHandler.ListException)

    if (this.isAfterEdit == false) {
      if (this.statusDrawer == 13 && this.typeApplyPolicyMaster == 2) {
        this.dataHRPolicyTask.DLLPackage = this.dataHRPolicyTaskHandler.DLLPackage;

        if (JSON.stringify(this.listExceptionLocal) !== JSON.stringify(this.dataHRPolicyTask.ListException) && !this.isDialogConfirmClose) {
          this.isDialogConfirmClose = true;
          return;
        }

        if (this.isDialogConfirmClose) {
          this.dataHRPolicyTask.ListException = this.dataHRPolicyTaskHandler.ListException;
          this.listExceptionLocal = [];
        }
      }
    }

    this.isOpenDrawer = false;
    this.statusDrawer = null;
    this.isDialogConfirmClose = false;

    // Reset công việc
    this.dataHRPolicyTask = new DTOHRPolicyTask();
    this.dataHRPolicyTaskHandler = new DTOHRPolicyTask();
    this.selectedPosition = null;
    this.selectedApproved = null;
    this.selectedListStaffType = [];
    this.isSystemTask = false;
    this.selectedPolicyTaskLimit = null;
    this.seletedTaskToDelete = null;
    this.isAfterEdit = false;
    this.isLeaderMonitor = false;

    this.handleResetTemp();
    // this.childDrawer.toggle();
    this.tempPositionID = null;
    this.dataHRPolicyPosition = new DTOHRPolicyPosition()
    // this.resetTemp()
  }

  /**
   * Hàm reset biến tạm
   */
  handleResetTemp(): void {
    this.tempPositionID = null;
  }

  /**
   * Hàm thực hiên thi blur ra khỏi textbox position id để tìm chức danh
   * @returns thông tin chức danh
   */
  onBlurPositionID(): void {
    if (this.dataHRPolicyPosition.PositionID == this.tempPositionID) {
      return;
    }
    if (this.dataHRPolicyPosition.PositionID.trim() == '') {
      this.dataHRPolicyPosition.PositionID = this.tempPositionID;
      return;
    }
    this.APIGetHRPolicyPosition(this.dataHRPolicyPosition);
  }

  /**
   * Hàm kiểm tra danh sách location để disabel checkbox
   * @param item Location
   * @returns true, false
   */
  handleCheckInputLocation(item: any): boolean {
    // Đếm số lượng giá trị `IsChecked` là `true`
    const checkedCount = this.dataHRPolicyPosition.ListLocation.filter(
      (location) => location.IsChecked
    ).length;

    // Nếu chỉ có một giá trị `IsChecked` là `true` và checkbox hiện tại cũng là true, disable checkbox
    return checkedCount === 1 && item.IsChecked;
  }

  /**
   * Kiểm tra giá trị trùng lập
   * @param oldValue Giá trị cũ
   * @param newValue Giá trị mới
   * @returns true khi trùng hoặc false không trùng
   */
  handleChevaucherCheckValue(oldValue: any, newValue: any): boolean {
    if (oldValue.trim() === newValue.trim() || newValue.trim() === '') {
      return true;
    }
    return false;
  }

  // Event is called when change type data of policy master
  handleGetValueAfterChangeTypeData(value: any) {
    this.dataHrPolicyMaster.TypeApply = value?.['OrderBy'];
    this.typeApplyPolicyMaster = this.dataHrPolicyMaster.TypeApply;
    if (value.OrderBy == 2) {
      this.listHRPolicyApply = [];
      this.dataHRPolicyPosition = new DTOHRPolicyPosition();
      this.dataHrPolicyMaster.ListPositionName = [];
    } else if (value.OrderBy == 1) {
      this.childGridTaskList.handleDeleteAllTaskException();
    }
  }

  handleGetValuePositionList(event:any){
    if(event){
      this.dataHrPolicyMaster.ListPositionName=event;
    }
  }

  // getValueAfterDateChange(value: any){
  //   this.dataHrPolicyMaster.EffDate = value
  //   this.setupBtnStatus()
  // }

  /**
   * Xử lý khi nút thêm mới được kích hoạt
   */
  handleAddNewClick(): void {
    this.dataHrPolicyMaster = new DTOHRPolicyMaster();
    this.setupBtnStatus();
    localStorage.setItem(
      'HrPolicyMaster',
      JSON.stringify(this.dataHrPolicyMaster)
    );
    this.childGridTaskList.handleClearListPolicyTask();
    this.listHRPolicyApply = [];
  }

  getNumOfTask(event: any) {
    if (this.dataHrPolicyMaster.Code !== 0) {
      if (this.childGridTaskList.gridState.filter.filters.length > 1 && this.dataHrPolicyMaster.TypeApply === 2) {
        this.childGridTaskList.onResetAll();
      }
    }
  }

  getListNewPosition(value: string[]){
    this.dataHrPolicyMaster.ListPositionName = value;
  }

  //#region Dialog

  /**
   * Mở dialog Xóa chính sách
   */
  handleOpenDialog() {
    this.isDialogShow = true;
  }

  /**
   * Đóng dialog Xóa chính sách
   */
  handleCloseDialog() {
    this.isDialogShow = false;
  }

  /**
   * Thực hiện xóa chính sách
   */
  handleDeletePolicy(): void {
    if(this.dataHrPolicyMaster.NumOfTask == 0 && this.dataHrPolicyMaster.ListPositionName.length == 0){
      this.APIDeleteHRPolicy([this.dataHrPolicyMaster]);
      this.childGridTaskList.listPolicyTask = null;
    } else {
      if(this.dataHrPolicyMaster.NumOfTask > 0 && this.dataHrPolicyMaster.ListPositionName.length > 0){
        this.layoutService.onError(`Không thể xóa chính sách ${this.dataHrPolicyMaster.PolicyName} vì còn danh sách chức danh áp dụng và danh sách công việc`);
      } else {
        if(this.dataHrPolicyMaster.NumOfTask > 0){
          this.layoutService.onError(`Không thể xóa chính sách ${this.dataHrPolicyMaster.PolicyName} vì còn danh sách công việc`);
        } else {
          this.layoutService.onError(`Không thể xóa chính sách ${this.dataHrPolicyMaster.PolicyName} vì còn danh sách chức danh áp dụng`);
        }
      }
    }
  }

  /**
   * Kiểm tra xem chính sách còn trả về được hay không
   * @param policy chính sách
   * @returns true/false
   */
  handleCheckReturnPolicy(policy: DTOHRPolicyMaster): boolean {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (Ps_UtilObjectService.getDaysLeft(currentDate, policy.EffDate) > 0) {
      return true;
    }
    return false;
  }

  //#end region

  /**
   * Kiểm tra xem có quyền chỉnh sửa khi là approver hay không
   * @returns
   */
  handleCheckDisableApproverEdit(): boolean {
    if (this.isMaster) {
      return false;
    }
    if (this.isApprover && this.dataHrPolicyMaster.Status == 1) {
      return false;
    }
    if (
      this.isCreator &&
      (this.dataHrPolicyMaster.Status == 0 ||
        this.dataHrPolicyMaster.Status == 4)
    ) {
      return false;
    }
    return true;
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // localStorage.removeItem('HrPolicyMaster')
  }
}

