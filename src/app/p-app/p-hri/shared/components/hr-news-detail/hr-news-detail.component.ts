import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { distinct } from '@progress/kendo-data-query';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOMACategory, DTOMAPost_ObjReturn } from 'src/app/p-app/p-marketing/shared/dto/DTOMANews.dto';
import { MarNewsAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-news-api.service';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { HriSalaryService } from '../../services/hr-salary.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarketingService } from 'src/app/p-app/p-marketing/shared/services/marketing.service';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-hr-news-detail',
  templateUrl: './hr-news-detail.component.html',
  styleUrls: ['./hr-news-detail.component.scss']
})
export class HrNewsDetailComponent implements OnInit, OnDestroy {

  @Input() Status: number = 0;
  @Input() CreateNews: boolean = false
  @Input() DeleteNews: boolean = false

  @Output() dataChange :EventEmitter<DTOMAPost_ObjReturn> = new EventEmitter<DTOMAPost_ObjReturn>();


  // number
  curTab: number = 0
  curLanguage: number = 0;
  StatusID: number = 0
  curImgSetting: number = 0


  // Date
  postDate: Date 
  MaxDate: Date = new Date()

  // string
  Lang: string = ''
  Content: string = ''
  title: string = ''

  // boolean
  loading: boolean = false;
  isLoaded: boolean = true;
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isItemDisabled: boolean = false

  // List
  actionPerm: DTOActionPermission[] = []
  listCategory: DTOMACategory[] = []
  languages: string[] = ['VN', 'JP', 'EN']

  // object
  news = new DTOMAPost_ObjReturn()
  selectedCategory = new DTOMACategory()

  //  Subscription
  Unsubscribe = new Subject<void>();
  @Output() event = new EventEmitter<DTOMAPost_ObjReturn>();

   // Callback
  // Folder Ảnh nền
  GetFolderCallback: Function
  pickFileCallback: Function
  // Folder Nội dung
  GetFolderCallback2: Function
  pickFileCallback2: Function
  //

  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,
    public apiServiceNews: MarNewsAPIService,
    public layoutService: LayoutService,
    public salaryService: HriSalaryService,
    public apiServiceNewsProduct: MarNewsProductAPIService,

  ) { }

  ngOnInit(): void {

    let that = this

    this.postDate = new Date()

    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetListCMSNewsCategory()
        // this.triggerCustomEvent()
			}
		})

    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.isLoaded) {
        that.isLoaded = false;
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isMaster = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isCreator = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isApprover = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // that.isMaster = false
        // that.isCreator = false
        // that.isApprover = true
      }
    })
    
    //CMS Thumb
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
    //CMS
    this.pickFileCallback2 = this.pickFile2.bind(this)
    this.GetFolderCallback2 = this.GetFolderWithFile2.bind(this)
  }

 ngOnChanges(changes: SimpleChanges): void {
    if(Ps_UtilObjectService.hasValue(changes.Status) && (this.news.Code != 0)){
      if(changes.Status.previousValue != changes.Status.currentValue){
        if(changes.Status.currentValue != 0){
          this.Status = changes.Status.currentValue
          this.APIUpdateStatusNew([this.news], this.Status)
        }  
      } 
    }
    if(Ps_UtilObjectService.hasValue(changes.CreateNews) && (this.news.Code != 0)){
      if(changes.CreateNews.previousValue != changes.CreateNews.currentValue){
        this.clearData()
      }
    }
    if(Ps_UtilObjectService.hasValue(changes.DeleteNews) && (this.news.Code != 0)){
      if(changes.DeleteNews.previousValue != changes.DeleteNews.currentValue){
        this.APIDeleteNew(this.news)
      }
    }
  }
  
  // api
  getCache() {
    this.salaryService.getCacheNewsDetail().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.news = res
        if (this.news.Code == 0) {
          this.clearData()
        } else {
          this.APIGetCMSNews()
          this.curLanguage = Ps_UtilObjectService.hasValueString(this.news.TitleVN) ? 0 : Ps_UtilObjectService.hasValueString(this.news.TitleJP) ? 1 : Ps_UtilObjectService.hasValueString(this.news.TitleEN) ? 2 : 0
        }
      }
    })
  }

  APIGetListCMSNewsCategory() {
    this.loading = true;
    var ctx = 'Danh sách phân nhóm'

    this.apiServiceNews.GetListCMSNewsCategory(7).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCategory = res.ObjectReturn;
        this.getCache()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }

  APIGetCMSNews() {
    this.loading = true;
    this.apiServiceNews.GetCMSNews(this.news).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.news = res.ObjectReturn;
        this.selectedCategory = this.listCategory.find(t => t.Code === this.news.NewsCategory);
        this.title = this.selectedCategory.NewsCategory
        if(Ps_UtilObjectService.hasValue(this.news.PostDate)){
          this.postDate = new Date(this.news.PostDate)
        }
        this.dataChange.emit(this.news)
        this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  isUpdate: any
  APIUpdateCMSNews(prop: string[], item = this.news) {
    this.loading = true;
    var ctx = (item.Code == 0 ? "Tạo mới" : "Cập nhật") + " bài viết"

    if (item.Code == 0){
      prop.push('PostDate' , 'NewsCategory')

    }

    this.apiServiceNews.UpdateCMSNews(item, prop).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.news = res.ObjectReturn
        this.dataChange.emit(this.news)
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.salaryService.setCacheNewsDetail(this.news)
        this.event.emit(this.news);

      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    });
  }

  APIUpdateStatusNew(dataUpdate: DTOMAPost_ObjReturn[], StatusID: number) {
    const ctx = 'bài viết chính sách'
    this.apiServiceNews.UpdateNewsStatus(dataUpdate, StatusID).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.APIGetCMSNews()
          this.layoutService.onSuccess(`Cập nhật trạng thái ${ctx} thành công`)
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái ${ctx}: ${res.ErrorString}`)
        }
      },
      (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái ${ctx}: ${error}`)
      }
    )
  }

  APIDeleteNew(dataDelete: any) {
    const ctx = 'bài viết chính sách'
    this.apiServiceNews.DeleteNews([dataDelete]).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.clearData()
          this.layoutService.onSuccess(`Xóa ${ctx} thành công`)
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${res.ErrorString}`)
        }
      },
      (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${error}`)
      }
    )
  }


  checkProp() {
    // 
    if (this.isMaster || this.isCreator) {
      if (this.news.StatusID == 0 || this.news.StatusID == 4 || (this.isMaster && this.news.StatusID == 1) || this.news.Code == 0) {
        this.isItemDisabled = false
      } else {
        this.isItemDisabled = true
      }
    } else {
      if (this.news.StatusID == 1) {
        this.isItemDisabled = false
      }
      this.isItemDisabled = true
    }

  }

  // title
  changeTab(tab: number) {
    this.curTab = tab
  }

  changeLanguage(lang: number) {
    this.curLanguage = lang
  }

  clearData(){
    this.news = new DTOMAPost_ObjReturn()
    this.dataChange.emit(this.news)
    this.isItemDisabled = false

    this.selectedCategory = this.listCategory[0];
    this.title = this.selectedCategory.NewsCategory
    this.postDate = new Date()
    this.news.PostDate = this.postDate
    this.news.NewsCategory = this.selectedCategory.Code
    this.news.ContentVN = ''
    this.news.ContentJP = ''
    this.news.ContentEN = ''
  }
  // blockcontent

  onDropdownlistClick(event) {
    this.selectedCategory = event
    this.news.NewsCategory = this.selectedCategory.Code
    const porp = ['NewsCategory']
    this.APIUpdateCMSNews(porp, this.news)
  }

  onDatepickerChange(event) {
    this.postDate = event
    const dateString = formatDate(this.postDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
    this.news.PostDate = dateString
    const porp = ['PostDate']
    this.APIUpdateCMSNews(porp, this.news)
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
    }
    this.APIUpdateCMSNews([prop], this.news)
  }

  // Folder CMS Thumb
  GetFolderWithFile(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNewsProduct.GetFolderWithFile(childPath, 17)
  }
  pickFile(e: DTOCFFile, width, height) {
    this.news[`ImageSetting${this.curImgSetting}`] = e?.PathFile
    this.APIUpdateCMSNews([`ImageSetting${this.curImgSetting}`])
    this.layoutService.setFolderDialog(false)
  }
  // Folder CMS
  GetFolderWithFile2(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNewsProduct.GetFolderWithFile(childPath, 17)
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
      this.APIUpdateCMSNews([`ImageSetting${imgSetting}`])
  }

  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}
