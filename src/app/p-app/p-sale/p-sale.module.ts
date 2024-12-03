import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { PLayoutModule } from '../p-layout/p-layout.module';
import { PSaleRoutingModule } from './p-sale-routing.module';
import { PSaleComponent } from './p-sale.component';
import { Sale001PolicyListComponent } from './pages/sale001-policy-list/sale001-policy-list.component';
import { Sale001PolicyDetailComponent } from './pages/sale001-policy-detail/sale001-policy-detail.component';
import { Sale002GiftVoucherListComponent } from './pages/sale002-gift-voucher-list/sale002-gift-voucher-list.component';
import { Sale002GiftVoucherDetailComponent } from './pages/sale002-gift-voucher-detail/sale002-gift-voucher-detail.component';
import { Sale003ReportComponent } from './pages/sale003-report/sale003-report.component';

@NgModule({
  declarations: [
    PSaleComponent,
    Sale001PolicyListComponent,
    Sale001PolicyDetailComponent,
    Sale002GiftVoucherListComponent,
    Sale002GiftVoucherDetailComponent,
    Sale003ReportComponent
  ],
  imports: [
    PLayoutModule,
    PSaleRoutingModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
})
export class PSaleModule { }
