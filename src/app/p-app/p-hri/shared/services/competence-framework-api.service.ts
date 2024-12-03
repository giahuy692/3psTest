import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DTOConfig, DTOResponse, PS_CommonService, Ps_UtilObjectService } from "src/app/p-lib";
import { HriApiConfigService } from "./hri-api-config.service";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { DTOCompetenceFramework } from "../dto/DTOCompetenceFramework.dto";
import { DTOCompetenceFrameworkDetail } from "../dto/DTOCompetenceFrameworkDetail.dto";
import { HttpHeaders } from '@angular/common/http';

@Injectable({
        providedIn: 'root'
})
export class CompetenceFrameworkApiService {

        constructor(
                public api: PS_CommonService,
                public config: HriApiConfigService,
        ) { }

        //#region Competence framework
        GetCompetenceFramework(dto:DTOCompetenceFramework){
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetCompetenceFramework.method,
                                that.config.getAPIList().GetCompetenceFramework.url,dto).subscribe(
                                        (res: any) => {
                                                obs.next(res);
                                                obs.complete();
                                        }, errors => {
                                                obs.error(errors);
                                                obs.complete();
                                        }
                                )
                })
        }


        GetListCompetenceFramework(filter: State) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListCompetenceFramework.method,
                                that.config.getAPIList().GetListCompetenceFramework.url,
                                JSON.stringify(toDataSourceRequest(filter))).subscribe(
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

        
        UpdateCompetenceFramework(dto: DTOCompetenceFramework,  property: Array<string>) {
		let that = this;
                let param = {
                        'DTO': dto,
                        'Properties':property,
                }
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCompetenceFramework.method,
				that.config.getAPIList().UpdateCompetenceFramework.url,
				JSON.stringify(param,(k, v) => Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['EffDate']))).subscribe(
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

        UpdateStatusCompetenceFramework(dto: DTOCompetenceFramework[], statusID: number) {
		let that = this;
                let param = {
                        'ListDTO': dto,
                        'StatusID':statusID,
                }
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateStatusCompetenceFramework.method,
				that.config.getAPIList().UpdateStatusCompetenceFramework.url,
				JSON.stringify(param)).subscribe(
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

        DeleteCompetenceFramework(arrCompetenceFramework: DTOCompetenceFramework[]){
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().DeleteCompetenceFramework.method,
                                that.config.getAPIList().DeleteCompetenceFramework.url,
                                JSON.stringify(arrCompetenceFramework)).subscribe(
                                        (res: any) => {
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
       
        GetListCompetenceFrameworkDetails(dto: DTOCompetenceFramework) {
                let that = this;
                return new Observable<DTOResponse>(obs => {
                        that.api.connect(that.config.getAPIList().GetListCompetenceFrameworkDetails.method,
                                that.config.getAPIList().GetListCompetenceFrameworkDetails.url,dto).subscribe(
                                        (res: any) => {
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

        UpdateCompetenceFrameworkDetails(Framework: number,dto: DTOCompetenceFrameworkDetail[], Properties: string[]) {
		let that = this;
                let param = {
                        'Framework': Framework,
                        'ListDTO': dto,
                        'Properties':Properties,
                }
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateCompetenceFrameworkDetails.method,
				that.config.getAPIList().UpdateCompetenceFrameworkDetails.url,
				JSON.stringify(param)).subscribe(
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

        GetListFrameworkPosition(state: State){
                let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListFrameworkPosition.method,
				that.config.getAPIList().GetListFrameworkPosition.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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

        GetListFrameworkCompetence(state: State){
                let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListFrameworkCompetence.method,
				that.config.getAPIList().GetListFrameworkCompetence.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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

        DeleteCompetenceFrameworkDetails(dto: DTOCompetenceFrameworkDetail){
                let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteCompetenceFrameworkDetails.method,
				that.config.getAPIList().DeleteCompetenceFrameworkDetails.url,
				JSON.stringify(dto)).subscribe(
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

	//#region import data
	ImportExcelFramework(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelFramework.method,
				that.config.getAPIList().ImportExcelFramework.url, form, headers).subscribe(
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
	ImportExcelFrameworkDetail(data: File, Framework: DTOCompetenceFramework) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('Framework', Framework.Code.toString());

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelFrameworkDetail.method,
				that.config.getAPIList().ImportExcelFrameworkDetail.url, form, headers).subscribe(
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
