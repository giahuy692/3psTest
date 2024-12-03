import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PLoginRoutingModule } from './p-login-routing.module';
import { Sys001LoginComponent } from './pages/sys001-login/sys001-login.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconsModule } from '@progress/kendo-angular-icons';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { ScrollViewModule } from '@progress/kendo-angular-scrollview';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';

@NgModule({
  declarations: [
    Sys001LoginComponent,
  ],
  imports: [
    CommonModule,
    PLoginRoutingModule,
    ReactiveFormsModule,
    IconsModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    IconsModule,
    ScrollViewModule,
    ButtonsModule,
    DialogsModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class PLoginModule { }
