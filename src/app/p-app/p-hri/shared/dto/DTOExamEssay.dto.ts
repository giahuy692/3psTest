import { DTOAnswer } from "./DTOAnswer.dto";
import { DTOQuestion } from "./DTOQuestion.dto";

export class DTOExamEssay {
  Code: number = 0;
  Questions: DTOQuestion[] =  [];
  ListAnswers: DTOAnswer[] =  [];
  Question: string = '';
  Remark: string = null;
  NoOfMarked: number  = null;
  NoOfNotMarked: number = null;
  QuizSession: number = null;
  StaffID: number = null;
  StaffName: string = '';
  TypeOfQuestion: number = null;
  ExamID: number = null;
  QuizConfig: number = null;
  OrderBy: number = null;
  QuestionID: number = null;
  Answer: string = '';
  Comments: string = '';
  EvaluatedBy: number = null;
  Mark: number = null;
  MaxMark: number = null;
  CreateBy: string = null;
  CreateTime: string = null;
  LastModifiedBy: string = null;
  LastModifiedTime: string = null;
  RefAnswer: string = null;
  constructor() {}
}
