import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  State,
  distinct,
  toDataSourceRequest,
} from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import {
  PageChangeEvent,
  SelectableSettings,
} from '@progress/kendo-angular-grid';
import {
  MenuDataItem,
  ModuleDataItem,
} from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOInportProduct } from 'src/app/p-app/p-ecommerce/shared/dto/DTOInport.dto';
import { DTOQuestion } from '../../shared/dto/DTOQuestion.dto';
import { ConfigService } from 'src/app/p-app/p-config/shared/services/config.service';
import { PayslipService } from '../../shared/services/payslip.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { QuestionGroupAPIService } from '../../shared/services/question-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOAnswer } from '../../shared/dto/DTOAnswer.dto';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';
import { EnumHR } from 'src/app/p-lib/enum/hr.enum';

@Component({
  selector: 'app-hri008-question-bank-list',
  templateUrl: './hri008-question-bank-list.component.html',
  styleUrls: ['./hri008-question-bank-list.component.scss'],
})
export class Hri008QuestionBankListComponent implements OnInit {
  //#region permission
  isToanQuyen: boolean = false;
  isAllowedToCreate: boolean = false;
  isAllowedToVerify: boolean = false;
  justLoaded: boolean = true; // biến cờ dùng để quyết định api chỉ 1 lần
  actionPerm: DTOActionPermission[] = [];
  dataPerm: DTODataPermission[] = [];
  //#endregion
  //#region variable status
  isFilterActive: boolean = true;
  //#endregion

  //#region Import & Export
  excelValid: boolean = true
  //#endregion

  //#region Variable dialog \\
  openedDialog: boolean = false;
  QuestionTemp: DTOQuestion = new DTOQuestion();
  arrayQuestion: DTOQuestion[] = [];
  //#endregion

  //#region move question
  changeModuleData_sst: Subscription;
  Question: DTOQuestion = new DTOQuestion();
  ListAnswer: DTOAnswer[] = [];
  //#endregion

  // Grid Callback function
  getActionDropdownCallback: Function;
  onSelectedPopupBtnCallback: Function;
  onActionDropdownClickCallback: Function;
  getSelectionPopupCallback: Function;
  uploadEventHandlerCallback: Function
  onSelectCallback: Function;
  onPageChangeCallback: Function;
  allowActionDropdown = ['detail'];

  // Subscription CallAPi
  arrUnsubscribe: Subscription[] = [];
  GetListQuestion_stt: Subscription;
  GetQuestion_stt: Subscription;
  UpdateQuestion_stt: Subscription;
  UpdateQuestionStatus_stt: Subscription;
  DeleteQuestion_stt: Subscription;
  changePermission_sst: Subscription;

  //#region Filter
  // - variable
  isDrafting: boolean = false;
  isApproved: boolean = false;
  isSuspended: boolean = false;
  isSent: boolean = false;
  filterDrafting: { field: string, operator: string, value: number, ignoreCase: boolean };
  filterApproved: { field: string, operator: string, value: number, ignoreCase: boolean };
  filterSuspended: { field: string, operator: string, value: number, ignoreCase: boolean };
  filterSent: { field: string, operator: string, value: number, ignoreCase: boolean };

  //#endregion

  // variable grid
  gridView = new Subject<any>();
  total: number = 0;
  listQuestion: DTOQuestion[] = [];
  loading: boolean = false;
  pageSize: number = 25;
  pageSizes: number[] = [this.pageSize];
  tempSearch: { field: string, operator: string, value: number, ignoreCase: boolean };
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };
  //- filter reset

  filterReturned = {
    "field": "StatusID",
    "operator": "eq",
    "value": 4,
    "ignoreCase": true
  }

  ResetState: State = {
    skip: null,
    filter: { filters: [], logic: 'or' },
    take: this.pageSize,
  };

  gridState: State = {
    skip: null,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  };

  filterStatusID: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  constructor(
    private layoutService: LayoutService,
    public service: ConfigService,
    public servicePayslip: PayslipService,
    public menuService: PS_HelperMenuService,
    private questionApiService: QuestionGroupAPIService,
    private cdr: ChangeDetectorRef,
    public apiService: MarBannerAPIService,
  ) { }

  ngOnInit(): void {
    let that = this;
    this.getActionDropdownCallback = this.onGetActionDropdown.bind(this);
    //action dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this);
    this.getSelectionPopupCallback = this.onGetSelectionPopup.bind(this);
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this);
    this.onSelectCallback = this.onSelectChange.bind(this);
    this.onPageChangeCallback = this.onPageChange.bind(this);
    this.uploadEventHandlerCallback = this.onUploadEventHandler.bind(this);

    this.changePermission_sst = this.menuService
      .changePermission()
      .subscribe((res: DTOPermission) => {
        if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
          that.justLoaded = false;
          that.actionPerm = distinct(res.ActionPermission, 'ActionType');

          that.isToanQuyen =
            that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          that.isAllowedToCreate =
            that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          that.isAllowedToVerify =
            that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
          that.dataPerm = distinct(res.DataPermission, 'Warehouse');
          
        }
      });
    let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if(Ps_UtilObjectService.hasValue(res)){
        this.onLoadDefault();
      }
    })
    this.arrUnsubscribe.push(this.changePermission_sst, permissionAPI);
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    // console.log(this.Question);
  }

  onLoadDefault() {
    this.isDrafting = true;
    this.isApproved = false;
    this.isSuspended = false;
    this.isSent = false;
    this.filterDrafting = {
      field: 'StatusID',
      operator: 'eq',
      value: 0,
      ignoreCase: true,
    };
    this.gridState.skip = null;
    this.onLoadFilter();
    this.APIGetListQuestion(this.gridState);
  }

  //#region filter group
  //- Handle reset
  onResetFilter() {
    this.isDrafting = true;
    this.isApproved = false;
    this.isSuspended = false;
    this.isSent = false;
    this.gridState.skip = null
    this.onLoadFilter();
    this.APIGetListQuestion(this.gridState);
  }

  onLoadFilter() {
    // reset filler
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.filterStatusID.filters = [];

    // Add filter cho checkbox header 2

    if (this.isDrafting) {
      this.filterStatusID.filters.push(this.filterDrafting);
      this.filterStatusID.filters.push(this.filterReturned);
    }

    if (this.isApproved) {
      this.filterStatusID.filters.push(this.filterApproved);
    }

    if (this.isSuspended) {
      this.filterStatusID.filters.push(this.filterSuspended);
    }

    if (this.isSent) {
      this.filterStatusID.filters.push(this.filterSent);
    }

    if (this.filterStatusID.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatusID);
    }

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this.gridState.filter.filters.push(this.filterSearchBox);
      }
    }
    // console.log(this.gridState);
    // console.log(JSON.stringify(toDataSourceRequest(this.gridState)));
  }

  //- Handle search
  handleSearch(event: any) {
    if (event.filters && event.filters.length > 0) {
      if (event.filters[0].value === '') {
        this.gridState.skip = null;
        this.onLoadFilter();
        this.APIGetListQuestion(this.gridState);
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = null;
        this.onLoadFilter();
        this.APIGetListQuestion(this.gridState);
      }
    }
  }

  // Handle lắng nghe sự thay đổi của checkbox
  onSelectedChangeCheckbox(event: any, typebtn: string) {
    if (typebtn == 'isDrafting') {
      this.isDrafting = event;
    } else if (typebtn == 'isApproved') {
      this.isApproved = event;
    } else if (typebtn == 'isSuspended') {
      this.isSuspended = event;
    } else if (typebtn == 'isSent') {
      this.isSent = event;
    }
  }

  onFilterChangeDrafting(event: { field: string, operator: string, value: number, ignoreCase: boolean }) {
    this.filterDrafting = event;
    this.gridState.skip = null
    this.onLoadFilter();
    this.APIGetListQuestion(this.gridState);
  }
  onFilterChangeApproved(event: { field: string, operator: string, value: number, ignoreCase: boolean }) {
    this.filterApproved = event;
    this.gridState.skip = null
    this.onLoadFilter();
    this.APIGetListQuestion(this.gridState);
  }
  onFilterChangesSuspended(event: { field: string, operator: string, value: number, ignoreCase: boolean }) {
    this.filterSuspended = event;
    this.gridState.skip = null
    this.onLoadFilter();
    this.APIGetListQuestion(this.gridState);
  }

  onFilterChangesSent(event: { field: string, operator: string, value: number, ignoreCase: boolean }) {
    this.filterSent = event;
    this.gridState.skip = null
    this.onLoadFilter();
    this.APIGetListQuestion(this.gridState);
  }
  //#endregion filter group

  //#region funcionCallback grid
  onSelectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible;
    // this.isDisableAddQuestion = !isSelectedRowitemDialog
  }
  //dropdown
  onGetActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOQuestion) {
    moreActionDropdown = [];
    this.Question = { ...dataItem };
    var statusID = this.Question.StatusID;
    const ctx = 'câu hỏi';

    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;

    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;

    // Push "Chỉnh sửa" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && (statusID === 0 || statusID == 4) || canVerify && statusID === 1) {
      moreActionDropdown.push({
        Name: 'Chỉnh sửa',
        Code: 'pencil',
        Type: 'edit',
        Actived: true,
      });
    } else {
      // Nếu không thỏa điều kiện "Chỉnh sửa" thì push "Xem chi tiết"
      moreActionDropdown.push({
        Name: 'Xem chi tiết',
        Code: 'eye',
        Link: 'detail',
        Actived: true,
      });
    }

    // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4)) {
      // if (this.onCheckedFields(this.Question))
      {
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Gửi duyệt',
          Code: 'redo',
          Link: '1',
          Actived: true,
          LstChild: [],
        });
      }
    }

    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    if (canVerify && (statusID === 1 || statusID === 3)) {
      // if (this.onCheckedFields(this.Question)) 
      {
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Phê duyệt',
          Code: 'check-outline',
          Link: '2',
          Actived: true,
          LstChild: [],
        });
      }

      // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
      moreActionDropdown.push({
        Type: 'StatusID',
        Name: 'Trả về',
        Code: 'undo',
        Link: '4',
        Actived: true,
        LstChild: [],
      });
    }

    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    if (canVerify && statusID === 2) {
      moreActionDropdown.push({
        Name: 'Ngưng áp dụng',
        Type: 'StatusID',
        Code: 'minus-outline',
        Link: '3',
        Actived: true,
        LstChild: [],
      });
    }

    // Push "Xóa" khi có quyền tạo hoặc toàn quyền và statusID === 0 && dataItem.ListCompetence.length == 0
    if (canCreateOrAdmin && statusID === 0 && dataItem.ListCompetence.length == 0) {
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

  // Hàm dùng để kiểm tra cách trường đã điền chưa và thông báo cho người dùng
  onCheckedFields(question: DTOQuestion, i: number = 0): boolean {
    var is = true;
    var ctx = `Câu hỏi tại vị trí ${i + 1} thiếu`

    if (!Ps_UtilObjectService.hasValueString(question.QuestionID)) {
      is = false;
      this.layoutService.onError(`${ctx} Mã`)
    }
    else if (!Ps_UtilObjectService.hasValueString(question.Question)) {
      is = false;
      this.layoutService.onError(`${ctx} Tóm tắt`)
    }
    else if (!Ps_UtilObjectService.hasValueString(question.Remark)) {
      is = false;
      this.layoutService.onError(`${ctx} Mô tả`)
    }
    else if (!Ps_UtilObjectService.hasValue(question.TypeOfQuestion)) {
      is = false;
      this.layoutService.onError(`${ctx} Loại câu hỏi`)
    }
    else if (Ps_UtilObjectService.hasValue(question.TypeOfQuestion) && question.TypeOfQuestion == 2) {
      if (!Ps_UtilObjectService.hasValue(question.TypeOfEvaluation)) {
        is = false
        this.layoutService.onError(`${ctx} Cách tính điểm`)
      }
    }
    else if (!Ps_UtilObjectService.hasValue(question.Duration)) {
      is = false;
      this.layoutService.onError(`${ctx} Thời gian làm bài`)
    }
    else if (!Ps_UtilObjectService.hasValue(question.Category)) {
      is = false;
      this.layoutService.onError(`${ctx} Phân nhóm`)
    }
    else if (!question.AppliedCompetenceTest &&
      !question.AppliedEventTest &&
      !question.AppliedPreTest) {
      is = false;
      this.layoutService.onError(`${ctx} Phạm vi áp dụng`)
    }
    else if (!Ps_UtilObjectService.hasValue(question.LevelID)) {
      is = false;
      this.layoutService.onError(`${ctx} Mức độ`)
    }
    else if (!Ps_UtilObjectService.hasListValue(question.ListCompetence)) {
      is = false;
      this.layoutService.onError(`${ctx} Năng lực`)
    }

    return is;
  }

  //#region import và export
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  APIDownloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "QuestionBankTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let a = this.apiService.GetTemplate(getfilename).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
        this.layoutService.onSuccess(`${ctx} thành công`);
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
    this.arrUnsubscribe.push(a);
  }

  onUploadEventHandler(e: File) {
    this.APIImportExcelQuestionBank(e);
  }
  APIImportExcelQuestionBank(file) {
    this.loading = true
    var ctx = "Import Excel"

    let ImportExcelQuestionBank = this.questionApiService.ImportExcelQuestionBank(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && !Ps_UtilObjectService.hasValueString(res.ErrorString)) {
        this.onLoadFilter();
        this.APIGetListQuestion(this.gridState);
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
    this.arrUnsubscribe.push(ImportExcelQuestionBank);
  }
  //#endregion

  // Action dropdownlist
  onActionDropdownClick(menu: MenuDataItem, item: DTOQuestion) {
    if (item.Code.toString().length > 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        if (item.StatusID == 0) {
          // this.Question = { ...item };
          // this.QuestionTemp = this.Question;
          this.arrayQuestion = [this.Question];
          this.openedDialog = true;
        }
      } else if (menu.Type == 'StatusID') {
        this.Question = { ...item };
        this.Question.StatusID = parseInt(menu.Link);
        var is = true
        // Trạng thái gửi duyệt
        if (menu.Link == '1') {
          var listdataUpdate = [];
          // Chỉ statusID = 0|4
          if (item.StatusID == 0 || item.StatusID == 4) {
            is = this.onCheckedFields(this.Question)
            if (is)
              listdataUpdate.push(this.Question);
          }
        }
        // Trạng thái phê duyệt
        if (menu.Link == '2') {
          var listdataUpdate = [];
          // Chỉ statusID = 1|3
          if (item.StatusID == 1 || item.StatusID == 3) {
            is = this.onCheckedFields(this.Question)
            if (is)
              listdataUpdate.push(this.Question);
          }
        }
        //Trạng thái Ngưng hiển thị
        else if (menu.Link == '3') {
          var listdataUpdate = [];
          // Chỉ statusID = 2
          if (item.StatusID == 2) {
            listdataUpdate.push(this.Question);
          }
        }
        // Trạng thái trả về
        else if (menu.Link == '4') {
          var listdataUpdate = [];
          // Chỉ statusID = 1|3
          if (item.StatusID == 1 || item.StatusID == 3) {
            listdataUpdate.push(this.Question);
          }
        }

        if (is) {
          let StatusID = parseInt(menu.Link);
          this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
        }
      } else if (
        menu.Link == 'edit' ||
        menu.Code == 'pencil' ||
        menu.Code == 'eye' ||
        menu.Link == 'detail'
      ) {
        this.Question = item;
        this.onOpenDetail();
      }
    }
  }

  onValidateFields(e: DTOQuestion) {
    var is = false;
    if (
      e.TypeOfQuestion === 1 &&
      !Ps_UtilObjectService.hasValue(e.TypeOfEvaluation) &&
      (e.RefAnswer === null || e.RefAnswer !== '') &&
      (e.AppliedCompetenceTest == true ||
        e.AppliedEventTest == true ||
        e.AppliedPreTest == true) &&
      Ps_UtilObjectService.hasValue(e.Category) &&
      Ps_UtilObjectService.hasValue(e.Code) &&
      Ps_UtilObjectService.hasValue(e.Company) &&
      Ps_UtilObjectService.hasValue(e.Duration) &&
      Ps_UtilObjectService.hasValue(e.LevelID) &&
      e.ListCompetence.length !== 0 &&
      e.Question !== '' &&
      e.QuestionID !== '' &&
      e.Remark !== ''
    ) {
      is = true;
    } else if (
      e.TypeOfQuestion === 2 &&
      Ps_UtilObjectService.hasValue(e.TypeOfEvaluation) &&
      (e.RefAnswer === null || e.RefAnswer !== '') &&
      (e.AppliedCompetenceTest == true ||
        e.AppliedEventTest == true ||
        e.AppliedPreTest == true) &&
      Ps_UtilObjectService.hasValue(e.Category) &&
      Ps_UtilObjectService.hasValue(e.Code) &&
      Ps_UtilObjectService.hasValue(e.Company) &&
      Ps_UtilObjectService.hasValue(e.Duration) &&
      Ps_UtilObjectService.hasValue(e.LevelID) &&
      e.ListCompetence.length !== 0 &&
      e.Question !== '' &&
      e.QuestionID !== '' &&
      e.Remark !== ''
    ) {
      is = true;
    } else if (
      e.TypeOfQuestion === 3 &&
      (e.TypeOfEvaluation === null || Ps_UtilObjectService.hasValue(e.TypeOfEvaluation)) &&
      e.RefAnswer !== '' &&
      (e.AppliedCompetenceTest === true ||
        e.AppliedEventTest === true ||
        e.AppliedPreTest === true) &&
      Ps_UtilObjectService.hasValue(e.Category) &&
      Ps_UtilObjectService.hasValue(e.Code) &&
      Ps_UtilObjectService.hasValue(e.Company) &&
      Ps_UtilObjectService.hasValue(e.Duration) &&
      Ps_UtilObjectService.hasValue(e.LevelID) &&
      e.ListCompetence.length !== 0 &&
      e.Question !== '' &&
      e.QuestionID !== '' &&
      e.Remark !== ''

    ) {
      is = true;
    } else {
      is = false;
    }

    return is
  }

  onGetSelectionPopup(selectedList: DTOQuestion[]) {
    var moreActionDropdown = new Array<MenuDataItem>();
    // Check If Any Item(s) In Selected List Can Send To Verify
    var SendForApproval = selectedList.findIndex(
      // (s => ((s.StatusID === 0 || s.StatusID === 4) && this.onCheckedFields(s))
      (s => s.StatusID === 0 || s.StatusID === 4)
    );
    if (SendForApproval != -1) {
      if ((this.isToanQuyen || this.isAllowedToCreate)) {
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Gửi duyệt',
          Code: 'redo',
          Link: '1',
          Actived: true,
          LstChild: [],
        });
      }
    }

    // Check If Any Item(s) In Selected List Can Send To Verify
    var approval = selectedList.findIndex(
      // ((s, i) => ((s.StatusID === 1 || s.StatusID === 3) && this.onCheckedFields(s, i)))
      (s => s.StatusID === 1 || s.StatusID === 3)
    );
    ////> Push Send To Verify Button To Array If Condition True
    if (approval != -1) {
      if (this.isToanQuyen || this.isAllowedToVerify) {
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Phê duyệt',
          Code: 'check-outline',
          Link: '2',
          Actived: true,
          LstChild: [],
        });
      }

    }

    // Check If Any Item(s) In Selected List Need To Stop Displaying
    var Hide = selectedList.findIndex((s) => s.StatusID == 2);
    ////> Push Stop Displaying Button To Array If Condition True
    if (Hide != -1) {
      if (this.isAllowedToVerify || this.isToanQuyen) {
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Ngưng áp dụng',
          Code: 'minus-outline',
          Link: '3',
          Actived: true,
          LstChild: [],
        });
      }
    }

    // Check If Any Item(s) In Selected List Need To Be Verified Or Returned
    var Return = selectedList.findIndex(
      (s) => s.StatusID == 1 || s.StatusID == 3
    );
    ////> Push Return Button To Array If Condition True
    if (Return != -1) {
      //|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      if (this.isAllowedToVerify || this.isToanQuyen) {
        moreActionDropdown.push({
          Type: 'StatusID',
          Name: 'Trả về',
          Code: 'undo',
          Link: '4',
          Actived: true,
          LstChild: [],
        });
      }
    }

    // Check If Any Item(s) In Selected List Can Be Deleted
    var Delete = selectedList.findIndex((s) => s.StatusID == 0 && s.ListCompetence.length == 0);
    ////> Push Delete Button To Array If Condition True
    if (Delete != -1) {
      //|| canTraLai_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)
      if (this.isAllowedToCreate || this.isToanQuyen) {
        moreActionDropdown.push({
          Name: 'Xóa câu hỏi',
          Type: 'delete',
          Code: 'trash',
          Link: 'delete',
          Actived: true,
          LstChild: [],
        });
      }
    }

    return moreActionDropdown;
  }

  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == 'StatusID') {
        var is = true
        // Trạng thái gửi duyệt
        if (value == 1 || value == '1') {
          var listdataUpdate = [];
          list.forEach((s, i) => {
            // Chỉ statusID = 0|4
            if (s.StatusID == 0 || s.StatusID == 4) {
              if (this.onCheckedFields(s, i))
                listdataUpdate.push(s);
              else
                is = false
            }
          });
          let StatusID = parseInt(value);
        }
        // Trạng thái phê duyệt
        if (value == 2 || value == '2') {
          var listdataUpdate = [];
          list.forEach((s, i) => {
            // Chỉ statusID = 1|3
            if (s.StatusID == 1 || s.StatusID == 3) {
              if (this.onCheckedFields(s, i))
                listdataUpdate.push(s);
              else
                is = false
            }
          });
          // console.log(listdataUpdate);
        }
        //Trạng thái Ngưng hiển thị
        if (value == 3 || value == '3') {
          var listdataUpdate = [];
          list.forEach((s) => {
            // Chỉ statusID = 2
            if (s.StatusID == 2) {
              listdataUpdate.push(s);
            }
          });
          // console.log(listdataUpdate);
        }
        // Trạng thái trả về
        if (value == 4 || value == '4') {
          var listdataUpdate = [];
          list.forEach((s) => {
            // Chỉ statusID = 1|3
            if (s.StatusID == 1 || s.StatusID == 3) {
              listdataUpdate.push(s);
            }
          });
          // console.log(listdataUpdate);
        }
        if (is) {
          let StatusID = parseInt(value);
          // this.layoutService
          //   .getSelectionPopupComponent()
          //   .closeSelectedRowitemDialog();
          this.APIUpdateQuestionStatus(listdataUpdate, StatusID);
        }
      }
      // Trạng thái delete
      else if (btnType == 'delete') {
        var listDataDelete = [];
        list.forEach((s) => {
          // Chỉ statusID = 0
          if (s.StatusID == 0 && s.ListCompetence.length == 0) {
            listDataDelete.push(s);
          }
        });
        this.arrayQuestion = listDataDelete;
        this.openedDialog = true;
        // this.layoutService
        //   .getSelectionPopupComponent()
        //   .closeSelectedRowitemDialog();
      }
    }
  }

  onPageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take;
    this.APIGetListQuestion(this.gridState);
  }
  //#endregion funcionCallback grid

  // Thêm câu hỏi
  onAdd() {
    this.Question = new DTOQuestion();

    this.onOpenDetail();
  }

  // move detail
  onOpenDetail() {
    this.changeModuleData_sst = this.menuService
      .changeModuleData()
      .subscribe((item: ModuleDataItem) => {
        this.servicePayslip.setCacheQuestion(this.Question);
        var parent = item.ListMenu.find(
          (f) =>
            f.Code.includes('hriCompetency') ||
            f.Link.includes('hr007-competency-bank')
        );

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
      });
    this.arrUnsubscribe.push(this.changeModuleData_sst)
  }

  //#region dialog
  public onCloseDialog(): void {
    this.openedDialog = false;
  }

  onDeleteDialog(status: string): void {
    if (status == 'yes') {
      this.APIDeleteQuestion(this.arrayQuestion);
      this.openedDialog = false;
    } else {
      this.openedDialog = false;
    }
  }

  //#endregion

  //#region API
  APIGetListQuestion(state: State) {
    this.loading = true;
    this.GetListQuestion_stt = this.questionApiService
      .GetListQuestion(state)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.listQuestion = res.ObjectReturn.Data;
            this.total = res.ObjectReturn.Total;
            this.gridView.next({ data: this.listQuestion, total: this.total });
            // console.log("gridView",res.ObjectReturn.Data);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          // console.log(error);
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách câu hỏi: ${error}`);
        }
      );
    this.arrUnsubscribe.push(this.GetListQuestion_stt);
  }

  APIUpdateQuestionStatus(dto: DTOQuestion[], statusID: number) {
    this.loading = true;
    this.UpdateQuestionStatus_stt = this.questionApiService
      .UpdateQuestionStatus(dto, statusID)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.loading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái của câu hỏi: ${res.ErrorString}`);
            this.APIGetListQuestion(this.gridState);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.loading = false;
            this.layoutService.onSuccess(
              'Cập nhật trạng thái câu hỏi thành công!'
            );
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
            this.APIGetListQuestion(this.gridState);
          }
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái của câu hỏi: ${error}`);
          this.APIGetListQuestion(this.gridState);
        }
      );
    this.arrUnsubscribe.push(this.UpdateQuestionStatus_stt);
  }

  APIDeleteQuestion(arr: DTOQuestion[]) {
    this.loading = true;
    this.DeleteQuestion_stt = this.questionApiService
      .DeleteQuestion(arr)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null && res.StatusCode !== 0) {
            this.loading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi xóa câu hỏi: ${res.ErrorString}`);
            this.APIGetListQuestion(this.gridState);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess('Xóa câu hỏi thành công');
            this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
            this.APIGetListQuestion(this.gridState);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa câu hỏi: ${error}`);
          this.APIGetListQuestion(this.gridState);
        }
      );
    this.arrUnsubscribe.push(this.DeleteQuestion_stt);
  }

  //#endregion API

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
      s?.unsubscribe();
    });
  }
}