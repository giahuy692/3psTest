import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { PLayoutModule } from '../p-layout/p-layout.module';
import { PConfigComponent } from './p-config.component';
import { Config001ProductListComponent } from './pages/config001-product-list/config001-product-list.component';
import { Config001ProductDetailComponent } from './pages/config001-product-detail/config001-product-detail.component';
import { Config002HamperRequestComponent } from './pages/config002-hamper-request/config002-hamper-request.component';
import { PConfigRoutingModule } from './p-config-routing.module';
import { Config002HamperRequestDetailComponent } from './pages/config002-hamper-request-detail/config002-hamper-request-detail.component';
import { Config002HamperDetailComponent } from './pages/config002-hamper-detail/config002-hamper-detail.component';
import { ConfigProductInfoComponent } from './shared/components/config-product-info/config-product-info.component';
import { ConfigProductAttributeComponent } from './shared/components/config-product-attribute/config-product-attribute.component';
import { ConfigProductPackageInfoComponent } from './shared/components/config-product-package-info/config-product-package-info.component';
import { ConfigProductOtherInfoComponent } from './shared/components/config-product-other-info/config-product-other-info.component';
import { ConfigProductListComponent } from './shared/components/config-product-list/config-product-list.component';
import { ConfigAppliedCompanyComponent } from './shared/components/config-applied-company/config-applied-company.component';
import { ConfigPurchaseAttributeComponent } from './shared/components/config-purchase-attribute/config-purchase-attribute.component';
import { ConfigSalesAttributeComponent } from './shared/components/config-sales-attribute/config-sales-attribute.component';
import { ConfigProductLabelComponent } from './shared/components/config-product-label/config-product-label.component';
import { ConfigWebDisplayComponent } from './shared/components/config-web-display/config-web-display.component';
import { ConfigHistoryPopupComponent } from './shared/components/config-history-popup/config-history-popup.component';
import { Config002HamperDetailRequestComponent } from './pages/config002-hamper-detail-request/config002-hamper-detail-request.component';
import { Config003EnterpriseProductComponent } from './pages/config003-enterprise-product/config003-enterprise-product.component';
import { Config003EnterpriseProductDetailComponent } from './pages/config003-enterprise-product-detail/config003-enterprise-product-detail.component';
import { Config005EnterprisePermissionComponent } from './pages/config005-enterprise-permission/config005-enterprise-permission.component';
import { Config004EnterpriseRoleComponent } from './pages/config004-enterprise-role/config004-enterprise-role.component';
import { Config006EnterprisePartnerComponent } from './pages/config006-enterprise-partner/config006-enterprise-partner.component';
import { Config007CargoStatusComponent } from './pages/config007-cargo-status/config007-cargo-status.component';
import { Config008EnterprisePersonalInfoListComponent } from './pages/config008-enterprise-personal-info-list/config008-enterprise-personal-info-list.component';
import { Config008EnterprisePersonalInfoDetailComponent } from './pages/config008-enterprise-personal-info-detail/config008-enterprise-personal-info-detail.component';

@NgModule({
  declarations: [
    PConfigComponent,
    Config001ProductListComponent,
    Config001ProductDetailComponent,
    Config002HamperRequestComponent,
    Config002HamperRequestDetailComponent,
    Config002HamperDetailComponent,
    ConfigProductInfoComponent,
    ConfigProductAttributeComponent,
    ConfigProductPackageInfoComponent,
    ConfigProductOtherInfoComponent,
    ConfigProductListComponent,
    ConfigAppliedCompanyComponent,
    ConfigPurchaseAttributeComponent,
    ConfigSalesAttributeComponent,
    ConfigProductLabelComponent,
    ConfigWebDisplayComponent,
    ConfigHistoryPopupComponent,
    Config002HamperDetailRequestComponent,
    Config003EnterpriseProductComponent,
    Config003EnterpriseProductDetailComponent,
    Config004EnterpriseRoleComponent,
    Config005EnterprisePermissionComponent,
    Config006EnterprisePartnerComponent,
    Config007CargoStatusComponent,
    Config008EnterprisePersonalInfoListComponent,
    Config008EnterprisePersonalInfoDetailComponent
  ],
  imports: [
    PConfigRoutingModule,
    PLayoutModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
})
export class PConfigModule { }
