import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DTOConfig, DTOResponse, PS_CommonService } from "src/app/p-lib";
import { HriApiConfigService } from "./hri-api-config.service";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { DTOHRCompetenceGuide } from "../dto/DTOHRCompetenceGuide.dto";
import { DTOHRCompetenceCategory } from "../dto/DTOHRCompetenceCategory.dto";
import { DTOHRCompetenceBank } from "../dto/DTOHRCompetenceBank.dto";
import { DTOHRCompetenceSector } from "../dto/DTOHRCompetenceSector.dto";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
	providedIn: 'root'
})
export class HRCompetenceAPIService {
	constructor(
		public api: PS_CommonService,
		public config: HriApiConfigService,
	) { }
	//#region Mức trưởng thành
	GetListCompetenceGuide(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListCompetenceGuide.method,
				that.config.getAPIList().GetListCompetenceGuide.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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

	UpdateCompetenceGuide(dto: DTOHRCompetenceGuide) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCompetenceGuide.method,
				that.config.getAPIList().UpdateCompetenceGuide.url, JSON.stringify(dto)).subscribe(
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
	//#region Phân nhóm năng lực
	GetListCompetenceCategory(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListCompetenceCategory.method,
				that.config.getAPIList().GetListCompetenceCategory.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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

	UpdateCompetenceCategory(dto: DTOHRCompetenceCategory) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCompetenceCategory.method,
				that.config.getAPIList().UpdateCompetenceCategory.url, JSON.stringify(dto)).subscribe(
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

	UpdateCompetenceCategoryStatus(dto: DTOHRCompetenceCategory[], statusID: number) {
		let that = this;
		var param = {
			ListDTO: dto,
			StatusID: statusID
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCompetenceCategoryStatus.method,
				that.config.getAPIList().UpdateCompetenceCategoryStatus.url, JSON.stringify(param)).subscribe(
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

	DeleteCompetenceCategory(dto: DTOHRCompetenceCategory[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteCompetenceCategory.method,
				that.config.getAPIList().DeleteCompetenceCategory.url, JSON.stringify(dto)).subscribe(
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

	//#region Khía cạnh, năng lực
	GetListCompetenceBank(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListCompetenceBank.method,
				that.config.getAPIList().GetListCompetenceBank.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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

	UpdateCompetenceBank(dto: DTOHRCompetenceBank) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCompetenceBank.method,
				that.config.getAPIList().UpdateCompetenceBank.url, JSON.stringify(dto)).subscribe(
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

	UpdateCompetenceBankStatus(dto: DTOHRCompetenceBank[], statusID: number) {
		let that = this;

		var param = {
			ListDTO: dto,
			StatusID: statusID
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCompetenceBankStatus.method,
				that.config.getAPIList().UpdateCompetenceBankStatus.url, JSON.stringify(param)).subscribe(
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

	DeleteCompetenceBank(dto: DTOHRCompetenceBank[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteCompetenceBank.method,
				that.config.getAPIList().DeleteCompetenceBank.url, JSON.stringify(dto)).subscribe(
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

	//#region Khía cạnh, năng lực
	GetListCompetenceSector(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListCompetenceSector.method,
				that.config.getAPIList().GetListCompetenceSector.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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

	UpdateCompetenceSector(dto: DTOHRCompetenceSector) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCompetenceSector.method,
				that.config.getAPIList().UpdateCompetenceSector.url, JSON.stringify(dto)).subscribe(
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

	//#region Câu hỏi của Mức khía cạnh
	GetListSectorQuestion(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListSectorQuestion.method,
				that.config.getAPIList().GetListSectorQuestion.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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
	ImportExcelCompetenceCategory(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelCompetenceCategory.method,
				that.config.getAPIList().ImportExcelCompetenceCategory.url, form, headers).subscribe(
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
}
