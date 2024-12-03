export class DTOStoreAndWH {
    Code: number = 0
    WHName: string = ''
    Quantity: number = 0
    Address: string = ''
    ClientID: number = 0
}

export class DTOOrderProducts {
    Code: number = 0
    ImageThumb: string = ''
    ProductName: string = ''
    Barcode: string = ''
    Poscode: string = ''
    ReceivedQuantity: number = 0
    Quantity: number = 1
    ModifiedQuantity: number = 0
    ConfirmedQuantity: number = 0
    Price: number = 0
    TotalPrice: number = 0
    VAT: number = 0
    Bid: number = 0
    Discount: number = 0
    DiscountAmount: number = 0
    ListStoreAndWH: DTOStoreAndWH[]
    RemarkSupplier: string = ''
    RemarkWarehouse: string = ''
    OrderMaster: number = 0
    Supplier: number = 0
    Product: number = 0
    isHasMiniDate: boolean = false
    DateMin: string = ''
    Unit: number = 0
    UnitName: string = ''
    DatePercent: number = 0
    DateDuration: number = 0
    ProductPrice: number = 0
    BasePrice: number = 0
    InLockInv: boolean = false
    InInvoice: boolean = false // sản phẩm này đã có trong hóa đơn nào chưa
    AmountBeforeVAT: number = 0
    AmountAfterVAT: number = 0
    VATAmount: number = 0
}