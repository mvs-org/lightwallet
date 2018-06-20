import { Injectable } from '@angular/core';

@Injectable()
export class AppGlobals {
    readonly version: string = '0.3.1';
    readonly db_version = 3;
    readonly name: string = 'supernova';
    readonly algo: string = 'aes';
    readonly index: number = 10;
    network: string = "mainnet";
    readonly ADDRESS_PREFIX_MAINNET = 'M'
    readonly ADDRESS_PREFIX_P2SH = '3'
    readonly ADDRESS_PREFIX_TESTNET = 't'
}
