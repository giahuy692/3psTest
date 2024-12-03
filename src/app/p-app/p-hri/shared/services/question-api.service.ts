import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DTOConfig, DTOResponse, PS_CommonService } from "src/app/p-lib";
import { HriApiConfigService } from "./hri-api-config.service";
import { State, toDataSourceRequest, toDataSourceRequestString, } from "@progress/kendo-data-query";
import { DTOQuestionGroup } from "../dto/DTOQuestionGroup.dto";
import { DTOQuestion } from "../dto/DTOQuestion.dto";
import { DTOAnswer } from "../dto/DTOAnswer.dto";
import { DTOCompetence } from "../dto/DTOCompetence.dto";
import { HttpHeaders } from '@angular/common/http';

@Injectable({
        providedIn: 'root'
})
export class QuestionGroupAPIService {

        constructor(
                public api: PS_CommonService,
                public config: HriApiConfigService,
        ) { }

        //#region QUESTION GROUP
        ImportExcelQuestionCategory(data: File) {
                let that = this;
                var form: FormData = new FormData();
                form.append('file', data);
                var headers = new HttpHeaders()
                headers = headers.append('Company', DTOConfig.cache.companyid)

                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().ImportExcelQuestionCategory.method,
                                that.config.getAPIList().ImportExcelQuestionCategory.url, form, headers).subscribe(
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
        // CALL API  TO GET  LIST QUESTION GROUP TREE
        GetListQuestionGroupTree(filter: State) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListQuestionGroupTree.method,
                                that.config.getAPIList().GetListQuestionGroupTree.url,
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

        // CALL API  TO GET  LIST QUESTION GROUP
        GetListQuestionGroup(dto: DTOQuestionGroup) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListQuestionGroup.method,
                                that.config.getAPIList().GetListQuestionGroup.url,
                                JSON.stringify(dto)).subscribe(
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

        // CALL API  TO UPDATE QUESTION GROUP
        UpdateQuestionGroup(obj: DTOQuestionGroup) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().UpdateQuestionGroup.method,
                                that.config.getAPIList().UpdateQuestionGroup.url,
                                JSON.stringify(obj)).subscribe(
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

        // CALL API  TO DELETE QUESTION GROUP
        DeleteQuestionGroup(arr: DTOQuestionGroup[]) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().DeleteQuestionGroup.method,
                                that.config.getAPIList().DeleteQuestionGroup.url,
                                JSON.stringify(arr)).subscribe(
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
        //#endregion

        //#region Question
        // API GetListQuestion
        GetListQuestion(filter: State) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListQuestion.method,
                                that.config.getAPIList().GetListQuestion.url,
                                JSON.stringify(toDataSourceRequest(filter))).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }

        // CALL API  TO GET  LIST QUESTION GROUP
        GetQuestion(dto: DTOQuestion) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetQuestion.method,
                                that.config.getAPIList().GetQuestion.url,
                                JSON.stringify(dto)).subscribe(
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

        UpdateQuestion(dto: DTOQuestion, property: Array<string>) {
                let that = this;
                let param = {
                        'DTO': dto,
                        'Properties': property,
                }
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().UpdateQuestion.method,
                                that.config.getAPIList().UpdateQuestion.url,
                                JSON.stringify(param)).subscribe(
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

        UpdateQuestionStatus(dto: DTOQuestion[], statusID: number) {
                let that = this;
                let param = {
                        'ListDTO': dto,
                        'StatusID': statusID,
                }
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().UpdateQuestionStatus.method,
                                that.config.getAPIList().UpdateQuestionStatus.url,
                                JSON.stringify(param)).subscribe(
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

        DeleteQuestion(arr: DTOQuestion[]) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().DeleteQuestion.method,
                                that.config.getAPIList().DeleteQuestion.url,
                                JSON.stringify(arr)).subscribe(
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
        //#endregion

        //#region Answer
        GetListAnswer(dtoQuestion: DTOQuestion) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListAnswer.method,
                                that.config.getAPIList().GetListAnswer.url,
                                JSON.stringify(dtoQuestion)).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }
        UpdateAnswer(dtoAnswer: DTOAnswer) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().UpdateAnswer.method,
                                that.config.getAPIList().UpdateAnswer.url,
                                JSON.stringify(dtoAnswer)).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }
        DeleteAnswer(arrAnswer: DTOAnswer[]) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().DeleteAnswer.method,
                                that.config.getAPIList().DeleteAnswer.url,
                                JSON.stringify(arrAnswer)).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }

        GetListQuestionType() {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListQuestionType.method,
                                that.config.getAPIList().GetListQuestionType.url, null).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }

        GetListEvaluationType() {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListEvaluationType.method,
                                that.config.getAPIList().GetListEvaluationType.url, null).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }
        //#endregion

        //#region năng lực/ khía cạnh
        GetListQuestionCompetence(filter: State) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListQuestionCompetence.method,
                                that.config.getAPIList().GetListQuestionCompetence.url,
                                JSON.stringify(toDataSourceRequest(filter))).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }

        UpdateQuestionCompetence(dtoCompetence: DTOCompetence) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().UpdateQuestionCompetence.method,
                                that.config.getAPIList().UpdateQuestionCompetence.url,
                                JSON.stringify(dtoCompetence)).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }

        DeleteQuestionCompetence(arrCompetence: DTOCompetence[]) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().DeleteQuestionCompetence.method,
                                that.config.getAPIList().DeleteQuestionCompetence.url,
                                JSON.stringify(arrCompetence)).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }

        GetListCompetenceQuestion(filter: State, comp: number) {
                let that = this;
                var param = {
                        Filter: JSON.stringify(toDataSourceRequest(filter)),
                        Competence: comp
                }
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListCompetenceQuestion.method,
                                that.config.getAPIList().GetListCompetenceQuestion.url,
                                JSON.stringify(param)).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }

        UpdateMark(dtoAnswer: DTOAnswer) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().UpdateMark.method,
                                that.config.getAPIList().UpdateMark.url,
                                JSON.stringify(dtoAnswer)).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }
        DeleteMark(arrAnswer: DTOAnswer[]) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().DeleteMark.method,
                                that.config.getAPIList().DeleteMark.url,
                                JSON.stringify(arrAnswer)).subscribe(
                                        (res: DTOResponse) => {
                                                // console.log(res);
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                });
        }
        //#endregion

        //#region Excel
        ImportExcelQuestionBank(data: File) {
                let that = this;
                var form: FormData = new FormData();
                form.append('file', data);

                var headers = new HttpHeaders()
                headers = headers.append('Company', DTOConfig.cache.companyid)

                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().ImportExcelQuestionBank.method,
                                that.config.getAPIList().ImportExcelQuestionBank.url, form, headers).subscribe(
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
        //#endregion

}
