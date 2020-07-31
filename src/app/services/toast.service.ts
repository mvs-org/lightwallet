import { Injectable } from '@angular/core'
import { ToastController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    public toastController: ToastController,
    private translate: TranslateService,
  ) {
  }

  async simpleToast(message, duration = 2000) {
    const translations = await this.translate.get([message]).toPromise()
    const toast = await this.toastController.create({
      message: translations[message],
      duration,
    })
    toast.present()
  }

}
