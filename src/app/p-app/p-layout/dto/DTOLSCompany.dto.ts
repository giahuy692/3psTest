export class DTOLSCompany{
	Code: number
	CompanyID: string
	Brief: string
	VNName: string
	ENName: string
	JPName: string
	Country?: number
	Province?: number
	District?: number
	Ward?: number
	Address: string
	TaxName: string
	TaxCode: string
	TaxAddress: string
	ConfigDesc: string
	URLLogo: string

	constructor(Code, VNName, Brief, URLLogo){
		this.Code = Code
		this.Brief = Brief
		this.VNName = VNName
		this.URLLogo = URLLogo
	}
}