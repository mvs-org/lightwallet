import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'
import { Subject, BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AppService {

  readonly version: string = '0.9.3'
  readonly db_version = 6
  readonly name: string = 'Pillars of Creation'
  readonly algo: string = 'aes'
  readonly index: number = 10
  network: string = null
  readonly ADDRESS_PREFIX_MAINNET = 'M'
  readonly ADDRESS_PREFIX_P2SH = '3'
  readonly ADDRESS_PREFIX_TESTNET = 't'
  readonly ETPMap = '0xa52b0a032139e6303b86cfeb0bb9ae780a610354'
  readonly SwapAddress = '0xc1e5fd24fa2b4a3581335fc3f2850f717dd09c86'
  readonly crosschain_avatar = 'droplet'
  readonly dev_avatar = 'developer-community'
  readonly min_confirmations = 3
  readonly default_fees = {
    avatar: 100000000,
    bountyShare: 80,
    default: 10000,
    minimum: 10000,
    mitIssue: 100000,
    mstIssue: 1000000000
  }
  readonly max_addresses: number = 50
  readonly defaultLanguage = 'en'

  // Interval in seconds that the app will try to resync on account page
  readonly update_interval = 29
  readonly show_loading_screen_after_unused_time = 60 * 60 * 24 * 7

  readonly DEFAULT_NETWORK = 'mainnet'

  network$ = new BehaviorSubject<string>(undefined)

  constructor(
    private storage: Storage
  ) {
    this.updateNetwork()
  }

  async updateNetwork(newNetwork?: string) {
    console.log('set network')
    if(newNetwork){
      await this.storage.set('network', newNetwork)
    }
    this.network = await this.getNetwork()
    console.log(this.network)
    this.network$.next(this.network)
    return this.network
  }

  getBaseCurrency = () => this.storage.get('base')
    .then(base => (base) ? base : 'USD')

  setBaseCurrency = (currency) => {
    return this.storage.set('base', currency)
  }

  getNetwork = () => this.storage.get('network')
    .then(network => (network) ? network : this.DEFAULT_NETWORK)
}
