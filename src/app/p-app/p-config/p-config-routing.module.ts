import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PConfigComponent } from './p-config.component';
import { Config001ProductDetailComponent } from './pages/config001-product-detail/config001-product-detail.component';
import { Config001ProductListComponent } from './pages/config001-product-list/config001-product-list.component';
import { Config002HamperRequestComponent } from './pages/config002-hamper-request/config002-hamper-request.component';
import { Config002HamperRequestDetailComponent } from './pages/config002-hamper-request-detail/config002-hamper-request-detail.component';
import { Config002HamperDetailComponent } from './pages/config002-hamper-detail/config002-hamper-detail.component';
import { Config002HamperDetailRequestComponent } from './pages/config002-hamper-detail-request/config002-hamper-detail-request.component';
import { Config003EnterpriseProductComponent } from './pages/config003-enterprise-product/config003-enterprise-product.component';
import { Config003EnterpriseProductDetailComponent } from './pages/config003-enterprise-product-detail/config003-enterprise-product-detail.component';
import { Config004EnterpriseRoleComponent } from './pages/config004-enterprise-role/config004-enterprise-role.component';
import { Config005EnterprisePermissionComponent } from './pages/config005-enterprise-permission/config005-enterprise-permission.component';
import { Config006EnterprisePartnerComponent } from './pages/config006-enterprise-partner/config006-enterprise-partner.component';
import { Config007CargoStatusComponent } from './pages/config007-cargo-status/config007-cargo-status.component';
import { Config008EnterprisePersonalInfoListComponent } from './pages/config008-enterprise-personal-info-list/config008-enterprise-personal-info-list.component';
import { Config008EnterprisePersonalInfoDetailComponent } from './pages/config008-enterprise-personal-info-detail/config008-enterprise-personal-info-detail.component';
const routes: Routes = [
  {
    path: "",
    component: PConfigComponent,
    children: [
      {
        path: '',
        component: PConfigComponent,
      },
      {
        path: "config001-product-list/:idCompany",
        component: Config001ProductListComponent,
      },
      {
        path: "config001-product-detail/:idCompany",
        component: Config001ProductDetailComponent,
      },
      {
        path: "config002-hamper-detail/:idCompany",
        component: Config002HamperDetailComponent,
      },
      {
        path: "config002-hamper-request/:idCompany",
        component: Config002HamperRequestComponent,
      },
      {
        path: "config002-hamper-request-detail/:idCompany",
        component: Config002HamperRequestDetailComponent,
      },
      {
        path: "config002-hamper-detail/:idCompany",
        component: Config002HamperDetailComponent,
      },
      {
        path: "config002-hamper-detail-request/:idCompany",
        component: Config002HamperDetailRequestComponent,
      },
      {
        path: "config003-enterprise-product/:idCompany",
        component: Config003EnterpriseProductComponent,
      },
      {
        path: "config003-enterprise-product-detail/:idCompany",
        component: Config003EnterpriseProductDetailComponent,
      },
      {
        path: "config004-enterprise-role/:idCompany",
        component: Config004EnterpriseRoleComponent,
      },
      {
        path: "config005-enterprise-permission/:idCompany",
        component: Config005EnterprisePermissionComponent,
      },
      {
        path: "config006-enterprise-partner/:idCompany",
        component: Config006EnterprisePartnerComponent,
      },
      {
        path: "config007-cargo-status/:idCompany",
        component: Config007CargoStatusComponent,
      },
      {
        path: "config008-enterprise-personal-info-list/:idCompany",
        component: Config008EnterprisePersonalInfoListComponent,
      },
      {
        path: "config008-enterprise-personal-info-detail/:idCompany",
        component: Config008EnterprisePersonalInfoDetailComponent,
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PConfigRoutingModule { }
