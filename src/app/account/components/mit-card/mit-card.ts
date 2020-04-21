import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'mit-card',
    templateUrl: 'mit-card.html'
})
export class MITCardComponent {

    @Input() avatar: string;
    @Input() symbol: string;

    constructor(
        private router: Router,
    ) { }

    MITTransfer = () => this.router.navigate(['/account/mit/send'], { queryParams: { symbol: this.symbol, owner: this.avatar } });

    MITDetails = () => this.router.navigate([`/account/mit/details/${this.symbol}`]);

    errorImg = e => e.target.remove();
}
