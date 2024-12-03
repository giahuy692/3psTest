export class DTOQuizStaffRole {
    Code: number = 0;
    CreateBy: string = '';
    CreateTime: string = '';
    LastModifiedBy: string = '';
    LastModifiedTime: string = '';
    Company: number = 1;
    QuizSession: number = null;
    OrderBy: number = 0;
    QuizSessionName: string = '';
    QuizSessionID: string = '';
    StaffID: number = null;
    StaffName: string = '';
    RoleID: number = 0;
    TypeData: number
    TypeName: string = ''
    constructor() { }
}

export class DTOPersonnelInvolved {
    Code: number = 0
    CreateBy: string = ''
    CreateTime: string = ''
    LastModifiedBy: string = ''
    LastModifiedTime: string = ''
    QuizSession: number = null
    OrderBy: number = null
    QuizSessionName: string = ''
    QuizSessionID: string = ''
    StaffID: number = null
    StaffName: string = ''
    RoleID: number = null
    TypeData: number = null
    TypeName: string = ''
    PositionName: string = ''
    DepartmentName: string = ''
    GenderName: string = ''
    Birthday: string = ''
    JoinDate: string = ''
    TypeDataName: string = ''
    StatusID: number = 0
    StatusName: string = ''
    EmployeeStatusID: number = null
    EmployeeStatusName: string = ''
    Department: number = null
    Location: number = null
    LocationName: string = ''
    RemainDuration: number = null
    ImageThumb: string = ''
    StaffCode: string = ''
}
