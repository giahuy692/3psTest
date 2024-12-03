export class DTOMABanner {
	Code: number = 0
	Company: number = null
	StatusID: number = 0
	StatusName: string = 'Đang soạn thảo'
	BannerGroup: number = null
	BannerGroupName: string = ''
	VNTitle: string = ''
	ENTitle: string = ''
	JPTitle: string = ''
	ImageSetting1: string = ''
	ImageSetting2: string = ''
	ImageSetting3: string = ''
	ImageSetting4: string = ''
	ImageSetting5: string = ''
	StartDate?: Date = null
	EndDate?: Date = null
	URLLink: string = ''
	OrderBy: number = 1
	IsDefault: boolean = false
	ListWebPage: Array<number> = []

	// constructor(BannerGroupName?, ImageSetting1?, VNTitle?,
	// 	StartDate?, EndDate?, IsDefault?, OrderBy?) {

	// 	this.BannerGroupName = BannerGroupName ? BannerGroupName : this.BannerGroupName
	// 	this.ImageSetting1 = ImageSetting1
	// 	this.VNTitle = VNTitle ? VNTitle : this.VNTitle
	// 	this.StartDate = StartDate
	// 	this.EndDate = EndDate
	// 	this.IsDefault = IsDefault
	// 	this.OrderBy = OrderBy ? OrderBy : this.OrderBy
	// }
}