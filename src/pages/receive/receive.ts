import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage({
    name: 'receive-page',
    segment: 'receive/:asset'
})
@Component({
    selector: 'page-receive',
    templateUrl: 'receive.html',
})
export class ReceivePage {

    selectedAsset: any;
    addressbalances: any;
    addressBalancesObject: any = {};
    addresses: Array<string>;
    displayType: string;
    base: string
    tickers = {}

    constructor(
        private navCtrl: NavController,
        private navParams: NavParams,
        private platform: Platform,
        private mvs: MvsServiceProvider,
        public modalCtrl: ModalController,
    ) {
        this.addressbalances = {};
        this.selectedAsset = this.navParams.get('asset')
        this.displayType = this.selectedAsset == 'ETP' ? 'ETP' : 'asset'

        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
                else
                    this.showBalances()
            })

    }

    ionViewDidEnter() {
        this.loadTickers()
    }

    showBalances() {
        return this.mvs.getAddresses()
            .then((_: string[]) => {
                this.addresses = _;
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        this.addressBalancesObject = addressbalances;
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

    private async loadTickers() {
        [this.base, this.tickers] = await this.mvs.getBaseAndTickers()
    }

    canAddAddress = () => this.platform.isPlatformMatch('mobile') && !this.platform.isPlatformMatch('mobileweb')

    addAddress = () =>  this.navCtrl.push('generate-address-page')

    history = (asset, address) =>  this.navCtrl.push('transactions-page', { asset: asset, addresses : [address] })

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    show(address) {
        let profileModal = this.modalCtrl.create('QRCodePage', { value: address, address: address, asset: this.selectedAsset, base: this.base, tickers: this.tickers });
        profileModal.present();
    }

}
