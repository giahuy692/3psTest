import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, DTOResponse } from "src/app/p-lib";
import { DTODashboard } from "../dto/DTODashboard";
import { DashboardApiConfigService } from "./dashboard-api-config.service";

@Injectable({
	providedIn: 'root'
})
export class DashboardAPIService {

	constructor(
		public api: PS_CommonService,
		public config: DashboardApiConfigService,
	) { }
	//DASHBOARD CHART	
	GetDashboardIndex(chart: DTODashboard) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetDashboardIndex.method,
				that.config.getAPIList().GetDashboardIndex.url, JSON.stringify(chart)).subscribe(
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
