export class Employee {
    Code: number;
    StaffID: string
    Name: string
    JoinDate: Date
    Position: string
    Department: string
    ParentDepartment: string
    ParentID: number
    Company: string
    CompanyID: number

    constructor(Code?, StaffID?, Name?, JoinDate?,
        Position?, Department?, ParentDepartment?,
        ParentID?, Company?, CompanyID?) {
        this.Code = Code
        this.StaffID = StaffID
        this.Name = Name
        this.JoinDate = JoinDate
        this.Position = Position
        this.Department = Department
        this.ParentDepartment = ParentDepartment
        this.Company = Company
        this.ParentID = ParentID
        this.CompanyID = CompanyID
    }
}