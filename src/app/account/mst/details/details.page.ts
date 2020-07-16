import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { WalletService } from 'src/app/services/wallet.service'
import { AppService } from 'src/app/services/app.service'
import { MetaverseService } from 'src/app/services/metaverse.service'

class MstInfo {
  constructor(
    public minedQuantity: number,
    public burnedQuantity: number,
    public address: string,
    public description: string,
    public from_did: string,
    public is_secondaryissue: boolean,
    public issuer: string,
    public quantity: number,
    public secondaryissue_threshold: number,
    public symbol: string,
    public to_did: string,
    public decimals: number,
    public issue_tx: string,
    public issue_index: number,
    public height: number,
    public confirmed_at: number,
    public original_quantity: number,
    public mining_model: string,
    public updates: Array<any>,
  ) { }
}

class MiningModel {
  constructor(
    public initial: number,
    public interval: number,
    public base: number,
    public basePercent: number,
  ) { }
}

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  symbol: string
  icon: string
  balance: any

  loadingBalance = true

  asset: MstInfo
  miningModel: MiningModel
  showSecondaryHistory = false
  currentMstMiningReward = 0
  currentEtpMiningRewardPow = 0
  currentEtpMiningRewardPos = 0
  loadingMstInfo = true

  stakelist: Array<any> = []
  loadingStakelist = true
  stakelistFullyLoaded = false

  constructor(
    private activatedRoute: ActivatedRoute,
    public walletService: WalletService,
    private appService: AppService,
    private metaverseService: MetaverseService,
  ) { }

  async ngOnInit() {
    this.symbol = this.activatedRoute.snapshot.params.symbol

    /* Load balances */
    this.balance = (await this.metaverseService.getBalances()).MST[this.symbol]
    this.loadingBalance = false

    const icons = await this.metaverseService.getDefaultIcon()
    this.icon = icons.MST[this.symbol] || 'assets/icon/default_mst.png'

    /* Load MST info */
    this.asset = await this.metaverseService.getMst(this.symbol)

    if (this.asset.mining_model) {
      const miningModel = this.asset.mining_model.match(/^initial:(.+),interval:(.+),base:(.+)$/)
      this.miningModel.initial = parseInt(miningModel[1], 10)
      this.miningModel.interval = parseInt(miningModel[2], 10)
      this.miningModel.base = parseInt(miningModel[3], 10)
      this.miningModel.basePercent = Math.round((1 - this.miningModel.base) * 100)
    }
    this.loadingMstInfo = false

    /* Load stakelist */
    this.getStakelist()

  }

  async getStakelist() {
    if (!this.loadingStakelist || this.stakelist.length === 0) {
      this.loadingStakelist = true
      const options = {
        limit: 20,
        lastAddress: this.stakelist.length === 0 ? undefined : this.stakelist[this.stakelist.length - 1].a
      }
      const result = await this.metaverseService.getStake(this.symbol, options)
      this.stakelist = this.stakelist.concat(result)
      if (result && result.length < options.limit) {
        this.stakelistFullyLoaded = true
      }
      this.loadingStakelist = false
      console.log(this.stakelist)
    }
  }

  checkTx = (type, data) => this.walletService.openLink(this.explorerURL(type, data))

  explorerURL = (type, data) => (this.appService.network === 'mainnet') ? 'https://explorer.mvs.org/' + type + '/' + data : 'https://explorer-testnet.mvs.org/' + type + '/' + data

}
