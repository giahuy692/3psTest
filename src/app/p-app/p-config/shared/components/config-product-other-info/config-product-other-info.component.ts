import { Component, Input } from '@angular/core';
import { DTOHamperRequest } from '../../dto/DTOConfHamperRequest';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { Subject } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { takeUntil } from 'rxjs/operators';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
@Component({
  selector: 'app-config-product-other-info',
  templateUrl: './config-product-other-info.component.html',
  styleUrls: ['./config-product-other-info.component.scss']
})
export class ConfigProductOtherInfoComponent {

  @Input() disable = false
  
  @Input() typeInfo: number

  
  loading = false
  //DTO
  hamper = new DTOHamperRequest()
  typeDisplay = false
  //Function

  //Unsubcribe
  ngUnsubscribe = new Subject<void>();


  constructor(
    private layoutService: LayoutService,
    private hamperService: ConfigHamperService,
    private hamperServiceAPI: ConfigHamperApiService,
    public menuService: PS_HelperMenuService,
  ){}

  ngOnInit():void{
    // this.getHamperRequest();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getHamperRequest();
      }
    })
  }  
  reloadDataFrom(){
    this.hamperService.reloadComponent$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getHamperRequest();
  });
}

// GetCache(){
//   const res = JSON.parse(localStorage.getItem('BaseProduct'))
//   if(res.TypeOf == 0 || res.TypeOf == 2){
//     // this.isDisplay = true
//   } else{
//     // this.isDisplay = false
//   }
// }


  getHamperRequest(){
    this.loading = true
    this.disable = true
    this.hamperService.getHamperRequest().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    if(Ps_UtilObjectService.hasValue(res)){
      this.disable = false
      this.hamper = res
     if(!Ps_UtilObjectService.hasValue(this.hamper.VNSpec)){
      this.hamper.VNSpec = ""
     }

      this.checkEmit();
      
    }
   })
  }

  checkEmit(){
    if(this.hamper.Code != 0){
      if(this.hamper.StatusID == 2 || this.hamper.StatusID == 3 || this.hamper['isDisable']){
        this.disable = true
      }
    }
    else{
      this.hamper = new DTOHamperRequest();
      this.disable = true
    }
  }

  updateHamperRequest(prop: string[], hamper = this.hamper){
      this.loading = true
      this.hamperServiceAPI.UpdateHamperRequest(hamper,prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
            this.layoutService.onSuccess("Cập nhật thành công thông tin khác")
            
        }
        else{
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin khác:  ${res.ErrorString}`)
        }
        this.loading = false
      },err => {
        this.loading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin khác:  ${err}`)

      })
  }

  onBlurTextbox(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        default:
          this.updateHamperRequest([prop],this.hamper)
          break
      }
    }
  }


  ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}


}
