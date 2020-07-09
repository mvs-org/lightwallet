import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenFilePage } from './open-file.page';

const routes: Routes = [
  {
    path: '',
    component: OpenFilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenFilePageRoutingModule {}
