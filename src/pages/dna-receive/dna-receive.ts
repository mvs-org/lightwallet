import { Component } from '@angular/core';
import { IonicPage, /*NavController,*/ NavParams, Platform, ModalController } from 'ionic-angular';

@IonicPage({
    name: 'dna-receive-page',
    segment: 'dna-receive/:asset'
})
@Component({
    selector: 'page-dna-receive',
    templateUrl: 'dna-receive.html',
})
export class DnaReceivePage {

    asset: string = this.navParams.get('asset');
    userInfo: any = this.navParams.get('userInfo');

    constructor(
        //private navCtrl: NavController,
        private navParams: NavParams,
        private platform: Platform,
        public modalCtrl: ModalController,
    ) {
        console.log(this.platform);
    }

    ionViewDidEnter() {

    }
}
