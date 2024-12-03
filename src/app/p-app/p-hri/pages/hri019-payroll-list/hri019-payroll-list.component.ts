import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  State,
  distinct,
  SortDescriptor,
} from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import {
  PageChangeEvent,
  SelectableSettings,
} from '@progress/kendo-angular-grid';
import {
  MenuDataItem,
  ModuleDataItem,
} from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ConfigService } from 'src/app/p-app/p-config/shared/services/config.service';
import { PayslipService } from '../../shared/services/payslip.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';
import { HriSalaryApiService } from '../../shared/services/hri-salary-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTOPayroll } from '../../shared/dto/DTOPayroll.dto';
import { PKendodropdownlistComponent } from 'src/app/p-app/p-layout/components/p-kendo-dropdownlist/p-kendo-dropdownlist.component';


/** !Important
  Khi truy cập vào trang API GetListPayroll sẽ được gọi 2 lần 
  Nhầm mục địch:
    1 lần gọi để lấy danh sách theo filter
    1 lần gọi để lấy ra tất cả kỳ lương cho "Lọc theo kỳ lương" | "Lọc theo kỳ lương" luôn phải lấy tất cả bảng lương
 * */ 
@Component({
  selector: 'app-hri019-payroll-list',
  templateUrl: './hri019-payroll-list.component.html',
  styleUrls: ['./hri019-payroll-list.component.scss'],
})
export class Hri019PayrollListComponent {
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
  //#endregion



  //#region Variable dialog \\
  openedDialog: boolean = false;
  paramPayrollName: string;
  arrayPayroll: DTOPayroll[] = [];
  //#endregion

  //#region move detail
  changeModuleData_sst: Subscription;
  Payroll = new DTOPayroll();
  //#endregion

  // Grid Callback function
  getActionDropdownCallback: Function;
  onActionDropdownClickCallback: Function;
  getSelectionPopupCallback: Function;
  onSelectedPopupBtnCallback: Function;
  onSelectCallback: Function;
  onPageChangeCallback: Function;

  // Subscription CallAPi
  arrUnsubscribe: Subscription[] = [];
  changePermission_sst: Subscription;

  //#region Filter
  // - variable
  isDrafting: boolean = false;
  isApproved: boolean = false;
  isSuspended: boolean = false;
  isSent: boolean = false;
  filterDrafting: FilterDescriptor;
  filterApproved: FilterDescriptor;
  filterSuspended: FilterDescriptor;
  filterSent: FilterDescriptor;

  //#endregion

  // variable grid
  gridView = new Subject<any>();
  total: number = 0;
  ListPayroll: DTOPayroll[] = [];
  loading = false;
  pageSize = 25;
  pageSizes = [this.pageSize];
  valueSearch: string = '';
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };
  allowActionDropdown = ['detail'];
  //- filter reset
  sortByFromDate: SortDescriptor = {
    field: 'FromDate',
    dir: 'desc'
  }
  filterReturned = {
    field: 'StatusID',
    operator: 'eq',
    value: 4,
    ignoreCase: true,
  };

  ResetState: State = {
    skip: null,
    filter: { filters: [], logic: 'or' },
    take: this.pageSize,
    sort: [this.sortByFromDate]
  };

  GetAllPayroll: State = {
    skip: null,
    filter: { filters: [], logic: 'or' },
    sort: [this.sortByFromDate]
  };

  gridState: State = {
    skip: null,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [this.sortByFromDate]
  };

  filterStatusID: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'and',
    filters: [],
  };

  //#region unsubcribe
  ngUnsubscribe$ = new Subject<void>();
  //#endregion

  constructor(
    private layoutService: LayoutService,
    private layoutAPIService: LayoutAPIService,
    public service: ConfigService,
    public servicePayslip: PayslipService,
    public menuService: PS_HelperMenuService,
    private salaryApiService: HriSalaryApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    let that = this;
    //action dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this);
    
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this);
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this);
    
    this.onSelectCallback = this.selectChange.bind(this);
    this.onPageChangeCallback = this.pageChange.bind(this);
    // this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this);
    let changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
      }
    })

    let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        that.loadDefault();
			}
		})
    this.arrUnsubscribe.push(changePermission_sst, permissionAPI);
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  loadDefault() {
    this.isDrafting = true;
    this.isSent = true;
    this.isApproved = false;
    this.isSuspended = false;
    this.filterDrafting = {
      field: 'StatusID',
      operator: 'eq',
      value: 0,
      ignoreCase: true,
    };
    this.filterSent = {
      field: 'StatusID',
      operator: 'eq',
      value: 1,
      ignoreCase: true,
    };
    this.gridState.skip = null;
    this.loadFilter();
    this.APIGetListPayroll('', this.gridState);
    this.APIGetAllPayroll()
  }

  loadDataBreadcumb(){
    if(this.isFilterActive){
      this.loadFilter();
      this.APIGetListPayroll('', this.gridState);
      this.APIGetAllPayroll()
    }
  }

  //#region filter group
  //- Handle reset
  onResetFilter(fromDate: PKendodropdownlistComponent, toDate: PKendodropdownlistComponent) {
    this.FromDate = null;
    this.ToDate = null;
    fromDate.reset();
    toDate.reset();
    this.dropdownFromDate = this.ListPayrollOrigin
    this.dropdownToDate = this.ListPayrollOrigin
    this.isDrafting = true;
    this.isApproved = false;
    this.isSuspended = false;
    this.isSent = true;
    this.valueSearch = '';
    this.gridState.skip = null;
    this.FilterDescriptorForFromDate = null;
    this.FilterDescriptorForToDate = null;
    this.loadFilter();
    this.APIGetListPayroll(this.valueSearch, this.gridState);
  }

  loadFilter() {
    // reset filler
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.filterStatusID.filters = [];
    this.filterSearchBox.filters = [];

    // Add filter cho checkbox header 2

    if (this.isDrafting) {
      this.filterStatusID.filters.push(this.filterDrafting);
      this.filterStatusID.filters.push(this.filterReturned);
    }

    if (this.isApproved) {
      this.filterStatusID.filters.push(this.filterApproved);
    }

    if (this.isSuspended) {
      this.filterStatusID.filters.push(this.filterSuspended);
    }

    if (this.isSent) {
      this.filterStatusID.filters.push(this.filterSent);
    }

    if (this.filterStatusID.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatusID);
    }

    if (Ps_UtilObjectService.hasValue(this.FilterDescriptorForFromDate)) {
        this.filterSearchBox.filters.push(this.FilterDescriptorForFromDate);
    }

    if (Ps_UtilObjectService.hasValue(this.FilterDescriptorForToDate)) {
      this.filterSearchBox.filters.push(this.FilterDescriptorForToDate);
    }

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
        this.gridState.filter.filters.push(this.filterSearchBox);
    }
  }

  //- Handle search
  handleSearch(event: string) {
    this.valueSearch = event;
    this.loadFilter();
    this.APIGetListPayroll(this.valueSearch, this.gridState);
  }

  // Handle lắng nghe sự thay đổi của checkbox
  selectedChangeCheckbox(event: any, typebtn: string) {
    if (typebtn == 'isDrafting') {
      this.isDrafting = event;
    } else if (typebtn == 'isApproved') {
      this.isApproved = event;
    } else if (typebtn == 'isSuspended') {
      this.isSuspended = event;
    } else if (typebtn == 'isSent') {
      this.isSent = event;
    }
  }

  filterChangeDrafting(event: any) {
    this.filterDrafting = event;
    this.gridState.skip = null;
    this.loadFilter();
    this.APIGetListPayroll(this.valueSearch, this.gridState);
  }

  filterChangeApproved(event: any) {
    this.filterApproved = event;
    this.gridState.skip = null;
    this.loadFilter();
    this.APIGetListPayroll(this.valueSearch, this.gridState);
  }

  filterChangesSuspended(event: any) {
    this.filterSuspended = event;
    this.gridState.skip = null;
    this.loadFilter();
    this.APIGetListPayroll(this.valueSearch, this.gridState);
  }

  filterChangeSent(event: any) {
    this.filterSent = event;
    this.gridState.skip = null;
    this.loadFilter();
    this.APIGetListPayroll(this.valueSearch, this.gridState);
  }
  //#endregion filter group

  //#region funcionCallback grid
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible;
  }
  
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOPayroll) {
    moreActionDropdown = [];
    this.Payroll = { ...dataItem };
    var statusID = this.Payroll.StatusID;
    const ctx = 'bảng lương';
  
    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
  
    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
  
    // Push "Chỉnh sửa" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && (statusID === 0 || statusID == 4) || canVerify && statusID === 1) {
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
  
    // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && this.Payroll.Code > 0 && (statusID === 0 || statusID === 4) && Ps_UtilObjectService.hasValueString(this.Payroll.SalaryName) &&
    Ps_UtilObjectService.isValidDate2(this.Payroll.EffDate) && this.Payroll.NoOfEmployee > 0) {
      moreActionDropdown.push({
        Type: 'StatusID',
        Name: 'Gửi duyệt',
        Code: 'redo',
        Link: '1',
        Actived: true,
        LstChild: [],
      });
    }
  
    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    if (canVerify && this.Payroll.Code > 0 && (statusID === 1 || statusID === 3)) {
      if(Ps_UtilObjectService.hasValueString(this.Payroll.SalaryName) &&Ps_UtilObjectService.isValidDate2(this.Payroll.EffDate) && this.Payroll.NoOfEmployee > 0){
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Phê duyệt',
          Code: 'check-outline',
          Link: '2',
          Actived: true,
          LstChild: [],
        });
      }
  
      // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
      moreActionDropdown.push({
        Type: 'StatusID',
        Name: 'Trả về',
        Code: 'undo',
        Link: '4',
        Actived: true,
        LstChild: [],
      });
    }
  
    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    if (canVerify && this.Payroll.Code > 0 && statusID === 2) {
      moreActionDropdown.push({
        Name: 'Ngưng áp dụng',
        Type: 'StatusID',
        Code: 'minus-outline',
        Link: '3',
        Actived: true,
        LstChild: [],
      });
    }
  
    // Push "Xóa" khi có quyền tạo hoặc toàn quyền và statusID === 0
    if (canCreateOrAdmin && this.Payroll.Code > 0 && this.Payroll.NoOfEmployee == 0 && statusID === 0) {
      moreActionDropdown.push({
        Name: `Xóa ${ctx}`,
        Type: 'delete',
        Code: 'trash',
        Link: 'delete',
        Actived: true,
        LstChild: [],
      });
    }
  
    // Sắp xếp theo thứ tự: xem -> chỉnh sửa -> gửi -> duyệt -> ngưng -> trả về
    return moreActionDropdown;
  }

  // Action dropdownlist
  onActionDropdownClick(menu: MenuDataItem, item: DTOPayroll) {
    if (item.Code.toString().length > 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        if (item.StatusID == 0) {
          this.Payroll = { ...item };
          this.paramPayrollName = this.Payroll.SalaryName;
          this.arrayPayroll = [this.Payroll];
          this.openedDialog = true;
        }
      } else if (menu.Type == 'StatusID') {
        this.Payroll = { ...item };
        this.Payroll.StatusID = parseInt(menu.Link);
        var listdataUpdate = [];

        // Trạng thái gửi duyệt
        if (menu.Link == '1') {
          // Chỉ statusID = 0|4
          if (item.StatusID == 0 || item.StatusID == 4) {
            listdataUpdate.push(item);
          }
        } else if (menu.Link == '2') {
          // Trạng thái phê duyệt
          // Chỉ statusID = 1|3
          if (item.StatusID == 1 || item.StatusID == 3) {
            listdataUpdate.push(item);
          }
        } else if (menu.Link == '3') {
          //Trạng thái Ngưng hiển thị
          // Chỉ statusID = 2
          if (item.StatusID == 2) {
            listdataUpdate.push(item);
          }
        } else if (menu.Link == '4') {
          // Trạng thái trả về
          // Chỉ statusID = 1|3
          if (item.StatusID == 1 || item.StatusID == 3) {
            listdataUpdate.push(item);
          }
        }
        let StatusID = parseInt(menu.Link);
        this.APIUpdatePayrollStatus(listdataUpdate, StatusID);
      } else if (
        menu.Link == 'edit' ||
        menu.Code == 'pencil' ||
        menu.Code == 'eye' ||
        menu.Link == 'detail'
      ) {
        this.Payroll = item;
        this.openDetail('detail');
      }
    }
  }

  getSelectionPopup(selectedList: DTOPayroll[]) {
    var moreActionDropdown = new Array<MenuDataItem>();
    // Check If Any Item(s) In Selected List Can Send To Verify
    var SendForApproval = selectedList.findIndex(
      (s) =>
        (s.StatusID === 0 || s.StatusID === 4) &&
        Ps_UtilObjectService.hasValueString(s.SalaryName) &&
        Ps_UtilObjectService.isValidDate2(s.EffDate) && s.NoOfEmployee > 0
    );
    if (SendForApproval != -1) {
      if (this.isToanQuyen || this.isAllowedToCreate) {
        moreActionDropdown.push({
          Type: 'StatusID',
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
      (s) =>
        (s.StatusID === 1 || s.StatusID === 3) &&
        Ps_UtilObjectService.hasValueString(s.SalaryName) &&
        Ps_UtilObjectService.isValidDate2(s.EffDate) && s.NoOfEmployee > 0
    );
    ////> Push Send To Verify Button To Array If Condition True
    if (approval != -1) {
      if (this.isToanQuyen || this.isAllowedToVerify) {
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Phê duyệt',
          Code: 'check-outline',
          Link: '2',
          Actived: true,
          LstChild: [],
        });
      }
    }

    // Check If Any Item(s) In Selected List Need To Stop Displaying
    var Hide = selectedList.findIndex((s) => s.StatusID == 2);
    ////> Push Stop Displaying Button To Array If Condition True
    if (Hide != -1) {
      if (this.isAllowedToVerify || this.isToanQuyen) {
        moreActionDropdown.push({
          Type: 'StatusID',
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
      (s) => s.StatusID == 1 || s.StatusID == 3
    );
    ////> Push Return Button To Array If Condition True
    if (Return != -1) {
      //|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      if (this.isAllowedToVerify || this.isToanQuyen) {
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Trả về',
          Code: 'undo',
          Link: '4',
          Actived: true,
          LstChild: [],
        });
      }
    }

    // Check If Any Item(s) In Selected List Can Be Deleted
    var Delete = selectedList.findIndex((s) => s.StatusID == 0);
    ////> Push Delete Button To Array If Condition True
    if (Delete != -1) {
      //|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      if (this.isAllowedToCreate || this.isToanQuyen) {
        moreActionDropdown.push({
          Name: 'Xóa bảng lương',
          Type: 'delete',
          Code: 'trash',
          Link: 'delete',
          Actived: true,
          LstChild: [],
        });
      }
    }

    return moreActionDropdown;
  }

  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    let StatusID;
    var listdataUpdate = [];
    if (list.length > 0) {
      if (btnType == 'StatusID') {
        // Trạng thái gửi duyệt
        if (value == 1 || value == '1') {
          list.forEach((s) => {
            // Chỉ statusID = 0|4
            if ((s.StatusID === 0 || s.StatusID === 4) &&
              Ps_UtilObjectService.hasValueString(s.SalaryName) &&
              Ps_UtilObjectService.isValidDate2(s.EffDate) && s.NoOfEmployee > 0) {
              listdataUpdate.push(s);
            }
          });
          StatusID = parseInt(value);
        }
        // Trạng thái phê duyệt
        if (value == 2 || value == '2') {
          list.forEach((s) => {
            // Chỉ statusID = 1|3
            if ((s.StatusID === 1 || s.StatusID === 3) &&
            Ps_UtilObjectService.hasValueString(s.SalaryName) &&
            Ps_UtilObjectService.isValidDate2(s.EffDate) && s.NoOfEmployee > 0) {
              listdataUpdate.push(s);
            }
          });
          StatusID = parseInt(value);
        }
        //Trạng thái Ngưng hiển thị
        else if (value == 3 || value == '3') {
          list.forEach((s) => {
            // Chỉ statusID = 2
            if (s.StatusID == 2) {
              listdataUpdate.push(s);
            }
          });
          StatusID = parseInt(value);
        }
        // Trạng thái trả về
        else if (value == 4 || value == '4') {
          list.forEach((s) => {
            // Chỉ statusID = 1|3
            if (s.StatusID == 1 || s.StatusID == 3) {
              listdataUpdate.push(s);
            }
          });
          StatusID = parseInt(value);
        }
        // this.layoutService
        //   .getSelectionPopupComponent()
        //   .closeSelectedRowitemDialog();
        this.APIUpdatePayrollStatus(listdataUpdate, StatusID);
      }
      // Trạng thái delete
      else if (btnType == 'delete') {
        var listDataDelete = [];
        list.forEach((s) => {
          // Chỉ statusID = 0
          if (s.StatusID == 0) {
            listDataDelete.push(s);
          }
        });
        this.paramPayrollName =
          'Bạn có chắc rằng sẽ xóa tất cả các câu hỏi được chọn không!';
        this.arrayPayroll = listDataDelete;
        this.openedDialog = true;
        // this.layoutService
        //   .getSelectionPopupComponent()
        //   .closeSelectedRowitemDialog();
      }
    }
  }

  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take;
    this.APIGetListPayroll(this.valueSearch, this.gridState);
  }
  //#endregion funcionCallback grid

  // Thêm mới
  onAdd() {
    this.Payroll = new DTOPayroll(null);
    sessionStorage.setItem('Payroll', JSON.stringify(this.Payroll));
    this.openDetail('detail');
  }

  // move detail
  openDetail(link: string) {
    let changeModuleData_sst = this.menuService
      .changeModuleData()
      .subscribe((item: ModuleDataItem) => {
        sessionStorage.setItem('Payroll', JSON.stringify(this.Payroll));
        var parent = item.ListMenu.find(
          (f) =>
            f.Code.includes('hriSal') ||
            f.Link.includes('hri002-policysalary')
        );

        if (link == 'list') {
          if (
            Ps_UtilObjectService.hasValue(parent) &&
            Ps_UtilObjectService.hasListValue(parent.LstChild)
          ) {
            var detail = parent.LstChild.find(
              (f) =>
                f.Code.includes('hri019-payroll-list') ||
                f.Link.includes('hri019-payroll-list')
            );

            this.menuService.activeMenu(detail);
          }
        } else if (link == 'detail') {
          if (
            Ps_UtilObjectService.hasValue(parent) &&
            Ps_UtilObjectService.hasListValue(parent.LstChild)
          ) {
            var detail = parent.LstChild.find(
              (f) =>
                f.Code.includes('hri019-payroll-list') ||
                f.Link.includes('hri019-payroll-list')
            );

            if (
              Ps_UtilObjectService.hasValue(detail) &&
              Ps_UtilObjectService.hasListValue(detail.LstChild)
            ) {
              var detail2 = detail.LstChild.find(
                (f) =>
                  f.Code.includes('hri019-payroll-detail') ||
                  f.Link.includes('hri019-payroll-detail')
              );

              this.menuService.activeMenu(detail2);
            }
          }
        }
      });
    this.arrUnsubscribe.push(changeModuleData_sst);
  }

  //#region dialog
  public closeDialog(): void {
    this.openedDialog = false;
  }

  deleteDialog(status: string): void {
    if (status == 'yes') {
      this.APIDeletePayroll(this.arrayPayroll);
      this.openedDialog = false;
    } else {
      this.openedDialog = false;
    }
  }

  //#endregion

  //#region Dropdownlist 
  ListPayrollOrigin: DTOPayroll[] = []
  dropdownFromDate: DTOPayroll[] = [];
  dropdownToDate: DTOPayroll[] = [];
  FilterDescriptorForFromDate: FilterDescriptor
  FilterDescriptorForToDate: FilterDescriptor
  defaultItem:DTOPayroll = new DTOPayroll(null, '-- Chọn --', '-- Chọn --', '-- Chọn --' );
  FromDate:DTOPayroll = this.defaultItem;
  ToDate:DTOPayroll = this.defaultItem;
  isCallApiForDropdown: boolean = true;

  selectionChangeDropdown(event: DTOPayroll, property: string) {
    const temp = JSON.parse(JSON.stringify(this.ListPayrollOrigin.slice()));

    if (property === 'FromDate') {
        this.FilterDescriptorForFromDate = event.Code !== null ? {
            field: 'FromDate',
            operator: 'gte',
            ignoreCase: false,
            value: event.FromDate
        } : null;

        event.Code !== null ? this.dropdownToDate = temp.filter(item =>
            (new Date(item.FromDate) > new Date(event.FromDate) || item.Code === null)
        ) : this.dropdownToDate = this.ListPayrollOrigin;
    } else if (property === 'ToDate') {
        this.FilterDescriptorForToDate = event.Code !== null ? {
            field: 'FromDate',
            operator: 'lte',
            ignoreCase: false,
            value: event.FromDate
        } : null;

        event.Code !== null ? this.dropdownFromDate =  temp.filter(item =>
            (new Date(item.FromDate) < new Date(event.FromDate) || item.Code === null)
        ) : this.dropdownFromDate = this.ListPayrollOrigin;
    }
    this.loadFilter();
    this.APIGetListPayroll(this.valueSearch, this.gridState);
  }

  //#endregion Dropdownlist

  //#region API
  APIGetAllPayroll() {

    this.loading = true;
    var APIGetListPayroll = this.salaryApiService
      .GetListPayroll("", this.GetAllPayroll).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách bảng lương: ${res.ErrorString}`
            );
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.ListPayrollOrigin =  res.ObjectReturn.Data.slice();
            this.ListPayrollOrigin.unshift(this.defaultItem);
            this.dropdownFromDate = this.ListPayrollOrigin;

            this.dropdownToDate = this.ListPayrollOrigin;
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách bảng lương: ${error}`
          );
        }
      );
    this.arrUnsubscribe.push(APIGetListPayroll);
  }

  APIGetListPayroll(keyword: string, state: State) {
    this.loading = true;
    var APIGetListPayroll = this.salaryApiService
      .GetListPayroll(keyword, state).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy danh sách bảng lương: ${res.ErrorString}`
            );
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.ListPayroll = res.ObjectReturn.Data;
            
            this.total = res.ObjectReturn.Total;
            this.gridView.next({data: this.ListPayroll,total: this.total });
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách bảng lương: ${error}`
          );
        }
      );
    this.arrUnsubscribe.push(APIGetListPayroll);
  }

  APIUpdatePayrollStatus(dto: DTOPayroll[],statusID: number) {
    this.loading = true;
    var UpdatePayrollStatus = this.salaryApiService
      .UpdatePayrollStatus(dto, statusID).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật trạng thái bảng lương: ${res.ErrorString}`
            );
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(
              'Cập nhật trạng thái bảng lương thành công!'
            );
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
            this.APIGetListPayroll(this.valueSearch, this.gridState);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật trạng thái bảng lương: ${error}`
          );
        }
      );
    this.arrUnsubscribe.push(UpdatePayrollStatus);
  }

  APIDeletePayroll(arr: DTOPayroll[]) {
    this.loading = true;
    let DeletePayroll = this.salaryApiService
      .DeletePayroll(arr).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi xóa bảng lương: ${res.ErrorString}`
            );
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
            this.APIGetListPayroll(this.valueSearch, this.gridState);
            this.layoutService.onSuccess('Xóa bảng lương thành công');
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi xóa bảng lương: ${error}`
          );
        }
      );
    this.arrUnsubscribe.push(DeletePayroll);
  }



  //#endregion API

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
      s?.unsubscribe();
    });
  }
}
