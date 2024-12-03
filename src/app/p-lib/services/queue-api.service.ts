import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigApiConfigService } from 'src/app/p-app/p-config/shared/services/config-api-config.service';
import { DashboardApiConfigService } from 'src/app/p-app/p-dashboard/shared/services/dashboard-api-config.service';
import { DeveloperApiConfigService } from 'src/app/p-app/p-developer/shared/services/developer-api-config.service';
import { EcommerceApiConfigService } from 'src/app/p-app/p-ecommerce/shared/services/ecommerce-api-config.service';
import { HriApiConfigService } from 'src/app/p-app/p-hri/shared/services/hri-api-config.service';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LogApiConfigService } from 'src/app/p-app/p-log/shared/services/log-api-config.service';
import { MarketingApiConfigService } from 'src/app/p-app/p-marketing/shared/services/marketing-api-config.service';
import { PortalApiConfigService } from 'src/app/p-app/p-portal/shared/services/portal-api-config.service';
import { PurApiConfigService } from 'src/app/p-app/p-purchase/shared/services/pur-api-config.service';
import { SaleApiConfigService } from 'src/app/p-app/p-sale/shared/services/sale-api-config.service';
import { DTOAPI } from '../dto/dto.api';
import { DTOResponse } from '../dto/dto.response';
import { Ps_UtilObjectService } from '../utilities/utility.object';
import { PS_CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class QueueApiService {
  listApiQueue: { data: any, prop: string[], message: string }[] = []; // Danh sách các api đang nằm trong hàng chờ
  runningApi: boolean = false; // trạng thái đang gọi api hay không
  loading: boolean = false; // trạng thái api đang gọi

  listConfigAPI: any; // biến tổng hợp tất cả các config service
  
  //Subscriptions
  ngUnsubscribe = new Subject<void>();

  constructor(public api: PS_CommonService,
		public configConfig: ConfigApiConfigService,
		public configDashboard: DashboardApiConfigService,
		public configDev: DeveloperApiConfigService,
		public configEcom: EcommerceApiConfigService,
		public configHri: HriApiConfigService,
		public configLayout: LayoutApiConfigService,
		public configLog: LogApiConfigService,
		public configMar: MarketingApiConfigService,
		public configPortal: PortalApiConfigService,
		public configPurchase: PurApiConfigService,
		public configSale: SaleApiConfigService,
    private layoutService: LayoutService,) { 
      this.listConfigAPI = {
        ...configConfig.getAPIList(),
        ...configDashboard.getAPIList(),
        ...configDev.getAPIList(),
        ...configEcom.getAPIList(),
        ...configHri.getAPIList(),
        ...configLayout.getAPIList(),
        ...configLog.getAPIList(),
        ...configMar.getAPIList(),
        ...configPortal.getAPIList(),
        ...configPurchase.getAPIList(),
        ...configSale.getAPIList(),
      }
    }

  // hàm xử lý data trước khi gọi api 
  /**
   * @param updateData: data cần cập nhật cho lần gọi api đó
   * @param props: những thuộc tính cần được cập nhật trong lần gọi api đó
   * @param nameApi: tên api muốn dùng để cập nhật
   * @param message: trường thông tin của lần cập nhật đó: ví dụ "Phân loại đợt đánh giá"
   * @param handlebindDataUI: hàm callback dùng để xử lý logic bind giá trị lên UI đó nếu những ko còn api nào đang nằm trong hàng chờ
   * @param fieldStartDate: danh sách cách trường lưu trữ ngày bắt đầu cần parseLocalDateTimeToString string trước khi cập nhật 
   * @param fieldEndDate: danh sách cách trường lưu trữ ngày kết thúc cần parseLocalDateTimeToString string trước khi cập nhật 
   */
  addApiQueue(updateData: any, props: string[], nameApi: string, message: string, handlebindDataUI: (data: any) => void, fieldStartDate?: string[], fieldEndDate?: string[] ) {
    // lấy data từ form
    this.listApiQueue.push({ data: updateData, prop: props, message: message }); // Thêm data và trường cập nhật đó vào form  

    if (this.listApiQueue.length > 0 && !this.runningApi) { // Kiểm tra xem có data nào đang chờ gọi api không
      this.handleImplementQueueApi(this.listApiQueue, nameApi, handlebindDataUI, fieldStartDate, fieldEndDate);
    }
  }

  handleImplementQueueApi(listApiQueue: { data: any, prop: string[], message: string }[], nameApi: string, handlebindDataUI: (data: any) => void, fieldStartDate?: string[], fieldEndDate?: string[]) {
    this.runningApi = true;

    // Kiểm tra có api nào đang chờ để gọi không
    const currentItem = listApiQueue[0]; // Lấy param đầu tiên

    this.APICustom(nameApi, currentItem.data, currentItem.prop, fieldStartDate, fieldEndDate).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode === 0 && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
        this.layoutService.onSuccess(`Cập nhật ${currentItem.message} thành công`);
        let itemFirst = res.ObjectReturn; 
  
        //trường hợp tạo mới thêm 
        listApiQueue.forEach(s =>{
            if(s.data.Code == 0){
                s.data.Code = itemFirst.Code
            }
        })
  
        // Xóa item đầu tiên khỏi hàng đợi
        listApiQueue.shift()
  
        // gọi lại hàm nếu còn hàng chờ
        if(Ps_UtilObjectService.hasListValue(listApiQueue)){
            this.handleImplementQueueApi(listApiQueue, nameApi, handlebindDataUI, fieldStartDate, fieldEndDate)
        } 
        else{
            //gán giá trị cập nhập lần cuối lên UI và dừng gọi api
            handlebindDataUI(res.ObjectReturn)
            this.runningApi = false;
        }

      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${currentItem.message}: ${res.ErrorString}`);
      }
    })

  }

  APICustom(NameAPI: string, data: any, props: string[], fieldStartDate?: string[], fieldEndDate?: string[]) {
		let that = this;
    const update = {
			DTO: data,
			Properties: props
		}
		return new Observable<DTOResponse>(obs => {
			that.api.connect(this.listConfigAPI[NameAPI].method,
				this.listConfigAPI[NameAPI].url,
				JSON.stringify(update, Ps_UtilObjectService.hasListValue(fieldStartDate) && Ps_UtilObjectService.hasListValue(fieldEndDate) ? (k, v) => Ps_UtilObjectService.parseLocalDateTimeToString(k, v, fieldStartDate, fieldEndDate) : null)).subscribe(
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
