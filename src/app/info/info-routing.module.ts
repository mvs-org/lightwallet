import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoPage } from './info.page';

const routes: Routes = [
  {
    path: '',
    component: InfoPage
  },
  {
    path: 'license',
    loadChildren: () => import('./license/license.module').then( m => m.LicensePageModule)
  },
  {
    path: 'legal',
    loadChildren: () => import('./legal/legal.module').then( m => m.LegalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoPageRoutingModule {}
