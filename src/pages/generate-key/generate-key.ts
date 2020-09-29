import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-generate-key',
    templateUrl: 'generate-key.html',
})

export class GenerateKeyPage {
    loading: Loading;
    addresses: string[]
    data: any;
    wallet: any;
    encrypted_json: object;

    constructor(
        private nav: NavController,
        public walletService: WalletServiceProvider,
        public navParams: NavParams,
        private alertCtrl: AlertController,
        private translate: TranslateService,
        private alert: AlertProvider,
    ) {
        this.CreateWallet()
    }

    // need to get hex
    CreateWallet() {
        this.alert.showLoading()
        return this.walletService.createWallet()
            .then((wallet) => {
                this.wallet = wallet
                this.wallet.newWallet = true
            });
    }

    download() {
        this.translate.get("WARNING").subscribe(title => {
            this.translate.get('BACKUP_WORDS_BACKED_UP_TEXT').subscribe(text => {
                this.translate.get('BACKUP_WORDS_BACKED_UP_YES').subscribe(BACKUP_WORDS_BACKED_UP_YES => {
                    this.translate.get('NO').subscribe(NO => {
                        let alert = this.alertCtrl.create({
                            title: title,
                            subTitle: text,
                            buttons: [
                                {
                                    text: BACKUP_WORDS_BACKED_UP_YES,
                                    handler: data => {
                                        this.nav.push("PassphrasePage", this.wallet)
                                    }
                                }, {
                                    text: NO
                                }
                            ]
                        });
                        alert.present();
                    })
                })
            })
        })
    }

}
