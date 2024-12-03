import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { DTOResponse, Ps_UtilObjectService } from "src/app/p-lib";
import { Subject, Subscription, forkJoin, of } from "rxjs";
import { DTOQuizType } from "src/app/p-app/p-hri/shared/dto/DTOQuizType";
import { LayoutService } from "src/app/p-app/p-layout/services/layout.service";
import { PS_HelperMenuService } from "src/app/p-app/p-layout/services/p-menu.helper.service";
import { StaffApiService } from "../../services/staff-api.service";
import { ModuleDataItem } from "src/app/p-app/p-layout/dto/menu-data-item.dto";
import { DTOQuizSession } from "../../dto/DTOQuizSession.dto";
import { FormGroup, FormControl, UntypedFormGroup } from "@angular/forms";
import { HriQuizSessionService } from "../../services/hri-quiz-session.service";
import { DTOActionPermission } from "src/app/p-app/p-layout/dto/DTOActionPermission";
import { DTOPermission } from "src/app/p-app/p-layout/dto/DTOPermission";
import { distinct } from "@progress/kendo-data-query";
import { catchError, skip, takeUntil, tap } from "rxjs/operators";
import { SVGIcon, calendarIcon, folderIcon, paperclipIcon } from "@progress/kendo-svg-icons";
import { HriQuizSessionsAPIService } from "../../services/hri-quiz-session-api.service";
import * as $ from 'jquery';
import { QueueApiService } from "src/app/p-lib/services/queue-api.service";

@Component({
    selector: 'app-hr-quiz-session-info',
    templateUrl: './hr-quiz-session-info.component.html',
    styleUrls: ['./hr-quiz-session-info.component.scss']
})

export class HRQuizSessionInfoComponent implements OnInit, OnDestroy {
    nowDate = new Date()
    timePlus = new Date(this.nowDate.setMinutes(this.nowDate.getMinutes() + 10, 0, 0));
    // Permission
    isMaster: boolean = true;
    isCreator: boolean = false;
    isApprover: boolean = false;
    isSupervisior: boolean = false;
    actionPerm: DTOActionPermission[];
    icons = paperclipIcon;
    //Boolean
    loading: boolean = false;
    justLoaded: boolean = false;
    // isSeeQuizSessionSetting: boolean = false;
    isTotalTimeQuestion: boolean = false;
    blockExpan: boolean = true
    disableReVal = false
    @Input() step: number;
    @Input() canSetting: boolean = true;
    @Input() disable: boolean = false;
    @Output() sharedData = new EventEmitter()

    //Quiz related declarations
    QuizSession: DTOQuizSession = new DTOQuizSession();
    quizTypeList: DTOQuizType[] = [];
    calculationTypeList: DTOQuizType[] = [];

    //Subscriptions
    ngUnsubscribe = new Subject<void>();
    public value: Date = new Date(2000, 2, 10);
    //Form declarations
    QuizSessionForm: FormGroup

    isLeader: boolean = false

    constructor(
        private layoutService: LayoutService,
        private helperService: PS_HelperMenuService,
        private staffApiService: StaffApiService,
        private sessionService: HriQuizSessionService,
        private sessionAPIService: HriQuizSessionsAPIService,
        private queueApiService: QueueApiService,
    ) { }


    ngOnInit(): void {
        
        //Phải khởi tạo form trong OnInit vì nếu không thì sẽ lấy giá trị mặc định của input để gán cho prop disable
        this.LoadQuizSessionForm();
        this.helperService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
                //Get new QuizSession data whenever new value emitted
                this.sessionService.getQuizSession$().pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
                    let convertedQuiz = value;
                    if (value.Code === 0) {
                        convertedQuiz = this.onSetDefaultDate(value);
                    } else {
                        convertedQuiz = this.ConvertStringDateToDatepicker(value);
                    }
                    this.QuizSessionForm.patchValue(convertedQuiz);
                    if (convertedQuiz.TypeOfSession == 1 || convertedQuiz.EvaluationView == 2) this.disableReVal = true
                    else this.disableReVal = false
                    this.onCheckTimeEvaluationDisabled();
                })
        
                this.GetQuizSessionByCache()
        
                // this.localStorageService.getStorageChangeEvent('quizSession').pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
                //     console.log(value);
                // })
        
                this.GetData();
			}
		})
        let that = this;

        this.helperService
            .changePermission()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((res: DTOPermission) => {
                if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
                    that.justLoaded = false;
                    that.actionPerm = distinct(res.ActionPermission, 'ActionType');

                    that.isMaster =
                        that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
                    that.isCreator =
                        that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
                }
            });
        // if ((that.isMaster || that.isCreator) && this.isFirstStep == true) {
        //     this.isSeeQuizSessionSetting = false;
        // } else if ((that.isMaster || that.isCreator) && this.isFirstStep == false) {
        //     this.isSeeQuizSessionSetting = true;
        // }
    }

    ngAfterViewInit() {
        // if (this.step != 1) {
        //     $('h1.block-title').click()
        // }
    }

    CheckPermission(Quiz: DTOQuizSession) {
        if (Ps_UtilObjectService.hasListValue(Quiz.ListOfUserRole)) {
            Quiz.ListOfUserRole.forEach(p => {
                if (p.TypeData === 1) this.isLeader = true;
            });
        }
    }

    GetQuizSessionByCache() {
        this.loading = true;
        this.sessionService.GetCacheQuizSession().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            if (res.Code !== 0) {
                this.sessionAPIService.GetQuizSession(res.Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
                    res => {
                        this.CheckPermission(res.ObjectReturn)
                        let convertedQuiz = res.ObjectReturn;
                        if (res.ObjectReturn.Code === 0) {
                            convertedQuiz = this.onSetDefaultDate(res.ObjectReturn);
                        } else {
                            convertedQuiz = this.ConvertStringDateToDatepicker(res.ObjectReturn);
                        }
                        this.QuizSessionForm.patchValue(convertedQuiz);
                        this.onCheckTimeEvaluationDisabled();
                        this.sharedData.emit(convertedQuiz);
                        if (convertedQuiz.TypeOfSession == 1 || convertedQuiz.EvaluationView == 2) this.disableReVal = true
                    }
                )
            }
            // else {
            //     this.sessionService.getQuizSession$().pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
            //         let convertedQuiz = value;
            //         if (value.Code === 0) {
            //             convertedQuiz = this.onSetDefaultDate(value);
            //         } else {
            //             convertedQuiz = this.ConvertStringDateToDatepicker(value);
            //         }
            //         this.QuizSessionForm.patchValue(convertedQuiz);
            //         this.onCheckTimeEvaluationDisabled();
            //     })
            // }
        }, err => {
            this.loading = false;
            this.layoutService.onError('Đã xảy ra lỗi ', err);
        }
        )
    }

    LoadQuizSessionForm() {
        this.QuizSessionForm = new FormGroup({
            Code: new FormControl(null),
            SessionID: new FormControl({ value: '', disabled: true }),
            SessionName: new FormControl({ value: '', disabled: !(this.step == 1) || this.disable }),
            SessionObjective: new FormControl({ value: '', disabled: !(this.step == 1) || this.disable }),
            TypeOfSession: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
            StartDate: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
            EndDate: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
            OpenedDate: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
            ClosedDate: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
            TypeOfTimeEvaluation: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
            NoOfQuestion: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
            Duration: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
            StatusName: new FormControl(),
            IsCategory: new FormControl(true),
            IsCategoryLevel: new FormControl(3),
            IsAllStaff: new FormControl(true),
            IsCompetence: new FormControl(true),
            IsCurrentCompetenceLevel: new FormControl(true),
            EvaluationView: new FormControl(2),
            OrderConfig: new FormControl(1),
            StatusID: new FormControl(),
            AppealTime: new FormControl(3),
            AppealDate: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
            ReEvaluateTime: new FormControl(7),
            ReEvaluateDate: new FormControl({ value: null, disabled: !(this.step == 1) || this.disable }),
        });
    }

    GetData() {
        this.GetCacheQuizSession();
        this.GetQuizAndCaculationTypes();
    }

    //Lấy danh sách phân loại và cách tính điểm đợt đánh giá
    GetQuizAndCaculationTypes() {
        const getQuizTypes = this.staffApiService.GetListHR(12);
        const getCalculationTypes = this.staffApiService.GetListHR(13);

        forkJoin([getQuizTypes, getCalculationTypes]).pipe( //chạy song song lấy cả 2 danh sách
            tap(([quizTypeRes, calculationRes]) => {

                //Xử lý kết quả trả về của loại đợt đánh giá
                if (Ps_UtilObjectService.hasValue(quizTypeRes) && quizTypeRes.StatusCode === 0 && Ps_UtilObjectService.hasListValue(quizTypeRes.ObjectReturn)) {
                    this.quizTypeList = [...quizTypeRes.ObjectReturn];
                } else if (Ps_UtilObjectService.hasValue(quizTypeRes) && quizTypeRes.ErrorString != null) {
                    this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách phân loại đợt đánh giá.');
                }

                //Xử lý kết quả trả về của cách tính thời gian làm bài
                if (Ps_UtilObjectService.hasValue(calculationRes) && calculationRes.StatusCode === 0 && Ps_UtilObjectService.hasListValue(calculationRes.ObjectReturn)) {
                    this.calculationTypeList = [...calculationRes.ObjectReturn];
                } else if (Ps_UtilObjectService.hasValue(calculationRes) && calculationRes.ErrorString != null) {
                    this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách cách tính thời gian làm bài');
                }

            },
                takeUntil(this.ngUnsubscribe),
            ),
            catchError((error) => {
                this.layoutService.onError('Đã xảy ra lỗi khi lấy danh sách loại đơt đánh giá và cách tính điểm');
                return of();
            })
        ).subscribe();
    }

    GetCacheQuizSession() {
        this.loading = true;

        this.sessionService.GetCacheQuizSession().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
            res => {
                let convertedQuiz: DTOQuizSession;

                if (res.Code === 0) {
                    convertedQuiz = this.onSetDefaultDate(res);
                } else {
                    convertedQuiz = this.ConvertStringDateToDatepicker(res);
                }
                this.QuizSessionForm.patchValue(convertedQuiz);
                this.onCheckTimeEvaluationDisabled();
                this.loading = false;
            }, err => {
                this.loading = false;
                this.layoutService.onError('Đã xảy ra lỗi ', err);
            }
        )
    }

    onCheckTimeEvaluationDisabled() {
        const timeEvaluationID = this.QuizSessionForm.controls['TypeOfTimeEvaluation'].value;
        timeEvaluationID === 1 ? this.isTotalTimeQuestion = true : this.isTotalTimeQuestion = false;
    }

    //Set giá trị mặc định cho date khi tạo mới
    onSetDefaultDate(quiz: DTOQuizSession) {
        quiz.StartDate = new Date();
        quiz.EndDate = new Date();
        quiz.EndDate.setMonth(quiz.EndDate.getMonth() + 1);
        quiz.EndDate.setHours(23, 59, 59, 0)
        quiz.OpenedDate = new Date();
        quiz.OpenedDate.setHours(8, 0, 0, 0);
        quiz.ClosedDate = new Date(quiz.EndDate);
        quiz.ClosedDate.setHours(8, 0, 0, 0);
        return quiz;
    }

    onDateChange(type: string) {
        //reset OpenedDate and ClosedDate to default value
        const opendate = this.QuizSessionForm.controls['OpenedDate'].value

        if (type === 'StartDate' || type === 'EndDate') {
            if (this.QuizSessionForm.get('StartDate').value > this.nowDate) {
                this.QuizSessionForm.controls['OpenedDate'].setValue(this.QuizSessionForm.get('StartDate').value);
                this.QuizSessionForm.controls['OpenedDate'].value.setHours(8, 0, 0, 0);
            } else {
                const now = new Date();
                now.setMinutes(now.getMinutes() + 10);
                this.QuizSessionForm.controls['OpenedDate'].setValue(now);
            }
            // this.QuizSessionForm.controls['OpenedDate'].setValue(this.QuizSessionForm.get('StartDate').value > this.nowDate ? this.QuizSessionForm.get('StartDate').value : this.nowDate);
            // this.QuizSessionForm.controls['OpenedDate'].value.setHours(8, 0, 0, 0);

            const endDate = new Date(this.QuizSessionForm.controls['EndDate'].value);
            this.QuizSessionForm.controls['EndDate'].value.setHours(23, 59, 59, 0);
            this.QuizSessionForm.controls['ClosedDate'].setValue(endDate);
            this.QuizSessionForm.controls['ClosedDate'].value.setHours(22, 0, 0, 0);
            this.handleUpdateQuizSession  ([type, 'ClosedDate', 'OpenedDate'], 'Thời gian bắt đầu mở đợt đánh giá');
        } else {
            if (type === 'OpenedDate') {
                var minute = new Date(opendate).getMinutes()
                this.QuizSessionForm.controls['ClosedDate'].value.setMinutes(minute, 0, 0);
            }
            this.handleUpdateQuizSession  (['OpenedDate', 'ClosedDate'], 'Thời gian kết thức mở đợt đánh giá');
        }
    }

    ConvertStringDateToDatepicker(quiz: DTOQuizSession) {
        quiz.StartDate = new Date(quiz.StartDate);
        quiz.EndDate = new Date(quiz.EndDate);
        quiz.EndDate.setHours(23, 59, 0, 0);
        quiz.OpenedDate = new Date(quiz.OpenedDate);
        quiz.ClosedDate = new Date(quiz.ClosedDate);
        quiz.AppealDate = new Date(quiz.AppealDate);
        quiz.ReEvaluateDate = new Date(quiz.ReEvaluateDate);
        return quiz;
    }

    onChangeTypeOfQuiz(value: any): void {
        this.QuizSessionForm.controls['TypeOfSession'].setValue(value)
        if (value == 1) {
            this.QuizSessionForm.controls['AppealTime'].setValue(null)
            this.QuizSessionForm.controls['ReEvaluateTime'].setValue(null)
        } else {
            this.QuizSessionForm.controls['AppealTime'].setValue(3)
            this.QuizSessionForm.controls['ReEvaluateTime'].setValue(7)
        }
        this.handleUpdateQuizSession  (['TypeOfSession', 'ReEvaluateTime', 'AppealTime'],'Phân loại đợt đánh giá');
    }

    onChangeCalculationTypes(value: any, message: string): void {
        this.QuizSessionForm.controls['TypeOfTimeEvaluation'].setValue(value);
        if (value === 1) {
            this.isTotalTimeQuestion = true;
            this.QuizSessionForm.controls['Duration'].setValue(null);
            this.handleUpdateQuizSession  (['TypeOfTimeEvaluation', 'Duration'], message);
        } else if (value === 2) {
            this.isTotalTimeQuestion = false;
            this.handleUpdateQuizSession  (['TypeOfTimeEvaluation'], message);
        }
    }

    apiQueue: { data: any, prop: string[] }[] = [];
    runningApi: boolean = false; // trang thái đang gọi api hay không
  
    // // hàm xử lý data trước khi gọi api 
    // handleUpdateQuizSession(props: string[]) {
    //     const updateQuiz = this.QuizSessionForm.value; // lấy data từ form
    //     this.apiQueue.push({ data: updateQuiz, prop: props }); // Thêm data và trường cập nhật đó vào form  
    
    //     if (this.apiQueue.length > 0 && !this.runningApi) { // Kiểm tra xem có data nào đang chờ gọi api không
    //       this.APIUpdateQuizSession(this.apiQueue);
    //     }
    // }

    // // Hàm api 
    // APIUpdateQuizSession(apiQueue) {
    //     this.runningApi = true;
    
    //     // Kiểm tra có api nào đang chờ để gọi không
    //     const currentItem = apiQueue[0]; // Lấy param đầu tiên
    //     let newProps: string[] = []

    //         //trường hợp tạo mới      
    //     if (this.QuizSessionForm.controls['Code'].value === 0) {
    //         newProps = [...currentItem.prop,
    //             'StartDate', 'EndDate', 'ClosedDate', 'OpenedDate', 'IsAllStaff',
    //             'IsCategory', 'IsCategoryLevel', 'IsAllStaff', 'IsCompetence',
    //             'IsCurrentCompetenceLevel', 'EvaluationView', 'OrderConfig'];
    //     } 
    //     else {
    //         newProps = currentItem.prop
    //     }
          
    //     // Gọi api tuần tự - lấy param đâu tiên trong hàng chờ ra gọi api
    //     this.sessionService.UpdateQuizSession(currentItem.data, newProps).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res =>{

    //         if (Ps_UtilObjectService.hasValue(res) && res.StatusCode === 0 && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
    //             let itemFirst = res.ObjectReturn; 

    //             //trường hợp tạo mới thêm 
    //             apiQueue.forEach(s =>{
    //                 if(s.data.Code == 0){
    //                     s.data.Code = itemFirst.Code
    //                 }
    //             })

    //             // Xóa item đầu tiên khỏi hàng đợi
    //             apiQueue.shift()

    //             // gọi lại hàm nếu còn hàng chờ
    //             if(Ps_UtilObjectService.hasListValue(apiQueue)){
    //                 this.APIUpdateQuizSession(apiQueue)
    //             } 
    //             else{
    //                 //gán giá trị cập nhập lần cuối lên UI và dừng gọi api
    //                 this.sessionService.QuizSession$.next(res.ObjectReturn)
    //                 this.sessionService.setCacheQuizSession(res.ObjectReturn)
    //                 this.runningApi = false;
    //             }
    //         }
            
    //     })
    // }

    // hàm xử lý data trước khi gọi api 
    handleUpdateQuizSession(props: string[], message: string) {
        const updateQuiz = this.QuizSessionForm.value; // lấy data từ form
        // Kiểm tra có api nào đang chờ để gọi không
        let newProps: string[] = [];
            //trường hợp tạo mới      
        if (this.QuizSessionForm.controls['Code'].value === 0) {
            newProps = [...props,
                'StartDate', 'EndDate', 'ClosedDate', 'OpenedDate', 'IsAllStaff',
                'IsCategory', 'IsCategoryLevel', 'IsAllStaff', 'IsCompetence',
                'IsCurrentCompetenceLevel', 'EvaluationView', 'OrderConfig'];
        } 
        else {
            newProps = props
        }
        this.queueApiService.addApiQueue(updateQuiz, newProps, 'UpdateQuizSession', message, this.setCache.bind(this), ['StartDate'], ['EndDate', 'OpenedDate', 'ClosedDate']);

        // this.apiQueue.push({ data: updateQuiz, prop: props }); // Thêm data và trường cập nhật đó vào form  
    
        // if (this.apiQueue.length > 0 && !this.runningApi) { // Kiểm tra xem có data nào đang chờ gọi api không
        //   this.APIUpdateQuizSession(this.apiQueue);
        // }
    }

    setCache(v: DTOQuizSession){
        this.sessionService.QuizSession$.next(v)
        this.sessionService.setCacheQuizSession(v)
    }



 



    //Navigate to quiz sessions page
    openDetail(linkMenu: string) {
        this.helperService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: ModuleDataItem) => {
            //staff
            var parent = item.ListMenu.find(f => f.Code.includes('hriCompetency')
                || f.Link.includes('hr007-competency-bank'))
            //
            if (linkMenu === 'detail') {
                if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
                    var detail = parent.LstChild.find(f => f.Code.includes('hri010-evaluation-tranche')
                        || f.Link.includes('hri010-evaluation-tranche'))
                    if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
                        var detail1 = detail.LstChild.find(f => f.Code.includes('hri010-evaluation-tranche-detail')
                            || f.Link.includes('hri010-evaluation-tranche-detail'))
                        if (Ps_UtilObjectService.hasValue(detail1)) {
                            this.helperService.activeMenu(detail1)
                        }
                    }
                }
            }
        })
    }


    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}