import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService } from "src/app/p-lib";
import { HriApiConfigService } from "./hri-api-config.service";
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { WorkdayMonth } from '../dto/workdaymonth';
import { WDStandard } from '../dto/wdstandard';
import { Salary } from '../dto/salary';
import { CnBSalary } from '../dto/cnbsalary';
import { Allowance } from '../dto/allowance';
import { Exception } from '../dto/exception';
import { Period } from '../dto/period';
import { Payslip } from '../dto/payslip';
import { DTOEmployee } from "../dto/DTOEmployee.dto";

@Injectable({
	providedIn: 'root'
})
export class PayslipAPIService {

	constructor(
		public api: PS_CommonService,
		public config: HriApiConfigService,
	) { }
	//ThongTinNhanSu
	GetEmployee(employeeCode: number) {		
		let that = this;
		return new Observable<DTOEmployee>(obs => {
			that.api.connect(that.config.getAPIList().GetEmployee.method,
				that.config.getAPIList().GetEmployee.url, JSON.stringify(employeeCode.toString())).subscribe(
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
	GetCurrentEmployee() {
		let that = this;
		return new Observable<DTOEmployee>(obs => {
			let params = new HttpParams();

			that.api.connect(that.config.getAPIList().GetCurrentEmployee.method,
				that.config.getAPIList().GetCurrentEmployee.url, params).subscribe(
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
	//NgayCong
	GetWDStandard(periodCode: number) {
		let that = this;
		return new Observable<WDStandard>(obs => {
			that.api.connect(that.config.getAPIList().GetWDStandard.method,
				that.config.getAPIList().GetWDStandard.url, JSON.stringify(periodCode.toString())).subscribe(
					(res: WDStandard) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}	
	GetWorkdayMonth(periodCode: number) {
		let that = this;
		return new Observable<Array<WorkdayMonth>>(obs => {
			that.api.connect(that.config.getAPIList().GetWorkdayMonth.method,
				that.config.getAPIList().GetWorkdayMonth.url, JSON.stringify(periodCode.toString())).subscribe(
					(res: Array<WorkdayMonth>) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}	
	GetPeriod() {
		let that = this;
		return new Observable<Array<Period>>(obs => {
			let params = new HttpParams();

			that.api.connect(that.config.getAPIList().GetPeriod.method,
				that.config.getAPIList().GetPeriod.url, params).subscribe(
					(res: Array<Period>) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}	
	//Luong
	GetPayslipList() {
		let that = this;
		return new Observable<Array<Payslip>>(obs => {
			let params = new HttpParams();

			that.api.connect(that.config.getAPIList().GetPayslipList.method,
				that.config.getAPIList().GetPayslipList.url, params).subscribe(
					(res: Array<Payslip>) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetPayslipListByPeriod(period: number) {
		let that = this;
		return new Observable<Array<Payslip>>(obs => {
			that.api.connect(that.config.getAPIList().GetPayslipListByPeriod.method,
				that.config.getAPIList().GetPayslipListByPeriod.url, period).subscribe(
					(res: Array<Payslip>) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetCnBSalary(periodCode: number) {
		let that = this;
		return new Observable<CnBSalary>(obs => {
			that.api.connect(that.config.getAPIList().GetCnBSalary.method,
				that.config.getAPIList().GetCnBSalary.url, JSON.stringify(periodCode.toString())).subscribe(
					(res: CnBSalary) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetSalary(periodCode: number) {
		let that = this;
		return new Observable<Salary>(obs => {
			that.api.connect(that.config.getAPIList().GetSalary.method,
				that.config.getAPIList().GetSalary.url, JSON.stringify(periodCode.toString())).subscribe(
					(res: Salary) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetAllowance(periodCode: number) {
		let that = this;
		return new Observable<Array<Allowance>>(obs => {
			that.api.connect(that.config.getAPIList().GetAllowance.method,
				that.config.getAPIList().GetAllowance.url, JSON.stringify(periodCode.toString())).subscribe(
					(res: Array<Allowance>) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetException(periodCode: number) {
		let that = this;
		return new Observable<Array<Exception>>(obs => {
			that.api.connect(that.config.getAPIList().GetException.method,
				that.config.getAPIList().GetException.url, JSON.stringify(periodCode.toString())).subscribe(
					(res: Array<Exception>) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	//upload
	UploadExcel(file: any) {
		let that = this;
		const formdata: FormData = new FormData();
		formdata.append('file', file);
		var header = new HttpHeaders();

		return new Observable<Array<any>>(obs => {
			that.api.connect(that.config.getAPIList().UploadExcel.method,
				that.config.getAPIList().UploadExcel.url, formdata, header).subscribe(
					(res: any[]) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetExcelTemplate() {
		let that = this;
		return new Observable<any>(obs => {
			let params = new HttpParams();
			
			let headers = new HttpHeaders();			
			headers = headers.append('Accept', 'application/octet-stream');
			headers = headers.append('Content-Type', 'application/octet-stream');			

			that.api.connect(that.config.getAPIList().GetExcelTemplate.method,
				that.config.getAPIList().GetExcelTemplate.url, params, headers, null, 'response', 'blob').subscribe(					
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
}
