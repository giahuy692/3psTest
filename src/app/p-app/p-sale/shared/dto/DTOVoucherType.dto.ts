export class DTOVoucherType {
    Code: number = 0
    OrderBy: number
    ParentID: number
    Remark: string = ''
    TypeData: number = 2
    VoucherType: string = ''
    
    constructor(Code: number, VoucherType: string) {
        this.Code = Code
        this.VoucherType = VoucherType
    }
}