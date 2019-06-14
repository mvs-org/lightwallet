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

  async alert(page, alert_name, title, text, buttons_text, input_placeholder) {
    const translations = await this.translate.get([
      title,
      text,
      input_placeholder,
      buttons_text[0],
      buttons_text[1],
      buttons_text[2],
    ].map(key => page + '.' + alert_name + '.' + key)).toPromise();
    
    let inputs = []
    if (input_placeholder) {
      inputs = [
        { name: 'info', placeholder: translations[page + '.' + alert_name + '.' + input_placeholder], type: 'text' }
      ]
    }

    let buttons = []
    buttons_text.forEach((text) => {
      let button = {
        text: translations[page + '.' + alert_name + '.' + text],
        handler: () => alert.dismiss(text)
      }
      buttons.push(button)
    })

    const alert = await this.alertCtrl.create({
      header: translations[page + '.' + alert_name + '.' + title],
      message: translations[page + '.' + alert_name + '.' + text],
      inputs: inputs,
      buttons: buttons
    });

    alert.present();
    return alert
  }

}
