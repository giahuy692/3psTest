export class Salary {
    Code: number;
    SalaryAmount: number;
    SalaryElement: string;
    PeriodID: number
    CompanyID: number
    StaffCode: number
    RangeLabel: string
    RateLabel: string

    constructor(Code?, StaffCode?, SalaryElement?, RateLabel?,
        CompanyID?, SalaryAmount?, PeriodID?, RangeLabel?) {
        this.Code = Code
        this.SalaryAmount = SalaryAmount
        this.SalaryElement = SalaryElement
        this.RateLabel = RateLabel
        this.RangeLabel = RangeLabel
        this.PeriodID = PeriodID
        this.CompanyID = CompanyID
        this.StaffCode = StaffCode
    }
}