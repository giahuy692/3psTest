import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigHamperService } from '../../shared/services/config-hamper.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { takeUntil } from 'rxjs/operators';
import { distinct } from '@progress/kendo-data-query';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';

@Component({
  selector: 'app-config002-hamper-detail',
  templateUrl: './config002-hamper-detail.component.html',
  styleUrls: ['./config002-hamper-detail.component.scss']
})
export class Config002HamperDetailComponent implements OnInit, AfterViewInit, OnDestroy {


  // permission
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false

  Unsubscribe = new Subject<void>();

  constructor(public hamperService: ConfigHamperService, public menuService: PS_HelperMenuService,) { }


  ngOnInit(): void {
    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        //action permission
        this.isMaster = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        // this.isMaster = false
        // this.isCreator = true
        // this.isApprover = true
        //Chỉ được xem
        this.isAllowedToViewOnly = this.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(this.actionPerm.filter(s => s.ActionType != 6))
      }
    })
    
  }
  ngAfterViewInit(): void {

  }

  loadPage() {
    this.hamperService.ReloadComponent();
  }

  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}
