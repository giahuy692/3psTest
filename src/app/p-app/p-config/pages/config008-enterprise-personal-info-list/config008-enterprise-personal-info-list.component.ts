import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridDataResult, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, State } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DTOCompany } from 'src/app/p-app/p-developer/shared/dto/DTOCompany';
import { DeveloperAPIService } from 'src/app/p-app/p-developer/shared/services/developer-api.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOResponse, Ps_UtilObjectService } from 'src/app/p-lib';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOPersonalInfo } from 'src/app/p-app/p-hri/shared/dto/DTOPersonalInfo.dto';
import { ConfigPersonalInforApiService } from '../../shared/services/config-personal-infor-api.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { SearchFilterGroupComponent } from 'src/app/p-app/p-layout/components/search-filter-group/search-filter-group.component';

@Component({
  selector: 'app-config008-enterprise-personal-info-list',
  templateUrl: './config008-enterprise-personal-info-list.component.html',
  styleUrls: ['./config008-enterprise-personal-info-list.component.scss']
})
export class Config008EnterprisePersonalInfoListComponent implements OnInit, OnDestroy {
  //#region VARIABLES
  destroy$ = new Subject<void>(); // Dùng để unscribe
  gridView: GridDataResult;


  justLoaded: boolean = true;
  actionPerm: DTOActionPermission[] = []; // Danh sách các quyền
  isMaster: boolean = false; // Toàn quyền
  isCreator: boolean = false; // Quyền tạo
  isApprover: boolean = false; // Quyền duyệt
  isAllowedToViewOnly: boolean = false; // Được xem3
  isLoadingListCompany: boolean = false // Loading của dropdown multiple công ty
  isLoading: boolean = false; // Loading của danh sách
  isReadOnly: boolean = false; // Khu vực chứa được kiểm tra điều kiện nếu true sẽ bị readonly
  isDisabled: boolean = false; // Khu vực chứa được kiểm tra điều kiện nếu true sẽ bị disabled
  newPersonal: DTOPersonalInfo = new DTOPersonalInfo();


  pageSize: number = 25;


  childMenuItem1: string = ''; // Menu trang hiện tại - Cấp 1
  childMenuItem2: string = ''; // Menu trang chi tiết - Cấp 2


  listCompany: DTOCompany[] = [] // Danh sách công ty
  listFilteredCompany: DTOCompany[] = [] // Danh sách công ty
  listTypeBelongTo: { Type: number, TypeName: string }[]; // Danh sách loại nhân sự ("Thuộc công ty", "Không thuộc công ty", ...)
  listSelectedCompany: DTOCompany[] = []; // Danh sách các công ty được chọn
  pageSizes: number[] = [25, 50, 75, 100]; // list pagesize


  selectedTypeBelongTo: { Type: number, TypeName: string }; // Loại nhân sự là "Thuộc công ty" hoặc "Không thuộc công ty"
  selectable: SelectableSettings = {
    enabled: false,
    mode: 'multiple',
    drag: false,
    checkboxOnly: false,
  } //Setting Selectable cho grid


  gridStateCompany: State = { take: 25, filter: { filters: [], logic: 'and' } };
  gridState: State;
  filterType: FilterDescriptor = { field: 'IsInCompany', operator: 'eq', value: true };
  filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] } // Filter search
  filterCompany: CompositeFilterDescriptor = { logic: 'or', filters: [] } // Filter list company
  filterPhone: CompositeFilterDescriptor = { logic: 'or', filters: [] } // Filter cell phone


  onPageChangeCallback: Function;
  onActionDropDownClickCallback: Function;
  onSelectCallback: Function;
  getActionDropdownCallback: Function;
  onFilterChangeCallback: Function

  @ViewChild('searchGroup') childSearchGroup!: SearchFilterGroupComponent;
  //#endregion

  //#region HOOKS
  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public apiDevService: DeveloperAPIService,
    public personalService: ConfigPersonalInforApiService,
    public layoutAPIService: LayoutAPIService,
  ) { }

  ngOnInit(): void {
    // Lấy menu
    this.childMenuItem1 = "config008-enterprise-personal-info-list"
    this.childMenuItem2 = "config008-enterprise-personal-info-detail"

    this.onInitState();
    this.getPermission();
    // this.APIGetListCompany(this.gridStateCompany);
    this.getListTypeBelongTo();
    // this.GetListHRPersonalProfile();

    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetListCompany(this.gridStateCompany);
        this.APIGetListHRPersonalProfile();
      }
    })

    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onPageChangeCallback = this.onPageChange.bind(this);
    this.onActionDropDownClickCallback = this.onMoreActionItemClick.bind(this);
    this.onFilterChangeCallback = this.handleFilterChange.bind(this);

    localStorage.removeItem("Staff");
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion


  //#region API
  /**
   * Hàm dùng để lấy danh sách loại nhân sự
   */
  getListTypeBelongTo() {
    this.listTypeBelongTo = [
      {
        Type: 1,
        TypeName: 'Thuộc công ty'
      },
      {
        Type: 2,
        TypeName: 'Không thuộc công ty'
      }
    ]

    // Mặc định dropdown chọn "Thuộc công ty"
    this.selectedTypeBelongTo = this.listTypeBelongTo.find(item => item.Type = 1);
  }

  /**
   * Dùng để lấy các phân quyền
   */
  getPermission() {
    this.menuService.changePermission().pipe(takeUntil(this.destroy$)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        this.isMaster =
          this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator =
          this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover =
          this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        //Chỉ được xem
        this.isAllowedToViewOnly =
          this.actionPerm.findIndex((s) => s.ActionType == 6) > -1 &&
          !Ps_UtilObjectService.hasListValue(
            this.actionPerm.filter((s) => s.ActionType != 6)
          );
      }
    });
  }

  /**
   * API lấy danh sách công ty
   * @param gridState 
   * @param keyword 
   */
  APIGetListCompany(gridState: State, keyword: string = '') {
    this.isLoadingListCompany = true;
    this.apiDevService.GetListCompany(gridState, keyword).pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          const list: DTOCompany[] = res.ObjectReturn.Data;
          this.listCompany = list.filter(company => company.Code !== 4);
          this.listSelectedCompany = this.listCompany.filter(company => company.Code == 1 || company.Code == 2);
          this.listFilteredCompany = this.listCompany;
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công ty: ${res.ErrorString}`)
        }
        this.isLoadingListCompany = false
      },
      (error) => {
        this.isLoadingListCompany = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công ty: ${error} `)
      }
    )
  }

  /**
   * API dùng để lấy danh sách thông tin cá nhân
   */
  APIGetListHRPersonalProfile() {
    this.isLoading = true;
    this.personalService.GetListHRPersonalProfile(this.gridState).pipe(takeUntil(this.destroy$)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.gridView = { data: res.ObjectReturn.Data, total: res.ObjectReturn.Total };
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách thông tin cá nhân`)
      }
      this.isLoading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách thông tin cá nhân: ${err}`);
      this.isLoading = false;
    })
  }
  //#endregion


  //#region HEADER-1
  /**
   * Hàm dùng để lấy loại nhân sự khi chọn item trên dropdown loại nhân sự
   * @param type Có thể là "Thuộc công ty" hoặc "Không thuộc công ty"
   */
  onDropDownListBTCompany(type: any) {
    this.selectedTypeBelongTo = type;
    this.filterType = { field: 'IsInCompany', operator: 'eq', value: this.selectedTypeBelongTo.Type == 1 };
    this.filterSearch = { logic: 'or', filters: [] };
    this.childSearchGroup.value = '';
    this.handleResetFilter();
  }

  /**
   * Hàm dùng để chuyển sang trang chi tiết hoặc thêm mới
   * @param isNew Chuyển tới trang thêm mới nếu true
   */
  openDetail(personal: DTOPersonalInfo) {
    this.menuService.changeModuleData().pipe(takeUntil(this.destroy$)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Link?.includes("/config/config008-enterprise-personal-info-list"))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes(this.childMenuItem1) || f.Link.includes(this.childMenuItem1))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes(this.childMenuItem2) || f.Link.includes(this.childMenuItem2))
          localStorage.setItem('Staff', JSON.stringify(personal))
          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //#endregion


  //#region HEADER-2
  /**
   * Hàm dùng để chạy toàn bộ các filter đang có giá trị
   */
  onLoadFilter() {
    this.gridState.filter.filters = [];

    if (this.selectedTypeBelongTo.Type == 1) {
      this.filterType.value = true;
    }
    else {
      this.filterType.value = false;
    }
    this.gridState.filter.filters.push(this.filterType);

    if (this.filterSearch.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterSearch);
    }

    if (this.filterCompany.filters.length > 0 && this.selectedTypeBelongTo.Type == 1) {
      this.gridState.filter.filters.push(this.filterCompany);
    }

    if (this.filterPhone.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterPhone);
    }

    this.APIGetListHRPersonalProfile()
  }

  /**
   * Hàm dùng để filter search
   * @param value 
   */
  onFilterSearchChange(event: any) {
    if (event.filters[0]?.value === '') {
      this.filterSearch.filters = [];
    }
    else {
      this.filterSearch.filters = event.filters;
      this.gridState.skip = 0;
      this.gridState.take = this.pageSizes[0];
    }
    this.onLoadFilter();
  }

  /**
   * Hàm chuyển đổi chuỗi có dấu thành không dấu
   * @param value Text muốn xóa dấu
   * @returns Text đã được xóa dấu
   */
  handleRemoveAccents(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Hàm dùng để tìm công ty
   * @param searchTerm Giá trị tìm kiếm
   */
  onFilterListCompany(searchTerm: string) {
    const normalizedSearchTerm = this.handleRemoveAccents(searchTerm.toLowerCase());

    const contains =
      (value: string) => (item: DTOCompany) =>
        this.handleRemoveAccents(item.Bieft.toLowerCase()).includes(value);

    this.listFilteredCompany = this.listCompany.filter(contains(normalizedSearchTerm));
  }

  /**
   * Hàm dùng để reset tất cả các filter và quay về filter mặc định
   */
  handleResetFilter() {
    // Giá trị dropdown công ty
    this.listSelectedCompany = this.listCompany.filter(company => company.Code == 1 || company.Code == 2);
    this.listFilteredCompany = this.listCompany;

    // Filter danh sách công ty được chọn
    this.filterCompany.filters = [];
    this.filterCompany.filters.push({ field: 'ListCompanyCode', operator: 'contains', value: 1 });
    this.filterCompany.filters.push({ field: 'ListCompanyCode', operator: 'contains', value: 2 });

    // List
    this.gridState = {
      take: this.pageSize,
      skip: 0,
      sort: [{ field: 'Code', dir: 'desc' }],
      filter: { filters: [], logic: 'and' }
    };

    // Số điện thoại
    this.filterPhone = { logic: 'or', filters: [] };

    // Load lại
    this.onLoadFilter();
  }

  /**
   * Hàm dùng để set các công ty được chọn
   * @param listCom Danh sách các công ty được chọn
   */
  onSelectCompany(listCom: DTOCompany[]) {
    this.listSelectedCompany = listCom;
    this.filterCompany.filters = [];
    this.listSelectedCompany.forEach(company => {
      const filter: FilterDescriptor = { field: 'ListCompanyCode', operator: 'contains', value: company.Code };
      this.filterCompany.filters.push(filter);
    })
    this.gridState.skip = 0;
    this.onLoadFilter();

  }
  //#endregion

  //#region LIST
  @HostListener('document:click', ['$event'])
  handleClick(event: Event): void {
    // Kiểm tra xem thẻ được click có phải là thẻ th với aria-colindex="5" không
    const clickedElement = event.target as HTMLElement;

    const thElement5 = clickedElement.closest('th[aria-colindex="5"]');

    if (thElement5) {
      const popup = document.querySelector('.k-grid-filter-popup');
      if(popup){
        popup.classList.remove('cus-filter-sdt-header');
        popup.classList.add('cus-filter-sdt-header');
      }
    }
  }
  
  /**
   * Hàm dùng để khởi tạo mặc định grid state
   */
  onInitState() {
    this.filterCompany.filters = [];
    this.filterCompany.filters.push({ field: 'ListCompanyCode', operator: 'contains', value: 1 });
    this.filterCompany.filters.push({ field: 'ListCompanyCode', operator: 'contains', value: 2 });

    this.gridState = { skip: 0, take: this.pageSizes[0], filter: { logic: 'and', filters: [] }, sort: [{ field: 'Code', dir: 'desc' }] };

    if (this.filterCompany.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterCompany);
    }

    this.gridState.filter.filters.push(this.filterType)
  }

  /**
   * Dùng để lấy danh sách các công ty để hover hiển thị title
   * @param listCheck danh sách công ty
   * @returns danh sách công ty kể từ công ty thứ 3
   */
  getListCompanyTitle(listCheck: DTOCompany[]) {
    const list: DTOCompany[] = listCheck.map(item => item);
    return list.slice(2).join(',\n');
  }

  /**
   * Hàm dùng để lấy các action tại moreAction của từng item trong grid
   * @param moreActionDropdown danh sách các action
   * @returns moreActionDropdown
   */
  getActionDropdown(moreActionDropdown: MenuDataItem[]) {
    const actionEdit = { Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true };
    moreActionDropdown = [];
    moreActionDropdown.push(actionEdit)
    return moreActionDropdown;
  }

  /**
 * Hàm nhận giá trị từ pagination khi chuyển trang
 * @param event 
 */
  onPageChange(event: PageChangeEvent) {
    this.pageSize = event.take;
    this.gridState.skip = event.skip;
    this.gridState.take = event.take;

    this.onLoadFilter();
  }

  /**
 * Hàm xử lí action được chọn trên dropdown moreAction
 * @param menu menu action đã nhấn
 * @param item nhân sự được chọn
 */
  onMoreActionItemClick(menu: MenuDataItem, item: any) {
    if (menu.Code == "pencil") {
      this.openDetail(item);
    }
  }

  /**
   * Hàm dùng để format ngày từ 1965-03-05T00:00:00 sang 05/03/1965 để hiển thị ra màn hình
   * @param dateString 1965-03-05T00:00:00
   * @returns 05/03/1965
   */
  handleFormatDateDisplay(dateString: string): string {
    if (!Ps_UtilObjectService.hasValueString(dateString)) {
      return;
    }
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Hàm dùng để filter trên header title của grid
   * @param event 
   */
  handleFilterChange(event: FilterDescriptor | CompositeFilterDescriptor) {
    var ev1 = <CompositeFilterDescriptor>event;

    if(ev1.filters.length > 0){
      this.filterPhone = <CompositeFilterDescriptor>ev1.filters[0];
    }
    else{
      this.filterPhone = { logic: 'or', filters: [] };
    }
    this.gridState.skip = 0;
    this.gridState.take = this.pageSizes[0];

    this.onLoadFilter();
  }
  //#endregion
}
