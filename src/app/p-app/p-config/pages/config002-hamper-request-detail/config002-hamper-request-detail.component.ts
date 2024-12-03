import { Component, ViewChild,OnDestroy } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { DTOConfHamperProducts, DTOHamperRequest } from '../../shared/dto/DTOConfHamperRequest';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { ConfigHamperService } from '../../shared/services/config-hamper.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ConfigHamperApiService } from '../../shared/services/config-hamper-api.service';
import { DTODetailConfProduct } from '../../shared/dto/DTOConfProduct';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { distinct } from '@progress/kendo-data-query';

@Component({
  selector: 'app-config002-hamper-request-detail',
  templateUrl: './config002-hamper-request-detail.component.html',
  styleUrls: ['./config002-hamper-request-detail.component.scss']
})
export class Config002HamperRequestDetailComponent {

  @ViewChild('formDrawer') drawer: MatSidenav;

  //DTO
  product = new DTOHamperRequest();
  productCache = new DTOConfHamperProducts();
  hamper = new DTOHamperRequest();
  listCompany: DTODetailConfProduct[] = []
  listProduct: DTOConfHamperProducts[] = []
  
  quantity: number
  //UnSubcribes
  Unsubscribe = new Subject<void>();
  arrBtnStatus: any = [];

  //boolean
  loading: boolean = false;
  lockBarcode:boolean = true;
  addNewItem:boolean = false;
  checkProduct:boolean = false;
  dialogOpen:boolean = false;

   // permission
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false



  constructor(private layoutService: LayoutService,
  private  hamperService: ConfigHamperService,
  private hamperServiceAPI: ConfigHamperApiService,
  public menuService: PS_HelperMenuService,
  ){}

  ngOnInit() :void{
    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        //action permission
        this.isMaster = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        // this.isMaster = false
        // this.isCreator = true
        // this.isApprover = false
        //Chỉ được xem
        this.isAllowedToViewOnly = this.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(this.actionPerm.filter(s => s.ActionType != 6))
      }
  })
  this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
    if (Ps_UtilObjectService.hasValue(res)) {
      this.getProductInHamper();
      this.getHamperRequest();
    }
  })
  //  this.getProductInHamper();
  //  this.getHamperRequest();
  }

  loadData(){
    if(this.hamper.Code != 0){
      this.hamperService.ReloadComponent();
    }
  }
  

  closeDialog(){
    this.dialogOpen = false
  }
  openDialog(){
    this.dialogOpen = true
  }
  update(){
    this.DeleteHamperRequest(this.hamper.Code)
  }
  
 

// lấy giá trị mới từ component product info
  handleInfoChange(hamper: DTOHamperRequest) {
      if(Ps_UtilObjectService.hasValue(hamper)){
          this.hamper = hamper
          this.setupBtnStatus();
          this.handleBtnStatus(hamper)
      }
  }
  handleListProdChange(ListProd: any) {
    if(Ps_UtilObjectService.hasValue(ListProd)){
       this.listProduct = ListProd
    }
}

  handleCompanyChange(company: any) {
    if(Ps_UtilObjectService.hasValue(company)){
       this.listCompany = company
    }
}



  //lấy hamper từ component qua service
  getHamperRequest(){
    this.hamperService.getHamperRequest().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
    if(Ps_UtilObjectService.hasValue(res)){
      this.hamper = res
      this.setupBtnStatus();
    }
   })
  }

  

  // kiểm tra tất cả item từ hamper đã đủ chưa thì cho phép update Status
  checkProp(listHamper: DTOHamperRequest[]): boolean {
    
    let missingField: string | null = null;
    const allItemsHaveValues = listHamper.some(s => {
       
        if (!Ps_UtilObjectService.hasValueString(s.Barcode)) {
          missingField = ' nhập vào Barcode';
        }
        else if (!Ps_UtilObjectService.hasValueString(s.VNName)) {
            missingField = ' nhập vào Tên tiếng Việt';
        }
        else if (!Ps_UtilObjectService.hasValueString(s.URLThumbImage)) {
          missingField = 'chọn Hình ảnh cho hamper';
        }
        // else if (!Ps_UtilObjectService.hasValueString(s.BaseUnit)) {
        //   missingField = 'Đơn vị sản phẩm';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.BaseUnitL)) {
        //   missingField = 'Kích thước sản phẩm';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.BaseUnitW)) {
        //   missingField = 'Kích thước sản phẩm';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.BaseUnitH)) {
        //   missingField = 'Kích thước sản phẩm';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.BaseUnitWeight)) {
        //   missingField = 'Kích thước sản phẩm';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.InnerBase)) {
        //   missingField = 'Quy đổi quy cách sản phẩm';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.InnerL)) {
        //   missingField = 'Kích thước inner';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.InnerW)) {
        //   missingField = 'Kích thước inner';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.InnerH)) {
        //   missingField = 'Kích thước inner';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.InnerWeight)) {
        //   missingField = 'Kích thước inner';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.CartonL)) {
        //   missingField = 'Kích thước carton';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.CartonW)) {
        //   missingField = 'Kích thước carton';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.CartonH)) {
        //   missingField = 'Kích thước carton';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.CartonWeight)) {
        //   missingField = 'Kích thước carton';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.PalletL)) {
        //   missingField = 'Kích thước carton';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.PalletW)) {
        //   missingField = 'Kích thước pallet';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.PalletH)) {
        //   missingField = 'Kích thước pallet';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.PalletWeight)) {
        //   missingField = 'Kích thước pallet';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.CartonBase)) {
        //   missingField = 'Quy đổi quy cách sản phẩm';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.PalletBase)) {
        //   missingField = 'Quy đổi quy cách sản phẩm';
        // }
        // else if (!Ps_UtilObjectService.hasValueString(s.VNSpec)) {
        //   missingField = 'Thông số kỹ thuật';
        // }
        else if (!Ps_UtilObjectService.hasListValue(this.listProduct)) {
          missingField = 'chọn Sản phẩm thuộc hamper';
        }
        else if (!Ps_UtilObjectService.hasListValue(this.listCompany)) {
          missingField = ' chọn Công ty áp dụng';
        }
        // else if(Ps_UtilObjectService.hasListValue(this.listCompany)){
        //   console.log(this.listCompany)
        //   this.listCompany.forEach(s => {
        //       if(Ps_UtilObjectService.hasValue(s.GroupID1) 
        //       && Ps_UtilObjectService.hasValue(s.GroupID2) 
        //       && Ps_UtilObjectService.hasValue(s.GroupID3)){
        //         missingField = 'chọn đủ phân nhóm cho Công ty';
        //       }
        //   })
        // }
        return !missingField; 
    });

    if (!allItemsHaveValues && missingField !== null) {
       this.layoutService.onWarning(`Bạn chưa ${missingField}`)
    }

    return allItemsHaveValues;
  }
  

  //lấy hamper từ component list
  getProductInHamper(){
    this.hamperService.getProductInHamper().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if(Ps_UtilObjectService.hasValue(res)){
        this.productCache = res
        this.quantity = this.productCache.ChildQty
        if(this.productCache.Code == 0 ){
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


  getProductForHamper(Barcode:string,hamper:number){
    this.checkProduct = true
    if(Ps_UtilObjectService.hasValueString(Barcode)){
      this.hamperServiceAPI.GetProductForHamper(Barcode,hamper).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0){
          this.product = res.ObjectReturn
          this.productCache.ChildBarcode = res.ObjectReturn.Barcode
          this.productCache.ChildName = res.ObjectReturn.VNName
          this.productCache.URLThumbImage = res.ObjectReturn.ImageSetting
          this.quantity = 1
          
          this.layoutService.onSuccess("Tìm thành công sản phẩm")
          if(Ps_UtilObjectService.hasValueString(this.productCache.ChildBarcode) &&  this.product.Code != 0){
            this.checkProduct = false
          }
        }
        else{
          this.layoutService.onError(`Không tìm thấy sản phẩm này: ${res.ErrorString} `)
          this.productCache.URLThumbImage = null
          this.productCache.ChildName = null
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
         Ps_UtilObjectService.hasValueString(this.productCache.ChildBarcode) &&
          Ps_UtilObjectService.hasValueString(this.productCache.ChildName)){
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

    onTextboxBlur(product:DTOConfHamperProducts){
      if(Ps_UtilObjectService.hasValueString(product.ChildBarcode)){
        this.getProductForHamper(product.ChildBarcode,this.hamper.Code);
      }
    }

    updateBaseHamperProduct(product: DTOConfHamperProducts){
      this.loading = true
      this.hamperServiceAPI.UpdateBaseHamperProduct(product).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
            this.layoutService.onSuccess("Cập nhật thành công sản phẩm thuộc Hamper");
            this.closeDrawer();
            this.hamperService.ReloadList();
            this.hamperService.ReloadApplyCompany();
        }
        else{
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${res.ErrorString}`)
          
          this.hamperService.ReloadList();
        }
        this.loading = false
      },err => {
        this.loading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${err}`)
        this.hamperService.ReloadList();
        this.closeDrawer();
      })
  }

  UpdateHamperStatus(items: DTOHamperRequest[] = [this.hamper], statusID = this.hamper.StatusID){
    this.loading = true
    var ctx = 'Cập nhật tình trạng'
      this.hamperServiceAPI.UpdateProductStatus(items, statusID).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)
          this.hamperService.ReloadHamPro();
       } else{
         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
         this.hamperService.ReloadHamPro();
       }
  
        this.loading = false;
      },() =>{
        this.loading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
        this.hamperService.ReloadHamPro();
      }
      )
    
  }

  DeleteHamperRequest(code: number){
    this.loading = true;
    var ctx = `Đã xảy ra lỗi khi xóa Hamper`
    this.hamperServiceAPI.DeleteHamperRequest(code).pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess('Xóa Hamper thành công');
        this.closeDialog();
        this.AddNew();
      }else
        this.layoutService.onError(`${ctx}: ${res.ErrorString}!`)

        this.loading = false;
      },
      (error) => {
        this.layoutService.onError(`${ctx}: ${error}`);
        this.loading = false;
      }
    );
  }

  setupBtnStatus() {
    this.arrBtnStatus = [];
    if (this.hamper.Code != 0) {
      if ((this.hamper.StatusID == 0 || this.hamper.StatusID == 4) && (this.isMaster || this.isCreator)) {
        this.arrBtnStatus.push({
          text: 'GỬI DUYỆT',
          class: 'btnGuiDuyet',
          code: 'redo',
          link: 1,
        });
      }
      if (this.hamper.StatusID == 1 && (this.isMaster || this.isApprover)) {
        this.arrBtnStatus.push({
          text: 'TRẢ VỀ',
          class: 'btnTraVe',
          code: 'undo',
          link: 4,
        });
        this.arrBtnStatus.push({
          text: 'PHÊ DUYỆT',
          class: 'btn-aplication',
          code: 'check-outline',
          link: 2,
        });
      }
      if (this.hamper.StatusID == 2 && (this.isMaster || this.isApprover)) {
        this.arrBtnStatus.push({
          text: 'NGƯNG ÁP DỤNG',
          class: 'btnNgunghienthi',
          code: 'minus-outline',
          link: 3,
        });
      }
      if (this.hamper.StatusID == 3 && (this.isMaster || this.isApprover)) {
        this.arrBtnStatus.push({
          text: 'TRẢ VỀ',
          class: 'btnTraVe',
          code: 'undo',
          link: 4,
        },{
          text: 'PHÊ DUYỆT',
          class: 'btn-aplication',
          code: 'check-outline',
          link: 2,
        });
      }
    }
  }

  AddNew(){
    var newItem = new DTOHamperRequest();
    localStorage.setItem("Hamper",JSON.stringify(newItem))
    this.hamperService.ReloadComponent();
  }

  handleBtnStatus(item: any){
    if (this.hamper.Code != 0) {
      if (item.link == 1) {
        var listdataUpdate = [];
        if ((this.hamper.StatusID == 0 || this.hamper.StatusID == 4) && (this.isMaster || this.isCreator)) {
          listdataUpdate.push(this.hamper);
          let StatusID = parseInt(item.link);
          //gửi duyệt
            if(this.checkProp(listdataUpdate)){
              this.UpdateHamperStatus(listdataUpdate, StatusID);
            }
        }
      } else if (item.link == 2 ) {
        var listdataUpdate = [];
        if ((this.hamper.StatusID == 1 || this.hamper.StatusID == 3) && (this.isMaster || this.isApprover)) {
          listdataUpdate.push(this.hamper);
          let StatusID = parseInt(item.link);
          //update Phê duyệt
            if(this.checkProp(listdataUpdate)){
              this.UpdateHamperStatus(listdataUpdate, StatusID);
            }
        }
      } else if (item.link == 3) {
        var listdataUpdate = [];
        if (this.hamper.StatusID == 2 && (this.isMaster || this.isApprover)) {
          listdataUpdate.push(this.hamper);
          let StatusID = parseInt(item.link);
          this.UpdateHamperStatus(listdataUpdate, StatusID);
        }
      } else if (item.link == 4) {
        var listdataUpdate = [];
        if ((this.hamper.StatusID == 1 || this.hamper.StatusID == 3) && (this.isMaster || this.isApprover)) {
          listdataUpdate.push(this.hamper);
          let StatusID = parseInt(item.link);
          this.UpdateHamperStatus(listdataUpdate, StatusID);
        }
      } 
    }
  }

  getImgRes(img:string){
    return Ps_UtilObjectService.getImgRes(img)
  }

  openDrawer() {
    this.drawer.open();
    this.lockBarcode = true
    this.getProductInHamper()
    
  }

  closeDrawer() {
    this.drawer.close();
  }

  ngOnDestroy():void{
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}
