import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'mst-card',
    templateUrl: 'mst-card.html'
})
export class MSTCardComponent {

    @Input() balance: any;
    @Input() symbol: string;
    @Input() theme: string;
    @Input() icon: string;
    @Input() swap: boolean;

    constructor(
        private router: Router,
    ) {}

    errorImg = (e) => e.target.remove();

    gotoTransactions = () => this.router.navigate(['/account/history'], {queryParams: { asset: this.symbol, icon: this.icon }});

    gotoTransfer = () => this.router.navigate(['/account/send'], {queryParams: { asset: this.symbol }});

    gotoReceive = () => this.router.navigate(['/account/addresses'], {queryParams: { asset: this.symbol }});

    gotoSwap = () => this.router.navigate(['/account/swap'], {queryParams: { asset: this.symbol }});
}
