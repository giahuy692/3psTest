import { formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { GridComponent, PageChangeEvent } from '@progress/kendo-angular-grid';
import { DrawerMode } from '@progress/kendo-angular-layout';
import { CompositeFilterDescriptor, filterBy, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';
import { Subject, Subscription, interval } from 'rxjs';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_AuthService, Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOExam } from '../../shared/dto/DTOExam.dto';
import { ExamApiService } from '../../shared/services/Exam-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { HriQuizSessionService } from 'src/app/p-app/p-hri/shared/services/hri-quiz-session.service';
import { $ } from 'protractor';
import { HriExamApiService } from 'src/app/p-app/p-hri/shared/services/hri-exam-api.service';
import { EnumLayout } from 'src/app/p-lib/enum/layout.enum';


@Component({ 
  selector: 'app-portal001-exam-list',
  templateUrl: './portal001-exam-list.component.html',
  styleUrls: ['./portal001-exam-list.component.scss']
})
export class Portal001ExamListComponent {

  @ViewChild(GridComponent, { static: true }) grid: GridComponent;
  @ViewChild('scrollContainer', { read: ElementRef }) scrollContainer: ElementRef;

  
  //common variable
  loading = false
  isAdd = true
  isFilterActive = true
  isMobile: boolean = false;
  isFirstCall: boolean = true
  IsShow: boolean = true
  isHighlighted = false
  total = 0;
  tempSearch: any;
  time: number;
  private page: number = 0;
  Today: Date = new Date()
  isOpenDetail: boolean = false
  // data ảo 


  //Thaydoikichthucmanhinh
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenWidth();
  }

  dangkiemtra_checked = true
  ketthuc_checked = false
  phuckhao_checked = false

  // app-search-filter-group
  placeholder = 'Tìm theo đợt đánh giá'
  

  // gird
  gridView = new Subject<any>();
  pageSize = 25
  pageSizes = [this.pageSize]
  allowActionDropdown = []
  skip = 0;
  sortBy: SortDescriptor = {
    field: 'BeginTime',
    dir: 'desc'
  }
  gridState: State = {
    take: this.pageSize,
    sort: [this.sortBy],
    filter: { filters: [], logic: 'and' },
  }

  //object 
  Exam = new DTOExam()
  ListExam :DTOExam[] =[]
  standardlistExams: DTOExam[] =[]
  


  //CallBack
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onFilterChangeCallback: Function
  //
  changeModuleData_sst: Subscription
  GetListSession_sst: Subscription
  UpdateExamStatus_sst: Subscription
  countdownSubscriptions: Subscription[] = [];

  // drawer
  public expandMode: DrawerMode = "overlay";
  //filter
  //status
  filterStatus: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  // Filter Đang kiểm tra
  filterChecking: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  // Filter Kết thúc
  filterEnd: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  // Filter Phúc khảo
  filterReview: CompositeFilterDescriptor = {
    logic: "and",
    filters: []
  }
  filterEvaluationViewAndTypeOfSession: CompositeFilterDescriptor = {
    logic: "and",
    filters: []
  }
  filterSessionStatusIDAndStatus_ketthuc: CompositeFilterDescriptor = {
    logic: "and",
    filters: []
  }
  filterChekingAndSessionStatusID: CompositeFilterDescriptor = {
    logic: "and",
    filters: []
  }
  filterSessionStatusID0or1: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterSessionStatusID3_5:CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterStatus_dangkiemtra: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 1
  }
  filterStatus_ChuaLambai: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 0
  }
  filterStatus_ketthuc: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 2
  }
  filterStatus_Dung: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 3
  }
  filterSessionStatus_ChuaMo: FilterDescriptor = {
    field: "SessionStatusID", operator: "eq", value: 0
  }
  filterSessionStatus_DangDienRa: FilterDescriptor = {
    field: "SessionStatusID", operator: "eq", value: 1
  }
  filterSessionStatus_KetThucThi: FilterDescriptor = {
    field: "SessionStatusID", operator: "eq", value: 2
  }
  filterSessionStatus_HoanTat: FilterDescriptor = {
    field: "SessionStatusID", operator: "eq", value: 3
  }
  filterSessionStatus_GưiPhucKhao: FilterDescriptor = {
    field: "SessionStatusID", operator: "eq", value: 4
  }
  filterSessionStatus_HoanTatPhucKhao: FilterDescriptor = {
    field: "SessionStatusID", operator: "eq", value: 5
  }
  filterEvaluationView: FilterDescriptor = {
    field: "EvaluationView", operator: "neq", value: 2
  }
  // filterRemainlt: FilterDescriptor = {
  //   field: "RemainDuration", operator: "lte", value: 0
  // }
  // filterRemaingt: FilterDescriptor = {
  //   field: "RemainDuration", operator: "gte", value: 0
  // }
  filterStartDate: FilterDescriptor = {
    field: "StartDate", operator: "gte", value: null
  }
  filterEndDate: FilterDescriptor = {
    field: "EndDate", operator: "lte", value: null
  }
  filterTypeOfSession: FilterDescriptor = {
    field: "TypeOfSession", operator: "neq", value: 1
  }
   //search prod
   filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  constructor(
    public apiService: HriExamApiService,
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,    
    public QuizSessionService: HriQuizSessionService,
    public auth: Ps_AuthService,
    ) {
    this.checkScreenWidth();
  }
  checkScreenWidth() {
    this.isMobile = window.innerWidth <= 500; 
    if (this.isMobile && this.isFirstCall) {
      this.isFirstCall = false
      this.loadFilter()
      this.GetListExamPortal()
    } else if(!this.isMobile && !this.isFirstCall){
      this.isFirstCall = true
      this.loadFilter()
      this.GetListExamPortal()

    }
  }

  ngOnInit(): void {
    this.auth.logout(EnumLayout.URLPortal)
    // callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    //dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    if(!this.isMobile){
      this.loadFilter()
      this.GetListExamPortal()
    }
  }

  ngAfterViewInit() {
    if(this.isMobile){
      this.scrollContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onScroll(){
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      const scrollElement = this.scrollContainer.nativeElement;
      // Check if scrolled to the bottom
      if (scrollElement.scrollTop + scrollElement.clientHeight + 5 >= scrollElement.scrollHeight ) {
        // Load more data
        this.loadMore();
      }

    }
  }
  //Logic
  formatdate(inputDateString: string): string {
    const date = new Date(inputDateString);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  isStatus(event): boolean {
    if(event == 2){
      return false
    } else
    return true
  }
  isSessionStatusIDStatus(event): boolean {
    if(event == 3 || event == 2){
      return false
    } else
    return true
  }
  //filter
  loadFilter(){
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.filter.filters = []
    this.filterStatus.filters = []
    this.filterChecking.filters = []
    this.filterEnd.filters = []
    this.filterReview.filters = []
    this.filterEvaluationViewAndTypeOfSession.filters = []
    this.filterSessionStatusIDAndStatus_ketthuc.filters = []
    this.filterSessionStatusID3_5.filters = []
    this.filterChekingAndSessionStatusID.filters = []
    this.filterSessionStatusID0or1.filters = []


    //status
    if (this.dangkiemtra_checked){
      this.filterSessionStatusID0or1.filters.push(this.filterSessionStatus_ChuaMo)
      this.filterSessionStatusID0or1.filters.push(this.filterSessionStatus_DangDienRa)
      this.filterChecking.filters.push(this.filterStatus_dangkiemtra)
      this.filterChecking.filters.push(this.filterStatus_ChuaLambai)
      this.filterChekingAndSessionStatusID.filters.push(this.filterSessionStatusID0or1)
      this.filterChekingAndSessionStatusID.filters.push(this.filterChecking)

    }

    if (this.ketthuc_checked){
      this.filterEnd.filters.push(this.filterStatus_ketthuc)
      this.filterEnd.filters.push(this.filterStatus_Dung)
    }

    if (this.phuckhao_checked){
      this.filterEvaluationViewAndTypeOfSession.filters.push(this.filterEvaluationView)
      this.filterEvaluationViewAndTypeOfSession.filters.push(this.filterTypeOfSession)
      this.filterSessionStatusID3_5.filters.push(this.filterSessionStatus_HoanTatPhucKhao)
      this.filterSessionStatusID3_5.filters.push(this.filterSessionStatus_GưiPhucKhao)
      this.filterSessionStatusID3_5.filters.push(this.filterSessionStatus_HoanTat)
      this.filterSessionStatusIDAndStatus_ketthuc.filters.push(this.filterSessionStatusID3_5)
      this.filterSessionStatusIDAndStatus_ketthuc.filters.push(this.filterStatus_ketthuc)
      
    }

    //Damg làm bài

    if (this.filterChekingAndSessionStatusID.filters.length > 0){
      this.filterStatus.filters.push(this.filterChekingAndSessionStatusID)
    }

    // kết thúc làm bài

    if (this.filterEnd.filters.length > 0){
      this.filterStatus.filters.push(this.filterEnd)
    }

    // phúc khảo
    if (this.filterEvaluationViewAndTypeOfSession.filters.length > 0){
      this.filterReview.filters.push(this.filterEvaluationViewAndTypeOfSession)
    }

    if (this.filterSessionStatusIDAndStatus_ketthuc.filters.length > 0){
      this.filterReview.filters.push(this.filterSessionStatusIDAndStatus_ketthuc)
    }

    if (this.filterReview.filters.length > 0){
      this.filterStatus.filters.push(this.filterReview)
    }

   

    if (this.filterStatus.filters.length > 0){
      this.gridState.filter.filters.push(this.filterStatus)
    }

    if (Ps_UtilObjectService.hasValueString(this.filterStartDate.value))
      this.gridState.filter.filters.push(this.filterStartDate)

    if (Ps_UtilObjectService.hasValueString(this.filterEndDate.value))
      this.gridState.filter.filters.push(this.filterEndDate)

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.tempSearch[0].value != '') {
        this.gridState.filter.filters.push(this.filterSearchBox);
      }
    }
  }

  onDatepickerChange(prop: string, item?){
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.loadFilter()
      this.GetListExamPortal()
    }
  }
  clearDate(prop: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this[prop].value = null
      this.loadFilter()
    }
  }

  openDetail(event: DTOExam){
    const Param = {
      QuizSession: event.QuizSession,
      StaffID: event.StaffID,
      Code: event.Code
    }
    this.QuizSessionService.ExamSession$.next(event)
    this.apiService.ChangeParamExam$.next(Param)
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) =>{
      localStorage.setItem("ExamSession",JSON.stringify(event))  
      var parent = item.ListMenu.find(f => f.Code.includes('portal001-exam-list')|| f.Link.includes('portal001-exam-list'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)){
        var detail = parent.LstChild.find(f => f.Code.includes('portal001-exam-detail')|| f.Link.includes('portal001-exam-detail'))
        this.menuService.activeMenu(detail)
      }
    })
  }
  //Api
  //Start countdown every second by interval
  startCountdowns() {
    const arr = []
    this.ListExam.forEach((staff) => {
      if((staff.RemainDuration > 0 && staff.RemainDuration != null) && staff.SessionStatusID == 1){
        const subscription = interval(1000).subscribe(() => {
          if (staff.RemainDuration != null && staff.RemainDuration > 0) {
            staff.RemainDuration -= 1;
          }
          if (staff.RemainDuration === 0 && staff.StatusID == 1) {
            subscription.unsubscribe();
            const statusID = 2
            arr.push(staff)
            this.UpdateExamStatus(arr, statusID, false)
          }
          this.countdownSubscriptions.push(subscription);
        });
      } else if(staff.RemainDuration == null && staff.Duration > 0 ){
        const subscription = interval(1000).subscribe(() => {
          if (staff.Duration != null && staff.Duration > 0) {
            staff.Duration -= 1;
          }
          if (staff.Duration === 0 && staff.StatusID != 2) {
            subscription.unsubscribe();
            const statusID = 2
            arr.push(staff)
            this.UpdateExamStatus(arr, statusID, false)
          }
          this.countdownSubscriptions.push(subscription);
        });
      }
    });
  }
  //
  GetListExamPortal(){
    this.loading = true;
    this.GetListSession_sst = this.apiService.GetListExamPortal(this.gridState).subscribe(res =>{
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
        this.ListExam = res.ObjectReturn.Data
        this.standardlistExams = JSON.parse(JSON.stringify(res.ObjectReturn.Data))
        this.checkListExam()
        this.startCountdowns();
        this.total = res.ObjectReturn.Total;
        this.gridView.next({data: this.ListExam, total: this.total})
      }else{
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy dữ liệu: " ${res.ErrorString}`);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi kết nối với máy chủ: ${error}`);
    })
  }
  UpdateExamStatus(items: any[] = [this.Exam], statusID: number = this.Exam.StatusID, Isedit: boolean){
    this.loading = true
    var ctx = 'Cập nhật tình trạng'

    this.UpdateExamStatus_sst = this.apiService.UpdateExamStatus(items, statusID).subscribe(res =>{
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if(Isedit){
          this.Exam = { ...items[0] }
          this.openDetail(this.Exam)
        }
        else{
          this.GetListExamPortal()
        }
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      this.loading = false;
    },() =>{
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    }
    )
  }
  //
  loadMore(){
    this.page += 25;
    this.gridState.take = this.pageSize + this.page
    this.GetListExamPortal()
  }
  //
  CheckList(item: DTOExam){
    if((item.StatusID == 0 && item.SessionStatusID != 1) || 
      item.SessionStatusID == 1 && item.StatusID == 2 && (item.EvaluationView == 1 || item.EvaluationView == 2)
      || item.SessionStatusID >= 3 && item.StatusID == 2 && item.EvaluationView == 2 || item.StatusID == 3){
      return true
    } else { 
      return false
    }
  }
  //
  checkListExam(){
    this.ListExam.forEach(item => {
      if (item.StatusID == 1 && item.SessionStatusID == 3) {
        item.StatusID = 2;
        item.StatusName = 'Kết thúc làm bài';
      }
    });
  }
  //click evet
  handleSearch(event: any){
    if (event.filters && event.filters.length > 0){
      if (event.filters[0].value === '') {
        this.gridState.skip = 0
        this.loadFilter();
        this.GetListExamPortal()
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.tempSearch = event.filters;
        this.gridState.skip = 0
        this.loadFilter();
        this.GetListExamPortal()
      }
    }
  }
  resetFilter(){
    this.dangkiemtra_checked = true;
    this.ketthuc_checked = false;
    this.phuckhao_checked = false
    this.clearDate('filterStartDate')
    this.clearDate('filterEndDate')
    this.gridState.skip = 0
    this.loadFilter()
    this.GetListExamPortal()
  }
  selectedBtnChange(e, strCheck: string){
    this[strCheck] = e
    this.gridState.skip = 0
    this.loadFilter()
    this.GetListExamPortal()
  }
  onCheckboxClick(strCheck: string){
    this[strCheck] = !this[strCheck]
    this.gridState.skip = 0
    this.loadFilter()
    this.GetListExamPortal()

  }
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListExamPortal()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.GetListExamPortal()
  }
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any){
    this.Exam = {...dataItem}
    var statusID = this.Exam.StatusID;
    var SessionStatusID = this.Exam.SessionStatusID
    moreActionDropdown = []

    if ((statusID == 1 || statusID == 0) && (SessionStatusID == 1)){
      moreActionDropdown.push({Name: "Làm bài", Code : "pencil", Link: 'edit', Actived : true})
    }

    if(
      (this.Exam.EvaluationView == 0 && (statusID == 2 || statusID ==3 )) ||
      (this.Exam.EvaluationView == 1 && (this.Exam.SessionStatusID == 3))
    ){  
      moreActionDropdown.push({Name: "Xem kết quả đánh giá", Code : "eye", Link: 'detail', Actived : true})
    }

    if (this.Exam.EvaluationView == 2){
      moreActionDropdown.push({Name: "Xem kết quả đánh giá", Code : "eye", Link: 'detail', Actived : false})
    }    
    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: any){

      this.Exam = { ...item }
      if (menu.Link === 'edit' ) {
        if(this.Exam.Code == null || (this.Exam.StatusID == 1)){
          this.openDetail(this.Exam)
        } else if(this.Exam.StatusID == 0){
          this.UpdateExamStatus([this.Exam], 1, true)
        }
      }
      else if (menu.Link === "detail" ){
        const targetObjects = this.standardlistExams.find(item => item.QuizSessionID === this.Exam.QuizSessionID);
        if(this.Exam.StatusID != targetObjects.StatusID){
          this.UpdateExamStatus([targetObjects], 2, true)
        } else{
          this.openDetail(this.Exam)
        }
        // 
      }
  
  }

  ngOnDestroy(): void {
    this.changeModuleData_sst?.unsubscribe()
    this.GetListSession_sst?.unsubscribe()
    this.UpdateExamStatus_sst?.unsubscribe()
    this.countdownSubscriptions.forEach((subscription) => {
			subscription.unsubscribe();
		});
  }
}

