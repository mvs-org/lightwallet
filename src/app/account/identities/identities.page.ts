import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { MetaverseService } from '../../services/metaverse.service'
import { WalletService } from '../../services/wallet.service'
import { VmService } from '../../services/vm.service'
import { Router } from '@angular/router'
import { QrComponent } from '../../qr/qr.component'
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
    vmAddress: any = {}

    constructor(
        private metaverseService: MetaverseService,
        public modalCtrl: ModalController,
        public walletService: WalletService,
        public vmService: VmService,
        private router: Router,
        private actionSheetService: ActionSheetService,
    ) {

        this.isMobile = this.walletService.isMobile()

        this.metaverseService.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length) {
                    this.router.navigate(['/'])
                }
            })

    }

    ngOnInit() { }

    async ionViewDidEnter() {
        this.loadTickers()
        this.showBalances()
        const vmAddresses = await this.walletService.getVmAddresses()
        this.vmAddress = vmAddresses[0] || {}
        if(this.vmAddress.address) {
            this.vmAddress.balance = await this.vmService.balanceOf(this.vmAddress.address)
        }
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

    sendVm = (asset, sender) => this.router.navigate(['account', 'send-vm', asset], { state: { data: { sender } } })

    swap = () => this.router.navigate(['account',  'swap'])

    exportPrivateKey = () => this.router.navigate(['account', 'identities', 'export-private-key-vm'])

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

    async mobileMenu(address, type = 'metaverse') {
        const buttons = [
            {
                icon: 'qr-code',
                text: 'IDENTITIES.BUTTON.QRCODE',
                action: 'qrcode',
            },
        ]
        if(type === 'metaverse') {
            buttons.push(
                {
                    icon: 'time',
                    text: 'IDENTITIES.BUTTON.HISTORY',
                    action: 'history',
                },
            )
        } else if(type === 'hex') {
            buttons.push(
                {
                    icon: 'swap-horizontal',
                    text: 'IDENTITIES.BUTTON.SWAP',
                    action: 'swap',
                },
                {
                    icon: 'key',
                    text: 'IDENTITIES.BUTTON.EXPORT_PRIVATE_KEY',
                    action: 'key',
                },
            )
        }
        const result = await this.actionSheetService.default('', '', buttons)
        switch (result) {
            case 'qrcode':
                this.show(address)
                break
            case 'history':
                this.history(address)
                break
            case 'swap':
                this.swap()
            case 'key':
                this.exportPrivateKey()
            default:
            // action cancelled
        }
    }

}
