export class DTOLocation {
    Code: number = 0;
    ParentID: number = null;
    LocationID: string = '';
    LocationName: string = ''
    Brieft: string = '';
    Address: string = '';
    Province: number = null
    ProvinceCode: string = '';
    District: number = null
    ParentCode: string = ''
    DistrictCode: string = ''
    Ward: number = null;
    WardCode: string = '';
    Remark: string = '';
    StatusID: number = 0;
    StatusName: string = 'Tạo mới'
    IsTree: boolean = false
    ListChild: DTOLocation[] = [];

    constructor(args = {}) {
        Object.assign(this, args)
      }
}