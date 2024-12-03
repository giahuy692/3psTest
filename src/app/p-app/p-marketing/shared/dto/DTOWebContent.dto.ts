export default class DTOWebContent {
	WebName: string
	ListImages: []
	WebContentVN: string = ''
	WebContentEN: string = ''
	WebContentJP: string = ''
	WebTitleVN: string = ''
	WebTitleEN: string = ''
	WebTitleJP: string = ''
	WebSummaryVN: string = ''
	WebSummaryEN: string = ''
	WebSummaryJP: string = ''
	WebContentCreated: Date
	WebContentCreatedBy: string = ''
	WebContentSent: Date
	WebContentApproved: Date
	WebContentApprovedBy: string = ''
	WebContentStoped: Date
	WebContentStopedBy: string = ''
	Code: number = 0
	Barcode: string = ''
	Poscode: string = ''
	VNName: string = ''
	Supplier: string = ''
	Brand: string = ''
	ImageSetting: string = ''
	TypeData: number
	Warehouse: number
	WarehouseName: string = ''
	Origin: string = ''
	Stock: number = 0
	UnitPrice: number = 0
	MembershipPrice: number = 0
	PromotionID?: number
	BasePrice: number = 0
	IsHachi24h: boolean
	StatusID: number = 1
	StatusName: string = 'Đang soạn thảo'
}

export class DTOWebBlogContent extends DTOWebContent {
	WebContentVN: string = ''
	WebContentEN: string = ''
	WebContentJP: string = ''

	WebTitleVN: string = ''
	WebTitleEN: string = ''
	WebTitleJP: string = ''

	WebSummaryVN: string = ''
	WebSummaryEN: string = ''
	WebSummaryJP: string = ''
}