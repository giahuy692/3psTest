import { Component } from '@angular/core';
import { DTOQuizRole } from 'src/app/p-app/p-hri/shared/dto/DTOQuizRole.dto';
import { Subject } from 'rxjs';
import { ExamApiService } from '../../shared/services/Exam-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTOExamQuestion } from '../../shared/dto/DTOExamQuestion.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';

@Component({
  selector: 'app-portal001-exam-detail',
  templateUrl: './portal001-exam-detail.component.html',
  styleUrls: ['./portal001-exam-detail.component.scss']
})
export class Portal001ExamDetailComponent{
  showDialog = false
  falseItems: number
  restTime: number = 900;
  ngUnsubscribe$ = new Subject<void>();

  constructor(private layoutService: LayoutService) {}
  ngOnInit(): void {
  }

 
}
