import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

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

    constructor(public navCtrl: NavController, public navParams: NavParams, private mvs: MvsServiceProvider) {
        this.addressbalances = {};
        this.selectedAsset = navParams.get('asset')
        this.mvs.getMvsAddresses()
            .then((_: string[]) => {
                this.address = _[_.length - 1];
                this.addresses = _;
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        this.addressBalancesObject = addressbalances;
                        Object.keys(addressbalances).map((address) => {
                            if (this.addressbalances[address] == undefined)
                                this.addressbalances[address] = []
                            Object.keys(addressbalances[address]).map((asset) => {
                                let balance = addressbalances[address][asset];
                                balance.name = asset;
                                this.addressbalances[address].push(balance)
                            })
                        })
                    })

            })
    }

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    show(address) {
        this.address = address;
    }

}
