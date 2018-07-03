import { Component, Input } from '@angular/core';

@Component({
    selector: 'plugin-item',
    templateUrl: 'plugin-item.html'
})
export class PluginItemComponent {

    @Input() plugin: any;
    @Input() removePlugin: any;

    constructor() {
    }

}
