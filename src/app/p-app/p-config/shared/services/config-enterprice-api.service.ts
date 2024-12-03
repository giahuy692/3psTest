import { Injectable } from '@angular/core';
import {
  DTOResponse,
  PS_CommonService,
  Ps_UtilCacheService,
} from 'src/app/p-lib';
import { ConfigApiConfigService } from './config-api-config.service';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTORole } from '../dto/DTOConfEnterpriseRole.dto';
import { DTODepartment } from 'src/app/p-app/p-hri/shared/dto/DTODepartment.dto';
import { DTOPermission } from '../dto/DTOPermission';
import { DTOPartner } from 'src/app/p-app/p-purchase/shared/dto/DTOPartner';

@Injectable({
  providedIn: 'root',
})
export class ConfigEnterpriceApiService {
  constructor(
    public api: PS_CommonService,
    public config: ConfigApiConfigService,
    public cacheService: Ps_UtilCacheService,
    public layoutConfig: LayoutApiConfigService
  ) {}

  // lấy danh sách Vai trò
  // yêu cầu truyền filter kendo và keywword
  GetListRoles(gridState: State, keyword: string){
    let that = this;
    const ListHamperRequestParam = {
      Filter: toDataSourceRequest(gridState),
      Keyword: keyword,
    };
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListRoles.method,
          that.config.getAPIList().GetListRoles.url,
          JSON.stringify(ListHamperRequestParam)
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

  // cập nhập vai trò
  // yêu cầu truyền một Item 
  UpdateRoles(dto: DTORole){
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdateRoles.method,
          that.config.getAPIList().UpdateRoles.url,
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

  // Xóa vai trò
  // yêu cầu truyền một Item 
  DeleteRoles(dto: DTORole){
    let that = this;

    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeleteRoles.method,
          that.config.getAPIList().DeleteRoles.url,
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

  // #region Permission
  // Bắt buộc phải có Code và Company
  GetListRoleByDepartment(Item: DTODepartment[]) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListRoleByDepartment.method,
          that.config.getAPIList().GetListRoleByDepartment.url,
          JSON.stringify(Item)
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

  // Truyền company để lấy được ListDataPermission
  GetListSysStructurePermissionTree(company: number) {
    let obj = { "Company": company }
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListSysStructurePermissionTree.method,
          that.config.getAPIList().GetListSysStructurePermissionTree.url,
          JSON.stringify(obj)
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

  UpdatePermission(item: DTOPermission) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdatePermission.method,
          that.config.getAPIList().UpdatePermission.url,
          JSON.stringify(item)
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

  // Bắt buộc phải có Code
  DeletePermission(item: DTOPermission) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeletePermission.method,
          that.config.getAPIList().DeletePermission.url,
          JSON.stringify(item)
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

  // Bắt buộc phải có Code
  GetPermission(item: DTOPermission) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetPermission.method,
          that.config.getAPIList().GetPermission.url,
          JSON.stringify(item)
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

  //#regionPartner
  GetListPartnerTree() {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListPartnerTree.method,
          that.config.getAPIList().GetListPartnerTree.url,
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

  GetListPartnerDropdown(dto:DTOPartner) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetListPartnerDropdown.method,
          that.config.getAPIList().GetListPartnerDropdown.url,
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

  //phải có Code,InvNo
  GetPartner(dto:DTOPartner) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().GetPartner.method,
          that.config.getAPIList().GetPartner.url,
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

  UpdatePartner(dto:DTOPartner) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().UpdatePartner.method,
          that.config.getAPIList().UpdatePartner.url,
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

  DeletePartner(dto:DTOPartner) {
    let that = this;
    return new Observable<DTOResponse>((obs) => {
      that.api
        .connect(
          that.config.getAPIList().DeletePartner.method,
          that.config.getAPIList().DeletePartner.url,
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

  // Api này gốc là ở Hri nhưng ở câu hình doanh nghiệp API GetListModuleAPITree không lấy ra các 
  // api của module hri thế nên nhưng trang sử dụng api này sẽ bị lỗi -> bổ sung để các UI có thể dùng
  GetListDepartment(dto: DTODepartment) {
		let that = this;
		return new Observable<DTODepartment[]>(obs => {
			that.api.connect(that.config.getAPIList().GetListDepartment.method,
				that.config.getAPIList().GetListDepartment.url,
				JSON.stringify(dto)).subscribe(
					(res: DTODepartment[]) => {
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
