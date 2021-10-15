import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { PortfolioPageRoutingModule } from './portfolio-routing.module'

import { PortfolioPage } from './portfolio.page'
import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from 'src/app/pipes/pipes.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule.forChild(),
    PortfolioPageRoutingModule,
  ],
  declarations: [
    PortfolioPage,
  ]
})
export class PortfolioPageModule {}
