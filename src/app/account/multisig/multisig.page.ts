import { Component, OnInit } from '@angular/core'
import { WalletService } from '../../services/wallet.service'
import { MetaverseService } from '../../services/metaverse.service'
import { ModalController } from '@ionic/angular'
import { Router } from '@angular/router'

@Component({
  selector: 'app-multisig',
  templateUrl: './multisig.page.html',
  styleUrls: ['./multisig.page.scss'],
})
export class MultisigPage implements OnInit {

  no_address: boolean = true
  multisigs: Array<any>
  address: string
  addressbalances: any = {}
  addressBalancesObject: any = {}
  addresses: Array<string>

  constructor(
    private router: Router,
    private mvs: MetaverseService,
    private wallet: WalletService,
    public modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.addressbalances = {}
    this.wallet.getMultisigsInfo()
      .then((multisigs) => {
        this.multisigs = multisigs
        if (multisigs && multisigs.length > 0) {
          this.no_address = false
        }
      })
  }


  showBalances() {
    return this.wallet.getMultisigAddresses()
      .then((_: string[]) => {
        this.address = _[0]
        this.addresses = _
        return this.mvs.getAddressBalances()
          .then((addressbalances) => {
            this.addressBalancesObject = addressbalances
            this.addressbalances = {}
            Object.keys(addressbalances).map((address) => {
              if (this.addressbalances[address] === undefined) {
                this.addressbalances[address] = []
              }
              Object.keys(addressbalances[address].MST).map((asset) => {
                const balance = addressbalances[address].MST[asset]
                balance.name = asset
                this.addressbalances[address].push(balance)
              })
            })
          })
      })
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter Multisignature')
    this.mvs.getAddresses()
      .then((addresses) => {
        if (!Array.isArray(addresses) || !addresses.length) {
          this.router.navigate(['/'])
        }
        else {
          this.showBalances()
        }
      })
  }

  addAddress() {
    this.router.navigate(['account', 'multisig', 'add'])
  }

  gotoMultisigTransfer(asset, address){
    this.router.navigate(['account', 'multisig', 'transfer', address, asset])
  }

  format = (quantity, decimals) => quantity / Math.pow(10, decimals)

  show(address) {
    // let profileModal = this.modalCtrl.create('QRCodePage', { value: address });
    // profileModal.present();
  }


}
