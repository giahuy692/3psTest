import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DTOConfig, DTOResponse, PS_CommonService, Ps_UtilObjectService } from "src/app/p-lib";
import { MarketingApiConfigService } from "./marketing-api-config.service";
import { DataSourceRequestState, DataResult, toDataSourceRequest, State } from '@progress/kendo-data-query';
import { DTOMABanner } from '../dto/DTOMABanner.dto';
import { DTOMABannerGroup } from '../dto/DTOMABannerGroup.dto';
import { DTOMAWebPage } from '../dto/DTOMAWebPage.dto';
import { DTOCFFolder, DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { HttpHeaders } from '@angular/common/http';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';
import { DTOUpdate } from "src/app/p-app/p-ecommerce/shared/dto/DTOUpdate";

@Injectable({
	providedIn: 'root'
})
export class MarBannerAPIService {

	constructor(
		public api: PS_CommonService,
		public config: MarketingApiConfigService,
		public layoutConfig: LayoutApiConfigService,
	) { }
	//Banner
	GetListBanner(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListBanner.method,
				that.config.getAPIList().GetListBanner.url, JSON.stringify(toDataSourceRequest(state)))
				.subscribe(
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
	GetBanner(id: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetBanner.method,
				that.config.getAPIList().GetBanner.url, JSON.stringify({ 'Code': id })).subscribe(
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
	UpdateBanner(item: DTOMABanner, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': item,
			'Properties': prop
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateBanner.method,
				that.config.getAPIList().UpdateBanner.url, JSON.stringify(param,
					(k, v) => Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['StartDate', 'EndDate'])))
				.subscribe(
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
	UpdateBannerStatus(item: DTOMABanner[], statusID: number) {
		let that = this;
		var param = {
			'ListDTO': item,
			'StatusID': statusID
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateBannerStatus.method,
				that.config.getAPIList().UpdateBannerStatus.url, JSON.stringify(param,
					(k, v) => Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['StartDate', 'EndDate'])))
				.subscribe(
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
	DeleteBanner(item: DTOMABanner[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteBanner.method,
				that.config.getAPIList().DeleteBanner.url, JSON.stringify(item)).subscribe(
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
	//GroupBanner
	GetListGroupBanner() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListGroupBanner.method,
				that.config.getAPIList().GetListGroupBanner.url, {}).subscribe(
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
	GetGroupBanner(id: number) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetGroupBanner.method,
				that.config.getAPIList().GetGroupBanner.url, id).subscribe(
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
	//Banner Folder
	GetBannerFolder() {
		let that = this;
		return new Observable<DTOCFFolder>(obs => {
			that.api.connect(that.config.getAPIList().GetBannerFolder.method,
				that.config.getAPIList().GetBannerFolder.url, {}).subscribe(
					(res: DTOCFFolder) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetBannerFolderDrill() {
		let that = this;
		return new Observable<DTOCFFolder>(obs => {
			that.api.connect(that.config.getAPIList().GetBannerFolderDrill.method,
				that.config.getAPIList().GetBannerFolderDrill.url, {}).subscribe(
					(res: DTOCFFolder) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetBannerFolderWithFile() {
		let that = this;
		return new Observable<DTOCFFolder>(obs => {
			that.api.connect(that.config.getAPIList().GetBannerFolderWithFile.method,
				that.config.getAPIList().GetBannerFolderWithFile.url, {}).subscribe(
					(res: DTOCFFolder) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetBannerFolderDrillWithFile() {
		let that = this;
		return new Observable<DTOCFFolder>(obs => {
			that.api.connect(that.config.getAPIList().GetBannerFolderDrillWithFile.method,
				that.config.getAPIList().GetBannerFolderDrillWithFile.url, {}).subscribe(
					(res: DTOCFFolder) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	//folder
	CreateFolder(path: string) {
		let that = this;
		return new Observable<DTOCFFolder>(obs => {
			that.api.connect(that.config.getAPIList().CreateFolder.method,
				that.config.getAPIList().CreateFolder.url, JSON.stringify(path)).subscribe(
					(res: DTOCFFolder) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	RenameFolder(folder: DTOCFFolder) {//PathFolder, FolderName
		let that = this;
		return new Observable<DTOCFFolder>(obs => {
			that.api.connect(that.config.getAPIList().RenameFolder.method,
				that.config.getAPIList().RenameFolder.url, folder).subscribe(
					(res: DTOCFFolder) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	DeleteFolder(path: string) {
		let that = this;
		return new Observable<DTOCFFolder>(obs => {
			that.api.connect(that.config.getAPIList().DeleteFolder.method,
				that.config.getAPIList().DeleteFolder.url, JSON.stringify(path)).subscribe(
					(res: DTOCFFolder) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	//File	
	UploadFile(data: any[], folderPath: string) {
		let that = this;
		var form: FormData = new FormData();

		data.forEach(f => {
			form.append('file', f);
		})

		var headers = new HttpHeaders()
		headers = headers.append('folder', folderPath)
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOCFFile>(obs => {
			that.api.connect(that.config.getAPIList().UploadFile.method,
				that.config.getAPIList().UploadFile.url, form, headers).subscribe(
					(res: DTOCFFile) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	RenameFile(file: DTOCFFile) {//PathFile, FileName
		let that = this;
		return new Observable<DTOCFFile>(obs => {
			that.api.connect(that.config.getAPIList().RenameFile.method,
				that.config.getAPIList().RenameFile.url, file).subscribe(
					(res: DTOCFFile) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	DeleteFile(path: string) {
		let that = this;
		return new Observable<DTOCFFile>(obs => {
			that.api.connect(that.config.getAPIList().DeleteFile.method,
				that.config.getAPIList().DeleteFile.url, JSON.stringify(path)).subscribe(
					(res: DTOCFFile) => {
						obs.next(res);
						obs.complete();
					}, errors => {
						obs.error(errors);
						obs.complete();
					}
				)
		});
	}
	GetTemplate(fileName: string) {
		let that = this;

		return new Observable<any>(obs => {
			that.api.connect(that.layoutConfig.getAPIList().GetTemplate.method,
				that.layoutConfig.getAPIList().GetTemplate.url, JSON.stringify(fileName)
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
	ImportExcel(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<any>(obs => {
			that.api.connect(that.layoutConfig.getAPIList().ImportExcel.method,
				that.layoutConfig.getAPIList().ImportExcel.url, form, headers).subscribe(
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
	//WebPage
	GetListWebpage() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListWebpage.method,
				that.config.getAPIList().GetListWebpage.url, {}).subscribe(
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
