export class DTOBrand {
	Code: number = 0
	OrderBy: number = 0
	NoOfSKU: number = 0
	StatusID: number = 0
	StatusName: string = ''
	ShortName: string = ''//=VNBrand
	VNBrand: string = ''//Tên viết tắt
	EBrand: string = ''
	JBrand: string = ''
	VNSummary: string = ''//Tên đầy đủ
	ENSummary: string = ''
	JPSummary: string = ''
	VNDescription: string = ''//Mô tả thương hiệu
	ENDescription: string = ''
	JPDescription: string = ''
	URLImage1: string = ''
	URLImage2: string = ''
	URLImage3: string = ''
	URLImage4: string = ''
	URLImage5: string = ''
	ApprovedBy: string = ''
	ApprovedTime: Date = null
	CreatedBy: string = ''
	CreatedTime: Date = null

	constructor() {
		this.ShortName = this.VNBrand
	}
}