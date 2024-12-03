import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutDefaultComponent } from './layout-default/layout-default.component';
import { LayoutPortalComponent } from './layout-portal/layout-portal.component';
import { ModuleDataAdmin } from './p-sitemaps/menu.data-admin';
import { PS_LayOutHelper } from './services/p-layout.helper';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'hri/1',
    pathMatch: 'full',
  },
  {
    path: 'portal',
    component: LayoutPortalComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../../p-app/p-portal/p-portal.module').then(m => m.PPortalModule),
      }
    ]
  },
  {
    path: '',
    component: LayoutDefaultComponent,
    children: PS_LayOutHelper.GetRoutes(ModuleDataAdmin)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PLayoutRoutingModule { }