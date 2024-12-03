export class DTORole {
    Code: number = 0
    Company: number = 0
    RoleName: string = ""
    RoleID: string = ""
    IsSupperAdmin: boolean = false
    TypeData: number = 0
    OrderBy: number = 0
    Remark: string = ""
    ListPositionApply: DTOPositionApply[]
}

export class DTOPositionApply {
    Code: number = 0
    PositionID: string = ""
    Position: string = ""
    IsLeader: boolean = false
    IsSupervivor: boolean = false
    DepartmentID: string = ""
    ReportTo: number = 0
    Remark: string = ""
    GroupPosition: null
    OrderBy: null
    ListOfRoles: []
    Config: null
    StatusID:number = 0
}