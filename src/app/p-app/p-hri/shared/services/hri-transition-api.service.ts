import { Injectable } from '@angular/core';
import {
  DTOConfig,
  DTOResponse,
  PS_CommonService,
  Ps_UtilCacheService,
  Ps_UtilObjectService,
} from 'src/app/p-lib';
import { HriApiConfigService } from './hri-api-config.service';
import { Observable } from 'rxjs';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { DTOHRPolicyMaster } from '../dto/DTOHRPolicyMaster.dto';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOHRPolicyTask } from '../dto/DTOHRPolicyTask.dto';
import { DTOFunction } from 'src/app/p-app/p-developer/shared/dto/DTOFunction';
import { DTOHRPolicyPosition } from '../dto/DTOHRPolicyPosition.dto';
import { DTOHRPolicyLocation } from '../dto/DTOHRPolicyLocation.dto';
import { DTOHRPolicyTypeStaff } from '../dto/DTOHRPolicyTypeStaff.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HriTransitionApiService {
  keyCacheHRPolicyMaster = 'HrPolicy';

  constructor(
    public api: PS_CommonService,
    public config: HriApiConfigService,
    public cacheService: Ps_UtilCacheService
  ) { }

  //#region PolicyMaster

  /**
   * API Lấy danh sách thông tin chính sách
   * @param reqPosition keyword search theo chức danh thuộc chính sách
   * @param filter kendo filter
   * @returns DTOResponse
   */
  GetListHRPolicy(reqPosition: string, filter: State) {
    let that = this;
    let param = {
      Keyword: reqPosition,
      Filter: toDataSourceRequest(filter),
    };
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRPolicy.method,
          that.config.getAPIList().GetListHRPolicy.url,
          JSON.stringify(param)
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

  /**
   * API Cập nhật trạng thái của chính sách
   * @param listDTO Danh sách chính sách cần cập nhật
   * @param reqStatus Trạng thái muốn chuyển sang
   * @returns
   */
  UpdateHRPolicyStatus(listDTO: DTOHRPolicyMaster[], reqStatus: number) {
    let that = this;
    let param = {
      ListDTO: listDTO,
      Status: reqStatus,
    };
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRPolicyStatus.method,
          that.config.getAPIList().UpdateHRPolicyStatus.url,
          JSON.stringify(param)
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

  /**
   * API xoá chính sách
   * @param listDTO danh sách chính sách cần xoá
   * @returns
   */
  DeleteHRPolicy(listDTO: DTOHRPolicyMaster[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteHRPolicy.method,
          that.config.getAPIList().DeleteHRPolicy.url,
          JSON.stringify(listDTO)
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

  GetListHRPolicyApply(req: DTOHRPolicyMaster) {
    let that = this;
    let param = req;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRPolicyApply.method,
          that.config.getAPIList().GetListHRPolicyApply.url,
          JSON.stringify(param)
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

  GetHRPolicy(req: DTOHRPolicyMaster) {
    let that = this;
    let param = req;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHRPolicy.method,
          that.config.getAPIList().GetHRPolicy.url,
          JSON.stringify(param)
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

  /**
   * Hàm API thực hiện update thông tin của chính sách
   * @param updateDTO gồm DTOHRPolicyMaster và trường (Properties) muốn update
   * @returns Đối tượng DTOHRPolicyMaster
   */
  UpdateHRPolicy(updateDTO: DTOUpdate) {
    let that = this;
    var json = JSON.stringify(updateDTO, (k, v) =>
      Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['EffDate'])
    );
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRPolicy.method,
          that.config.getAPIList().UpdateHRPolicy.url,
          json
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

  // Xoá thông tin giới hạn áp dụng cho chính sách, công việc
  DeleteHRPolicyLimit(
    dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff
  ) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteHRPolicyLimit.method,
          that.config.getAPIList().DeleteHRPolicyLimit.url,
          JSON.stringify(dto)
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

  //#region TASK
  // lấy danh sách công việc của chính sách

  /**
   *
   * @param filter Kendo filter
   * @returns
   */
  GetListHRPolicyTask(filter: State) {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRPolicyTask.method,
          that.config.getAPIList().GetListHRPolicyTask.url,
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

  // Xóa danh sách công việc
  DeleteHRPolicyTask(listDTO: DTOHRPolicyTask[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteHRPolicyTask.method,
          that.config.getAPIList().DeleteHRPolicyTask.url,
          JSON.stringify(listDTO)
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

  // lấy danh sách ngoại lệ cho công việc
  GetListHRTaskException(task: DTOHRPolicyTask) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRTaskException.method,
          that.config.getAPIList().GetListHRTaskException.url,
          JSON.stringify(task)
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

  GetHRPolicyTask(dto: DTOHRPolicyTask) {
    let that = this;
    let param = dto;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHRPolicyTask.method,
          that.config.getAPIList().GetHRPolicyTask.url,
          JSON.stringify(param)
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


  /**
   * Thêm Công việc bằng Excel
   * @param data file excel
   * @param PolicyCode code của chính sách
   * @returns 
   */
  ImportHRPolicyTask(data: File, PolicyCode: number) {
    let that = this;
    const form = new FormData();
    form.append('file', data);
    form.append('Policy', PolicyCode.toString());

    const headers = new HttpHeaders()
      .append('Company', DTOConfig.cache.companyid);

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().ImportHRPolicyTask.method,
        that.config.getAPIList().ImportHRPolicyTask.url, form, headers).subscribe(
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

  //#region POSITION

  /**
   * API Lấy thông tin chức danh
   * @param req DTO chức danh (DTOHRPolicyPosition)
   * @returns trả về chức danh (DTOHRPolicyPosition)
   */
  GetHRPolicyPosition(req: DTOHRPolicyPosition) {
    let that = this;
    let param = req;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHRPolicyPosition.method,
          that.config.getAPIList().GetHRPolicyPosition.url,
          JSON.stringify(param)
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

  /**
   * Hàm API thực hiện update thông tin chức danh áp dụng cho chính sách
   * @param updateDTO gồm DTOHRPolicyMaster và trường (Properties) muốn update
   * @returns Đối tượng DTOHRPolicyMaster
   */
  UpdateHRPolicyLimit(req: DTOHRPolicyPosition) {
    let that = this;
    let param = req;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRPolicyLimit.method,
          that.config.getAPIList().UpdateHRPolicyLimit.url,
          JSON.stringify(param)
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
  // Hàm cập nhật trạng thái policy limit
  UpdateHRPolicyLimitStatus(
    req: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff
  ) {
    let that = this;
    let param = req;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRPolicyLimitStatus.method,
          that.config.getAPIList().UpdateHRPolicyLimitStatus.url,
          JSON.stringify(param)
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

  // lấy danh sách công việc của hệ thống
  /**
   *
   * @param state Kendo filter {DLLPackage = "DLLPackage cần tìm ",IsFunctionTaskActive: true, IsActive: true}
   * @returns
   */
  GetListSYSTaskInFunction(state: State) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListSYSTaskInFunction.method,
          that.config.getAPIList().GetListSYSTaskInFunction.url,
          JSON.stringify(toDataSourceRequest(state))
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

  /**
   * Lấy thông tin chức danh đã áp dụng
   * @param req  thông tin chức danh
   * @returns thông tin chức danh
   */

  GetHRPolicyApply(req: DTOHRPolicyPosition) {
    let that = this;
    let param = req;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHRPolicyApply.method,
          that.config.getAPIList().GetHRPolicyApply.url,
          JSON.stringify(param)
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

  // cập nhật công việc
  /**
   *
   * @param updateDTO item DTO là DTOPolicyTask
   * @param reqTask mảng string chứa các properties cần để cập nhật
   * @returns
   */
  UpdateHRPolicyTask(updateDTO: DTOHRPolicyTask, reqTask: string[]) {
    let that = this;
    let param = {
      DTO: updateDTO,
      Properties: reqTask,
    };
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRPolicyTask.method,
          that.config.getAPIList().UpdateHRPolicyTask.url,
          JSON.stringify(param)
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

  // cập nhật danh sách công việc
  /**
   *
   * @param listDTO danh sách các item cần cập nhật DTOPolicyTask
   * @returns
   */
  UpdateHRListPolicyTask(listDTO: DTOHRPolicyTask[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRListPolicyTask.method,
          that.config.getAPIList().UpdateHRListPolicyTask.url,
          JSON.stringify(listDTO)
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

  /**
   * Lấy danh sách các chức danh trong chính sách
   * @returns 
   */
  GetListHRPolicyPosition(): Observable<DTOResponse> {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRPolicyPosition.method,
          that.config.getAPIList().GetListHRPolicyPosition.url,
          JSON.stringify({})
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

  //region Location

  // lay danh sach dia diem cua chinh sach
  GetListHRPolicyLocation(): Observable<DTOResponse> {
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRPolicyLocation.method,
          that.config.getAPIList().GetListHRPolicyLocation.url,
          JSON.stringify({})
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
  // endregion

  //region Import Export

  /**
   * Download templet impor chức danh
   * @param fileName PolicyApplyTemplate.xlsx
   * @returns 
   */
  GetTemplate(fileName: string) {
    let that = this;
    return new Observable<any>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetTemplate.method,
          that.config.getAPIList().GetTemplate.url,
          JSON.stringify(fileName),
          null,
          null,
          'response',
          'blob'
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

  /**
   * Thêm chức danh bằng Excel
   * @param data file excel
   * @param PolicyCode code của chính sách
   * @returns 
   */
  ImportPosition(data: File, PolicyCode: number) {
    let that = this;
    const form = new FormData();
    form.append('file', data);
    form.append('Policy', PolicyCode.toString());

    const headers = new HttpHeaders()
      .append('Company', DTOConfig.cache.companyid);

    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().ImportHRPolicyApply.method,
        that.config.getAPIList().ImportHRPolicyApply.url, form, headers).subscribe(
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
