//#region IMPORT
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { DTOQuizSession } from '../../shared/dto/DTOQuizSession.dto';
import { HriQuizSessionsAPIService } from '../../shared/services/hri-quiz-session-api.service';
import { PageChangeEvent, SelectableSettings, } from '@progress/kendo-angular-grid';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { HriQuizSessionService } from '../../shared/services/hri-quiz-session.service';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
//#endregion

//#region CREATE COMPONENT
@Component({
	selector: 'app-hri010-evaluation-tranche',
	templateUrl: './hri010-evaluation-tranche.component.html',
	styleUrls: ['./hri010-evaluation-tranche.component.scss']
})
//#endregion

//#region Hri010EvaluationTrancheComponent
export class Hri010EvaluationTrancheComponent implements OnInit {

	//#region CONSTRUCTOR
	constructor(private sessionsAPIService: HriQuizSessionsAPIService,
		private layoutService: LayoutService,
		private layoutAPIService: LayoutAPIService,
		public menuService: PS_HelperMenuService,
		private quizSessionService: HriQuizSessionService,
		private helperService: PS_HelperMenuService,) { }
	//#endregion

	//#region ONINIT
	ngOnInit(): void {

		this.getActionDropdownCallback = this.getActionDropdown.bind(this)
		this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
		this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this);
		this.getSelectionPopupCallback = this.getSelectionPopup.bind(this);
		this.onPageChangeCallback = this.pageChange.bind(this);
		this.onSelectCallback = this.selectChange.bind(this)
		let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
				this.getListQuizSession(this.setFilter())
			}
		})

		var that = this
		let changePermissionAPI = this.menuService.changePermission().subscribe((res: DTOPermission) => {
			if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
				that.justLoaded = false;
				that.actionPerm = distinct(res.ActionPermission, 'ActionType');

				that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
				that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
				that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
				that.dataPerm = distinct(res.DataPermission, 'Warehouse');
			}
		});
		this.arrUnsubscribe.push(changePermissionAPI, permissionAPI);

		this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
	}
	//#endregion

	//#region ONDESTROY
	ngOnDestroy(): void {
		this.arrUnsubscribe.forEach((s) => {
			s?.unsubscribe();
		});
	}
	//#endregion

	onLoadListQuizSession() {
		if (this.isFilterActive) {
			$('.clear-filter-btn').click()
		}
	}

	uploadEventHandlerCallback: Function

	// Xử lý mở dialog import 
	onImportExcel() {
		this.layoutService.setImportDialog(true)
	}

	// Xử lý tải file 
	onDownloadExcel() {
		var ctx = "Download Excel Template"
		var getfileName = "QuizSessionTemplate.xlsx"
		this.layoutService.onInfo(`Đang xử lý ${ctx}`)
		let GetTemplateDepartment_sst = this.layoutAPIService.GetTemplate(getfileName).subscribe(res => {
			if (res != null) {
				Ps_UtilObjectService.getFile(res, getfileName)
				this.layoutService.onSuccess(`Download Excel Template thành công`)
			} else {
				this.layoutService.onError(`Download Excel Template thất bại`)
			}
			this.loading = false;
		}, f => {
			this.layoutService.onError(`Xảy ra lỗi khi Download Excel Template. ` + f?.error?.ExceptionMessage)
		});
		this.arrUnsubscribe.push(GetTemplateDepartment_sst)
	}

	// Xử lý sự kiện import file
	uploadEventHandler(e: File) {
		this.ImportExcelSession(e)
	}

	// API xử lý import file 
	ImportExcelSession(file) {
		let ImportExcel_sst = this.sessionsAPIService.ImportExcelSession(file).subscribe(res => {
			if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
				this.layoutService.onSuccess(`Import Excel thành công`)
				this.layoutService.setImportDialogMode(1)
				this.layoutService.setImportDialog(false)
				this.layoutService.getImportDialogComponent().inputBtnDisplay()
			} else this.layoutService.onError(`Đã xảy ra lỗi khi Import Excel: ${res.ErrorString}`)
			this.loading = false;
		}, (err) => { this.layoutService.onError(`Đã xảy ra lỗi khi Import Excel: ${err}`) })
		this.arrUnsubscribe.push(ImportExcel_sst)
	}

	//#region SUBSCRIPTION CALL API
	arrUnsubscribe: Subscription[] = []
	//#endregion

	//#region PERMISSION
	isAllPers: boolean = false
	isCanCreate: boolean = false
	isCanApproved: boolean = false
	justLoaded: boolean = true
	dataPerm: DTODataPermission[] = [];
	actionPerm: DTOActionPermission[] = [];
	//#endregion

	//#region GIRD LAYOUT VARIABLE
	total: number = 0
	pageSize: number = 25
	loading: boolean = false
	isFilterActive: boolean = true
	pageSizes = [this.pageSize];
	gridView = new Subject<any>();
	onPageChangeCallback: Function
	listQuizSession: DTOQuizSession[]
	gridState: State = {
		take: this.pageSize, filter: { filters: [], logic: 'and' }, sort: [{ field: 'LastModifiedTime', dir: 'desc' }]
	}
	selectable: SelectableSettings = { enabled: true, mode: 'multiple', drag: false, checkboxOnly: true, };
	//#endregion

	//#region GIRD LAYOUT FUNCTION
	//EVENT PAGER CHANGE FUNCTION - LIST GIRD
	pageChange(event: PageChangeEvent) {
		this.gridState.skip = event.skip;
		this.gridState.take = this.pageSize = event.take;
		this.getListQuizSession(this.gridState);
	}

	//GET DATA TREE LIST FUNCTION - LIST GIRD
	getListQuizSession(filter: State) {
		this.loading = true
		let getListQuizSessionAPI = this.sessionsAPIService.GetListQuizSession(filter).subscribe(res => {
			if (res.StatusCode == 0) {
				this.listQuizSession = res.ObjectReturn.Data
				this.total = res.ObjectReturn.Total
				this.gridView.next({ data: this.listQuizSession, total: this.total });
			} else {
				this.layoutService.onError(`Lỗi lấy danh sách đợt đánh giá: ${res.ErrorString}`)
			}
			this.loading = false
		}, (err) => {
			this.layoutService.onError(`Lỗi lấy danh sách đợt đánh giá: ${err}`);
			this.loading = false
		})
		this.arrUnsubscribe.push(getListQuizSessionAPI);
	}
	//#endregion

	//#region GROUP FILTER STATUS VARIABLE
	isNew: boolean = true
	isSent: boolean = true
	isStoped: boolean = false
	isApproved: boolean = true
	isComplete: boolean = false
	isAppeal: boolean = false
	filterComplete: FilterDescriptor
	filterStatus: CompositeFilterDescriptor = { logic: "or", filters: [] }
	filterSessionStatus: CompositeFilterDescriptor = { logic: "or", filters: [] }
	filterNew: FilterDescriptor = { field: 'StatusID', value: '0', operator: 'eq', ignoreCase: true }
	filterSent: FilterDescriptor = { field: 'StatusID', value: '1', operator: 'eq', ignoreCase: true }
	filterStoped: FilterDescriptor = { field: 'StatusID', value: '3', operator: 'eq', ignoreCase: true }
	filterReturn: FilterDescriptor = { field: 'StatusID', value: '4', operator: 'eq', ignoreCase: true }
	filterApprove: FilterDescriptor = { field: 'StatusID', value: '2', operator: 'eq', ignoreCase: true }
	filterAppealMarking: FilterDescriptor = { field: 'SessionStatusID', value: '5', operator: 'eq', ignoreCase: true }
	filterAppealSuccess: FilterDescriptor = { field: 'SessionStatusID', value: '6', operator: 'eq', ignoreCase: true }
	//#endregion

	//#region GROUP FILTER SESSION VARIABLE
	filterSession: any
	//#endregion

	//#region GROUP FILTER DATE VARIABLE
	filterStartDate: FilterDescriptor = { field: "StartDate", operator: "gte", value: null }
	filterEndDate: FilterDescriptor = { field: "EndDate", operator: "lte", value: null }

	// Set giá trị tối thiểu cho ngày
	setMinDate(date) {
		if (date === null) return
		return Ps_UtilObjectService.addDays(date, 1)
	}
	limitDate: Date = null

	// Set giá trị tối đa cho Datepicker
	onSetMaxDatepicker() {
		if (this.filterEndDate.value == null) return
		this.limitDate = Ps_UtilObjectService.subtractDays(this.filterEndDate.value, 1)
	}

	// Set giá trị tối thiểu cho Datepicker
	onSetMinDatepicker() {
		if (this.filterStartDate.value == null) return
		this.limitDate = Ps_UtilObjectService.subtractDays(this.filterStartDate.value, 1)
	}
	//#endregion

	//#region FILTER FUNCTION
	//SET FILTER VALUE FUNCTION - FILTER
	setFilter() {
		this.pageSizes = [...this.layoutService.pageSizes]
		this.gridState.filter.filters = []
		this.filterStatus.filters = []
		this.filterSessionStatus.filters = []

		this.gridState.skip = 0

		if (this.isNew) {
			this.filterStatus.filters.push(this.filterNew)
			this.filterStatus.filters.push(this.filterReturn)
		}
		if (this.isSent) this.filterStatus.filters.push(this.filterSent)
		if (this.isApproved) this.filterStatus.filters.push(this.filterApprove)
		if (this.isComplete) this.filterSessionStatus.filters.push(this.filterComplete)
		if (this.isStoped) this.filterStatus.filters.push(this.filterStoped)
		if (this.isAppeal) {
			this.filterSessionStatus.filters.push(this.filterAppealMarking)
			this.filterSessionStatus.filters.push(this.filterAppealSuccess)
		}
		if (this.filterStatus.filters.length > 0) this.gridState.filter.filters.push(this.filterStatus)
		if (this.filterSessionStatus.filters.length > 0) this.gridState.filter.filters.push(this.filterSessionStatus)

		if (this.filterSession !== undefined) {
			if (Ps_UtilObjectService.hasListValue(this.filterSession.filters)) {
				if (this.filterSession.filters[0].value != '') this.gridState.filter.filters.push(this.filterSession)
			}
		}

		if (Ps_UtilObjectService.hasValueString(this.filterStartDate.value)) this.gridState.filter.filters.push(this.filterStartDate)

		if (Ps_UtilObjectService.hasValueString(this.filterEndDate.value)) this.gridState.filter.filters.push(this.filterEndDate)

		return this.gridState
	}

	//FILER CHECKBOX WHEN  CHECKED FUNCTION - FILTER
	filterChangeCheckbox(e: any, type: string) {
		// console.log(e, type)

		// if (type === 'isNew') this.filterNew = e
		// else if (type === 'isSent') this.filterSent = e
		// else if (type === 'isApproved') this.filterApprove = e
		// else if (type === 'isComplete') this.filterComplete = e
		// else if (type === 'isStoped') this.filterStoped = e
		// else if (type === 'isAppeal') this.filterAppealMarking = e


		switch (type) {
			case 'isNew':
				this.filterNew = e
				break;
			case 'isSent':
				this.filterSent = e
				break;
			case 'isApproved':
				this.filterApprove = e
				break;
			case 'isComplete':
				this.filterComplete = e
				break;
			case 'isStoped':
				this.filterStoped = e
				break;
			case 'isAppeal':
				this.filterAppealMarking = e
				break;
			default:
				break;
		}

		this.getListQuizSession(this.setFilter())
	}

	//FILTER SESSION WHEN CHANGE FUNCTION - FILTER
	onSearchData(e: any) {
		this.filterSession = e
		this.getListQuizSession(this.setFilter())
	}

	//RESET FILTER FUNCTION  - FILTER
	onResetFilter() {
		this.isNew = true
		this.isSent = true
		this.isApproved = true
		this.isComplete = false
		this.isStoped = false
		this.filterStartDate = { field: "StartDate", operator: "gte", value: null }
		this.filterEndDate = { field: "EndDate", operator: "lte", value: null }
		this.getListQuizSession(this.setFilter())
	}

	//FILTER DATE  CHANGE FUNCTION - FILTER
	onDatepickerChange(prop: string, item?) {
		if (Ps_UtilObjectService.hasValueString(prop)) {
			this.getListQuizSession(this.setFilter())
		}
	}
	//#endregion

	//#region POPUP
	arrDelete: DTOQuizSession
	getSelectionPopupCallback: Function
	onSelectedPopupBtnCallback: Function
	onSelectCallback: Function
	isDisabledFilter = false

	selectChange(e) {
		this.isDisabledFilter = !(!e)
	}

	//ON CLICK BUTTON IN POPUP LIST - POPUP
	onSelectedPopupBtnClick(btnType: string, list: any[]) {
		if (list.length > 0) {
			var listdataExec: DTOQuizSession[] = [], statusUpdate: number = parseInt(btnType)
			if (statusUpdate === 1 || statusUpdate === -1) list.forEach((s) => {
				if (s.StatusID == 0 || s.StatusID == 4) listdataExec.push(s)
			});

			if (statusUpdate === 2 || statusUpdate === 4) list.forEach((s) => {
				if (s.StatusID == 1 || s.StatusID == 3) listdataExec.push(s)
			});

			if (statusUpdate === 3) list.forEach((s) => {
				if (s.StatusID == 2) listdataExec.push(s)
			});

			this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
			this.updateQuizSessionStatus(listdataExec, statusUpdate)
		}
	}

	//SET BUTTON IN POPUP LIST - POPUP
	getSelectionPopup(quizArr: DTOQuizSession[]) {
		this.isDisabledFilter = true
		var moreActionDropdown = new Array<MenuDataItem>();

		var sent = quizArr.findIndex((s) => s.StatusID == 0 || s.StatusID == 4);
		if ((this.isCanCreate || this.isAllPers) && sent != -1) moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: '1', Actived: true });

		var accept = quizArr.findIndex((s) => s.StatusID == 1 || s.StatusID == 3);
		if ((this.isCanApproved || this.isAllPers) && accept != -1) moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: '2', Actived: true });

		var stop = quizArr.findIndex((s) => s.StatusID == 2);
		if ((this.isCanApproved || this.isAllPers) && stop != -1) moreActionDropdown.push({ Name: "Ngưng đợt đánh giá", Code: "minus-outline", Type: '3', Actived: true });

		return moreActionDropdown;
	}

	//UPDATE ARRAY STATUS - POPUP
	updateQuizSessionStatus(dto: DTOQuizSession[], statusID: number) {
		this.loading = true;
		let updateQuizSessionStatusAPI = this.sessionsAPIService.UpdateQuizSessionStatus(dto, statusID).subscribe((res: any) => {
			if (res.ErrorString != null) this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái đợt đánh giá: ${res.ErrorString}`);
			if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
				this.loading = false;
				this.layoutService.onSuccess('Cập nhật trạng thái đợt đánh giá thành công!');
				this.getListQuizSession(this.setFilter())
			}
		}, (error) => {
			this.loading = false;
			this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái đợt đánh giá: ${error}`);
		});
		this.arrUnsubscribe.push(updateQuizSessionStatusAPI);
	}

	//DELETE ARRAY ITEM - POPUP
	deleteQuizSession(dto) {
		let deleteQuizSessionAPI = this.sessionsAPIService.DeleteQuizSession(dto).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.getListQuizSession(this.setFilter())
				this.layoutService.onSuccess('Xóa các đợt đánh giá thành công!')
			} else this.layoutService.onError(`Đã xảy ra lỗi khi xóa các đợt đánh giá: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi xóa các đợt đánh giá: ${err}`))
		this.arrUnsubscribe.push(deleteQuizSessionAPI)
	}
	//#endregion

	//#region DROPDOWN LIST VARIABLE
	getActionDropdownCallback: Function
	onActionDropdownClickCallback: Function
	//#endregion

	//#region DROPDOWN LIST FUNCTION
	//SET ACTION DROPDOWN LIST FUNCTION - DROPDOWN LIST
	getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem) {
		moreActionDropdown = []
		var statusID = dataItem.StatusID, sessionSTTID = dataItem.SessionStatusID,
			timeStart = new Date(dataItem.StartDate),
			timeOpen = new Date(dataItem.OpenedDate),
			timeClose = new Date(dataItem.ClosedDate),
			listRole = dataItem.ListOfUserRole,
			isLeader = false,
			isMonitor = false,
			isScores = false,
			hasEssay = dataItem.HasQuestionEssay,
			isReEval = true //mytodo thêm quyền phúc khảo

		if (Ps_UtilObjectService.hasListValue(listRole)) {
			isLeader = Ps_UtilObjectService.hasValue(listRole.find(r => r.TypeData == 1))
			isMonitor = Ps_UtilObjectService.hasValue(listRole.find(r => r.TypeData == 2 || r.TypeData == 5))
			isScores = Ps_UtilObjectService.hasValue(listRole.find(r => r.TypeData == 3))
			// isReEval = Ps_UtilObjectService.hasValue(listRole.find(r => r.TypeData == 6)) mytodo thêm quyền phúc khảo
		}

		if ((this.isAllPers || this.isCanCreate || this.isCanApproved || isLeader) &&
			(statusID == 2 || sessionSTTID != 0)) moreActionDropdown.push({
				Name: "Xem chi tiết đợt đánh giá", Code: "track-changes-reject", Type: 'hri010-evaluation-tranche-detail', Actived: true
			})

		if ((this.isAllPers || this.isCanCreate || this.isCanApproved) && statusID != 2 && sessionSTTID == 0) moreActionDropdown.push({
			Name: "Thiết lập đợt đánh giá", Code: "pencil", Type: 'hri010-evaluation-tranche-detail', Actived: true
		})

		if (sessionSTTID === 0 && statusID === 2 && timeStart < new Date() && new Date() < timeOpen && isLeader) moreActionDropdown.push({
			Name: "Bắt đầu làm bài", Code: "video-external", Type: 'startQuiz', Actived: true
		})

		if ((isLeader || isMonitor) && statusID == 2 && sessionSTTID != 0) moreActionDropdown.push({
			Name: "Giám sát đợt đánh giá", Code: "eye", Type: 'hri011-quiz-monitor', Actived: true
		})

		if (sessionSTTID === 1 && statusID === 2 && timeOpen < new Date() && new Date() < timeClose && isLeader) moreActionDropdown.push({
			Name: "Kết thúc làm bài", Code: "cancel", Type: 'stopQuiz', Actived: true
		})

		if ((isLeader || isScores) && statusID == 2 && sessionSTTID != 0 && sessionSTTID != 1 && hasEssay) moreActionDropdown.push({
			Name: "Chấm điểm câu tự luận", Code: "change-manually", Type: 'hri012-quiz-marking', Actived: true
		})

		if (statusID === 2 && sessionSTTID === 2 && isLeader) moreActionDropdown.push({
			Name: "Hoàn tất đợt đánh giá", Code: "check", Type: 'success', Actived: true
		})

		if (statusID === 2 && sessionSTTID === 3 && isLeader) moreActionDropdown.push({
			Name: "Tính điểm đợt đánh giá", Code: "parameters-byte-array", Type: 'calculate', Actived: true
		})

		if ((isLeader || isReEval) && statusID == 2 && (sessionSTTID === 3 || sessionSTTID === 4 || sessionSTTID === 5) &&
			dataItem.TypeOfSession !== 1 && dataItem.EvaluationView !== 2 &&
			Ps_UtilObjectService.hasValue(dataItem.AppealTime) &&
			Ps_UtilObjectService.hasValue(dataItem.ReEvaluateTime)) moreActionDropdown.push({
				Name: "Chấm phúc khảo", Code: "track-changes-enable", Type: 'hri016-appeal-list', Actived: true
			})

		if ((this.isCanCreate || this.isAllPers) && (statusID === 0 || statusID === 4)) moreActionDropdown.push({
			Name: "Gửi duyệt", Code: "redo", Type: 'sent', Actived: true
		})

		if ((this.isCanApproved || this.isAllPers) && (statusID === 1 || statusID === 3)) {
			moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'accept', Actived: true })
		}

		if ((this.isCanApproved || this.isAllPers) && (statusID === 1 || (statusID === 3 && sessionSTTID == 0))) {
			moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'return', Actived: true })
		}

		if ((this.isCanApproved || this.isAllPers) && statusID === 2 && sessionSTTID > 3) moreActionDropdown.push({
			Name: "Ngưng đợt đánh giá", Code: "minus-outline", Type: 'stop', Actived: true
		})

		if ((this.isCanCreate || this.isAllPers) && statusID === 0 && sessionSTTID === 0) moreActionDropdown.push({
			Name: "Xóa đợt đánh giá", Code: "trash", Type: 'delete', Actived: true
		})
		return moreActionDropdown
	}

	//ON ACTION DROPDOWN LIST CALLBACL FUNCTION - DROPDOWN LIST
	onActionDropdownClick(menu: MenuDataItem, item: DTOQuizSession) {
		if (menu.Code == 'pencil' || menu.Code == 'eye' || menu.Code == 'change-manually' || menu.Code == 'track-changes-reject' || menu.Code == 'track-changes-enable')
			this.onDropdownSetSession(menu.Type, item)
		else if (menu.Type == 'calculate' || menu.Code == 'parameters-byte-array') {
			let CalculateMarkQuizAPI = this.quizSessionService.CalculateMarkQuiz(item.Code).subscribe()
			this.arrUnsubscribe.push(CalculateMarkQuizAPI)
		}
		else if (menu.Code == 'redo' || menu.Code == 'check-outline' || menu.Code == 'minus-outline' || menu.Code == 'undo') {
			if (menu.Type == 'sent' || menu.Code == 'redo') this.updateQuizSessionStatus([item], 1)
			else if (menu.Type == 'accept' || menu.Code == 'check-outline') this.updateQuizSessionStatus([item], 2)
			else if (menu.Type == 'stop' || menu.Code == 'minus-outline') this.updateQuizSessionStatus([item], 3)
			else if (menu.Type == 'return' || menu.Code == 'undo') this.updateQuizSessionStatus([item], 4)
		}
		else if (menu.Code == 'trash') {
			this.dialog.item = item.SessionName
			this.dialog.obj = 'đợt đánh giá'
			this.openedDialog = true
			this.arrDelete = item
		}
		else if (menu.Type == 'success' || menu.Type == 'startQuiz' || menu.Type == 'stopQuiz') {
			if (menu.Type == 'startQuiz' || menu.Code == 'video-external') {
				item.SessionStatusID = 1
				item.OpenedDate = new Date()
				this.updateQuizSession(['SessionStatusID', 'OpenedDate'], item)
			}
			else if (menu.Type == 'stopQuiz' || menu.Code == 'cancel') {
				item.SessionStatusID = 2
				item.ClosedDate = new Date()
				this.updateQuizSession(['SessionStatusID', 'ClosedDate'], item)
			}
			else if (menu.Type == 'success' || menu.Code == 'check') {
				item.SessionStatusID = 3
				item.EndDate = new Date()
				this.updateQuizSession(['SessionStatusID', 'EndDate'], item)
			}
		}
	}

	//ON ACTION DROPDOWN SET SESSION FUNTION - DROPDOWN LIST
	onDropdownSetSession(type: string, i?: DTOQuizSession) {
		if (!(Ps_UtilObjectService.hasValue(i))) i = new DTOQuizSession
		let changeModuleData = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
			this.quizSessionService.setCacheQuizSession(i)
			var parent = item.ListMenu.find(f => f.Code.includes('hriCompetency') || f.Link.includes('hr007-competency-bank'))
			if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
				var detail = parent.LstChild.find(f => f.Code.includes('hri010-evaluation-tranche') || f.Link.includes('hri010-evaluation-tranche'))
				if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
					var detail2 = detail.LstChild.find(f => f.Code.includes(type) || f.Link.includes(type))
					this.menuService.activeMenu(detail2)
				}
			}
		})
		this.arrUnsubscribe.push(changeModuleData);
	}

	//ON CHANGE STATUS ACTION DROPDOWN FUCTION - DROPDOWN LIST
	updateQuizSession(prop: any, item: DTOQuizSession) {
		this.loading = true
		let updateQuizSessionAPI = this.quizSessionService.UpdateAndGetListQuizSession(item, prop, this.setFilter()).subscribe((res: any) => {
			this.loading = false
			this.listQuizSession = res.ObjectReturn.Data;
			this.total = res.ObjectReturn.Total;
			this.gridView.next({ data: this.listQuizSession, total: this.total });
		})
		this.arrUnsubscribe.push(updateQuizSessionAPI);
	}
	//#endregion

	//#region HEADER
	openDetail() {
		let changeModuleData_sst = this.helperService.changeModuleData().subscribe((item: ModuleDataItem) => {
			var parent = item.ListMenu.find(f => f.Code.includes('hriCompetency') || f.Link.includes('hr007-competency-bank'))
			if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
				var detail = parent.LstChild.find(f => f.Code.includes('hri010-evaluation-tranche') || f.Link.includes('hri010-evaluation-tranche'))
				if (Ps_UtilObjectService.hasValue(detail)) this.helperService.activeMenu(detail)
			}
		})
		this.arrUnsubscribe.push(changeModuleData_sst)
	}
	//#endregion

	//#region  DIALOG
	openedDialog = false
	dialog = { obj: '', item: '' }
	//#endregion
}
//#endregion
