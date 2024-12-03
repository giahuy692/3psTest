import { Component } from '@angular/core';
import { DTOHamperRequest } from '../../dto/DTOConfHamperRequest';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DTOLabel } from '../../dto/DTOConfProduct';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-config-product-label',
  templateUrl: './config-product-label.component.html',
  styleUrls: ['./config-product-label.component.scss']
})
export class ConfigProductLabelComponent {
  //DTO
  hamper = new DTOHamperRequest();
  stickerList: DTOLabel[] = [];
  sticker = new DTOLabel();

  disable:boolean = false

  listItem = [{code:1,item: "A", detail: 'Tem khổ nhỏ kích thước 150 x150 mm',isCheckboxChecked: false},
  {code:2,item: "A", detail: 'Tem khổ nhỏ kích thước 150 x150 mm',isCheckboxChecked: false},
  {code:3,item: "A", detail: 'Tem khổ nhỏ kích thước 150 x150 mm',isCheckboxChecked: false},]

  selectedSticker: any = null;

  ngUnsubscribe = new Subject<void>();

  loading = false
  disableText= false
  dialogOpen = false

  constructor(public configHamperAPI: ConfigHamperApiService,
   public layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
    public hamperService: ConfigHamperService ){}

  ngOnInit():void {
    // this.getHamperRequest();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getHamperRequest();
      }
    })
  }

  closeDialog(){
    this.dialogOpen = false
    this.selectedSticker.Selected = true
    this.disableText = false
  }
  openDialog(){
    this.dialogOpen = true
  }
  delete(list){
    this.deleteProductSticker(list)
  }

  getHamperRequest(){
    this.hamperService.getHamperRequest().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    if(Ps_UtilObjectService.hasValue(res)){
      this.hamper = res
      if(this.hamper.Code != 0 && this.hamper.Company > 0){
        this.GetListProductSticker();
      }
      this.disable =  this.hamper['isApprover'] && this.hamper['isCreator'] ? false : this.hamper['isApprover'] ? true : false;
    }  
   })
 
  }

  GetListProductSticker(){
      this.loading = true
      this.configHamperAPI.GetListProductSticker(this.hamper.Code,this.hamper.Company).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
          this.stickerList = res.ObjectReturn
        }
        else{
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Tem nhãn:  ${res.ErrorString}`)
        }
        this.loading = false
      },err => {
        this.loading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Hamper:  ${err}`)
      })
  }

  updateProductSticker(sticker = this.sticker){
    this.loading = true
    this.configHamperAPI.UpdateProductSticker(sticker).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
          this.selectedSticker.Code = res.ObjectReturn.Code
          this.layoutService.onSuccess("Cập nhật thành công thông tin tem nhãn");
      }
      else{
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin tem nhãn:  ${res.ErrorString}`)
      }
      this.loading = false
    },err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin tem nhãn:  ${err}`)
    })
}

deleteProductSticker(sticker = this.sticker){
  this.loading = true
  this.configHamperAPI.DeleteProductSticker(sticker).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
        this.layoutService.onSuccess("Hủy thành công tem nhãn");
        this.selectedSticker = null
        this.dialogOpen = false
        this.GetListProductSticker();
    }
    else{
      this.layoutService.onError(`Đã xảy ra lỗi khi Hủy tem nhãn:  ${res.ErrorString}`)
    }
    this.loading = false
  },err => {
    this.loading = false
    this.layoutService.onError(`Đã xảy ra lỗi khi Hủy tem nhãn:  ${err}`)
  })
}


  
  // isCheckTwoRole:boolean = false

  onChangeClick(item: any) {
    this.selectedSticker = item;
    this.disableText = true
    // this.isCheckTwoRole =  this.hamper['isApprover'] && this.hamper['isCreator'] ? false : this.hamper['isCreator'] ? true : false
    if(item.Selected){
      this.disableText = this.disable
    }
    
   
  
  }
  onCheckboxChange(e:any,item: any) {
    if(item == this.selectedSticker){
      item.Company = this.hamper.Company
        if(e.target.checked){
          item.Selected = true
          this.disableText = false
        }
        else{
          item.Selected = false
          this.disableText = true
          if(Ps_UtilObjectService.hasValue(item.Code)){
            this.openDialog();
          }
        }
    }
  }

  onBlurTextbox(item:DTOLabel,propName:string){
    if(Ps_UtilObjectService.hasValueString(this.selectedSticker[propName])){
      item[propName] = this.selectedSticker[propName]
      item.Company =  this.hamper.Company
      this.updateProductSticker(item)
      }
    }


    ngOnDestroy(): void {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }



  

