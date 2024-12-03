export class CnBSalary {
    Code: number
    PeriodID: number
    CompanyID: number
    StaffCode: number;
    WorkDate: number
    OTDate: number
    Bonus: number
    MinusException: number
    PlusException: number;
    TotalSal: number
    NetSalary: number
    BankAmount: number
    CashAmount: number
    Note: string;
    SIP: number
    SIC: number
    PIT: number

    constructor(Code?, StaffCode?, Note?, SIP?, SIC?,
        CompanyID?, MinusException?, PeriodID?, NetSalary?,
        WorkDate?, OTDate?, Bonus?, PlusException?,
        TotalSal?, BankAmount?, CashAmount?, PIT?) {
        this.Code = Code
        this.PeriodID = PeriodID
        this.CompanyID = CompanyID
        this.StaffCode = StaffCode
        this.WorkDate = WorkDate
        this.OTDate = OTDate
        this.Bonus = Bonus
        this.TotalSal = TotalSal
        this.NetSalary = NetSalary
        this.MinusException = MinusException
        this.PlusException = PlusException
        this.BankAmount = BankAmount
        this.CashAmount = CashAmount
        this.Note = Note
        this.SIC = SIC
        this.SIP = SIP
        this.PIT = PIT
    }
}