import { ChangeDetectorRef, Component } from '@angular/core';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOHRDecisionProfile } from '../../shared/dto/DTOHRDecisionProfile.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { takeUntil } from 'rxjs/operators';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DomSanitizer } from '@angular/platform-browser';
import { HriDecisionApiService } from '../../shared/services/hri-decision-api.service';
import { DTOHRDecisionMaster } from '../../shared/dto/DTOHRDecisionMaster.dto';

@Component({
  selector: 'app-hri038-disciplinary-decision-list',
  templateUrl: './hri038-disciplinary-decision-list.component.html',
  styleUrls: ['./hri038-disciplinary-decision-list.component.scss']
})
export class Hri038DisciplinaryDecisionListComponent {
  //#region permission
  isToanQuyen = false;
  isAllowedToCreate = false;
  isAllowedToVerify = false;
  justLoaded = true;
  actionPerm: DTOActionPermission[] = [];
  dataPerm: DTODataPermission[] = [];
  //#endregion
  //#region variable status
  isFilterActive = true;
  isLoading: boolean = false;
  isLockAll: boolean = false;
  //#endregion

  // Subscription CallAPi
  arrUnsubscribe: Subscription[] = [];
  changePermission_sst: Subscription;

  constructor(
    private layoutService: LayoutService,
    private layoutAPIService: LayoutAPIService,
    public menuService: PS_HelperMenuService,
    private cdr: ChangeDetectorRef,
    public domSanititizer: DomSanitizer,
    private apiService: HriDecisionApiService
  ) {}

  //#region Init
  //- Unsubcribe
  ngUnsubscribe$ = new Subject<void>();
  
  ngOnInit(): void {
    let that = this;

    //action dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this);

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this);
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this);

    this.onSortChangeCallback = this.sortChange.bind(this);

    this.onSelectCallback = this.selectChange.bind(this);
    this.onPageChangeCallback = this.pageChange.bind(this);
    // this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this);
    this.menuService
      .changePermission()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((res: DTOPermission) => {
        if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
          that.justLoaded = false;
          that.actionPerm = distinct(res.ActionPermission, 'ActionType');

          that.isToanQuyen =
            that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          that.isAllowedToCreate =
            that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          that.isAllowedToVerify =
            that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        }
      });
    // this.isLoading = true;

    // Nếu như GetListModuleAPITree chưa chạy xong thì khóa hết chức năng
    this.isLockAll = true
    this.menuService
      .changePermissionAPI()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res)) {
          this.isLockAll = false
          that.onLoadDefault();
        }
      });
  }

  //#endregion

  //#region dùng chung
  onLoadDefault() {
    this.filterSearchBox.filters = [];
    this.curDateFilterOperator = {
      Code: 1,
      TypeFilter: 'từ',
      ValueFilter: 'gte',
    };
    this.curDateFilterValue = null;
    this.gridState.skip = 0;
    this.onLoadFilter();
  }

  onLoadFilter() {
    // reset filler
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.filterTypeTask.filters = [];
    this.filterStatus.filters = [];
    this.filterNumOfDate.filters = [];

    // Quyết định đang soạn thảo và trả về
    if (this.isDrafting) {
      this.filterStatus.filters.push(this.filterDrafting, this.filterReturned);
    }

    // Quyết định gửi duyệt
    if (this.isSent) {
      this.filterStatus.filters.push(this.filterSent);
    }

    // Quyết định ngưng áp dụng
    if (this.isSuspended) {
      this.filterStatus.filters.push(this.filterSuspended);
    }

    // Quyết định duyệt áp dụng
    if (this.isApproved) {
      this.filterStatus.filters.push(this.filterApproved);
    }

    if (this.filterStatus.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatus);
    }


    // filter search
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      this.gridState.filter.filters.push(this.filterSearchBox);
    }

    // Ngày hiệu lực
    if (Ps_UtilObjectService.hasValue(this.curDateFilterValue)) {
      let filter = {
        field:'EffDate',
        operator: this.curDateFilterOperator.ValueFilter,
        value: this.curDateFilterValue.toDateString(),
        ignoreCase: true,
      };
      this.gridState.filter.filters.push(filter);
    }
    this.APIGetListHRDecisionMaster(this.gridState, 3)
    // this.APIGetListHRDecisionProfile()
  }

  /**
   * Hàm kiểm tra trường bắt buộc và báo lỗi
   * @param value DTOHRDecisionProfile
   * @param showError hiển thị thông báo không?
   * @returns boolean
   */
  onCheckPropertiesRequire(value: DTOHRDecisionProfile, showError: boolean = true): boolean {
    if (!Ps_UtilObjectService.hasValue(value.DecisionID)) {
      if (showError) this.layoutService.onError(`Quyết định của ${value.FullName}: Thiếu mã quyết định`);
      return false;
    }
  
    if (!Ps_UtilObjectService.hasValue(value.DecisionEffDate)) {
      if (showError) this.layoutService.onError(`Quyết định của ${value.FullName}: Thiếu thời gian hiệu lực`);
      return false;
    }
  
    if (!Ps_UtilObjectService.hasValue(value.DisciplinaryForm)) {
      if (showError) this.layoutService.onError(`Quyết định của ${value.FullName}: Thiếu hình thức xử lý`);
      return false;
    }
  
    if (value.DisciplinaryForm === 3 && value.TimeHandle <= 0) {
      if (showError) this.layoutService.onError(`Quyết định của ${value.FullName}: Thiếu thời gian kỷ luật kéo dài nâng lương`);
      return false;
    }
  
    if (value.DisciplinaryForm === 4 && (!value.Position || !value.Department || !value.Location)) {
      if (showError) this.layoutService.onError(`Quyết định của ${value.FullName}: Chưa chọn vị trí cách chức`);
      return false;
    }
  
    return true;
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
  //#endregion

  //#region header-1
  //- breadcrumb
  onLoadDataBreadcumb(){
    this.APIGetListHRDecisionMaster(this.gridState, 3);
  }

  //- filter trạng thái
  isDrafting: boolean = true;
  isSent: boolean = true;
  isApproved: boolean = false;
  isSuspended: boolean = false;
  filterDrafting: FilterDescriptor = { field: 'Status', operator: 'eq', value: 0, ignoreCase: true };
  filterSent: FilterDescriptor = { field: 'Status', operator: 'eq', value: 1, ignoreCase: true };
  filterApproved: FilterDescriptor = { field: 'Status', operator: 'eq', value: 2, ignoreCase: true };
  filterSuspended: FilterDescriptor = { field: 'Status', operator: 'eq', value: 3, ignoreCase: true };
  filterReturned: FilterDescriptor = { field: 'Status', operator: 'eq', value: 4, ignoreCase: true };

  onSelectedChangeCheckbox(event: boolean, variabledName: string){
    this[variabledName] = event
  }

  onFilterChange(event: boolean, variabledName: string) {
    this['filter' + variabledName] = event;
    this.gridState.skip = null;
    this.onLoadFilter();
  }

  DisciplinaryDecision: DTOHRDecisionProfile = new DTOHRDecisionProfile()
  onAdd(){
    this.DisciplinaryDecision = new DTOHRDecisionProfile();
    this.openDetail();
  }

  // move detail
  openDetail() {
    let changeModuleData_sst = this.menuService
      .changeModuleData()
      .subscribe((item: ModuleDataItem) => {
        sessionStorage.setItem('DisciplinaryDecision', JSON.stringify(this.DisciplinaryDecision));
        var parent = item.ListMenu.find(
          (f) =>
            f.Code.includes('hriDisciplinary') ||
            f.Link.includes('hri036-disciplinary-list')
        );

        if (Ps_UtilObjectService.hasValue(parent) &&
          Ps_UtilObjectService.hasListValue(parent.LstChild)) {
          var detail = parent.LstChild.find(
            (f) =>
              f.Code.includes('hri038-disciplinary-decision-list') ||
              f.Link.includes('hri038-disciplinary-decision-list')
          );
        }

        if (Ps_UtilObjectService.hasValue(detail) &&
          Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail1 = detail.LstChild.find(
            (f) =>
              f.Code.includes('hri038-disciplinary-decision-detail') ||
              f.Link.includes('hri038-disciplinary-decision-detail')
          );
          this.menuService.activeMenu(detail1);
        }
      });
    this.arrUnsubscribe.push(changeModuleData_sst);
  }


  //#endregion

  //#region header-2
  isFilterDisable: boolean = false;
  valueSearch: string = ''
  ListDateFilterOperator = [
    { Code: 1, TypeFilter: 'từ', ValueFilter: 'gte' },
    { Code: 2, TypeFilter: 'trước', ValueFilter: 'lt' },
  ];
  curDateFilterOperator: any = {
    Code: 1,
    TypeFilter: 'từ',
    ValueFilter: 'gte',
  };

  //- Handle search
  handleSearch(event: string) {
    this.valueSearch = event;
    this.onLoadFilter();
  }

  //- handle reset
  onResetFilter(){
    this.isDrafting = true;
    this.isSent = true;
    this.isApproved = false;
    this.isSuspended = false;
    this.valueSearch = ''
    this.onLoadFilter();
  }

  curDateFilterValue: Date;
  handleOperatorChange(value: any, property: string) {
    if (Ps_UtilObjectService.hasValue(this.curDateFilterValue)) {
      this[property] = value;
      this.onLoadFilter();
    }
  }

  handleFilterChange(value: any, property: string) {
    this[property] = value;
    this.onLoadFilter();
  }
  //#endregion

  //#region danh sách quyết định
  gridView = new Subject<any>();
  total: number = 0;
  page: number = 1;
  pageSize: number = 25;
  pageSizes: number[] = [25, 50, 75, 100];
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };
  allowActionDropdown = ['detail'];

  ResetState: State = {
    skip: 0,
    filter: { filters: [], logic: 'or' },
    take: this.pageSize,
    sort: [],
  };

  gridState: State = {
    skip: null,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [],
  };

  filterStatus: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  filterTypeTask: CompositeFilterDescriptor = {
    logic: 'and',
    filters: [],
  };

  filterNumOfDate: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  // Grid Callback function
  getActionDropdownCallback: Function;
  onActionDropdownClickCallback: Function;
  getSelectionPopupCallback: Function;
  onSelectedPopupBtnCallback: Function;
  onSelectCallback: Function;
  onPageChangeCallback: Function;

  //#region funcionCallback grid
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible;
  }

  onSortChangeCallback: Function;
  public sort: SortDescriptor[] = [
    {
      field: 'EndDate',
    },
  ];
  sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
  }
  
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOHRDecisionProfile) {
    moreActionDropdown = [];
    this.DisciplinaryDecision = { ...dataItem };
    var status = this.DisciplinaryDecision.Status;
    const ctx = 'quyết định kỷ luật';
  
    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
  
    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
  
    // Push "Chỉnh sửa" khi có quyền tạo hoặc toàn quyền và status = 0 hoặc status = 4
    if (canCreateOrAdmin && (status === 0 || status == 4) || canVerify && status === 1) {
      moreActionDropdown.push({
        Name: 'Chỉnh sửa',
        Code: 'pencil',
        Type: 'edit',
        Actived: true,
      });
    } else {
      // Nếu không thỏa điều kiện "Chỉnh sửa" thì push "Xem chi tiết"
      moreActionDropdown.push({
        Name: 'Xem chi tiết',
        Code: 'eye',
        Link: 'detail',
        Actived: true,
      });
    }
  
    // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và status = 0 hoặc status = 4
    if (canCreateOrAdmin && this.DisciplinaryDecision.Code > 0 && (status === 0 || status === 4) && this.onCheckPropertiesRequire(this.DisciplinaryDecision, false)) {
      moreActionDropdown.push({
        Type: 'Status',
        Name: 'Gửi duyệt',
        Code: 'redo',
        Link: '1',
        Actived: true,
        LstChild: [],
      });
    }
  
    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và status = 1 hoặc status = 3
    if (canVerify && this.DisciplinaryDecision.Code > 0 && (status === 1 || status === 3)) {
      if(this.onCheckPropertiesRequire(this.DisciplinaryDecision, false)){
        moreActionDropdown.push({
          Type: 'Status',
          Name: 'Phê duyệt',
          Code: 'check-outline',
          Link: '2',
          Actived: true,
          LstChild: [],
        });
      }
  
      // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và status = 1 hoặc status = 3
      if(Ps_UtilObjectService.getDaysLeft(this.DisciplinaryDecision.DecisionEffDate, new Date()) > 0){
        moreActionDropdown.push({
          Type: 'Status',
          Name: 'Trả về',
          Code: 'undo',
          Link: '4',
          Actived: true,
          LstChild: [],
        });
      }
    }
  
    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và status = 2
    if (canVerify && this.DisciplinaryDecision.Code > 0 && status === 2
    && Ps_UtilObjectService.getDaysLeft(this.DisciplinaryDecision.DecisionEffDate, new Date()) > 0) {
      moreActionDropdown.push({
        Name: 'Ngưng áp dụng',
        Type: 'Status',
        Code: 'minus-outline',
        Link: '3',
        Actived: true,
        LstChild: [],
      });
    }
    // Sắp xếp theo thứ tự: xem -> chỉnh sửa -> gửi -> duyệt -> ngưng -> trả về
    return moreActionDropdown;
  }

  // Action dropdownlist
  onActionDropdownClick(menu: MenuDataItem, item: DTOHRDecisionProfile) {
    if (item.Code.toString().length > 0) {
      if (menu.Type == 'Status') {
        this.DisciplinaryDecision = { ...item };
        this.DisciplinaryDecision.Status = parseInt(menu.Link);
        var listdataUpdate = [];

        // Trạng thái gửi duyệt
        if (menu.Link == '1') {
          // Chỉ status = 0|4
          if (item.Status == 0 || item.Status == 4) {
            listdataUpdate.push(item);
          }
        } else if (menu.Link == '2') {
          // Trạng thái phê duyệt
          // Chỉ status = 1|3
          if (item.Status == 1 || item.Status == 3) {
            listdataUpdate.push(item);
          }
        } else if (menu.Link == '3') {
          //Trạng thái Ngưng hiển thị
          // Chỉ status = 2
          if (item.Status == 2) {
            listdataUpdate.push(item);
          }
        } else if (menu.Link == '4') {
          // Trạng thái trả về
          // Chỉ status = 1|3
          if (item.Status == 1 || item.Status == 3) {
            listdataUpdate.push(item);
          }
        }
        let Status = parseInt(menu.Link);
        this.APIUpdateHRDecisionProfileStatus(listdataUpdate,Status)
      } else if (
        menu.Link == 'edit' ||
        menu.Code == 'pencil' ||
        menu.Code == 'eye' ||
        menu.Link == 'detail'
      ) {
        this.DisciplinaryDecision = item;
        this.openDetail();
      }
    }
  }

  getSelectionPopup(selectedList: DTOHRDecisionProfile[]) {
    var moreActionDropdown = new Array<MenuDataItem>();
    // Check If Any Item(s) In Selected List Can Send To Verify
    var SendForApproval = selectedList.findIndex(
      (s) => (s.Status === 0 || s.Status === 4)
    );
    if (SendForApproval != -1) {
      if (this.isToanQuyen || this.isAllowedToCreate) {
        moreActionDropdown.push({
          Type: 'Status',
          Name: 'Gửi duyệt',
          Code: 'redo',
          Link: '1',
          Actived: true,
          LstChild: [],
        });
      }
    }

    // Check If Any Item(s) In Selected List Can Send To Verify
    var approval = selectedList.findIndex(
      (s) => (s.Status === 1 || s.Status === 3)
    );
    ////> Push Send To Verify Button To Array If Condition True
    if (approval != -1) {
      if (this.isToanQuyen || this.isAllowedToVerify) {
        moreActionDropdown.push({
          Type: 'Status',
          Name: 'Phê duyệt',
          Code: 'check-outline',
          Link: '2',
          Actived: true,
          LstChild: [],
        });
      }
    }

    // Check If Any Item(s) In Selected List Need To Stop Displaying
    var Hide = selectedList.findIndex((s) => s.Status == 2 && Ps_UtilObjectService.getDaysLeft(this.DisciplinaryDecision.DecisionEffDate, new Date()) > 0);
    ////> Push Stop Displaying Button To Array If Condition True
    if (Hide != -1) {
      if (this.isAllowedToVerify || this.isToanQuyen) {
        moreActionDropdown.push({
          Type: 'Status',
          Name: 'Ngưng áp dụng',
          Code: 'minus-outline',
          Link: '3',
          Actived: true,
          LstChild: [],
        });
      }
    }

    // Check If Any Item(s) In Selected List Need To Be Verified Or Returned
    var Return = selectedList.findIndex(
      (s) => s.Status == 1 || s.Status == 3 && Ps_UtilObjectService.getDaysLeft(this.DisciplinaryDecision.DecisionEffDate, new Date()) > 0
    );
    ////> Push Return Button To Array If Condition True
    if (Return != -1) {
      //|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      if (this.isAllowedToVerify || this.isToanQuyen) {
        moreActionDropdown.push({
          Type: 'Status',
          Name: 'Trả về',
          Code: 'undo',
          Link: '4',
          Actived: true,
          LstChild: [],
        });
      }
    }

    return moreActionDropdown;
  }

  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    let Status;
    var listdataUpdate = [];
    if (list.length > 0) {
      if (btnType == 'Status') {
        // Trạng thái gửi duyệt
        if (value == 1 || value == '1') {
          list.forEach((s) => {
            // Chỉ status = 0|4
            if ((s.Status === 0 || s.Status === 4) &&
              Ps_UtilObjectService.hasValueString(s.SalaryName) &&
              Ps_UtilObjectService.isValidDate2(s.EffDate) && s.NoOfEmployee > 0) {
              listdataUpdate.push(s);
            }
          });
          Status = parseInt(value);
        }
        // Trạng thái phê duyệt
        if (value == 2 || value == '2') {
          list.forEach((s) => {
            // Chỉ status = 1|3
            if ((s.Status === 1 || s.Status === 3) &&
            Ps_UtilObjectService.hasValueString(s.SalaryName) &&
            Ps_UtilObjectService.isValidDate2(s.EffDate) && s.NoOfEmployee > 0) {
              listdataUpdate.push(s);
            }
          });
          Status = parseInt(value);
        }
        //Trạng thái Ngưng hiển thị
        else if (value == 3 || value == '3') {
          list.forEach((s) => {
            // Chỉ status = 2
            if (s.Status == 2) {
              listdataUpdate.push(s);
            }
          });
          Status = parseInt(value);
        }
        // Trạng thái trả về
        else if (value == 4 || value == '4') {
          list.forEach((s) => {
            // Chỉ status = 1|3
            if (s.Status == 1 || s.Status == 3) {
              listdataUpdate.push(s);
            }
          });
          Status = parseInt(value);
        }

        this.APIUpdateHRDecisionProfileStatus(listdataUpdate, Status)
      }
    }
  }

  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = event.take;
  }
  //#endregion funcionCallback grid
  
  //#region dialog
  openedDialog: boolean = false;
  paramDisciplinaryDecisionName: string;
  arrayDisciplinaryDecision: DTOHRDecisionProfile[] = [];

  public closeDialog(): void {
    this.openedDialog = false;
  }

  deleteDialog(status: string): void {
    if (status == 'yes') {
      this.openedDialog = false;
    } else {
      this.openedDialog = false;
    }
  }

  //#endregion

  //#endregion

  // #region API
  
  /**
   *  API LẤY DANH SÁCH QUYẾT ĐỊNH
   * @param Filter Kendo Filter
   * @param Keyword
   */
  APIGetListHRDecisionMaster(Filter: State, TypeData: number = 3) {
    let ctx: string = 'kỷ luật';

    this.isLoading = true;
    this.apiService
      .GetListHRDecisionMaster(Filter, null, TypeData)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
            this.gridView.next({ data: res.ObjectReturn.Data, total:  res.ObjectReturn.Total });
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách quyết định ${ctx}: ${res.ErrorString} `
            );
          }
        },
        (error) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách quyết định ${ctx}: ${error} `
          );
        }
      );
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
          this.APIGetListHRDecisionMaster(this.gridState, 3);
          // this.APIGetListHRDecisionProfile()
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật ${ctx}: ${error} `
          );
        }
      );
  }

  /**
   * API lấy danh sách hồ sơ quyết định
   */
  APIGetListHRDecisionProfile() {
    const apiText: string = 'quyết định';
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
            this.gridView.next({ data: res.ObjectReturn.Data, total: this.total });
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
   * API lấy danh sách hồ sơ boarding
   */
  APIUpdateHRDecisionProfileStatus(
    listDTO: DTOHRDecisionProfile[],
    status: number
  ) {
    const apiText: string = 'quyết định';
    // this.isLoading = true;
    this.apiService
      .UpdateHRDecisionProfileStatus(listDTO, status)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          // this.isLoading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            res.StatusCode == 0
          ) {
            this.APIGetListHRDecisionProfile();
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi tình trạng hồ sơ ${apiText}: ` +
                res.ErrorString
            );
          }
        },
        (err) => {
          this.isLoading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi tình trạng hồ sơ ${apiText}: ${err}`
          );
        }
      );
  }
  // #endregion

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
