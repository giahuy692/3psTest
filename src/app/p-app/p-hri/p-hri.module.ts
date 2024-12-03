import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PHriRoutingModule } from './p-hri-routing.module';
import { PHriComponent } from './p-hri.component';
import { Hri002PolicysalaryComponent } from './pages/hri002-policysalary/hri002-policysalary.component';
import { Hri003PolicyallowanceComponent } from './pages/hri003-policyallowance/hri003-policyallowance.component';
import { Hri004PolicyrewardComponent } from './pages/hri004-policyreward/hri004-policyreward.component';
import { PLayoutModule } from '../p-layout/p-layout.module';
import { Hri005LocationListComponent } from './pages/hri005-location-list/hri005-location-list.component';
import { Hri006DepartmentListComponent } from './pages/hri006-department-list/hri006-department-list.component';
import { Hr001StaffListComponent } from './pages/hr001-staff-list/hr001-staff-list.component';
import { Hri007PersonalInfoComponent } from './pages/hr007-personal-info/hr007-personal-info.component';
import { Hr001StaffDetailComponent } from './pages/hr001-staff-detail/hr001-staff-detail.component';
import { Hr007CompetencyBankComponent } from './pages/hr007-competency-bank/hr007-competency-bank.component';
import { Hri008QuestionBankListComponent } from './pages/hri008-question-bank-list/hri008-question-bank-list.component';
import { Hri009QuestionGroupComponent } from './pages/hri009-question-group/hri009-question-group.component';
import { Hri008QuestionBankDetailComponent } from './pages/hri008-question-bank-detail/hri008-question-bank-detail.component';
import { HRMenuStaffInfoComponent } from './shared/components/hr-menu-staff-info/hr-menu-staff-info.component';
import { Hri010EvaluationTrancheComponent } from './pages/hri010-evaluation-tranche/hri010-evaluation-tranche.component';
import { Hri010EvaluationTrancheDetailComponent } from './pages/hri010-evaluation-tranche-detail/hri010-evaluation-tranche-detail.component';
import { Hri011QuizMonitorComponent } from './pages/hri011-quiz-monitor/hri011-quiz-monitor.component';
import { Hri012QuizMarkingComponent } from './pages/hri012-quiz-marking/hri012-quiz-marking.component';
import { HRQuizSessionInfoComponent } from './shared/components/hr-quiz-session-info/hr-quiz-session-info.component';
import { Hri013CompetencyFrameworkComponent } from './pages/hri013-competency-framework/hri013-competency-framework.component';
import { Hri013CompetencyFrameworkDetailComponent } from './pages/hri013-competency-framework-detail/hri013-competency-framework-detail.component';
import { Hri015ExamReportComponent } from './pages/hri015-exam-report/hri015-exam-report.component';
import { Hri015ExamReportDetailComponent } from './pages/hri015-exam-report-detail/hri015-exam-report-detail.component';
import { Hri015AnalysisReportQuestionComponent } from './pages/hri015-analysis-report-question/hri015-analysis-report-question.component';
import { Hri015WrongReportQuestionComponent } from './pages/hri015-wrong-report-question/hri015-wrong-report-question.component';

import { Hri014ExamMonitorComponent } from './pages/hri014-exam-monitor/hri014-exam-monitor.component';
import { HrExamDetailComponent } from './shared/components/hr-exam-detail/hr-exam-detail.component';
import { HrExamQuestionComponent } from './shared/components/hr-exam-question/hr-exam-question.component';
import { Hri016AppealListComponent } from './pages/hri016-appeal-list/hri016-appeal-list.component';
import { Hri017ReEvaluateComponent } from './pages/hri017-re-evaluate/hri017-re-evaluate.component';
import { Hri018ExamAppealComponent } from './pages/hri018-exam-appeal/hri018-exam-appeal.component';
import { Hri020NewsListComponent } from './pages/hri020-news-list/hri020-news-list.component';
import { Hri020NewsDetailComponent } from './pages/hri020-news-detail/hri020-news-detail.component';
import { Hri019PayrollListComponent } from './pages/hri019-payroll-list/hri019-payroll-list.component';
import { Hri019PayrollDetailComponent } from './pages/hri019-payroll-detail/hri019-payroll-detail.component';
import { Hri019PaycheckDetailComponent } from './pages/hri019-paycheck-detail/hri019-paycheck-detail.component';
import { HrNewsDetailComponent } from './shared/components/hr-news-detail/hr-news-detail.component';
import { HrPaycheckDetailComponent } from './shared/components/hr-paycheck-detail/hr-paycheck-detail.component';
import { Hri021PolicyOnboardingListComponent } from './pages/hri021-policy-onboarding-list/hri021-policy-onboarding-list.component';
import { Hri021PolicyOnboardingDetailComponent } from './pages/hri021-policy-onboarding-detail/hri021-policy-onboarding-detail.component';
import { Hri022PolicyOffboardingListComponent } from './pages/hri022-policy-offboarding-list/hri022-policy-offboarding-list.component';
import { Hri022PolicyOffboardingDetailComponent } from './pages/hri022-policy-offboarding-detail/hri022-policy-offboarding-detail.component';
import { Hri023DecisionHiringListComponent } from './pages/hri023-decision-hiring-list/hri023-decision-hiring-list.component';
import { Hri023DecisionHiringDetailComponent } from './pages/hri023-decision-hiring-detail/hri023-decision-hiring-detail.component';
import { Hri024TransferDecisionListComponent } from './pages/hri024-transfer-decision-list/hri024-transfer-decision-list.component';
import { Hri024TransferDecisionDetailComponent } from './pages/hri024-transfer-decision-detail/hri024-transfer-decision-detail.component';
import { Hri025ResignationRequestDetailComponent } from './pages/hri025-resignation-request-detail/hri025-resignation-request-detail.component';
import { HrPolicyTransitionInfoComponent } from './shared/components/hr-policy-transition-info/hr-policy-transition-info.component';
import { HrPolicyTransitionListComponent } from './shared/components/hr-policy-transition-list/hr-policy-transition-list.component';
import { HrApplicablePositionListComponent } from './shared/components/hr-applicable-position-list/hr-applicable-position-list.component';
import { HrTaskListComponent } from './shared/components/hr-task-list/hr-task-list.component';
import { HrTaskAdderComponent } from './shared/components/hr-task-adder/hr-task-adder.component';
import { HrExceptionAdderComponent } from './shared/components/hr-exception-adder/hr-exception-adder.component';
import { HrPolicyDetailComponent } from './shared/components/hr-policy-detail/hr-policy-detail.component';
import { HrOnboardDecisionListComponent } from './shared/components/hr-onboard-decision-list/hr-onboard-decision-list.component';
import { HrOnboardDecisionDetailComponent } from './shared/components/hr-onboard-decision-detail/hr-onboard-decision-detail.component';
import { HrOffboardDecisionDetailComponent } from './shared/components/hr-offboard-decision-detail/hr-offboard-decision-detail.component';
import { HrOffboardDecisionListComponent } from './shared/components/hr-offboard-decision-list/hr-offboard-decision-list.component';
import { HrBoardingListComponent } from './shared/components/hr-boarding-list/hr-boarding-list.component';
import { HrBoardingDetailComponent } from './shared/components/hr-boarding-detail/hr-boarding-detail.component';
import { Hri025ResignationRequestListComponent } from './pages/hri025-resignation-request-list/hri025-resignation-request-list.component';
import { Hri026ResignationDecisionListComponent } from './pages/hri026-resignation-decision-list/hri026-resignation-decision-list.component';
import { Hri026ResignationDecisionDetailComponent } from './pages/hri026-resignation-decision-detail/hri026-resignation-decision-detail.component';
import { Hri027TerminationDecisionListComponent } from './pages/hri027-termination-decision-list/hri027-termination-decision-list.component';
import { Hri027TerminationDecisionDetailComponent } from './pages/hri027-termination-decision-detail/hri027-termination-decision-detail.component';
import { Hri028PreOnboardingListComponent } from './pages/hri028-pre-onboarding-list/hri028-pre-onboarding-list.component';
import { Hri028PreOnboardingDetailComponent } from './pages/hri028-pre-onboarding-detail/hri028-pre-onboarding-detail.component';
import { Hri029OnboardingListComponent } from './pages/hri029-onboarding-list/hri029-onboarding-list.component';
import { Hri029OnboardingDetailComponent } from './pages/hri029-onboarding-detail/hri029-onboarding-detail.component';
import { Hri030OnboardedListComponent } from './pages/hri030-onboarded-list/hri030-onboarded-list.component';
import { Hri030OnboardedDetailComponent } from './pages/hri030-onboarded-detail/hri030-onboarded-detail.component';
import { Hri031StopOnboardingListComponent } from './pages/hri031-stop-onboarding-list/hri031-stop-onboarding-list.component';
import { Hri031StopOnboardingDetailComponent } from './pages/hri031-stop-onboarding-detail/hri031-stop-onboarding-detail.component';
import { Hri032PreOffboardingListComponent } from './pages/hri032-pre-offboarding-list/hri032-pre-offboarding-list.component';
import { Hri032PreOffboardingDetailComponent } from './pages/hri032-pre-offboarding-detail/hri032-pre-offboarding-detail.component';
import { Hri033OffboardingListComponent } from './pages/hri033-offboarding-list/hri033-offboarding-list.component';
import { Hri033OffboardingDetailComponent } from './pages/hri033-offboarding-detail/hri033-offboarding-detail.component';
import { Hri034OffboardedListComponent } from './pages/hri034-offboarded-list/hri034-offboarded-list.component';
import { Hri034OffboardedDetailComponent } from './pages/hri034-offboarded-detail/hri034-offboarded-detail.component';
import { Hri035StopOffboardingListComponent } from './pages/hri035-stop-offboarding-list/hri035-stop-offboarding-list.component';
import { Hri035StopOffboardingDetailComponent } from './pages/hri035-stop-offboarding-detail/hri035-stop-offboarding-detail.component';
import { Hri036DisciplinaryListComponent } from './pages/hri036-disciplinary-list/hri036-disciplinary-list.component';
import { Hri036DisciplinaryDetailComponent } from './pages/hri036-disciplinary-detail/hri036-disciplinary-detail.component';
import { Hri038DisciplinaryDecisionListComponent } from './pages/hri038-disciplinary-decision-list/hri038-disciplinary-decision-list.component';
import { Hri038DisciplinaryDecisionDetailComponent } from './pages/hri038-disciplinary-decision-detail/hri038-disciplinary-decision-detail.component';
import { Hri037DisciplinaryRequirementListComponent } from './pages/hri037-disciplinary-requirement-list/hri037-disciplinary-requirement-list.component';
import { Hri037DisciplinaryRequirementDetailComponent, SplitStakeholderListPipe } from './pages/hri037-disciplinary-requirement-detail/hri037-disciplinary-requirement-detail.component';

@NgModule({
  declarations: [
    PHriComponent,
    HrExamDetailComponent,
    HRMenuStaffInfoComponent,
    HRQuizSessionInfoComponent,
    HrPaycheckDetailComponent,
    HrNewsDetailComponent,
    HrExamQuestionComponent,
    Hr001StaffListComponent,
    Hri002PolicysalaryComponent,
    Hri003PolicyallowanceComponent,
    Hri004PolicyrewardComponent,
    Hri005LocationListComponent,
    Hri006DepartmentListComponent,
    Hr001StaffDetailComponent,
    Hri007PersonalInfoComponent,
    Hr007CompetencyBankComponent,
    Hri008QuestionBankListComponent,
    Hri009QuestionGroupComponent,
    Hri008QuestionBankDetailComponent,
    Hri010EvaluationTrancheComponent,
    Hri010EvaluationTrancheDetailComponent,
    Hri012QuizMarkingComponent,
    Hri011QuizMonitorComponent,
    Hri013CompetencyFrameworkComponent,
    Hri013CompetencyFrameworkDetailComponent,
    Hri014ExamMonitorComponent,
    Hri015AnalysisReportQuestionComponent,
    Hri015WrongReportQuestionComponent,
    Hri015ExamReportComponent,
    Hri015ExamReportDetailComponent,
    Hri016AppealListComponent,
    Hri017ReEvaluateComponent,
    Hri018ExamAppealComponent,
    Hri019PayrollListComponent,
    Hri019PayrollDetailComponent,
    Hri019PaycheckDetailComponent,
    Hri020NewsListComponent,
    Hri020NewsDetailComponent,
    Hri021PolicyOnboardingListComponent,
    Hri021PolicyOnboardingDetailComponent,
    Hri022PolicyOffboardingListComponent,
    Hri022PolicyOffboardingDetailComponent,
    Hri023DecisionHiringListComponent,
    Hri023DecisionHiringDetailComponent,
    Hri024TransferDecisionListComponent,
    Hri024TransferDecisionDetailComponent,
    Hri025ResignationRequestListComponent,
    Hri025ResignationRequestDetailComponent,
    Hri026ResignationDecisionListComponent,
    Hri026ResignationDecisionDetailComponent,
    Hri027TerminationDecisionListComponent,
    Hri027TerminationDecisionDetailComponent,
    HrPolicyTransitionInfoComponent,
    HrPolicyTransitionListComponent,
    HrApplicablePositionListComponent,
    HrTaskListComponent,
    HrTaskAdderComponent,
    HrExceptionAdderComponent,
    HrPolicyDetailComponent,
    HrBoardingListComponent,
    HrBoardingDetailComponent,
    HrOnboardDecisionDetailComponent,
    HrOnboardDecisionListComponent,
    HrOffboardDecisionDetailComponent,
    HrOffboardDecisionListComponent,
    Hri028PreOnboardingListComponent,
    Hri028PreOnboardingDetailComponent,
    Hri029OnboardingListComponent,
    Hri029OnboardingDetailComponent,
    Hri030OnboardedListComponent,
    Hri030OnboardedDetailComponent,
    Hri031StopOnboardingListComponent,
    Hri031StopOnboardingDetailComponent,
    Hri032PreOffboardingListComponent,
    Hri032PreOffboardingDetailComponent,
    Hri033OffboardingListComponent,
    Hri033OffboardingDetailComponent,
    Hri034OffboardedListComponent,
    Hri034OffboardedDetailComponent,
    Hri035StopOffboardingListComponent,
    Hri035StopOffboardingDetailComponent,
    Hri036DisciplinaryListComponent,
    Hri036DisciplinaryDetailComponent,
    Hri037DisciplinaryRequirementListComponent,
    Hri037DisciplinaryRequirementDetailComponent,
    Hri038DisciplinaryDecisionListComponent,
    Hri038DisciplinaryDecisionDetailComponent,
    
    //- Pipe
    SplitStakeholderListPipe
    
  ],
  imports: [PHriRoutingModule, PLayoutModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [HrExamDetailComponent, HRMenuStaffInfoComponent],
})
export class PHriModule {}
