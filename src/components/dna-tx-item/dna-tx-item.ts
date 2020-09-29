import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import {DnaUtilUtilProvider} from "../../providers/dna-util-util/dna-util-util";

@Component({
    selector: 'dna-tx-item',
    templateUrl: 'dna-tx-item.html',
    animations: [
        trigger('expandCollapse', [
            state('expandCollapseState', style({ height: '*' })),
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: "0" }))]),
            transition('void => *', [style({ height: '0' }), animate(500, style({ height: "*" }))])
        ])
    ],
})
export class DnaTxItemComponent {

    @Input() tx: any;
    @Input() mode: string;
    @Input() users: any;
    @Input() userInfo: any;
    @Input() asset: string;

    constructor(
        public translate: TranslateService,
    ) {

    }

    formatTokenWithoutSymbol(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4, "");
    }

    async showHideDetails() {
        this.mode = this.mode == 'summary' ? '' : 'summary';
    }
}
