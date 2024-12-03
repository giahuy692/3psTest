export class DTOElementSalaryDetail{
    Code: number = 0;
    SalaryElement: string = '';
    Notation:  string = '';
    Workday: number = 0;
    Rate: number = 0;
    WorkHour: number = 0
    WDAmount: number = 0
    TypeOfElement: number = 0
}

export class DTOElementSalary{
    WDTotal: number = 0;
    WDStandard: number = 0;
    ListWDDetail: DTOElementSalaryDetail[];
    ListWDOTDetail: DTOElementSalaryDetail[];
    ListAllowanceDetail: DTOElementSalaryDetail[];
    MonthSalary: number = 0;
    ListPlusExceptionDetail: DTOElementSalaryDetail[];
    KPI: number = 0;
    TotalMonthSal: number = 0;
    PaymentSal: number = 0;
    Period: number = 0;
    Fullname: string = '';;
    StaffID: string = '';;
    CompanyID: string = '';;
    WorkDate: number = 0;
    OTDate: number = 0;
    NetSalary: number = 0;
    SalaryRange: string = '';;
    SalaryRate: number = 0;
    NetAllowance: number = 0;
    OTSalary: number = 0;
    Salary:number = 0;
    PlusException: number = 0;
    Bonus: number = 0;
    KPIBonus: number = 0;
    MinuException: number = 0;
    BankNumber: number = 0;
    BankName: string = '';;
    CashAmount: number = 0;
    Note: string = '';;
    PIT: number = 0;
    SIP: number = 0;
    SIC:number = 0;
    Code: number = 0;
    Employee: number = 0;
    SalaryNegotiable: number = 0;
    TotalSal: number = 0;
    SalaryExpense:  number = 0;
    CompanyName: string = '';
}