import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { distinct } from '@progress/kendo-data-query';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PayslipService } from 'src/app/p-app/p-hri/shared/services/payslip.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PersonalInfoDetailComponent } from 'src/app/p-app/p-layout/components/personal-info-detail/personal-info-detail.component';

@Component({
  selector: 'app-config008-enterprise-personal-info-detail',
  templateUrl: './config008-enterprise-personal-info-detail.component.html',
  styleUrls: ['./config008-enterprise-personal-info-detail.component.scss']
})
export class Config008EnterprisePersonalInfoDetailComponent implements OnInit, OnDestroy {
  //#region ViewChild
  @ViewChild('personalInfoRef') personalInfoRef : PersonalInfoDetailComponent
  //#endregion

  //PERMISSION
  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  actionPerm: DTOActionPermission[] = []
  //#endregion 
  justLoaded = true
  isLockAll: boolean = false

  //#region Subject
  unsubscribe = new Subject<void>();
  //#endregion

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public payslipService: PayslipService,

  ) {
  }
  

  ngOnInit(): void {
    let that = this
    this.menuService.changePermission().pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
      }
    })
  }

  loadPage(){
    this.personalInfoRef.loadPage()
  }

  onAddNew(){
    this.personalInfoRef.onAddNew()
  }

  // Lấy Dữ liệu lưu trên Cache
  getCache() {
    const companyRes = localStorage.getItem('Company');
    if (Ps_UtilObjectService.hasValue(companyRes)) {
      if (companyRes == '4') {
        this.isLockAll = false;
      }
      else {
        this.isLockAll = true;
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
