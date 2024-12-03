import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { CompositeFilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PageChangeEvent, RowArgs, SelectableSettings, SelectionEvent } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOExamEssay } from '../../shared/dto/DTOExamEssay.dto';
import { HriExamApiService } from '../../shared/services/hri-exam-api.service';
import { HriQuizSessionsAPIService } from '../../shared/services/hri-quiz-session-api.service';
import { DTOQuizStaffRole } from '../../shared/dto/DTOQuizStaffRole.dto';
import { HriQuizSessionService } from '../../shared/services/hri-quiz-session.service';
import { DTOQuizSession } from '../../shared/dto/DTOQuizSession.dto';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
// import { parseNumber } from '@progress/kendo-angular-dropdowns/common/util';
import { EnumDialogType } from 'src/app/p-app/p-layout/enum/EnumDialogType';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DTOExamQuestion } from 'src/app/p-app/p-portal/shared/dto/DTOExamQuestion.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOQuestion } from '../../shared/dto/DTOQuestion.dto';
import { distinct, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-hri012-quiz-marking',
  templateUrl: './hri012-quiz-marking.component.html',
  styleUrls: ['./hri012-quiz-marking.component.scss']
})
export class Hri012QuizMarkingComponent{
  @ViewChild("dropdownlist", { static: true }) public dropdownlist: any;
  //#region variable status
  changeView: boolean = false;
  isAllowChooseQuizRole = false;
  //#endregion
  searchExamQuestion: string = '';
  searchExamAnswer: string = '';
  QuizSesion : any;
  Questiton: DTOQuestion;
  QuestionHTML: any;
  RefAnswerHTML: any

  ExamSesion: any;
  //#region variable Permission
  isToanQuyen = false;
  isAllowedToCreate = false;
  isAllowedToVerify = false;
  isAllowedType1 = false;
  actionPerm: DTOActionPermission[] = []
  //#endregion

  //#region variable Grid
  dialogOpen = false
  update = EnumDialogType.Update
  loading = false
  toggleShowView = false;
  total = 0
  pageSize = 50
  pageSizeAnswer = 50
  pageSizes = [25, 50, 75, 100];

  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback:Function
  onSortChangeCallback: Function
  onPageChangeCallback: Function
  onPageChangeCallbackAnswer: Function
  
  gridView = new Subject<any>();
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  sortBy: SortDescriptor[] = [{
    field: 'StatusID',
    dir: 'asc'
  }]
  selectable: SelectableSettings = {
    enabled: true,
    mode:'multiple',
    drag: false,
    checkboxOnly: false,
  };
  //#endregion

  //#region variable Filters
  isFilterActive = true;
  listItemDropdown: any[]
  lastItemDropdown: any[]
  //#endregion 

  //#region variable Dropdown
  allowActionDropdown = []
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  
  //#endregion

  //#region variable Subscription
  arrUnsubscribe: Subscription[] = [];
  Unsubscribe = new Subject<void>
  //#endregion
  
  //#region variable DTOExamEssay
  ListQuizEssayQuestion: DTOExamEssay[] = [];
  ListExamEssayQuestion: DTOExamEssay[] = [];
 
  ListStaffGradingEssayQuestions: DTOQuizStaffRole[] = [];
  TempListQuizEssayQuestion: any;
  //#endregion

  //#region variable Color
  
  //#endregion

  FilterQuizEssay: State = {
    skip: null,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  };

  FilterItemQuizEssay = {
    field: 'QuizSession',
    operator: 'eq',
    value: null,
    ignoreCase: true,
  };


  FilterExamEssay: State = {
    filter: { filters: [], logic: 'and' },
  };

  FilterQuizRole: State = {
    skip: null,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }

  FilterItemTypeQuizRole = {
    field: 'TypeData',
    operator: 'eq',
    value: 3,
    ignoreCase: true,
  };

  public mySelection: string[] = [];

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    private examApiService: HriExamApiService,
    private sessionsAPIService: HriQuizSessionsAPIService,
    private quizSessionService: HriQuizSessionService,
    public sanitizer: DomSanitizer
  ) { 
  
  }

  
  ngOnInit(): void {
    let that = this;

      this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res)) {
          this.quizSessionService.GetCacheQuizSession().pipe(takeUntil(this.Unsubscribe)).subscribe((v:DTOQuizSession) => {
            if(Ps_UtilObjectService.hasValue(v)){
              this.QuizSesion = v
                this.reloadFilter()
                this.GetListQuizEssayQuestion(this.FilterQuizEssay);
            }
            var allowRole = this.QuizSesion.ListOfUserRole.findIndex(s => s.TypeData == 1)
            if(allowRole !== -1){
              this.isAllowedType1 = true;
            } else this.isAllowedType1 = false;
          })
        }
      })

    this.onSortChangeCallback = this.onSortChange.bind(this);
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this);
    this.getActionDropdownCallback = this.getActionDropdown.bind(this);
    this.onPageChangeCallback = this.pageChange.bind(this);
    this.onPageChangeCallbackAnswer = this.pageChangeAnswer.bind(this);

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    // this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    // this.loading = false  
  }
  
  ngAfterViewInit(): void {
    
  }

  closeDialog() {
    this.dialogOpen = false;
    this.listItemDropdown = []
    this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
    this.GetListQuizEssayQuestion(this.FilterQuizEssay)
    // this.refRole.writeValue(this.ListStaffGradingEssayQuestions);
  }

  getSelectionPopup(selectedList: DTOExamEssay[]){
   this.isFilterActive = !this.isFilterActive
   this.listItemDropdown = []
    if(Ps_UtilObjectService.hasValue(selectedList)){
      this.listItemDropdown = selectedList
    }
  }

  //Hủy sự kiện click vào dropdown để không bị ảnh hưởng select của grid
  onDropDownClick(event: MouseEvent): void {
    event.stopPropagation();
  }
  

 
  selectionQuizRoleChange(dataEvent: any, dataItem: any ){
    var allowRole = this.QuizSesion.ListOfUserRole.findIndex(s => s.TypeData == 1)
    if(allowRole !== -1){
      dataItem.EvaluatedBy = dataEvent.Code
      if(!Ps_UtilObjectService.hasListValue(this.listItemDropdown) && Ps_UtilObjectService.hasValue(dataItem) ){
          this.UpdateExamEssayQuestion([dataItem], 2);
      }
      else if(Ps_UtilObjectService.hasListValue(this.listItemDropdown) && this.listItemDropdown.length == 1){
          this.UpdateExamEssayQuestion([dataItem], 2);
      }
      else if(Ps_UtilObjectService.hasListValue(this.listItemDropdown) && this.listItemDropdown.length > 1){
        this.listItemDropdown.forEach(s => {
          s.EvaluatedBy = dataEvent.Code
        })
        this.dialogOpen = true
        this.lastItemDropdown = [dataItem]
      }
    }

  }
  
   updateManyItem() {
    if(Ps_UtilObjectService.hasListValue(this.listItemDropdown) && this.listItemDropdown.length > 1){
      this.UpdateExamEssayQuestion(this.listItemDropdown, 2);
    }
  }

  updateOneItem(){
    if(Ps_UtilObjectService.hasListValue(this.lastItemDropdown)){
      this.UpdateExamEssayQuestion(this.lastItemDropdown, 2);
    }
  }

 
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }


  //Grid
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take;
    //
  }
  onSortChange(e: SortDescriptor[]) {
    this.gridState.sort = e;
  }
  //#region Filters
  getData() {
    this.loadFilter();
    this.GetListQuizEssayQuestion(this.FilterQuizEssay);
    this.toggleShowView = false;
  }
  loadFilter() {
    this.FilterQuizEssay.filter.filters = [];
    this.pageSizes = [...this.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.sort = this.sortBy
    this.gridState.filter.filters = []
    this.gridState.skip = null
    var filterSearch: CompositeFilterDescriptor = {
      logic: "or",
      filters: []
    }
    var x = {
      field: 'QuizSession',
      operator: 'eq',
      value: this.QuizSesion.Code,
      ignoreCase: true,
    };
    this.FilterQuizEssay.filter.filters.push(x)
    
    
    if(Ps_UtilObjectService.hasListValue(this.searchExamQuestion)){
      var a = {
        field: 'Remark',
        operator: 'contains',
        value: this.searchExamQuestion,
        ignoreCase: true,
      };
    var b = {
      field: 'EvaluatedByName',
      operator: 'contains',
      value: this.searchExamQuestion,
      ignoreCase: true,
    };

      var c = {
        field: 'Question',
        operator: 'contains',
        value: (this.searchExamQuestion),
        ignoreCase: true,
      };
      filterSearch.filters.push(a,b,c)
      this.FilterQuizEssay.filter.filters.push(filterSearch);
    }
  }

  //#endregion


  // navigate
  // openDetail() {
  //   let changeModuleData = this.menuService
  //     .changeModuleData()
  //     .subscribe((item: ModuleDataItem) => {
  //       var parent = item.ListMenu.find(
  //         (f) =>
  //           f.Code.includes('hriCompetency') ||
  //           f.Link.includes('hr007-competency-bank')
  //       );

  //         if (
  //           Ps_UtilObjectService.hasValue(parent) &&
  //           Ps_UtilObjectService.hasListValue(parent.LstChild)
  //         ) {
  //           var detail = parent.LstChild.find(
  //             (f) =>
  //               f.Code.includes('hri010-evaluation-tranche') ||
  //               f.Link.includes('hri010-evaluation-tranche')
  //           );
  //             console.log(detail);
  //           if (
  //             Ps_UtilObjectService.hasValue(detail) &&
  //             Ps_UtilObjectService.hasListValue(detail.LstChild)
  //           ) {
  //             var detail1 = detail.LstChild.find(
  //               (f) =>
  //                 f.Code.includes('hri012-quiz-marking') ||
  //                 f.Link.includes('hri012-quiz-marking')
  //             );
  //             console.log(detail1);
  //             this.menuService.activeMenu(detail1);
  //           }
  //         }
  //       }
  //     );
  //   this.arrUnsubscribe.push(changeModuleData);
  // }

  //#region Dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    // Xóa các mục cũ trong mảng moreActionDropdown
    moreActionDropdown.length = 0;
    var allowRole = this.QuizSesion.ListOfUserRole.find(s => (s.TypeData == 3 || s.TypeData == 1) && s.Code == dataItem.EvaluatedBy);
    if (Ps_UtilObjectService.hasValue(allowRole) && this.QuizSesion.SessionStatusID == 2) {
      moreActionDropdown.push(
        { Name: "Chấm bài", Code: "pencil", Type: 'edit', Actived: true }
      );
    }
    return moreActionDropdown;
  }

  onActionDropdownClick(menu: MenuDataItem, item: any) {
    this.ExamSesion = item;
    // quyền trưởng ban hoặc người chấm bài
    var allowRole = this.QuizSesion.ListOfUserRole.findIndex(s => (s.TypeData == 3 || s.TypeData == 1) && s.Code == item.EvaluatedBy)
    if(allowRole !== -1 &&(menu.Code == "pencil" || menu.Type == "edit")) {
      this.FilterExamEssay.filter.filters = []
      this.FilterExamEssay.take= this.pageSizeAnswer
      let QuestionIDItemExamEssayQuestion = {
        field: 'QuestionID',
        operator: 'eq',
        value: item.QuestionID,
        ignoreCase: true,
      };
      let QuizSessionItemExamEssayQuestion = {
        field: 'QuizSession',
        operator: 'eq',
        value: item.QuizSession,
        ignoreCase: true,
      };
      this.FilterExamEssay.filter.filters.push(QuestionIDItemExamEssayQuestion,QuizSessionItemExamEssayQuestion);
      this.toggleShowView = true;

      
      // for (let i = 0; i < this.TempListQuizEssayQuestion.length; i++) {
      //   const element = this.TempListQuizEssayQuestion[i];
      //   if(this.ExamEssay.QuestionID == element.QuestionID && this.ExamEssay.EvaluatedBy !==  element.EvaluatedBy ){
      //     this.UpdateExamEssayQuestion([this.ExamEssay], 0);
      //     break;
      //   }
      // }
      
      this.GetListExamEssayQuestion(this.FilterExamEssay);
    } else {
      this.layoutService.onError("Bạn không có quyền chấm câu hỏi tự luận này!", this.layoutService.typingDelay);
    }
  }

  reloadFilter(){
    this.FilterItemQuizEssay.value = this.QuizSesion.Code;
    this.FilterQuizEssay.filter.filters.push(this.FilterItemQuizEssay);
    this.FilterQuizRole.filter.filters.push(this.FilterItemQuizEssay,this.FilterItemTypeQuizRole);
  }

  

  handleSearchQuizQuestion(data:any){
    this.searchExamQuestion = data;
    this.loadFilter();
    this.GetListQuizEssayQuestion(this.FilterQuizEssay);
  }

  handleSearchExam(data: any){
    this.FilterExamEssay.filter.filters = []
    this.FilterExamEssay.take = this.pageSizeAnswer
    var filterSearch: CompositeFilterDescriptor = {
      logic: "or",
      filters: []
    }
      let QuestionIDItemExamEssayQuestion = {
        field: 'QuestionID',
        operator: 'eq',
        value: this.ExamSesion.QuestionID,
        ignoreCase: true,
      };
      let QuizSessionItemExamEssayQuestion = {
        field: 'QuizSession',
        operator: 'eq',
        value: this.ExamSesion.QuizSession,
        ignoreCase: true,
      };
      this.FilterExamEssay.filter.filters.push(QuestionIDItemExamEssayQuestion,QuizSessionItemExamEssayQuestion);
      if(Ps_UtilObjectService.hasValueString(data)){
        var a = {
          field: 'Answer',
          operator: 'contains',
          value: data,
          ignoreCase: true,
        };
        // var b = {
        //   field: 'StaffName',
        //   operator: 'contains',
        //   value: data,
        //   ignoreCase: true,
        // };
        // var c = {
        //   field: 'RefAnswer',
        //   operator: 'eq',
        //   value: (data),
        //   ignoreCase: true,
        // };
        filterSearch.filters.push(a)
        this.FilterExamEssay.filter.filters.push(filterSearch);
      }
      this.GetListExamEssayQuestion(this.FilterExamEssay);
  }

  
  


  
  //#endregion

  goBackListQuestion(){
    this.toggleShowView = false;
    this.GetListQuizEssayQuestion(this.FilterQuizEssay);
  }

  //#region input
  onBlurAnswer(dataEvent:any, item: any){
    if(Ps_UtilObjectService.hasValue(this.ExamSesion)){
      item.EvaluatedBy = this.ExamSesion.EvaluatedBy
      this.UpdateExamEssayQuestion([item],0)
    }
  }
  //#endregion

  //#region Html 
  // function xóa bỏ thẻ html của string
  removeHtmlTags(input: string): string {
    const div = document.createElement('div');
    div.innerHTML = input;
    return div.textContent || div.innerText || '';
  }
  //#endregion

  //#region api exam
  pageChangeAnswer(event: PageChangeEvent) {
    this.FilterExamEssay.skip = event.skip;
    this.FilterExamEssay.take = this.pageSizeAnswer = event.take;
    //
  }

  // API GetListQuizEssayQuestion#
  GetListQuizEssayQuestion(filter: State) {
    this.loading = true;
     this.examApiService
      .GetListQuizEssayQuestion(filter).pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi trắc nghiệm: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.ListQuizEssayQuestion = res.ObjectReturn.Data;
            if(Ps_UtilObjectService.hasListValue(this.ListQuizEssayQuestion)){
              this.GetListQuizRole(this.FilterQuizRole);
            }
            var allowRole = this.QuizSesion.ListOfUserRole.findIndex(s => s.TypeData == 1) 
            // kiểm tra xem người đang truy cập có phải là trưởng ban hay không.
            if(allowRole !== -1){
              this.isAllowChooseQuizRole = true;
            } else{
              this.isAllowChooseQuizRole = false;
            }
          }
          this.loading = false;
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi trắc nghiệm: ${error}`);
          this.loading = false;
        }
      );
    
  }

  // API GetListExamEssayQuestion#
  GetListExamEssayQuestion(filter: State) {
    this.loading = true;
     this.examApiService
      .GetListExamEssayQuestion(filter).pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi tự luận: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.ListExamEssayQuestion = res.ObjectReturn.Data;
            this.Questiton = res.ObjectReturn.Data[0]
            this.QuestionHTML = this.sanitizer.bypassSecurityTrustHtml(res.ObjectReturn.Data[0].Question)
            this.RefAnswerHTML = this.sanitizer.bypassSecurityTrustHtml(res.ObjectReturn.Data[0].RefAnswer)
          }
          this.loading = false;
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi tự luận: ${error}`);
          this.loading = false;
        }
      );
  }

  UpdateExamEssayQuestion(dto: DTOExamQuestion[], type: number) {
    this.loading = true;
    this.examApiService
      .UpdateExamEssayQuestion(dto).pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật câu hỏi tự luận: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            // this.ExamEssay = res.ObjectReturn[0];
            // console.log(this.ExamEssay)
            // for (let i = 0; i  < this.ListQuizEssayQuestion.length; i++) {
            //   if(this.ListQuizEssayQuestion[i].QuestionID == this.ExamEssay.QuestionID){
            //     this.ListQuizEssayQuestion[i] = this.ExamEssay;
            //     break;
            //   }
            // }
              this.TempListQuizEssayQuestion = JSON.parse(JSON.stringify(this.ListQuizEssayQuestion));

              if(type == 2){
                this.layoutService.onSuccess('Cập nhật nhân sự chấm bài cho câu hỏi thành công');
                this.dialogOpen = false;
                this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
                this.GetListQuizEssayQuestion(this.FilterQuizEssay);
                this.listItemDropdown = []
              }
              // else if(type == 1){
              //   this.layoutService.onSuccess('Cập nhật nhân sự chấm bài cho câu hỏi thành công');
              //   this.dialogOpen = false;
              //   this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
              //   this.GetListQuizEssayQuestion(this.FilterQuizEssay);
              // }
              else{
                this.GetListQuizEssayQuestion(this.FilterQuizEssay);
                this.layoutService.onSuccess('Cập nhật câu trả lời thành công');
              }
              
          }
          this.loading = false;
        },
        (error) => {
          this.GetListQuizEssayQuestion(this.FilterQuizEssay);
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật câu hỏi tự luận: ${error}`);
          this.loading = false;
        }
      );
  }


  //#endregion

  // api sessionsAPIService

  // Api GetListQuizRole#
  GetListQuizRole(filter: State) {
    this.TempListQuizEssayQuestion = JSON.parse(JSON.stringify(this.ListQuizEssayQuestion));
    this.loading = true;
    this.sessionsAPIService
      .GetListQuizRole(filter).pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân sự chấm bài: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            const allowRole = this.QuizSesion.ListOfUserRole.find(s => s.TypeData == 1)
            this.ListStaffGradingEssayQuestions = res.ObjectReturn.Data
            const hasLeadOfEvaluation =  this.ListStaffGradingEssayQuestions.find(s => s.StaffID == allowRole.StaffID)
            if(Ps_UtilObjectService.hasValue(allowRole) && !Ps_UtilObjectService.hasValue(hasLeadOfEvaluation)){
                this.ListStaffGradingEssayQuestions.unshift(allowRole)
            }


            this.ListQuizEssayQuestion.forEach(s => {
              if(!Ps_UtilObjectService.hasValue(s.EvaluatedBy)){
                s.EvaluatedBy = this.ListStaffGradingEssayQuestions[0].Code
              }
            })


            // for (let i = 0; i < this.ListQuizEssayQuestion.length; i++) {
            //   // kiểm tra nếu EvaluatedBy == null thì setDefault là nhận sự chấm bài đầu tiền trong mảng ListStaffGradingEssayQuestions
            //   if(this.ListQuizEssayQuestion[i].EvaluatedBy == null){ 
            //     this.ListQuizEssayQuestion[i].EvaluatedBy = this.ListStaffGradingEssayQuestions[0].Code;
            //   }

            //   // kiểm tra nếu EvaluatedBy != null nhưng EvaluatedBy của [i] không tồn tại thì set lại giá trị mới là nhận sự chấm bài đầu tiền trong mảng ListStaffGradingEssayQuestions
            //   if (this.ListQuizEssayQuestion[i].EvaluatedBy != null) {
            //     const isEvaluatedByExists = this.ListStaffGradingEssayQuestions.some(item =>
            //       item.Code === this.ListQuizEssayQuestion[i].EvaluatedBy
            //     );
            //     console.log(isEvaluatedByExists)
              
            //     if (!isEvaluatedByExists && this.ListStaffGradingEssayQuestions.length > 0) {
            //       this.ListQuizEssayQuestion[i].EvaluatedBy = this.ListStaffGradingEssayQuestions[0].Code;
            //     }
            //   }
            // }
          }
          this.loading = false;
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân sự chấm bài: ${error}`);
          this.loading = false;
        }
      );
    
  }

  //#endregion

  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}

