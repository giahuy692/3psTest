import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Sys001LoginComponent } from './pages/sys001-login/sys001-login.component';


const routes: Routes = [
  {
    path: '',
    component: Sys001LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PLoginRoutingModule { }
