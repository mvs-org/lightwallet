import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage()
@Component({
  selector: 'page-create-avatar',
  templateUrl: 'create-avatar.html',
})
export class CreateAvatarPage {

  constructor(public navCtrl: NavController, private mvs: MvsServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateAvatarPage');
  }

}
