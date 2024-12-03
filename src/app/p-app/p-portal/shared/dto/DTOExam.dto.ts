export class DTOExam {
    Code: number;
    QuizSessionID?: number | string;
    StaffID: number;
    StatusName: string;
    QuizSessionName: string;
    TypeOfSession: number;
    TypeOfSessionName: string;
    StartDate: string;
    EndDate: string;
    RemainDuration?: number;
    EvaluationView: number;
    SessionStatusID: number;
    SessionStatusName: string = '';
    StaffName: string = '';
    DepartmentName: string = '';
    OpenedDate: string;
    ClosedDate:string;
    StopReason: null;
    AppealDate: string;
    ReEvaluateDate: string;
    QuizSession: number;
    StaffInRoleID: number;
    Duration: number;
    FinalDuration: number;
    BeginTime: string;
    EndTime: string;
    FinalMark?: number;
    ReEvalMark? : number
    StatusID: number;
    CreateBy?: string;
    CreateTime?: string;
    LastModifiedBy?: string;
    LastModifiedTime?: string;
}