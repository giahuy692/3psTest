import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DTOConfHamperProducts, DTOHamperRequest } from '../../shared/dto/DTOConfHamperRequest';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigHamperService } from '../../shared/services/config-hamper.service';
import { ConfigHamperApiService } from '../../shared/services/config-hamper-api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { MatSidenav } from '@angular/material/sidenav';
import { DTODetailConfProduct } from '../../shared/dto/DTOConfProduct';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-config003-enterprise-product-detail',
  templateUrl: './config003-enterprise-product-detail.component.html',
  styleUrls: ['./config003-enterprise-product-detail.component.scss']
})
export class Config003EnterpriseProductDetailComponent implements OnInit, OnDestroy{

  @ViewChild('formDrawer') drawer: MatSidenav;

  //DTO
  product = new DTODetailConfProduct();
  combo = new DTODetailConfProduct()
  hamper = new DTOHamperRequest();
  productInHamper = new DTOConfHamperProducts();
  quantity: number

  // boolean
  isDisplay: boolean = true
  lockBarcode:boolean = true;
  checkProduct:boolean = false;
  addNewItem:boolean = false;
  loading: boolean = false;

  // Subject
  Unsubscribe = new Subject<void>();

  constructor(  
    private hamperService: ConfigHamperService,
    private hamperServiceAPI: ConfigHamperApiService,
    private layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
  ){}

  ngOnInit(): void {
    // this.GetCache()
    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetCache()
      }
    })
  }

  // cache
  GetCache(){
    const res = JSON.parse(localStorage.getItem('Hamper'))
    this.getHamperRequest();
    if(res.TypeData == 1 || res.TypeData == 2){
      this.isDisplay = true
    } else{
      this.isDisplay = false
    }
  }

  // api

  getHamperRequest(){
    this.hamperService.getHamperRequest().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
    if(Ps_UtilObjectService.hasValue(res)){
      this.hamper = res
     
    }
   })
  }

  getProductInHamper(){
    this.hamperService.getProductInHamper().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if(Ps_UtilObjectService.hasValue(res)){
        this.productInHamper = res
        this.quantity = this.productInHamper.ChildQty
        if(this.productInHamper.Code == 0 ){
          this.lockBarcode = false
          this.addNewItem = true
          this.checkProduct = true
        }
        else{
          this.checkProduct = false
          this.addNewItem = false
        }
      }
      
    },err => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin sản phẩm thuộc Hamper ${err}` )
    })
  }  

  updateBaseHamperProduct(product: DTOConfHamperProducts){
    this.loading = true
    this.hamperServiceAPI.UpdateBaseHamperProduct(product).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
          this.layoutService.onSuccess("Cập nhật thành công sản phẩm thuộc Hamper");
          this.closeDrawer();
          this.hamperService.ReloadList();
          
      }
      else{
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${res.ErrorString}`)
      }
      this.loading = false
    },err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${err}`)
    })
  }

  getProductForHamper(Barcode:string,hamper:number){
    this.checkProduct = true
    if(Ps_UtilObjectService.hasValueString(Barcode)){
      this.hamperServiceAPI.GetProductForHamper(Barcode,hamper).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0){
          this.product = res.ObjectReturn
          this.productInHamper.ChildBarcode = res.ObjectReturn.Barcode
          this.productInHamper.ChildName = res.ObjectReturn.VNName
          this.productInHamper.URLThumbImage = res.ObjectReturn.ImageSetting
          this.quantity = 1
          this.layoutService.onSuccess("Tìm thành công sản phẩm")
          if(Ps_UtilObjectService.hasValueString(this.productInHamper.ChildBarcode) &&  this.product.Code != 0){
            this.checkProduct = false
          }
        }
        else{
          this.layoutService.onError(`Không tìm thấy sản phẩm này: ${res.ErrorString} `)
          this.productInHamper.URLThumbImage = null
          this.productInHamper.ChildName = null
          this.quantity = null
        }
      },err => {
        this.layoutService.onError(`Không tìm thấy sản phẩm này: ${err} `)
      })
  }
    else{
      // this.product = product.

      this.lockBarcode = false
    }
  }

  // end api

  // action
    // content

      // header

        loadPage(){
          this.hamperService.ReloadComponent();
        }
    
      // end header
        handleDataChange(event){

        }

        openDrawer(){
          this.drawer.open();
          this.lockBarcode = true
          this.getProductInHamper()
        }
      // body

      // end body
   
    // end content

    // Drawer
      onTextboxBlur(product: DTOConfHamperProducts){
        if(Ps_UtilObjectService.hasValue(product.ChildBarcode)){
          this.getProductForHamper(product.ChildBarcode,this.hamper.Code);
        }  
      }

      closeDrawer(){
        this.drawer.close();
      }

      onUpdate(product:DTOConfHamperProducts){
        if(product.Code != 0){
          if(Ps_UtilObjectService.hasValueString(this.quantity) && this.quantity > 0){
            product.ChildQty = this.quantity
            this.updateBaseHamperProduct(product)
          }
          else{
            this.layoutService.onWarning("Bạn chưa nhập vào số lượng sản phẩm có trong hamper")
          }
        }
        else{
          if(Ps_UtilObjectService.hasValue(this.product.Code) &&
           Ps_UtilObjectService.hasValueString(this.productInHamper.ChildBarcode) &&
            Ps_UtilObjectService.hasValueString(this.productInHamper.ChildName)){
              if(this.quantity != 0 && Ps_UtilObjectService.hasValueString(this.quantity)){
                product.ChildQty = this.quantity
                var itemProduct = {...product,Child:this.product.Code,Parent:this.hamper.Code}
                this.updateBaseHamperProduct(itemProduct)
              }
              else{
                this.layoutService.onWarning("Vui lòng nhập số lượng sản phẩm")
              }
          }
          else{
            this.layoutService.onWarning("Vui lòng nhập mã sản phẩm")
          }
        }
      }
  
  
    // end Drawer


  // end action

  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}
