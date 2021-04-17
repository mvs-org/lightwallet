import { Injectable } from '@angular/core'
import { AES, enc } from 'crypto-js'

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  async decrypt(ec, pincode): Promise<string> {
    try {
      return JSON.parse(AES.decrypt(ec, pincode).toString(enc.Utf8)).toString()
    } catch (error) {
      console.error(error)
      throw Error('ERR_DECRYPT_WALLET_FROM_SEED')
    }
  }

  encrypt(ec, pincode) {
    return new Promise(resolve => resolve(AES.encrypt(JSON.stringify(ec), pincode).toString()))
  }

}
