export class DTOPayroll {
  Code: number = 0;
  SalaryName: string = ''; // Tên tình trạng 
  EffDate: string = ''; // Thời gian hiển thị trên hệ thống
  Remark: string = ''; // Mô tả bảng lương
  NoOfEmployee: number = null; // SL nhân sự
  ListEmployee: []; //danh sách nhân sự
  Period: string = ''; // Kỳ lương
  FromDate: string = null; // Ngày bắt đầu kỳ lương
  ToDate: string = null; // Ngày kết thức kỳ lương
  StatusID: number = 0;
  StatusName: string = null;
  constructor(Code?: number, FromDate?: string, ToDate?: string, Period?: string) {
    this.Code = Code;
    this.FromDate = FromDate;
    this.ToDate = ToDate;
    this.Period = Period;
  }
}

export class DTOEmployeeSalary{
  Code: number = 0;
  Employee: number = null;
  Period: number = 0
  Fullname: string = '';
  PeriodName: string = '';
  ImageThumb: string = '';
  EmployeeID: string = '';
  PositionName: string = '';
  DepartmentName: string = '';
  LocationName: string = '';
  Gender: string = '';
  BirthDate: string = '';
  JoinDate: string = '';
  TypeDataName: string = '';
  TotalSal: number = 0;
  StatusID: number = 0;
  StatusName: string = '';
}