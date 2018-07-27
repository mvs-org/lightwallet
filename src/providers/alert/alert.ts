import { Injectable } from '@angular/core';
import { AlertController, LoadingController, Loading } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/map';

@Injectable()
export class AlertProvider {

    loading: Loading

    constructor(
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private translate: TranslateService
    ) {
    }

    stopLoading() {
        this.loading.dismiss()
    }

    showLoading() {
        return new Promise((resolve, reject) => {
            this.translate.get('MESSAGE.LOADING').subscribe((loading: string) => {
                this.loading = this.loadingCtrl.create({
                    content: loading,
                    dismissOnPageChange: true
                })
                this.loading.present()
                resolve()
            })
        })
    }

    showLogout(onLogout) {
        this.translate.get(['RESET_TITLE', 'RESET_MESSAGE', 'CONFIRM', 'BACK']).subscribe(translations => {
            this.alertCtrl.create({
                title: translations.RESET_TITLE,
                message: translations.RESET_MESSAGE,
                buttons: [
                    { text: translations.BACK },
                    {
                        text: translations.CONFIRM,
                        handler: onLogout
                    }
                ]
            }).present()
        })
    }

    showSendAll(action) {
        this.translate.get(['SEND_ALL_TITLE', 'SEND_ALL_MESSAGE', 'OK', 'CANCEL']).subscribe(translations => {
            this.alertCtrl.create({
                title: translations.SEND_ALL_TITLE,
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
            }).present()
        })
    }

    showSent(message_key, hash) {
        this.translate.get(['MESSAGE.SUCCESS', 'OK', message_key]).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.SUCCESS'],
                subTitle: translations[message_key] + hash,
                buttons: [
                    {
                        text: translations['OK'],
                    }
                ]
            })
            alert.present(prompt)
        })
    }

    askPassphrase(message_key, onSubmit) {
        this.translate.get(['PASSPHRASE', 'OK', 'CANCEL', message_key]).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['PASSPHRASE'],
                subTitle: translations[message_key],
                enableBackdropDismiss: false,
                inputs: [
                    { name: 'passphrase', placeholder: 'Passphrase' }
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
            alert.present(prompt)
        })
    }

    showError(message_key, error) {
        this.translate.get(['MESSAGE.ERROR_TITLE', message_key, 'OK']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.ERROR_TITLE'],
                subTitle: translations[message_key],
                message: error,
                buttons: [{
                    text: translations['OK']
                }]
            });
            alert.present(alert);
        })
    }

    showErrorTranslated(subtitle, message) {
        this.translate.get(['MESSAGE.ERROR_TITLE', subtitle, message]).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.ERROR_TITLE'],
                subTitle: translations[subtitle],
                message: translations[message],
                buttons: [{
                    text: translations['OK']
                }]
            });
            alert.present(alert);
        })
    }

    showWrongAddress() {
        this.translate.get(['MESSAGE.NOT_ETP_ADDRESS_TITLE', 'MESSAGE.NOT_ETP_ADDRESS_TEXT', 'OK']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.NOT_ETP_ADDRESS_TITLE'],
                message: translations['MESSAGE.NOT_ETP_ADDRESS_TEXT'],
                buttons: [{
                    text: translations['OK']
                }]
            });
            alert.present(alert);
        })
    }

    showMessage(title, subtitle, message) {
        this.translate.get([title, subtitle, message, 'OK']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations[title],
                subTitle: translations[subtitle],
                message: translations[message],
                buttons: [{
                    text: translations['OK']
                }]
            });
            alert.present(alert);
        })
    }

    showTooManyRecipients(limit) {
        this.translate.get(['MESSAGE.SEND_MORE_IMPORT_CSV_TOO_MANY_RECIPIENT_TITLE', 'MESSAGE.SEND_MORE_IMPORT_CSV_TOO_MANY_RECIPIENT_BODY', 'OK']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.SEND_MORE_IMPORT_CSV_TOO_MANY_RECIPIENT_TITLE'],
                message: translations['MESSAGE.SEND_MORE_IMPORT_CSV_TOO_MANY_RECIPIENT_BODY'] + limit,
                buttons: [{
                    text: translations['OK']
                }]
            });
            alert.present(alert);
        })
    }


}
