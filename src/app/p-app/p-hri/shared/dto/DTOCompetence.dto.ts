export class DTOCompetence {
  Code: number = 0;
  Company: number = 1;
  Category?: number  = null;
  StatusID: number = 0;
  CreateBy: string = '';
  CreateTime?: string  = null;
  LastModifiedBy: string = '';
  LastModifiedTime: string  = null;
  CompetenceSector?: number = null;
  Question?: number = null;
  Competence?: number = null;
  LevelID: number = 1;
  CompetenceName: string = '';
  CompetenceID: string = '';
  CategoryName: string = '';
  CategoryID: string = '';
  CompetenceSectorID: string = '';
  ParentID: string = '';
  ParentName: string = '';
  Parent?: number = null;
  ListChilds: DTOCompetence[] = [];
  TypeOfEvaluation: number = null;
  StatusName: string = 'Đang soạn thảo';
  Remark: string = '';

  constructor() { }
}
