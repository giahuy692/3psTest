export class DTOLSWard {
	Code: number
	WardID?: string
	District?: number
	VNWard: string
	ENWard?: string
	JPWard?: string
	OrderBy?: number
	IsDelete?: boolean
}

export default class DTOSynWard {
	Code: string = '';
	DistrictCode: string = '';
	DistrictID: number
	DistrictName: string = ''
	ID: number;
	OrderBy: number = 0;
	WardName: string = ''
	
	constructor(ID?: number, WardName?: string) {
		this.ID = ID
		this.WardName = WardName
	}
}