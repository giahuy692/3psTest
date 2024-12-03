import { DTOPositionRole } from "./DTOPositionRole.dto"

export class DTOPosition {
    Code: number = 0
    ReportTo: number = null
    ReportToCode: string = ''
    DepartmentID: number = null
    DepartmentCode: string = ''
    GroupPosition: number = null
    GroupPositionCode: string = ''
    Position: string = ''
    PositionID: string = ''
    IsLeader: boolean = false
    IsSupervivor: boolean = false
    OrderBy: number
    Config: any
    Remark: string = ''
    StatusID: number = 0
    StatusName: string = 'Tạo mới'
    ListOfRoles: string = ''
    ListChild: DTOPosition[] = []

    constructor() { }
}