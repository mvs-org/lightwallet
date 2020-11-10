import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExportXpubPage } from './export-xpub.page';

const routes: Routes = [
  {
    path: '',
    component: ExportXpubPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportXpubPageRoutingModule {}
