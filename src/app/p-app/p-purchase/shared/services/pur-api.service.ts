import { Injectable } from "@angular/core";
import { PS_CommonService } from "src/app/p-lib";
import { PurApiConfigService } from './pur-api-config.service';
import { Observable } from 'rxjs';
import { DTOExportReport } from '../dto/DTOPurReport';

@Injectable({
	providedIn: 'root'
})
export class PurAPIService {

	constructor(
		public api: PS_CommonService,
		public config: PurApiConfigService,
	) { }

	GetReports(functionID: number) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetReports.method,
				that.config.getAPIList().GetReports.url, JSON.stringify({FunctionID: functionID})).subscribe(
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
	ExportReport(dto: DTOExportReport) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ExportReport.method,
				that.config.getAPIList().ExportReport.url, JSON.stringify(dto)
				, null, null, 'response', 'blob').subscribe(
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
