import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BurnPage } from './burn.page';

const routes: Routes = [
  {
    path: '',
    component: BurnPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BurnPageRoutingModule {}
