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
  miningModel: MiningModel = {
    initial: undefined,
    interval: undefined,
    base: undefined,
    basePercent: undefined,
  }
  showSecondaryHistory = false
  currentMstMiningReward = 0
  currentEtpMiningRewardPow = 0
  currentEtpMiningRewardPos = 0
  loadingMstInfo = true

  stakelist: Array<any> = []
  stakelistChartData: Array<any> = []
  loadingStakelist = true
  stakelistFullyLoaded = false
  colorScheme = {
    domain: [
      '#006599', // dark blue
      '#0099CB', // blue
      '#fe6700', // orange
      '#ffd21c', // yellow
      '#be0000', // red
      '#fe0000', // red
    ]
  }

  balanceColorScheme = {
    domain: [
      '#00bb00', //green
      '#be0000', // red
      '#0099CB', // blue
      // '#ffd21c', // yellow
    ]
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    public walletService: WalletService,
    private appService: AppService,
    private metaverseService: MetaverseService,
  ) { }

  async ngOnInit() {
    this.symbol = this.activatedRoute.snapshot.params.symbol

    /* Load balances */
    const balances = await this.metaverseService.getBalances()
    if (this.symbol === 'ETP') {
      this.balance = balances.ETP
    } else {
      this.balance = balances.MST[this.symbol]
        || {
        available: 0,
        frozen: 0,
        unconfirmed: 0,
        decimals: 0,
      }
    }
    this.loadingBalance = false

    const icons = await this.metaverseService.getDefaultIcon()
    this.icon = icons.MST[this.symbol] || 'assets/icon/default_mst.png'

    /* Load MST info */
    if (this.symbol === 'ETP') {
      this.icon = 'assets/icon/ETP.png'
      this.asset = {
        symbol: 'ETP',
        original_quantity: 10000000000000000,
        quantity: 10000000000000000,
        secondaryissue_threshold: 0,
        decimals: 8,
        issuer: 'mvs.org',
        address: '',
        issue_tx: '',
        height: 0,
        description: 'MVS Official Token',
        minedQuantity: undefined,
        burnedQuantity: undefined,
        from_did: undefined,
        is_secondaryissue: false,
        to_did: undefined,
        issue_index: undefined,
        confirmed_at: undefined,
        mining_model: undefined,
        updates: [],
      }
      // this.miningModel = {
      // initial: 300000000,
      // interval: 500000,
      // base: 0.95,
      // basePercent: 5,
      // }
    } else {
      this.asset = await this.metaverseService.getMst(this.symbol)

      if (this.asset.mining_model) {
        const miningModel = this.asset.mining_model.match(/^initial:(.+),interval:(.+),base:(.+)$/)
        this.miningModel = {
          initial: parseInt(miningModel[1], 10),
          interval: parseInt(miningModel[2], 10),
          base: parseInt(miningModel[3], 10),
          basePercent: Math.round((1 - parseInt(miningModel[3], 10)) * 100)
        }
      }
    }

    this.loadingMstInfo = false

    /* Load stakelist */
    this.getStakelist()

  }

  async getStakelist() {
    if (!this.loadingStakelist || this.stakelist.length === 0) {
      this.loadingStakelist = true
      const options = {
        limit: 10,
        lastAddress: this.stakelist.length === 0 ? undefined : this.stakelist[this.stakelist.length - 1].name
      }
      const result = await this.metaverseService.getStake(this.symbol, options)
      this.stakelist = this.stakelist.concat(result.map(e => ({ name: e.a, value: e.q / Math.pow(10, this.asset.decimals), q: e.q })))
      this.stakelistChartData = this.getStakelistData(this.stakelist)
      if (result && result.length < options.limit) {
        this.stakelistFullyLoaded = true
      }
      this.loadingStakelist = false
    }
  }

  getStakelistData(list: Array<any>) {
    const sum = list.reduce((acc, cur) => acc + cur.value, 0)
    return [...list, { name: 'Rest', value: (this.asset.quantity + (this.asset.minedQuantity || 0)) / Math.pow(10, this.asset.decimals) - sum }]
  }

  checkTx = (type, data) => this.walletService.openLink(this.explorerURL(type, data))

  explorerURL = (type, data) => (this.appService.network === 'mainnet') ? 'https://explorer.mvs.org/' + type + '/' + data : 'https://explorer-testnet.mvs.org/' + type + '/' + data

  format(value, decimals = 0){
    return value / Math.pow(10, decimals)
  }

}
