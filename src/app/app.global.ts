import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class AppGlobals {
    readonly version: string = '0.3.1r2';
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
        private storage: Storage
    ) {
            this.getNetwork()
                .then(network => { this.network = network; })
    }

    getNetwork = () => this.storage.get('network')
        .then(network => (network) ? network : this.DEFAULT_NETWORK)
}
