import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, Ps_UtilObjectService, DTOResponse, DTOConfig } from "src/app/p-lib";
import { MarketingApiConfigService } from "./marketing-api-config.service";
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';
import { DTOUpdate, DTOUpdateListStatus } from "src/app/p-app/p-ecommerce/shared/dto/DTOUpdate";
import DTOCouponPolicy, { DTOCounponRounting, DTOCoupon, DTOCouponMembership, DTOCouponProduct, DTOCouponWarehouse, DTODetailCouponPolicy } from "../dto/DTOCouponPolicy.dto";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MarCouponPolicyAPIService {

  constructor(
    public api: PS_CommonService,
    public config: MarketingApiConfigService,
    public layoutConfig: LayoutApiConfigService,
  ) { }

  GetListCouponIssued(gridState: State, donviCode?: number) {
    let that = this;
    var param = {
      WHCode: donviCode,
      Filter: toDataSourceRequest(gridState)
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListCouponIssued.method,
        that.config.getAPIList().GetListCouponIssued.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetCouponIssuedByCode(code: number) {
    let that = this;
    var param = { Code: code }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetCouponIssuedByCode.method,
        that.config.getAPIList().GetCouponIssuedByCode.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetCouponIssuedWareHouse(couponPolicy: number) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetCouponIssuedWareHouse.method,
        that.config.getAPIList().GetCouponIssuedWareHouse.url, JSON.stringify({ "CouponIssued": couponPolicy })).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetListCouponIssuedMembership(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListCouponIssuedMembership.method,
        that.config.getAPIList().GetListCouponIssuedMembership.url,
        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetCouponIssuedMembership(code: number) {
    let that = this;
    var param = { Code: code }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetCouponIssuedMembership.method,
        that.config.getAPIList().GetCouponIssuedMembership.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetMembershipByPhone(phone: string) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetMembershipByPhone.method,
        that.config.getAPIList().GetMembershipByPhone.url, JSON.stringify(phone)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetListCouponIssuedProduct(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListCouponIssuedProduct.method,
        that.config.getAPIList().GetListCouponIssuedProduct.url,
        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetCouponIssuedProduct(item: DTOCouponProduct) {
    let that = this;

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetCouponIssuedProduct.method,
        that.config.getAPIList().GetCouponIssuedProduct.url, JSON.stringify(item)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }

  GetListCoupon(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListCoupon.method,
        that.config.getAPIList().GetListCoupon.url,
        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
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
  UpdateCouponIssued(updateDTO: DTOUpdate) {
    let that = this;

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateCouponIssued.method,
        that.config.getAPIList().UpdateCouponIssued.url, JSON.stringify(updateDTO,
          (key, value) => {
            return Ps_UtilObjectService.parseLocalDateTimeToString(key, value,
              ['StartDate', 'EndDate'], ['SMSSendDate', 'AppSendDate'])
          }
        )).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  UpdateCouponIssuedStatus(list: DTODetailCouponPolicy[] | DTOCouponPolicy[], statusID: number) {
    let that = this;

    var param: DTOUpdateListStatus = {
      ListDTO: list,
      StatusID: statusID
    }

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateCouponIssuedStatus.method,
        that.config.getAPIList().UpdateCouponIssuedStatus.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  UpdateCouponStatus(list: DTOCoupon[], statusID: number) {
    let that = this;

    var param: DTOUpdateListStatus = {
      ListDTO: list,
      StatusID: statusID
    }

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateCouponStatus.method,
        that.config.getAPIList().UpdateCouponStatus.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }

  UpdateCouponIssuedWH(updateDTO: DTOCouponWarehouse) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateCouponIssuedWH.method,
        that.config.getAPIList().UpdateCouponIssuedWH.url,
        JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  UpdateCouponIssuedMembership(updateDTO: DTOCouponMembership[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateCouponIssuedMembership.method,
        that.config.getAPIList().UpdateCouponIssuedMembership.url,
        JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  UpdateCouponIssuedProduct(updateDTO: DTOCouponProduct[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateCouponIssuedProduct.method,
        that.config.getAPIList().UpdateCouponIssuedProduct.url,
        JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  UpdateCouponIssuedRounting(updateDTO: DTOCounponRounting[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateCouponIssuedRounting.method,
        that.config.getAPIList().UpdateCouponIssuedRounting.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  //delete
  DeleteCouponIssued(updateDTO: DTODetailCouponPolicy[] | DTOCouponPolicy[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteCouponIssued.method,
        that.config.getAPIList().DeleteCouponIssued.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  DeleteCouponIssuedMembership(updateDTO: DTOCouponMembership[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteCouponIssuedMembership.method,
        that.config.getAPIList().DeleteCouponIssuedMembership.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  DeleteCouponIssuedProduct(updateDTO: DTOCouponProduct[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteCouponIssuedProduct.method,
        that.config.getAPIList().DeleteCouponIssuedProduct.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  DeleteCouponIssuedRounting(updateDTO: DTOCounponRounting[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteCouponIssuedRounting.method,
        that.config.getAPIList().DeleteCouponIssuedRounting.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  //file
  ImportExcelCouponIssueMembership(data: File, promotion: number) {
    let that = this;
    var form: FormData = new FormData();
    form.append('file', data);
    form.append('VoucherIssue', promotion.toString())

    var headers = new HttpHeaders()
    headers = headers.append('Company', DTOConfig.cache.companyid)

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().ImportExcelCouponIssueMembership.method,
        that.config.getAPIList().ImportExcelCouponIssueMembership.url, form, headers).subscribe(
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
  ImportExcelCouponIssueProduct(data: File, promotion: number) {
    let that = this;
    var form: FormData = new FormData();
    form.append('file', data);
    form.append('VoucherIssue', promotion.toString())

    var headers = new HttpHeaders()
    headers = headers.append('Company', DTOConfig.cache.companyid)

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().ImportExcelCouponIssueProduct.method,
        that.config.getAPIList().ImportExcelCouponIssueProduct.url, form, headers).subscribe(
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

  ExportListCoupon(issue: number) {
    let that = this;
    var param = {
      'VoucherIssue': issue.toString()
    }

    return new Observable<any>(obs => {
      that.api.connect(that.config.getAPIList().ExportListCoupon.method,
        that.config.getAPIList().ExportListCoupon.url, JSON.stringify(param)
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
}