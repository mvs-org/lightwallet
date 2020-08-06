import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActionSheetComponent } from './action-sheet.component'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [ActionSheetComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forChild(),
  ],
  exports: [ActionSheetComponent]
})
export class ActionSheetModule { }
