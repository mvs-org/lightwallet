import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {

    connectcode: any;

    constructor(public nav: NavController,  private mvs: MvsServiceProvider, private walletService: WalletServiceProvider) {

      this.gencode('LaurentTest');

    }

    reset = () => this.mvs.dataReset();

    gencode = (passphrase) =>{
      this.walletService.export(passphrase)
      .then((content)=>{
      this.connectcode=content;
      });
    }

}
