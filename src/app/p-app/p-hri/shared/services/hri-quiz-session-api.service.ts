import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DTOConfig, DTOResponse, PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from "src/app/p-lib";
import { HriApiConfigService } from "./hri-api-config.service";
import { CompositeFilterDescriptor, State, toDataSourceRequest } from "@progress/kendo-data-query";
import { DTOQuizSession } from "../dto/DTOQuizSession.dto";
import { DTOQuizStaffRole } from "../dto/DTOQuizStaffRole.dto";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
	providedIn: 'root'
})
export class HriQuizSessionsAPIService {
	keyCacheQuiz = 'quiz';

	constructor(
		public api: PS_CommonService,
		public config: HriApiConfigService,
	) { }

	CalculateMarkQuiz(dto: { QuizSession: number }) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().CalculateMarkQuiz.method,
				that.config.getAPIList().CalculateMarkQuiz.url,
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

	//#region Lấy danh sách nhân sự cho đợt đánh giá
	GetListQuizEmployee(filter: State, quizsession: number) {
		let that = this;
		var dto = { Filter: toDataSourceRequest(filter), QuizSession: quizsession }
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListQuizEmployee.method,
				that.config.getAPIList().GetListQuizEmployee.url,
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
	//#endregion

	//#region QUIZ SESSION
	ImportExcelSession(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('QuizSession', data); // Code Quizsession import
		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelSession.method,
				that.config.getAPIList().ImportExcelSession.url, form, headers).subscribe(
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

	// CALL API  TO GET  LIST QUIZ SESSION
	GetListQuizSession(filter: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListQuizSession.method,
				that.config.getAPIList().GetListQuizSession.url,
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

	GetListQuizDepartment(Code: number) {
		let that = this;
		const param = {
			Code
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListQuizDepartment.method,
				that.config.getAPIList().GetListQuizDepartment.url,
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

	GetListQuizRole(filter: State) {
		let that = this
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListQuizRole.method,
				that.config.getAPIList().GetListQuizRole.url,
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

	GetQuizSession(id: number) {
		let that = this
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetQuizSession.method,
				that.config.getAPIList().GetQuizSession.url,
				JSON.stringify({ Code: id })).subscribe(
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

	GenerateQuizRole(genegate) {
		let that = this
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GenerateQuizRole.method,
				that.config.getAPIList().GenerateQuizRole.url,
				JSON.stringify(genegate)).subscribe(
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

	UpdateQuizSession(data: DTOQuizSession, props: string[]) {
		let that = this;
		const updatedInfo = {
			DTO: data,
			Properties: props
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateQuizSession.method,
				that.config.getAPIList().UpdateQuizSession.url,
				JSON.stringify(updatedInfo, (k, v) => Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['StartDate'], ['EndDate', 'OpenedDate', 'ClosedDate']))).subscribe(
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

	UpdateQuizSessionStatus(dto: DTOQuizSession[], statusID: number) {
		let that = this;
		let param = { 'ListDTO': dto, 'StatusID': statusID }
		return new Observable<DTOQuizSession>(obs => {
			that.api.connect(that.config.getAPIList().UpdateQuizSessionStatus.method,
				that.config.getAPIList().UpdateQuizSessionStatus.url,
				JSON.stringify(param)).subscribe((res: DTOQuizSession) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				}
				)
		});
	}

	DeleteQuizSession(dto: DTOQuizSession[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteQuizSession.method,
				that.config.getAPIList().DeleteQuizSession.url,
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

	UpdateQuizRole(dto) {
		let that = this;

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateQuizRole.method,
				that.config.getAPIList().UpdateQuizRole.url,
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

	DeleteQuizRole(dto) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteQuizRole.method,
				that.config.getAPIList().DeleteQuizRole.url,
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
	//#endregion

	//#region CONFIG QUIZ SESSION 
	GetListQuizConfig(quiz: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListQuizConfig.method,
				that.config.getAPIList().GetListQuizConfig.url,
				JSON.stringify({ 'QuizSession': quiz })).subscribe(
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

	GetListPositionQuiz(filter: State) {
		let that = this
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPositionQuiz.method,
				that.config.getAPIList().GetListPositionQuiz.url,
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

	GetListQuizConfigCompetence(dto: { QuizSession: number, Category: null }) {
		let that = this
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListQuizConfigCompetence.method,
				that.config.getAPIList().GetListQuizConfigCompetence.url,
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

	GetListQuizConfigCategory(dto: { QuizSession: number, Competence: null }) {
		let that = this
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListQuizConfigCategory.method,
				that.config.getAPIList().GetListQuizConfigCategory.url,
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

	UpdateQuizConfig(dto) {
		let that = this;

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateQuizConfig.method,
				that.config.getAPIList().UpdateQuizConfig.url,
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

	UpdateListQuizConfig(arr) {
		let that = this;

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateListQuizConfig.method,
				that.config.getAPIList().UpdateListQuizConfig.url,
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

	DeleteQuizConfig(dto) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteQuizConfig.method,
				that.config.getAPIList().DeleteQuizConfig.url,
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
	//#endregion

	//#region Quiz Report


	GetQuizExamineeReport(filter: State) {
		let that = this
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetQuizExamineeReport.method,
				that.config.getAPIList().GetQuizExamineeReport.url,
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

	GetQuizQuestionReport(filter: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetQuizQuestionReport.method,
				that.config.getAPIList().GetQuizQuestionReport.url,
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

	GetQuizWrongQuestionReport(filter: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetQuizWrongQuestionReport.method,
				that.config.getAPIList().GetQuizWrongQuestionReport.url,
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

	ExportExamDetailResultReport(code: number) {
		let that = this;
		let Object = {
			Code: code
		}
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ExportExamDetailResultReport.method,
				that.config.getAPIList().ExportExamDetailResultReport.url, JSON.stringify(Object)
				, null, null, 'response', 'blob'
			).subscribe(
				(res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				}
			)
		});
	}
	
	ExportQuestionAnalsisReport(filter: State) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ExportQuestionAnalsisReport.method,
				that.config.getAPIList().ExportQuestionAnalsisReport.url, JSON.stringify(toDataSourceRequest(filter))
				, null, null, 'response', 'blob'
			).subscribe(
				(res: any) => {
					obs.next(res);
					obs.complete();
				}, errors => {
					obs.error(errors);
					obs.complete();
				}
			)
		});
	}

	ExportWrongQuestionReport(filter: State) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ExportWrongQuestionReport.method,
				that.config.getAPIList().ExportWrongQuestionReport.url, JSON.stringify(toDataSourceRequest(filter))
				, null, null, 'response', 'blob'
			).subscribe(
				(res: any) => {
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
