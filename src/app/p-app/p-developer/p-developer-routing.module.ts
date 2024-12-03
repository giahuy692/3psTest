import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PDeveloperComponent } from './p-developer.component';
import { Dev001CompanyListComponent } from './pages/dev001-company-list/dev001-company-list.component';
import { Dev002SystemListComponent } from './pages/dev002-system-list/dev002-system-list.component';
import { Dev003ApiListComponent } from './pages/dev003-api-list/dev003-api-list.component';

const routes: Routes = [
  {
    path: "",
    component: PDeveloperComponent,
    children: [
      {
        path: '',
        component: PDeveloperComponent,
      },
      {
        path: 'dev001-company-list/:idCompany',
        component: Dev001CompanyListComponent,
      },
      {
        path: 'dev002-system-list/:idCompany',
        component: Dev002SystemListComponent,
      },
      {
        path: 'dev003-api-list/:idCompany',
        component: Dev003ApiListComponent,
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PDeveloperRoutingModule { }
