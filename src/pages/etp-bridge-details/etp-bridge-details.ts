import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular'
import { EtpBridgeServiceProvider, OrderDetails } from '../../providers/etp-bridge-service/etp-bridge-service'

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


}
