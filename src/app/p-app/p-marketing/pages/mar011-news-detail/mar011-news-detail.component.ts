import { MarketingService } from 'src/app/p-app/p-marketing/shared/services/marketing.service';
import { Ps_UtilObjectService } from './../../../../p-lib/utilities/utility.object';
import { from, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DTOMACategory, DTOMAPost_ObjReturn } from '../../shared/dto/DTOMANews.dto';
import { MarNewsAPIService } from '../../shared/services/mar-news-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { distinct, State } from '@progress/kendo-data-query';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { FormGroup } from '@angular/forms';
import { EditorComponent } from '@progress/kendo-angular-editor';
import { DTOEmbedImg, DTOEmbedVideo } from '../../shared/dto/DTOEmbedVideo.dto';
import { DTOMAHashtag } from '../../shared/dto/DTOMAHashtag.dto';
import { MarHashtagAPIService } from '../../shared/services/mar-hashtag-api.service';

import { delay, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-mar011-news-detail',
  templateUrl: './mar011-news-detail.component.html',
  styleUrls: ['./mar011-news-detail.component.scss']
})
export class Mar011NewsDetailComponent implements OnInit {
  @ViewChild('myeditor') myeditor: EditorComponent;
  @ViewChild('multiSelect') multiSelect;
  // Permission
  loading: boolean = false;
  isLoaded: boolean = true;

  isAdd: boolean = false;
  isLockAll: boolean = false;

  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;

  actionPerm: DTOActionPermission[] = []
  //
  // Language
  curTab: number = 0
  curLanguage: number = 0
  languages: string[] = ['VN', 'JP', 'EN']
  //
  // News
  postDate: Date = new Date()
  curImgSetting = 0
  ImageSettingList: string[] = []
  news = new DTOMAPost_ObjReturn()
  //
  // Category
  listCategory: DTOMACategory[] = []
  defaultCategory = new DTOMACategory();
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
  //
  // Callback
  // Folder Ảnh nền
  GetFolderCallback: Function
  pickFileCallback: Function
  // Folder Nội dung
  GetFolderCallback2: Function
  pickFileCallback2: Function
  //
  // Dialog
  showDeleteDialog: boolean = false;
  showClearDialog: boolean = false;
  //
  // Subscription
  subArr: Subscription[] = []
  //
  constructor(
    public service: MarketingService,
    public layoutService: LayoutService,
    public apiService: MarNewsAPIService,
    public marApiService: MarHashtagAPIService,
    public menuService: PS_HelperMenuService,
    
    public apiServiceNews: MarNewsProductAPIService,
  ) { }

  ngOnInit(): void {
    let that = this
    
    // this.getListCategory()

    let sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.isLoaded) {
        that.isLoaded = false;
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isMaster = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isCreator = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isApprover = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        // this.getNewsCache()
      }
    })
    let changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getListCategory()      
        this.getNewsCache()
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
  // Category
  getListCategory() {
    this.loading = true;
    var ctx = 'Danh sách phân nhóm'

    let sst = this.apiService.GetListNewsCategory().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCategory = res.ObjectReturn.Data;
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
    this.subArr.push(sst)
  }
  //  load filter  
  onMultiSelectFilter() {
    const contains = (value) => (s:DTOMAHashtag) =>
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
  // News
  getNews() {
    this.loading = true;

    let sst = this.apiService.GetNews(this.news.Code == null ? 0 : this.news.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.news = res.ObjectReturn;
        this.checkProp()
      }

      this.loading = false;
    }, () => {
      this.loading = false;
    });
    this.subArr.push(sst)
  }
  getNewsCache() {
    let sst = this.service.getCacheNewsDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.news = res
        this.defaultCategory = new DTOMACategory()
        this.isAdd = this.news.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }

      if (!this.isAdd || this.news.Code != 0) {
        this.getNews()
        this.curLanguage = Ps_UtilObjectService.hasValueString(this.news.TitleVN) ? 0 : Ps_UtilObjectService.hasValueString(this.news.TitleJP) ? 1 : Ps_UtilObjectService.hasValueString(this.news.TitleEN) ? 2 : 0
      }
      if (this.service.isAdd) {
        this.defaultCategory = this.listCategory[0]
        this.news.NewsCategory //= this.category 
          = this.defaultCategory.Code
      }
      this.GetListHashtag()
    })
    this.subArr.push(sst)
  }
  //API
  updateStatus(items: DTOMAPost_ObjReturn[] = [this.news], StatusID: number) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'

    let sst = this.apiService.UpdateNewsStatus(items, StatusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.getNews()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
    this.subArr.push(sst)
  }
  UpdateNews(prop: string[], item = this.news) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " bài viết"

    if (this.isAdd)
      prop.push('NewsCategory')

    let sst = this.apiService.UpdateNews(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.news = res.ObjectReturn
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
  deleteNews(item: DTOMAPost_ObjReturn) {
    this.loading = true;
    var ctx = 'Xóa bài viết'

    let sst = this.apiService.DeleteNews([item]).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.showDeleteDialog = false;
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.onCreateNews()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
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
  //  
  // Language
  changeTab(tab: number) {
    this.curTab = tab
  }
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  //
  // Buttons
  onCreateNews() {
    this.isAdd = true
    this.postDate = new Date()
    this.news = new DTOMAPost_ObjReturn();
    this.news.PostDate = this.postDate
    this.defaultCategory = this.listCategory[0]
    this.news.NewsCategory = this.listCategory[0]?.Code
    this.listSelectedHashtag = []
    this.checkProp()
  }
  onClickChangeStatus(statusID: number) {
    var newPro = { ...this.news }
    // newPro.StatusID = statusID

    if (this.checkDetail(statusID)) {
      this.updateStatus([newPro], statusID)
    }
  }
  //  
  // Check Detail
  checkDetail(statusID: number) {
    if (this.service.isAdd) {
      this.service.isAdd = false
      return true
    }

    if (statusID == 1 || statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(this.news.TitleVN)) {
        this.layoutService.onError('Vui lòng nhập tiêu đề!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.news.SummaryVN)) {
        this.layoutService.onError('Vui lòng nhập miêu tả!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.news.ContentVN)) {
        this.layoutService.onError('Vui lòng nhập nội dung!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.news.NewsCategory)) {
        this.layoutService.onError('Vui lòng chọn phân nhóm!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.news.PostDate)) {
        this.layoutService.onError('Vui lòng nhập ngày post!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.news.ImageSetting1)) {
        this.layoutService.onError(`Vui lòng chọn Ảnh đại diện!`)
        return false
      }
      // else if (!Ps_UtilObjectService.hasValueString(this.news.ImageSetting2)) {
      //   this.layoutService.onError(`Vui lòng chọn Ảnh nền 1!`)
      //   return false
      // }
      else if (!Ps_UtilObjectService.hasValueString(this.news.ImageSetting3)) {
        this.layoutService.onError(`Vui lòng chọn Ảnh nền 2!`)
        return false
      }
    }
    return true
  }
  checkProp() {
    this.isLockAll = (this.news.StatusID == 2 || this.news.StatusID == 3) || //khóa khi duyệt, ngưng
      (this.news.StatusID != 0 && this.news.StatusID != 4 && this.isCreator && !this.isApprover)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.news.StatusID == 0 || this.news.StatusID == 4) && this.isApprover && !this.isCreator)//khóa khi tạo, trả nếu có quyền duyệt

    if (Ps_UtilObjectService.hasValueString(this.news.PostDate))
      this.postDate = new Date(this.news.PostDate)
    else
      this.news.PostDate = this.postDate

    if (Ps_UtilObjectService.hasValueString(this.news.ListTag) && Ps_UtilObjectService.hasListValue(this.listHashtag)) {
      this.listSelectedHashtag = []
      var tagList: DTOMAHashtag[] = []

      JSON.parse(this.news.ListTag).map(s => {//lọc ra các json bị lỗi \"["\"["\"["\"[" này
        if (Ps_UtilObjectService.hasValue(s) && Ps_UtilObjectService.hasValue(s.Code) && s.Code != 0)
          tagList.push(s)
      })
      this.listSelectedHashtag = this.listHashtag.filter(s => tagList.findIndex(t => t.Code == s.Code) > -1)
    }
  }
  //
  // Detail
  saveNewsDetail() {
    var prop: string[] = []

    if (this.service.isAdd) {
      this.news = new DTOMAPost_ObjReturn();
    }

    this.postDate = new Date()
    this.news.PostDate = this.postDate

    if (this.checkDetail(this.news.StatusID))
      this.UpdateNews(prop, this.news);
  }

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
        this.news.PostDate = this.postDate
        break
      case 'ListTag':
        this.news.ListTag = JSON.stringify(this.listSelectedHashtag)
        break
    }

    if (this.checkDetail(this.news.StatusID))
      this.UpdateNews([prop], this.news)
  }
  onValueChange(type, val) {
    var language = this.languages[this.curLanguage]

    switch (type) {
      case 'Title':
        this.news[`Title${language}`] = val
        break
      case 'Summary':
        this.news[`Summary${language}`] = val
        break
      case 'Content':
        this.news[`Content${language}`] = val
        break
    }
  }
  //
  // Files
  // Folder CMS Thumb
  GetFolderWithFile(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNews.GetFolderWithFile(childPath, 13)
  }
  pickFile(e: DTOCFFile, width, height) {
    this.news[`ImageSetting${this.curImgSetting}`] = e?.PathFile
    this.UpdateNews([`ImageSetting${this.curImgSetting}`])
    this.layoutService.setFolderDialog(false)
  }
  // Folder CMS
  GetFolderWithFile2(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNews.GetFolderWithFile(childPath, 8)
  }
  pickFile2(e: DTOCFFile, width, height) {
    this.layoutService.getEditor().embedImgURL(e, width, height)
    this.layoutService.setFolderDialog(false)
  }
  onUploadImg(imgSetting: number) {
    this.curImgSetting = imgSetting
    this.layoutService.folderDialogOpened = true
  }
  onRemoveImg(imgSetting: number) {
    this[`imgSetting${imgSetting}`] =
      this.news[`ImageSetting${imgSetting}`] = null

    if (!this.service.isAdd)
      this.UpdateNews([`ImageSetting${imgSetting}`])
  }
  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.value == -1;
  }

  ngOnDestroy() {
    this.subArr.forEach(s => s?.unsubscribe())
  }
}
