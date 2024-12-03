import { HriDecisionApiService } from './../../services/hri-decision-api.service';
// import { listTaskTest } from './../../dto/DTOHRDecisionTask.dto';
import { Component, Input, OnDestroy, OnInit, Type } from '@angular/core';
import { DTOConfig, Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOHRPetitionMaster } from '../../dto/DTOHRPetitionMaster.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { takeUntil } from 'rxjs/operators';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import {
  CompositeFilterDescriptor,
  distinct,
  FilterDescriptor,
  isCompositeFilterDescriptor,
  State,
} from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { DTOHRDecisionTask } from '../../dto/DTOHRDecisionTask.dto';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { DTOHRDecisionMaster } from '../../dto/DTOHRDecisionMaster.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOEmployee } from '../../dto/DTOEmployee.dto';
import { DTOListHR, DTOPersonalInfo } from '../../dto/DTOPersonalInfo.dto';
import { StaffApiService } from '../../services/staff-api.service';
import { Day } from '@progress/kendo-date-math';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { DTOHRPolicyPosition } from '../../dto/DTOHRPolicyPosition.dto';
import {
  MenuDataItem,
  ModuleDataItem,
} from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { PageChangeEvent } from '@progress/kendo-angular-treelist';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { DTOHRDecisionTaskLog } from '../../dto/DTOHRDecisionTaskLog.dto';

@Component({
  selector: 'app-hr-offboard-decision-detail',
  templateUrl: './hr-offboard-decision-detail.component.html',
  styleUrls: ['./hr-offboard-decision-detail.component.scss'],
})
/**
 * Component dùng chung cho page Quyết định nghỉ việc, sa thải và Đề nghị nghỉ việc
 */
export class HrOffboardDecisionDetailComponent implements OnInit, OnDestroy {
  @Input({ required: true }) TypeData = 5;

  isFilterDisable: boolean = false;
  isAddNew: boolean = false;
  isLockAll: boolean = false;
  isDeleteDecisionDialogShow: boolean = false;
  isConfirmApproveDialogShow: boolean = false;
  isInformationBlockLoading: boolean = false;
  isPetition: boolean = false;
  arrBtnStatus: {
    text: string;
    class: string;
    code: string;
    link?: any;
    type?: string;
  }[] = [];
  errorOccurred: any = {};
  disabledDates: Day[] = [Day.Sunday];

  oldStaffID: string = '';
  petition: DTOHRPetitionMaster = new DTOHRPetitionMaster();
  decision: DTOHRDecisionMaster = new DTOHRDecisionMaster();

  pickFileCallback: Function;
  GetFolderCallback: Function;

  //#region Resignation
  listResignReason: DTOListHR[];
  curReason: DTOListHR = new DTOListHR();
  curSentDate: Date;
  JoinDate: Date;

  //#endregion

  //#region DRAWER
  isOpenDrawer: boolean = false;
  isAddNewProfile: boolean = false;
  isShowAll: boolean = false;
  isEdit: boolean = false;
  isSeeDetail: boolean = false;
  taskItem: DTOHRDecisionTask = new DTOHRDecisionTask();
  listAssignee: DTOListHR[];
  listApprover: DTOHRPolicyPosition[];
  listApprover2: DTOHRPolicyPosition[];
  curTypeAssignee: DTOListHR = new DTOListHR();
  curPositionApprove: DTOHRPolicyPosition = new DTOHRPolicyPosition();
  curPositionApproveStorage: DTOHRPolicyPosition = new DTOHRPolicyPosition();
  curPositionAssignee: DTOHRPolicyPosition = new DTOHRPolicyPosition();
  DataHRTaskLog: DTOHRDecisionTaskLog[]
  listStatusDropdownFitler = []

  //#endregion

  //#region Approve
  listDeclineReason: DTOListHR[];
  listStatusApprove: { Code: number; Text: string }[] = [
    { Code: 4, Text: 'Chấp nhận' },
    { Code: 5, Text: 'Từ chối' },
  ];
  approveStatus: { Code: number; Text: string } = {
    Code: 4,
    Text: 'Chấp nhận',
  };
  reasonStatus: { Code: number; Text: string } = { Code: null, Text: null };
  leaveDate: Date;
  //#endregion

  //#region GRID
  isLoading: boolean = true;
  isDeleteTaskDialogShow: boolean = false;
  gridView = new Subject<any>();
  gridData: DTOHRDecisionTask[] = [];
  page: number = 0;
  pageSize: number = 25;
  pageSizes: number[] = [25, 50, 75, 100];
  total: number = 0;
  selectedTask: DTOHRDecisionTask;
  listReqDelTask: DTOHRDecisionTask[] = [];
  // listTaskTest: DTOHRDecisionTask[] = listTaskTest;

  gridState: State = {
    skip: this.page,
    take: this.pageSize,
    sort: [{ field: 'Code', dir: 'desc' }],
    filter: { filters: [], logic: 'and' },
  };

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };

  onPageChangeCallback: Function;
  onActionDropDownClickCallback: Function;
  onSelectCallback: Function;
  onSelectedPopupBtnCallback: Function;
  getActionDropdownCallback: Function;
  getSelectionPopupCallback: Function;
  //#endregion

  //#region ENUM
  ResignationENUM: number = 4;
  TerminationENUM: number = 3;
  PetitionENUM: number = 5;
  //#endregion

  //#region Permission
  justLoaded: boolean = true;
  actionPerm: any;
  isAllowedToCreate: boolean = false;
  isAllowedToVerify: boolean = false;
  isMaster: boolean = false;
  //#endregion

  currentDate: Date = new Date();
  unsubscribe = new Subject<void>();

  constructor(
    private menuService: PS_HelperMenuService,
    private domSanititizer: DomSanitizer,
    private decisionService: HriDecisionApiService,
    private layoutService: LayoutService,
    private staffService: StaffApiService,
    private hriTransitionService: HriTransitionApiService,
    private apiServiceMar: MarNewsProductAPIService
  ) { }

  ngOnInit(): void {
    this.menuService
      .changePermission()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: DTOPermission) => {
        if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
          this.justLoaded = false;
          this.actionPerm = distinct(res.ActionPermission, 'ActionType');

          this.isMaster =
            this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          this.isAllowedToCreate =
            this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          this.isAllowedToVerify =
            this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        }
      });

    this.currentDate.setHours(0, 0, 0, 0);

    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onActionDropDownClickCallback = this.onMoreActionItemClick.bind(this);
    this.onPageChangeCallback = this.onPageChange.bind(this);

    this.pickFileCallback = this.pickFile.bind(this);
    this.GetFolderCallback = this.GetFolderWithFile.bind(this);

    this.menuService.changePermissionAPI().pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache();
        // this.setupBtnStatus();
        this.APIGetListHR(5);
        if (this.TypeData == this.TerminationENUM) {
          this.APIGetListHR(22);
        } else {
          this.APIGetListHR(19);
        }
        this.APIGetListHR(21);
        this.APIGetListHRPolicyPosition();

        this.JoinDate = new Date(
          new Date(this.petition.JoinDate).setDate(
            new Date(this.petition.JoinDate).getDate() + 1
          )
        );
      }
    })

  }

  /**
   * Hàm lấy cache
   */
  getCache() {
    if (this.TypeData == this.PetitionENUM) {
      const cacheItem = JSON.parse(localStorage.getItem('HrPetitionMaster'));
      if (Ps_UtilObjectService.hasValue(cacheItem)) {
        this.petition = cacheItem;

        if (this.petition.Code == 0) {
          this.isAddNew = true;
          this.isInformationBlockLoading = false;
        } else {
          this.isAddNew = false;
          this.APIGetHRPetitionMaster(this.petition);
          // this.loadFilter()
        }
      }
    } else {
      const cacheItem = JSON.parse(localStorage.getItem('HrDecisionMaster'));
      if (Ps_UtilObjectService.hasValue(cacheItem)) {
        this.decision = cacheItem;
        this.decision.TypeData = 3;
        if (this.decision.Code == 0) {
          this.isAddNew = true;
          this.isInformationBlockLoading = false;

        } else {
          this.isAddNew = false;
          this.APIGetHRDecisionMaster();
          // this.loadFilter()
        }
      }
    }
    if (this.TypeData != this.TerminationENUM) {
      this.loadFilter();
    }
  }

  /**
   * Hàm thiết lập các nút chức năng trên header
   */
  setupBtnStatus() {
    this.arrBtnStatus = [];
    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isMaster;

    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isMaster;

    // var status = this.petition.Status;
    this.isPetition = this.TypeData == this.PetitionENUM;
    var petitionStatus = this.petition.Status;
    //Kiểm tra ngày hiệu lực
    const canApproveAndReturn =
      Ps_UtilObjectService.getDaysLeft(
        this.currentDate,
        this.decision.EffDate
      ) > 0;

    if (this.decision.Code != 0) {
      const status = this.decision.Status;
      // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và status = 0 hoặc status = 4
      if (canCreateOrAdmin && (status === 0 || status === 4)) {
        this.arrBtnStatus.push({
          text: 'GỬI DUYỆT',
          class: 'k-button btn-hachi hachi-primary',
          code: 'redo',
          link: 1,
          type: 'status',
        });
      }

      // Push "Phê duyệt và Trả về" khi có quyền duyệt hoặc toàn quyền và status = 1 hoặc status = 3 và chưa đến ngày hiệu lực
      if (
        canVerify &&
        (status === 1 || (status === 3 && canApproveAndReturn))
      ) {
        // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và status = 1 hoặc status = 3
        this.arrBtnStatus.push({
          text: 'TRẢ VỀ',
          class: 'k-button btn-hachi hachi-warning hachi-secondary',
          code: 'undo',
          link: 4,
          type: 'status',
        });

        this.arrBtnStatus.push({
          text: 'DUYỆT ÁP DỤNG',
          class: 'k-button btn-hachi hachi-primary',
          code: 'check-outline',
          link: 2,
          type: 'status',
        });
      }

      // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và status = 2
      if (canVerify && status === 2) {
        this.arrBtnStatus.push({
          text: 'NGƯNG HIỂN THỊ',
          class: 'k-button btn-hachi hachi-warning',
          code: 'minus-outline',
          link: 3,
          type: 'status',
        });

        this.arrBtnStatus.push({
          text: '',
          class: 'k-button export-print',
          code: 'print',
          link: 6,
          type: 'export',
        });

        this.arrBtnStatus.push({
          text: '',
          class: 'k-button export-word',
          code: 'file-word',
          link: 7,
          type: 'export',
        });
      }
    }

    if (this.isPetition) {
      // Push "Gửi đơn" khi có quyền tạo hoặc toàn quyền và status = 1
      if (canCreateOrAdmin && petitionStatus === 1 && this.petition.Code != 0) {
        this.arrBtnStatus.push({
          text: 'GỬI ĐƠN',
          class: 'k-button btn-hachi hachi-primary',
          code: 'redo',
          link: 2,
          type: 'status',
        });

        this.arrBtnStatus.unshift({
          text: 'XÓA ĐƠN',
          class: 'k-button btn-hachi hachi-warning',
          code: 'trash',
          type: 'delete',
          link: 5,
        });
      }
    }

    if (canCreateOrAdmin && this.TypeData != this.ResignationENUM) {
      this.arrBtnStatus.push({
        text: 'Thêm MỚI',
        class: 'k-button btn-hachi hachi-primary',
        code: 'plus',
        type: 'add',
        link: 0,
      });
    }
  }

  onBreadCrumbClick() {
    this.getCache();
    this.loadFilter();
  }

  /**
   * Function chuyển sang trang thông tin gốc
   */
  onSeeInfoClick() {
    this.menuService.changeModuleData().pipe(takeUntil(this.unsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code == 'hriStaff')
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('hr001-staff-detail') || f.Link.includes('/hri/hr001-staff-list'))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('hr001-staff-detail') || f.Link.includes('/hri/hr001-staff-detail'))
          const Staff = new DTOEmployee()
          Staff.Code = this.petition.Staff
          localStorage.setItem('Staff', JSON.stringify(Staff));
          this.menuService.selectedMenu(detail, parent)      
          this.menuService.activeMenu(detail2)
        }

      }
    })
  }

  /**
   * Hàm xử lí sự kiện click của các btn trên header
   * @param typeBtn
   * @param codeStatus
   */
  onHeaderBtnClick(typeBtn: string, codeStatus: number) {
    // if (typeBtn == 'add') {
    //   this.onAddNew();
    // }

    if (typeBtn == 'status') {
      this.onUpdateStatus(codeStatus);
    }

    if (typeBtn == 'add') {
      if (this.TypeData == this.PetitionENUM) {
        this.onAddNewPetition();
      } else {
        this.onAddNewDecision();
      }
    }

    if (typeBtn == 'delete') {
      this.isDeleteDecisionDialogShow = true;
    }
  }

  /**
   * Hàm xử lí khi bấm thêm mới Đơn
   */
  onAddNewPetition() {
    this.isAddNew = true;
    this.isLockAll = false;
    this.petition = new DTOHRPetitionMaster();
    localStorage.setItem('HrPetitionMaster', JSON.stringify(this.petition));
    this.setupBtnStatus();
  }

  /**
   * Hàm xử lí khi bấm thêm mới quyết định
   */
  onAddNewDecision() {
    this.isAddNew = true;
    this.isLockAll = false;
    this.decision = new DTOHRDecisionMaster();
    this.petition = new DTOHRPetitionMaster();
    localStorage.setItem('HrDecisionMaster', JSON.stringify(this.decision));
    this.setupBtnStatus();
  }

  /**
   * Hàm thực hiện khi bấm thêm mới công việc
   */
  onAddNewTask() {
    this.isOpenDrawer = true;
    this.taskItem = new DTOHRDecisionTask();
    this.taskItem.OrderBy = 1;
    this.taskItem.DateDuration = 5;
    this.curPositionAssignee.Position = null;
    this.curPositionApprove.Position = null;
  }

  /**
   * Hàm xử lí khi user tiến hành filter
   * @param filterDescriptor
   */
  onFilterChange(filterDescriptor: any) {
    this.page = 0;
    this.gridState.skip = 0;
    this.gridState.filter.filters = [];
    if (filterDescriptor.filters[0]?.value != '') {
      this.gridState.filter.filters = [filterDescriptor];
    }
    this.loadFilter();
  }

  /**
   * Hàm xử li load filter cho grid
   */
  loadFilter() {
    //Kiểm tra nếu như filter descriptor đã tồn tại
    const containedDescriptor = this.gridState.filter.filters.findIndex(
      (v: FilterDescriptor | CompositeFilterDescriptor) => {
        return !isCompositeFilterDescriptor(v) && v.field === 'Petition';
      }
    );

    if (containedDescriptor == -1 && !this.isAddNew) {
      this.gridState.filter.filters.push({
        field: 'TypeData',
        operator: 'eq',
        value: 4,
      });
      this.gridState.filter.filters.push({
        field: 'Petition',
        operator: 'eq',
        value: this.petition.Code,
      });
    }

    this.APIGetListHRDecisionTask();
  }

  /**
   * Hàm xử lí đóng mở drawer
   * @param isOpen
   */
  onToggleDrawer(isOpen = true) {
    this.isOpenDrawer = isOpen;
  }

  /**
   * Hàm xử lí chức năng cho các nút trên drawer
   * @param typeBtn
   */
  onDrawerBtnClick(typeBtn: string) {
    if (typeBtn == 'delete') {
      this.isDeleteTaskDialogShow = true;
    } else {
      // this.taskItem.ListOfTypeStaff = '[' + this.curTypeAssignee.OrderBy + ']';
      if (
        this.curPositionAssignee.Position == -1 ||
        !Ps_UtilObjectService.hasValue(this.curPositionAssignee.Position)
      ) {
        this.taskItem.TypeAssignee = 2;
      } else {
        this.taskItem.PositionAssignee = this.curPositionAssignee.Position;
      }
      this.taskItem.PositionApproved = this.curPositionApprove.Position;
      this.taskItem.TypeData = 4;
      if (this.onRequiredFieldCheck(this.taskItem, false, 2)) {
        this.APIUpdateHRDecisionTask(this.taskItem);
      }
    }
  }



  /**
   * Hàm xử update trạng thái quyết định
   * @param status
   */
  onUpdateStatus(status: number) {
    //Nếu các trường bắt buộc đủ thông tin thì gọi API
    const tempPetition = JSON.parse(JSON.stringify(this.petition));
    if (this.TypeData == this.PetitionENUM) {
      tempPetition.Status = status;
      if (status == 4) {
        if (this.onRequiredFieldCheck(tempPetition, false, 1)) {
          this.APIUpdateHRPetitonMaster(tempPetition, [
            'LeaveDateApproved',
            'ReasonStatusDescription',
            'Status',
            'SentDate',
          ]);
        }
      } else {
        if (this.onRequiredFieldCheck(tempPetition)) {
          this.APIUpdateHRPetitonMaster(tempPetition, [
            'Status',
            // 'ReasonStatusDescription',
            // 'ReasonStatus',
            'SentDate',
          ]);
        }
      }
    } else {
      const tempDecision = JSON.parse(JSON.stringify(this.decision));
      tempDecision.Status = status;
      if (this.onRequiredFieldCheck(tempPetition, false, 3)) {
        if (status == 2) {
          this.isConfirmApproveDialogShow = true;
        } else {
          this.APIUpdateHRDecisionMasterStatus([this.decision], status);
        }
      }
    }
  }

  /**
   * Hàm dùng để check các trường bắt buộc của quyết định
   * @param isSkipMsg bỏ qua thông báo mặc định là false
   * @returns true | false
   */
  onRequiredFieldCheck(
    value: any,
    isSkipMsg: boolean = false,
    typeReq: number = 0
  ) {
    const type = this.TypeData == this.PetitionENUM ? 'đề nghị' : 'quyết định';
    let msgStr = `Đã xảy ra lỗi khi cập nhật trạng thái ${type}: thiếu `;
    if (typeReq == 0) {
      if (this.TypeData == this.PetitionENUM) {
        if (!Ps_UtilObjectService.hasValueString(value.StaffID)) {
          if (!isSkipMsg) {
            this.layoutService.onError(msgStr + 'Thông tin nhân sự');
          }
          return false;
        } else if (!Ps_UtilObjectService.hasValueString(value.LeaveDate)) {
          if (!isSkipMsg) {
            this.layoutService.onError(msgStr + 'Ngày dự kiến nghỉ việc');
          }
          return false;
        } else if (!Ps_UtilObjectService.hasValueString(value.ReasonName)) {
          if (!isSkipMsg) {
            this.layoutService.onError(msgStr + 'Lý do nghỉ việc');
          }
          return false;
        } else if (
          !Ps_UtilObjectService.hasValueString(value.ReasonDescription)
        ) {
          if (!isSkipMsg) {
            this.layoutService.onError(
              msgStr + `Mô tả chi tiết lý do nghỉ việc`
            );
          }
          return false;
        }
      }
    } else if (typeReq == 1) {
      if (this.TypeData == this.PetitionENUM) {
        if (
          !Ps_UtilObjectService.hasValueString(value.LeaveDateApproved) &&
          value.Status == 4
        ) {
          if (!isSkipMsg) {
            this.layoutService.onError(
              msgStr + 'Ngày nghỉ việc được phê duyệt'
            );
          }
          return false;
        } else if (
          !Ps_UtilObjectService.hasValueString(value.ReasonStatusDescription) &&
          value.Status == 4
        ) {
          if (!isSkipMsg) {
            this.layoutService.onError(msgStr + 'Điều kiện nghỉ việc');
          }
          return false;
        }
      }
    } else if (typeReq == 2) {
      if (!Ps_UtilObjectService.hasValueString(value.TaskName)) {
        if (!isSkipMsg) {
          this.layoutService.onError(msgStr + 'Tên công việc');
        }
        return false;
      } else if (
        !Ps_UtilObjectService.hasValue(value.PositionAssignee) &&
        value.TypeAssignee != 2
      ) {
        if (!isSkipMsg) {
          this.layoutService.onError(msgStr + 'Thực hiện bởi');
        }
        return false;
      } else if (!Ps_UtilObjectService.hasValue(value.DateDuration)) {
        if (!isSkipMsg) {
          this.layoutService.onError(msgStr + 'Thời gian hoàn tất');
        }
        return false;
      }
      else if (!Ps_UtilObjectService.hasValue(value.PositionApproved)) {
        if (!isSkipMsg) {
          this.layoutService.onError(msgStr + 'Duyệt bởi');
        }
        return false;
      }
    } else if (typeReq == 3) {
      if (!Ps_UtilObjectService.hasValueString(value.StaffID)) {
        if (!isSkipMsg) {
          this.layoutService.onError(msgStr + 'Thông tin nhân sự');
        }
        return false;
      } else if (!Ps_UtilObjectService.hasValueString(this.decision.EffDate)) {
        if (!isSkipMsg) {
          this.layoutService.onError(msgStr + `Mô tả chi tiết lý do nghỉ việc`);
        }
        return false;
      } else if (!Ps_UtilObjectService.hasValueString(value.Reason)) {
        if (!isSkipMsg) {
          this.layoutService.onError(msgStr + 'Lý do sa thải');
        }
        return false;
      } else if (
        !Ps_UtilObjectService.hasValueString(value.ReasonDescription)
      ) {
        if (!isSkipMsg) {
          this.layoutService.onError(msgStr + 'Mô tả chi tiết lý do sa thải');
        }
        return false;
      }
    }
    return true;
  }

  /**
   * Hàm xử lí lấy ảnh bắt các lỗi có thể xảy ra
   * @param str
   * @param imageKey
   * @returns
   */
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
  handleError(imageKey: string) {
    this.errorOccurred[imageKey] = true;
  }

  /**
   * Hàm lấy ảnh từ nguồn hachi
   * @param str
   * @returns
   */
  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }

  /**
   * Hàm dùng để set style theo đúng nội dung text
   * @param name name of assignee
   */
  onCheckAssigneeBy(name: string): string {
    if (name === 'Hệ thống') {
      return 'font-style: italic;';
    }
    if (name === 'Nhân sự áp dụng') {
      return 'font-weight: 600;';
    }
  }

  /**
   * HÀM XỬ LÝ CHECKBOX Trưởng đơn vị, Q.lý điểm làm việc
   * @param taskItem CONG  VIEC
   */

  onCheckedLeader(taskItem: DTOHRDecisionTask) {
    let defaultValue: DTOHRPolicyPosition = {
      Code: null,
      PositionName: '-- Chọn --',
      PositionID: null,
      Position: null,
      IsLeader: null,
      IsSupervivor: null,
      DepartmentName: null,
      TypeData: null,
      StatusName: null,
      ListLocation: null,
      ListException: [],
    };
    taskItem.IsLeaderMonitor = !taskItem.IsLeaderMonitor;
    if (taskItem.IsLeaderMonitor) {
      this.curPositionApprove = { ...defaultValue };
    } else {
      this.curPositionApprove = this.curPositionApproveStorage;
    }
  }

  /**
   * Hàm chung xử lí khi giá trị thay đổi
   * @param props properties
   * @param TypeValueChange phân loại
   * @param value giá trị
   */
  onValueChanged(props: string[], TypeValueChange: number = 0, value?: any) {
    props.push('SentDate');

    if (TypeValueChange == 0) {
      if (this.isAddNew) {
        this.petition.TypeData = 1; //Nghỉ việc
        this.petition.IsSelf = false;
        this.petition.SentDate = this.currentDate.toString();
        this.curSentDate = new Date(
          new Date().setDate(new Date().getDate() + 1)
        );
        this.petition.LeaveDate = new Date(
          new Date(this.petition.SentDate).setDate(
            new Date(this.petition.SentDate).getDate() + 30
          )
        ).toString();
        props.push('Code');
        props.push('TypeData');
        props.push('IsSelf');
        props.push('Status');
        props.push('Staff');
        props.push('SentDate');
        props.push('LeaveDate');
      }

      if (props[0] == 'StaffID') {
        const employee = new DTOEmployee();
        employee.StaffID = this.petition.StaffID;
        this.APIGetHREmployeeByID(employee, props);
      } else if (props[0] == 'SentDate') {
        this.petition.SentDate = value;
        const sentDate = new Date(this.petition.SentDate);
        const leaveDate = new Date(this.petition.LeaveDate);

        if (Ps_UtilObjectService.getDaysLeft(sentDate, leaveDate) > 0) {
          this.APIUpdateHRPetitonMaster(this.petition, props);
        } else {
          props.push('LeaveDate');
          this.petition.LeaveDate = new Date(
            new Date(this.petition.SentDate).setDate(
              new Date(this.petition.SentDate).getDate() + 30
            )
          ).toString();
          this.APIUpdateHRPetitonMaster(this.petition, props);
        }
      } else if (
        props[0] == 'ReasonStatusDescription' ||
        props[0] == 'ReasonStatus' ||
        props[0] == 'LeaveDateApproved'
      ) {
        if (props[0] == 'ReasonStatusDescription') {
          this.petition[props[0]] = value;
          this.layoutService.onSuccess("Cập nhật điều kiện nghỉ việc thành công. ")
        }
      } else {
        this.APIUpdateHRPetitonMaster(this.petition, props);
      }
    }

    if (TypeValueChange == 1) {
      if (props[0] == 'approveStatus') {
        if (this.approveStatus.Code != value?.Code) {
          this.petition.ReasonStatusDescription = '';
        }
        this.approveStatus.Code = value?.Code;
        if (this.approveStatus.Code == 4) {
          this.loadFilter();
        }
      } else if (props[0] == 'ReasonStatus') {
        this.reasonStatus.Code = value?.Code;
      } else {
        this.petition[props[0]] = value?.Code;
        this.APIUpdateHRPetitonMaster(this.petition, props);
      }
    }

    if (TypeValueChange == 2) {
      this[props[0]] = value;
      this.curPositionApproveStorage = value;
    }

    if (TypeValueChange == 3) {
      this.APIUpdateHRDecisionMaster(this.decision, props);
    }
  }

  //#region GRID
  /**
   * Hàm lấy các action khi user nhấn nút more action
   * @param moreActionDropdown
   * @param dataItem
   * @returns
   */
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    moreActionDropdown = [];
    var status = this.petition.Status;
    this.taskItem = JSON.parse(JSON.stringify(dataItem));

    if (status == 2 && (this.isAllowedToVerify || this.isMaster)) {
      moreActionDropdown.push({
        Name: 'Chỉnh sửa',
        Code: 'pencil',
        Type: 'edit',
        Actived: true,
      });
      moreActionDropdown.push({
        Name: 'Xóa công việc',
        Code: 'trash',
        Type: 'delete',
        Actived: true,
      });
    } else {
      moreActionDropdown.push({
        Name: 'Xem chi tiết',
        Code: 'eye',
        Type: 'detail',
        Actived: true,
      });
    }
    return moreActionDropdown;
  }

  /**
   * Hàm đổi màu chữ và icon nếu quá hạn
   */
  getColorExpired(endDate: string): string {
    return this.currentDate > new Date(endDate) ? 'rgba(235, 39, 58, 1)' : 'black';
}

  /**
   * Hàm đổi trả về true nếu task bị quá hạn
   */
  getExpired(endDate: string): boolean {
    if(this.currentDate > new Date(endDate)){
      return true;
    }
    return false;
  }

  /**
   * Hàm xử lí action được chọn trên popup
   * @param menu menu action đã nhấn
   * @param item chính sách được chọn
   */
  onMoreActionItemClick(menu: MenuDataItem, item: any) {
    this.taskItem = item;
    if (
      menu.Link == 'edit' ||
      menu.Code == 'pencil' ||
      menu.Code == 'eye' ||
      menu.Link == 'detail'
    ) {
      if (menu.Code == 'pencil') {
        this.isEdit = true;
      } else if (menu.Code == 'eye') {
        this.isSeeDetail = true;
      }
      this.isOpenDrawer = true;
      this.isShowAll = true;

      if (this.taskItem.TypeAssignee == 3) {
        this.curPositionAssignee.Position = -1;
      } else {
        this.curPositionAssignee.Position = this.taskItem.PositionAssignee;
      }
      this.curPositionApprove.Position = this.taskItem.PositionApproved;
    } else if (menu.Link == 'delete' || menu.Code == 'trash') {
      this.isDeleteTaskDialogShow = true;
    }
  }

  onActionTask(action: string, data: DTOHRDecisionTask, status?: number){
    this.taskItem = data;
    if(action == 'see'){
      this.isSeeDetail = true;
    }
    if( action == 'edit'){
      this.isEdit = true;
    }
    
    if(action == 'trash'){
      this.isDeleteTaskDialogShow = true;
      return
    }

    this.isOpenDrawer = true;
  }

  /**
   * Get action dropdown status drawer
   */
  listStatusDropdown = [
    { Status: 1, StatusName: 'Chưa thực hiện' },
    { Status: 2, StatusName: 'Không thực hiện' },
    { Status: 3, StatusName: 'Đang thực hiện' },
    { Status: 4, StatusName: 'Chờ duyệt' },
    { Status: 5, StatusName: 'Ngưng thực hiện' },
    { Status: 6, StatusName: 'Hoàn tất' }
  ];
  onGetStatusDropdown() {
    this.listStatusDropdownFitler = [];
    if (Ps_UtilObjectService.hasValue(this.petition.Status)) {
      const TaskStatus = this.taskItem.ListHRDecisionTaskLog[0].Status;
  
      switch (TaskStatus) {
        case 1: // Chưa thực hiện
          this.listStatusDropdownFitler = this.listStatusDropdown.filter(
            status => status.Status === 1 || status.Status === 2
          );
          break;
  
        case 2: // Không thực hiện
          if (this.petition.Status !== 4) {
            this.listStatusDropdownFitler = this.listStatusDropdown.filter(
              status => status.Status === 2 || status.Status === 1
            );
          } else {
            this.listStatusDropdownFitler = this.listStatusDropdown.filter(
              status => status.Status === 2 || status.Status === 3
            );
          }
          break;
  
        case 3: // Đang thực hiện
          this.listStatusDropdownFitler = this.listStatusDropdown.filter(
            status => status.Status === 3 || status.Status === 5 || status.Status === 4
          );
          break;
  
        case 4: // Chờ duyệt
          this.listStatusDropdownFitler = this.listStatusDropdown.filter(
            status => status.Status === 4 || status.Status === 6
          );
          break;
  
        case 5: // Ngưng thực hiện
          this.listStatusDropdownFitler = this.listStatusDropdown.filter(
            status => status.Status === 3 || status.Status === 5 || status.Status === 6
          );
          break;
  
        case 6: // Hoàn tất
          this.listStatusDropdownFitler = this.listStatusDropdown.filter(
            status => status.Status === 6
          );
          break;
  
        default:
          this.listStatusDropdownFitler = [];
          break;
      }
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

    this.APIGetListHRDecisionTask();
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

  /**
   * Hàm xử lí hiển thị popup folder
   */
  onUploadImg() {
    this.layoutService.folderDialogOpened = true;
  }

  /**
   * Hàm xử lí khi người dùng chọn file hình ảnh cho texteditor
   * @param e
   * @param width
   * @param height
   */
  pickFile(e: DTOCFFile, width, height) {
    this.layoutService.getEditor().embedImgURL(e, width, height);
    this.layoutService.setFolderDialog(false);
  }

  /**
   * Hàm lấy ảnh từ component app folder với folder bài viết chính sách
   * @param childPath
   * @returns
   */
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog()) {
      return this.apiServiceMar.GetFolderWithFile(childPath, 17);
    }
    //17 = folder bài viết chính sách
  }

  /**
   * Hàm xử lý đóng, mở dialog
   * @param value 
   */
  toggleDialog(value: number) {
    if (value == 0) {
      this.isDeleteDecisionDialogShow = !this.isDeleteDecisionDialogShow;
    } else if (value == 1) {
      this.isConfirmApproveDialogShow = !this.isConfirmApproveDialogShow;
    } else if (value == 2) {
      this.isDeleteTaskDialogShow = !this.isDeleteTaskDialogShow;
    }
  }

  /**
   * Hàm xử lý khi dialog được confirm đồng ý
   * @param value 
   */
  onDiaglogConfirm(value: number) {
    let listItemTask: DTOHRDecisionTask[] = [];
    if (value == 0) {
      if(this.isPetition){
        this.APIDeleteHRPetition(this.petition);
      } else{
        this.APIDeleteHRDecisionMaster([this.decision]);
      }
    } else if (value == 1) {
      this.APIUpdateHRDecisionMasterStatus([this.decision], 2);
    } else if (value == 2) {
      listItemTask.push(this.taskItem);
      this.APIDeleteHRDecisionTask(listItemTask);
    }
  }

  //#endregion

  //#region API

  /**
   * API Lấy danh sách công việc
   */
  APIGetListHRDecisionTask() {
    this.isLoading = true;
    this.isInformationBlockLoading = true;
    this.decisionService
      .GetListHRDecisionTask(this.gridState)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.isInformationBlockLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            res.StatusCode == 0
          ) {
            // this.gridData = this.listTaskTest;
            this.gridData = res.ObjectReturn.Data;
            this.total = res.ObjectReturn.Total;
            if (this.gridData.length <= 0 && this.total != 0) {
              this.page -= 1;
              this.gridState.skip -= 1;
              this.APIGetListHRDecisionTask();
            }
            this.gridView.next({ data: this.gridData, total: this.total });
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách công việc: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.isLoading = false;
          this.isInformationBlockLoading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công việc: ${err}`);
        }
      );
  }

  /**
   * API Lấy đơn xin nghỉ việc
   * @param dto DTOHRPetitionMaster
   */
  APIGetHRPetitionMaster(dto: DTOHRPetitionMaster) {
    this.isInformationBlockLoading = true;
    this.decisionService
      .GetHRPetitionMaster(dto)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isInformationBlockLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            res.StatusCode == 0
          ) {
            this.petition = res.ObjectReturn;
            this.oldStaffID = this.petition.StaffID;
            this.curReason.Code = this.petition.Reason;
            this.curReason.ListName = this.petition.ReasonName;
            this.reasonStatus.Code = this.petition.ReasonStatus;
            this.reasonStatus.Text = this.petition.ReasonStatusName;
            if (this.petition.Status == 4 || this.petition.Status == 5) {
              const approveObj: { Code: number; Text: string } = {
                Code: this.petition.Status,
                Text: this.petition.StatusName,
              };
              this.approveStatus = approveObj;
            }
            this.curSentDate = new Date(
              new Date(this.petition.SentDate).setDate(
                new Date(this.petition.SentDate).getDate() + 1
              )
            );
            this.curSentDate.setHours(0, 0, 0, 0);

            this.leaveDate = new Date(this.petition.LeaveDate);
            this.setupBtnStatus()
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy đơn xin nghỉ việc: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.isInformationBlockLoading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy đơn xin nghỉ việc: ${err}`);
        }
      );
  }

  /**
   * API lấy thông tin hồ sơ bằng ID
   * @param DTOPersonalInfo
   */
  APIGetHREmployeeByID(DTOEmployee: DTOEmployee, props: string[]) {
    this.isInformationBlockLoading = true;
    this.decisionService
      .GetHREmployeeByID(DTOEmployee)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isInformationBlockLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            const employee = res.ObjectReturn;
            this.petition.FullName = employee.FullName;
            this.petition.ImageThumb = employee.ImageThumb;
            this.petition.GenderName = employee.GenderName;
            this.petition.BirthDate = employee.BirthDate;
            this.petition.DepartmentName = employee.DepartmentName;
            this.petition.PositionName = employee.CurrentPositionName;
            this.petition.LocationName = employee.LocationName;
            this.petition.JoinDate = employee.JoinDate;
            this.petition.TypeStaffName = employee.TypeDataName;
            this.petition.Staff = employee.Code;
            this.petition.StaffID = employee.StaffID;
            if (Ps_UtilObjectService.hasValueString(this.petition.FullName)) {
              this.APIUpdateHRPetitonMaster(this.petition, props);
            }
            this.isShowAll = true;
          } else {
            this.isInformationBlockLoading = false;
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy thông tin cá nhân: ` + res.ErrorString
            );
            this.petition.StaffID = this.oldStaffID;
            this.isShowAll = false;
          }
        },
        (err) => {
          this.isInformationBlockLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy thông tin cá nhân: ${err}`
          );
          this.petition.StaffID = this.oldStaffID;
          this.isShowAll = false;
        }
      );
  }

  /**
   * API lấy danh sách cho dropdown theo ENUM
   */
  APIGetListHR(typeData: number) {
    this.staffService
      .GetListHR(typeData)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            if (typeData == 19 || typeData == 22) {
              this.listResignReason = res.ObjectReturn;
            }
            if (typeData == 21) {
              this.listDeclineReason = res.ObjectReturn;
            }
            if (typeData == 5) {
              this.listAssignee = res.ObjectReturn;
              this.curTypeAssignee.OrderBy = this.listAssignee.find(
                (item) => item.Code == 12
              ).OrderBy;
            }
          } else {
            this.layoutService.onError(
              'Đã xảy ra lỗi khi lấy danh sách loại nhân sự: ' + res.ErrorString
            );
          }
        },
        (err) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách loại nhân sự: ${err}`
          );
        }
      );
  }

  /**
   * API cập nhật thông tin đề nghị
   * @param DTOPetition Đề nghị cần update
   * @param Properties Props cần update
   */
  APIUpdateHRPetitonMaster(
    DTOPetition: DTOHRPetitionMaster,
    Properties: string[]
  ) {
    const TypeUpdate = DTOPetition.Code == 0 ? 'Thêm mới' : 'Cập nhật';
    const ctx =
      this.TypeData == this.PetitionENUM ? 'Quyết định' : 'Quyết định';

    this.decisionService
      .UpdateHRPetitionMaster(DTOPetition, Properties)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.petition = res.ObjectReturn;
            this.oldStaffID = this.petition.StaffID;

            this.JoinDate = new Date(
              new Date(this.petition.JoinDate).setDate(
                new Date(this.petition.JoinDate).getDate() + 1
              )
            );
            this.curSentDate = new Date(
              new Date(this.petition.SentDate).setDate(
                new Date(this.petition.SentDate).getDate() + 1
              )
            );
            this.curSentDate.setHours(0, 0, 0, 0);
            if (this.isAddNew || DTOPetition.Code == 0) {
              this.curReason = null;
            }
            if (this.TypeData == this.TerminationENUM) {
              this.decision.Petition = this.petition.Code;
              this.decision.TypeData = this.TypeData;
              const tempProps = [];
              if (this.isAddNew) {
                tempProps.push('Code');
                tempProps.push('TypeData');
                tempProps.push('EffDate');
                tempProps.push('Petition');
                this.APIUpdateHRDecisionMaster(this.decision, tempProps);
              }
            }
            this.isAddNew = false;
            localStorage.setItem(
              'HrPetitionMaster',
              JSON.stringify(this.petition)
            );

            this.setupBtnStatus();

            this.layoutService.onSuccess(`${TypeUpdate} ${ctx}  thành công`);
          } else {
            if (this.TypeData != this.TerminationENUM) {
              this.layoutService.onError(
                `Đã xảy ra lỗi khi ${TypeUpdate} ${ctx}: ` + res.ErrorString
              );
            }
          }
        },
        (err) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi ${TypeUpdate} đề nghị: ${err}`
          );
        }
      );
  }

  /**
   * API lấy quyết định
   */
  APIGetHRDecisionMaster() {
    this.isInformationBlockLoading = true;
    const apiText =
      this.TypeData == this.TerminationENUM ? 'sa thải' : 'nghỉ việc';
    this.decisionService
      .GetHRDecisionMaster(this.decision)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isInformationBlockLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.decision = res.ObjectReturn;
            localStorage.setItem(
              'HrDecisionMaster',
              JSON.stringify(this.decision)
            );
            const status = this.decision.Status;
            if (
              ((status == 0 || status == 4) &&
                (this.isAllowedToCreate || this.isMaster)) ||
              (status == 1 && (this.isAllowedToVerify || this.isMaster))
            ) {
              this.isLockAll = false;
            } else {
              this.isLockAll = true;
            }

            this.setupBtnStatus();
            const tempPetition = new DTOHRPetitionMaster();
            tempPetition.Code = this.decision.Petition;
            tempPetition.LeaveDate = '';
            tempPetition.LeaveDateApproved = '';
            this.APIGetHRPetitionMaster(tempPetition);
          } else {
            this.layoutService.onError(
              'Đã xảy ra lỗi khi lấy thông tin quyết định ${apiText}: ' +
              res.ErrorString
            );
          }
        },
        (err) => {
          this.isInformationBlockLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy thông tin quyết định ${apiText}: ${err}`
          );
        }
      );
  }

  /**
   * API cập nhật thông tin quyết định
   * @param DTODecision Quyết định cần update
   * @param Properties Props cần update
   */
  APIUpdateHRDecisionMaster(
    DTODecision: DTOHRDecisionMaster,
    Properties: string[]
  ) {
    const TypeUpdate =
      DTODecision.Code == 0 ? 'Thêm mới' : 'Cập nhật thông tin';
    const apiText = 'sa thải';

    if (DTODecision.Code == 0) {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      DTODecision.EffDate = date.toISOString();
    }

    this.decisionService
      .UpdateHRDecisionMaster(DTODecision, Properties)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.decision = res.ObjectReturn;
            this.isAddNew = false;
            localStorage.setItem(
              'HrDecisionMaster',
              JSON.stringify(this.decision)
            );
            this.setupBtnStatus();
            this.layoutService.onSuccess(
              `${TypeUpdate} quyết định ${apiText} thành công`
            );
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi ${TypeUpdate} quyết định ${apiText}: ` +
              res.ErrorString
            );
          }
        },
        (err) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi ${TypeUpdate} quyết định ${apiText}: ${err}`
          );
        }
      );
  }

  /**
   * API cập nhật trạng thái quyết định
   * @param listDTODecision danh sách quyết định cần update
   * @param reqStatus Status cần update
   */
  APIUpdateHRDecisionMasterStatus(
    listDTODecision: DTOHRDecisionMaster[],
    reqStatus: number
  ) {
    const apiText =
      this.TypeData == this.TerminationENUM ? 'sa thải' : 'nghỉ việc';
    this.decisionService
      .UpdateHRDecisionMasterStatus(listDTODecision, reqStatus)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isConfirmApproveDialogShow = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(
              `Cập nhật trạng thái quyết định ${apiText} thành công`
            );
            this.APIGetHRDecisionMaster();
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật trạng thái quyết định ${apiText}: ` +
              res.ErrorString
            );
          }
        },
        (err) => {
          this.isConfirmApproveDialogShow = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật trạng thái quyết định ${apiText}: ${err}`
          );
        }
      );
  }

  /**
   * API lấy danh sách chức danh
   */
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
            const tempList = [
              {
                PositionName: 'Nhân sự áp dụng',
                Position: -1,
              },
            ];
            this.listApprover = [...tempList, ...res.ObjectReturn];
            this.listApprover2 = res.ObjectReturn;
          }
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách chức danh: ${error}`
          );
        }
      );
  }

  /**
   * API cập nhật thông tin công việc
   * @param DTOHRDecisionTask công việc cần update
   */
  APIUpdateHRDecisionTask(DTOHRDecisionTask: DTOHRDecisionTask) {
    const TypeUpdate = DTOHRDecisionTask.Code == 0 ? 'Thêm mới' : 'Cập nhật';
    DTOHRDecisionTask.Petition = this.petition.Code;
    this.decisionService
      .UpdateHRDecisionTask(DTOHRDecisionTask)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.taskItem = res.ObjectReturn;
            this.layoutService.onSuccess(`${TypeUpdate} công việc thành công`);
            this.loadFilter();
            this.onToggleDrawer(false);
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi ${TypeUpdate} công việc: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi ${TypeUpdate} công việc: ${err}`
          );
        }
      );
  }

  /**
   * API xoá công việc
   * @param DTOHRDecisionTask công việc cần xoá
   */
  APIDeleteHRDecisionTask(ListDTo: DTOHRDecisionTask[]) {
    this.isDeleteTaskDialogShow = false;
    this.decisionService
      .DeleteHRDecisionTask(ListDTo)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(`Xoá công việc thành công`);
            this.APIGetListHRDecisionTask();
            this.onToggleDrawer(false);
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi xoá công việc: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi xoá công việc: ${err}`);
        }
      );
  }

  /**
   * API Xoá quyết định
   * @param listDTODecision
   */
  APIDeleteHRDecisionMaster(listDTODecision: DTOHRDecisionMaster[]) {
    this.isDeleteDecisionDialogShow = false;
    this.decisionService
      .DeleteHRDecisionMaster(listDTODecision)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isDeleteDecisionDialogShow = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(`Xoá quyết định thành công`);
            this.onAddNewDecision();
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi xoá quyết định: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.isDeleteDecisionDialogShow = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi xoá quyết định: ${err}`
          );
        }
      );
  }

  /**
   * API xóa đơn đề nghị
   * @param DTOHRPetitionMaster đơn đề nghị cần xóa
   */
  APIDeleteHRPetition(DTOHRPetitionMaster: DTOHRPetitionMaster) {
    this.isDeleteDecisionDialogShow = false;
    this.decisionService
      .DeleteHRPetition(DTOHRPetitionMaster)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          this.isDeleteDecisionDialogShow = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(`Xoá đơn đề nghị thành công`);
            this.onAddNewDecision();
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi xoá đơn đề nghị: ` + res.ErrorString
            );
          }
        },
        (err) => {
          this.isDeleteDecisionDialogShow = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi xoá đơn đề nghị: ${err}`
          );
        }
      );
  }


  //#endregion

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
