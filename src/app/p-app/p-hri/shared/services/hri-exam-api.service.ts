import { Injectable} from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { DTOResponse, PS_CommonService } from "src/app/p-lib";
import { HriApiConfigService } from "./hri-api-config.service";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { DTOExamEssay } from "../dto/DTOExamEssay.dto";
import { DTOQuizRole } from "../dto/DTOQuizRole.dto";
import { DTOExamQuestion } from 'src/app/p-app/p-portal/shared/dto/DTOExamQuestion.dto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { skip, takeUntil } from 'rxjs/operators';
import { ExamApiService } from 'src/app/p-app/p-portal/shared/services/Exam-api.service';
import { Subject, interval, Subscription } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOExamAnswer } from 'src/app/p-app/p-portal/shared/dto/DTOExamAnswer.dto';
import { DTOExam } from 'src/app/p-app/p-portal/shared/dto/DTOExam.dto';
import { DTOQuizSession } from "../dto/DTOQuizSession.dto";
import { HriQuizSessionService } from "./hri-quiz-session.service";
import { Router } from '@angular/router';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Injectable({
        providedIn: 'root'
})
export class HriExamApiService {
        isAdd: boolean = true
        public ChangeParamExam$ = new BehaviorSubject<{QuizSession: number, Code: number, StaffID: number}>(null);
    
        keyCacheExamPortal: string = 'ExamSession'

        constructor(
                public api: PS_CommonService,
                public config: HriApiConfigService,
                public hrConfig: HriApiConfigService,
        ) { }

        //#region Competence framework

        GetListQuizEssayQuestion(filter: State, sort?:string) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListQuizEssayQuestion.method,
                                that.config.getAPIList().GetListQuizEssayQuestion.url, JSON.stringify(toDataSourceRequest(filter))
                                ).subscribe(
                                        (res: DTOResponse) => {
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }

        GetListExamEssayQuestion(filter: State) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListExamEssayQuestion.method,
                                that.config.getAPIList().GetListExamEssayQuestion.url,
                                JSON.stringify(toDataSourceRequest(filter))).subscribe(
                                        (res: DTOResponse) => {
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }
        

        UpdateExamEssayQuestion(dto: DTOExamQuestion[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateExamEssayQuestion.method,
				that.config.getAPIList().UpdateExamEssayQuestion.url,  JSON.stringify(dto)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		    });
	    }

        // UpdateExamStatus(selectedStaff: DTOQuizRole, statusID: number) {
        //     let that = this;
        //     const param = {
        //         ListDTO: [
        //             {
        //                 Code: selectedStaff.Exam,
        //                 QuizSession: selectedStaff.QuizSession,
        //                 StatusID: selectedStaff.StatusID
        //             }
        //         ],
        //         StatusID: statusID
        //     }
        //     return new Observable<DTOResponse>(obs => {
        //         that.api.connect(that.config.getAPIList().UpdateExamStatus.method,
        //             that.config.getAPIList().UpdateExamStatus.url, param).subscribe(
        //                 (res: any) => {
        //                     obs.next(res);
        //                     obs.complete();
        //                 }, errors => {
        //                     obs.error(errors);
        //                     obs.complete();
        //                 }
        //             )
        //     });
        // }

        DeleteExam(dto: DTOQuizRole) {
            let that = this;
            const param = {
                Code: dto.Exam,
                QuizSession: dto.QuizSession
            }
            return new Observable<DTOResponse>(obs => {
                that.api.connect(that.config.getAPIList().DeleteExam.method,
                    that.config.getAPIList().DeleteExam.url,  JSON.stringify(param)).subscribe(
                        (res: DTOResponse) => {
                            obs.next(res);
                            obs.complete();
                        }, errors => {
                            obs.error(errors);
                            obs.complete();
                        }
                    )
            });
        }

       // Lấy danh sách đợt đánh giá
        GetListExam(gridState: State){
                let that = this;
                return new Observable<DTOResponse>(obs =>{
                that.api.connect(that.config.getAPIList().GetListExam.method,
                        that.config.getAPIList().GetListExam.url, 
                        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
                        (res: DTOResponse) =>{
                                obs.next(res);
                                obs.complete();
                        }, errors =>{
                                obs.error(errors);
                                obs.complete();
                        }
                        )
                })
        }

        GetListExamPortal(gridState: State){
                let that = this;
                return new Observable<DTOResponse>(obs =>{
                that.api.connect(that.config.getAPIList().GetListExamPortal.method,
                        that.config.getAPIList().GetListExamPortal.url, 
                        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
                        (res: DTOResponse) =>{
                                obs.next(res);
                                obs.complete();
                        }, errors =>{
                                obs.error(errors);
                                obs.complete();
                        }
                        )
                })
        }

        GetListExamQuestion(param: {QuizSession: number, ExamID?: number, StaffID?: number}): Observable<DTOResponse> {
                let that = this;
                return new Observable<DTOResponse>(obs =>{
                that.api.connect(that.config.getAPIList().GetListExamQuestion.method,
                        that.config.getAPIList().GetListExamQuestion.url, 
                        JSON.stringify(param)).subscribe(
                        (res: DTOResponse) =>{
                                obs.next(res);
                                obs.complete();
                        }, errors =>{
                                obs.error(errors);
                                obs.complete();
                        }
                        )
                })
        }

        // 
        UpdateExamStatus(dto: DTOExam[] | DTOQuizRole[], statusID: number){
                let that = this;
                var param = {
                        "ListDTO": dto,
                        "StatusID": statusID,
                }
                return new Observable<DTOResponse>(obs =>{
                that.api.connect(that.config.getAPIList().UpdateExamStatus.method,
                        that.config.getAPIList().UpdateExamStatus.url, 
                        JSON.stringify(param)).subscribe(
                        (res: DTOResponse) =>{
                                obs.next(res);
                                obs.complete();
                        }, errors =>{
                                obs.error(errors);
                                obs.complete();
                        }
                        )
                })
        }

        updateExamResult(answer: DTOExamAnswer):  Observable<DTOResponse> {
                let that = this;
                return new Observable<DTOResponse>(obs =>{
                that.api.connect(that.config.getAPIList().UpdateExamResult.method,
                        that.config.getAPIList().UpdateExamResult.url, 
                        JSON.stringify(answer)).subscribe(
                        (res: DTOResponse) =>{
                                obs.next(res);
                                obs.complete();
                        }, errors =>{
                                obs.error(errors);
                                obs.complete();
                        }
                )
                })
        }

      

        DeleteExamResult(answer: DTOExamAnswer):  Observable<DTOResponse> {
                let that = this;
                return new Observable<DTOResponse>(obs =>{
                that.api.connect(that.config.getAPIList().DeleteExamResult.method,
                        that.config.getAPIList().DeleteExamResult.url, 
                        JSON.stringify(answer)).subscribe(
                        (res: DTOResponse) =>{
                                obs.next(res);
                                obs.complete();
                        }, errors =>{
                                obs.error(errors);
                                obs.complete();
                        }
                )
                })
        }


       
        //#endregion
}
