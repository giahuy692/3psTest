import { Component, OnInit } from '@angular/core';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { HriDecisionApiService } from '../../shared/services/hri-decision-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOResponse, Ps_UtilObjectService } from 'src/app/p-lib';
import { takeUntil } from 'rxjs/operators';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, State } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { GridDataResult, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DTOHRPolicyMaster } from '../../shared/dto/DTOHRPolicyMaster.dto';
import { HriTransitionApiService } from '../../shared/services/hri-transition-api.service';

@Component({
  selector: 'app-hri036-disciplinary-list',
  templateUrl: './hri036-disciplinary-list.component.html',
  styleUrls: ['./hri036-disciplinary-list.component.scss']
})
export class Hri036DisciplinaryListComponent implements OnInit {
  //#region BIẾN
  destroy$ = new Subject<void>();

  childMenuItem: string = 'hriDisciplinary'; // Mã module
  childMenuItem2: string = ''; // Trang hiện tại (list)
  childMenuItem3: string = ''; // Trang chi tiết (detail)

  gridView: GridDataResult; // Danh sách bảng công việc
  pageSizes: number[] = [25, 50, 75, 100]; // Danh sách các "Hiển thị mỗi trang"
  pageSize: number = 25;
  page: number = 0;

  // State của grid
  gridState: State = {
    skip: this.page,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [{ field: 'Code', dir: 'desc' }],
  };

  //Setting Selectable cho grid
  selectable: SelectableSettings = { enabled: true, mode: 'multiple', drag: false, checkboxOnly: true };

  isFilterDisable: boolean = false; // Các filter có bị disable hay không
  isDraft: boolean = true; // Check box filter "Đang soạn thảo"
  isSent: boolean = true; // Check box filter "Gửi duyệt"
  isApproved: boolean = false; // Check box filter "Duyệt áp dụng"
  isSuspended: boolean = false; // Check box filter "Ngưng áp dụng"
  isLoading: boolean = false; // Có load danh sách Bảng công việc hay không
  isDialogConfirmDeleteShow: boolean = false; // Dialog xác nhận xóa bảng công việc có được show hay không

  // Phân quyền
  justLoaded: boolean = true;
  actionPerm: DTOActionPermission[] = [];
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false;

  // Data dropdown của filter ngày hiệu lực
  listDateFilterOperator = [
    { Code: 1, TypeFilter: 'từ', ValueFilter: 'gte' },
    { Code: 2, TypeFilter: 'trước', ValueFilter: 'lt' }
  ];
  listSelectedTaskBoard: DTOHRPolicyMaster[] = []; // Danh sách các bảng công việc được chọn
  listSelectedTaskBoardToDelete: DTOHRPolicyMaster[] = []; // Danh sách các bảng công việc được chọn để xóa

  currentDateFilterOperator = { Code: 1, TypeFilter: 'từ', ValueFilter: 'gte' }; // Operator hiện tại được chọn của dropdown filter ngày hiệu lực
  currentDateFilterValue: string = null; // Giá trị ngày được chọn
  currentDate: Date = new Date(); // Ngày hiện tại

  keySearch: string = ""; // Giá trị tìm kiếm

  // Filter Descriptor
  filterDraftStatus: FilterDescriptor = { field: 'Status', operator: 'eq', value: 0 }; //Filter trạng thái "Đang soạn thảo"
  filterSendStatus: FilterDescriptor = { field: 'Status', operator: 'eq', value: 1 }; //Filter trạng thái "Gửi duyệt"
  filterApprovedStatus: FilterDescriptor = { field: 'Status', operator: 'eq', value: 2 }; // Filter trạng thái "Duyệt áp dụng"
  filterSuspendedStatus: FilterDescriptor = { field: 'Status', operator: 'eq', value: 3 }; // Filter trạng thái "Ngưng áp dụng"
  filterReturnedStatus: FilterDescriptor = { field: 'Status', operator: 'eq', value: 4 }; // Filter trạng thái "Trả về"
  filterTypeData: FilterDescriptor = { field: 'TypeData', operator: 'eq', value: 3 }; // TypeData Bảng công việc = 3. BCV Xử lý kỷ luật
  filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] }; // Filter trạng thái "Ngưng áp dụng"
  filterStatus: CompositeFilterDescriptor = { logic: 'or', filters: [] }; // Filter trạng thái "Ngưng áp dụng"
  filterDate: FilterDescriptor = { field: '', operator: '', value: '' }; //Filter của input ngày hiệu lực

  // Callback function
  onPageChangeCallback: Function
  onActionDropDownClickCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getActionDropdownCallback: Function
  getSelectionPopupCallback: Function
  //#endregion


  //#region HOOKS
  constructor(
    private menuService: PS_HelperMenuService,
    private decisionService: HriDecisionApiService,
    private layoutService: LayoutService,
    private policyTransService: HriTransitionApiService
  ) { }


  ngOnInit(): void {
    let that = this;

    // Định nghĩa trang dùng để chuyển trang (nếu cần)
    this.childMenuItem2 = 'hri036-disciplinary-list';
    this.childMenuItem3 = 'hri036-disciplinary-detail';

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
      }
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.onLoadDefault();
      }
    });

    this.onSelectCallback = this.handleGridItemSelect.bind(this);
    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.getSelectionPopupCallback = this.getSelectionPopupAction.bind(this);
    this.onActionDropDownClickCallback = this.handleMoreActionItemClick.bind(this);
    this.onSelectedPopupBtnCallback = this.handleSelectionActionItemClick.bind(this);
    this.onPageChangeCallback = this.handlePageChange.bind(this)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion


  //#region APIs
  /**
   * API lấy danh sách các bảng công việc
   */
  APIGetListHRPolicy() {
    const apiText = "bảng công việc ";
    this.policyTransService.GetListHRPolicy(this.keySearch, this.gridState).pipe(takeUntil(this.destroy$)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (!Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data) && !Ps_UtilObjectService.hasValue(res.ObjectReturn.Total)) {
          this.page -= 1;
          this.gridState.skip -= 1;
          this.handleLoadFilter();
        }
        this.gridView = { data: res.ObjectReturn.Data, total: res.ObjectReturn.Total };
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${apiText}: ${res.ErrorString}`)
      }
      this.isLoading = false
    }, (err) => {
      this.isLoading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${apiText}: ${err}`);
    })
  }

  /**
   * API Cập nhật trạng thái của bảng công việc XLKL
   * @param listDTO Danh sách bảng công việc XLKL cần cập nhật
   * @param reqStatus Trạng thái muốn chuyển sang
   * @returns 
   */
  APIUpdateHRPolicyStatus(listDTO: DTOHRPolicyMaster[], reqStatus: number) {
    const apiText = "Cập nhật trạng thái bảng công việc XLKL"
    this.policyTransService.UpdateHRPolicyStatus(listDTO, reqStatus).pipe(takeUntil(this.destroy$)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công')
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
        this.listSelectedTaskBoard = [];
        this.handleLoadFilter();
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`);
      }
    }, (err) => {
      err ? this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`) : this.handleLoadFilter();
    })
  }

  /**
   * API xoá bảng công việc XLKL
   * @param listDTO danh sách bảng công việc XLKL cần xoá
   * @returns 
   */
  APIDeleteHRPolicy(listDTO: DTOHRPolicyMaster[]) {
    const apiText = "Xoá bảng công việc XLKL"
    this.policyTransService.DeleteHRPolicy(listDTO).pipe(takeUntil(this.destroy$)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công')
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      }
      else {
        return this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`)
      }
      this.handleLoadFilter();

    }, (err) => {
      err ? this.handleLoadFilter() : this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
    })
  }
  //#endregion


  //#region CALLBACK FUNC
  /**
   * Hàm set giá trị để nhận biết chọn nhiều item cho việc disable
   * @param isSelected 
   */
  handleGridItemSelect(isSelected: boolean) {
    this.isFilterDisable = isSelected;
  }

  /**
   * Hàm thực hiện khi thay đổi trang
   * @param event 
   */
  handlePageChange(event: PageChangeEvent) {
    this.page = event.skip;
    this.pageSize = event.take;
    this.gridState.skip = event.skip
    this.gridState.take = event.take
    this.handleLoadFilter();
  }

  /**
   * Hàm lấy các action cho popup moreAction của grid
   * @param moreActionDropdown 
   * @param dataItem 
   * @returns MenuDataItem[]
   */
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOHRPolicyMaster) {
    const decisionDate = dataItem.EffDate; // Ngày hiệu lực của Bảng công việc
    const status = dataItem.Status;

    // Danh sách item được chọn
    moreActionDropdown = [];
    this.listSelectedTaskBoard = [dataItem];

    // Hàm kiểm tra quyền truy cập
    const canEdit = (status === 0 || status === 4) && (this.isCreator || this.isMaster);
    const canApproveOrMaster = this.isApprover || this.isMaster;
    const canDelete = status === 0 && (this.isCreator || this.isMaster) && Ps_UtilObjectService.getDaysLeft(this.currentDate, dataItem.EffDate) > 0;

    // Action chỉnh sửa và xem chi tiết
    if (canEdit || (status === 1 && canApproveOrMaster)) {
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true });
    } else {
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true });
    }

    // Nhóm action đổi tình trạng
    if (canEdit) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'Status', Link: "1", Actived: true });
    } else if ((status === 1 || (status === 3 && Ps_UtilObjectService.getDaysLeft(this.currentDate, decisionDate) > 0)) && canApproveOrMaster) {
      moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'Status', Link: "4", Actived: true });
      moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'Status', Link: "2", Actived: true });
    } else if (status === 2 && canApproveOrMaster) {
      moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'Status', Link: "3", Actived: true });
    }

    // Action xoá
    if (canDelete) {
      moreActionDropdown.push({ Name: "Xóa Bảng c.việc XLKL", Code: "trash", Type: 'delete', Actived: true });
    }

    return moreActionDropdown;
  }

  /**
  * Hàm lấy các action cho popup giữa màn hình khi chọn vào checkbox
  * @param arrItem 
  * @returns MenuDataItem[]
  */
  getSelectionPopupAction(arrItem: DTOHRPolicyMaster[]) {
    var moreActionDropdown = new Array<MenuDataItem>();
    // Kiểm tra các action có thể tương tác của item
    var canSent = arrItem.findIndex(s => s.Status == 0 || s.Status == 4); // Đang soạn thảo và Trả về có thể gửi duyệt
    var canAppro_Return = arrItem.findIndex(s => s.Status == 1); // Gửi duyệt có thể Duyệt và Trả về
    var canReturnOnEffDate = arrItem.findIndex(s => s.Status == 3 && Ps_UtilObjectService.getDaysLeft(this.currentDate, s.EffDate) > 0); // Ngưng áp dụng có thể trả về với điều kiện chưa tới ngày hiệu lực
    var canStop = arrItem.findIndex(s => s.Status == 2); // Duyệt áp dụng có thể ngưng
    var canDel = arrItem.findIndex(s => s.Status == 0 && Ps_UtilObjectService.getDaysLeft(this.currentDate, s.EffDate) > 0); // Đang soạn thảo có thể xóa

    if (canSent != -1 && (this.isCreator || this.isMaster)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'Status', Link: "1", Actived: true });
    }

    if ((canReturnOnEffDate != -1 || canAppro_Return != -1) && (this.isApprover || this.isMaster)) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'Status', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'Status', Link: "4", Actived: true }
      )
    }

    if (canStop != -1 && (this.isApprover || this.isMaster)) {
      moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'Status', Link: "3", Actived: true });
    }

    if (canDel != -1 && (this.isCreator || this.isMaster)) {
      moreActionDropdown.push({ Name: "Xóa Bảng c.việc XLKL", Code: "trash", Type: 'Delete', Link: "delete", Actived: true });
    }

    return moreActionDropdown;
  }

  /**
   * Hàm xử lí action trên dropdown
   * @param menu menu action đã nhấn
   * @param item quyết định được chọn
   */
  handleMoreActionItemClick(menu: MenuDataItem, item: DTOHRPolicyMaster) {
    if (item.Code > 0) {
      //Nếu các trường bắt buộc đủ thông tin thì mới được tiếp tục
      if (!this.handleRequiredFieldCheck(this.listSelectedTaskBoard[0])) {
        return;
      }

      if (menu.Type == 'Status') {
        this.APIUpdateHRPolicyStatus(this.listSelectedTaskBoard, parseInt(menu.Link))
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        localStorage.setItem("disciplinaryTaskBoardMaster", JSON.stringify(this.listSelectedTaskBoard[0]))
        this.openDetail();
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.listSelectedTaskBoardToDelete.push(this.listSelectedTaskBoard[0]);
        this.isDialogConfirmDeleteShow = true
      }
    }
  }

  /**
   * Hàm xử lý action được chọn trên popup
   * @param btnType Loại action đã nhấn
   * @param listSelectedItem List các item đã được chọn
   * @param value Value của action đã nhấn
   */
  handleSelectionActionItemClick(btnType: string, listSelectedItem: DTOHRPolicyMaster[], value: string) {
    let reqList = [];
    let reqStatus = 0;

    /**
     * Hàm dùng để lấy những item có những trạng thái thuộc list status truyền vào
     */
    const filterItemsByStatus = (statuses: number[], additionalCheck: Function = () => true) => {
      return listSelectedItem.filter(item =>
        statuses.includes(item.Status) && this.handleRequiredFieldCheck(item) && additionalCheck(item)
      );
    };

    if (btnType === 'Status') {
      switch (value) {
        case '1': // Cập nhật trạng thái thành "Gửi duyệt"
          reqList = filterItemsByStatus([0, 4]);
          reqStatus = 1;
          break;

        case '2': // Cập nhật trạng thái thành "Duyệt áp dụng"
          reqList = filterItemsByStatus([1]);
          var listSus = filterItemsByStatus([3], (item: DTOHRPolicyMaster) =>
            Ps_UtilObjectService.getDaysLeft(this.currentDate, item.EffDate) > 0
          );
          if (Ps_UtilObjectService.hasListValue(listSus)) {
            reqList.push(listSus);
          }
          reqStatus = 2;
          break;

        case '3': // Cập nhật trạng thái thành "Ngừng áp dụng"
          reqList = filterItemsByStatus([2]);
          reqStatus = 3;
          break;

        case '4': // Cập nhật trạng thái thành "Trả về"
          reqList = filterItemsByStatus([1]);
          var listSus = filterItemsByStatus([3], (item: DTOHRPolicyMaster) =>
            Ps_UtilObjectService.getDaysLeft(this.currentDate, item.EffDate) > 0
          );
          if (Ps_UtilObjectService.hasListValue(listSus)) {
            reqList.push(listSus);
          }
          reqStatus = 4;
          break;
      }

      if (Ps_UtilObjectService.hasListValue(reqList)) {
        this.APIUpdateHRPolicyStatus(listSelectedItem, reqStatus)
      }
      else {
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      }
    }
    else if (btnType === 'Delete') {
      this.listSelectedTaskBoardToDelete = listSelectedItem.filter(item => item.Status === 0);

      if (Ps_UtilObjectService.hasListValue(this.listSelectedTaskBoardToDelete)) {
        this.isDialogConfirmDeleteShow = true;
      }
    }
  }
  //#endregion


  //#region FILTER
  /**
   * Hàm dùng để load filter default khi lần đầu khởi động trang
   */
  onLoadDefault() {
    this.filterSearch.filters = [];
    this.currentDateFilterOperator = {
      Code: 1,
      TypeFilter: 'từ',
      ValueFilter: 'gte',
    };
    this.currentDateFilterValue = null;
    this.gridState.skip = 0;
    this.handleLoadFilter();
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
  handlePushFilter(composite: CompositeFilterDescriptor, filterDescriptor?: FilterDescriptor, checkStatus?: boolean, compositeFilter?: CompositeFilterDescriptor) {
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
  handleGenerateFilterDescriptor(field: string, operator: string, value: string | number) {
    return { field: field, operator: operator, value: value }
  }

  /**
   * Hàm dùng để chạy các filter
   */
  handleLoadFilter() {
    if (!this.isFilterDisable) {
      this.isLoading = true;
      this.gridState.filter.filters = [];
      this.filterStatus.filters = [];

      // Filter trạng thái
      this.handlePushFilter(this.filterStatus, this.filterDraftStatus, this.isDraft);
      this.handlePushFilter(this.filterStatus, this.filterSendStatus, this.isSent);
      this.handlePushFilter(this.filterStatus, this.filterApprovedStatus, this.isApproved);
      this.handlePushFilter(this.filterStatus, this.filterSuspendedStatus, this.isSuspended);

      //Nếu trạng thái đang soạn thảo được check thì push thêm trạng thái trả về vào Composite
      if (this.isDraft) {
        this.handlePushFilter(this.filterStatus, this.filterReturnedStatus, this.isDraft);
      }

      // Filter ngày hiệu lực
      this.filterDate = this.handleGenerateFilterDescriptor('EffDate', this.currentDateFilterOperator.ValueFilter, this.currentDateFilterValue)

      this.handlePushFilter(this.gridState.filter, null, null, this.filterStatus);
      this.handlePushFilter(this.gridState.filter, this.filterDate, true);
      this.handlePushFilter(this.gridState.filter, this.filterTypeData, true);

      this.APIGetListHRPolicy();
    }
  }

  /**
   * Hàm dùng để xử lý filter sau khi tương tác với filter component
   * @param value output từ filter component
   * @param field Tên trường 
   */
  handleFilterChange(value: any, field?: string, loadProcess: boolean = true) {
    this.page = 0;
    this.gridState.skip = 0;
    if (Ps_UtilObjectService.hasValue(field)) {
      this[field] = JSON.parse(JSON.stringify(value));
      //Nếu là filter search thì kiểm tra xem value nhập có là rỗng hay không
      if (Ps_UtilObjectService.containsString(field, 'filterSearch')) {
        //Nếu không có giá trị thì set rỗng
        if (!Ps_UtilObjectService.hasValueString(value.filters[0]?.value)) {
          this.filterSearch.filters = []
          this.keySearch = ""
        } else {
          this.keySearch = value.filters[0]?.value
        }
      }

      //Nếu là filter ngày thì lấy value chính xác với múi giờ
      if (Ps_UtilObjectService.containsString(field, 'currentDateFilterValue')) {
        this.currentDateFilterValue = new Date(value).toDateString() + " " + new Date(value).toLocaleTimeString([], { hour12: false });
      }
    }

    // Kiểm tra nếu là dropdown chọn operator cho filter ngày
    const isDateFilterOperator = Ps_UtilObjectService.containsString(field, 'currentDateFilterOperator');

    // Nếu là filter ngày và giá trị không phải null hoặc nếu không phải filter ngày mà loadProcess là true
    if ((isDateFilterOperator && Ps_UtilObjectService.hasValue(this.currentDateFilterValue)) || (!isDateFilterOperator && loadProcess)) {
      this.handleLoadFilter();
    }
  }

  /**
   * Hàm dùng để reset filter
   */
  hanldeResetFilter() {
    this.page = 0;
    this.gridState.skip = 0;
    this.keySearch = ""

    this.isDraft = true;
    this.isSent = true;
    this.isApproved = false;
    this.isSuspended = false;

    this.filterSearch.filters = [];
    this.currentDateFilterValue = null;
    this.currentDateFilterOperator = { ...this.listDateFilterOperator[0] }
    this.handleLoadFilter();
  }
  //#endregion


  //#region HÀM DÙNG CHUNG
  /**
  * Hàm chuyển trang
  * @param isNew Nếu là thêm mới thì param này là true
  */
  openDetail(isNew: boolean = false) {
    this.menuService.changeModuleData().pipe(takeUntil(this.destroy$)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code == 'hriDisciplinary')
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes(this.childMenuItem2) || f.Link.includes(this.childMenuItem2))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes(this.childMenuItem3) || f.Link.includes(this.childMenuItem3))
          this.menuService.activeMenu(detail2)
          if (isNew) {
            var newTaskBoardXLKL = new DTOHRPolicyMaster();
            newTaskBoardXLKL.TypeData = this.filterTypeData.value;
            localStorage.setItem("disciplinaryTaskBoardMaster", JSON.stringify(newTaskBoardXLKL))
          }
        }
      }
    })
  }

  /**
   * Hàm thực hiện đóng dialog sác nhận xóa bảng công việc
   */
  handleCloseDialog() {
    this.isDialogConfirmDeleteShow = false; // Đóng dialog confirm Xóa
    this.listSelectedTaskBoardToDelete = []; // Reset danh sách bảng công việc được chọn để xóa
  }

  /**
   * Hàm dùng để xóa những bảng công việc được chọn
   */
  handleDeleteTaskBoard() {
    // Call API Xóa
    if (Ps_UtilObjectService.hasListValue(this.listSelectedTaskBoardToDelete)) {
      this.APIDeleteHRPolicy(this.listSelectedTaskBoardToDelete);
    }

    this.isDialogConfirmDeleteShow = false; // Đóng dialog confirm Xóa
    this.listSelectedTaskBoardToDelete = []; // Reset danh sách bảng công việc được chọn để xóa
    this.listSelectedTaskBoard = []; // Reset danh sách bảng công việc được chọn
  }

  /**
   * Hàm dùng để check các trường bắt buộc của dto
   * @param dto dto cần check
   * @param isSkipMsg bỏ qua thông báo mặc định là false
   * @returns true | false
   */
  handleRequiredFieldCheck(dto: DTOHRPolicyMaster, isSkipMsg: boolean = false): boolean {
    const fieldsToCheck = [
      { value: dto.PolicyID, label: 'Mã Bảng công việc' },
      { value: dto.PolicyName, label: 'Tiêu đề' },
      { value: dto.EffDate, label: 'Ngày hiệu lực' },
      { value: dto.NumOfTask, label: 'Công việc', checkFunc: (value: any) => value > 0 }
    ];

    const msgStr = 'Đã xảy ra lỗi khi cập nhật trạng thái bảng công việc: Bảng công việc thiếu ';

    for (const field of fieldsToCheck) {
      if (!Ps_UtilObjectService.hasValueString(field.value) || (field.checkFunc && !Ps_UtilObjectService.hasValue(field.value))) {
        if (!isSkipMsg) {
          this.layoutService.onError(msgStr + field.label);
        }
        return false;
      }
    }

    return true;
  }


  /**
  * Hàm trả về tên các bảng công việc chưa hiển thị trên dialog xoá
  * @returns string[]
  */
  handleGetRemainingPolicyNames(): string {
    return this.listSelectedTaskBoardToDelete.slice(2).map(item => item.PolicyName).join(',\n');
  }
  //#endregion
}
