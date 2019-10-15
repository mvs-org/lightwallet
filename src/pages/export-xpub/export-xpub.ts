import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-export-xpub',
    templateUrl: 'export-xpub.html',
})
export class ExportXpubPage {

    xpub: string

    constructor(
        private wallet: WalletServiceProvider,
        private alert: AlertProvider,
    ) {
    }

    async export(passphrase: string) {
        try {
            this.xpub = await this.wallet.getMasterPublicKey(passphrase)
        } catch (error) {
            switch (error.message) {
                case 'ERR_DECRYPT_WALLET_FROM_SEED':
                    return this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                default:
                    console.error(error)
                    return this.alert.showError('Unknown Error', error.message)
            }
        }
    }

    validPassword = (passphrase) => (passphrase && passphrase.length > 0)

}
