import { Injectable } from '@angular/core';
import {
  DTOConfig,
  DTOResponse,
  PS_CommonService,
  Ps_UtilObjectService,
} from 'src/app/p-lib';
import { HriApiConfigService } from './hri-api-config.service';
import {
  SortDescriptor,
  State,
  toDataSourceRequest,
} from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOHRDecisionMaster } from '../dto/DTOHRDecisionMaster.dto';
import { DTOHRDecisionProfile } from '../dto/DTOHRDecisionProfile.dto';
import { DTOPersonalInfo } from '../dto/DTOPersonalInfo.dto';
import { DTODepartment } from '../dto/DTODepartment.dto';
import { DTOEmployee } from '../dto/DTOEmployee.dto';
import { DTOHRPetitionMaster } from '../dto/DTOHRPetitionMaster.dto';
import { DTOHRDecisionTask } from '../dto/DTOHRDecisionTask.dto';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HriDecisionApiService {
  constructor(
    public api: PS_CommonService,
    public config: HriApiConfigService
  ) { }

  /**
   * API lấy danh sách quyết định
   * @param filter kendo filter
   * @returns DTO respone
   */
  GetListHRDecisionMaster(filter: State, Keyword: string, TypeData: number) {
    let that = this;
    let data = toDataSourceRequest(filter);
    data['TypeData'] = TypeData;
    if (Ps_UtilObjectService.hasValueString(Keyword)) {
      data['Keyword'] = Keyword;
    }
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRDecisionMaster.method,
          that.config.getAPIList().GetListHRDecisionMaster.url,
          JSON.stringify(data)
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
   * Hàm thực hiện update trạng thái của quyết định
   * @param listDTO Quyết định muốn thay đổi
   * @param reqStatus Trạng thái muốn chuyển
   * @returns
   */
  UpdateHRDecisionMasterStatus(
    listDTO: DTOHRDecisionMaster[],
    reqStatus: number
  ) {
    let that = this;
    let param = {
      ListDTO: listDTO,
      Status: reqStatus,
    };
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRDecisionMasterStatus.method,
          that.config.getAPIList().UpdateHRDecisionMasterStatus.url,
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
  DeleteHRDecisionMaster(listDTO: DTOHRDecisionMaster[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteHRDecisionMaster.method,
          that.config.getAPIList().DeleteHRDecisionMaster.url,
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

  //#region HrOnboardDecisionDetail

  /**
   * API lấy quyết định
   * @param DTODecision DTO quyết định cần lấy
   * @returns DTOResponse
   */
  GetHRDecisionMaster(DTODecision: DTOHRDecisionMaster) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHRDecisionMaster.method,
          that.config.getAPIList().GetHRDecisionMaster.url,
          JSON.stringify(DTODecision)
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
   * API lấy hồ sơ quyết định
   * @param DTOHRDecisionProfile DTO hồ sơ cần lấy
   * @returns DTOResponse
   */
  GetHRDecisionProfile(DTOHRDecisionProfile: DTOHRDecisionProfile) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHRDecisionProfile.method,
          that.config.getAPIList().GetHRDecisionProfile.url,
          JSON.stringify(DTOHRDecisionProfile)
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
   * API lấy danh sách hồ sơ quyết định
   * @param filter kendo filter
   * @returns DTOResponse
   */
  GetListHRDecisionProfile(filter: State) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRDecisionProfile.method,
          that.config.getAPIList().GetListHRDecisionProfile.url,
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

  /**
   * CẬP NHẬT THÔNG TIN TRẠNG THÁI NHÂN SỰ TRONG QUYẾT ĐỊNH
   * @param listDTO danh sách Profile cần cập nhật
   * @param status ID  của status
   */
  UpdateHRDecisionProfileStatus(
    listDTO: DTOHRDecisionProfile[],
    status: number
  ) {
    let that = this;
    let param = {
      ListDTO: listDTO,
      Status: status,
    };
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRDecisionProfileStatus.method,
          that.config.getAPIList().UpdateHRDecisionProfileStatus.url,
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
   * API Cập nhật quyết định
   * @param DTODecision Quyết định muốn thay đổi
   * @param Properties Các trường cần thay đổi
   * @returns
   */
  UpdateHRDecisionMaster(
    DTODecision: DTOHRDecisionMaster,
    Properties: string[]
  ) {
    let that = this;
    var json = JSON.stringify(DTODecision, (k, v) =>
      Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['EffDate'])
    );
    let param = {
      DTO: json,
      Properties: Properties,
    };
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRDecisionMaster.method,
          that.config.getAPIList().UpdateHRDecisionMaster.url,
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
   * API Cập nhật hồ sơ quyết định
   * @param DTODecisionProfile Hồ sơ quyết định muốn thay đổi
   * @returns
   */
  UpdateHRDecisionProfile(DTODecisionProfile: DTOHRDecisionProfile) {
    let that = this;
    var json = JSON.stringify(DTODecisionProfile, (k, v) =>
      Ps_UtilObjectService.parseLocalDateTimeToString(k, v, ['JoinDate'])
    );
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRDecisionProfile.method,
          that.config.getAPIList().UpdateHRDecisionProfile.url,
          JSON.stringify(json)
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
   * API xoá profile tuyển dụng
   * @param listDTO danh sách profile cần xoá
   * @returns
   */
  DeleteHRDecisionProfile(listDTO: DTOHRDecisionProfile[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteHRDecisionProfile.method,
          that.config.getAPIList().DeleteHRDecisionProfile.url,
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
   * API lấy thông tin cá nhân bằng CCCD
   * @param DTOPersonalInfo
   */
  GetHRPersonalProfileByCICN(DTOPersonalInfo: DTOPersonalInfo) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHRPersonalProfileByCICN.method,
          that.config.getAPIList().GetHRPersonalProfileByCICN.url,
          JSON.stringify(DTOPersonalInfo)
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
   * API lấy thông tin nhân sự bằng ID
   * @param DTOEmployee
   */
  GetHREmployeeByID(DTOEmployee: DTOEmployee) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHREmployeeByID.method,
          that.config.getAPIList().GetHREmployeeByID.url,
          JSON.stringify(DTOEmployee)
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
   * API lấy danh sách đơn vị công tác
   * @param dto DTODepartment
   */
  GetListDepartment(dto: DTODepartment) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListDepartment.method,
          that.config.getAPIList().GetListDepartment.url,
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

  /**
   * API lấy danh sách chức danh
   * @param dto DTODepartment
   */
  GetListPositionDepartment(dto: DTODepartment) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListPositionDepartment.method,
          that.config.getAPIList().GetListPositionDepartment.url,
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

  /**
   * API lấy danh sách điểm làm việc
   * @param dto DTODepartment
   */
  GetListLocationDepartment(dto: DTODepartment) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListLocationDepartment.method,
          that.config.getAPIList().GetListLocationDepartment.url,
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

  /**
   * API LẤY DANH SÁCH ĐỀ NGHỊ
   * @param Filter KENDO FILTER
   * @returns
   */
  GetListHRPetitionMaster(Filter: State) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRPetitionMaster.method,
          that.config.getAPIList().GetListHRPetitionMaster.url,
          JSON.stringify(toDataSourceRequest(Filter))
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


  GetListHRDecisionTaskLog(filter: State) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRDecisionTaskLog.method,
          that.config.getAPIList().GetListHRDecisionTaskLog.url,
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

  /**
   * API Import
   * @param data File
   * @param Decision Code quyết dịnh
   * @returns
   */
  ImportHRDecisionProfile(data: File, Decision: number) {
    let that = this;
    const form = new FormData();
    form.append('file', data);
    form.append('Decision', Decision.toString());

    const headers = new HttpHeaders().append(
      'Company',
      DTOConfig.cache.companyid
    );

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().ImportHRDecisionProfile.method,
          that.config.getAPIList().ImportHRDecisionProfile.url,
          form,
          headers
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

  //#region HrOffboardDecisionDetail

  GetListHRDecisionTask(state: State) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRDecisionTask.method,
          that.config.getAPIList().GetListHRDecisionTask.url,
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
   * Lấy danh sách công việc boarding
   * @param filter State
   * @param isOverdue công việc quá hạn
   * @param isWorking công việc đang thực hiện
   * @param isDone công việc hoàn tất
   * @param isPause công việc ngưng
   * @param isNot công không thực hiện
   * @param keyWord từ khóa muốn tìm kiếm
   */
  GetListHRTaskGroup(
    filter: State,
    isOverdue?: boolean
  ) {
    // Chuyển đổi filter bằng toDataSourceRequest
    const transformedFilter = toDataSourceRequest(filter);

    // Tạo param từ kết quả chuyển đổi và thêm các thuộc tính khác
    const param = {
      ...transformedFilter, // Kế thừa các giá trị như page, pageSize, filter từ transformedFilter
      isOverdue
    };
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListHRTaskGroup.method,
          that.config.getAPIList().GetListHRTaskGroup.url,
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
   * API lấy đề nghị
   * @param DTOPetition DTO đề nghị cần lấy
   * @returns DTOResponse
   */
  GetHRPetitionMaster(DTOPetition: DTOHRPetitionMaster) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHRPetitionMaster.method,
          that.config.getAPIList().GetHRPetitionMaster.url,
          JSON.stringify(DTOPetition)
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
   * API Cập nhật Đề nghị
   * @param DTOPetition Đề nghị muốn thay đổi
   * @param Properties Các trường cần thay đổi
   * @returns
   */
  UpdateHRPetitionMaster(
    DTOPetition: DTOHRPetitionMaster,
    Properties: string[]
  ) {
    let that = this;
    var json = JSON.stringify(DTOPetition, (k, v) =>
      Ps_UtilObjectService.parseLocalDateTimeToString(k, v, [
        'EffDate',
        'SentDate',
        'LeaveDate',
        'LeaveDateApproved',
      ])
    );
    let param = {
      DTO: json,
      Properties: Properties,
    };
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRPetitionMaster.method,
          that.config.getAPIList().UpdateHRPetitionMaster.url,
          param
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
   * API lấy thông tin công việc trong quyết định
   * @param DTOHRDecisionTask DTO task cần lấy
   * @returns DTOResponse
   */
  GetHRDecisionTask(DTOHRDecisionTask: DTOHRDecisionTask) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetHRDecisionTask.method,
          that.config.getAPIList().GetHRDecisionTask.url,
          JSON.stringify(DTOHRDecisionTask)
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
   * API Cập nhật thông tin công việc
   * @param DTOHRDecisionTask công việc muốn thay đổi
   * @returns
   */
  UpdateHRDecisionTask(DTOHRDecisionTask: DTOHRDecisionTask) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateHRDecisionTask.method,
          that.config.getAPIList().UpdateHRDecisionTask.url,
          JSON.stringify(DTOHRDecisionTask)
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
 * API Cập nhật thông tin danh sách công việc
 * @param DTOHRDecisionTask công việc muốn thay đổi
 * @returns
 */
  UpdateListHRDecisionTask(ListDTO: DTOHRDecisionTask[], Properties: string[]) {
    let that = this;
    const param = {
      ListDTO: ListDTO,
      Properties: Properties
    }
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateListHRDecisionTask.method,
          that.config.getAPIList().UpdateListHRDecisionTask.url,
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
   * API xoá công việc
   * @param DTOHRDecisionTask công việc muốn thay đổi
   * @returns
   */
  DeleteHRDecisionTask(DTOHRDecisionTask: DTOHRDecisionTask[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteHRDecisionTask.method,
          that.config.getAPIList().DeleteHRDecisionTask.url,
          JSON.stringify(DTOHRDecisionTask)
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

  DeleteHRPetition(DTOHRPetitionMaster: DTOHRPetitionMaster) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteHRPetition.method,
          that.config.getAPIList().DeleteHRPetition.url,
          JSON.stringify(DTOHRPetitionMaster)
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

  /**
   * Xuất các profile đã hoàn tất tuyển dụng, điều chuyển.
   * @param code của DecisionMaster
   * @returns một file excel
   */
  GetHRDecisionProfileReportExcel(code: number) {
		let that = this;
		var param = {
			'DecisionMaster': code,
		}

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetHRDecisionProfileReportExcel.method,
				that.config.getAPIList().GetHRDecisionProfileReportExcel.url, JSON.stringify(param)
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

  /**
   * 
   * @param ListHRDecisionProfile danh sách nhân sự cần xuất offer
   * @returns files
   */
  GetHRDecisionProfileReportWord(ListHRDecisionProfile: DTOHRDecisionProfile[]) {
		let that = this;

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetHRDecisionProfileReportWord.method,
				that.config.getAPIList().GetHRDecisionProfileReportWord.url, JSON.stringify(ListHRDecisionProfile)
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

  /**
   * Xuất excel nhân sự quyết định nghỉ việc được duyệt
   * @param filter bộ lọc muốn xuất
   * @returns một file excel
   */
  GetHRStaffLeaveReportExcel(filter: State) {
		let that = this;

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetHRStaffLeaveReportExcel.method,
				that.config.getAPIList().GetHRStaffLeaveReportExcel.url, toDataSourceRequest(filter)
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

  /**
   * 
   * @param filter bộ lọc muốn xuất
   * @returns files
   */
  GetHRStaffLeaveReportWord(filter: State) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetHRStaffLeaveReportWord.method,
				that.config.getAPIList().GetHRStaffLeaveReportWord.url, toDataSourceRequest(filter)
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

  /**
   * 
   * @param filter filter muốn xuất
   * @param PrinterName tên máy in
   * @param NumOfCopies Số bản muốn in
   */
  PrintHRStaffLeaveReportPDF(filter: State , PrinterName?: string, NumOfCopies?: number) {
		let that = this;

    const param = {
      ...toDataSourceRequest(filter),
      PrinterName: null, // không cần truyền thì BE tự bắt
      NumOfCopies: null // không cần truyền thì BE tự bắt
    }

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().PrintHRStaffLeaveReportPDF.method,
				that.config.getAPIList().PrintHRStaffLeaveReportPDF.url, toDataSourceRequest(filter)
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

  /**
   * Danh sách xử lý kỷ luật trước đó
   * @param filter Kendo filter{Staff: number}
   * @returns response = Data<DTOHRDecisionProfile[]>,Total<number>
   */
  GetListDisciplinaryStaff(filter: State) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListDisciplinaryStaff.method,
          that.config.getAPIList().GetListDisciplinaryStaff.url,
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

  /**
   * Xuất excel quyết định kỷ luật (các nhân sự có quyết định đã được duyệt)
   * @param ListDecisionDisciplinary danh sách các quyết định được filter trên trang
   * @returns file
   */
  GetDecisionDisciplinaryExcel(ListDecisionDisciplinary:DTOHRDecisionMaster[]) {
		let that = this;

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetDecisionDisciplinaryExcel.method,
				that.config.getAPIList().GetDecisionDisciplinaryExcel.url, ListDecisionDisciplinary
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
    //#region XỬ LÝ KỶ LUẬT
    GetListDisciplinaryTask(state: State) {
      let that = this;
      return new Observable<DTOResponse>((obs) => {
        that.api
          .connect(
            that.config.getAPIList().GetListDisciplinaryTask.method,
            that.config.getAPIList().GetListDisciplinaryTask.url,
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
   * API Hoàn tất yêu cầu
   * @param DTOHRDecisionMaster yeu cầu muốn thay đổi
   * @returns
   */
  CreateDecisionDisciplinary(DTOHRDecisionMaster: DTOHRDecisionMaster) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().CreateDecisionDisciplinary.method,
          that.config.getAPIList().CreateDecisionDisciplinary.url,
          JSON.stringify(DTOHRDecisionMaster)
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


}
