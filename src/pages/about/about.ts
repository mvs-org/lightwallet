import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
  selector: 'AboutPage',
  templateUrl: 'about.html',
})
export class AboutPage {

    constructor(
        public globals: AppGlobals
    ) {
  }

    network = () => this.globals.network

    version = () => this.globals.version

    version_name = () => this.globals.name

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

}
