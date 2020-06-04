import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'mit-card',
    templateUrl: 'mit-card.component.html'
})
export class MITCardComponent {

    @Input() avatar: string;
    @Input() symbol: string;

    constructor(
      private router: Router
    ) {}

    MITTransfer = () => this.router.navigate(['/account', 'mit-transfer', this.symbol])

    MITDetails = () => this.router.navigate(['/account', 'mit-details', this.symbol])

    errorImg = e => e.target.remove()
}