import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BaseCurrencyPage } from './base-currency.page';

const routes: Routes = [
  {
    path: '',
    component: BaseCurrencyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaseCurrencyPageRoutingModule {}
