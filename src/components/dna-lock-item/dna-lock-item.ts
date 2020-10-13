import {Component, Input, SimpleChanges} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Platform, NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { DnaUtilUtilProvider } from "../../providers/dna-util-util/dna-util-util";

@Component({
    selector: 'dna-lock-item',
    templateUrl: 'dna-lock-item.html',
    animations: [
        trigger('expandCollapse', [
            state('expandCollapseState', style({ height: '*' })),
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: "0" }))]),
            transition('void => *', [style({ height: '0' }), animate(500, style({ height: "*" }))])
        ])
    ],
})
export class DnaLockItemComponent {

    @Input() lock: any;
    @Input() userInfo: any;
    @Input() asset: string;
    @Input() balance: any;
    @Input() canWithdraw: boolean;

    mode: string = 'summary';

    constructor(
        public translate: TranslateService,
        public platform: Platform,
        public navCtrl: NavController,
    ) {

    }

    ngOnChanges(changes: SimpleChanges) {
        //console.log('lock item: ', this.lock);
    }

    goWithdraw = () => {
        this.navCtrl.push('dna-lock-withdraw-page', {lock: this.lock});
    }

    formatToken(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4); //
    }

    formatTokenWithoutSymbol(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4, "");
    }

    async showHideDetails() {
        this.mode = this.mode == 'summary' ? '' : 'summary';
    }
}
