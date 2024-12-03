import { Injectable } from '@angular/core';
import { DTOResponse, PS_CommonService } from 'src/app/p-lib';
import { PurApiConfigService } from './pur-api-config.service';
import { Observable } from 'rxjs';
import { DTOPartnerContact } from '../dto/DTOPartnerContact.dto';
import { DTOSupplier } from '../dto/DTOSupplier';
// import { DTOSupplier } from '../dto/DTOSupplier';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { DTOPartnerTemplateEmail } from '../dto/DTOPartnerTemplateEmail.dto';
import { error } from 'console';

@Injectable({
  providedIn: 'root'
})
export class PurSupplierApiServiceService {

  constructor(
    public api: PS_CommonService,
    public config: PurApiConfigService,
  ) { }

  isAdd: boolean = false

  // Get List Supplier Tree

  GetListSupplierTree() {
    let that = this

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListSupplierTree.method,
        that.config.getAPIList().GetListSupplierTree.url,
        JSON.stringify({})).subscribe((res: any) => {
          obs.next(res);
          obs.complete();
        }, errors => {
          obs.error(errors);
          obs.complete();

        })
    })
  }

  // Supplier Detail
  // Get Supplier
  GetSupplier(code: number) {
    let a = {
      Code: code
    }
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetSupplier.method,
        that.config.getAPIList().GetSupplier.url,
        JSON.stringify(a)).subscribe((res: any) => {
          obs.next(res);
          obs.complete();
        }, errors => {
          obs.error(errors);
          obs.complete();

        })
    })
  }

  // Update Supplier
  UpdateSupplier(data: any) {
    let that = this
    var param = data
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateSupplier.method,
        that.config.getAPIList().UpdateSupplier.url,
        JSON.stringify(param)).subscribe((res: any) => {
          obs.next(res);
          obs.complete();
        }, errors => {
          obs.error(errors);
          obs.complete();
        })
    })
  }

  // Delete Supplier
  DeleteSupplier(dataDelete: DTOSupplier) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteSupplier.method,
        that.config.getAPIList().DeleteSupplier.url,
        JSON.stringify(dataDelete)).subscribe((res: any) => {
          obs.next(res);
          obs.complete()
        }, errors => {
          obs.error(errors)
          obs.complete()
        }
        )
    })
  }

  // Get list reason
  GetListReason(typedata: number) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListReason.method,
        that.config.getAPIList().GetListReason.url,
        JSON.stringify({ "TypeData": typedata })).subscribe((res: any) => {
          obs.next(res);
          obs.complete();
        }, errors => {
          obs.error(errors);
          obs.complete();
        })
    })
  }

  //Person contact
  //get list person contact
  GetListSupplierContact(Filter: State, Keyword: string) {
    let that = this;
    let dataPAram = {

      Filter: toDataSourceRequest(Filter),
      Keyword: Keyword
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListSupplierContact.method,
        that.config.getAPIList().GetListSupplierContact.url, JSON.stringify((dataPAram)))
        .subscribe(
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


  //update person contact
  //các trường bắt buộc code, company,COPartner,IsOversea,ContactName
  UpdateSupplierContact(dataUpdate: DTOPartnerContact) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateSupplierContact.method,
        that.config.getAPIList().UpdateSupplierContact.url, JSON.stringify(dataUpdate)).subscribe(
          (res: DTOResponse) => {
            obs.next(res);
            obs.complete()
          }, errors => {
            obs.error(errors)
            obs.complete()
          }
        )
    })
  }

  //delete person contact
  //các trường bắt buộc code 
  DeleteSupplierContact(dataDelete) {
    let that = this
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteSupplierContact.method,
        that.config.getAPIList().DeleteSupplierContact.url, JSON.stringify(dataDelete)).subscribe(
          (res: DTOResponse) => {
            obs.next(res);
            obs.complete()
          }, errors => {
            obs.error(errors)
            obs.complete()
          }
        )
    })
  }

  // Lấy danh sách sản phẩm đặt mua
  GetListPOProduct(gridState: State, keyword: string) {
    let that = this;
    const ListRequestParam = {
      Filter: toDataSourceRequest(gridState),
      Keyword: keyword,
    };
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListPOProduct.method,
          that.config.getAPIList().GetListPOProduct.url,
          JSON.stringify(ListRequestParam)
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

  // lấy danh sách Lịch sử mua hàng
  GetListBuyedHistory(gridState: State) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListBuyedHistory.method,
          that.config.getAPIList().GetListBuyedHistory.url,
          JSON.stringify(toDataSourceRequest(gridState))
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

  // lấy danh sách lịch sử thay đổi giá mua
  GetListChangePriceHistory(gridState: State) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListChangePriceHistory.method,
          that.config.getAPIList().GetListChangePriceHistory.url,
          JSON.stringify(toDataSourceRequest(gridState))
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

  // Lấy template Email
  GetTemplateEmail(dataTemplateEmail: DTOPartnerTemplateEmail) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api.connect(
        that.config.getAPIList().GetTemplateEmail.method,
        that.config.getAPIList().GetTemplateEmail.url,
        JSON.stringify(dataTemplateEmail)
      ).subscribe((res: any) => {
        obs.next(res);
        obs.complete();
      },
        (errors) => {
          obs.error(errors);
          obs.complete();
        })
    })
  }

  // Cập nhật template Email
  UpdateTemplateEmail(dataTemplateEmail: DTOPartnerTemplateEmail) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api.connect(
        that.config.getAPIList().UpdateTemplateEmail.method,
        that.config.getAPIList().UpdateTemplateEmail.url,
        JSON.stringify(dataTemplateEmail)
      ).subscribe((res: any) => {
        obs.next(res);
        obs.complete();
      },
        (errors) => {
          obs.error(errors);
          obs.complete();
        })
    })
  }
}
