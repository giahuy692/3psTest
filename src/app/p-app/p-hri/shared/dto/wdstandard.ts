export class WDStandard {
    Code: number
    WDStandard: number
    Period: string
    FromDate: Date
    ToDate: Date

    constructor(Code?, WDStandard?,
        Period?, FromDate?, ToDate?
    ) {
        this.Code = Code
        this.WDStandard = WDStandard
        this.Period = Period
        this.FromDate = FromDate
        this.ToDate = ToDate
    }
}