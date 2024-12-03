import { Component, OnInit, OnDestroy } from '@angular/core';
import { GridDataResult, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, State, distinct, filterBy } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOEmployee, DTOEmployeeDetail } from '../../shared/dto/DTOEmployee.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { StaffApiService } from '../../shared/services/staff-api.service';
import { PayslipService } from '../../shared/services/payslip.service';

@Component({
  selector: 'app-hr001-staff-list',
  templateUrl: './hr001-staff-list.component.html',
  styleUrls: ['./hr001-staff-list.component.scss']
})
export class Hr001StaffListComponent implements OnInit, OnDestroy{

  //common variable
  loading = false
  isAdd = true
  isFilterActive = true
  tempSearch: any;
  excelValid = true

  //object 
  employee = new DTOEmployee()
  listEmployee: DTOEmployee[] =[]
  deleteList: DTOEmployee[] = []

  //header1
  danglamviec_checked = true
  danglamviec_count = 0
  thutucnghiviec_checked = false
  thutucnghiviec_count = 0
  danghiviec_checked = false
  danghiviec_count = 0

  // app-search-filter-group
  placeholder = 'Tìm theo mã, họ và tên nhân viên, chức danh'

  //grid
  gridView = new Subject<any>();
  pageSize = 25
  pageSizes = [this.pageSize]
  allowActionDropdown = []
  skip = 0;
  sortBy: SortDescriptor = {
    field: 'Code',
    dir: 'asc'
  }
  gridState: State = {
    take: this.pageSize,
    sort: [this.sortBy],
    filter: { filters: [], logic: 'and' },
    skip: this.skip
  }

  total = 0


//filter
  //status
  filterStatus: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterStatus_chua: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 0
  }
  filterStatus_dang: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 1
  }
  filterStatus_thutuc: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 2
  }
  filterStatus_Nghi: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 3
  }
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  //select
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false

  //CallBack
  uploadEventHandlerCallback: Function
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onFilterChangeCallback: Function
  //grid select
  getSelectionPopupCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  //Subscription
  changeModuleData_sst: Subscription
  GetListEmployee_sst: Subscription
  changePermission_sst: Subscription
  UpdateEmployeeStatus_sst: Subscription
  GetTemplate_sst: Subscription
  ImportExcel_sst: Subscription
  ExportExcel_sst: Subscription
  permissionAPI_sst: Subscription


  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,    
    public apiService: StaffApiService,
    public payslipService:PayslipService,
  ){}

  ngOnInit(): void {
    let that = this
    this.onLoadFilter()
    // Cache
    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) =>{
      if(Ps_UtilObjectService.hasListValue(res) && this.justLoaded){
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen =that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.APIGetListEmployee()
      }
    })
    this.permissionAPI_sst = this.menuService.changePermissionAPI().subscribe((res) => {
      if(Ps_UtilObjectService.hasValue(res)){
        this.APIGetListEmployee();
      }
    })
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //callback
    this.onPageChangeCallback = this.onPageChange.bind(this)
    //dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }
 
  //filter
  onLoadFilter(){
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.filter.filters = []

    this.filterStatus.filters = []
    
    //status
    if (this.danglamviec_checked){
      this.filterStatus.filters.push(this.filterStatus_dang)
      this.filterStatus.filters.push(this.filterStatus_chua)
    }

    if (this.thutucnghiviec_checked){
      this.filterStatus.filters.push(this.filterStatus_thutuc)
    }

    if (this.danghiviec_checked){
      this.filterStatus.filters.push(this.filterStatus_Nghi)
    }

    if (this.filterStatus.filters.length > 0){
      this.gridState.filter.filters.push(this.filterStatus)
    }

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this.gridState.filter.filters.push(this.filterSearchBox);
      }
    }
  }
    
  //Get List Employee
  APIGetListEmployee(){
    this.loading = true;

    this.GetListEmployee_sst = this.apiService.GetListEmployee(this.gridState).subscribe(res =>{
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
        this.listEmployee = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total;
        this.gridView.next({data: this.listEmployee, total: this.total})
      } else{
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân viên: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) =>{
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân viên: ${error} `)
    })

  }
  
  //UpdateStatus
  UpdateEmployeeStatus(items: any[] = [this.employee], statusID: number = this.employee.StatusID, statusName: string = this.employee.StatusName){
    this.loading = true
    var ctx = 'Cập nhật tình trạng'

    this.UpdateEmployeeStatus_sst = this.apiService.UpdateEmployeeStatus(items, statusID, statusName).subscribe(res =>{
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.APIGetListEmployee()
      } else{
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.APIGetListEmployee()
      }
      this.loading = false;
    },(err) =>{
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      this.APIGetListEmployee()
    }
    )
  }

  // ImportExcel
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.ImportExcel_sst = this.apiService.ImportExcel(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res == 0) {
        this.APIGetListEmployee()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      this.loading = false;
    })
  }

  //CLICK EVENT  
  uploadEventHandler(e:File){
    this.p_ImportExcel(e)
  }

  //header 1
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e
    this.gridState.skip = 0
    this.onLoadFilter()
    this.APIGetListEmployee()
  }
  
  // Xử lý tìm kiếm
  handleSearch(event: any){
    if (event.filters && event.filters.length > 0){
      if (event.filters[0].value === '') {
        this.gridState.skip = 0
        this.onLoadFilter();
        this.APIGetListEmployee()
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = 0
        this.onLoadFilter();
        this.APIGetListEmployee()
      }
    }
  }
  
  // Xử lý reset filter
  resetFilter(){
    this.danglamviec_checked = true
    this.thutucnghiviec_checked = false
    this.danghiviec_checked = false
    this.gridState.skip = 0
    this.onLoadFilter()
    this.APIGetListEmployee()

  }

  //Xử lý mở dialog import file 
  onImportExcel(){
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  // Xử lý tải file
  onDownloadExcel(){
    var ctx = "Download Excel Template"
    var getfilename = "HRTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.apiService.GetTemplate(getfilename).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
				this.layoutService.onError(`${ctx} thất bại`)
			}
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}: ` + f.error.ExceptionMessage)
      this.loading = false;
    });
  }

  // breadcrumb
  loadPage(){
    if(this.isFilterActive){
      this.resetFilter()
    }
  }

  // Xử lý mở trang chi tiết
  onOpenDetail(isAdd: boolean){
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) =>{
      this.apiService.isAdd = isAdd
      var parent = item.ListMenu.find(f => f.Code.includes('hr001-staff-list')|| f.Link.includes('hr001-staff-list'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)){
        var detail = parent.LstChild.find(f => f.Code.includes('hr001-staff-list')|| f.Link.includes('hr001-staff-list'))
        if(isAdd){
          var prom = new DTOEmployeeDetail()
          localStorage.setItem("Staff",JSON.stringify(prom))
          if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)){
            var detail2 = detail.LstChild.find(f => f.Code.includes('hr007-personal-info') || f.Link.includes('hr007-personal-info'))
            this.menuService.activeMenu(detail2)
          }
        }
        else{
          localStorage.setItem("Staff",JSON.stringify(this.employee))
          if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)){
            var detail2 = detail.LstChild.find(f => f.Code.includes('hr001-staff-detail') || f.Link.includes('hr001-staff-detail'))
            this.menuService.activeMenu(detail2)
          }
        }
      }
    })
  }

  ///KENDO GRID
  //paging
  onPageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.APIGetListEmployee()
  }

  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.APIGetListEmployee()
  }

  //Xử lý hiện action trên popup khi đang selection
  getSelectionPopup(selectedList: any[]){
    this.isFilterActive = !this.isFilterActive
    var moreActionDropdown = new Array<MenuDataItem>()

    var canXinNghi = selectedList.findIndex(s => s.StatusID == 1)

    if (canXinNghi != -1 && (this.isToanQuyen || this.isAllowedToCreate))
      moreActionDropdown.push({
        Type: "StatusID", Name: "Xin nghỉ việc", Code: "redo", Link: "1",
        Actived: true, LstChild: []
      })

    var canDuyetNghi = selectedList.findIndex(s => s.StatusID == 2)

    if (canDuyetNghi != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Duyệt Nghỉ việc", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })
    
      moreActionDropdown.push({
        Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
      })
    }

    return moreActionDropdown
  }

  //Xử lý action khi đang selection
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if(list.length > 0){
      if(btnType == "StatusID"){
        if(value == 1 || value == '1'){//thu tuc nghi
          var arr = []

          list.forEach(s => {
            if (s.StatusID == 1) {
              s.StatusID = 2
              s.StatusName = 'Xin nghỉ việc'
              arr.push(s)
            }
          })
          if (arr.length > 0){
            const statusID = 2
            const statusName = "Xin nghỉ việc"
            this.UpdateEmployeeStatus(arr, statusID, statusName )
          }
        }
        else if (value == 4 || value == '4') {//Trả về
          var arr = []

          list.forEach(s => {
            if (s.StatusID == 2) {
              s.StatusID = 1
              s.StatusName = 'Đang làm việc'
              arr.push(s)
            }
          })

          if (arr.length > 0){
            const statusID = 1
            const statusName = "Đang làm việc"
            this.UpdateEmployeeStatus(arr, statusID, statusName)
          }
            
        }

        else if (value == 2 || value == '2') {//Da nghi viet
          var arr = []

          list.forEach(s => {
            if (s.StatusID == 2) {
              s.StatusID = 3
              s.StatusName = 'Nghỉ việc'
              arr.push(s)
            }
          })

          if (arr.length > 0){
            const statusID = 3
            const statusName = "Nghỉ việc"
            this.UpdateEmployeeStatus(arr, statusID, statusName)
          }
            
        }
        
      }
    }
  }

  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }

  // Xử lý hiện option dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any){
    this.employee = { ...dataItem }
    var statusID = this.employee.StatusID;
    moreActionDropdown = []

    moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })


    if  (statusID == 1 ) {
      if (this.isToanQuyen || this.isAllowedToCreate){
        moreActionDropdown.push({ Name: "Xin nghỉ việc", Code: "redo", Link: "2", Type: "StatusID", Actived: true })  
      }
    } 
    if (statusID == 2) {
      if (this.isToanQuyen || this.isAllowedToVerify){
        moreActionDropdown.push({ Name: "Trả về", Code: "undo", Link: "4", Type: "StatusID", Actived: true })
        moreActionDropdown.push({ Name: "Duyệt Nghỉ việc", Code: "check-outline", Link: "3", Type: "StatusID", Actived: true })
      }
    }
    // if (statusID == 3) {
    //   if (this.isToanQuyen || this.isAllowedToCreate)
    //     moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
    // }

    return moreActionDropdown
  }

  // Xử lý action dropdown
  onActionDropdownClick(menu: MenuDataItem, item: any){
    if (item.Code > 0) {
      if (menu.Type == 'StatusID') {
        this.employee = { ...item }
        this.employee.StatusID = parseInt(menu.Link)
        this.employee.StatusName = menu.Name

        this.UpdateEmployeeStatus([this.employee])
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.employee = { ...item }
        this.onOpenDetail(false)
      }
    }
  }

  // Unsubscribe
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.changeModuleData_sst?.unsubscribe()
    this.GetListEmployee_sst?.unsubscribe()
    this.UpdateEmployeeStatus_sst?.unsubscribe()
    this.ImportExcel_sst?.unsubscribe()
    this.ExportExcel_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()
    this.permissionAPI_sst?.unsubscribe()
  }
}
