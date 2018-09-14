import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        private wallet: WalletServiceProvider
    ) {
            this.wallet.getMultisigsInfo()
                .then((multisigs) => {
                    this.multisigs = multisigs;
                    if(multisigs && multisigs.length > 0)
                        this.no_address = false;
                })

    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    addAddress(){
        this.navCtrl.push("MultisignatureAddPage")
    }
}
