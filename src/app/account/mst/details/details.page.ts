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
      || {
        available: 0,
        frozen: 0,
        unconfirmed: 0,
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
        address: 'MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve',
        issue_tx: '2a845dfa63a7c20d40dbc4b15c3e970ef36332b367500fd89307053cb4c1a2c1',
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
      //this.miningModel = {
        //initial: 300000000,
        //interval: 500000,
        //base: 0.95,
        //basePercent: 5,
      //}
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
        limit: 5,
        lastAddress: this.stakelist.length === 0 ? undefined : this.stakelist[this.stakelist.length - 1].a
      }
      const result = await this.metaverseService.getStake(this.symbol, options)
      this.stakelist = this.stakelist.concat(result)
      if (result && result.length < options.limit) {
        this.stakelistFullyLoaded = true
      }
      this.loadingStakelist = false
    }
  }

  checkTx = (type, data) => this.walletService.openLink(this.explorerURL(type, data))

  explorerURL = (type, data) => (this.appService.network === 'mainnet') ? 'https://explorer.mvs.org/' + type + '/' + data : 'https://explorer-testnet.mvs.org/' + type + '/' + data

}
