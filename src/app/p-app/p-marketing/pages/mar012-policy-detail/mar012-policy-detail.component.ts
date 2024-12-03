import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { distinct } from '@progress/kendo-data-query';

import { Subscription } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOMAPost_ObjReturn } from '../../shared/dto/DTOMANews.dto';
import { DTOWebBlogContent } from '../../shared/dto/DTOWebContent.dto';
import { MarPolicyAPIService } from '../../shared/services/mar-Policy-api.service';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';

@Component({
  selector: 'app-mar012-policy-detail',
  templateUrl: './mar012-policy-detail.component.html',
  styleUrls: ['./mar012-policy-detail.component.scss']
})
export class Mar012PolicyDetailComponent implements OnInit {
  // Permission
  isLoading: boolean = false;
  isLoaded: boolean = true;

  isAdd: boolean = true;
  isLockAll: boolean = true;

  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;

  isFilterActive: boolean = true;

  actionPerm: DTOActionPermission[]
  // Language
  curLanguages: number
  languages: string[] = ['VN', 'JP', 'EN']
  // WebCache
  webContent = new DTOWebBlogContent()
  // Policy
  Policy = new DTOMAPost_ObjReturn()
  //function
  pickFileCallback: Function
  getFolderCallback: Function
  // Dialog
  showCancelDialog: boolean = false;
  // Subscription
  changePermission_sst: Subscription
  changeModuleData_sst: Subscription
  getPolicy_sst: Subscription
  getCachePolicyDetail_sst: Subscription
  updatePolicy_sst: Subscription
  changePermissionAPI: Subscription
  //
  constructor(
    public service: MarketingService,
    public layoutService: LayoutService,
    public apiService: MarPolicyAPIService,
    public menuService: PS_HelperMenuService,
    public apiServicePolicy: MarNewsProductAPIService,
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
        // this.getPolicyCache()
      }
    })
    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getPolicyCache()
      }
    })
    this.pickFileCallback = this.pickFile.bind(this)
    this.getFolderCallback = this.getFolder.bind(this)
  }

  // Policy
  getPolicy() {
    this.isLoading = true;

    this.getPolicy_sst = this.apiService.GetPolicy(this.Policy.Code == null ? 0 : this.Policy.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.Policy = res.ObjectReturn;
        this.checkLock()
      }

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }
  getPolicyCache() {
    this.getCachePolicyDetail_sst = this.service.getCachePolicyDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.Policy = res
        this.isAdd = this.Policy.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }

      if (!this.isAdd || this.Policy.Code != 0) {
        this.getPolicy()
        this.curLanguages = Ps_UtilObjectService.hasValueString(this.Policy.ContentVN) ? 0 : Ps_UtilObjectService.hasValueString(this.Policy.ContentJP) ? 1 : 2
        this.saveWebContent()
      }
    })
  }
  updateStatus(item: DTOMAPost_ObjReturn, StatusID: number) {
    this.isLoading = true;
    var ctx = 'Cập nhật tình trạng'
    item.StatusID = item.StatusName = null;

    this.updatePolicy_sst = this.apiService.UpdatePolicyStatus(item, StatusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.getPolicy()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  updatePolicy(prop: string[], item = this.Policy) {
    this.isLoading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " tin tức"

    this.updatePolicy_sst = this.apiService.UpdatePolicy(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.Policy = res.ObjectReturn
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
  // Language
  changeLanguage(lang: number) {
    this.curLanguages = lang
    this.saveWebContent()
  }
  // Buttons
  onClickChangeStatus(statusID: number) {
    var newPro = { ...this.Policy }
    newPro.StatusID = statusID

    if (this.checkDetail(statusID)) {
      this.updateStatus(newPro, statusID)
    }
  }
  onCloseDetail(waitTime: number = 0) {
    this.showCancelDialog = false;
    // setTimeout(() => {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('news-product')
        || f.Link.includes('news-product'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('policy-list')
          || f.Link.includes('policy-list'))

        this.menuService.activeMenu(detail)

        // if (!this.service.isLockAll)
        // this.service.isLockAll = true
      }
    })
    // }, waitTime);
  }
  // Check Detail
  checkLock() {
    this.isLockAll //= this.service.isLockAll 
      = (this.Policy.StatusID == 2 || this.Policy.StatusID == 3) || //khóa khi duyệt, ngưng
      (this.Policy.StatusID != 0 && this.Policy.StatusID != 4 && this.isCreator && !this.isApprover)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.Policy.StatusID == 0 || this.Policy.StatusID == 4) && this.isApprover && !this.isCreator)//khóa khi tạo, trả nếu có quyền duyệt   
  }
  checkDetail(statusID: number) {
    if (statusID == 1 || statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(this.Policy[`Content${this.languages[this.curLanguages]}`])) {
        this.layoutService.onError('Vui Lòng nhập nội dung!')
        return false
      }
    }

    return true
  }
  // Detail
  savePolicyDetail() {
    var prop: string[] = []
    var language = this.languages[this.curLanguages]

    this.Policy.PostDate = new Date()
    this.Policy[`Content${language}`] = this.webContent[`WebContent${language}`]

    for (let i of Object.keys(this.Policy)) {
      if (this.Policy[i] != null && i != 'Code' && i != 'StatusID' && i != 'StatusName')
        prop.push(i)
    }
    if (this.checkDetail(this.Policy.StatusID))
      this.updatePolicy(prop, this.Policy);
  }
  onValueChange(val: string) {
    var language = this.languages[this.curLanguages]
    this.Policy[`Content${language}`] = val
    this.saveWebContent()
  }
  saveWebContent() {
    var language = this.languages[this.curLanguages]
    this.webContent[`WebContent${language}`] = this.Policy[`Content${language}`] == null ? '' : this.Policy[`Content${language}`]
  }
  // Files
  getFolder(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServicePolicy.GetFolderWithFile(childPath, 8)
  }
  pickFile(e: DTOCFFile, width, height) {
    this.layoutService.getEditor().embedImgURL(e, width, height)
    this.layoutService.setFolderDialog(false)
  }
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  //
  ngOnDestroy() {
    this.changePermission_sst?.unsubscribe()
    this.getPolicy_sst?.unsubscribe()
    this.getCachePolicyDetail_sst?.unsubscribe()
    this.updatePolicy_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
