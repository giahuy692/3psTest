import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { parseDate } from '@progress/kendo-angular-intl';
import { PageChangeEvent } from '@progress/kendo-angular-treelist';
import { distinct, SortDescriptor, State } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/p-app/p-config/shared/services/config.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ModuleDataAdmin } from 'src/app/p-app/p-layout/p-sitemaps/menu.data-admin';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOEmployeeSalary, DTOPayroll } from '../../shared/dto/DTOPayroll.dto';
import { HriSalaryApiService } from '../../shared/services/hri-salary-api.service';
import { PayslipService } from '../../shared/services/payslip.service';

class DTOActionStatus { text: string; class: string; code: string; statusID?: number; type?: string }

@Component({
  selector: 'app-hri019-payroll-detail',
  templateUrl: './hri019-payroll-detail.component.html',
  styleUrls: ['./hri019-payroll-detail.component.scss']
})
export class Hri019PayrollDetailComponent {

 //#region variable
   //#region permission
   isToanQuyen: boolean = false;
   isAllowedToCreate: boolean = false;
   isAllowedToVerify: boolean = false;
   isAllowedView: boolean = false;
   isLock: boolean = false;
   actionPerm: DTOActionPermission[] = [];
   dataPerm: DTODataPermission[] = [];
   isloading: boolean = false;
   //#endregion
   
   //#region variable Payroll
   Payroll = new DTOPayroll(null);
   Paycheck = new DTOEmployeeSalary();
   PayrollEffDate: Date;
   StateListFrameworkPandC: State = {
     filter: { filters: [], logic: 'and' },
   };
 
   tdCount = 1;
   //#endregion

   // Subscription CallAPi
   arrUnsubscribe: Subscription[] = [];
   //#endregion

   // Dialog
   openedDiaDeletePayrollAll: boolean = false
   openedDiaDeletePayroll: boolean = false;
   openedDiaDeletePaycheck: boolean = false;

   //#region Init
  constructor(
    public menuService: PS_HelperMenuService,
    public service: ConfigService,
    public servicePayslip: PayslipService,
    private layoutService: LayoutService,
    public apiServicePolicy: MarNewsProductAPIService,
    public apiService: MarBannerAPIService,
    private salaryApiService: HriSalaryApiService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    let that = this;


    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this);

    this.onSelectCallback = this.selectChange.bind(this);
    this.onPageChangeCallback = this.pageChange.bind(this);
    this.onSortChangeCallback = this.onSortChange.bind(this)

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    

    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res)) {
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        this.onCheckPermistion();
      }
    })

    let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        let cache = JSON.parse(sessionStorage.getItem('Payroll'));
        if(Ps_UtilObjectService.hasValue(cache)){
          this.Payroll = cache;
          this.FromDate = new Date(this.Payroll.FromDate);
          this.ToDate = new Date(this.Payroll.ToDate);
          this.loadPage();
          if(Ps_UtilObjectService.hasValue(cache.EffDate)){
            this.PayrollEffDate = parseDate(cache.EffDate); 
          }
        }
			}
		})
    this.arrUnsubscribe.push(permissionAPI);
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this);

    // this.arrUnsubscribe.push(changePermission_sst);
  }


  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  //#region Payroll
  loadPage(){ 
    Ps_UtilObjectService.hasValue(this.Payroll.Code) ? this.APIGetPayroll(this.Payroll) : null;
    this.APIGetListPayroll('', {})
    
  }
  //#ndregion


  //#region grid detail
  getActionDropdownCallback: Function;
  onActionDropdownClickCallback: Function;
  onSelectCallback: Function;
  onPageChangeCallback: Function;
  onSortChangeCallback: Function
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  
  arrayPaycheck: DTOEmployeeSalary[] = [];
  gridView = new Subject<any>();
  ListPayCheck: DTOEmployeeSalary[] = [];
  valueSearch: string = '';
  isFilterActive = true;
  total: number = 0;
  loading: boolean = false;
  pageSize: number = 25;
  pageSizes: number[] = [25, 50, 75, 100];
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: false,
  };
  allowActionDropdown = ['detail'];
  gridState: State = {
    skip: null,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  };

  handleSearchEmployeeSalary(data: string) {
    this.valueSearch = data;
    this.APIGetListPaycheck(this.valueSearch, this.gridState);
  }

  deleteAllPayCheck(){
    this.openedDiaDeletePayrollAll = true
  }
  
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOEmployeeSalary) {
    moreActionDropdown = [];
    this.Paycheck = { ...dataItem };
    var statusID = this.Paycheck.StatusID;
    const ctx = 'phiếu lương';
  
    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
  
    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
  
      moreActionDropdown.push({
        Name: 'Xem chi tiết',
        Code: 'eye',
        Link: 'detail',
        Actived: true,
      });
  
    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    if (canVerify && this.Payroll.StatusID == 2 && (statusID === 1 || statusID === 3)) {
     
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Phê duyệt',
          Code: 'check-outline',
          Link: '2',
          Actived: true,
          LstChild: [],
        });
    }
  
    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    if (canVerify && this.Payroll.StatusID == 2 && statusID === 2) {
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
  onActionDropdownClick(menu: MenuDataItem, item: DTOEmployeeSalary) {
    if (item.Code !== 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash' || menu.Type == 'delete' ) {
        if (item.StatusID == 0) {
          this.Paycheck = { ...item };
          this.arrayPaycheck = [this.Paycheck];
          this.openedDiaDeletePaycheck = true;
        }
      } else if (menu.Type == 'StatusID') {
        this.Paycheck = { ...item };
        this.Paycheck.StatusID = parseInt(menu.Link);
        var listdataUpdate = [];

        if (menu.Link == '2') {
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
        } 
        let StatusID = parseInt(menu.Link);
        this.APIUpdatePaycheckStatus(listdataUpdate, StatusID);
      } else if (
        menu.Link == 'edit' ||
        menu.Code == 'pencil' ||
        menu.Code == 'eye' ||
        menu.Link == 'detail'
      ) {
        this.Paycheck = item;
        this.openDetail();
      }
    }
  }

  getSelectionPopup(arrItem: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    //tìm item có tình trạng ...
    // var canSent = arrItem.findIndex(s => s.StatusID == 0 || s.StatusID == 4) //đang soạn/trả về có thể gửi duyệt
    var canAppro_Return = arrItem.findIndex(s => s.StatusID == 1 || s.StatusID == 3) //gửi duyệt có thể duyệt/trả về
    var canStop = arrItem.findIndex(s => s.StatusID == 2) // duyệt có thể ngưng
    var canDel = arrItem.findIndex(s => s.StatusID == 0) // đang soạn có thể xóa


    // if (canSent != -1 && (this.isAllowedToCreate || this.isToanQuyen)) {
    //   moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true }
    //   )
    // }

    if (canAppro_Return != -1 && (this.isAllowedToVerify || this.isToanQuyen) && this.Payroll.StatusID == 2) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
        // { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
      )
    }

    if (canStop != -1 && (this.isAllowedToVerify || this.isToanQuyen) && this.Payroll.StatusID == 2) {
      moreActionDropdown.push(
        { Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true }
      )
    }

    if (canDel != -1 && (this.isAllowedToCreate || this.isToanQuyen)) {
      moreActionDropdown.push(
        { Name: "Xóa", Code: "trash", Type: 'Delete', Link: "delete", Actived: true }
      )
    }
    return moreActionDropdown
  }

  listDelete: DTOEmployeeSalary[] = []
  dialogMany: boolean = false
  //hàm xử lý action của các button trong popup checkbox
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    let arr = []
    let StatusID: number = -1

    if (list.length > 0) {

      if (btnType == "StatusID") {
        // if (value == 1 || value == '1') {//Gửi duyệt
        //   arr = []
        //   list.forEach(s => {
        //     if ((s.StatusID == 0 || s.StatusID == 4)) {
        //       arr.push(s);
        //     }
        //   })
        //   StatusID = 1
        // }
         if (value == 2 || value == '2') {//Phê duyệt
          arr = []
          list.forEach(s => {
          
            if ((s.StatusID == 1 || s.StatusID == 3)) {
              arr.push(s);
            }
          })
          StatusID = 2
        }
        else if (value == 4 || value == '4') {//Trả về
          arr = []
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              arr.push(s);
            }
          })
          StatusID = 4
        }
        else if (value == 3 || value == '3') {//Ngưng hiển thị
          arr = []
          list.forEach(s => {
            if (s.StatusID == 2) {
              arr.push(s);
            }
          })
          StatusID = 3
        }

        if (Ps_UtilObjectService.hasListValue(arr)) {
          this.APIUpdatePaycheckStatus(arr, StatusID)
        }
      }

      // else
      if (btnType == "Delete") {//Xóa
        this.listDelete = []

        list.forEach(s => {
          if (s.StatusID == 0)
            this.listDelete.push(s)
            this.dialogMany = true
        })
      }
    }
  }
  onDeleteManyPaycheck(){
    if(Ps_UtilObjectService.hasListValue(this.listDelete)){
      this.APIDeletePaycheck(this.listDelete)
    }
  }





  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible;
  }

  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take;
    this.APIGetListPaycheck(this.valueSearch, this.gridState);
  }

  openDetail() {
    sessionStorage.setItem('Paycheck', JSON.stringify(this.Paycheck));
    var parent = ModuleDataAdmin.find(s => s.Code.includes('hri'));
    var detail1 = parent.ListMenu.find(x => x.Code.includes('hriSal'));
    var detail2 = detail1.LstChild.find(v => v.Code.includes('hri019-payroll-list'));
    var detail3 = detail2.LstChild.find(v => v.Code.includes('hri019-payroll-detail'));
    var detail4 = detail3.LstChild.find(v => v.Code.includes('hri019-paycheck-detail'));
    this.menuService.activeMenu(detail4);
  }

  getImgRes(str: string){
    return Ps_UtilObjectService.hasValueString(str) ? Ps_UtilObjectService.getImgRes(str) : 'assets/img/icon/icon-nonImageThumb.svg'
  }

  onSortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.APIGetListPaycheck(this.valueSearch,this.gridState)
  }
  //#endregion grid detail

  


  //#region variable Answer Options
  listActBtnStatus: DTOActionStatus[] = [];
  //#endregion

  //#region Import & Export
  excelValid: boolean = true;
  uploadEventHandlerCallback: Function;
  //#endregion

  

  onCheckPermistion(){
    // let Per = JSON.parse(localStorage.getItem('Permission'))

    // if(Ps_UtilObjectService.hasValue(Per)){
    //   this.actionPerm = distinct(Per.ActionPermission, 'ActionType');

    //   this.isToanQuyen =
    //     this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
    //   this.isAllowedToCreate =
    //     this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
    //   this.isAllowedToVerify =
    //     this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
    // }
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
    const statusID = this.Payroll.StatusID;
      
    // Kiểm tra điều kiện "Chỉnh sửa"
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4 ) || canVerify && statusID === 1) {
      this.isLock = false; // Cho phép chỉnh sửa
    } else {
      this.isLock = true; // Bị disabled
    }
  }


  checkedField(): boolean{

    if(!Ps_UtilObjectService.hasValue(this.Payroll.EffDate)) {
      this.layoutService.onWarning("Vui lòng chọn thời gian hiển thị hệ thống!");
      return false;
    }
    if(!Ps_UtilObjectService.hasValueString(this.Payroll.SalaryName)) {
      this.layoutService.onWarning("Vui lòng nhập tên bảng lương!");
      return false;
    }
    // if(!Ps_UtilObjectService.hasValueString(this.Payroll.Remark)) {
    //   this.layoutService.onWarning("Vui lòng nhập mô tả bảng lương!");
    //   return false;
    // }
    if(this.Payroll.NoOfEmployee = 0) {
      this.layoutService.onWarning("Vui lòng thêm nhân sự cho bảng lương!");
      return false;
    }
    return true
  }

  
  //#endregion

  //#region dropdowntlist
  ListPayroll: DTOPayroll[] = [];
  Period: DTOPayroll = null;
  FromDate: Date = new Date();
  ToDate: Date = new Date();

  selectionChangeDropdown(payroll: DTOPayroll) {
    this.Payroll = payroll;
    this.FromDate = new Date(this.Payroll.FromDate);
    this.ToDate = new Date(this.Payroll.ToDate);
    this.PayrollEffDate = Ps_UtilObjectService.hasValue(this.Payroll.EffDate) ? new Date(this.Payroll.EffDate) : null;
    this.gridState.filter.filters = [];
    if(this.Payroll.Code > 0){
      this.APIGetPayroll(this.Payroll);
      sessionStorage.setItem('Payroll', JSON.stringify(this.Payroll));
    } else {
      this.CreateListBtnStatus();
    }
  }
  //#endregion

  //#region datetimepicker
  onDateChange(value: Date){
    const formattedDate = Ps_UtilObjectService.hasValue(value) ? value.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : null;
    this.Payroll.EffDate = formattedDate
    this.APIUpdatePayroll(this.Payroll, ['EffDate'],'thời gian hiển thị trên hệ thống')
  }
  //#endregion

 
  //#region import và export
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  onDownloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "PaycheckTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let a  = this.apiService.GetTemplate(getfilename).subscribe(res => {
      if (Ps_UtilObjectService.hasValueString(res.ErrorString)) {
        this.layoutService.onError(`Xảy ra lỗi khi ${ctx}: ${res.ErrorString}.`);
      }
      else {
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
    this.APIImportExcelEmployeeSalary(e);
  }

  APIImportExcelEmployeeSalary(file) {
    this.loading = true
    var ctx = "Import Excel"

     let APIImportExcelEmployeeSalary = this.salaryApiService.ImportExcelPaycheck(file, this.Payroll).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
       if (Ps_UtilObjectService.hasValue(res) && !Ps_UtilObjectService.hasValueString(res.ErrorString)) {
         this.APIGetPayroll(this.Payroll);
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
     this.arrUnsubscribe.push(APIImportExcelEmployeeSalary);
  }
  //#endregion

  

  //#region navigation
  CreateListBtnStatus() {
    this.listActBtnStatus = [];
    var statusID = this.Payroll.StatusID;

    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;

    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;


    // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && this.Payroll.Code > 0 && (statusID === 0 || statusID === 4) && Ps_UtilObjectService.hasValueString(this.Payroll.SalaryName) &&
    Ps_UtilObjectService.isValidDate2(this.Payroll.EffDate) && this.Payroll.NoOfEmployee > 0) {
      this.listActBtnStatus.push({
        text: 'GỬI DUYỆT',
        class: 'k-button btn-hachi hachi-primary',
        code: 'redo',
        statusID: 1,
        type: 'status'
      });
    }

    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    if (canVerify && this.Payroll.Code > 0 && (statusID === 1 || statusID === 3)) {
      if(Ps_UtilObjectService.hasValueString(this.Payroll.SalaryName) && Ps_UtilObjectService.isValidDate2(this.Payroll.EffDate) 
         && this.Payroll.NoOfEmployee > 0){
        this.listActBtnStatus.push({
          text: 'PHÊ DUYỆT',
          class: 'k-button btn-hachi hachi-primary',
          code: 'check-outline',
          statusID: 2,
          type: 'status'
        });
      }

      // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
      this.listActBtnStatus.push({
        text: 'TRẢ VỀ',
        class: 'k-button btn-hachi hachi-warning hachi-secondary',
        code: 'undo',
        statusID: 4,
        type: 'status'
      });
    }

    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    if (canVerify && this.Payroll.Code > 0 && statusID === 2) {
      this.listActBtnStatus.push({
        text: 'NGƯNG HIỂN THỊ',
        class: 'k-button btn-hachi hachi-warning',
        code: 'minus-outline',
        statusID: 3,
        type: 'status'
      });
    }

    // Push "Xóa" khi có quyền tạo hoặc toàn quyền và statusID === 0
    if (canCreateOrAdmin && this.Payroll.Code > 0 && this.Payroll.NoOfEmployee == 0  && statusID === 0 && (this.Payroll.SalaryName || this.Payroll.Remark || this.Payroll.EffDate)) {
      this.listActBtnStatus.push({
        text: 'XÓA BẢNG LƯƠNG',
        class: 'k-button btn-hachi hachi-warning',
        code: 'trash',
        type: 'delete',
      });
    }

    if (canCreateOrAdmin) {
      this.listActBtnStatus.push({
        text: 'TẠO MỚI',
        class: 'k-button btn-hachi hachi-primary',
        code: 'plus',
        type: 'new',
      });
    }
    // Sắp xếp theo thứ tự: xem -> chỉnh sửa -> gửi -> duyệt -> ngưng -> trả về
  }

  // Render btn status
  handleBtnStatus(item: any) {
      if (this.Payroll.Code != 0) {
        let StatusIDAction = parseInt(item.statusID);


        // if(item.type == 'status'){
        //   var listdataUpdate = [];
        //   if (StatusIDAction == 1) {
        //     if (this.Payroll.StatusID == 0 || this.Payroll.StatusID == 4) {
        //       listdataUpdate.push(this.Payroll);
        //       if(this.checkedField()) {
        //         this.APIUpdatePayrollStatus(listdataUpdate, StatusIDAction);
        //       }
        //     }
        //   } else if (StatusIDAction == 2) {
        //     if (this.Payroll.StatusID == 1 || this.Payroll.StatusID == 3) {
        //       listdataUpdate.push(this.Payroll);
        //       if(this.checkedField()) {
        //         this.APIUpdatePayrollStatus(listdataUpdate, StatusIDAction);
        //       }
        //     }
        //   } else if (StatusIDAction == 3) {
        //     if (this.Payroll.StatusID == 2) {
        //       listdataUpdate.push(this.Payroll);
        //       this.APIUpdatePayrollStatus(listdataUpdate, StatusIDAction);
        //     }
        //   } else if (StatusIDAction == 4) {
        //     if (this.Payroll.StatusID == 1 || this.Payroll.StatusID == 3) {
        //       listdataUpdate.push(this.Payroll);
        //       this.APIUpdatePayrollStatus(listdataUpdate, StatusIDAction);
        //     }
        //   }
        // } else if (item.type == 'new') {
        //   this.Payroll = new DTOPayroll(null);
        //   this.FromDate = new Date(this.Payroll.FromDate);
        //   this.ToDate = new Date(this.Payroll.ToDate);
        //   this.PayrollEffDate = null;
        //   this.gridView.next([]);
        //   this.onCheckPermistion()
        //   this.CreateListBtnStatus();
        // } else if (item.type == 'delete') {
        //   this.openedDiaDeletePayroll = true;
        // } else if (item.type == 'export'){
        //   this.onDownloadExcel()
        // } else if(item.type == 'import') {
        //   this.onImportExcel();
        // }


        switch (item.type) {
          case 'status':
            var listdataUpdate = [];
            if (StatusIDAction == 1) {
              if (this.Payroll.StatusID == 0 || this.Payroll.StatusID == 4) {
                listdataUpdate.push(this.Payroll);
                if(this.checkedField()) {
                  this.APIUpdatePayrollStatus(listdataUpdate, StatusIDAction);
                }
              }
            } else if (StatusIDAction == 2) {
              if (this.Payroll.StatusID == 1 || this.Payroll.StatusID == 3) {
                listdataUpdate.push(this.Payroll);
                if(this.checkedField()) {
                  this.APIUpdatePayrollStatus(listdataUpdate, StatusIDAction);
                }
              }
            } else if (StatusIDAction == 3) {
              if (this.Payroll.StatusID == 2) {
                listdataUpdate.push(this.Payroll);
                this.APIUpdatePayrollStatus(listdataUpdate, StatusIDAction);
              }
            } else if (StatusIDAction == 4) {
              if (this.Payroll.StatusID == 1 || this.Payroll.StatusID == 3) {
                listdataUpdate.push(this.Payroll);
                this.APIUpdatePayrollStatus(listdataUpdate, StatusIDAction);
              }
            }
            break;
          case 'new':
            this.Payroll = new DTOPayroll(null);
            this.FromDate = new Date(this.Payroll.FromDate);
            this.ToDate = new Date(this.Payroll.ToDate);
            this.PayrollEffDate = null;
            this.gridView.next([]);
            this.onCheckPermistion()
            this.CreateListBtnStatus();
            break; 
          case 'delete':
            this.openedDiaDeletePayroll = true;
            break; 
          case 'export':
            this.onDownloadExcel()
            break; 
          case 'import':
            this.onImportExcel();
            break;
          default:
            break;
        }

      } 
  }

  //#endregion

  
  //#region dialog
  public closePayRollDialog(): void {
    this.openedDiaDeletePayroll = false;
    this.openedDiaDeletePayrollAll = false
    this.dialogMany = false
  }

  deletePayRollDialog(status: string): void {
    if (status == 'yes') {
       this.APIDeletePayroll([this.Payroll]);
      this.openedDiaDeletePayroll = false;
    } else {
      this.openedDiaDeletePayroll = false;
    }
  }

  onCloseDeletePaycheck(){
    this.openedDiaDeletePaycheck = false;
  }

  handleDeletePaycheck(status: string){
    if (status == 'yes') {
      this.APIDeletePaycheck([this.Paycheck])
      this.openedDiaDeletePaycheck = false;
    } else {
      this.openedDiaDeletePaycheck = false;
    }
  }
  onDeleteAllPaycheck(){
    this.APIDeleteAllPaycheck(this.Payroll);
  }

  //#endialog

 //#region api
  ngUnsubscribe$ = new Subject<void>();

  APIGetPayroll(dto:DTOPayroll){
    this.loading = true;
    var APIGetPayroll = this.salaryApiService
      .GetPayroll(dto).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy bảng lương: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.Payroll = res.ObjectReturn;
            this.FromDate = new Date(this.Payroll.FromDate);
            this.ToDate = new Date(this.Payroll.ToDate);
            sessionStorage.setItem('Payroll', JSON.stringify(this.Payroll));
            this.PayrollEffDate = parseDate(this.Payroll.EffDate);
            this.gridState.filter.filters = []
            let compPaycheck = {
              field: 'Period',
              operator: 'eq',
              value: this.Payroll.Code,
              ignoreCase: true,
            }
            this.gridState.filter.filters.push(compPaycheck)
            this.onCheckPermistion()
            this.APIGetListPaycheck(this.valueSearch, this.gridState)
            this.cdr.detectChanges();
          }
          this.CreateListBtnStatus();
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy bảng lương: ${error}`);
        }
      );
    this.arrUnsubscribe.push(APIGetPayroll);
  }

  APIGetListPayroll(keyword: string, state: State) {
    this.loading = true;
    var APIGetListPayroll = this.salaryApiService
      .GetListPayroll(keyword, state).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          this.loading = false;
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
            this.ListPayroll = res.ObjectReturn.Data.sort((a, b) => new Date(a.FromDate).getTime() - new Date(b.FromDate).getTime());
          }
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

  APIUpdatePayroll(payroll: DTOPayroll, properties: string[], message: string){
    this.isloading = true;
    let UpdatePayroll = this.salaryApiService.UpdatePayroll(payroll, properties).pipe(takeUntil(this.ngUnsubscribe$))
    .subscribe(
      (res: any) => {
        this.loading = false;
        if (res.ErrorString != null) {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${message}: ${res.ErrorString}`);
        }
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.Payroll = res.ObjectReturn;
          this.FromDate = new Date(this.Payroll.FromDate);
          this.ToDate = new Date(this.Payroll.ToDate);
          sessionStorage.setItem('Payroll', JSON.stringify(this.Payroll));
          this.layoutService.onSuccess(`Cập nhật ${message} thành công!`)
          this.onCheckPermistion()
        }
        this.CreateListBtnStatus();
      },
      (error) => {
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${message}: ${error}`);
      }
    );
    this.arrUnsubscribe.push(UpdatePayroll);
  }

  APIUpdatePayrollStatus(dto: DTOPayroll[],statusID: number) {
    this.loading = true;
    var UpdatePayrollStatus = this.salaryApiService
      .UpdatePayrollStatus(dto, statusID).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          this.loading = false;
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
            this.APIGetPayroll(this.Payroll);
          }
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
          this.loading = false;
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
              this.Payroll = new DTOPayroll(null);
              this.FromDate = new Date(this.Payroll.FromDate);
              this.ToDate = new Date(this.Payroll.ToDate);
              this.PayrollEffDate = null;
              sessionStorage.setItem('Payroll', JSON.stringify(this.Payroll));
              this.gridView.next([]);
              this.onCheckPermistion()
              this.CreateListBtnStatus();
              this.layoutService.onSuccess('Xóa bảng lương thành công');
              
          }
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

  APIGetListPaycheck(keyword: string, state: State) {
    this.loading = true;
    var APIGetListPaycheck = this.salaryApiService
      .GetListPaycheck(keyword, state).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res.ErrorString != null) {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách phiếu lương: ${res.ErrorString}`
            );
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
            ) {
              this.ListPayCheck = res.ObjectReturn.Data.sort((a, b) => new Date(a.FromDate).getTime() - new Date(b.FromDate).getTime());
              this.total = res.ObjectReturn.Total;
              this.gridView.next({data: this.ListPayCheck,total: this.total });
              this.onCheckPermistion()
          }
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách phiếu lương: ${error}`
          );
        }
      );
    this.arrUnsubscribe.push(APIGetListPaycheck);
  }

  APIUpdatePaycheckStatus(dto: DTOEmployeeSalary[],statusID: number) {
    this.loading = true;
    var UpdatePaycheckStatus = this.salaryApiService
      .UpdatePaycheckStatus(dto, statusID).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res.ErrorString != null) {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi cập nhật trạng thái phiếu lương: ${res.ErrorString}`
            );
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
            this.layoutService.onSuccess(
              'Cập nhật trạng thái phiếu lương thành công!'
            );
            this.APIGetPayroll(this.Payroll);
          }
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật trạng thái phiếu lương: ${error}`
          );
        }
      );
    this.arrUnsubscribe.push(UpdatePaycheckStatus);
  }

  APIDeletePaycheck(paycheck: DTOEmployeeSalary[]) {
    this.loading = true;
    let DeletePaycheck = this.salaryApiService
      .DeletePaycheck(paycheck).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res.ErrorString != null) {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi xóa phiếu lương: ${res.ErrorString}`
            );
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
            ) {
              this.layoutService.onSuccess('Xóa phiếu lương thành công');
              this.APIGetListPaycheck(this.valueSearch,this.gridState);
              this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
              this.APIGetPayroll(this.Payroll)
              this.closePayRollDialog();
            }
          },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi xóa phiếu lương: ${error}`
          );
        }
      );
    this.arrUnsubscribe.push(DeletePaycheck);
  }

  APIDeleteAllPaycheck(payroll: DTOPayroll) {
    this.loading = true;
    let DeleteAllPaycheck = this.salaryApiService
      .DeleteAllPaycheck(payroll).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res.ErrorString != null) {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi xóa tất cả phiếu lương: ${res.ErrorString}`
            );
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
            ) {
              this.layoutService.onSuccess('Xóa tất cả phiếu lương thành công');
              this.APIGetListPaycheck(this.valueSearch,this.gridState);
              this.APIGetPayroll(this.Payroll)
              this.closePayRollDialog();
            }
          },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi xóa tất cả phiếu lương: ${error}`
          );
        }
      );
    this.arrUnsubscribe.push(DeleteAllPaycheck);
  }

  
  //#endregion api

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
      s?.unsubscribe();
    });
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
