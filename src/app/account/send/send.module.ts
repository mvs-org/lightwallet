import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { MatTabsModule } from '@angular/material/tabs'

import { IonicModule } from '@ionic/angular'

import { SendPage } from './send.page'
import { SendSingleComponent } from './send-single/send-single.component'
import { SendManyComponent } from './send-many/send-many.component'
import { TranslateModule } from '@ngx-translate/core'

const routes: Routes = [
  {
    path: '',
    component: SendPage,
    children: [
      {
        path: 'single',
        component: SendSingleComponent,
      },
      {
        path: 'many',
        component: SendManyComponent,
      },
    ],
  },
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MatTabsModule,
    TranslateModule,
  ],
  declarations: [
    SendPage,
    SendSingleComponent,
    SendManyComponent,
  ],
})
export class SendPageModule {}
