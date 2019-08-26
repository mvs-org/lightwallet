import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-how-to-auth',
  templateUrl: 'how-to-auth.html',
})
export class HowToAuthPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private nav: NavController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HowToMobilePage');
  }

}
