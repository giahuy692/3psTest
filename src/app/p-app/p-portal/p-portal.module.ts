import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { PLayoutModule } from '../p-layout/p-layout.module';
import { PPortalRoutingModule } from './p-portal-routing.module';
import { PPortalComponent } from './p-portal.component';
import { Portal001ExamListComponent } from './pages/portal001-exam-list/portal001-exam-list.component';
import { Portal001ExamDetailComponent } from './pages/portal001-exam-detail/portal001-exam-detail.component';
import { PHriModule } from '../p-hri/p-hri.module';
import { Portal002NewsListComponent } from './pages/portal002-news-list/portal002-news-list.component';
import { Portal002NewsDetailComponent } from './pages/portal002-news-detail/portal002-news-detail.component';

@NgModule({
  declarations: [
    PPortalComponent,
    Portal001ExamListComponent,
    Portal001ExamDetailComponent,
    Portal002NewsListComponent,
    Portal002NewsDetailComponent,
  ],
  imports: [
    PPortalRoutingModule,
    PLayoutModule,
    PHriModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
})
export class PPortalModule { }
