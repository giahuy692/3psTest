import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PPortalComponent } from './p-portal.component';
import { Portal001ExamListComponent } from './pages/portal001-exam-list/portal001-exam-list.component';
import { Portal001ExamDetailComponent } from './pages/portal001-exam-detail/portal001-exam-detail.component';
import { Portal002NewsListComponent } from './pages/portal002-news-list/portal002-news-list.component';
import { Portal002NewsDetailComponent } from './pages/portal002-news-detail/portal002-news-detail.component';
import { Hri019PaycheckDetailComponent } from '../p-hri/pages/hri019-paycheck-detail/hri019-paycheck-detail.component';


const routes: Routes = [
  {
    path: 'portal001-exam-list/:idCompany',
    component: Portal001ExamListComponent,
  },
  {
    path: 'portal001-exam-detail/:idCompany',
    component: Portal001ExamDetailComponent,
  },
  {
    path: 'portal002-news-list/:idCompany',
    component: Portal002NewsListComponent
  },
  {
    path: 'portal002-news-detail/:idCompany',
    component: Portal002NewsDetailComponent
  },
  {
    path: 'portal003-paycheck-detail/:idCompany',
    component: Hri019PaycheckDetailComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PPortalRoutingModule { }
