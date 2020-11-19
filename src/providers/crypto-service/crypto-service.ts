import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';

@Injectable()
export class CryptoServiceProvider {

    constructor() { }

    async decrypt(ec, pincode): Promise<string> {
        try {
            return JSON.parse(CryptoJS.AES.decrypt(ec, pincode).toString(CryptoJS.enc.Utf8)).toString()
        } catch (error) {
            console.error(error)
            throw Error('ERR_DECRYPT_WALLET_FROM_SEED')
        }
    }

    encrypt(ec, pincode) {
        return new Promise(resolve => resolve(CryptoJS.AES.encrypt(JSON.stringify(ec), pincode).toString()))
    }

}
