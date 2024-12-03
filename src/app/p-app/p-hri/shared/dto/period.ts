export class Period {
    Code: number
    Period: string
    FromDate: Date
    ToDate: Date

    constructor(Code?, Period?,
        FromDate?, ToDate?
    ) {
        this.Code = Code
        this.Period = Period
        this.FromDate = FromDate
        this.ToDate = ToDate
    }
}