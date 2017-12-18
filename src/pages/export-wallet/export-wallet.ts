import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';



@Component({
    selector: 'page-export-wallet',
    templateUrl: 'export-wallet.html',
})
export class ExportWalletPage {

    connectcode: any;
    showQRCode: boolean;

    constructor(public nav: NavController, private walletService: WalletServiceProvider) {
      this.connectcode = "";
      this.gencode();
      this.showQRCode = false;
    }

    gencode = () =>{
        this.walletService.exportWallet()
        .then((content)=>{
            this.connectcode=content;
        });
    }

}
