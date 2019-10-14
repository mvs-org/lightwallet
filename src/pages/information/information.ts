import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'page-information',
    templateUrl: 'information.html',
})
export class InformationPage {

    constructor(
        private globals: AppGlobals,
        private translate: TranslateService,
        private navCtrl: NavController
    ) {
    }

    getLogoClasses(){
        return{
            banner: true,
            china: this.translate.currentLang=='zh'
        }
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InformationPage');
    }

    version = () => "v" + this.globals.version + " " + this.globals.name

    network = () => this.globals.network;

    disclaimer = () => this.navCtrl.push("DisclaimerPage")

}
