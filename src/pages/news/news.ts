import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-news',
    templateUrl: 'news.html',
})
export class NewsPage {

    listNews: any[]

    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams, 
		private mvs: MvsServiceProvider,
		private wallet: WalletServiceProvider,
    ) {
    
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad NewsPage');
    }

    ionViewDidEnter() {
        this.wallet.getNewNews("en-us", 25).toPromise().then((response) => this.listNews = response.json().results)
    }

}
