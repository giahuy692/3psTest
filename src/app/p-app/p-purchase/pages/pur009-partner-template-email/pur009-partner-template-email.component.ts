import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { DTOPartnerTemplateEmail } from '../../shared/dto/DTOPartnerTemplateEmail.dto';
import { PurSupplierApiServiceService } from '../../shared/services/pur-supplier-api.service.service';
import { takeUntil } from 'rxjs/operators';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-pur009-partner-template-email',
  templateUrl: './pur009-partner-template-email.component.html',
  styleUrls: ['./pur009-partner-template-email.component.scss']
})
export class Pur009PartnerTemplateEmailComponent {

  // DTO Template Email
  objTemplateEmail: DTOPartnerTemplateEmail = new DTOPartnerTemplateEmail;

  // variable NoticeError, Success
  noticeError: string = 'Đã xảy ra lỗi'
  noticeSuccess: string = 'Cập nhật template email thành công'

  //Unsubcribe
  ngUnsubscribe = new Subject<void>();

  // Callback
  // Folder Nội dung
  GetFolderCallback2: Function
  pickFileCallback2: Function

  constructor(public layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
    public apiServiceBlog: MarNewsProductAPIService,
    public apiServiceSupplier: PurSupplierApiServiceService) {

  }
  ngOnInit() {
    // this.getCache()
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache()
      }
    })
    //CMS
    this.pickFileCallback2 = this.pickFile2.bind(this)
    this.GetFolderCallback2 = this.GetFolderWithFile2.bind(this)
  }

  getCache() {
    let cache = JSON.parse(localStorage.getItem('supplierInfo'))
    this.objTemplateEmail.Code = cache.Code;
    this.APIGetTemplateEmail()
  }
  //#region API
  APIGetTemplateEmail() {

    this.apiServiceSupplier.GetTemplateEmail(this.objTemplateEmail).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
        this.objTemplateEmail = res.ObjectReturn
      }
      else {
        this.layoutService.onError(`${this.noticeError} khi lấy template email: ${res.ErrorString}`)
      }
    }, (errors) => {
      this.layoutService.onError(`${this.noticeError} khi lấy template email: ${errors}`)

    })
  }

  APIUpdateTemplateEmail(dataUpdateTemplate: DTOPartnerTemplateEmail) {
    // const data = {
    //   DTO: dataUpdateTemplate,
    //   Properties: prop
    // }
    this.apiServiceSupplier.UpdateTemplateEmail(dataUpdateTemplate).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.objTemplateEmail = res.ObjectReturn
        this.layoutService.onSuccess(`${this.noticeSuccess}`)
      }
      else {
        this.layoutService.onError(`${this.noticeError} khi cập nhật template email: ${res.ErrorString}`)
      }
    }, (errors) => {
      this.layoutService.onError(`${this.noticeError} khi cập nhật template email: ${errors}`)
    })
  }
  //#endregion

  //#region handle action Update and Check Data Input
  handleCallUpdate(prop: string[]) {
    let isMailToValid = true;
    let isMailCCValid = true;

    if (!Ps_UtilObjectService.isValidEmail(this.objTemplateEmail.MailTo) && prop[0] == 'MailTo') {
      isMailToValid = false;
      this.layoutService.onWarning('Vui lòng nhập đúng định dạng email ');
    }
    else if (!Ps_UtilObjectService.isValidEmail(this.objTemplateEmail.MailCC) && prop[0] == 'MailCC') {
      isMailCCValid = false;
      this.layoutService.onWarning('Vui lòng nhập đúng định dạng email');
    }
    else if (!Ps_UtilObjectService.hasValueString(this.objTemplateEmail.MailContext) && prop[0] === 'MailContext') {
      this.layoutService.onWarning('Vui lòng nhập nội dung email')
    }
    else {
      this.APIUpdateTemplateEmail(this.objTemplateEmail);
    }
    // if (isMailToValid && prop[0] == 'MailTo') {
    //   if (Ps_UtilObjectService.hasValueString(this.objTemplateEmail.MailContext)) {
    //     this.APIUpdateTemplateEmail(this.objTemplateEmail);
    //   }
    //   else {
    //     this.layoutService.onWarning('Email người nhận đúng định dạng, vui lòng nhập nội dung');
    //   }
    // }

    // if (Ps_UtilObjectService.hasValueString(this.objTemplateEmail.MailContext) && prop[0] === 'MailContext') {
    //   if (!Ps_UtilObjectService.isValidEmail(this.objTemplateEmail.MailTo)) {
    //     this.layoutService.onWarning('Vui lòng nhập email người nhận');
    //   }
    // }

    // if (isMailCCValid && prop[0] == 'MailCC') {
    //   this.APIUpdateTemplateEmail(this.objTemplateEmail);
    // }
  }

  onSaveInput(prop: string[], e: string) {
    this.objTemplateEmail.MailContext = e
    if (Ps_UtilObjectService.hasValueString(this.objTemplateEmail.MailTo)) {
      this.handleCallUpdate(prop)
    } else {
      this.layoutService.onWarning('Vui lòng nhập Email người nhận!!!')
    }
  }


  //#endregion

  // reload data breadcrumb
  reloadData() {
    this.getCache()
  }

  // Folder CMS
  GetFolderWithFile2(childPath: string) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceBlog.GetFolderWithFile(childPath, 18)
  }
  pickFile2(e: DTOCFFile, width, height) {
    this.layoutService.getEditor().embedImgURL(e, width, height)
    this.layoutService.setFolderDialog(false)
  }
  //

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
