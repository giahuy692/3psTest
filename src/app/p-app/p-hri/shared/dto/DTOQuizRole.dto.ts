export class DTOQuizRole {
    Code: number;
    CreateBy: string | null;
    CreateTime: Date | null;
    LastModifiedBy: string | null;
    LastModifiedTime: Date | null;
    QuizSession: number;
    OrderBy: number;
    QuizSessionName: string;
    QuizSessionID: number | null;
    StaffID: number;
    StaffName: string;
    RoleID: number;
    TypeData: number;
    TypeName: string;
    PositionName: string;
    DepartmentName: string;
    GenderName: string | null;
    Birthday: Date | null;
    JoinDate: Date | null;
    TypeDataName: string;
    StatusID: number;
    StatusName: string;
    EmployeeStatusID: number;
    EmployeeStatusName: string;
    Department: number;
    Location: number;
    LocationName: string;
    RemainDuration: number;
    ImageThumb: string | null;
    StaffCode: string;
    Exam: number | null
    StopReason: string;
    FinalDuration: number = 0
}