import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PS_AuthGuardService } from './p-lib';
import { Sys001LoginComponent } from './p-app/p-login/pages/sys001-login/sys001-login.component';
import { AppModule } from './app.module';

const routes: Routes = [
  {
    path: '',
    canActivate: [PS_AuthGuardService],
    loadChildren: () => import('./p-app/p-layout/p-layout.module').then(m => m.PLayoutModule)
  },
  // {
  //   path: '',
  //   canActivate: [PS_AuthGuardService],
  //   loadChildren: () => import('./p-webmaket/p-webmaket.module').then(m=>m.PWebmaketModule)   
  // },
  {
    path: 'login',
    loadChildren: () => import('./p-app/p-login/p-login.module').then(m => m.PLoginModule)
  },
  {
    path: 'login',
    component: Sys001LoginComponent
  }
];

export const AppRoutingModule: ModuleWithProviders<AppModule> = RouterModule.forRoot(routes, { enableTracing: false });
// useHash: true, 