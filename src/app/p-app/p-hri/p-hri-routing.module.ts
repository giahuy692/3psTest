import { Hri036DisciplinaryDetailComponent } from './pages/hri036-disciplinary-detail/hri036-disciplinary-detail.component';
import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PHriComponent } from './p-hri.component';
import { Hri002PolicysalaryComponent } from './pages/hri002-policysalary/hri002-policysalary.component';
import { Hri003PolicyallowanceComponent } from './pages/hri003-policyallowance/hri003-policyallowance.component';
import { Hri005LocationListComponent } from './pages/hri005-location-list/hri005-location-list.component';
import { Hri006DepartmentListComponent } from './pages/hri006-department-list/hri006-department-list.component';
import { Hr001StaffListComponent } from './pages/hr001-staff-list/hr001-staff-list.component';
import { Hr001StaffDetailComponent } from './pages/hr001-staff-detail/hr001-staff-detail.component';
import { Hri007PersonalInfoComponent } from './pages/hr007-personal-info/hr007-personal-info.component';
import { Hr007CompetencyBankComponent } from './pages/hr007-competency-bank/hr007-competency-bank.component';
import { Hri008QuestionBankListComponent } from './pages/hri008-question-bank-list/hri008-question-bank-list.component';
import { Hri009QuestionGroupComponent } from './pages/hri009-question-group/hri009-question-group.component';
import { Hri008QuestionBankDetailComponent } from './pages/hri008-question-bank-detail/hri008-question-bank-detail.component';
import { Hri010EvaluationTrancheComponent } from './pages/hri010-evaluation-tranche/hri010-evaluation-tranche.component';
import { Hri010EvaluationTrancheDetailComponent } from './pages/hri010-evaluation-tranche-detail/hri010-evaluation-tranche-detail.component';
import { Hri011QuizMonitorComponent } from './pages/hri011-quiz-monitor/hri011-quiz-monitor.component';
import { Hri012QuizMarkingComponent } from './pages/hri012-quiz-marking/hri012-quiz-marking.component';
import { Hri013CompetencyFrameworkComponent } from './pages/hri013-competency-framework/hri013-competency-framework.component';
import { Hri013CompetencyFrameworkDetailComponent } from './pages/hri013-competency-framework-detail/hri013-competency-framework-detail.component';
import { Hri014ExamMonitorComponent } from './pages/hri014-exam-monitor/hri014-exam-monitor.component';
import { Hri015ExamReportComponent } from './pages/hri015-exam-report/hri015-exam-report.component';
import { Hri015ExamReportDetailComponent } from './pages/hri015-exam-report-detail/hri015-exam-report-detail.component';
import { Hri015AnalysisReportQuestionComponent } from './pages/hri015-analysis-report-question/hri015-analysis-report-question.component';
import { Hri015WrongReportQuestionComponent } from './pages/hri015-wrong-report-question/hri015-wrong-report-question.component';
import { Hri016AppealListComponent } from './pages/hri016-appeal-list/hri016-appeal-list.component';
import { Hri017ReEvaluateComponent } from './pages/hri017-re-evaluate/hri017-re-evaluate.component';
import { Hri018ExamAppealComponent } from './pages/hri018-exam-appeal/hri018-exam-appeal.component';
import { Hri020NewsDetailComponent } from './pages/hri020-news-detail/hri020-news-detail.component';
import { Hri020NewsListComponent } from './pages/hri020-news-list/hri020-news-list.component';
import { Hri019PaycheckDetailComponent } from './pages/hri019-paycheck-detail/hri019-paycheck-detail.component';
import { Hri019PayrollDetailComponent } from './pages/hri019-payroll-detail/hri019-payroll-detail.component';
import { Hri019PayrollListComponent } from './pages/hri019-payroll-list/hri019-payroll-list.component';
import { Hri021PolicyOnboardingListComponent } from './pages/hri021-policy-onboarding-list/hri021-policy-onboarding-list.component';
import { Hri021PolicyOnboardingDetailComponent } from './pages/hri021-policy-onboarding-detail/hri021-policy-onboarding-detail.component';
import { Hri022PolicyOffboardingListComponent } from './pages/hri022-policy-offboarding-list/hri022-policy-offboarding-list.component';
import { Hri022PolicyOffboardingDetailComponent } from './pages/hri022-policy-offboarding-detail/hri022-policy-offboarding-detail.component';
import { Hri023DecisionHiringListComponent } from './pages/hri023-decision-hiring-list/hri023-decision-hiring-list.component';
import { Hri023DecisionHiringDetailComponent } from './pages/hri023-decision-hiring-detail/hri023-decision-hiring-detail.component';
import { Hri024TransferDecisionListComponent } from './pages/hri024-transfer-decision-list/hri024-transfer-decision-list.component';
import { Hri025ResignationRequestListComponent } from './pages/hri025-resignation-request-list/hri025-resignation-request-list.component';
import { Hri024TransferDecisionDetailComponent } from './pages/hri024-transfer-decision-detail/hri024-transfer-decision-detail.component';
import { Hri025ResignationRequestDetailComponent } from './pages/hri025-resignation-request-detail/hri025-resignation-request-detail.component';
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
import { Hri038DisciplinaryDecisionListComponent } from './pages/hri038-disciplinary-decision-list/hri038-disciplinary-decision-list.component';
import { Hri038DisciplinaryDecisionDetailComponent } from './pages/hri038-disciplinary-decision-detail/hri038-disciplinary-decision-detail.component';
import { Hri037DisciplinaryRequirementListComponent } from './pages/hri037-disciplinary-requirement-list/hri037-disciplinary-requirement-list.component';
import { Hri037DisciplinaryRequirementDetailComponent } from './pages/hri037-disciplinary-requirement-detail/hri037-disciplinary-requirement-detail.component';

const routes: Routes = [
  {
    path: '',
    component: PHriComponent,
    children: [
      {
        path: '',
        component: PHriComponent,
      },
      {
        path: 'hr007-personal-info/:idCompany',
        component: Hri007PersonalInfoComponent,
      },
      {
        path: 'hr001-staff-list/:idCompany',
        component: Hr001StaffListComponent,
      },
      {
        path: 'hr001-staff-detail/:idCompany',
        component: Hr001StaffDetailComponent,
      },
      {
        path: 'hri002-policysalary/:idCompany',
        component: Hri002PolicysalaryComponent,
      },
      {
        path: 'hri003-policyallowance/:idCompany',
        component: Hri003PolicyallowanceComponent,
      },
      {
        path: 'hri004-policyreward/:idCompany',
        component: Hri002PolicysalaryComponent,
      },
      {
        path: 'hri005-location-list/:idCompany',
        component: Hri005LocationListComponent,
      },
      {
        path: 'hri006-department-list/:idCompany',
        component: Hri006DepartmentListComponent,
      },
      {
        path: 'hri007-personal-info/:idCompany',
        component: Hri007PersonalInfoComponent,
      },
      {
        path: 'hr007-competency-bank/:idCompany',
        component: Hr007CompetencyBankComponent,
      },
      {
        path: 'hri008-question-bank-list/:idCompany',
        component: Hri008QuestionBankListComponent,
      },
      {
        path: 'hri008-question-bank-detail/:idCompany',
        component: Hri008QuestionBankDetailComponent,
      },
      {
        path: 'hr009-question-group/:idCompany',
        component: Hri009QuestionGroupComponent,
      },
      {
        path: 'hri010-evaluation-tranche/:idCompany',
        component: Hri010EvaluationTrancheComponent,
      },
      {
        path: 'hri010-evaluation-tranche-detail/:idCompany',
        component: Hri010EvaluationTrancheDetailComponent,
      },
      {
        path: 'hri012-quiz-marking/:idCompany',
        component: Hri012QuizMarkingComponent,
      },
      {
        path: 'hri011-quiz-monitor/:idCompany',
        component: Hri011QuizMonitorComponent,
      },
      {
        path: 'hri013-competency-framework/:idCompany',
        component: Hri013CompetencyFrameworkComponent,
      },
      {
        path: 'hri013-competency-framework-detail/:idCompany',
        component: Hri013CompetencyFrameworkDetailComponent,
      },
      {
        path: 'hri014-exam-monitor/:idCompany',
        component: Hri014ExamMonitorComponent,
      },
      {
        path: 'hri015-exam-report/:idCompany',
        component: Hri015ExamReportComponent,
      },
      {
        path: 'hri015-exam-report-detail/:idCompany',
        component: Hri015ExamReportDetailComponent,
      },
      {
        path: 'hri015-analysis-report-question/:idCompany',
        component: Hri015AnalysisReportQuestionComponent,
      },
      {
        path: 'hri015-wrong-report-question/:idCompany',
        component: Hri015WrongReportQuestionComponent,
      },
      {
        path: 'hri016-appeal-list/:idCompany',
        component: Hri016AppealListComponent,
      },
      {
        path: 'hri017-re-evaluate/:idCompany',
        component: Hri017ReEvaluateComponent,
      },
      {
        path: 'hri018-exam-appeal/:idCompany',
        component: Hri018ExamAppealComponent,
      },
      {
        path: 'hri018-exam-appeal/:idCompany',
        component: Hri018ExamAppealComponent,
      },
      {
        path: 'hri019-paycheck-detail/:idCompany',
        component: Hri019PaycheckDetailComponent,
      },
      {
        path: 'hri019-payroll-detail/:idCompany',
        component: Hri019PayrollDetailComponent,
      },
      {
        path: 'hri019-payroll-list/:idCompany',
        component: Hri019PayrollListComponent,
      },
      {
        path: 'hri020-news-list/:idCompany',
        component: Hri020NewsListComponent,
      },
      {
        path: 'hri020-news-detail/:idCompany',
        component: Hri020NewsDetailComponent,
      },
      {
        path: 'hri021-policy-onboarding-list/:idCompany',
        component: Hri021PolicyOnboardingListComponent,
      },
      {
        path: 'hri021-policy-onboarding-detail/:idCompany',
        component: Hri021PolicyOnboardingDetailComponent,
      },
      {
        path: 'hri022-policy-offboarding-list/:idCompany',
        component: Hri022PolicyOffboardingListComponent,
      },
      {
        path: 'hri022-policy-offboarding-detail/:idCompany',
        component: Hri022PolicyOffboardingDetailComponent,
      },
      {
        path: 'hri023-decision-hiring-list/:idCompany',
        component: Hri023DecisionHiringListComponent,
      },
      {
        path: 'hri023-decision-hiring-detail/:idCompany',
        component: Hri023DecisionHiringDetailComponent,
      },
      {
        path: 'hri024-transfer-decision-list/:idCompany',
        component: Hri024TransferDecisionListComponent,
      },
      {
        path: 'hri024-transfer-decision-detail/:idCompany',
        component: Hri024TransferDecisionDetailComponent,
      },
      {
        path: 'hri025-resignation-request-list/:idCompany',
        component: Hri025ResignationRequestListComponent,
      },
            {
        path: 'hri025-resignation-request-detail/:idCompany',
        component: Hri025ResignationRequestDetailComponent,
      },
      {
        path: 'hri026-resignation-decision-list/:idCompany',
        component: Hri026ResignationDecisionListComponent,
      },
      {
        path: 'hri026-resignation-decision-detail/:idCompany',
        component: Hri026ResignationDecisionDetailComponent,
      },
      {
        path: 'hri027-termination-decision-list/:idCompany',
        component: Hri027TerminationDecisionListComponent,
      },
      {
        path: 'hri027-termination-decision-detail/:idCompany',
        component: Hri027TerminationDecisionDetailComponent,
      },
      {
        path: 'hri028-pre-onboarding-list/:idCompany',
        component: Hri028PreOnboardingListComponent,
      },
      {
        path: 'hri028-pre-onboarding-detail/:idCompany',
        component: Hri028PreOnboardingDetailComponent,
      },
      {
        path: 'hri029-onboarding-list/:idCompany',
        component: Hri029OnboardingListComponent,
      },
      {
        path: 'hri029-onboarding-detail/:idCompany',
        component: Hri029OnboardingDetailComponent,
      },
      {
        path: 'hri030-onboarded-list/:idCompany',
        component: Hri030OnboardedListComponent,
      },
      {
        path: 'hri030-onboarded-detail/:idCompany',
        component: Hri030OnboardedDetailComponent,
      },
      {
        path: 'hri031-stop-onboarding-list/:idCompany',
        component: Hri031StopOnboardingListComponent,
      },
      {
        path: 'hri031-stop-onboarding-detail/:idCompany',
        component: Hri031StopOnboardingDetailComponent,
      },
      {
        path: 'hri032-pre-offboarding-list/:idCompany',
        component: Hri032PreOffboardingListComponent,
      },
      {
        path: 'hri032-pre-offboarding-detail/:idCompany',
        component: Hri032PreOffboardingDetailComponent,
      },
      {
        path: 'hri033-offboarding-list/:idCompany',
        component: Hri033OffboardingListComponent,
      },
      {
        path: 'hri033-offboarding-detail/:idCompany',
        component: Hri033OffboardingDetailComponent,
      },
      {
        path: 'hri034-offboarded-list/:idCompany',
        component: Hri034OffboardedListComponent,
      },
      {
        path: 'hri034-offboarded-detail/:idCompany',
        component: Hri034OffboardedDetailComponent,
      },
      {
        path: 'hri035-stop-offboarding-list/:idCompany',
        component: Hri035StopOffboardingListComponent,
      },
      {
        path: 'hri035-stop-offboarding-detail/:idCompany',
        component: Hri035StopOffboardingDetailComponent,
      },
      {
        path: 'hri036-disciplinary-list/:idCompany',
        component: Hri036DisciplinaryListComponent,
      },
      {
        path: 'hri036-disciplinary-detail/:idCompany',
        component: Hri036DisciplinaryDetailComponent,
      },
      {
        path: 'hri037-disciplinary-requirement-list/:idCompany',
        component: Hri037DisciplinaryRequirementListComponent,
      },
      {
        path: 'hri037-disciplinary-requirement-detail/:idCompany',
        component: Hri037DisciplinaryRequirementDetailComponent,
      },
      {
        path: 'hri038-disciplinary-decision-list/:idCompany',
        component: Hri038DisciplinaryDecisionListComponent,
      },
      {
        path: 'hri038-disciplinary-decision-detail/:idCompany',
        component: Hri038DisciplinaryDecisionDetailComponent,
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PHriRoutingModule {}
