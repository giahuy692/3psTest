export default class DTOSYSModule {
	Code: number
	ProductID?: number
	ModuleID: string
	Vietnamese: string
	English: string
	Japanese: string
	Chinese: string
	OrderBy?: number
	GroupID?: number
	IsVisible: boolean
	TypeData?: number
	ImageSetting?: string
	Icon?: string
	ListGroup?: Array<DTOSYSModule>
	ListFunctions?: Array<DTOSYSFunction>
}

export class DTOSYSFunction {
	Code: number
	ModuleID: number
	Vietnamese: string
	English: string
	Japanese: string
	Chinese: string
	OrderBy?: number
	Hotkey: string
	TypeData: number
	DLLPackage: string
	ImageSetting?: string
	Icon?: string
}