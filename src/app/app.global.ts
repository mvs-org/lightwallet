import { Injectable } from '@angular/core';

@Injectable()
export class AppGlobals {
    readonly version: string = '0.2.1';
    readonly algo: string = 'aes';
    readonly index: number = 10;
    readonly host: string = "https://app.myetpwallet.com/api";
    readonly network: string = "mainnet";
}
