import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PS_CommonService, Ps_UtilObjectService, DTOResponse, DTOConfig } from "src/app/p-lib";
import { ConfigApiConfigService } from './config-api-config.service';
import { toDataSourceRequest, State } from '@progress/kendo-data-query';
import { HttpHeaders } from "@angular/common/http";
import { DTODetailConfProduct } from "../dto/DTOConfProduct";
import { DTOUpdate } from "src/app/p-app/p-ecommerce/shared/dto/DTOUpdate";
import { DTOMAHashtag } from "src/app/p-app/p-marketing/shared/dto/DTOMAHashtag.dto";

@Injectable({
    providedIn: 'root'
})
export class ConfigAPIService {

    constructor(
        public api: PS_CommonService,
        public config: ConfigApiConfigService,
    ) { }
    //Product
    GetListProduct(gridState: State, keyword: string = '') {
        let that = this;
        var param = {
            Filter: toDataSourceRequest(gridState),
            Keyword: keyword
        }
        return new Observable<DTOResponse>(obs => {
            that.api.connect(that.config.getAPIList().GetListProduct.method,
                that.config.getAPIList().GetListProduct.url,
                JSON.stringify(param)).subscribe(
                    (res: any) => {
                        obs.next(res);
                        obs.complete();
                    }, errors => {
                        obs.error(errors);
                        obs.complete();
                    })
        });
    }
    GetProduct(code: number) {
        let that = this;
        return new Observable<any>(obs => {
            that.api.connect(that.config.getAPIList().GetProduct.method,
                that.config.getAPIList().GetProduct.url, JSON.stringify({ 'Code': code })).subscribe(
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

    UpdateProductListTag(item: DTODetailConfProduct) {
        let that = this;
        var listTag: DTOMAHashtag[] = []

        if (Ps_UtilObjectService.hasValueString(item.ListTag)) {
            listTag = JSON.parse(item.ListTag)
            var newList = listTag.map((e) => { return { "Code": e.Code } })
            item.ListTag = JSON.stringify(newList)
        }

        return new Observable<any>(obs => {
            that.api.connect(that.config.getAPIList().UpdateProductListTag.method,
                that.config.getAPIList().UpdateProductListTag.url, JSON.stringify(item)).subscribe(
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

    UpdateProduct(item: DTODetailConfProduct, prop: string[]) {
        let that = this;
        var param: DTOUpdate = {
            DTO: item,
            Properties: prop
        }
        return new Observable<any>(obs => {
            that.api.connect(that.config.getAPIList().UpdateProduct.method,
                that.config.getAPIList().UpdateProduct.url, JSON.stringify(param)).subscribe(
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

    UpdateBaseProduct(item: DTODetailConfProduct, prop: string[]) {
        let that = this;
        var param: DTOUpdate = {
            DTO: item,
            Properties: prop
        }
        return new Observable<any>(obs => {
            that.api.connect(that.config.getAPIList().UpdateBaseProduct.method,
                that.config.getAPIList().UpdateBaseProduct.url, JSON.stringify(param)).subscribe(
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

    ImportExcelProduct(data: File) {
        let that = this;
        var form: FormData = new FormData();
        form.append('file', data);
        var headers = new HttpHeaders()
        headers = headers.append('Company', DTOConfig.cache.companyid)

        return new Observable<DTOResponse>(obs => {
            that.api.connect(that.config.getAPIList().ImportExcelProduct.method,
                that.config.getAPIList().ImportExcelProduct.url, form, headers).subscribe(
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

    ImportExcelProduct2(data: File) {
        let that = this;
        var form: FormData = new FormData();
        form.append('file', data);
        var headers = new HttpHeaders()
        headers = headers.append('Company', DTOConfig.cache.companyid)

        return new Observable<DTOResponse>(obs => {
            that.api.connect(that.config.getAPIList().ImportExcelProduct2.method,
                that.config.getAPIList().ImportExcelProduct2.url, form, headers).subscribe(
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



    // enterprice

    //Product
    GetListBaseProduct(gridState: State, keyword: string) {
        let that = this;
        var param = {
            Filter: toDataSourceRequest(gridState),
            Keyword: keyword
        }
        return new Observable<DTOResponse>(obs => {
            that.api.connect(that.config.getAPIList().GetListBaseProduct.method,
                that.config.getAPIList().GetListBaseProduct.url,
                JSON.stringify(param)).subscribe(
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

    GetBaseProduct(Item: DTODetailConfProduct) {
        let that = this;
        return new Observable<DTOResponse>(obs => {
            that.api.connect(that.config.getAPIList().GetBaseProduct.method,
                that.config.getAPIList().GetBaseProduct.url,
                JSON.stringify(Item)).subscribe(
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



    GetListAPIByModuleFunction(moduleID: string, functionID: string) {
        let that = this;
        var param = {
            ModuleID: moduleID,
            FunctionID: functionID,
        }

        return new Observable<DTOResponse>(obs => {
            that.api.connect(that.config.getAPIList().GetListAPIByModuleFunction.method,
                that.config.getAPIList().GetListAPIByModuleFunction.url, JSON.stringify(param)).subscribe(
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

     // lấy tình trạng hàng hóa
     GetListProductStatus(gridState: State) {
        let that = this;
        // var param = {
        //         Filter: toDataSourceRequest(gridState),
        // }
        return new Observable<DTOResponse>(obs => {
                that.api.connect(that.config.getAPIList().GetListProductStatus.method,
                        that.config.getAPIList().GetListProductStatus.url,
                        JSON.stringify(toDataSourceRequest(gridState))).subscribe(
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