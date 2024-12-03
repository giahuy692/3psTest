import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { DTOResponse, Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOHRPolicyMaster } from '../../dto/DTOHRPolicyMaster.dto';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { DTOListHR } from '../../dto/DTOPersonalInfo.dto';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { StaffApiService } from '../../services/staff-api.service';
import { PageChangeEvent } from '@progress/kendo-angular-treelist';
import { isMaster } from 'cluster';

@Component({
  selector: 'app-hr-policy-transition-list',
  templateUrl: './hr-policy-transition-list.component.html',
  styleUrls: ['./hr-policy-transition-list.component.scss']
})
/**
 * Truyền param TypePolicy là 1 hoặc 2 để lấy danh sách theo loại chính sách
 * @param TypePolicy : number
 * 1: Chính sách Onboarding | 2: Chính sách Offboarding
 */
export class HrPolicyTransitionListComponent implements OnInit, OnDestroy {

  @Input({ required: true }) TypePolicy: 1 | 2 = 1;

  childMenuItem: string = 'hriPolicy'
  childMenuItem2: string = ''
  childMenuItem3: string = ''

  isDraft: boolean = true;
  isSent: boolean = true;
  isApproved: boolean = false;
  isSuspended: boolean = false;

  isTypeApplyColumnVisible: boolean = true;

  // Data dropdown của filter ngày hiệu lực
  ListDateFilterOperator = [{ Code: 1, TypeFilter: 'từ', ValueFilter: 'gte' }, { Code: 2, TypeFilter: 'trước', ValueFilter: 'lt' }];
  // Data dropdown của filter phạm vi áp dụng
  ListTypeApplyFilter: DTOListHR[] = [];
  // Operator hiện tại được chọn của dropdown filter ngày hiệu lực
  curDateFilterOperator = { Code: 1, TypeFilter: 'từ', ValueFilter: 'gte' }
  // Value hiện tại của input ngày hiệu lực
  curDateFilterValue: any = null;
  // Value filter phạm vi áp dụng hiện tại được chọn của dropdown filter phạm vi áp dụng
  curTypeApplyFilterValue = { OrderBy: 1 };

  isLoading: boolean = true;
  isFilterDisable: boolean = false;
  gridView = new Subject<any>();
  gridData: DTOHRPolicyMaster[] = []
  page = 0;
  pageSize = 25
  pageSizes = [25, 50, 75, 100];
  total = 0;

  // State của grid
  gridState: State = {
    skip: this.page,
    take: this.pageSize,
    sort: [{ field: 'Code', dir: 'desc' }],
    filter: { filters: [], logic: 'and' },
  };
  //Setting Selectable cho grid
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  // Filter keyword của input search
  SearchPositionTerm = ''
  //Filter bằng composite của input search
  SearchTermComposite: CompositeFilterDescriptor = { logic: 'or', filters: [] };
  // Filter của nhóm status
  StatusFilterComposite: CompositeFilterDescriptor = { logic: 'or', filters: [] };
  //Filter của trạng thái Đang soạn thảo
  draftDescriptor: FilterDescriptor = {
    field: 'Status',
    value: 0,
    operator: 'eq',
    ignoreCase: true
  }
  //Filter của trạng thái Gửi duyệt
  sentDescriptor: FilterDescriptor = {
    field: 'Status',
    value: 1,
    operator: 'eq',
    ignoreCase: true
  }
  //Filter của trạng thái Duyệt áp dụng
  approvedDescriptor: FilterDescriptor = { field: '', operator: '', value: '' }
  //Filter của trạng thái Ngưng áp dụng
  suspendedDescriptor: FilterDescriptor = { field: '', operator: '', value: '' }
  //Filter của trạng thái Trả về
  returnedDescriptor: FilterDescriptor = {
    field: 'Status',
    value: 4,
    operator: 'eq',
    ignoreCase: true
  }
  //Filter của input ngày hiệu lực
  dateFilterDescriptor: FilterDescriptor = { field: '', operator: '', value: '' }
  //Filter của dropdown phạm vi áp dụng
  typeApplyDescriptor: FilterDescriptor = { field: '', operator: '', value: '' }
  //Filter của loại chính sách
  typePolicyDescriptor: FilterDescriptor = { field: 'TypeData', operator: 'eq', value: '' }

  curDate: Date = new Date()
  onPageChangeCallback: Function
  onActionDropDownClickCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getActionDropdownCallback: Function
  getSelectionPopupCallback: Function

  selectedPolicy: DTOHRPolicyMaster = new DTOHRPolicyMaster();
  isDialogShow = false;
  ListDeletePolicyReq: DTOHRPolicyMaster[] = [];

  unsubscribe = new Subject<void>;
  justLoaded: boolean = true;
  actionPerm: any;
  isToanQuyen: boolean;
  isAllowedToCreate: boolean;
  isAllowedToVerify: boolean;

  constructor(private menuService: PS_HelperMenuService,
    private policyTransService: HriTransitionApiService,
    private layoutService: LayoutService,
    private apiServiceStaff: StaffApiService) {

  }

  ngOnInit(): void {
    if (this.TypePolicy == 1) {
      this.childMenuItem2 = 'hri021-policy-onboarding-list'
      this.childMenuItem3 = 'hri021-policy-onboarding-detail'
    } else {
      this.childMenuItem2 = 'hri022-policy-offboarding-list'
      this.childMenuItem3 = 'hri022-policy-offboarding-detail'
    }

    this.menuService.changePermissionAPI().pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        //Lấy value cho filter dựa trên loại chính sách
        this.typePolicyDescriptor.value = this.TypePolicy;

        this.curDate.setHours(0, 0, 0, 0)


        this.APIGetListHR();
        this.LoadFilter();
      }
    })

    //Phân quyền
    this.menuService.changePermission().pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false
        this.actionPerm = distinct(res.ActionPermission, "ActionType")

        this.isToanQuyen = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        this.isAllowedToCreate = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        this.isAllowedToVerify = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
      }
    })

    console.log(this.isToanQuyen)
    console.log(this.isAllowedToCreate)
    console.log(this.isAllowedToVerify)

    this.onSelectCallback = this.onGridItemSelect.bind(this)

    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.getSelectionPopupCallback = this.getSelectionPopupAction.bind(this)

    this.onActionDropDownClickCallback = this.onMoreActionItemClick.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectionActionItemClick.bind(this)

    this.onPageChangeCallback = this.onPageChange.bind(this);



  }

  //#region Filter & LoadData
  /**
   * Hàm nhận value từ component filter
   * @param value Giá trị từ component truyền ra
   * @param varaiable Tên biến cần gán giá trị vào
   * Trả về trang 1 khi filter
   */
  onFilterChange(value: any, varaiable?: string, loadProcess: boolean = true) {
    this.page = 0;
    this.gridState.skip = 0;
    if (Ps_UtilObjectService.hasValue(varaiable)) {
      this[varaiable] = JSON.parse(JSON.stringify(value));
      //Nếu là filter search thì kiểm tra xem value nhập có là rỗng hay không
      if (Ps_UtilObjectService.containsString(varaiable, 'SearchTermComposite')) {
        //Nếu có giá trị thì set vào biến Search keyword
        if (Ps_UtilObjectService.hasValueString(value.filters[0]?.value)) {
          this.SearchPositionTerm = value.filters[0]?.value
        }
        else // Ngược lại set filter là rỗng
        {
          this.SearchTermComposite.filters = []
          this.SearchPositionTerm = ''
        }
      }

      //Nếu là filter ngày thì lấy value chính xác với múi giờ
      if (Ps_UtilObjectService.containsString(varaiable, 'curDateFilterValue')) {
        this.curDateFilterValue = new Date(value).toDateString() + " " + new Date(value).toLocaleTimeString([], { hour12: false });
      }
    }

    // Nếu là dropdown chọn operator cho filter ngày
    if (Ps_UtilObjectService.containsString(varaiable, 'curDateFilterOperator')) {
      //Nếu filter ngày không phải null
      if (Ps_UtilObjectService.hasValue(this.curDateFilterValue)) {
        this.LoadFilter();
      }
    } else {
      if (loadProcess) {
        this.LoadFilter();
      }
    }
  }

  /**
   * Hàm tổng hợp filter và filter data
   */
  LoadFilter() {
    if (!this.isFilterDisable) {
      this.isLoading = true;
      this.gridState.filter.filters = [];
      this.StatusFilterComposite.filters = [];

      this.PushFilter(this.gridState.filter, this.typePolicyDescriptor, true);

      this.PushFilter(this.StatusFilterComposite, this.draftDescriptor, this.isDraft);
      this.PushFilter(this.StatusFilterComposite, this.sentDescriptor, this.isSent);
      this.PushFilter(this.StatusFilterComposite, this.approvedDescriptor, this.isApproved);
      this.PushFilter(this.StatusFilterComposite, this.suspendedDescriptor, this.isSuspended);

      //Nếu trạng thái đang soạn thảo được check thì push thêm trạng thái trả về vào Composite
      if (this.isDraft) {
        this.PushFilter(this.StatusFilterComposite, this.returnedDescriptor, this.isDraft);
      }

      //Nếu phạm vi áp dụng là toàn bộ thì dùng filter composite thay vì keyword
      if (this.curTypeApplyFilterValue.OrderBy == 2) {
        this.PushFilter(this.gridState.filter, null, null, this.SearchTermComposite);
      }

      this.dateFilterDescriptor = this.GenerateFilterDescriptor('EffDate', this.curDateFilterOperator.ValueFilter, this.curDateFilterValue)
      this.typeApplyDescriptor = this.GenerateFilterDescriptor('TypeApply', 'eq', this.curTypeApplyFilterValue.OrderBy)

      this.PushFilter(this.gridState.filter, null, null, this.StatusFilterComposite);
      this.PushFilter(this.gridState.filter, this.dateFilterDescriptor, true)
      this.PushFilter(this.gridState.filter, this.typeApplyDescriptor, true)
      this.APIGetListHRPolicy();
    }
  }

  /**
   * Hàm kiểm tra và push filter vào composite nếu filter có giá trị
   * @param composite Composite cần được push filter vào
   * @param filterDescriptor FilterDescriptor cần kiểm tra để được push
   * @param checkStatus Varaiable của statusFilter để kiểm tra có đang được check hay không
   * @param compositeFilter Param này dùng khi cần push 1 composite vào filter của gridState
   * Nếu checkStatus là false thì sẽ không push vào composite
   * Nếu sử dụng hàm để push composite vào filter của grid thì truyền param filterDescriptor là null và checkStatus là null;
   */
  PushFilter(composite: CompositeFilterDescriptor, filterDescriptor?: FilterDescriptor, checkStatus?: boolean, compositeFilter?: CompositeFilterDescriptor) {
    if (compositeFilter == null) {
      if (Ps_UtilObjectService.hasValueString(filterDescriptor.value) && checkStatus) {
        composite.filters.push(filterDescriptor)
      }
    }
    else {
      if (Ps_UtilObjectService.hasListValue(compositeFilter.filters)) {
        composite.filters.push(compositeFilter)
      }
    }

  }

  /**
   * Hàm tạo FilterDescriptor
   * @param field trường cần filter
   * @param operator toán tử
   * @param value giá trị
   * @returns FilterDescriptor
   */
  GenerateFilterDescriptor(field: string, operator: string, value: string | number) {
    return { field: field, operator: operator, value: value }
  }
  //#endregion

  /**
   * Hàm reset filter
   */
  resetFilter() {
    this.page = 0;
    this.gridState.skip = 0;

    this.isDraft = true;
    this.isSent = true;
    this.isApproved = false;
    this.isSuspended = false;

    this.SearchPositionTerm = ''
    this.SearchTermComposite.filters = [];
    this.curDateFilterValue = null;
    this.curDateFilterOperator = { ...this.ListDateFilterOperator[0] }
    this.curTypeApplyFilterValue = { ...this.ListTypeApplyFilter[0] }

    this.LoadFilter();
  }

  //#region Function liên quan đến Grid

  /**
   * Hàm lấy các action cho popup moreAction của grid
   * @param moreActionDropdown 
   * @param dataItem 
   * @returns MenuDataItem[]
   */
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    const policyDate = dataItem.EffDate
    moreActionDropdown = []
    var status = dataItem.Status
    this.selectedPolicy = dataItem

    // Action chỉnh sửa và xem chi tiết
    if (((status == 0 || status == 4) && (this.isAllowedToCreate || this.isToanQuyen)) || (status == 1 && (this.isAllowedToVerify || this.isToanQuyen)))
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    else
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })

    // Nhóm action đổi tình trạng
    if ((status == 0 || status == 4) && (this.isAllowedToCreate || this.isToanQuyen)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'Status', Link: "1", Actived: true })
    }
    else if ((status == 1 || (status == 3 && (Ps_UtilObjectService.getDaysLeft(this.curDate, policyDate) > 0))) && (this.isAllowedToVerify || this.isToanQuyen)) {
      moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'Status', Link: "4", Actived: true })
      moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'Status', Link: "2", Actived: true })
    }
    else if (status == 2 && (this.isAllowedToVerify || this.isToanQuyen)) {
      moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'Status', Link: "3", Actived: true })
    }

    // Action xoá
    if (status == 0 && (this.isAllowedToCreate || this.isToanQuyen))
      moreActionDropdown.push({ Name: "Xóa chính sách", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }

  /**
   * Hàm lấy các action cho popup giữa màn hình khi chọn vào checkbox
   * @param arrItem 
   * @returns MenuDataItem[]
   */
  getSelectionPopupAction(arrItem: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    // Kiểm tra các action có thể tương tác của item
    var canSent = arrItem.findIndex(s => s.Status == 0 || s.Status == 4) // Đang soạn thảo và Trả về có thể gửi duyệt
    var canAppro_Return = arrItem.findIndex(s => s.Status == 1) // Gửi duyệt có thể Duyệt và Trả về
    var canReturnOnEffDate = arrItem.findIndex(s => s.Status == 3 && Ps_UtilObjectService.getDaysLeft(this.curDate, s.EffDate) > 0) // Ngưng áp dụng có thể trả về với điều kiện chưa tới ngày hiệu lực
    var canStop = arrItem.findIndex(s => s.Status == 2) // Duyệt áp dụng có thể ngưng
    var canDel = arrItem.findIndex(s => s.Status == 0) // Đang soạn thảo có thể xóa

    if (canSent != -1 && (this.isAllowedToCreate || this.isToanQuyen)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'Status', Link: "1", Actived: true }
      )
    }

    if ((canReturnOnEffDate != -1 || canAppro_Return != -1) && (this.isAllowedToVerify || this.isToanQuyen)) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'Status', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'Status', Link: "4", Actived: true }
      )
    }

    if (canStop != -1 && (this.isAllowedToVerify || this.isToanQuyen)) {
      moreActionDropdown.push(
        { Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'Status', Link: "3", Actived: true }
      )
    }

    if (canDel != -1 && (this.isAllowedToCreate || this.isToanQuyen)) {
      moreActionDropdown.push(
        { Name: "Xóa chính sách", Code: "trash", Type: 'Delete', Link: "delete", Actived: true }
      )
    }

    return moreActionDropdown
  }

  /**
   * Hàm xử lí action được chọn trên popup
   * @param menu menu action đã nhấn
   * @param item chính sách được chọn
   */
  onMoreActionItemClick(menu: MenuDataItem, item: any) {
    if (item.Code > 0) {
      if (menu.Type == 'Status') {
        // Nếu trạng thái được nhấn là gửi duyệt hoặc duyệt áp dụng
        if (parseInt(menu.Link) == 1 || parseInt(menu.Link) == 2) {
          //Nếu các trường bắt buộc đủ thông tin thì gọi API
          if (this.requiredFieldCheck(this.selectedPolicy)) {
            this.APIUpdateHRPolicyStatus([this.selectedPolicy], parseInt(menu.Link))
          }
        } else {
          this.APIUpdateHRPolicyStatus([this.selectedPolicy], parseInt(menu.Link))
        }
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        localStorage.setItem("HrPolicyMaster", JSON.stringify(this.selectedPolicy))
        this.openDetail()
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.ListDeletePolicyReq.push(this.selectedPolicy);
        this.isDialogShow = true
      }
    }
  }

  /**
   * Hàm xử lí action được chọn trên dialog
   * @param btnType Loại action đã nhấn
   * @param listSelectedItem List các item đã được chọn
   * @param value Value của action đã nhấn
   */
  onSelectionActionItemClick(btnType: string, listSelectedItem: any[], value: any) {
    let reqList = []
    let reqStatus = 0;

    if (btnType == 'Status') {
      if (value == '1') {
        reqList = []

        listSelectedItem.forEach(item => {
          if ((item.Status == 0 || item.Status == 4) && this.requiredFieldCheck(item)) {
            reqList.push(item)
          }
        });

        reqStatus = 1; // Trạng thái Gửi duyệt
      }
      else if (value == '2') {
        reqList = []

        listSelectedItem.forEach(item => {
          if (item.Status == 1 && this.requiredFieldCheck(item)) {
            reqList.push(item)
          }
          else if (item.Status == 3 && (Ps_UtilObjectService.getDaysLeft(this.curDate, item.EffDate) > 0)) {
            reqList.push(item)
          }
        });

        reqStatus = 2; // Trạng thái Duyệt áp dụng
      }
      else if (value == '3') {
        reqList = []

        listSelectedItem.forEach(item => {
          if (item.Status == 2) {
            reqList.push(item)
          }
        });

        reqStatus = 3; // Trạng thái Ngừng áp dụng
      }
      else if (value == '4') {
        reqList = []

        listSelectedItem.forEach(item => {
          if (item.Status == 1) {
            reqList.push(item)
          }
          else if (item.Status == 3 && (Ps_UtilObjectService.getDaysLeft(this.curDate, item.EffDate) > 0)) {
            reqList.push(item)
          }
        });

        reqStatus = 4; // Trạng thái Trả về
      }

      if (Ps_UtilObjectService.hasListValue(reqList)) {
        this.APIUpdateHRPolicyStatus(reqList, reqStatus);
      } else {
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      }
    }
    else if (btnType == 'Delete') {
      this.ListDeletePolicyReq = [];
      listSelectedItem.forEach(item => {
        if (item.Status == 0) {
          this.ListDeletePolicyReq.push(item)
        }
      });
      if (Ps_UtilObjectService.hasListValue(this.ListDeletePolicyReq)) {
        this.isDialogShow = true;
      }

    }
  }

  /**
   * Hàm dùng để check các trường bắt buộc của dto
   * @param dto dto cần check
   * @param isSkipMsg bỏ qua thông báo mặc định là false
   * @returns true | false
   */
  requiredFieldCheck(dto: DTOHRPolicyMaster, isSkipMsg: boolean = false) {
    let msgStr = `Đã xảy ra lỗi khi cập nhật trạng thái chính sách ${dto.PolicyID ?? 'không xác định'}: thiếu `;
    if (!Ps_UtilObjectService.hasValueString(dto.PolicyID)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Mã chính sách')
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(dto.PolicyName)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Tiêu đề')
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(dto.EffDate)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Ngày hiệu lực')
      }
      return false;
    }
    else if (dto.NumOfTask <= 0) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Danh sách công việc')
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasListValue(dto.ListPositionName) && dto.TypeApply == 1) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Danh sách chức danh áp dụng')
      }
      return false;
    }

    return true;
  }

  /**
   * Hàm nhận giá trị từ grid khi item được chọn
   * @param isSelected 
   */
  onGridItemSelect(isSelected: boolean) {
    this.isFilterDisable = isSelected;
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

    this.LoadFilter();
  }

  /**
   * Hàm xác nhận xoá chính sách
   */
  onDeleteRequest() {
    this.ListDeletePolicyReq.find(item => {
      if (item.NumOfTask > 0 && item.ListPositionName.length > 0) {
        this.layoutService.onError(`Không thể xóa chính sách ${item.PolicyName} vì còn danh sách chức danh áp dụng và danh sách công việc`);
        this.ListDeletePolicyReq = this.ListDeletePolicyReq.filter(policy => policy.Code !== item.Code);
      } else {
        if (item.NumOfTask > 0) {
          this.layoutService.onError(`Không thể xóa chính sách ${item.PolicyName} vì còn danh sách công việc`);
          this.ListDeletePolicyReq = this.ListDeletePolicyReq.filter(policy => policy.Code !== item.Code);
        } 
        else if (item.ListPositionName.length > 0) {
          this.layoutService.onError(`Không thể xóa chính sách ${item.PolicyName} vì còn danh sách chức danh áp dụng`);
          this.ListDeletePolicyReq = this.ListDeletePolicyReq.filter(policy => policy.Code !== item.Code);
        }
      }
    })

    if (Ps_UtilObjectService.hasListValue(this.ListDeletePolicyReq)) {
      this.APIDeleteHRPolicy(this.ListDeletePolicyReq);
    }
    this.ListDeletePolicyReq = []
    this.isDialogShow = false;
  }

  /**
   * Hàm kiểm tra có chuỗi hay không cho HTML
   * @param value 
   * @returns true | false
   */
  hasValueString(value: string) {
    return Ps_UtilObjectService.hasValueString(value);
  }

  /**
   * Hàm trả về tên các chính sách chưa hiển thị trên dialog xoá
   * @returns string
   */
  getRemainingPolicyNames(): string {
    return this.ListDeletePolicyReq.slice(2).map(item => item.PolicyName).join('\n');
  }

  /**
   * Hàm được gọi khi đóng dialog
   */
  closeDialog() {
    this.isDialogShow = false;
    this.ListDeletePolicyReq = [];
  }

  //#endregion

  //#region API

  /**
   * API lấy danh sách thông tin chính sách
   */
  APIGetListHRPolicy() {
    const apiText = "Chính sách " + (this.TypePolicy == 1 ? 'Onboarding' : 'Offboarding')
    this.policyTransService.GetListHRPolicy(this.SearchPositionTerm, this.gridState).pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOResponse) => {
      this.isLoading = false
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.gridData = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        if (this.gridData.length <= 0 && this.total != 0) {
          this.page -= 1;
          this.gridState.skip -= 1;
          this.LoadFilter();
        }
        this.gridView.next({ data: this.gridData, total: this.total });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${apiText}: ${res.ErrorString}`)
      }
    }, (err) => {
      this.isLoading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${apiText}: ${err}`);
    })
  }

  /**
   * API Cập nhật trạng thái của chính sách
   * @param listDTO Danh sách chính sách cần cập nhật
   * @param reqStatus Trạng thái muốn chuyển sang
   * @returns 
   */
  APIUpdateHRPolicyStatus(listDTO: DTOHRPolicyMaster[], reqStatus: number) {
    const apiText = "Cập nhật trạng thái chính sách"
    this.policyTransService.UpdateHRPolicyStatus(listDTO, reqStatus).pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công')
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`)
      }
      this.LoadFilter();
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
      this.LoadFilter();

    })
  }

  /**
   * API xoá chính sách
   * @param listDTO danh sách chính sách cần xoá
   * @returns 
   */
  APIDeleteHRPolicy(listDTO: DTOHRPolicyMaster[]) {
    const apiText = "Xoá chính sách"
    this.policyTransService.DeleteHRPolicy(listDTO).pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công')
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`)
      }
      this.LoadFilter();

    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
      this.LoadFilter();

    })
  }

  /**
   * API lấy data cho dropdown phạm vi áp dụng chính sách
   */
  APIGetListHR() {
    // 17 Phân loại phạm vi áp dụng chính sách
    const apiText = "Lấy danh sách phạm vi áp dụng"
    this.apiServiceStaff.GetListHR(17).pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.ListTypeApplyFilter = res.ObjectReturn;
        this.curTypeApplyFilterValue = this.ListTypeApplyFilter[0]
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
    })
  }

  //#endregion

  /**
   * Hàm chuyển trang
   * @param isNew Nếu là thêm mới thì param này là true
   */
  openDetail(isNew: boolean = false) {
    this.menuService.changeModuleData().pipe(takeUntil(this.unsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code == 'hriPolicy')
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes(this.childMenuItem2) || f.Link.includes(this.childMenuItem2))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes(this.childMenuItem3) || f.Link.includes(this.childMenuItem3))
          this.menuService.activeMenu(detail2)
          if (isNew) {
            var newPolicy = new DTOHRPolicyMaster();
            newPolicy.TypeData = this.TypePolicy
            localStorage.setItem("HrPolicyMaster", JSON.stringify(newPolicy))
          }
        }

      }
    })
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
