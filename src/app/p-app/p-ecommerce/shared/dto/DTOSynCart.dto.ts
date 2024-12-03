export default class DTOSynCart {
	ID: number = 0
	Code: number = 0
	CreatedDate: Date = null
	StatusDate: Date = null
	OrderPhone: string = ''
	OrderBy: string = ''
	Cellphone: string = ''
	ReceivedBy: string = ''
	CartNo: string = ''
	Address: string = ''
	IsHachi24: boolean = false
	StatusName: string = "Tạo mới"
	StatusID: number
	Step: number = 1
	OrderTypeID: number = 1
	TotalAmount: number = 0
	PolicyMembership: number = 0
	CouponPaid: number = 0
	ShippingFee: number = 0
	ShippingDiscount: number = 0
	Payment: number = 0
	PaymentID: number
	PaymentName: string = ''
	Province: number
	District: number
	Ward: number
	ShipmentID: number
	MembershipID: number
	IsAnonymous: boolean
	CreatedBy: string = ''
	Remark: string = ''
	VATCode: string = ''
	VATCompany: string = ''
	VATAddress: string = ''
	VATEmail: string = ''
}