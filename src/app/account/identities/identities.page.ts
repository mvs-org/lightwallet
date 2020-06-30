import { Component, OnInit } from '@angular/core'
import { Platform, ModalController } from '@ionic/angular'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { ActivatedRoute, Router } from '@angular/router'
import { QrComponent } from 'src/app/qr/qr.component'
import { TranslateService } from '@ngx-translate/core'

@Component({
    selector: 'app-identities',
    templateUrl: './identities.page.html',
    styleUrls: ['./identities.page.scss'],
})
export class IdentitiesPage implements OnInit {

    selectedAsset: any
    addressbalances: any
    addressBalancesObject: any = {}
    addresses: Array<string>
    displayType: string
    base: string
    tickers = {}

    constructor(
        private platform: Platform,
        private metaverseService: MetaverseService,
        public modalCtrl: ModalController,
        public walletService: WalletService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public modalController: ModalController,
        private translate: TranslateService,
    ) {
        this.addressbalances = {}
        this.selectedAsset = this.activatedRoute.snapshot.params.symbol
        this.displayType = this.selectedAsset == 'ETP' ? 'ETP' : 'asset'

        this.metaverseService.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length) {
                    this.router.navigate(['/'])
                } else {
                    this.showBalances()
                }
            })

    }

    ngOnInit() { }

    ionViewDidEnter() {
        this.loadTickers()
    }

    showBalances() {
        return this.metaverseService.getAddresses()
            .then((_: string[]) => {
                this.addresses = _
                return this.metaverseService.getAddressBalances()
                    .then((addressbalances) => {
                        this.addressBalancesObject = addressbalances
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

    private async loadTickers() {
        [this.base, this.tickers] = await this.metaverseService.getBaseAndTickers()
    }

    canAddAddress = () => this.platform.is('mobile') && !this.platform.is('mobileweb')

    addAddresses = () => console.log('go to add address page')

    history = (asset, address) => this.router.navigate(['account', 'history', asset], { queryParams: { addresses: [address] } })

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    async show(address) {
        const content = address
        const title = address

        const qrcodeModal = await this.modalController.create({
            component: QrComponent,
            componentProps: {
                title,
                content,
            }
        })
        await qrcodeModal.present()
    }

}
