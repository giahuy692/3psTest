import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ModuleDataAdmin } from 'src/app/p-app/p-layout/p-sitemaps/menu.data-admin';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ExamApiService } from 'src/app/p-app/p-portal/shared/services/Exam-api.service';
import { DTOQuizRole } from '../../shared/dto/DTOQuizRole.dto';
import { HriQuizSessionService } from '../../shared/services/hri-quiz-session.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';

@Component({
  selector: 'app-hri018-exam-appeal',
  templateUrl: './hri018-exam-appeal.component.html',
  styleUrls: ['./hri018-exam-appeal.component.scss']
})
export class Hri018ExamAppealComponent {
  //boolean
  isSorted: boolean = false;
  moduleName: string = '';

  //Stream
  staffQuizInfo: DTOQuizRole;
  ngUnsubscribe$ = new Subject<void>();

  constructor( private helperService: PS_HelperMenuService,
      private sessionService: HriQuizSessionService,
      public menuService: PS_HelperMenuService,
  ) {}

  ngOnInit(): void {
    let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res)) {
            this.getLocalStorage();
        }
    })
    this.arrUnsubscribe.push(permissionAPI)
  }

  getLocalStorage() {
      const res = JSON.parse(localStorage.getItem('ExamAppeal'));
      this.moduleName = localStorage.getItem('Module');
      this.staffQuizInfo = {...res};
  }

  openDetail() {
      let a = this.sessionService.GetCacheQuizSession().subscribe( s => {
          this.sessionService.setCacheQuizSession(s);
      });
      var parent = ModuleDataAdmin.find(s => s.Code.includes('hri'));
      var detail = parent.ListMenu.find(x => x.Code.includes('hriCompetency'));
      var detail1 = detail.LstChild.find(a => a.Code.includes('hri010-evaluation-tranche'));
      var detail2 = detail1.LstChild.find(v => v.Code.includes('hri016-appeal-list'));
      this.helperService.activeMenu(detail2);
      this.arrUnsubscribe.push(a)
  }

  //#region SUBSCRIPTION CALL API
	arrUnsubscribe: Subscription[] = []
	//#endregion
  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
        s?.unsubscribe();
    });
  }  
}
