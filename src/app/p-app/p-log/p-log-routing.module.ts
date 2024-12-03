import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PLogComponent } from './p-log.component';
import { Log001Hachi24hListComponent } from './pages/log001-hachi24h-list/log001-hachi24h-list.component';
import { Log002DomesticReceivingListComponent } from './pages/log002-domestic-receiving-list/log002-domestic-receiving-list.component';
import { Log002DomesticReceivingDetailComponent } from './pages/log002-domestic-receiving-detail/log002-domestic-receiving-detail.component';
const routes: Routes = [
  {
    path: "",
    component: PLogComponent,
    children: [
      {
        path: "",
        component: PLogComponent,
      },
      {
        path: "log001-hachi24h-list/:idCompany",
        component: Log001Hachi24hListComponent,
      },
      {
        path: "log002-domestic-receiving-list/:idCompany",
        component: Log002DomesticReceivingListComponent,
      },
      {
        path: "log002-domestic-receiving-detail/:idCompany",
        component: Log002DomesticReceivingDetailComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PLogRoutingModule { }
