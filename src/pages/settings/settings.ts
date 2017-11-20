import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {

    constructor(public nav: NavController,  private mvs: MvsServiceProvider) {}

    reset = () => this.mvs.dataReset();

}
