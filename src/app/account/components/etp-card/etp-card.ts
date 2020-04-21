import { Component, Input } from '@angular/core';
import { Balance } from 'src/app/services/wallet.service';

@Component({
    selector: 'etp-card',
    templateUrl: 'etp-card.html',
    styleUrls: ['./etp-card.scss'],
})
export class EtpCardComponent {

    @Input() balance: Balance;
    @Input() tickers: any;
    @Input() base: string;

    constructor(
    ) {
    }
}
