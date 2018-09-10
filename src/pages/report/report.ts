import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-report',
    templateUrl: 'report.html',
})
export class ReportPage {

    constructor(
    ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ReportPage');
    }

    report = () => window.open("https://docs.google.com/forms/d/e/1FAIpQLSeMI5N7f6W86k-oT5m1PSQ9e1CLrpgDDPzg2mdezAO33IDQ9Q/viewform?usp=sf_link", "_blank");

    github = () => window.open("https://github.com/mvs-org/lightwallet/issues", "_blank");

}
