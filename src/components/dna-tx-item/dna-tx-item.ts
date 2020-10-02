import {Component, Input, SimpleChanges} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { DnaUtilUtilProvider } from "../../providers/dna-util-util/dna-util-util";
import { DnaReqWsSubscribeProvider } from '../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe';

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

    blockNum: any;
    block: any;
    hash: string;

    constructor(
        public translate: TranslateService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.block || this.blockNum != this.tx.block_num) {
            DnaReqWsSubscribeProvider.wsFetchBlock(this.tx.block_num).then((data) => {
                this.blockNum = this.tx.block_num;
                this.block    = data;

                if (this.block.transactions && this.block.transactions.length > 0) {
                    DnaReqWsSubscribeProvider.wsGetTransactionHex(this.block.transactions[0]).then((hash) => {
                        this.hash = hash;
                    });
                }
            });
        }
    }

    formatTokenWithoutSymbol(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4, "");
    }

    async showHideDetails() {
        this.mode = this.mode == 'summary' ? '' : 'summary';
    }
}
