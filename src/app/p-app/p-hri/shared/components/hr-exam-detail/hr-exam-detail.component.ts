import {
  Component,
  OnDestroy,
  OnInit,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
  PLATFORM_ID, Inject
} from '@angular/core';
import { DTOQuizRole } from '../../dto/DTOQuizRole.dto';
import { DTOExamQuestion } from 'src/app/p-app/p-portal/shared/dto/DTOExamQuestion.dto';
import { DomSanitizer } from '@angular/platform-browser';
import {
  FilterDescriptor,
  State,
} from '@progress/kendo-data-query';
import { skip, takeUntil } from 'rxjs/operators';
import { Subject, interval, Subscription } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOStaff, Ps_AuthService, Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOExamAnswer } from 'src/app/p-app/p-portal/shared/dto/DTOExamAnswer.dto';
import { DTOExam } from 'src/app/p-app/p-portal/shared/dto/DTOExam.dto';
import { DTOExamEssay } from '../../dto/DTOExamEssay.dto';
import { HriQuizSessionService } from '../../services/hri-quiz-session.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { HriExamApiService } from '../../services/hri-exam-api.service';
import { DTOReEval } from '../../dto/DTOReEval.dto';
import { HriAppealApiService } from '../../services/hri-appeal-api.service';
import * as $ from 'jquery';
import { ModuleDataAdmin } from 'src/app/p-app/p-layout/p-sitemaps/menu.data-admin';
import { EnumDialogType } from 'src/app/p-app/p-layout/enum/EnumDialogType';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-hr-exam-detail',
  templateUrl: './hr-exam-detail.component.html',
  styleUrls: ['./hr-exam-detail.component.scss'],
})
export class HrExamDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('questionSliderbutton', { static: true }) questionSliderbuttonRef: ElementRef;
  @ViewChild('questionSliderWrapper', { static: true }) questionSliderWrapperRef: ElementRef;
  @ViewChild('rowWrapper', { static: true }) rowWrapperRef: ElementRef;
  @ViewChild('wrapperButton', { static: true }) wrapperButtonRef: ElementRef;
  @ViewChild('staffInfo', { static: true }) staffInfoRef: ElementRef;
  @Input() staffQuizInfo: DTOQuizRole;
  @Input() isAppeal: boolean = false; // chế độ xem phúc khảo
  @Input() isReport: boolean = false; // chế độ xem phúc khảo


  ngUnsubscribe$ = new Subject<void>();
  arrUnsubscribe: Subscription[] = [];
  countDownSubscribe$ = new Subject<void>();

  loading: boolean = false;
  listQuestionInitial: DTOExamQuestion[] = [];
  visibleQuestions: DTOExamQuestion[] = [];
  listQuestion: DTOExamQuestion[] = [];
  isSorted: boolean = false;
  isFilterActiveimage = false;
  isFilterActiveimageMenu = true;
  isFilterActive = true;

  //#region disable
  isShowSentAppeal: boolean = false; // Hiện nút "Gửi phúc khảo"
  //#endregion


  falseItems: number = null;
  showDialog: boolean = false;
  selectedQuestion: number = 1; // câu hỏi đang được chọn trên slider question 
  start: number = 0; // điểm bắt đầu của slider question 
  end: number = 32; // điểm kết thúc của slider question 
  windowSize: number = 0; // chiều rộng của màn hình
  windownHeight: number = 0; // chiều cao của màn hình
  widthSlider: number = 0; // chiều rộng của slider quesion 
  heightRowWrapper: number = 0; // chiều cao của class RowWrapper 
  heightButtonWrapper: number = 0; // chiều cao của block nút nộp và gửi phúc khảo ở bản mobile
  heightQuestionSliderWrapper: number = 0; // chiều cao của danh sách câu hỏi
  heightstaffInfo: number = 0; // chiều cao của block thông tin thí sinh tham gia thi
  amountBtnQuestion: number = 0; // đếm số nút câu hỏi được render trên slider
  platform: string = null; // lưu thiết bị dùng để truy cập vào hệ thống
  moduleName: string = ''; // lưu module đang dùng comp

  listExamQuestion: DTOExamQuestion[]; // Danh sách câu hỏi
  reEvalQuestion = new DTOReEval(); // câu phúc khảo
  examInfo: DTOExam = new DTOExam(); // Thông tin thí sinh làm bài thi
  isQuizSessionClosed: boolean; // đợt đã đóng chưa
  answeredQuestion: number = 0; // số câu hỏi đã trả lời
  questionIndices: number[] = []; // câu hỏi được hiện trên slider
  currentPageIndex: number = 0; // Trang đang hiển thị
  ExamSession: DTOExam = new DTOExam(); // Đợt thi
  ExamQuestion: DTOExamQuestion = new DTOExamQuestion(); // Bài thi
  typeDevice: string = null // Thiết bị truy cập vào bài thi
  updateTimeout: any = null; // setTimeout

  IsGet: boolean = false; // Gọi api 1 lần
  isStopReason: boolean = false; // Trạng thái lý do dừng bài thi
  IsRestoreItems: boolean = true; // trạng sort theo tăng dần
  IsSortItems: boolean = false; // trạng thái sort theo các đã chọn đáp án theo chiều tăng dần
  isSubmitExam: boolean = false; // trạng thái nộp bài
  isCountDownTime: boolean = false; // trạng thái đếm ngược

  //#region phúc khảo
  dateSentAppeal = new Date(); // Ngày bắt đầu phúc khảo
  dateFinishAppeal = new Date(); // Ngày hoàn tất phúc khảo
  statusAppeal: number = 0; // trạng thái của câu phúc khảo
  appealEndDate = new Date(); // Ngày kết thức phúc khảo

  InfoUser: DTOStaff = new DTOStaff(); // thông tin người đăng nhập hệ thống
  //#endregion
  examFilters: State = {
    filter: { filters: [], logic: 'and' },
    sort: [],
  };

  constructor(
    private layoutService: LayoutService,
    private examAPIService: HriExamApiService,
    private appealAPIService: HriAppealApiService,
    public quizSessionService: HriQuizSessionService,
    public sanitizer: DomSanitizer,
    public menuService: PS_HelperMenuService,
    private cdr: ChangeDetectorRef,
    private helperService: PS_HelperMenuService,
    public auth: Ps_AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        this.platform = 'ios'
      } else if (/Android/.test(navigator.userAgent)) {
        this.platform = 'android'
      }
    }
  }

  ngOnInit(): void {
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.onGetLocalStorage(); // lấy cache
        this.auth.getCacheUserInfo().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((v) => { // Lấy thông tin người đang đăng nhập
          this.InfoUser = v
          this.examAPIService.ChangeParamExam$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
            (s: DTOExamQuestion) => {
              this.ExamQuestion = s;
              !Ps_UtilObjectService.hasValue(this.ExamQuestion.StaffID) ? this.ExamQuestion.StaffID = v.staffID : null
              !Ps_UtilObjectService.hasValue(this.ExamQuestion.Code) ? this.ExamQuestion.Code = 0 : null
              this.APIGetListExamQuestion(this.ExamQuestion);
            }
          );
        });

        // Tất zoom của trình duyệt khi focusvào input
        $("input[type=text], textarea").mouseover(zoomDisable).mousedown(zoomEnable);
        function zoomDisable() {
          $('head meta[name=viewport]').remove();
          $('head').prepend('<meta name="viewport" content="user-scalable=0" />');
        }
        function zoomEnable() {
          $('head meta[name=viewport]').remove();
          $('head').prepend('<meta name="viewport" content="user-scalable=1" />');
        }
      }
    })

  }


  ngAfterViewInit(): void {
    let c = this.menuService.breadcrumbDataChanged.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => { // Lăng nghe sự kiện của loadData để get api
      if (this.moduleName == 'hri') {
        this.APIGetListExamQuestion(this.ExamQuestion);
      } else if (this.moduleName == 'portal') { // Nếu như đang ở module portal 
        this.APIGetExamInfo();
      }
    });

    this.cdr.detectChanges();
    this.arrUnsubscribe.push(c);
  }

  ngDoCheck(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    this.onViewportSize()
    this.onAdjustQuestionSlideNumber()
  }

  //tính số lượng item được render trên question slider
  @HostListener('window:resize', ['$event']) onResize(event) {
    this.onAdjustQuestionSlideNumber();
    this.onViewportSize()
  }

  // Hàm để tính toán chiều cao của ListQuestion phù hợp với kích thước của thiết bị
  onViewportSize() {
    this.windowSize = window.innerWidth;
    this.windownHeight = window.innerHeight;

    this.widthSlider = this.questionSliderbuttonRef.nativeElement.offsetWidth;
    this.heightRowWrapper = this.rowWrapperRef.nativeElement.offsetHeight;
    this.heightQuestionSliderWrapper = this.questionSliderWrapperRef.nativeElement.offsetHeight;
    this.heightButtonWrapper = this.wrapperButtonRef.nativeElement.offsetHeight;
    this.heightstaffInfo = Ps_UtilObjectService.hasValue(this.staffInfoRef) ? this.staffInfoRef.nativeElement.offsetHeight : 0;
    this.moduleName == 'portal' ? $('.ListQuestion').css('height', this.windowSize < 740 ? `calc(${this.windownHeight}px - ${this.heightRowWrapper + this.heightButtonWrapper}px)` : `calc(100vh - ${this.heightstaffInfo + this.heightRowWrapper + 55}px)`) : null
  }

  // Hàm tính toán số nút question được render trên UI
  onAdjustQuestionSlideNumber(): void {
    this.windowSize = window.innerWidth;
    this.widthSlider = this.questionSliderbuttonRef.nativeElement.offsetWidth;
    this.heightRowWrapper = this.rowWrapperRef.nativeElement.offsetHeight;
    this.heightQuestionSliderWrapper = this.questionSliderWrapperRef.nativeElement.offsetHeight;
    this.amountBtnQuestion = Math.ceil(this.widthSlider / 55);
    if (this.windowSize > 768) {
      // Tính toán các chỉ số câu hỏi hiển thị dựa trên trang hiện tại
      this.questionIndices = this.listQuestionInitial
        .map((_, index) => index)
        .slice(
          this.currentPageIndex * this.amountBtnQuestion,
          (this.currentPageIndex + 1) * this.amountBtnQuestion
        );

      // Lấy danh sách câu hỏi dựa trên chỉ số đã tính toán
      this.visibleQuestions = this.listQuestionInitial.filter((_, index) =>
        this.questionIndices.includes(index)
      );
    } else {
      this.visibleQuestions = this.listQuestionInitial;
    }

    // // Biến lưu giá trị cho biết biết khi nào thì màn hình thay đổi kích thước
    // this.changeHeight = this.examInfo?.SessionStatusID == 1 && this.examInfo?.StatusID === 1 && this.moduleName === 'portal' 
    //   || this.examInfo?.SessionStatusID == 3 && this.examInfo?.TypeOfSession !== 1 && this.moduleName === 'portal' && this.isShowSentAppeal && (this.statusAppeal == 0 || this.statusAppeal == 4)
  }

  //#region  Hàm xử lý slider question 
  onPrevPaginate(): void {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.onAdjustQuestionSlideNumber();
    }
  }

  onNextPaginate(): void {
    if (
      (this.currentPageIndex + 1) * this.amountBtnQuestion <
      this.listQuestionInitial.length
    ) {
      this.currentPageIndex++;
      this.onAdjustQuestionSlideNumber();
    }
  }
  //#endregion

  // Hàm lấy cache
  onGetLocalStorage() {
    this.ExamSession = JSON.parse(localStorage.getItem('ExamSession'));
    this.moduleName = localStorage.getItem('Module');

    if (Ps_UtilObjectService.hasValue(this.ExamSession)) {
      this.quizSessionService.ExamSession$.next(this.ExamSession);
      this.examAPIService.ChangeParamExam$.next(this.ExamSession);
      if (Ps_UtilObjectService.hasValue(this.ExamSession.StaffID) == false) {
        this.onSetState(this.ExamSession, 1);
        // });
      } else {
        this.onSetState(this.ExamSession, 2);
      }
    }

  }

  // Hàm tạo filter
  onSetState(ExamSession: any, type) {
    this.examFilters.filter.filters = []
    if (this.moduleName === 'hri') {
      const CodeFilter: FilterDescriptor = {
        field: 'Code',
        operator: 'eq',
        value: ExamSession.Exam,
        ignoreCase: true,
      };
      this.examFilters.filter.filters.push(CodeFilter);
    } else if (this.moduleName === 'portal') {
      const CodeFilter: FilterDescriptor = {
        field: 'Code',
        operator: 'eq',
        value: ExamSession.Code,
        ignoreCase: true,
      };
      this.examFilters.filter.filters.push(CodeFilter);
    }

    const QuizSessionFilter: FilterDescriptor = {
      field: 'QuizSession',
      operator: 'eq',
      value: ExamSession.QuizSession,
      ignoreCase: true,
    };

    if (type == 2) {
      const StaffIDFilter: FilterDescriptor = {
        field: 'StaffID',
        operator: 'eq',
        value: ExamSession.StaffID,
        ignoreCase: true,
      };
      this.examFilters.filter.filters.push(QuizSessionFilter, StaffIDFilter);
    } else {
      this.examFilters.filter.filters.push(QuizSessionFilter);
    }

  }

  // Hàm đếm thời gian làn bài thi
  onStartCountDown() {
    this.isCountDownTime = true;
    if (this.examInfo?.StatusID === 1) {
      let a = interval(1000).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
        if (
          this.examInfo?.RemainDuration != null &&
          this.examInfo?.RemainDuration > 0
        ) {
          this.examInfo.RemainDuration -= 1;
          this.isSubmitExam = false;
        }
        if (
          this.examInfo?.RemainDuration === 0 &&
          this.examInfo?.SessionStatusID == 1 &&
          this.examInfo?.StatusID == 1
        ) {
          if (this.isSubmitExam == false) { // nếu hết thời gian mà thí sinh chưa nộp bài thì tự động nộp bài
            this.APIUpdateExamStatus(); // nộp bài
          }
        }
      });
      this.arrUnsubscribe.push(a);
    }
  }

  //handle click câu trắc nghiệm nhiều lựa chọn
  onSelectCheckboxAnswer(idAnswer: number, listAnswer: DTOExamAnswer[]) {
    listAnswer.forEach((answer) => {
      if (answer.AnswerID === idAnswer && answer.Selected) {
        // answer.Selected = true;
        this.APIUpdateExamResult(answer);
      } else if (answer.AnswerID === idAnswer && !answer.Selected) {
        // answer.Selected = false;
        this.DeleteExamResult(answer);
      }
    });
    this.onCheckSortQuestion();
  }

  //handle click câu trắc nghiệm một lựa chọn 
  onSelectRadioAnswer(id: number, list: DTOExamAnswer[]) {
    list.forEach((answer) => {
      if (answer.AnswerID === id) {
        answer.Selected = true;
        this.APIUpdateExamResult(answer);
      } else {
        answer.Selected = false;
      }
    });
    this.onCheckSortQuestion();
  }

  // Hàm xử lý nhập câu tự luận 
  onEssayAnswerChanged(essay: DTOExamQuestion) {
    this.APIUpdateEssayExam(essay);
    this.onCountAnsweredQuestion();
    this.onCheckSortQuestion();
  }

  // Hàm kiểm tra và xếp sấp lại thứ tự của các button trên slider
  onCheckSortQuestion() {
    if (this.IsRestoreItems) {
      this.onRestoreItemsOrder();
    } else {
      this.onSortItemsBySelection();
    }
  }


  // Hàm điều phối khi có một sự kiện update xảy ra
  onUpdateQuestion(data: { question: DTOExamQuestion, answer?: DTOExamAnswer }) {
    switch (data.question.TypeOfQuestion) {
      case 1:
        this.onSelectRadioAnswer(data.answer.AnswerID, data.question.ListAnswers);
        break;
      case 2:
        this.onSelectCheckboxAnswer(
          data.answer.AnswerID,
          data.question.ListAnswers
        );
        break;
      case 3:
        this.windowSize > 500 ? this.onEssayAnswerChanged(data.question) : null;
        break;
      case 4:
        this.onSelectRadioAnswer(data.answer.AnswerID, data.question.ListAnswers);
        break;
      default:
        break;
    }
  }

  // hàm này hoạt động khi flatfrom: ios và là web safari
  onValueChangeEssay(data: { question: DTOExamQuestion, answer?: DTOExamAnswer }): void {
    // Hủy bỏ timeout trước đó nếu có
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    // Thiết lập timeout mới để gọi API sau 3 giây
    this.updateTimeout = setTimeout(() => {
      this.onEssayAnswerChanged(data.question)
    }, this.layoutService.typingDelay);
  }

  //Sort question slider
  onSortItemsBySelection(): void {
    this.IsSortItems = true;
    this.IsRestoreItems = false;
    let newItems = [...this.listQuestion];
    newItems.sort((a, b) => a.OrderBy - b.OrderBy);
    newItems.sort((a, b) => {
      if (
        (this.onIsQuestionSelected(a) && !this.onIsQuestionSelected(b)) ||
        (this.onIsQuestionApealed(a) && !this.onIsQuestionApealed(b))
      ) {
        return 1;
      } else if (
        (!this.onIsQuestionSelected(a) && this.onIsQuestionSelected(b)) ||
        (!this.onIsQuestionApealed(a) && this.onIsQuestionApealed(b))
      ) {
        return -1;
      } else {
        return 0;
      }
    });
    this.isSorted = true;
    this.onResetQuestionSliderNumber();
    this.listQuestionInitial = [...newItems];
    this.onAdjustQuestionSlideNumber();
  }

  //di chuyển đến câu hỏi được click trên question slider
  onSortByCodeAndMoveToTop(codeToMove: number): void {
    this.listQuestion = [...this.listQuestionInitial]; //copy list default để các câu hỏi trở lại index ban đầu
    const indexToMove = this.listQuestion.findIndex(
      (item) => item.Code === codeToMove
    );
    this.selectedQuestion = codeToMove;
    const objectToMove = this.listQuestion.splice(indexToMove, 1)[0];
    this.listQuestion.unshift(objectToMove);
    requestAnimationFrame(() => {
      const questionElementRef = document.getElementById(`question-${codeToMove}`) as HTMLElement;
      const listQuestionElementRef = document.getElementById(`ListQuestion`) as HTMLElement;
      const examDetailWrapperRef = document.getElementById(`examDetailWrapper`) as HTMLElement;
      if (questionElementRef) {
        const left = questionElementRef.offsetLeft; // Chuyển đổi thành chuỗi

        if (this.moduleName == 'portal') {
          if (this.platform == 'ios') {
            listQuestionElementRef.scrollTo({
              top: questionElementRef.offsetTop - this.rowWrapperRef.nativeElement.offsetHeight - 100,
              left: left,
              behavior: "smooth",
            })
          }
          else {
            listQuestionElementRef.scrollTo({
              top: questionElementRef.offsetTop - this.rowWrapperRef.nativeElement.offsetHeight - this.staffInfoRef.nativeElement.offsetHeight - 66,
              left: left,
              behavior: "smooth",
            })
          }
        } else {
          examDetailWrapperRef.scrollTo({
            top: questionElementRef.offsetTop - this.rowWrapperRef.nativeElement.offsetHeight - this.staffInfoRef.nativeElement.offsetHeight - 66,
            left: left,
            behavior: "smooth",
          })
        }


      }
    });
  }

  //#region handle of header
  //bỏ sort question slider
  onRestoreItemsOrder(): void {
    this.IsRestoreItems = true;
    this.IsSortItems = false;
    let newItems = [...this.listQuestion];
    newItems.sort((a, b) => a.OrderBy - b.OrderBy);
    this.isSorted = false;
    this.onResetQuestionSliderNumber();
    this.listQuestionInitial = [...newItems];
    this.onAdjustQuestionSlideNumber();
  }

  //reset sort question slider
  onResetQuestionSliderNumber(): void {
    this.start = 0;
    this.widthSlider = this.questionSliderbuttonRef.nativeElement.offsetWidth;
    this.end = Math.floor(this.widthSlider / this.listQuestion.length);
  }

  //hàm check câu hỏi đã được trả lời chưa
  onIsQuestionSelected(item: DTOExamQuestion): boolean {
    if (item.TypeOfQuestion !== 3) {
      return item.ListAnswers.some((answer) => answer.Selected);
    } else {
      return !!item.Answer?.length;
    }
  }

  // Handle check câu hỏi đã tạo lý do phúc khảo
  onIsQuestionApealed(item: DTOExamQuestion): boolean {
    return item.ListReEval.length > 0 && item.ListReEval[0].Code > 0 ? true : false;
  }

  //tính số lượng câu hỏi đã được trl và câu hỏi đã điền lý do phúc khảo
  onCountAnsweredQuestion() {
    this.answeredQuestion = 0;
    this.examInfo?.StatusID === 1
      ? this.listQuestion.forEach((item) => {
        const isAnswered = this.onIsQuestionSelected(item);
        if (isAnswered) {
          this.answeredQuestion += 1;
        }
      })
      : this.listExamQuestion.forEach((item) => {
        const isAnswered = this.onIsQuestionApealed(item);
        if (isAnswered) {
          this.answeredQuestion += 1;
        }
      });
  }

  // hàm xử lý cho dialog
  onOpenDialogExam() {
    if (this.examInfo?.StatusID === 1) {
      let QSelected = this.listQuestion.filter(
        (item) => !this.onIsQuestionSelected(item)
      ).length;
      let QAnswer = this.listQuestion.filter(
        (item) => item.Answer == null && item.ListAnswers.length == 0
      ).length;
      this.falseItems = QSelected - QAnswer;
      if (this.falseItems < 0) this.falseItems * -1;
    } else {
      this.falseItems = this.listExamQuestion.filter((v) =>
        Ps_UtilObjectService.hasValueString(v.ListReEval[0])
      ).length;
    }
    this.showDialog = true;
  }

  // Handle nộp bài
  onSubmit(value: boolean) {
    this.showDialog = value;
    if (value) {
      this.APIUpdateExamStatus();
    }
  }

  // Handle mở dialog của phúc khảo
  openDialogAppealExam() {
    this.showDialog = true;
  }

  // Handle "Gửi phúc khảo"
  onAppealExam(value: boolean) {
    this.showDialog = value;
    var arr: DTOReEval[] = [];
    let arrQuestionAppeal = JSON.parse(
      JSON.stringify(
        this.listExamQuestion.filter(
          (v) =>
            v.ListReEval.length > 0 && v.ListReEval[0].Code > 0
        )
      )
    );
    arrQuestionAppeal.forEach((v: DTOExamQuestion) => {
      if (Ps_UtilObjectService.hasListValue(v.ListReEval)) {
        v.ListReEval.forEach((s: DTOReEval) => {
          s.ExamQuestionID = v.Code;
          s.StatusID = 1;
          arr.push(s);
        });
      }
    });
    if (value) {
      this.UpdateReEval(arr, ['StatusID']);
    }
  }


  // cập nhật giá trị mới cho lý do phúc khảo
  onBlurAppeal(value: DTOReEval, question: DTOExamQuestion) {
    var arr: DTOReEval[] = [];
    value.ExamQuestionID = question.Code;
    arr.push(value);
    this.UpdateReEval(arr, ['Reason']);
  }

  // Hàm này dùng để cập nhật khi bài thi được làm trên thiết bị ios và là trình duyệt safari
  onValueChangeAppeal(value: DTOReEval, question: DTOExamQuestion) {
    // Hủy bỏ timeout trước đó nếu có
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    // Thiết lập timeout mới để gọi API sau 3 giây
    this.updateTimeout = setTimeout(() => {
      var arr: DTOReEval[] = [];
      value.ExamQuestionID = question.Code;
      arr.push(value);
      this.UpdateReEval(arr, ['Reason']);
    }, this.layoutService.typingDelay);
  }

  // Kiểm tra ListEval của question đã có item nào chưa -> chưa thì thêm 1 item mặc định
  onLoopCheckItemDefaultReEval(question: DTOExamQuestion) {
    if (question.ListReEval.length == 0) {
      // var questionOfList = this.listExamQuestion.filter(v => v.Code == question.Code);
      // questionOfList[0].ListReEval.push(this.reEvalQuestion);
      question.ListReEval.push({ ...this.reEvalQuestion });
    }
  }

  // Hàm chuyển người dùng về trang danh sách nếu nhưng người đó không có quyền
  onNavigatePage(type) {
    var parent = ModuleDataAdmin.find((s) => s.Code.includes('portal'));
    this.helperService.activeMenu(parent);
    if (type == 1) {
      this.layoutService.onWarning('Bạn không có quyền xem bài làm!');
    }
  }

  // Hàm đém ngược sau 1p thì gọi api 
  onCallApiAfterOneSecond() {
    //sau 1p gọi lại api lấy data mới
    interval(60000)
      .pipe(skip(1), takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        if (this.examInfo?.StatusID === 1 && this.moduleName == 'hri') {
          this.APIGetListExamQuestion(this.ExamQuestion);
        } else if (
          this.examInfo?.StatusID === 1 &&
          this.moduleName == 'portal'
        ) {
          this.APIGetExamInfo();
        }
      });

    this.isSubmitExam = false;
  }
  //#endregion

  // Hàm kiểm tra xem có đang ở thời điểm phúc khảo không
  checkTimeAppead() {
    if (this.examInfo.SessionStatusID >= 3) {
      // Lọc ra những câu hỏi đang được phúc khảo
      const ListAppeaded = this.listExamQuestion.filter((v) =>
        Ps_UtilObjectService.hasListValue(v.ListReEval) && v.ListReEval[0].Code > 0
      );

      $(document).ready(() => {

        if (Ps_UtilObjectService.hasListValue(ListAppeaded)) {
          this.statusAppeal = Ps_UtilObjectService.hasValueString(ListAppeaded[0]?.ListReEval) ? ListAppeaded[0]?.ListReEval[0]?.StatusID : null;

          switch (this.statusAppeal) {
            case 0:
              // Nếu tình trạng câu hỏi phúc khảo là 0 thì giá trị gửi phúc khảo = ngày AppealDate
              this.dateSentAppeal = this.appealEndDate;
              break;
            case 1:
              // Nếu tình trạng câu hỏi phúc khảo là 1 thì giá trị gửi phúc khảo = ngày thí sinh gửi phúc khảo
              this.dateSentAppeal = new Date(ListAppeaded[0]?.ListReEval[0]?.CreatedTime);
              break;
            case 3:
              // Nếu tình trạng câu hỏi phúc khảo là 2 thì giá trị hoàn tất phúc khảo = ngày hoàn tất chấm phúc khảo
              this.dateFinishAppeal = new Date(ListAppeaded[0]?.ListReEval[0]?.LastModifiedTime);
              break;
            case 4:
              // Nếu tình trạng câu hỏi phúc khảo là 1 thì giá trị gửi phúc khảo = ngày thí sinh gửi phúc khảo
              this.dateSentAppeal = new Date(ListAppeaded[0]?.ListReEval[0]?.CreatedTime);
              break;
          }
        } else {
          // Nếu tình trạng câu hỏi phúc khảo là 0 thì giá trị gửi phúc khảo = ngày AppealDate
          this.dateSentAppeal = this.appealEndDate;
        }
      });
      this.onViewportSize();
    }
  }


  //#region dialog
  isOneCallDia: boolean = false;
  dialogWarning = EnumDialogType.Display

  // Hàm đóng dialog xem lý do dừng làm bài
  closeStopReason() {
    this.isOneCallDia = true;
    if (this.examInfo?.EvaluationView == 0 && this.examInfo?.StatusID == 3
      || this.examInfo?.EvaluationView == 1 && this.examInfo.SessionStatusID >= 3 && this.examInfo?.StatusID == 3) {
      this.isStopReason = false;
      this.quizSessionService.ExamSession$.next(null);
    } else {
      this.isStopReason = false;
      this.moduleName == 'portal' ? this.onNavigatePage(1) : null
    }
  }
  //#endregion


  //#region API
  APIGetExamInfo() {
    this.IsGet = true;
    this.examAPIService
      .GetListExam(this.examFilters)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          this.loading = true;
          if (
            res.StatusCode === 0 &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn.Data)
          ) {
            this.examInfo = res.ObjectReturn.Data[0];
            this.ExamSession = this.examInfo;
            this.onSetState(this.ExamSession, 2); // set lại filter
            localStorage.setItem('ExamSession', JSON.stringify(this.ExamSession)); // Cập nhật cache mới
            this.quizSessionService.ExamSession$.next(this.examInfo); // Cập nhất date mới cho breadcrum và header portal
            const currentDate = new Date(); // Khởi tạo ngày hiện tại
            // this.appealStartDate = new Date(this.examInfo.ClosedDate);
            this.appealEndDate = new Date(this.examInfo.AppealDate);
            this.appealEndDate.setHours(23, 59, 59, 59);
            this.isShowSentAppeal = currentDate.getTime() <= this.appealEndDate.getTime();

            // Kiểm tra isShowSentAppeal thi và đợt có nằm trong diện được xem bài không, nếu không thì đưa người dùng về trang list
            if (this.examInfo?.EvaluationView == 2 && this.examInfo?.StatusID == 2 || this.examInfo?.EvaluationView == 1 && this.examInfo?.SessionStatusID < 3 && this.examInfo?.StatusID == 2
              || this.examInfo?.EvaluationView == 2 && this.examInfo?.StatusID == 3 || this.examInfo?.EvaluationView == 1 && this.examInfo?.StatusID == 3 && this.examInfo?.SessionStatusID <= 3 || this.examInfo?.EvaluationView == 2 && this.examInfo.StatusID == 0 ||
              this.examInfo?.EvaluationView == 1 && this.examInfo?.StatusID == 0 || res.ObjectReturn.length > 0
            ) {
              // Nếu đang làm bài và bị dừng thì gọi hiện lý do dừng bài, sau khi đóng thì chuyển người dùng về trang list
              this.moduleName == 'portal' && this.examInfo.StatusID == 3 && this.isOneCallDia == false ? this.isStopReason = true : this.moduleName == 'portal' ? this.onNavigatePage(1) : null;
            } // Nếu bài thi được phép xem thì hiện popup và không chuyển người dùng về trang list
            else if (this.examInfo?.EvaluationView == 0 && this.examInfo?.StatusID == 3 || this.examInfo?.EvaluationView == 1 && this.examInfo.SessionStatusID >= 3 && this.examInfo?.StatusID == 3) {
              this.moduleName == 'portal' && this.isOneCallDia == false ? this.isStopReason = true : false;
            }
            // Nếu không thoải điều kiện trên thì tiếp tục render UI
            else {
              //check quiz session đóng chưa
              if (this.examInfo && this.examInfo.EndDate) {
                this.isQuizSessionClosed =
                  new Date(this.examInfo.EndDate).getTime() <
                  currentDate.getTime();
              }
              if (
                this.isCountDownTime == false &&
                this.examInfo.SessionStatusID == 1 &&
                this.examInfo.StatusID == 1
              ) {
                this.onStartCountDown(); // Đếm ngược thời gian
                this.onCallApiAfterOneSecond(); // gọi api sau 1p
              }
              this.loading = false;
              if (
                Ps_UtilObjectService.hasValue(this.examInfo) &&
                Ps_UtilObjectService.hasValueString(this.examInfo.QuizSessionID)
              ) {
                // Kiểm tra nếu là xem bài thi thì hiển thị hết câu hỏi
                // Nếu xem bài phúc khảo thì hiển thị câu hỏi có lý do phúc khảo
                this.moduleName === 'portal' ? this.listExamQuestion
                  : this.moduleName === 'hri' && this.examInfo.QuizSessionID == 3 && this.isShowSentAppeal
                    ? this.listExamQuestion.filter((v) => v.ListReEval.length > 0)
                    : this.listExamQuestion;
              }
              this.checkTimeAppead(); // Kiểm tra thời giờ phúc khảo còn không 
              if (
                this.examInfo.RemainDuration < 0 &&
                this.examInfo.StatusID == 1 &&
                this.moduleName == 'portal'
              ) {
                this.APIUpdateExamStatus(); // Cập nhật lại trạng thái bài thi nếu bài thi đã hết giờ làm bài những vẫn chưa nộp
              }
              this.onViewportSize(); // lấy lại thông số kết thước
              this.onAdjustQuestionSlideNumber(); //tính lại số lượng item paginate được render mỗi khi get lại list câu hỏi
            }
          } else if (
            res.StatusCode === 0 &&
            !Ps_UtilObjectService.hasValue(res.ObjectReturn.Data)
          ) {
            this.layoutService.onError(`Không tìm thấy thông tin bài làm: ${res.ErrorString}`);
            this.loading = false;
          } else if (res.StatusCode !== 0) {
            this.layoutService.onError(
              `Đã xảy ra lỗi khi lấy thông tin bài làm: ${res.ErrorString}`
            );
            this.loading = false;
          }
        },
        (err) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin bài làm: ${err} `);
          this.loading = false;
        }
      );
  }

  APIGetListExamQuestion(ExamQuestion: DTOExamQuestion) {
    this.examAPIService
      .GetListExamQuestion(ExamQuestion)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((res) => {
        this.loading = true;
        if (res.ErrorString != null && res.StatusCode !== 0) {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi: ${res.ErrorString}!`);
          this.quizSessionService.ExamSession$.next(null);
          this.loading = false;
        }
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode === 0) {
          //#region xử lý mản sau khi nhận data
          res.ObjectReturn.sort((a, b) => a.OrderBy - b.OrderBy);
          if (this.isAppeal) {
            // Nếu như input xem yêu cầu phúc khảo chỉ hiển thị câu hỏi có phúc khảo
            res.ObjectReturn = res.ObjectReturn.filter((v) => Ps_UtilObjectService.hasListValue(v.ListReEval) && v.ListReEval[0].Code > 0);
          }
          this.listExamQuestion = [...res.ObjectReturn];
          // this.listExamQuestion.forEach((v) => {
          //   this.CompareString(v);
          // });
          if (this.listExamQuestion.some(item => Ps_UtilObjectService.hasListValue(item?.ListReEval) && (item?.ListReEval[0].StatusID === 0 || item?.ListReEval[0].StatusID === 4))
            || this.listExamQuestion.every(item => !Ps_UtilObjectService.hasListValue(item?.ListReEval))
          ) {
            this.listExamQuestion.forEach((v) => {
              if (this.moduleName === 'portal' && !Ps_UtilObjectService.hasListValue(v.ListReEval)) {
                v.ListReEval.push({ ...this.reEvalQuestion });
              }
            });
          }

          this.listQuestion = [...res.ObjectReturn];
          this.listQuestionInitial = [...res.ObjectReturn]; //list default của danh sách câu hỏi

          // Lấy ExamId của câu hỏi thay vào filter
          if (this.moduleName == 'portal') {
            this.examFilters.filter.filters.forEach((v: FilterDescriptor) => {
              if (v.field == 'Code') {
                v.value = this.listExamQuestion[0].ExamID
              }
            })
          }

          //#endregion


          this.onCountAnsweredQuestion();
          this.loading = false;
          if (this.IsGet == false) {
            this.APIGetExamInfo();
            // this.onAdjustQuestionSlideNumber(); //tính lại số lượng item paginate được render mỗi khi get lại list câu hỏi
          }
          this.onCheckSortQuestion();
          this.statusAppeal = this.listExamQuestion.filter(
            (v) =>
              v.ListReEval.length > 0 && v.ListReEval[0].Code > 0
          )[0]?.ListReEval[0]?.StatusID;


        } else if (
          res.StatusCode === 0 &&
          !Ps_UtilObjectService.hasValue(res.ObjectReturn)
        ) {
          this.loading = false;
          this.layoutService.onError(`Không tìm thấy danh sách câu hỏi: ${res.ErrorString}`);
        } else if (res.StatusCode !== 0) {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi load danh sách câu hỏi: ${res.ErrorString}`
          );
          this.loading = false;
        }
      });
  }

  //NỘP BÀI LÀM
  APIUpdateExamStatus() {
    this.isSubmitExam = true;
    this.examAPIService
      .UpdateExamStatus([this.examInfo], 2)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.layoutService.onError(`Đã xảy ra lỗi khi nộp bài: ${res.ErrorString}!`);
            this.APIGetListExamQuestion(this.ExamQuestion);
            this.loading = false;
          }
          if (res.StatusCode === 0) {
            this.IsGet = false;
            this.APIGetExamInfo();
            this.layoutService.onSuccess('Nộp bài thành công', 10000);
            this.countDownSubscribe$.unsubscribe();
          }
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi nộp bài: ${error}`);
          this.APIGetListExamQuestion(this.ExamQuestion);
          this.loading = false;
        }
      );
    this.showDialog = false;
  }

  APIUpdateExamResult(answer: DTOExamAnswer) {
    this.examAPIService
      .updateExamResult(answer)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật đáp án: ${res.ErrorString}!`);
            this.APIGetListExamQuestion(this.ExamQuestion);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode === 0
          ) {
            this.onCountAnsweredQuestion();
            this.layoutService.onSuccess(
              'Câu trả lời của bạn đã được ghi nhận!'
            );
          }
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật đáp án:  ${error}`);
          this.APIGetListExamQuestion(this.ExamQuestion);
        }
      );
  }

  APIUpdateEssayExam(essay: DTOExamQuestion) {
    this.examAPIService
      .UpdateExamEssayQuestion([essay])
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật đáp án tự luận: ${res.ErrorString}!`);
            this.APIGetListExamQuestion(this.ExamQuestion);
          }
          if (Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
            essay = res.ObjectReturn;
            this.layoutService.onSuccess(
              'Câu trả lời của bạn đã được ghi nhận!'
            );
          }
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật đáp án tự luận: ${error}`);
          this.APIGetListExamQuestion(this.ExamQuestion);
        }
      );
  }

  //NOTE
  //CHECKBOX select => gọi api update
  //Checkbox unselect => gọi api delete
  //Radio select => goi api update (kh có bỏ chọn)
  //Essay => update

  //bỏ chọn checkbox
  DeleteExamResult(answer: DTOExamAnswer) {
    this.examAPIService
      .DeleteExamResult(answer)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.layoutService.onError(`Đã xảy ra lỗi khi xóa đáp án: ${res.ErrorString}!`);
            this.APIGetListExamQuestion(this.ExamQuestion);
          }
          if (Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
            this.onCountAnsweredQuestion();
            // this.getListExamQuestion();
          }
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa đáp án: ${error}`);
          this.APIGetListExamQuestion(this.ExamQuestion);
        }
      );
  }

  // Api cập nhật lý do phúc khảo
  UpdateReEval(reEval: DTOReEval[], Properties) {
    const param = {
      ListDTO: reEval,
      Properties: Properties,
    };
    this.appealAPIService
      .UpdateReEval(param)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        (res) => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật lý do phúc khảo: ${res.ErrorString}!`);
            this.APIGetListExamQuestion(this.ExamQuestion);
          }
          if (Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
            this.IsGet = false; // Cho phép gọi api GetListExam để lấy lại trạng thái đợt mới nhất
            this.onCountAnsweredQuestion();
            this.layoutService.onSuccess(
              'Yêu cầu của bạn đã được chúng tôi ghi nhận!'
            );
            this.showDialog = false;
            this.APIGetListExamQuestion(this.ExamQuestion);
          }
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật lý do phúc khảo: ${error}`);
          this.APIGetListExamQuestion(this.ExamQuestion);
        }
      );
  }
  //#endregion

  ngOnDestroy(): void {
    // localStorage.removeItem('ExamSession');
    // this.quizSessionService.ExamSession$.next(null);
    // this.countDownSubscribe$.next();
    // this.countDownSubscribe$.complete();
    // this.ngUnsubscribe$.next();
    // this.ngUnsubscribe$.complete();
    // this.arrUnsubscribe.forEach((s) => {
    //   s?.unsubscribe();
    // });

    localStorage.removeItem('ExamSession');
    this.quizSessionService.ExamSession$.next(null);

    if (!this.countDownSubscribe$.closed) {
      this.countDownSubscribe$.next();
    }

    if (!this.countDownSubscribe$.closed) {
      this.countDownSubscribe$.complete();
    }

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    this.arrUnsubscribe.forEach((s) => {
      if (s && !s.closed) {
        s.unsubscribe();
      }
    });
  }
}
