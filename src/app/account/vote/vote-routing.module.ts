import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { VotePage } from './vote.page'

const routes: Routes = [
  {
    path: ':symbol',
    component: VotePage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VotePageRoutingModule {}
