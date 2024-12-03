import { Injectable } from "@angular/core";
import { DTOConfig, DTOResponse, PS_CommonService, Ps_UtilCacheService } from "src/app/p-lib";
import { ConfigApiConfigService } from "./config-api-config.service";
import { LayoutApiConfigService } from "src/app/p-app/p-layout/services/layout-api-config.service";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { DTOConfHamperProducts, DTOHamperRequest } from "../dto/DTOConfHamperRequest";
import { DTOUpdate, DTOUpdateListStatus } from "src/app/p-app/p-ecommerce/shared/dto/DTOUpdate";
import { HttpHeaders } from "@angular/common/http";
import { DTOLabel } from "../dto/DTOConfProduct";
import { DTOPromotionImage } from "src/app/p-app/p-marketing/shared/dto/DTOPromotionProduct.dto";

@Injectable({
    providedIn: 'root'
  })
export class ConfigHamperApiService {
    
    constructor(
        public api: PS_CommonService,
        public config: ConfigApiConfigService,
        public cacheService: Ps_UtilCacheService,
        public layoutConfig: LayoutApiConfigService,
    ) {}
    //Tạo mới
    isAdd: boolean = true

    /**
     * lấy đanh sách đề nghị Hamper
     * @param gridState : State
     * @param company : number
     * @param keyword : string
     * @returns 
     */

    GetListHamperRequest(gridState: State, company: number, keyword: string){
        let that = this;
        const ListHamperRequestParam = {
          Company: company,
          Filter: toDataSourceRequest(gridState),
          Keyword: keyword
        }
        return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().GetListHamperRequest.method,
            that.config.getAPIList().GetListHamperRequest.url,
            JSON.stringify(ListHamperRequestParam)).subscribe(
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
     * cập nhật tình trạng đề nghị Hamper
     * @param dto : DTOHamperRequest[]
     * @param statusID : number
     * @returns 
     */
    UpdateProductStatus(dto: DTOHamperRequest[], statusID: number){
        let that = this;
        var param: DTOUpdateListStatus = {
            ListDTO: dto,
            StatusID: statusID,
        }
        return new Observable<DTOResponse>(obs => {
          that.api.connect(that.config.getAPIList().UpdateProductStatus.method,
            that.config.getAPIList().UpdateProductStatus.url,
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
     * ImportExcel
     * @param data : File
     * @returns 
     */
    ImportExcel(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelHamper.method,
				that.config.getAPIList().ImportExcelHamper.url, form, headers).subscribe(
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
   * Import Excel sản phẩm trong hamper
   * @param data : File
   * @param hamper : number
   * @returns 
   */
  ImportExcelProductForHamper(data: File, hamper: number) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('Hamper', hamper.toString());

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelProductForHamper.method,
				that.config.getAPIList().ImportExcelProductForHamper.url, form, headers).subscribe(
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
   * get template 
   * @param fileName : string
   * @returns 
   */
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

    
    /**
     * Xóa Sản phẩm đề nghị hamper
     * @param Code : number
     * @param Parent :number
     * @returns 
     */
    DeleteHamperRequestProduct(Code: number,Parent:number){
      const param= {
        Code : Code,
        Parent: Parent
      }
      let that = this;
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().DeleteHamperRequestProduct.method,
        that.config.getAPIList().DeleteHamperRequestProduct.url,
        JSON.stringify(param)).subscribe(
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
     * Xóa đề nghị hamper
     * @param Code : number
     * @returns 
     */
    DeleteHamperRequest(Code: number){
      const para= {
        Code : Code
      }
      let that = this;
      return new Observable<DTOResponse>(obs => {
        that.api.connect(that.config.getAPIList().DeleteHamperRequest.method,
        that.config.getAPIList().DeleteHamperRequest.url,
        JSON.stringify(para)).subscribe(
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
     * Lấy danh sách lịch sử 
     * @param Code : number
     * @param TypeData : number
     * @returns 
     */
    GetListChangeHistory(Code: number, TypeData: number){
        let that = this;
        var param = {
            Code: Code,
            TypeData: TypeData,
        }
        return new Observable<DTOResponse>(obs => {
          that.api.connect(that.config.getAPIList().GetListChangeHistory.method,
            that.config.getAPIList().GetListChangeHistory.url,
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
     * Lấy thông tin đề nghị hamper
     * @param code : number
     * @returns 
     */
    GetHamperRequest(code: number) {
      let that = this;
      return new Observable<DTOResponse>(obs => {
              that.api.connect(that.config.getAPIList().GetHamperRequest.method,
                      that.config.getAPIList().GetHamperRequest.url, JSON.stringify({ 'Code': code })).subscribe(
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
   * lấy danh sách sản phẩm hamper 
   * @param gridState : State
   * @param isEnterprise :boolean
   * @returns 
   */
  GetListProductHamper(gridState: State,isEnterprise:boolean){
    let that = this;
    const ListHamperRequestParam = {
      IsEnterprise: isEnterprise,
      Filter: toDataSourceRequest(gridState)
    }
    return new Observable<DTOResponse>(obs => {
    that.api.connect(that.config.getAPIList().GetListProductHamper.method,
        that.config.getAPIList().GetListProductHamper.url,
        JSON.stringify(ListHamperRequestParam)).subscribe(
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
   * lấy danh sách công ty được đề nghị hamper
   * @param code : number
   * @returns 
   */
  GetListApplyCompany(code: number) {
    let that = this;
    return new Observable<DTOResponse>(obs => {
            that.api.connect(that.config.getAPIList().GetListApplyCompany.method,
                    that.config.getAPIList().GetListApplyCompany.url, JSON.stringify({ 'Code': code })).subscribe(
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
 * lấy product thuộc hamper trên drawer
 * @param barcode : string
 * @param hamper : number
 * @returns 
 */
GetProductForHamper(barcode: string,hamper: number) {
  let that = this;
  return new Observable<DTOResponse>(obs => {
          that.api.connect(that.config.getAPIList().GetProductForHamper.method,
                  that.config.getAPIList().GetProductForHamper.url, JSON.stringify({ 'Barcode': barcode,'Hamper':hamper })).subscribe(
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
 * Xóa sản phẩm gốc hamper
 * @param Code : Number
 * @param Parent : Number
 * @returns 
 */
DeleteBaseHamperProduct(Code: Number,Parent: Number){
  let that = this;
  return new Observable<DTOResponse>(obs => {
  that.api.connect(that.config.getAPIList().DeleteBaseHamperProduct.method,
    that.config.getAPIList().DeleteBaseHamperProduct.url,
    JSON.stringify({'Code': Code,'Parent':Parent})).subscribe(
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
 * Cập nhật đề nghị hamper
 * @param dto : DTOHamperRequest
 * @param prop :  string[]
 * @returns 
 */
UpdateHamperRequest(dto: DTOHamperRequest, prop: string[]){
    let that = this;
    var param: DTOUpdate = {
        DTO: dto,
        Properties: prop,
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateHamperRequest.method,
        that.config.getAPIList().UpdateHamperRequest.url,
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
   * lấy thuộc tính tem nhãn
   * @param Code :number
   * @param Company :number
   * @returns 
   */
  GetListProductSticker(Code:number,Company:number){
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListProductSticker.method,
        that.config.getAPIList().GetListProductSticker.url,
        JSON.stringify({"Product":Code,"Company":Company})).subscribe(
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
     * Xóa item tem nhãn
     * @param ProductSticker : DTOLabel
     * @returns 
     */
    DeleteProductSticker(ProductSticker: DTOLabel){
      let that = this;
      return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().DeleteProductSticker.method,
        that.config.getAPIList().DeleteProductSticker.url,
        JSON.stringify(ProductSticker)).subscribe(
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
 * Cập nhật tem nhãn của sản phẩm
 * @param dto :DTOLabel
 * @returns 
 */
  UpdateProductSticker(dto:DTOLabel){
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateProductSticker.method,
        that.config.getAPIList().UpdateProductSticker.url,
        JSON.stringify(dto)).subscribe(
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
 * //lấy đơn vị tiền tệ
 * @returns 
 */
  GetListCurrency(){
    let that = this;
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().GetListCurrency.method,
        that.config.getAPIList().GetListCurrency.url,
        JSON.stringify({})).subscribe(
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
 * Lấy đơn vị sản phẩm
 * @param gridState : State
 * @returns 
 */
GetListPackingUnit(gridState: State){
  let that = this;
  return new Observable<DTOResponse>(obs => {
  that.api.connect(that.config.getAPIList().GetListPackingUnit.method,
      that.config.getAPIList().GetListPackingUnit.url,
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

/**
 * Cập nhật sản phẩm gốc hamper
 * @param dto DTOConfHamperProducts
 * @returns 
 */
UpdateBaseHamperProduct(dto:DTOConfHamperProducts){
  let that = this;
  return new Observable<DTOResponse>(obs => {
    that.api.connect(that.config.getAPIList().UpdateBaseHamperProduct.method,
      that.config.getAPIList().UpdateBaseHamperProduct.url,
      JSON.stringify(dto)).subscribe(
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
 * Lấy danh sách phân nhóm cho config company
 * @param gridState : State
 * @returns 
 */
GetListGroup(gridState: State){
  let that = this;
  return new Observable<DTOResponse>(obs => {
  that.api.connect(that.config.getAPIList().GetListGroup.method,
      that.config.getAPIList().GetListGroup.url,
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

/**
 * Delete Product
 * @param Code : number
 * @param Company : number
 * @param Product : number
 * @returns 
 */
DeleteProduct(Code: number,Company:number,Product:number){
    let that = this;
    return new Observable<DTOResponse>(obs => {
    that.api.connect(that.config.getAPIList().DeleteProduct.method,
      that.config.getAPIList().DeleteProduct.url,
      JSON.stringify({'Code': Code , 'Company':Company,'Product':Product })).subscribe(
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
 * Cập nhật hình ảnh sản phẩm
 * @param dto :DTOPromotionImage
 * @returns 
 */
  UpdateProductImage(dto:DTOPromotionImage){
    let that = this;
  //   var param: DTOUpdate = {
  //     DTO: dto,
  //     Properties: prop,
  // }
    return new Observable<DTOResponse>(obs => {
    that.api.connect(that.config.getAPIList().UpdateProductImage.method,
      that.config.getAPIList().UpdateProductImage.url,
      JSON.stringify(dto)).subscribe(
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
   * Xóa hình ảnh sản phẩm
   * @param dto :DTOPromotionImage
   * @returns 
   */
  DeleteProductImage(dto:DTOPromotionImage){
    let that = this;
    return new Observable<DTOResponse>(obs => {
    that.api.connect(that.config.getAPIList().DeleteProductImage.method,
      that.config.getAPIList().DeleteProductImage.url,
      JSON.stringify(dto)).subscribe(
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