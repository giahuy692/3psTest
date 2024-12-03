import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { DTOHamperRequest } from '../../dto/DTOConfHamperRequest';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ConfigAPIService } from '../../services/config-api.service';
import { ConfigService } from '../../services/config.service';
import { DTODetailConfProduct } from '../../dto/DTOConfProduct';
import { DTOPromotionImage } from 'src/app/p-app/p-marketing/shared/dto/DTOPromotionProduct.dto';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-config-product-info',
  templateUrl: './config-product-info.component.html',
  styleUrls: ['./config-product-info.component.scss']
})
export class ConfigProductInfoComponent {

  @Input() disable: boolean = false
  //permission
  @Input() isMaster: boolean = false
  @Input() isCreator: boolean = false
  @Input() isApprover: boolean = false

  @Input({ required: true }) typeInfo: number = 1 // 1 mặc định là cấu hình cho doanh nghiệp, 2 là sản phẩm cty, 3 là hamper cty, 4 là detai danh sách của cấu hình
  @Output() dataChanged: EventEmitter<any> = new EventEmitter();


  //boolean
  loading: boolean = false
  disableType2: boolean = false

  //permission

  //DTO
  productCache = new DTODetailConfProduct()
  hamper = new DTOHamperRequest();
  listImage: DTOPromotionImage[] = [];
  curImage = new DTOPromotionImage()




  //Function
  pickFileCallback: Function
  GetFolderCallback: Function

  //Unsubcribe
  ngUnsubscribe = new Subject<void>();


  constructor(
    public configHamperAPI: ConfigHamperApiService,
    public layoutService: LayoutService,
    public MarServiceAPI: MarNewsProductAPIService,
    public hamperService: ConfigHamperService,
    public menuService: PS_HelperMenuService,
    public configAPIService: ConfigAPIService,
    public configService: ConfigService,
    public router: Router,
    public domSanititizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // this.getData(1);
    this.reloadDataFrom();
    this.reloadDataHamper();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getData(1);
      }
    })
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
  }

  reloadDataHamper() {
    this.hamperService.reloadHamPro$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getData(2);
    });
  }


  reloadDataFrom() {
    this.hamperService.reloadComponent$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getData(1);
    });
  }


  onDataChange(newData: DTOHamperRequest) {
    // this.reloadDataHamper();
    // Khi có sự thay đổi dữ liệu, phát sự kiện thông báo đến component cha
    this.dataChanged.emit(newData);
  }


  getData(type: number) {
    this.listImage = []
    this.curImage = new DTOPromotionImage()

    if (type == 1) {
      if (this.typeInfo == 1 || this.typeInfo == 5) {
        this.getHamperRequest(1);
      }
      else if (this.typeInfo == 3 || this.typeInfo == 2) {
        this.getCacheProduct();
      }
      else if (this.typeInfo == 4) {
        this.GetBaseProduct()
      }
    }
    else {
      if (this.typeInfo == 1) {
        this.getHamperRequest(2);
      }
      else if (this.typeInfo == 3 || this.typeInfo == 2) {
        this.getCacheProduct();
      }
    }
  }

  getCacheProduct() {
    this.configService.getCacheConfProduct().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.productCache = res
      }
      this.getProduct(1)
    })
  }

  //kiểm tra status và quyền
  checkStatusAndRole(hamper, isUpdate: boolean) {
    const statusID = hamper.StatusID
  
    if (statusID === 2 || statusID === 3) {
      this.disable = true
      this.hamperService.activeHamper({ ...hamper, isDisable: this.disable, hasUpdateStatus: isUpdate });
    } else {
      const isCreatorCondition = statusID === 0 || statusID === 4;
      const isApproverCondition = statusID === 1;
      this.disable = this.isApprover && this.isCreator ? false : this.isApprover ? !isApproverCondition : this.isCreator ? !isCreatorCondition : false;
      this.hamperService.activeHamper({ ...hamper, isDisable: this.disable, hasUpdateStatus: isUpdate });
    }
  }

  checkRole(product) {
    if (this.typeInfo == 2 || this.typeInfo == 3) {
      this.disableType2 = this.isApprover && this.isCreator ? false : this.isApprover ? true : false;
    }
    this.hamperService.activeHamper({ ...product, isCreator: this.isCreator, isApprover: this.isApprover });
  }

  getHamperRequest(type: number) {
    this.disable = false
    this.listImage = []
    var hamperLSR = JSON.parse(localStorage.getItem("Hamper"))
    if (Ps_UtilObjectService.hasValue(hamperLSR) && hamperLSR.Code != 0) {
      this.loading = true
      this.configHamperAPI.GetHamperRequest(hamperLSR.Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.hamper = res.ObjectReturn
          this.onDataChange(res.ObjectReturn)
          if (type == 1) {
            this.checkStatusAndRole(res.ObjectReturn, false)
            if (this.typeInfo == 5) {
              this.disable = true
              this.hamperService.activeHamper({ ...res.ObjectReturn, isDisable: true })
            }
          }
          if (type == 2) {
            //trường hợp update status
            this.checkStatusAndRole(res.ObjectReturn, true)
          }
          //bind list hình ảnh
          if (Ps_UtilObjectService.hasValueString(this.hamper.URLThumbImage)) {
            var defaultImg = new DTOPromotionImage();
            defaultImg.IsDefault = true
            defaultImg.URLImage = this.hamper.URLThumbImage
            this.listImage[0] = defaultImg
            this.curImage = defaultImg
          }
          if (Ps_UtilObjectService.hasListValue(this.hamper.ListImage)) {
            this.hamper.ListImage.forEach(s => {
              if (s.URLImage !== this.hamper.URLThumbImage) {
                this.listImage.push(s)
              }
            })
          }
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Hamper:  ${res.ErrorString}`)
        }
        this.loading = false
      }, err => {
        this.loading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Hamper:  ${err}`)
      })
    }
    else {
      this.hamper = new DTOHamperRequest();
      this.hamperService.activeHamper(this.hamper)

    }
  }

  getProduct(type: number) {
    this.loading = true
    this.listImage = []
    this.configAPIService.GetProduct(this.productCache.Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.hamper = res.ObjectReturn
        if (type == 1) {
          this.checkRole(res.ObjectReturn)
        }
        this.onDataChange(res.ObjectReturn)
        this.disable = true
        // if (res.ObjectReturn.Status == 2 || res.ObjectReturn.Status == 3) {
        //   this.disable = true
        // }

        if (Ps_UtilObjectService.hasValueString(this.hamper.URLThumbImage)) {
          var defaultImg = new DTOPromotionImage();
          defaultImg.IsDefault = true
          defaultImg.URLImage = this.hamper.URLThumbImage
          this.listImage[0] = defaultImg
          this.curImage = defaultImg
        }
        if (Ps_UtilObjectService.hasListValue(this.hamper.ListImage)) {
          this.hamper.ListImage.forEach(s => {
            if (s.URLImage !== this.hamper.URLThumbImage) {
              this.listImage.push(s)
            }
          })
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Hamper:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Hamper:  ${err}`)
    })
  }


  checkType(product) {
    this.hamperService.activeHamper({ ...product, isDisable: true });
  }

  GetBaseProduct() {
    this.loading = true
    this.listImage = []
    var baseProdLSR = JSON.parse(localStorage.getItem("Hamper"))
    if (Ps_UtilObjectService.hasValue(baseProdLSR) && baseProdLSR.Code != 0) {
      this.configAPIService.GetBaseProduct(baseProdLSR).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.hamper = res.ObjectReturn[0]
          if (baseProdLSR.justView && Ps_UtilObjectService.hasValue(baseProdLSR)) {
            this.checkType(res.ObjectReturn)
          }
          else {
            this.hamperService.activeHamper(this.hamper)
          }

          this.onDataChange(res.ObjectReturn)

          if (this.hamper.StatusID == 2) {//|| this.hamper.StatusID == 3
            this.disable = true
          }
          else
            this.disable = false

          //bind list hình ảnh
          // if (Ps_UtilObjectService.hasValueString(this.hamper.URLThumbImage)) {
          //   var defaultImg = new DTOPromotionImage();
          //   defaultImg.IsDefault = true
          //   defaultImg.URLImage = this.hamper.URLThumbImage
          //   this.listImage[0] = defaultImg
          //   this.curImage = defaultImg
          // }
          // if (Ps_UtilObjectService.hasListValue(this.hamper.ListImage)) {
          //   this.hamper.ListImage.forEach(s => {
          //     if(s.URLImage !== this.hamper.URLThumbImage){
          //         this.listImage.push(s)
          //     }
          //   })
          // }
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Hamper:  ${res.ErrorString}`)
        }
        this.loading = false
      }, err => {
        this.loading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Hamper:  ${err}`)
      })
    }
  }

  updateBaseProduct(prop: string[], product = this.hamper) {
    this.loading = true
    this.configAPIService.UpdateBaseProduct(product, prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0)
        this.hamper = res.ObjectReturn
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Sản Phẩm:  ${res.ErrorString}`)

      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Sản Phẩm:  ${err}`)
    })
  }

  updateProduct(prop: string[], product = this.hamper) {
    // this.companyData

    if (!Ps_UtilObjectService.hasValue(product.MinDisplay) || !Ps_UtilObjectService.hasValue(product.VATInRate)) {
      product.MinDisplay = 0
      product.VATInRate = 0
    }
    this.loading = true
    this.configAPIService.UpdateProduct(product, prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (this.typeInfo == 1 || this.typeInfo == 4 || this.typeInfo == 3) {
          this.layoutService.onSuccess("Cập nhật thành công thông tin Hamper");
        }
        else if (this.typeInfo == 2) {
          this.layoutService.onSuccess("Cập nhật thành công thông tin Sản Phẩm");
        }


        if (prop[0] == "URLThumbImage") {
          this.getProduct(0)
        }
      }
      else {
        if (this.typeInfo == 1 || this.typeInfo == 4 || this.typeInfo == 3) {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${res.ErrorString}`)
        }
        else if (this.typeInfo == 2) {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Sản Phẩm:  ${res.ErrorString}`)
        }

      }
      this.loading = false
    }, err => {
      this.loading = false
      if (this.typeInfo == 1 || this.typeInfo == 4 || this.typeInfo == 3) {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${err}`)
      }
      else if (this.typeInfo == 2) {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Sản Phẩm:  ${err}`)
      }
    })
  }

  updateHamperRequest(prop: string[], hamper = this.hamper) {
    this.configHamperAPI.UpdateHamperRequest(hamper, prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (this.typeInfo == 1 || this.typeInfo == 4) {
          this.layoutService.onSuccess("Cập nhật thành công thông tin Hamper");
        }
        else if (this.typeInfo == 2 || this.typeInfo == 3) {
          this.layoutService.onSuccess("Cập nhật thành công thông tin Sản Phẩm");
        }

        if (this.hamper.Code == 0) {
          this.hamper = res.ObjectReturn
          this.hamperService.activeHamper(res.ObjectReturn)
          localStorage.setItem("Hamper", JSON.stringify(res.ObjectReturn))
          this.getData(2);
        }
        if (prop[0] == "URLThumbImage") {
          this.curImage.URLImage = null
          this.getHamperRequest(0)
        }
        this.onDataChange(res.ObjectReturn)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${err}`)
    })
  }

  updateProductImage(image = this.curImage) {
    this.configHamperAPI.UpdateProductImage(image).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess("Cập nhật thành công Hình ảnh");
        if (this.typeInfo == 1) {
          this.getHamperRequest(0);
        }
        else if (this.typeInfo == 3) {
          this.getProduct(0);
        }
      }
      else {
        this.curImage = this.listImage[0]
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật Hình ảnh:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.curImage = this.listImage[0]
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật Hình ảnh:  ${err}`)
    })
  }

  DeleteProductImage(image = this.curImage) {
    this.configHamperAPI.DeleteProductImage(image).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess("Xóa thành công Hình ảnh");
        if (this.typeInfo == 1) {
          this.getHamperRequest(0);
        }
        else if (this.typeInfo == 3) {
          this.getProduct(0);
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa Hình ảnh:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi xóa Hình ảnh:  ${err}`)
    })
  }

  deleteImg(prop: string) {
    if (this.typeInfo == 1) {
      this.hamper.URLThumbImage = ""
      this.updateHamperRequest([prop], this.hamper)
    }
    else if (this.typeInfo == 3 || this.typeInfo == 2) {
      this.hamper.URLThumbImage = ""
      this.updateProduct([prop], this.hamper)
    }
  }

  deleteSmallImage(dto: DTOPromotionImage) {
    if (Ps_UtilObjectService.hasValue(this.hamper.Company) && this.typeInfo == 3) {
      dto.Company = this.hamper.Company
      dto.COProduct = this.hamper.Code
      dto.Product = this.hamper.Product
      this.DeleteProductImage(dto)
    }
    else {
      dto.COProduct = null
      dto.Company = 0
      this.DeleteProductImage(dto)
    }
  }

  viewImage(dto: DTOPromotionImage) {
    this.curImage = { ...dto }
  }

  updateImageDefault(event, image) {
    if (Ps_UtilObjectService.hasValue(image)) {
      image.URLImage = Ps_UtilObjectService.removeImgRes(image.URLImage)
      image.Company = 0
      image.IsDefault = true
      this.updateProductImage(image)
    }
  }

  onBlurTextbox(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        default:
          if (this.typeInfo == 1) {
            if (this.hamper.Code == 0) {
              // if (prop == 'Barcode') {
              this.hamper.TypeData = 4
              this.updateHamperRequest([prop, 'TypeData'], this.hamper)
              // }
            }
            else {
              this.updateHamperRequest([prop], this.hamper)
            }
          }
          else if (this.typeInfo == 3 || this.typeInfo == 2) {
            if (Ps_UtilObjectService.hasValueString(this.hamper.Barcode)) {
              this.updateProduct([prop], this.hamper)
            }
            else {
              this.layoutService.onError("Barcode không được để trống")
            }
          }
          break
      }
    }
  }

  openHamperDetail() {
    this.menuService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code === 'erpproduct')
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('config001-product-list')
          || f.Link.includes('config001-product-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes("config002-hamper-detail")
            || f.Link.includes("config002-hamper-detail"))

            if (Ps_UtilObjectService.hasValue(detail2) && Ps_UtilObjectService.hasListValue(detail2.LstChild)) {
              var detail3 = detail2.LstChild.find(f => f.Code.includes("config002-hamper-detail-request")
                || f.Link.includes("config002-hamper-detail-request"))
    
                this.menuService.activeMenu(detail3)
            }
        }
        if (this.typeInfo == 2) {
          localStorage.setItem("Hamper", JSON.stringify({ ...this.hamper, Code: this.hamper.Product, TypeInfo: 2, justView: true }))
        }
        else {
          localStorage.setItem("Hamper", JSON.stringify({ ...this.hamper, Code: this.hamper.Product, }))
        }
      }
    })
  }

  onUploadImg() {
    if (this.hamper.StatusID == 1 || this.hamper.StatusID == 4 || this.hamper.StatusID == 0 || this.typeInfo == 3) {
      this.layoutService.folderDialogOpened = true;
    }
    else if (this.typeInfo == 4) {
      this.layoutService.folderDialogOpened = true;
    }
  }

  isValidImg(str: string) {
    return Ps_UtilObjectService.hasValueString(Ps_UtilObjectService.removeImgRes(str))
  }

  errorOccurred: boolean = false;
  getRes(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    if (this.errorOccurred) {
      return this.getResHachi(a);
    } else {
      return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
    }
  }

  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }

  handleError() {
    // Thực hiện xử lý lỗi bằng cách hiển thị ảnh từ getResHachi
    this.errorOccurred = true; // Đánh dấu rằng đã xảy ra lỗi để tránh lặp lại việc xử lý khi gặp lỗi nhiều lần
  }

  pickFile(e: DTOCFFile, width, height) {
    // console.log(e, this.typeInfo)
    if (this.typeInfo == 3) {
      if (Ps_UtilObjectService.hasValueString(this.hamper.URLThumbImage) && this.isValidImg(this.hamper.URLThumbImage)) {
        this.curImage.URLImage = e.PathFile.replace('~', '')
        this.curImage.Company = this.hamper.Company
        this.curImage.COProduct = this.hamper.Code
        this.curImage.Product = this.hamper.Product
        this.curImage.IsDefault = false
        this.updateProductImage(this.curImage)
      }
    }
    else if (this.typeInfo == 1) {
      if (Ps_UtilObjectService.hasValueString(this.hamper.URLThumbImage)) {
        this.curImage.URLImage = e.PathFile.replace('~', '')
        this.curImage.Product = this.hamper.Code
        this.curImage.Company = 0
        this.curImage.IsDefault = false
        this.updateProductImage(this.curImage)
      }
      else {
        this.hamper.URLThumbImage = e.PathFile.replace('~', '')
        this.updateHamperRequest(['URLThumbImage'], this.hamper)
      }
    }
    else if (this.typeInfo == 4) {
      if (Ps_UtilObjectService.hasValueString(e.PathFile) && this.isValidImg(e.PathFile)) {
        var newProd = { ...this.hamper }
        newProd.URLThumbImage = e.PathFile.replace('~', '')
        newProd.Product = newProd.Code
        this.updateBaseProduct(['URLThumbImage'], newProd)
      }
    }
    this.layoutService.setFolderDialog(false)
  }

  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.MarServiceAPI.GetFolderWithFile(childPath, 7);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}