import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOHRDecisionProfile } from '../../dto/DTOHRDecisionProfile.dto';
import { DTOHRDecisionTask } from '../../dto/DTOHRDecisionTask.dto';
import { DTOHRDecisionTaskLog } from '../../dto/DTOHRDecisionTaskLog.dto';
import { linkVerticalIcon } from '@progress/kendo-svg-icons';
import { HriDecisionApiService } from '../../services/hri-decision-api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { distinct, FilterDescriptor, State } from '@progress/kendo-data-query';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { StaffApiService } from '../../services/staff-api.service';
import { PKendoTextboxComponent } from 'src/app/p-app/p-layout/components/p-kendo-textbox/p-textbox.component';
import { HrTaskListComponent } from '../hr-task-list/hr-task-list.component';
import { DTOEmployee } from '../../dto/DTOEmployee.dto';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { DTOListHR } from '../../dto/DTOPersonalInfo.dto';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { faCircleInfo, faCoffee, faInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-hr-boarding-detail',
  templateUrl: './hr-boarding-detail.component.html',
  styleUrls: ['./hr-boarding-detail.component.scss']
})
export class HrBoardingDetailComponent implements OnInit, OnDestroy {
  // Enum Type data Chuẩn bị / Boarding / Boarded / Ngưng			
  // Pre-Onboard	1	
  // Pre-Offboard	2	
  // Onboarding	3	
  // Offboarding	4	
  // Onboarded	5	
  // Offboarded	6	
  // Ngưng Onboarded	7	
  // Ngưng Offboarded	8	
  @Input() TypeData: number

  @ViewChild('gridTaskList') gridTaskList!: HrTaskListComponent


  faCircleInfo = faCircleInfo;

  //variable
  DataHRDecisionProfileMaster: DTOHRDecisionProfile = new DTOHRDecisionProfile
  DataHRDecisionTask: DTOHRDecisionTask = new DTOHRDecisionTask
  DataHRDecisionTaskOrigin: DTOHRDecisionTask = new DTOHRDecisionTask
  DataHRTaskLog: DTOHRDecisionTaskLog[]
  DataTaskChild:DTOHRDecisionTask[]

  deadlineDate: number = 0
  titleReason: string = ''

  //Ngày thử việc
  trialDate: string


  //#region DATE
  minEndDate: Date = new Date
  dateRemain: number = 0


  // actionGrid: 

  //boolen
  isShowDialogTaskLog: boolean = false
  isOpenDrawer: boolean = false;
  isShowDetailTransfer: boolean = true
  isShowPopUpSelection: boolean = false;
  resquestChangeStatus: boolean = false
  isDropdownAssignee: boolean = true;
  isDropdownPositionAssignee: boolean = true;

  isDatePickerChange: boolean = false


  //#region variable drawer
  isEdit: boolean = false;
  isView: boolean = false;
  isCreate: boolean = false



  /**
   * 0 thêm mới
   * 1 Cập nhật
   */
  statusDrawer: 0 | 1 = 0

  //list
  listEmployee: DTOEmployee[] = [];
  listEmployeeFilter: DTOEmployee[] = []
  defautEmployeeFilter: any = {FullName: '-- Chọn --', Code: -1}

  listPositionNameTypeAssignee3: { PositionName: string; Code: number }[] = [];
  currentListApprovedPosition: { PositionName: string; Code: number }[] = [];
  currentListPosition: { PositionName: string; Code: number, ID: string }[] = []
  defaultListPosition: { PositionName: string; Code: number, ID: string } = { PositionName: "-- Chọn --", Code: -1, ID: null }

  listTypeStaff: { ID: number, name: string }[] = [
    { ID: 1, name: "Chính thức" },
    { ID: 2, name: "Không chính thức" },
  ]
  defaultListTypeStaff: { ID: number, name: string } = { ID: -1, name: "-- Chọn --" }

  listStatus: { name: string, ID: number }[] = [
    { name: "Chưa thực hiện", ID: 1 },
    { name: "Không thực hiện", ID: 2 },
    { name: "Đang thực hiện", ID: 3 },
    { name: "Chờ duyệt", ID: 4 },
    { name: "Ngưng thực hiện", ID: 5 },
    { name: "Hoàn tất", ID: 6 }
  ];

  listStatusDropdown = [
    { Status: 1, StatusName: 'Chưa thực hiện' },
    { Status: 2, StatusName: 'Không thực hiện' },
    { Status: 3, StatusName: 'Đang thực hiện' },
    { Status: 4, StatusName: 'Chờ duyệt' },
    { Status: 5, StatusName: 'Ngưng thực hiện' },
    { Status: 6, StatusName: 'Hoàn tất' }
  ];

  statusDropdownDefault: { Status: number, StatusName: string } = { Status: -1, StatusName: '-- Chọn --' }

  listStatusDropdownFitler = []
  OriginStatusSelect: number
  defaultStatus: { ID: number, name: string } = { ID: -1, name: "-- Chọn --" }
  listHR: DTOListHR[] = []; // Danh sách loại nhân sự áp dụng
  listHRFiltered: DTOListHR[] = []; // Danh sách loại nhân sự áp dụng
  listReason: DTOListHR[] = []
  listReasonFiltered: DTOListHR[] = [];
  defaultHR: DTOListHR
  DecisionTaskForm: FormGroup; // form công việc của view công việc



  //unsubcribe
  destroy$ = new Subject<void>();

  // Phân quyền
  justLoaded: boolean = true;
  actionPerm: DTOActionPermission[] = [];
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false;

  //Loading
  isLoading: boolean = false
  isLoadingEmployee: boolean = false

  //icon
  icons = { linkVertical: linkVerticalIcon }

  //state
  gridStateStaff: State = { filter: { logic: "and", filters: [] } }
  gridStateTask: State = { filter: { logic: "and", filters: [] } }
  gridStateTaskLog: State = { filter: { logic: "and", filters: [] } }
  // this.gridState.filter.filters = [{ field: 'DecisionProfile', operator: 'eq', value: this.decisionProfile.Code}];

  // statusDrawer: number = 0;

  defautCurrentHR: { FullName: string; Code: number, ID: string } = { ID: "", FullName: "-- Chọn --", Code: -1 }

  // ListDecisionTask: DTOHRDecisionTask[] = listTaskTest
  // DataDecisionTask: DTOHRDecisionTask = listTaskTest[0]

  DataDrawer: DTOHRDecisionTask

  //#region Varible render UI
  nameDecision: string =''
  boardingType: string = ''



  //#region  MOCK DATA


  //#region FORM

  MultiForm: UntypedFormGroup;

  constructor(
    public domSanititizer: DomSanitizer,
    private decisionService: HriDecisionApiService,
    public menuService: PS_HelperMenuService,
    private layoutService: LayoutService,
    public staffApiService: StaffApiService,
    private hriTransitionService: HriTransitionApiService,
    private fb: FormBuilder,
    private formBuilder: FormBuilder
  ) { }


  mockDataResource = [
    {
      resourceName: "Máy tính xách tay",
      resourceType: "Thiết bị điện tử",
      price: 15000000
    },
    {
      resourceName: "Máy chiếu",
      resourceType: "Thiết bị văn phòng",
      price: 5000000
    },
    {
      resourceName: "Bàn làm việc",
      resourceType: "Nội thất",
      price: 2000000
    },
    {
      resourceName: "Tủ hồ sơ",
      resourceType: "Nội thất",
      price: 2500000
    },
    {
      resourceName: "Điện thoại di động",
      resourceType: "Thiết bị điện tử",
      price: 10000000
    },
    {
      resourceName: "Ghế văn phòng",
      resourceType: "Nội thất",
      price: 1200000
    },
    {
      resourceName: "Máy in",
      resourceType: "Thiết bị văn phòng",
      price: 3000000
    }
  ];


  /**
   * INIT
   */
  ngOnInit(): void {
    this.handleGetCache()
    this.MultiForm = this.onLoadForm();
    this.MultiForm.patchValue(new DTOHRDecisionTask);
    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetHRDecisionProfile(this.DataHRDecisionProfileMaster)
        this.APIGetListHRPolicyPosition()
        this.APIGetListHR()
        this.APIGetListHRReasonStop()

        // this.currentListPosition = []

        // Thêm nhân sự áp dụng
        // this.listPositionNameTypeAssignee3 = [];
        // this.listPositionNameTypeAssignee3.push({
        //   PositionName: 'Nhân sự áp dụng',
        //   Code: -1,
        // });
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

  /**
 * Lấy cache chính sách
 */
  handleGetCache() {
    const result = localStorage.getItem('HRDecisionProfile');
    if (Ps_UtilObjectService.hasValue(result)) {
      this.DataHRDecisionProfileMaster = JSON.parse(result);
    }


  }


  //#region  API
  /**
   * API lấy thông tin chính sách
   * @param req DTO chính sách
   */
  APIGetHRDecisionProfile(req: DTOHRDecisionProfile) {
    this.isLoading = true
    this.decisionService.GetHRDecisionProfile(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isLoading = false
            this.DataHRDecisionProfileMaster = res.ObjectReturn;
            if(!this.DataHRDecisionProfileMaster.StartDate){
              this.DataHRDecisionProfileMaster.StartDate = Ps_UtilObjectService.addDays(new Date(), 1).toString()
            }
            localStorage.setItem(
              '',
              JSON.stringify(this.DataHRDecisionProfileMaster)
            );
            this.gridStateTask.filter.filters = [{ field: 'DecisionProfile', operator: 'eq', value: res.ObjectReturn.Code }];
            if(!this.DataHRDecisionProfileMaster.ProbationPeriodDays){
              this.getTrialDate(new Date(this.DataHRDecisionProfileMaster.JoinDate), 60)
            }

            this.handleGetNameDecision(res.ObjectReturn.DecisionType)
            this.checkBoardingType(res.ObjectReturn.BoardingType)

          } else {
            this.isLoading = false
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy Thông tin: ${res.ErrorString}`
            );
          }

          // this.setupBtnStatus();
        },
        (err) => {
          this.isLoading = false
          // this.requestLoadInfoBlock = false
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy Thông tin: ${err}`
          );
        }
      );
  }

  /**
 * API cập nhật
 */
  APIUpdateHRDecisionProfileStatus(
    listDTO: DTOHRDecisionProfile[],
    status: number
  ) {
    // this.isLoading = true;
    this.decisionService
      .UpdateHRDecisionProfileStatus(listDTO, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          // this.isLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(
              "Cập nhật trạng thái thành công"
            );
            this.APIGetHRDecisionProfile(this.DataHRDecisionProfileMaster);
            if(status == 2){
              this.gridTaskList.ChangeStatusAllTask();
            }
            switch (this.TypeData) {
              case 1:
                this.TypeData = 3
                break
              case 2:
                this.TypeData = 4
                break
              case 3:
                this.TypeData = 6
                break
              case 4:
                this.TypeData = 8
                break
            }
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật trạng thái ${this.handleGetNameTitle(this.TypeData)}: ` +
              res.ErrorString
            );
          }
        },
        (err) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhât trạng thái ${this.handleGetNameTitle(this.TypeData)}: ${err}`
          );
        }
      );
  }


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
          if(status == 1){
            this.MultiForm.controls['Assignee'].reset(); // Reset về giá trị mặc định
            this.isDropdownAssignee = true; // Disable Dropdown
          }else if(status == 2){
            this.MultiForm.controls['Approved'].reset(); // Reset về giá trị mặc định
            this.isDropdownPositionAssignee = true; // Disable Dropdown
          }
      
        } else {
          if(status == 1){
            this.isDropdownAssignee = false; // Enable Dropdown
          }else if(status == 2){
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
   * Lấy danh sách chức danh
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
* API cập nhật công việc
*/
  APIUpdateHRDecisionTask(
    data: DTOHRDecisionTask
  ) {
    // this.isLoading = true;
    this.decisionService
      .UpdateHRDecisionTask(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            if(this.isCreate){
              this.layoutService.onSuccess('Thêm công việc thành công')
            }else{
              this.layoutService.onSuccess('Cập nhật công việc thành công')
            }

            this.handleCloseDrawer()
            this.gridTaskList.APIGetListHRDecisionTask()
          } else {
            if(this.isCreate){
              this.layoutService.onError(
                `Đã xảy ra lỗi khi thêm mới công việc ${this.handleGetNameTitle(this.TypeData)}: ` +
                res.ErrorString
              );
            }else{
              this.layoutService.onError(
                `Đã xảy ra lỗi khi Cập nhật công việc ${this.handleGetNameTitle(this.TypeData)}: ` +
                res.ErrorString
              );
            }
            
          }
        },
        (err) => {
          this.isLoading = false;
          if(this.isCreate){
            this.layoutService.onError(
              `Đã xảy ra lỗi khi thêm mới công việc ${this.handleGetNameTitle(this.TypeData)}: ${err}`
            );
          }
          else{
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật công việc ${this.handleGetNameTitle(this.TypeData)}: ${err}`
            );
          }
          
          
        }
      );
  }

  //   /**
  //  * API lấy danh sách chức danh áp dụng
  //  */
  //   APIGetListTaskLog() {
  //     this.decisionService
  //       .GetListHRDecisionTaskLog(this.gridStateTaskLog)
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe((res) => {
  //         if (
  //           Ps_UtilObjectService.hasValue(res) &&
  //           Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
  //           res.StatusCode == 0
  //         ) {
  //           this.DataHRTaskLog = res.ObjectReturn.Data;
  //           console.log(res.ObjectReturn.Data)
  //         }
  //       }, (error) => {
  //         this.layoutService.onError(
  //           `Đã xảy ra lỗi khi lấy danh sách chức danh áp dụng: ${error}`
  //         );
  //       });
  //   }

  /**
   * Lấy thông tin tasklog
   */
  APIGetListHRDecisionTaskLog(filter: State) {
    this.decisionService
      .GetListHRDecisionTaskLog(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.isLoading = false;

          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.DataHRTaskLog = res.ObjectReturn.Data;
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


  /**
* API lấy danh sách chức danh áp dụng
*/
  APIGetListHR() {
    this.staffApiService
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
* API lấy danh sách chức danh áp dụng
*/
  APIGetListHRReasonStop() {
    this.staffApiService
      .GetListHR(23)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.listReason = res.ObjectReturn;
          this.listReasonFiltered = res.ObjectReturn;
          console.log(this.listReason)
        }
      }, (error) => {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi lấy danh sách chức danh áp dụng: ${error}`
        );
      });
  }



  //#endregion


  //#region LOADING DATA
  /**
   * Load data breadcrumb
   */
  loadData() {
    console.log(this.gridStateTask)
    // this.gridStateTask.filter.filters = [{ field: 'DecisionProfile', operator: 'eq', value: this.DataHRDecisionProfileMaster.Code }];
    // if(this.DataHRDecisionProfileMaster.Status == 2){
    //   this.gridStateTask.filter.filters.push({
    //     logic: 'and',
    //     filters: [
    //       { field: 'Status', operator: 'neq', value: 2 },
    //       { field: 'Status', operator: 'neq', value: 5 }
    //     ]
    //   });
    // }
    this.APIGetHRDecisionProfile(this.DataHRDecisionProfileMaster)
    this.handleLoadGrid()

  }

  /**
   * Request loading grid task
   */
  handleLoadGrid() {
    if (this.DataHRDecisionProfileMaster.Status == 1 || this.DataHRDecisionProfileMaster.Status == 2) {
      this.gridStateTask.filter.filters = [{ field: 'DecisionProfile', operator: 'eq', value: this.DataHRDecisionProfileMaster.Code }];
      // this.gridStateTask.filter.filters.push({
      //   logic: 'or',
      //   filters: [
      //     // { field: 'Status', operator: 'eq', value: 2 },
      //     // { field: 'Status', operator: 'eq', value: 1 },
      //   ]
      // });
    }

    this.gridTaskList.APIGetListHRDecisionTask()
  }

  //#region XỬ LÍ UI

  /**
   * Lấy tên để binding các title và lable html
   * @param Type 
   * @returns 
   */
  handleGetNameTitle(Type: number): string {
    switch (Type) {
      case 1:
      case 3:
      case 5:
      case 7:
        return "Onboarding";
      case 2:
      case 4:
      case 6:
      case 8:
        return "Offboarding";
      default:
        return "";
    }
  }


  /**
   * Hàm set status để lấy class style cho các chữ
   * @param status 
   * @returns 
   */
  getStatusClass(status: number): string {
    switch (status) {
      case 1:
        return 'pre-status-text';
      case 2:
        return 'on-off-status-text';
      case 3:
        return 'stop-status-text';
      case 4:
        return 'onboarded-status-text';
      default:
        return '';
    }
  }

  /**
   * hàm để thay đổi nút action góc trên bên phải
   * @param status 
   * @returns 
   */
  handleGetButtonAction(status: number): { name: string, icon: string } {
    switch (status) {
      case 1:
        return { name: 'onboarding', icon: 'k-i-check-outline' }
      case 2:
        return { name: 'offboarding', icon: 'k-i-check-outline' }
      case 3:
        return { name: 'onboarded', icon: 'k-i-check-outline' }
      case 4:
        return { name: 'offboarded', icon: 'k-i-check-outline' }
    }
  }

  /**
   * Hàm trả về tên của Decision
   * @param status 
   */
  handleGetNameDecision(status: number) {
    switch (status) {
      case 1:
        this.nameDecision = "Tuyển dụng";
        break
      case 2:
        this.nameDecision = "Điều chuyển";
        break
      case 3:
        this.nameDecision = "Sa thải";
        break
      case 4:
        this.nameDecision = "Nghỉ việc";
        break
      default:
        this.nameDecision = "Không xác định";
        break
    }
  }


  /**
   * Hàm ẩn hoặc hiện block 1 đối với điều chuyển
   */
  handleActionDetailTransfer() {
    if (this.isShowDetailTransfer) {
      this.isShowDetailTransfer = false
    } else {
      this.isShowDetailTransfer = true
    }
  }

  /**
   * Kiểm tra xe trên drawer show thực hiện bởi hệ thống không
   * @returns 
   */
  handleCheckTaskOfSystem(): boolean {
    if (this.DataHRDecisionTaskOrigin.TypeAssignee == 1) {
      return true
    } else {
      return false
    }
  }

  /**
  * Hàm dùng để lấy loại của drawer là chính sách hay công việc
  * @param statusDrawer trạng thái được truyền vào là số được quy định sẵn
  * @returns
  */
  handleGetTypeOfDrawer(statusDrawer: number) {
    // Thuộc về chức danh
    // const listStatusPolicyButton: number[] = [1, 2, 3, 4];
    // if (listStatusPolicyButton.includes(statusDrawer)) {
    //   return { Type: 0, Name: 'Thông tin chức danh' };
    // }

    // // Thuộc về công việc. 12: Thêm mới -- 13: Chỉnh sửa -- 14: Xem chi tiết
    // const listStatusPolicyTaskButton: number[] = [12, 13, 14];
    // if (listStatusPolicyTaskButton.includes(statusDrawer)) {
    //   return { Type: 1, Name: 'Thông tin công việc' };
    // }
  }

  /**
   * Đóng drawer
   */
  handleCloseDrawer(): void {
    this.isOpenDrawer = false;
    this.DataHRDecisionTask = new DTOHRDecisionTask
    this.DataHRDecisionTaskOrigin = new DTOHRDecisionTask
    this.MultiForm.reset()
    this.resquestChangeStatus = false
    this.isEdit = false;
    this.isView = false;
    this.isCreate = false
    this.dateRemain = 0
    this.isDropdownAssignee = true
    this.isDatePickerChange = false
  }

  /**
   * Mở drawer
   */
  handleOpenDrawer(): void {
    const assignee = this.MultiForm.get('PositionAssignee').value
    if(assignee){
      this.gridStateStaff.filter.filters = [{field: 'CurrentPosition', operator: 'eq', value: assignee}]
      this.APIGetListEmployee(0)
    }

    //Lấy ngày làm
    this.handleCalDate(this.MultiForm.get("CreatedTime").value, this.MultiForm.get("EndDate").value)
    this.handleCalDeadline(this.MultiForm.get("EndDate").value)

    //Loại nhân sự
    if(this.isCreate){
      const item = this.listHR.find(item => item.OrderBy == this.DataHRDecisionProfileMaster.TypeStaff)
      const formControl = this.MultiForm.get('ListOfTypeStaff');
      formControl?.setValue(`[${[item.OrderBy]}]`);
    }

    this.isOpenDrawer = true
    this.openDatePicker()
    this.onGetStatusDropdown()
  }

  /**
   * Nút Action bên phải
   */
  handleButtonHeaderClick(): void {

  }

  // tài sản thu hồi
  handleAssetRecovery(action: string, inputRef?: PKendoTextboxComponent, data?: { PositionName: string; Code: number; ID: string }) {
    if (action == 'add') {
      this.currentListPosition.unshift({ PositionName: '', Code: 0, ID: null });
    }

    if (action == 'trash') {
      this.currentListPosition.filter((v) => { v !== data })
      this.layoutService.onError(
        `Xóa thành công`
      );
    }
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
            return fieldValue && Ps_UtilObjectService.containsString(fieldValue.toString(), value);
          })
        );
      } else {
        this.listEmployeeFilter = this.listEmployee.filter(
          (s) => Ps_UtilObjectService.containsString(s[textField], value)
        );
      }
    }
  }

  /**
   * Kiểm tra hiển thị block vị trí trước Onboarding
   */
  shouldDisplayBlock(): boolean {
    if (!this.DataHRDecisionProfileMaster || ![1, 3, 5, 7].includes(this.TypeData)) {
      return false;
    }

    const master = this.DataHRDecisionProfileMaster;

    // Kiểm tra sự khác biệt giữa các giá trị, bao gồm cả trường hợp null
    const isPositionDifferent = master.PositionName !== master.CurrentPositionName;
    const isDepartmentDifferent = master.DepartmentName !== master.CurrentDepartmentName;
    const isLocationDifferent = master.LocationName !== master.CurrentLocationName;

    // Kiểm tra nếu cả ba giá trị CurrentPositionName, CurrentDepartmentName, CurrentLocationName đều là null
    const isAllNull = master.CurrentPositionName === null &&
      master.CurrentDepartmentName === null &&
      master.CurrentLocationName === null;

    // Nếu cả ba giá trị đều là null thì không hiển thị block
    if (isAllNull) {
      return false;
    }

    return master.DecisionType !== 2 &&
      (isPositionDifferent || isDepartmentDifferent || isLocationDifferent);
  }

  //#region Image
  errorOccurred: any = {};
  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
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


  // //#region TASK LOG
  // handleOpenTaskLog(data: DTOHRDecisionTask) {
  //   data.Code = 354
  //   this.gridStateTaskLog.filter.filters = [{field: 'DecisionTask', operator: 'eq', value: data.Code}]
  //   this.APIGetListTaskLog()
  //   this.isShowDialogTaskLog = true
  // }

  /**
   * Đóng tasklog
   */
  handleCloseTaskLog() {
    this.isShowDialogTaskLog = false
  }


  //#region EXCEL

  onImportExcel() {

  }

  downloadExcel() {

  }

  exportExcel() {

  }

  //#region Logic code

  /**
   * Thêm một ngày
   * @param joinDateStr 
   * @returns 
   */
  addOneDayToJoinDate(joinDateStr: Date): string | null {
    const Date = Ps_UtilObjectService.addDays(joinDateStr, 1)
    return Date.toString()
  }


  /**
   * Lấy ngày thử việc
   */
  getTrialDate(Date: Date, num: number){
    // this.trialDate = Ps
    console.log(Ps_UtilObjectService.addDays(Date, num).toString())
    this.trialDate = Ps_UtilObjectService.addDays(Date, num).toString()
  }


  /**
   * Thêm hoặc sửa task
   */
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

    if(this.checkChangeStatus()){
      if(data.Status != 6){
        if (!Ps_UtilObjectService.hasValueString(data.Reason)) {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${option} công việc: Vui lòng chọn lý do`);
          return;
        }else{
          if(data.Reason == 104){
            if (!Ps_UtilObjectService.hasValueString(data.ReasonDescription)) {
              this.layoutService.onError(`Đã xảy ra lỗi khi ${option} công việc: Vui lòng nhập mô tả lý do`);
              return;
            }
          }
          
        }
      }
      
    }
    if (option == "Thêm mới") {
      data.DecisionProfile = this.DataHRDecisionProfileMaster.Code
      data.Code = 0
      data.ListHRDecisionProfile = []
    }

    if(JSON.stringify(data) === JSON.stringify(this.DataHRDecisionTaskOrigin)){
      this.handleCloseDrawer()
      return
    }
    this.resquestChangeStatus = false
    this.APIUpdateHRDecisionTask(data)
  }

  /**
   * 1 Chưa thực hiện
   * 2 Không thực hiện
   * 3 Quá hạn
   * 4 Đang thực hiện
   * 5 Hoàn tất
   * 6 Ngưng thực hiện
   * 7 Chờ duyệt
   */

  handleSortList(status: number) {
    this.gridTaskList.requestSortData(status)
    switch (status) {
      case 1:
        console.log("Chưa thực hiện");
        // Logic cho trạng thái chưa thực hiện
        break;
      case 2:
        console.log("Không thực hiện");
        // Logic cho trạng thái không thực hiện
        break;
      case 3:
        console.log("Đang thực hiện");
        // Logic cho trạng thái đang thực hiện
        break;
      case 4:
        console.log("Chờ duyệt");
        // Logic cho trạng thái chờ duyệt
        break;
      case 5:
        console.log("Ngưng thực hiện");
        // Logic cho trạng thái ngưng thực hiện
        break;
      case 6:
        console.log("Hoàn tất");
        // Logic cho trạng thái hoàn tất
        break;
      case 7:
        console.log("Quá hạn");
        // Logic cho trạng thái hoàn tất
        break;
      default:
        console.log("Trạng thái không hợp lệ");
        // Logic cho các trạng thái không hợp lệ
        break;
    }
  }

  /**
   * Load form
   */
  onLoadForm(): UntypedFormGroup {
    const form = this.formBuilder.group({});
    const dto = new DTOHRDecisionTask(); // Khởi tạo đối tượng DTO

    // Lặp qua các trường trong DTO và gán giá trị mặc định cho form
    Object.keys(dto).forEach((key) => {
      const value = dto[key];  // Lấy giá trị từ DTO

      // Gán giá trị mặc định vào form control
      form.addControl(
        key,
        this.formBuilder.control(value, key === 'Code' ? Validators.required : null)
      );
    });

    return form;
  }


  /**
   * Action khi các dropdown thực hiện
   * @param event value
   * @param prop name dropdown action
   */
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
  
      default:
        formControl?.setValue(event);
        break;
    }
    console.log(this.MultiForm)
  }
  

  /**
   * Datepicke change
   */
  openDatePicker() {
    let startDateValue = '';
  
    // Xác định giá trị startDateValue dựa trên TypeData
    if (this.TypeData === 1 || this.TypeData === 2) {
      const formStartDate = this.MultiForm.get("StartDate").value;
      startDateValue = formStartDate 
        ? formStartDate 
        : Ps_UtilObjectService.addDays(new Date(this.DataHRDecisionProfileMaster.StartDate), 0).toString();
    } else if (this.TypeData === 3 || this.TypeData === 4) {
      startDateValue = new Date().toISOString();
    }
  
    // Chuyển đổi startDateValue thành ngày và tính toán minEndDate
    const startDate = startDateValue ? new Date(startDateValue) : null;
  
    if (startDate && !isNaN(startDate.getTime())) {
      this.minEndDate = Ps_UtilObjectService.addDays(startDate, 1); // Ngày hợp lệ
    } else {
      this.minEndDate = null; // Ngày không hợp lệ hoặc không có giá trị
    }
  }


  /**
   * Action khi các datepicker thực hiện
   * @param event value
   * @param prop name dropdown action
   */
  onDatepickerChange(event: any, prop: string) {
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
   * Open tasklog
   */
  handleOpenTaskLog() {
    // FILTER TASKLOG
    const filterListTaskLogState: State = {
      filter: { filters: [], logic: 'and' },
    };

    const filterTaskLog: FilterDescriptor = {
      field: 'DecisionTask',
      operator: 'eq',
      value: (this.DataHRDecisionTask as any).Code,
      ignoreCase: true,
    };

    // filterListTaskLog.filters.push(filterTaskLog);
    filterListTaskLogState.filter.filters.push(filterTaskLog);
    this.APIGetListHRDecisionTaskLog(filterListTaskLogState);
    this.isShowDialogTaskLog = true;
  }

  /**
   * Get action dropdown status drawer
   */
  onGetStatusDropdown() {
    this.listStatusDropdownFitler = []
    if (Ps_UtilObjectService.hasValue(this.DataHRDecisionTask.Status)) {
      let Status = this.DataHRDecisionTask.Status;

      if (this.TypeData == 1 || this.TypeData == 2) {
        this.listStatusDropdownFitler = this.listStatusDropdown.filter(status => Number(status.Status) === 2 || Number(status.Status) === 1);
      }
      if (this.TypeData == 3 || this.TypeData == 4) {
        this.listStatusDropdownFitler = this.listStatusDropdown.filter(status => Number(status.Status) === 2 || Number(status.Status) === 3 || Number(status.Status) === 5 || Number(status.Status) === 6);
      }
    }
  }

  /**
   * Parse and return value HR
   */
  handleGetHR(HR: string) {
    if (HR) {
      return JSON.parse(HR)[0]
    }
  }

  handleGetStatus(status: number) {
    if (status) {
      return this.listStatusDropdown[status]
    }
  }

  /**
   * check status was change when open drawer
   */
  checkChangeStatus() {
    if(this.MultiForm.get('Status').value == this.DataHRDecisionTaskOrigin.Status) {
      return false
    } else {
      return true
    }
  }

  /**
   * Check value to show element reason
   */
  shouldShowElement(): boolean {
    return (
      (this.checkChangeStatus() && this.MultiForm.get('Status').value != 6) || 
      (this.DataHRDecisionTask?.ListHRDecisionTaskLog.length > 1 && 
        this.statusDrawer != 0 && this.MultiForm.get('Status').value != 6)
    );
  }
  

  /**
   * return name of type boarding
   */
  checkBoardingType(type: number){
    console.log(type)
    if(type == 1){
      this.boardingType = 'Onboarding'
      // return 'Onboarding'
    }
    if(type == 2){
     this.boardingType = 'Offboarding'
    }
  }

  /**
   * Calculate date remain
   */
  handleCalDate(createTime: any, endDate: any) {
    // Đảm bảo startDate và endDate là đối tượng Date
    let normalizedStartDate:Date
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
    }else{
      if(this.DataHRDecisionProfileMaster.Status == 1){
        const startDate:Date = new Date(this.DataHRDecisionProfileMaster.StartDate) 
        startDate.setHours(0, 0, 0, 0);
        this.dateRemain = Ps_UtilObjectService.getDaysLeft(startDate, normalizedEndDate);
      }else if(this.DataHRDecisionProfileMaster.Status == 2){
        if(createTime && !this.isDatePickerChange){
          let normalizedCreateTime: Date = new Date(createTime)
          normalizedCreateTime.setHours(0, 0, 0, 0);
          this.dateRemain = Ps_UtilObjectService.getDaysLeft(normalizedCreateTime, normalizedEndDate);
        }else{
          this.dateRemain = Ps_UtilObjectService.getDaysLeft(normalizedStartDate, normalizedEndDate);
        }
        
      }
 
    }
    
  }

  /**
   * Calculate deadline
   */
  handleCalDeadline(endDate: any){
    const curDate = new Date()
    const normalizedEndDate = new Date(endDate)
    
    if(!endDate){
      this.deadlineDate = 0
    }else{
      curDate.setHours(0, 0, 0, 0);
      normalizedEndDate.setHours(0, 0, 0, 0);
  
      this.deadlineDate = Ps_UtilObjectService.getDaysLeft(normalizedEndDate, curDate);
    }

 
  }


  /**
   * Get title reason change status
   */
  getTitleReason(status: number){
    const item = this.listStatusDropdown.find(item => item.Status == status)
        if(item){
          this.titleReason = item.StatusName
        }

  }
  
  /**
   * Check offboard
   */
  checkOnboarded(data: DTOHRDecisionTask[]): boolean {
    const dataFilter = data.filter(item => item.Status != 2 && item.Status != 5);
    
    for (const element of dataFilter) {
        if (element.ListOfTypeStaff.includes('2')) {
            console.log(element);
            if (element.Status !== 6) {
                return false; // Dừng và trả về false ngay lập tức
            }
        }
    }
    
    return true; // Nếu không gặp điều kiện false, trả về true
}




  //#region ACTION
  handleUpdateStatus(data: DTOHRDecisionProfile, typeData: number) {
    if (data.Code) {
      data.StartDate = null
      if (typeData == 1 || typeData == 2) {
        this.APIUpdateHRDecisionProfileStatus([data], 2)
      } else if (typeData == 3 || typeData == 4) {
        this.DataTaskChild = this.gridTaskList.listTask.data
        console.log(this.checkOnboarded(this.DataTaskChild))
        if(this.checkOnboarded(this.DataTaskChild)){
          this.APIUpdateHRDecisionProfileStatus([data], 4)
        }
       else{
          this.layoutService.onError("Đã xảy ra lỗi khi cập nhật trạng thái: Tất cả công việc cần thiết chưa được hoàn thành!")
        }
       
      }

    }
  }

  handleGetAction(data) {
    this.DataHRDecisionTask = data.item
    this.DataHRDecisionTask.DecisionProfile = this.DataHRDecisionProfileMaster.Code
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

  handleGetNew(data) {
    if (data.status == 13) {
      this.statusDrawer = 0
      this.isEdit = false
      this.isView = false
      this.isCreate = true
      this.MultiForm = this.onLoadForm();
      this.MultiForm.patchValue(new DTOHRDecisionTask);

      if(this.DataHRDecisionProfileMaster.Status == 1){
        this.MultiForm.patchValue({
          Status: 1
        })
      }else if(this.DataHRDecisionProfileMaster.Status == 2){
        this.MultiForm.patchValue({
          Status: 3
        })
      }
      this.DataHRDecisionTaskOrigin = this.MultiForm.value
      this.handleOpenDrawer()
    }
  }

  /**
   * Hàm kiểm tra danh sách công việc có đang select items không?
   */
  onGetPopupAction(value: boolean){
    this.isShowPopUpSelection = value;
  }


ngOnDestroy(): void {
  this.destroy$.next()
  this.destroy$.complete()
}



}
