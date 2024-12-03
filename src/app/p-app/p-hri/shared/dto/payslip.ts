export class Payslip {
    Code: number
    Period: string
    RateLabel: string
    RangeLabel: string
    ReceiveSalary: number

    constructor(Code?, Period?, ReceiveSalary?,
        RateLabel?, RangeLabel?) {
        this.Code = Code
        this.Period = Period
        this.RateLabel = RateLabel
        this.RangeLabel = RangeLabel
        this.ReceiveSalary = ReceiveSalary
    }
}