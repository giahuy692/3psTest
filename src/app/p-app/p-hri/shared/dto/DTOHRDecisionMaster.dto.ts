import { Ps_UtilObjectService } from "src/app/p-lib";
import { DTOPositionQuantity } from "./DTOPositionQuantity.dto"

export class DTOHRDecisionMaster {
    constructor(dto?: Partial<DTOHRDecisionMaster>) {
        if (dto) {
            Object.assign(this, dto); // Sao chép các giá trị từ dto vào instance
            if (Ps_UtilObjectService.hasValue(dto.EffDate)) {
                this.EffDate = new Date(dto.EffDate).toISOString(); // Chuyển EffDate thành ISO string của Date
            } else {
                this.EffDate = null
            }
        }
    }
    Code: number = 0
    DecisionID: string = ""
    DecisionName: string = ""
    EffDate: string = null
    Description: string = ""
    TypeData: number = 0
    Status: number = 0
    CreatedBy: string = ""
    CreatedTime: string = ""
    ApprovedBy: string = ""
    ApprovedTime: string = ""
    StatusName: string = "Đang soạn thảo"
    NumOfProfile:number = 0
    NumOfPosition: number = 0
    ListPosition: DTOPositionQuantity[]
    ListNewPosition: DTOPositionQuantity[]
    NumOfStaff: number = 0
    NumOfReassignment: number = 0
    ImageThumb: string = null
    FullName: string  = ""
    StaffID: string = ""
    DepartmentName: string = ""
    LocationName: string = ""
    PositionName: string = ""
    ReasonName : string = ""
    ReasonDescription: string = ""
    Petition: number = null
}