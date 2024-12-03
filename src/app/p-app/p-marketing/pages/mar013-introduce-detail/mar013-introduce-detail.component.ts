import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditorComponent } from '@progress/kendo-angular-editor';
import { distinct } from '@progress/kendo-data-query';

import { Subscription } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOEmbedImg, DTOEmbedVideo } from '../../shared/dto/DTOEmbedVideo.dto';
import { DTOMAPost_ObjReturn } from '../../shared/dto/DTOMANews.dto';
import { DTOWebBlogContent } from '../../shared/dto/DTOWebContent.dto';
import { MarIntroduceAPIService } from '../../shared/services/mar-introduce-api.service';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';

@Component({
  selector: 'app-mar013-introduce-detail',
  templateUrl: './mar013-introduce-detail.component.html',
  styleUrls: ['./mar013-introduce-detail.component.scss']
})
export class Mar013IntroduceDetailComponent implements OnInit {
  // Permission
  isLoading: boolean = false;
  isLoaded: boolean = true;

  isAdd: boolean = true;
  isLockAll: boolean = false;

  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;

  actionPerm: DTOActionPermission[]
  //

  // Language
  curLanguages: number
  languages: string[] = ['VN', 'JP', 'EN']
  //

  // WebCache
  webContent = new DTOWebBlogContent()
  //

  // Introduce
  title: string
  imgContent: boolean = true
  Introduce = new DTOMAPost_ObjReturn()
  //

  // Files
  getFileCallback: Function
  getFolderCallback: Function
  //

  // Dialog
  showCancelDialog: boolean = false;
  //

  // Subscription
  changePermission_sst: Subscription
  changeModuleData_sst: Subscription

  getIntroduce_sst: Subscription
  getCacheIntroduceDetail_sst: Subscription

  updateIntroduce_sst: Subscription
  changePermissionAPI: Subscription
  //

  constructor(
    public service: MarketingService,
    public layoutService: LayoutService,
    public apiService: MarIntroduceAPIService,
    public menuService: PS_HelperMenuService,
    
    public apiServiceIntroduce: MarNewsProductAPIService,
  ) { }

  ngOnInit(): void {
    let that = this
    

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.isLoaded) {
        that.isLoaded = false;
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isMaster = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isCreator = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isApprover = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        // this.getIntroduceCache()
      }
    })

    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getIntroduceCache()
      }
    })
    this.getFileCallback = this.getFile.bind(this)
    this.getFolderCallback = this.getFolder.bind(this)
  }

  // Introduce
  getIntroduce() {
    this.isLoading = true;

    this.getIntroduce_sst = this.apiService.GetIntroduce(this.Introduce.Code == null ? 0 : this.Introduce.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.Introduce = res.ObjectReturn;
        this.checkProp()
        this.service.setCacheIntroduceDetail(this.Introduce)
      }

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }
  getIntroduceCache() {
    this.getCacheIntroduceDetail_sst = this.service.getCacheIntroduceDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.Introduce = res
        this.isAdd = this.Introduce.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }

      if (!this.isAdd || this.Introduce.Code != 0) {
        this.getIntroduce()
        this.curLanguages = Ps_UtilObjectService.hasValueString(this.Introduce.TitleVN) ? 0 : Ps_UtilObjectService.hasValueString(this.Introduce.TitleJP) ? 1 : 2
        this.saveWebContent()
      }
    })
  }
  updateStatus(item: DTOMAPost_ObjReturn, StatusID: number) {
    this.isLoading = true;
    var ctx = 'Cập nhật tình trạng'
    item.StatusID = item.StatusName = null;

    this.updateIntroduce_sst = this.apiService.UpdateIntroduceStatus(item, StatusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.getIntroduce()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  updateIntroduce(prop: string[], item = this.Introduce) {
    this.isLoading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " phần giới thiệu"

    this.updateIntroduce_sst = this.apiService.UpdateIntroduce(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.Introduce = res.ObjectReturn
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    });
  }
  //

  // Language
  changeLanguage(lang: number) {
    this.curLanguages = lang
    this.saveWebContent()
  }
  //

  // Buttons
  onClickChangeStatus(statusID: number) {
    var newPro = { ...this.Introduce }
    newPro.StatusID = statusID

    if (this.checkDetail(statusID)) {
      this.updateStatus(newPro, statusID)
    }
  }
  onCloseDetail(waitTime: number = 0) {
    this.showCancelDialog = false;
    setTimeout(() => {
      this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
        //Introduce
        var parent = item.ListMenu.find(f => f.Code.includes('news-product')
          || f.Link.includes('news-product'))
        //
        if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
          var detail = parent.LstChild.find(f => f.Code.includes('introduce-list')
            || f.Link.includes('introduce-list'))

          this.menuService.activeMenu(detail)

          this.checkProp();
        }
      })
    }, waitTime);
  }
  //

  // Check Detail
  checkDetail(statusID: number) {
    if (statusID == 1 || statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(this.Introduce[`Title${this.languages[this.curLanguages]}`].trim())) {
        this.layoutService.onError('Vui Lòng nhập tiêu đề!')
        return false
      }
      if (!Ps_UtilObjectService.hasValueString(this.Introduce[`Summary${this.languages[this.curLanguages]}`].trim()) && this.Introduce.OrderBy == 0) {
        this.layoutService.onError('Vui Lòng nhập trích dẫn!')
        return false
      }
      if (!Ps_UtilObjectService.hasValueString(this.Introduce[`Content${this.languages[this.curLanguages]}`].trim()) && this.Introduce.OrderBy != 2) {
        this.layoutService.onError('Vui Lòng nhập nội dung!')
        return false
      }
      // if (!Ps_UtilObjectService.hasValueString(this.Introduce.ImageLarge)) {
      //   this.layoutService.onError('Vui Lòng chọn ảnh đại diện!')
      //   return false
      // }
    }
    return true
  }
  checkProp() {
    this.isLockAll = (this.Introduce.StatusID == 2 || this.Introduce.StatusID == 3) || //khóa khi duyệt, ngưng
      (this.Introduce.StatusID != 0 && this.Introduce.StatusID != 4 && this.isCreator && !this.isApprover)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.Introduce.StatusID == 0 || this.Introduce.StatusID == 4) && this.isApprover && !this.isCreator)//khóa khi tạo, trả nếu có quyền duyệt
  }
  //

  // Detail
  saveIntroduceDetail() {
    var prop: string[] = []
    var language = this.languages[this.curLanguages]

    this.Introduce.CreateTime = new Date()

    this.Introduce[`Title${language}`] = this.webContent[`WebTitle${language}`]
    this.Introduce[`Summary${language}`] = this.webContent[`WebSummary${language}`]
    this.Introduce[`Content${language}`] = this.webContent[`WebContent${language}`]

    for (let i of Object.keys(this.Introduce)) {
      if (this.Introduce[i] != null && i != 'Code' && i != 'StatusID' && i != 'StatusName')
        prop.push(i)
    }
    if (this.checkDetail(this.Introduce.StatusID))
      this.updateIntroduce(prop, this.Introduce);
  }
  onSaveInput(type: number) {
    let language = this.languages[this.curLanguages]

    switch (type) {
      case 1:
        this.Introduce[`Title${language}`] = this.webContent[`WebTitle${language}`] == null ? '' : this.webContent[`WebTitle${language}`]
        break

      case 2:
        this.Introduce[`Summary${language}`] = this.webContent[`WebSummary${language}`] == null ? '' : this.webContent[`WebSummary${language}`]
        break

      case 3:
        this.Introduce[`Content${language}`] = this.webContent[`WebContent${language}`] == null ? '' : this.webContent[`WebContent${language}`]
        break
    }
    this.saveWebContent();
    this.saveIntroduceDetail();
  }
  onValueChange(type: number, val: string) {
    var language = this.languages[this.curLanguages]
    switch (type) {
      case 1:
        this.Introduce[`Title${language}`] = val
        break

      case 2:
        this.Introduce[`Summary${language}`] = val
        break

      case 3:
        this.Introduce[`Content${language}`] = val
        break
    }

    this.saveWebContent()
  }
  saveWebContent() {
    var language = this.languages[this.curLanguages]

    this.webContent[`WebTitle${language}`] = this.Introduce[`Title${language}`] == null ? '' : this.Introduce[`Title${language}`]
    this.webContent[`WebSummary${language}`] = this.Introduce[`Summary${language}`] == null ? '' : this.Introduce[`Summary${language}`]
    this.webContent[`WebContent${language}`] = this.Introduce[`Content${language}`] == null ? '' : this.Introduce[`Content${language}`]
  }
  //

  // Files
  getFolder(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceIntroduce.GetFolderWithFile(childPath, 8)
  }
  getFile(e: DTOCFFile, width, height) {
    if (this.imgContent)
      this.layoutService.getEditor().embedImgURL(e, width, height)
    else {
      this.Introduce.ImageThumb = this.Introduce.ImageLarge = this.Introduce.ImageSmall
        = this.Introduce.ImageSetting1 = this.Introduce.ImageSetting2 = this.Introduce.ImageSetting3
        = this.Introduce.ImageSetting4 = this.Introduce.ImageSetting5
        = this.Introduce.ImageRaw1 = this.Introduce.ImageRaw2
        = e?.PathFile
    }

    this.layoutService.setFolderDialog(false)
    this.saveIntroduceDetail()
  }
  onUploadImg(imgContent: boolean) {
    this.imgContent = imgContent
    this.layoutService.folderDialogOpened = true
  }
  onRemoveImg() {
    this.Introduce.ImageThumb = this.Introduce.ImageLarge = this.Introduce.ImageSmall
      = this.Introduce.ImageSetting1 = this.Introduce.ImageSetting2 = this.Introduce.ImageSetting3
      = this.Introduce.ImageSetting4 = this.Introduce.ImageSetting5
      = this.Introduce.ImageRaw1 = this.Introduce.ImageRaw2 = null

    this.updateIntroduce(['ImageThumb', 'ImageLarge', 'ImageSmall',
      'ImageSetting1', 'ImageSetting2', 'ImageSetting3',
      'ImageSetting4', 'ImageSetting5', 'ImageRaw1', 'ImageRaw2'], this.Introduce)
  }
  //
  getRes(str) {
    return Ps_UtilObjectService.getImgResHachi(str)
  }
  ngOnDestroy() {
    this.changePermission_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()

    this.getIntroduce_sst?.unsubscribe()
    this.getCacheIntroduceDetail_sst?.unsubscribe()

    this.updateIntroduce_sst?.unsubscribe()
  }
}
