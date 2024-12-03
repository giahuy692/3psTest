export class WorkdayMonth {
    Code: number;
    SalaryElement: string
    Rate: number
    WDAmount: number
    Workday: number
    CompanyID: number
    StaffCode: number
    PeriodID: number

    constructor(Code?, SalaryElement?, Rate?, WDAmount?, 
        Workday?, CompanyID?, StaffCode?, PeriodID?) {            
        this.Code = Code
        this.SalaryElement = SalaryElement
        this.Rate = Rate
        this.WDAmount = WDAmount
        this.Workday = Workday
        this.CompanyID = CompanyID
        this.StaffCode = StaffCode
        this.PeriodID = PeriodID
    }
}