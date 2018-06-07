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
    no_avatar: boolean = false;

    constructor(public navCtrl: NavController, public navParams: NavParams, private mvs: MvsServiceProvider) {
        this.no_avatar = false;
    }

    create(){
        this.navCtrl.push("CreateAvatarPage")
    }

    createAsset(avatar_name: string, avatar_address: string){
        this.navCtrl.push("AssetIssuePage", {avatar_name: avatar_name, avatar_address: avatar_address})
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AvatarsPage');
        this.mvs.listAvatars()
            .then((avatars) => {
                console.log(avatars)
                this.avatars = avatars;
                if(this.avatars.length === 0) {
                    this.no_avatar = true;
                }
            })
            .catch(console.error);
    }

}
