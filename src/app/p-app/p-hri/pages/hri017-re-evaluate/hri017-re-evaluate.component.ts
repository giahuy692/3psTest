import { Component, OnInit } from '@angular/core';
import { DTOQuestion } from '../../shared/dto/DTOQuestion.dto';
import { DTOAnswer } from '../../shared/dto/DTOAnswer.dto';
import { DTOStaff, Ps_AuthService, Ps_UtilObjectService } from 'src/app/p-lib';
import { QuestionGroupAPIService } from '../../shared/services/question-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { takeUntil } from 'rxjs/operators';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  SortDescriptor,
  State,
} from '@progress/kendo-data-query';
import { StaffApiService } from '../../shared/services/staff-api.service';
import { DTOListHR } from '../../shared/dto/DTOPersonalInfo.dto';
import { Subject } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { HriAppealApiService } from '../../shared/services/hri-appeal-api.service';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { DTOReEval } from '../../shared/dto/DTOReEval.dto';
import { DTOQuestionAppeal } from '../../shared/dto/DTOAppeal.dto';
import { HriQuizSessionService } from '../../shared/services/hri-quiz-session.service';
import { DTOQuizSession } from '../../shared/dto/DTOQuizSession.dto';

class DTOResetingMarkAppeal {
  QuizSession: number = 0;
  Question: number = 0;
  TypeOfMultipleReEval: number = 3;
  ListMark: DTOAnswer[]
}
@Component({
  selector: 'app-hri017-re-evaluate',
  templateUrl: './hri017-re-evaluate.component.html',
  styleUrls: ['./hri017-re-evaluate.component.scss'],
})

export class Hri017ReEvaluateComponent {
  
  onActionDropdownClickCallback: Function;
  getActionDropdownCallback: Function;
  onSortChangeCallback: Function;
  loading: boolean = false;
  openDialogMarking: boolean = false;
  openDialogStatus: boolean = false;
  openDialogGoBack: boolean = false;

  isExpanded:boolean = true;
  isGridHasRequest:boolean = true;
  isReseting:boolean = false;
  isEditMark:boolean = false;
  isReplyAll:boolean = false;
  isLockAll:boolean = false;
  isFinalMark: number = 0
  ngUnsubscribe$ = new Subject<void>();

  isHiddenScore = false;

  question = new DTOQuestion();
  questionAppeal = new DTOResetingMarkAppeal();
  listAnswer: DTOAnswer[] = [];
  listAppealInQuestion: DTOReEval[] = [];
  appealInQuestion = new DTOReEval();
  quizSessionInfo: DTOQuizSession = new DTOQuizSession();
  InfoUser: DTOStaff = new DTOStaff();

  listHR: DTOListHR[] = [];
  currentListHR = new DTOListHR();
  total = 0;
  pageSize = 25;
  pageSizes = [this.pageSize];

  gridView = new Subject<any>();
  //fillter
  filterName: FilterDescriptor = {
    field: 'Fullname',
    operator: 'contains',
    value: null,
  };
  filterDepartment: FilterDescriptor = {
    field: 'DepartmentName',
    operator: 'contains',
    value: null,
  };

  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  };
  sort: SortDescriptor = { field: 'Code', dir: 'desc' }
  RefQuestionState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [this.sort]
  };

  constructor(
    private serviceQuestionApi: QuestionGroupAPIService,
    private layoutService: LayoutService,
    private apiServiceStaff: StaffApiService,
    public menuService: PS_HelperMenuService,
    private hriAppealApi: HriAppealApiService,
    private sessionService: HriQuizSessionService,
    public auth: Ps_AuthService
  ) {}

  ngOnInit() {
    this.onSortChangeCallback = this.onSortChange.bind(this);

    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.onLoadFilter();
        this.onGetLocalStorage();
			}
		})
  }

  onGetLocalStorage() {
    // lấy cache question appeal
    const questionCache = JSON.parse(localStorage.getItem('QuestionAppeal'));
    
    if (Ps_UtilObjectService.hasValue(questionCache)) {
      this.questionAppeal.QuizSession =  questionCache.QuizSession;
      this.questionAppeal.Question = questionCache.Code;
      this.auth.getCacheUserInfo().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((v: DTOStaff) => {
        this.InfoUser = v;
        this.isLockAll = questionCache.ListAppeal[0].EvaluatedBy !== this.InfoUser.staffID || Ps_UtilObjectService.hasListValue(this.listAppealInQuestion) && this.listAppealInQuestion.every(item => item.StatusID === 3);
      })
      if (
        Ps_UtilObjectService.hasValue(questionCache.Code) &&
        questionCache.Code > 0
      ) {
        this.APIGetQuestion(questionCache);
        this.APIGetListHR(15);
        // if (questionCache.TypeOfQuestion !== 3) {
        //   this.isHiddenScore = true;
        // }
      }
    } else {
      this.layoutService.onError('Lỗi lấy thông tin từ cache!');
    }


    // this.isEditMark = false;
    // this.isReseting = false;
  }

  // Hàm xử lý cập nhật lý do tất sao thay đổi đáp án cho tất cả các thí sinh không tham giá phúc khảo
  onUpdateRepplyAll(prop: string[], ListReEval: DTOReEval[]) {
    var reEvalItem = new DTOReEval();
    ListReEval.forEach((s) => {
      if (Ps_UtilObjectService.hasValueString(this.appealInQuestion.Reply)) {
        s.Reply = this.appealInQuestion.Reply;
        reEvalItem = s;
      }
    });
    if (Ps_UtilObjectService.hasValue(reEvalItem) && Ps_UtilObjectService.hasValueString(reEvalItem.Reply)) {
      // if (Ps_UtilObjectService.hasValueString(reEvalItem.Reply)) {
        var itemTemp = {
          ...reEvalItem,
          ExamQuestionID: reEvalItem.Code,
          Mark: reEvalItem.NewMark,
          Code: reEvalItem.ReEvaluationID,
        };
        this.APIUpdateReEval(prop, [itemTemp], 'callAPI');
      // }
    }
  }

  // Hàm xử lý cập nhật cho các câu hỏi hoặc lý do phúc khảo
  onUpdateBlurTextbox(prop: string[], item: DTOReEval) {
    if (Ps_UtilObjectService.hasValueString(item.Reply) || Ps_UtilObjectService.hasValue(item.NewMark)) {
      var itemTemp = {
        ...item,
        ExamQuestionID: item.Code,
        Mark: item.NewMark,
        Code: item.ReEvaluationID,
        StatusID: 2
      };
      // console.log(itemTemp);
      prop.push('StatusID')
      this.APIUpdateReEval(prop, [itemTemp], 'noCallAPI');
    }
  }


  selectedItems: DTOAnswer[] = [];
  isItemDisabled(item) {
    var checkListAnswer = this.questionAppeal.ListMark.filter(
      (s) => !this.selectedItems.includes(s)
    );
    // const targetScoreSelect = this.selectedItems[0].Mark;
    var lastSelectItem = this.selectedItems[this.selectedItems.length - 1];
    var lastListItem = checkListAnswer[checkListAnswer.length - 1];

    // if(Ps_UtilObjectService.hasListValue(checkListAnswer)){
    //   var targetScoreList = checkListAnswer[0].Mark;
    // }
    if (this.question.TypeOfEvaluation == 2) {
      return item.Mark == 0 || item == lastSelectItem;
    } else if (this.question.TypeOfEvaluation == 3) {
      return item == lastListItem || item == lastSelectItem;
      // item.Mark > targetScoreSelect || item.Mark < targetScoreList ||
    }
  }

  
  
  //#region update mark
  tempMark: DTOAnswer = new DTOAnswer(); // trường dùng để lưu oject có có giá trị mark trước lúc user nhập điểm
  tempAnswer: DTOAnswer = new DTOAnswer(); // trường dùng để lưu giá cũ của câu hỏi
  oldListAnswer: DTOAnswer[] = [];
  lastItemIsRightCode: number = 0;
  lastItemNotRightCode: number = 0;

  calculateMark(value: DTOAnswer, typeAction: string) {
    if (typeAction === 'not') {
      this.oldListAnswer = JSON.parse(JSON.stringify(this.questionAppeal.ListMark));
    }
    const selectedItems = this.questionAppeal.ListMark.filter(
      (item) => item.IsRight && item.Answer !== ''
    ); // Lấy các đáp án đúng.
    const itemLastChecked = selectedItems[selectedItems.length - 1]; // Lấy item cuối cùng của đáp án đúng.
    this.lastItemIsRightCode = itemLastChecked?.Code; // Xác định item nào bị disable trong các đáp án đúng.
   
    const AnswerFalseList = this.questionAppeal.ListMark.filter(
      // Lấy item không được checked.
      (item) => item.IsRight === false
    );

    const itemNotCheckList = AnswerFalseList.slice(0,AnswerFalseList.length - 1); // Lấy các đáp án sai ở trước đáp án cuối cùng trong các đáp án sai

    const itemLastNotCheck = AnswerFalseList[AnswerFalseList.length - 1]; //Lấy item cuối cùng không được check.
    this.lastItemNotRightCode = itemLastNotCheck?.Code; // Xác định item nào bị disable trong các đáp án sai.

    selectedItems.forEach((v) => {
      // Chuyển điểm của các đáp án đúng về số dương.
      v.Mark = Math.abs(v.Mark);
    });

    if (this.question.TypeOfEvaluation == 3) {
      // chuyển điểm của các đáp án sai về số âm.
      this.questionAppeal.ListMark.forEach((v) => {
        if (v.IsRight == false && v.Mark > 0) {
          v.Mark = v.Mark * -1;
        }
      });
    }

    let arrUpdate = [];

    if (selectedItems.length < 1) {
      this.questionAppeal.ListMark.forEach((v) => {
        if (v.IsRight === false && v.Mark !== 0 && v.Answer !== '') {
          v.Mark = 0;
          arrUpdate.push(v);
        }
      });
    }


    // Nếu không phải trường hợp nhập input
    if (typeAction === 'not') {
      if (selectedItems.length === 1) {
        arrUpdate = this.onSingleSelectedItem(arrUpdate);
      } 
      else if (selectedItems.length > 1) {
        arrUpdate = this.onMultipleSelectedItems(arrUpdate, selectedItems);
      }

      if (this.question.TypeOfEvaluation == 1 || this.question.TypeOfEvaluation == 2) {
        this.questionAppeal.ListMark.forEach((v) => {
          if (v.IsRight === false && v.Mark !== 0) {
            v.Mark = 0;
            arrUpdate.push(v);
          }
        });
      }
    } 
    // Nếu là trường hợp nhập input
    else if (typeAction === 'input' && this.tempMark.Mark !== value.Mark) {
      arrUpdate = this.onInputValue(value, selectedItems);

      // Nếu là câu hỏi tính điểm loại 1 và 2 mà câu hỏi đó là câu hỏi sai thì rết lại điểm
      if (this.question.TypeOfEvaluation === 1 || this.question.TypeOfEvaluation === 2) {
        this.questionAppeal.ListMark.forEach((v) => {
          if (v.IsRight === false && v.Mark !== 0 && v.Answer !== '') {
            v.Mark = 0;
            arrUpdate.push(v);
          }
        });
      }

      // Nếu là cách tính điểm 3
      if (this.question.TypeOfEvaluation === 3) {
        let totalNotSelect = 0;
        for (let a = 0; a < itemNotCheckList.length; a++) {
          totalNotSelect = totalNotSelect + itemNotCheckList[a].Mark;
          arrUpdate.push(itemNotCheckList[a]);
        }
        itemLastNotCheck.Mark = (100 + totalNotSelect) * -1;
        if(itemLastNotCheck.Mark >= 0){
          arrUpdate = this.oldListAnswer;
          this.layoutService.onError(`Điểm bạn nhập vào cho ${value.Answer} không hợp lệ!`)
        } else {
          arrUpdate.push(itemLastNotCheck);
        }
      }
    }

    
    if(Ps_UtilObjectService.hasListValue(arrUpdate)){
      this.questionAppeal.ListMark.forEach(updateItem => {
        const existingItem = arrUpdate.find(item => item.Code === updateItem.Code);
  
        if (existingItem) {
          // Thực hiện thay thế các thuộc tính của existingItem bằng updateItem
          Object.assign(existingItem, updateItem);
        }
      });
    } else {
      this.questionAppeal.ListMark = this.oldListAnswer
    }
  }

  // Hàm tính điểm cho câu hỏi một lựa chọn 
  onSingleSelectedItem(arrUpdate: DTOAnswer[]) {
    let arrUpdateTemp = arrUpdate;

    this.questionAppeal.ListMark.forEach((answer) => {
      if (answer.IsRight === true) {
        answer.Mark = 100;
        arrUpdateTemp.push(answer);
      }
    });

    if (this.question.TypeOfEvaluation === 3) {
      arrUpdateTemp = this.onNegativeInputValue(arrUpdateTemp);
    }

    return arrUpdateTemp;
  }

  // Hàm tính điểm cho câu hỏi nhiêu lựa chọn
  onMultipleSelectedItems(arrUpdate: DTOAnswer[], selectedItems: DTOAnswer[]) {
    if (100 % selectedItems.length != 0) {
      arrUpdate = this.onNonEvenlyDivided(selectedItems, arrUpdate);
    } else if (100 % selectedItems.length == 0) {
      arrUpdate = this.onEvenlyDivided(selectedItems);
    }

    if (this.question.TypeOfEvaluation === 3) {
      arrUpdate = this.onNegativeInputValue(arrUpdate);
    }

    return arrUpdate;
  }

  // Hàm tính điểm cho trường hợp số lượng đáp án không chia hết cho 100 
  onNonEvenlyDivided(selectedItems: DTOAnswer[], arrUpdate: DTOAnswer[]) {
    let totalMark = 0;
    const arrNotLast = selectedItems.slice(0, selectedItems.length - 1);
    const itemLastChecked = selectedItems[selectedItems.length - 1];

    arrNotLast.forEach((item) => {
      item.Mark = Math.round(100 / selectedItems.length);
      totalMark = totalMark + item.Mark;
      arrUpdate.push(item);
    });

    itemLastChecked.Mark = 100 - totalMark;
    arrUpdate.push(itemLastChecked);

    return arrUpdate;
  }

  // Hàm tính điểm cho trường hợp số lượng đáp án chia hết cho 100 
  onEvenlyDivided(selectedItems: DTOAnswer[]) {
    let arrUpdate = [];
    for (let i = 0; i < selectedItems.length; i++) {
      selectedItems[i].Mark = Math.round(100 / selectedItems.length);
      arrUpdate.push(selectedItems[i]);
    }
    return arrUpdate;
  }

  // Hàm tính điểm cho trường hợp câu trả lời đó nhập trừ input
  onInputValue(value: DTOAnswer, selectedItems: DTOAnswer[]) {
    let arrUpdate = [];
    let totalMark = 0;

    // Sao chép mảng
    let tempListSelectedItem = JSON.parse(JSON.stringify(this.oldListAnswer.filter(v => v.IsRight == true)))

    // Tìm ra nhưng câu đàu tiên được checked
    const arrNotLast = selectedItems.slice(0, selectedItems.length - 1);

    // Tìm ra đáp án cuối cùng được checkes
    const itemLastChecked = selectedItems[selectedItems.length - 1];

    // Tìm ra những đáp án sai
    const arrNotSelectedItems = this.questionAppeal.ListMark.filter(
      (item) => item.IsRight === false && item.Answer !== ''
    );

    arrNotSelectedItems.forEach((item) => {
      if (item.Mark > 0) {
        item.Mark = -item.Mark;
      }
    });

    arrNotLast.forEach((item) => {
      totalMark = totalMark + item.Mark;
      arrUpdate.push(item);
    });

    itemLastChecked.Mark = 100 - totalMark;
    if(itemLastChecked.Mark <= 0){
      arrUpdate = tempListSelectedItem
      this.layoutService.onError(`Điểm bạn nhập vào cho câu trả lời: ${value.Answer} không hợp lệ!`)
    } else {
      arrUpdate.push(itemLastChecked);
    }
    return arrUpdate;
  }

  // Tính điểm cho những đấp án trong trường hợp trừ đáp án sai
  onNegativeInputValue(arrUpdate: DTOAnswer[]) {
    let totalNotSelect = 0;
    const arrNotSelectedItems = this.questionAppeal.ListMark.filter(
      (item) => item.IsRight === false && item.Answer !== ''
    );

    if (arrNotSelectedItems.length !== 0) {
      for (let i = 0; i < arrNotSelectedItems.length - 1; i++) {
        arrNotSelectedItems[i].Mark = -Math.round(
          100 / arrNotSelectedItems.length
        );
        totalNotSelect = totalNotSelect - arrNotSelectedItems[i].Mark;
        arrUpdate.push(arrNotSelectedItems[i]);
      }

      arrNotSelectedItems[arrNotSelectedItems.length - 1].Mark =
        -100 + totalNotSelect;
      arrUpdate.push(arrNotSelectedItems[arrNotSelectedItems.length - 1]);
    }
    return arrUpdate;
  }
  
  onFocusMark(value: DTOAnswer) {
    this.tempMark = { ...value };
    this.oldListAnswer = JSON.parse(JSON.stringify(this.questionAppeal.ListMark));
  }

  // Hàm xử lý update điểm cho câu hỏi nhiều lựa chọn 
  onMarkMutiple(value: DTOResetingMarkAppeal){
    // Nếu là  Thiết lập tính lại điểm: Điểm không thay đổi -> thì chấm điểm luôn
    if(this.questionAppeal.TypeOfMultipleReEval == 3){
      this.APIUpdateMarkMultipleReEval(value);
    }
    // Nếu là  Thiết lập tính lại điểm: Được trọn điểm câu hỏi hoặc Tính lại điểm theo thiết lập đáp án
    // -> Kiểm tra xem đã chọn đáp án đúng và điền lý do chọn đáp án chưa
    else {
      if(!value.ListMark.find(item => item.IsRight === true)){
        this.openDialogMarking = false;
        return this.layoutService.onWarning('Vui lòng chọn một đáp án đúng!'); 
      } 
      let allHaveRemark = value.ListMark.filter(v => v.IsRight == true).every(item => Ps_UtilObjectService.hasValueString(item.Remark));
      if(!allHaveRemark){
        this.openDialogMarking = false;
        return this.layoutService.onWarning('Vui lòng nhập lý do chọn câu trả lời!');
      } 
      this.APIUpdateMarkMultipleReEval(value);
    }
  }

  //#endregion

  // Hàm xử lý khi người dùng chọn đáp án 
  onChecked(event: any, item: DTOAnswer) {
    if(this.question.TypeOfQuestion === 2){
      this.calculateMark(item, 'not');
    } else {
      // Duyệt qua mảng và cập nhật giá trị IsRight của các phần tử khác
      this.questionAppeal.ListMark.forEach(markItem => {
        if (markItem.Code !== item.Code) {
            markItem.IsRight = false;
        } else {
          markItem.IsRight = event.target.checked;
          markItem.Mark = 100;
        }
      });
    }
  }

  // Hiện Dialog
  onShowDialog(name: string) {
    if (name == 'marking') this.openDialogMarking = true;
    else if (name == 'status') this.openDialogStatus = true;
  }


  // Đóng dialog
  onCloseDialog() {
    this.openDialogMarking = false;
    this.openDialogStatus = false;
    this.openDialogGoBack = false;
  }

  
  sortBy: SortDescriptor[] = [
    {
      field: 'StatusID',
      dir: 'asc',
    },
  ];


  // Xử lý sắp xếp 
  onSortChange(e: SortDescriptor[]) {
    this.gridState.sort = e;
    this.APIGetListAppealInQuestion(this.gridState);
  }


  // Load dữ liệu theo filter 
  onLoadData() {
    this.APIGetListAppealInQuestion(this.gridState);
    this.APIGetQuestion(this.question)
  }

  // Hàm load filter
  onLoadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    const questionCache = JSON.parse(localStorage.getItem('QuestionAppeal'));
    if (Ps_UtilObjectService.hasValue(questionCache)) {
      if (
        Ps_UtilObjectService.hasValue(questionCache.Code) &&
        questionCache.Code > 0
      ) {
        this.gridState.filter.filters.push(
          {
            field: 'QuizSession',
            operator: 'eq',
            value: questionCache.QuizSession,
          },
          { field: 'Question', operator: 'eq', value: questionCache.Code }
        );
      }
    }

    if (this.isGridHasRequest) {
      this.gridState.filter.filters.push({
        field: 'HasAppeal',
        operator: 'eq',
        value: true,
      });
    } else {
      this.gridState.filter.filters.push({
        field: 'HasAppeal',
        operator: 'eq',
        value: false,
      });
    }
    let filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] };

    if (Ps_UtilObjectService.hasValueString(this.filterName.value))
      filterSearch.filters.push(this.filterName);

    if (Ps_UtilObjectService.hasValueString(this.filterDepartment.value))
      filterSearch.filters.push(this.filterDepartment);

    if (filterSearch.filters.length > 0) {
      this.gridState.filter.filters.push(filterSearch);
    }
  }

  // Xử lý tìm kiếm 
  onSearch(event: any) {
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.filterName.value = event;
      this.filterDepartment.value = event;
    } else {
      this.filterName.value = null;
      this.filterDepartment.value = null;
    }
    this.onLoadFilter();
    this.APIGetListAppealInQuestion(this.gridState);
  }

  // Xử lý data khi chuyển trang trong danh sách
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take;
    this.APIGetListAppealInQuestion(this.gridState);
  }

  // Xử lý mở chi tiết hoặc thu gọn thông tin
  onToggleContent() {
    this.isExpanded = !this.isExpanded;
  }

  // Xử lý chuyển danh sách nhân sự yêu cầu phúc khảo và nhân sự không yêu cầu phúc khảo
  onToggleGrid(bool: boolean) {
    this.isGridHasRequest = bool;
    this.onLoadFilter();
    this.APIGetListAppealInQuestion(this.gridState);
  }

  // Xử lý khi thay đổi giá trị trong dropdown
  TypeOfMultipleReEvalName: string = ''
  onDropdownlistClick(e) {
    this.questionAppeal.TypeOfMultipleReEval = e;
    this.TypeOfMultipleReEvalName = this.listHR.find(v => v.OrderBy == this.questionAppeal.TypeOfMultipleReEval).ListName
    this.questionAppeal.ListMark = JSON.parse(JSON.stringify(this.listAnswer));
  }

  // Xử lý mở chi tiết câu hỏi
  toggleQuestionDetail(item: any) {
    if (item['ShowQuestion'] == true) item['ShowQuestion'] = false;
    else item['ShowQuestion'] = true;
  }

  rowCallback = ({ dataItem }) => {
    var item = <any>dataItem;
    return {
      showCombo: item['ShowQuestion'] == true,
    };
  };

  // Loại bỏ các thẻ HTML khỏi chuỗi đầu vào.
  removeHtmlTags(input: string): string {
    const div = document.createElement('div');
    div.innerHTML = input;
    return div.textContent || div.innerText || '';
  }

  // Hàm quay lại trường danh sách
  onGoBackList() {
    this.menuService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(
        (f) =>
          f.Code.includes('hriCompetency') || f.Link.includes('hriCompetency')
      );

      if (
        Ps_UtilObjectService.hasValue(parent) &&
        Ps_UtilObjectService.hasListValue(parent.LstChild)
      ) {
        var detail = parent.LstChild.find(
          (f) =>
            f.Code.includes('evaluation-tranche') ||
            f.Link.includes('evaluation-tranche')
        );
        if (
          Ps_UtilObjectService.hasValue(parent) &&
          Ps_UtilObjectService.hasListValue(parent.LstChild)
        ) {
          var detail1 = detail.LstChild.find(
            (f) =>
              f.Code.includes('appeal-list') || f.Link.includes('appeal-list')
          );
        }
      }
      this.menuService.activeMenu(detail1);
    });
  }

  onNavigate(){
    var hasClose = this.listAppealInQuestion.every(item => item.StatusID === 3);
    if(this.questionAppeal.TypeOfMultipleReEval == 3 || hasClose){
      this.onGoBackList()
    } else {
      this.openDialogGoBack = true;
    }
  }
  
  // Hàm xử lý cập nhật tình trạng 
  onUpdateStatus(prop: string[]) {
    var arrayItem = [];
    arrayItem.length = 0
    if(this.questionAppeal.TypeOfMultipleReEval !== 3){
      if(!this.questionAppeal.ListMark.find(item => item.IsRight === true)){
        this.openDialogStatus = false;
        return this.layoutService.onWarning('Vui lòng chọn một đáp án đúng!'); 
      } 
      let allHaveRemark = this.questionAppeal.ListMark.filter(v => v.IsRight == true).every(item => Ps_UtilObjectService.hasValueString(item.Remark));
      if(!allHaveRemark){
        this.openDialogStatus = false;
        return this.layoutService.onWarning('Vui lòng nhập lý do chọn câu trả lời!');
      } 
    }

    if(this.question.StatusID !== 3) {
      this.openDialogStatus = false;
      return this.layoutService.onWarning(`Vui lòng chấm điểm câu hỏi này!`, 3000);
    }
    this.listAppealInQuestion.forEach((s) => {
      if ( this.question.TypeOfQuestion == 3 && Ps_UtilObjectService.hasValue(s.NewMark) &&
        Ps_UtilObjectService.hasValueString(s.Reply) || this.question.TypeOfQuestion != 3 && Ps_UtilObjectService.hasValueString(s.Reply)
      ) {
        var b = {
          ...s,
          StatusID: 3,
          ExamQuestionID: s.Code,
          Code: s.ReEvaluationID,
        };
        arrayItem.push(b);
      } else {
        return this.layoutService.onWarning( 'Bạn chưa phản hồi cho yêu cầu của nhân sự: ' +
            s.Fullname + ' có mã ' + s.StaffID );
      }
    });
    if (arrayItem.length == this.listAppealInQuestion.length) {
      this.APIUpdateReEval(prop, arrayItem, 'callAPI');

      // this.onGoBackList()
    }
  }

  //#region API
  APIUpdateReEval(prop: string[], prod: DTOReEval[], action: string) {
    this.loading = true;
    this.hriAppealApi.UpdateReEvalL(prod, prop).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
      (res: any) => {
        this.loading = false;
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.layoutService.onSuccess(`Cập nhật yêu cầu phúc khảo thành công`);
          action === 'callAPI' ? this.onToggleGrid(this.isGridHasRequest) : null;
          res.ObjectReturn.forEach(v => {
            this.listAppealInQuestion.forEach(s => {
              if(v.Code == s.ReEvaluationID){
                s.StatusID = v.StatusID;
                s.StatusName = v.StatusName;
              }
            })
          })
          this.isLockAll = this.listAppealInQuestion.every(item => item.StatusID === 3);
          this.onCloseDialog();
        } else {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật yêu cầu phúc khảo: ${res.ErrorString}`
          );
          this.onLoadData()
        }
      },
      (error) => {
        this.loading = false;
        this.layoutService.onError(
          `Đã xảy ra lỗi khi cập nhật yêu cầu phúc khảo: ${error}`
        );
        this.onLoadData()
      }
    );
  }

  APIUpdateMarkMultipleReEval(DTOMarking: DTOResetingMarkAppeal) {
    this.loading = true;
    this.isLockAll = true;
    var temp = JSON.parse(JSON.stringify(DTOMarking));
    if(this.question.TypeOfQuestion !== 3 ){
      temp.ListMark = temp.ListMark.filter( v => v.IsRight == true)
    } 
    // Sau khi lấy dto từ cache thì thực hiện update cho câu hỏi trước rồi mới update lại cho tất cả
    this.hriAppealApi.UpdateMarkMultipleReEval(temp).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
      (res: any) => {
        this.loading = false;
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.isLockAll = false;
          this.openDialogMarking = false
          this.layoutService.onSuccess('Chấm điểm phúc khảo thành công')
          this.onToggleGrid(true)
          Ps_UtilObjectService.hasListValue(this.questionAppeal.ListMark) ? this.questionAppeal.ListMark.forEach(v => !Ps_UtilObjectService.hasValueString(v.Remark) ? v.Remark = null : null) :  null
        } else {
          this.isLockAll = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi chấm điểm tất cả các câu hỏi phúc khảo: ${res.ErrorString}`);
          this.onLoadData()
        }
        this.openDialogMarking = false;
      },
      (error) => {
        this.loading = false;
        this.openDialogMarking = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi chấm điểm tất cả các câu hỏi phúc khảo: ${error}`);
        this.onLoadData()
      }
    );
  }

  APIGetQuestion(dto: DTOQuestion) {
    this.loading = true;
    if (dto.Code != 0) {
      this.serviceQuestionApi.GetQuestion(dto).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
        (res: any) => {
          this.loading = false;
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.question = res.ObjectReturn;
            this.onToggleGrid(this.isGridHasRequest);
            if (res.ObjectReturn.TypeOfQuestion !== 3) {
              if(this.question.StatusID == 3){
                this.RefQuestionState.filter.filters.push(
                  {
                    field: 'RefID',
                    operator: 'eq',
                    value: this.question.Code,
                  },
                  { field: 'StatusID', operator: 'eq', value: 2 }
                );
                this.APIGetListQuestion(this.RefQuestionState)
              } 
              this.APIGetAnswer(res.ObjectReturn, 'oldQuestion');
            }
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy thông tin câu hỏi: ${res.ErrorString}`
            );
          }
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy thông tin câu hỏi: ${error}`
          );
        }
      );
    }
  }

  APIGetAnswer(dto: DTOQuestion, type: string) {
    this.loading = true;
    if (dto.Code != 0) {
      this.serviceQuestionApi.GetListAnswer(dto).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
        (res: any) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            
            //#region xử lý mảng câu trả lời cho cột thiết lập lại 
            this.questionAppeal.ListMark = []
            // Nếu trường hợp câu hỏi phúc khảo chọn thiết lập tính lại điểm: không thay đổi hoặc chưa chấm điểm lần nào
            if(type == 'oldQuestion'){
              let temp = JSON.parse(JSON.stringify(res.ObjectReturn))
              if (this.question.TypeOfQuestion !== 2 && temp.filter(v => v.IsRight == true).length > 1) {
                // Tìm index của item đầu tiên có IsRight = true
                const indexOfFirstTrue = temp.findIndex(item => item.IsRight === true);
                
                // Duyệt qua từng item, đặt IsRight = false cho những item có index khác với index của item đầu tiên có IsRight = true
                temp.forEach((item, index) => {
                  item.IsRight = index === indexOfFirstTrue;
                });
              }

              this.listAnswer = temp
              if(dto.StatusID !== 3){
                this.questionAppeal.ListMark = JSON.parse(JSON.stringify(this.listAnswer))
              }
            }
            // Nếu trường hợp câu hỏi phúc khảo chọn thiết lập tính lại điểm: không phải không thay đổi hoặc đã chấm điểm 
            // -> Kiểm tra và bind lại giá trị của câu hỏi đó 
            else {
              // Dùng map để tạo một mảng mới với các phần tử được cập nhật từ this.listAnswer
              const arrAnswer =  JSON.parse(JSON.stringify(res.ObjectReturn))
              this.questionAppeal.ListMark = arrAnswer.map((answerItem:DTOAnswer) => {
                // Tìm phần tử tương ứng trong this.questionAppeal.ListMark
                const matchingMarkItem = res.ObjectReturn.find(markItem => answerItem.Code === markItem.RefID);

                if (matchingMarkItem) {
                  // So sánh và cập nhật các trường cần thiết 
                  answerItem.IsRight = matchingMarkItem.IsRight;
                  answerItem.Remark = matchingMarkItem.Remark;
                  answerItem.Mark = matchingMarkItem.Mark;
                }

                return answerItem;
              });
            }
            //#endregion
            console.log(this.questionAppeal.ListMark);

              // thêm giá trị mặc định cho Remark
            Ps_UtilObjectService.hasListValue(this.questionAppeal.ListMark) ? this.questionAppeal.ListMark.forEach(v => !Ps_UtilObjectService.hasValueString(v.Remark) ? v.Remark = null : null) :  null
          } else {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy thông tin câu trả lời: ${res.ErrorString}`
            );
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy thông tin câu trả lời: ${error}`
          );
        }
      );
    }
  }
  
  APIGetListQuestion(state: State) {
    this.loading = true;
    this.serviceQuestionApi
      .GetListQuestion(state).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            const refQuestion = res.ObjectReturn.Data[0];
            this.questionAppeal.TypeOfMultipleReEval = Ps_UtilObjectService.hasValue(refQuestion.TypeOfReEvaluation) ? refQuestion.TypeOfReEvaluation : 3;
            this.APIGetAnswer(refQuestion, 'newQuestion');
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi: ${error}`);
        }
      );
  }

  APIGetListHR(typeHR: number) {
    this.apiServiceStaff.GetListHR(typeHR).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
      (res: any) => {
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.listHR = res.ObjectReturn;
          this.TypeOfMultipleReEvalName = this.listHR.find(v => v.OrderBy == this.questionAppeal.TypeOfMultipleReEval).ListName
          // this.currentListHR = res.ObjectReturn.find((s) => s.OrderBy == 3);
          this.questionAppeal.TypeOfMultipleReEval = res.ObjectReturn.find((s) => s.OrderBy == 3).OrderBy;
        } else {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy Danh sách loại nhân viên: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.layoutService.onError(
          `Đã xảy ra lỗi khi lấy Danh sách loại nhân viên: ${err}`
        );
      }
    );
  }

  APIGetListAppealInQuestion(gridState: State) {
    this.loading = true;
    this.hriAppealApi.GetListAppealInQuestion(gridState).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
      (res: any) => {
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.listAppealInQuestion = res.ObjectReturn.Data;
          this.isFinalMark = this.listAppealInQuestion.length > 0 ? this.listAppealInQuestion[0].StatusID : 0
          if (
            !this.isGridHasRequest &&
            Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data)
          ) {
            this.isReplyAll = true;
          }
          this.gridView.next({
            data: this.listAppealInQuestion,
            total: this.total,
          });
        } else {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy danh sách nhân sự yêu cầu phúc khảo: ${res.ErrorString}`
          );
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.layoutService.onError(
          `Đã xảy ra lỗi khi lấy danh sách nhân sự yêu cầu phúc khảo: ${error}`
        );
      }
    );
  }

  ngOnDestroy(): void {
    localStorage.setItem("PointSetting",JSON.stringify(this.questionAppeal))
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

  }
}
