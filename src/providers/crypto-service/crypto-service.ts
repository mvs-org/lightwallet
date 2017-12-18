import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';

@Injectable()
export class CryptoServiceProvider {

    constructor(){}

    decrypt(ec,pincode){
        return new Promise(resolve=>resolve(JSON.parse(CryptoJS.AES.decrypt(ec, pincode).toString(CryptoJS.enc.Utf8))))
    }

    encrypt(ec,pincode){
        return new Promise(resolve=>resolve(CryptoJS.AES.encrypt(JSON.stringify(ec), pincode).toString()))
    }

}
