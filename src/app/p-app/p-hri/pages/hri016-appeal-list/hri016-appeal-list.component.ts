import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { DTOStaff, Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOQuizRole } from '../../shared/dto/DTOQuizRole.dto';
import { DTOExamAppeal, DTOQuestionAppeal } from '../../shared/dto/DTOAppeal.dto';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { HriQuizSessionService } from '../../shared/services/hri-quiz-session.service';
import { HriAppealApiService } from '../../shared/services/hri-appeal-api.service';
import { formatDate } from '@angular/common';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOQuizSession } from '../../shared/dto/DTOQuizSession.dto';
import { DTOEmployeeDetail } from '../../shared/dto/DTOEmployee.dto';
import { HriExamApiService } from '../../shared/services/hri-exam-api.service';
import { DTOReEval } from '../../shared/dto/DTOReEval.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';

@Component({
  selector: 'app-hri016-appeal-list',
  templateUrl: './hri016-appeal-list.component.html',
  styleUrls: ['./hri016-appeal-list.component.scss']
})
export class Hri016AppealListComponent implements OnInit, OnDestroy {

  @ViewChild('refRole') refRole: DropDownListComponent;


  // property
  // common variable
  justLoaded: boolean = true
  isAllPers: boolean = false;
  isCanCreate: boolean = false;
  isCanApproved: boolean = false;

  isSort: boolean = false
  isTest: boolean = false
  loading: boolean = false;
  isAllowed: boolean = false;
  isChairman: boolean = false;
  dialogOpen: boolean = false;
  IsAllowCompleted: boolean = false
  isChangeList: boolean = false;
  isFilterActive: boolean = true;
  isFisrtGetQuestion: boolean = true;
  isAllowChooseQuizRole: boolean = true;
  today: Date = new Date()

  //end common variable

  //Grid variable


  //Grid Yêu cầu
  filterSearchBoxYC: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  sortByYC: SortDescriptor = {
    field: 'NoOfQuestion',
    dir: 'asc'
  }


  pageSizeYC = 25
  pageSizesYC = [this.pageSizeYC]

  gridViewYC: BehaviorSubject<any> = new BehaviorSubject<any>({ data: [], total: 0 });
  gridStateYC: State = {
    skip: 0, take: this.pageSizeYC,
    filter: {
      logic: 'and',
      filters: []
    },
    sort: [this.sortByYC]
  }
  totalYC = 0

  //Grid Câu hỏi
  filterSearchBoxCH: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  sortByCH: SortDescriptor = {
    field: 'NoOfQuestion',
    dir: 'asc'
  }


  pageSizeCH = 25
  pageSizesCH = [this.pageSizeCH]

  gridViewCH: BehaviorSubject<any> = new BehaviorSubject<any>({ data: [], total: 0 });
  gridStateCH: State = {
    skip: 0, take: this.pageSizeCH,
    filter: {
      logic: 'and',
      filters: []
    },
    sort: [this.sortByCH]
  }
  totalCH = 0
  selectableCH: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: false,
  };
  filterEvaluate: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterEvaluatedBy: FilterDescriptor = {
    field: "EvaluatedBy", operator: "eq", value: 9
  }


  // end Grid variable

  //object
  quizSession: any
  Staff = new DTOStaff()
  Pesonrequest = new DTOExamAppeal()
  QuestionRequest = new DTOQuestionAppeal()
  // end object

  //Function
  //Yêu cầu
  onActionDropdownClickCallbackYC: Function
  onSortChangeCallbackYC: Function
  getActionDropdownCallbackYC: Function
  onPageChangeCallbackYC: Function
  onFilterChangeCallbackYC: Function
  //Cauhoi
  onActionDropdownClickCallbackCH: Function
  onSortChangeCallbackCH: Function
  getActionDropdownCallbackCH: Function
  onPageChangeCallbackCH: Function
  onFilterChangeCallbackCH: Function
  onSelectCallbackCH: Function
  onSelectedPopupBtnCallbackCH: Function
  getSelectionPopupCallbackCH: Function
  // end Function

  // Array
  //role trưởng ban
  Role1 = []
  RoleTB = []
  //role Người được phân quyền chấm
  Role6 = []
  RoleNSC = []
  // danh sách yêu cầu
  allowActionDropdownYC = []
  //danh sách câu hỏi
  allowActionDropdownCH = []
  listItemDropdown: DTOQuestionAppeal[] = []
  listQuestionAppeal: DTOReEval[] = []
  lastItemDropdown: any[]
  ListRole: DTOQuizRole[] = []

  arrUnsubscribe: Subscription[] = [];
  listExamRequest: DTOExamAppeal[] = []
  listQuestionRequest: DTOQuestionAppeal[] = []
  listQuestion: DTOQuestionAppeal[] = []
  ListStaffReEval: DTOEmployeeDetail[] = []
  AppealList: DTOReEval[] = []
  dropdownData: Array<{ StaffName: string; Code: number }> = []
  dropdownListData: Array<{ StaffName: string; Code: number }> = []
  SelectedropdownData: { StaffName: string; Code: number }
  tempSearchYC: any;
  tempSearchCH: any;

  actionPerm: DTOActionPermission[] = [];
  //end Array

  // end property
  constructor(
    public layoutService: LayoutService,
    private sessionService: HriQuizSessionService,
    public appealApiService: HriAppealApiService,
    public menuService: PS_HelperMenuService,
    public hriApiService: HriExamApiService,
  ) { }
  // method

  ngOnInit(): void {
    let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
				this.APIGetQuizSessionByCache()
			}
		})
    this.arrUnsubscribe.push(permissionAPI);
    //yêu cầu
    this.onSortChangeCallbackYC = this.onSortChangeYC.bind(this)
    this.onPageChangeCallbackYC = this.onPpageChangeYC.bind(this)
    this.getActionDropdownCallbackYC = this.getActionDropdownYC.bind(this)
    this.onActionDropdownClickCallbackYC = this.onActionDropdownClickYC.bind(this)
    //Câu hỏi
    this.onPageChangeCallbackCH = this.onPageChangeCH.bind(this)
    this.onSortChangeCallbackCH = this.onSortChangeCH.bind(this)
    this.getActionDropdownCallbackCH = this.getActionDropdownCH.bind(this)
    this.onActionDropdownClickCallbackCH = this.onActionDropdownClickCH.bind(this)

    this.getSelectionPopupCallbackCH = this.getSelectionPopupCH.bind(this)
    this.onSelectCallbackCH = this.selectChangeCH.bind(this)

  }


  // API

  // lấy Quizsession từ cache
  APIGetQuizSessionByCache() {
    this.loading = true


    let GetQuizSessionByCache_sst = this.sessionService.GetCacheQuizSession().subscribe(res => {

      let changePermissionAPI = this.menuService.changePermission().subscribe((perm: DTOPermission) => {
        if (Ps_UtilObjectService.hasValue(perm) && this.justLoaded) {
          this.justLoaded = false;
          this.actionPerm = distinct(perm.ActionPermission, 'ActionType');

          this.isAllPers = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          this.isCanCreate = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          this.isCanApproved = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        }
      });
      this.arrUnsubscribe.push(changePermissionAPI);

      if (Ps_UtilObjectService.hasValue(res)) {
        this.quizSession = res
        if (this.quizSession.TypeOfSession != 1) {
          this.isTest = false
          this.Decentralization()
        } else {
          this.isTest = true
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đợt đánh giá`);
      }
      this.loading = false
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đợt đánh giá: ${error}`);
    })
    this.arrUnsubscribe.push(GetQuizSessionByCache_sst)
  }

  // lẫy dữ liệu danh sách yêu cầu phúc khảo
  APIGetListExamAppealRequest() {
    this.loading = true;
    let GetListExamAppealRequest_sst = this.appealApiService.GetListExamAppealRequest(this.quizSession.Code, this.gridStateYC).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listExamRequest = res.ObjectReturn.Data;
        this.totalYC = res.ObjectReturn.Total;
        this.gridViewYC.next({ data: this.listExamRequest, total: this.totalYC });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách yêu cầu phúc khảo: " ${res.ErrorString}`);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách yêu cầu phúc khảo: ${error}`);
    })
    this.arrUnsubscribe.push(GetListExamAppealRequest_sst)
  }

  //lẫy dữ liệu Danh sách câu hỏi phúc khảo
  APIGetListQuestionAppealRequest() {
    this.loading = true;
    let GetListQuestionAppealRequest_sst = this.appealApiService.GetListQuestionAppealRequest(this.quizSession.Code, this.gridStateCH).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listQuestionRequest = res.ObjectReturn.Data;
        this.listQuestion = JSON.parse(JSON.stringify(res.ObjectReturn.Data))
        this.onAddEvaluateBy(this.listQuestionRequest)
        this.totalCH = res.ObjectReturn.Total;
        this.gridViewCH.next({ data: this.listQuestionRequest, total: this.totalCH })
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi phúc khảo: " ${res.ErrorString}`);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi phúc khảo: ${error}`);
    })
    this.arrUnsubscribe.push(GetListQuestionAppealRequest_sst)
  }

  onAddEvaluateBy(list: DTOQuestionAppeal[]) {
    if (this.isChairman) {
      list.forEach(s => {
        s.ListAppeal.forEach(i => {
          if (i.EvaluatedBy == null) {
            i.EvaluatedBy = this.Role1[0].StaffID
          }
        })
      })
    }
  }

  // lấy danh sách nhân sự 
  APIGetListStaffReEval() {
    this.loading = true;
    let GetListStaff_sst = this.appealApiService.GetListStaffReEval(this.quizSession.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ListStaffReEval = res.ObjectReturn;
        let filteredArr = this.ListStaffReEval.filter(item => (item.FirstName !== null && item.MiddleName !== null && item.LastName !== null));
        this.dropdownData = filteredArr.map((i) => ({
          StaffName: `${i.LastName} ${i.MiddleName} ${i.FirstName}`,
          Code: i.Code
        }))
        this.dropdownListData = JSON.parse(JSON.stringify(this.dropdownData))
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân sự đánh giá: " ${res.ErrorString}`);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân sự đánh giá: ${error}`);
    })
    this.arrUnsubscribe.push(GetListStaff_sst)
  }

  // cập nhật tình trạng đợt đánh giá

  APIUpdateQuizSession(updatedQuiz: DTOQuizSession, propName: string[]) {
    let updateQuizSessionAPI = this.sessionService.UpdateQuizSession(updatedQuiz, propName).subscribe();
    this.arrUnsubscribe.push(updateQuizSessionAPI);
  }

  //Cập nhật nhân sự chấm phúc khảo

  APIUpdateReEval(prop: string[], prod = this.AppealList, TypeData: number) {
    this.loading = true
    let UpdateStaff_sst = this.appealApiService.UpdateReEvalL(prod, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (TypeData == 1) {
          this.APIGetListExamAppealRequest()
        } else if (TypeData == 2) {
          this.dialogOpen = false
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
          this.APIGetListQuestionAppealRequest()
          this.listItemDropdown = []
        } else if (TypeData == 3) {
          this.onOpenDetailReEvaluate()
        }
        this.layoutService.onSuccess("Cập nhật thông tin thành công");
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi Cập nhật thông tin: ${res.ErrorString}`);
        if (TypeData == 1) {
          this.APIGetListExamAppealRequest()
        } else if (TypeData == 2) {
          this.APIGetListQuestionAppealRequest()
        }
      }
      this.loading = false
    }, (err) => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi Cập nhật thông tin: ${err}`);
    })
    this.arrUnsubscribe.push(UpdateStaff_sst);
  }

  //end API

  //logic

  // function xóa bỏ thẻ html của string
  removeHtmlTags(input: string): string {
    const div = document.createElement('div');
    div.innerHTML = input;
    return div.textContent || div.innerText || '';
  }

  //Phân quyền 
  Decentralization() {
    this.ListRole = this.quizSession.ListOfUserRole
    if (this.ListRole.length > 0) {
      this.Role1 = this.ListRole.filter(s => s.TypeData == 1)
      this.Role6 = this.ListRole.filter(s => s.TypeData == 6)
      if (Ps_UtilObjectService.hasListValue(this.Role1)) {
        this.RoleTB.push(this.Role1[0])
        if (Ps_UtilObjectService.hasListValue(this.Role6)) {
          this.RoleTB.push(this.Role6[0])
        }
        if (Ps_UtilObjectService.hasListValue(this.RoleTB)) {
          this.isChairman = true
          this.onLoadFilterYC()
          this.APIGetListExamAppealRequest()
          this.APIGetListStaffReEval()
          if (this.isChairman && this.quizSession.SessionStatusID == 4) {
            this.IsAllowCompleted = true
          }
        }
      } else if (Ps_UtilObjectService.hasListValue(this.Role6)) {
        this.RoleNSC.push(this.Role6[0])
        if (Ps_UtilObjectService.hasListValue(this.RoleNSC)) {
          this.isAllowed = true
          this.onLoadFilterCH()
          this.APIGetListQuestionAppealRequest()
        }
      }
    }
    else if (this.isAllPers) {//nếu user Toàn quyền thì cho xem thông tin phúc khảo
      this.isTest = false
      this.isChairman = true

      this.onLoadFilterYC()
      this.APIGetListExamAppealRequest()
      this.APIGetListStaffReEval()

      this.onLoadFilterCH()
      this.APIGetListQuestionAppealRequest()
    }
  }

  //Bộ lọc
  onLoadFilterYC() {
    this.pageSizesYC = [...this.layoutService.pageSizes]
    this.gridStateYC.take = this.pageSizeYC
    this.gridStateYC.filter.filters = []

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBoxYC.filters)) {
      if (this.tempSearchYC[0].value != '') {
        this.gridStateYC.filter.filters.push(this.filterSearchBoxYC);
      }
    }
  }

  onLoadFilterCH() {
    this.pageSizesCH = [...this.layoutService.pageSizes]
    this.gridStateCH.take = this.pageSizeCH
    this.gridStateCH.filter.filters = []
    this.filterEvaluate.filters = []

    this.ListRole = this.quizSession.ListOfUserRole
    this.Role1 = this.ListRole.filter(s => s.TypeData == 1)
    this.Role6 = this.ListRole.filter(s => s.TypeData == 6)
    if (!Ps_UtilObjectService.hasListValue(this.Role1)) {
      if (Ps_UtilObjectService.hasListValue(this.Role6)) {
        this.filterEvaluatedBy.value = this.Role6[0].StaffID
        this.filterEvaluate.filters.push(this.filterEvaluatedBy)
      }
      if (this.filterEvaluate.filters.length > 0) {
        this.gridStateCH.filter.filters.push(this.filterEvaluate)
      }
    }
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBoxCH.filters)) {
      if (this.tempSearchCH[0].value != '') {
        this.gridStateCH.filter.filters.push(this.filterSearchBoxCH);
      }
    }
  }

  // lấy danh sách dropdown trong grid
  getActionDropdownYC(moreActionDropdown: MenuDataItem[], dataItem: any) {
    this.Pesonrequest = { ...dataItem }
    moreActionDropdown = []
    let AppealDate = new Date(this.quizSession.AppealDate)
    let Appeal = new Date(this.quizSession.AppealDate)
    let beginAppealDate = new Date()
    Appeal.setDate(AppealDate.getDate() - this.quizSession.AppealTime)
    beginAppealDate = Appeal

    if ((this.today > beginAppealDate && this.today <= AppealDate) && this.Pesonrequest.StatusID == 1) {
      moreActionDropdown.push({ Name: "Xem chi tiết yêu cầu", Code: "eye", Link: 'detailExam', Actived: true })
      moreActionDropdown.push({ Name: "Trả lại yêu cầu", Code: "undo", Link: 'return', Actived: true })
    }

    if (this.today > AppealDate) {
      moreActionDropdown.push({ Name: "Xem chi tiết yêu cầu", Code: "eye", Link: 'detailExam', Actived: true })
    }

    return moreActionDropdown

  }

  getActionDropdownCH(moreActionDropdown: MenuDataItem[], dataItem: any) {
    this.QuestionRequest = { ...dataItem }
    var StatusID = this.QuestionRequest.ListAppeal[0].StatusID
    var EvaluatedBy = this.QuestionRequest.ListAppeal[0].EvaluatedBy
    if (Ps_UtilObjectService.hasListValue(this.Role1)) {
      var GradedChairman = this.Role1[0].StaffID
    }
    let ReEvaluateDate = new Date(this.quizSession.ReEvaluateDate)
    let ReEvaluate = new Date(this.quizSession.ReEvaluateDate)
    let beginReEvaluate = new Date()
    ReEvaluate.setDate(ReEvaluateDate.getDate() - this.quizSession.ReEvaluateTime)
    beginReEvaluate = ReEvaluate
    moreActionDropdown = []

    if (this.isChairman) {

      if (this.today > beginReEvaluate && this.today <= ReEvaluateDate) {//trong giai doạn chấm phúc khảo
        moreActionDropdown.push({ Name: "Xem chi tiết chấm câu", Code: "eye", Link: 'Detail', Actived: false })

        if ((StatusID == 1 || StatusID == 2) && EvaluatedBy == GradedChairman) { // tình trạng chấm
          moreActionDropdown.push({ Name: "Chấm câu phúc khảo", Code: "edit", Link: 'EditDetail', Actived: true })
        }
        //cho phép xem khi tình trạng đang chấm mà người chấm ko phải là trường ban hoặc khi hoàn tất
        if ((StatusID == 1 || StatusID == 2 || StatusID == 3) && EvaluatedBy != GradedChairman || (StatusID == 3 && EvaluatedBy == GradedChairman)) {
          moreActionDropdown.push({ Name: "Xem chi tiết chấm câu", Code: "eye", Link: 'Detail', Actived: true })
        }
        // tình trạng hoàn tất hiện yêu cầu chấm lại nếu người chấm ko phải là trưởng ban
        if (StatusID == 3) {
          moreActionDropdown.push({ Name: "Yêu cầu chấm lại", Code: "undo", Link: 'return', Actived: true })
        }
      } else {
        moreActionDropdown.push({ Name: "Xem chi tiết chấm câu", Code: "eye", Link: 'Detail', Actived: true })
      }

    } else if (this.isAllowed) {

      if (this.today > beginReEvaluate && this.today <= ReEvaluateDate) {//trong giai doạn chấm phúc khảo
        moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: 'Detail', Actived: false })

        if (StatusID == 1 || StatusID == 2) { // Chấm phúc khảo
          moreActionDropdown.push({ Name: "Chấm phúc khảo", Code: "edit", Link: 'EditDetail', Actived: true })
        }

        if (StatusID == 2 && dataItem.NoOfNotMarked == 0) { // Chấm lại phúc khảo
          moreActionDropdown.push({ Name: "Chấm lại câu hỏi", Code: "edit", Link: 'ReEdit', Actived: true })
        }
      } else {
        moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: 'Detail', Actived: true })

      }
    }

    return moreActionDropdown
  }

  getSelectionPopupCH(selectedList: DTOQuestionAppeal[]) {
    this.isFilterActive = !this.isFilterActive
    this.listItemDropdown = []
    if (Ps_UtilObjectService.hasValue(selectedList)) {
      this.listItemDropdown = selectedList
    }
  }

  //Hủy sự kiện click vào dropdown để không bị ảnh hưởng select của grid
  onDropDownClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  InScoring() {
    const AppealDate = new Date(this.quizSession.AppealDate)
    const ReEvaluateDate = new Date(this.quizSession.ReEvaluateDate)
    if (this.today <= AppealDate || this.today > ReEvaluateDate || this.quizSession.SessionStatusID == 5) {
      return true
    }
  }

  CheckDate(dataItem: any) {
    if (dataItem.StatusID == 3 && dataItem.NoOfNotMarked == 0) {
      return true
    } else {
      return false
    }
  }

  //end logic

  //action

  // load lại dữ liệu
  onloadPage() {
    this.APIGetQuizSessionByCache()
  }

  // thay đổi danh sách hiển thị
  ChangeList(type: number) {
    if (type == 1) {
      this.isChangeList = false
      this.onLoadFilterYC()
      this.APIGetListExamAppealRequest()
    } else if (type == 2) {
      this.isChangeList = true
      this.onLoadFilterCH()
      this.APIGetListQuestionAppealRequest()
    }
  }
  // search
  handleSearchYC(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBoxYC.filters = event.filters;
        this.tempSearchYC = event.filters;
        this.gridStateYC.skip = 0
        this.onLoadFilterYC();
        this.APIGetListExamAppealRequest()
      }
    }
  }

  handleSearchCH(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBoxCH.filters = event.filters;
        this.tempSearchCH = event.filters;
        this.gridStateCH.skip = 0
        this.onLoadFilterCH();
        this.APIGetListQuestionAppealRequest()
      }
    }
  }

  handleFilterDropdownlist(value) {
    if (value != '') {
      this.dropdownData = this.dropdownListData.filter(
        (s) => s.StaffName.toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    } else {
      this.dropdownData = this.dropdownListData
    }
  }

  //Thay đổi danh sách grid
  onPpageChangeYC(event: PageChangeEvent) {
    this.gridStateYC.skip = event.skip;
    this.gridStateYC.take = this.pageSizeYC = event.take
    this.APIGetListExamAppealRequest()
  }

  onPageChangeCH(event: PageChangeEvent) {
    this.gridStateCH.skip = event.skip;
    this.gridStateCH.take = this.pageSizeCH = event.take
    this.APIGetListQuestionAppealRequest()
  }
  // sort 
  onSortChangeYC(event: SortDescriptor[]) {
    this.gridStateYC.sort = event
    this.APIGetListExamAppealRequest()
  }

  onSortChangeCH(event: SortDescriptor[]) {
    this.isSort = true
    this.gridStateCH.sort = event
    this.APIGetListQuestionAppealRequest()
  }

  selectionAppealRoleChange(dataEvent: any, dataItem: any) {

    dataItem.ListAppeal.forEach(item => {
      item.EvaluatedBy = dataEvent.Code
    })

    if (!Ps_UtilObjectService.hasListValue(this.listItemDropdown) && Ps_UtilObjectService.hasValue(dataItem)) {
      this.APIUpdateReEval(['EvaluatedBy'], dataItem.ListAppeal, 2);
    }
    else if (Ps_UtilObjectService.hasListValue(this.listItemDropdown) && this.listItemDropdown.length == 1) {
      this.APIUpdateReEval(['EvaluatedBy'], dataItem.ListAppeal, 2);
    }
    if (Ps_UtilObjectService.hasListValue(this.listItemDropdown) && this.listItemDropdown.length > 1) {
      this.listItemDropdown.forEach(s => {
        s.ListAppeal.forEach(i => {
          i.EvaluatedBy = dataEvent.Code
        })
      })
      this.dialogOpen = true
      this.lastItemDropdown = dataItem.ListAppeal
    }
  }


  onCloseDialog() {
    this.dialogOpen = false;
    this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
    this.onLoadFilterCH();
    this.APIGetListQuestionAppealRequest()
    this.listItemDropdown = []
  }

  onUpdateManyItem() {
    if (Ps_UtilObjectService.hasListValue(this.listItemDropdown) && this.listItemDropdown.length > 1) {
      this.listItemDropdown.forEach(item => {
        if (item.ListAppeal && item.ListAppeal.length > 0) {
          item.ListAppeal.forEach(s => {
            this.listQuestionAppeal.push({ ...s });
          })
        }
      })
      this.APIUpdateReEval(['EvaluatedBy'], this.listQuestionAppeal, 2);
    }
  }

  onUpdateOneItem() {
    if (Ps_UtilObjectService.hasListValue(this.listItemDropdown)) {
      this.APIUpdateReEval(['EvaluatedBy'], this.lastItemDropdown, 2);
    }
  }

  // Thực hiện sự kiện khi người dùng click vào dropdown
  onActionDropdownClickYC(menu: MenuDataItem, item: DTOExamAppeal) {
    if (item.Code > 0) {
      if (menu.Code == "undo" && menu.Link == 'return') {
        item.ListAppeal.forEach(i => {
          if (i.StatusID == 1) {
            i.StatusID = 4
          }
        })

        this.APIUpdateReEval(['StatusID'], item.ListAppeal, 1)
      }
      else if (menu.Code == "eye" && menu.Link == 'detailExam') {
        this.onOpenDetailExam(item)
      }
    }
  }

  onActionDropdownClickCH(menu: MenuDataItem, item: DTOQuestionAppeal) {
    let question: DTOQuestionAppeal
    this.listQuestion.forEach(Q => {
      if (Q.Code == item.Code) {
        question = JSON.parse(JSON.stringify(Q))
      }
    })
    var EvaluatedByQuestion = question.ListAppeal[0].EvaluatedBy


    if (item.Code > 0) {
      if (menu.Code == "undo" || menu.Link == 'return') {
        item.ListAppeal.forEach(i => {
          if (i.StatusID == 3) {
            i.StatusID = 2
          }
        })
        this.APIUpdateReEval(['StatusID'], item.ListAppeal, 2)
      }
      else if (menu.Code == "eye" && menu.Link == 'Detail') {
        item['QuizSession'] = this.quizSession.Code
        item.ListAppeal[0].EvaluatedBy = null
        localStorage.setItem("QuestionAppeal", JSON.stringify(item))
        this.onOpenDetailReEvaluate()
      }
      else if (menu.Code == "edit" && menu.Link == 'EditDetail') {
        item['QuizSession'] = this.quizSession.Code
        localStorage.setItem("QuestionAppeal", JSON.stringify(item))
        if (Ps_UtilObjectService.hasValue(EvaluatedByQuestion)) {
          this.onOpenDetailReEvaluate()
        } else {
          this.APIUpdateReEval(['EvaluatedBy'], item.ListAppeal, 3)
        }
      }
      else if (menu.Code == "edit" && menu.Link == 'ReEdit') {
        item.ListAppeal.forEach(i => {
          if (i.StatusID == 3) {
            i.StatusID = 2
          }
        })
        this.APIUpdateReEval(['StatusID'], item.ListAppeal, 3)
      }
    }
  }

  selectChangeCH(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }

  //mở trang chi tiết chấm điểm
  onOpenDetailReEvaluate() {
    let changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code.includes('hriCompetency'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('hri010-evaluation-tranche') || f.Link.includes('hri010-evaluation-tranche'))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
          var detail1 = detail.LstChild.find(f => f.Code.includes('hri016-appeal-list') || f.Link.includes('hri016-appeal-list'))
          if (Ps_UtilObjectService.hasValue(detail1) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
            var detail2 = detail1.LstChild.find(f => f.Code.includes('hri017-re-evaluate') || f.Link.includes('hri017-re-evaluate'))
            if (Ps_UtilObjectService.hasValue(detail2)) {
              this.menuService.activeMenu(detail2)
            }
          }
        }
      }
    })
    this.arrUnsubscribe.push(changeModuleData_sst)
  }

  // mở trang chi tiết xem bài
  onOpenDetailExam(event: DTOExamAppeal) {
    const ParamQuize = {
      QuizSession: this.quizSession.Code,
      StaffID: event.Staff,
      Code: event.Code,
    }
    const ParamExam = {
      QuizSession: this.quizSession.Code,
      StaffID: event.Staff,
      Exam: event.Code,
    }
    this.sessionService.ExamSession$.next(ParamQuize)
    this.hriApiService.ChangeParamExam$.next(ParamQuize)
    localStorage.setItem("ExamSession", JSON.stringify(ParamExam))
    let changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code.includes('hriCompetency') || f.Link.includes('hr007-competency-bank'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('hri010-evaluation-tranche') || f.Link.includes('hri010-evaluation-tranche'))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
          var detail1 = detail.LstChild.find(f => f.Code.includes('hri016-appeal-list') || f.Link.includes('hri016-appeal-list'))
          if (Ps_UtilObjectService.hasValue(detail1) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
            var detail2 = detail1.LstChild.find(f => f.Code.includes('hri018-exam-appeal') || f.Link.includes('hri018-exam-appeal'))
            if (Ps_UtilObjectService.hasValue(detail2)) {
              this.menuService.activeMenu(detail2)
            }
          }
        }
      }
    })
    this.arrUnsubscribe.push(changeModuleData_sst)
  }

  onCompleted() {
    this.quizSession.SessionStatusID = 5
    this.APIUpdateQuizSession(this.quizSession, ['SessionStatusID'])
  }
  //end action

  ngOnDestroy(): void {
    this.arrUnsubscribe.map(s => {
      s?.unsubscribe();
    });
  }

  // end method

}
