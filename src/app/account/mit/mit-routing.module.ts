import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { MitPage } from './mit.page'

const routes: Routes = [
  {
    path: '',
    component: MitPage
  },
  {
    path: 'create',
    loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
  },
  {
    path: ':symbol',
    loadChildren: () => import('./details/details.module').then( m => m.DetailsPageModule)
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MitPageRoutingModule {}
