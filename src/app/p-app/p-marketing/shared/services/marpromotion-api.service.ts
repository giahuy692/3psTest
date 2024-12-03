import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, Ps_UtilObjectService, DTOResponse, DTOConfig } from "src/app/p-lib";
import { MarketingApiConfigService } from "./marketing-api-config.service";
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import DTOPromotionProduct, { DTODayOfWeek, DTOGroupOfCard, DTOPromotionDetail, DTOPromotionInvDetail } from '../dto/DTOPromotionProduct.dto';
import { DTOCFFolder } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MarPromotionAPIService {

  constructor(
    public api: PS_CommonService,
    public config: MarketingApiConfigService,
    public layoutConfig: LayoutApiConfigService,
  ) { }

  GetListPromotion(gridState: State, donviCode?: number) {
    let that = this;
    var param = {
      WHCode: donviCode,
      Filter: toDataSourceRequest(gridState)
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListPromotion.method,
        that.config.getAPIList().GetListPromotion.url, JSON.stringify(param))
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

  /**
   * Lấy chi tiết thông tin của một CTKM
   * @param dto CTKM
   */
  GetPromotionByCode(code: number) {
    let that = this;
    var param = { Code: code }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionByCode.method,
        that.config.getAPIList().GetPromotionByCode.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }

  // Lấy danh sách loại khuyễn mãi
  GetListPromotionType() {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListPromotionType.method,
        that.config.getAPIList().GetListPromotionType.url, null).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetPromotionDayOfWeek(promotion: number) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionDayOfWeek.method,
        that.config.getAPIList().GetPromotionDayOfWeek.url, JSON.stringify({ "Promotion": promotion })).subscribe(
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
   * Lấy danh sách nhóm thẻ áp dụng 
   * @param promotion code của CTKM
   * @returns DTOResponse
   */
  GetPromotionListGroupOfCard(promotion: number) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionListGroupOfCard.method,
        that.config.getAPIList().GetPromotionListGroupOfCard.url, JSON.stringify({ "Promotion": promotion })).subscribe(
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
   * Lấy danh sách đơn vị áp dụng cho CTKM
   * @param promotion code của CTKM
   * @returns DTOResponse
   */
  GetPromotionWareHouse(promotion: number) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionWareHouse.method,
        that.config.getAPIList().GetPromotionWareHouse.url, JSON.stringify({ "Promotion": promotion })).subscribe(
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
   * Cập nhật CTKM
   * @param properties danh sách những thuộc tính muốn cập nhật
   * @param promotion CKKM
   */
  UpdatePromotion(updateDTO: DTOUpdate) {
    let that = this;
    var json = JSON.stringify(updateDTO, (k, v) => 
      Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ["StartDate", "EndDate"]))
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePromotion.method,
        that.config.getAPIList().UpdatePromotion.url, json)
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

  /**
   * Cập nhật trạng thái của CTKM
   * @param list danh sách những CKTM cần được cập nhật trạng thái
   * @param status ID của status cần cập nhật
   */
  UpdatePromotionStatus(list: any[], status: number) {
    let that = this;
    var param = {
      ListDTO: list,
      StatusID: status,
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePromotionStatus.method,
        that.config.getAPIList().UpdatePromotionStatus.url, JSON.stringify(param,
          (k, v) => Ps_UtilObjectService.parseDateToString(k, v, ['StartDate', 'EndDate'])))
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

  // Xóa CTKM 
  DeletePromotion(updateDTO: DTOPromotionProduct) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeletePromotion.method,
        that.config.getAPIList().DeletePromotion.url, JSON.stringify(updateDTO)).subscribe(
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
   * API cập nhật đơn vị áp dụng cho CTKM
   * @param updateDTO đơn vị áp dụng
   * @returns DTOResponse
   */
  UpdatePromotionWH(updateDTO: DTOWarehouse) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePromotionWH.method,
        that.config.getAPIList().UpdatePromotionWH.url, JSON.stringify(updateDTO)).subscribe(
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
   * API cập nhật nhật nhóm thẻ áp dụng
   * @param updateDTO nhóm thẻ áp dụng
   * @returns DTOResponse
   */
  UpdatePromotionListOfCard(updateDTO: DTOGroupOfCard) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePromotionListOfCard.method,
        that.config.getAPIList().UpdatePromotionListOfCard.url, JSON.stringify(updateDTO)).subscribe(
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
   * API cập nhật ngày trong tuần
   * @param updateDTO ngày trong tuần
   * @returns DTOResponse
   */
  UpdatePromotionDayOfWeek(updateDTO: DTODayOfWeek) {
    let that = this;
    var param = { ...updateDTO }

    if (Ps_UtilObjectService.hasValueString(param.From))//toString trước để nó ko parse sai
      param.From = param.From.toLocaleString()

    if (Ps_UtilObjectService.hasValueString(param.To))//nếu toString thì api ko hiểu múi giờ +GMT, phải toLocaleString để có AM/PM
      param.To = param.To.toLocaleString()

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePromotionDayOfWeek.method,
        that.config.getAPIList().UpdatePromotionDayOfWeek.url, JSON.stringify(param,
          (k, v) => Ps_UtilObjectService.parseLocalTimeToString(k, v)))
        //nếu truyền ['From', 'To'] thì nó sẽ parse 00h thành 24h, nếu time bị lố như T24:01, api parse ra 24 day, 1h
        //nếu ko truyền ['From', 'To'] thì nó parse ra T17:01 ?        
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


  //detail
  /**
   * API lấy danh sách chi tiết CTKM
   * @param gridState filter
   * @returns DTOResponse
   */
  GetListPromotionDetail(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListPromotionDetail.method,
        that.config.getAPIList().GetListPromotionDetail.url, JSON.stringify(
          toDataSourceRequest(gridState))).subscribe(
            (res: any) => {
              obs.next(res);
              obs.complete();
            }, errors => {
              obs.error(errors);
              obs.complete();
            })
    });
  }
  GetPromotionProduct(barcode: string, promotion: number) {
    let that = this;
    var param = {
      "Promotion": promotion,
      "Barcode": barcode
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionProduct.method,
        that.config.getAPIList().GetPromotionProduct.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  GetComboProduct(barcode: string, bundle: number, code: number) {
    let that = this;
    var param = {
      "Bundle": bundle,
      "Barcode": barcode,
      "Code": code
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetComboProduct.method,
        that.config.getAPIList().GetComboProduct.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  UpdatePromotionDetail(updateDTO: DTOPromotionDetail[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePromotionDetail.method,
        that.config.getAPIList().UpdatePromotionDetail.url, JSON.stringify(updateDTO,
          (k, v) => Ps_UtilObjectService.parseDateToString(k, v, ['LastDate'])))
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
  DeletePromotionDetail(updateDTO: DTOPromotionDetail[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeletePromotionDetail.method,
        that.config.getAPIList().DeletePromotionDetail.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  //combo
  GetListPromotionCombo(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListPromotionCombo.method,
        that.config.getAPIList().GetListPromotionCombo.url, JSON.stringify(
          toDataSourceRequest(gridState))).subscribe(
            (res: any) => {
              obs.next(res);
              obs.complete();
            }, errors => {
              obs.error(errors);
              obs.complete();
            })
    });
  }
  GetPromotionCombo(barcode: string, promotion: number) {
    let that = this;
    var param = {
      "Promotion": promotion,
      "Barcode": barcode
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionCombo.method,
        that.config.getAPIList().GetPromotionCombo.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  UpdatePromotionCombo(updateDTO: DTOPromotionDetail[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePromotionCombo.method,
        that.config.getAPIList().UpdatePromotionCombo.url, JSON.stringify(updateDTO,
          (k, v) => Ps_UtilObjectService.parseDateToString(k, v, ['LastDate']))).subscribe(
            (res: any) => {
              obs.next(res);
              obs.complete();
            }, errors => {
              obs.error(errors);
              obs.complete();
            })
    });
  }
  DeletePromotionCombo(updateDTO: DTOPromotionProduct) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeletePromotionCombo.method,
        that.config.getAPIList().DeletePromotionCombo.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  DeleteCombo(updateDTO: DTOPromotionDetail[]) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteCombo.method,
        that.config.getAPIList().DeleteCombo.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  //promotion inv
  GetPromotionInv(promotion: number) {
    let that = this;
    var param = {
      "Promotion": promotion,
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionInv.method,
        that.config.getAPIList().GetPromotionInv.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  UpdatePromotionInv(updateDTO: DTOPromotionInvDetail) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdatePromotionInv.method,
        that.config.getAPIList().UpdatePromotionInv.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  DeletePromotionInv(updateDTO: DTOPromotionInvDetail) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeletePromotionInv.method,
        that.config.getAPIList().DeletePromotionInv.url, JSON.stringify(updateDTO)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }
  //Promotion Folder
  GetPromotionFolder() {
    let that = this;
    return new Observable<DTOCFFolder>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionFolder.method,
        that.config.getAPIList().GetPromotionFolder.url, {}).subscribe(
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
  GetPromotionFolderDrill() {
    let that = this;
    return new Observable<DTOCFFolder>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionFolderDrill.method,
        that.config.getAPIList().GetPromotionFolderDrill.url, {}).subscribe(
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
  GetPromotionFolderWithFile() {
    let that = this;
    return new Observable<DTOCFFolder>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionFolderWithFile.method,
        that.config.getAPIList().GetPromotionFolderWithFile.url, {}).subscribe(
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
  GetPromotionFolderDrillWithFile() {
    let that = this;
    return new Observable<DTOCFFolder>(obs => {
      that.api.connect(that.config.getAPIList().GetPromotionFolderDrillWithFile.method,
        that.config.getAPIList().GetPromotionFolderDrillWithFile.url, {}).subscribe(
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
  ImportExcelPromotionDetail(data: File, promotion: number) {
    let that = this;
    var form: FormData = new FormData();
    form.append('file', data);
    form.append('Promotion', promotion.toString())

    var headers = new HttpHeaders()
    headers = headers.append('Company', DTOConfig.cache.companyid)

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().ImportExcelPromotionDetail.method,
        that.config.getAPIList().ImportExcelPromotionDetail.url, form, headers).subscribe(
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
  ImportExcelListComboGiftset(data: File, promotion: number) {
    let that = this;
    var form: FormData = new FormData();
    form.append('file', data);
    form.append('Promotion', promotion.toString())

    var headers = new HttpHeaders()
    headers = headers.append('Company', DTOConfig.cache.companyid)

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().ImportExcelListComboGiftset.method,
        that.config.getAPIList().ImportExcelListComboGiftset.url, form, headers).subscribe(
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
  ImportExcelComboGiftsetProduct(data: File, combo: number) {
    let that = this;
    var form: FormData = new FormData();
    form.append('file', data);
    form.append('Combo', combo.toString())

    var headers = new HttpHeaders()
    headers = headers.append('Company', DTOConfig.cache.companyid)

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().ImportExcelComboGiftsetProduct.method,
        that.config.getAPIList().ImportExcelComboGiftsetProduct.url, form, headers).subscribe(
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
  ImportExcelPromotionHamper(data: File, promotion: number) {
    let that = this;
    var form: FormData = new FormData();
    form.append('file', data);
    form.append('Promotion', promotion.toString())

    var headers = new HttpHeaders()
    headers = headers.append('Company', DTOConfig.cache.companyid)

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().ImportExcelPromotionHamper.method,
        that.config.getAPIList().ImportExcelPromotionHamper.url, form, headers).subscribe(
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

  ExportListPromotionDetails(issue: number) {
    let that = this;
    var param = {
      'Promotion': issue.toString()
    }

    return new Observable<any>(obs => {
      that.api.connect(that.config.getAPIList().ExportListPromotionDetails.method,
        that.config.getAPIList().ExportListPromotionDetails.url, JSON.stringify(param)
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

  //#region Hamper
  GetListHamper(gridState: State) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListHamper.method,
        that.config.getAPIList().GetListHamper.url, JSON.stringify(
          toDataSourceRequest(gridState))).subscribe(
            (res: any) => {
              obs.next(res);
              obs.complete();
            }, errors => {
              obs.error(errors);
              obs.complete();
            })
    });
  }

  GetHamperByBarcode(barcode: string, promotion: number, IsNew: boolean) {
    let that = this;
    var param = {
      "Promotion": promotion,
      "Barcode": barcode,
      "IsNew": IsNew
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetHamperByBarcode.method,
        that.config.getAPIList().GetHamperByBarcode.url, JSON.stringify(param)).subscribe(
          (res: any) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          })
    });
  }

  ExportHamperPromotionReport(code: number) {
    let that = this;
    let Object = {
      Code: code
    }
    return new Observable<any>(obs => {
      that.api.connect(that.config.getAPIList().ExportHamperPromotionReport.method,
        that.config.getAPIList().ExportHamperPromotionReport.url, JSON.stringify(Object)
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
  //#endregion
}