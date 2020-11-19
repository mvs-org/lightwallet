import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-plugin-start',
    templateUrl: 'plugin-start.html',
})
export class PluginStartPage {

    name: string;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
    ) {

        this.name = navParams.get('name')
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad PluginStartPage');
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    gotoPlugin = () => {
        this.navCtrl.pop()
            .then(() => this.navCtrl.push("PluginPage", { name: this.name }))
    }

}
