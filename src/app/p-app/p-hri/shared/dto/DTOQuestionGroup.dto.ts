import { DTOPositionRole } from './DTOPositionRole.dto';

export class DTOQuestionGroup {
  Code: number = 0;
  Company: number = 1;
  Parent?: number = null;
  CategoryName: string = '';
  CategoryID?: string = '';
  Remark: string = '';
  StatusID?: number = 0;
  TypeData?: number = null;
  LevelID: number = null;
  ListCreators: DTOPositionRole[] = [];
  ListVerifiers?: DTOPositionRole[];
  CreateBy: string = null;
  CreateTime: Date = null;
  LastModifiedBy: string = null;
  LastModifiedTime: Date = null;
  ListChilds?: DTOQuestionGroup[] = []; 
  
  constructor() { }
}
