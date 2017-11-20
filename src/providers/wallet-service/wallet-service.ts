import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import * as CryptoJS from 'crypto-js';
/*
  Generated class for the WalletServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class WalletServiceProvider {

    constructor(public http: Http) {
        console.log('Hello WalletServiceProvider Provider');
    }


    public decrypt(ec,pincode){
        return new Promise(resolve=>resolve(JSON.parse(CryptoJS.AES.decrypt(ec, pincode).toString(CryptoJS.enc.Utf8))))
    }

    public encrypt(ec,pincode){
        return new Promise(resolve=>resolve(CryptoJS.AES.encrypt(JSON.stringify(ec), pincode).toString()))
    }


}
