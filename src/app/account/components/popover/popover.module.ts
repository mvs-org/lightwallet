import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PopoverComponent } from './popover.component'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [PopoverComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forChild(),
  ],
  exports: [PopoverComponent]
})
export class PopoverModule { }
