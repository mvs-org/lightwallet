import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-information',
  templateUrl: 'information.html',
})
export class InformationPage {

  constructor() {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InformationPage');
  }

}
