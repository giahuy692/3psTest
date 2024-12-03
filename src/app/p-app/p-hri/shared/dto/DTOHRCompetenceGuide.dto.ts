export class DTOHRCompetenceGuide {
  Code: number = 0;
  LevelID: number = 0
  DescriptionGuide: string = ''
  CreateBy: string = ''
  LastModifiedBy: string = ''
  CreateTime: string | Date
  LastModifiedTime: string | Date

  Color: string = ''
  Expand: boolean = false

  constructor(args = {}) {
    Object.assign(this, args)
  }
}
