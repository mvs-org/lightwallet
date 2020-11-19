import { Component } from '@angular/core';
import { IonicPage, NavController, Platform, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { DnaReqWsSubscribeProvider } from "../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe";

@IonicPage()
@Component({
    selector: 'page-dna-loading',
    templateUrl: 'dna-loading.html'
})
export class DnaLoadingPage {

    loadingHeight: number = 0
    progress: number = 1
    reset: boolean

    showRestartOption = false

    constructor(
        public nav: NavController,
        public translate: TranslateService,
        public platform: Platform,
        public navParams: NavParams,
        private storage: Storage,
    ) {
        this.reset = navParams.get('reset') || false;

        this.storage.get('dnaUserInfo').then((userInfo) => {
            // 判断是否有 DNA 账户信息
            if (userInfo && (userInfo.name || userInfo.address)) {
                DnaReqWsSubscribeProvider.subscribeLatestBlock((res) => {
                    this.loadingHeight = res.head_block_number;

                    setTimeout(() => {
                        this.progress = 100;
                        this.storage.set('dnaBlockHeight', this.loadingHeight)
                            .then(() => {
                                setTimeout(() => this.nav.setRoot("DnaAccountPage"), 2000);
                            });
                    }, 1000);
                });
            } else {
                this.cancel();
            }
        });
    }

    cancel() {
        this.nav.setRoot("LoginPage")
    }

}
