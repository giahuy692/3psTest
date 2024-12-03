export class DTOCompany {
	Code: number = 0;
	VNName: string = null;
	CompanyID: string = null;
	Bieft: string = null;
	Address: string = null;
	CountryName: string = null;
	TypeCompanyName: string = null;
	URLLogo: string = null;
	Country?: number;
	Province?: number;
	District?: number;
	Ward?: number;
	ConfigDesc?: JSON;
	IsSystem?: boolean = false;

	constructor() {}
}