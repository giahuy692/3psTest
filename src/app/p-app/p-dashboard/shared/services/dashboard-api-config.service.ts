//#region [begin using]
import { Injectable } from '@angular/core';
import { ApiMethodType } from 'src/app/p-lib';
import { EnumDashboard } from 'src/app/p-lib/enum/dashboard.enum';
//#endregion [end using]

@Injectable({
	providedIn: 'root'
})
export class DashboardApiConfigService {

	constructor() { }

	//#region [begin coding]
	//#endregion [end coding]

	getAPIList() {
		return {			
			//dashboard chart
			GetDashboardIndex: {
				url: EnumDashboard.GetDashboardIndex,
				method: ApiMethodType.post,
			},
		};
	}
}