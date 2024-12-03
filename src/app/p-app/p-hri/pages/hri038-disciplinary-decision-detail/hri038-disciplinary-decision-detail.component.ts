import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { HriDecisionApiService } from '../../shared/services/hri-decision-api.service';
import { DTOHRDecisionProfile } from '../../shared/dto/DTOHRDecisionProfile.dto';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DTOHRDecisionMaster } from '../../shared/dto/DTOHRDecisionMaster.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { distinct, FilterDescriptor, State } from '@progress/kendo-data-query';
import { StaffApiService } from '../../shared/services/staff-api.service';
import { DTOListHR } from '../../shared/dto/DTOPersonalInfo.dto';
import { HriTransitionApiService } from '../../shared/services/hri-transition-api.service';
import { DTODepartment } from '../../shared/dto/DTODepartment.dto';
import { DTOPosition } from '../../shared/dto/DTOPosition.dto';
import { DTOLocation } from '../../shared/dto/DTOLocation.dto';
class DTOActionStatus { text: string; class: string; code: string; statusID?: number; type?: string }

@Component({
  selector: 'app-hri038-disciplinary-decision-detail',
  templateUrl: './hri038-disciplinary-decision-detail.component.html',
  styleUrls: ['./hri038-disciplinary-decision-detail.component.scss']
})
export class Hri038DisciplinaryDecisionDetailComponent {
  //#region Permission
  isLoading: boolean = false;
  justLoaded: boolean = true;
  actionPerm: any;
  isAllowedToCreate: boolean = false;
  isAllowedToVerify: boolean = false;
  isMaster: boolean = false;
  isLockAll: boolean = false;
  //#endregion

  constructor(
    private layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
    public domSanititizer: DomSanitizer,
    private apiService: HriDecisionApiService,
    private staffService: StaffApiService,
    private hriTransitionService: HriTransitionApiService,
  ) {}

  ngOnInit(){
    let that = this;
    this.menuService
    .changePermission()
    .pipe(takeUntil(this.ngUnsubscribe$))
    .subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        that.justLoaded = false;
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');

        that.isMaster =
          that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isAllowedToCreate =
          that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isAllowedToVerify =
          that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
      }
    });

    this.menuService
    .changePermissionAPI()
    .pipe(takeUntil(this.ngUnsubscribe$))
    .subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.onGetCache();
      }
    });

    this.isItemDisableCallback = this.isTreeItemDisable.bind(this);
  }

  //#region chung
  
  onGetCache(){
    let cache:DTOHRDecisionMaster = JSON.parse(sessionStorage.getItem('DisciplinaryDecision'));
    if (Ps_UtilObjectService.hasValue(cache)) {
      this.DecisionMaster = cache;
      this.APIGetHRDecisionMaster();
    }
  }

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
   * Hàm kiểm tra trường bắt buộc và báo lỗi
   * @param value DTOHRDecisionProfile
   * @param showError hiển thị thông báo không?
   * @returns boolean
   */
  onCheckPropertiesRequire(showError: boolean = true): boolean {
    if (!Ps_UtilObjectService.hasValue(this.DecisionMaster.DecisionID)) {
      if (showError) this.layoutService.onError(`Quyết định kỷ luật của ${this.DecisionProfile.FullName}: Thiếu mã quyết định`);
      return false;
    }
  
    if (!Ps_UtilObjectService.hasValue(this.DecisionMaster.EffDate)) {
      if (showError) this.layoutService.onError(`Quyết định kỷ luật của ${this.DecisionProfile.FullName}: Thiếu thời gian hiệu lực`);
      return false;
    }

    if (this.DecisionMaster.Status == 0 && Ps_UtilObjectService.getDaysLeft(new Date(), this.DecisionMaster.EffDate)  < 0) {
      if (showError) this.layoutService.onError(`Quyết định kỷ luật của ${this.DecisionProfile.FullName}: Vui lòng chọn ngày hiệu lực từ hiện tại trở đi`);
      return false;
    }
  
    if (!Ps_UtilObjectService.hasValue(this.DecisionProfile.DisciplinaryForm)) {
      if (showError) this.layoutService.onError(`Quyết định kỷ luật của ${this.DecisionProfile.FullName}: Chưa chọn hình thức áp dụng xử lý kỷ luật`);
      return false;
    }
  
    if (this.DecisionProfile.DisciplinaryForm === 3 && this.DecisionProfile.TimeHandle <= 0) {
      if (showError) this.layoutService.onError(`Quyết định kỷ luật của ${this.DecisionProfile.FullName}: Chưa nhập thời gian kỷ luật kéo dài nâng lương`);
      return false;
    }
  
    if (this.DecisionProfile.DisciplinaryForm === 4 && (!this.DecisionProfile.Position || !this.DecisionProfile.Department || !this.DecisionProfile.Location)) {
      if (showError) this.layoutService.onError(`Quyết định kỷ luật của ${this.DecisionProfile.FullName}: Chưa chọn vị trí cách chức`);
      return false;
    }
  
    return true;
  }
  //#endregion

  //#region header-1
  onLoadDataBreadcumb(){
    this.onGetCache()
  }
  onHeaderBtnClick(item: { text: string, class: string, code: string, statusID: number, type: string }){
    if (this.DecisionMaster.Code != 0) {
      let StatusIDAction = item.statusID;

      switch (item.type) {
        case 'status':
          var listdataUpdate = [];

          /**
           Nếu gửi duyệt phải thỏa điều kiện sau:
           + Phải có mã quyết định
           + Phải có ngày hiệu lực và ngày này phải là ngày hiện tại trở về sau
           + Hình thức xử lý đối với quyết định này phải có 
          */

          if (StatusIDAction == 1) {
            if ((this.DecisionMaster.Status == 0 || this.DecisionMaster.Status == 4) 
              && this.onCheckPropertiesRequire(true)) {
                listdataUpdate.push(this.DecisionMaster);
                this.APIUpdateHRDecisionMasterStatus(listdataUpdate, StatusIDAction);
            }
          } 
          /**
           Nếu gửi duyệt phải thỏa điều kiện sau:
           + Phải có mã quyết định
           + Phải có ngày hiệu lực
           + Hình thức xử lý đối với quyết định này phải có 
          */
          else if (StatusIDAction == 2) {
            if (this.DecisionMaster.Status == 1 || this.DecisionMaster.Status == 3
              && this.onCheckPropertiesRequire(true)) {
                listdataUpdate.push(this.DecisionMaster);
                this.APIUpdateHRDecisionMasterStatus(listdataUpdate, StatusIDAction);
            }
          } else if (StatusIDAction == 3) {
            if (this.DecisionMaster.Status == 2) {
              listdataUpdate.push(this.DecisionMaster);
              this.APIUpdateHRDecisionMasterStatus(listdataUpdate, StatusIDAction);
            }
          } else if (StatusIDAction == 4) {
            if (this.DecisionMaster.Status == 1 || this.DecisionMaster.Status == 3) {
              listdataUpdate.push(this.DecisionMaster);
              this.APIUpdateHRDecisionMasterStatus(listdataUpdate, StatusIDAction);
            }
          }
          break;
        default:
          break;
      }

    } 
  }

  DecisionProfile: DTOHRDecisionProfile = new DTOHRDecisionProfile();
  DecisionMaster: DTOHRDecisionMaster = new DTOHRDecisionMaster();
  listActBtnStatus: DTOActionStatus[] = [];
  onCreateListBtnStatus() {
    this.listActBtnStatus = [];
    var statusID = this.DecisionMaster.Status;

    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isMaster;

    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isMaster;


    // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && this.DecisionMaster.Code > 0 && (statusID === 0 || statusID === 4)) {
      this.listActBtnStatus.push({
        text: 'GỬI DUYỆT',
        class: 'k-button btn-hachi hachi-primary',
        code: 'redo',
        statusID: 1,
        type: 'status'
      });
    }

    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    if (canVerify && this.DecisionMaster.Code > 0 && (statusID === 1 || statusID === 3)) {
      if(this.onCheckPropertiesRequire(false)){
        this.listActBtnStatus.push({
          text: 'PHÊ DUYỆT',
          class: 'k-button btn-hachi hachi-primary',
          code: 'check-outline',
          statusID: 2,
          type: 'status'
        });
      }

      // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
      if(Ps_UtilObjectService.getDaysLeft(new Date(),this.DecisionMaster.EffDate)  > 0)
      this.listActBtnStatus.push({
        text: 'TRẢ VỀ',
        class: 'k-button btn-hachi hachi-warning hachi-secondary',
        code: 'undo',
        statusID: 4,
        type: 'status'
      });
    }

    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    if (canVerify && this.DecisionMaster.Code > 0 && statusID === 2 
      && Ps_UtilObjectService.getDaysLeft(new Date(),this.DecisionMaster.EffDate)  > 0) {
      this.listActBtnStatus.push({
        text: 'NGƯNG ÁP DỤNG',
        class: 'k-button btn-hachi hachi-warning',
        code: 'minus-outline',
        statusID: 3,
        type: 'status'
      });
    }
    // Sắp xếp theo thứ tự: xem -> chỉnh sửa -> gửi -> duyệt -> ngưng -> trả về
  }
  //#endregion

  //#region header-2
  //#endregion

  //#region quyết định
  currentDate: Date = new Date()
  onValueChanged(property: string){
    this.APIUpdateHRDecisionMaster(this.DecisionMaster, [property])
  }
  //#endregion

  //#region hình thức kỷ luật
  FormatTimeHandle: string

  /** Hàm xử lý cập nhật thời gian kỷ luật của hình thức kéo dài thời gian nâng lương
    * @param property trường cập nhật
    * @param data mỗi data là 1 loại DTO khác nhau
   */
  onUpdateProperties(property: string, data?: any){

     // Nếu cập nhật hình thức kỷ luật
    if(property == 'DisciplinaryForm'){
      Object.assign(this.DecisionProfile, {
        DisciplinaryForm: data.OrderBy,
        DisciplinaryFormName: data.ListName,
      });

      if(this.DecisionProfile.DisciplinaryForm == 4){
        this.APIGetListDepartment()
      }
    }

    // Nếu cập nhật đơn vị của hình thức cách chức
    if(property == 'Department'){
      Object.assign(this.DecisionProfile, {
        Department: data.Code,
        DepartmentName: data.Department,
        Position: null,
        PositionName: null,
      });
    }

    // Nếu cập chức danh của hình thức cách chức
    if(property == 'Position'){
      Object.assign(this.DecisionProfile, {
        Position: data.Code,
        PositionName: data.Department,
        Location: null,
        LocationName: null
      });
    }

    if(property == 'Location'){
      Object.assign(this.DecisionProfile, {
        Location:  data.Code,
        LocationName: data.Department,
      });
    }

    if(property == 'PreDisciplinary'){
      this.valuePreDisciplinary = data
    }

    if(property != 'PreDisciplinary'){
      this.APIUpdateHRDecisionProfile(this.DecisionProfile)
    }
  }

  /** Hàm xử lý format cho giá trị của input thời gian xử lý
   */
  onUpdateFormattedTimeHandle(): string {
    const timeHandle = Number(this.DecisionProfile?.TimeHandle);

    const today: Date = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + timeHandle);

    const result =  `${futureDate.toLocaleDateString('vi-VN')}`;
    return result;
  }
  //#endregion

  // #region API

  //- Unsubcribe
  ngUnsubscribe$ = new Subject<void>();

  /**
   * API lấy quyết định
   */
  APIGetHRDecisionMaster() {
    this.isLoading = true;
    const apiText = 'kỷ luật'
    this.apiService.GetHRDecisionMaster(this.DecisionMaster).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      this.isLoading = false;
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.DecisionMaster = new DTOHRDecisionMaster(res.ObjectReturn)

        // Nếu không có quyết định thì không lấy hồ sơ
        // if(this.DecisionMaster.Code < 0){
          localStorage.setItem('DisciplinaryDecision', JSON.stringify(this.DecisionMaster));
          this.onCreateListBtnStatus()
          this.filterDecisionCode.value = this.DecisionMaster.Code
          this.APIGetListHRDecisionProfile(true)
        // }
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy thông tin quyết định ${apiText}: ' + res.ErrorString);
      }
    },
      (err) => {
        this.isLoading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin quyết định ${apiText}: ${err}`);
      })
  }
  // #endregion 

  /**
   * API lấy danh sách hồ sơ quyết định
   */

  gridState: State = {
    skip: null,
    filter: { filters: [], logic: 'and' },
    sort: [],
  };

  filterDecisionCode: FilterDescriptor = {
    field: 'Decision',
    operator: 'eq',
    value: this.DecisionMaster.Code,
    ignoreCase: true,
  };

  filterDecisionType: FilterDescriptor = {
    field: 'DecisionType',
    operator: 'eq',
    value: 3,
    ignoreCase: true,
  };

  /**
   * API lấy Profile của một quyết định (Muốn lấy profile từ một quyết định phải dùng API APIGetListHRDecisionProfile)
   * @param hasCallAPIListDisciplinary  có gọi api APIGetListHR và APIGetListDisciplinaryStaff
   */
  APIGetListHRDecisionProfile(hasCallAPIListDisciplinary: boolean) {
    this.gridState.filter.filters = []
    this.gridState.filter.filters.push(this.filterDecisionCode, this.filterDecisionType)
    const apiText: string = 'quyết định kỷ luật';
    this.isLoading = true;
    this.apiService
      .GetListHRDecisionProfile(this.gridState)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            res.StatusCode == 0
          ) {
            this.DecisionProfile = res.ObjectReturn.Data[0]
            if(hasCallAPIListDisciplinary){
              this.APIGetListHR(); // Lấy danh sách hình thức xử lý kỷ luật
              this.APIGetListDisciplinaryStaff(this.DecisionProfile) // Lấy danh sách hình thức xử lý kỷ luật trước đó
              
              // Nếu hình thực cách chức lấy danh sách đơn vị, chức danh, điểm làm việc
              if(this.DecisionProfile.DisciplinaryForm == 4){
                this.APIGetListDepartment()
              }
            }
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
   * API cập nhật hồ sơ 
   * @param DTODecisionProfile hồ sơ cần cập nhật
   */
  APIUpdateHRDecisionProfile(DTODecisionProfile: DTOHRDecisionProfile) {
    const TypeUpdate = 'Cập nhật thông tin';
    const apiText = "quyết định kỷ luật"
    DTODecisionProfile.DecisionType = 3
    this.apiService.UpdateHRDecisionProfile(DTODecisionProfile).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${TypeUpdate} ${apiText} thành công`);

        if(Ps_UtilObjectService.hasValue(this.DecisionProfile.Department)){
          this.APIGetListPositionDepartment()
        }

        if(Ps_UtilObjectService.hasValue(this.DecisionProfile.Position)){
          this.APIGetListLocationDepartment()
        }
        this.APIGetListHRDecisionProfile(false);

      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${TypeUpdate}  ${apiText}: ` + res.ErrorString);
        if (DTODecisionProfile.Code != 0) {
          this.onCreateListBtnStatus();
          this.APIGetListHRDecisionProfile(false);
        }
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${TypeUpdate} ${apiText}: ${err}`);
        if (DTODecisionProfile.Code != 0) {
          this.onCreateListBtnStatus();
        }
      })
  }

  /**
   * API lấy danh sách hình thức xử lý kỷ luật
   */
  ListDisciplinary: DTOListHR[] = []
  APIGetListHR() {
    this.isLoading = true
    this.staffService.GetListHR(27).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      this.isLoading = false
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.ListDisciplinary = res.ObjectReturn
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách hình thức xử lý: ' + res.ErrorString);
      }
    },
      (err) => {
      this.isLoading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách hình thức xử lý: ${err}`);
      })
  }

  /**
   * API lấy danh sách hình thức xử lý kỷ luật
   */
  ListPreDisciplinary: { Staff: number; DisciplinaryForm: number; DisciplinaryFormName: string; ListOfAttached: any[]; }[] = []
  ListDisciplinaryStaffState: State = {
    skip: null,
    filter: { filters: [], logic: 'and' },
    sort: [],
  };

  filterDisciplinaryStaff: FilterDescriptor = {
    field: 'Staff',
    operator: 'eq',
    value: this.DecisionProfile.Staff,
    ignoreCase: true,
  };

  valuePreDisciplinary: { Staff: number; DisciplinaryForm: number; DisciplinaryFormName: string; ListOfAttached: any[]; } = { Staff: null, DisciplinaryForm: null, DisciplinaryFormName: null, ListOfAttached: [], };

  APIGetListDisciplinaryStaff(DecisionProfile: DTOHRDecisionProfile) {
    // Tạo state gọi api
    this.ListDisciplinaryStaffState.filter.filters = []
    this.filterDisciplinaryStaff.value = DecisionProfile.Staff
    this.ListDisciplinaryStaffState.filter.filters.push(this.filterDisciplinaryStaff)


    this.isLoading = true
    this.apiService.GetListDisciplinaryStaff(this.ListDisciplinaryStaffState).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      this.isLoading = false
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.ListPreDisciplinary = res.ObjectReturn.Data
        this.ListPreDisciplinary = [
            {
              "Staff": this.DecisionProfile.Staff,
              "DisciplinaryForm": 1,
              "DisciplinaryFormName": 'Bằng lời nói',
              "ListOfAttached": [
                {fileName: "PetitionStaffLeave"},
                {fileName: "Đơn xin nghỉ việc"},
                {fileName: "DecisionProfileReportWord"},
              ]
            },
            {
              "Staff": this.DecisionProfile.Staff,
              "DisciplinaryForm": 2,
              "DisciplinaryFormName": 'Cách chức',
              "ListOfAttached": [
                {fileName: "StaffLeaveReports"},
                {fileName: "PHIẾU NHẬN XÉT, ĐÁNH GIÁ CQ (TTTN)_KKT"},
                {fileName: "quy dinh thuc tap tot nghiep-KKT"},
              ]
            },
            {
              "Staff": this.DecisionProfile.Staff,
              "DisciplinaryForm": 3,
              "DisciplinaryFormName": 'Bằng văn bảng',
              "ListOfAttached": [
                {fileName: "00. VHC - Trình tự xử lý kỷ luật LĐ"},
                {fileName: "01-VHC-Biên bản vi phạm kỷ luật lao động"},
                {fileName: "04-VHC-Quyết định xử lý kỷ luật"},
              ]
            }
          ]
        this.valuePreDisciplinary = this.ListPreDisciplinary[0];
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách hình thức xử lý trước đó của ${this.DecisionProfile.FullName}: ` + res.ErrorString);
      }
    },
      (err) => {
      this.isLoading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách hình thức xử lý trước đó của ${this.DecisionProfile.FullName}: ${err}`);
      })
  }

  /**
   * API cập nhật thông tin quyết định (Thời gian hiệu lực)
   * @param DTODecision Quyết định cần update
   * @param Properties Props cần update
   */
  APIUpdateHRDecisionMaster(DTODecision: DTOHRDecisionMaster, Properties: string[]) {
    const TypeUpdate = 'Cập nhật thông tin';
    const apiText = 'Quyết định kỷ luật'

    this.apiService.UpdateHRDecisionMaster(DTODecision, Properties).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.DecisionMaster = res.ObjectReturn
        localStorage.setItem('DisciplinaryDecision', JSON.stringify(this.DecisionMaster));
        this.onCreateListBtnStatus();
        this.layoutService.onSuccess(`${TypeUpdate} ${apiText} thành công`);
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${TypeUpdate} ${apiText}: ` + res.ErrorString);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${TypeUpdate} ${apiText}: ${err}`);
      })
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
    let ctx: string = 'trạng thái quyết định';
    this.apiService
      .UpdateHRDecisionMasterStatus(listDTO, reqStatus)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.layoutService.onSuccess(`Cập nhật ${ctx} thành công`);
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString} `
            );
          }
          this.APIGetHRDecisionMaster();
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật ${ctx}: ${error} `
          );
        }
      );
  }

  /**
  * API lấy danh sách đơn vị
  */
  ListDepartment: DTODepartment[]  // danh sách đơn vị
  curDepartment: DTODepartment = new DTODepartment();
  isItemDisableCallback: Function;
  isListDepartmentLoading: boolean = false;
  isDepartmentDisable: boolean;
  isPositionDisable: boolean;
  isLocationDisable: boolean;
  defaultDepartmentItem: DTODepartment = new DTODepartment();
  defaultPositionItem: DTOPosition = new DTOPosition();
  defaultLocationItem: DTOLocation = new DTOLocation();
  isLocationTreeDisableCallback: Function;

  APIGetListDepartment() {
    const temp = new DTODepartment()
    temp['Code'] = 1, temp['IsTree'] = true
    this.isLoading = true
    this.apiService.GetListDepartment(temp).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      this.isLoading = false
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        // Lọc ra các đơn vị chưa được duyệt
        this.ListDepartment = res.ObjectReturn;
        // Nếu như DecisionProfile có chọn đơn vị rồi thì gọi API lấy danh sách chức danh 
        if(Ps_UtilObjectService.hasValue(this.DecisionProfile.Department)){
          this.APIGetListPositionDepartment()
        }
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách đơn vị');
      }
    },
      (err) => {
        this.isLoading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đơn vị: ${err}`);
      })
  }

  /**
   * API lấy danh sách chức danh
   */
  ListPosition: DTOPosition[] // danh sách chức danh
  APIGetListPositionDepartment() {
    Object.assign(this.curDepartment, {
      Code: this.DecisionProfile.Department,
      Department: this.DecisionProfile.DepartmentName,
    });
    
    this.apiService.GetListPositionDepartment(this.curDepartment).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      this.isLoading = false
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ListPosition = res.ObjectReturn

        if(Ps_UtilObjectService.hasValue(this.DecisionProfile.Position)){
          this.APIGetListLocationDepartment()
        }
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách chức danh');
      }
    },
      (err) => {
        this.isLoading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách chức danh: ${err}`);
      })
  }

  /**
   * API lấy danh sách điểm làm việc
   */
  ListLocation: DTOLocation[] // danh sách điểm làm việc
  /**
   * Hàm check disable item cho dropdown list
   * @param item 
   * @returns 
   */
  isItemDisable = (item: any): boolean => {
    return item.dataItem.StatusID != 2
  }

   /**
   * Hàm check disable item cho dropdowntree
   * @param dataItem 
   * @returns 
   */
   isTreeItemDisable = (dataItem: any): boolean => {
    return dataItem?.StatusID != 2
  }

  APIGetListLocationDepartment() {
    Object.assign(this.curDepartment, {
      Code: this.DecisionProfile.Department,
      Department: this.DecisionProfile.DepartmentName,
    });
    this.apiService.GetListLocationDepartment(this.curDepartment).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      this.isLoading = false
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ListLocation = res.ObjectReturn
        // this.listLocation.unshift(this.defaultLocationItem)
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách điểm làm việc');
      }
    },
      (err) => {
        this.isLoading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách điểm làm việ: ${err}`);
      })
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
