import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { State, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { PageChangeEvent } from '@progress/kendo-angular-grid';

import { HriQuizSessionsAPIService } from '../../shared/services/hri-quiz-session-api.service';
import { DTOQuizSession } from '../../shared/dto/DTOQuizSession.dto';
import { DTOQuizRole } from '../../shared/dto/DTOQuizRole.dto';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { HriExamApiService } from '../../shared/services/hri-exam-api.service';

@Component({
  selector: 'app-hri015-exam-report-detail',
  templateUrl: './hri015-exam-report-detail.component.html',
  styleUrls: ['./hri015-exam-report-detail.component.scss']
})
export class Hri015ExamReportDetailComponent implements OnInit {

  loading: boolean = false
  justLoaded: boolean = true


  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  // Dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //function grid
  onPageChangeCallback: Function

  subArr: Subscription[] = []
  listMenu: Array<MenuDataItem> = [];

  //permission
  isMaster = false
  isCreator = false
  isVerifier = false
  isViewOnly = false
  actionPerm: DTOActionPermission[] = []

  //fillter 
  filterName: FilterDescriptor = { field: "StaffName", operator: "contains", value: null }
  filterPositionName: FilterDescriptor = { field: "PositionName", operator: "contains", value: null }
  filterStaffCode: FilterDescriptor = { field: "StaffCode", operator: "contains", value: null }
  filterDepartment: FilterDescriptor = { field: "DepartmentName", operator: "contains", value: null }
  filterLocationName: FilterDescriptor = { field: "LocationName", operator: "contains", value: null }


  filterQuizSession: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }

  total = 0
  pageSize = 25

  pageSizes = [this.pageSize];

  gridView = new Subject<any>();

  listQuizRole: DTOQuizRole[] = [];
  listQuizSession: DTOQuizSession[] = [];

  isFilterAdded = false;
  selectedQuizSession = new DTOQuizSession();

  gridStateSession: State = {
    filter: {
      filters: [
        { field: "StatusID", operator: "eq", value: 2 },
        {
          filters: [
            { field: "SessionStatusID", operator: "eq", value: 3 },
            { field: "SessionStatusID", operator: "eq", value: 5 }
          ], logic: 'or'
        }
      ], logic: 'and'
    },
  }

  gridStateRole: State = { take: this.pageSize, filter: { filters: [], logic: 'and' }, }


  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public quizSessionApiService: HriQuizSessionsAPIService,
    private PotalexamAPIService: HriExamApiService,
  ) { }

  ngOnInit(): void {
    let sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false
        this.actionPerm = distinct(res.ActionPermission, "ActionType");

        this.isMaster = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        this.isCreator = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        this.isVerifier = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        this.isViewOnly = !this.isMaster && !this.isCreator && !this.isVerifier
        
      }
    })
    let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
				this.getListQuizSession();
			}
		})
    this.subArr.push(sst, permissionAPI)
    this.onPageChangeCallback = this.pageChange.bind(this)
    //action dropdown    
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
  }

  
  // Xử lý load filter cho danh sách
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridStateRole.take = this.pageSize;
    this.gridStateRole.filter.filters = [];
    this.gridStateSession.filter.filters = [];
    this.filterQuizSession.filters = [];

    this.filterQuizSession.filters.push(
        { field: "QuizSession", operator: "eq", value: this.selectedQuizSession.Code }
    );

    let filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] }

    if (Ps_UtilObjectService.hasValueString(this.filterName.value))
      filterSearch.filters.push(this.filterName)
    
    if (Ps_UtilObjectService.hasValueString(this.filterStaffCode.value))
      filterSearch.filters.push(this.filterStaffCode)

    if (Ps_UtilObjectService.hasValueString(this.filterDepartment.value))
      filterSearch.filters.push(this.filterDepartment)
    
    if (Ps_UtilObjectService.hasValueString(this.filterLocationName.value))
      filterSearch.filters.push(this.filterLocationName)

    if (Ps_UtilObjectService.hasValueString(this.filterPositionName.value))
      filterSearch.filters.push(this.filterPositionName)

    if (filterSearch.filters.length > 0) {
      this.gridStateRole.filter.filters.push(filterSearch);
    }

    if (this.filterQuizSession.filters.length > 0) {
      this.gridStateRole.filter.filters.push(this.filterQuizSession);
    }
    this.getListQuizRole()
  }

  // Reset lại tìm kiếm rỗng
  resetFilter() {
    this.Search(null);
  }

  // Xử lý lọc danh sách khi chọn filter trong dropdown
  onSelectionChange(value){
    this.selectedQuizSession = value;
    this.loadFilter();
  }

  // Xử lý tìm kiếm đối tượng trong danh sách
  Search(event: any) {
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.filterName.value = event;
      this.filterStaffCode.value = event;
      this.filterDepartment.value = event;
      this.filterLocationName.value = event;
      this.filterPositionName.value = event;
    } else {
      this.filterName.value = null;
      this.filterStaffCode.value = null;
      this.filterDepartment.value = null;
      this.filterLocationName.value = null;
      this.filterPositionName.value = null;
    }
    this.loadFilter();
  }

  // Xử lý data khi chuyển trang trong danh sách
  pageChange(event: PageChangeEvent) {
    this.gridStateRole.skip = event.skip;
    this.gridStateRole.take = this.pageSize = event.take
    this.getListQuizRole();
  }

  //Xử lý thêm các action vào dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    var Code = dataItem.Code;
    moreActionDropdown = []
    if (Code)
      moreActionDropdown.push({ Name: "Xem bài làm", Code: "eye", Type: 'detail', Actived: true })

    return moreActionDropdown
  }

  //Xử lý action trong dropdown của item
  onActionDropdownClick(menu: MenuDataItem, item: any) {
    // console.log(item)
    if (menu.Code == "eye" || menu.Type == "detail") {
      const itemString = JSON.stringify(item);
      (localStorage.setItem("ExamSession", itemString))
      item.Code = item.Exam;
      this.PotalexamAPIService.ChangeParamExam$.next(item);
      this.openExamMonitor();
    }

  }

  // Xử lý vào trang xem bài thi
  openExamMonitor() {
    let changeModuleData = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code.includes('hriCompetency')
        || f.Link.includes('hriCompetency'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('evaluation-tranche')
          || f.Link.includes('evaluation-tranche'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes("quiz-monitor")
            || f.Link.includes("quiz-monitor"))

          if (Ps_UtilObjectService.hasValue(detail2) && Ps_UtilObjectService.hasListValue(detail2.LstChild)) {
            var detail3 = detail2.LstChild.find(f => f.Code.includes("exam-monitor")
              || f.Link.includes("exam-monitor"))
          }
        }
        this.menuService.activeMenu(detail3);
      }
    })
    this.subArr.push(changeModuleData);
  }


  //#region API
  getListQuizRole() {
    this.loading = true;
    let getListQuizRoleAPI = this.quizSessionApiService.GetQuizExamineeReport(this.gridStateRole).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listQuizRole = res.ObjectReturn.Data
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listQuizRole, total: this.total });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách giám sát nhân sự tham gia đợt đánh giá: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách giám sát nhân sự tham gia đợt đánh giá: ${err}`);
      this.loading = false
    })
    this.subArr.push(getListQuizRoleAPI);
  }

  getListQuizSession() {
    this.loading = true
    let getListQuizSessionAPI = this.quizSessionApiService.GetListQuizSession(this.gridStateSession).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listQuizSession = res.ObjectReturn.Data
        if (Ps_UtilObjectService.hasListValue(this.listQuizSession)) {
          this.selectedQuizSession = this.listQuizSession[0];
          this.loadFilter();
          // this.getListQuizRole();
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đợt đánh giá: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đợt đánh giá: ${err}`);
      this.loading = false
    })
    this.subArr.push(getListQuizSessionAPI);
  }

  onExportExcel() {
    this.loading = true
    var ctx = "Xuất Excel"
    var getfileName = "BaoCaoChiTietKetQuaKiemTra.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let onExportExcel =  this.quizSessionApiService.ExportExamDetailResultReport(this.selectedQuizSession.Code).subscribe(res => {
      this.loading = false;
      if (Ps_UtilObjectService.hasValue(res.ObjectReturn) || Ps_UtilObjectService.hasValue(res)) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      }
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}: ` + f?.error?.ExceptionMessage)
      this.loading = false;
    });

    this.subArr.push(onExportExcel);
  }
  //#endregion

  ngOnDestroy() {
    this.subArr.map(s => {
      s?.unsubscribe()
    })
  }

  // Xử lý lấy đường dẫn hình ảnh dựa trên giá trị chuỗi đầu vào.
  getImgRes(str: string) {
    return Ps_UtilObjectService.hasValueString(str) ? Ps_UtilObjectService.getImgRes(str) : 'assets/img/icon/icon-nonImageThumb.svg'
  }
}
