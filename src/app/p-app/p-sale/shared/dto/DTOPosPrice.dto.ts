export class DTOPosPrice {
    StatusName: string = ''
    CreateBy: string = ''
    ApprovedBy: string = ''
    AdjName: string = ''
    AdjReason: string = ''
    Remark: string = ''
    CreateTime: Date = new Date()
    ApprovedTime: Date = null
    EffDate: Date = new Date()
    StatusID: number = 0
    NoOfSKU: number = 0
    Code: number = 0
}

export class DTOPosPriceDetail {
    Code: number = 0
    Product: number = 0
    NewPrice: number = 0
    OldPrice: number = 0
    PromotionPrice: number = 0
    POSPrice: number = 0
    AdjPercent: number = 0
    Barcode: string = ''
    PosCode: string = ''
    StatusID: number = 1
    StatusName: string = ''
    ImageSetting: string = ''
    ProductName: string = ''
    ApprovedBy: string = ''
    ApprovedTime: Date = null
    Remark: string = ''
}