export class DTOExam {
    Code: number = 0
    SessionID:number = 0
    StaffID:number = 0
    QuizSession: number = 0
    TypeOfSessionName: string = ''
    // TypeOfSession: number = 0
    StartDate?: string | Date = null
    EndDate?:string | Date = null
    BeginTime?: string | Date = null
    EndTime?: string | Date = null
    Duration: number = 0
    RemainDuration: number = 0
    StatusName: string = ''
    StatusID: number = 0
    StaffInRoleID:number = 0
    FinalMark: number = 0
    CreateBy: string = ''
    CreateTime: string = ''
    LastModifiedBy: string = ''
    LastModifiedTime: string = ''

}
export class Answer {
    text: string;
    selection: boolean;
}
export class Question {
Code: number;
numberOfQuestion: string;
titleOfQuestion: string;
answers: Answer[] | string[];
type: number
}