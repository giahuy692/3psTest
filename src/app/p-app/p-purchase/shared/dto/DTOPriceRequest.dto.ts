
export class DTOPriceRequest{
    Code: number = 0
    COPartner: number = null
    PartnerID: string = ''
    PartnerName: string = ''
    EffDate: Date | string = ''
    Remark: string = ''
    CreateTime: string = ''
    ApprovedDate: string = ''
    CreateBy: string = ''
    ApprovedBy: string = ''
    StatusName: string = ''
    StatusID: number = 0
    NoOfNewProduct: number = 0
    NoOfChangePartner: number = 0
    NoOfChangePrice: number = 0
    TypeData:number = 0
}