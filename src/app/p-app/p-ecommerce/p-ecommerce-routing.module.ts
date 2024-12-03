import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PEcommerceComponent } from './p-ecommerce.component';
import { Ecom001OnlineOrderComponent } from './pages/ecom001-online-order/ecom001-online-order.component';
import { Ecom001OnlineOrderDetailComponent } from './pages/ecom001-online-order-detail/ecom001-online-order-detail.component';
import { Ecom002OnlineMasterComponent } from './pages/ecom002-online-master/ecom002-online-master.component';
import { Ecom004ReportComponent } from './pages/ecom004-report/ecom004-report.component';
import { Ecom005DeadLinkComponent } from './pages/ecom005-dead-link/ecom005-dead-link.component';
import { Ecom003ChannelListComponent } from './pages/ecom003-channel-list/ecom003-channel-list.component';
import { Ecom006ProductOnsiteListComponent } from './pages/ecom006-product-onsite-list/ecom006-product-onsite-list.component';
import { Ecom007InportListComponent } from './pages/ecom007-inport-list/ecom007-inport-list.component';
import { Ecom007InportDetailComponent } from './pages/ecom007-inport-detail/ecom007-inport-detail.component';
import { Ecom008OutportListComponent } from './pages/ecom008-outport-list/ecom008-outport-list.component';
import { Ecom008OutportDetailComponent } from './pages/ecom008-outport-detail/ecom008-outport-detail.component';
import { Ecom009CartCustomerListComponent } from './pages/ecom009-cart-customer-list/ecom009-cart-customer-list.component';
import { Ecom010CartGenerateListComponent } from './pages/ecom010-cart-generate-list/ecom010-cart-generate-list.component';
import { Ecom009CartCustomerDetailComponent } from './pages/ecom009-cart-customer-detail/ecom009-cart-customer-detail.component';
import { Ecom010CartGenerateDetailComponent } from './pages/ecom010-cart-generate-detail/ecom010-cart-generate-detail.component';
import { Ecom013DashboardComponent } from './pages/ecom013-dashboard/ecom013-dashboard.component';
import { Ecom011ChannelGroupComponent } from './pages/ecom011-channel-group/ecom011-channel-group.component';
import { Ecom012ProductChannelComponent } from './pages/ecom012-product-channel/ecom012-product-channel.component';

const routes: Routes = [
  {
    path: "",
    component: PEcommerceComponent,
    children: [
      {
        path: '',
        component: PEcommerceComponent,
      },
      {
        path: "ecom001-online-order/:idCompany",
        component: Ecom001OnlineOrderComponent,
      },
      {
        path: "ecom001-online-order-detail/:idCompany",
        component: Ecom001OnlineOrderDetailComponent,
      },
      {
        path: "ecom002-online-master/:idCompany",
        component: Ecom002OnlineMasterComponent,
      },
      {
        path: "ecom004-report/:idCompany",
        component: Ecom004ReportComponent,
      },
      {
        path: "ecom005-dead-link/:idCompany",
        component: Ecom005DeadLinkComponent,
      },
      {
        path: "ecom003-channel-list/:idCompany",
        component: Ecom003ChannelListComponent,
      },
      {
        path: "ecom006-product-onsite-list/:idCompany",
        component: Ecom006ProductOnsiteListComponent,
      },
      {
        path: "ecom007-inport-list/:idCompany",
        component: Ecom007InportListComponent,
      },
      {
        path: "ecom007-inport-detail/:idCompany",
        component: Ecom007InportDetailComponent,
      },
      {
        path: "ecom008-outport-list/:idCompany",
        component: Ecom008OutportListComponent,
      },
      {
        path: "ecom008-outport-detail/:idCompany",
        component: Ecom008OutportDetailComponent,
      },
      {
        path: "ecom009-cart-customer-list/:idCompany",
        component: Ecom009CartCustomerListComponent,
      },
      {
        path: "ecom009-cart-customer-detail/:idCompany",
        component: Ecom009CartCustomerDetailComponent,
      },
      {
        path: "ecom010-cart-generate-list/:idCompany",
        component: Ecom010CartGenerateListComponent,
      },
      {
        path: "ecom010-cart-generate-detail/:idCompany",
        component: Ecom010CartGenerateDetailComponent,
      },
      {
        path: "ecom011-channel-group/:idCompany",
        component: Ecom011ChannelGroupComponent,
      },
      {
        path: "ecom012-product-channel/:idCompany",
        component: Ecom012ProductChannelComponent,
      },
      {
        path: "ecom013-dashboard/:idCompany",
        component: Ecom013DashboardComponent,
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PEcommerceRoutingModule { }
