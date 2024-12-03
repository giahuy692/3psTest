import { Employee } from './employee';

export class EmployeeDetail extends Employee {
    StatusID: number
    Status: string
    Email: string
    ShortName: string
    BirthDate: Date
    LeaveDate: Date

    constructor(Code?, StaffID?, Name?, JoinDate?,
        Position?, Department?, ParentDepartment?,
        ParentID?, Company?, CompanyID?, 
        StatusID?, Status?, Email?, 
        ShortName?, BirthDate?, LeaveDate?) {

        super(Code, StaffID, Name, JoinDate,
            Position, Department, ParentDepartment,
            ParentID, Company, CompanyID)

        this.Status = Status
        this.StatusID = StatusID
        this.Email = Email
        this.ShortName = ShortName
        this.BirthDate = BirthDate
        this.LeaveDate = LeaveDate
    }
}