export class DTOQuizPositionRole {
        DepartmentCode: string = '';
        DepartmentName: string = '';
        ReportToCode: string = '';
        GroupPositionCode: string = '';
        StatusName: string = '';
        ListChild: DTOQuizPositionRole[] = [];
        Code: number = 0;
        PositionID: string = '';
        Position: string = '';
        IsLeader: boolean;
        DepartmentID: number = null;
        ReportTo: number = null;
        GroupPosition: number = null;
        Remark: string = '';
        OrderBy: number = null;
        ListOfRoles: string = '';
        Config: number = null;
        StatusID: 2
        constructor() { }
}
