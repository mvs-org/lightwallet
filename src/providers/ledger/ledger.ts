import { Injectable } from '@angular/core'
import { WebUSBDevice } from 'mvs-ledger/dist/bundle.common'


@Injectable()
export class LedgerProvider {

  constructor() { }

  async getPublicKey(path: string) {
    const device = await WebUSBDevice.getDevice()
    const result = await device.getWalletPublicKey(path)
    await device.close()
    return result
  }

}
