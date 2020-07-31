import { Component, OnInit } from '@angular/core'
import { Platform, ModalController, PopoverController } from '@ionic/angular'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { Router } from '@angular/router'
import { QrComponent } from 'src/app/qr/qr.component'
import { PopoverComponent } from '../components/popover/popover.component'
import { ClipboardService } from 'ngx-clipboard'
import { ToastService } from 'src/app/services/toast.service'

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
        public popoverController: PopoverController,
        private clipboardService: ClipboardService,
        private toastService: ToastService,
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

    history = (address) => this.router.navigate(['account', 'history', 'ETP'], { state: { data: { addresses: [address] } } })

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

    async presentPopover(address) {
        const buttons = [
            {
                icon: 'copy',
                text: 'IDENTITIES.BUTTON.COPY',
                action: 'copy',
            },
            {
                icon: 'qr-code',
                text: 'IDENTITIES.BUTTON.QRCODE',
                action: 'qrcode',
            },
            {
                icon: 'time',
                text: 'IDENTITIES.BUTTON.HISTORY',
                action: 'history',
            },
        ]
        const popover = await this.popoverController.create({
            component: PopoverComponent,
            componentProps: {
                buttons
            },
            translucent: true
        })
        popover.onWillDismiss().then(result => {
            console.log(result)
            if (result.data && result.data.action) {
                console.log(result.data.action)
                switch (result.data.action) {
                    case 'copy':
                        this.copyAddress(address)
                        break
                    case 'qrcode':
                        this.show(address)
                        break
                    case 'history':
                        this.history(address)
                        break
                    default:
                        // action cancelled
                }
                //this.getLastElement(result.data.text.toString())
            }
            popover.remove()
        })
        await popover.present()
    }

    async copyAddress(address) {
        try {
            await this.clipboardService.copyFromContent(address)
            this.toastService.simpleToast('IDENTITIES.TOAST.ADDRESS_COPIED')
        } catch (error) {
            console.log('Error while copying the address')
        }
    }
}
