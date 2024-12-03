import { Injectable } from '@angular/core';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable, BehaviorSubject } from "rxjs";
import { DTOResponse, PS_CommonService } from 'src/app/p-lib';
import { PortalApiConfigService } from './portal-api-config.service';
import { DTOQuizRole } from 'src/app/p-app/p-hri/shared/dto/DTOQuizRole.dto';
import { DTOExam } from '../dto/DTOExam.dto';
import { DTOUpdateExamPayload } from '../dto/DTOUpdateExamPayload.dto';
import { DTOExamAnswer } from '../dto/DTOExamAnswer.dto';
import { DTOExamEssay } from 'src/app/p-app/p-hri/shared/dto/DTOExamEssay.dto';
import { HriApiConfigService } from 'src/app/p-app/p-hri/shared/services/hri-api-config.service';

@Injectable({
    providedIn: 'root'
})
export class ExamApiService {
  

    constructor(
        public api: PS_CommonService,
        public config: PortalApiConfigService,
        public hrConfig: HriApiConfigService,
    ){}


    
}