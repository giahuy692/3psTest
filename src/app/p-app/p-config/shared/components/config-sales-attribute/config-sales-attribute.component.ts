import { Component, Input,OnInit,OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { takeUntil } from 'rxjs/operators';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import { DTOHamperRequest } from '../../dto/DTOConfHamperRequest';
import { ConfigAPIService } from '../../services/config-api.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-config-sales-attribute',
  templateUrl: './config-sales-attribute.component.html',
  styleUrls: ['./config-sales-attribute.component.scss']
})
export class ConfigSalesAttributeComponent {
  @Input() disable = false

  //boolean
  loading = false
  dialogOpen = false
  //DTO
  hamper = new DTOHamperRequest()
  listWareHouse: DTOWarehouse[] = []
  listFilterWareHouse: DTOWarehouse[] = []
  listSelectedWareHouse: DTOWarehouse[] = []

  //Function
  
  listCurrency: any[] = []
  currency: any
  //Unsubcribe
  ngUnsubscribe = new Subject<void>();
  data = [{Code:1,Value:'VND'},{Code:2,Value:'Dola'}]
  //variable
  saveList: DTOWarehouse[] = []

  constructor(
    private configHamperAPI: ConfigHamperApiService,
    private layoutService: LayoutService,
    private layoutAPIService: LayoutAPIService,
    private hamperService: ConfigHamperService,
    public configAPIService: ConfigAPIService,
    public menuService: PS_HelperMenuService,
  ){}

  ngOnInit():void{
    // this.getListCurrency();
    // this.getHamperRequest();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getHamperRequest();
      }
    })
  }

  openDialog(){
    this.dialogOpen = true
  }
  closeDialog(){
    this.dialogOpen = false
  }

  listWareHouseFormat: any[] = []
  
  getHamperRequest(){
    this.loading = true
    this.hamperService.getHamperRequest().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    if(Ps_UtilObjectService.hasValue(res)){
      this.hamper = res
      if(Ps_UtilObjectService.hasValueString(this.hamper.WithoutStores)){
        this.listWareHouseFormat = JSON.parse(this.hamper.WithoutStores)
      }
      this.disable =  this.hamper['isApprover'] && this.hamper['isCreator'] ? false : this.hamper['isApprover'] ? true : false;
      this.getListStore();
    }
   })
  }

  updateStore(){
    if(Ps_UtilObjectService.hasListValue(this.listSelectedWareHouse)){
      var b = JSON.parse(this.hamper.WithoutStores)
      if(!Ps_UtilObjectService.hasListValue(b)){
        var itemJson = JSON.stringify(this.listSelectedWareHouse);
        this.hamper.WithoutStores = itemJson
        this.updateProduct(['WithoutStores'],this.hamper)
      }
      else{
       var itemJson2 =  this.listSelectedWareHouse.concat(this.listWareHouseFormat)
       this.hamper.WithoutStores = JSON.stringify(itemJson2)
       this.updateProduct(['WithoutStores'],this.hamper)
      }
    
    }
  }

  // checkProp() {
  //   if (Ps_UtilObjectService.hasListValue(this.listWareHouse)) {
  //     this.listSelectedWareHouse = []
  //     var wareHouseList: DTOWarehouse[] = []

  //     // JSON.parse(this.hamper.WithoutStores).map(s => {//lọc ra các json bị lỗi \"["\"["\"["\"[" này
  //     //   if (Ps_UtilObjectService.hasValue(s) && Ps_UtilObjectService.hasValue(s.Code) && s.Code != 0)
  //     //   wareHouseList.push(s)
  //     // })
  //     // this.listSelectedWareHouse = this.listWareHouse.filter(s => wareHouseList.findIndex(t => t.Code == s.Code) > -1)
      
  //   }
  // }

  updateProduct(prop: string[], hamper = this.hamper){
    this.loading = true
    this.configAPIService.UpdateProduct(hamper,prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
        this.layoutService.onSuccess("Cập nhật thành công thông tin của Thuộc tính bán hàng")
        this.closeDialog()
        this.listSelectedWareHouse = []
        this.listWareHouseFormat = JSON.parse(res.ObjectReturn.WithoutStores)
        if(prop[0] == "WithoutStores"){
          this.getListStore();
        }
      }
      else{
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin của Thuộc tính bán hàng:  ${res.ErrorString}`)
      }
      this.loading = false
    },err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật của thông tin Thuộc tính bán hàng:  ${err}`)
    })
}

  valueChange(e,sellName:string){
    switch (sellName) {
      default:
        if(e.target.checked)
          this.hamper[sellName] = true
        else
          this.hamper[sellName] = false
        this.updateProduct([sellName],this.hamper)
        break;
    }
    // console.log(this.hamper)
  }

  

  onCheckboxChange(event: any, item: any) {
    if (event.target.checked) {
      this.listSelectedWareHouse.push(item);
    } else {
      const index = this.listSelectedWareHouse.indexOf(item);
      if (index !== -1) {
        this.listSelectedWareHouse.splice(index, 1);
      }
    }
  }


  seach(event) {
    if (Ps_UtilObjectService.hasValueString(event)) {
        this.listWareHouse = this.listFilterWareHouse.filter(item =>
          item.WHName.includes(event))
    } else {
      this.getListStore();
    }
  }

  onClearCheckbox(e: any,item: any){

    var hamperJson = this.listWareHouseFormat
    hamperJson = hamperJson.filter(i => i.Code !== item.Code);
    this.listSelectedWareHouse = hamperJson
    this.hamper.WithoutStores = JSON.stringify(hamperJson)
    this.updateProduct(['WithoutStores'],this.hamper)
  }
  


  // getListCurrency(){
  //   this.loading = true
  //   this.configHamperAPI.GetListCurrency().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
  //         this.listCurrency = res.ObjectReturn
  //         this.currency = res.ObjectReturn[0]
  //     }
  //     else{
  //       this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${res.ErrorString}`)
  //     }
  //     this.loading = false
  //   },err => {
  //     this.loading = false
  //     this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${err}`)
  //   })
  // }

  getListStore() {
    this.loading = true;
     this.layoutAPIService.GetWarehouse().subscribe((res : DTOWarehouse[]) => {
        if(Ps_UtilObjectService.hasListValue(res)){
          this.listWareHouse = res
          this.listFilterWareHouse = res
          if(Ps_UtilObjectService.hasValueString(this.listWareHouseFormat)){
            const b = this.listWareHouseFormat.filter(s => s)
            if(Ps_UtilObjectService.hasListValue(b)){
              this.listWareHouse = res.filter(s => !b.some(itemB => itemB.Code === s.Code));
              this.listFilterWareHouse = this.listWareHouse
            }
          }
        }
        else{
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách cửa hàng`)
        }
        this.loading = false
  }, err => {
    this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách cửa hàng ${err}`)
  });
  }




  ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
