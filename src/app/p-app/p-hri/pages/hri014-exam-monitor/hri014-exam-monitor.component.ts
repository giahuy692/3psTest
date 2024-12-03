import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { Location } from '@angular/common';
import { DTOQuizRole } from "../../shared/dto/DTOQuizRole.dto";
import { HriQuizSessionService } from "../../shared/services/hri-quiz-session.service";
import { ExamApiService } from "src/app/p-app/p-portal/shared/services/Exam-api.service";
import { PS_HelperMenuService } from "src/app/p-app/p-layout/services/p-menu.helper.service";

@Component({
    selector: 'hri014-exam-monitor',
    templateUrl: './hri014-exam-monitor.component.html',
    styleUrls: ['./hri014-exam-monitor.component.scss']
})

export class Hri014ExamMonitorComponent implements OnInit, OnDestroy {
    //boolean
    isSorted: boolean = false;


    moduleName: string = '';

    //Stream
    ngUnsubscribe$ = new Subject<void>();
    ExamSession: any;
    staffQuizInfo: DTOQuizRole;

    constructor( private menuService: PS_HelperMenuService,
        private sessionService: HriQuizSessionService,
        private location: Location
    ) {}

    ngOnInit(): void {
        this.getLocalStorage();
    }
    
    getLocalStorage() {
        const res = JSON.parse(localStorage.getItem('staffQuizRole'));
        const StaffInfo = JSON.parse(localStorage.getItem('StaffInfo'));
        this.moduleName = localStorage.getItem('Module');
        this.staffQuizInfo = {...res};
        this.ExamSession = StaffInfo
    }

    openDetail() {
        this.sessionService.GetCacheQuizSession().subscribe( s => {
            this.sessionService.setCacheQuizSession(s);
        });
        this.location.back();
		// var parent = ModuleDataAdmin.find(s => s.Code.includes('hri'));
        // var detail = parent.ListMenu.find(x => x.Code.includes('hriCompetency'));
        // var detail1 = detail.LstChild.find(a => a.Code.includes('hri010-evaluation-tranche'));
        // var detail2 = detail1.LstChild.find(v => v.Code.includes('hri011-quiz-monitor'));
        // this.menuService.activeMenu(detail2);
	}
    loadData(){
        this.menuService.breadcrumbDataChanged.emit()
      }

    ngOnDestroy(): void {}
}