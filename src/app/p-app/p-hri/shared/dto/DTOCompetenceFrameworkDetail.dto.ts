export class DTOCompetenceFrameworkDetail {
  Position?: number 
  PositionID?: string  
  PositionName?: string = ''
  Department?: number
  DepartmentID?: string = ''
  DepartmentName?: string = ''
  Competence?: number
  CompetenceID?: string 
  CompetenceName?: string = ''
  Category?: number
  CategoryID?: string = ''
  CategoryName?:  string = ''
  Code?: number 
  Company?: number = 1
  Framework: number
  CompetenceLevel?: number
  CompetenceLevelMax?:number
  CreateBy?: string
  CreateTime?: string
  LastModifiedBy?: string
  LastModifiedTime?: string
  constructor() {}
}
