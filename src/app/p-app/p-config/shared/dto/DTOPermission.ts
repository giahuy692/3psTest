import { DTOSubFunction } from "src/app/p-app/p-developer/shared/dto/DTOSubFunction";
import { DTODataPermission } from "./DTODataPermission";


export class DTOPermission {
	Code: number = 0;
    RoleID: number = 0
    ActionID: number = 0
    ActionName: string = '';
    FunctionID:number  = 0
    FunctionName: string = '';
    Permitted: boolean = false;
    Remark: string = '';
    DataPermission?: string
    ListDataPermission?: DTODataPermission[] = [];
    ListSubFunction?: DTOSubFunction[] = [];
    Company: number = 0
    IsSelected: boolean = false; // field này chi được tạo ra để lưu giá trị checked của UI Permission không tồn tại dưới DB
}