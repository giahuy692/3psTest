import { DTOPUROrderInvoiceDetails } from "./DTOPUROrderInvoiceDetails"

export class DTOOrderInvoice{
    Code: number = 0
    OrderDeliveryID: number = 0
    InvoiceNo: string = ''
    SerialNo: string = ''
    InvoiceDate: string
    SKU: number = 0
    Quantity: number = 0
    AmountBeforeVAT: number = 0
    DiscountPOPercent: number = 0
    DiscountPOAmount: number = 0
    DiscountItemAmount: number = 0
    VATAmount: number = 0
    AmountAfterVAT: number = 0
    StatusName: string = ''
    StatusID: number = 0
    ListProduct: DTOPUROrderInvoiceDetails[]
    CreatedTime: string = ''
    CreatedBy: string = ''
    LastModifiedTime: string = ''
    LastModifiedBy: string = ''
}