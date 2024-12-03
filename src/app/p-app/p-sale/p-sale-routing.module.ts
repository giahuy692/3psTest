import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PSaleComponent } from './p-sale.component';
import { Sale001PolicyDetailComponent } from './pages/sale001-policy-detail/sale001-policy-detail.component';
import { Sale001PolicyListComponent } from './pages/sale001-policy-list/sale001-policy-list.component';
import { Sale002GiftVoucherDetailComponent } from './pages/sale002-gift-voucher-detail/sale002-gift-voucher-detail.component';
import { Sale002GiftVoucherListComponent } from './pages/sale002-gift-voucher-list/sale002-gift-voucher-list.component';
import { Sale003ReportComponent } from './pages/sale003-report/sale003-report.component';

const routes: Routes = [
  {
    path: "",
    component: PSaleComponent,
    children: [
      {
        path: "",
        component: PSaleComponent,
      },
      {
        path: "sale001-policy-list/:idCompany",
        component: Sale001PolicyListComponent,
      },
      {
        path: "sale001-policy-detail/:idCompany",
        component: Sale001PolicyDetailComponent,
      },
      {
        path: "sale002-gift-voucher-list/:idCompany",
        component: Sale002GiftVoucherListComponent,
      },
      {
        path: "sale002-gift-voucher-detail/:idCompany",
        component: Sale002GiftVoucherDetailComponent,
      },
      {
        path: "sale003-report/:idCompany",
        component: Sale003ReportComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PSaleRoutingModule { }
