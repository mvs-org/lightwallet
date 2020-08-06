import { Injectable } from '@angular/core'
import { ActionSheetController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class ActionSheetService {

  loading

  constructor(
    private actionSheetController: ActionSheetController,
    private translate: TranslateService,
  ) {
  }

  async default(header, cancel, buttonsInfo) {
    let choice
    const buttons = []

    buttonsInfo.forEach(async button => {
      buttons.push({
        text: await this.translate.get(button.text).toPromise(),
        icon: button.icon,
        cssClass: 'secondary',
        handler: () => {
          actionSheet.dismiss(button.action)
          return false
        }
      })
    })
    buttons.push({
      text: await this.translate.get(cancel || 'GLOBAL.CANCEL').toPromise(),
      icon: 'close',
      role: 'cancel',
      cssClass: 'danger',
      handler: () => {
        actionSheet.dismiss('cancel')
        return false
      }
    })
    const actionSheetInfo = {
      cssClass: 'my-custom-class',
      header: undefined,
      buttons,
    }

    if (header) {
      actionSheetInfo.header = await this.translate.get(header).toPromise()
    }

    const actionSheet = await this.actionSheetController.create(actionSheetInfo)

    await actionSheet.present()
    await actionSheet.onDidDismiss().then((data) => {
      choice = data.data
    })

    return choice
  }

}
