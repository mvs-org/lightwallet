import { Injectable } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { LoadingController } from '@ionic/angular'
import { ToastController } from '@ionic/angular'
import { ConfigService } from 'src/app/services/config.service'

@Injectable({
  providedIn: 'root',
})
export class AlertService {

  constructor(
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private config: ConfigService,
  ) { }

  async alert(page, alertName, title, text, buttonsText) {
    const translations = await this.translate.get([
      title,
      text,
      'BUTTON.' + buttonsText[0],
      'BUTTON.' + buttonsText[1],
      'BUTTON.' + buttonsText[2],
    ].map(key => page + '.' + alertName + '.' + key)).toPromise()

    // If no translation available, display the text itself (i.e. error message)
    if (translations[page + '.' + alertName + '.' + text] === page + '.' + alertName + '.' + text) {
      translations[page + '.' + alertName + '.' + text] = text
    }

    const buttons = []
    buttonsText.forEach((buttonText) => {
      const button = {
        text: translations[page + '.' + alertName + '.BUTTON.' + buttonText],
        handler: () => alert.dismiss(text),
      }
      buttons.push(button)
    })

    const alert = await this.alertCtrl.create({
      header: translations[page + '.' + alertName + '.' + title],
      message: translations[page + '.' + alertName + '.' + text],
      buttons,
    })

    alert.present()
    return alert
  }

  async alertInput(page, alertName, title, text) {
    const translations = await this.translate.get([
      title,
      text,
      'INPUT.PLACEHOLDER',
      'BUTTON.BACK',
      'BUTTON.OK',
    ].map(key => page + '.' + alertName + '.' + key)).toPromise()

    const inputs = [
      { name: 'input', placeholder: translations[page + '.' + alertName + '.INPUT.PLACEHOLDER'], type: text },
    ]

    const alert = await this.alertCtrl.create({
      header: translations[page + '.' + alertName + '.' + title],
      message: translations[page + '.' + alertName + '.' + text],
      inputs,
      buttons: [
        {
          text: translations[page + '.' + alertName + '.BUTTON.BACK'],
          handler: () => alert.dismiss(false),
        },
        {
          text: translations[page + '.' + alertName + '.BUTTON.OK'],
          handler: (data) => alert.dismiss(data.input),
        },
      ],
    })

    alert.present()
    return alert
  }

  async loading(text) {
    return await this.loadingCtrl.create({
      animated: true,
      spinner: 'crescent',
      message: await this.translate.get(text).toPromise(),
    })
  }

  async toast(message: string, duration: number = this.config.shortToastDuration, position: 'bottom' | 'middle' | 'top' = 'top',
              color: string = 'primary') {
    (await this.toastCtrl.create({
      message: await this.translate.get(message).toPromise(),
      duration,
      position,
      color,
    })).present()
  }

}
