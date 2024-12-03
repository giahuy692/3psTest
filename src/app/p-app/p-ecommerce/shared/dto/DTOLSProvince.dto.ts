import { DTOLSDistrict } from "./DTOLSDistrict.dto"

export class DTOLSProvince {
	Code: number
	ProvinceID?: string
	VNProvince: string
	ENProvince?: string
	JPProvince?: string
	Country?: number
	OrderBy?: number
	IsDelete?: boolean
	IsSelected?: boolean = false
	IsExpanded?: boolean = false
	ListChild?: DTOLSDistrict[] = []
}

export default class DTOSynProvince {
	// Code: string = '';
	Code: number;
	ID: number;
	OrderBy: number = 0;
	ProvinceName: string = ''

	constructor(ID?: number, ProvinceName?: string) {
		this.ID = ID
		this.ProvinceName = ProvinceName
	}
}