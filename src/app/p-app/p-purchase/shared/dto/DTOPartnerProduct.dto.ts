export class DTOPartnerProduct{
    Code: number = 0
    Company: number = 0
    PartnerProductMaster: number = 0
    COPartner: number = 0
    TypeData: number = 1
    ProductName: string = ""
    URLImage: string = ""
    Barcode: string = ""
    Poscode: string = ""
    LastPO: string | Date
    GroupName1: string = ""
    GroupName2: string = ""
    GroupName3: string = ""
    OriginName: string = ""
    BrandName: string = ""
    UnitPrice: number = 0
    OldPrice: number = 0
    LastBid: number = 0
    Bid: number = 0
    StatusName: string = ""
    StatusID: number
    CreateBy: string = ""
    CreateTime: string | Date
    LastModifiedBy: number = 0
    LastModifiedTime: string | Date
}

export class DTOChangHitory{
    Code: number = 0
    ProductName: string = ""
    URLImage: string = ""
    ListHistory: DTOHitory[]
}

export class DTOHitory{
    Code: number = 0
    Partner: number = 0
    ApprovedBy: string = ""
    EffectiveFrom: string | Date
    EffDate: string | Date
    EffectiveTo: string | Date
    LastBill: number = 0
    POID: number = 0
    LastBillDate: string | Date
    Price: number = 0
    BuyedPrice: number = 0
}