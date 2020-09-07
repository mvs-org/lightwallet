import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExportMobilePage } from './export-mobile.page';

const routes: Routes = [
  {
    path: '',
    component: ExportMobilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportMobilePageRoutingModule {}
