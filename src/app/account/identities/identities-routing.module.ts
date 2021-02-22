import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { IdentitiesPage } from './identities.page'

const routes: Routes = [
  {
    path: '',
    component: IdentitiesPage
  },
  {
    path: 'create/:address',
    loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
  },
  {
    path: 'generate-address',
    loadChildren: () => import('./generate-address/generate-address.module').then( m => m.GenerateAddressPageModule)
  },
  {
    path: 'generate-vm-address',
    loadChildren: () => import('./generate-vm-address/generate-vm-address.module').then( m => m.GenerateVmAddressPageModule)
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IdentitiesPageRoutingModule {}
