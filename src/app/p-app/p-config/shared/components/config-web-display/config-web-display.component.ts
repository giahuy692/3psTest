import { Component, Input, ViewChild } from '@angular/core';
import { DTOConfProduct, DTODetailConfProduct } from '../../dto/DTOConfProduct';
import { Subject, from } from 'rxjs';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MarHashtagAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-hashtag-api.service';
import { State } from '@progress/kendo-data-query';
import { DTOMAHashtag } from 'src/app/p-app/p-marketing/shared/dto/DTOMAHashtag.dto';
import { delay, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DTOHamperRequest } from '../../dto/DTOConfHamperRequest';
import { ConfigAPIService } from '../../services/config-api.service';

@Component({
  selector: 'app-config-web-display',
  templateUrl: './config-web-display.component.html',
  styleUrls: ['./config-web-display.component.scss']
})
export class ConfigWebDisplayComponent {
  @ViewChild('multiSelect') multiSelect;
  
  @Input() disable = false 

  //DTO
  product = new DTOHamperRequest()

  //Unsubcribe
  ngUnsubscribe = new Subject<void>();

  
  loading: boolean = false;

  //hashtag
  gridStateH: State = {
    filter: {
      filters: [
        { field: 'StatusID', operator: 'eq', value: 2 }
      ], logic: 'and'
    },
  }
  

  listHashtag: DTOMAHashtag[] = []
  listFilterHashtag: DTOMAHashtag[] = []
  listSelectedHashtag: DTOMAHashtag[] = []

  constructor( private configHamperAPI: ConfigHamperApiService,
    private layoutService: LayoutService,
    private hamperService: ConfigHamperService,
    public configAPIService: ConfigAPIService,
    public marApiService: MarHashtagAPIService,
    private menuService: PS_HelperMenuService){}
    
  ngOnInit():void{
    // this.getHamperRequest();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getHamperRequest();
      }
    })
  }

  getHamperRequest(){
    this.loading = true
    this.hamperService.getHamperRequest().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    if(Ps_UtilObjectService.hasValue(res)){
      this.product = res
      this.disable =  this.product['isApprover'] && this.product['isCreator'] ? false : this.product['isApprover'] ? true : false;
    }
    if(this.product.Code != 0){
      this.GetListHashtag();
    }
   })
  }

  // Get List Hashtag
  GetListHashtag() {
    this.loading = true;
    var ctx = 'Danh sách hashtag'
    this.marApiService.GetListHashtag(this.gridStateH).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listHashtag = res.ObjectReturn.Data;
        this.listFilterHashtag = res.ObjectReturn.Data;
        this.onMultiSelectFilter()
        this.checkProp()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
 

  //
  checkProp() {
    if (Ps_UtilObjectService.hasValueString(this.product.ListTag) && Ps_UtilObjectService.hasListValue(this.listHashtag)) {
      this.listSelectedHashtag = []
      var tagList: DTOMAHashtag[] = []

      JSON.parse(this.product.ListTag).map(s => {//lọc ra các json bị lỗi \"["\"["\"["\"[" này
        if (Ps_UtilObjectService.hasValue(s) && Ps_UtilObjectService.hasValue(s.Code) && s.Code != 0)
          tagList.push(s)
      })
      this.listSelectedHashtag = this.listHashtag.filter(s => tagList.findIndex(t => t.Code == s.Code) > -1)
      if(this.listSelectedHashtag.length <= 0){
        // var defaultParent: DTOMAHashtag = new DTOMAHashtag({ Code: null, TagName: '--Chọn--'});
        // this.listSelectedHashtag = [defaultParent]
        // console.log(this.listSelectedHashtag)
      }
    }
  }

  updateProduct(prop: string[], product = this.product){
    this.loading = true
    this.configAPIService.UpdateProduct(product,prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
          this.layoutService.onSuccess("Cập nhật thành công thuộc tính hiển thị Website")
      }
      else{
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thuộc tính hiển thị Website:  ${res.ErrorString}`)
      }
      this.loading = false
    },err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thuộc tính hiển thị Website:  ${err}`)
    })
}

UpdateProductListTag(product: DTODetailConfProduct = this.product) {
  product.ListTag = JSON.stringify(this.listSelectedHashtag)
  this.loading = true;

  this.configAPIService.UpdateProductListTag(product).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
    if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
      this.layoutService.onSuccess('Cập nhật hashtag sản phẩm thành công');
    } else
      this.layoutService.onError('Đã xảy ra lỗi khi cập nhật hashtag sản phẩm');

    this.loading = false;
  }, () => {
    this.loading = false;
    this.layoutService.onError('Đã xảy ra lỗi khi cập nhật hashtag sản phẩm')
  });
}

  onTextboxLoseFocus(propName:string){
    if (Ps_UtilObjectService.hasValueString(propName)) {
      switch (propName) {
        case 'ListTag':
          // if(Ps_UtilObjectService.hasListValue(this.listSelectedHashtag)){
            this.UpdateProductListTag()
          // }
          break
        default:
          this.updateProduct([propName],this.product)
          break
      }
    }
  }

  //autorun
  onMultiSelectFilter() {
    const contains = (value) => (s: DTOMAHashtag) =>
      s.TagName?.toLowerCase().indexOf(value?.toLowerCase()) !== -1
      || s.TagCode?.toLowerCase().indexOf(value?.toLowerCase()) !== -1;

    this.multiSelect?.filterChange.asObservable().pipe(
      switchMap((value) =>
        from([this.listHashtag]).pipe(
          tap(() => (this.loading = true)),
          delay(this.layoutService.typingDelay),
          map((data) => data.filter(contains(value)))
        )
      )
    ).subscribe((x) => {
      this.listFilterHashtag = x;
      this.loading = false
    });
  }

  getRes(img: string) {
    return Ps_UtilObjectService.getImgRes(img)
  }

  ngOnDestroy():void{
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
