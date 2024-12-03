import { Injectable } from '@angular/core';
import { DTOConfig, DTOResponse, PS_CommonService, Ps_UtilObjectService } from 'src/app/p-lib';
import { PurApiConfigService } from './pur-api-config.service';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOPriceRequest } from '../dto/DTOPriceRequest.dto';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOProductPriceRequest } from '../dto/DTOProductPriceRequest.dto';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PurPriceRequestApiService {

  constructor( 
    public api: PS_CommonService,
    public config: PurApiConfigService,) { }



    //region PriceRequest

    /**
     * Lấy danh sách đề nghị báo giá
     * @param filter :State
     * @returns 
     */
    GetListPriceRequest(filter: State) {
      let that = this;
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().GetListPriceRequest.method,
          that.config.getAPIList().GetListPriceRequest.url, JSON.stringify(toDataSourceRequest(filter)))
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


    /**
     * Lấy thông tin đề nghị báo giá
     * @param dto :DTOPriceRequest
     * @returns 
     */
    GetPriceRequest(dto: DTOPriceRequest) {
      let that = this
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().GetPriceRequest.method,
          that.config.getAPIList().GetPriceRequest.url,
          JSON.stringify(dto)).subscribe((res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
  
          })
      })
    }
  
    
    /**
     * Cập nhật đề nghị báo giá
     * @param dto : DTOPriceRequest
     * @param prop: string[]
     * @returns 
     */
    UpdatePriceRequest(dto: DTOPriceRequest, prop: string[]) {
      let that = this;
      var param: DTOUpdate = {
        DTO: { ...dto },
        Properties: prop
      }
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().UpdatePriceRequest.method,
          that.config.getAPIList().UpdatePriceRequest.url,
          JSON.stringify(param,(k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['EffDate']) })).subscribe(
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
     * Xóa đề nghị báo giá
     * @param dto:  DTOPriceRequest[]
     * @returns 
     */
    DeletePriceRequest(dto: DTOPriceRequest[]) {
      let that = this
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().DeletePriceRequest.method,
          that.config.getAPIList().DeletePriceRequest.url,
          JSON.stringify(dto)).subscribe((res: any) => {
            obs.next(res);
            obs.complete()
          }, errors => {
            obs.error(errors)
            obs.complete()
          }
          )
      })
    }

    /**
     * Cập nhật tình trạng đề nghị báo giá
     * @param dto : DTOPriceRequest[]
     * @param statusID : number
     * @returns 
     */
    UpdatePriceRequestStatus(dto: DTOPriceRequest[], statusID: number) {
      let that = this;
      var param = {
        "ListDTO": dto,
        "StatusID": statusID,
      }
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().UpdatePriceRequestStatus.method,
          that.config.getAPIList().UpdatePriceRequestStatus.url,
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

    //#endregion

    //region ProductPriceRequest

    /**
     * Lấy danh sách sản phẩm báo giá
     * @param filter : State
     * @returns 
     */
    GetListProductPriceRequest(filter: State) {
      let that = this;
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().GetListProductPriceRequest.method,
          that.config.getAPIList().GetListProductPriceRequest.url, JSON.stringify(toDataSourceRequest(filter)))
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

    /**
     * Lấy thông tin sản phẩm báo giá
     * @param dto :DTOProductPriceRequest
     * @returns 
     */

    GetProductPriceRequest(dto: DTOProductPriceRequest) {
      let that = this
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().GetProductPriceRequest.method,
          that.config.getAPIList().GetProductPriceRequest.url,
          JSON.stringify(dto)).subscribe((res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
  
          })
      })
    }


    /**
     * Lấy sản phẩm đề nghị bởi barcode
     * @param barcode :string
     * @param PartnerProductMaster: number
     * @returns 
     */
    GetProductPriceRequestByCode(barcode:string,PartnerProductMaster: number) {
      let that = this
      let params = {
        "Barcode": barcode,
        "PartnerProductMaster": PartnerProductMaster
      }
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().GetProductPriceRequestByCode.method,
          that.config.getAPIList().GetProductPriceRequestByCode.url,
          JSON.stringify(params)).subscribe((res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
  
          })
      })
    }

    /**
     * Cập nhật thông tin sản phẩm đề nghị
     * @param dto: DTOProductPriceRequest
     * @param prop: string[]
     * @returns 
     */
    UpdateProductPriceRequest(dto: DTOProductPriceRequest,prop: string[]) {
      let that = this;
      var param: DTOUpdate = {
        DTO: { ...dto },
        Properties: prop
      }
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().UpdateProductPriceRequest.method,
          that.config.getAPIList().UpdateProductPriceRequest.url,
          JSON.stringify(param,(k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['POFrom','POTo','StoreFrom','StoreTo']) })).subscribe(
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
     * Xóa sản phẩm đề nghị
     * @param dto : DTOProductPriceRequest[]
     * @returns 
     */
    DeleteProductPriceRequest(dto: DTOProductPriceRequest[]) {
      let that = this
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().DeleteProductPriceRequest.method,
          that.config.getAPIList().DeleteProductPriceRequest.url,
          JSON.stringify(dto)).subscribe((res: any) => {
            obs.next(res);
            obs.complete()
          }, errors => {
            obs.error(errors)
            obs.complete()
          }
          )
      })
    }

    /**
     * Cập nhật tình trạng sản phẩm báo giá
     * @param dto :DTOProductPriceRequest[]
     * @param statusID: number
     * @returns 
     */
    UpdateProductPriceRequestStatus(dto: DTOProductPriceRequest[], statusID: number) {
      let that = this;
      var param = {
        "ListDTO": dto,
        "StatusID": statusID,
      }
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().UpdateProductPriceRequestStatus.method,
          that.config.getAPIList().UpdateProductPriceRequestStatus.url,
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

/**
 * Lấy danh sách điều kiện thương mại
 * @returns 
 */
    GetListCommercialTerm() {
      let that = this;
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().GetListCommercialTerm.method,
          that.config.getAPIList().GetListCommercialTerm.url, {}).subscribe(
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
     *  Lấy danh sách NCC
     * @returns 
     */
    GetListSupplier() {
      let that = this;
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().GetListSupplier.method,
          that.config.getAPIList().GetListSupplier.url, {}).subscribe(
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

    //#endregion

    /**
     * import sản phẩm báo giá
     * @param data : File
     * @param Code :number
     * @returns 
     */
    ImportExcelProductPriceRequest (data: File,Code:number) {
      let that = this;
      var form: FormData = new FormData();
      form.append('file', data);
      form.append('Master', Code.toString());
  
      var headers = new HttpHeaders()
      headers = headers.append('Company', DTOConfig.cache.companyid)
  
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().ImportExcelProductPriceRequest.method,
          that.config.getAPIList().ImportExcelProductPriceRequest.url, form, headers).subscribe(
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
