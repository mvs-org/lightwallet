import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Injectable()
export class AppGlobals {
    readonly version: string = '0.3.8';
    readonly db_version = 4;
    readonly name: string = 'Supernova';
    readonly algo: string = 'aes';
    readonly index: number = 10;
    network: string = null;
    readonly ADDRESS_PREFIX_MAINNET = 'M'
    readonly ADDRESS_PREFIX_P2SH = '3'
    readonly ADDRESS_PREFIX_TESTNET = 't'

    readonly DEFAULT_NETWORK = 'mainnet'

    constructor(
        private event: Events,
        private storage: Storage
    ) {
        this.event.subscribe("network_update", (settings) => {
            console.info('app.globals network update caused by network update event')
            this.updateNetwork()
        })
        this.updateNetwork()
    }

    updateNetwork(){
        return this.getNetwork()
            .then(network => { this.network = network; })
    }

    getNetwork = () => this.storage.get('network')
        .then(network => (network) ? network : this.DEFAULT_NETWORK)
}
