import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { DTOConfig, DTOResponse, PS_CommonService, Ps_UtilObjectService } from "src/app/p-lib";
import DTOChannel, { DTOChannelProduct } from "../dto/DTOChannel.dto";
import { DTOUpdate } from "../dto/DTOUpdate";
import { EcommerceApiConfigService } from './ecommerce-api-config.service';
import { DTOChannelGroup } from "../dto/DTOChannelGroup.dto";

@Injectable({
	providedIn: 'root'
})
export class EcomChannelAPIService {

	constructor(
		public api: PS_CommonService,
		public config: EcommerceApiConfigService,
	) { }
	//channel
	GetChannelList(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetChannelList.method,
				that.config.getAPIList().GetChannelList.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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
	GetChannel(item: DTOChannel) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetChannel.method,
				that.config.getAPIList().GetChannel.url,
				JSON.stringify({ 'Code': item.Code })).subscribe(
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

	UpdateChannelStatus(obj: DTOChannel[], statusID: number) {
		let that = this;
		var param = {
			'ListDTO': obj,
			'StatusID': statusID
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateChannelStatus.method,
				that.config.getAPIList().UpdateChannelStatus.url,
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
	UpdateChannel(obj: DTOChannel, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': obj,
			'Properties': prop
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateChannel.method,
				that.config.getAPIList().UpdateChannel.url,
				JSON.stringify(param, (k, v) => Ps_UtilObjectService.parseDateToString(k, v, [])))
				.subscribe(
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

	DeleteChannel(obj: DTOChannel[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteChannel.method,
				that.config.getAPIList().DeleteChannel.url,
				JSON.stringify(obj)).subscribe(
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
	//product
	GetListChannelProduct(state: State) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListChannelProduct.method,
				that.config.getAPIList().GetListChannelProduct.url,
				JSON.stringify(toDataSourceRequest(state))).subscribe(
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
	GetChannelProduct(item: DTOChannelProduct) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetChannelProduct.method,
				that.config.getAPIList().GetChannelProduct.url,
				JSON.stringify({ 'Code': item.Code })).subscribe(
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
	GetChannelProductByCode(barcode: string, channel: number) {
		let that = this;
		var param = {
			'Barcode': barcode,
			'Channel': channel
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetChannelProductByCode.method,
				that.config.getAPIList().GetChannelProductByCode.url, JSON.stringify(param)).subscribe(
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

	UpdateStatusChannelProduct(obj: DTOChannelProduct[], statusID: number) {
		let that = this;
		var param = {
			'ListDTO': obj,
			'StatusID': statusID
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateStatusChannelProduct.method,
				that.config.getAPIList().UpdateStatusChannelProduct.url,
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
	UpdateChannelProduct(obj: DTOChannelProduct, prop: string[]) {
		let that = this;
		var param: DTOUpdate = {
			'DTO': obj,
			'Properties': prop
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateChannelProduct.method,
				that.config.getAPIList().UpdateChannelProduct.url,
				JSON.stringify(param, (k, v) => Ps_UtilObjectService.parseDateToString(k, v, [])))
				.subscribe(
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

	DeleteChannelProduct(obj: DTOChannelProduct[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteChannelProduct.method,
				that.config.getAPIList().DeleteChannelProduct.url,
				JSON.stringify(obj)).subscribe(
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

	UpdateProductQuantity(listProdID: number[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateProductQuantity.method,
				that.config.getAPIList().UpdateProductQuantity.url, JSON.stringify(listProdID)).subscribe(
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
	//
	ImportChannelProduct(data: File, channel: number) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);
		form.append('Channel', channel.toString());

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)
		headers = headers.append('DataPermission', DTOConfig.cache.dataPermission)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportChannelProduct.method,
				that.config.getAPIList().ImportChannelProduct.url, form, headers).subscribe(
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


	// ========= API NHÓM KÊNH BÁN HÀNG =========

	//Danh sách tree của Nhóm kênh bán hàng
	GetListChannelGroup(data: any) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListChannelGroup.method,
				that.config.getAPIList().GetListChannelGroup.url,
				JSON.stringify(data)).subscribe( 
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


	// Lấy danh sách nhóm kênh cấp con
	GetListChildChannelGroup(data: DTOChannelGroup) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListChildChannelGroup.method,
				that.config.getAPIList().GetListChildChannelGroup.url,
				JSON.stringify(data)).subscribe(
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


	// Lấy danh sách kênh trong phân nhóm
	GetListChannelInGroup(data: DTOChannelGroup) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListChannelInGroup.method,
				that.config.getAPIList().GetListChannelInGroup.url,
				JSON.stringify(data)).subscribe(
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


	// Lấy danh sách thứ tự phân bổ tồn kho
	GetListPriority() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListPriority.method,
				that.config.getAPIList().GetListPriority.url,
				JSON.stringify({})).subscribe(
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


	// Cập nhật nhóm kênh
	UpdateChannelGroup(dataUpdate: any) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateChannelGroup.method,
				that.config.getAPIList().UpdateChannelGroup.url,
				JSON.stringify(dataUpdate)).subscribe(
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


	// Xóa nhóm kênh
	DeleteChannelGroup(dataDelete: DTOChannelGroup) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteChannelGroup.method,
				that.config.getAPIList().DeleteChannelGroup.url,
				JSON.stringify(dataDelete)).subscribe(
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



	// ========= API KÊNH BÁN HÀNG =========

	// Lấy danh sách kênh bán hàng
	GetListChannelNew(data: any) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListChannelNew.method,
				that.config.getAPIList().GetListChannelNew.url, JSON.stringify(data)).subscribe(
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

	//Cập nhật trạng thái
	ErpUpdateChannelStatus(obj: DTOChannel[], statusID: number) {
		let that = this;
		var param = {
			'ListDTO': obj,
			'StatusID': statusID
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ErpUpdateChannelStatus.method,
				that.config.getAPIList().ErpUpdateChannelStatus.url,
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


	//Cập nhật kênh
	ErpUpdateChannel(dataUpdate: DTOChannel) {
		let that = this
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ErpUpdateChannel.method,
				that.config.getAPIList().ErpUpdateChannel.url, JSON.stringify(dataUpdate)).subscribe(
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

	// Xóa kênh  
	ErpDeleteChannel(ListData: DTOChannel[]) {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ErpDeleteChannel.method,
				that.config.getAPIList().ErpDeleteChannel.url, JSON.stringify(ListData)).subscribe(
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

	// Danh sách nhóm kênh trực thuộc
	GetListChannelGroupTwoLevel() {
		let that = this;
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListChannelGroupTwoLevel.method,
				that.config.getAPIList().GetListChannelGroupTwoLevel.url,
				JSON.stringify({})).subscribe(
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

	// API mới sản phẩm kênh kinh doanh
	ImportChannelGroupProduct(data: File) {
		let that = this;
		var form: FormData = new FormData();
		form.append('file', data);

		var headers = new HttpHeaders()
		headers = headers.append('Company', DTOConfig.cache.companyid)
		headers = headers.append('DataPermission', DTOConfig.cache.dataPermission)

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().ImportChannelGroupProduct.method,
				that.config.getAPIList().ImportChannelGroupProduct.url, form, headers).subscribe(
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


	// API lấy danh sách sản phẩm thuộc nhóm kênh bán hàng
	GetListProductChannelGroup(KeyWord: string, state: State, ChannelGroup: number, Channel: number){
		let that = this;
		var param = {
			Filter: toDataSourceRequest(state),
			KeyWord: KeyWord,
			ChannelGroup: ChannelGroup,
			Channel: Channel
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListProductChannelGroup.method,
				that.config.getAPIList().GetListProductChannelGroup.url,
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


	// API lấy danh thông rin sản phẩm
	GetChannelGroupProduct(Product : number , Barcode : string, ChannelGroup: number, Channel: number){
		let that = this;
		var param = {
			Product: Product,
			Barcode: Barcode,
			ChannelGroup: ChannelGroup,
			Channel: Channel
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetChannelGroupProduct.method,
				that.config.getAPIList().GetChannelGroupProduct.url,
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

	// API Xóa sản phẩm ra khỏi nhóm kênh
	DeleteChannelGroupProduct(Listitem: DTOChannelProduct[]){
		let that = this;
		console.log(that.config.getAPIList().DeleteChannelGroupProduct.url)
		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().DeleteChannelGroupProduct.method,
				that.config.getAPIList().DeleteChannelGroupProduct.url, JSON.stringify(Listitem)).subscribe(
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

	// API lấy danh sách nhóm kênh kinh doanh
	GetListChannelGroupProduct(Product: number, ChannelGroup: number){
		let that = this;

		var param = {
			Product: Product,
			ChannelGroup: ChannelGroup,
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().GetListChannelGroupProduct.method,
				that.config.getAPIList().GetListChannelGroupProduct.url,
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

	// API Cập nhật tình trạng
	UpdateStatusChannelGroupProduct(obj: DTOChannelProduct[], statusID: number){
		let that = this;
		var param = {
			'ListDTO': obj,
			'StatusID': statusID
		}

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateStatusChannelGroupProduct.method,
				that.config.getAPIList().UpdateStatusChannelGroupProduct.url,
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

	// API Cập nhật tình trạng
	UpdateChannelGroupProduct(item: DTOChannelGroup[]){
		let that = this;

		return new Observable<DTOResponse>(obs => {
			that.api.connect(that.config.getAPIList().UpdateChannelGroupProduct.method,
				that.config.getAPIList().UpdateChannelGroupProduct.url,
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
}
