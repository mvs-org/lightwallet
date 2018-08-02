import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
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
    address: string;
    addressbalances: any;
    addressBalancesObject: any = {};
    addresses: Array<string>;
    displayType: string;

    constructor(
        private navCtrl: NavController,
        private navParams: NavParams,
        private platform: Platform,
        private mvs: MvsServiceProvider
    ) {
        this.addressbalances = {};
        this.selectedAsset = this.navParams.get('asset')
        this.displayType = this.selectedAsset == 'ETP' ? 'ETP' : 'asset'
    }

    showBalances() {
        return this.mvs.getAddresses()
            .then((_: string[]) => {
                this.address = _[0];
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

    ionViewDidEnter() {
        console.log('ionViewDidEnter Receive');
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
                else
                    this.showBalances()
            })
    }

    canAddAddress = () => this.platform.isPlatformMatch('mobile') && !this.platform.isPlatformMatch('mobileweb')

    addAddress = () =>  this.navCtrl.push('generate-address-page')

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    show(address) {
        this.address = address;
    }

}
