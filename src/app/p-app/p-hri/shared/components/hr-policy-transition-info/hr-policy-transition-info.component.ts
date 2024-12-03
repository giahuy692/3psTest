import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DTOHRPolicyDepartment } from '../../dto/DTOHRPolicyDepartment.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOListHR } from '../../dto/DTOPersonalInfo.dto';
import { StaffApiService } from '../../services/staff-api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOHRPolicyMaster } from '../../dto/DTOHRPolicyMaster.dto';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { distinct } from '@progress/kendo-data-query';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';

@Component({
  selector: 'app-hr-policy-transition-info',
  templateUrl: './hr-policy-transition-info.component.html',
  styleUrls: ['./hr-policy-transition-info.component.scss'],
})
export class HrPolicyTransitionInfoComponent
  implements OnInit, OnDestroy, OnChanges {
  /***
   * typeHrPolicy = 0 onboard
   * typeHrPolicy = 1 offboard
   */
  @Input() typeHrPolicy: number = 0;
  @Input() isShow: boolean = true;
  @Input() data: DTOHRPolicyMaster;
  @Input() dataPosition: DTOHRPolicyDepartment[];
  @Output() hrChange: EventEmitter<void> = new EventEmitter<void>();
  @Output() created: EventEmitter<any> = new EventEmitter<any>();
  @Output() dateChange: EventEmitter<void> = new EventEmitter<void>();
  @Output() openedDropdownApply: EventEmitter<void> = new EventEmitter<void>();
  @Input() numOfTask: number = 0
  @Input() loadData: boolean = false

  dataHrPolicyMaster = new DTOHRPolicyMaster();

  isLoading: boolean = false

  // loading: boolean = false;
  destroy$ = new Subject<void>();

  //Danh sách phạm vi áp dụng
  listHR: DTOListHR[] = [];
  status: number = 1;

  //Value mã chính giá
  idPolicy: string = '';
  tempIDPolicy: string = '';

  //value mô tả
  descriptionPolicy: string = '';
  tempDescriptionPolicy: string = '';

  //value tên chính sách
  namePolicy: string = '';
  tempNamePolicy: string = '';

  //value current date
  dateValue: Date;
  tempDateValue: string;
  currentDate: Date = new Date();

  //value phạm vi áp dụng
  typeApply: any = { OrderBy: 1 };

  //Nhận biết có phải add hay không
  isAdd: boolean = true;

  isShowPopComfirm: boolean = false;

  tempHrApply: DTOHRPolicyDepartment;

  justLoaded: boolean = true;
  actionPerm: DTOActionPermission[] = [];
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false;

  constructor(
    private staffService: StaffApiService,
    private layoutService: LayoutService,
    private hriTransitionService: HriTransitionApiService,
    public menuService: PS_HelperMenuService
  ) { }

  //#region LifeCycle
  ngOnInit(): void {
    /**
     * Bắt phân quyền hệ thống
     */
    this.menuService
      .changePermission()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: DTOPermission) => {
        if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
          this.justLoaded = false;
          this.actionPerm = distinct(res.ActionPermission, 'ActionType');
          //action permission
          this.isMaster =
            this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          this.isCreator =
            this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          this.isApprover =
            this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
          this.isAllowedToViewOnly =
            this.actionPerm.findIndex((s) => s.ActionType == 6) > -1 &&
            !Ps_UtilObjectService.hasListValue(
              this.actionPerm.filter((s) => s.ActionType != 6)
            );
        }
      });

    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        //Lấy danh sách Phạm vi áp dụng
        this.APIGetListHR(17);
        //Kiểm tra xem có phải data mới hay không
        this.handleCheckIsAdd(this.data);
        //Hàm set giá trị nếu không phải thêm mới và set mặc định type Apply bằng "Phạm vi chỉ định" khi vừa thêm mới
        if (this.data.Code != 0) {
          this.dataHrPolicyMaster = this.data;
          this.handleGetTypeApply(this.dataHrPolicyMaster.TypeApply);
        } else {
          this.handleGetTypeApply(1);
        }

        this.tempNamePolicy = this.dataHrPolicyMaster.PolicyName;
        this.tempDescriptionPolicy = this.dataHrPolicyMaster.Description;
      }
    })

  }

  ngOnChanges(changes: SimpleChanges): void {
    /**
     * Bắt sự thay đổi của data để thực hiện logic
     */
    if (changes['data']) {
      const data: DTOHRPolicyMaster = changes.data.currentValue;
      if (!data.PolicyID) {
        this.handleGetTypeApply(1);
      }
      this.handleCheckDesctiption(data.Description, data);
      this.dataHrPolicyMaster = data;
      this.handleCheckIsAdd(this.dataHrPolicyMaster);
    }

    if (changes['numOfTask']) {
      this.dataHrPolicyMaster.NumOfTask = this.numOfTask
    }


    if (changes['loadData']) {
      this.isLoading = this.loadData
    }
  }

  //#endregion

  /**
   * Hàm kiểm tra xem có phải quyền xem hay không
   * @returns true, false
   */
  isViewer(): boolean {
    if (!this.isCreator && !this.isApprover && !this.isMaster) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Kiểm tra xem là thực hiện add hay update
   * @param data DTO là add nếu = 0 và ngược lại
   */
  handleCheckIsAdd(data: DTOHRPolicyMaster): void {
    if (data.Code == 0) {
      this.isAdd = true;
    } else {
      this.isAdd = false;
    }
  }

  /**
   * Dùng để set value khi chỉnh sửa và xem chi tiết
   */
  handleSetValueDataPolicy(): void {
    if (Ps_UtilObjectService.hasValue(this.dataHrPolicyMaster)) {
      if (this.dataHrPolicyMaster.Code != 0) {
        this.tempIDPolicy = this.dataHrPolicyMaster.PolicyID;
        this.dataHrPolicyMaster.Description =
          this.dataHrPolicyMaster?.Description ?? '';
        this.tempDescriptionPolicy = this.dataHrPolicyMaster.Description;
        this.tempNamePolicy = this.dataHrPolicyMaster.PolicyName;
        this.tempDateValue = this.dataHrPolicyMaster.EffDate;
        this.handleGetTypeApply(this.dataHrPolicyMaster.TypeApply);
        this.handleCheckDesctiption(
          this.dataHrPolicyMaster.Description,
          this.dataHrPolicyMaster
        );
      }
    }
  }

  /**
   * Kiểm tra giá trị của listHR có hay không
   */
  handleGetTypeApply(type: number) {
    if (Ps_UtilObjectService.hasListValue(this.listHR)) {
      this.typeApply = this.listHR.find((item) => item.OrderBy == type);
    }
  }

  /**
   * Hàm kiểm tra và set giá trị cho desription để không bị lỗi NgModel
   * @param des Description của data
   * @param data bộ data sẽ nhật dữ liệu des rỗng khi nó bằng null
   * @returns
   */
  handleCheckDesctiption(des: string, data: DTOHRPolicyMaster) {
    if (Ps_UtilObjectService.hasValueString(des)) {
      return;
    } else {
      data.Description = '';
    }
  }

  //#region API

  /**
   * Lấy danh sách HR
   * @param typeHR theo eni,
   */
  APIGetListHR(typeHR: number) {
    this.isLoading = true
    this.staffService
      .GetListHR(typeHR)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          this.isLoading = false
          if (
            Ps_UtilObjectService.hasValue(res) &&
            res.StatusCode == 0
          ) {
            this.listHR = res.ObjectReturn;
            // this.isLoading = false
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy Danh sách loại nhân viên: ${res.ErrorString}`
            );
          }
          this.handleGetTypeApply(this.dataHrPolicyMaster.TypeApply);
        },
        (err) => {
          this.isLoading = false
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy Danh sách loại nhân viên: ${err}`

          );
        }
      );
  }

  /**
   * API update thông tin của chính sách
   * @param properties thông tin muốn cập nhật
   * @param policy DTOHrPolicyMaster
   */
  APIUpdateHrPolicy(
    properties: string[],
    policy: DTOHRPolicyMaster = this.dataHrPolicyMaster
  ) {
    this.isLoading = true;
    var updateDTO: DTOUpdate = {
      DTO: policy,
      Properties: properties,
    };
    if (policy.Code == 0) {
      policy.TypeData = this.typeHrPolicy;
      policy.NumOfTask = 0;
    }
    var ctx = (this.isAdd ? 'Tạo mới' : 'Cập nhật') + ' Thông tin chính sách';
    this.hriTransitionService
      .UpdateHRPolicy(updateDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.dataHrPolicyMaster = res.ObjectReturn;
            this.layoutService.onSuccess(`${ctx} thành công`);
            this.handleSetValueDataPolicy();
            if (this.isAdd) {
              this.created.emit(this.dataHrPolicyMaster);
            }
            this.isAdd = false;
          } else {
            this.isLoading = false
            this.layoutService.onError(
              `Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`
            );
          }

        },
        () => {
          this.isLoading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`);
        }
      );
  }

  //#endregion

  //#region Logic

  openDropdownChangeApply() {
    this.openedDropdownApply.emit();
  }

  /**
   * Kiểm tra ngày và thêm một ngày vào Policy khi được tạo
   */
  handleCheckDate(): void {
    if (!this.dataHrPolicyMaster.EffDate) {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      this.dataHrPolicyMaster.EffDate = date.toISOString();
    }
  }

  /**
   * Thực hiện khi blur ra textbox
   * @param type loại để biết textbox nào được truyền vào (ID: Mã chính sách, NAME: Tiêu đề, DES: mô tả)
   */

  onBlurTextbox(type: number): void {
    if (this.dataHrPolicyMaster.Code == 0) {
      if (this.dataHrPolicyMaster.PolicyName.trim() == '') {
        return;
      }
      this.handleCheckDate();
      this.APIUpdateHrPolicy([
        'PolicyName',
        'EffDate',
        'TypeApply',
        'TypeData',
      ]);
    } else {
      switch (type) {
        case 0:
          if (
            this.handleChevaucherCheckValue(
              this.tempIDPolicy,
              this.dataHrPolicyMaster.PolicyID
            )
          ) {
            this.dataHrPolicyMaster.PolicyID = this.tempIDPolicy;
            return;
          }
          this.APIUpdateHrPolicy(['PolicyID']);
          this.tempIDPolicy = this.dataHrPolicyMaster.PolicyID;
          break;
        case 1:
          if (
            this.handleChevaucherCheckValue(
              this.tempNamePolicy,
              this.dataHrPolicyMaster.PolicyName
            )
          ) {
            this.dataHrPolicyMaster.PolicyName = this.tempNamePolicy;
            return;
          }
          this.APIUpdateHrPolicy(['PolicyName']);
          this.tempNamePolicy = this.dataHrPolicyMaster.PolicyName;
          break;
        case 2:
          if (
            this.dataHrPolicyMaster.Description.trim() ==
            this.tempDescriptionPolicy.trim()
          ) {
            return;
          }
          this.APIUpdateHrPolicy(['Description']);
          this.tempDescriptionPolicy = this.dataHrPolicyMaster.Description;
          break;
      }
    }
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

  /**
   * Hàm thực hiện lấy giá trị datepicker
   * @param e Date
   * @returns null
   */
  onDateblur(e) {
    if (Ps_UtilObjectService.hasValue(e)) {
      this.dataHrPolicyMaster.EffDate = e;
      if (this.dataHrPolicyMaster.EffDate == this.tempDateValue) {
        return;
      }
      if (this.dataHrPolicyMaster.Code == 0) {
        this.APIUpdateHrPolicy([
          'PolicyID',
          'PolicyName',
          'EffDate',
          'TypeApply',
          'TypeData',
        ]);
      } else {
        this.APIUpdateHrPolicy(['EffDate']);
        this.tempDateValue = this.dataHrPolicyMaster.EffDate;
      }

      this.dateChange.emit(e)
    }
  }

  /**
   * Hàm thực hiện khi dropdown hr có sự thay đổi
   */
  onHRChange(e): void {
    this.handleGetTypeApply(e.OrderBy);
    this.tempHrApply = e;
    if (!this.dataPosition || this.dataPosition?.length == 0) {
      if (this.dataHrPolicyMaster.TypeApply == 1) {
        this.handleHRChange(e);
        return;
      }
    }
    if (
      this.dataHrPolicyMaster.NumOfTask <= 0 &&
      this.dataHrPolicyMaster.TypeApply == 2
    ) {
      this.handleHRChange(e);
      return;
    }
    this.handleOpenPopup();
  }

  handleHRChange(e): void {
    if (Ps_UtilObjectService.hasValue(e)) {
      this.hrChange.emit(e);
      this.dataHrPolicyMaster.TypeApply = e.OrderBy;
      if (this.dataHrPolicyMaster.Code == 0) {
        this.APIUpdateHrPolicy([
          'PolicyID',
          'PolicyName',
          'EffDate',
          'TypeApply',
          'TypeData',
        ]);
      } else {
        this.APIUpdateHrPolicy(['TypeApply']);
      }
    }
    this.isShowPopComfirm = false;
  }

  /**
   * Kiểm tra xem có quyền chỉnh sửa khi là approver hay không
   * @returns
   */
  handleCheckDisableApproverEdit(): boolean {
    if (this.isMaster) {
      return false;
    } else if (this.isApprover && this.dataHrPolicyMaster.Status == 1) {
      return false;
    } else if (
      this.isCreator &&
      (this.dataHrPolicyMaster.Status == 0 ||
        this.dataHrPolicyMaster.Status == 4)
    ) {
      return false;
    }
    return true;
  }

  /**
   * Mở popup xác nhận đổi phạm vi áp dụng
   */
  handleOpenPopup(): void {
    this.isShowPopComfirm = true;
  }

  /**
   * Tắt popup xác nhận đổi phạm vi áp dụng
   */
  handleClosePopup(): void {
    this.isShowPopComfirm = false;
    this.handleGetTypeApply(this.dataHrPolicyMaster.TypeApply);
  }

  //#endregion

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
