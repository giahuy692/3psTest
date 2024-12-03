export class DTOLSDistrict {
	Code: number
	DistrictID?: string
	Province?: number
	VNDistrict: string
	ENDistrict?: string
	JPDistrict?: string
	OrderBy?: number
	IsDelete?: boolean
	IsSelected?: boolean = false
}

export default class DTOSynDistrict {
	Code: string = '';
	DistrictName: string = ''
	ID: number;
	OrderBy: number = 0;
	ProvinceCode: string = '';
	ProvinceID: number;
	ProvinceName: string = ''
	
	constructor(ID?: number, DistrictName?: string) {
		this.ID = ID
		this.DistrictName = DistrictName
	}
}