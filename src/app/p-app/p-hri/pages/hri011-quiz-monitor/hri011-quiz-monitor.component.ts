//#region IMPORT
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { Observable, Subject, Subscription, interval, of } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { takeUntil, concatMap } from 'rxjs/operators';
import { HriQuizSessionsAPIService } from '../../shared/services/hri-quiz-session-api.service';
import { HriQuizSessionService } from '../../shared/services/hri-quiz-session.service';
import { DTOQuizRole } from '../../shared/dto/DTOQuizRole.dto';
import { HriExamApiService } from '../../shared/services/hri-exam-api.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ExamApiService } from 'src/app/p-app/p-portal/shared/services/Exam-api.service';
import { EnumDialogType } from 'src/app/p-app/p-layout/enum/EnumDialogType';
import { DTOQuizSession } from '../../shared/dto/DTOQuizSession.dto';


@Component({
	selector: 'app-hri011-quiz-monitor',
	templateUrl: './hri011-quiz-monitor.component.html',
	styleUrls: ['./hri011-quiz-monitor.component.scss']
})

//#region Hri010EvaluationTrancheComponent
export class Hri011QuizMonitorComponent implements OnInit, OnDestroy {
	//------GRID DECLARATIONS--------\\
	//Grid pagination
	total = 0
	pageSize = 25
	pageSizes = [this.pageSize]
	//GRID state
	gridViewStaff = new Subject<any>();
	gridListQuizDepartment = new Subject<any>();

	gridStateStaff: State = {
		take: this.pageSize,
		filter: {
			logic: 'and',
			filters: [
				{ field: "TypeData", operator: "eq", value: 4},
			]
		}
	}

	

	filterName: FilterDescriptor = { field: "StaffName", operator: "contains", value: null }
	filterPosition: FilterDescriptor = { field: "PositionName", operator: "contains", value: null }
	filterStaffCode: FilterDescriptor = { field: "StaffCode", operator: "contains", value: null }


	filterQuizDepartment: any[] = []
	listQuizDepartment: any[] = []
	


	staffData: any[] = [];
	countdownSubscriptions: Subscription[] = [];
	//Selectable grid
	onPageStaffChangeCallback: Function;
	selectedStaff: DTOQuizRole;
	selectedStaffArray: DTOQuizRole[] = []
	// Dropdown grid
	hasMenuDropdown: boolean = true;
	allowActionDropdown = [];
	getActionDropdownCallback: Function;
	onActionDropdownClickCallback: Function;
	//------ END GRID DECLARATIONS--------\\


	//Boolean
	loading: boolean = false;
	justLoaded: boolean = false;
	isStaffListOpened: boolean = true;
	isStopQuizDialogOpened: boolean = false;
	isDeleteAndCreateQuizDialogOpened: boolean = false;
	isEndQuizDialogOpened: boolean = false;


	quizSession: DTOQuizSession
	userQuizRole: any
	// Permission
	isMaster: boolean = false;
	isCreator: boolean = false;
	isApprover: boolean = false;
	isSupervisior: boolean = false;
	actionPerm: DTOActionPermission[];

	//Subscription
	changeModuleData_sst: Subscription;
	changePermission_sst: Subscription;
	getEvaluationSupervisor_sst: Subscription;

	private ngUnsubsribe = new Subject<void>();

	selectedMenu: string;
	countdown$: Observable<string>;

	//dialog type
	dialogWarning = EnumDialogType.Confirm
	
	constructor(		
		private layoutService: LayoutService,
		private layoutAPIService: LayoutAPIService,
		private helperService: PS_HelperMenuService,
		private quizAPIService: HriQuizSessionsAPIService,
		private sessionService: HriQuizSessionService,
		private examAPIService: HriExamApiService,
	) { }

	ngOnInit(): void {
		let that = this;
		this.helperService
			.changePermission()
			.pipe(takeUntil(this.ngUnsubsribe))
			.subscribe((res: DTOPermission) => {
				if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
					that.justLoaded = false;
					that.actionPerm = distinct(res.ActionPermission, 'ActionType');

					that.isMaster =
						that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
					that.isCreator =
						that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
					that.isApprover =
						that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
				}
				
			});

			this.helperService.changePermissionAPI().pipe(takeUntil(this.ngUnsubsribe)).subscribe((res) => {
				if (Ps_UtilObjectService.hasValue(res)) {
					//GET DATA
					this.getCacheQuizSession();
				}
			})

		//GRID DROPDOWN BINDING RANGE
		this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this);
		this.getActionDropdownCallback = this.onGetActionDropdown.bind(this);
		this.onPageStaffChangeCallback = this.onPageChangStaff.bind(this);
	}


	checkLeaderMonitor(state: State){
		if(Ps_UtilObjectService.hasValue(this.quizSession)){
			if(this.quizSession.IsLeaderMonitor == true){
				var userMonitor = this.quizSession.ListOfUserRole.find(user => user.TypeData == 5)
				if(Ps_UtilObjectService.hasValue(userMonitor)){
				if(userMonitor.IsLeader == true){
					state.filter.filters.push({field: "Department", operator: "eq", value: userMonitor.Department})
				}
				else if(userMonitor.IsSupervivor == true){
					state.filter.filters.push(
						{field: "Department", operator: "eq", value: userMonitor.Department},
						{field: "Location", operator: "eq", value: userMonitor.Location}
					)
				}
			}
			}
		}
	}

	loadFilter(){
		this.gridStateStaff.filter.filters = []
		this.pageSizes = [...this.layoutService.pageSizes];
		this.gridStateStaff.take = this.pageSize;

		this.gridStateStaff.filter.filters = [
		{ field: "QuizSession", operator: "eq", value: this.quizSession.Code},
		{ field: "TypeData", operator: "eq", value: 4},];
		
		
		let filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] }
	
		if(this.isStaffListOpened){
			if (Ps_UtilObjectService.hasValueString(this.filterStaffCode.value))
			filterSearch.filters.push(this.filterStaffCode)

			if (Ps_UtilObjectService.hasValueString(this.filterName.value))
			filterSearch.filters.push(this.filterName)
		
			if (Ps_UtilObjectService.hasValueString(this.filterPosition.value))
			filterSearch.filters.push(this.filterPosition)
		}
		if (filterSearch.filters.length > 0) {
		  this.gridStateStaff.filter.filters.push(filterSearch);
		}
		
	  }

	resetFilter() {
		this.Search(null);
	}

	closeDialog(){
		this.isStopQuizDialogOpened = false
		this.isEndQuizDialogOpened = false
		this.isDeleteAndCreateQuizDialogOpened = false
	}
	
	Search(event: any) {
		if (Ps_UtilObjectService.hasValueString(event)) {
			if(this.isStaffListOpened){
				this.filterName.value = event;
		  		this.filterPosition.value = event;
		  		this.filterStaffCode.value = event;
			}else{
				var temp = this.listQuizDepartment.filter(s => s.DepartmentName != null && s.LocationName !== null)
				 this.filterQuizDepartment = temp.filter(s => s.DepartmentName.includes(event) || s.LocationName.includes(event))
			}
		} else {
			this.filterName.value = null;
			this.filterPosition.value = null;
			this.filterStaffCode.value = null;
			if(!this.isStaffListOpened){
				this.getListQuizDepartment();
			}
		}
		this.loadFilter();
		if(this.isStaffListOpened){
			this.GetEvaluationStaff(this.gridStateStaff);
		}
		else{
			this.gridListQuizDepartment.next({ data: this.filterQuizDepartment, total: this.filterQuizDepartment.length })
		}
	  }



	//Grid dropdown handle functions
	onActionDropdownClick(menu: MenuDataItem, item: any) {
		if (menu.Type=== 'Stop') {
			this.isStopQuizDialogOpened = true;
		}
		else if (menu.Type === 'CreateNew' || menu.Code === 'reload') {
			this.isDeleteAndCreateQuizDialogOpened = true;
		}
		else if (menu.Type === 'End' || menu.Code === 'check-outline') {
			this.isEndQuizDialogOpened = true;
		}
		else if (menu.Type === 'Exam' || menu.Code === 'eye') {
			if(Ps_UtilObjectService.hasValue(item.QuizSession) &&
			 Ps_UtilObjectService.hasValue(item.Exam) &&
			 Ps_UtilObjectService.hasValue(item.StaffID)){
				item.Code = item.Exam
				localStorage.setItem("ExamSession",JSON.stringify(item));
			}
			const examMonitor = {
				QuizSession: item.QuizSession,
				Code: item.Exam,
				StaffID: item.StaffID
			}
			this.examAPIService.ChangeParamExam$.next(examMonitor)
			this.openDetail('exam-monitor');
		}
	}


	onGetActionDropdown(moreActionDropdown: MenuDataItem[],dataItem: any) {
		moreActionDropdown = [];
		this.selectedStaff = { ...dataItem};
		this.selectedStaffArray = { ...dataItem}
		var statusID = dataItem.StatusID
		var userRoleMonitor = this.quizSession.ListOfUserRole.find(s => s.TypeData == 1 || s.TypeData == 2 || s.TypeData == 5)
		var SessionStatusID = this.quizSession.SessionStatusID
		
		if(statusID == 0 || statusID == null){
			moreActionDropdown.push({Name: null, Code: null, Type: null, Link: null, Actived: false })
		}
		if((statusID == 1 || statusID == 2 || statusID == 3) && (userRoleMonitor || this.isMaster)){
			moreActionDropdown.push(
				{ Name: "Xem bài thi", Code: "eye", Type: 'Exam', Link: "Exam", Actived: true },)
		}
		if(statusID == 1 || statusID == 3 && (userRoleMonitor || this.isMaster) && SessionStatusID == 1){
			moreActionDropdown.push(
				{ Name: "Kết thúc bài thi", Code: "check-outline", Type: 'End', Actived: true },
				{ Name: "Xóa và tạo mới đề", Code: "reload", Type: 'CreateNew', Actived: true },)
		}
		if(statusID == 1 && (userRoleMonitor || this.isMaster) && SessionStatusID == 1){
			moreActionDropdown.push(
				{ Name: "Dừng đánh giá", Code: "pause", Type: 'Stop', Link: "StatusID", Actived: true },)
		}
		if(SessionStatusID == 3 && statusID == 2 && (userRoleMonitor || this.isMaster)){
			moreActionDropdown.push(
				{ Name: "Tính điểm đợt đánh giá", Code: "parameters-byte-array", Type: 'calculate', Actived: true},)
		}

		// else if(statusID == 1 && (userRoleMonitor || this.isMaster)){
		// 	moreActionDropdown.push(
		// 		{ Name: "Xem bài thi", Code: "eye", Type: 'Exam', Link: "Exam", Actived: true },
		// 		{ Name: "Dừng đánh giá", Code: "pause", Type: 'Stop', Link: "StatusID", Actived: true },
		// 		{ Name: "Kết thúc bài thi", Code: "check-outline", Type: 'End', Actived: true },
		// 		{ Name: "Xóa và tạo mới đề", Code: "reload", Type: 'CreateNew', Actived: true },
		// )}
		// else if(statusID == 2 && (userRoleMonitor || this.isMaster)){
		// 	moreActionDropdown.push(
		// 		{ Name: "Xem bài thi", Code: "eye", Type: 'Exam', Link: "Exam", Actived: true }
		// 	)}
		// else if(statusID == 3 && (userRoleMonitor || this.isMaster)){
		// 	moreActionDropdown.push(
		// 		{ Name: "Xem bài thi", Code: "eye", Type: 'Exam', Link: "Exam", Actived: true },
		// 		{ Name: "Kết thúc bài thi", Code: "check-outline", Type: 'End', Actived: true },
		// 		{ Name: "Xóa và tạo mới đề", Code: "reload", Type: 'CreateNew', Actived: true },
		// )}
		
		return moreActionDropdown;
	}

	handleSubmitDialogBtn(typeDialog: string) {
		if (!Ps_UtilObjectService.hasValue(this.selectedStaff.Exam)){
			this.layoutService.onError("Không tìm thấy bài làm");
			this.closeDialog();
		} else {
			if (typeDialog === 'stop') {
				if(Ps_UtilObjectService.hasValue(this.selectedStaff) && Ps_UtilObjectService.hasValueString(this.selectedStaff.StopReason)){
					this.isStopQuizDialogOpened = false;
					this.updateExamStatus([this.selectedStaffArray],3);
				}
				else{
					this.layoutService.onWarning("Bạn chưa nhập lí do dừng bài làm");
				}
			} else if (typeDialog === 'delete') {
				this.isDeleteAndCreateQuizDialogOpened = false;
				this.deleteExam();
			} else {
				this.isEndQuizDialogOpened = false;
				this.updateExamStatus([this.selectedStaffArray],2);
			}
		}
	} 

	updateQuizSession(updatedQuiz: DTOQuizSession, propName: string[]) {
		this.quizAPIService.UpdateQuizSession(updatedQuiz, propName).pipe(takeUntil(this.ngUnsubsribe)).subscribe(res => {
				if(res.StatusCode == 0 && Ps_UtilObjectService.hasValue(res.ObjectReturn)){
					this.sessionService.setCacheQuizSession(res.ObjectReturn);
					this.layoutService.onSuccess("Cập nhật trạng thái đợt đánh giá thành công")
				}
				else{
					this.GetEvaluationStaff(this.gridStateStaff);
					this.layoutService.onError("Đã xảy ra lỗi khi cập nhật trạng thái đợt đánh giá: "+ res.ErrorString)
				}
		},err => {
			this.GetEvaluationStaff(this.gridStateStaff);
			this.layoutService.onError('Đã xảy ra lỗi khi cập nhật trạng thái đợt đánh giá: ' +err);
		})
	}
	
	calculateMarkQuiz(){
		this.sessionService.CalculateMarkQuiz(this.quizSession.Code).pipe(takeUntil(this.ngUnsubsribe)).subscribe();
	}

	onUpdateButton(e,propName){
		if(e.SessionStatusID == 1){
			e.SessionStatusID = 2
			this.updateQuizSession(e,[propName])
		}
		else if(e.SessionStatusID == 2){
			e.SessionStatusID = 3
			this.updateQuizSession(e,[propName])
		}
	}



	updateExamStatus(items: any[] = [this.selectedStaffArray],statusID: number) {
		if(Ps_UtilObjectService.hasListValue(items)){
			var quizSession = items.filter(s => s)
			quizSession[0].Code = this.selectedStaff.Exam
			quizSession[0].StopReason = this.selectedStaff.StopReason
		}
		this.examAPIService.UpdateExamStatus(quizSession, statusID)
		.pipe(takeUntil(this.ngUnsubsribe))
		.subscribe(
			res => {
				if (res.StatusCode === 0) {
					this.layoutService.onSuccess('Cập nhật tình trạng thành công');
					this.GetEvaluationStaff(this.gridStateStaff);
				} else {
					this.GetEvaluationStaff(this.gridStateStaff);
					this.layoutService.onError('Đã xảy ra lỗi khi cập nhật tình trạng bài làm: '+  res.ErrorString);
				}
			}, error => {
				this.GetEvaluationStaff(this.gridStateStaff);
				this.layoutService.onError('Đã xảy ra lỗi khi cập nhật tình trạng bài làm: ' + error);
			} 
		)
	}

	deleteExam() {
		this.examAPIService.DeleteExam(this.selectedStaff)
		.pipe(takeUntil(this.ngUnsubsribe))
		.subscribe(
			res => {
				if (res.StatusCode === 0) {
					this.layoutService.onSuccess('Xóa bài làm thành công');
					this.GetEvaluationStaff(this.gridStateStaff);
				} else {
					this.GetEvaluationStaff(this.gridStateStaff);
					this.layoutService.onError('Đã xảy ra lỗi khi xóa bài làm: ' +  res.ErrorString);
				}
			}, error => {
				this.GetEvaluationStaff(this.gridStateStaff);
				this.layoutService.onError('Đã xảy ra lỗi khi xóa bài làm: '+ error);
			} 
		)
	}


	onPageChangStaff(event: PageChangeEvent) {
		this.gridStateStaff.skip = event.skip;
		this.gridStateStaff.take = this.pageSize = event.take;
		this.GetEvaluationStaff(this.gridStateStaff);
	}

	//Change view of grid
	onChangeViewGrid(bool: boolean) {
		this.isStaffListOpened = bool;
		if (this.isStaffListOpened) {
			this.loadFilter()
			this.GetEvaluationStaff(this.gridStateStaff);
		} else {
			this.getListQuizDepartment();
		}
	}

	//Data handle function
	GetAllData() {
		if(this.isStaffListOpened){
			this.loadFilter()
			this.GetEvaluationStaff(this.gridStateStaff);
		}
		else{
			this.getListQuizDepartment();
		}
	}

	GetEvaluationStaff(state: State) {
		this.loading = true;
		this.checkLeaderMonitor(state);
		this.getEvaluationSupervisor_sst = this.quizAPIService.GetListQuizRole(state)
			.pipe(takeUntil(this.ngUnsubsribe))
			.subscribe(
				(res) => {
					if (
						Ps_UtilObjectService.hasValue(res) &&
						Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
						res.StatusCode == 0
					) {
						//TODO: test countdown
						// res.ObjectReturn.Data.forEach((item) => item.RemainDuration = 9000);
						this.staffData = [...res.ObjectReturn.Data];
						this.startCountdowns();
						
						this.gridViewStaff.next({
							data: res.ObjectReturn.Data,
							total: res.ObjectReturn.Total
						})
					} 
					else{
						this.layoutService.onError('Đã xảy ra lỗi khi tìm danh sách giám sát nhân sự tham gia đợt đánh giá: ' +  res.ErrorString);	
					}
					this.loading = false;
				},
				(error) => {
					this.loading = false;
					this.layoutService.onError('Đã xảy ra lỗi khi tìm danh sách giám sát nhân sự tham gia đợt đánh giá: '+ error);
				}
			)
	}

	//Hàm router link menu trong sitemap - menu-data-admin
	openDetail(linkMenu: string) {
		this.changeModuleData_sst = this.helperService.changeModuleData().pipe(takeUntil(this.ngUnsubsribe)).subscribe((item: ModuleDataItem) => {
			//staff
			var parent = item.ListMenu.find(f => f.Code.includes('hriCompetency')
				|| f.Link.includes('hr007-competency-bank'))
			//
			if (linkMenu === 'list') {
				if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
					var detail = parent.LstChild.find(f => f.Code.includes('hri010-evaluation-tranche')
						|| f.Link.includes('hri010-evaluation-tranche'))
					if (Ps_UtilObjectService.hasValue(detail)) {
						this.helperService.activeMenu(detail)
					}
				}
			}
			if (linkMenu === 'exam-monitor') {
				if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
					var detail = parent.LstChild.find(f => f.Code.includes('hri010-evaluation-tranche')
						|| f.Link.includes('hri010-evaluation-tranche'))
					if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
						var detail1 = detail.LstChild.find(f => f.Code.includes('hri011-quiz-monitor')
						|| f.Link.includes('hri011-quiz-monitor'))
						if (Ps_UtilObjectService.hasValue(detail1) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
							var detail2 = detail1.LstChild.find(f => f.Code.includes('hri014-exam-monitor')
							|| f.Link.includes('hri014-exam-monitor'))
							if (Ps_UtilObjectService.hasValue(detail2)) {
								this.helperService.activeMenu(detail2)
							}
						}
					}
				}
			}
		})
	}


	//Reload page
	onReloadPage() {
	}

	//Convert rest time to formatted string
	// getCountDownTime(restTime: number): string {
	// 	if (restTime != null && restTime > 0) {
	// 		let hours = Math.floor(restTime / 60);
	// 		let minutes = Math.floor((restTime % 60));
	// 		let seconds = Math.floor((restTime * 60) % 60);
	// 		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	// 	}
	// }

	//Start countdown every second by interval
	startCountdowns() {
		this.staffData.forEach((staff) => {

			const subscription = interval(1000).subscribe(() => {
				if (staff.RemainDuration != null && staff.RemainDuration > 0) {
					staff.RemainDuration -= 1;
				}
				if (staff.RemainDuration === 0) {
					subscription.unsubscribe();
				}
			});

			this.countdownSubscriptions.push(subscription);
		});
	}

	getListQuizDepartment(): void {
		this.loading = true
		this.quizAPIService.GetListQuizDepartment(this.quizSession.Code).pipe(takeUntil(this.ngUnsubsribe)).subscribe(
			res => {
				if (res.StatusCode === 0 && Ps_UtilObjectService.hasListValue(res.ObjectReturn)) {
					this.listQuizDepartment = res.ObjectReturn
					if(Ps_UtilObjectService.hasValue(this.quizSession)){
						if(this.quizSession.IsLeaderMonitor == true){
							var userMonitor = this.quizSession.ListOfUserRole.find(user => user.TypeData == 5)
							if(Ps_UtilObjectService.hasValue(userMonitor)){
								if(userMonitor.IsLeader == true){
									this.listQuizDepartment = res.ObjectReturn.filter(item => item.Department == userMonitor.Department)
								}
								else if(userMonitor.IsSupervivor == true){
									this.listQuizDepartment = res.ObjectReturn.filter(item => item.Department == (userMonitor.Department) && item.Location == (userMonitor.Location))
								}
							}
						}
					}
					this.gridListQuizDepartment.next({
						data: this.listQuizDepartment,
						total: this.listQuizDepartment.length,
					})
				} else{
					this.layoutService.onError("Đã xảy ra lỗi khi Không tìm thấy danh sách đơn vị tham gia đợt đánh giá: " +  res.ErrorString);
				}
				this.loading = false;
			}, err => {
				this.loading = false;
				this.layoutService.onError(`Đã xảy ra lỗi khi Không tìm thấy danh sách đơn vị tham gia đợt đánh giá: ${err}`);
			}
		)
	}

	getCacheQuizSession(): void {
		this.sessionService.GetCacheQuizSession().subscribe
		((res) => {
				if (Ps_UtilObjectService.hasValue(res) && res.Code > 0) {
					this.sessionService.setCacheQuizSession(res)
					this.quizSession = res;
					this.userQuizRole = res.ListOfUserRole.find(s => s.TypeData == 1)
					this.gridStateStaff.filter.filters.push(
						{field: "QuizSession", operator: "eq", value: this.quizSession.Code},
					)

					this.GetEvaluationStaff(this.gridStateStaff);
				}
				else{
					this.layoutService.onError("Đã xảy ra lỗi khi giám sát đợt đánh giá")
				}
			})
	}

	ngOnDestroy(): void {
		this.ngUnsubsribe.next();
		this.ngUnsubsribe.complete();

		this.countdownSubscriptions.forEach((subscription) => {
			subscription.unsubscribe();
		});
	}
}