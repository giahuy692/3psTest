import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { HriSalaryService } from '../../shared/services/hr-salary.service';
import { DTOMAPost_ObjReturn } from 'src/app/p-app/p-marketing/shared/dto/DTOMANews.dto';
import { takeUntil } from 'rxjs/operators';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MarNewsAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-news-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { distinct } from '@progress/kendo-data-query';

@Component({
  selector: 'app-hri020-news-detail',
  templateUrl: './hri020-news-detail.component.html',
  styleUrls: ['./hri020-news-detail.component.scss']
})
export class Hri020NewsDetailComponent implements OnInit {


  news = new DTOMAPost_ObjReturn()
  post = new DTOMAPost_ObjReturn()


  AddNew: boolean = false
  delete: boolean = false
  StatusID: number = 0
  newObject = new DTOMAPost_ObjReturn()

  //permission 
  isAllPers: boolean = false
  isCanCreate: boolean = false
  isCanApproved: boolean = false
  justLoaded: boolean = true
  dataPerm: DTODataPermission[] = [];
  actionPerm: DTOActionPermission[] = [];

  //dialog delete
  opened: boolean = false

  //unsubcribe
  Unsubscribe = new Subject<void>

  constructor(
    private changeDetector: ChangeDetectorRef,
    public salaryService: HriSalaryService,
    public apiServiceNews: MarNewsAPIService,
    public layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
  ) {

  }
  ngOnInit() {

    // this.getCache()

    // phân quyền  
    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        var that = this
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');
        that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;

        // this.isAllPers = false
        // this.isCanCreate = true
        // this.isCanApproved = false
      }
    });

  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  //#region ======== cache
  // lấy thông tin detail từ cache
  getCache() {
    this.salaryService.getCacheNewsDetail().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        // console.log(this.news)
        this.news = res
        this.StatusID = this.news.StatusID
      }
    })
  }

  GetData(data) {
    // console.log('data: ', data);
    this.news = data
  }
  //#endregion 

  //#region ======== BREADCUM
  reloadData() {
    this.APIGetCMSNews()
  }
  //#endregion 

  //#region ======== XỬ LÝ NÚT LƯU, CẬP NHẬT TRẠNG THÁI, XÓA, TẠO

  // xử lý nút cập nhật trạng thái
  onBtnStatus(statusID: any) {
    // this.salaryService.getCacheNewsDetail().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
    //   if (Ps_UtilObjectService.hasValue(res)) {
    //     this.news = res
    //     var newPost = { ...this.news }
    if (this.checkDetail(this.news, statusID)) {
      // this.APIUpdateStatusNew([newPost], statusID)
      this.StatusID = statusID
      // console.log(this.StatusID);
    }
    //   }
    // })
  }


  // Check trường bắt buộc
  checkDetail(dataItem: any, statusID: number) {
    if (statusID == 1 || statusID == 2) {

      if (!Ps_UtilObjectService.hasValueString(dataItem.NewsCategoryName)) {
        this.layoutService.onWarning(`Vui lòng chọn phân nhóm!`)
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(dataItem.TitleVN)) {
        this.layoutService.onWarning(`Vui lòng nhập tiêu đề Tiếng Việt!`)
        return false
      }
      else if (!Ps_UtilObjectService.hasValueString(dataItem.PostDate)) {
        this.layoutService.onWarning(`Vui lòng chọn thời gian hiển thị!`)
        return false
      }
    }
    return true
  }

  //nhận emit từ cpn hr-neww-detail
  messFormChil(event: DTOMAPost_ObjReturn) {
    // console.log(event);
    this.news = event
  }

  // xử lý nút tạo mới
  onCreatePost() {
    this.AddNew = !this.AddNew
    this.StatusID = 0
    // this.salaryService.setCacheNewsDetail(this.newObject)
    // this.news.StatusID = 0

    // load lại dữ liệu của component bài viết
    // this.salaryService.ReloadComponent();
  }

  // toggle nút xóa
  onToggleDel() {
    this.salaryService.getCacheNewsDetail().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.news = res

        //check trước khi xóa
        if (this.checkDetail(this.news, 1)) {
          this.opened = !this.opened;
        }
      }
    })
  }

  //xử lý nút xóa
  onDeleteDialog(status: string): void {
    if (status == 'yes') {
      this.delete = !this.delete
      this.opened = false;
    } else {
      this.opened = false;
    }
  }

  //#endregion 


  //#region API
  //API update status
  // APIUpdateStatusNew(dataUpdate: DTOMAPost_ObjReturn[], StatusID: number) {
  //   const ctx = 'bài viết chính sách'
  //   this.apiServiceNews.UpdateNewsStatus(dataUpdate, StatusID).pipe(takeUntil(this.Unsubscribe)).subscribe(
  //     (res) => {
  //       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
  //         this.layoutService.onSuccess(`Cập nhật trạng thái ${ctx} thành công`)
  //         this.salaryService.setCacheNewsDetail(dataUpdate[0])
  //         this.salaryService.ReloadComponent();
  //         this.news.StatusID = StatusID
  //       }
  //       else {
  //         this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái ${ctx}: ${res.ErrorString}`)
  //       }
  //     },
  //     (error) => {
  //       this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái ${ctx}: ${error}`)
  //     }
  //   )
  // }


  //Delete detail policy
  // APIDeleteNew(dataDelete: any) {
  //   const ctx = 'bài viết chính sách'
  //   this.apiServiceNews.DeleteNews([dataDelete]).pipe(takeUntil(this.Unsubscribe)).subscribe(
  //     (res) => {
  //       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
  //         this.layoutService.onSuccess(`Xóa ${ctx} thành công`)
  //         this.salaryService.setCacheNewsDetail(this.newObject)
  //         this.salaryService.ReloadComponent();
  //       }
  //       else {
  //         this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${res.ErrorString}`)
  //       }
  //     },
  //     (error) => {
  //       this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${error}`)
  //     }
  //   )
  // }

  APIGetCMSNews() {
    this.apiServiceNews.GetCMSNews(this.news).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.news = res.ObjectReturn;
      }
    }, () => {
    });
  }
  //#endregion 


  //destroy
  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}
