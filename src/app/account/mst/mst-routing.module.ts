import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MstPage } from './mst.page';

const routes: Routes = [
  {
    path: '',
    component: MstPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MstPageRoutingModule {}
