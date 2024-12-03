import { DTOOrderInvoice } from "./DTOOrderInvoice.dto"

export class DTOOrderDelivery{
    Code: number = 0
    OrderMaster: number = 0
    OrderBy: number = 0
    DONo: string = ''
    SendingTime: string = ''
    ReceivedTime: string = ''
    ReceivedBy: string = ''
    FinishedTime: string = ''
    AmountBeforeVAT: number = 0
    DiscountPOPercent: number = 0
    DiscountPOAmount: number = 0
    DiscountItemAmount: number = 0
    VATAmount: number = 0
    AmountAfterVAT: number = 0
    SKU: number = 0
    TotalQuantity: number = 0
    StatusName: string = ''
    StatusID: number = 0
    RemarkFromSupplier: string = ''
    DeliveryDate: string = ''
    DeliveryPeriod: string = ''
    Deliver: string = ''
    DeliverPhone: string = ''
    ListInvoice: DTOOrderInvoice[]
}