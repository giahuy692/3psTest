export default class DTOPromotionProduct {
	Code: number = 0
	StatusID: number = 0
	Category: number
	TypeData: number
	PromotionType: number = 1
	RemainDay: number
	TotalSKU: number
	TotalStore: number
	PromotionTypeName: string
	CategoryName: string
	PromotionNo: string = ''
	PromotionName: string = ''
	StatusName: string = 'Tạo mới'
	Summary: string = ''
	Description: string
	ImageSetting1: string
	ImageSetting2: string
	StartDate: Date
	EndDate: Date
	IsAllApplied: boolean
	VNDescription: string = ''
	ENDescription: string = ''
	JPDescription: string = ''
	VNPromotion: string = ''
	ENPromotion: string = ''
	JPPromotion: string = ''
	VNSummary: string = ''
	ENSummary: string = ''
	JPSummary: string = ''
}

export class DTOPromotionType {
	Code: number
	TypeData: number
	ParentID: number
	PromotionType: string
	IsSelected: boolean

	constructor(code: number, promotionType: string) {
		this.Code = code
		this.PromotionType = promotionType
	}
}

export class DTODayOfWeek {
	Code: number
	Config: number
	Promotion: number
	From: string | Date
	To: string | Date
	DayOfWeek: string
	IsSelected: boolean

	constructor(Config: number, DayOfWeek: string, IsSelected: boolean, Promotion: number, From?: string | Date, To?: string | Date) {
		this.Config = Config
		this.Promotion = Promotion
		this.From = From
		this.To = To
		this.DayOfWeek = DayOfWeek
		this.IsSelected = IsSelected
	}
}

export class DTOGroupOfCard {
	Code: number
	Point: number
	Promotion: number
	GroupCard: number
	GroupName: string
	IsSelected: boolean
}

export class DTOPromotionDetail {
	VNName: string = ''
	ENName: string = ''
	JPName: string = ''
	WebContentVN: string = ''
	WebContentEN: string = ''
	WebContentJP: string = ''
	WebUsesVN: string = ''
	WebUsesEN: string = ''
	WebUsesJP: string = ''
	StatusName: string
	TBarcode: string
	Barcode: string = ''
	Remark: string
	Code: number = 0
	TypeData: number = 1
	Promotion: number = 0
	PromotionInv
	Bundle: number
	PosCode: string
	ImageSetting: string
	Product: number
	DiscountAmount: number = 0
	DiscountPercent: number = 0
	Quantity: number = 0
	MaxQuantity: number = 0
	PriceDiscount: number = 0
	Price: number = 0
	StatusID: number = 1
	StockQty: number = 0
	SellQty: number = 0
	LastDate: Date
	IsHachi24h: boolean = false
	ListProductInCombo: DTOPromotionDetail[] = []
	ListProduct: DTOPromotionDetail[] = []
	ListImageInCombo: DTOPromotionImage[] = []
}

export class DTOPromotionInvDetail {
	Code: number = 0
	Promotion: number = 0
	MinInv: number = 0
	MaxInv: number = 0
	ProValue: number = 0
	IsInvAmount: boolean = true
	IsProAmount: boolean = true
}

export class DTOPromotionInv {
	Promotion: number = 0
	IsInvAmount: boolean = true
	IsProAmount: boolean = true
	PromotionDetails: DTOPromotionInvDetail[] = []
}

export class DTOPromotionImage {
	Code: number = 0
	Product: number
	COProduct: number
	ImageName: string = ''
	URLImage: string = ''
	Company: number = 0
	IsDefault: boolean = false
}