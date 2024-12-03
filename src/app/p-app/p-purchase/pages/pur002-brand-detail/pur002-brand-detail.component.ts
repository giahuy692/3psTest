import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinct } from '@progress/kendo-data-query';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { EditorComponent } from '@progress/kendo-angular-editor';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { DTOBrand } from '../../shared/dto/DTOBrand.dto';
import { PurBrandAPIService } from '../../shared/services/pur-brand-api.service';
import { PurService } from '../../shared/services/pur.service';

@Component({
  selector: 'app-pur002-brand-detail',
  templateUrl: './pur002-brand-detail.component.html',
  styleUrls: ['./pur002-brand-detail.component.scss']
})
export class Pur002BrandDetailComponent implements OnInit, OnDestroy {
  loading = false
  isLockAll = false
  isAdd = true
  //dialog
  deleteDialogOpened = false
  //num
  curLanguage = 1
  //object
  brand = new DTOBrand()
  //CALLBACK
  //folder & file
  GetFolderCallback: Function
  pickFileCallback: Function
  //Element
  @ViewChild('myeditor') myeditor: EditorComponent;
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  changePermission_sst: Subscription
  getCacheAlbumDetail_sst: Subscription

  GetAlbum_sst: Subscription
  UpdateAlbum_sst: Subscription
  UpdateBrandStatus_sst: Subscription
  DeleteAlbum_sst: Subscription
  changePermissionAPI: Subscription

  constructor(
    public service: PurService,
    public apiService: PurBrandAPIService,
    public apiServiceNews: MarNewsProductAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    let that = this
    
    //cache
    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.getCache()
      }
    })

    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache()
      }
    })
    //CALLBACK
    //file
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
  }
  //load  
  getCache() {
    this.getCacheAlbumDetail_sst = this.service.getCacheBrandDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.brand = res
        this.isAdd = this.brand.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }

      if (!this.isAdd || this.brand.Code != 0) {
        this.GetBrand()
      }
    })
  }
  //API  
  GetBrand() {
    this.loading = true;

    this.GetAlbum_sst = this.apiService.GetBrand(this.brand.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.brand = res.ObjectReturn;
        this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //update
  UpdateBrand(prop: string[], item: DTOBrand = this.brand) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " thương hiệu"

    if (prop.findIndex(s => s == 'VNBrand')) {
      this.brand.ShortName = this.brand.VNBrand
      prop.push('ShortName')
    }

    if (prop.findIndex(s => s == "VNDescription") == -1)
      prop.push('VNDescription')

    if (prop.findIndex(s => s == "JPDescription") == -1)
      prop.push('JPDescription')

    if (prop.findIndex(s => s == "ENDescription") == -1)
      prop.push('ENDescription')

    this.UpdateAlbum_sst = this.apiService.UpdateBrand(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.brand = res.ObjectReturn
        this.checkProp()
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  UpdateBrandStatus(items = [this.brand], statusID: number = this.brand.StatusID) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'

    this.UpdateBrandStatus_sst = this.apiService.UpdateBrandStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.checkProp()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.GetBrand()
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
      this.GetBrand()
    });
  }
  DeleteAlbum() {
    this.loading = true;
    var ctx = "Xóa thương hiệu"

    this.DeleteAlbum_sst = this.apiService.DeleteBrand([this.brand]).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.createNew()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  //file
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNews.GetFolderWithFile(childPath, 11)
  }
  //CLICK EVENT
  //header1
  updatePromotionStatus(statusID: number) {
    var newPro = { ...this.brand }
    newPro.StatusID = statusID
    //check trước khi áp dụng
    if (newPro.StatusID == 1 || newPro.StatusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(newPro.VNBrand))
        this.layoutService.onError('Vui lòng nhập Tên viết tắt')
      else if (!Ps_UtilObjectService.hasValueString(newPro.VNSummary))
        this.layoutService.onError('Vui lòng nhập Tên đầy đủ')
      else if (!Ps_UtilObjectService.hasValueString(newPro.VNDescription))
        this.layoutService.onError('Vui lòng chọn Mô tả thương hiệu')

      else if (!Ps_UtilObjectService.hasValueString(newPro.URLImage1))//chỉ cần 1 hình
        this.layoutService.onError('Vui lòng nhập Hình ảnh')
      // else if (!Ps_UtilObjectService.hasValueString(newPro.URLImage2))
      //   this.layoutService.onError('Vui lòng nhập Hình slice trang chủ')
      // else if (!Ps_UtilObjectService.hasValueString(newPro.URLImage3))
      //   this.layoutService.onError('Vui lòng nhập Hình đại diện trang chủ thương hiệu')
      // else if (!Ps_UtilObjectService.hasValueString(newPro.URLImage4))
      //   this.layoutService.onError('Vui lòng nhập Hình chi tiết thương hiệu')
      else
        this.UpdateBrandStatus([newPro], statusID)
    }
    else
      this.UpdateBrandStatus([newPro], statusID)
  }
  createNew() {
    //object
    this.brand = new DTOBrand()
    //bool
    this.isLockAll = false
    this.isAdd = true
  }
  //body
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  onDelete() {
    this.deleteDialogOpened = true
  }
  //DIALOG button
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  delete() {
    this.DeleteAlbum()
  }
  //AUTORUN
  checkProp() {
    this.isLockAll = //this.brand.StatusID == 2 || this.brand.StatusID == 3 || 
      (this.brand.StatusID != 0 && this.brand.StatusID != 4 && this.isAllowedToCreate)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.brand.StatusID == 0 || this.brand.StatusID == 4) && this.isAllowedToVerify)//khóa khi tạo, trả nếu có quyền duyệt
  }
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  pickFile(e: DTOCFFile, width, height) {
    this.brand.URLImage1 = e?.PathFile.replace('~', '')
    this.UpdateBrand(['URLImage1'])
    this.layoutService.setFolderDialog(false)
  }
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        // case 'Barcode':
        //   if (this.drawer.opened && Ps_UtilObjectService.hasValueString(this.albumDetail.Barcode))
        //     this.GetAlbumDetailsByBarcode()
        //   break
        default:
          this.UpdateBrand([prop])
          break
      }
    }
  }
  onEditorValueChange(val) {
    switch (this.curLanguage) {
      case 1:
        this.brand.VNDescription = val
        break;
      case 2:
        this.brand.JPDescription = val
        break;
      default:
        this.brand.ENDescription = val
        break;
    }
  }
  saveWebContent() {
    this.UpdateBrand(['VNDescription', 'ENDescription', 'JPDescription'])
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  //
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.getCacheAlbumDetail_sst?.unsubscribe()

    this.GetAlbum_sst?.unsubscribe()
    this.UpdateAlbum_sst?.unsubscribe()
    this.UpdateBrandStatus_sst?.unsubscribe()
    this.DeleteAlbum_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
