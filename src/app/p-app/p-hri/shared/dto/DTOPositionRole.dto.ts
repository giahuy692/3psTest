export class DTOPositionRole {
    Code: number = 0
    Company: number = 1
    Role: number = null
    TypeData: number = 2
    RoleID: string = ''
    RoleName: string = ''
    StatusID: number = 0
    StatusName: string = ''
    OrderBy: number
    Remark: string = ''
    IsSupperAdmin: boolean = false
    StaffID: number = null
    constructor() {
    }
}

export class DTOPositionStaffRole {
    Code: number = 0
    Department: number = 1
    Roles:string = ''
    FullName: number = 2
    IsDeactive: string = ''
    RoleID: string = ''
    StaffID: number = null
    constructor() {
    }
}