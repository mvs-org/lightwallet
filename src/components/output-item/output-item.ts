import { Component, Input } from '@angular/core';

@Component({
    selector: 'output-item',
    templateUrl: 'output-item.html'
})
export class OutputItemComponent {

    @Input() output: any;
    @Input() decimalsMst: any;

    constructor() {
    }

}
