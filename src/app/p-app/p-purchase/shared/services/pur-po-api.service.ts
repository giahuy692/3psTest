import { Injectable } from "@angular/core";
import { DTOConfig, DTOResponse, PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from "src/app/p-lib";
import { PurApiConfigService } from './pur-api-config.service';
import { Observable } from 'rxjs';
import { DTOExportReport } from '../dto/DTOPurReport';
import DTOPurOrderMaster from "../dto/DTOPurOrder.dto";
import { HttpHeaders } from "@angular/common/http";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { DTODomesticOrders } from "../dto/DTODomesticOrders.dto";
import { error } from "console";
import { DTOOrderProducts } from "../dto/DTOOrderProducts.dto";
import { DTOUpdate } from "src/app/p-app/p-ecommerce/shared/dto/DTOUpdate";
import { LayoutApiConfigService } from "src/app/p-app/p-layout/services/layout-api-config.service";
import { DTOOrderDelivery } from "../dto/DTOOrderDelivery.dto";
import { DTOOrderInvoice } from "../dto/DTOOrderInvoice.dto";
import { DTOPUROrderInvoiceDetails } from "../dto/DTOPUROrderInvoiceDetails";

@Injectable({
	providedIn: 'root'
})
export class PurPOAPIService {
	private keyCachePOMaster: string;

	constructor(
		public api: PS_CommonService,
		public config: PurApiConfigService,
		public layoutConfig: LayoutApiConfigService,
		public cacheService: Ps_UtilCacheService,
	) {
		this.keyCachePOMaster = "ps_pomaster";
	}

	public p_setCachePOMaster(data: DTOPurOrderMaster): void {
		this.cacheService.setItem(this.keyCachePOMaster, data);
	}

	GetListReceivePartner() {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetListReceivePartner.method,
				that.config.getAPIList().GetListReceivePartner.url, null).subscribe(
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
	GetListReceiveOrder(partner: number) {
		let that = this;
		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetListReceiveOrder.method,
				that.config.getAPIList().GetListReceiveOrder.url, partner).subscribe(
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

	// Lấy danh sách THÔNG TIN CHI TIẾT ĐƠN HÀNG
	GetListOrderProduct(gridState: State) {
		let that = this;

		return new Observable<DTOResponse>((obs) => {
			that.api.connect(
				that.config.getAPIList().GetListOrderProduct.method,
				that.config.getAPIList().GetListOrderProduct.url,
				JSON.stringify(toDataSourceRequest(gridState))
			).subscribe((res: any) => {
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

	// Lấy danh sách THÔNG TIN CHI TIẾT ĐƠN HÀNG
	GetDeliveryOrder(DomesticOrders: DTODomesticOrders) {
		let that = this;
		return new Observable<DTOResponse>((obs) => {
			that.api.connect(
				that.config.getAPIList().GetDeliveryOrder.method,
				that.config.getAPIList().GetDeliveryOrder.url,
				JSON.stringify(DomesticOrders)
			).subscribe((res: any) => {
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

	// Lấy danh sách hóa đơn
	GetListOrderInvoice(DomesticOrders: DTODomesticOrders) {
		let that = this;
		return new Observable<DTOResponse>((obs) => {
			that.api.connect(
				that.config.getAPIList().GetListOrderInvoice.method,
				that.config.getAPIList().GetListOrderInvoice.url,
				JSON.stringify(DomesticOrders)
			).subscribe((res: any) => {
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

	//  hủy và tạo PO tương tự
	DuplicatePOCancel(DomesticOrders: DTODomesticOrders) {
		let that = this;
		return new Observable<DTOResponse>((obs) => {
			that.api.connect(
				that.config.getAPIList().DuplicatePOCancel.method,
				that.config.getAPIList().DuplicatePOCancel.url,
				JSON.stringify(DomesticOrders)
			).subscribe((res: any) => {
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

	// Import excel thông tin chi tiết đơn hàng 
	ImportOrderProduct(data: File, OrderMaster: number) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('OrderMaster', JSON.stringify(OrderMaster));
		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().ImportOrderProduct.method,
				that.config.getAPIList().ImportOrderProduct.url, form, headers).subscribe(
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
	// Get Order Product 
	GetOrderProduct(dataOrderProduct: DTOOrderProducts) {
		let that = this
		return new Observable<DTOResponse>((obs) => {
			that.api.connect(
				that.config.getAPIList().GetOrderProduct.method,
				that.config.getAPIList().GetOrderProduct.url,
				JSON.stringify(dataOrderProduct)
			).subscribe(
				(res: any) => {
					obs.next(res);
					obs.complete();
				}, (errors) => {
					obs.error(errors);
					obs.complete();
				}
			)
		})
	}
	// Update Order Product
	UpdateOrderProduct(dataUpdate: any) {
		let that = this
		return new Observable<DTOResponse>((obs) => {
			that.api.connect(
				that.config.getAPIList().UpdateOrderProduct.method,
				that.config.getAPIList().UpdateOrderProduct.url,
				JSON.stringify(dataUpdate)
			).subscribe(
				(res: any) => {
					obs.next(res);
					obs.complete();
				}, (errors) => {
					obs.error(errors);
					obs.complete();
				}
			)
		})
	}

	// Get List Ware House
	GetListWareHouse(dataOrderProduct: DTOOrderProducts) {
		let that = this
		return new Observable<DTOResponse>((obs) => {
			that.api.connect(
				that.config.getAPIList().GetListWareHouse.method,
				that.config.getAPIList().GetListWareHouse.url,
				JSON.stringify(dataOrderProduct)
			).subscribe(
				(res: any) => {
					obs.next(res);
					obs.complete();
				}, (errors) => {
					obs.error(errors);
					obs.complete();
				}
			)
		})

	}


	// DANH SÁCH MUA HÀNG NỘI ĐỊA

	/**
	* Lấy danh sách đơn hàng
	* @param Filter là kendoFilter
	*/
	GetListDomesticOrders(filterKendo: State) {
		let that = this;
		let data = toDataSourceRequest(filterKendo)
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListDomesticOrders.method,
				that.config.getAPIList().GetListDomesticOrders.url, JSON.stringify(data)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete();
					},
					error => {
						obs.next(error)
						obs.complete();
					}
				)
		});
	}

	// Download excel thông tin chi tiết đơn hàng
	GetTemplate(fileName: string) {
		let that = this;

		console.log(that.layoutConfig.getAPIList().GetTemplate.url)
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
	 * Cập nhật trạng thái đơn hàng
	 * @param listItem danh sách đơn hàng muốn cập nhật Status/OrderType
	 * @param objectStatusID object của Status muốn cập nhật. VD: objectStatusID = { 'StatusID': 2 };
	 * @param objectOrderTypeID object của orderType muốn cập nhật. VD: objectOrderTypeID = { 'OrderTypeID': 3 };
	 */
	UpdateDomesticOrdersStatus(listItem: DTODomesticOrders[],
		objectStatusID: object, objectOrderTypeID: object) {

		let that = this;
		let param: {} = { ListDTO: listItem }

		// Nếu truyền status thì thêm làm object param
		if (Ps_UtilObjectService.hasValue(objectStatusID)) {
			param = Object.assign(param, objectStatusID);
		}

		// Nếu truyền ordertype thì thêm làm object param
		if (Ps_UtilObjectService.hasValue(objectOrderTypeID)) {
			param = Object.assign(param, objectOrderTypeID);
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateDomesticOrdersStatus.method,
				that.config.getAPIList().UpdateDomesticOrdersStatus.url, JSON.stringify(param)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete()
					}, error => {
						obs.next(error);
						obs.complete()
					}
				)
		})
	}


	/**
	* Xóa đơn hàng
	* @param listItem là mảng các đơn hàng cần xóa
	*/
	DeleteDemesticOrders(ListData: DTODomesticOrders[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteDemesticOrders.method,
				that.config.getAPIList().DeleteDemesticOrders.url, JSON.stringify(ListData)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete()
					}, error => {
						obs.next(error);
						obs.complete()
					}
				)
		})
	}

	// Xoa sản phẩm
	DeleteOrderProduct(ListData: DTOOrderProducts[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteOrderProduct.method,
				that.config.getAPIList().DeleteOrderProduct.url, JSON.stringify(ListData)).subscribe(
					(res: DTOResponse) => {
						obs.next(res);
						obs.complete()
					}, error => {
						obs.next(error);
						obs.complete()
					}
				)
		})
	}

	// Export excel thông tin chi tiết đơn hàng
	GetExcelAlbumn(typeImport: number, code: number) {
		let that = this;
		var param = {
			'TypeImport': typeImport,
			'Code': code
		}

		return new Observable<any>(obs => {
			that.api.connect(that.config.getAPIList().GetExcelAlbumn.method,
				that.config.getAPIList().GetExcelAlbumn.url, JSON.stringify(param)
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

	// In thông tin chi tiết đơn hàng
	PrintOrderDetail(list: number[]) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().PrintOrderDetail.method,
				that.config.getAPIList().PrintOrderDetail.url, JSON.stringify(list)).subscribe(
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

	// Lấy thông tin đơn hàng
	GetDomesticOrder(item: DTODomesticOrders) {
		let that = this;

		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetDomesticOrder.method,
				that.config.getAPIList().GetDomesticOrder.url, JSON.stringify(item)).subscribe(
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
	* Cập nhập thông tin đơn hàng
	* @param item là đơn hàng hiện tại
	* @param prop là mảng các trường cần cập nhật thông tin của đơn hàng
	*/
	UpdateDomesticOrder(item: DTODomesticOrders, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			DTO: item,
			Properties: prop
		}
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateDomesticOrder.method,
				that.config.getAPIList().UpdateDomesticOrder.url,
				JSON.stringify(param, (k, v) => { return Ps_UtilObjectService.parseDateToString(k, v, ['EstDeliveredTime', 'FinishedTime']) })).subscribe(
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

	// Tạo hóa đơn
	GenerateInvoice(item: DTOOrderDelivery) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GenerateInvoice.method,
				that.config.getAPIList().GenerateInvoice.url,
				JSON.stringify(item)).subscribe(
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
	 * Tạo hóa đơn theo VAT
	 * @param DTODo DO cần tạo hóa đơn
	 * @returns objectReturn
	 */
	GenerateInvoiceByVAT(DTODo: DTOOrderDelivery) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GenerateInvoiceByVAT.method,
				that.config.getAPIList().GenerateInvoiceByVAT.url,
				JSON.stringify(DTODo)).subscribe(
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
	 * Cập nhật sản phẩm trong hóa đơn
	 * @param product sản phẩm cần cập nhật
	 * @returns objectReturn
	 */

	UpdateInvoiceProduct(product: DTOPUROrderInvoiceDetails) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateInvoiceProduct.method,
				that.config.getAPIList().UpdateInvoiceProduct.url,
				JSON.stringify(product)).subscribe(
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
	 * Tạo mới hoá đơn cùng sản phẩm / Thêm sản phẩm vào hoá đơn
	 * @param item Nếu tạo mới thì Delivery = 1 và Invoice = null, ListProduct luôn có 
	 * | Nếu thêm sản phẩm vào hóa đơn Delivery = null, Invoice = 2, ListProduct luôn có
	 */
	AddInvoiceProduct(item: { "Delivery": number, "Invoice"?: number, "ListProduct": DTOPUROrderInvoiceDetails[] | DTOOrderProducts[] }) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().AddInvoiceProduct.method,
				that.config.getAPIList().AddInvoiceProduct.url,
				JSON.stringify(item)).subscribe(
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
	 * Lấy dach sách sản phẩm trong popup THÊM HÀNG HÓA VÀO HÓA ĐƠN
	 * @param item // Lấy tất cả sp trong OrderDeliveryID thì {"Code": 0, "OrderDeliveryID": ... }
	 * Lấy tất cả sp trong OrderDeliveryID theo hoá đơn (1 VAT hoặc nhiều VAT) {"Code": 1, "OrderDeliveryID": ... }
	 */
	GetListProductNotIncludedInvoice(item: { "Code": number, "OrderDeliveryID": number }) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().GetListProductNotIncludedInvoice.method,
				that.config.getAPIList().GetListProductNotIncludedInvoice.url,
				JSON.stringify(item)).subscribe(
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
	 * Cập nhật thông tin đợt giao hàng
	 * @param dto DO cần cập nhật
	 * @returns objectReturn
	 */
	UpdateDeliveryOrder(dto: DTOOrderDelivery) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateDeliveryOrder.method,
				that.config.getAPIList().UpdateDeliveryOrder.url,
				JSON.stringify(dto)).subscribe(
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
	 * Cập nhật thông tin của hóa đơn
	 * @param dto đối tượng là một hóa đơn cần cập nhật
	 * @returns Hóa đơn đã được update
	 */
	UpdateInvoice(dto: DTOOrderInvoice) {
		let that = this;
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateInvoice.method,
				that.config.getAPIList().UpdateInvoice.url,
				JSON.stringify(dto)).subscribe(
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
	 * Cập nhật trạng thái của hóa đơn
	 * @param listdto danh sách hóa đơn cần cập nhật trạng thái
	 * @param statusID trạng thái cần cập nhật
	 * @returns objectReturn
	 */
	UpdateInvoiceStatus(listdto: DTOOrderInvoice[], statusID: number) {
		let that = this;
		let param = { ListDTO: listdto, StatusID: statusID }
		return new Observable<any>(obs => {//DTOResponse
			that.api.connect(that.config.getAPIList().UpdateInvoiceStatus.method,
				that.config.getAPIList().UpdateInvoiceStatus.url,
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

	/**
	 * Hàm import hóa đơn bằng bằng excel
	 * @param data File excel
	 * @param po 
	 */
	ImportExcelInvoice(data: File, po: number) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('Promotion', po.toString())

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportExcelInvoice.method,
				that.config.getAPIList().ImportExcelInvoice.url, form, headers).subscribe(
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
