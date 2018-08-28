import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
    selector: 'page-information',
    templateUrl: 'information.html',
})
export class InformationPage {

    constructor(
        private globals: AppGlobals,
        private navCtrl: NavController
    ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InformationPage');
    }

    version = () => "v" + this.globals.version + " " + this.globals.name

    network = () => this.globals.network;

    disclaimer = () => this.navCtrl.push("DisclaimerPage")

}
