import { DTOAction } from "./DTOAction";
import { DTOSubFunction } from "./DTOSubFunction";

export class DTOFunction {
	Code: number = 0;
	Vietnamese: string = '';
	ModuleID: number = null;
	ModuleName: string = '';
	DLLPackage: string = '';
	ImageSetting: string = '';
	TypeData: number = 1;
	OrderBy: number = null;
	ListAction: DTOAction[] = [];
	PermissionConf: JSON = null;
	Breadcrumb: string = '';
	ListSupFunction: DTOSubFunction[] = []
	constructor() { }
}