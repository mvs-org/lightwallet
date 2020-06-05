import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetaverseService } from 'src/app/services/metaverse.service';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.page.html',
    styleUrls: ['./loading.page.scss'],
})
export class LoadingPage implements OnInit, OnDestroy {

    loadingHeight: number = 0
    maxHeight: number
    progress: number = 1
    firstTxHeight: number
    reset: boolean = false

    showRestartOption = false

    lastTxHeightSubscription: Subscription

    constructor(
        private metaverseService: MetaverseService,
        public translate: TranslateService,
        public platform: Platform,
        private appService: AppService,
        private router: Router,
    ) {

        // this.reset = navParams.get('reset') || false;


    }

    ngOnInit() {
        this.lastTxHeightSubscription = this.metaverseService.lastTxHeight$.subscribe(height => {
            this.loadingHeight = height
            if (this.firstTxHeight === undefined) {
                this.firstTxHeight = height
            }
            this.progress = this.calculateProgress()
        })
    }

    ngOnDestroy() {
        if (this.lastTxHeightSubscription) {
            this.lastTxHeightSubscription.unsubscribe()
        }
    }


    ionViewDidEnter() {
        this.metaverseService.getDbUpdateNeeded()
            .then((target: any) => {
                if (this.reset || target)
                    return this.metaverseService.dataReset()
                        .then(() => this.metaverseService.setDbVersion(this.appService.db_version))
            })
            .then(() => setTimeout(() => this.updateBalances(), 1000))
    }

    private getHeight() {
        return this.metaverseService.updateHeight()
            .then((height: number) => {
                this.maxHeight = height;
            })
    }

    private updateBalances = () => {
        this.showRestartOption = false
        return this.getHeight()
            .then(() => this.metaverseService.getData())
            .then(() => this.metaverseService.setUpdateTime())
            .then(() => {
                this.progress = 100
                setTimeout(() => this.router.navigate(['/account/portfolio']), 2000)
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
        this.metaverseService.hardReset()
            .then(() => this.router.navigate(['/']))
    }

}