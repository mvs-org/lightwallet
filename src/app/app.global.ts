import { Injectable } from '@angular/core';

@Injectable()
export class AppGlobals {
    readonly version: string = '0.2.1';
    readonly algo: string = 'aes';
    readonly index: number = 10;
    readonly host = {
        mainnet: "https://app.myetpwallet.com/api",
        testnet: "https://testnet.myetpwallet.com/api"
    };
    readonly network: string = "testnet";

    readonly ADDRESS_PREFIX_MAINNET = 'M'
    readonly ADDRESS_PREFIX_P2SH = '3'
    readonly ADDRESS_PREFIX_TESTNET = 't'

}
