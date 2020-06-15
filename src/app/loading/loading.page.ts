import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetaverseService } from 'src/app/services/metaverse.service';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.page.html',
    styleUrls: ['./loading.page.scss'],
})
export class LoadingPage implements OnInit, OnDestroy {

    loadingHeight = 0
    maxHeight: number
    firstTxHeight: number
    reset = false

    showRestartOption = false

    lastTxHeightSubscription: Subscription

    constructor(
        private metaverseService: MetaverseService,
        public translate: TranslateService,
        public platform: Platform,
        private appService: AppService,
        private router: Router,
    ) { }

    progress$ = this.metaverseService.lastTxHeight$
        .pipe(
            map(height => this.calcProgress(height, this.maxHeight, this.firstTxHeight)),
            throttleTime(300),
        )

    async ngOnInit() {
        console.log('init loading page')
        if (this.reset || await this.metaverseService.getDbUpdateNeeded()) {
            // await this.metaverseService.dataReset()
            await this.metaverseService.setDbVersion(this.appService.db_version)
        }
        console.log('start sync')
        await this.updateBalances()
    }

    ngOnDestroy() {
        console.log('leave loading')
        if (this.lastTxHeightSubscription) {
            this.lastTxHeightSubscription.unsubscribe()
        }
    }

    private async updateBalances() {
        console.log('update balances')
        this.showRestartOption = false
        try {
            console.info('load height')
            this.maxHeight = await this.metaverseService.updateHeight()
            console.log('current blockchain height:', this.maxHeight)
            await this.metaverseService.getData()
            await this.metaverseService.setUpdateTime()
            setTimeout(() => this.router.navigate(['/account', 'portfolio'], { replaceUrl: true }), 2000)
        } catch (error) {
            console.error(error)
            switch (error.message) {
                case 'ERR_NO_ADDRESS':
                    this.router.navigate(['login'])
                    break
                default:
                    this.showRestartOption = true
            }
        }
    }

    calcProgress(currentHeight, targetHeight, startHeight = 0) {
        return currentHeight && targetHeight ? Math.max(1, Math.min(99, Math.round((currentHeight - startHeight) / (targetHeight - startHeight) * 100))) : 0
    }

    async cancel() {
        await this.metaverseService.hardReset()
        this.router.navigate(['/'])
    }

}
