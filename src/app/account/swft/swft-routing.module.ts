import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SwftPage } from './swft.page';

const routes: Routes = [
  {
    path: '',
    component: SwftPage
  },
  {
    path: 'order',
    loadChildren: () => import('./order-detail/order-detail.module').then( m => m.OrderDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwftPageRoutingModule {}
