import { DTOHRPolicyPosition } from "./DTOHRPolicyPosition.dto"

export class DTOHRPolicyDepartment {
    Code: number = 0
    Department: number
    DepartmentName: string = ''
    DepartmentID: string = ''
    ListPosition: DTOHRPolicyPosition[] = []
}