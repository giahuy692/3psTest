import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PDashboardComponent } from './p-dashboard.component';
import { BI001DashboardEcomComponent } from './pages/dashboard001-ecom/dashboard001-ecom.component';

const routes: Routes = [
  {
    path: "",
    component: PDashboardComponent,
    children: [
      {
        path: '',
        component: PDashboardComponent,
      },
      {
        path: "dashboard001-ecom/:idCompany",
        component: BI001DashboardEcomComponent,
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PDashboardRoutingModule { }
