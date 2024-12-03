import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinct } from '@progress/kendo-data-query';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MarketingService } from '../../shared/services/marketing.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOMABanner } from '../../shared/dto/DTOMABanner.dto';
import { DTOMABannerGroup } from '../../shared/dto/DTOMABannerGroup.dto';
import { MarBannerAPIService } from '../../shared/services/marbanner-api.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';

@Component({
  selector: 'app-mar009-banner-detail',
  templateUrl: './mar009-banner-detail.component.html',
  styleUrls: ['./mar009-banner-detail.component.scss']
})
export class Mar009BannerDetailComponent implements OnInit, OnDestroy {
  loading = false
  isLockAll = false
  isAdd = true
  //dialog
  deleteDialogOpened = false
  //num
  curLanguage = 1
  total = 0
  //date
  today = new Date()
  StartDate: Date = null
  EndDate: Date = null
  //object
  banner = new DTOMABanner()
  //dropdown
  listBannerGroup: DTOMABannerGroup[] = []
  //
  defaultPhanNhom: DTOMABannerGroup = new DTOMABannerGroup()//-1, '- Chọn nhóm banner -'
  bannerGroup: DTOMABannerGroup = new DTOMABannerGroup()
  //CALLBACK
  //folder & file
  pickFileCallback: Function
  GetFolderCallback: Function
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  changePermission_sst: Subscription
  getCacheBannerDetail_sst: Subscription

  GetBanner_sst: Subscription
  GetListGroupBanner_sst: Subscription

  UpdateBanner_sst: Subscription
  UpdateBannerStatus_sst: Subscription
  DeleteBanner_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public service: MarketingService,
    public apiService: MarBannerAPIService,
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
        this.getCache()
      }
    })

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
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
    this.getCacheBannerDetail_sst = this.service.getCacheBannerDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.banner = res
        this.isAdd = this.banner.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }
      this.p_GetListGroupBanner()

      if (!this.isAdd || this.banner.Code != 0) {
        this.p_GetBanner()
      }
    })
  }
  //API  
  p_GetBanner() {
    this.loading = true;

    this.GetBanner_sst = this.apiService.GetBanner(this.banner.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.banner = res.ObjectReturn;
        this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetListGroupBanner() {
    this.loading = true;

    this.GetListGroupBanner_sst = this.apiService.GetListGroupBanner().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listBannerGroup = res.ObjectReturn;
        this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //update
  UpdateBanner(prop: string[], item = this.banner) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " banner"

    // if (this.isAdd)
    //   prop.push('Category')

    this.UpdateBanner_sst = this.apiService.UpdateBanner(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.banner = res.ObjectReturn
        this.checkProp()
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
  UpdateBannerStatus(items: DTOMABanner[] = [this.banner], statusID: number) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'

    this.UpdateBannerStatus_sst = this.apiService.UpdateBannerStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.p_GetBanner()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  p_DeleteBanner() {
    this.loading = true;
    var ctx = "Xóa banner"

    this.DeleteBanner_sst = this.apiService.DeleteBanner([this.banner]).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.banner = res.ObjectReturn
        this.deleteDialogOpened = false
        this.createNew()
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
  //file
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNews.GetFolderWithFile(childPath, 1)
  }
  //CLICK EVENT
  //header1
  updateStatus(statusID: number) {
    var newPro = { ...this.banner }
    // newPro.StatusID = statusID
    //check trước khi áp dụng
    if (statusID == 1 || statusID == 2) {

      if (!Ps_UtilObjectService.hasValueString(newPro.URLLink))
        this.layoutService.onError('Vui lòng nhập Link tới trang')
      else if (!Ps_UtilObjectService.hasValueString(newPro.VNTitle))
        this.layoutService.onError('Vui lòng nhập Tiêu đề banner')
      else if (!Ps_UtilObjectService.hasValue(newPro.BannerGroup))
        this.layoutService.onError('Vui lòng chọn Phân nhóm banner')

      else if (!Ps_UtilObjectService.hasValueString(newPro.StartDate))
        this.layoutService.onError('Vui lòng chọn Ngày bắt đầu cho Thời gian hiệu lực')
      else if (!Ps_UtilObjectService.hasValueString(newPro.EndDate))
        this.layoutService.onError('Vui lòng chọn Ngày kết thúc cho Thời gian hiệu lực')
      else
        this.UpdateBannerStatus([newPro], statusID)
    }
    else
      this.UpdateBannerStatus([newPro], statusID)
  }
  createNew() {
    //object
    this.banner = new DTOMABanner()
    this.bannerGroup = new DTOMABannerGroup()
    //bool
    this.isLockAll = false
    this.isAdd = true
    //num
    this.curLanguage = 1
    this.total = 0
    //date
    this.today = new Date()
    this.StartDate = null
    this.EndDate = null
  }
  print() {
    // if (this.currentOrder.Code > 0)
    // this.p_PrintPXK([this.currentOrder.Code])
  }
  //body
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  shownAtWebpage() {
    var bg = this.listBannerGroup.find(s => s.Code == this.banner.BannerGroup)

    if (Ps_UtilObjectService.hasValue(bg))
      this.bannerGroup = bg
    this.service.setWebpageDialogPopup(true)
  }
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  deleteImg() {
    this.banner.ImageSetting1 = null
    this.UpdateBanner([`ImageSetting1`])
  }
  //body2
  clickCheckbox(ev, prop: string, item?: Object) {
    switch (prop) {
      // case 'GroupName':
      //   var gr = item as DTOGroupOfCard
      //   gr.IsSelected = ev.target.checked
      //   this.UpdateBannerListOfCard(gr)
      //   break
      // case 'DayOfWeek':
      //   var dow = item as DTODayOfWeek
      //   dow.IsSelected = ev.target.checked
      //   this.UpdateBannerDayOfWeek(dow)
      //   break
      default:
        this.banner[prop] = ev.target.checked
        this.UpdateBanner([prop])
        break
    }
  }
  //DIALOG button
  //delete
  onDelete() {
    this.deleteDialogOpened = true
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  delete() {
    this.p_DeleteBanner()
  }
  pickFile(e: DTOCFFile) {
    this.banner[`ImageSetting1`] = e?.PathFile.replace('~', '')
    this.layoutService.setFolderDialog(false)
    this.UpdateBanner([`ImageSetting1`])
  }
  //AUTORUN
  checkProp() {
    this.isLockAll = (this.banner.StatusID == 2 || this.banner.StatusID == 3) || //khóa khi duyệt, ngưng
      (this.banner.StatusID != 0 && this.banner.StatusID != 4 && this.isAllowedToCreate && !this.isAllowedToVerify)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.banner.StatusID == 0 || this.banner.StatusID == 4) && this.isAllowedToVerify && !this.isAllowedToCreate)//khóa khi tạo, trả nếu có quyền duyệt

    if (Ps_UtilObjectService.hasValueString(this.banner.StartDate))
      this.StartDate = new Date(this.banner.StartDate)

    if (Ps_UtilObjectService.hasValueString(this.banner.EndDate))
      this.EndDate = new Date(this.banner.EndDate)

    if (Ps_UtilObjectService.hasListValue(this.listBannerGroup)) {
      var bg = this.listBannerGroup.find(s => s.Code == this.banner.BannerGroup)

      if (Ps_UtilObjectService.hasValue(bg))
        this.bannerGroup = bg
    }
  }
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        // case 'Barcode':
        //   if (this.drawer.opened)
        //     this.p_GetPromotionProduct()
        //   break
        default:
          this.UpdateBanner([prop])
          break
      }
    }
  }
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.banner[prop] = this[prop]
      this.UpdateBanner([prop])
    }
  }
  onDropdownlistClick(e, dropdownName: string) {
    this.bannerGroup = e
    this.banner.BannerGroup = this.bannerGroup.Code
    this.banner.BannerGroupName = this.bannerGroup.BannerGroup
    this.UpdateBanner(['BannerGroup', 'BannerGroupName'])
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  //
  isItemDisabled(itemArgs: { dataItem: DTOMABannerGroup; index: number }) {
    return itemArgs.dataItem.Code == -1;
  }
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.getCacheBannerDetail_sst?.unsubscribe()

    this.GetBanner_sst?.unsubscribe()
    this.GetListGroupBanner_sst?.unsubscribe()

    this.UpdateBanner_sst?.unsubscribe()
    this.UpdateBannerStatus_sst?.unsubscribe()
    this.DeleteBanner_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
