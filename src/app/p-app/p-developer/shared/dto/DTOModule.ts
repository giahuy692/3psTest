import { DTOModuleAPI } from "./DTOAPI";
import { DTOFunction } from "./DTOFunction";
import { DTOAPI } from "./DTOAPI";
export class DTOModule {
	Code: number = 0;
	Vietnamese: string = '';
	ProductID: number = 1;
	GroupID: number = null;
	ModuleID: string = '';
	APIPackage: string = '';
	ImageSetting: string = '';
	TypeData: number = null;
	OrderBy: number = null;
	ListGroup: DTOModuleAPI[] = [];
	ListFunctions: DTOFunction[] = [];
	ListAPI: DTOAPI[] = [];
	IsVisible: boolean = true;

	constructor(args = {}) {
		Object.assign(this, args)
	}
}