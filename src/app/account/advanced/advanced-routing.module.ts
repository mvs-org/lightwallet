import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AdvancedPage } from './advanced.page'

const routes: Routes = [
  {
    path: '',
    component: AdvancedPage
  },
  {
    path: 'multisig',
    loadChildren: () => import('./multisig/multisig.module').then(m => m.MultisigPageModule)
  },
  {
    path: 'certificates',
    loadChildren: () => import('./certificates/certificates.module').then(m => m.CertificatesPageModule)
  },
  {
    path: 'burn',
    loadChildren: () => import('./burn/burn.module').then( m => m.BurnPageModule)
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdvancedPageRoutingModule { }
