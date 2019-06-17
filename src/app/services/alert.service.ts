import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private alertCtrl: AlertController,
    private translate: TranslateService,
  ) { }

  async alert(page, alert_name, title, text, buttons_text) {
    const translations = await this.translate.get([
      title,
      text,
      'BUTTON.' + buttons_text[0],
      'BUTTON.' + buttons_text[1],
      'BUTTON.' + buttons_text[2],
    ].map(key => page + '.' + alert_name + '.' + key)).toPromise();

    let buttons = []
    buttons_text.forEach((text) => {
      let button = {
        text: translations[page + '.' + alert_name + '.BUTTON.' + text],
        handler: () => alert.dismiss(text)
      }
      buttons.push(button)
    })

    const alert = await this.alertCtrl.create({
      header: translations[page + '.' + alert_name + '.' + title],
      message: translations[page + '.' + alert_name + '.' + text],
      buttons: buttons
    });

    alert.present()
    return alert
  }

  async alertInput(page, alert_name, title, text) {
    const translations = await this.translate.get([
      title,
      text,
      'INPUT.PLACEHOLDER',
      'BUTTON.BACK',
      'BUTTON.OK',
    ].map(key => page + '.' + alert_name + '.' + key)).toPromise();

    let inputs = [
      { name: 'input', placeholder: translations[page + '.' + alert_name + '.INPUT.PLACEHOLDER'], type: text }
    ]

    const alert = await this.alertCtrl.create({
      header: translations[page + '.' + alert_name + '.' + title],
      message: translations[page + '.' + alert_name + '.' + text],
      inputs: inputs,
      buttons: [
        {
          text: translations[page + '.' + alert_name + '.BUTTON.BACK'],
          handler: () => alert.dismiss(false)
        },
        {
          text: translations[page + '.' + alert_name + '.BUTTON.OK'],
          handler: (data) => alert.dismiss(data.input)
        }
      ]
    });

    alert.present()
    return alert
  }

}
