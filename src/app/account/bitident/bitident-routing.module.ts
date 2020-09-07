import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BitidentPage } from './bitident.page';

const routes: Routes = [
  {
    path: '',
    component: BitidentPage
  },
  {
    path: 'confirm',
    loadChildren: () => import('./confirm/confirm.module').then( m => m.ConfirmPageModule)
  },
  {
    path: 'howto',
    loadChildren: () => import('./howto/howto.module').then( m => m.HowtoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BitidentPageRoutingModule {}
