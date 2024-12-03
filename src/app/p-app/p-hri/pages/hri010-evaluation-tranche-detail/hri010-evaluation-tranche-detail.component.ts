//#region IMPORT
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOQuizSession } from '../../shared/dto/DTOQuizSession.dto';
import { HriQuizSessionService } from '../../shared/services/hri-quiz-session.service';
import { HriQuizSessionsAPIService } from '../../shared/services/hri-quiz-session-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOEmployee } from '../../shared/dto/DTOEmployee.dto';
import { CompositeFilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { StaffApiService } from '../../shared/services/staff-api.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOQuizConfig } from '../../shared/dto/DTOQuizConfig.dto';
import { skip } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { DTOQuizPositionRole } from '../../shared/dto/DTOQuizPositionRole.dto';
import { DTOQuizStaffRole } from '../../shared/dto/DTOQuizStaffRole.dto';
import { DTOSearchCompetence, DTOSearchCategory } from '../../shared/dto/DTOSearchConfig.dto';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import * as $ from 'jquery';

//#endregion

//#region CREATE COMPONENT
@Component({
	selector: 'app-hri010-evaluation-tranche-detail',
	templateUrl: './hri010-evaluation-tranche-detail.component.html',
	styleUrls: ['./hri010-evaluation-tranche-detail.component.scss']
})
//#endregion

//#region Hri010EvaluationTrancheComponent
export class Hri010EvaluationTrancheDetailComponent implements OnInit {
	//#region CONSTRUCTOR
	constructor(
		private layoutService: LayoutService,
		private quizSessionService: HriQuizSessionService,
		private staffAPIService: StaffApiService,
		private helperService: PS_HelperMenuService,
		private sessionsAPIService: HriQuizSessionsAPIService,
		private cdr: ChangeDetectorRef
	) { }
	//#endregion

	//#region ONINIT
	ngOnInit(): void {
		var that = this
		this.onPageChangeCallback = this.pageChange.bind(this);
		this.onPageStaffChangeCallback = this.pageStaffChange.bind(this);
		let changePermission = this.helperService.changePermission().subscribe((res: DTOPermission) => {
			if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
				that.justLoaded = false;
				that.actionPerm = distinct(res.ActionPermission, 'ActionType');

				that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
				that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
				that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
				that.dataPerm = distinct(res.DataPermission, 'Warehouse');
			}
		});
		this.arrUnsubscribe.push();



		let permissionAPI = this.helperService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
				this.getListEmployee(this.gridStateStaff)

				this.quizSessionService.getQuizSession$().pipe(skip(1)).subscribe(res => {
					this.updateDetailQuizSession = res
					this.checkStep = this.checkStepCreate(res)
					this.buttonHeaderPer()
					this.checkConfig()
		
					// if (this.updateDetailQuizSession.IsAllStaff !== this.detailQuizSession.IsAllStaff) {
					// 	if (this.updateDetailQuizSession.IsAllStaff == 0) this.isHasListStaff = false
					// 	if (this.updateDetailQuizSession.IsAllStaff == 1) {
					// 		if (Ps_UtilObjectService.hasListValue(JSON.parse(this.updateDetailQuizSession.ListOfPostionID))) {
					// 			this.onLoadListPositionChoose()
					// 			if (!Ps_UtilObjectService.hasListValue(this.listPositionChoosed)) this.onLoadListPositionList();
					// 		} else this.getListPositionQuiz({}, true)
					// 	}
					// }
		
					// if (this.updateDetailQuizSession.IsCategory !== this.detailQuizSession.IsCategory ||
					// 	this.updateDetailQuizSession.IsCompetence !== this.detailQuizSession.IsCompetence ||
					// 	this.updateDetailQuizSession.IsCategoryLevel !== this.detailQuizSession.IsCategoryLevel ||
					// 	this.updateDetailQuizSession.IsCurrentCompetenceLevel !== this.detailQuizSession.IsCurrentCompetenceLevel ||
					// 	this.updateDetailQuizSession.OrderConfig !== this.detailQuizSession.OrderConfig) {
					// 	// this.quizConfigV = []
					// 	// this.checkQuizConfigV = false
					// 	if (res.Code !== 0) this.getListQuizConfig(res.Code)
					// 	var temp = []
					// 	for (let index = 0; index < this.officerMarksEssayQuestions.length; index++) {
					// 		temp.push(this.officerMarksEssayQuestions[index])
					// 	}
					// 	if (Ps_UtilObjectService.hasListValue(temp)) this.deleteQuizRole(temp)
					// }
					// if (this.updateDetailQuizSession.ListOfPostionID !== this.detailQuizSession.ListOfPostionID ||
					// 	this.updateDetailQuizSession.ListOfStaffID !== this.detailQuizSession.ListOfStaffID) this.getQuizStaffRole(4)
					// // })
					// this.updateDetailQuizSession = res
					// // this.dataIsReceived(res)
					// this.detailQuizSession = { ...res }
					// this.quizSessionService.setCacheQuizSession(res)
					// this.checkConfig()
					// this.showDialog = false
				})
			}
		})
		this.arrUnsubscribe.push(this.getCacheQuizSession, this.getCacheQuizSession, changePermission, permissionAPI);
	}
	//#endregion

	//#region ONDESTROY
	ngOnDestroy(): void {
		this.arrUnsubscribe.forEach((s) => {
			s?.unsubscribe();
		});
	}
	//#endregion

	//#region AFTERVIEWINIT
	ngAfterViewInit() {
	}
	//#endregion

	//#region ALL
	arrUnsubscribe: Subscription[] = []
	getCacheQuizSession: Subscription
	detailQuizSession = new DTOQuizSession()
	updateDetailQuizSession = new DTOQuizSession()
	checkStep: boolean = false

	runForUpdate(quiz) {
		if (quiz.IsAllStaff !== this.detailQuizSession.IsAllStaff) {
			if (quiz.IsAllStaff == 0)
				this.isHasListStaff = false
			if (quiz.IsAllStaff == 1) {
				if (Ps_UtilObjectService.hasListValue(JSON.parse(quiz.IsAllStaff))) {
					this.onLoadListPositionChoose()
					if (!Ps_UtilObjectService.hasListValue(this.listPositionChoosed))
						this.onLoadListPositionList();
				}
				else this.getListPositionQuiz({}, true)
			}
		}

		if (quiz.IsCategory !== this.detailQuizSession.IsCategory ||
			quiz.IsCompetence !== this.detailQuizSession.IsCompetence ||
			quiz.IsCategoryLevel !== this.detailQuizSession.IsCategoryLevel ||
			quiz.IsCurrentCompetenceLevel !== this.detailQuizSession.IsCurrentCompetenceLevel ||
			quiz.OrderConfig !== this.detailQuizSession.OrderConfig) {
			// this.quizConfigV = []
			// this.checkQuizConfigV = false
			if (quiz.Code !== 0) this.getListQuizConfig(quiz.Code)
			var temp = []
			for (let index = 0; index < this.officerMarksEssayQuestions.length; index++) {
				temp.push(this.officerMarksEssayQuestions[index])
			}
			if (Ps_UtilObjectService.hasListValue(temp)) this.deleteQuizRole(temp)
		}

		if ((Ps_UtilObjectService.hasListValue(JSON.parse(quiz.ListOfPostionID)) &&
			this.updateDetailQuizSession.ListOfPostionID !== this.detailQuizSession.ListOfPostionID) ||
			(Ps_UtilObjectService.hasListValue(JSON.parse(quiz.ListOfStaffID)) &&
				this.updateDetailQuizSession.ListOfStaffID !== this.detailQuizSession.ListOfStaffID)) this.getQuizStaffRole(4)
		this.updateDetailQuizSession = quiz
		// this.dataIsReceived(res)
		this.quizSessionService.setCacheQuizSession(quiz)
		this.checkConfig()
		this.showDialog = false
		this.buttonHeaderPer()
		// this.currentCheckIsAllStaff = res.ObjectReturn.IsAllStaff
		this.detailQuizSession = { ...quiz }
		this.checkStep = this.checkStepCreate(quiz)
	}

	//UPDATE ARRAY STATUS - POPUP
	updateQuizSessionStatus(dto: DTOQuizSession[], statusID: number) {
		this.updateDetailQuizSession.StatusID = statusID
		let updateQuizSessionStatusAPI = this.sessionsAPIService.UpdateQuizSessionStatus(dto, statusID).subscribe((res: any) => {
			if (res.ErrorString != null) this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái đợt đánh giá: ${res.ErrorString}`);
			if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
				this.layoutService.onSuccess('Cập nhật trạng thái đợt đánh giá thành công!');
				this.runForUpdate(this.updateDetailQuizSession)
				this.updateDetailQuizSession.StatusName = statusID == 1 ? "Gửi duyệt" : statusID == 2 ? "Duyệt áp dụng" : statusID == 3 ? "Ngưng áp dụng" : "Trả về"
				this.quizSessionService.setQuizSession(this.updateDetailQuizSession)
			}
		}, (error) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái đợt đánh giá: ${error}`);
		});
		this.arrUnsubscribe.push(updateQuizSessionStatusAPI);
	}

	//UPDATE PROPERTY QUIZ SESSION FUNCTION -  ALL
	UpdateQuizSession(updatedQuiz: DTOQuizSession, propName: string[]) {
		if (propName[0] == 'EvaluationView' && updatedQuiz.EvaluationView == 2) {
			updatedQuiz.AppealTime = null
			updatedQuiz.ReEvaluateTime = null
			propName = [...propName, 'AppealTime', 'ReEvaluateTime']
		}
		let updateQuizSessionAPI = this.quizSessionService.UpdateQuizSession(updatedQuiz, propName).subscribe(res => {
			// if (res.ObjectReturn.IsAllStaff !== this.detailQuizSession.IsAllStaff) {
			// 	if (res.ObjectReturn.IsAllStaff == 0) this.isHasListStaff = false
			// 	if (res.ObjectReturn.IsAllStaff == 1) {
			// 		if (Ps_UtilObjectService.hasListValue(JSON.parse(res.ObjectReturn.IsAllStaff))) {
			// 			this.onLoadListPositionChoose()
			// 			if (!Ps_UtilObjectService.hasListValue(this.listPositionChoosed)) this.onLoadListPositionList();
			// 		} else this.getListPositionQuiz({}, true)
			// 	}
			// }

			// if (res.ObjectReturn.IsCategory !== this.detailQuizSession.IsCategory ||
			// 	res.ObjectReturn.IsCompetence !== this.detailQuizSession.IsCompetence ||
			// 	res.ObjectReturn.IsCategoryLevel !== this.detailQuizSession.IsCategoryLevel ||
			// 	res.ObjectReturn.IsCurrentCompetenceLevel !== this.detailQuizSession.IsCurrentCompetenceLevel ||
			// 	res.ObjectReturn.OrderConfig !== this.detailQuizSession.OrderConfig) {
			// 	// this.quizConfigV = []
			// 	// this.checkQuizConfigV = false
			// 	if (res.ObjectReturn.Code !== 0) this.getListQuizConfig(res.ObjectReturn.Code)
			// 	var temp = []
			// 	for (let index = 0; index < this.officerMarksEssayQuestions.length; index++) {
			// 		temp.push(this.officerMarksEssayQuestions[index])
			// 	}
			// 	if (Ps_UtilObjectService.hasListValue(temp)) this.deleteQuizRole(temp)
			// }

			// if ((Ps_UtilObjectService.hasListValue(JSON.parse(res.ObjectReturn.ListOfPostionID)) &&
			// 	this.updateDetailQuizSession.ListOfPostionID !== this.detailQuizSession.ListOfPostionID) ||
			// 	(Ps_UtilObjectService.hasListValue(JSON.parse(res.ObjectReturn.ListOfStaffID)) &&
			// 		this.updateDetailQuizSession.ListOfStaffID !== this.detailQuizSession.ListOfStaffID)) this.getQuizStaffRole(4)
			// this.updateDetailQuizSession = res.ObjectReturn
			// // this.dataIsReceived(res)
			// this.quizSessionService.setCacheQuizSession(res.ObjectReturn)
			// this.checkConfig()
			// this.showDialog = false
			// this.buttonHeaderPer()
			// // this.currentCheckIsAllStaff = res.ObjectReturn.IsAllStaff
			// this.detailQuizSession = { ...res.ObjectReturn }
			// this.checkStep = this.checkStepCreate(res.ObjectReturn)
			this.runForUpdate(res.ObjectReturn)
		})
		this.arrUnsubscribe.push(updateQuizSessionAPI);
	}

	getQuizSession() {
		let getCacheQuizSession = this.quizSessionService.GetCacheQuizSession().subscribe(res => {
			if (res.Code !== 0) {
				let getQuizSessionAPi = this.sessionsAPIService.GetQuizSession(res.Code).subscribe(resAPI => {
					if (resAPI.StatusCode == 0) {
						this.dataIsReceived(resAPI.ObjectReturn)
						this.detailQuizSession = { ...resAPI.ObjectReturn }
						this.checkStep = this.checkStepCreate(resAPI.ObjectReturn)
						this.quizSessionService.setQuizSession(resAPI.ObjectReturn)
					}
					else this.layoutService.onError(`Lấy thông tin đợt đánh giá không thành công: ${resAPI.ErrorString}`, 5000)
				}, (err) => this.layoutService.onError(`Lấy thông tin đợt đánh giá không thành công: ${err}`, 5000))
				this.arrUnsubscribe.push(getQuizSessionAPi);
			}
		}); this.arrUnsubscribe.push(getCacheQuizSession);
	}

	dataIsReceived(e) {
		this.updateDetailQuizSession = e
		this.detailQuizSession = { ...e }
		this.quizSessionService.setCacheQuizSession(e)

		if (e.Code !== 0) {
			this.checkStep = this.checkStepCreate(e)
			// this.currentCheckIsAllStaff = e.IsAllStaff
			this.getQuizStaffRole(1);
			this.getQuizStaffRole(2);
			this.getQuizStaffRole(3);

			if ((e.IsAllStaff == 1 && Ps_UtilObjectService.hasListValue(JSON.parse(e.ListOfPostionID))) || e.IsAllStaff == 2)
				this.getQuizStaffRole(4);
		}

		if (this.updateDetailQuizSession.IsAllStaff == 1) {
			var arr: number[] = JSON.parse(this.updateDetailQuizSession.ListOfPostionID)

			if (Ps_UtilObjectService.hasListValue(arr)) {
				this.onLoadListPositionChoose();
				this.listPositionChoosed = arr.map(s => {
					return <DTOQuizPositionRole>{ Code: s }
				})
				if (Ps_UtilObjectService.hasListValue(this.listPositionChoosed))
					this.onLoadListPositionList()
			}
			else this.getListPositionQuiz({}, true)
		};
		this.checkConfig()
		this.buttonHeaderPer()
		this.getListQuizConfig(this.updateDetailQuizSession.Code)
		// if (e.IsAllStaff == 2 && Ps_UtilObjectService.hasListValue(JSON.parse(e.ListOfStaffID))) this.onLoadListStaffChoose()
	}
	//#endregion

	//*****************PHÂN QUYỀN****************/
	//#region PHÂN QUYỀN - VARIABLE
	isAllPers: boolean = false;
	isCanCreate: boolean = false;
	isCanApproved: boolean = false;
	alertPermission = null;
	isCanAdd: boolean = false;
	justLoaded: boolean = true;
	isCanSent: boolean = false;
	isCanStop: boolean = false;
	isCanOpen: boolean = false;
	isCanClose: boolean = false;
	isCanReturn: boolean = false;
	isCanDelete: boolean = false;
	isCanSuccess: boolean = false;
	isCanCalculate: boolean = false;
	dataPerm: DTODataPermission[] = [];
	actionPerm: DTOActionPermission[] = [];
	//#endregion PHÂN QUYỀN - VARIABLE

	//#region KIỂM TRA QUYỀN CHO CÁC BUTTON - FUNCTION
	buttonHeaderPer() {
		const dateNow = new Date();
		const statusID = this.updateDetailQuizSession.StatusID;
		const canCreateOrAllPers = this.isCanCreate || this.isAllPers;
		const dateEnd = new Date(this.updateDetailQuizSession.EndDate)
		const sessionSTTID = this.updateDetailQuizSession.SessionStatusID;
		const canApprovedOrAllPers = this.isCanApproved || this.isAllPers;
		const dateOpen = new Date(this.updateDetailQuizSession.OpenedDate);
		const dateStart = new Date(this.updateDetailQuizSession.StartDate);
		const dateClose = new Date(this.updateDetailQuizSession.ClosedDate);

		var isLeader = false;

		if (Ps_UtilObjectService.hasListValue(this.updateDetailQuizSession.ListOfUserRole)) {
			isLeader = Ps_UtilObjectService.hasValue(this.updateDetailQuizSession.ListOfUserRole.find(r => r.TypeData == 1))
		}

		this.isCanSent = (canCreateOrAllPers && this.updateDetailQuizSession.Code !== 0 && (statusID === 0 || statusID === 4));
		this.isCanApproved = (canApprovedOrAllPers && this.updateDetailQuizSession.Code !== 0 && (statusID === 1 || statusID === 3));
		this.isCanStop = (canApprovedOrAllPers && this.updateDetailQuizSession.Code !== 0 && statusID === 2);
		this.isCanReturn = (canApprovedOrAllPers && this.updateDetailQuizSession.Code !== 0 && (statusID === 1 || (statusID === 3 && sessionSTTID == 0)));

		this.isCanOpen = (dateNow < dateOpen && dateNow >= dateStart && statusID === 2 && sessionSTTID === 0 && isLeader) && this.updateDetailQuizSession.Code !== 0;
		this.isCanClose = (dateNow > dateOpen && dateNow < dateClose && statusID === 2 && sessionSTTID === 1 && isLeader) && this.updateDetailQuizSession.Code !== 0;
		this.isCanSuccess = (dateClose < dateNow && dateNow < dateEnd && statusID === 2 && sessionSTTID < 3 && isLeader) && this.updateDetailQuizSession.Code !== 0;
		this.isCanCalculate = (sessionSTTID == 3 && statusID == 2 && isLeader) && this.updateDetailQuizSession.Code !== 0

		this.isCanDelete = (canCreateOrAllPers && statusID === 0 && this.updateDetailQuizSession.Code !== 0 && sessionSTTID == 0);
		this.isCanAdd = (canCreateOrAllPers && Ps_UtilObjectService.hasValueString(this.updateDetailQuizSession.SessionID));
	}
	//#endregion KIỂM TRA QUYỀN CHO CÁC BUTTON - FUNCTION

	//
	updateHeaderButton(a: number) {
		if (a === 1) this.updateDetailQuizSession.OpenedDate = new Date();
		else if (a === 2) this.updateDetailQuizSession.ClosedDate = new Date();
		else if (a === 3) this.updateDetailQuizSession.EndDate = new Date();
		this.updateDetailQuizSession.SessionStatusID = a;
		this.UpdateQuizSession(this.updateDetailQuizSession, ['SessionStatusID', a == 1 ? 'OpenedDate' : a == 2 ? 'ClosedDate' : a == 3 ? 'EndDate' : ''])
	}

	CalculateMarkQuiz() {
		let CalculateMarkQuizAPI = this.quizSessionService.CalculateMarkQuiz(this.updateDetailQuizSession.Code).subscribe()
		this.arrUnsubscribe.push(CalculateMarkQuizAPI)
	}

	//#region KIỂM TRA QUÁ TRÌNH TẠO ĐỢT THEO QUY TRÌNH - FUNCTION
	checkStepCreate(i: any) {
		var validationConditions = [
			{
				condition: !Ps_UtilObjectService.hasValueString(i.SessionID),
				message: '"Mã đợt đánh giá" chưa được sinh ra trong đợt đánh giá.'
			},
			{
				condition: !Ps_UtilObjectService.hasValueString(i.SessionName),
				message: '"Tên đợt đánh giá" không được để trống.'
			},
			{
				condition: !Ps_UtilObjectService.hasValueString(i.SessionObjective),
				message: '"Mục tiêu đợt đánh giá" không được để trống.'
			},
			{
				condition: (i.TypeOfSession == 1 || i.EvaluationView == 2 ? false : !Ps_UtilObjectService.hasValueString(i.AppealTime)),
				message: '"Thời gian gửi phúc khảo" không được để trống.'
			},
			{
				condition: (i.TypeOfSession == 1 || i.EvaluationView == 2) ? false : !Ps_UtilObjectService.hasValueString(i.ReEvaluateTime),
				message: '"Thời gian chấm phúc khảo" không được để trống.'
			},
			{
				condition: i.TypeOfTimeEvaluation === 2 && !Ps_UtilObjectService.hasValueString(i.Duration),
				message: '"Thời gian làm bài" không được để trống.'
			},
			{
				condition: i.NoOfQuestion <= 0 || !Ps_UtilObjectService.hasValueString(i.NoOfQuestion),
				message: '"Số lượng câu hỏi" không phù hợp.'
			}
		];

		for (const validation of validationConditions) {
			if (validation.condition) {
				this.alertPermission = `Không thể thực thi yêu cầu: ${validation.message}`;
				return false;
			}
		}
		return true;
	}
	//#endregion KIỂM TRA QUÁ TRÌNH TẠO ĐỢT THEO QUY TRÌNH - FUNCTION

	//#region KIỂM TRA ĐIỀU KIỆN GỬI DUYỆT/DUYỆT - FUNCTION
	checkCurrentSession(statusID): boolean {
		if (!this.checkStep) {
			this.layoutService.onWarning(this.alertPermission, 5000); return
		} else {
			var i = this.updateDetailQuizSession, total = 0
			if (i.IsAllStaff == 1 && !Ps_UtilObjectService.hasListValue(i.ListOfPostionID)) {
				this.layoutService.onWarning('Không thế thực thi yêu cầu: Chưa có "Chức danh tham gia đợt đánh giá".', 5000); return
			} if (i.IsAllStaff == 2 && !Ps_UtilObjectService.hasListValue(i.ListOfStaffID)) {
				this.layoutService.onWarning('Không thế thực thi yêu cầu: Chưa có "Nhân sự tham gia đợt đánh giá".', 5000); return
			} if (Ps_UtilObjectService.hasListValue(this.quizConfigV)) {
				for (const cf of this.quizConfigV) {
					if (!Ps_UtilObjectService.hasValue(cf.CategoryPercentage) && !Ps_UtilObjectService.hasValue(cf.CompetencePercentage)) {
						this.layoutService.onWarning('Không thế thực thi yêu cầu: "Tỷ lệ điểm" của từng mục trong cấu trúc không được trống.', 5000)
						return
					}
				} for (const cf of this.quizConfigV) {
					if (this.isCompetenceToCategory || this.isCategoryToCompetence) {
						if (!Ps_UtilObjectService.hasListValue(cf.ListChild)) {
							this.layoutService.onWarning(`Không thế thực thi yêu cầu: ${cf.CategoryName || cf.CompetenceName} chưa có cấu trúc đề thi con.`, 5000)
							return
						}

						for (const cfc of cf.ListChild) {
							if (this.isCompetenceToCategory) {
								if (!Ps_UtilObjectService.hasValue(cfc.CategoryQuestionEssay) && !Ps_UtilObjectService.hasValue(cfc.CategoryQuestionMultiple)) {
									this.layoutService.onWarning(`Không thế thực thi yêu cầu: Cấu trúc "${cfc.CategoryName}" trong "${cf.CompetenceName}" chưa có số lượng câu hỏi.`, 5000)
									return
								}
								total += (cfc.CategoryQuestionEssay == null ? 0 : cfc.CategoryQuestionEssay) +
									(cfc.CategoryQuestionMultiple == null ? 0 : cfc.CategoryQuestionMultiple)
							} else {
								if (!Ps_UtilObjectService.hasValue(cfc.CompetenceQuestionEssay) && !Ps_UtilObjectService.hasValue(cfc.CompetenceQuestionMultiple)) {
									this.layoutService.onWarning(`Không thế thực thi yêu cầu: Cấu trúc "${cfc.CompetenceName}" trong "${cf.CategoryName}" chưa có số lượng câu hỏi.`, 5000)
									return
								}
								total += (cfc.CompetenceQuestionEssay == null ? 0 : cfc.CompetenceQuestionEssay) +
									(cfc.CompetenceQuestionMultiple == null ? 0 : cfc.CompetenceQuestionMultiple)
							}
						}
					} if (this.isCompetence || this.isCategory) {
						if (this.isCategory) {
							if (!Ps_UtilObjectService.hasValue(cf.CategoryQuestionEssay) && !Ps_UtilObjectService.hasValue(cf.CategoryQuestionMultiple)) {
								this.layoutService.onWarning(`Không thế thực thi yêu cầu: Cấu trúc "${cf.CategoryName}" chưa có số lượng câu hỏi.`, 5000)
								return
							}
							total += (cf.CategoryQuestionEssay == null ? 0 : cf.CategoryQuestionEssay) +
								(cf.CategoryQuestionMultiple == null ? 0 : cf.CategoryQuestionMultiple)
						} else {
							if (!Ps_UtilObjectService.hasValue(cf.CompetenceQuestionEssay) && !Ps_UtilObjectService.hasValue(cf.CompetenceQuestionMultiple)) {
								this.layoutService.onWarning(`Không thế thực thi yêu cầu: Cấu trúc "${cf.CompetenceName}" chưa có số lượng câu hỏi.`, 5000)
								return
							}
							total += (cf.CompetenceQuestionEssay == null ? 0 : cf.CompetenceQuestionEssay) +
								(cf.CompetenceQuestionMultiple == null ? 0 : cf.CompetenceQuestionMultiple)
						}
					}
				} if (total !== i.NoOfQuestion) {
					this.layoutService.onWarning(`Không thế thực thi yêu cầu: "Số lượng câu hỏi đã thiết lập không trúng khớp với tổng số lượng câu hỏi.`, 5000)
					return
				} if (!Ps_UtilObjectService.hasListValue(this.headOfExaminationBoard)) {
					this.layoutService.onWarning(`Không thế thực thi yêu cầu: "Trưởng ban khảo thí" không được để trống.`, 5000)
					return
				} if (!Ps_UtilObjectService.hasListValue(this.monitorAllParticipatingUnits)) {
					this.layoutService.onWarning(`Không thế thực thi yêu cầu: "Giám sát toàn bộ đơn vị tham gia" không được để trống.`, 5000)
					return
				} if (this.isHaslQuestionEssay && !Ps_UtilObjectService.hasListValue(this.officerMarksEssayQuestions)) {
					this.layoutService.onWarning(`Không thế thực thi yêu cầu: "Nhân sự chấm thi câu hỏi tự luận" không được để trống.`, 5000)
					return
				} if ((i.IsAllStaff === 1 || i.IsAllStaff === 2) && !this.isHasListStaff) {
					this.layoutService.onWarning('Không thế thực thi yêu cầu: Chưa có "Danh sách nhân sự tham gia đợt đánh giá".', 5000)
					return false
				}
			} else {
				this.layoutService.onWarning('Không thế thực thi yêu cầu: Đề thi của đợt đánh giá chưa được thiết lập', 5000)
				return
			}
		}
		this.updateQuizSessionStatus([this.updateDetailQuizSession], statusID)
	}
	//#endregion KIỂM TRA ĐIỀU KIỆN GỬI DUYỆT/DUYỆT - FUNCTION
	//*****************PHÂN QUYỀN****************/

	//#region HEADER
	//ADD THE NEW QUIZ SESSION FUNCTION - HEADER
	addTheNewQuizSesson() {
		this.quizSessionService.setIntitialQuizSession();
		this.quizConfigV = []
		this.headOfExaminationBoardBinding = []
		this.headOfExaminationBoard = []
		this.monitorAllParticipatingUnitsBinding = []
		this.monitorAllParticipatingUnits = []
		this.officerMarksEssayQuestionsBinding = []
		this.officerMarksEssayQuestions = []
		this.listPositionChoosed = []
		this.checkQuizConfigV = false
		this.updateDetailQuizSession = new DTOQuizSession()
		this.buttonHeaderPer()
		this.checkStep = this.checkStepCreate(new DTOQuizSession())
	}

	//CHANGE  AND SHOW CONFIRM FUNCTION - HEADER
	checkDeleteAndShowDialog() {
		// if (this.updateDetailQuizSession.Code == 0) this.layoutService.onInfo('Đây là đợt đánh giá mới, không thể xóa.')
		// else {
		this.showDialogChange = {
			title: 'xóa đợt đánh giá', firstContent: ['Bạn chắc chắn muốn xóa đợt đánh giá', this.updateDetailQuizSession.SessionName],
			lastContent: ['đợt đánh giá', 'bị xóa'], button: ['không xóa', 'xóa'], icon: 'trash'
		}
		this.action = 'deleteQuizSession'
		this.showDialog = true
		// }
	}

	//#region deleteQuizSession
	deleteQuizSession(dto) {
		let deleteQuizSessionAPI = this.sessionsAPIService.DeleteQuizSession(dto).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.addTheNewQuizSesson()
				this.layoutService.onSuccess('Xóa các đợt đánh giá thành công.')
			} else this.layoutService.onError(`Đã xảy ra lỗi khi xóa các đợt đánh giá: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi xóa các đợt đánh giá: ${err}`))
		this.arrUnsubscribe.push(deleteQuizSessionAPI)
		this.showDialog = false
	}
	//#endregion

	//#endregion

	//*****************CẤU TRÚC ĐỀ THI****************/
	//#region CẤU TRÚC ĐỀ THI - VARIABLE
	isChecked: boolean
	prop: string[] = []
	// currentCheckIsAllStaff: any
	idDeleteListPosition: number
	listStaffChoosed: any[] = []
	listPositionChoosed: DTOQuizPositionRole[] = []
	isHasListStaff: boolean = false
	currentStaffJoinQuiz: number = null
	currentPositionJoinQuiz: number = null
	positionJoinQuiz: DTOQuizPositionRole[] = []
	positionJoinQuizBinding: DTOQuizPositionRole[] = []
	positionChange: State = { filter: { filters: [], logic: 'and' }, }
	filterCode: CompositeFilterDescriptor = { logic: "or", filters: [] }
	filterNotCode: CompositeFilterDescriptor = { logic: "and", filters: [] }
	//#endregion CẤU TRÚC ĐỀ THI - VARIABLE

	//#region KIỂM TRA GIÁ TRỊ CHECKBOX VÀ CHUYỂN ĐỔI CÁC THUỘC TÍNH KHÁC - FUNCTION
	checkCheckbox(type: string) {
		if (!this.updateDetailQuizSession.IsCompetence || !this.updateDetailQuizSession.IsCategory) {
			this.updateDetailQuizSession.OrderConfig = type === 'competence' ? 1 : 0;
		} if (type === 'competence') {
			this.updateDetailQuizSession.IsCompetence == false ? this.isChecked = false : this.updateDetailQuizSession.IsCurrentCompetenceLevel = true
		} else if (type === 'category') {
			this.updateDetailQuizSession.IsCategoryLevel = this.updateDetailQuizSession.IsCategory ? 3 : null;
		}
	}
	//#endregion KIỂM TRA GIÁ TRỊ CHECKBOX VÀ CHUYỂN ĐỔI CÁC THUỘC TÍNH KHÁC - FUNCTION

	//#region KIỂM TRA GIÁ TRỊ ĐANG CHỈNH SỬA VÀ HIỆN CONFIRM NẾU CẦN - FUNCTION
	checkChangeAndShowDialog(pr) {
		if (pr === 'IsCompetence' || pr === 'IsCategory' || pr === 'OrderConfig' || pr == 'IsCurrentCompetenceLevel' || pr == 'IsCategoryLevel') {
			if (pr === 'IsCompetence') this.prop = ['IsCompetence', 'OrderConfig']
			else if (pr == 'IsCurrentCompetenceLevel') this.prop = ['IsCurrentCompetenceLevel']
			else if (pr === 'IsCategory') this.prop = ['IsCategory', 'IsCategoryLevel', 'OrderConfig']
			else if (pr == 'IsCategoryLevel') this.prop = ['IsCategoryLevel']
			else if (pr === 'OrderConfig') this.prop = ['OrderConfig']

			if (!this.checkQuizConfigV) this.changeDepartmentQuizSession(this.prop)
			else {
				this.showDialogChange = {
					title: 'thay đổi cấu trúc đề thi', firstContent: ['Bạn chắc chắn muốn thay đổi', 'cấu trúc đề thi'],
					lastContent: ['Cấu trúc', 'bị thay đổi'], button: ['không thay đổi', 'thay đổi'], icon: 'track-changes-enable'
				}
				this.action = 'changeQuizSession'
				this.showDialog = true
				this.cdr.detectChanges();
			}
		} else if (pr === 'IsAllStaff') {
			this.prop = ['IsAllStaff', 'ListOfPostionID', 'ListOfStaffID']

			if (this.isHasListStaff) {
				this.showDialogChange = {
					title: 'thay đổi nhân sự tham gia', firstContent: ['Bạn chắc chắn muốn thay đổi', 'nhân sự tham gia'],
					lastContent: ['Nhân sự', 'bị thay đổi'], button: ['không thay đổi', 'thay đổi'], icon: 'track-changes-enable'
				}
				this.action = 'changeQuizSession'
				this.showDialog = true
				this.cdr.detectChanges();
				return
			} else this.changeDepartmentQuizSession(this.prop)

		}
	}
	//#endregion KIỂM TRA GIÁ TRỊ ĐANG CHỈNH SỬA VÀ HIỆN CONFIRM NẾU CẦN - FUNCTION


	//NOT CHANGE DEPARTMENT QUIZ SESSION FUNCTION - EXAM STRUCTURE
	notChangeDepartmentQuizSession() {
		var getCacheQuizSs = this.getCacheQuizSession = this.quizSessionService.GetCacheQuizSession().subscribe(res => {
			this.updateDetailQuizSession = res
			// this.currentCheckIsAllStaff = this.updateDetailQuizSession.IsAllStaff
			this.checkShowListJoin()
		})
		this.arrUnsubscribe.push(getCacheQuizSs)
		this.showDialog = false
	}

	//CHANGE DEPARTMENT QUIZ SESSION FUNCTION - EXAM TRUCTURE
	changeDepartmentQuizSession(prop: string[]) {
		this.positionJoinQuizBinding = []
		this.updateDetailQuizSession.ListOfPostionID = '[]'
		this.updateDetailQuizSession.ListOfStaffID = '[]'
		// this.updateDetailQuizSession.IsAllStaff = this.currentCheckIsAllStaff
		this.UpdateQuizSession(this.updateDetailQuizSession, prop)
		this.checkQuizConfigV = Ps_UtilObjectService.hasListValue(this.quizConfigV)
		if (this.showDialog = true) this.showDialog = false
		if (this.quizConfigV) this.getListQuizConfig
		if (prop[0] == 'IsAllStaff') {
			this.listPositionChoosed = []
			// if (this.updateDetailQuizSession.IsAllStaff == 1) this.onLoadListPositionList()
		}
		this.isHasListStaff = false
	}

	//GET LIST POSITION JOIN QUIZ SESSION - EXAM TRUCTURE
	getListPositionQuiz(filter: any, isListDropdown: boolean) {
		let getListPositionQuizAPI = this.sessionsAPIService.GetListPositionQuiz(filter).subscribe(res => {
			if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
				if (isListDropdown) {
					this.positionJoinQuiz = res.ObjectReturn.Data
					this.positionJoinQuizBinding = this.positionJoinQuiz.slice()
				}
				else this.listPositionChoosed = res.ObjectReturn.Data
			}
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách chức danh tham gia đợt đánh giá: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách chức danh tham gia đợt đánh giá: ${err}`);
		})
		this.arrUnsubscribe.push(getListPositionQuizAPI);
	}

	//ON CHANGE FILTER POSITON - EXAM TRUCTURE
	filterListPositionQuizChange(e) {
		this.positionJoinQuizBinding = this.positionJoinQuiz.filter(
			(s) => (s.Position ? s.Position.toLowerCase() : '')
				&& (s.Position ? s.Position.toLowerCase() : '').indexOf(e.toLowerCase()) !== -1
		);
	}

	//ADD POSITION JOIN QUIZ - EXAM TRUCTURE
	onAddPositionJoinQuiz() {
		if (this.currentPositionJoinQuiz !== null) {
			if (this.updateDetailQuizSession.ListOfPostionID == '') {
				this.updateDetailQuizSession.ListOfPostionID = JSON.stringify([this.currentPositionJoinQuiz])
			} else {
				var temp = JSON.parse(this.updateDetailQuizSession.ListOfPostionID)
				if (temp == null) temp = []
				temp.push(this.currentPositionJoinQuiz)
				this.updateDetailQuizSession.ListOfPostionID = JSON.stringify(temp)
			}
			this.UpdateQuizSession(this.updateDetailQuizSession, ['ListOfPostionID'])
			this.onLoadListPositionChoose()
			this.onLoadListPositionList()
			this.currentPositionJoinQuiz = null
		}
	}

	// onAddStaffnJoinQuiz() {
	// 	if (this.currentStaffJoinQuiz !== null) {
	// 		if (!(Ps_UtilObjectService.hasListValue(JSON.parse(this.updateDetailQuizSession.ListOfStaffID)))) {
	// 			this.updateDetailQuizSession.ListOfStaffID = JSON.stringify([this.currentStaffJoinQuiz])
	// 		} else {
	// 			var temp = JSON.parse(this.updateDetailQuizSession.ListOfStaffID)
	// 			if (temp == null) temp = []
	// 			temp.push(this.currentStaffJoinQuiz)
	// 			this.updateDetailQuizSession.ListOfStaffID = JSON.stringify(temp)
	// 		}
	// 		this.UpdateQuizSession(this.updateDetailQuizSession, ['ListOfStaffID'])
	// 		this.onLoadListStaffChoose()
	// 		this.currentStaffJoinQuiz = null
	// 	}
	// }

	//ON LOAD POSITION CHOOSED WHEN CHANGE - EXAM TRUCTURE
	onLoadListPositionChoose() {
		if (!Ps_UtilObjectService.hasListValue(JSON.parse(this.updateDetailQuizSession.ListOfPostionID)))
			this.listPositionChoosed = []
		else {
			// this.filterCode.logic = 'or'
			this.filterCode.filters = []
			this.positionChange.filter.filters = []
			if (Ps_UtilObjectService.hasListValue(this.updateDetailQuizSession.ListOfPostionID)) {
				JSON.parse(this.updateDetailQuizSession.ListOfPostionID).forEach(item => {
					this.filterCode.filters.push({ field: "Code", value: item, operator: "eq", ignoreCase: true });
				});
			}
			if (Ps_UtilObjectService.hasValue(this.filterCode.filters)) this.positionChange.filter.filters.push(this.filterCode)
			this.getListPositionQuiz(this.positionChange, false)
		}
	}

	//ON LOAD POSITION LIST WHEN CHANGE - EXAM TRUCTURE
	onLoadListPositionList() {
		if (this.updateDetailQuizSession.ListOfPostionID == '[]')
			this.getListPositionQuiz({}, true)
		else {
			// this.filterNotCode.logic = 'and'
			this.filterNotCode.filters = []
			this.positionChange.filter.filters = []
			if (Ps_UtilObjectService.hasListValue(this.updateDetailQuizSession.ListOfPostionID)) {
				JSON.parse(this.updateDetailQuizSession.ListOfPostionID).forEach(item => {
					this.filterNotCode.filters.push({ field: "Code", value: item, operator: "neq", ignoreCase: true });
				});
			}
			if (Ps_UtilObjectService.hasValue(this.filterNotCode.filters)) this.positionChange.filter.filters.push(this.filterNotCode)
			this.getListPositionQuiz(this.positionChange, true)
		}
	}

	// onLoadListStaffList() {
	// 	if (this.updateDetailQuizSession.ListOfPostionID == '[]') this.getListPositionQuiz({}, true)
	// 	else {
	// 		this.filterCode.logic = 'and'
	// 		this.filterCode.filters = []
	// 		this.positionChange.filter.filters = []
	// 		if (Ps_UtilObjectService.hasListValue(this.updateDetailQuizSession.ListOfPostionID)) {
	// 			JSON.parse(this.updateDetailQuizSession.ListOfPostionID).forEach(item => {
	// 				this.filterCode.filters.push({ field: "Code", value: item, operator: "neq", ignoreCase: true });
	// 			});
	// 		}
	// 		if (Ps_UtilObjectService.hasValue(this.filterCode.filters)) this.positionChange.filter.filters.push(this.filterCode)
	// 		this.getListPositionQuiz(this.positionChange, true)
	// 	}
	// }

	//ON DELETE POSITION - EXAM TRUCTURE
	onDeleteListPosition(id: number) {
		if (!this.isHasListStaff) this.deleteListPosition(id)
		else {
			this.idDeleteListPosition = id
			this.showDialogChange = {
				title: 'xóa chức danh tham gia', firstContent: ['Bạn chắc chắn muốn xóa chức danh tham gia', this.updateDetailQuizSession.SessionName],
				lastContent: ['chức danh tham gia', 'bị xóa'], button: ['không xóa', 'xóa'], icon: 'trash'
			}
			this.action = 'deletePositionJoin'
			this.showDialog = true
		}
	}

	onDeleteListStaff(id: number) {
		this.staffDelete = id
		this.showDialogChange = {
			title: 'xóa nhân sự tham gia', firstContent: ['Bạn chắc chắn muốn xóa nhân sự tham gia', this.updateDetailQuizSession.SessionName],
			lastContent: ['nhân sự tham gia', 'bị xóa'], button: ['không xóa', 'xóa'], icon: 'trash'
		}
		this.action = 'deleteIsAllStaffJoin'
		this.showDialog = true
	}

	//DELETE LIST POSITION - EXAM TRUCTURE
	deleteListPosition(id) {
		var arrResult = [], temp = JSON.parse(this.updateDetailQuizSession.ListOfPostionID)
		if (Ps_UtilObjectService.hasListValue(temp)) {
			temp.forEach((item) => { if (item !== id) { arrResult.push(item) } })
		}; this.updateDetailQuizSession.ListOfPostionID = JSON.stringify(arrResult)
		this.UpdateQuizSession(this.updateDetailQuizSession, ['ListOfPostionID'])
		this.onLoadListPositionChoose(); this.onLoadListPositionList()
	}

	deleteListIsAllStaffJoin(id) {
		var arrResult = [], temp = JSON.parse(this.updateDetailQuizSession.ListOfStaffID)
		if (Ps_UtilObjectService.hasListValue(temp)) {
			temp.forEach((item) => { if (item !== id) { arrResult.push(item) } })
		}; this.updateDetailQuizSession.ListOfStaffID = JSON.stringify(arrResult)
		this.UpdateQuizSession(this.updateDetailQuizSession, ['ListOfStaffID'])
		// this.onLoadListStaffChoose()
	}
	//#endregion

	//#region SET EXAM STRUCTURE
	checkType: boolean
	itemDelete: number
	addToConfig: number
	isCategory: boolean
	isCompetence: boolean
	addToConfigChild: number
	checkValNumConfig: number
	isCompetenceToCategory: boolean
	isCategoryToCompetence: boolean
	quizConfigV: DTOQuizConfig[] = []
	checkQuizConfigV: boolean = false
	listSearchCategory: DTOSearchCategory[] = []
	dataSearchCategory: DTOSearchCategory[] = []
	listSearchCompetence: DTOSearchCompetence[] = []
	dataSearchCompetence: DTOSearchCompetence[] = []
	competenceLevelDropdown: any = [{ text: 'Mức 1', value: 1 }, { text: 'Mức 2', value: 2 },
	{ text: 'Mức 3', value: 3 }, { text: 'Mức 4', value: 4 }, { text: 'Mức 5', value: 5 }]

	//CHECK CONFIG FUNCTION - SET EXAM STRUCTURE
	checkConfig() {
		this.isCategory = this.updateDetailQuizSession.IsCategory && this.updateDetailQuizSession.IsCompetence == false
		this.isCompetence = this.updateDetailQuizSession.IsCompetence && this.updateDetailQuizSession.IsCategory == false
		this.isCompetenceToCategory = this.updateDetailQuizSession.IsCategory && this.updateDetailQuizSession.IsCompetence && this.updateDetailQuizSession.OrderConfig == 0
		this.isCategoryToCompetence = this.updateDetailQuizSession.IsCategory && this.updateDetailQuizSession.IsCompetence && this.updateDetailQuizSession.OrderConfig == 1
	}

	//NOT CLICK EVENT ON MORE FUNCTION - SET EXAM STRUCTURE
	onInputClick(event: Event) {
		event.stopPropagation();
	}

	//GET LIST QUIZ CONFIG FUNCTION - SET EXAM STRUCTURE
	getListQuizConfig(quiz: number) {
		let getListQuizConfigAPI = this.sessionsAPIService.GetListQuizConfig(quiz).subscribe(res => {
			if (res.StatusCode == 0) {
				this.quizConfigV = res.ObjectReturn
				if (Ps_UtilObjectService.hasListValue(res.ObjectReturn)) this.checkQuizConfigV = true
				else this.checkQuizConfigV = false
				this.checkEssay()
			}
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy cấu hình đợt đánh giá: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi lấy cấu hình đợt đánh giá: ${err}`))
		this.arrUnsubscribe.push(getListQuizConfigAPI);
	}

	//GET LIST SEARCH COMPETENCE - SET EXAM STRUCTURE
	getListQuizConfigCompetence(category) {
		var DTOTemp = { QuizSession: null, Category: null }
		DTOTemp.QuizSession = this.updateDetailQuizSession.Code
		DTOTemp.Category = category

		let getListQuizConfigCompetenceAPI = this.sessionsAPIService.GetListQuizConfigCompetence(DTOTemp).subscribe(res => {
			if (Ps_UtilObjectService.hasListValue(res)
				&& Ps_UtilObjectService.hasValue(res.ObjectReturn)
				&& res.StatusCode == 0) {
				this.listSearchCategory = this.listSearchCategory.filter((item) => !this.quizConfigV.some((arrItem) => arrItem.Competence === item.Code));
				this.listSearchCompetence = res.ObjectReturn
				this.dataSearchCompetence = this.listSearchCompetence.slice()
			}
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách năng lực: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách năng lực: ${err}`))
		this.arrUnsubscribe.push(getListQuizConfigCompetenceAPI);
	}

	//GET LIST SEARCH CATEGORY - SET EXAM STRUCTURE
	getListQuizConfigCategory(competence, lvid) {
		var DTOTemp = { QuizSession: null, Competence: null, CompetenceLevelID: null }
		DTOTemp.QuizSession = this.updateDetailQuizSession.Code
		DTOTemp.Competence = competence
		DTOTemp.CompetenceLevelID = lvid

		let getListQuizConfigCategoryAPI = this.sessionsAPIService.GetListQuizConfigCategory(DTOTemp).subscribe(res => {
			if (Ps_UtilObjectService.hasListValue(res)
				&& Ps_UtilObjectService.hasValue(res.ObjectReturn)
				&& res.StatusCode == 0) {
				this.listSearchCategory = res.ObjectReturn
				this.listSearchCategory = this.listSearchCategory.filter((item) => !this.quizConfigV.some((arrItem) => arrItem.Category === item.Code));
				this.dataSearchCategory = this.listSearchCategory.slice()
			}
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm: ${err}`))
		this.arrUnsubscribe.push(getListQuizConfigCategoryAPI);
	}

	//ON CHANGE FILTER QUIZ CONFIG COMPETENCE - SET EXAM STRUCTURE
	onChangeFilterQuizConfig(val, action) {
		if (action == 'competence') {
			this.dataSearchCompetence = this.listSearchCompetence.filter(
				(s) => (s.Competence ? s.Competence.toLowerCase() : '')
					&& (s.Competence ? s.Competence.toLowerCase() : '').indexOf(val.toLowerCase()) !== -1
			);
		} else {
			this.dataSearchCategory = this.listSearchCategory.filter(
				(s) => (s.CategoryName ? s.CategoryName.toLowerCase() : '')
					&& (s.CategoryName ? s.CategoryName.toLowerCase() : '').indexOf(val.toLowerCase()) !== -1
			);
		}
	}

	//ADD COMPETENCE/CATEGORY TO COMPETENCE FUNCTION - SET EXAM STRUCTURE
	addToConfigF(code, isCompetence, isCategory, parent) {
		var itemUpdate = { Code: 0 }
		itemUpdate['QuizSession'] = this.updateDetailQuizSession.Code
		itemUpdate['Parent'] = parent
		if (isCompetence) {
			itemUpdate['Competence'] = code
			itemUpdate['CompetenceLevelID'] = 1
		}
		if (isCategory) itemUpdate['Category'] = code
		this.updateQuizConfig(itemUpdate, 1)
		this.addToConfig = null
		this.addToConfigChild = null
	}

	//#region updateQuizConfig
	updateQuizConfig(dto, type?: number, isLV?: string) {
		const ctx = dto.Code == 0 ? 'Thêm' : 'Cập nhật'
		let updateQuizConfigAPI = this.sessionsAPIService.UpdateQuizConfig(dto).subscribe(res => {
			if (Ps_UtilObjectService.hasListValue(res)
				&& Ps_UtilObjectService.hasValue(res.ObjectReturn)
				&& res.StatusCode == 0) {
				if (type !== 0) this.updateOrAddQuizConfigInList(res.ObjectReturn)
				this.layoutService.onSuccess(`${ctx} cấu trúc đợt đánh giá thành công.`, 3500)
				this.checkEssay()
				if (isLV) {
					this.quizConfigV.forEach(cf => {
						if (isLV == 'parent') {
							if (cf.Code == res.ObjectReturn.Code) {
								cf.ListChild = []
								cf.CategoryQuestionMultiple = null
								cf.CategoryQuestionEssay = null
								cf.CompetenceQuestionEssay = null
								cf.CompetenceQuestionMultiple = null
							}
						} else {
							cf.ListChild.forEach(cfc => {
								if (cfc.Code == res.ObjectReturn.Code) {
									cfc.CategoryQuestionMultiple = null
									cfc.CategoryQuestionEssay = null
									cfc.CompetenceQuestionEssay = null
									cfc.CompetenceQuestionMultiple = null
								}
							})
						}
					})
					// this.updateListQuizConfig()
				}

				// if (dto.Code == 0) {
				// 	if (this.quizConfigV.length !== 0) {
				// 		this.updateQuizConfigProperties(dto)
				// 	}
				// }
			}
			else this.layoutService.onError(`${ctx} cấu trúc đợt đánh giá không thành công: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`${ctx} cấu trúc đợt đánh giá không thành công: ${err}`))
		this.arrUnsubscribe.push(updateQuizConfigAPI);
	}
	//#endregion

	//#region updateListQuizConfig
	// updateListQuizConfig() {
	// 	let updateListQuizConfiggAPI = this.sessionsAPIService.UpdateListQuizConfig(this.quizConfigV).subscribe(res => {
	// 		if (Ps_UtilObjectService.hasListValue(res)
	// 			&& Ps_UtilObjectService.hasValue(res.ObjectReturn)
	// 			&& res.StatusCode == 0) this.layoutService.onSuccess('Cập nhật danh sách cấu trúc đợt đánh giá thành công.', 3500)
	// 		else this.layoutService.onError(`Cập nhật danh sách cấu trúc đợt đánh giá không thành công: ${res.ErrorString}`)
	// 	}, (err) => this.layoutService.onError(`Lỗi kết nối với máy chủ: ${err}`))
	// 	this.arrUnsubscribe.push(updateListQuizConfiggAPI);
	// }
	//#endregion

	//#region updateQuizConfigProperties	
	// updateQuizConfigProperties(dto?) {
	// 	if (!this.quizConfigV) return
	// 	if (this.quizConfigV.length == 1) return
	// 	this.quizConfigV.forEach((quizConfig: DTOQuizConfig) => {
	// 		quizConfig.CategoryPercentage = null
	// 		quizConfig.CompetencePercentage = null
	// 		quizConfig.CategoryQuestionEssay = null;
	// 		quizConfig.CategoryQuestionMultiple = null;
	// 		quizConfig.CompetenceQuestionEssay = null;
	// 		quizConfig.CompetenceQuestionMultiple = null;
	// 		if (Ps_UtilObjectService.hasListValue(quizConfig.ListChild)) {
	// 			quizConfig.ListChild.forEach(cfc => {
	// 				cfc.CategoryQuestionEssay = null;
	// 				cfc.CategoryQuestionMultiple = null;
	// 				cfc.CompetenceQuestionEssay = null;
	// 				cfc.CompetenceQuestionMultiple = null;
	// 			})
	// 		}
	// 	});
	// 	this.updateListQuizConfig()
	// }
	//#endregion

	//#region updateOrAddQuizConfigInList
	updateOrAddQuizConfigInList(newQuizConfig: DTOQuizConfig) {
		if (Ps_UtilObjectService.hasListValue(this.quizConfigV) == false) this.getListQuizConfig(this.updateDetailQuizSession.Code)
		else {
			const existingIndex = this.quizConfigV.findIndex((config) => config.Code === newQuizConfig.Code);
			if (existingIndex !== -1) this.quizConfigV[existingIndex] = newQuizConfig;
			else {
				const parentIndex = this.quizConfigV.findIndex((config) => config.Code === newQuizConfig.Parent);
				if (parentIndex !== -1) {
					if (this.quizConfigV[parentIndex].ListChild) {
						const existingChildIndex = this.quizConfigV[parentIndex].ListChild.findIndex((config) => config.Code === newQuizConfig.Code);
						if (existingChildIndex !== -1) this.quizConfigV[parentIndex].ListChild[existingChildIndex] = newQuizConfig;
						else this.quizConfigV[parentIndex].ListChild.push(newQuizConfig);
					} else this.quizConfigV[parentIndex].ListChild = [newQuizConfig];
				} else this.quizConfigV.push(newQuizConfig);
			}
		}
	}
	//#endregion

	//#region deleteQuizConfig
	deleteQuizConfig(item) {
		var itemDel = { Code: item.Code }
		let deleteQuizConfigAPI = this.sessionsAPIService.DeleteQuizConfig(itemDel).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.deleteItemConfigByCode(item.Code)
				this.layoutService.onSuccess('Xóa cấu hình đợt đánh giá thành công.')

				// if (item.Parent == null) {
				// 	if (this.quizConfigV.length !== 0) this.updateQuizConfigProperties()
				// }
				// else {
				// 	var itemExec = this.quizConfigV.find(cf => cf.Code === item.Parent)
				// 	if (itemExec.ListChild.length !== 0) {
				// 		itemExec.ListChild.forEach(cfc => {
				// 			cfc.CategoryQuestionEssay = null
				// 			cfc.CategoryQuestionMultiple = null
				// 			cfc.CompetenceQuestionEssay = null
				// 			cfc.CompetenceQuestionMultiple = null
				// 		})
				// 	}
				// 	this.updateListQuizConfig()
				// }
			} else this.layoutService.onError(`Đã xảy ra lỗi khi xóa cấu hình đợt đánh giá: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi xóa cấu hình đợt đánh giá: ${err}`))
		this.arrUnsubscribe.push(deleteQuizConfigAPI)
		this.showDialog = false
	}
	//#endregion

	//#region numerictextboxOnBlur
	numerictextboxOnBlur(i, isCate) {
		if (i.CompetencePercentage < 0 || i.CategoryPercentage < 0
			|| i.CompetencePercentage > 100 || i.CategoryPercentage > 100) {
			this.quizConfigV.forEach((item) => {
				if (item.Code == i.Code) {
					item.CompetencePercentage = null
					item.CategoryPercentage = null
				}
			})
			this.layoutService.onWarning('Tỷ lệ điểm nhập không phù hợp, xin vui lòng nhập lại', 5000)
			return
		}
		var temp = i.CompetencePercentage || i.CategoryPercentage
		if (this.checkValNumConfig == temp) return;

		var total = 0
		for (let item of this.quizConfigV) {
			if ((!isCate && item.CompetencePercentage == null) || (isCate && item.CategoryPercentage == null)) {
				this.updateQuizConfig(i, 1)
				return
			}
			else if (!isCate) total += item.CompetencePercentage
			else if (isCate) total += item.CategoryPercentage
		}

		if (total == 100) {
			this.updateQuizConfig(i, 1)
			return
		}
		this.quizConfigV.forEach((item) => {
			if (item.Code == i.Code) {
				item.CompetencePercentage = null
				item.CategoryPercentage = null
			}
		})
		this.layoutService.onWarning('Vui lòng nhập tổng tỷ lệ các mục không quá hoặc nhỏ hơn 100.', 5000)
	}
	//#endregion

	//#region numerictextboxChildOnBlur
	numerictextboxChildOnBlur(item, isEssay, isCate, isChild) {
		var count: number = 0
		//Check item là category hoặc item là competence
		if (isCate) {

			//Check trường đang cập nhật
			if (isEssay) {

				//Check giá trị thay đổi
				if (this.checkValNumConfig !== item.CategoryQuestionEssay) {

					//Check min max - theo số lượng câu hỏi
					if (item.TotalQuestionEssay < item.CategoryQuestionEssay || item.CategoryQuestionEssay < 0) {
						this.clearCategoryQuestion(item, 'CategoryQuestionEssay', isChild ? 1 : 0)
						return
					}
				} else return
			} else {
				if (this.checkValNumConfig !== item.CategoryQuestionMultiple) {
					if (item.TotalQuestionMultiple < item.CategoryQuestionMultiple || item.CategoryQuestionMultiple < 0) {
						this.clearCategoryQuestion(item, 'CategoryQuestionMultiple', isChild ? 1 : 0)
						return
					}
				} else return
			}

			// if (isChild) {
			// 	this.quizConfigV.forEach(cf => {
			// 		if (Ps_UtilObjectService.hasListValue(cf.ListChild)) {
			// 			cf.ListChild.forEach(cfc => {
			// 				if (cfc.CategoryQuestionEssay == null || cfc.CategoryQuestionMultiple == null) count += 1
			// 			})
			// 		}
			// 	})
			// } else {
			// 	this.quizConfigV.forEach(cf => {
			// 		if (cf.CategoryQuestionEssay == null || cf.CategoryQuestionMultiple == null) count += 1
			// 	})
			// }
		} else {
			if (isEssay) {
				if (this.checkValNumConfig !== item.CompetenceQuestionEssay) {
					if (item.TotalQuestionEssay < item.CompetenceQuestionEssay || item.CompetenceQuestionEssay < 0) {
						this.clearCategoryQuestion(item, 'CompetenceQuestionEssay', isChild ? 1 : 0)
						return
					}
				} else return
			} else {
				if (this.checkValNumConfig !== item.CompetenceQuestionMultiple) {
					if (item.TotalQuestionMultiple < item.CompetenceQuestionMultiple || item.CompetenceQuestionMultiple < 0) {
						this.clearCategoryQuestion(item, 'CompetenceQuestionMultiple', isChild ? 1 : 0)
						return
					}
				} else return
			}

			// if (isChild) {
			// 	this.quizConfigV.forEach(cf => {
			// 		if (Ps_UtilObjectService.hasListValue(cf.ListChild)) {
			// 			cf.ListChild.forEach(cfc => {
			// 				if (cfc.CompetenceQuestionEssay == null || cfc.CompetenceQuestionMultiple == null) count += 1
			// 			})
			// 		}
			// 	})
			// } else {
			// 	this.quizConfigV.forEach(cf => {
			// 		if (cf.CompetenceQuestionEssay == null || cf.CompetenceQuestionMultiple == null) count += 1
			// 	})
			// }
		}

		// if (count !== 0) {
		// 	this.updateQuizConfig(item, 1)
		// 	return
		// }

		var countTotal = 0
		this.quizConfigV.forEach(cf => {
			if (cf.ListChild) {
				cf.ListChild.forEach(cfc => {
					if (isCate) countTotal += (cfc.CategoryQuestionEssay == null ? 0 : cfc.CategoryQuestionEssay) +
						(cfc.CategoryQuestionMultiple == null ? 0 : cfc.CategoryQuestionMultiple)
					else countTotal += (cfc.CompetenceQuestionEssay == null ? 0 : cfc.CompetenceQuestionEssay) +
						(cfc.CompetenceQuestionMultiple == null ? 0 : cfc.CompetenceQuestionMultiple)
				})
			} else {
				if (isCate) countTotal += (cf.CategoryQuestionEssay == null ? 0 : cf.CategoryQuestionEssay) +
					(cf.CategoryQuestionMultiple == null ? 0 : cf.CategoryQuestionMultiple)
				else countTotal += (cf.CompetenceQuestionEssay == null ? 0 : cf.CompetenceQuestionEssay) +
					(cf.CompetenceQuestionMultiple == null ? 0 : cf.CompetenceQuestionMultiple)
			}
		})

		if (countTotal > this.updateDetailQuizSession.NoOfQuestion) {
			if (isCate) {
				if (isEssay) item.CategoryQuestionEssay = null
				else item.CategoryQuestionMultiple = null
			} else {
				if (isEssay) item.CompetenceQuestionEssay = null
				else item.CompetenceQuestionMultiple = null
			}
			this.layoutService.onWarning('Tổng số lượng các câu hỏi không phù hợp.', 3500)
		}
		this.updateQuizConfig(item, 1)
	}
	//#endregion

	//CALCULATE ITEM PERCENTAGE FUNCTION - SET EXAM STRUCTURE
	calculateItemQualityQuestion(item: any, isCate: boolean) {
		if (Ps_UtilObjectService.hasListValue(item.ListChild)) {
			var total = 0
			item.ListChild.forEach(cfc => {
				if (isCate) total += cfc.CompetenceQuestionEssay + cfc.CompetenceQuestionMultiple
				else total += cfc.CategoryQuestionEssay + cfc.CategoryQuestionMultiple
			})
			if (total == 0) return ''
			else return total
		} else {
			if (item.Parent == null) {
				var total = 0
				if (isCate) total += item.CategoryQuestionEssay + item.CategoryQuestionMultiple
				else total += item.CompetenceQuestionEssay + item.CompetenceQuestionMultiple
				if (total == 0) return ''
				else return total
			}
		}
	}

	isExpand(i) {
		if (this.itemExpan == null) return false
		else {
			if (i.Code == this.itemExpan.Code) return true
			return false
		}
	}

	itemExpan = null
	onPanelSelect(event): void {
		this.itemExpan = event
	}

	calculateItemTotalQuestion(item, isCate) {
		if (isCate) {
			if (item.CategoryQuestionEssay == null && item.CategoryQuestionMultiple == null) return ''
			return item.CategoryQuestionEssay + item.CategoryQuestionMultiple
		}
		else {
			if (item.CompetenceQuestionEssay == null && item.CompetenceQuestionMultiple == null) return ''
			return item.CompetenceQuestionEssay + item.CompetenceQuestionMultiple
		}
	}

	//SHOW DIALOG DELETE CONFIG - SET EXAM STRUCTURE
	showDialogAndDeleteConfig(item) {
		this.showDialogChange = {
			title: 'xóa cấu hình đợt đánh giá', firstContent: ['Bạn chắc chắn muốn xóa cấu hình', item.CategoryName || item.CompetenceName],
			lastContent: ['cấu hình đợt đánh giá', 'bị xóa'], button: ['không xóa', 'xóa'], icon: 'trash'
		}
		this.action = 'deleteConfigQuizSession'
		this.showDialog = true
		this.itemDelete = item
	}

	//CHECK ITEM CONFIG CHILD FUNCTION - SET EXAM STRUCTURE
	checkItemConfigChild(item) {
		return Ps_UtilObjectService.hasListValue(item)
	}

	//DELETE ITEM CONFIG IN LOCAL FUNCTION - SET EXAM STRUCTURE
	deleteItemConfigByCode(Code: number): void {
		const indexInQuizConfigV = this.quizConfigV.findIndex((item) => item.Code === Code);
		if (indexInQuizConfigV !== -1) {
			this.quizConfigV.splice(indexInQuizConfigV, 1);
			this.checkQuizConfigV = Ps_UtilObjectService.hasListValue(this.quizConfigV)
			return;
		}

		for (const item of this.quizConfigV) {
			if (item.ListChild) {
				const indexInListChild = item.ListChild.findIndex((itemChild) => itemChild.Code === Code);
				if (indexInListChild !== -1) {
					item.ListChild.splice(indexInListChild, 1);
					return;
				}
			}
		}
	}

	clearCategoryQuestion(dto, questionKey, type) {
		this.quizConfigV.forEach((cf) => {
			if (type == 0) {
				if (cf.Code === dto.Code) cf[questionKey] = null;
			} else {
				if (Ps_UtilObjectService.hasListValue(cf.ListChild)) {
					cf.ListChild.forEach(child => {
						if (child.Code === dto.Code) child[questionKey] = null;
					});
				}
			}
		});
		this.layoutService.onWarning('Không thể nhập số lượng vượt quá số lượng câu hỏi trong ngân hàng.', 3500)
		this.updateQuizConfig(dto, 1)
	}
	//#endregion

	//#region QUIZ SESSION ROLE CONFIG
	pageSize: number = 25
	loading: boolean = false
	skip: number = 0
	addToListStaff: any
	dataStaff: DTOEmployee[] = []
	onPageChangeCallback: Function
	listStaffType: DTOEmployee[] = []
	isHaslQuestionEssay: boolean = false
	headOfExaminationBoardBinding: any[] = []
	pageSizes = [...this.layoutService.pageSizes]
	listStaffJoinQuizSession = new Subject<any>()
	dataStaffJoinDialog = []
	dataStaffJoinDialogGird = new Subject<any>()
	officerMarksEssayQuestionsBinding: any[] = []
	monitorAllParticipatingUnitsBinding: any[] = []
	headOfExaminationBoard: DTOQuizStaffRole[] = []
	officerMarksEssayQuestions: DTOQuizStaffRole[] = []
	monitorAllParticipatingUnits: DTOQuizStaffRole[] = []
	gridState: State = { filter: { filters: [], logic: 'and' }, }
	selectable: SelectableSettings = { enabled: true, mode: 'multiple', drag: false, checkboxOnly: true, };
	staffDelete: any = []
	textSearchStaffJoinTemp = ''
	filterStaffJoinText: any

	onSearchStaffJoinData(e: any) {
		this.skip = 0
		if (e.filters[0].value !== this.textSearchStaffJoinTemp) {
			if (e.filters[0].value == '') {
				this.filterStaffJoinText = ''
				this.textSearchStaffJoinTemp = ''
			} else {
				this.filterStaffJoinText = e
				this.textSearchStaffJoinTemp = e.filters[0].value
			}
			this.getQuizStaffRole(4)
		} else return
	}

	checkShowListJoin() {
		if (this.updateDetailQuizSession.IsAllStaff === 0) return false
		if (this.updateDetailQuizSession.IsAllStaff === 1) {
			if (!Ps_UtilObjectService.hasListValue(JSON.parse(this.updateDetailQuizSession.ListOfPostionID))) return false
		} return true
	}

	checkEssay() {
		this.isHaslQuestionEssay = false;

		this.quizConfigV.forEach(cf => {
			if (cf.CompetenceQuestionEssay || cf.CategoryQuestionEssay) {
				this.isHaslQuestionEssay = true;
			}

			if (Ps_UtilObjectService.hasListValue(cf.ListChild)) {
				cf.ListChild.forEach(cfc => {
					if (cfc.CategoryQuestionEssay || cfc.CompetenceQuestionEssay) {
						this.isHaslQuestionEssay = true;
					}
				});
			}
		});
	}


	onPageStaffChangeCallback: Function
	skipStasff: number = 0
	pasiSizeStaff = 25
	pageSizesStaff = [...this.layoutService.pageSizes]
	filterText: any
	gridStateStaff: State = { filter: { logic: "and", filters: [{ field: "StatusID", operator: "eq", value: 1 }] } }
	// filterCodeE.filters.push({ field: "Code", value: item, operator: "neq", ignoreCase: true });

	pageStaffChange(event: PageChangeEvent) {
		this.skipStasff = event.skip;
		this.pasiSizeStaff = event.take
		this.getListQuizEmployee()
	}

	textSearchTemp: string = ''

	onSearchData(e: any) {
		this.skipStasff = 0
		if (e.filters[0].value !== this.textSearchTemp) {
			if (e.filters[0].value == '') {
				this.filterText = ''
				this.textSearchTemp = ''
			} else {
				this.filterText = e
				this.textSearchTemp = e.filters[0].value
			}
			this.getListQuizEmployee()
		} else return
	}

	onResetFilter() {
		this.filterText = null
		this.getListQuizEmployee()
	}

	onCloseDialog() {
		this.skipStasff = 0
		$('.dialog-add-staff .clear-filter-btn').click()
		this.showDialogAddStaff = false
	}

	//GET DATA EMPLOYEE FUNCTION - QUIZ SESSION ROLE CONFIG
	getListEmployee(filter) {
		let getListStaffAPI = this.staffAPIService.GetListEmployee(filter).subscribe(res => {
			if (Ps_UtilObjectService.hasListValue(res)
				&& Ps_UtilObjectService.hasValue(res.ObjectReturn)
				&& res.StatusCode == 0) {
				// if (staffJoin) this.dataStaffJoinDialogGird.next({ data: res.ObjectReturn.Data, total: res.ObjectReturn.Total })
				// else
				this.listStaffType = res.ObjectReturn.Data
				this.dataStaff = this.listStaffType.slice()
			} else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân sự: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân sự: ${err}`))
		this.arrUnsubscribe.push(getListStaffAPI);
	}

	getListQuizEmployee() {
		this.gridStateStaff.filter.filters = []
		// this.gridStateStaff.filter.filters.push({ field: "StatusID", operator: "eq", value: 1 })
		this.gridStateStaff.take = this.pasiSizeStaff
		this.gridStateStaff.skip = this.skipStasff
		this.gridStateStaff.sort = [{ field: 'Code', dir: 'asc' }]
		if (Ps_UtilObjectService.hasValueString(this.filterText)) this.gridStateStaff.filter.filters.push(this.filterText)
		let getListQuizEmployeeAPI = this.sessionsAPIService.GetListQuizEmployee(this.gridStateStaff, this.updateDetailQuizSession.Code).subscribe(res => {
			if (Ps_UtilObjectService.hasListValue(res)
				&& Ps_UtilObjectService.hasValue(res.ObjectReturn)
				&& res.StatusCode == 0) {
				this.dataStaffJoinDialogGird.next({ data: res.ObjectReturn.Data, total: res.ObjectReturn.Total })
			} else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân sự cho đợt đánh giá: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhân sự cho đợt đánh giá: ${err}`))
		this.arrUnsubscribe.push(getListQuizEmployeeAPI);
	}

	getEmployeeData(type) {
		// this.skipStasff = 0
		this.gridStateStaff.filter.filters = []
		this.gridStateStaff.filter.filters.push({ field: "StatusID", operator: "eq", value: 1 })
		// if (type == 0) {
		// 	this.gridStateStaff.take = this.pasiSizeStaff
		// 	this.gridStateStaff.skip = this.skipStasff
		// 	this.gridStateStaff.sort = [{ field: 'Code', dir: 'asc' }]
		// 	if (Ps_UtilObjectService.hasValueString(this.filterText)) this.gridStateStaff.filter.filters.push(this.filterText)
		// 	if (Ps_UtilObjectService.hasValue(this.dataStaffJoinDialog)) {
		// 		this.dataStaffJoinDialog.forEach(e => {
		// 			this.gridStateStaff.filter.filters.push({ field: "Code", value: e.StaffID, operator: "neq", ignoreCase: true })
		// 		})
		// 	}
		// 	this.getListEmploye e(this.gridStateStaff, true)
		// } else
		// {
		if (type == 1) {
			if (Ps_UtilObjectService.hasListValue(this.headOfExaminationBoardBinding)) {
				this.headOfExaminationBoardBinding.forEach(c => {
					this.gridStateStaff.filter.filters.push({ field: "Code", value: c, operator: "neq", ignoreCase: true })
				})
			}
		} if (type == 2) {
			if (Ps_UtilObjectService.hasListValue(this.monitorAllParticipatingUnitsBinding)) {
				this.monitorAllParticipatingUnitsBinding.forEach(c => {
					this.gridStateStaff.filter.filters.push({ field: "Code", value: c, operator: "neq", ignoreCase: true })
				})
			}
		} if (type == 3) {
			if (Ps_UtilObjectService.hasListValue(this.officerMarksEssayQuestionsBinding)) {
				this.officerMarksEssayQuestionsBinding.forEach(c => {
					this.gridStateStaff.filter.filters.push({ field: "Code", value: c, operator: "neq", ignoreCase: true })
				})
			}
		} this.getListEmployee(this.gridStateStaff)
		// }
	}

	pageChange(event: PageChangeEvent) {
		this.skip = event.skip;
		this.pageSize = event.take
		this.getQuizStaffRole(4)
	}

	//GET QUIZ STAFF ROLE FUNCTION - QUIZ SESSION ROLE CONFIG
	getQuizStaffRole(type: number) {
		this.gridState = { filter: { filters: [], logic: 'and' }, }
		this.gridState.filter.filters.push({ field: 'QuizSession', operator: 'eq', ignoreCase: false, value: this.updateDetailQuizSession.Code },
			{ field: 'TypeData', operator: 'eq', ignoreCase: false, value: type })
		if (type == 4) {
			this.gridState.take = this.pageSize
			this.gridState.skip = this.skip
			if (Ps_UtilObjectService.hasValueString(this.filterStaffJoinText)) this.gridState.filter.filters.push(this.filterStaffJoinText)
		}


		let getListQuizRoleAPI = this.sessionsAPIService.GetListQuizRole(this.gridState).subscribe(res => {
			if (Ps_UtilObjectService.hasListValue(res)
				&& Ps_UtilObjectService.hasValue(res.ObjectReturn)
				&& res.StatusCode == 0) {
				if (type === 1) {
					this.headOfExaminationBoard = res.ObjectReturn.Data
					this.switchStaffRoleToEmployee(1)
				} else if (type === 2) {
					this.monitorAllParticipatingUnits = res.ObjectReturn.Data
					this.switchStaffRoleToEmployee(2)
				} else if (type === 3) {
					this.officerMarksEssayQuestions = res.ObjectReturn.Data
					this.switchStaffRoleToEmployee(3)
				}
				else if (type === 4) {
					this.listStaffJoinQuizSession.next({ data: res.ObjectReturn.Data, total: res.ObjectReturn.Total });
					this.dataStaffJoinDialog = res.ObjectReturn.Data
					if (this.showDialogAddStaff) this.getListQuizEmployee()
					this.isHasListStaff = res.ObjectReturn.Total > 0
				}
			} else this.layoutService.onError(`Đã xảy ra lỗi khi lấy vai trò tham gia đợt đánh giá: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi lấy vai trò tham gia đợt đánh giá: ${err}`))
		this.arrUnsubscribe.push(getListQuizRoleAPI);
	}

	//SWITCH STAFF ROLE TO EMPLOYEE FUNCTION - QUIZ SESSION ROLE CONFIG
	switchStaffRoleToEmployee(t) {
		if (t == 1) {
			this.headOfExaminationBoardBinding = []
			if (Ps_UtilObjectService.hasListValue(this.headOfExaminationBoard)) {
				this.headOfExaminationBoard.forEach((item) => {
					this.headOfExaminationBoardBinding.push(item.StaffID)
				})
			}
		} if (t == 2) {
			this.monitorAllParticipatingUnitsBinding = []
			if (Ps_UtilObjectService.hasListValue(this.monitorAllParticipatingUnits)) {
				this.monitorAllParticipatingUnits.forEach((item) => {
					this.monitorAllParticipatingUnitsBinding.push(item.StaffID)
				})
			}
		} if (t == 3) {
			this.officerMarksEssayQuestionsBinding = []
			if (Ps_UtilObjectService.hasListValue(this.officerMarksEssayQuestions)) {
				this.officerMarksEssayQuestions.forEach((item) => {
					this.officerMarksEssayQuestionsBinding.push(item.StaffID)
				})
			}
		} if (t == 4) {

		}
	}

	//ON CHANGE FILTER STAFF FUNCTION - QUIZ SESSION ROLE CONFIG
	onChangeFilterStaff(val) {
		this.dataStaff = this.listStaffType.filter((s) => {
			const searchTerms = val.toLowerCase().split(' ');
			const firstName = s.FirstName ? s.FirstName.toLowerCase() : '';
			const middleName = s.MiddleName ? s.MiddleName.toLowerCase() : '';
			const lastName = s.LastName ? s.LastName.toLowerCase() : '';

			return searchTerms.every(term =>
				(firstName && firstName.indexOf(term) !== -1) ||
				(middleName && middleName.indexOf(term) !== -1) ||
				(lastName && lastName.indexOf(term) !== -1)
			);
		});
	}

	//ON CHANGE VALUE ROLE IN QUIZ AND UPDATE - QUIZ SESSION ROLE CONFIG
	valueStaffChange(item, type) {
		var itemPush = {}
		itemPush['Code'] = 0
		itemPush['QuizSession'] = this.updateDetailQuizSession.Code
		itemPush['StaffID'] = item.Code
		itemPush['TypeData'] = type

		let updateQuizRoleAPI = this.sessionsAPIService.UpdateQuizRole(itemPush).subscribe(res => {
			if (Ps_UtilObjectService.hasListValue(res)
				&& Ps_UtilObjectService.hasValue(res.ObjectReturn)
				&& res.StatusCode == 0) {
				if (type !== 4) this.layoutService.onSuccess('Thêm vai trò trong đợt đánh giá thành công.')
				else this.layoutService.onSuccess('Thêm nhân sự tham giá đợt đánh giá thành công.')
				this.getQuizStaffRole(type)
			} else this.layoutService.onError(`Thêm vai trò trong đợt đánh giá không thành công: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Thêm vai trò trong đợt đánh giá không thành công: ${err}`))
		this.arrUnsubscribe.push(updateQuizRoleAPI);
	}

	deleteQuizRoleRemove(e, t) {
		var temp
		if (t === 1) {
			temp = this.headOfExaminationBoard.find(s => s.StaffID = e.dataItem.Code)
			this.deleteQuizRole([temp])
			return
		}
		if (t === 2) {
			temp = this.monitorAllParticipatingUnits.find(s => s.StaffID = e.dataItem.Code)
			this.deleteQuizRole([temp])
			return
		}
		if (t === 3) {
			temp = this.officerMarksEssayQuestions.find(s => s.StaffID = e.dataItem.Code)
			this.deleteQuizRole([temp])
			return
		}
		if (t === 4) {
			this.staffDelete = [e]
			this.showDialogChange = {
				title: 'xóa nhân viên tham gia', firstContent: ['Bạn chắc chắn muốn xóa nhân viên', e.StaffName],
				lastContent: ['nhân viên tham gia', 'bị xóa'], button: ['không xóa', 'xóa'], icon: 'trash'
			}
			this.action = 'deleteStaffJoin'
			this.showDialog = true
		}
	}

	//DELETE QUIZ ROLE FUNCTION - QUIZ SESSION ROLE CONFIG
	deleteQuizRole(dto) {
		let deleteQuizRoleAPI = this.sessionsAPIService.DeleteQuizRole(dto).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.layoutService.onSuccess('Xóa vai trò trong đợt đánh giá thành công.')
				this.getQuizStaffRole(dto[0].TypeData)
			} else this.layoutService.onError(`Đã xảy ra lỗi khi xóa vai trò trong đợt đánh giá: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi xóa vai trò trong đợt đánh giá: ${err}`))
		this.arrUnsubscribe.push(deleteQuizRoleAPI)
		this.showDialog = false
	}

	generateQuizRole() {
		var newDTO = {
			QuizSession: this.updateDetailQuizSession.Code,
			TypeData: 4
		}
		let generateQuizRoleAPI = this.sessionsAPIService.GenerateQuizRole(newDTO).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.getQuizStaffRole(4)
				this.isHasListStaff = res.ObjectReturn.length > 0
				this.layoutService.onSuccess('Phát sinh nhân sự theo chức danh thành công.')
			} else this.layoutService.onError(`Đã xảy ra lỗi khi phát sinh nhân sự theo chức danh: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi phát sinh nhân sự theo chức danh: ${err}`))
		this.arrUnsubscribe.push(generateQuizRoleAPI)
	}
	//#endregion

	//#region DIALOG
	action: string
	showDialog = false
	showDialogChange: any
	showDialogAddStaff = false

	//ON CLICK ACCEPT DIALOG - DIALOG
	onClickDialog(action: string) {
		// if (action === 'deleteQuizSession') this.deleteQuizSession(this.updateDetailQuizSession)
		// else if (action === 'changeQuizSession') this.changeDepartmentQuizSession(this.prop)
		// else if (action === 'deletePositionJoin') this.deleteListPosition(this.idDeleteListPosition)
		// else if (action === 'deleteConfigQuizSession') this.deleteQuizConfig(this.itemDelete)
		// else if (action === 'deleteStaffJoin') this.deleteQuizRole(this.staffDelete)
		// else if (action === 'deleteIsAllStaffJoin') this.deleteListIsAllStaffJoin(this.staffDelete)

		switch (action) {
			case 'deleteQuizSession':
				this.deleteQuizSession(this.updateDetailQuizSession)
				break;
			case 'changeQuizSession':
				this.changeDepartmentQuizSession(this.prop)
				break;
			case 'deletePositionJoin':
				this.deleteListPosition(this.idDeleteListPosition)
				break;
			case 'deleteConfigQuizSession':
				this.deleteQuizConfig(this.itemDelete)
				break;
			case 'deleteStaffJoin':
				this.deleteQuizRole(this.staffDelete)
				break;
			case 'deleteIsAllStaffJoin':
				this.deleteListIsAllStaffJoin(this.staffDelete)
				break;
			default:
				break;
		}
	}
	//#endregion
}
//#endregion
