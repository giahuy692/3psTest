import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { PEcommerceRoutingModule } from './p-ecommerce-routing.module';
import { PEcommerceComponent } from './p-ecommerce.component';
import { Ecom001OnlineOrderComponent } from './pages/ecom001-online-order/ecom001-online-order.component';
import { PLayoutModule } from '../p-layout/p-layout.module';
import { Ecom001OnlineOrderDetailComponent } from './pages/ecom001-online-order-detail/ecom001-online-order-detail.component';
import { Ecom002OnlineMasterComponent } from './pages/ecom002-online-master/ecom002-online-master.component';
import { AssignWhpickupDialogComponent } from './shared/components/assign-whpickup-dialog/assign-whpickup-dialog.component';
import { AssignOnlineUserDialogComponent } from './shared/components/assign-online-user-dialog/assign-online-user-dialog.component';
import { Ecom004ReportComponent } from './pages/ecom004-report/ecom004-report.component';
import { Ecom005DeadLinkComponent } from './pages/ecom005-dead-link/ecom005-dead-link.component';
import { Ecom003ChannelListComponent } from './pages/ecom003-channel-list/ecom003-channel-list.component';
import { Ecom006ProductOnsiteListComponent } from './pages/ecom006-product-onsite-list/ecom006-product-onsite-list.component';
import { Ecom007InportDetailComponent } from './pages/ecom007-inport-detail/ecom007-inport-detail.component';
import { Ecom007InportListComponent } from './pages/ecom007-inport-list/ecom007-inport-list.component';
import { Ecom008OutportDetailComponent } from './pages/ecom008-outport-detail/ecom008-outport-detail.component';
import { Ecom008OutportListComponent } from './pages/ecom008-outport-list/ecom008-outport-list.component';
import { Ecom009CartCustomerListComponent } from './pages/ecom009-cart-customer-list/ecom009-cart-customer-list.component';
import { Ecom010CartGenerateListComponent } from './pages/ecom010-cart-generate-list/ecom010-cart-generate-list.component';
import { Ecom009CartCustomerDetailComponent } from './pages/ecom009-cart-customer-detail/ecom009-cart-customer-detail.component';
import { Ecom010CartDetailComponent, Ecom010CartDetailCouponComponent, Ecom010CartGenerateDetailComponent } from './pages/ecom010-cart-generate-detail/ecom010-cart-generate-detail.component';
import { Ecom012ProductChannelComponent } from './pages/ecom012-product-channel/ecom012-product-channel.component';
import { Ecom013DashboardComponent } from './pages/ecom013-dashboard/ecom013-dashboard.component';
import { SearchProductPopupComponent } from './shared/components/search-product-popup/search-product-popup.component';
import { AssignCartStaffDialogComponent } from './shared/components/assign-cart-staff-dialog/assign-cart-staff-dialog.component';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { Ecom011ChannelGroupComponent } from './pages/ecom011-channel-group/ecom011-channel-group.component';

@NgModule({
  declarations: [
    PEcommerceComponent,
    AssignWhpickupDialogComponent,
    AssignOnlineUserDialogComponent,
    AssignCartStaffDialogComponent,
    DashboardComponent,
    SearchProductPopupComponent,
    Ecom001OnlineOrderComponent,
    Ecom001OnlineOrderDetailComponent,
    Ecom002OnlineMasterComponent,
    Ecom003ChannelListComponent,
    Ecom004ReportComponent,
    Ecom005DeadLinkComponent,
    Ecom006ProductOnsiteListComponent,
    Ecom007InportListComponent,
    Ecom007InportDetailComponent,
    Ecom008OutportListComponent,
    Ecom008OutportDetailComponent,
    Ecom009CartCustomerListComponent,
    Ecom009CartCustomerDetailComponent,
    Ecom010CartGenerateListComponent,
    Ecom010CartGenerateDetailComponent,
    Ecom010CartDetailComponent,
    Ecom010CartDetailCouponComponent,
    Ecom011ChannelGroupComponent,
    Ecom012ProductChannelComponent,
    Ecom013DashboardComponent,
  ],
  imports: [
    PEcommerceRoutingModule,
    PLayoutModule,
  ],
  exports: [
    DashboardComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
})
export class PEcommerceModule { }
