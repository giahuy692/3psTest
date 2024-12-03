import { DTOPermission } from "src/app/p-app/p-config/shared/dto/DTOPermission";

export class DTOAction {
	Code: number = 0;
	ActionName: string = '';
	ParentID: number = null;
	ModuleID: number = null;
	ModuleName: string = '';
	FunctionID: number = null;
	FunctionName: string = '';
	TypeData: number = 1;
	PermissionConf: JSON = null;
	ListAction: DTOAction[] = [];
	IsVisible: boolean = false;
	ListDataPermission: DTOPermission[];

	constructor() { }
}