
export class DTOCompetenceFramework {
  StatusName:string = 'Đang soạn thảo'
  Code:number = 0
  Company:number = 1
  Title: string = ''
  Description: string = ''
  EffDate = new Date()
  StatusID: number = 0
  ApprovedBy?: string
  ApprovedTime?: Date
  CreateBy?: string
  CreateTime?: string
  LastModifiedBy?: string
  LastModifiedTime?: string
  constructor() {}
}
