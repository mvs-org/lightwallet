import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Injectable()
export class AppGlobals {
    readonly version: string = '0.5.1';
    readonly db_version = 4;
    readonly name: string = 'Supernova';
    readonly algo: string = 'aes';
    readonly index: number = 10;
    network: string = null;
    readonly ADDRESS_PREFIX_MAINNET = 'M'
    readonly ADDRESS_PREFIX_P2SH = '3'
    readonly ADDRESS_PREFIX_TESTNET = 't'
    readonly ETPMap = '0xa52b0a032139e6303b86cfeb0bb9ae780a610354';
    readonly SwapAddress = '0xc1e5fd24fa2b4a3581335fc3f2850f717dd09c86';
    readonly crosschain_avatar = 'droplet'

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
