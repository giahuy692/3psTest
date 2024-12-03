import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { PLayoutModule } from '../p-layout/p-layout.module';
import { Pur001ReportComponent } from './pages/pur001-report/pur001-report.component';
import { PPurchaseComponent } from './p-purchase.component';
import { PPurchaseRoutingModule } from './p-purchase-routing.module';
import { Pur001ReportImportComponent } from './pages/pur001-report-import/pur001-report-import.component';
import { Pur002BrandListComponent } from './pages/pur002-brand-list/pur002-brand-list.component';
import { Pur002BrandDetailComponent } from './pages/pur002-brand-detail/pur002-brand-detail.component';
import { Pur003PODomesticComponent } from './pages/pur003-po-domestic/pur003-po-domestic.component';
import { Pur003PODomesticDetailComponent } from './pages/pur003-po-domestic-detail/pur003-po-domestic-detail.component';
import { Pur004POSupplierComponent } from './pages/pur004-po-supplier/pur004-po-supplier.component';
import { Pur005SupplierDetailComponent } from './pages/pur005-supplier-detail/pur005-supplier-detail.component';
import { Pur005SupplierListComponent } from './pages/pur005-supplier-list/pur005-supplier-list.component';
import { Pur006PartnerContactComponent } from './pages/pur006-partner-contact/pur006-partner-contact.component';
import { Pur007PartnerProductComponent } from './pages/pur007-partner-product/pur007-partner-product.component';
import { PurMenuSupplierInfoComponent } from './shared/components/pur-menu-supplier-info/pur-menu-supplier-info.component';
import { Pur008PriceRequestListComponent } from './pages/pur008-price-request-list/pur008-price-request-list.component';
import { Pur008PriceRequestDetailComponent } from './pages/pur008-price-request-detail/pur008-price-request-detail.component';
import { Pur008PriceProductDetailComponent } from './pages/pur008-price-product-detail/pur008-price-product-detail.component';
import { Pur009PartnerTemplateEmailComponent } from './pages/pur009-partner-template-email/pur009-partner-template-email.component';

@NgModule({
  declarations: [
    PPurchaseComponent,
    Pur001ReportComponent,
    Pur001ReportImportComponent,
    Pur002BrandListComponent,
    Pur002BrandDetailComponent,
    Pur003PODomesticComponent,
    Pur003PODomesticDetailComponent,
    Pur004POSupplierComponent,
    Pur005SupplierDetailComponent,
    Pur005SupplierListComponent,
    Pur006PartnerContactComponent,
    Pur007PartnerProductComponent,
    PurMenuSupplierInfoComponent,
    Pur008PriceRequestListComponent,
    Pur008PriceRequestDetailComponent,
    Pur008PriceProductDetailComponent,
    Pur009PartnerTemplateEmailComponent,
  ],
  imports: [
    PLayoutModule,
    PPurchaseRoutingModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  exports: []
})
export class PPurchaseModule { }
