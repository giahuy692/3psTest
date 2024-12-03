export class DTOQuestionReport {
    QuestionID: number;
    Question: string = '';
    Remark: string = null;
    NoOfMarked: number = null;
    NoOfNotMarked: number = null;
    ExamID: number;
    QuizSession: number = null;
    EvaluatedBy: number = null;
    StaffID: number = null;
    StaffName: string = '';
    CompetenceName: string = '';
    CategoryName: string = '';
    LevelID: number;
    NoOfAllCorrect: number = null;
    NoOfAllWrong: number = null;
    NoOfPartialCorrect: number = null;

    constructor() { }
}