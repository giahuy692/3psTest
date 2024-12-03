import { DTOLocation } from "./DTOLocation.dto"
import { DTOPosition } from "./DTOPosition.dto"

export class DTODepartment {
    Code: number = 0
    ParentID: number = null
    ParentCode: string = ''
    DepartmentID: string = ''
    Department: string = ''
    Brieft: string = ''
    Phone: string = ''
    Fax: string = ''
    OrderBy: number
    Config: any
    Remark: string = ''
    StatusID: number = 0
    StatusName: string = 'Tạo mới'
    ListLocationCode: string = ''
    ListDepartment: DTODepartment[] = []
    ListPosition: DTOPosition[] = []
    ListLocation: DTOLocation[] = []

    constructor() { }
}