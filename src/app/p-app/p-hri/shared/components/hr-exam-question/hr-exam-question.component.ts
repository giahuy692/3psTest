import { Component, EventEmitter, Input, Output, AfterViewInit, HostListener, ChangeDetectorRef, SimpleChanges, OnInit, OnChanges, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DTOExamAnswer } from 'src/app/p-app/p-portal/shared/dto/DTOExamAnswer.dto';
import { DTOExamQuestion } from 'src/app/p-app/p-portal/shared/dto/DTOExamQuestion.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOReEval } from '../../dto/DTOReEval.dto';


@Component({
  selector: 'app-hr-exam-question',
  templateUrl: './hr-exam-question.component.html',
  styleUrls: ['./hr-exam-question.component.scss']
})
export class HrExamQuestionComponent implements OnInit ,AfterViewInit, OnChanges{
  @ViewChild('essayAnswerInput') essayAnswerInput: ElementRef;
  //#region Input option 1
    @Input() index: number = 1;  // index của câu hỏi.
    @Input() typeOfQuestion: number = 1;  // Câu hỏi.
    @Input() question: DTOExamQuestion = new DTOExamQuestion() ;  // Câu hỏi.
    @Input() listAnswerQuestion: [] = []; // danh sách câu trả lời cho câu hỏi.
    @Input() isShowFinalMarkQuestion: boolean = false; // Hiển thị điểm câu hỏi.
    @Input() isShowFinalMarkAppeal: boolean = false; // Hiển thị điểm phúc khảo của câu hỏi.
    @Input() readonlyEssay: boolean = false; // readonly cho câu hỏi tự luận.
    @Input() disabledMultiple: boolean = false; // disabled cho câu hỏi nhiều lựa chọn.
    @Input() disabledOneChoice: boolean = false; // disabled cho câu hỏi một lựa chọn.
    @Input() isViewCorrect: boolean = false; // Tắt-Bật chế độ xem đáp án đúng. 
    @Input() isViewInCorrect: boolean = false; // Tắt-Bật chế độ xem đáp án sai. 
    @Input() isQuestionSelectedAnswer: boolean = false; // Câu hỏi đã được chọn đáp án.
    @Input() isQuestionReviewed: boolean = false; // Câu hỏi đã nhập lý do phúc khảo.
    @Input() isRemarkShow : boolean = false; // Ẩn tóm tắt câu hỏi
    @Input() isQuestionDetailShow : boolean = false; // Ẩn tóm tắt nội dung chi tiết của câu hỏi
    @Input() isQuestionAppeal: boolean = false; // bật-tắt phúc khảo câu hỏi
    @Input() readOnlyQuestionAppeal: boolean = false; // tắt/bật chế độ chỉnh sửa "Lý do phúc khảo"

    //#region phúc khảo
    // isDoubleClick: boolean = true;
    templeValueRequest = new DTOReEval(); // Giá trị tạm thời của lý do yêu cầu phúc khảo
    isAppeal: boolean = false;
    showAppeal: boolean = false;
    allowShowBtnAppeal: boolean = false;
    windowWidth = window.innerWidth;
    htmlQuestion: SafeHtml;
    hasEdit: boolean = false;
    //#endregion

  //#endregion
  


  //#region Output
  @Output() selectAnswer = new EventEmitter() // Event select answer
  @Output() valueChangeEssay = new EventEmitter() // Event select answer
  @Output() blurAppeal = new EventEmitter() // value change lý do phúc khảo
  @Output() valueChangeAppeal = new EventEmitter() // value change lý do phúc khảo
  @Output() focusAppealRequest = new EventEmitter() // Event select answer
  @Output() buttonAppealClick = new EventEmitter() // Event click button "Phúc Khảo"
  //#endregion
  

  constructor(public sanitizer: DomSanitizer,private cdr: ChangeDetectorRef){
  }
  ngOnInit(): void {
    this.CompareString()
    this.windowWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event']) onResize(event) {
    this.windowWidth = window.innerWidth;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.CompareString()
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();  
  }

  // so sánh nội dung của Remark và Question
  CompareString() {
    // Lấy nội dung HTML từ mỗi thẻ <div> và loại bỏ khoảng trắng và dấu xuống dòng
    const remarkHtml =
      this.question.Remark !== null && this.question.Remark !== '' ? this.question.Remark : '';
    const parser = new DOMParser();
    const stringQuestion = parser.parseFromString(this.question.Question, 'text/html');
    const QuestionContent = stringQuestion.body.textContent || '';
    let replaceQuestion = QuestionContent.replace(
      /\s/g,
      ''
    ).toLocaleLowerCase(); // Xóa tất cả khoảng trống
    let replaceremark = remarkHtml.replace(/\s/g, '').toLocaleLowerCase(); // Xóa tất cả khoảng trống
    // So sánh hai chuỗi HTML
    if (
      QuestionContent.includes(remarkHtml) ||
      replaceQuestion === replaceremark
    ) {
      this.question['showRemark'] = false;
      this.question['showQuestionDetail'] = true;
    } else {
      this.question['showRemark'] = true;
      this.question['showQuestionDetail'] = true;
    }
    this.showAppeal = Ps_UtilObjectService.hasListValue(this.question?.ListReEval) && Ps_UtilObjectService.hasValue(this.question?.ListReEval.find(v => Ps_UtilObjectService.hasValueString(v.Reason)));
    this.allowShowBtnAppeal = Ps_UtilObjectService.hasListValue(this.question?.ListReEval) && Ps_UtilObjectService.hasValue(this.question?.ListReEval.findIndex(v => v.StatusID == 0));
    this.htmlQuestion = Ps_UtilObjectService.hasValue(this.question.Question) ? this.sanitizer.bypassSecurityTrustHtml(this.question.Question) : null;
  }


  //#region handle selected answer
  onSelectAnswer(question: DTOExamQuestion,answer?: DTOExamAnswer) {
    this.selectAnswer.emit({answer,question})
  }

  onValueChangeEssay(question: DTOExamQuestion,answer?: DTOExamAnswer) {
    this.valueChangeEssay.emit({answer,question})
  }
  //#endregion


  //#region function cho phúc khảo
  onDbClick( index: number, value: any, ele: any){
    if(this.readOnlyQuestionAppeal === false){
      this.hasEdit = true;
      // $(`#textare-reason-${index}`).addClass('double-clicked');
      this.templeValueRequest = {...value};
      
      requestAnimationFrame(() => {
        const questionElement = document.getElementById(`appealRequest-${this.index}`);
        if (questionElement) {
          questionElement.scrollIntoView({
            behavior: 'smooth',
            block: this.windowWidth > 768 ? 'center' : 'start',
            inline: 'nearest',
          });
        }
      });
    }
      this.hasEdit = true;
    
  }

  onBlurAppeal(item:DTOExamQuestion){
    let that = this
    that.blurAppeal.emit(item)
  }

  onValueChangeAppeal(item:DTOExamQuestion){
    let that = this
    that.valueChangeAppeal.emit(item)
  }

  onButtonClick(){
    this.isAppeal = !this.isAppeal
    requestAnimationFrame(() => {
      const questionElement = document.getElementById(`appealRequest-${this.index}`);
      if (questionElement) {
        questionElement.scrollIntoView({
          behavior: 'smooth',
          block: this.windowWidth > 768 ? 'center' : 'start',
          inline: 'nearest',
        });
      }
    });
    if(this.readOnlyQuestionAppeal === false){
      this.buttonAppealClick.emit();
    }
  }

  
  //#endregion
}
