import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

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
    this.loadingCtrl.create()
    this.loading.dismiss()
  }

  showLoading() {
    return new Promise((resolve, reject) => {
      this.translate.get('MESSAGE.LOADING').subscribe(async (loading: string) => {
        this.loading = await this.loadingCtrl.create({
          message: loading,
        })
        this.loading.present()
        resolve()
      })
    })
  }

  showLogout(saveAccountHandler, forgetAccountHandler) {
    this.translate.get(['RESET_TITLE', 'RESET_MESSAGE_CHOICE', 'SAVE', 'DELETE', 'BACK']).subscribe(async translations => {
      const alert = await this.alertCtrl.create({
        header: translations.RESET_TITLE,
        message: translations.RESET_MESSAGE_CHOICE,
        buttons: [
          {
            text: translations.SAVE,
            handler: saveAccountHandler
          },
          {
            text: translations.DELETE,
            handler: forgetAccountHandler
          },
          {
            text: translations.BACK
          }
        ]
      })
      alert.present();
    })
  }

  showLogoutNoAccount(onLogout) {
    this.translate.get(['RESET_TITLE', 'RESET_MESSAGE', 'CONFIRM', 'BACK']).subscribe(async translations => {
      const alert = await this.alertCtrl.create({
        header: translations.RESET_TITLE,
        message: translations.RESET_MESSAGE,
        buttons: [
          { text: translations.BACK },
          {
            text: translations.CONFIRM,
            handler: onLogout
          }
        ]
      })
      alert.present()
    })
  }

  showSendAll(action) {
    this.translate.get(['SEND_ALL_TITLE', 'SEND_ALL_MESSAGE', 'OK', 'CANCEL']).subscribe(async translations => {
      const alert = await this.alertCtrl.create({
        header: translations.SEND_ALL_TITLE,
        message: translations.SEND_ALL_MESSAGE,
        buttons: [
          {
            text: translations.CANCEL
          },
          {
            text: translations.OK,
            handler: action
          }
        ]
      })
      alert.present()
    })
  }

  showSent(message_key, hash) {
    this.translate.get(['MESSAGE.SUCCESS', 'OK', message_key]).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations['MESSAGE.SUCCESS'],
        subHeader: translations[message_key] + hash,
        buttons: [
          {
            text: translations['OK'],
          }
        ]
      })
      alert.present()
    })
  }

  askPassphrase(message_key, onSubmit) {
    this.translate.get(['PASSWORD', 'OK', 'CANCEL', message_key]).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations['PASSWORD'],
        subHeader: translations[message_key],
        backdropDismiss: false,
        inputs: [
          { name: 'passphrase', placeholder: translations['PASSWORD'], type: 'password' }
        ],
        buttons: [
          {
            text: translations['CANCEL'],
            role: 'cancel',
            handler: data => onSubmit()
          },
          {
            text: translations['OK'],
            handler: data => onSubmit(data.passphrase)
          }
        ]
      })
      alert.present()
    })
  }

  askInfo(title, message, placeholder, type, onSubmit) {
    this.translate.get(['OK', 'CANCEL', title, message, placeholder]).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations[title],
        message: translations[message],
        backdropDismiss: false,
        inputs: [
          { name: 'info', placeholder: translations[placeholder], type: type }
        ],
        buttons: [
          {
            text: translations['CANCEL'],
            role: 'cancel'
          },
          {
            text: translations['OK'],
            handler: data => onSubmit(data.info)
          }
        ]
      })
      alert.present()
    })
  }

  ask2Info(title, message, placeholder1, placeholder2, type1, type2, onSubmit) {
    this.translate.get(['OK', 'CANCEL', title, message, placeholder1, placeholder2]).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations[title],
        message: translations[message],
        backdropDismiss: false,
        inputs: [
          { name: 'info1', placeholder: translations[placeholder1], type: type1 },
          { name: 'info2', placeholder: translations[placeholder2], type: type2 }
        ],
        buttons: [
          {
            text: translations['CANCEL'],
            role: 'cancel'
          },
          {
            text: translations['OK'],
            handler: data => onSubmit(data)
          }
        ]
      })
      alert.present()
    })
  }

  showError(message_key, error) {
    this.translate.get(['MESSAGE.ERROR_TITLE', message_key, 'OK']).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations['MESSAGE.ERROR_TITLE'],
        subHeader: translations[message_key],
        message: error,
        buttons: [{
          text: translations['OK']
        }]
      });
      alert.present();
    })
  }

  showErrorTranslated(subtitle, message) {
    this.translate.get(['MESSAGE.ERROR_TITLE', subtitle, message, 'OK']).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations['MESSAGE.ERROR_TITLE'],
        subHeader: translations[subtitle],
        message: translations[message],
        buttons: [{
          text: translations['OK']
        }]
      });
      alert.present();
    })
  }

  showWrongAddress() {
    this.translate.get(['MESSAGE.NOT_ETP_ADDRESS_TITLE', 'MESSAGE.NOT_ETP_ADDRESS_TEXT', 'OK']).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations['MESSAGE.NOT_ETP_ADDRESS_TITLE'],
        message: translations['MESSAGE.NOT_ETP_ADDRESS_TEXT'],
        buttons: [{
          text: translations['OK']
        }]
      });
      alert.present();
    })
  }

  showMessage(title, subtitle, message) {
    this.translate.get([title, subtitle, message, 'OK']).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations[title],
        subHeader: translations[subtitle],
        message: translations[message],
        buttons: [{
          text: translations['OK']
        }]
      });
      alert.present();
    })
  }

  showLimitReached(title, message, limit) {
    this.translate.get([title, message, 'OK']).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations[title],
        message: translations[message] + limit,
        buttons: [{
          text: translations['OK']
        }]
      });
      alert.present();
    })
  }

  showCheckbox(title, message, checkbox, checked, onSubmit) {
    this.translate.get(['OK', title, message, checkbox]).subscribe(async (translations: any) => {
      let alert = await this.alertCtrl.create({
        header: translations[title],
        message: translations[message],
        backdropDismiss: false,
        inputs: [
          {
            name: 'checkbox',
            type: 'checkbox',
            label: translations[checkbox],
            value: 'checked',
            checked: checked,
          }
        ],
        buttons: [
          {
            text: translations['OK'],
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

}