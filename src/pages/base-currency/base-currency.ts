import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage()
@Component({
    selector: 'page-base-currency',
    templateUrl: 'base-currency.html',
})
export class BaseCurrencyPage {

    currencies = ["BTC", "USD", "CNY", "EUR", "JPY", "GBP"]
    current_base: string;

    constructor(
        private navCtrl: NavController,
        private mvs: MvsServiceProvider
    ) {
    }

    select(currency) {
        this.mvs.setBaseCurrency(currency)
            .then(() => this.navCtrl.setRoot('AccountPage'))
    }

    ionViewDidLoad() {
        this.mvs.getBaseCurrency()
            .then(base => {this.current_base = base})
    }

}
