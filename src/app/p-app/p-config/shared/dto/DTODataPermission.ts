

export class DTODataPermission {
	Code: number = 0;
    IsSelected: boolean = false;
    Name: string = '';
    ListDataPermission: DTODataPermission[] = [];
    ParentID?: number; 
}