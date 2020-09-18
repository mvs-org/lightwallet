import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { MetaverseService } from '../../services/metaverse.service'
import { WalletService } from '../../services/wallet.service'
import { Router } from '@angular/router'
import { QrComponent } from '../../qr/qr.component'
import { ClipboardService } from 'ngx-clipboard'
import { ToastService } from '../../services/toast.service'
import { ActionSheetService } from '../../services/action-sheet.service'

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
        private metaverseService: MetaverseService,
        public modalCtrl: ModalController,
        public walletService: WalletService,
        private router: Router,
        private actionSheetService: ActionSheetService,
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

    send = (asset, sender) => this.router.navigate(['account', 'send', asset], { state: { data: { sender } } })

    async show(address) {
        address = 'https://app.myetpwallet.com/send/DNA?message=test&recipient=abc'
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

    async mobileMenu(address) {
        const buttons = [
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
        const result = await this.actionSheetService.default('', '', buttons)
        switch (result) {
            case 'qrcode':
                this.show(address)
                break
            case 'history':
                this.history(address)
                break
            default:
            // action cancelled
        }
    }

    async copy(textToCopy, type) {
        try {
            await this.clipboardService.copyFromContent(textToCopy)
            switch (type) {
                case 'address':
                    this.toastService.simpleToast('IDENTITIES.TOAST.ADDRESS_COPIED')
                    break
                case 'avatar':
                    this.toastService.simpleToast('IDENTITIES.TOAST.AVATAR_COPIED')
                    break
                default:
                    this.toastService.simpleToast('IDENTITIES.TOAST.COPIED')
            }
        } catch (error) {
            console.log('Error while copying the address')
        }
    }
}
