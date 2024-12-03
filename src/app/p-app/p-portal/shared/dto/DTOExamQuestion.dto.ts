import { DTOCompetence } from "src/app/p-app/p-hri/shared/dto/DTOCompetence.dto";
import { DTOQuestion } from "src/app/p-app/p-hri/shared/dto/DTOQuestion.dto";
import { DTOReEval } from "src/app/p-app/p-hri/shared/dto/DTOReEval.dto";
import { DTOExamAnswer } from "./DTOExamAnswer.dto";

export class DTOExamQuestion {
    Code: number;
    ExamID: number;
    QuestionID: number;
    Question: string;
    Questions: DTOQuestion[] = null;
    Answer: string;
    Min: number = null; // Giới hạn ký tự câu tự luận
    Max: number = null; // Giới hạn ký tự câu tự luận
    CategoryName: string;
    Comments:string = null;
    EvaluatedBy: string = null;
    EvaluatedByName: string = "";
    Remark:string = null;
    RefAnswer: string;
    OrderBy: number;
    Mark: number;
    MaxMark:number =  null;
    FinalMark:number = null;
    NoOfMarked:number = null;
    NoOfNotMarked:number = null;
    StaffID:number = null;
    StaffName: string;
    QuizConfig: number;
    QuizSession: number;
    QuizSessionSessionStatusID: number;
    QuizSessionStatusID: number;
    TypeOfQuestion: number;
    ListCompetence: DTOCompetence[] = [];
    ListAnswers: DTOExamAnswer[]; 
    ListReEval: DTOReEval[] = [];
    PartialCorrect:number = null;
    StatusID: number;
    StatusName: string = '';
    CreateBy:string = null;
    CreateTime:string = null;
    LastModifiedBy: string;
    LastModifiedTime: string;
}
