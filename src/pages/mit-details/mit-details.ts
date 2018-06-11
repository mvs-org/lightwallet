import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage({
    name: 'MITDetailsPage',
    segment: 'mit/:symbol'
})
@Component({
    selector: 'page-mit-details',
    templateUrl: 'mit-details.html',
})
export class MITDetailsPage {

    symbol: string
    history: Array<any> = []
    content: string
    owner: string
    creator: string
    create_tx: string

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        public navParams: NavParams
    ) {
        this.symbol = navParams.get('symbol')
        this.mvs.getGlobalMit(this.symbol)
            .then((outputs) => {
                this.owner=outputs[0].attachment.to_did
                this.creator=outputs[outputs.length-1].attachment.to_did
                this.create_tx=outputs[outputs.length-1].tx
                outputs.forEach(output => {
                    this.history.push({
                        from_did: output.attachment.from_did,
                        to_did: output.attachment.to_did,
                        tx: output.tx,
                        index: output.index,
                        height: output.height,
                        status: output.attachment.status
                    })
                    if (output.attachment.status == 'registered') {
                        this.content = output.attachment.content
                    }
                })
            })
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad MitDetailsPage');
    }

}
