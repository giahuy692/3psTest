import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DTOHRDecisionMaster } from '../../dto/DTOHRDecisionMaster.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { takeUntil } from 'rxjs/operators';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, isCompositeFilterDescriptor, State } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DTOHRDecisionProfile } from '../../dto/DTOHRDecisionProfile.dto';
import { StaffApiService } from '../../services/staff-api.service';
import { DTOListHR, DTOPersonalInfo } from '../../dto/DTOPersonalInfo.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { HriDecisionApiService } from '../../services/hri-decision-api.service';
import { DTODepartment } from '../../dto/DTODepartment.dto';
import { DTOPosition } from '../../dto/DTOPosition.dto';
import { DTOLocation } from '../../dto/DTOLocation.dto';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DomSanitizer } from '@angular/platform-browser';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { EnumDialogType } from 'src/app/p-app/p-layout/enum/EnumDialogType';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';
import { DTOEmployee } from '../../dto/DTOEmployee.dto';
import { Day } from '@progress/kendo-date-math';
import { TextAreaComponent } from '@progress/kendo-angular-inputs';

@Component({
  selector: 'app-hr-onboard-decision-detail',
  templateUrl: './hr-onboard-decision-detail.component.html',
  styleUrls: ['./hr-onboard-decision-detail.component.scss']
})
export class HrOnboardDecisionDetailComponent implements OnInit, OnDestroy {


  @Input({ required: true }) TypeData: 1 | 2 = 1;

  isProfileDialogOpen: boolean = false;
  isDeleteProfileDialogShow: boolean = false;
  isDeleteDecisionDialogShow: boolean = false;
  isInformationBlockLoading: boolean = true;
  isStoppedDialogShow: boolean = false;
  errorOccurred: any = {}
  currentFolderPopup: number = 0;
  valueReason: DTOListHR;
  isObligatoryReason: boolean = false;
  typeSolution: number = 1;

  @ViewChild("remark") valueRemark: TextAreaComponent;

  //#region Decision
  isAddNew: boolean = true;
  isLockAll: boolean = false;
  decision: DTOHRDecisionMaster = new DTOHRDecisionMaster();
  oldTitleName: string = ''
  oldDescription: string = ''
  arrBtnStatus: { text: string, class: string, code: string, link?: any, type?: string }[] = [];

  pickFileCallback: Function
  GetFolderCallback: Function

  // listReason: { Code: number, Text: string }[] = [{
  //   Code: 1,
  //   Text: "Lý do 1",
  // },
  // {
  //   Code: 2,
  //   Text: "Lý do 2",
  // },
  // {
  //   Code: 3,
  //   Text: "Lý do 3",
  // }];

  listReason: DTOListHR[] = [];

  //#endregion

  //#region GRID
  isLoading: boolean = true;
  isFilterDisable: boolean = false;
  gridView = new Subject<any>();
  gridData: DTOHRDecisionProfile[] = []
  page: number = 0;
  pageSize: number = 25
  pageSizes: number[] = [25, 50, 75, 100];
  total: number = 0;
  selectedProfile: DTOHRDecisionProfile;
  listReqDelProfile: DTOHRDecisionProfile[] = []

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
  oldProbationPeriodDays: number;

  listDepartment: DTODepartment[]
  listPosition: DTOPosition[]
  listLocation: DTOLocation[]
  listTypeHR: DTOListHR[];
  profileProps: string[];
  disabledDates: Day[] = [Day.Sunday];


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

  currentDate: Date;
  unsubscribe = new Subject<void>;

  constructor(private menuService: PS_HelperMenuService,
    private staffService: StaffApiService,
    private layoutService: LayoutService,
    private decisionService: HriDecisionApiService,
    private domSanititizer: DomSanitizer,
    private apiServiceMar: MarNewsProductAPIService,
    private apiGetTemplateService: MarBannerAPIService,
    private cdr: ChangeDetectorRef
  ) {

  }


  ngOnInit(): void {
    //Phân quyền
    this.menuService.changePermission().pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false
        this.actionPerm = distinct(res.ActionPermission, "ActionType")

        this.isMaster = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        this.isAllowedToCreate = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        this.isAllowedToVerify = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
      }
    })
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

    // this.isItemDisableCallback = this.isTreeItemDisable.bind(this);
    this.isLocationTreeDisableCallback = this.isLocationTreeItemDisable.bind(this);

    this.uploadEventHandlerCallback = this.uploadEventHand.bind(this);

    this.isLoading = false;

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

      // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và status = 2
      if (canVerify && status === 2) {
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
          text: 'XÓA QUYẾT ĐỊNH',
          class: 'k-button btn-hachi hachi-warning',
          code: 'trash',
          type: 'delete',
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
      this.gridState.filter.filters = []
      this.APIGetHRDecisionMaster()
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
    this.decision.TypeData = this.TypeData
    this.gridData = []
    this.gridView.next({ data: this.gridData, total: this.total });
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
    console.log(new Date(this.decision.EffDate) >= new Date())
    console.log(new Date())
    console.log(new Date(this.decision.EffDate))
    const typeDecision = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
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

    else if (!Ps_UtilObjectService.hasListValue(this.gridData)) {
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
      moreActionDropdown.push({ Name: "Xóa hồ sơ", Code: "trash", Type: 'delete', Actived: true })
    }

    else if (status == 2 && (this.isMaster || this.isAllowedToVerify) && dataItem.Status == 2) {
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
      if (this.TypeData == 1) {
        moreActionDropdown.push({ Name: "Ngưng tuyển dụng", Code: "minus-outline", Type: 'StatusID', Actived: true })
      } else {
        moreActionDropdown.push({ Name: "Ngưng điều chuyển", Code: "minus-outline", Type: 'StatusID', Actived: true })
      }
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
    var moreActionDropdown = new Array<MenuDataItem>()
    var status = this.decision.Status

    if (((status == 0 || status == 4) && (this.isAllowedToCreate || this.isMaster)) || (status == 1 && (this.isAllowedToVerify || this.isMaster))) {
      moreActionDropdown.push({ Name: "Xóa hồ sơ", Code: "trash", Type: 'Delete', Link: "delete", Actived: true })
    }

    if (status == 2) {
      moreActionDropdown.push({ Name: "Xuất Offer", Code: "file-word", Type: 'Word', Link: "ExportWord", Actived: true })
    }
    return moreActionDropdown
  }

  convertIconToImage(inputHtml: string, fileType: string) {
    // // Map các kiểu file sang đường dẫn ảnh tương ứng
    // const fileTypeToImageMap: Record<string, string> = {
    //   word: 'assets/img/logo/docx.svg',
    //   excel: 'assets/img/logo/xlsx.svg',
    //   pdf: 'assets/img/logo/pdf.svg',
    //   // Thêm các file type khác nếu cần
    // };

    // // Tìm đường dẫn ảnh dựa vào fileType
    // const imageSrc = fileTypeToImageMap[fileType.toLowerCase()] || '';

    // if (!imageSrc) {
    //   throw new Error(`File type "${fileType}" không được hỗ trợ.`);
    // }

    // Tạo thẻ <img> thay thế
    inputHtml = inputHtml.replace(
      // /<span class=".*?k-icon"><\/span>/,
      /<img class="k-image" src="assets\\img\\logo\\xlsx.svg">/,
      `/<img class="k-image" src="assets\img\logo\docs.svg" />/`
    );

    console.log(inputHtml)
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
      }
      this.isOpenDrawer = true;
      this.isShowAll = true;

      this.curDepartment.Code = this.decisionProfile.Department;
      this.curDepartment.Department = this.decisionProfile.DepartmentName;
      this.curPosition.Code = this.decisionProfile.Position;
      this.curPosition.Position = this.decisionProfile.PositionName;
      this.curLocation.Code = this.decisionProfile.Location;
      this.curLocation.LocationName = this.decisionProfile.LocationName;
      this.curTypeHr.OrderBy = this.decisionProfile.TypeStaff;
      this.curTypeHr.ListName = this.decisionProfile.TypeStaffName;
      this.oldDepartment.Code = this.curDepartment.Code;
      this.oldPosition.Code = this.curPosition.Code;
      this.oldLocation.Code = this.curLocation.Code;
      this.oldTypeHr.OrderBy = this.curTypeHr.OrderBy;
      this.oldDateInput = new Date(this.decisionProfile.JoinDate);
      this.oldNote = this.decisionProfile.Remark;
      this.oldReason = this.decisionProfile.Reason;


      this.APIGetListDepartment();
      this.assignDefaultDropValue()
    }
    else if (menu.Link == 'delete' || menu.Code == 'trash') {
      this.listReqDelProfile = []
      this.listReqDelProfile.push(item)
      this.isDeleteProfileDialogShow = true
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
    this.gridState.skip = event.skip
    this.gridState.take = event.take

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
    const containedDescriptor = this.gridState.filter.filters.findIndex((v: FilterDescriptor | CompositeFilterDescriptor) => {
      return !isCompositeFilterDescriptor(v) && v.field === 'Decision';
    });

    if (containedDescriptor == -1) {
      this.gridState.filter.filters.push(
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
    this.gridState.skip = 0;
    this.gridState.filter.filters = []
    if (filterDescriptor.filters[0]?.value != '') {
      this.gridState.filter.filters = [filterDescriptor];
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
        if (this.TypeData == 1) {
          const personalInfo = new DTOPersonalInfo();
          personalInfo.IdentityNo = this.decisionProfile.IdentityNo;
          this.APIGetHRPersonalProfileByCICN(personalInfo);
        }
        else if (this.TypeData == 2) {
          const employee = new DTOEmployee();
          employee.StaffID = this.decisionProfile.StaffID;
          this.APIGetHREmployeeByID(employee)
        }
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
    this.isOpenDrawer = false;
    this.isAddNewProfile = false;
    this.isEdit = false;
    this.isSeeDetail = false;
    this.isShowAll = false;
    this.curTypeHr = JSON.parse(JSON.stringify(this.typeHrDefaultItem))
    this.assignDefaultDropValue();
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
    if (TypeBtn === 'Delete') {
      this.isDeleteProfileDialogShow = true;
      this.listReqDelProfile = [this.decisionProfile];
      return;
    }
  
    // Gán thông tin cơ bản
    Object.assign(this.decisionProfile, {
      Decision: this.decision.Code,
      Department: this.curDepartment.Code,
      DepartmentName: this.curDepartment.Department,
      Position: this.curPosition.Code,
      PositionName: this.curPosition.Position,
      Location: this.curLocation.Code,
      LocationName: this.curLocation.LocationName,
      TypeStaff: 1,
      TypeStaffName: 'Nhân viên không chính thức'
    });
  
    if (!this.onRequiredValueCheck(this.decisionProfile)) {
      return;
    }
  
    if (TypeBtn === 'Update') {
      const isDataChanged = 
        this.oldDepartment.Code !== this.curDepartment.Code ||
        this.oldPosition.Code !== this.curPosition.Code ||
        this.oldLocation.Code !== this.curLocation.Code ||
        this.oldTypeHr.OrderBy !== this.curTypeHr.OrderBy ||
        Ps_UtilObjectService.getDaysDiff(this.oldDateInput, new Date(this.decisionProfile.JoinDate)) !== 0 ||
        (this.TypeData === 1 && (
          this.oldNote !== this.decisionProfile.Remark || 
          this.oldProbationPeriodDays !== this.decisionProfile.ProbationPeriodDays
        )) ||
        (this.TypeData === 2 && (
          this.oldNote !== this.decisionProfile.Remark || 
          this.oldReason !== this.decisionProfile.Reason
        ));
  
      if (isDataChanged) {
        this.APIUpdateHRDecisionProfile(this.decisionProfile);
      } else {
        this.onCloseDrawer();
      }
    } else {
      this.APIUpdateHRDecisionProfile(this.decisionProfile);
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
    const toastText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
    const toastText2 = this.TypeData == this.HiringENUM ? 'công tác' : 'điều chuyển'
    const toastText3 = this.TypeData == this.HiringENUM ? '' : 'điều chuyển'

    let msgStr = `Đã xảy ra lỗi khi ${TypeUpdate} ${toastText}: Thiếu `;
    if ((!Ps_UtilObjectService.hasValue(DTO.PersonalProfile)) && this.TypeData == this.HiringENUM) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `CMND/CCCD`)
      }
      return false;
    }
    else if ((!Ps_UtilObjectService.hasValue(DTO.StaffID)) && this.TypeData == this.TransferingENUM) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `mã nhân sự`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.CurrentDepartmentName) && this.TypeData == this.TransferingENUM) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `đơn vị hiện tại`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.CurrentPositionName) && this.TypeData == this.TransferingENUM) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `chức danh hiện tại`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.CurrentLocationName) && this.TypeData == this.TransferingENUM) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `điểm làm việc hiện tại`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.DepartmentName) || DTO.Department == 0) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `đơn vị ${toastText2}`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.PositionName) || DTO.Position == 0) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `chức danh ${toastText}`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.LocationName) || DTO.Location == 0) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `điểm làm việc ${toastText3}`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.TypeStaffName) || DTO.TypeStaff == 0) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `loại nhân sự ${toastText3}`)
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(DTO.JoinDate?.toString())) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `ngày vào làm`)
      }
      return false;
    }

    else if (!Ps_UtilObjectService.hasValueString(DTO.ProbationPeriodDays?.toString())) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + `thử việc`)
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
    }
  }

  /**
   * Hàm lấy value reason khi change select
   * @param value value reason được chọn
   */
  getValueChangeDropdownReason(value: DTOListHR) {
    this.valueReason = value;
    if (value.Code == 68) {
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
  
    // Kiểm tra giá trị reason
    const isReasonValid = Ps_UtilObjectService.hasValue(this.valueReason) && Ps_UtilObjectService.hasValue(this.valueReason.Code);
  
    if (!isReasonValid) {
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hồ sơ của ${this.decisionProfile.FullName}: vì chọn lí do `);
      return;
    }
  
    // Gán các giá trị chung
    Object.assign(tempProfile, {
      ReasonStatusDescription: this.valueRemark.value,
      ReasonStatus: this.valueReason.Code,
      ReasonStatusName: this.valueReason.ListName,
    });
  
    // Kiểm tra và xử lý lý do bắt buộc
    if (this.isObligatoryReason && !Ps_UtilObjectService.hasValueString(this.valueRemark.value)) {
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái hồ sơ của ${this.decisionProfile.FullName}: vì chưa nhập mô tả `);
      return;
    }
  
    // Xử lý cho từng loại dữ liệu
    if (this.TypeData === 1) {
      listDecisionProfile.push(tempProfile);
    } else if (this.TypeData === 2) {
      tempProfile.TypeStop = this.typeSolution;
      listDecisionProfile.push(tempProfile);
    }
  
    // Gọi API cập nhật
    this.APIUpdateHRDecisionProfileStatus(listDecisionProfile, 3);
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
    const apiText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
    this.isLoading = true
    this.decisionService.GetListHRDecisionProfile(this.gridState).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      this.isLoading = false
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.gridData = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        if (this.gridData.length <= 0 && this.total != 0) {
          this.page -= 1;
          this.gridState.skip -= 1;
          this.loadFilter();
        }
        this.gridView.next({ data: this.gridData, total: this.total });
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
    const apiText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
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
    const apiText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'

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
        this.layoutService.onSuccess(`${TypeUpdate} quyết định ${apiText} thành công`);
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${TypeUpdate} quyết định ${apiText}: ` + res.ErrorString);
      }
    },
      (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${TypeUpdate} quyết định ${apiText}: ${err}`);
      })
  }

  /**
   * API cập nhật trạng thái quyết định
   * @param listDTODecision danh sách quyết định cần update
   * @param reqStatus Status cần update
   */
  APIUpdateHRDecisionMasterStatus(listDTODecision: DTOHRDecisionMaster[], reqStatus: number) {
    const apiText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
    this.decisionService.UpdateHRDecisionMasterStatus(listDTODecision, reqStatus).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Cập nhật trạng thái quyết định ${apiText} thành công`);
        this.APIGetHRDecisionMaster();

        // kiểm tra khi lần cập nhật này là cập nhật cho status duyệt và đã đến ngày hiệu lực
        if(reqStatus == 2 && new Date(listDTODecision[0].EffDate) >= new Date()){
          this.APIGetHRDecisionProfile()
        }
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
   * API cập nhật hồ sơ 
   * @param DTODecisionProfile 
   */
  APIUpdateHRDecisionProfile(DTODecisionProfile: DTOHRDecisionProfile) {
    const TypeUpdate = DTODecisionProfile.Code == 0 ? 'Thêm mới' : 'Cập nhật thông tin';
    const apiText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
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
    const apiText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
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
    const apiText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
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
    const apiText = this.TypeData == this.HiringENUM ? 'tuyển dụng' : 'điều chuyển'
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
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        const personalProfile = res.ObjectReturn;

        // Gán giá trị cho decisionProfile
        Object.assign(this.decisionProfile, {
          FullName: personalProfile.FullName,
          ImageThumb: personalProfile.ImageThumb,
          GenderName: personalProfile.GenderName,
          BirthDate: personalProfile.BirthDate,
          Cellphone: personalProfile.Cellphone,
          Email: personalProfile.Email,
          PersonalProfile: personalProfile.Code,
          TypeStaff: 1,
          TypeStaffName: 'Nhân viên không chính thức',
        });

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
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        const employee = res.ObjectReturn;
        Object.assign(this.decisionProfile, {
          FullName: employee.FullName,
          ImageThumb: employee.ImageThumb,
          GenderName: employee.GenderName,
          BirthDate: employee.BirthDate,
          Cellphone: employee?.CellPhone,
          Email: employee.Email,
          PersonalProfile: employee.ProfileID,
          Staff: employee.Code,
          CurrentDepartmentName: employee.DepartmentName,
          CurrentPositionName: employee.CurrentPositionName,
          CurrentLocationName: employee.LocationName,
          TypeStaff: 1,
          TypeStaffName: 'Nhân viên không chính thức',
        });
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

  //#endregion

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
