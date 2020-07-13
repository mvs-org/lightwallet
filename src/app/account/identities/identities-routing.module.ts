import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { IdentitiesPage } from './identities.page'

const routes: Routes = [
  {
    path: ':symbol',
    component: IdentitiesPage
  },
  {
    path: 'create',
    loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IdentitiesPageRoutingModule {}
