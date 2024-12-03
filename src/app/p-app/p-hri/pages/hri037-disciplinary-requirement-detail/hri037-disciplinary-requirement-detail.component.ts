import { ChangeDetectorRef, Component, Input, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { DTOHRDecisionProfile } from '../../shared/dto/DTOHRDecisionProfile.dto';
import { TextAreaComponent } from '@progress/kendo-angular-inputs';
import { DTOListHR, DTOPersonalInfo } from '../../shared/dto/DTOPersonalInfo.dto';
import { DTOHRDecisionMaster } from '../../shared/dto/DTOHRDecisionMaster.dto';
import { Subject } from 'rxjs';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, isCompositeFilterDescriptor, State } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DTODepartment } from '../../shared/dto/DTODepartment.dto';
import { DTOPosition } from '../../shared/dto/DTOPosition.dto';
import { DTOLocation } from '../../shared/dto/DTOLocation.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { StaffApiService } from '../../shared/services/staff-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { HriDecisionApiService } from '../../shared/services/hri-decision-api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTOResponse, Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOEmployee } from '../../shared/dto/DTOEmployee.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { EnumDialogType } from 'src/app/p-app/p-layout/enum/EnumDialogType';
import { DTOHRDecisionTask } from '../../shared/dto/DTOHRDecisionTask.dto';
import { DTOHRDecisionTaskLog } from '../../shared/dto/DTOHRDecisionTaskLog.dto';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PKendoTextboxComponent } from 'src/app/p-app/p-layout/components/p-kendo-textbox/p-textbox.component';


@Pipe({ name: 'splitStakeholderList' })
export class SplitStakeholderListPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(stakeholders: any): SafeHtml  {
    if (!stakeholders) {
      return '';
    }

    try {
      const parsedStakeholders = stakeholders;

      // Kiểm tra danh sách thứ 0 và lấy "Name | StaffID" nếu tồn tại
      if (Array.isArray(parsedStakeholders) && parsedStakeholders[0]?.[0]) {
        const firstItem = parsedStakeholders[0][0];
        return this.sanitizer.bypassSecurityTrustHtml(`<strong>${firstItem.StaffName}</strong> | ${firstItem.StaffID}`);
      }

      // Nếu danh sách thứ 0 không tồn tại hoặc rỗng, kiểm tra danh sách thứ 2
      if (parsedStakeholders[1]?.[0]) {
        const firstItem = parsedStakeholders[1][0];
        return this.sanitizer.bypassSecurityTrustHtml(`<strong>${firstItem.StaffName}</strong>`);
      }
    } catch (error) {
      console.error('Invalid ListStakeholder format:', error);
    }

    // Trả về giá trị mặc định nếu không có danh sách hợp lệ
    return '';
  }
}


@Component({
  selector: 'app-hri037-disciplinary-requirement-detail',
  templateUrl: './hri037-disciplinary-requirement-detail.component.html',
  styleUrls: ['./hri037-disciplinary-requirement-detail.component.scss']
})
export class Hri037DisciplinaryRequirementDetailComponent {
  mockDTOHRDecisionProfiles: DTOHRDecisionProfile[] = []

mockDTOHRDecisionTask: DTOHRDecisionTask[] = [];

  @Input({ required: true }) TypeData: 3 | 1 | 2 = 1;

  isProfileDialogOpen: boolean = false;
  isDeleteProfileDialogShow: boolean = false;
  isDeleteDecisionDialogShow: boolean = false;
  isInformationBlockLoading: boolean = true;
  isStoppedDialogShow: boolean = false;
  errorOccurred: any = {}
  currentFolderPopup: number = 0;
  
  //Phú thêm
  valueReason: DTOListHR;
  listItemCanChange: DTOHRDecisionTask[];
  listProperties: string [] = []


  isObligatoryReason: boolean = false;
  typeSolution: number = 1;

  @ViewChild("remark") valueRemark: TextAreaComponent;

  //#region Decision
  isAddNew: boolean = false;
  isLockAll: boolean = false;
  decision: DTOHRDecisionMaster = new DTOHRDecisionMaster();
  oldTitleName: string = ''
  oldDescription: string = ''
  arrBtnStatus: { text: string, class: string, code: string, link?: any, type?: string }[] = [];

  pickFileCallback: Function
  GetFolderCallback: Function
  listReason: DTOListHR[] = [];

  //#endregion

  //#region GRID
  isLoading: boolean = true;
  isLoadingTask: boolean = true

  isFilterDisable: boolean = false;
  gridView = new Subject<any>();
  gridDataProfile: DTOHRDecisionProfile[] = []
  gridDataTask: DTOHRDecisionTask[] = []

  page: number = 0;
  pageSize: number = 25
  pageSizes: number[] = [25, 50, 75, 100];
  total: number = 0;
  selectedProfile: DTOHRDecisionProfile;
  listReqDelProfile: DTOHRDecisionProfile[] = []

  gridStateProfile: State = {
    skip: this.page,
    take: this.pageSize,
    sort: [{ field: 'Code', dir: 'desc' }],
    filter: { filters: [], logic: 'and' },
  };

  gridStateTask: State = {
    skip: this.page,
    take: this.pageSize,
    sort: [{ field: 'Code', dir: 'desc' }],
    filter: { filters: [], logic: 'and' },
  };

  selectable: SelectableSettings = {
    enabled: false,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  selectableProfile: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  onPageChangeCallback: Function;
  onActionDropDownClickCallback: Function;
  onSelectCallback: Function;
  onSelectedPopupBtnCallback: Function;
  getActionDropdownCallback: Function;
  getSelectionPopupCallback: Function;
  uploadEventHandlerCallback: Function;
  isEffectiveDate: boolean;
  isShowReasonStatus: boolean;

  //#endregion

  //#region DRAWER
  isOpenDrawer: boolean = false
  isListTypeHrFetched: boolean = false;
  isAddNewProfile: boolean = false;
  isShowAll: boolean = false;
  isEdit: boolean = false;
  isListDepartmentLoading: boolean = false;
  isSeeDetail: boolean = false
  isDepartmentDisable: boolean;
  isPositionDisable: boolean;
  isLocationDisable: boolean;

  //0 Profile, 1 Công việc
  statusDrawer: number = 0

  decisionProfile: DTOHRDecisionProfile = new DTOHRDecisionProfile();

  curDepartment: DTODepartment = new DTODepartment();
  curPosition: DTOPosition = new DTOPosition();
  curLocation: DTOLocation = new DTOLocation();
  curTypeHr: DTOListHR = new DTOListHR();
  oldDepartment: DTODepartment = new DTODepartment();
  oldPosition: DTOPosition = new DTOPosition();
  oldLocation: DTOLocation = new DTOLocation();
  oldTypeHr: DTOListHR = new DTOListHR();
  oldDateInput: Date;
  oldNote: string;
  oldReason: string;

  listDepartment: DTODepartment[]
  listPosition: DTOPosition[]
  listLocation: DTOLocation[]
  listTypeHR: DTOListHR[];
  profileProps: string[];
  // disabledDates: Day[] = [Day.Sunday];


  typeHrDefaultItem: DTOListHR = { Code: 0, ListID: '', ListName: '-- Chọn -- ', OrderBy: 0, TypeData: 0 }
  defaultDepartmentItem: DTODepartment = new DTODepartment();
  defaultPositionItem: DTOPosition = new DTOPosition();
  defaultLocationItem: DTOLocation = new DTOLocation();

  isItemDisableCallback: Function;
  isLocationTreeDisableCallback: Function;
  pickStaffFileCallback: Function;
  GetStaffFolderCallback: Function;
  //#endregion

  //#region ENUM
  HiringENUM: number = 1
  TransferingENUM: number = 2
  TypeHrENUM: number = 5
  confirm = EnumDialogType.Confirm
  //#endregion

  //#region Permission
  justLoaded: boolean = true;
  actionPerm: any;
  isAllowedToCreate: boolean = false;
  isAllowedToVerify: boolean = false;
  isMaster: boolean = false;
  //#endregion

  //#region DATA BLOCK TASK
  ListStakeholder: {StaffID: '', StaffName: ''} = {StaffID: '', StaffName: ''}
  ListOfStakeholder: {Code: '', StaffName: ''} = {Code: '', StaffName: ''}

  currentDate: Date;
  EffectDate: Date;
  unsubscribe = new Subject<void>;


  //Phu them
  gridState: State = { skip: null, take: null, filter: { logic: 'and', filters: [] }, sort: [{ "field": "OrderBy", "dir": "asc" }] } 

  //TASK
  ListStakeholderIn: {FullName: string, Code:number}[] = []
  isOpenPopupConfirmDelete: boolean = false; // open popup confirm delete task
  selectedTaskDelete: DTOHRDecisionTask

  //Decision
  isShowComplete: boolean = false

  constructor(private menuService: PS_HelperMenuService,
    private staffService: StaffApiService,
    private layoutService: LayoutService,
    private decisionService: HriDecisionApiService,
    private domSanititizer: DomSanitizer,
    private apiServiceMar: MarNewsProductAPIService,
    private apiGetTemplateService: MarBannerAPIService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder

  ) {

  }


  ngOnInit(): void {
    //Phân quyền
    // this.menuService.changePermission().pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOPermission) => {
    //   if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
    //     this.justLoaded = false
    //     this.actionPerm = distinct(res.ActionPermission, "ActionType")

    //     this.isMaster = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
    //     this.isAllowedToCreate = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
    //     this.isAllowedToVerify = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
    //   }
    // })

    this.isMaster = true

    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);


    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)

    this.pickStaffFileCallback = this.pickStaffFile.bind(this)
    this.GetStaffFolderCallback = this.GetStaffFolderWithFile.bind(this)

    this.onSelectCallback = this.onGridItemSelect.bind(this)

    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.getSelectionPopupCallback = this.getSelectionPopupAction.bind(this)

    this.onActionDropDownClickCallback = this.onMoreActionItemClick.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectionActionItemClick.bind(this)

    this.onPageChangeCallback = this.onPageChange.bind(this);

    this.isItemDisableCallback = this.isTreeItemDisable.bind(this);
    this.isLocationTreeDisableCallback = this.isLocationTreeItemDisable.bind(this);

    this.uploadEventHandlerCallback = this.uploadEventHand.bind(this);

    this.isLoading = false;
    this.isLoadingTask = false

    // this.isOpenDrawer = true;
    // this.decisionProfile = this.gridData[0]

    this.defaultDepartmentItem.Department = '-- Chọn --'
    this.defaultDepartmentItem.StatusID = 2
    this.defaultPositionItem.Position = '-- Chọn --'
    this.defaultPositionItem.StatusID = 2
    this.defaultLocationItem.LocationName = '-- Chọn --'
    this.defaultLocationItem.StatusID = 2

    this.menuService.changePermissionAPI().pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {

        this.getCache()
        this.setupBtnStatus();
        this.APIGetListDepartment();
        this.APIGetListHR();
        this.gridState.filter.filters.push(
          {
            field: 'Decision',
            operator: 'eq',
            ignoreCase: false,
            value: this.decision.Code
          }
        )
        this.GetListDisciplinaryTask()  
        this.onLoadForm()
      }
    })
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

    var status = this.decision.Status;

    //Kiểm tra ngày hiệu lực
    this.checkIsEffectiveDate();
    
    if (this.decision.Code != 0) {

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
      if (canVerify && (status === 1 || (status === 3 && !this.isEffectiveDate))) {
        // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và status = 1 hoặc status = 3
        this.arrBtnStatus.push({
          text: 'TRẢ VỀ',
          class: 'k-button btn-hachi hachi-warning hachi-secondary',
          code: 'undo',
          link: 4,
          type: 'status'
        });

        this.arrBtnStatus.push({
          text: 'DUYỆT ÁP DỤNG',
          class: 'k-button btn-hachi hachi-primary',
          code: 'check-outline',
          link: 2,
          type: 'status'
        });

      }

      const effDate =  new Date(this.decision.EffDate) 
      this.currentDate.setHours(0,0,0,0)
      effDate.setHours(0,0,0,0)
      // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và status = 2
      if (canVerify && status === 2 && Ps_UtilObjectService.getDaysLeft(this.EffectDate, this.currentDate) < 0) {
        this.arrBtnStatus.push({
          text: 'NGƯNG HIỂN THỊ',
          class: 'k-button btn-hachi hachi-warning',
          code: 'minus-outline',
          link: 3,
          type: 'status'
        });
      }

      // Push "Xóa" khi có quyền tạo hoặc toàn quyền và status === 0
      if (canCreateOrAdmin && this.decision.Status == 0) {
        this.arrBtnStatus.unshift({
          text: 'XÓA YÊU CẦU',
          class: 'k-button btn-hachi hachi-warning',
          code: 'trash',
          type: 'delete',
          link: 5
        });
      }
   
      if (canVerify && this.decision.Status == 2 &&  Ps_UtilObjectService.getDaysLeft(this.EffectDate, this.currentDate) >= 0 && this.isShowComplete) {
        this.arrBtnStatus.unshift({
          text: 'HOÀN TẤT',
          class: 'k-button btn-hachi hachi-primary',
          code: 'check-outline',
          type: 'complete',
          link: 5
        });
      }
    }

    if (canCreateOrAdmin) {

      this.arrBtnStatus.push({
        text: 'Thêm MỚI',
        class: 'k-button btn-hachi hachi-primary',
        code: 'plus',
        type: 'add',
        link: 0
      });
    }
  }

  /**
   * Hàm xử lí sự kiện click của các btn trên header
   * @param typeBtn 
   * @param codeStatus 
   */
  onHeaderBtnClick(typeBtn: string, codeStatus: number) {
    if (typeBtn == 'add') {
      this.onAddNew();
    }

    if (typeBtn == 'delete') {
      this.isDeleteDecisionDialogShow = true;
    }

    if (typeBtn == 'status') {
      this.onUpdateStatus(codeStatus)
    }

    if(typeBtn == 'complete'){
      this.APICreateDecisionDisciplinary(this.decision)
    }
  }

  /**
   * Hàm kiểm tra xem đã đến ngày hiệu lực chưa
   */
  checkIsEffectiveDate(){
    const checkEffectiveDate = (Ps_UtilObjectService.getDaysLeft(this.currentDate, this.decision.EffDate) > 0)
    this.isEffectiveDate = !checkEffectiveDate;
  }

  /**
   * Hàm xử lí khi nhấn vào breadcrumb
   */
  onBreadCrumbClick() {
    if (!this.isFilterDisable) {
      this.gridStateProfile.filter.filters = []
      this.APIGetHRDecisionMaster()
      this.GetListDisciplinaryTask()
      this.loadFilter();
    }
  }

  /**
   * Hàm xử lí khi người dùng ấn thêm mới quyết định
   */
  onAddNew() {
    this.isAddNew = true;
    this.isLockAll = false;
    this.decision = new DTOHRDecisionMaster();
    this.decision.TypeData = 5
    this.gridDataProfile = []
    this.gridView.next({ data: this.gridDataProfile, total: this.total });
    this.setupBtnStatus();
  }

  /**
   * Hàm xử update trạng thái quyết định
   * @param status 
   */
  onUpdateStatus(status: number) {
    // Nếu trạng thái được nhấn là gửi duyệt hoặc duyệt áp dụng
    if (status == 1 || status == 2) {
      //Nếu các trường bắt buộc đủ thông tin thì gọi API
      if (this.onRequiredFieldCheck()) {
        this.APIUpdateHRDecisionMasterStatus([this.decision], status)
      }
    } else {
      this.APIUpdateHRDecisionMasterStatus([this.decision], status)
    }
  }

  /**
   * Hàm xử lí hiển thị popup folder
   * @param value 
   */
  onUploadImg(value: number) {
    this.currentFolderPopup = value;
    this.layoutService.folderDialogOpened = true
  }

  /**
   * Hàm xử lí khi người dùng chọn file hình ảnh cho texteditor
   * @param e 
   * @param width 
   * @param height 
   */
  pickFile(e: DTOCFFile, width, height) {
    this.layoutService.getEditor().embedImgURL(e, width, height)
    this.layoutService.setFolderDialog(false)
  }

  /**
 * Hàm xử lí khi người dùng chọn file hình ảnh cho drawer
 * @param e 
 * @param width 
 * @param height 
 */
  pickStaffFile(e: DTOCFFile, width, height) {
    this.decisionProfile.ImageThumb = e?.PathFile.replace('~', '')
    this.layoutService.setFolderDialog(false)
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
   * Hàm lấy ảnh từ component app folder với folder cơ cấu tổ chức
   * @param childPath 
   * @returns 
   */
  GetStaffFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog()) {
      return this.apiServiceMar.GetFolderWithFile(childPath, 14);
    }
    //14 = folder cơ cấu tổ chức
  }

  /**
   * Hàm dùng để check các trường bắt buộc của quyết định
   * @param isSkipMsg bỏ qua thông báo mặc định là false
   * @returns true | false
   */
  onRequiredFieldCheck(isSkipMsg: boolean = false) {
    const typeDecision = 'yêu cầu kỷ luật'
    let msgStr = `Đã xảy ra lỗi khi cập nhật trạng thái quyết định ${typeDecision} ${this.decision.DecisionID ?? 'không xác định'}: thiếu `;
    if (!Ps_UtilObjectService.hasValueString(this.decision.DecisionName)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Tiêu đề')
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(this.decision.EffDate)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Ngày hiệu lực')
      }
      return false;
    }

    const effDate = new Date(this.decision.EffDate);
    const currentDate = new Date();

    // Chỉ so sánh ngày, bỏ qua giờ phút giây
    if (
      Ps_UtilObjectService.hasValueString(this.decision.EffDate) &&
      effDate.setHours(0, 0, 0, 0) < currentDate.setHours(0, 0, 0, 0)
    ) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Ngày hiệu lực không được là ngày trong quá khứ');
      }
      return false;
    }

    else if (!Ps_UtilObjectService.hasListValue(this.gridDataProfile)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `Danh sách ${typeDecision}`)
      }
      return false;
    }

    return true;
  }

  /**
   * Hàm xử lí khi nhấn nút thêm mới hồ sơ
   */
  onAddNewProfile() {
    this.isOpenDrawer = true;
    this.statusDrawer = 0
    this.isAddNewProfile = true;
    this.isShowAll = false;
    this.decisionProfile = new DTOHRDecisionProfile();
    this.curDepartment.Code = this.decisionProfile.Department
    this.curPosition.Code = this.decisionProfile.Position
    this.curLocation.Code = this.decisionProfile.Location
    this.assignDefaultDropValue();
  }

  /**
   * Hàm nhận giá trị từ grid khi có item được chọn
   * @param isSelected 
   */
  onGridItemSelect(isSelected: boolean) {
    this.isFilterDisable = isSelected;
  }

  /**
   * Hàm lấy các action khi user nhấn nút more action
   * @param moreActionDropdown 
   * @param dataItem 
   * @returns 
   */
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    moreActionDropdown = []
    var status = this.decision.Status
    this.decisionProfile = JSON.parse(JSON.stringify(dataItem))

    // Action chỉnh sửa và xem chi tiết
    if (((status == 0 || status == 4) && (this.isAllowedToCreate || this.isMaster)) || (status == 1 && (this.isAllowedToVerify || this.isMaster))) {
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
      moreActionDropdown.push({ Name: "Xóa công việc", Code: "trash", Type: 'delete', Actived: true })
    }

    else if (status == 2 && (this.isMaster || this.isAllowedToVerify)) {
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    }

    else {
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
    }

    return moreActionDropdown
  }

  /**
   * Hàm lấy các action cho popup khi người dùng chọn nhiều item
   * @param arrItem 
   * @returns 
   */
  getSelectionPopupAction(arrItem: any[]) {
    if(this.TypeData != 3){
      var moreActionDropdown = new Array<MenuDataItem>()
      var status = this.decision.Status
  
      if (((status == 0 || status == 4) && (this.isAllowedToCreate || this.isMaster)) || (status == 1 && (this.isAllowedToVerify || this.isMaster))) {
        moreActionDropdown.push({ Name: "Xóa hồ sơ", Code: "trash", Type: 'Delete', Link: "delete", Actived: true })
      }
  
      if (status == 2) {
        moreActionDropdown.push({ Name: "Xuất Offer", Code: "file-word", Type: 'Word', Link: "ExportWord", Actived: true })
      }
    }else if(this.TypeData == 3){
      var moreActionDropdown = new Array<MenuDataItem>()
      var status = this.decision.Status
      moreActionDropdown.push({ Name: "Xóa nhân sự", Code: "trash", Type: 'Delete', Link: "delete", Actived: true })
    }

    return moreActionDropdown
  }

  convertIconToImage(inputHtml: string, fileType: string) {

    // Tạo thẻ <img> thay thế
    inputHtml = inputHtml.replace(
      // /<span class=".*?k-icon"><\/span>/,
      /<img class="k-image" src="assets\\img\\logo\\xlsx.svg">/,
      `/<img class="k-image" src="assets\img\logo\docs.svg" />/`
    );

  }

  /**
   * Hàm xử lí action được chọn trên popup
   * @param menu menu action đã nhấn
   * @param item chính sách được chọn
   */
  onMoreActionItemClick(menu: MenuDataItem, item: any) {
    if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
      if (menu.Code == 'pencil') {
        this.isEdit = true;
      }
      else if (menu.Code == 'eye') {
        this.isSeeDetail = true;
        this.isView = true
        this.isEdit = false;
      }
      this.statusDrawer = 1
      this.isOpenDrawer = true;
      this.isShowAll = true;
      this.statusDrawer = 1
      this.MultiForm = this.onLoadForm();
      this.MultiForm.patchValue(item);

      this.APIGetListEmployee()
      
      this.listStakeholderOut = item.ListStakeholder[1]

       this.ListStakeholderIn = this.MultiForm.get('ListStakeholder').value[0].map(item => ({
        Code: item.Code,
        FullName: item.StaffName,
      }));


      this.MultiForm.patchValue({
        ListHRDecisionProfile: item.ListStakeholder[0]
      })
    }
    else if (menu.Link == 'delete' || menu.Code == 'trash') {
      this.selectedTaskDelete = item
      this.isOpenPopupConfirmDelete = true
      
    }
    else if (menu.Link == '3' || menu.Code == "minus-outline") {
      this.isStoppedDialogShow = true;
      setTimeout(() => {
        if (this.TypeData == 2) {
          this.toggleBorder('return');
        }
      }, 1)
      this.APIGetListHR();
    }
  }


  /**
     * Hàm xử lí action được chọn trên dialog
     * @param btnType Loại action đã nhấn
     * @param listSelectedItem List các item đã được chọn
     * @param value Value của action đã nhấn
     */
  onSelectionActionItemClick(btnType: string, listSelectedItem: any[], value: any) {

    if (btnType == 'Delete') {
      this.listReqDelProfile = listSelectedItem
      if (Ps_UtilObjectService.hasListValue(this.listReqDelProfile)) {
        this.isDeleteProfileDialogShow = true;
      }
    }


    if (btnType == 'Word') {
      this.listReqDelProfile = listSelectedItem
      if (Ps_UtilObjectService.hasListValue(this.listReqDelProfile)) {
        this.APIGetHRDecisionProfileReportWord(this.listReqDelProfile)
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
    this.gridStateProfile.skip = event.skip
    this.gridStateProfile.take = event.take

    this.loadFilter();
  }

  /**
   * Hàm lấy cache
   */
  getCache() {
    const cacheItem = JSON.parse(localStorage.getItem('HrDecisionMaster'));
    if (Ps_UtilObjectService.hasValue(cacheItem)) {
      this.decision = cacheItem
      if (this.decision.Code == 0) {
        this.isAddNew = true;
        this.isInformationBlockLoading = false;
      } else {
        this.isAddNew = false;
        this.APIGetHRDecisionMaster();
        this.loadFilter()
      }
    }
  }

  /**
   * Hàm loaddata cho grid
   */
  loadFilter() {
    //Kiểm tra nếu như filter descriptor đã tồn tại
    const containedDescriptor = this.gridStateProfile.filter.filters.findIndex((v: FilterDescriptor | CompositeFilterDescriptor) => {
      return !isCompositeFilterDescriptor(v) && v.field === 'Decision';
    });

    if (containedDescriptor == -1) {
      this.gridStateProfile.filter.filters.push(
        {
          field: 'Decision',
          operator: 'eq',
          ignoreCase: false,
          value: this.decision.Code
        }
      )
    }

    this.APIGetListHRDecisionProfile()
  }

  /**
   * Hàm xử lí khi user tiến hành filter
   * @param filterDescriptor 
   */
  onFilterChange(filterDescriptor: any) {
    this.page = 0;
    this.gridStateProfile.skip = 0;
    this.gridStateProfile.filter.filters = []
    if (filterDescriptor.filters[0]?.value != '') {
      this.gridStateProfile.filter.filters = [filterDescriptor];
    }
    this.loadFilter();
  }

  /**
   * Hàm xử lí khi user nhấn nút lưu ở text editor
   * @param value 
   */
  onSaveEditContent(value: any) {
    // if (Ps_UtilObjectService.hasValueString(value?.trim())) {
    this.decision.Description = value;
    this.APIUpdateHRDecisionMaster(this.decision, ['Description']);
    // } 
    // else {
    //   this.decision.Description = this.oldDescription + ' '
    // }
  }

  /**
   * Hàm chung xử lí khi giá trị thay đổi 
   * @param props properties
   * @param TypeValueChange phân loại
   * @param value giá trị
   */
  onValueChanged(props: string[], TypeValueChange: number = 0, value?: any) {
    if (TypeValueChange == 0) {
      if (this.isAddNew) {
        props.push('Code')
        props.push('TypeData')
        props.push('EffDate')
      }

      if (props[0] == 'DecisionName') {
        if (!this.oldValueCheck(this.oldTitleName, this.decision.DecisionName)) {
          this.APIUpdateHRDecisionMaster(this.decision, props);
        }
        else {
          this.decision.DecisionName = this.oldTitleName;
        }
      } else {
        this.APIUpdateHRDecisionMaster(this.decision, props);
      }
    }

    if (TypeValueChange == 1) {
      if (this.isAddNewProfile) {
        // if (this.TypeData == 1) {
        //   const personalInfo = new DTOPersonalInfo();
        //   personalInfo.IdentityNo = this.decisionProfile.IdentityNo;
        //   this.APIGetHRPersonalProfileByCICN(personalInfo);
        // }
        // else if (this.TypeData == 2) {
          const employee = new DTOEmployee();
          employee.StaffID = this.decisionProfile.StaffID;
          this.APIGetHREmployeeByID(employee)
        // }
      }
    }

    if (TypeValueChange == 2) {
      this[props[0]] = value

      if (props[0] == 'curDepartment') {
        this.curPosition.Code = null;
        this.curLocation.Code = null;
        this.APIGetListPositionDepartment()
        this.APIGetListLocationDepartment()
      }
      else if (props[0] == 'curPosition') {
        if (this.curPosition.Code == 0 || !this.curPosition.Code) {
          this.curLocation.Code = null;
        }
      }

      this.assignDefaultDropValue()
    }

  }

  /**
   * Kiểm tra giá trị cũ và mới
   * @param oldValue Giá trị cũ
   * @param newValue Giá trị mới
   * @returns true khi trùng hoặc false không trùng
   */
  oldValueCheck(oldValue: any, newValue: any): boolean {
    if (oldValue.trim() === newValue.trim() || newValue.trim() === '') {
      return true;
    }
    return false;
  }

  /**
   * Hàm xử lí khi đóng drawer
   */
  onCloseDrawer() {
    
    this.isAddNewProfile = false;
    this.isEdit = false;
    this.isSeeDetail = false;
    this.isShowAll = false;
    this.curTypeHr = JSON.parse(JSON.stringify(this.typeHrDefaultItem))
    this.assignDefaultDropValue();
    this.isOpenDrawer = false;
  }


  /**
   * Hàm gán giá trị default cho dropdown trên drawer
   * Nếu chưa chọn department thì set default cho location và positon
   * Nếu chưa chọn position thì set default cho location
   */
  assignDefaultDropValue() {
    if (this.curDepartment.Code == 0 || !this.curDepartment.Code || !Ps_UtilObjectService.hasValue(this.curDepartment)) {
      this.curDepartment = JSON.parse(JSON.stringify(this.defaultDepartmentItem))
      this.curPosition = JSON.parse(JSON.stringify(this.defaultPositionItem))
      this.curLocation = JSON.parse(JSON.stringify(this.defaultLocationItem))
    }
    else if (this.curPosition.Code == 0 || !this.curPosition.Code || !Ps_UtilObjectService.hasValue(this.curPosition)) {
      this.curPosition = JSON.parse(JSON.stringify(this.defaultPositionItem))
      this.curLocation = JSON.parse(JSON.stringify(this.defaultLocationItem))
    }
    else if (this.curLocation.Code == 0 || !this.curLocation.Code || !Ps_UtilObjectService.hasValue(this.curLocation)) {
      this.curLocation = JSON.parse(JSON.stringify(this.defaultLocationItem))
    }
  }

  /**
   * Hàm xử lí cho các nút action trên drawer
   * @param TypeBtn 
   */
  onDrawerBtnClick(TypeBtn?: string) {
    if (TypeBtn == 'Delete') {
      this.isDeleteProfileDialogShow = true;
      this.listReqDelProfile = [];
      this.listReqDelProfile.push(this.decisionProfile)
    } else {
      this.decisionProfile.Decision = this.decision.Code
      this.decisionProfile.Department = null
      this.decisionProfile.DepartmentName = this.curDepartment.Department
      this.decisionProfile.Position = null
      this.decisionProfile.PositionName = this.curPosition.Position
      this.decisionProfile.Location = null
      this.decisionProfile.LocationName = this.curLocation.LocationName
      this.decisionProfile.TypeStaff = 1;
      this.decisionProfile.TypeStaffName = 'Nhân viên không chính thức';
      if (this.onRequiredValueCheck(this.decisionProfile)) {
        if (TypeBtn == 'Update') {
          let isNoteChanged: boolean = false;
          let isReasonChanged: boolean = false;
          if (this.TypeData == 1) {
            isNoteChanged = (this.oldNote != this.decisionProfile.Remark)
          }
          else if (this.TypeData == 2) {
            isNoteChanged = (this.oldNote != this.decisionProfile.Remark)
            isReasonChanged = (this.oldReason != this.decisionProfile.Reason)
          }

          if (this.oldDepartment.Code != this.curDepartment.Code || this.oldPosition.Code != this.curPosition.Code
            || this.oldLocation.Code != this.curLocation.Code || this.oldTypeHr.OrderBy != this.curTypeHr.OrderBy
            || Ps_UtilObjectService.getDaysDiff(this.oldDateInput, new Date(this.decisionProfile.JoinDate)) != 0
            || isNoteChanged || isReasonChanged) {
            this.APIUpdateHRDecisionProfile(this.decisionProfile);
          } else {
            this.onCloseDrawer();
          }
        }
        else {
          this.APIUpdateHRDecisionProfile(this.decisionProfile);
        }
      }
    }
  }

  /**
   * Hàm check các trưởng bắt buộc của drawer
   * @param DTO 
   * @param isSkipMsg 
   * @returns 
   */
  onRequiredValueCheck(DTO: DTOHRDecisionProfile, isSkipMsg: boolean = false) {
    const TypeUpdate = DTO.Code == 0 ? 'Thêm mới thông tin' : 'Cập nhật thông tin';
    const toastText = "yêu cầu kỷ luật"


    let msgStr = `Đã xảy ra lỗi khi ${TypeUpdate} ${toastText}: Thiếu `;
    if ((!Ps_UtilObjectService.hasValue(DTO.PersonalProfile)) ) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `CMND/CCCD`)
      }
      return false;
    }
    else if ((!Ps_UtilObjectService.hasValue(DTO.StaffID))) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `mã nhân sự`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.CurrentDepartmentName)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `đơn vị`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.CurrentPositionName) ) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `chức danh`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.CurrentLocationName)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `điểm làm việc`)
      }
      return false;
    }

    return true
  }

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


  /**
     * Hàm check disable item cho dropdowntree location
     * @param dataItem 
     * @returns 
     */
  isLocationTreeItemDisable = (dataItem: any): boolean => {
    return !dataItem.IsChoose
  }

  /**
   * Display group button add
   * @returns true if availabel
   */
  checkDisplayGroupButtonAdd() {
    if (!this.isAllowedToVerify && !this.isMaster && !this.isAllowedToCreate) {
      return false;
    }

    if (this.decision.Status == 0 || this.decision.Status == 4) {
      if (this.isAllowedToCreate || this.isMaster) {
        return true;
      }
    }
    if (this.decision.Status == 1) {
      if (this.isAllowedToVerify || this.isMaster) {
        return true;
      }
    }
    return false;
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
      if (this.errorOccurred[imageKey]) { return this.getResHachi(a); }
      else {
        return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
      }
    }
    else {
      return '../../../../../assets/img/icon/icon-nonImageThumb.svg'
    }

  }
  handleError(imageKey: string) { this.errorOccurred[imageKey] = true; }

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
   * Hàm lấy các tên bị ẩn cho popup xoá
   * @returns 
   */
  getRemainingProfileNames(): string {
    return this.listReqDelProfile.slice(2).map(item => item.FullName).join('\n');
  }

  /**
   * Hàm toggle popup xoá quyết định
   */
  toggleDeleteDecisionDialog() {
    this.isDeleteDecisionDialogShow = !this.isDeleteDecisionDialogShow
  }

  /**
   * Hàm toggle popup xoá ảnh hồ sơ
   */
  toggleProfileDialog() {
    this.isProfileDialogOpen = !this.isProfileDialogOpen
  }

  /**
   * Hàm toggle popup xoá hồ sơ
   */
  toggleDeleteProfileDialog() {
    this.isDeleteProfileDialogShow = !this.isDeleteProfileDialogShow
  }

  /**
* Hàm toggle popup ngưng tuyển dụng/ điều chuyển
*/
  toggleStoppedDialog() {
    this.isStoppedDialogShow = !this.isStoppedDialogShow;
    this.valueReason = null;
  }

  /**
   * Hàm xử lí xoá ảnh hồ so
   */
  deleteProfileImg() {
    this.decisionProfile.ImageThumb = ''
    this.toggleProfileDialog()
  }

  /**
   * Hàm xử lí confirm dialog
   * @param dialog 1: xoá quyết định | 2 xoá hồ sơ trong quyết định
   */
  onDiaglogConfirm(dialog: number) {

    if (dialog == 1) {
      this.APIDeleteHRDecisionMaster([this.decision])
    }
    else if (dialog == 2) {
      this.APIDeleteHRDecisionProfile(this.listReqDelProfile);
    }else if(dialog == 3){
      this.listProperties.push('Status', 'Reason', 'ReasonDescription');
      this.selectedTask.Reason = this.valueReason.Code;
      this.selectedTask.ReasonDescription = this.valueRemark.value;
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
          this.toggleClosedDialog();
          this.isConfirmDialogShow = false;
          this.selectedTask.ListStakeholder = null
          this.APIUpdateListHRDecisionTask([this.selectedTask], this.listProperties)
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
          this.selectedTask.ListStakeholder = null
          this.APIUpdateListHRDecisionTask([this.selectedTask], this.listProperties)
          this.toggleClosedDialog();
        }
      }
    }else if(dialog == 4){

      this.listProperties.push('Status')
      this.isConfirmDialogSent = false;
      this.selectedTask.ListStakeholder = null;
      this.APIUpdateListHRDecisionTask([this.selectedTask], this.listProperties)
      this.toggleClosedDialog()
    }
  }

  /**
   * Hàm lấy value reason khi change select
   * @param value value reason được chọn
   */
  getValueChangeDropdownReason(value: DTOListHR) {
    this.valueReason = value;
    
    if (value.OrderBy == 6) {
      this.isObligatoryReason = true;
    } else {
      this.isObligatoryReason = false;
    }
  }

  /**
   * Hàm xử lý khi chọn confirm của dialog ngưng
   */
  onDiaglogConfirmStopped() {
    let listDecisionProfile: DTOHRDecisionProfile[] = [];
    let tempProfile: DTOHRDecisionProfile = { ...this.decisionProfile };

    //Khi đang ở quyết định tuyển dụng
    if (this.TypeData == 1) {
      //Nếu reason đã được chọn cụ thể
      if (Ps_UtilObjectService.hasValue(this.valueReason) && Ps_UtilObjectService.hasValue(this.valueReason.Code)) {
        tempProfile.ReasonStatusDescription = this.valueRemark.value;
        tempProfile.ReasonStatus = this.valueReason.Code;
        tempProfile.ReasonStatusName = this.valueReason.ListName;
        //Nếu chọn reason là "Lý do khác"
        if (this.isObligatoryReason == true) {
          //Kiểm tra xem đã nhập mô tả lý do chưa
          if (Ps_UtilObjectService.hasValueString(this.valueRemark.value)) {
            listDecisionProfile.push(tempProfile);

            this.APIUpdateHRDecisionProfileStatus(listDecisionProfile, 3);
          } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hồ sơ của ${this.decisionProfile.FullName}: vì chưa nhập mô tả `);
          }
        } else {
          listDecisionProfile.push(tempProfile);
          this.APIUpdateHRDecisionProfileStatus(listDecisionProfile, 3);
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hồ sơ của ${this.decisionProfile.FullName}: vì chọn lí do `);
      }
    }
    //Khi đang ở quyết định điều chuyển
    else if (this.TypeData == 2) {
      if (Ps_UtilObjectService.hasValue(this.valueReason) && Ps_UtilObjectService.hasValue(this.valueReason.Code)) {
        tempProfile.ReasonStatusDescription = this.valueRemark.value;
        tempProfile.ReasonStatus = this.valueReason.Code;
        tempProfile.ReasonStatusName = this.valueReason.ListName;
        if (this.isObligatoryReason == true) {
          if (Ps_UtilObjectService.hasValueString(this.valueRemark.value)) {
            tempProfile.TypeStop = this.typeSolution;
            listDecisionProfile.push(tempProfile);

            this.APIUpdateHRDecisionProfileStatus(listDecisionProfile, 3);
          } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hồ sơ của ${this.decisionProfile.FullName}: vì chưa nhập mô tả `);
          }
        } else {
          tempProfile.TypeStop = this.typeSolution;
          listDecisionProfile.push(tempProfile);

          this.APIUpdateHRDecisionProfileStatus(listDecisionProfile, 3);
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hồ sơ của ${this.decisionProfile.FullName}: vì chọn lí do `);
      }
    }
  }


  /**
   * Hàm xử lí hiển thị mã nhân sự nếu quyết định đã được duyệt và tới ngày hiệu lực
   * @returns 
   */
  checkStaffIDVisibility(): boolean {
    return !(((this.decision.Status == 2 || this.decision.Status == 3) && Ps_UtilObjectService.getDaysLeft(this.currentDate, this.decision.EffDate) <= 0) || this.TypeData == 2)
  }

  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(true)
  }

  uploadEventHand(e: File) {
    this.APIImportExcelPosition(e)
  }

  /**
   * Hàm check value string dùng bên HTML
   * @param value 
   * @returns 
   */
  checkValueString(value: string): boolean {
    if (Ps_UtilObjectService.hasValueString(value)) {
      return true;
    }

    return false;
  }

  /**
   * Hàm trả về chuỗi string trạng thái của hồ sơ trong quyết định
   * @param status code status hồ sơ trong quyết định
   * @param typeBoard loại quyết định
   * @returns 
   */
  formatStringValueStatus(status, typeBoard): string {
    let valueString = "";
    if (typeBoard == 1) {
      switch (status) {
        case 1:
          valueString = "Chuẩn bị Onboarding";
          break;
        case 2:
          valueString = "Onboarding";
          break;
        case 3:
          valueString = "Ngưng Onboarding";
          break;
        case 4:
          valueString = "Onboarded";
          break;
      }
    } else {
      switch (status) {
        case 1:
          valueString = "Chuẩn bị Offboarding";
          break;
        case 2:
          valueString = "Offboarding";
          break;
        case 3:
          valueString = "Ngưng Offboarding";
          break;
        case 4:
          valueString = "Offboarded";
          break;
      }
    }
    return valueString;
  }


  /**
   * Hàm lấy chuỗi string status của danh sách child profile
   * @param listChild 
   * @param typeBoard 
   * @returns 
   */
  getStringStatusOfListChild(listChild: DTOHRDecisionProfile[], typeBoard: number): { status: number, statusName: string } {
    let result = {
      status: 0,
      statusName: ""
    };

    const itemProfile = listChild?.find(item => item.BoardingType === typeBoard);

    if (itemProfile) {
      result.status = itemProfile.Status;
      result.statusName = this.formatStringValueStatus(itemProfile.Status, typeBoard);
    }

    return result;
  }

  /**
   * Hàm xử lý khi check radio return hoặc quit
   * @param radio return hoặc quit
   */
  toggleBorder(radio) {
    if (radio === 'return') {
      this.typeSolution = 1;
      (document.getElementById('return') as HTMLInputElement).checked = true;
      (document.getElementById('quit') as HTMLInputElement).checked = false;

      document.querySelectorAll('.box-checkbox-return').forEach((returnEl) => {
        returnEl.classList.add('active');
      });

      document.querySelectorAll('.box-checkbox-quit').forEach((quitEl) => {
        quitEl.classList.remove('active');
      });

    } else if (radio === 'quit') {
      this.typeSolution = 2;
      (document.getElementById('quit') as HTMLInputElement).checked = true;
      (document.getElementById('return') as HTMLInputElement).checked = false;

      document.querySelectorAll('.box-checkbox-quit').forEach((quitEl) => {
        quitEl.classList.add('active');
      });

      document.querySelectorAll('.box-checkbox-return').forEach((returnEl) => {
        returnEl.classList.remove('active');
      });
    }
  }


  //#region API 

  /**
   * API lấy danh sách loại nhân sự
   */
  APIGetListHR() {
    this.staffService.GetListHR(this.TypeHrENUM).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listTypeHR = res.ObjectReturn
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách loại nhân sự: ' + res.ErrorString);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách loại nhân sự: ${err}`);
      })

    if (this.isStoppedDialogShow) {
      let enumType = 26;
      if (this.TypeData == 2) {
        enumType = 25;
      }
      this.staffService.GetListHR(enumType).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
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
  }

  /**
   * API lấy danh sách đơn vị
   */
  APIGetListDepartment() {
    const temp = new DTODepartment()
    temp['Code'] = 1, temp['IsTree'] = true
    this.isListDepartmentLoading = true
    this.decisionService.GetListDepartment(temp).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      this.isListDepartmentLoading = false
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listDepartment = res.ObjectReturn
        this.listDepartment.unshift(this.defaultDepartmentItem)
        this.APIGetListPositionDepartment()
        this.APIGetListLocationDepartment()
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách đơn vị');
      }
    },
      (err) => {
        this.isListDepartmentLoading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đơn vị: ${err}`);
      })
  }

  /**
   * API lấy danh sách chức danh
   */
  APIGetListPositionDepartment() {
    this.decisionService.GetListPositionDepartment(this.curDepartment).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      this.isListDepartmentLoading = false
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPosition = res.ObjectReturn
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách chức danh');
      }
    },
      (err) => {
        this.isListDepartmentLoading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách chức danh: ${err}`);
      })
  }

  /**
   * API lấy danh sách điểm làm việc
   */
  APIGetListLocationDepartment() {
    this.decisionService.GetListLocationDepartment(this.curDepartment).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      this.isListDepartmentLoading = false
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listLocation = res.ObjectReturn
        this.listLocation.unshift(this.defaultLocationItem)
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách điểm làm việc');
      }
    },
      (err) => {
        this.isListDepartmentLoading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách điểm làm việ: ${err}`);
      })
  }

  /**
   * API lấy quyết định
   */
  APIGetHRDecisionMaster() {
    this.isInformationBlockLoading = true;
    const apiText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
    this.decisionService.GetHRDecisionMaster(this.decision).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      this.isInformationBlockLoading = false;
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.decision = res.ObjectReturn
        this.oldTitleName = this.decision.DecisionName
        this.oldDescription = this.decision.Description
        localStorage.setItem('HrDecisionMaster', JSON.stringify(this.decision));
        const status = this.decision.Status
        this.checkIsEffectiveDate();
        if(this.isEffectiveDate == true && this.decision.Status == 2){
          this.APIGetListHRDecisionProfile();
        }

        if (((status == 0 || status == 4) && (this.isAllowedToCreate || this.isMaster)) || (status == 1 && (this.isAllowedToVerify || this.isMaster))) {
          this.isLockAll = false;
        }
        else {
          this.isLockAll = true
        }
        this.EffectDate = new Date(this.decision.EffDate)
        this.EffectDate.setHours(0, 0, 0, 0)

        this.setupBtnStatus()
      }
      else {
        this.layoutService.onError('Đã xảy ra lỗi khi lấy thông tin quyết định: ' + res.ErrorString);
      }
    },
      (err) => {
        this.isInformationBlockLoading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin quyết định ${apiText}: ${err}`);
      })
  }

  /**
   * API lấy danh sách hồ sơ điều chuyển/ tuyển dụng
   */
  APIGetListHRDecisionProfile() {
    const apiText = 'yêu cầu kỷ luật'
    this.isLoading = true
    this.decisionService.GetListHRDecisionProfile(this.gridStateProfile).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      this.isLoading = false
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if(this.TypeData == 3){
          this.gridDataProfile = this.mockDTOHRDecisionProfiles
        }else{
          this.gridDataProfile = res.ObjectReturn.Data;
        }
  
        this.total = res.ObjectReturn.Total
        if (this.gridDataProfile.length <= 0 && this.total != 0) {
          this.page -= 1;
          this.gridStateProfile.skip -= 1;
          this.loadFilter();
        }
        this.gridView.next({ data: this.gridDataProfile, total: this.total });
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách hồ sơ ${apiText}: ` + res.ErrorString);
      }

    },
      (err) => {
        this.isLoading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách hồ sơ ${apiText}: ${err}`);
      })
  }

  /**
   * API lấy hồ sơ tuyển dụng/ điều chuyển
   */
  APIGetHRDecisionProfile() {
    const apiText = 'yêu cầu kỷ luật'
    this.decisionService.GetHRDecisionProfile(this.decisionProfile).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.decisionProfile = res.ObjectReturn
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy hồ sơ ${apiText}: ` + res.ErrorString);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy hồ sơ ${apiText}: ${err}`);
      })
  }

  /**
   * API cập nhật thông tin quyết định
   * @param DTODecision Quyết định cần update
   * @param Properties Props cần update
   */
  APIUpdateHRDecisionMaster(DTODecision: DTOHRDecisionMaster, Properties: string[]) {
    const TypeUpdate = DTODecision.Code == 0 ? 'Thêm mới' : 'Cập nhật thông tin';
    const apiText = 'Yêu cầu kỷ luật'
    this.decision.TypeData = 5

    if (DTODecision.Code == 0) {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      DTODecision.EffDate = date.toISOString();
    }
    this.decisionService.UpdateHRDecisionMaster(DTODecision, Properties).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.decision = res.ObjectReturn
        this.oldTitleName = this.decision.DecisionName
        this.oldDescription = this.decision.Description
        this.isAddNew = false;
        localStorage.setItem('HrDecisionMaster', JSON.stringify(this.decision));
        this.setupBtnStatus();
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
   * API cập nhật trạng thái quyết định
   * @param listDTODecision danh sách quyết định cần update
   * @param reqStatus Status cần update
   */
  APIUpdateHRDecisionMasterStatus(listDTODecision: DTOHRDecisionMaster[], reqStatus: number) {
    const apiText = 'yêu cầu kỷ luật'
    this.decisionService.UpdateHRDecisionMasterStatus(listDTODecision, reqStatus).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Cập nhật trạng thái quyết định ${apiText} thành công`);
        this.APIGetHRDecisionMaster();

        // kiểm tra khi lần cập nhật này là cập nhật cho status duyệt và đã đến ngày hiệu lực
        if(reqStatus == 2 && new Date(listDTODecision[0].EffDate) >= new Date()){
          this.APIGetHRDecisionProfile()
        }
        this.checkStatusDecision(this.gridDataTask)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái quyết định ${apiText}: ` + res.ErrorString);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái quyết định ${apiText}: ${err}`);
      })
  }

  /**
   * API Hoàn tất yêu cẩu
   * @param DTODecision yêu cầu hoàn tất
   */
  APICreateDecisionDisciplinary(DTODecision: DTOHRDecisionMaster) {
    const apiText = 'yêu cầu kỷ luật'
    this.decisionService.CreateDecisionDisciplinary(DTODecision).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Hoàn tất ${apiText} thành công`);
        this.APIGetHRDecisionMaster();
        this.checkStatusDecision(this.gridDataTask)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi Hoàn tất ${apiText}: ` + res.ErrorString);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi Hoàn tất ${apiText}: ${err}`);
      })
  }

  /**
   * API cập nhật hồ sơ 
   * @param DTODecisionProfile 
   */
  APIUpdateHRDecisionProfile(DTODecisionProfile: DTOHRDecisionProfile) {
    const TypeUpdate = DTODecisionProfile.Code == 0 ? 'Thêm mới' : 'Cập nhật thông tin';
    const apiText = "yêu cầu kỷ luật"
    DTODecisionProfile.DecisionType = 5
    this.decisionService.UpdateHRDecisionProfile(DTODecisionProfile).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${TypeUpdate} ${apiText} thành công`);
        this.onCloseDrawer();
        this.loadFilter();
        this.APIGetHRDecisionMaster();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${TypeUpdate}  ${apiText}: ` + res.ErrorString);
        if (DTODecisionProfile.Code != 0) {
          this.loadFilter();
        }
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${TypeUpdate} ${apiText}: ${err}`);
        if (DTODecisionProfile.Code != 0) {
          this.loadFilter();
        }
      })
  }


  /**
   * API cập nhật trạng thái hồ sơ 
   * @param DTODecisionProfile 
   */
  APIUpdateHRDecisionProfileStatus(ListDTO: DTOHRDecisionProfile[], Status: number) {
    const apiText = 'yêu cầu kỷ luật'
    this.decisionService.UpdateHRDecisionProfileStatus(ListDTO, Status).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Cập nhật trạng thái hồ sơ thành công`);
        this.onCloseDrawer();
        this.isStoppedDialogShow = false;
        this.loadFilter();
        this.APIGetHRDecisionMaster();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hồ sơ: ` + res.ErrorString);
        this.loadFilter();
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hồ sơ: ${err}`);
        this.loadFilter();
      })
  }

  /**
   * API Xoá quyết định
   * @param listDTODecision 
   */
  APIDeleteHRDecisionMaster(listDTODecision: DTOHRDecisionMaster[]) {
    this.isDeleteDecisionDialogShow = false;
    const apiText = 'yêu cầu kỷ luật'
    this.decisionService.DeleteHRDecisionMaster(listDTODecision).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Xoá quyết định ${apiText} thành công`);
        this.onAddNew()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi xoá quyết định ${apiText}: ` + res.ErrorString);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi xoá quyết định ${apiText}: ${err}`);
      })
  }

  /**
   * API xoá hồ sơ
   * @param listDTODecisionProfile 
   */
  APIDeleteHRDecisionProfile(listDTODecisionProfile: DTOHRDecisionProfile[]) {
    this.isDeleteProfileDialogShow = false
    const apiText = 'yêu cầu kỷ luật'
    this.decisionService.DeleteHRDecisionProfile(listDTODecisionProfile).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Xoá thông tin ${apiText} thành công`);
        if (this.isOpenDrawer) {
          this.onCloseDrawer()
        }
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
        this.APIGetListHRDecisionProfile();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi xoá thông tin ${apiText}: ` + res.ErrorString);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi xoá thông tin ${apiText}: ${err}`);
      })
  }

  /**
   * API lấy thông tin hồ sơ bằng CCCD/CMND
   * @param DTOPersonalInfo 
   */
  APIGetHRPersonalProfileByCICN(DTOPersonalInfo: DTOPersonalInfo) {
    this.decisionService.GetHRPersonalProfileByCICN(DTOPersonalInfo).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        const personalProfile = res.ObjectReturn;
        this.decisionProfile.FullName = personalProfile.FullName
        this.decisionProfile.ImageThumb = personalProfile.ImageThumb
        this.decisionProfile.GenderName = personalProfile.GenderName
        this.decisionProfile.BirthDate = personalProfile.BirthDate
        this.decisionProfile.Cellphone = personalProfile.Cellphone
        this.decisionProfile.Email = personalProfile.Email
        this.decisionProfile.PersonalProfile = personalProfile.Code
        this.decisionProfile.TypeStaff = 1
        this.decisionProfile.TypeStaffName = 'Nhân viên không chính thức'
        this.isShowAll = true;
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin cá nhân: ` + res.ErrorString);
        this.isShowAll = false;
        this.decisionProfile = new DTOHRDecisionProfile()
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin cá nhân: ${err}`);
        this.decisionProfile = new DTOHRDecisionProfile()
        this.isShowAll = false;

      })
  }

  /**
   * API lấy thông tin hồ sơ bằng CCCD/CMND
   * @param DTOPersonalInfo 
   */
  APIGetHREmployeeByID(DTOEmployee: DTOEmployee) {
    this.decisionService.GetHREmployeeByID(DTOEmployee).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        const employee = res.ObjectReturn;
        this.decisionProfile.FullName = employee.FullName
        this.decisionProfile.ImageThumb = employee.ImageThumb
        this.decisionProfile.GenderName = employee.GenderName
        this.decisionProfile.BirthDate = employee.BirthDate
        this.decisionProfile.Cellphone = employee?.CellPhone
        this.decisionProfile.Email = employee.Email
        this.decisionProfile.PersonalProfile = employee.ProfileID
        this.decisionProfile.Staff = employee.Code
        this.decisionProfile.CurrentDepartmentName = employee.DepartmentName
        this.decisionProfile.CurrentPositionName = employee.CurrentPositionName
        this.decisionProfile.CurrentLocationName = employee.LocationName
        this.decisionProfile.TypeStaff = 1
        this.decisionProfile.TypeStaffName = 'Nhân viên không chính thức'
        this.isShowAll = true;
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin cá nhân: ` + res.ErrorString);
        this.isShowAll = false;
        this.decisionProfile = new DTOHRDecisionProfile()
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin cá nhân: ${err}`);
        this.decisionProfile = new DTOHRDecisionProfile()
        this.isShowAll = false;

      })
  }


  /**
   * Dowload template import danh sách hồ sơ
   */
  APIDownloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "DecisionProfileTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.apiGetTemplateService.GetTemplate(getfilename).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
        this.layoutService.onSuccess(`${ctx} thành công`);
      }
      else {
        this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + res.ErrorString)

      }
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
    });
  }

  /**
   * API import profile bằng excel
   * @param file DecisionProfileTemplate
   */
  APIImportExcelPosition(file) {
    this.isLoading = true
    var ctx = "Import Excel"

    this.decisionService.ImportHRDecisionProfile(file, this.decision.Code).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      this.isLoading = false;
      if (Ps_UtilObjectService.hasValue(res) && !Ps_UtilObjectService.hasValueString(res.ErrorString)) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.setImportDialogMode(1);
        this.layoutService.setImportDialog(false);
        this.layoutService.getImportDialogComponent().inputBtnDisplay();
        this.loadFilter()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }
    }, (err) => {
      this.isLoading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
    })
  }

  /**
   * Xuất các profile đã hoàn tất tuyển dụng, điều chuyển.
   */
  APIGetHRDecisionProfileReportExcel() {
    this.isLoading = true
    var ctx = "Xuất Excel"
    var getfileName = "DecisionBoardedReport.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)
    console.log(this.decision)

    this.decisionService.GetHRDecisionProfileReportExcel(this.decision.Code).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      this.isLoading = false;
      if (Ps_UtilObjectService.hasValue(res)) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
    }, f => {
      this.isLoading = false;
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
    });
  }

  /**
   * Xuất các profile đã hoàn tất tuyển dụng, điều chuyển.
   */
  APIGetHRDecisionProfileReportWord(ListHRDecisionProfile: DTOHRDecisionProfile[]) {
    this.isLoading = true
    var ctx = "Xuất Excel"
    var getfileName = "DecisionProfileReportWord"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.decisionService.GetHRDecisionProfileReportWord(ListHRDecisionProfile).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      this.isLoading = false;
      if (Ps_UtilObjectService.hasValue(res)) {
        Ps_UtilObjectService.getFile(res, getfileName, 2)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
    }, f => {
      this.isLoading = false;
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
    });
  }


  //#region API TASK
    // This function provide policy task list from service after call API GetListHRDecisionTask
    GetListDisciplinaryTask() {
      this.isLoadingTask = true;
      this.checkShowStoppedTask()
      this.decisionService.GetListDisciplinaryTask(this.gridState).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
        this.isLoadingTask = false;
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.gridDataTask = res.ObjectReturn.Data
  
          this.gridDataTask.forEach(element => {
            element.ListStakeholder[0] = element.ListStakeholder[0].map(e => JSON.parse(e));
            element.ListStakeholder[1] = element.ListStakeholder[1].map(e => JSON.parse(e));
           
            element.titleStackHolder = this.getTitleStackholder(element.ListStakeholder);
            element.numOfTotalStakeholders =
              element.ListStakeholder[0].length + element.ListStakeholder[1].length;
          });
          this.checkStatusDecision(this.gridDataTask)

        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công việc: " ${res.ErrorString}`);
        }

      }, (error) => {
        this.isLoadingTask = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công việc: " ${error}`);
      });
    }


    /**
      * API cập nhật công việc
  */
    APIUpdateHRDecisionTask(
      data: DTOHRDecisionTask
    ) {
      data.Decision = this.decision.Code
      data.DecisionProfile = null
      this.decisionService
        .UpdateHRDecisionTask(data)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (res) => {
            if (
              Ps_UtilObjectService.hasValue(res) &&
              Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
              res.StatusCode == 0
            ) {
              if (this.isCreate) {
                this.layoutService.onSuccess('Thêm công việc thành công')
              } else {
                this.layoutService.onSuccess('Cập nhật công việc thành công')
              }

              this.handleCloseDrawerTask()
              this.GetListDisciplinaryTask()
              // this.gridTaskList.APIGetListHRDecisionTask()
            } else {
              if (this.isCreate) {
                this.layoutService.onError(
                  `Đã xảy ra lỗi khi thêm mới công việc yêu cầu kỷ luật: ` +
                  res.ErrorString
                );
              } else {
                this.layoutService.onError(
                  `Đã xảy ra lỗi khi Cập nhật công việc yêu cầu kỷ luật: ` +
                  res.ErrorString
                );
              }

            }
          },
          (err) => {
            this.isLoading = false;
            if (this.isCreate) {
              this.layoutService.onError(
                `Đã xảy ra lỗi khi thêm mới công việc yêu cầu kỷ luật: ${err}`
              );
            }
            else {
              this.layoutService.onError(
                `Đã xảy ra lỗi khi cập nhật công việc yêu cầu kỷ luật: ${err}`
              );
            }


          }
        );
    }

    gridStateStaff: State = { filter: { logic: "and", filters: [] } }
    listEmployee: DTOEmployee[] = [];
      /**
   * API Get EMployee
   * 0 default
   * 1 assignee
   * 2 approve
   */
  APIGetListEmployee() {
    // this.isLoadingEmployee = true;
    this.staffService.GetListEmployee(this.gridStateStaff).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && res.StatusCode == 0) {
        this.listEmployee = res.ObjectReturn.Data;
        this.listEmployeeFilter = res.ObjectReturn.Data

      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân viên: ${res.ErrorString}`);
      }
      this.isLoadingEmployee = false;
    }, (error) => {
      this.isLoadingEmployee = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân viên: ${error}`);
    });
  }

  //Delete List HR DecisionTask
  APIDeleteHRDecisionTask(handleDeleteTask: DTOHRDecisionTask) {
    this.decisionService.DeleteHRDecisionTask([handleDeleteTask]).pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess('Xóa công việc thành công');
        this.GetListDisciplinaryTask();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa công việc: ${res.ErrorString}`)
      }
      this.isOpenPopupConfirmDelete = false
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi xóa công việc: ${err}`);;
      this.GetListDisciplinaryTask();
      this.isOpenPopupConfirmDelete = false
    })
  }

    /**
 * API lấy danh sách lý do
 */
    APIGetListHRReason(enumCode: number) {
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

  //Update List HR DecisionTask
  APIUpdateListHRDecisionTask(listDTO: DTOHRDecisionTask[], properties: string[]) {
    this.isLoadingTask = true;
    this.decisionService
      .UpdateListHRDecisionTask(listDTO, properties).pipe(takeUntil(this.unsubscribe)).subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess('Cập nhật công việc thành công')
            this.toggleClosedDialog();
            this.GetListDisciplinaryTask();
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật công việc: ` + res.ErrorString
            );
          }
          this.isLoadingTask = false;
          this.checkStatusDecision(this.gridDataTask)
        },
        (err) => {
          this.isLoadingTask = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật công việc: ` + err
          );
        }
      );
  }


  //#region TASK

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
   * Mở drawer
   */
    handleOpenDrawer(): void {
      this.APIGetListEmployee()
      this.handleCalDate(this.MultiForm.get("CreatedTime").value, this.MultiForm.get("EndDate").value)
      this.handleCalDeadline(this.MultiForm.get("EndDate").value)
      this.minEndDate = new Date(this.decision.EffDate) 
      this.statusDrawer = 1
      this.isOpenDrawer = true
    }

  getTitleStackholder(item: any): string {
    let title = '';
  
    // Kiểm tra và xử lý danh sách trong công ty (item[0])
    if (item[0] && Array.isArray(item[0])) {
      title += 'Trong công ty:\n';
      item[0].forEach((element, index) => {
        if (element?.StaffName) {
          title += `${index + 1}. ${element.StaffName}\n`;
        }
      });
    }
  
    // Kiểm tra và xử lý danh sách ngoài công ty (item[1])
    if (item[1] && Array.isArray(item[1])) {
      title += '\nNgoài công ty:\n';
      item[1].forEach((element, index) => {
        if (element?.StaffName) {
          title += `${index + 1}. ${element.StaffName}\n`;
        }
      });
    }
  
    return title.trim(); // Loại bỏ ký tự xuống dòng thừa ở cuối
  }


  //Kiểm tra status tasklog
  checkStatusTaskLog(item: DTOHRDecisionTask, code: number): boolean {
    if(!item){
      return
    }
    let status: number = 0;
    if(item.ListHRDecisionTaskLog?.length > 0){
      status = item.ListHRDecisionTaskLog[0].Status;
  
      if (status == code) {
        return true;
      } else {
        return false;
      }
    }
  }

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


    //#region DRAWER TASK
    DataHRDecisionTaskOrigin: DTOHRDecisionTask = new DTOHRDecisionTask
    MultiForm: UntypedFormGroup;
      //#region variable drawer
    // isEdit: boolean = false;
    isView: boolean = false;
    isCreate: boolean = false

    minEndDate: Date = new Date
    dateRemain: number = 0
    deadlineDate: number = 0

    listEmployeeFilter: DTOEmployee[] = []

    defautEmployeeFilter: any = {FullName: '-- Chọn --', Code: -1}
    isLoadingEmployee: boolean = false

    DataHRDecisionProfileMaster: DTOHRDecisionProfile = new DTOHRDecisionProfile

    isDatePickerChange: boolean = false

    selectedTask: DTOHRDecisionTask

    onOrderByChange(event: any): void {
      const value = event
      this.MultiForm.get('OrderBy')?.setValue(value);
    }

    onOrderByBlur(): void {
      const value =  this.MultiForm.get('OrderBy')?.value
      if (!value || isNaN(value) || Number(value) < 1) {
        this.MultiForm.get('OrderBy')?.setValue(1);
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
        if (this.decision.Status != 2) {
          const startDate: Date = new Date(this.decision.EffDate)
          startDate.setHours(0, 0, 0, 0);
          this.dateRemain = Ps_UtilObjectService.getDaysLeft(startDate, normalizedEndDate);
        } else if (this.decision.Status == 2) {
          if (createTime && !this.isDatePickerChange) {
            let normalizedCreateTime: Date = new Date(createTime)
            normalizedCreateTime.setHours(0, 0, 0, 0);
            this.dateRemain = Ps_UtilObjectService.getDaysLeft(normalizedCreateTime, normalizedEndDate);
          } else {
            this.dateRemain = Ps_UtilObjectService.getDaysLeft(normalizedStartDate, normalizedEndDate);
          }

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
  * Action khi các dropdown thực hiện
  * @param event value
  * @param prop name dropdown action
  */
    onDropdownClick(event, prop: string) {
      const formControl = this.MultiForm.get(prop);
      switch (prop) {
        case "ListStakeholderIn":

          formControl?.setValue(event);

        default:
          formControl?.setValue(event);
          break;
      }
      console.log(this.MultiForm)
    }

    /**
  * Đóng drawer
  */
    handleCloseDrawerTask(): void {
      this.isOpenDrawer = false;
      // this.DataHRDecisionTask = new DTOHRDecisionTask
      this.DataHRDecisionTaskOrigin = new DTOHRDecisionTask
      this.MultiForm.reset()
      // this.resquestChangeStatus = false
      this.isEdit = false;
      this.isView = false;
      this.isCreate = false
      this.dateRemain = 0
      // this.isDropdownAssignee = true
      this.isDatePickerChange = false
    }

    
  handleGetActionTask(data) {
    // this.DataHRDecisionTask = data.item
    // this.DataHRDecisionTask.DecisionProfile = this.DataHRDecisionProfileMaster.Code
    // if (data.status == "Edit") {
    //   this.isEdit = true
    //   this.isView = false
    //   this.isCreate = false
    //   if (this.DataHRDecisionTask.PositionAssignee) {
    //     this.isDropdownAssignee = false
    //   }
    // } else {
    //   this.isEdit = false
    //   this.isView = true
    //   this.isCreate = false
    // }
    // this.statusDrawer = 1
    // this.MultiForm = this.onLoadForm();
    // this.MultiForm.patchValue(this.DataHRDecisionTask);
    // this.DataHRDecisionTaskOrigin = this.MultiForm.value
    // this.getTitleReason(this.DataHRDecisionTask.Status)
    // this.handleOpenDrawer()
  }

  handleGetNewTask() {
      this.statusDrawer = 0
      this.isEdit = false
      this.isView = false
      this.isCreate = true
      this.MultiForm = this.onLoadForm();
      this.MultiForm.patchValue(new DTOHRDecisionTask);
      

      if (this.DataHRDecisionProfileMaster.Status == 1) {
        this.MultiForm.patchValue({
          Status: 1
        })
      } else if (this.DataHRDecisionProfileMaster.Status == 2) {
        this.MultiForm.patchValue({
          Status: 3
        })
      }
      this.MultiForm.patchValue({
        Decision: 5
      })
      this.DataHRDecisionTaskOrigin = this.MultiForm.value
      this.handleOpenDrawer()
    
  }


  isConfirmDialogShow: boolean = false
  codeConfirmDialog: number

  isConfirmDialogSent: boolean = false

    /**
   * Hàm xử lý khi click vào action trên list
   * @param codeAction code của action được chọn 0 ngưng / 1 mở lại / 2 hoàn tất / 3 xem
   */
    onActionList(codeAction: number, item: DTOHRDecisionTask) {
      // const eff = new Date(this.decision.EffDate)
      this.selectedTask = item

      switch(codeAction){
        case 0:
          if((this.decision.Status == 2 || this.decision.Status == 3) && Ps_UtilObjectService.getDaysLeft(this.EffectDate, this.currentDate) >= 0){
            this.selectedTask.Status = 5
            this.codeConfirmDialog = 2
          }else{
            this.selectedTask.Status = 2
            this.codeConfirmDialog = 8
          }
          this.isConfirmDialogShow = true
          this.APIGetListHRReason(23)
          break
        case 1:
          console.log((this.EffectDate >= this.currentDate))
          if((this.decision.Status == 2 || this.decision.Status == 3) &&  Ps_UtilObjectService.getDaysLeft(this.EffectDate, this.currentDate) >= 0){
            this.selectedTask.Status = 3
          }else{
            this.selectedTask.Status = 1
          }
          this.isConfirmDialogShow = true
          this.codeConfirmDialog = 1
          this.APIGetListHRReason(23)
          break
        case 2:
          this.isConfirmDialogSent = true
          this.selectedTask.Status = 6
          break
        case 3:
          this.isSeeDetail = true;
          this.isView = true
          this.isEdit = false;
          this.statusDrawer = 1
          this.isOpenDrawer = true;
          this.isShowAll = true;
          this.statusDrawer = 1
          this.MultiForm = this.onLoadForm();
          this.MultiForm.patchValue(item);
    
          this.APIGetListEmployee()
          
          this.listStakeholderOut = item.ListStakeholder[1]
    
           this.ListStakeholderIn = this.MultiForm.get('ListStakeholder').value[0].map(item => ({
            Code: item.Code,
            FullName: item.StaffName,
          }));
    
    
          this.MultiForm.patchValue({
            ListHRDecisionProfile: item.ListStakeholder[0]
          })
      }
    }


    getValueChangeDropdown(data){

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

      /**
  * Hàm toggle popup ngưng tuyển dụng/ điều chuyển
  */
  toggleClosedDialog() {
    this.listProperties = []
    this.isConfirmDialogSent = false
    this.selectedTask = new DTOHRDecisionTask
    this.isConfirmDialogShow = false;
    this.isObligatoryReason = false;
    this.valueReason = null;
    this.valueRemark = null;
    this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
  }


  onFilterChangeMultiselect(searchTerm: string): void {
    const key = searchTerm.toLocaleLowerCase();
    this.listEmployeeFilter = this.listEmployee.filter((item) => 
      (item.FirstName?.toLocaleLowerCase().includes(key) || 
       item.MiddleName?.toLocaleLowerCase().includes(key) || 
       item.LastName?.toLocaleLowerCase().includes(key))
    );
  }

  /**
   * Add employee out
   * @param action 
   * @param index 
   */
  handleAddEmployeeOut(
    action: string,
    index: number
  ) {
    if (action == 'add') {
      this.listStakeholderOut.unshift({ StaffName: '', update: true });
      this.currentEmployeeOutside = { StaffName: '', update: true }
    }

    if (action == 'trash') {
      if (index !== undefined && index !== null) {
        this.listStakeholderOut.splice(index, 1);
        this.layoutService.onError(`Xóa thành công`);
      }
    }
  }

  isShowImportDocument: boolean = false

  handleImportDocument(){
    this.isShowImportDocument = true
  }
  
  isShowStoppedTask: boolean = false;

    /**
   * Hàm xử lý show hoặc không show các công việc "Không", "Ngưng" thực hiện
   */
    onShowStoppedTask() {
      this.isShowStoppedTask = !this.isShowStoppedTask;
      (document.getElementById('checkStopTask') as HTMLInputElement).checked = this.isShowStoppedTask;
      this.gridState.filter.filters = [];
      this.gridState.filter.filters.push({ field: 'Decision', operator: 'eq', value: this.decision.Code });
      this.GetListDisciplinaryTask();
    }

  /**
   * Hàm kiểm tra show hoặc không show các công việc "Không", "Ngưng" thực hiện
   */
  checkShowStoppedTask() {
    // if (!this.isShowStoppedTask) {
    //   if (this.decision.Status !== 1) {
    //     this.gridState.filter.filters.push({
    //       logic: 'and',
    //       filters: [
    //         { field: 'Status', operator: 'neq', value: 2 },
    //         { field: 'Status', operator: 'neq', value: 5 }
    //       ]
    //     });
    //   }
    // } else {
    //   this.gridState.filter.filters.push({ field: 'Status', operator: 'neq', value: 0 });
    // }
  }

  

    //#region Profile
    handleDeleteProfile(item: DTOHRDecisionProfile){
      this.listReqDelProfile = []
      this.listReqDelProfile.push(item)
      this.isDeleteProfileDialogShow = true
    }


    /**
     * 
     * @param status 0 view / 1 edit
     * @param item 
     */
    handleOpenUpdateProfile(status: number,item: DTOHRDecisionProfile){
      if (status == 0) {
        this.isSeeDetail = true;
        this.isView = true
      }
      else if (status == 1) {
        this.isEdit = true;
      }
      this.statusDrawer = 0
      this.isOpenDrawer = true;
      this.isShowAll = true;
      this.decisionProfile = item
    }

    /**
  * Thêm hoặc sửa task
  */
    handleUpdateTask(option: number) {
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

      if (option == 0) {
        console.log('here')
        data.DecisionProfile = this.DataHRDecisionProfileMaster.Code
        data.Code = 0
        data.ListHRDecisionProfile = []
      }

      if(JSON.stringify(data) === JSON.stringify(this.DataHRDecisionTaskOrigin)){
        this.handleCloseDrawerTask()
        return
      }

      const listIn = this.ListStakeholderIn.map(item => ({
        Code: item.Code,
        StaffName: null,
      }));


      const listOut = this.listStakeholderOut.map(item => ({
        Code: null,
        StaffName: item.StaffName
      }))

      const listStacke = [...listIn, ...listOut];
      data.ListOfStakeholder = JSON.stringify(listStacke) 

      data.ListStakeholder = null


      this.APIUpdateHRDecisionTask(data)
    }

    listStakeholderOut: { StaffName: string,update: boolean }[] =[];
    currentEmployeeOutside: {StaffName: string, update: boolean}

  //#region MASTER
  checkStatusDecision(array: DTOHRDecisionTask[]): void {
    const hasStatusTwo = array.some(item => item.Status === 2);
    this.isShowComplete = !hasStatusTwo;
    this.setupBtnStatus();
  }



  // Hàm xử lý khi người dùng blur ra ngoài
  onBlur(goods: any, index: number): void {
    if (goods.StaffName == '') {
      this.listStakeholderOut.splice(index, 1);
    } else {
      this.listStakeholderOut[index].StaffName = goods.StaffName
      this.listStakeholderOut[index].update = false
    }

  }

  // Hàm chỉnh sửa tên (chuyển từ text sang textbox)
  editEmployee(goods: any, index: number): void {
    this.listStakeholderOut[index].StaffName = goods.StaffName
    this.listStakeholderOut[index].update = true
  }

  /**
* The event is called whenever wanna close popup confirm delete 
*/
  closePopupConfirmDeleteTask() {
    this.isOpenPopupConfirmDelete = false;
    this.selectedTaskDelete = null;
  }

  handleDeleteTask(){
    delete this.selectedTaskDelete.titleStackHolder
    delete this.selectedTaskDelete.numOfTotalStakeholders
    this.APIDeleteHRDecisionTask(this.selectedTaskDelete)
  }

  //#endregion

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
