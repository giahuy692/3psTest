export class DTOCategoryWeb {
  VNGroupName: string = '';
  ENGroupName: string = '';
  JPGroupName: string = '';
  IconSmall: string = '';
  URLImage1: string = '';
  URLImage2: string = '';
  AliasVN: string = '';
  AliasEN: string = '';
  AliasJP: string = '';
  StatusName: string = 'Đang soạn thảo';
  ParentName: string = '';
  StatusID: number = 0;
  UserColumnDefine: number = 1;
  Code: number = 0;
  CreateBy: string = '';
  CreateTime: string = null;
  LastModifiedBy: string = '';
  LastModifiedTime: string = null;
  ListChilds: DTOCategoryWeb[] = [];
  Company: number = 1;
  Remark: string = '';
  OrderBy: number = 1;
  GroupID: string = '';
  ParentID: number = null;
  Level: number = 1;

  constructor(args = {}) {
    Object.assign(this, args)
  }
}
