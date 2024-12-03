import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { PLayoutModule } from '../p-layout/p-layout.module';
import { PDeveloperRoutingModule } from './p-developer-routing.module';
import { PDeveloperComponent } from './p-developer.component';
import { Dev001CompanyListComponent } from './pages/dev001-company-list/dev001-company-list.component';
import { Dev002SystemListComponent } from './pages/dev002-system-list/dev002-system-list.component';
import { Dev003ApiListComponent } from './pages/dev003-api-list/dev003-api-list.component';


@NgModule({
  declarations: [
    PDeveloperComponent,
    Dev001CompanyListComponent,
    Dev002SystemListComponent,
    Dev003ApiListComponent
  ],
  imports: [    
    PDeveloperRoutingModule,
    PLayoutModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  exports: [
    PDeveloperComponent
  ]
})
export class PDevelopModule { }
