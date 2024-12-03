export class DTOECOMCart {
	Code: number = 0
	UserID: string = ""
	Channel: number = 1
	ParentID?: number = null
	CartID?: number = 0
	IsMaster: boolean
	IsLock: boolean
	CartNo: string = ""
	IsAnonymous: boolean
	OrderBy: string = ""
	OrderPhone: string = ""
	OrderEmail: string = ""
	ShipperName: string = ""
	ShipperSignature: string = ""
	StatusID: number = 17//Lập đơn hàng
	StatusOrderBy: number = 0
	OrderTypeID: number 
	OrderDate?: Date
	EstDelivery?: Date
	DeliveriedDate?: Date
	CancelDate?: Date
	DeliveryID?: number = null
	ReceivedBy: string = ""
	Cellphone: string = ""
	Province?: number = null
	District?: number = null
	Ward?: number = null
	Address: string = ""
	ShippingFeeID?: number = null
	CartShipper?: number = null
	ShipmentID?: number = null
	TrackingNo: string = ""
	TotalAmount: number = 0
	MembershipID?: number = null
	PolicyMembership: number = 0
	DiscountMembership: number = 0
	CouponPaid: number = 0
	ShippingFee: number = 0
	ShippingDiscount: number = 0
	Payment: number = 0
	PaymentID: number = null
	RemarkClient: string = ""
	RemarkPacking: string = ""
	RefID?: number = null
	WHPickup?: number = null
	IsHachi24: boolean
	ChannelName: string = ""
	ChannelImage: string = ""
	WHNamePickup: string = ""
	OrderTypeName: string = ""
	StatusName: string = "Lập đơn hàng"
	ProvinceName: string = ""
	DistrictName: string = ""
	WardName: string = ""
	FullAddress: string = ""
	ShipmentName: string = ""
	ProcessFrom?: Date
	ProcessTo?: Date
	TypeOfPayment: string = ""
	VATCode: string = ""
	VATName: string = ""
	VATAddress: string = ""
	VATEmail: string = ""
	ServiceFee: number = 0
	ShipperFee: number = 0

	DocumentNo: string = ""
	FromWarehouseName: string = ""
	FromWarehouse: number = null
	SKUNo: number = 0
	TotalProduct: number = 0
	RequestDate: Date
	DeliveredDate: Date
	CreatedBy: string = ""
	CBM: number = null
	Weight: number = null
	WeightReal: number = null
	WeightTransfer: number = null
	L: number = null
	W: number = null
	H: number = null
	NoOfPackage: number = 1
	ChannelStatusName: string = ''
}