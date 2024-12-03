import { DTOHRCompetenceSector } from "./DTOHRCompetenceSector.dto";

export class DTOHRCompetenceBank {
  Code: number = 0;
  CompetenceID: string = ''
  Competence: string = ''
  Parent?: number
  Category?: number
  CategoryID?: string = ''
  CategoryName?: string = ''
  Remark?: string = ''
  StatusID?: number = 0
  StatusName?: string = 'Tạo mới'
  CreateBy?: string = ''
  LastModifiedBy?: string = ''
  CreateTime?: string | Date
  LastModifiedTime?: string | Date
  ListChild?: DTOHRCompetenceBank[] = []
  ListSector?: DTOHRCompetenceSector[] = []
  OrderBy: number = 1

  Expand: boolean = false
}
