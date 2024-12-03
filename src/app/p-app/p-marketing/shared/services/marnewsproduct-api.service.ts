import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, Ps_UtilObjectService, DTOResponse } from "src/app/p-lib";
import { MarketingApiConfigService } from "./marketing-api-config.service";
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import DTOWebContent from '../dto/DTOWebContent.dto';
import { DTOCFFolder } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';

@Injectable({
  providedIn: 'root'
})
export class MarNewsProductAPIService {

  constructor(
    public api: PS_CommonService,
    public config: MarketingApiConfigService,
    public layoutConfig: LayoutApiConfigService,
  ) { }

  GetListWebContent(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListWebContent.method,
        that.config.getAPIList().GetListWebContent.url, JSON.stringify(toDataSourceRequest(gridState))).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetWebContent(code: number) {
    let that = this;
    var param = { Code: code }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetWebContent.method,
        that.config.getAPIList().GetWebContent.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetWebContentByCode(barcode: string) {
    let that = this;
    var param = { Barcode: barcode }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetWebContentByCode.method,
        that.config.getAPIList().GetWebContentByCode.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  //update
  UpdateWebContent(updateDTO: DTOUpdate) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateWebContent.method,
        that.config.getAPIList().UpdateWebContent.url, JSON.stringify(updateDTO,
          (k, v) => Ps_UtilObjectService.parseDateToString(k, v,
            ['WebContentCreated', 'WebContentSent', 'WebContentApproved', 'WebContentStoped'])))
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  UpdateWebContentStatus(updateDTO: DTOWebContent, statusID: number) {
    let that = this;
    let param = {
      "DTO": updateDTO,
      "StatusID": statusID
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateWebContentStatus.method,
        that.config.getAPIList().UpdateWebContentStatus.url, JSON.stringify(param,
          (k, v) => Ps_UtilObjectService.parseDateToString(k, v,
            ['WebContentCreated', 'WebContentSent', 'WebContentApproved', 'WebContentStoped'])))
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  DeleteWebContent(code: number) {
    let that = this;
    var param = { Code: code }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteWebContent.method,
        that.config.getAPIList().DeleteWebContent.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }

  GetNewsFolderDrillWithFile(childPath?: string) {
    let that = this;
    let param = {
      'ID': 8,
      'Folder': childPath
    }
    return new Observable<DTOCFFolder>(obs => {
      that.api.connect(that.config.getAPIList().GetNewsFolderDrillWithFile.method,
        that.config.getAPIList().GetNewsFolderDrillWithFile.url, JSON.stringify(param)).subscribe(
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
  GetFolderWithFile(childPath: string = '', id: number) {
    let that = this;
    //nếu có id > 0 thì get folder root, nếu có path thì get folder con
    let param = {
      'ID': Ps_UtilObjectService.hasValueString(childPath) ? 0 : id,//news = 8
      'Folder': childPath
    }
    return new Observable<DTOCFFolder>(obs => {
      that.api.connect(that.config.getAPIList().GetFolderWithFile.method,
        that.config.getAPIList().GetFolderWithFile.url, JSON.stringify(param)).subscribe(
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
  CropProductImage() {
		let that = this;
		return new Observable<DTOCFFolder>(obs => {
			that.api.connect(that.config.getAPIList().CropProductImage.method,
				that.config.getAPIList().CropProductImage.url, {}).subscribe(
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