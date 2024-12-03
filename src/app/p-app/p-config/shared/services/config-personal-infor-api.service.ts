import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOPersonalCertificate, DTOPersonalInfo, DTOPersonalContact, DTOPersonalAddress } from 'src/app/p-app/p-hri/shared/dto/DTOPersonalInfo.dto';
import { DTOResponse, PS_CommonService, Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigApiConfigService } from './config-api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigPersonalInforApiService {
  constructor(public api: PS_CommonService,
    public config: ConfigApiConfigService
  ) { }

  //#region PersonalInfoDetail

  /**
   * API Get Personal Profile
   * @param dto DTO to get
   * @returns 
   */
  GetHRPersonalProfile(dto: DTOPersonalInfo) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetHRPersonalProfile.method,
      that.config.getAPIList().GetHRPersonalProfile.url,
        JSON.stringify(dto)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }

/**
   * API Update Personal Certificate
   * @param dto DTO to Update
   * @param prop Properties
   * @returns 
   */
  UpdateHRPersonalCertificate(dto: DTOPersonalCertificate, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: { ...dto },
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateHRPersonalCertificate.method,
      that.config.getAPIList().UpdateHRPersonalCertificate.url,
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

/**
   * API Update Personal Profile
   * @param dto DTO to update
   * @param prop Properties
   * @returns 
   */
  UpdateHRPersonalProfile(dto: DTOPersonalInfo, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: { ...dto },
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateHRPersonalProfile.method,
      that.config.getAPIList().UpdateHRPersonalProfile.url,
        JSON.stringify(param, (k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['PITEffDate']) })).subscribe(
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

/**
   * API Update Personal Contact
   * @param dto DTO to update
   * @param prop Properties
   * @returns 
   */
  UpdateHRPersonalContact(dto: DTOPersonalContact, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: { ...dto },
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateHRPersonalContact.method,
      that.config.getAPIList().UpdateHRPersonalContact.url,
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

/**
   * API Update Personal Address
   * @param dto DTO to update
   * @param prop Properties
   * @returns 
   */
  UpdateHRPersonalAddress(dto: DTOPersonalAddress, prop: string[]) {
    let that = this;
    var param: DTOUpdate = {
      DTO: { ...dto },
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateHRPersonalAddress.method,
      that.config.getAPIList().UpdateHRPersonalAddress.url,
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

  //#region LIST PERSONAL INFO
  /**
 * Hàm dùng để get danh sách personal info
 * @param filter Kendo filter
 * @returns
 */
  GetListHRPersonalProfile(filter: State) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRPersonalProfile.method,
          that.config.getAPIList().GetListHRPersonalProfile.url,
          JSON.stringify(toDataSourceRequest(filter))
        )
        .subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          },
          (errors) => {
            obs.error(errors);
            obs.complete();
          }
        );
    });
  }
  //#endregion

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


}
