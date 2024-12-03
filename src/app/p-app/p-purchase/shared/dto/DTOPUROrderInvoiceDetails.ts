export class DTOPUROrderInvoiceDetails {
	Code: number = 0
	InvoiceID: number = 0 // Mã hóa đơn
	UnitName: string = ''
	Barcode: string = ''
	VNName: string = ''
	OrderDeliveryDetails: number = 0
	Quantity?: number = null //Số lương được chỉnh sửa -> số lượng xác nhận
	OrderQuantity?: number = null // Số lượng (đặt) cũ chưa đc chỉnh sửa
	BasePrice: number = 0
	Price?: number = null
	TotalAmount: number = 0
	TotalAmountWithVAT: number = 0
	Discount: number = 0
	DiscountAmount: number = 0
	VAT?: number = null
	VATAmount?: number = null
	ReceivedQuantity?: number = null // SL  mà LGT có thể điều chỉnh
	CreatedBy: string = ''
	CreatedTime?: Date | string = null
	LastModifiedBy: string = ''
	LastModifiedTime?: Date | string = null
	IsInInv: boolean = false;
}