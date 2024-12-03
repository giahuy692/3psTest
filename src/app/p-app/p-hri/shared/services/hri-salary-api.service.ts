import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable, Subject } from 'rxjs';
import { DTOMAPost_ObjReturn } from 'src/app/p-app/p-marketing/shared/dto/DTOMANews.dto';
import { DTOConfig, DTOResponse, PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOEmployeeSalary, DTOPayroll } from '../dto/DTOPayroll.dto';
import { HriApiConfigService } from './hri-api-config.service';

@Injectable({
  providedIn: 'root'
})
export class HriSalaryApiService {
  constructor(
		public api: PS_CommonService,
		public config: HriApiConfigService,
	) { }

  	//#region Bảng lương
	GetListPayroll(keyword: string,filter: State) {
		let that = this;

		let param = {
			"KeyWord": keyword,
			"Filter": toDataSourceRequest(filter)
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPayroll.method,
				that.config.getAPIList().GetListPayroll.url, JSON.stringify(param)).subscribe(
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


  // Các trường bắt buộc Code, Period, FromDate, ToDate
  GetPayroll(param: DTOPayroll) {
		let that = this;

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetPayroll.method,
				that.config.getAPIList().GetPayroll.url, JSON.stringify(param)).subscribe(
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

	// Các trường bắt buộc Code, Period, FromDate, ToDate
	UpdatePayrollStatus(dto: DTOPayroll[], status: number) {
		let that = this;

		let param = {
		"ListDTO":dto,
		"StatusID": status
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdatePayrollStatus.method,
				that.config.getAPIList().UpdatePayrollStatus.url, JSON.stringify(param)).subscribe(
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

  // Các trường bắt buộc Code, Period, FromDate, ToDate
  UpdatePayroll(value: DTOPayroll, properties: string[]) {
		let that = this;

		let param = {
			"DTO":  value,
			"Properties": properties
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdatePayroll.method,
				that.config.getAPIList().UpdatePayroll.url, JSON.stringify(param)).subscribe(
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

	// Các trường bắt buộc Code, Period, FromDate, ToDate
	DeletePayroll(param: DTOPayroll[]) {
		let that = this;
		let payload = {
			"ListDTO": param
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeletePayroll.method,
				that.config.getAPIList().DeletePayroll.url, JSON.stringify(payload)).subscribe(
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


	// Phiếu lương
	GetListPaycheck(keyword: string,filter: State) {
		let that = this;

		let param = {
			"KeyWord": keyword,
			"Filter": toDataSourceRequest(filter)
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPaycheck.method,
				that.config.getAPIList().GetListPaycheck.url, JSON.stringify(param)).subscribe(
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


	
	// Các trường bắt buộc Code, Employee, Period
	DeletePaycheck(param: DTOEmployeeSalary[]) {
		let that = this;

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeletePaycheck.method,
				that.config.getAPIList().DeletePaycheck.url, JSON.stringify(param)).subscribe(
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
	DeleteAllPaycheck(param: DTOPayroll) {
		let that = this;

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteAllPaycheck.method,
				that.config.getAPIList().DeleteAllPaycheck.url, JSON.stringify(param)).subscribe(
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

	// Các trường bắt buộc Code, Employee, Period
	UpdatePaycheckStatus(dto: DTOEmployeeSalary[], status: number) {
		let that = this;
		let param = {
		"ListDTO":dto,
		"StatusID": status
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdatePaycheckStatus.method,
				that.config.getAPIList().UpdatePaycheckStatus.url, JSON.stringify(param)).subscribe(
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


	ImportExcelPaycheck(data: File, payroll: DTOPayroll) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('Period', payroll.Code.toString())

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
		that.api.connect(that.config.getAPIList().ImportExcelPaycheck.method,
			that.config.getAPIList().ImportExcelPaycheck.url, form, headers).subscribe(
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

	// api Lấy chi tiết phiếu lương portal
	GetPaycheckPortal(period: number){
		let that = this;
		let parma = {
			Period : period
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetPaycheckPortal.method,
				that.config.getAPIList().GetPaycheckPortal.url, JSON.stringify(parma)).subscribe(
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

	// api Lấy danh sách kỳ lương ở portall 
	GetListPeriodPortal(){
		let that = this
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPeriodPortal.method,
				that.config.getAPIList().GetListPeriodPortal.url, JSON.stringify({})).subscribe(
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
	
	// api Lấy chi tiết phiếu lương
	GetPaycheck(item: DTOEmployeeSalary){
		let that = this;

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetPaycheck.method,
				that.config.getAPIList().GetPaycheck.url, JSON.stringify(item)).subscribe(
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
