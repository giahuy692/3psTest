import { DTOHRCompetenceBank } from "./DTOHRCompetenceBank.dto";

export class DTOHRCompetenceCategory {
  Code: number = 0;
  CategoryID: string = ''
  CategoryName: string = ''
  Remark: string = ''
  OrderBy?: number = 1
  TypeData?: number
  Parent?: number
  StatusID?: number = 0
  StatusName?: string = 'Tạo mới'
  CreateBy?: string = ''
  LastModifiedBy?: string = ''
  CreateTime?: string | Date
  LastModifiedTime?: string | Date
  ListCompetence?: DTOHRCompetenceBank[] = []

  Color?: string = ''
  Expand: boolean = false
  gridView: any = {}
}
