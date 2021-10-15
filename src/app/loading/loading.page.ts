import { Component, OnInit, OnDestroy } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { TranslateService } from '@ngx-translate/core'
import { Platform } from '@ionic/angular'
import { AppService } from 'src/app/services/app.service'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { map, throttleTime } from 'rxjs/operators'

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
        public metaverseService: MetaverseService,
        public translate: TranslateService,
        public platform: Platform,
        private appService: AppService,
        private router: Router,
    ) {
        this.reset = history.state.data && history.state.data.reset
    }

    progress$ = this.metaverseService.lastTxHeight$
        .pipe(
            map(height => this.calcProgress(height, this.maxHeight, this.firstTxHeight)),
            throttleTime(300),
        )

    async ngOnInit() {
        if (this.reset || await this.metaverseService.getDbUpdateNeeded()) {
            await this.metaverseService.dataReset()
            await this.metaverseService.setDbVersion(this.appService.db_version)
        }
        await this.updateBalances()
    }

    ngOnDestroy() {
        if (this.lastTxHeightSubscription) {
            this.lastTxHeightSubscription.unsubscribe()
        }
    }

    async updateBalances() {
        this.showRestartOption = false
        try {
            this.maxHeight = await this.metaverseService.updateHeight()
            await this.metaverseService.getData()
            await this.metaverseService.setUpdateTime()
            setTimeout(() => this.router.navigate(['/account', 'portfolio'], { replaceUrl: true }), 1000)
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
        return currentHeight && targetHeight ?
            Math.max(1, Math.min(99, Math.round((currentHeight - startHeight) / (targetHeight - startHeight) * 100))) : 0
    }

    async cancel() {
        await this.metaverseService.hardReset()
        this.router.navigate(['/'])
    }

}
