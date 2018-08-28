import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-information',
    templateUrl: 'information.html',
})
export class InformationPage {

    constructor(
        private navCtrl: NavController
    ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InformationPage');
    }

    disclaimer = () => this.navCtrl.push("DisclaimerPage")

}
