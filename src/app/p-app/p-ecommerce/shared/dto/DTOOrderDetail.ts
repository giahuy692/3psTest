export class DTOOrderDetail {//DTOProductOrder
	Code: number = 0
	StatusID: number
	OrderQuantity: number = 0
	ShippedQuantity: number = 0
	UnitPrice: number = 0
	BasePrice: number = 0
	Barcode: string = ''
	VNName: string = ''
	ImageSetting: string = ''
	URLThumbImage : string = ''
	IsHachi24h: boolean
	IsSubOrder24h: boolean
	Cart: number
	ComboQty: number
	RefNo: string
	RefName: string
	ProductID: number
	ModelID: number
	PromotionDetailID: number
	TypeData: number
	Warehouse: number
	Stock: number
	CartDelivery: any
	SubOrder: any
	Poscode: string
	WarehouseName: string
	Origin: string
	NU01: number = 0
	NU02: number = 0
	NU03: number = 0
	NU04: number = 0
	NU05: number = 0
	NU06: number = 0
	MembershipPrice: number = 0
	EffDate: Date
	Supplier: string
	Brand: string
	ListOfOrders: [] = []
}