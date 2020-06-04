import { Component, OnInit } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { MetaverseService } from 'src/app/services/metaverse.service';
import { WalletService } from 'src/app/services/wallet.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.page.html',
  styleUrls: ['./addresses.page.scss'],
})
export class AddressesPage implements OnInit {

    selectedAsset: any;
    addressbalances: any;
    addressBalancesObject: any = {};
    addresses: Array<string>;
    displayType: string;
    base: string
    tickers = {}

    constructor(
        private platform: Platform,
        private metaverseService: MetaverseService,
        public modalCtrl: ModalController,
        public walletService: WalletService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {
        this.addressbalances = {};
        this.selectedAsset = this.activatedRoute.snapshot.params.symbol
        this.displayType = this.selectedAsset == 'ETP' ? 'ETP' : 'asset'

        this.metaverseService.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length){
                  this.router.navigate(['/'])
                }
                else
                    this.showBalances()
            })

    }

    ngOnInit(){}

    ionViewDidEnter() {
        this.loadTickers()
    }

    showBalances() {
        return this.metaverseService.getAddresses()
            .then((_: string[]) => {
                this.addresses = _;
                return this.metaverseService.getAddressBalances()
                    .then((addressbalances) => {
                        this.addressBalancesObject = addressbalances;
                        Object.keys(addressbalances).map((address) => {
                            if (this.addressbalances[address] == undefined)
                                this.addressbalances[address] = []
                            Object.keys(addressbalances[address]['MST']).map((asset) => {
                                let balance = addressbalances[address]['MST'][asset];
                                balance.name = asset;
                                this.addressbalances[address].push(balance)
                            })
                        })
                    })

            })
    }

    private async loadTickers() {
        [this.base, this.tickers] = await this.metaverseService.getBaseAndTickers()
    }

    canAddAddress = () => this.platform.is('mobile') && !this.platform.is('mobileweb')

    addAddresses = () => console.log('go to add address page')

    history = (asset, address) =>  this.router.navigate(['account', 'history', asset], {queryParams: {addresses: [address]}})

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    show(address) {
        // let profileModal = this.modalCtrl.create('QRCodePage', { value: address, address: address, asset: this.selectedAsset, base: this.base, tickers: this.tickers });
        // profileModal.present();
    }

}
