export class DTOReEval {
  Code: number = 0;
  Company: number = 1;
  ExamQuestionID: number = null;
  EvaluatedBy?: number;
  EvaluateName?:  string = '';
  Fullname:string = ''
  StaffID:string = ''
  ReEvaluationID: number = 0
  DepartmentName:string = ''
  Reason: string = '';
  Reply: string = '';
  Mark: number = null;
  NewMark: number = null;
  CreatedBy: string = null;
  CreatedTime: string = null;
  LastModifiedBy: string = null;
  LastModifiedTime: string = null;
  StatusID: number = 0;
  StatusName: string = "Soạn yêu cầu phúc khảo";
  constructor() {}
}
