import { DTOCompetence } from './DTOCompetence.dto';

export class DTOQuestion {
  Code: number = 0;
  Company: number = 1;
  QuestionID: string = '';
  Question: string = '';
  Category: number = null;
  CategoryName: string = '';
  LevelID: number = 1;
  AppliedCompetenceTest: boolean = false;
  AppliedEventTest: boolean = false;
  AppliedPreTest: boolean = false;
  TypeOfQuestion: number = null;
  TypeOfQuestionName: string = '';
  TypeOfEvaluation: number = null;
  TypeOfReEvaluation:number = null;
  TypeOfEvaluationName: string = '';
  ListCompetence: DTOCompetence[] = [];
  Min: number = 0; // Giới hạn độ dài của câu tự luận
  Max: number = 4000; // Giới hạn độ dài của câu tự luận
  Duration: number = 0;
  Remark: string = '';
  RefAnswer: string = '';
  StatusName: string = 'Đang soạn thảo';
  StatusID: number = 0;
  RefID: number = null;
  CreateBy: string = '';
  CreateTime: Date | string = null;
  LastModifiedBy: string = '';
  LastModifiedTime: string = null;

  constructor() { }
}
