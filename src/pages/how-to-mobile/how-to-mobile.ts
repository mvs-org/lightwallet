import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-how-to-mobile',
  templateUrl: 'how-to-mobile.html',
})
export class HowToMobilePage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private nav: NavController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HowToMobilePage');
  }

  loginFromMobile = () => this.nav.push("ImportWalletMobilePage")

}
