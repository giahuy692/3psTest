import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { PLayoutModule } from '../p-layout/p-layout.module';
import { PLogComponent } from './p-log.component';
import { Log001Hachi24hListComponent } from './pages/log001-hachi24h-list/log001-hachi24h-list.component';
import { PLogRoutingModule } from './p-log-routing.module';
import { Log002DomesticReceivingListComponent } from './pages/log002-domestic-receiving-list/log002-domestic-receiving-list.component';
import { Log002DomesticReceivingDetailComponent } from './pages/log002-domestic-receiving-detail/log002-domestic-receiving-detail.component';

@NgModule({
  declarations: [
    PLogComponent,
    Log001Hachi24hListComponent,
    Log002DomesticReceivingListComponent,
    Log002DomesticReceivingDetailComponent
  ],
  imports: [
    PLayoutModule,
    PLogRoutingModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
})
export class PLogModule { }
