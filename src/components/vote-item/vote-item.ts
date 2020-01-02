import { Component, Input } from '@angular/core';
import { AppGlobals } from '../../app/app.global';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';

@Component({
    selector: 'vote-item',
    templateUrl: 'vote-item.html',
    animations: [
        trigger('expandCollapse', [
            state('expandCollapseState', style({ height: '*' })),
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: "0" }))]),
            transition('void => *', [style({ height: '0' }), animate(500, style({ height: "*" }))])
        ])
    ],
})
export class VoteItemComponent {

    @Input() output: any
    @Input() height: number
    @Input() blocktime: number
    @Input() icon: string
    @Input() reward: string

    current_time: number

    constructor(
        public platform: Platform,
        private globals: AppGlobals,
        private wallet: WalletServiceProvider,
        public translate: TranslateService,
    ) {
        this.current_time = Date.now()
    }

    explorerURL = (tx) => (this.globals.network == 'mainnet') ? 'https://explorer.mvs.org/tx/' + tx : 'https://explorer-testnet.mvs.org/tx/' + tx

    depositProgress(start, end) {
        return Math.max(1, Math.min(99, Math.round((this.height - start) / (end - start) * 100)))
    }

    checkTx = () => this.wallet.openLink(this.explorerURL(this.output.hash))

    electAgain() {
        console.log("Elect again " + this.output.voteAvatar)
    }

}
