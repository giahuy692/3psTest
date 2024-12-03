import { Component, OnInit } from '@angular/core';
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
import { HriExamApiService } from '../../shared/services/hri-exam-api.service';
import { DTOQuizSession } from '../../shared/dto/DTOQuizSession.dto';
import { DTOQuestionReport } from '../../shared/dto/DTOQuestionReport.dto';
import { DTOExamQuestion } from 'src/app/p-app/p-portal/shared/dto/DTOExamQuestion.dto';
@Component({
  selector: 'app-hri015-wrong-report-question',
  templateUrl: './hri015-wrong-report-question.component.html',
  styleUrls: ['./hri015-wrong-report-question.component.scss']
})
export class Hri015WrongReportQuestionComponent implements OnInit {
  loading: boolean = false
  justLoaded: boolean = true
  Question = new DTOExamQuestion()

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
  filterQuestion: FilterDescriptor = { field: "Question", operator: "contains", value: null }
  filterCategoryName: FilterDescriptor = { field: "CategoryName", operator: "contains", value: null }
  filterCompetenceName: FilterDescriptor = { field: "CompetenceName", operator: "contains", value: null }

  filterQuizSession: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }

  total = 0
  pageSize = 25

  pageSizes = [this.pageSize];
  gridView = new Subject<any>();

  listQuestionReport: DTOQuestionReport[] = [];
  listQuizSession: DTOQuizSession[] = [];

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

  gridStateReport: State = { take: this.pageSize, filter: { filters: [], logic: 'and' }, }

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public quizSessionApiService: HriQuizSessionsAPIService,
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
    this.subArr.push(sst,permissionAPI)
    this.onPageChangeCallback = this.pageChange.bind(this)
    //action dropdown    
    // this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    // this.getActionDropdownCallback = this.getActionDropdown.bind(this)
  }

  
  // Xử lý load filter cho danh sách
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridStateReport.take = this.pageSize;
    this.gridStateReport.filter.filters = [];
    this.gridStateSession.filter.filters = [];
    this.filterQuizSession.filters = [];

    this.filterQuizSession.filters.push({ field: "QuizSession", operator: "eq", value: this.selectedQuizSession.Code });

    let filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] }

    if (Ps_UtilObjectService.hasValueString(this.filterQuestion.value))
      filterSearch.filters.push(this.filterQuestion)

    if (Ps_UtilObjectService.hasValueString(this.filterCategoryName.value))
      filterSearch.filters.push(this.filterCategoryName)

    if (Ps_UtilObjectService.hasValueString(this.filterCompetenceName.value))
      filterSearch.filters.push(this.filterCompetenceName)

    if (filterSearch.filters.length > 0) {
      this.gridStateReport.filter.filters.push(filterSearch);
    }

    if (this.filterQuizSession.filters.length > 0) {
      this.gridStateReport.filter.filters.push(this.filterQuizSession);
    }
    this.GetQuizWrongQuestionReport();
  }


  // Reset lại bộ lọc mặc định
  resetFilter() {
    this.Search(null)
  }


  // Xử lý tìm kiếm đối tượng trong danh sách
  Search(event: any) {
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.filterQuestion.value = event;
      this.filterCategoryName.value = event;
      this.filterCompetenceName.value = event;
    } else {
      this.filterQuestion.value = null;
      this.filterCategoryName.value = null;
      this.filterCompetenceName.value = null;
    }
    this.loadFilter();
  }

  // Xử lý data khi chuyển trang trong danh sách
  pageChange(event: PageChangeEvent) {
    this.gridStateReport.skip = event.skip;
    this.gridStateReport.take = this.pageSize = event.take
    this.GetQuizWrongQuestionReport();
  }


  // Xử lý lọc danh sách khi chọn filter trong dropdown
  onSelectionChange(value){
    this.selectedQuizSession = value;
    this.loadFilter();
  }

  //#region API
  GetQuizWrongQuestionReport() {
    this.loading = true;
    let getListQuizReportAPI = this.quizSessionApiService.GetQuizWrongQuestionReport(this.gridStateReport).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listQuestionReport = res.ObjectReturn.Data
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listQuestionReport, total: this.total });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy báo cáo đợt đánh giá: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy báo cáo đợt đánh giá: ${err}`);
      this.loading = false
    })
    this.subArr.push(getListQuizReportAPI);
  }

  getListQuizSession() {
    this.loading = true
    let getListQuizSessionAPI = this.quizSessionApiService.GetListQuizSession(this.gridStateSession).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listQuizSession = res.ObjectReturn.Data
        if (Ps_UtilObjectService.hasListValue(this.listQuizSession)) {
          this.selectedQuizSession = this.listQuizSession[0];
          this.loadFilter();
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
    var getfileName = "BaoCaoCauHoiSaiDapAnDung.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)
    const filter : State = {
      filter: {
        filters: [
          { field: "QuizSession", operator: "eq", value: this.selectedQuizSession.Code },
        ], logic: 'and'
      },
    }
  
    let onExportExcel =  this.quizSessionApiService.ExportWrongQuestionReport(filter).subscribe(res => {
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
}
