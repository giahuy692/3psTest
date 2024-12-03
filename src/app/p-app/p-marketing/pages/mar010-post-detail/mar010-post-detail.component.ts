import { MarPostAPIService } from './../../shared/services/mar-post-api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOMAPost_ObjReturn, DTOMACategory } from '../../shared/dto/DTOMANews.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';

import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { distinct, State } from '@progress/kendo-data-query';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTOMAHashtag } from '../../shared/dto/DTOMAHashtag.dto';
import { MarHashtagAPIService } from '../../shared/services/mar-hashtag-api.service';

import { delay, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-mar010-post-detail',
  templateUrl: './mar010-post-detail.component.html',
  styleUrls: ['./mar010-post-detail.component.scss']
})
export class Mar010PostDetailComponent implements OnInit {
  that = this
  @ViewChild('multiSelect') multiSelect;
  // Permission
  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false

  isAdd: boolean = false;
  isLockAll: boolean = false;
  actionPerm: DTOActionPermission[] = []
  // Dialog
  clearDialogOpened = false;
  deleteDialogOpened = false;
  // Filter
  pageSize = 50
  pageSizes = [this.pageSize]

  loading = false
  justLoaded = true
  // Language, Webcontent
  curTab: number = 0;
  curLanguage: number = 0;
  languages: string[] = ['VN', 'JP', 'EN']
  // Blog
  Blog = new DTOMAPost_ObjReturn()
  // Category
  currentType: DTOMACategory[] = null;
  BlogCategoryList: DTOMACategory[] = []
  defaultBlogCategoryObj = new DTOMACategory();
  // Detail
  postDate: Date = new Date()
  curImgSetting = 1
  ImageSettingList: string[] = []
  //hashtag
  gridState: State = {
    filter: {
      filters: [
        { field: 'StatusID', operator: 'eq', value: 2 }
      ], logic: 'and'
    },
  }
  listHashtag: DTOMAHashtag[] = []
  listFilterHashtag: DTOMAHashtag[] = []
  listSelectedHashtag: DTOMAHashtag[] = []
  // Callback
  GetFolderCallback: Function
  pickFileCallback: Function
  // Folder Nội dung
  GetFolderCallback2: Function
  pickFileCallback2: Function
  // Subscription
  subArr: Subscription[] = []
  //
  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,

    public layoutService: LayoutService,
    public apiService: MarPostAPIService,
    public marApiService: MarHashtagAPIService,
    public apiServiceBlog: MarNewsProductAPIService,
  ) { }

  ngOnInit(): void {
    let that = this
    // this.GetListCategory()

    let sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false;
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.getCache()
      }
    })
    let changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListCategory()
        this.getCache()
      }
    })
    this.subArr.push(sst, changePermissonAPI)
    //CMS Thumb
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
    //CMS
    this.pickFileCallback2 = this.pickFile2.bind(this)
    this.GetFolderCallback2 = this.GetFolderWithFile2.bind(this)
  }
  // Cache
  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.value == -1;
  }
  getCache() {
    let sst = this.service.getCachePostDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.Blog = res
        this.isAdd = this.Blog.Code == 0
        this.defaultBlogCategoryObj = new DTOMACategory()
      }
      else {
        this.isAdd = this.service.isAdd
      }

      if (!this.isAdd || this.Blog.Code != 0) {
        this.p_GetBlog()
      }
      else {
        this.defaultBlogCategoryObj = this.BlogCategoryList[0]

        if (Ps_UtilObjectService.hasValue(this.defaultBlogCategoryObj))
          this.Blog.NewsCategory = this.defaultBlogCategoryObj.Code
      }
      this.GetListHashtag()
    })
    this.subArr.push(sst)
  }
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
  //API
  GetListCategory() {
    this.loading = true;
    var ctx = 'Danh sách phân nhóm'

    let sst = this.apiService.GetListBlogCategory().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.BlogCategoryList = res.ObjectReturn.Data;
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
    this.subArr.push(sst)
  }
  // Get List Hashtag
  GetListHashtag() {
    this.loading = true;
    var ctx = 'Danh sách hashtag'

    let sst = this.marApiService.GetListHashtag(this.gridState).subscribe(res => {
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
    this.subArr.push(sst)
  }
  p_GetBlog() {
    this.loading = true;

    let sst = this.apiService.GetBlog(this.Blog.Code == null ? 0 : this.Blog.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.Blog = res.ObjectReturn;
        this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }
  onUpdateStatus(item: DTOMAPost_ObjReturn, StatusID: number) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'
    item.StatusID = item.StatusName = null;

    let sst = this.apiService.UpdateBlogStatus([item], StatusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.p_GetBlog()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
    this.subArr.push(sst)
  }
  UpdateBlog(prop: string[], item = this.Blog) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " bài viết"

    if (this.isAdd) {
      prop.push('NewsCategory')
    }

    let sst = this.apiService.UpdateBlog(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.service.isAdd = this.isAdd = false
        this.Blog = res.ObjectReturn
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    });
    this.subArr.push(sst)
  }
  DeleteBlog(item: DTOMAPost_ObjReturn = this.Blog) {
    this.loading = true;
    var ctx = 'Xóa bài viết'

    let sst = this.apiService.DeleteBlog([item]).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.onCreateBlog()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
    this.subArr.push(sst)
  }
  //
  // Button
  updateStatus(statusID: number) {
    var newPro = { ...this.Blog }
    newPro.StatusID = statusID

    if (this.checkInput(statusID))
      this.onUpdateStatus(newPro, statusID)
  }
  onUploadImg(imgSetting: number) {
    this.curImgSetting = imgSetting
    this.layoutService.setFolderDialog(true)
  }
  onRemoveImg(imgSetting: number) {
    this[`imgSetting${imgSetting}`] =
      this.Blog[`ImageSetting${imgSetting}`] = null

    if (!this.service.isAdd)
      this.UpdateBlog([`ImageSetting${imgSetting}`])
  }
  onCreateBlog() {
    this.isAdd = true
    this.postDate = new Date()
    this.Blog = new DTOMAPost_ObjReturn();
    this.Blog.PostDate = this.postDate
    this.defaultBlogCategoryObj = this.BlogCategoryList[0]
    this.Blog.NewsCategory = this.BlogCategoryList[0]?.Code
    this.listSelectedHashtag = []
    this.checkProp()
  }
  checkProp() {
    this.isLockAll = (this.Blog.StatusID == 2 || this.Blog.StatusID == 3) || //khóa khi duyệt, ngưng
      (this.Blog.StatusID != 0 && this.Blog.StatusID != 4 && this.isAllowedToCreate && !this.isAllowedToVerify)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.Blog.StatusID == 0 || this.Blog.StatusID == 4) && this.isAllowedToVerify && !this.isAllowedToCreate)//khóa khi tạo, trả nếu có quyền duyệt

    if (Ps_UtilObjectService.hasValueString(this.Blog.PostDate))
      this.postDate = new Date(this.Blog.PostDate)
    else
      this.Blog.PostDate = this.postDate

    if (Ps_UtilObjectService.hasValueString(this.Blog.ListTag) && Ps_UtilObjectService.hasListValue(this.listHashtag)) {
      this.listSelectedHashtag = []
      var tagList: DTOMAHashtag[] = []

      JSON.parse(this.Blog.ListTag).map(s => {//lọc ra các json bị lỗi \"["\"["\"["\"[" này
        if (Ps_UtilObjectService.hasValue(s) && Ps_UtilObjectService.hasValue(s.Code) && s.Code != 0)
          tagList.push(s)
      })
      this.listSelectedHashtag = this.listHashtag.filter(s => tagList.findIndex(t => t.Code == s.Code) > -1)
    }
  }
  //
  // Language
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  changeTab(tab: number) {
    this.curTab = tab
  }
  //
  // Action
  onSaveInput(prop: string, val?) {
    let language = this.languages[this.curLanguage]

    switch (prop) {
      case 'Title':
        prop += language
        break
      case 'Summary':
        prop += language
        break
      case 'Content':
        prop += language
        break
      case 'NewsCategory':
        break
      case 'PostDate':
        this.Blog.PostDate = this.postDate
        break
      case 'ListTag':
        this.Blog.ListTag = JSON.stringify(this.listSelectedHashtag)
        break
    }

    if (this.checkInput(this.Blog.StatusID))
      this.UpdateBlog([prop], this.Blog)
  }
  onValueChange(type, val) {
    var language = this.languages[this.curLanguage]

    switch (type) {
      case 'Summary':
        this.Blog[`Summary${language}`] = val
        break
      case 'Title':
        this.Blog[`Title${language}`] = val
        break
      case 'Content':
        this.Blog[`Content${language}`] = val
        break
      case 'PostDate':
        // this.Blog.PostDate = val
        break
      default:
        break
    }
  }
  //
  // Check
  checkInput(statusID: number) {
    if (statusID == 1 || statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(this.Blog.TitleVN)) {
        this.layoutService.onError('Vui lòng nhập tiêu đề!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.Blog.SummaryVN)) {
        this.layoutService.onError('Vui lòng nhập miêu tả!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.Blog.ContentVN)) {
        this.layoutService.onError('Vui lòng nhập nội dung!')
        return false
      }

      else if (!Ps_UtilObjectService.hasValueString(this.Blog.NewsCategory)) {
        this.layoutService.onError('Vui lòng chọn phân nhóm!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.Blog.PostDate)) {
        this.layoutService.onError('Vui lòng nhập ngày post!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.Blog.ImageSetting1)) {
        this.layoutService.onError('Vui lòng chọn ảnh đại diện!')
        return false
      }
      // else if (!Ps_UtilObjectService.hasValueString(this.Blog.ImageSetting2)) {
      //   this.layoutService.onError('Vui lòng chọn ảnh nền 1!')
      //   return false
      // }
      else if (!Ps_UtilObjectService.hasValueString(this.Blog.ImageSetting3)) {
        this.layoutService.onError('Vui lòng chọn ảnh nền 2!')
        return false
      }
    }
    return true
  }
  //
  // Folder CMS Thumb
  GetFolderWithFile(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceBlog.GetFolderWithFile(childPath, 13)
  }
  pickFile(e: DTOCFFile, width, height) {
    this.Blog[`ImageSetting${this.curImgSetting}`] = e?.PathFile
    this.UpdateBlog([`ImageSetting${this.curImgSetting}`])
    this.layoutService.setFolderDialog(false)
  }
  // Folder CMS
  GetFolderWithFile2(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceBlog.GetFolderWithFile(childPath, 8)
  }
  pickFile2(e: DTOCFFile, width, height) {
    this.layoutService.getEditor().embedImgURL(e, width, height)
    this.layoutService.setFolderDialog(false)
  }
  //
  ngOnDestroy(): void {
    this.subArr.forEach(s => s?.unsubscribe())
  }
}
