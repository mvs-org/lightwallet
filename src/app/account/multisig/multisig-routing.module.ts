import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultisigPage } from './multisig.page';

const routes: Routes = [
  {
    path: '',
    component: MultisigPage
  },
  {
    path: 'add',
    loadChildren: () => import('./add/add.module').then( m => m.AddPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultisigPageRoutingModule {}
