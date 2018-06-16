import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

class AddressBalance{
    constructor(
        public address: string,
        public available: number
    ) {}
}
@IonicPage()
@Component({
    selector: 'page-create-avatar',
    templateUrl: 'create-avatar.html',
})
export class CreateAvatarPage {

    symbol: string = ""
    avatar_address: string = ""
    passphrase: string = ""
    addressbalances: Array<AddressBalance> = []

    constructor(
        public navCtrl: NavController,
        private alert: AlertProvider,
        private translate: TranslateService,
        private mvs: MvsServiceProvider) {

        this.mvs.listAvatars()
            .then(avatars => this.mvs.getAddressBalances()
                .then(addressbalances => {
                    if (Object.keys(addressbalances).length) {
                        Object.keys(addressbalances).forEach((address) => {
                            if (addressbalances[address].ETP && addressbalances[address].ETP.available >= 100000000) {
                                this.addressbalances.push(new AddressBalance(address, addressbalances[address].ETP.available))
                                avatars.forEach((avatar) => {
                                    if (avatar.address == address)
                                        this.addressbalances.pop();
                                })
                            }
                        })
                    }
                }))
    }

    cancel() {
        this.navCtrl.pop();
    }

    create() {
        return this.alert.showLoading()
            .then(() => this.mvs.createAvatarTx(this.passphrase, this.avatar_address, this.symbol, undefined))
            .then(tx => this.mvs.send(tx))
            .then((result) => {
                this.navCtrl.pop()
                this.navCtrl.pop()
                this.navCtrl.push('AvatarsPage')
                this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
            })
            .catch((error) => {
                console.error(error)
                this.alert.stopLoading()
                if (error.message == 'ERR_CONNECTION')
                    this.alert.showError('ERROR_SEND_TEXT', '')
                else if (error.message == 'ERR_BROADCAST') {
                    this.translate.get('MESSAGE.ONE_TX_PER_BLOCK').subscribe((message: string) => {
                        this.alert.showError('MESSAGE.BROADCAST_ERROR', message)
                    })
                }
            })
    }

    validPassword = (passphrase) => (passphrase.length > 0)

    validAddress = (avatar_address) => (avatar_address != '')

    validSymbol = (symbol) => (symbol.length > 2) && (symbol.length < 64) && (!/[^A-Za-z0-9.-]/g.test(symbol))

}
