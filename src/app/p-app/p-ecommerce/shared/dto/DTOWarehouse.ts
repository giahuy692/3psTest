export class DTOWarehouse {
	Code: number
	Province: number
	Country: number
	TypeOfWH: number
	WHCode: string
	ShortName: string
	WHName: string
	Address: string
	Phone: string
	Fax: string
	Remark: string
	IsSelected: boolean
	Promotion: number
	Partner
	WH: number
	TypeData: number

	// constructor(Code: number, Province: number, Country: number, TypeOfWH: number,
	// 	WHCode: string, ShortName: string, WHName: string, Address: string, Phone: string,
	// 	Fax: string, Remark: string, IsSelected: boolean) {
	// 	this.Code = Code
	// 	this.Province = Province
	// 	this.Country = Country
	// 	this.TypeOfWH = TypeOfWH
	// 	this.WHCode = WHCode
	// 	this.ShortName = ShortName
	// 	this.WHName = WHName
	// 	this.Address = Address
	// 	this.Phone = Phone
	// 	this.Fax = Fax
	// 	this.Remark = Remark
	// 	this.IsSelected = IsSelected
	// }

	constructor(wh: number, WHName: string, IsSelected: boolean) {
		this.WH = wh
		this.WHName = WHName
		this.IsSelected = IsSelected
	}
}