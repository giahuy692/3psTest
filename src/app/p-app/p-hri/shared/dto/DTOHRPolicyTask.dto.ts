import { DTOHRPolicyLocation } from "./DTOHRPolicyLocation.dto"
import { DTOHRPolicyPosition } from "./DTOHRPolicyPosition.dto"
import { DTOHRPolicyTypeStaff } from "./DTOHRPolicyTypeStaff.dto"

export class DTOHRPolicyTask {
    Code: number = 0
    Policy: number = null
    TaskName: string = ''
    Description?: string = ''
    PositionAssignee?: number = null
    SystemAssignee?: number = null
    TypeAssignee?: number = null
    AssigneeBy?: string = ''
    DateDuration: number = 5
    ListStaffType?: DTOHRPolicyTypeStaff[] = []
    IsLeaderMonitor: boolean = null
    PositionApproved: number = null
    PositionApprovedName: string = null
    OrderBy?: number = 1
    HasException?: boolean = false
    ListException?: DTOHRPolicyLocation[] | DTOHRPolicyPosition[] | DTOHRPolicyTypeStaff[] = []
    DLLPackage?: string = ''
}