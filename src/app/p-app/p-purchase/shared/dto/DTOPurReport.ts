export class DTOPurReport {
	Code: number
	DataID: string
	DataName: string
	DataDescription: string
	TypeData: number
	FunctionID: number
	OrderBy: number
	TypePopup: number
	Config: string
	DataPermission: [] = []
}

export class DTOExportReport {
	ID: number
	Paramaters = new DTOParamaters()
	DataPermission: [] = []
}

export class DTOParamaters {
	Year: number
	Month: number
	Warehouse: number

	constructor() {
		var date = new Date()
		this.Year = date.getFullYear()
		this.Month = date.getMonth() + 1
	}
}