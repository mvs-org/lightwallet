import { Component, OnInit } from '@angular/core'
import { Platform, ModalController } from '@ionic/angular'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { Router } from '@angular/router'
import { QrComponent } from 'src/app/qr/qr.component'

@Component({
    selector: 'app-identities',
    templateUrl: './identities.page.html',
    styleUrls: ['./identities.page.scss'],
})
export class IdentitiesPage implements OnInit {

    addressBalancesObject: any = {}
    addresses: string[]
    base: string
    tickers = {}
    isMobile: boolean
    loading = true
    msts = []

    constructor(
        private platform: Platform,
        private metaverseService: MetaverseService,
        public modalCtrl: ModalController,
        public walletService: WalletService,
        private router: Router,
    ) {

        this.isMobile = this.walletService.isMobile()

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

    async showBalances() {
        const addresses = await this.metaverseService.getAddresses()
        this.addresses = addresses
        this.addressBalancesObject = await this.metaverseService.getAddressBalances()

        const order = await this.metaverseService.assetOrder()
        const hidden = await this.metaverseService.getHiddenMst()
        const icons = await this.metaverseService.getDefaultIcon()

        order.forEach((symbol) => {
            this.msts.push({
                symbol,
                icon: icons.MST[symbol] || 'assets/icon/default_mst.png',
                hidden: hidden.indexOf(symbol) !== -1,
                order: order.indexOf(symbol)
            })
        })
        this.loading = false
    }

    private async loadTickers() {
        [this.base, this.tickers] = await this.metaverseService.getBaseAndTickers()
    }

    canAddAddress = () => this.platform.is('mobile') && !this.platform.is('mobileweb')

    history = (asset, address) => this.router.navigate(['account', 'history', asset], { state: { data: { addresses: [address] } } })

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    async show(address) {
        const content = address
        const title = address

        const qrcodeModal = await this.modalCtrl.create({
            component: QrComponent,
            componentProps: {
                title,
                content,
            }
        })
        await qrcodeModal.present()
    }

    createAsset(avatarName: string, avatarAddress: string) {
        this.router.navigate(['account', 'mst', 'create'])
    }

    registerMIT(avatarName: string, avatarAddress: string) {
        this.router.navigate(['account', 'mit', 'create'])
    }

    errorImg = (e) => e.target.remove()

}
