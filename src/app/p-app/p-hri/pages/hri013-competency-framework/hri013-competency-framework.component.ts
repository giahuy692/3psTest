import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  State,
  distinct,
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
import { DTOInportProduct } from 'src/app/p-app/p-ecommerce/shared/dto/DTOInport.dto';
import { ConfigService } from 'src/app/p-app/p-config/shared/services/config.service';
import { PayslipService } from '../../shared/services/payslip.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { CompetenceFrameworkApiService } from '../../shared/services/competence-framework-api.service';
import { DTOCompetenceFramework } from '../../shared/dto/DTOCompetenceFramework.dto';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';

@Component({
  selector: 'hri013-competency-framework',
  templateUrl: './hri013-competency-framework.component.html',
  styleUrls: ['./hri013-competency-framework.component.scss'],
})
export class Hri013CompetencyFrameworkComponent implements OnInit {
  //#region test dateinput
  // minDate: Date
  // maxDate: Date
  // isMinAndMaxSameDay: boolean = false;
  // isAllDay: boolean = false
  // blur(event: any) {
  //   console.log(event);
  //   this.onAlldayHours()
  // }

  // //hàm thông báo allday true/false
  // onAllDayClick(isAllDay: boolean) {
  //   this.isAllDay = isAllDay
  // }

  // // hàm set giờ khi pick trùng ngày và chọn All days
  // onAlldayHours() {
  //   if (this.isAllDay == true) {
  //     if (this.minDate && this.maxDate) {
  //       // Nếu min và max là cùng một ngày, thì set giờ của min là 00:00 và giờ của max là 23:59
  //       if (this.minDate.toDateString() === this.maxDate.toDateString()) {
  //         this.minDate.setHours(0, 0, 0, 0);
  //         this.maxDate.setHours(23, 59, 59, 999);
  //       }
  //       else {
  //         this.minDate.setHours(0, 0, 0, 0);
  //         this.maxDate.setHours(0, 0, 0, 0);
  //       }
  //     }
  //   }
  //   console.log('minDate: ', this.minDate);
  //   console.log('maxDate: ', this.maxDate);
  // }
  //#endregion

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

  //#region Import & Export
  excelValid = true;
  uploadEventHandlerCallback: Function;
  //#endregion

  //#region Variable dialog \\
  openedDialog: boolean = false;
  paramCompetenceName: string;
  arrayCompetence: DTOCompetenceFramework[] = [];
  //#endregion

  //#region move question
  changeModuleData_sst: Subscription;
  Competence = new DTOCompetenceFramework();
  //#endregion

  // Grid Callback function
  getActionDropdownCallback: Function;
  onSelectedPopupBtnCallback: Function;
  onActionDropdownClickCallback: Function;
  getSelectionPopupCallback: Function;
  onSelectCallback: Function;
  onPageChangeCallback: Function;
  allowActionDropdown = ['detail'];

  // Subscription CallAPi
  arrUnsubscribe: Subscription[] = [];
  changePermission_sst: Subscription;

  //#region Filter
  // - variable
  isDrafting: boolean = false;
  isApproved: boolean = false;
  isSuspended: boolean = false;
  isSent: boolean = false;
  filterDrafting: any;
  filterApproved: any;
  filterSuspended: any;
  filterSent: any;

  //#endregion

  // variable grid
  gridView = new Subject<any>();
  total: number = 0;
  ListCompetenceFramework: DTOCompetenceFramework[] = [];
  loading = false;
  pageSize = 25;
  pageSizes = [this.pageSize];
  tempSearch: any;
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };
  //- filter reset

  filterReturned = {
    "field": "StatusID",
    "operator": "eq",
    "value": 4,
    "ignoreCase": true
  }

  ResetState: State = {
    skip: null,
    filter: { filters: [], logic: 'or' },
    take: this.pageSize,
  };

  gridState: State = {
    skip: null,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  };

  filterStatusID: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  constructor(
    private layoutService: LayoutService,
    private layoutAPIService: LayoutAPIService,
    public service: ConfigService,
    public servicePayslip: PayslipService,
    public menuService: PS_HelperMenuService,
    private competenceframeworkApiService: CompetenceFrameworkApiService,
    private cdr: ChangeDetectorRef,
    public apiService: MarBannerAPIService,
  ) {}

  ngOnInit(): void {
    let that = this;
    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    //action dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this);
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this);
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this);
    this.onSelectCallback = this.selectChange.bind(this);
    this.onPageChangeCallback = this.pageChange.bind(this);
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this);

    this.changePermission_sst = this.menuService
    .changePermission()
    .subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false;
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');
        
        that.isToanQuyen =
        that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isAllowedToCreate =
        that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isAllowedToVerify =
        that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        
        that.dataPerm = distinct(res.DataPermission, 'Warehouse');
        
      }
      });

      let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res)) {
          this.loadDefault();
        }
      })
    this.arrUnsubscribe.push(this.changePermission_sst, permissionAPI);
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  loadDefault() {

    if(this.isFilterActive){

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
      }
      this.gridState.skip = null;
      this.loadFilter();
      this.GetListCompetenceFramework(this.gridState);
    }
  }

  //#region filter group
  //- Handle reset
  onResetFilter() {
    this.isDrafting = true;
    this.isApproved = false;
    this.isSuspended = false;
    this.isSent = true;
    this.gridState.skip = null
    this.loadFilter();
    this.GetListCompetenceFramework(this.gridState);
  }

  loadFilter() {
    // reset filler
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.filterStatusID.filters = [];

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

    if(this.isSent){
      this.filterStatusID.filters.push(this.filterSent);
    }

    if (this.filterStatusID.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatusID);
    }


    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this.gridState.filter.filters.push(this.filterSearchBox);
      }
    }
  }

  //- Handle search
  handleSearch(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (event.filters[0].value === '') {
        this.gridState.skip = null;
        this.loadFilter();
        this.GetListCompetenceFramework(this.gridState);
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = null;
        this.loadFilter();
        this.GetListCompetenceFramework(this.gridState);
      }
    }
  }

  // Handle lắng nghe sự thay đổi của checkbox
  selectedChangeCheckbox(event: any, typebtn: string) {
    if (typebtn == 'isDrafting') {
      this.isDrafting = event;
    } else if (typebtn == 'isApproved') {
      this.isApproved = event;
    } else if (typebtn == 'isSuspended') {
      this.isSuspended = event;
    } else if(typebtn == 'isSent'){
      this.isSent = event;
    }
  }

  filterChangeDrafting(event: any) {
    this.filterDrafting = event;
    this.gridState.skip = null
    this.loadFilter();
    this.GetListCompetenceFramework(this.gridState);
  }

  filterChangeApproved(event: any) {
    this.filterApproved = event;
    this.gridState.skip = null
    this.loadFilter();
    this.GetListCompetenceFramework(this.gridState);
  }

  filterChangesSuspended(event: any) {
    this.filterSuspended = event;
    this.gridState.skip = null
    this.loadFilter();
    this.GetListCompetenceFramework(this.gridState);
  }

  filterChangeSent(event: any) {
    this.filterSent = event;
    this.gridState.skip = null
    this.loadFilter();
    this.GetListCompetenceFramework(this.gridState);
  }
  //#endregion filter group

  //#region import và export
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  APIDownloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "CompetenceFrameworkTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let a  = this.apiService.GetTemplate(getfilename).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res);
        this.layoutService.onSuccess(`${ctx} thành công`);
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
    this.arrUnsubscribe.push(a);
  }
  uploadEventHandler(e: File) {
    this.ImportExcelFramework(e);
  }
  ImportExcelFramework(file) {
    this.loading = true
    var ctx = "Import Excel"

    let ImportExcelFramework = this.competenceframeworkApiService.ImportExcelFramework(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && !Ps_UtilObjectService.hasValueString(res.ErrorString)) {
        this.loadFilter();
        this.GetListCompetenceFramework(this.gridState);
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.setImportDialogMode(1);
        this.layoutService.setImportDialog(false);
        this.layoutService.getImportDialogComponent().inputBtnDisplay();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      this.loading = false;
    })
    this.arrUnsubscribe.push(ImportExcelFramework);
  }
  //#endregion

  //#region funcionCallback grid
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible;
  }
  //dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOCompetenceFramework) {
    moreActionDropdown = [];
    this.Competence = { ...dataItem };
    var statusID = this.Competence.StatusID;
    const ctx = 'KNL';
  
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
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4)) {
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
    if (canVerify && (statusID === 1 || statusID === 3)) {
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Phê duyệt',
          Code: 'check-outline',
          Link: '2',
          Actived: true,
          LstChild: [],
        });
  
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
    if (canVerify && statusID === 2) {
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
    if (canCreateOrAdmin && statusID === 0) {
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
  onActionDropdownClick(menu: MenuDataItem, item: DTOCompetenceFramework) {
    if (item.Code.toString().length > 0) {
      if ((menu.Link == 'delete' || menu.Code == 'trash') && item.StatusID == 0) {
        // if(item.StatusID == 0){
          this.Competence = { ...item };
          this.paramCompetenceName = this.Competence.Title;
          this.arrayCompetence = [this.Competence];
          this.openedDialog = true;
        // }
      } else if (menu.Type == 'StatusID') {
        this.Competence = { ...item };
        this.Competence.StatusID = parseInt(menu.Link);
        var listdataUpdate = [];

        // Trạng thái gửi duyệt
        if (menu.Link == '1') {
          // Chỉ statusID = 0|4
          
          if ((item.StatusID == 0 || item.StatusID == 4)) {
            listdataUpdate.push(item);
          }
          
        } else if (menu.Link == '2') { // Trạng thái phê duyệt
          // Chỉ statusID = 1|3
          if ((item.StatusID == 1 || item.StatusID == 3)) {
            listdataUpdate.push(item);
          }
        } else if (menu.Link == '3') { //Trạng thái Ngưng hiển thị
          // Chỉ statusID = 2
          if (item.StatusID == 2) {
            listdataUpdate.push(item);
          }
        } else if (menu.Link == '4') { // Trạng thái trả về
          // Chỉ statusID = 1|3
          if (item.StatusID == 1 || item.StatusID == 3) {
            listdataUpdate.push(item);
          }
        } 
        if(this.CheckField(this.Competence)){
          let StatusID = parseInt(menu.Link);
          this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
        }
      } else if (
        menu.Link == 'edit' ||
        menu.Code == 'pencil' ||
        menu.Code == 'eye' ||
        menu.Link == 'detail'
      ) {
        this.Competence = item;
        this.openDetail('detail');
      } 
    }
  }

  CheckField(Competence: DTOCompetenceFramework){
    if(!Ps_UtilObjectService.hasValueString(Competence.Title)){
      this.layoutService.onError(`Vui lòng bổ sung tên khung năng lực ${Competence.Title}!`);
      return false;
    }

    if(!Ps_UtilObjectService.isValidDate2(Competence.EffDate)){
      this.layoutService.onError(`Vui lòng bổ sung ngày hiệu lực  ${Competence.Title}!`);
      return false;
    }

    return true;
  }


  getSelectionPopup(selectedList: DTOCompetenceFramework[]) {
    var moreActionDropdown = new Array<MenuDataItem>();
    // Check If Any Item(s) In Selected List Can Send To Verify
    var SendForApproval = selectedList.findIndex(
      (s => (s.StatusID === 0 || s.StatusID === 4) && Ps_UtilObjectService.hasValueString(s.Title) 
      && Ps_UtilObjectService.isValidDate2(s.EffDate))
    );
    if (SendForApproval != -1) {
      if(this.isToanQuyen || this.isAllowedToCreate){
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
    var approval = selectedList.findIndex((s => (s.StatusID === 1 || s.StatusID === 3)));
    ////> Push Send To Verify Button To Array If Condition True
    if (approval != -1){
      if(this.isToanQuyen || this.isAllowedToVerify){
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
    if (Hide != -1){
      if(this.isAllowedToVerify || this.isToanQuyen){
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
    var Return = selectedList.findIndex((s) => s.StatusID == 1 || s.StatusID == 3);
    ////> Push Return Button To Array If Condition True
    if (Return != -1) {
      //|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      if(this.isAllowedToVerify || this.isToanQuyen){
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
      if(this.isAllowedToCreate || this.isToanQuyen){
        moreActionDropdown.push({
          Name: 'Xóa KNL',
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
    let StatusID
    var listdataUpdate = [];
    if (list.length > 0) {
      if (btnType == 'StatusID') {
        // Trạng thái gửi duyệt
        if (value == 1 || value == '1') {
          list.forEach((s) => {
            // Chỉ statusID = 0|4
            if (this.CheckField(s) && (s.StatusID === 0 || s.StatusID === 4) && Ps_UtilObjectService.hasValueString(s.Title) 
            && Ps_UtilObjectService.isValidDate2(s.EffDate)) {
                listdataUpdate.push(s);
            }
          });
          StatusID = parseInt(value);
        }
        // Trạng thái phê duyệt
        if (value == 2 || value == '2') {
          list.forEach((s) => {
            // Chỉ statusID = 1|3
            if (this.CheckField(s) && (s.StatusID === 1 || s.StatusID === 3) && Ps_UtilObjectService.hasValueString(s.Title) && Ps_UtilObjectService.isValidDate2(s.EffDate)) {
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
        // this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
        this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
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
        this.paramCompetenceName ='Bạn có chắc rằng sẽ xóa tất cả các câu hỏi được chọn không!';
        this.arrayCompetence = listDataDelete;
        this.openedDialog = true;
        // this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      }
    }
  }

  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take;
    this.GetListCompetenceFramework(this.gridState);
  }
  //#endregion funcionCallback grid

  // Thêm mới
  onAdd() {
    this.Competence = new DTOCompetenceFramework();
    this.openDetail('detail');
  }

  // move detail
  openDetail(link: string) {
    let changeModuleData_sst = this.menuService
      .changeModuleData()
      .subscribe((item: ModuleDataItem) => {
        this.servicePayslip.setCacheCompetenceframework(this.Competence);
        var parent = item.ListMenu.find(
          (f) =>
            f.Code.includes('hriCompetency') ||
            f.Link.includes('hr007-competency-bank')
        );

        if (link == 'list') {
          if (
            Ps_UtilObjectService.hasValue(parent) &&
            Ps_UtilObjectService.hasListValue(parent.LstChild)
          ) {
            var detail = parent.LstChild.find(
              (f) =>
              f.Code.includes('hri013-competency-framework') ||
              f.Link.includes('hri013-competency-framework')
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
              f.Code.includes('hri013-competency-framework') ||
              f.Link.includes('hri013-competency-framework')
            );

            if (
              Ps_UtilObjectService.hasValue(detail) &&
              Ps_UtilObjectService.hasListValue(detail.LstChild)
            ) {
              var detail2 = detail.LstChild.find(
                (f) =>
                f.Code.includes('hri013-competency-framework-detail') ||
                f.Link.includes('hri013-competency-framework-detail')
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
      this.DeleteCompetenceFramework(this.arrayCompetence);
      this.openedDialog = false;
    } else {
      this.openedDialog = false;
    }
  }

  //#endregion

  //#region API
  GetListCompetenceFramework(state: State) {
    this.loading = true;
    var GetListCompetenceFramework = this.competenceframeworkApiService
      .GetListCompetenceFramework(state)
      .subscribe(
        (res: any) => {
          // if (res.ErrorString != null) {
          //   this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách khung năng lực: ${res.ErrorString}`);
          // }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.ListCompetenceFramework = res.ObjectReturn.Data;
            this.total = res.ObjectReturn.Total;
            this.gridView.next({ data: this.ListCompetenceFramework, total: this.total });
          } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách khung năng lực: ${res.ErrorString}`);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          // console.log(error);
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(GetListCompetenceFramework);
  }

  UpdateStatusCompetenceFramework(dto: DTOCompetenceFramework[], statusID: number) {
    this.loading = true;
    var UpdateStatusCompetenceFramework = this.competenceframeworkApiService
      .UpdateStatusCompetenceFramework(dto, statusID)
      .subscribe(
        (res: any) => {
          // if (res.ErrorString != null) {
          //   this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái khung năng lực: ${res.ErrorString}`);
          // }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(
              'Cập nhật trạng thái khung năng lực thành công!'
            );
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
            this.GetListCompetenceFramework(this.gridState);
          } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái khung năng lực: ${res.ErrorString}`);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(UpdateStatusCompetenceFramework);
  }


  DeleteCompetenceFramework(arr: DTOCompetenceFramework[]) {
    this.loading = true;
    let DeleteCompetence = this.competenceframeworkApiService
      .DeleteCompetenceFramework(arr)
      .subscribe(
        (res: any) => {
          // if (res.ErrorString != null) {
          //   this.layoutService.onError(`Đã xảy ra lỗi khi xóa khung năng lực: ${res.ErrorString}`);
          // }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
            this.GetListCompetenceFramework(this.gridState);
            this.layoutService.onSuccess('Xóa khung năng lực thành công');
          } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi xóa khung năng lực: ${res.ErrorString}`);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(DeleteCompetence);
  }

  
  //#endregion API

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
      s?.unsubscribe();
    });
  }
}
