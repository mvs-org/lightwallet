import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
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

    ionViewDidEnter() {
        console.log('Export wallet page loaded')
        this.walletService.isSetup()
            .then((result) => {
                if (!result)
                    this.nav.setRoot("LoginPage")
            })
    }

    gencode = () =>{
        this.walletService.exportWallet()
        .then((content)=>{
            this.connectcode=content;
        });
    }

}
