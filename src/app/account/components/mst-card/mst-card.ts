import { Component, Input } from '@angular/core';

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
    ) {}

    errorImg = (e) => e.target.remove();

}
