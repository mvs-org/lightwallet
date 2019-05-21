import { Component, Input } from '@angular/core';
import { Balance } from 'src/app/services/metaverse.service';

@Component({
    selector: 'etp-card',
    templateUrl: 'etp-card.html'
})
export class EtpCardComponent {

    @Input() balance: Balance;
    @Input() tickers: any;
    @Input() base: string;

    constructor(
    ) {
    }
}
