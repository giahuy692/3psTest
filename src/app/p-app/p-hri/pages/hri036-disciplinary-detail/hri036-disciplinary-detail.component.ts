import { Component, OnInit } from '@angular/core';
import { DrawerMode, DrawerPosition } from '@progress/kendo-angular-layout';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { HriDecisionApiService } from '../../shared/services/hri-decision-api.service';
import { HriTransitionApiService } from '../../shared/services/hri-transition-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { distinct, State } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOHRPolicyMaster } from '../../shared/dto/DTOHRPolicyMaster.dto';
import { DTOHRPolicyTask } from '../../shared/dto/DTOHRPolicyTask.dto';
import { GridDataResult, SelectableSettings } from '@progress/kendo-angular-grid';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';

@Component({
  selector: 'app-hri036-disciplinary-detail',
  templateUrl: './hri036-disciplinary-detail.component.html',
  styleUrls: ['./hri036-disciplinary-detail.component.scss']
})
export class Hri036DisciplinaryDetailComponent implements OnInit {
  //#region BIẾN
  destroy$ = new Subject<void>();

  isDisableBlock: boolean = false; // Có đang disable block nào đó hay không
  isDialogDeleteTaskBoardShow: boolean = false; // Có đang mở dialog xác nhân xóa Bảng công việc hay không
  isLoading: boolean = true; // Loading của trang hoặc grid
  isCreateNew: boolean = true; //Nhận biết có phải add hay không
  isOpenPopupConfirmDeleteTask: boolean = false; // Có đang mở dialog xác nhân xóa công việc hay không

  // Phân quyền
  justLoaded: boolean = true;
  actionPerm: DTOActionPermission[] = [];
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false;

  taskBoardMaster: DTOHRPolicyMaster; // Bảng công việc hiện tại
  taskHandler: DTOHRPolicyTask; // Công việc được sử dụng để binding lên drawer và chỉnh sửa nếu cần
  taskBoardMasterLS: DTOHRPolicyMaster = JSON.parse(localStorage.getItem('disciplinaryTaskBoardMaster')); // Bảng công việc được chọn để hiển thị ở trang này

  currentDate: Date = new Date(); // Ngày hiện tại

  nameTaskBoard: string = ''; // Tên bảng công việc
  tempNameTaskBoard: string = ''; // Tên bảng công việc tạm thời để phục vụ kiểm tra giá trị thay đổi với cập nhật
  descriptionTaskBoard: string = ''; // Mô tả bảng công việc
  tempDescriptionTaskBoard: string = ''; // Mô tả bảng công việc tạm thời để phục vụ kiểm tra giá trị thay đổi với cập nhật
  dateValue: Date; // Ngày hiệu lực của bảng công việc
  typeDataDisciplinaryTaskBoard: number = 3; // TypeData của Bảng công việc xử lý kỉ luật

  arrBtnStatus: any = []; // Các button hiển thị ở header của trang (Trừ xóa và thêm mới)

  expandMode: DrawerMode = 'overlay'; // Chế độ hiển thị của drawer
  expanded = false; // Drawer đang được mở hay không
  widthDrawer: number = 430; // Chiều dài của drawer
  positionDrawer: DrawerPosition = "end"; // Vị trị xuất hiện của drawer
  statusDrawer: number = 1; // Trạng thái của drawer là 1-thêm mới hoặc 2-chỉnh sửa

  //Setting Selectable cho grid
  selectable: SelectableSettings = { enabled: true, mode: 'multiple', drag: false, checkboxOnly: true };
  // State của grid
  gridState: State = {
    filter: { filters: [], logic: 'and' },
    sort: [{ field: 'Code', dir: 'desc' }],
  };
  gridView: GridDataResult; // Danh sách bảng công việc
  listSelectedTaskToDelete: DTOHRPolicyTask[] = []; // Danh sách công việc được chọn để xóa

  M_A: boolean; // Quyền là Master hoặc Approver
  M_C: boolean; // Quyền là Master hoặc Creator

  // Callback function
  onActionDropDownClickCallback: Function;
  onSelectCallback: Function;
  onSelectedPopupBtnCallback: Function;
  getActionDropdownCallback: Function;
  getSelectionPopupCallback: Function;
  onSortChangeCallback: Function;
  //#endregion



  //#region HOOK
  constructor(
    private menuService: PS_HelperMenuService,
    private decisionService: HriDecisionApiService,
    private layoutService: LayoutService,
    private policyTransService: HriTransitionApiService
  ) { }


  ngOnInit(): void {
    let that = this;

    //Phân quyền ứng dụng
    this.menuService.changePermission().pipe(takeUntil(this.destroy$)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        //action permission
        this.isMaster = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        this.isAllowedToViewOnly = this.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(this.actionPerm.filter(s => s.ActionType != 6))
        this.M_A = this.isMaster || this.isApprover;
        this.M_C = this.isMaster || this.isCreator;
      }
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.handleBindingDetail();
      }
    });
  }

  //#endregion



  //#region API
  /**
   * API lấy thông tin bảng công việc
   * @param req DTO bảng công việc
   */
  APIGetHRPolicy(req: DTOHRPolicyMaster) {
    const errMsg = 'Đã xảy ra lỗi khi lấy Thông tin bảng công việc:';
    this.policyTransService.GetHRPolicy(req).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.taskBoardMaster = res.ObjectReturn;

        // Set những biến tạm thời để kiểm tra sự thay đổi mới cập nhật
        this.tempNameTaskBoard = this.taskBoardMaster?.PolicyName;
        this.tempDescriptionTaskBoard = this.taskBoardMaster?.Description;

        this.isCreateNew = this.taskBoardMaster.Code === 0; // Kiểm tra có phải thêm mới hay không

        this.setupBtnStatus(this.taskBoardMaster);

        // Set lại LocalStorage
        localStorage.setItem('disciplinaryTaskBoardMaster', JSON.stringify(this.taskBoardMaster));
      }
      else {
        this.layoutService.onError(`${errMsg} ${res.ErrorString}`);
      }
      this.isLoading = false;
    }, (err) => {
      this.isLoading = false
      this.layoutService.onError(`${errMsg} ${err}`);
    }
    );
  }

  /**
   * API update thông tin của bảng công việc
   * @param properties thông tin muốn cập nhật
   * @param taskBoard DTOHRPolicyMaster
   */
  APIUpdateHRPolicy(properties: string[], taskBoard: DTOHRPolicyMaster = this.taskBoardMaster) {
    this.isLoading = true;

    var updateDTO: DTOUpdate = { DTO: taskBoard, Properties: properties };

    var ctx = (this.isCreateNew ? 'Tạo mới' : 'Cập nhật') + ' Thông tin chính sách';
    this.policyTransService.UpdateHRPolicy(updateDTO).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.taskBoardMaster = res.ObjectReturn; // Lấy giá trị của object mới nhất cho Bảng công việc
        this.layoutService.onSuccess(`${ctx} thành công`); // Thông báo

        this.isCreateNew = this.taskBoardMaster.Code === 0;
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`);
    });
  }
  //#endregion



  //#region HEADER
  /**
   * Hàm hoạt động khi ấn vào breadcrumb
   */
  handleLoadBreadCrumb() {
    console.log('Load lại cpn');
  }

  /**
  * Kiểm tra xem bảng công việc còn trả về được hay không
  * @param taskBoard bảng công việc
  * @returns true nếu có thể
  */
  handleCheckReturnableTaskBoard(taskBoard: DTOHRPolicyMaster): boolean {
    this.currentDate.setHours(0, 0, 0, 0);
    return Ps_UtilObjectService.getDaysLeft(this.currentDate, taskBoard.EffDate) > 0;
  }

  /**
   * Thực hiện setup các button hiển th
   */
  setupBtnStatus(taskBoard: DTOHRPolicyMaster) {
    if(!Ps_UtilObjectService.hasValue(taskBoard)){
      this.arrBtnStatus = [];
    }
    const statusTB: number = taskBoard?.Status;
    const buttonSend = { text: 'GỬI DUYỆT', class: 'k-button btn-hachi hachi-primary', code: 'redo', link: 1 };
    const buttonApprove = { text: 'PHÊ DUYỆT', class: 'k-button btn-hachi hachi-primary', code: 'check-outline', link: 2 };
    const buttonStop = { text: 'NGƯNG ÁP DỤNG', class: 'k-button btn-hachi hachi-warning', code: 'minus-outline', link: 3 };
    const buttonReturn = { text: 'TRẢ VỀ', class: 'k-button btn-hachi hachi-warning hachi-secondary', code: 'undo', link: 4 };
    this.arrBtnStatus = [];

    // Nếu như Bảng công việc đã tồn tại
    if (taskBoard.Code !== 0) {
      // Bảng CV đang ở trạng thái "Đang soạn thảo" hoặc "Trả về"
      if ([0, 4].includes(statusTB) && this.M_C) {
        this.arrBtnStatus.push(buttonSend);
      }

      // Bảng CV đang ở trạng thái "Gửi duyệt" hoặc "Ngưng áp dụng" và đủ điều kiện trả về
      if (statusTB == 1 && this.M_A) {
        this.arrBtnStatus.push(buttonReturn, buttonApprove);
      }

      // Bảng CV đang ở trạng thái "Duyệt áp dụng"
      if (statusTB == 2 && this.M_A) {
        this.arrBtnStatus.push(buttonStop);
      }

      // Bảng CV đang ở trạng thái "Ngưng áp dụng"
      if (statusTB == 3 && this.handleCheckReturnableTaskBoard(taskBoard)) {
        this.arrBtnStatus.push(buttonApprove);
      }
    }
  }

  /**
   * Hàm thay đổi giá trị của status
   * @param status status muốn thay đổi
   */
  handleUpdateStatusPolicy(status: number) {
    const erMsg = 'Đã xảy ra lỗi khi cập nhật trạng thái chính sách:';
    // Kiểm tra với Bảng công việc ở trạng thái "Gửi duyệt" hoặc 
    if (status == 1 || status == 2) {
      if (!Ps_UtilObjectService.hasValueString(this.taskBoardMaster.PolicyName)) {
        this.layoutService.onError(`${erMsg} Chính sách chưa có tiêu đề`);
        return;
      }

      if (!Ps_UtilObjectService.hasValue(this.taskBoardMaster.EffDate)) {
        this.layoutService.onError(`${erMsg} Chính sách chưa có ngày hiệu lực`);
        return;
      }

      if (!Ps_UtilObjectService.hasValue(this.taskBoardMaster.NumOfTask) || this.taskBoardMaster.NumOfTask == 0) {
        this.layoutService.onError(`${erMsg} Chính sách chưa có công việc`);
        return;
      }
    }
    console.log('Cập nhật trạng thái Bảng công việc')
    // this.APIUpdateHRPolicyStatus([this.taskBoardMaster], status);
  }

  /**
   * Hàm dùng để thêm mới Bảng công việc bằng nút
   */
  handleAddNewClick() {
    console.log("Thêm mới Bảng công việc");
  }
  //#endregion



  //#region HÀM DÙNG CHUNG
  /**
   * Hàm dùng để lấy dữ liệu từ các input công việc
   * @param value giá trị nhận được sau khi value change
   * @param field trường dùng để gán giá trị vào
   */
  handleGetValueTaskFromInput(value: any, field: string) {
    switch (field) {
      // Nếu là mô tả công việc
      case 'description': {
        this.taskHandler.Description = value;
        break;
      }
    }
  }

  /**
   * Mở dialog Xóa bảng công việc
   */
  handleOpenDialogDeleteTaskBoard() {
    this.isDialogDeleteTaskBoardShow = true;
  }

  /**
   * Hàm dùng để kiểm tra điều kiện hiển thị 1 trường nào đó
   * @param field trường tùy cách ghi
   * @returns true nếu đủ điều kiện cho trường đó hiển thị
   */
  isVisibleField(field: string) {
    const isEffective: boolean = Ps_UtilObjectService.getDaysLeft(this.currentDate, this.taskBoardMaster?.EffDate) > 0;
    const statusTB: number = this.taskBoardMaster?.Status;

    switch (field) {
      // Đói với nút "XÓA BẢNG C.VIỆC" trên header của trang
      case "button-delete-task-board": {
        if (statusTB == 0 && this.M_C) {
          return true;
        }
        break;
      }

      // Đói với nút "THÊM MỚI" Bảng công việc trên header của trang
      case "button-add-task-board": {
        if (this.taskBoardMaster?.Code !== 0 && this.M_C) {
          return true;
        }
        break;
      }

      // Đói với input tên bảng công việc
      case "input-name-task-board": {
        if (Ps_UtilObjectService.hasValue(this.taskBoardMaster?.PolicyName)) {
          return true;
        }
        break;
      }

      // Đói với input mô tả bảng công việc
      case "input-description-task-board": {
        if (Ps_UtilObjectService.hasValue(this.taskBoardMaster?.Description)) {
          return true;
        }
        break;
      }
    }
  }

  /**
   * Hàm dùng để kiểm tra điều kiện available 1 trường nào đó
   * @param field trường tùy cách ghi
   * @returns true nếu trường đó bị không đủ điều kiện edit
   */
  isDisableField(field: string) {
    const isEffective: boolean = Ps_UtilObjectService.getDaysLeft(this.currentDate, this.taskBoardMaster.EffDate) > 0;

    switch (field) {
      // Đối với input tên bảng công việc
      case "input-name-task-board": {
        if (!this.hasPermissionToEdit()) {
          return true;
        }
        break;
      }

      // Đối với input mô tả bảng công việc & Đối với datepicker chọn ngày hiệu lực
      case "input-description-task-board":
      case "date-picker-task-board": {
        if (!this.hasPermissionToEdit() || this.isCreateNew) {
          return true;
        }
        break;
      }
    }

    return false;
  }

  /**
   * Kiểm tra xem có quyền edit hay không
   * @returns true nếu có quyền
   */
  hasPermissionToEdit(): boolean {
    const statusTB: number = this.taskBoardMaster.Status;

    if (this.isMaster) {
      return true;
    }

    if (this.M_A && statusTB == 1) {
      return true;
    }

    if (this.M_C && [0, 4].includes(statusTB)) {
      return true;
    }

    return false;
  }

  /**
   * Kiểm tra giá trị trùng lập
   * @param oldValue Giá trị cũ
   * @param newValue Giá trị mới
   * @returns true khi trùng hoặc false không trùng
   */
  handleChevaucherCheckValue(oldValue: any, newValue: any): boolean {
    if (oldValue?.trim() === newValue?.trim() || newValue?.trim() === '') {
      return true;
    }
    return false;
  }

  /**
   * Kiểm tra ngày và thêm một ngày vào Bảng công việc khi được thêm mới
   */
  handleSetDateToAddNew(): void {
    if (!Ps_UtilObjectService.hasValueString(this.taskBoardMaster.EffDate)) {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      this.taskBoardMaster.EffDate = date.toISOString();
    }
  }

  /**
   * Đóng dialog Xóa bảng công việc
   */
  handleCloseDialog() {
    this.isDialogDeleteTaskBoardShow = false;
  }

  /**
   * Thực hiện xóa bảng công việc
   */
  handleDeleteTaskBoard(): void {
    // Nếu không có danh sách công việc thì được xóa
    if (!Ps_UtilObjectService.hasListValue(this.taskBoardMaster.NumOfTask)) {
      // this.APIDeleteHRPolicy([this.taskBoardMaster]);
      console.log("APIDeleteHRPolicy");
      return;
    }

    const errMSG = `Không thể xóa chính sách ${this.taskBoardMaster.PolicyName}:`

    if (Ps_UtilObjectService.hasListValue(this.taskBoardMaster.NumOfTask)) {
      this.layoutService.onError(`${errMSG} Vì còn danh sách công việc`);
      return;
    }
  }
  //#endregion



  //#region DRAWER
  /**
   * Hàm dùng để đóng drawer
   */
  handleCloseDrawer() {
    this.expanded = false; // Đóng drawer
    this.statusDrawer = 1; // Reset trạng thái drawer
  }
  //#endregion



  //#region THÔNG TIN CV
  /**
   * Thực hiện khi blur ra textbox
   * @param type loại để biết textbox nào được truyền vào (ID: Mã chính sách, NAME: Tiêu đề, DES: mô tả)
   */
  onBlurTextbox(type: number): void {
    // Đối với khi thêm mới bảng công việc xử lý kỉ luật
    if (this.taskBoardMaster.Code == 0) {
      if (!Ps_UtilObjectService.hasValueString(this.taskBoardMaster.PolicyName)) {
        return;
      }
      this.handleSetDateToAddNew();
      this.taskBoardMaster.TypeData = 3; // Đối với bảng công việc xử lý kỉ luật

      // Ban đầu description null nên chuyển thành "" 
      if (!Ps_UtilObjectService.hasValue(this.taskBoardMaster)) {
        this.taskBoardMaster.Description = "";
      }
      this.APIUpdateHRPolicy(['PolicyName', 'TypeData', 'EffDate', 'TypeApply', 'Description']);
      return;
    }

    // Đối với khi chỉnh sửa bảng công việc xử lý kỉ luật
    switch (type) {
      // Cập nhật tên bảng công việc
      case 1:
        if (this.handleChevaucherCheckValue(this.tempNameTaskBoard, this.taskBoardMaster.PolicyName)) {
          this.taskBoardMaster.PolicyName = this.tempNameTaskBoard;
          return;
        }
        this.APIUpdateHRPolicy(['PolicyName']);
        this.tempNameTaskBoard = this.taskBoardMaster.PolicyName;
        break;
      case 2:
        if (this.taskBoardMaster.Description.trim() == this.tempDescriptionTaskBoard.trim()) {
          return;
        }
        this.APIUpdateHRPolicy(['Description']);
        this.tempDescriptionTaskBoard = this.taskBoardMaster.Description;
        break;
    }
  }

  /**
   * Hàm thực hiện lấy giá trị datepicker và update ngày hiệu lực
   * @param e Date
   */
  onDateblur(e: Date) {
    if (Ps_UtilObjectService.hasValue(e)) {
      this.APIUpdateHRPolicy(['EffDate']);
    }
  }

  /**
   * Hàm dùng để set các biến và hiển thị giao diện khi từ list vào detail
   */
  handleBindingDetail() {
    // Kiểm tra localStorage có taskBoardMaster hay không
    if (Ps_UtilObjectService.hasValue(this.taskBoardMasterLS)) {
      this.APIGetHRPolicy(this.taskBoardMasterLS);
    } else {
      this.taskBoardMaster = new DTOHRPolicyMaster();
      localStorage.setItem('disciplinaryTaskBoardMaster', JSON.stringify(this.taskBoardMaster));
    }
  }

  //#endregion



  //#region TASK LIST
  //#endregion
}
