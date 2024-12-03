import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import { DTOConfig, DTOResponse, PS_CommonService, Ps_UtilObjectService } from 'src/app/p-lib';
import { HriApiConfigService } from './hri-api-config.service';
import { DTOEmployee, DTOEmployeeDetail } from '../dto/DTOEmployee.dto';
import { Ps_UtilCacheService } from 'src/app/p-lib';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { DTOPositionRole } from '../dto/DTOPositionRole.dto';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOPersonalAddress, DTOPersonalCertificate, DTOPersonalContact, DTOPersonalInfo } from '../dto/DTOPersonalInfo.dto';
import { DTOCFFolder } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarketingApiConfigService } from 'src/app/p-app/p-marketing/shared/services/marketing-api-config.service';
import { HttpHeaders } from '@angular/common/http';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';
@Injectable({
  providedIn: 'root'
})
export class StaffApiService {

  isAdd: boolean = true
  isLockAll: boolean = false

  constructor(
    public api: PS_CommonService,
    public config: HriApiConfigService,
    public cacheService: Ps_UtilCacheService,
    public configMar:MarketingApiConfigService,
    public layoutConfig: LayoutApiConfigService,

  ) { }


  //lấy danh sách nhân sự
  GetListEmployee(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListEmployee.method,
        that.config.getAPIList().GetListEmployee.url,
        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
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

  

  // UpdateStatusEmployee
  UpdateEmployeeStatus(dto: DTOEmployee[], statusID: number, statusName: string) {
    let that = this;
    var param = {
      "ListDTO": dto,
      "StatusID": statusID,
      "StatusName": statusName
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateEmployeeStatus.method,
        that.config.getAPIList().UpdateEmployeeStatus.url,
        JSON.stringify(param)).subscribe(
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

  //Update Status employee Info
  UpdateEmployeeInfoStatus(dto: DTOEmployeeDetail[], statusID: number,statusName: string) {
    let that = this;
    var param = {
      "ListDTO": dto.map(item => ({ ...item, ListOfRoles: null })),
      "StatusID": statusID,
      "StatusName":statusName
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateEmployeeStatus.method,
        that.config.getAPIList().UpdateEmployeeStatus.url,
        JSON.stringify(param)).subscribe(
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


  // Lấy employee detail
  GetEmployeeInfo(Code: number) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetEmployeeInfo.method,
        that.config.getAPIList().GetEmployeeInfo.url,
        JSON.stringify({ 'Code': Code })).subscribe(
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

  //Thêm role cho employee
  AddEmployeeRole(obj: DTOPositionRole) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().AddEmployeeRole.method,
      that.config.getAPIList().AddEmployeeRole.url,
        JSON.stringify(obj)).subscribe(
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

  //Update employee 
  UpdateEmployeeInfo(item: DTOEmployeeDetail, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: { ...item, ListOfRoles: null },
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateEmployeeInfo.method,
      that.config.getAPIList().UpdateEmployeeInfo.url,
        JSON.stringify(param, (k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['JoinDate']) })).subscribe(
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

  //Delete EmployeeRole
  DeleteEmployeeRole(Code: number) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteEmployeeRole.method,
      that.config.getAPIList().DeleteEmployeeRole.url,
        JSON.stringify({ 'Code': Code })).subscribe(
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


  // Thong Tin Ca Nhan
  GetPersonalInfo(Code: number) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPersonalInfo.method,
        that.config.getAPIList().GetPersonalInfo.url,
        JSON.stringify({ 'Code': Code })).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }

  GetPersonalCertificate(Code: number) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPersonalCertificate.method,
        that.config.getAPIList().GetPersonalCertificate.url,
        JSON.stringify({ 'Code': Code })).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetPersonalContact(ProfileID: number) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPersonalContact.method,
        that.config.getAPIList().GetPersonalContact.url,
        JSON.stringify({ 'ProfileID': ProfileID })).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetPersonalAddress(ProfileID: number) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPersonalAddress.method,
        that.config.getAPIList().GetPersonalAddress.url,
        JSON.stringify({ 'ProfileID': ProfileID })).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  // Lấy danh sách role từ position role,...
  GetListRole() {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect
        (that.config.getAPIList().GetListRole.method,
          that.config.getAPIList().GetListRole.url,
          {}).subscribe(
            (res: any) => {
              obs.next(res);
              obs.complete();
            }, errors => {
              obs.error(errors);
              obs.complete();
            })
    });
  }

  UpdatePersonalCertificate(dto: DTOPersonalCertificate, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: { ...dto },
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePersonalCertificate.method,
        that.config.getAPIList().UpdatePersonalCertificate.url,
        JSON.stringify(param, (k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['EffDate', 'ExpDate']) })).subscribe(
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
  UpdatePersonalInfo(dto: DTOPersonalInfo, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: { ...dto },
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePersonalInfo.method,
      that.config.getAPIList().UpdatePersonalInfo.url,
      JSON.stringify(param,(k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['PITEffDate']) })).subscribe(
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
  UpdatePersonalContact(dto: DTOPersonalContact, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: { ...dto },
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePersonalContact.method,
        that.config.getAPIList().UpdatePersonalContact.url,
        JSON.stringify(param, (k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['EffDate', 'ExpDate']) })).subscribe(
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
  UpdatePersonalAddress(dto: DTOPersonalAddress, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: { ...dto },
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePersonalAddress.method,
        that.config.getAPIList().UpdatePersonalAddress.url,
        JSON.stringify(param, (k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['EffDate', 'ExpDate']) })).subscribe(
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
  GetListCountry() {
    let that = this; 
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListCountry.method,
        that.config.getAPIList().GetListCountry.url,
        JSON.stringify(toDataSourceRequest({}))).subscribe(
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
  GetListProvince(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListProvince.method,
        that.config.getAPIList().GetListProvince.url,
        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
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
  GetListDistrict(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListDistrict.method,
        that.config.getAPIList().GetListDistrict.url,
        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
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
  GetListWard(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListWard.method,
        that.config.getAPIList().GetListWard.url,
        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
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
  // Lấy danh sách HR status
  GetListHR(typeData: number) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListHR.method,
        that.config.getAPIList().GetListHR.url,
        JSON.stringify({ "TypeData": typeData })).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  //get template 
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
  // importExcel
  ImportExcel(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelEmployee.method,
				that.config.getAPIList().ImportExcelEmployee.url, form, headers).subscribe(
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
