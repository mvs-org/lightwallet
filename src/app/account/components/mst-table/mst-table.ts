import { Component, Input } from '@angular/core';

@Component({
    selector: 'mst-table',
    templateUrl: 'mst-table.html',
    styleUrls: ['./mst-table.scss']
})
export class MSTTableComponent {

    @Input() MSTInfo: any;

    displayedColumns: string[] = ['symbol', 'available', 'frozen'];

    constructor(
    ) {}

    errorImg = (e) => e.target.remove();

}
