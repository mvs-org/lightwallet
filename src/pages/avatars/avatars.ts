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
    certs: Array<any>;
    no_avatar: boolean = false;
    fromPassphrase: boolean = !!this.navParams.get('fromPassphrase');

    constructor(public navCtrl: NavController, public navParams: NavParams, private mvs: MvsServiceProvider) {
        this.no_avatar = false;
    }

    create(){
        this.navCtrl.push("CreateAvatarPage", {fromPassphrase: this.fromPassphrase})
    }

    createAsset(avatar_name: string, avatar_address: string){
        this.navCtrl.push("AssetIssuePage", {avatar_name: avatar_name, avatar_address: avatar_address})
    }

    registerMIT(avatar_name: string, avatar_address: string){
        this.navCtrl.push("MITRegisterPage", {avatar_name: avatar_name, avatar_address: avatar_address})
    }

    ionViewDidLoad() {
        this.loadAvatars()
            .then(()=>this.loadCerts())
            .catch(console.error);
    }

    goWallet() {
        this.navCtrl.setRoot("DnaLoadingPage", { reset: true })
    }

    loadAvatars(){
        return this.mvs.listAvatars()
            .then((avatars) => {
                this.avatars = avatars;
                if(this.avatars.length === 0) {
                    this.no_avatar = true;
                }
            })
    }

    loadCerts(){
        return this.mvs.listCerts()
            .then((certs) => {
                this.certs = certs;
                certs.forEach(cert=>{
                    this.avatars.forEach(avatar=>{
                        if(avatar.certs==undefined)
                            avatar.certs=[]
                        if(avatar.address==cert.address)
                            avatar.certs.push({
                                cert_type: cert.attachment.cert,
                                symbol: cert.attachment.symbol
                            })
                    })
                })
            })
    }

}
