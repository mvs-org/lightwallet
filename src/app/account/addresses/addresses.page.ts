import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { ActivatedRoute } from '@angular/router'
import { WalletService, Balances, Balance } from 'src/app/services/wallet.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { FormatPipe } from 'src/app/pipes/format/format'
import { QrAddressComponent } from './qr-address/qr-address.component'
import { keyBy, Dictionary } from 'lodash'
import { fromEventPattern } from 'rxjs'

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.page.html',
  styleUrls: ['./addresses.page.scss'],
})
export class AddressesPage implements OnInit {

  selectedAsset: string
  addressBalances: Dictionary<Balances>
  addresses$ = this.wallet.addresses$
  displayType: string

  constructor(
    private modalCtrl: ModalController,
    private wallet: WalletService,
    private formatPipe: FormatPipe,
    private metaverse: MetaverseService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.wallet.addressBalances(this.metaverse)
      .subscribe(addressBalances => {
        this.addressBalances = addressBalances
      })
    this.activatedRoute.params
      .subscribe(params => {
        this.selectedAsset = params.symbol
        this.displayType = this.selectedAsset === 'ETP' ? 'ETP' : 'asset'
      })
  }

  getMSTBalances(address) {
    return this.addressBalances[address] !== undefined ? this.addressBalances[address].MST : []
  }

  formatFrozen(balance: Balance = {available: 0, frozen: 0, decimals: 0}) {
    return this.formatPipe.transform(balance.frozen, balance.decimals)
  }

  formatAvailable(balance: Balance = {available: 0, frozen: 0, decimals: 0}) {
    return this.formatPipe.transform(balance.available, balance.decimals)
  }

  async show(address: string) {
    return (await this.modalCtrl.create({
      component: QrAddressComponent,
      componentProps: { address }
    })).present()
  }

}
