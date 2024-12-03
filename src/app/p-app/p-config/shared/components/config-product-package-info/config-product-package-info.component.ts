import { Component,Input, OnInit,OnDestroy} from '@angular/core';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { DTOHamperRequest } from '../../dto/DTOConfHamperRequest';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { FilterDescriptor, State } from '@progress/kendo-data-query';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';


@Component({
  selector: 'app-config-product-package-info',
  templateUrl: './config-product-package-info.component.html',
  styleUrls: ['./config-product-package-info.component.scss']
})
export class ConfigProductPackageInfoComponent {
  @Input() disable = false 
  
  loading = false
  //DTO
  hamper = new DTOHamperRequest()
  listPackingUnit: any[] = [];
  currentBaseUnit: any
  //Function

  //Unsubcribe
  ngUnsubscribe = new Subject<void>();

  //state
  gridState: State = {
    filter: { filters: [], logic: 'and' },
  }

  filterParentBarcode: FilterDescriptor = {
    field: "TypeData", operator: "eq", value: 1
  }


  constructor(
    private configHamperAPI: ConfigHamperApiService,
    private layoutService: LayoutService,
    private hamperService: ConfigHamperService,
    public menuService: PS_HelperMenuService,
  ){}

  ngOnInit():void{
    // this.getData();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getData();
      }
    })
  }

  getData(){
    this.getHamperRequest();
  }
  
//   reloadDataFrom(){
//     this.hamperService.reloadComponent$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
//       this.getListPackingUnit();
//   });
// }

  getHamperRequest(){
    this.disable = true
    this.hamperService.getHamperRequest().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    if(Ps_UtilObjectService.hasValue(res)){
      this.disable = false
      this.hamper = res
      this.checkEmit();
    }
   })
  }

  checkEmit(){
    if(this.hamper.Code != 0){
      if(!this.hamper['hasUpdateStatus']){
        this.getListPackingUnit();
      }
      if(this.hamper.StatusID == 2 || this.hamper.StatusID == 3 || this.hamper['isDisable']){
        this.disable = true
      }
      
    }
    else{
      this.hamper = new DTOHamperRequest();
      this.disable = true
      this.currentBaseUnit = {}
    }
  }

  updateHamperRequest(prop: string[], hamper = this.hamper){
      this.loading = true
      this.configHamperAPI.UpdateHamperRequest(hamper,prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
            this.layoutService.onSuccess("Cập nhật thành công thông tin Đóng gói");
        }
        else{
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Đóng gói:  ${res.ErrorString}`)
        }
        this.loading = false
      },err => {
        this.loading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Đóng gói:  ${err}`)
      })
  }

  onBlurTextbox(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        default:
            if(Ps_UtilObjectService.hasValueString(this.hamper.Barcode)){
              this.updateHamperRequest([prop],this.hamper)
            }
          break
      }
    }
  }

  getListPackingUnit() {
    this.loading = true
    this.gridState.filter.filters = []
    this.gridState.filter.filters.push(this.filterParentBarcode)
    this.configHamperAPI.GetListPackingUnit(this.gridState).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPackingUnit = res.ObjectReturn.Data
        this.currentBaseUnit = res.ObjectReturn.Data.find(s => s.Code == this.hamper.BaseUnit)
      } else {
        this.layoutService.onError(`Lỗi lấy danh sách Đơn vị sản phẩm: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Lỗi lấy danh sách Đơn vị sản phẩm: ${err}`);
      this.loading = false
    })
  }

  onDropdownlistClick(event,propName:string[]){
    if(propName[0] == 'BaseUnit'){
      if(Ps_UtilObjectService.hasValueString(this.hamper.Barcode)){
        this.hamper.BaseUnit = event.Code
        this.updateHamperRequest(propName,this.hamper)
      }
     
    }
  }


  ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
