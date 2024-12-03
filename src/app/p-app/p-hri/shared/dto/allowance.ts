export class Allowance {
    Code: number;
    AllowanceAmount: number;
    SalaryElement: string;
    PeriodID: number
    CompanyID: number
    StaffCode: number

    constructor(Code?, StaffCode?, SalaryElement?,
        CompanyID?, AllowanceAmount?, PeriodID?) {
        this.Code = Code
        this.AllowanceAmount = AllowanceAmount
        this.SalaryElement = SalaryElement
        this.PeriodID = PeriodID
        this.CompanyID = CompanyID
        this.StaffCode = StaffCode
    }
}