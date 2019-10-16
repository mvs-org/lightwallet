import { Component } from '@angular/core';
import { IonicPage, NavController, Platform, Events, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
    selector: 'page-loading',
    templateUrl: 'loading.html'
})
export class LoadingPage {

    loadingHeight: number = 0
    maxHeight: number
    progress: number = 1
    firstTxHeight: number
    reset: boolean

    showRestartOption = false

    constructor(public nav: NavController,
        private mvs: MvsServiceProvider,
        public translate: TranslateService,
        public platform: Platform,
        private event: Events,
        public navParams: NavParams,
        private globals: AppGlobals,
    ) {

        this.reset = navParams.get('reset') || false;

        this.event.subscribe("last_tx_height_update", (height) => {
            this.loadingHeight = height
            if (this.firstTxHeight === undefined) {
                this.firstTxHeight = height
            }
            this.progress = this.calculateProgress()
        });

    }

    ionViewDidEnter() {
        this.mvs.getDbUpdateNeeded()
            .then((target: any) => {
                if (this.reset || target)
                    return this.mvs.dataReset()
                        .then(() => this.mvs.setDbVersion(this.globals.db_version))
            })
            .then(() => setTimeout(()=>this.updateBalances(), 1000))
    }

    private getHeight() {
        return this.mvs.updateHeight()
            .then((height: number) => {
                this.maxHeight = height;
            })
    }

    private updateBalances = () => {
        this.showRestartOption = false
        return this.getHeight()
            .then(() => this.mvs.getData())
            .then(() => this.mvs.setUpdateTime())
            .then(() => {
                this.progress = 100
                setTimeout(() => this.nav.setRoot("AccountPage"), 2000)
            })
            .catch((error) => {
                this.showRestartOption = true
                console.error(error)
            })
    }

    calculateProgress() {
        return (this.loadingHeight && this.maxHeight && this.firstTxHeight) ? Math.max(1, Math.min(99, Math.round((this.loadingHeight - this.firstTxHeight) / (this.maxHeight - this.firstTxHeight) * 100))) : 1
    }

    cancel() {
        this.mvs.hardReset()
            .then(() => this.nav.setRoot("LoginPage"))
    }

}
