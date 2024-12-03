//#region [begin using]
import { Injectable } from '@angular/core';
import { url } from 'inspector';
import { ApiMethodType, DTOAPI, DTOConfig } from 'src/app/p-lib';
import { EnumHR } from 'src/app/p-lib/enum/hr.enum';
//#endregion [end using]

@Injectable({
  providedIn: 'root',
})
export class HriApiConfigService {
  constructor() { }

  //#region [begin coding]
  //#endregion [end coding]

  getAPIList() {
    return {
      //ThongTinNhanSu
      GetEmployee: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetEmployee,
      }),
      GetCurrentEmployee: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetCurrentEmployee,
      }),
      //NgayCong
      GetWDStandard: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetWDStandard,
      }),
      GetWorkdayMonth: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetWorkdayMonth,
      }),
      GetPeriod: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPeriod,
      }),
      //Luong
      GetPayslipList: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPayslipList,
      }),
      GetPayslipListByPeriod: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPayslipListByPeriod,
      }),
      GetCnBSalary: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetCnBSalary,
      }),
      GetSalary: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetSalary,
      }),
      GetAllowance: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetAllowance,
      }),
      GetException: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetException,
      }),
      //
      UploadExcel: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UploadExcel,
      }),
      GetExcelTemplate: new DTOAPI({
        method: ApiMethodType.get,
        url: EnumHR.GetExcelTemplate,
      }),
      GetFolderStructure: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetFolderStructure,
      }),
      CreateFolder: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.CreateFolder,
      }),

      //#region Cơ cấu tổ chức
      GetListDepartmentTree: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListDepartmentTree,
      }),
      GetListDepartment: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListDepartment,
      }),
      UpdateDepartment: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateDepartment,
      }),
      DeleteDepartment: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteDepartment,
      }),
      ImportExcelDepartment: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelDepartment,
      }),
      //#endregion Cơ cấu tổ chức

      //#region Điểm làm việc
      GetListLocationTree: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListLocationTree,
      }),
      GetListLocation: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListLocation,
      }),
      UpdateLocation: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateLocation,
      }),
      DeleteLocation: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteLocation,
      }),
      ImportExcelLocation: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelLocation,
      }),
      //#endregion Điểm làm việc

      //#region Chức danh
      GetListPositionTree: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPositionTree,
      }),
      GetListPosition: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPosition,
      }),
      GetListPositionIndirect: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPositionIndirect,
      }),
      GetListPositionGroup: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPositionGroup,
      }),
      GetListPositionRole: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPositionRole,
      }),
      AddPositionRole: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.AddPositionRole,
      }),
      UpdatePosition: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdatePosition,
      }),
      DeletePosition: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeletePosition,
      }),
      //#endregion Chức danh

      //#region nhân sự

      GetListEmployee: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListEmployee,
      }),
      GetEmployeeInfo: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetEmployeeInfo,
      }),
      UpdateEmployeeInfo: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateEmployeeInfo,
      }),
      DeleteEmployeeRole: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteEmployeeRole,
      }),
      AddEmployeeRole: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.AddEmployeeRole,
      }),

      GetListHR: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHR,
      }),

      GetListRole: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListRole,
      }),

      UpdateEmployeeStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateEmployeeStatus,
      }),

      ImportExcelEmployee: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelEmployee,
      }),

      //Nhân sự Thông Tin Cá Nhân
      GetPersonalInfo: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPersonalInfo,
      }),

      GetPersonalCertificate: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPersonalCertificate,
      }),

      GetPersonalContact: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPersonalContact,
      }),

      GetPersonalAddress: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPersonalAddress,
      }),

      UpdatePersonalCertificate: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdatePersonalCertificate,
      }),

      GetListCountry: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListCountry,
      }),

      GetListProvince: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListProvince,
      }),

      GetListDistrict: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListDistrict,
      }),

      GetListWard: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListWard,
      }),

      UpdatePersonalInfo: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdatePersonalInfo,
      }),

      UpdatePersonalContact: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdatePersonalContact,
      }),

      UpdatePersonalAddress: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdatePersonalAddress,
      }),

      //#reigon QUESTION GROUP
      ImportExcelQuestionCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelQuestionCategory,
      }),
      GetListQuestionGroupTree: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuestionGroupTree,
      }),
      GetListQuestionGroup: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuestionGroup,
      }),
      UpdateQuestionGroup: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateQuestionGroup,
      }),
      DeleteQuestionGroup: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteQuestionGroup,
      }),
      //#endregion

      //#region QUESTION
      GetListQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuestion,
      }),
      GetQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetQuestion,
      }),
      UpdateQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateQuestion,
      }),
      UpdateQuestionStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateQuestionStatus,
      }),
      DeleteQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteQuestion,
      }),
      ImportExcelQuestionBank: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelQuestionBank,
      }),
      //#endregion

      //#region Competence
      GetListQuestionCompetence: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuestionCompetence,
      }),
      UpdateQuestionCompetence: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateQuestionCompetence,
      }),
      DeleteQuestionCompetence: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteQuestionCompetence,
      }),
      GetListCompetenceQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListCompetenceQuestion,
      }),
      //#endregion

      //#region QUIZ SESSION
      //Quiz
      GetListQuizEmployee: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuizEmployee,
      }),
      ImportExcelSession: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelSession,
      }),
      GetQuizSession: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetQuizSession,
      }),
      GetListQuizSession: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuizSession,
      }),
      GetListQuizDepartment: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuizDepartment,
      }),
      UpdateQuizSession: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateQuizSession,
      }),
      GetQuizMonitor: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetQuizMonitor,
      }),
      GetListQuizRole: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuizRole,
      }),
      GenerateQuizRole: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GenerateQuizRole,
      }),
      UpdateQuizSessionStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateQuizSessionStatus,
      }),
      DeleteQuizSession: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteQuizSession,
      }),
      UpdateQuizRole: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateQuizRole,
      }),
      DeleteQuizRole: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteQuizRole,
      }),
      //#endregion

      //region Quiz session config
      GetListQuizConfig: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuizConfig,
      }),
      GetListPositionQuiz: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPositionQuiz,
      }),
      GetListQuizConfigCompetence: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuizConfigCompetence,
      }),
      GetListQuizConfigCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuizConfigCategory,
      }),
      UpdateQuizConfig: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateQuizConfig,
      }),
      DeleteQuizConfig: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteQuizConfig,
      }),
      UpdateListQuizConfig: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateListQuizConfig,
      }),
      //endregion

      //quiz report
      GetQuizQuestionReport: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetQuizQuestionReport,
      }),
      GetQuizWrongQuestionReport: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetQuizWrongQuestionReport,
      }),
      GetQuizExamineeReport: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetQuizExamineeReport,
      }),
      ExportExamDetailResultReport: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ExportExamDetailResultReport,
      }),
      ExportQuestionAnalsisReport: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ExportQuestionAnalsisReport,
      }),
      ExportWrongQuestionReport: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ExportWrongQuestionReport,
      }),

      //#region Answer
      GetListAnswer: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListAnswer,
      }),
      UpdateAnswer: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateAnswer,
      }),
      DeleteAnswer: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteAnswer,
      }),
      GetListQuestionType: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuestionType,
      }),
      GetListEvaluationType: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListEvaluationType,
      }),
      UpdateMark: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateMark,
      }),
      DeleteMark: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteMark,
      }),
      //#endregion

      //#region competence-framework
      GetListCompetenceFramework: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListCompetenceFramework,
      }),
      UpdateCompetenceFramework: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateCompetenceFramework,
      }),
      UpdateStatusCompetenceFramework: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateStatusCompetenceFramework,
      }),
      DeleteCompetenceFramework: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteCompetenceFramework,
      }),
      GetListCompetenceFrameworkDetails: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListCompetenceFrameworkDetails,
      }),
      UpdateCompetenceFrameworkDetails: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateCompetenceFrameworkDetails,
      }),
      GetCompetenceFramework: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetCompetenceFramework,
      }),
      GetListFrameworkPosition: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListFrameworkPosition,
      }),
      GetListFrameworkCompetence: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListFrameworkCompetence,
      }),
      DeleteCompetenceFrameworkDetails: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteCompetenceFrameworkDetails,
      }),
      ImportExcelFramework: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelFramework,
      }),
      ImportExcelFrameworkDetail: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelFrameworkDetail,
      }),
      //#endregion

      //#region Từ điển năng lực
      GetListCompetenceGuide: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListCompetenceGuide,
      }),
      UpdateCompetenceGuide: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateCompetenceGuide,
      }),
      GetListCompetenceCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListCompetenceCategory,
      }),
      UpdateCompetenceCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateCompetenceCategory,
      }),
      UpdateCompetenceCategoryStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateCompetenceCategoryStatus,
      }),
      DeleteCompetenceCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteCompetenceCategory,
      }),
      GetListCompetenceBank: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListCompetenceBank,
      }),
      UpdateCompetenceBank: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateCompetenceBank,
      }),
      UpdateCompetenceBankStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateCompetenceBankStatus,
      }),
      DeleteCompetenceBank: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteCompetenceBank,
      }),
      GetListCompetenceSector: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListCompetenceSector,
      }),
      UpdateCompetenceSector: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateCompetenceSector,
      }),
      GetListSectorQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListSectorQuestion,
      }),
      ImportExcelCompetenceCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelCompetenceCategory,
      }),
      //#endregion

      //#region exam
      CalculateMarkQuiz: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.CalculateMarkQuiz,
      }),
      GetListQuizEssayQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuizEssayQuestion,
      }),
      GetListExamEssayQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListExamEssayQuestion,
      }),
      UpdateExamEssayQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateExamEssayQuestion,
      }),
      UpdateExamStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateExamStatus,
      }),
      DeleteExam: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteExam,
      }),
      //#endregion

      //#region portal
      GetListExam: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListExam,
      }),
      GetListExamPortal: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListExamPortal,
      }),
      GetListExamQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListExamQuestion,
      }),
      UpdateExamResult: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateExamResult,
      }),
      DeleteExamResult: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteExamResult,
      }),
      //#endregion

      //#region appeal
      GetListExamAppealRequest: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListExamAppealRequest,
      }),
      GetListQuestionAppealRequest: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListQuestionAppealRequest,
      }),
      GetListStaffReEval: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListStaffReEval,
      }),
      UpdateAppealStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateAppealStatus,
      }),
      UpdateReEval: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateReEval,
      }),
      UpdateMarkMultipleReEval: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateMarkMultipleReEval,
      }),
      GetListAppealInQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListAppealInQuestion,
      }),
      //#endregion

      //#region Payroll
      GetListPayroll: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPayroll,
      }),
      GetPayroll: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPayroll,
      }),
      UpdatePayrollStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdatePayrollStatus,
      }),
      DeletePayroll: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeletePayroll,
      }),
      UpdatePayroll: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdatePayroll,
      }),
      GetListPaycheck: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPaycheck,
      }),
      UpdatePaycheckStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdatePaycheckStatus,
      }),
      DeletePaycheck: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeletePaycheck,
      }),
      ImportExcelPaycheck: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportExcelPaycheck,
      }),
      GetTemplate: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetTemplate,
      }),
      GetPaycheck: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPaycheck,
      }),
      GetPaycheckPortal: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetPaycheckPortal,
      }),
      GetListPeriodPortal: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPeriodPortal,
      }),
      DeleteAllPaycheck: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteAllPaycheck,
      }),

      //#region chính sách onboarding và offboarding
      GetListHRPolicy: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRPolicy,
      }),
      GetHRPolicy: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRPolicy,
      }),
      GetListHRPolicyTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRPolicyTask,
      }),
      GetHRPolicyTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRPolicyTask,
      }),
      GetListHRPolicyApply: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRPolicyApply,
      }),
      GetHRPolicyApply: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRPolicyApply,
      }),
      GetHRPolicyPosition: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRPolicyPosition,
      }),
      GetListHRPolicyPosition: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRPolicyPosition,
      }),
      GetListHRPolicyLocation: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRPolicyLocation,
      }),
      GetListHRTaskException: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRTaskException,
      }),
      GetListHRPolicySysTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRPolicySysTask,
      }),
      ImportHRPolicyApply: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportHRPolicyApply,
      }),
      ImportHRPolicyTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportHRPolicyTask,
      }),
      UpdateHRPolicy: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRPolicy,
      }),
      UpdateHRPolicyStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRPolicyStatus,
      }),
      UpdateHRPolicyLimit: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRPolicyLimit,
      }),
      UpdateHRPolicyTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRPolicyTask,
      }),
      DeleteHRPolicy: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteHRPolicy,
      }),
      DeleteHRPolicyTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteHRPolicyTask,
      }),
      DeleteHRPolicyLimit: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteHRPolicyLimit,
      }),
      UpdateHRListPolicyTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRListPolicyTask,
      }),
      GetListHRFunctionTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRFunctionTask,
      }),
      UpdateHRPolicyLimitStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRPolicyLimitStatus,
      }),
      GetListSYSTaskInFunction: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListSYSTaskInFunction,
      }),
      //#endregion

      //#region quyết định nhân sự
      GetListHRDecisionMaster: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRDecisionMaster,
      }),
      GetHRDecisionMaster: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRDecisionMaster,
      }),
      GetListHRDecisionProfile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRDecisionProfile,
      }),
      UpdateHRDecisionProfileStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRDecisionProfileStatus,
      }),
      GetHRDecisionProfile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRDecisionProfile,
      }),
      UpdateHRDecisionMasterStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRDecisionMasterStatus,
      }),
      UpdateHRDecisionMaster: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRDecisionMaster,
      }),
      UpdateHRDecisionProfile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRDecisionProfile,
      }),
      DeleteHRDecisionMaster: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteHRDecisionMaster,
      }),
      DeleteHRDecisionProfile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteHRDecisionProfile,
      }),
      GetHRPersonalProfileByCICN: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRPersonalProfileByCICN,
      }),
      GetListPositionDepartment: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListPositionDepartment,
      }),
      GetListLocationDepartment: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListLocationDepartment,
      }),
      GetHREmployeeByID: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHREmployeeByID,
      }),
      //#endregion

      //#region đề nghị
      GetListHRPetitionMaster: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRPetitionMaster,
      }),
      GetListHRDecisionTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRDecisionTask,
      }),
      GetHRPetitionMaster: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRPetitionMaster,
      }),
      UpdateHRPetitionMaster: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRPetitionMaster,
      }),
      DeleteHRPetition: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteHRPetition,
      }),
      GetHRDecisionTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRDecisionTask,
      }),
      UpdateHRDecisionTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateHRDecisionTask,
      }),
      UpdateListHRDecisionTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.UpdateListHRDecisionTask,
      }),
      DeleteHRDecisionTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.DeleteHRDecisionTask,
      }),
      ImportHRDecisionProfile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.ImportHRDecisionProfile,
      }),
      GetListHRDecisionTaskLog: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRDecisionTaskLog,
      }),
      GetHRDecisionProfileReportExcel: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRDecisionProfileReportExcel,
      }),
      GetHRDecisionProfileReportWord: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRDecisionProfileReportWord,
      }),
      GetHRStaffLeaveReportExcel: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRStaffLeaveReportExcel,
      }),
      GetHRStaffLeaveReportWord: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetHRStaffLeaveReportWord,
      }),
      PrintHRStaffLeaveReportPDF: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.PrintHRStaffLeaveReportPDF,
      }),
      //#endregion

      //#region boarding
      GetListHRTaskGroup: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListHRTaskGroup,
      }),
      //#endregion

      //# region xử lý kỷ luật
      GetListDisciplinaryStaff: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListDisciplinaryStaff,
      }),
      GetDecisionDisciplinaryExcel: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetDecisionDisciplinaryExcel,
      }),
      GetListDisciplinaryTask: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.GetListDisciplinaryTask,
      }),

      CreateDecisionDisciplinary: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumHR.CreateDecisionDisciplinary,
      })


      
    };
  }


}
