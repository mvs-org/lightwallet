import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-multisignature',
    templateUrl: 'multisignature.html',
})
export class MultisignaturePage {

    no_address: boolean = true;
    multisigs: Array<any>;
    address: string;
    addressbalances: any = {};
    addressBalancesObject: any = {};
    addresses: Array<string>;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        private wallet: WalletServiceProvider,
        public modalCtrl: ModalController
    ) {

        this.addressbalances = {};
        this.wallet.getMultisigsInfo()
            .then((multisigs) => {
                this.multisigs = multisigs;
                if (multisigs && multisigs.length > 0)
                    this.no_address = false;
            })

    }

    showBalances() {
        return this.wallet.getMultisigAddresses()
            .then((_: string[]) => {
                this.address = _[0];
                this.addresses = _;
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        this.addressBalancesObject = addressbalances;
                        this.addressbalances = {};
                        Object.keys(addressbalances).map((address) => {
                            if (this.addressbalances[address] == undefined)
                                this.addressbalances[address] = []
                            Object.keys(addressbalances[address]['MST']).map((asset) => {
                                let balance = addressbalances[address]['MST'][asset];
                                balance.name = asset;
                                this.addressbalances[address].push(balance)
                            })
                        })
                    })
            })
    }

    ionViewDidEnter() {
        console.log('ionViewDidEnter Multisignature');
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
                else
                    this.showBalances()
            })
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    addAddress() {
        this.navCtrl.push("MultisignatureAddPage")
    }

    gotoMultisigTransfer = (asset, address) => this.navCtrl.push("MultisignatureTransferPage", { asset: asset, address: address })

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    show(address) {
        let profileModal = this.modalCtrl.create('QRCodePage', { value: address });
        profileModal.present();
    }

}
