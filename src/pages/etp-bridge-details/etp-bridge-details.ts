import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform, ModalController } from 'ionic-angular'
import { EtpBridgeServiceProvider, OrderDetails } from '../../providers/etp-bridge-service/etp-bridge-service'
import { AppGlobals } from '../../app/app.global';

@IonicPage({
    name: 'etp-bridge-details-page',
    segment: 'etp-bridge/order/:id'
})
@Component({
    selector: 'page-etp-bridge-details',
    templateUrl: 'etp-bridge-details.html',
})

export class EtpBridgeDetailsPage {

    order: OrderDetails

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        private etpBridgeService: EtpBridgeServiceProvider,
        private globals: AppGlobals,
        public modalCtrl: ModalController,
    ) {
        this.loadOrder(this.navParams.get('id'))
    }

    private async loadOrder(id: string) {
        try {
            this.order = await this.etpBridgeService.getOrder(id).toPromise()
            if(this.order) await this.etpBridgeService.saveOrder(this.order)
        } catch (error) {
            console.error(error)
        }
    }

    explorerURL = (type, data) => (this.globals.network == 'mainnet') ? 'https://explorer.mvs.org/' + type + '/' + data : 'https://explorer-testnet.mvs.org/' + type + '/' + data

    gotoAssetTransfer = (symbol, recipient, amount) => this.navCtrl.push("transfer-page", { asset: symbol, recipient: recipient, amount: amount })

    show(address) {
        let profileModal = this.modalCtrl.create('QRCodePage', { value: address });
        profileModal.present();
    }

}
