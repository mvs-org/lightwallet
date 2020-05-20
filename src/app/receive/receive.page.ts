import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { ActivatedRoute } from '@angular/router'
import { WalletService, Balances, Balance } from 'src/app/services/wallet.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { FormatPipe } from 'src/app/pipes/format/format'
import { QrAddressComponent } from './qr-address/qr-address.component'
import { keyBy, Dictionary } from 'lodash'
import { fromEventPattern, Observable } from 'rxjs'

@Component({
  selector: 'app-receive',
  templateUrl: './receive.page.html',
  styleUrls: ['./receive.page.scss'],
})
export class ReceivePage implements OnInit {

  addressBalances: Dictionary<Balances>
  addresses$: Observable<string[]>
  displayType: string

  constructor(
    private modalCtrl: ModalController,
    private wallet: WalletService,
    private formatPipe: FormatPipe,
    private metaverse: MetaverseService,
    private activatedRoute: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.addresses$ = await this.wallet.addresses$()
    this.wallet.addressBalances(this.metaverse)
      .then(addressBalanceStream => {
        addressBalanceStream
          .subscribe(addressBalances => {
            //this.addressBalances = addressBalances
            this.addressBalances = {
              'tK8TaQix9QSgaAAPTaUj7NwKMfbkWRKgVf': {
                'AVATAR': 'TOTO',
                'ETP': {
                  'available': 12345678,
                  'unconfirmed': 123,
                  'frozen': 111,
                  'decimals': 8,
                },
                'MST': {
                  'DNA': {
                    'available': 8888,
                    'unconfirmed': 444,
                    'frozen': 333,
                    'decimals': 4,
                  }
                }
              }
            }
          })
      })
  }

  getETPBalances(address) {
    return this.addressBalances[address] !== undefined ? this.addressBalances[address].ETP : {}
  }

  getMSTBalances(address) {
    return this.addressBalances[address] !== undefined ? this.addressBalances[address].MST : []
  }

  formatFrozen(balance: Balance = { available: 0, frozen: 0, decimals: 0 }) {
    return balance.available && balance.decimals ? this.formatPipe.transform(balance.frozen, balance.decimals) : 0
  }

  formatAvailable(balance: Balance = { available: 0, frozen: 0, decimals: 0 }) {
    return balance.available && balance.decimals ? this.formatPipe.transform(balance.available, balance.decimals) : 0
  }

  async show(address: string) {
    return (await this.modalCtrl.create({
      component: QrAddressComponent,
      componentProps: { address },
    })).present()
  }

}
