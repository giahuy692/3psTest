import { Injectable } from '@angular/core';
import { DTOResponse, PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from 'src/app/p-lib';
import { HriApiConfigService } from './hri-api-config.service';
import { LayoutApiConfigService } from 'src/app/p-app/p-layout/services/layout-api-config.service';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { DTOReEval } from '../dto/DTOReEval.dto';
import { DTOUpdateList } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOAnswer } from '../dto/DTOAnswer.dto';

@Injectable({
  providedIn: 'root'
})
export class HriAppealApiService {

  constructor(
    public api: PS_CommonService,
    public config: HriApiConfigService,
    public cacheService: Ps_UtilCacheService,
    public layoutConfig: LayoutApiConfigService,
  ) { }

  // Lấy danh sách Yêu cầu phúc khảo
  GetListExamAppealRequest(Code: number, gridState: State){
    let that = this;
    const ListExamAppealRequestParam = {
      QuizSession: Code,
      Filter: toDataSourceRequest(gridState)
    }
    return new Observable<DTOResponse>(obs =>{
      that.api.connect(that.config.getAPIList().GetListExamAppealRequest.method,
      that.config.getAPIList().GetListExamAppealRequest.url,
      JSON.stringify(ListExamAppealRequestParam)).subscribe(
        (res: DTOResponse) =>{
          obs.next(res);
          obs.complete();
        }, errors =>{
          obs.error(errors);
          obs.complete();
        }
      )
    })
  }


  //lấy danh sách câu hỏi phúc khảo
  GetListQuestionAppealRequest(Code: number, gridState: State){
    let that = this;
    const ListQuestionAppealRequestParam = {
      QuizSession: Code,
      Filter: toDataSourceRequest(gridState)
    }
    return new Observable<DTOResponse>(obs =>{
      that.api.connect(that.config.getAPIList().GetListQuestionAppealRequest.method,
      that.config.getAPIList().GetListQuestionAppealRequest.url,
      JSON.stringify(ListQuestionAppealRequestParam)).subscribe(
        (res: DTOResponse) =>{
          obs.next(res);
          obs.complete();
        }, errors =>{
          obs.error(errors);  
          obs.complete();
        }
      )
    })
  }

  //lấy danh sách Nhân sự tham gia chấm bài
  GetListStaffReEval(QuizSession: number){
    let that = this;
    return new Observable<DTOResponse>(obs =>{
      that.api.connect(that.config.getAPIList().GetListStaffReEval.method,
      that.config.getAPIList().GetListStaffReEval.url,
      JSON.stringify({ 'QuizSession': QuizSession })).subscribe(
        (res: DTOResponse) =>{
          obs.next(res);
          obs.complete();
        }, errors =>{
          obs.error(errors);
          obs.complete();
        }
      )
    })
  }


  //lấy danh sách nhân sự yêu cầu phúc khảo
  GetListAppealInQuestion(gridState: State){
    let that = this;
    return new Observable<DTOResponse>(obs =>{
      that.api.connect(that.config.getAPIList().GetListAppealInQuestion.method,
      that.config.getAPIList().GetListAppealInQuestion.url,
      JSON.stringify(toDataSourceRequest(gridState))).subscribe(
        (res: DTOResponse) =>{
          obs.next(res);
          obs.complete();
        }, errors =>{
          obs.error(errors);
          obs.complete();
        }
      )
    })
  }

  // cập nhật nhân sự chấm bài

  UpdateReEvalL(dto: DTOReEval[], prop: string[]){
    let that = this;
    var param: DTOUpdateList = {
      ListDTO: [...dto],
      Properties: prop
    }
    return new Observable<DTOResponse>(obs => {
      that.api.connect(that.config.getAPIList().UpdateReEval.method,
        that.config.getAPIList().UpdateReEval.url,
        JSON.stringify(param)).subscribe(
          (res: DTOResponse) => {
            obs.next(res);
            obs.complete();
          }, errors => {
            obs.error(errors);
            obs.complete();
          }
        )
    });
  }


  UpdateReEval(dto: any){
    let that = this;
    return new Observable<DTOResponse>(obs =>{
      that.api.connect(that.config.getAPIList().UpdateReEval.method,
      that.config.getAPIList().UpdateReEval.url,
      JSON.stringify(dto)).subscribe(
        (res: DTOResponse) =>{
          obs.next(res);
          obs.complete();
        }, errors =>{
          obs.error(errors);
          obs.complete();
        }
      )
    })
  }

  UpdateMarkMultipleReEval(dto: {QuizSession: number, Question: number, TypeOfMultipleReEval: number, ListMark: DTOAnswer[]}){
    let that = this;
    return new Observable<DTOResponse>(obs =>{
      that.api.connect(that.config.getAPIList().UpdateMarkMultipleReEval.method,
      that.config.getAPIList().UpdateMarkMultipleReEval.url,
      JSON.stringify(dto)).subscribe(
        (res: DTOResponse) =>{
          obs.next(res);
          obs.complete();
        }, errors =>{
          obs.error(errors);
          obs.complete();
        }
      )
    })
  }

}
