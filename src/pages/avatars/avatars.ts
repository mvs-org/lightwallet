import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage()
@Component({
    selector: 'page-avatars',
    templateUrl: 'avatars.html',
})
export class AvatarsPage {

    avatars: Array<any>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private mvs: MvsServiceProvider) {
    }

    create(){
        this.navCtrl.push("CreateAvatarPage")
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AvatarsPage');
        this.mvs.listAvatars()
            .then((avatars) => {
                this.avatars = avatars;
            })
            .catch(console.error);
    }

}
