import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-reorder',
    templateUrl: 'reorder.html',
})
export class ReorderPage {

    assetOrder: Array<string>
    originalAssetOrder: Array<string>
    hiddenAsset: Array<string> = []
    originalHiddenAsset: Array<string> = []
    icons: any = {}
    reordered: boolean = false

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        public translate: TranslateService,
        public platform: Platform,
        private wallet: WalletServiceProvider
    ) { }

    ionViewDidEnter() {
        this.mvs.assetOrder()
            .then(assetOrder => this.assetOrder = assetOrder)
            .then(() => {
                this.originalAssetOrder = this.assetOrder.slice(0)
                let iconsList = this.wallet.getMstIcons()
                this.assetOrder.forEach((symbol) => {
                    this.icons[symbol] = iconsList.indexOf(symbol) !== -1 ? symbol : 'default_mst'
                })
            })
        this.mvs.getHiddenMst()
            .then(hiddenAsset => {
                this.hiddenAsset = hiddenAsset
                this.originalHiddenAsset = hiddenAsset.slice(0)
            })
    }

    async save(assetOrder) {
        await this.mvs.setAssetOrder(assetOrder)
        await this.mvs.setHiddenMst(this.hiddenAsset)
        this.navCtrl.pop()
    }

    compareArray(array1, array2) {
        if (array1 && array2 && array1.length === array2.length) {
            for (let i = 0; i < array1.length; i++) {
                if (array1[i] !== array2[i]) {
                    return false
                }
            }
            return true
        } else {
            return false
        }
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    show(symbol) {
        for (let i = 0; i < this.hiddenAsset.length; i++) {
            if (this.hiddenAsset[i] === symbol) {
                this.hiddenAsset.splice(i, 1);
                i--;
            }
        }
    }

    hide(symbol) {
        this.hiddenAsset.push(symbol)
    }

    isVisible = symbol => !this.hiddenAsset || this.hiddenAsset.indexOf(symbol) == -1

    errorImg = e => e.target.remove()

}
