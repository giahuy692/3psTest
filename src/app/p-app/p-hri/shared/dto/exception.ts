export class Exception {
    Code: number;
    ExceptionAmount: number;
    SalaryElement: string;
    PeriodID: number
    CompanyID: number
    StaffCode: number

    constructor(Code?, StaffCode?, SalaryElement?,
        CompanyID?, ExceptionAmount?, PeriodID?) {
        this.Code = Code
        this.ExceptionAmount = ExceptionAmount
        this.SalaryElement = SalaryElement
        this.PeriodID = PeriodID
        this.CompanyID = CompanyID
        this.StaffCode = StaffCode
    }
}