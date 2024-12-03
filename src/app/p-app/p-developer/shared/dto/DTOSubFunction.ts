import { DTODataPermission } from "src/app/p-app/p-config/shared/dto/DTODataPermission";

export class DTOSubFunction {
    Code: number = 0;
    Config: JSON = null;
    DataID: string = '';
    DataDescription: string = '';
    DataName: string = '';
    DataPermission: JSON = null;
    FunctionID: number = 0
    IsSelected: boolean = false
    ListDataPermission: DTODataPermission[] = []
    OrderBy: number = 0;
    ReportConfig: JSON = null;
    TypeData: number = 1;
    TypePopup: number = 1;
    constructor() { }
}