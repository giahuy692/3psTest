import { DTOReEval } from "./DTOReEval.dto";

export class DTOExamAppeal {
    StaffName:string = '';
    StaffID: string = '';
    Position: string = '';
    ImageThumb: string = '';
    Mark: number = 0;
    FinalMark: number = 0;
    Staff: number = 0;
    ListAppeal: DTOReEval[];
    Code: number = 0;
    StatusID: number = 0;
    StatusName: string = '';
    CreatedBy: string = '';
    CreatedTime: Date;
    LastModifiedBy: string = '' ;
    LastModifiedTime: Date;
    NoOfQuestion: number = 0;
    NoOfMarked: number = 0;
    NoOfNotMarked: number = 0;
    QuizSession: number = 0;
    constructor() {}
}

export class DTOQuestionAppeal {
    Code: number = 0;
    QuestionID: number = 0;
    Question: string = '';
    TypeOfQuestion: number = 0;
    NoOfQuestion: number = 0;
    NoOfMarked: number = 0;
    NoOfNotMarked: number = null;
    CreatedBy: string = '';
    CreatedTime: Date;
    LastModifiedBy: number = 0;
    LastModifiedTime: Date;
    StatusID: number = 0;
    StatusName: string = '';
    EvaluateBy: number = 0;
    ListAppeal: DTOReEval[];
    constructor() {}
}