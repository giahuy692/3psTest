import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DTOQuestionGroup } from '../../shared/dto/DTOQuestionGroup.dto';
import { DTOAnswer } from '../../shared/dto/DTOAnswer.dto';
import { DTOQuestion } from '../../shared/dto/DTOQuestion.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ConfigService } from 'src/app/p-app/p-config/shared/services/config.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PayslipService } from '../../shared/services/payslip.service';
import { QuestionGroupAPIService } from '../../shared/services/question-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOCompetence } from '../../shared/dto/DTOCompetence.dto';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  State,
  distinct,
} from '@progress/kendo-data-query';
import {
  ComboBoxComponent,
  DropDownListComponent,
} from '@progress/kendo-angular-dropdowns';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { PKendoEditorComponent } from 'src/app/p-app/p-layout/components/p-kendo-editor/p-kendo-editor.component';
import { DomSanitizer } from '@angular/platform-browser';
import { DTOQuestionType } from '../../shared/dto/DTOQuestionType.dto';

@Component({
  selector: 'hri008-question-bank-detail',
  templateUrl: './hri008-question-bank-detail.component.html',
  styleUrls: ['./hri008-question-bank-detail.component.scss'],
})
export class Hri008QuestionBankDetailComponent implements OnInit {
  //#region permission
  isToanQuyen: boolean = false;
  isAllowedToCreate: boolean = false;
  isAllowedToVerify: boolean = false;
  isAllowedView: boolean = false;
  justLoaded: boolean = true; // call api một lần
  actionPerm: DTOActionPermission[] = [];
  dataPerm: DTODataPermission[] = [];
  isLock: boolean = false;
  //#endregion

  //#region variable
  // variable disable
  isQuestionGroupList: boolean = false;
  isTypeOfEvaluation: boolean = true;
  isDuration: boolean = false;
  isContentEditor: boolean = false;
  isRemark: boolean = false;
  isPopupSearch: boolean = true;
  // variable status
  isloading: boolean = false;

  //#region Subscription CallAPi
  arrUnsubscribe: Subscription[] = [];

  //#endregion

  //#region variable form
  Question = new DTOQuestion();
  QuestionGroup = new DTOQuestionGroup();
  ListQuestionGroup: DTOQuestionGroup[];
  dataListQuestionGroupFilter: DTOQuestionGroup[];
  ListQuestionType = new Subject<any>();
  ListEvaluationType = new Subject<any>();
  lastItemIsRightCode: number = 0;
  lastItemNotRightCode: number = 0;
  ScopeList: { text: string }[] = [
    { text: 'Đánh giá năng lực nhân sự' },
    { text: 'Bài kiểm tra thử' },
    { text: 'Bài kiểm tra phong trào' },
  ];
  ContentEditor: string = '';
  tempQuestion: DTOQuestion = new DTOQuestion();
  //#endregion

  //#region editor
  getFileCallback: Function;
  getFolderCallback: Function;
  indexEditor: number = null;
  @ViewChild('contentEditor') editorRef: PKendoEditorComponent;
  //#endregion

  //Competence
  ListCompetence: DTOCompetence[] = [];
  CompetenceState: State = {
    filter: { filters: [], logic: 'and' },
    sort: [],
  };

  QuestionGroupState: State = {
    filter: {
      filters: [
        { field: 'StatusID', operator: 'eq', value: 2, ignoreCase: true },
      ],
      logic: 'or',
    },
    sort: [],
  };

  //#region variable năng lực
  arrLevel: { Code: number, Level: string }[] = [
    { Code: 1, Level: 'Mức độ 1' },
    { Code: 2, Level: 'Mức độ 2' },
    { Code: 3, Level: 'Mức độ 3' },
    { Code: 4, Level: 'Mức độ 4' },
    { Code: 5, Level: 'Mức độ 5' },
  ];
  //#endregion

  //#region Variable dialog \\
  openedDialog: boolean = false;
  valueQuestionName: string = null;
  valueQuestionLevelName: string = null;
  valueQuestionCompetenceName: string = null;
  arrayQuestion: DTOQuestion[] = [];
  //-- Type question -- \\
  openedDialogTypeQuestion: boolean = false;
  valueChangeTypeQuestion: DTOQuestionType = new DTOQuestionType();
  oldValueTypeQuestion: DTOQuestion = new DTOQuestion();
  // -- Level --- \\
  openLevelDialog: boolean = false;
  valueChangeLevel: number = null;
  tempOldValue: any;
  // -- Competence -- \\
  openDeleteCompetenceDialog: boolean = false;
  tempValueCompetenceDialog: DTOCompetence = new DTOCompetence();
  //#endregion

  //#region review
  showRemark: boolean = true;
  showQuestionDetail: boolean = true;
  //#endregion

  //#region variable Answer Options
  ListAnswer: DTOAnswer[] = [];
  realListAnser: DTOAnswer[] = [];
  newAnswer = new DTOAnswer();
  arrBtnStatus: { text: string, class: string, code: string, link?: any, type?: string }[] = [];
  oldQuestion: string; // lưu giá trị cũ của trường Question để kiểm tra giá trị cũ mới
  YesNoAnswerList: DTOAnswer[] = [];
  //#endregion
  //#endregion

  //#region Init
  constructor(
    public menuService: PS_HelperMenuService,
    public service: ConfigService,
    public servicePayslip: PayslipService,
    private cdr: ChangeDetectorRef,
    private serviceQuestionApi: QuestionGroupAPIService,
    private layoutService: LayoutService,
    public apiServicePolicy: MarNewsProductAPIService,
    public sanitizer: DomSanitizer
  ) {
    this.dataQuestionCompetence = this.ListCompetence.slice();
  }

  ngOnInit(): void {
    let that = this;

    // this.menuService.activeMenu({
    //   "Name": "Câu hỏi",
    //   "Actived": false,
    //   "Code": "hri008-question-bank-detail",
    //   "Link": "/hri/hri008-question-bank-detail",
    //   "Type": "",
    //   "LstChild": []
    // });
    // Lấy phân quyền của người đăng nhập 
    let changePermission = this.menuService
      .changePermission()
      .subscribe((res: DTOPermission) => {
        this.isloading = false;
        if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
          that.justLoaded = false;
          that.actionPerm = distinct(res.ActionPermission, 'ActionType');

          that.isToanQuyen =
            that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          that.isAllowedToCreate =
            that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          that.isAllowedToVerify =
            that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
          that.isAllowedView =
            that.actionPerm.findIndex((s) => s.ActionType == 6) > -1 || false;


          that.dataPerm = distinct(res.DataPermission, 'Warehouse');
          
        }
      });

      let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
        if(Ps_UtilObjectService.hasValue(res)){
          this.servicePayslip.getCacheQuestion().subscribe((res) => {
            this.Question = res
            this.APIGetQuestion(this.Question);
            // this.AutoCreateAnswer();
            this.APIGetListQuestionGroupTree(this.QuestionGroupState); // lấy danh sách phân nhóm câu hỏi
            this.APIGetListEvaluationType(); // lấy danh sách cách tính điểm
            this.APIGetListQuestionType(); // lấy danh sách loại câu hỏi

          });
        }
      })
    this.getFileCallback = this.onGetFile.bind(this); // Lấy file ảnh 
    this.getFolderCallback = this.onGetFolder.bind(this); // Lấy folder ảnh

    this.arrUnsubscribe.push(changePermission, permissionAPI);
  }

  ngAfterViewInit(): void {
    if (this.Question.TypeOfQuestion != 0) {
      this.isTypeOfEvaluation = false;
    }
    this.oldQuestion = this.Question.Question;
    this.cdr.detectChanges();
  }

  // Handle load lại dữ liệu của trang 
  onLoadPage() {
    this.APIGetQuestion(this.Question);
  }

  /** 
   * Handle tạo câu trả lời giả cho câu hỏi
   * Mặc định là phải hiển thị 4 câu trả lời cho người dùng điền
   * */

  onAutoCreateAnswer() {
    this.ListAnswer = [];
    if (this.ListAnswer.length < 4 && this.Question.TypeOfQuestion !== 4) {
      for (let i = this.ListAnswer.length; i < 4; i++) {
        let itemAnswer = {
          Code: 0,
          Company: 1,
          Answer: '',
          ColumnID: null,
          Question: this.Question.Code,
          IsRight: false,
          Mark: 0,
          MarkID: 0,
          RowID: null,
          IsRow: true,
          Remark: '',
          CreateBy: null,
          CreateTime: null,
          LastModifiedBy: null,
          LastModifiedTime: null,
          RefID: null,
          ReasonChooseAnswerForAppeal: null,
        };
        this.ListAnswer.push(itemAnswer);
      }
    }
  }

  // Kiểm tra quyền để hạn chế 1 số tính năng mang biến isLock 
  onCheckPermistion() {
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
    const statusID = this.Question.StatusID;

    // Kiểm tra điều kiện "Chỉnh sửa"
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4) || canVerify && statusID === 1) {
      this.isLock = false; // Cho phép chỉnh sửa
    } else {
      this.isLock = true; // Bị disabled
    }
  }
  // Binding filter khía cạnh phù hợp với mức độ đang được chọn và khía cạnh đã tồn tại trong câu hỏi
  // Lọc ra để lấy những khía canh không trùng với khía cạnh đã chọn
  onLoadFilter(res: DTOQuestion) {
    var compositeFilter: CompositeFilterDescriptor = {
      logic: 'and',
      filters: [],
    };

    if (res.ListCompetence.length !== 0) {
      res.ListCompetence.forEach((v) => {
        var competenceFilter: FilterDescriptor = {
          field: 'Competence',
          operator: 'neq',
          value: v.Competence,
          ignoreCase: true,
        };
        compositeFilter.filters.push(competenceFilter);
      });
    }

    const LevelIDFilter: FilterDescriptor = {
      field: 'LevelID',
      operator: 'eq',
      value: res.LevelID,
      ignoreCase: true,
    };
    compositeFilter.filters.push(LevelIDFilter);

    this.CompetenceState.filter = compositeFilter;

    this.APIGetListQuestionCompetence(this.CompetenceState);
  }

  // Hàm dùng để kiểm tra cách trường đã điền chưa và thông báo cho người dùng
  onCheckedFields(type: number): boolean {
    var answerRight = this.ListAnswer.findIndex((v) => v.IsRight === true);
    if (type > 0 && !Ps_UtilObjectService.hasValueString(this.Question.QuestionID) ) {
      this.layoutService.onError('Vui lòng nhập mã câu hỏi');
      return false;
    }

    if (type > 0 && !Ps_UtilObjectService.hasValueString(this.Question.Question)) {
      this.layoutService.onError('Vui lòng nhập tên câu hỏi!');
      return false;
    }

    if (type > 0 && !Ps_UtilObjectService.hasValueString(this.Question.Remark)) {
      this.layoutService.onError('Vui lòng nhập tóm tắt câu hỏi!');
      return false;
    }

    if (type > 0 && !Ps_UtilObjectService.hasValue(this.Question.Category)) {
      this.layoutService.onError('Vui lòng chọn phân nhóm câu hỏi!');
      return false;
    }

    if (type > 0 && !Ps_UtilObjectService.hasValue(this.Question.Duration)) {
      this.layoutService.onError('Vui lòng nhập thời làm bài của câu hỏi!');
      return false;
    }

    if (type > 0 && !Ps_UtilObjectService.hasValue(this.Question.Category) &&
      !Ps_UtilObjectService.hasValueString(this.Question.CategoryName)
    ) {
      this.layoutService.onError('Vui lòng chọn phân nhóm câu hỏi!');
      return false;
    }

    if (type > 0 && (!this.Question.AppliedCompetenceTest && !this.Question.AppliedEventTest && !this.Question.AppliedPreTest)) {
      this.layoutService.onError('Vui lòng chọn ít nhất một phạm vị áp dụng!');
      return false;
    }

    if (type > 0 && !Ps_UtilObjectService.hasValue(this.Question.LevelID)
    ) {
      this.layoutService.onError('Vui lòng chọn mức độ khó của câu hỏi!');
      return false;
    }

    if (type > 0 && this.Question.ListCompetence.length == 0) {
      this.layoutService.onError('Vui lòng chọn năng lực cho câu hỏi!');
      return false;
    }

    if (Ps_UtilObjectService.hasValueString(this.Question.QuestionID) &&
      Ps_UtilObjectService.hasValueString(this.Question.Question) &&
      Ps_UtilObjectService.hasValueString(this.Question.Remark) &&
      Ps_UtilObjectService.hasValue(this.Question.Category) &&
      Ps_UtilObjectService.hasValueString(this.Question.CategoryName) &&
      (this.Question.AppliedCompetenceTest || this.Question.AppliedEventTest || this.Question.AppliedPreTest) &&
      Ps_UtilObjectService.hasValue(this.Question.Duration) &&
      Ps_UtilObjectService.hasValue(this.Question.LevelID) &&
      this.Question.ListCompetence.length !== 0 &&
      this.Question.Code !== 0
    ) {
      if (this.Question.TypeOfQuestion == 1 || this.Question.TypeOfQuestion == 4) {
        // Loại câu hỏi 1:
        // - ListAnswer.lenght !== 0
        if (answerRight !== -1) {
          return true;
        } else {
          if (type > 0){
            this.layoutService.onError('Vui lòng tạo câu trả lời cho câu hỏi!');
            return false;
          }
        }
      } else if (this.Question.TypeOfQuestion == 2) {
        // Loại câu hỏi 2:
        // - TypeOfEvaluation
        // - TypeOfEvaluationName
        // - ListAnswer.lenght !== 0

        if (Ps_UtilObjectService.hasValue(this.Question.TypeOfEvaluation) &&
          answerRight !== -1 &&
          Ps_UtilObjectService.hasValue(this.Question.TypeOfEvaluationName)
        ) {
          return true;
        } else {
          if (type > 0){
            this.layoutService.onError('Vui lòng chọn cách tính điểm và tạo câu trả lời cho câu hỏi, chọn đáp án đúng!');
          }
          return false;
        }
      } else if (this.Question.TypeOfQuestion == 3) {
        // Loại câu hỏi 3:
        // - RefAnswer
        if (Ps_UtilObjectService.hasValue(this.Question.RefAnswer) ||
          this.Question.RefAnswer !== '') {
          return true;
        } else {
          if (type > 0){
            this.layoutService.onError('Vui lòng nhập đáp án gợi ý cho câu hỏi!');
            return false
          }
        }

        if (!Ps_UtilObjectService.hasValue(this.Question.Min)) {
          this.layoutService.onError('Vui lòng nhập Số ký tự tối thiểu!');
          return true;
        }
        if (!Ps_UtilObjectService.hasValue(this.Question.Max)) {
          this.layoutService.onError('Vui lòng nhập Số ký tự tối đa!')
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
    return true;
  }

  // Hàm dùng để render các action được phép xuất hiện theo quyền của người dùng
  onSetupBtnStatus() {
    this.arrBtnStatus = [];

    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;

    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
    var statusID = this.Question.StatusID;

    // Push "Xóa" khi có quyền tạo hoặc toàn quyền và statusID === 0 và không có câu trả lời nào,không có khía cạnh
    if (canCreateOrAdmin && this.Question.Code > 0 && !Ps_UtilObjectService.hasListValue(this.realListAnser) && !Ps_UtilObjectService.hasListValue(this.Question.ListCompetence) && this.Question.StatusID === 0) {
      this.arrBtnStatus.push({
        text: 'XÓA CÂU HỎI',
        class: 'k-button btn-hachi hachi-warning',
        code: 'trash',
        type: 'delete',
      });
    }


    // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && this.Question.Code > 0 && (statusID === 0 || statusID === 4) && this.Question.Code > 0) {
      this.arrBtnStatus.push({
        text: 'GỬI DUYỆT',
        class: 'k-button btn-hachi hachi-primary',
        code: 'redo',
        link: 1,
      });
    }

    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    if (canVerify && (statusID === 1 || statusID === 3) && this.Question.Code > 0) {
      this.arrBtnStatus.push({
        text: 'PHÊ DUYỆT',
        class: 'k-button btn-hachi hachi-primary',
        code: 'check-outline',
        link: 2,
      });

      // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
      this.arrBtnStatus.push({
        text: 'TRẢ VỀ',
        class: 'k-button btn-hachi hachi-warning hachi-secondary',
        code: 'undo',
        link: 4,
      });
    }

    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    if (canVerify && statusID === 2 && this.Question.Code > 0) {
      this.arrBtnStatus.push({
        text: 'NGƯNG HIỂN THỊ',
        class: 'k-button btn-hachi hachi-warning',
        code: 'minus-outline',
        link: 3,
      });
    }


    if (canCreateOrAdmin) {
      this.arrBtnStatus.push({
        text: 'THÊM MỚI',
        class: 'k-button btn-hachi hachi-primary',
        code: 'plus',
        type: 'add',
      });
    }
  }

  //#endregion

  //#region Xử lý dropdownlist

  // Hàm được xây dựng để xử lý chung cho 2 loại đóng tượng là loại câu hỏi và khía cạnh 
  onOpenDropList(type: string): void {
    if (type == 'typeOfQuestion') {
      let questionType = { ...this.Question };
      this.oldValueTypeQuestion = questionType;
    } else if (type == 'competence') {
      let questionCompetence = { ...this.Question };
      this.tempOldValue = questionCompetence;
    }
  }

  // Hàm này được xây dựng để dùng chung cho 3 đối tượng có phân nhóm, loại câu hỏi, cách tính điểm
  onSelectionChangeDropdownList(value: any, title: string): void {
    // Luồng cập nhật phân nhóm câu hỏi 
    if (title == 'category') {
      this.Question.Category = value.Code;
      this.Question.CategoryName = value.CategoryName;
      this.handleUpdateQuestion(['Category', 'CategoryName']);
      this.onSetupBtnStatus();
    }

    // Luồng cập nhật loại câu hỏi 
    if (title == 'typeOfQuestion') {
      let properties = ['TypeOfQuestion', 'TypeOfQuestionName', 'TypeOfEvaluation', 'TypeOfEvaluationName']

      //- Nếu cập nhật loại câu hỏi khác câu hỏi tự luận thì reset giá trị RefAnswer
      if(value.TypeData != 3 && Ps_UtilObjectService.hasListValue(this.Question.RefAnswer?.trim())){
        this.Question.RefAnswer = ''
        properties.push('RefAnswer')
      }

      //- Nếu chuyển loại câu hỏi khác mà câu hỏi đó đang có đáp án thì mở popup xác nhận và reset đáp án
      if (this.Question.Code > 0 && this.realListAnser.length > 0 &&
        Ps_UtilObjectService.hasValue(this.Question.TypeOfQuestion)) {
        this.openedDialogTypeQuestion = true;
        this.valueChangeTypeQuestion = value;
      } 
      //- Xử lý cập nhật loại câu hỏi
      else {
        switch (value.TypeData) {
          case 1:
            this.isTypeOfEvaluation = true;
            this.Question.TypeOfQuestion = value.TypeData;
            this.Question.TypeOfQuestionName = value.TypeOfQuestion;
            this.Question.TypeOfEvaluation = null;
            this.Question.TypeOfEvaluationName = null;
            this.handleUpdateQuestion(properties);
            break;
          case 2:
            this.isTypeOfEvaluation = false;
            this.Question.TypeOfQuestion = value.TypeData;
            this.Question.TypeOfQuestionName = value.TypeOfQuestion;
            this.Question.TypeOfEvaluation = 1;
            this.Question.TypeOfEvaluation = 1;
            this.Question.TypeOfEvaluationName = 'Chọn đúng tất cả đáp án';
            this.handleUpdateQuestion(properties);
            break;
          case 3:
            this.isTypeOfEvaluation = true;
            this.Question.TypeOfQuestion = value.TypeData;
            this.Question.TypeOfQuestionName = value.TypeOfQuestion;
            this.Question.TypeOfEvaluation = null;
            this.Question.TypeOfEvaluationName = null;
            this.Question.Min = 0;
            this.Question.Max = 4000;
            properties.push('Min', 'Max')
            this.handleUpdateQuestion(properties);
            break;
          case 4:
            this.isTypeOfEvaluation = true;
            this.Question.TypeOfQuestion = value.TypeData;
            this.Question.TypeOfQuestionName = value.TypeOfQuestion;
            this.Question.TypeOfEvaluation = null;
            this.Question.TypeOfEvaluationName = null;
            this.handleYesNO();
            break;
        }
        this.onSetupBtnStatus();
      }
    }

    //- Luồng cập nhật cách tính điểm
    if (title == 'typeOfEvaluation') {
      this.Question.TypeOfEvaluation = value.TypeData;
      this.Question.TypeOfEvaluationName = value.TypeOfEvaluation;
      // switch (value.TypeData) {
      //   case 1:
      //     this.Question.TypeOfEvaluation = 1;
      //     this.onAutoCreateAnswer();
      //     break;
      //   case 2:
      //     this.Question.TypeOfEvaluation = 2;
      //     this.onAutoCreateAnswer();
      //     break;
      //   case 3:
      //     this.Question.TypeOfEvaluation = 3;
      //     this.onAutoCreateAnswer();
      //     break;
      // }
      this.handleUpdateQuestion(['TypeOfEvaluation', 'TypeOfEvaluationName']);
      this.onSetupBtnStatus();
    }
  }

  //#endregion

  //#region render btn status


  handleBtnStatus(item: { text: string, class: string, code: string, link?: any, type?: string }) {
    if (this.Question.Code != 0) {

      // if (item.link == 1 && this.onCheckedFields(1)) {
      //   console.log('a');
      //   var listdataUpdate = [];
      //   if (this.Question.StatusID == 0 || this.Question.StatusID == 4) {
      //     listdataUpdate.push(this.Question);
      //   }
      //   let StatusID = parseInt(item.link);
      //   this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
      // } else if (item.link == 2 && this.onCheckedFields(1)) {
      //   var listdataUpdate = [];
      //   if (this.Question.StatusID == 1 || this.Question.StatusID == 3) {
      //     listdataUpdate.push(this.Question);
      //   }
      //   let StatusID = parseInt(item.link);
      //   this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
      //   console.log('b');

      // } else if (item.link == 3) {
      //   var listdataUpdate = [];
      //   if (this.Question.StatusID == 2) {
      //     listdataUpdate.push(this.Question);
      //   }
      //   let StatusID = parseInt(item.link);
      //   this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
      //   console.log('c');

      // } else if (item.link == 4) {
      //   var listdataUpdate = [];
      //   if (this.Question.StatusID == 1 || this.Question.StatusID == 3) {
      //     listdataUpdate.push(this.Question);
      //   }
      //   let StatusID = parseInt(item.link);
      //   this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
      //   console.log('d');

      // } else if (item.type == 'add') {
      //   this.Question = new DTOQuestion();
      //   this.onAutoCreateAnswer();
      //   this.realListAnser = [];
      //   // this.editorRef.valueChange.emit(' ');
      //   // this.editorRef.content = ''
      //   this.onCheckPermistion();
      //   console.log('e');

      // } else if (item.type == 'delete') {
      //   this.openedDialog = true;
      //   this.valueQuestionName = this.Question.Remark;
      //   console.log('f');

      // }

      // Điều kiện theo item.link 
      if (item.link > 0) {
        let StatusID = 0;
        switch (item.link) {
          case 1:
            if (this.onCheckedFields(1)) {
              var listdataUpdate = [];
              if (this.Question.StatusID === 0 || this.Question.StatusID === 4) {
                listdataUpdate.push(this.Question);
              }
              StatusID = parseInt(item.link);
              // this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
            }
            break;
          case 2:
            if (this.onCheckedFields(1)) {
              var listdataUpdate = [];
              if (this.Question.StatusID === 1 || this.Question.StatusID === 3) {
                listdataUpdate.push(this.Question);
              }
              StatusID = parseInt(item.link);
              // this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
            }
            break;
          case 3:
            var listdataUpdate = [];
            if (this.Question.StatusID === 2) {
              listdataUpdate.push(this.Question);
            }
            StatusID = parseInt(item.link);
            // this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
            break;
          case 4:
            if (this.onCheckedFields(1)) {
              var listdataUpdate = [];
              if (this.Question.StatusID === 1 || this.Question.StatusID === 3) {
                listdataUpdate.push(this.Question);
              }
              StatusID = parseInt(item.link);
              // this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
            }
            break;
          default:
            break;
        }
        this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
      }

      // Điều kiện theo item.type 
      if (item.type === 'add') {
        this.Question = new DTOQuestion();
        this.onAutoCreateAnswer();
        this.realListAnser = [];
        this.onCheckPermistion();
      } else if (item.type === 'delete') {
        this.openedDialog = true;
        this.valueQuestionName = this.Question.Remark;
      }
      
    } else if (item.type == 'add') {
      this.Question = new DTOQuestion();
      this.onAutoCreateAnswer();
      this.realListAnser = [];
      this.editorRef.valueChange.emit(' ');
      this.editorRef.content = ''
      this.onCheckPermistion();
    }
    this.onSetupBtnStatus();
  }

  // Hàm thêm mới 1 đối tượng câu trả lời 
  onAddAnswer() {
    const newRow = {
      Code: 0,
      Company: 1,
      Answer: '',
      ColumnID: null,
      Question: this.Question.Code,
      IsRight: false,
      Mark: 0,
      MarkID: 0,
      RowID: null,
      IsRow: true,
      Remark: '',
      CreateBy: null,
      CreateTime: null,
      LastModifiedBy: null,
      LastModifiedTime: null,
      RefID: null,
      ReasonChooseAnswerForAppeal: null,
    };
    this.ListAnswer.push(newRow);
  }
  //#endregion

  //#region Xử lý giá trị radio được chọn
  onOptionChange(value: DTOAnswer) {
    let arrMark = [];
    if (value.Code !== 0 && value.Answer !== '') {
      for (let i = 0; i < this.ListAnswer.length; i++) {
        if (
          this.ListAnswer[i].Code !== value.Code &&
          this.ListAnswer[i].Mark !== 0
        ) {
          this.ListAnswer[i].Mark = 0;
          this.ListAnswer[i].IsRight = false;
        }
      }
      value.IsRight = true;
      value.Mark = 100;
      arrMark.push(value);
      this.onUpdateMark(arrMark, 'multiple');
    } else {
      this.layoutService.onError('Chưa có nội dung cho câu trả lời!');
    }
  }

  onInputAnswerChange(value: DTOAnswer) {
    if (value.Code != 0 && value.Answer == '') {
      this.APIDeleteAnswer([value]);
    } else {
      this.onUpdateAnswer([value], 'single');
    }
  }


  /**
   * Xử lý loại câu hỏi Yes/No
   */
  handleYesNO() {
    var a = this.serviceQuestionApi
      .UpdateQuestion(this.Question, ['TypeOfQuestion', 'TypeOfQuestionName', 'TypeOfEvaluation', 'TypeOfEvaluationName'])
      .subscribe((res) => {
        if (res.ErrorString != null) {
          this.layoutService.onError(`Giá trị nhập vào không hợp lệ`);
        }

        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.Question = res.ObjectReturn;
          this.oldValueTypeQuestion = res.ObjectReturn;
          this.tempQuestion = { ...res.ObjectReturn }; // lưu giá trị trước khi thay đổi

          if (this.Question.TypeOfQuestion == 4) {
            this.YesNoAnswerList = [
              {
                Code: 0, Company: 1, Answer: 'Yes', IsRow: true, Question: this.Question.Code,
                ColumnID: null, RowID: null, IsRight: false, Mark: 0, MarkID: 0,
                Remark: null, CreateBy: null, CreateTime: null, LastModifiedBy: null, LastModifiedTime: null, RefID: null
              },
              {
                Code: 0, Company: 1, Answer: 'No', IsRow: true, Question: this.Question.Code,
                ColumnID: null, RowID: null, IsRight: false, Mark: 0, MarkID: 0,
                Remark: null, CreateBy: null, CreateTime: null, LastModifiedBy: null, LastModifiedTime: null, RefID: null
              },

            ];
            this.isloading = true;
            for (let i = 0; i < this.YesNoAnswerList.length; i++) {
              var b = this.serviceQuestionApi
                .UpdateAnswer(this.YesNoAnswerList[i])
                .subscribe(
                  (res) => {
                    if (res.ErrorString != null) {
                      this.layoutService.onError(
                        `Đã xảy ra lỗi khi ${res.ErrorString}`
                      );
                    }
                    if (
                      Ps_UtilObjectService.hasValue(res) &&
                      Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
                      res.StatusCode == 0
                    ) {
                      for (let x = 0; x < this.ListAnswer.length; x++) {
                        if (this.ListAnswer[x].Code === 0) {
                          this.ListAnswer[x] = res.ObjectReturn;
                          break;
                        }
                      }
                      this.tempAnswer = { ...res.ObjectReturn };
                      if (i === this.YesNoAnswerList.length - 1) {
                        this.layoutService.onSuccess('Tạo đáp án thành công!');
                        this.APIGetListAnswer(this.Question);
                      }
                      this.onSetupBtnStatus();
                      this.isloading = false;
                    }
                  },
                  (error) => {
                    this.layoutService.onError(`Đã xảy ra lỗi khi ${error}`);
                    this.isloading = false;
                  }
                );
            }
          }
          this.arrUnsubscribe.push(a, b)
          this.isloading = false;
        }
      });
  }

  //#region Xử lý việc tính % điểm cho số câu hỏi đúng của multiple
  // Không chọn đáp án sai + chọn đúng tất cả các đáp án: điểm 100%. Các trường hợp khác điểm 0
  // Không chọn đáp án sai + chọn đúng đáp án nào thì được % điểm của đáp án đó. Điểm cuối cùng bằng tổng % các đáp án đúng được chọn
  // Phải chọn ít nhất 1 đáp án + cứ 1 đáp án sai được chọn sẽ bị trừ % điểm của đáp án sai. Điểm cuối cùng 100% - (%điểm trừ các đáp án sai). Điểm cuối cùng nhỏ nhất là 0

  onForcusQuestion(){
    this.tempQuestion = {...this.Question}
  }
  
  // Handle update question
  handleUpdateQuestion(properties: Array<string>): void {
    //- Kiểm tra người dùng có bỏ trống trường Mã câu hỏi không?
    if (!Ps_UtilObjectService.hasValueString(this.Question.QuestionID?.trim())) {
      this.Question.QuestionID = this.tempQuestion.QuestionID
      return this.layoutService.onWarning('Mã câu hỏi không được để trống');
    }

    //- Nếu tạo mới thì phải cập nhật loại câu hỏi Câu hỏi 1 lựa chọn cho câu hỏi được tạo mới
    if (Ps_UtilObjectService.hasValueString(this.Question.QuestionID?.trim()) && this.Question.Code == 0) {
      this.Question.TypeOfQuestion = 1,
        this.Question.TypeOfQuestionName = 'Câu hỏi 1 lựa chọn',
        properties.push('TypeOfQuestion', 'TypeOfQuestionName');
      this.APIUpdateQuestion(this.Question, properties);
      this.realListAnser = [];
      return;
    }

    //- Nếu như nhập tóm tắt câu hỏi khi mô tả đang trống thì cập nhật nội dung của mô tả giống với nội dung của tóm tắt
    if (Ps_UtilObjectService.hasValueString(this.Question.QuestionID?.trim()) && properties.findIndex(s => s == 'Remark') != -1
      && !Ps_UtilObjectService.hasValueString(this.Question.Question?.trim())) {
      this.Question.Question = this.Question.Remark;
      properties.push('Question');
      this.APIUpdateQuestion(this.Question, properties);
      return;
    }

    //- Nếu không thuộc các trường hợp trên thì cập nhật nội dung cho từng property
    this.APIUpdateQuestion(this.Question, properties);

    //#region cũ cũ
    // else if (
    //   this.Question.QuestionID !== '' &&
    //   this.Question.Code !== 0 && this.Question[property[0]] !== this.tempQuestion[property[0]]
    // ) {
    //   var isRemark = property.findIndex(s => s == 'Remark');
    //   if (isRemark != -1 && Ps_UtilObjectService.hasValueString(this.Question.Question) == false) {
    //     this.Question.Question = this.Question.Remark;
    //     property.push('Question');
    //   }
    //   this.APIUpdateQuestion(this.Question, property);
    // } else if (this.Question.QuestionID == '' && this.Question.Code == 0) {
    //   this.layoutService.onError('Mã câu hỏi không được để trống khi tạo mới!');
    // } else if (
    //   this.Question.QuestionID == '' &&
    //   this.Question.Code !== 0 &&
    //   this.Question.Code !== 0 &&
    //   this.Question[property[0]] !== this.tempQuestion[property[0]]
    // ) {
    //   this.Question[property[0]] = this.tempQuestion[property[0]];
    //   this.layoutService.onError(
    //     'Mã câu hỏi không được để trống khi cập nhật!'
    //   );
    // } else {
    //   this.APIUpdateQuestion(this.Question, property);
    // }
    //#endregion
  }

  //#region option 1 multiple choose
  tempMark: DTOAnswer = new DTOAnswer();
  tempAnswer: DTOAnswer = new DTOAnswer();
  oldListAnswer: DTOAnswer[] = [];

  onFocusMark(value: any) {
    this.tempMark = { ...value };
    this.oldListAnswer = JSON.parse(JSON.stringify(this.ListAnswer));
  }

  focusAnswer(value: any): void {
    this.tempAnswer = { ...value };
  }

  // Hàm xử lý mảng liên quan đó đáp án phần câu đúng/sai/check đầu/ non-check cuổi..
  handleArrMark() {
    const selectedItems = this.ListAnswer.filter(
      (item) => item.IsRight && item.Answer !== ''
    );
    const itemLastChecked = selectedItems[selectedItems.length - 1]; // Lấy item cuối cùng được checked
    this.lastItemIsRightCode = itemLastChecked?.Code;
    const AnswerFalseList = this.ListAnswer.filter(
      // Lấy item không được checked
      (item) => item.IsRight === false
    );
    const itemLastNotCheck = AnswerFalseList[AnswerFalseList.length - 1]; //Lấy item cuối cùng không được check
    this.lastItemNotRightCode = itemLastNotCheck?.Code;
  }

  //#region update mark
  onCalculateMark(value: DTOAnswer, typeAction: string) {
    if (typeAction === 'not') {
      this.oldListAnswer = JSON.parse(JSON.stringify(this.ListAnswer));
    }
    const selectedItems = this.ListAnswer.filter(
      (item) => item.IsRight && item.Answer !== '' && item.Code > 0
    ); // Lấy các đáp án đúng.
    const itemLastChecked = selectedItems[selectedItems.length - 1]; // Lấy item cuối cùng của đáp án đúng.
    this.lastItemIsRightCode = itemLastChecked?.Code; // Xác định item nào bị disable trong các đáp án đúng.

    this.lastItemNotRightCode = itemLastChecked?.Code; // Xác định item nào bị disable trong các đáp án sai.

    const AnswerFalseList = this.ListAnswer.filter(
      // Lấy item không được checked.
      (item) => item.IsRight === false && item.Code > 0
    );
    const itemNotCheckList = AnswerFalseList.slice(
      0,
      AnswerFalseList.length - 1
    ); // Lấy các đáp án sai ở trước đáp án cuối cùng trong các đáp án sai
    const itemLastNotCheck = AnswerFalseList[AnswerFalseList.length - 1]; //Lấy item cuối cùng không được check.
    this.lastItemNotRightCode = itemLastNotCheck?.Code; // Xác định item nào bị disable trong các đáp án sai.

    selectedItems.forEach((v) => {
      // Chuyển điểm của các đáp án đúng về số dương.
      v.Mark = Math.abs(v.Mark);
    });

    if (this.Question.TypeOfEvaluation == 3) {
      // chuyển điểm của các đáp án sai về số âm.
      this.ListAnswer.forEach((v) => {
        if (v.IsRight == false && v.Mark > 0) {
          v.Mark = v.Mark * -1;
        }
      });
    }

    let arrUpdate = [];

    if (selectedItems.length < 1) {
      this.ListAnswer.forEach((v) => {
        if (v.IsRight === false && v.Mark !== 0 && v.Answer !== '') {
          v.Mark = 0;
          // this.DeleteMark([v])
          arrUpdate.push(v);
        }
      });
    }

    if (typeAction === 'not') {
      if (selectedItems.length === 1) {
        arrUpdate = this.handleSingleSelectedItem(arrUpdate);
      } else if (selectedItems.length > 1) {
        arrUpdate = this.handleMultipleSelectedItems(arrUpdate, selectedItems);
      }

      if (this.Question.TypeOfEvaluation == 1 || this.Question.TypeOfEvaluation == 2) {
        this.ListAnswer.forEach((v) => {
          if (v.IsRight === false && v.Mark !== 0) {
            // v.Mark = 0;
            this.APIDeleteMark([v]);
            arrUpdate.push(v);
          }
        });
      }
    } else if (typeAction === 'input' && this.tempMark.Mark !== value.Mark) {
      arrUpdate = this.handleInputValue(value, selectedItems);

      if (this.Question.TypeOfEvaluation === 1 || this.Question.TypeOfEvaluation === 2) {
        this.ListAnswer.forEach((v) => {
          if (v.IsRight === false && v.Mark !== 0 && v.Answer !== '') {
            v.Mark = 0;
            arrUpdate.push(v);
          }
        });
      }

      if (this.Question.TypeOfEvaluation === 3) {
        let totalNotSelect = 0;
        for (let a = 0; a < itemNotCheckList.length; a++) {
          totalNotSelect = totalNotSelect + itemNotCheckList[a].Mark;
          arrUpdate.push(itemNotCheckList[a]);
        }
        itemLastNotCheck.Mark = (100 + totalNotSelect) * -1;
        if (itemLastNotCheck.Mark >= 0) {
          arrUpdate = this.oldListAnswer
          this.layoutService.onError(`Điểm bạn nhập vào cho câu trả lời: ${value.Answer} không hợp lệ!`)
        } else {
          arrUpdate.push(itemLastNotCheck);
        }
      }
    }

    // Kiểm tra sự khác biệt về điểm giữa oldListAnswer và arrUpdate
    const arrUpdateWithDifferentMark = arrUpdate.filter((item) => {
      const oldItem = this.oldListAnswer.find((old) => old.Code === item.Code);
      // trả về item thỏa điều kiện Mark phải khác giá trị cũ
      return (
        oldItem && oldItem.Mark !== item.Mark && oldItem.MarkID == item.MarkID
      );
    });

    if (arrUpdateWithDifferentMark.length == 0) {
      this.APIGetListAnswer(this.Question);
    } else {
      this.onUpdateMark(arrUpdateWithDifferentMark, 'multiple');
    }
  }

  handleFilterGroupList(value) {
    this.dataListQuestionGroupFilter = this.ListQuestionGroup.filter(
      (s) => s.CategoryName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  handleSingleSelectedItem(arrUpdate: any[]) {
    let arrUpdateTemp = arrUpdate;

    this.ListAnswer.forEach((answer) => {
      if (answer.IsRight === true) {
        answer.Mark = 100;
        arrUpdateTemp.push(answer);
      }
    });

    if (this.Question.TypeOfEvaluation === 3) {
      arrUpdateTemp = this.handleNegativeInputValue(arrUpdateTemp);
    }

    return arrUpdateTemp;
  }

  handleMultipleSelectedItems(arrUpdate: any[], selectedItems: any[]) {
    if (100 % selectedItems.length != 0) {
      arrUpdate = this.handleNonEvenlyDivided(selectedItems, arrUpdate);
    } else if (100 % selectedItems.length == 0) {
      arrUpdate = this.handleEvenlyDivided(selectedItems);
    }

    if (this.Question.TypeOfEvaluation === 3) {
      arrUpdate = this.handleNegativeInputValue(arrUpdate);
    }

    return arrUpdate;
  }

  handleNonEvenlyDivided(selectedItems: any[], arrUpdate: any[]) {
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

  handleEvenlyDivided(selectedItems: any[]) {
    let arrUpdate = [];
    for (let i = 0; i < selectedItems.length; i++) {
      selectedItems[i].Mark = Math.round(100 / selectedItems.length);
      arrUpdate.push(selectedItems[i]);
    }
    return arrUpdate;
  }

  handleInputValue(value: any, selectedItems: DTOAnswer[]) {
    let arrUpdate = [];
    let totalMark = 0;
    let tempListSelectedItem = JSON.parse(JSON.stringify(this.oldListAnswer.filter(v => v.IsRight == true && v.Code > 0)))
    const arrNotLast = selectedItems.slice(0, selectedItems.length - 1);
    const itemLastChecked = selectedItems[selectedItems.length - 1];
    const arrNotSelectedItems = this.ListAnswer.filter(
      (item) => item.IsRight === false && item.Answer !== '' && item.Code > 0
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
    if (itemLastChecked.Mark <= 0) {
      arrUpdate = tempListSelectedItem
      this.layoutService.onError(`Điểm bạn nhập vào cho ${value.Answer} không hợp lệ!`)
    } else {
      arrUpdate.push(itemLastChecked);
    }
    return arrUpdate;
  }

  handleNegativeInputValue(arrUpdate: any[]) {
    let totalNotSelect = 0;
    const arrNotSelectedItems = this.ListAnswer.filter(
      (item) => item.IsRight === false && item.Answer !== '' && item.Code > 0
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

  //#endregion

  onDeleteAnswer(answer: any) {
    let arr = [];
    arr.push(answer);
    this.APIDeleteAnswer(arr);
  }

  onResetMark() {
    let arrUpdate = [];
    for (let i = 0; i < this.ListAnswer.length; i++) {
      if (
        (this.ListAnswer[i].Mark != 0 && this.ListAnswer[i].IsRight == true) ||
        (this.ListAnswer[i].Mark < 0 && this.ListAnswer[i].IsRight == false)
      ) {
        this.ListAnswer[i].Mark = 0;
        this.ListAnswer[i].IsRight = false;
        arrUpdate.push(this.ListAnswer[i]);
      }
    }
    this.APIDeleteMark(arrUpdate);
  }

  //#endregion

  //#endregion

  //#endregion

  // Handle search
  onOpenPopupSearch() {
    this.isPopupSearch = false;
  }

  //#region navigation
  onOpenDetail(link: string) {
    let changeModuleData = this.menuService
      .changeModuleData()
      .subscribe((item: ModuleDataItem) => {
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
                f.Code.includes('hri008-question-bank-list') ||
                f.Link.includes('hr008-question-bank-list')
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
                f.Code.includes('hri008-question-bank-list') ||
                f.Link.includes('hr008-question-bank-list')
            );

            if (
              Ps_UtilObjectService.hasValue(detail) &&
              Ps_UtilObjectService.hasListValue(detail.LstChild)
            ) {
              var detail2 = detail.LstChild.find(
                (f) =>
                  f.Code.includes('hri008-question-bank-detail') ||
                  f.Link.includes('hri008-question-bank-detail')
              );

              this.menuService.activeMenu(detail2);
            }
          }
        }
      });
    this.arrUnsubscribe.push(changeModuleData);
  }
  //#endregion

  //#region dialog
  public onCloseDialog(): void {
    this.openedDialog = false;
  }

  onDeleteDialog(status: string): void {
    if (status == 'yes') {
      this.APIDeleteQuestion([this.Question]);
      this.openedDialog = false;
    } else {
      this.openedDialog = false;
    }
  }

  public onCloseDialogTypeQuestion(): void {
    this.Question.TypeOfQuestion = this.oldValueTypeQuestion.TypeOfQuestion;
    this.openedDialogTypeQuestion = false;
  }

  onChangeDialogTypeQuestion(status: string): void { //todo
    this.ListAnswer = [];
    if (status == 'yes') {
      switch (this.valueChangeTypeQuestion.TypeData) {
        case 1:
          this.Question.TypeOfQuestion = 1;
          this.isTypeOfEvaluation = true;
          this.Question.TypeOfQuestion = this.valueChangeTypeQuestion.TypeData;
          this.Question.TypeOfQuestionName = this.valueChangeTypeQuestion.TypeOfQuestion;
          this.Question.TypeOfEvaluation = null;
          this.Question.TypeOfEvaluationName = null;
          this.handleUpdateQuestion(['TypeOfQuestion', 'TypeOfQuestionName', 'TypeOfEvaluation', 'TypeOfEvaluationName']);
          this.openedDialogTypeQuestion = false;
          break;
        case 2:
          this.Question.TypeOfQuestion = 2;
          this.isTypeOfEvaluation = false;
          this.Question.TypeOfQuestion = this.valueChangeTypeQuestion.TypeData;
          this.Question.TypeOfQuestionName = this.valueChangeTypeQuestion.TypeOfQuestion;
          this.Question.TypeOfEvaluation = 1;
          this.Question.TypeOfEvaluation = 1;
          this.Question.TypeOfEvaluationName = 'Chọn đúng tất cả đáp án';
          this.handleUpdateQuestion(['TypeOfQuestion', 'TypeOfQuestionName', 'TypeOfEvaluation', 'TypeOfEvaluationName']);
          this.openedDialogTypeQuestion = false;
          break;
        case 3:
          this.Question.TypeOfQuestion = 3;
          this.isTypeOfEvaluation = true;
          this.Question.TypeOfQuestion = this.valueChangeTypeQuestion.TypeData;
          this.Question.TypeOfQuestionName = this.valueChangeTypeQuestion.TypeOfQuestion;
          this.Question.TypeOfEvaluation = null;
          this.Question.TypeOfEvaluationName = null;
          this.handleUpdateQuestion(['TypeOfQuestion', 'TypeOfQuestionName', 'TypeOfEvaluation', 'TypeOfEvaluationName']);
          this.openedDialogTypeQuestion = false;
          break;
        case 4:
          this.Question.TypeOfQuestion = 4;
          this.isTypeOfEvaluation = true;
          this.Question.TypeOfQuestion = this.valueChangeTypeQuestion.TypeData;
          this.Question.TypeOfQuestionName = this.valueChangeTypeQuestion.TypeOfQuestion;
          this.Question.TypeOfEvaluation = null;
          this.Question.TypeOfEvaluationName = null;
          this.handleYesNO();
          this.openedDialogTypeQuestion = false;
          break;
      }
    } else {
      this.openedDialogTypeQuestion = false;
    }
  }

  onCloseDialogLevel() {
    this.Question.LevelID = this.tempOldValue.LevelID;
    this.openLevelDialog = false;
  }

  handleDialogLevel() {
    this.Question.LevelID = this.valueChangeLevel;
    this.APIUpdateQuestion(this.Question, ['LevelID']);
    this.openLevelDialog = false;
  }

  onSelectionChangeLevel(event: any) {
    this.ListCompetence.forEach((v) => {
      if (v.Code == event.Level) {
        this.valueQuestionLevelName = v.CompetenceName;
      }
    });
    this.valueChangeLevel = event.Code;
    if (
      this.Question.LevelID !== 0 &&
      this.Question.ListCompetence.length !== 0
    ) {
      this.openLevelDialog = true;
    } else {
      this.Question.LevelID = this.valueChangeLevel;
      this.APIUpdateQuestion(this.Question, ['LevelID']);
      this.onLoadFilter(this.Question);
    }
  }

  onCloseDialogCompetence() {
    this.openDeleteCompetenceDialog = false;
  }

  handleDialogCompetence() {
    if (this.catelogyCompetence === 'parent') {
      let temp = [];
      this.tempValueCompetenceDialog.ListChilds.forEach((v) => {
        temp.push(v);
      });
      this.APIDeleteQuestionCompetence(temp);
    }
    this.openDeleteCompetenceDialog = false;
  }

  //#endregion

  //#region phạm vị áp dụng
  onChangeCheckedScope(property: string) {
    this.APIUpdateQuestion(this.Question, [property]);
  }
  //#endregion

  //#region competence
  @ViewChild('combobox') comboBoxRef!: ComboBoxComponent;
  timer: NodeJS.Timeout;

  // Handle đếm thời gian người dùng focus vào dropdownlist khía cạnh
  startTimer() {
    let that = this;
    this.timer = setTimeout(function () {
      that.comboBoxRef.toggle(true);
    }, 5000);
  }

  // reset lại thời gian người dùng focus vào dropdownlist khía cạnh
  onResetTimer() {
    clearTimeout(this.timer);
  }

  // handle foscus
  onFocusComboBox() {
    // call function startTimer
    this.startTimer();
  }

  dataQuestionCompetence: DTOCompetence[] = [];
  handleFilter(value: string) {
    this.dataQuestionCompetence = this.ListCompetence.filter(
      (s) => s.CompetenceName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  onBlurComboBox() {
    this.onResetTimer();
  }

  isUpdateCompetence: boolean = false;
  @ViewChild('dropCompetence') DropCompetenceRef: DropDownListComponent;

  // Xử lý sự thay đổi của giá trị khi người dùng chọn khía cạnh
  onValueChangeCompetence(value: DTOCompetence): void {
    this.isUpdateCompetence = true;
    let item: any;
    item = { ...value };
    item.Question = this.Question.Code;
    item.LevelID = this.Question.LevelID;
    delete item.Order;
    if (item.LevelID > 0 && Ps_UtilObjectService.hasValue(value)) {
      this.APIUpdateQuestionCompetence(item);
    } else if (item.LevelID == 0) {
      this.layoutService.onError('Vui lòng chọn mức độ khó!');
      this.DropCompetenceRef.reset();
    }
    this.comboBoxRef.reset();
  }

  // Disabled item bên trong dropdown của khía cạnh
  isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.Parent === null;
  }

  // Xóa khía cạnh của câu hỏi
  catelogyCompetence: string;

  onOpendDeleteCompetence(value: DTOCompetence, type: string) {
    this.catelogyCompetence = type;
    this.tempValueCompetenceDialog = value;
    this.valueQuestionCompetenceName = value.CompetenceName;
    this.openDeleteCompetenceDialog = true;
  }

  //#endregion

  //#region editor
  onSaveContentEditor(value: any) {
    if (Ps_UtilObjectService.hasValueString(value?.trim())) {
      this.Question.Question = value;
      this.handleUpdateQuestion(['Question']);
    } else {
      this.Question.Question = this.oldQuestion;
      this.layoutService.onError('Vui lòng không để trống mô tả chi tiết câu hỏi!');
    }
  }

  onGetIndex(index: number) {
    // Với multiple editor khai báo id khác nhau để không bị lỗi 'evenListenner'
    this.indexEditor = index;
    this.oldQuestion = this.Question.Question.slice(); // lưu giá trị cũ
  }
  onGetFolder(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServicePolicy.GetFolderWithFile(childPath, 15);
  }
  onGetFile(e: DTOCFFile, width, height) {
    this.layoutService.getEditor(this.indexEditor).embedImgURL(e, width, height);
    this.layoutService.setFolderDialog(false);
  }

  // onEditorValueChange(data: string, type: number) {
  //   console.log(data);
  //   if (type == 1) {
  //     this.Question.RefAnswer = data;
  //   } else {
  //     this.Question.Question = data;
  //   }
  // }
  //#endregion


  //#region api
  APIGetListQuestionGroupTree(filter: State) {
    this.isloading = true;
    let GetListQuestionGroupTree = this.serviceQuestionApi
      .GetListQuestionGroupTree(filter)
      .subscribe(
        res => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.isloading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm câu hỏi: ${res.ErrorString}!`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            let flattenedData = [];
            const filteredItems = [];
            flattenedData = res.ObjectReturn;
            this.ListQuestionGroup = flattenedData;

            for (const item of this.ListQuestionGroup) {
              this.dataPerm.forEach(i => {
                if (item.Code == i.Warehouse) {
                  filteredItems.push(item);
                }
              })
            }
            this.ListQuestionGroup = filteredItems;
            this.dataListQuestionGroupFilter = this.ListQuestionGroup.slice();
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm câu hỏi: ${error}`);
        }
      );
    this.isloading = false;
    this.arrUnsubscribe.push(GetListQuestionGroupTree);
  }

  onFlattenDataWithEmptyChilds(data) {
    const flattenedData = [];

    function flatten(item) {
      // Tạo một bản sao của item mà không chia sẻ tham chiếu
      const newItem = { ...item };

      // Đưa ListChilds của item về một mảng rỗng
      newItem.ListChilds = [];

      // Thêm newItem vào mảng kết quả
      flattenedData.push(newItem);

      // Duyệt qua từng phần tử trong ListChilds và gọi đệ quy
      item.ListChilds.forEach((child) => {
        flatten(child);
      });
    }

    // Duyệt qua từng phần tử trong dữ liệu ban đầu
    data.forEach((item) => {
      flatten(item);
    });

    return flattenedData;
  }

  APIGetQuestion(dto: DTOQuestion) {
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi lấy câu hỏi`
    if (dto.Code != 0) {
      let GetQuestion = this.serviceQuestionApi.GetQuestion(dto).subscribe(
        res => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.isloading = false;
            this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            this.Question = res.ObjectReturn;
            this.tempQuestion = { ...res.ObjectReturn }; // lưu giá trị trước khi thay đổi

            if (this.Question.TypeOfQuestion != 3) {
              this.APIGetListAnswer(this.Question);
            } else {
              this.onSetupBtnStatus();
            }
            if (this.Question.TypeOfQuestion == 1) {
              this.isTypeOfEvaluation = true;
            }
            this.onLoadFilter(this.Question);
            this.onSetupBtnStatus();
            // this.CompareString(this.Question);
            this.onCheckPermistion();
          }
        },
        (error) => {
          this.layoutService.onError(`${ctx}: ${error}`);
          this.isloading = false;
        }
      );
      this.arrUnsubscribe.push(GetQuestion);
    }
  }

  APIGetListAnswer(dtoQuestion: DTOQuestion) {
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi lấy danh sách câu trả lời của câu hỏi`
    let GetListAnswer: any;
    if (this.Question.TypeOfQuestion !== 3) {
      GetListAnswer = this.serviceQuestionApi
        .GetListAnswer(dtoQuestion)
        .subscribe(
          res => {
            if (res.ErrorString != null && res.StatusCode !== 0) {
              this.isloading = false;
              this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
            }
            if (
              Ps_UtilObjectService.hasValue(res) &&
              Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
              res.StatusCode == 0
            ) {
              this.isloading = false;
              this.ListAnswer = res.ObjectReturn;
              this.realListAnser = res.ObjectReturn.slice();
              if (this.Question.TypeOfQuestion !== 4) {
                for (let i = this.ListAnswer.length; i < 4; i++) {
                  this.ListAnswer.push({
                    Code: 0, Company: 1, Answer: '',
                    ColumnID: null, Question: this.Question.Code, IsRight: false,
                    Mark: 0, MarkID: 0, RowID: null, IsRow: true, Remark: '',
                    CreateBy: null, CreateTime: null, LastModifiedBy: null, LastModifiedTime: null, RefID: null
                  });
                }
              }
              this.onSetupBtnStatus();
              this.handleArrMark();
            }
          },
          (error) => {
            this.isloading = false;
            this.layoutService.onError(`${ctx}: ${error}`);
          }
        );
    } else {
      this.isloading = false;
    }
    this.arrUnsubscribe.push(GetListAnswer);
  }

  onUpdateAnswer(dtoAnswer: DTOAnswer[], typeUpdate: string) {
    this.isloading = true;

    if (typeUpdate === 'single') {
      const dto = dtoAnswer[0];

      if (dto.Code == 0 && dto.Answer !== '') {
        this.APIUpdateAnswer(dto, 'Tạo đáp án cho câu hỏi thành công!', false);
      } else if (dto.Code !== 0 && dto.Answer !== '') {
        this.APIUpdateAnswer(dto, 'Cập nhật cho câu hỏi thành công!', true);
      } else {
        this.isloading = false;
      }
    }

  }

  APIUpdateAnswer(dto: DTOAnswer, successMessage: string, isUpdate: boolean): void {
    var ctx = `Đã xảy ra lỗi khi ${dto.Code == 0 ? 'thêm mới' : 'cập nhật'} câu hỏi`
    const updateAnswerSubscription = this.serviceQuestionApi
      .UpdateAnswer(dto)
      .subscribe(
        res => {
          if (res.ErrorString != null) {
            this.isloading = false;
            this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
            this.APIGetListAnswer(this.Question)
            return;
          }

          if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
            this.isloading = false;
            for (let x = 0; x < this.ListAnswer.length; x++) {
              if ((isUpdate && this.ListAnswer[x].Code === res.ObjectReturn.Code) || (!isUpdate && this.ListAnswer[x].Code === 0 && Ps_UtilObjectService.hasValueString(this.ListAnswer[x].Answer))) {
                this.ListAnswer[x] = res.ObjectReturn;
                break;
              }
            }
            this.realListAnser = this.ListAnswer.slice().filter(i => i.Code !== 0);
            this.tempAnswer = { ...res.ObjectReturn };
            this.layoutService.onSuccess(successMessage);
            this.onSetupBtnStatus();
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`${ctx}: ${error}`);
          this.APIGetListAnswer(this.Question)
        }
      );

    this.arrUnsubscribe.push(updateAnswerSubscription);
  }

  APIUpdateQuestion(dto: DTOQuestion, property: Array<string>) {
    let UpdateQuestion: any;
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi ${dto.Code == 0 ? 'thêm mới' : 'cập nhật'} câu hỏi`
    UpdateQuestion = this.serviceQuestionApi
      .UpdateQuestion(dto, property)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.isloading = false;
            this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
            this.APIGetQuestion(this.Question);
          }

          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            this.Question = res.ObjectReturn;
            this.oldValueTypeQuestion = res;
            this.tempQuestion = { ...res.ObjectReturn }; // lưu giá trị trước khi thay đổi
            if (
              (dto.Code == 0 && Ps_UtilObjectService.hasValue(dto.QuestionID)) ||
              (dto.Code == 0 && Ps_UtilObjectService.hasValue(dto.Question))
            ) {
              this.servicePayslip.setCacheQuestion(this.Question);
              this.layoutService.onSuccess('Tạo mới thành công');
              this.onLoadFilter(this.Question);
              this.onAutoCreateAnswer();
            } else if (dto.Code != 0 && Ps_UtilObjectService.hasValue(dto.QuestionID)) {
              // if (property.includes('Question') || property.includes('Remark')) {
              //   this.CompareString(this.Question);
              // }
              property.forEach((v) => {
                if (v == 'LevelID') {
                  this.onLoadFilter(res.ObjectReturn);
                }
                else if (v == 'TypeOfQuestion' && this.Question.TypeOfQuestion !== 2 || v == 'TypeOfEvaluation' && this.Question.TypeOfQuestion == 2) {
                  this.APIGetListAnswer(this.Question);
                }
              });
              this.layoutService.onSuccess('Cập nhật câu hỏi thành công');
            } else {
              this.layoutService.onError('Vui lòng nhập mã câu hỏi và tóm tắt câu hỏi!');
            }
            this.onSetupBtnStatus();
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`${ctx}: ${error}`);
          this.APIGetQuestion(this.Question);
        }
      );
    this.arrUnsubscribe.push(UpdateQuestion);
    this.isloading = false;
  }

  APIDeleteAnswer(dtoAnswer: DTOAnswer[]) {
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi xóa đáp án`
    let DeleteAnswer = this.serviceQuestionApi
      .DeleteAnswer(dtoAnswer)
      .subscribe(
        async res => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.isloading = false;
            this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
            this.APIGetListAnswer(this.Question)
          }

          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            // Xóa đáp án được chọn khỏi mảng ListAnswer
            this.ListAnswer = this.ListAnswer.filter(
              (item) => !dtoAnswer.some((answer) => answer.Code === item.Code)
            );
            this.realListAnser = this.ListAnswer.slice().filter(i => i.Code != 0);
            this.onCalculateMark(null, 'not');
          }
          this.isloading = false;
          this.onSetupBtnStatus();
          this.layoutService.onSuccess('Xóa đáp án thành công!');
          if (this.Question.TypeOfQuestion !== 4) {
            for (let i = this.ListAnswer.length; i < 4; i++) {
              // Dùng hàm có sẳn sẽ gặp lỗi gõ 1 input các input kia thây đổi theo
              this.ListAnswer.push({
                Code: 0, Company: 1, Answer: '', ColumnID: null,
                Question: this.Question.Code, IsRight: false, Mark: 0, MarkID: 0,
                RowID: null, IsRow: true, Remark: '', CreateBy: null,
                CreateTime: null, LastModifiedBy: null, LastModifiedTime: null, RefID: null
              });
            }
          }

        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`${ctx}: ${error}`);
          this.APIGetListAnswer(this.Question)
        }
      );
    this.arrUnsubscribe.push(DeleteAnswer);
  }

  APIGetListEvaluationType() {
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi lấy danh sách cách tính điểm câu hỏi`
    let GetListEvaluationType = this.serviceQuestionApi
      .GetListEvaluationType()
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.isloading = false;
            this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            this.ListEvaluationType.next(res.ObjectReturn);
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`${ctx}: ${error}`);
        }
      );
    this.arrUnsubscribe.push(GetListEvaluationType);
  }

  APIGetListQuestionType() {
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi lấy danh sách loại câu hỏi`
    let GetListQuestionType = this.serviceQuestionApi
      .GetListQuestionType()
      .subscribe(
        res => {
          if (res.ErrorString != null) {
            this.isloading = false;
            this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            this.ListQuestionType.next(res.ObjectReturn);
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`${ctx}: ${error}`);
        }
      );
    this.arrUnsubscribe.push(GetListQuestionType);
  }

  APIUpdateQuestionStatus(dto: DTOQuestion[], statusID: number) {
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi cập nhật trạng thái câu hỏi`
    let UpdateQuestionStatus = this.serviceQuestionApi
      .UpdateQuestionStatus(dto, statusID)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.isloading = false;
            this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
            this.APIGetQuestion(this.Question);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            this.layoutService.onSuccess(
              'Cập nhật trạng thái câu hỏi thành công!'
            );
            this.APIGetQuestion(this.Question);
            this.onSetupBtnStatus();
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`${ctx}: ${error}`);
          this.APIGetQuestion(this.Question);
        }
      );
    this.arrUnsubscribe.push(UpdateQuestionStatus);
  }

  APIDeleteQuestion(arr: DTOQuestion[]) {
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi xóa câu hỏi`
    let DeleteQuestion = this.serviceQuestionApi.DeleteQuestion(arr).subscribe(
      res => {
        if (res.ErrorString != null) {
          this.isloading = false;
          this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
        }
        if (
          Ps_UtilObjectService.hasValue(res) &&
          Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
          res.StatusCode == 0
        ) {
          this.isloading = false;
          this.layoutService.onSuccess('Xóa câu hỏi thành công');
          this.Question = new DTOQuestion();
          this.ListAnswer = [];
          this.ListCompetence = [];
          this.editorRef.valueChange.emit('');
          this.onSetupBtnStatus();
        }
      },
      (error) => {
        this.isloading = false;
        this.layoutService.onError(`${ctx}: ${error}`);
      }
    );
    this.arrUnsubscribe.push(DeleteQuestion);
  }

  //API GetListQuestionCompetence
  APIGetListQuestionCompetence(state: State) {
    this.ListCompetence = [];
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi lấy khía cạnh`
    let GetListQuestionCompetence = this.serviceQuestionApi
      .GetListQuestionCompetence(state)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.isloading = false;
            this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            res.ObjectReturn.map((item: DTOCompetence, i) => {
              if (item.Parent === null || item.Parent === undefined) {
                item['Order'] = i + 1;
                this.ListCompetence.push(item);
                if (Ps_UtilObjectService.hasListValue(item.ListChilds)) {
                  item.ListChilds.map((v: DTOCompetence, j) => {
                    v['Order'] = j + 1;
                    this.ListCompetence.push(v);
                  });
                }
              }
            });
            this.dataQuestionCompetence = this.ListCompetence.slice();
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`${ctx}: ${error}`);
        }
      );
    this.arrUnsubscribe.push(GetListQuestionCompetence);
  }

  APIUpdateQuestionCompetence(dtoCompetence: DTOCompetence) {
    this.isloading = true;
    var ctx = `Đã xảy ra lỗi khi ${dtoCompetence.Code == 0 ? 'thêm mới' : 'cập nhật'} khía cạnh của câu hỏi`
    let UpdateQuestionCompetence = this.serviceQuestionApi
      .UpdateQuestionCompetence(dtoCompetence)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.isloading = false;
            this.layoutService.onError(`${ctx}:  ${res.ErrorString}!`);
            this.APIGetQuestion(this.Question);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            this.APIGetQuestion(this.Question);
            this.layoutService.onSuccess(`${dtoCompetence.Code == 0 ? 'Thêm mới' : 'Cập nhật'} khía cạnh thành công!`);
            this.onSetupBtnStatus();
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`${ctx}: ${error}`);
          this.APIGetQuestion(this.Question);
        }
      );
    this.arrUnsubscribe.push(UpdateQuestionCompetence);
  }

  APIDeleteQuestionCompetence(dtoCompetence: DTOCompetence[]) {
    this.isloading = true;
    let DeleteQuestionCompetence = this.serviceQuestionApi
      .DeleteQuestionCompetence(dtoCompetence)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.isloading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi xóa khía cạnh của câu hỏi: ${res.ErrorString}!`);
            this.APIGetQuestion(this.Question);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            // this.ListCompetence = res.ObjectReturn;
            this.isloading = false;
            this.APIGetQuestion(this.Question);
            this.layoutService.onSuccess('Xóa khía canh câu hỏi thành công!');
            this.onSetupBtnStatus();
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa khía cạnh của câu hỏi: ${error}`);
          this.APIGetQuestion(this.Question);
        }
      );
    this.arrUnsubscribe.push(DeleteQuestionCompetence);
  }

  onUpdateMark(dtoAnswer: DTOAnswer[], type: string) {
    this.isloading = true;

    if (type === 'multiple') {
      this.APIUpdateMarkMultiple(dtoAnswer);
    } else {
      this.APIUpdateMarkSingle(dtoAnswer[0]);
    }
  }

  APIUpdateMarkSingle(dto: DTOAnswer): void {
    const updateMarkSubscription = this.serviceQuestionApi
      .UpdateMark(dto)
      .subscribe(
        res => {
          this.handleUpdateMarkResponse(res);
        },
        (error) => {
          this.handleError(error);
        }
      );

    this.arrUnsubscribe.push(updateMarkSubscription);
  }

  APIUpdateMarkMultiple(dtoAnswer: DTOAnswer[]): void {
    for (let i = 0; i < dtoAnswer.length; i++) {
      const v = dtoAnswer[i];
      if (v.Answer !== '') {
        const updateMarkSubscription = this.serviceQuestionApi
          .UpdateMark(v)
          .subscribe(
            res => {
              this.handleUpdateMarkResponse(res);

              if (i === dtoAnswer.length - 1) {
                this.layoutService.onSuccess('Cập nhật điểm câu trả lời thành công!');
              }
            },
            (error) => {
              this.handleError(error);
              this.APIGetListAnswer(this.Question);
            }
          );
        this.arrUnsubscribe.push(updateMarkSubscription);
      }
    }
  }

  handleUpdateMarkResponse(res: any): void {
    if (res.ErrorString != null) {
      this.isloading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật điểm của câu hỏi: ${res.ErrorString}!`);
      this.APIGetListAnswer(this.Question);
      return;
    }

    if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
      this.isloading = false;
      for (let x = 0; x < this.ListAnswer.length; x++) {
        if (this.ListAnswer[x].Code === res.ObjectReturn.Code) {
          this.ListAnswer[x] = res.ObjectReturn;
          break;
        }
      }
      this.realListAnser = this.ListAnswer.slice().filter(i => i.Code !== 0);
      this.onSetupBtnStatus();
    }
  }

  handleError(error: any): void {
    this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật điểm của câu hỏi: ${error}`);
    this.isloading = false;
  }

  APIDeleteMark(arrAnswer: DTOAnswer[]) {
    this.isloading = true;
    let DeleteMark: any;
    if (arrAnswer.length > 0) {
      DeleteMark = this.serviceQuestionApi.DeleteMark(arrAnswer).subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.isloading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi xóa điểm câu hỏi: ${res.ErrorString}!`);
            this.APIGetListAnswer(this.Question);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.isloading = false;
            // this.ListCompetence = res.ObjectReturn;
            this.APIGetListAnswer(this.Question);
            // this.layoutService.onSuccess('Xóa câu trả lời thành công');
            this.onSetupBtnStatus();
          }
        },
        (error) => {
          this.isloading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa điểm câu hỏi: ${error}`);
          this.APIGetListAnswer(this.Question);
        }
      );
    }
    this.arrUnsubscribe.push(DeleteMark);
  }
  //#endregion api

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
      s?.unsubscribe();
    });
  }

}
