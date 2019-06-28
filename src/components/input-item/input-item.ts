import { Component, Input } from '@angular/core';

@Component({
    selector: 'input-item',
    templateUrl: 'input-item.html'
})
export class InputItemComponent {

    @Input() input: any;

    constructor() {
    }

}
