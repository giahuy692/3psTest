export default class DTOPurOrderMaster {
	Code: number = 0
	StatusID: number = 0
	Supplier: number
	SKU: number = 0
	Quantity: number = 0
	ReceiveSKU: number = 0
	ReceiveQuantity: number = 0
	AmountBeforeVAT: number = 0
	AmountAfterVAT: number = 0
	AmountReceiveBeforeVAT: number = 0
	AmountReceiveAfterVAT: number = 0
	OrderNo: string = ''
	StatusName: string = ''
	RemarkSupplier: string = ''
	RemarkWarehouse: string = ''
	OrderedTime: Date | string
	ReceivedTime: Date | string

	constructor() {
	}
}

export class DTOPurOrderInvoice {
	Code: number = 0
	StatusID: number = 0
	OrderMaster: number
	AmountBeforeVAT: number = 0
	AmountAfterVAT: number = 0
	VAT: number = 0
	AmountVAT: number = 0
	InvoiceNo: string = ''
	SerialNo: string = ''
	StatusName: string = ''
	CreatedTime: Date | string
	LastModifiedTime: Date | string

	constructor() {
	}
}

export class DTOPurOrderDetails {
	Code: number = 0
	StatusID: number = 0
	OrderMaster: number
	Price: number = 0
	Quantity: number = 0
	ReceivedQuantity: number = 0
	ModifiedQuantity: number = 0
	VAT: number = 0
	Barcode: string = ''
	ProductName: string = ''
	StatusName: string = ''
	RemarkSupplier: string = ''
	RemarkWarehouse: string = ''
	ImageThumb: string = ''
	CreatedTime: Date | string
	LastModifiedTime: Date | string
	
	constructor() {
	}
}