import { MarCommonQuestionsAPIService } from './../../shared/services/mar-common-questions-api.service';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOMAPost_ObjReturn, DTOMACategory } from '../../shared/dto/DTOMANews.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';

import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { distinct } from '@progress/kendo-data-query';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';

@Component({
  selector: 'app-mar015-common-questions-detail',
  templateUrl: './mar015-common-questions-detail.component.html',
  styleUrls: ['./mar015-common-questions-detail.component.scss']
})
export class Mar015CommonQuestionsDetailComponent implements OnInit {
  that = this
  today = new Date()
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
  curLanguage: number = 0;
  languages: string[] = ['VN', 'JP', 'EN']
  // Question
  Question = new DTOMAPost_ObjReturn()
  // Category
  currentType: DTOMACategory[] = null;
  QuestionCategoryList: DTOMACategory[] = []
  defaultQuestionCategoryObj = new DTOMACategory()
  // Detail
  curImgSetting = 0
  postDate: Date = new Date()
  ImageSettingList: string[] = []
  // Files
  GetFolderCallback: Function
  pickFileCallback: Function
  // Subscription
  changePermission_sst: Subscription
  changeModuleData_sst: Subscription
  GetQuestion_sst: Subscription
  UpdateQuestion_sst: Subscription
  DeleteQuestion_sst: Subscription
  GetListCategory_sst: Subscription
  getCacheQuestionDetail_sst: Subscription
  changePermissionAPI: Subscription
  //
  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public apiService: MarCommonQuestionsAPIService,
    public apiServiceQuestion: MarNewsProductAPIService,
  ) { }

  ngOnInit(): void {
    let that = this

    this.defaultQuestionCategoryObj = new DTOMACategory()
    // this.GetListCategory()

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false;
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.getCache()
      }
    })
    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListCategory()
        this.getCache()
      }
    })
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
  }
  // Cache
  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.value == -1;
  }
  getCache() {
    this.getCacheQuestionDetail_sst = this.service.getCachePostDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.Question = res
        this.isAdd = this.Question.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }

      this.p_GetQuestion()
      this.curLanguage = Ps_UtilObjectService.hasValueString(this.Question.TitleJP) ? 1 : Ps_UtilObjectService.hasValueString(this.Question.TitleEN) ? 2 : 0
    })
  }
  GetListCategory() {
    this.loading = true;
    var ctx = 'Danh sách phân nhóm'

    this.GetListCategory_sst = this.apiService.GetListQuestionCategory().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.QuestionCategoryList = res.ObjectReturn.Data;

        if (this.isAdd) {
          this.defaultQuestionCategoryObj = this.QuestionCategoryList[0]
          this.Question.NewsCategory = this.defaultQuestionCategoryObj.Code
        }
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${error}`)
    });
  }
  p_GetQuestion() {
    this.loading = true;

    this.GetQuestion_sst = this.apiService.GetQuestion(this.Question.Code == null ? 0 : this.Question.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.Question = res.ObjectReturn;
        this.postDate = new Date(this.Question.PostDate)
        this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  onUpdateStatus(item: DTOMAPost_ObjReturn, StatusID: number) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'
    item.StatusID = item.StatusName = null;

    this.UpdateQuestion_sst = this.apiService.UpdateQuestionStatus([item], StatusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.p_GetQuestion()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  UpdateQuestion(prop: string[], item = this.Question) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " bài viết"

    if (this.isAdd)
      prop.push('NewsCategory')

    prop.push('PostDate')
    item.PostDate = this.today

    this.UpdateQuestion_sst = this.apiService.UpdateQuestion(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.service.isAdd = this.isAdd = false
        this.Question = res.ObjectReturn
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    });
  }
  DeleteQuestion(item: DTOMAPost_ObjReturn = this.Question) {
    this.loading = true;
    var ctx = 'Xóa bài viết'

    this.DeleteQuestion_sst = this.apiService.DeleteQuestion([item]).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.onCreateQuestion()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  // Button
  updateStatus(statusID: number) {
    var newPro = { ...this.Question }
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
      this.Question[`ImageSetting${imgSetting}`] = null

    if (!this.service.isAdd)
      this.UpdateQuestion([`ImageSetting${imgSetting}`])
  }
  onCreateQuestion() {
    this.isAdd = true
    this.Question = new DTOMAPost_ObjReturn();

    this.defaultQuestionCategoryObj = this.QuestionCategoryList[0]
    this.Question.NewsCategory = this.defaultQuestionCategoryObj.Code

    this.checkProp()
  }
  checkProp() {
    this.isLockAll = (this.Question.StatusID == 2 || this.Question.StatusID == 3) || //khóa khi duyệt, ngưng
      (this.Question.StatusID != 0 && this.Question.StatusID != 4 && this.isAllowedToCreate && !this.isAllowedToVerify)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.Question.StatusID == 0 || this.Question.StatusID == 4) && this.isAllowedToVerify)//khóa khi tạo, trả nếu có quyền duyệt
  }
  // Language
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  // Action
  onSaveInput(prop: string) {
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
        this.Question.PostDate = new Date(this.postDate)
        break
    }

    if (this.checkInput(this.Question.StatusID))
      this.UpdateQuestion([prop], this.Question)
  }
  onValueChange(type, val) {
    var language = this.languages[this.curLanguage]

    if (type == 'Title') {
      this.Question[`Title${language}`] = val
    } else if (type == 'Content') {
      this.Question[`Content${language}`] = val
    }
  }
  // Check
  checkInput(statusID: number) {
    if (statusID == 1 || statusID == 4) {
      if (!Ps_UtilObjectService.hasValueString(this.Question[`Title${this.languages[this.curLanguage]}`])) {
        this.layoutService.onError('Vui Lòng nhập câu hỏi!')
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(this.Question[`Content${this.languages[this.curLanguage]}`])) {
        this.layoutService.onError('Vui Lòng nhập nội dung!')
        return false
      }

      else if (!Ps_UtilObjectService.hasValueString(this.Question.NewsCategory)) {
        this.layoutService.onError('Vui Lòng chọn phân nhóm!')
        return false
      }
    }
    return true
  }
  // Files
  GetFolderWithFile(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceQuestion.GetFolderWithFile(childPath, 8)
  }
  pickFile(e: DTOCFFile, width, height) {
    if (this.curImgSetting > 0) {
      this.Question[`ImageSetting${this.curImgSetting}`] = e?.PathFile
      this.UpdateQuestion([`ImageSetting${this.curImgSetting}`])
    }
    else
      this.layoutService.getEditor().embedImgURL(e, width, height)

    this.layoutService.setFolderDialog(false)
  }
  //
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe();
    this.changePermissionAPI?.unsubscribe();
    this.changeModuleData_sst?.unsubscribe();
    this.GetQuestion_sst?.unsubscribe()
    this.getCacheQuestionDetail_sst?.unsubscribe()
    this.UpdateQuestion_sst?.unsubscribe();
    this.DeleteQuestion_sst?.unsubscribe();
    this.GetListCategory_sst?.unsubscribe();
    this.getCacheQuestionDetail_sst?.unsubscribe();
  }
}
