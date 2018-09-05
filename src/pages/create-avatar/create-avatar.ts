import { Component } from '@angular/core';
import { IonicPage, NavController, Platform, AlertController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

class AddressBalance {
    constructor(
        public address: string,
        public available: number
    ) { }
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
    list_all_avatars: Array<string> = [];
    bounty_fee: number = 80
    addressSelectOptions: any

    constructor(
        public navCtrl: NavController,
        private alert: AlertProvider,
        private translate: TranslateService,
        public platform: Platform,
        private alertCtrl: AlertController,
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

    ionViewDidLoad() {
        this.translate.get('SUBTITLE.CREATE_AVATAR_ADDRESS').subscribe((message: string) => {
            this.addressSelectOptions = {
                subTitle: message
            };
        })
        this.loadListAvatars()
            .catch(console.error);
    }

    cancel() {
        this.navCtrl.pop();
    }

    create() {
        return this.alert.showLoading()
            .then(() => this.mvs.createAvatarTx(this.passphrase, this.avatar_address, this.symbol, undefined, this.bounty_fee*100000000/100))
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
                switch (error.message) {
                    case 'ERR_CONNECTION':
                        this.alert.showError('ERROR_SEND_TEXT', '')
                        break;
                    case 'ERR_BROADCAST':
                        this.translate.get('MESSAGE.ONE_TX_PER_BLOCK').subscribe((message: string) => {
                            this.alert.showError('MESSAGE.BROADCAST_ERROR', message)
                        })
                        break;
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    case "ERR_INSUFFICIENT_BALANCE":
                        this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                        break;
                    default:
                        this.alert.showError('MESSAGE.CREATE_TRANSACTION', error.message)

                }
            })
    }

    confirm() {
        this.translate.get('CREATE_AVATAR.CONFIRMATION_TITLE').subscribe((txt_title: string) => {
            this.translate.get('CREATE_AVATAR.CONFIRMATION_SUBTITLE').subscribe((txt_subtitle: string) => {
                this.translate.get('CREATE_AVATAR.CREATE_BTN').subscribe((txt_create: string) => {
                    this.translate.get('CANCEL').subscribe((txt_cancel: string) => {
                    const alert = this.alertCtrl.create({
                        title: txt_title,
                        subTitle: txt_subtitle,
                        buttons: [
                            {
                                text: txt_create,
                                handler: data => {
                                    // need error handling
                                    this.create()
                                }
                            },
                            {
                                  text: txt_cancel,
                                  role: 'cancel'
                            }
                        ]
                    });
                    alert.present(prompt)
                  });
              });
          });
      });
    }

    loadListAvatars(){
        return this.mvs.getListAvatar()
            .then((avatars) => {
                avatars.result.forEach((avatar) => {
                    this.list_all_avatars.push(avatar.symbol)
                })
            })
            .catch((error) => {
                console.error(error)
            })
    }

    validPassword = (passphrase) => (passphrase.length > 0)

    validAddress = (avatar_address) => (avatar_address != '')

    validSymbol = (symbol) => (symbol.length > 2) && (symbol.length < 64) && (!/[^A-Za-z0-9@_.-]/g.test(symbol)) && (this.list_all_avatars.indexOf(symbol) == -1)

}
