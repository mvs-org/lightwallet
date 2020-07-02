import { Injectable } from '@angular/core'
import { AlertController, LoadingController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  loading: HTMLIonLoadingElement

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
  ) {
  }

  stopLoading() {
    // this.loadingCtrl.create()
    if (this.loading){
    this.loading.dismiss()
    }
  }

  async showLoading() {
    this.loading = await this.loadingCtrl.create({
      message: await this.translate.get('MESSAGE.LOADING').toPromise(),
    })
    await this.loading.present()
    return this.loading
  }

  askPassphrase(messageKey, onSubmit) {
    this.translate.get(['PASSWORD', 'OK', 'CANCEL', messageKey]).subscribe(async (translations: any) => {
      const alert = await this.alertCtrl.create({
        header: translations.PASSWORD,
        subHeader: translations[messageKey],
        backdropDismiss: false,
        inputs: [
          { name: 'passphrase', placeholder: translations.PASSWORD, type: 'password' }
        ],
        buttons: [
          {
            text: translations.CANCEL,
            role: 'cancel',
            handler: data => onSubmit()
          },
          {
            text: translations.OK,
            handler: data => onSubmit(data.passphrase)
          }
        ]
      })
      alert.present()
    })
  }

  askInfo(title, message, placeholder, type, onSubmit) {
    this.translate.get(['OK', 'CANCEL', title, message, placeholder]).subscribe(async (translations: any) => {
      const alert = await this.alertCtrl.create({
        header: translations[title],
        message: translations[message],
        backdropDismiss: false,
        inputs: [
          { name: 'info', placeholder: translations[placeholder], type }
        ],
        buttons: [
          {
            text: translations.CANCEL,
            role: 'cancel'
          },
          {
            text: translations.OK,
            handler: data => onSubmit(data.info)
          }
        ]
      })
      alert.present()
    })
  }

  ask2Info(title, message, placeholder1, placeholder2, type1, type2, onSubmit) {
    this.translate.get(['OK', 'CANCEL', title, message, placeholder1, placeholder2]).subscribe(async (translations: any) => {
      const alert = await this.alertCtrl.create({
        header: translations[title],
        message: translations[message],
        backdropDismiss: false,
        inputs: [
          { name: 'info1', placeholder: translations[placeholder1], type: type1 },
          { name: 'info2', placeholder: translations[placeholder2], type: type2 }
        ],
        buttons: [
          {
            text: translations.CANCEL,
            role: 'cancel'
          },
          {
            text: translations.OK,
            handler: data => onSubmit(data)
          }
        ]
      })
      alert.present()
    })
  }

  showError(messageKey, error) {
    this.translate.get(['MESSAGE.ERROR_TITLE', messageKey, 'OK']).subscribe(async (translations: any) => {
      const alert = await this.alertCtrl.create({
        header: translations['MESSAGE.ERROR_TITLE'],
        subHeader: translations[messageKey],
        message: error,
        buttons: [{
          text: translations.OK
        }]
      })
      alert.present()
    })
  }

  showErrorTranslated(subtitle, message) {
    this.translate.get(['MESSAGE.ERROR_TITLE', subtitle, message, 'OK']).subscribe(async (translations: any) => {
      const alert = await this.alertCtrl.create({
        header: translations['MESSAGE.ERROR_TITLE'],
        subHeader: translations[subtitle],
        message: translations[message],
        buttons: [{
          text: translations.OK
        }]
      })
      alert.present()
    })
  }

  showWrongAddress() {
    this.translate.get(['MESSAGE.NOT_ETP_ADDRESS_TITLE', 'MESSAGE.NOT_ETP_ADDRESS_TEXT', 'OK']).subscribe(async (translations: any) => {
      const alert = await this.alertCtrl.create({
        header: translations['MESSAGE.NOT_ETP_ADDRESS_TITLE'],
        message: translations['MESSAGE.NOT_ETP_ADDRESS_TEXT'],
        buttons: [{
          text: translations.OK
        }]
      })
      alert.present()
    })
  }

  showMessage(title, subtitle, message, ok?) {
    this.translate.get([title, subtitle, message, ok || 'OK']).subscribe(async (translations: any) => {
      const alert = await this.alertCtrl.create({
        header: translations[title],
        subHeader: translations[subtitle] || subtitle,
        message: translations[message] || message,
        buttons: [{
          text: translations[ok]
        }]
      })
      alert.present()
    })
  }

  showLimitReached(title, message, limit) {
    this.translate.get([title, message, 'OK']).subscribe(async (translations: any) => {
      const alert = await this.alertCtrl.create({
        header: translations[title],
        message: translations[message] + limit,
        buttons: [{
          text: translations.OK
        }]
      })
      alert.present()
    })
  }

  showCheckbox(title, message, checkbox, checked, onSubmit) {
    this.translate.get(['OK', title, message, checkbox]).subscribe(async (translations: any) => {
      const alert = await this.alertCtrl.create({
        header: translations[title],
        message: translations[message],
        backdropDismiss: false,
        inputs: [
          {
            name: 'checkbox',
            type: 'checkbox',
            label: translations[checkbox],
            value: 'checked',
            checked,
          }
        ],
        buttons: [
          {
            text: translations.OK,
            handler: data => onSubmit(data && data.length > 0)
          },
        ]
      })
      alert.present()
    })
  }

  confirm(action, title, subtitle, message, confirm, back) {
    this.translate.get([title, subtitle, message, confirm, back]).subscribe(async translations => {
      const alert = await this.alertCtrl.create({
        header: translations[title],
        subHeader: translations[subtitle],
        message: translations[message],
        buttons: [
          { text: translations[back] },
          {
            text: translations[confirm],
            handler: action
          }
        ]
      })
      alert.present()
    })
  }

  async alertConfirm(title, message, cancel, ok) {
    let choice
    const translations = await this.translate.get([title, message, cancel, ok]).toPromise()
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: translations[title],
      message: translations[message],
      buttons: [
        {
          text: translations[cancel],
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            alert.dismiss(false)
            return false
          }
        }, {
          text: translations[ok],
          handler: () => {
            alert.dismiss(true)
            return false
          }
        }
      ]
    })

    await alert.present()
    await alert.onDidDismiss().then((data) => {
      choice = data.data === true
    })
    return choice
  }

  async alertTripleChoice(title, message, cancel, option1, option2) {
    let choice
    const translations = await this.translate.get([title, message, cancel, option1, option2]).toPromise()
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: translations[title],
      message: translations[message],
      buttons: [
        {
          text: translations[cancel],
          cssClass: 'secondary',
          handler: () => {
            alert.dismiss('cancel')
            return false
          }
        }, {
          text: translations[option1],
          handler: () => {
            alert.dismiss('option1')
            return false
          }
        }, {
          text: translations[option2],
          handler: () => {
            alert.dismiss('option2')
            return false
          }
        }
      ]
    })

    await alert.present()
    await alert.onDidDismiss().then((data) => {
      choice = data.data
    })
    return choice
  }

}
