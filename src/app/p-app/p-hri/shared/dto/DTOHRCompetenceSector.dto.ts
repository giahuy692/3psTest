import { DTOCompetence } from "./DTOCompetence.dto";

export class DTOHRCompetenceSector {
  Code: number = 0;
  Competence?: number
  CompetenceID?: string = ''
  CompetenceName?: string = ''
  Description: string = ''
  SectorID: number = 0
  LevelID: number = 0
  StatusID?: number = 0
  StatusName?: string = 'Tạo mới'
  CreateBy?: string = ''
  LastModifiedBy?: string = ''
  CreateTime?: string | Date
  LastModifiedTime?: string | Date
  ListQuestion: DTOHRCompetenceSectorQuestion[] = []

  constructor(args = {}) {
    Object.assign(this, args)
  }
}

export class DTOHRCompetenceSectorQuestion extends DTOCompetence {
  Code: number = 0
  CompetenceSector: number
  Question: number
  QuestionID: string = ''
  Remark: string = ''
  CategoryName: string = ''

  constructor(args = {}) {
    super();
    Object.assign(this, args)
  }
}
