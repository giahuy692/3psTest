import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PPurchaseComponent } from './p-purchase.component';
import { Pur001ReportComponent } from './pages/pur001-report/pur001-report.component';
import { Pur001ReportImportComponent } from './pages/pur001-report-import/pur001-report-import.component';
import { Pur002BrandListComponent } from './pages/pur002-brand-list/pur002-brand-list.component';
import { Pur002BrandDetailComponent } from './pages/pur002-brand-detail/pur002-brand-detail.component';
import { Pur003PODomesticComponent } from './pages/pur003-po-domestic/pur003-po-domestic.component';
import { Pur003PODomesticDetailComponent } from './pages/pur003-po-domestic-detail/pur003-po-domestic-detail.component';
import { Pur004POSupplierComponent } from './pages/pur004-po-supplier/pur004-po-supplier.component';
import { Pur005SupplierDetailComponent } from './pages/pur005-supplier-detail/pur005-supplier-detail.component';
import { Pur006PartnerContactComponent } from './pages/pur006-partner-contact/pur006-partner-contact.component';
import { Pur007PartnerProductComponent } from './pages/pur007-partner-product/pur007-partner-product.component';
import { Pur005SupplierListComponent } from './pages/pur005-supplier-list/pur005-supplier-list.component';
import { Pur008PriceRequestListComponent } from './pages/pur008-price-request-list/pur008-price-request-list.component';
import { Pur008PriceRequestDetailComponent } from './pages/pur008-price-request-detail/pur008-price-request-detail.component';
import { Pur009PartnerTemplateEmailComponent } from './pages/pur009-partner-template-email/pur009-partner-template-email.component';
import { Pur008PriceProductDetailComponent } from './pages/pur008-price-product-detail/pur008-price-product-detail.component';
const routes: Routes = [
  {
    path: "",
    component: PPurchaseComponent,
    children: [
      {
        path: '',
        component: PPurchaseComponent,
      },
      {
        path: "pur001-report/:idCompany",
        component: Pur001ReportComponent,
      },
      {
        path: "pur001-report-import/:idCompany",
        component: Pur001ReportImportComponent,
      },
      {
        path: "pur002-brand-list/:idCompany",
        component: Pur002BrandListComponent,
      },
      {
        path: "pur002-brand-detail/:idCompany",
        component: Pur002BrandDetailComponent,
      },
      {
        path: "pur003-po-domestic/:idCompany",
        component: Pur003PODomesticComponent,
      },
      {
        path: "pur003-po-domestic-detail/:idCompany",
        component: Pur003PODomesticDetailComponent,
      },
      {
        path: "pur004-po-supplier/:idCompany",
        component: Pur004POSupplierComponent,
      },
      {
        path: "pur005-supplier-list/:idCompany",
        component: Pur005SupplierListComponent,
      },
      {
        path: "pur005-supplier-detail/:idCompany",
        component: Pur005SupplierDetailComponent,
      },
      {
        path: "pur006-partner-contact/:idCompany",
        component: Pur006PartnerContactComponent,
      },
      {
        path: "pur007-partner-product/:idCompany",
        component: Pur007PartnerProductComponent,
      },
      {
        path: "pur008-price-request-list/:idCompany",
        component: Pur008PriceRequestListComponent,
      },
      {
        path: "pur008-price-request-detail/:idCompany",
        component: Pur008PriceRequestDetailComponent,
      },
      {
        path: "pur008-price-product-detail/:idCompany",
        component: Pur008PriceProductDetailComponent,
      },
      {
        path: "pur009-partner-template-email/:idCompany",
        component: Pur009PartnerTemplateEmailComponent,
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PPurchaseRoutingModule { }
