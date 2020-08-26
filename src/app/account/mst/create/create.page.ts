import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Router, ActivatedRoute } from '@angular/router'
import { Platform } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { AlertService } from 'src/app/services/alert.service'
import { AppService } from 'src/app/services/app.service'
import { Location } from '@angular/common'

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {


  selectedAsset: any
  addresses: Array<string>
  balance: number
  decimals: number
  showBalance: number
  quantity: string
  addressbalances: Array<any>
  myaddressbalances: Array<any>
  secondaryissue: boolean
  secondaryissueThreshold: number
  feeAddress: string
  etpBalance: number
  symbol: string
  max_supply: string
  custom_max_supply: string
  asset_decimals = 4
  issuer_name: string
  description: string
  issue_address: string
  certs: Array<any>
  list_domain_certs: Array<any> = []     // all my domain certificates
  list_my_domain_certs: Array<any> = []  // domain certificates own by the avatar currently selected
  list_my_naming_certs: Array<any> = []
  msts: Array<any>
  symbol_check: string
  error_loading_certs = false
  error_too_high_max_supply = false
  avatars: Array<any>
  no_avatar = false
  no_avatar_placeholder: string
  bounty_fee: number
  default_bounty_fee: number
  total_fee: number
  attenuation_model: string
  blocktime: number
  lock = false
  mining = false
  mstMiningModel: any
  showAdvanced = false
  checkSymbol = false

  constructor(
    private metaverseService: MetaverseService,
    private router: Router,
    private alertService: AlertService,
    public platform: Platform,
    private translate: TranslateService,
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
  ) { }

  async ngOnInit() {
    this.selectedAsset = 'ETP'
    this.feeAddress = 'auto'
    this.max_supply = ''
    this.custom_max_supply = ''
    this.symbol = ''
    this.description = ''
    this.issuer_name = this.activatedRoute.snapshot.params.avatar_name
    this.issue_address = this.activatedRoute.snapshot.params.avatar_address
    if (!this.issue_address) {
      this.translate.get('CREATE_MST.ADDRESS_SELECT_AVATAR').subscribe((message: string) => {
        this.issue_address = message
      })
    }
    this.translate.get('CREATE_MST.NO_AVATAR_PLACEHOLDER').subscribe((message: string) => {
      this.no_avatar_placeholder = message
    })
    this.description = ''
    this.secondaryissue = false
    this.secondaryissueThreshold = 51

    // Load addresses
    this.addresses = await this.metaverseService.getAddresses()

    if (!(this.selectedAsset && this.selectedAsset.length)) {
      this.router.navigate(['account', 'portfolio'])
    }

    // Load balances
    const balances = await this.metaverseService.getBalances()

    const balance: any = balances[this.selectedAsset]
    this.balance = (balance && balance.available) ? balance.available : 0
    this.decimals = balance.decimals
    this.etpBalance = balances.ETP.available
    this.showBalance = this.balance
    const addressbalances = await this.metaverseService.getAddressBalances()
    this.addressbalances = addressbalances
    const addrblncs = []
    if (Object.keys(addressbalances).length) {
      Object.keys(addressbalances).forEach((address) => {
        if (addressbalances[address][this.selectedAsset] && addressbalances[address][this.selectedAsset].available) {
          addrblncs.push({
            address,
            balance: addressbalances[address][this.selectedAsset].available
          })
        }
      })
    }
    this.myaddressbalances = addrblncs

    this.bounty_fee = this.appService.default_fees.bountyShare
    this.default_bounty_fee = this.bounty_fee
    this.total_fee = this.appService.default_fees.mstIssue

    const fees = await this.metaverseService.getFees()
    this.bounty_fee = fees.bountyShare
    this.default_bounty_fee = this.bounty_fee
    this.total_fee = fees.mstIssue

    this.init()
  }

  init() {
    this.loadAvatars()
      .then(() => this.loadCerts())
      .then(() => this.symbolChanged())
      .catch(console.error)
  }

  validMaxSupply = (maxSupply, assetDecimals) =>
    maxSupply === 'custom'
    || (maxSupply > 0
      && ((assetDecimals === undefined) || (Math.floor(parseFloat(maxSupply) * Math.pow(10, assetDecimals))) <= 10000000000000000))

  validMaxSupplyCustom = (custom_max_supply, asset_decimals) =>
    custom_max_supply > 0
    && ((asset_decimals === undefined) || (Math.floor(parseFloat(custom_max_supply) * Math.pow(10, asset_decimals))) <= 10000000000000000)

  validDecimals = (assetDecimals) => assetDecimals >= 0 && assetDecimals <= 8

  validSymbol = (symbol) => (symbol.length > 2) && (symbol.length < 64) && (!/[^A-Za-z0-9.]/g.test(symbol))

  validName = (issuerName) => (issuerName !== undefined && issuerName.length > 0)

  validAddress = (issueAddress) => (issueAddress !== undefined && issueAddress.length > 0)

  validDescription = (description) => description && (description.length > 0) && (description.length < 64)

  validIssueAddress = (address) => this.metaverseService.validAddress(address)

  create() {
    return this.alertService.showLoading()
      .then(() => this.metaverseService.createIssueAssetTx(
        this.symbol,
        Math.floor(parseFloat(this.max_supply === 'custom' ? this.custom_max_supply : this.max_supply) * Math.pow(10, this.asset_decimals)),
        this.asset_decimals,
        this.issuer_name,
        this.description,
        (this.secondaryissue) ? (this.secondaryissueThreshold === 0) ? -1 : this.secondaryissueThreshold : 0,
        false,
        this.issue_address,
        undefined,
        (this.symbol_check === 'available'),
        (this.symbol_check === 'naming_owner'),
        (this.showAdvanced) ? this.bounty_fee * this.total_fee / 100 : this.default_bounty_fee / 100 * this.total_fee,
        (this.showAdvanced && this.lock) ? this.attenuation_model : undefined,
        this.mining ? this.mstMiningModel : undefined
      ))
      .catch((error) => {
        console.error(error)
        this.alertService.stopLoading()
        if (error.message === 'ERR_INSUFFICIENT_BALANCE') {
          this.alertService.showError('MESSAGE.ISSUE_INSUFFICIENT_BALANCE', '')
        } else {
          this.alertService.showError('MESSAGE.CREATE_TRANSACTION', error.message)
        }
        throw Error('ERR_CREATE_TX')
      })
  }

  async confirm() {
    const confirm = await this.alertService.alertConfirm(
      'CREATE_MST.CONFIRMATION.TITLE',
      'CREATE_MST.CONFIRMATION.SUBTITLE',
      'CREATE_MST.CONFIRMATION.CANCEL',
      'CREATE_MST.CONFIRMATION.OK'
    )
    if (confirm) {
      this.send()
    }
  }

  send() {
    this.create()
      .then((result) => {
        const tx = result.encode().toString('hex')
        this.router.navigate(['account', 'confirm'], { state: { data: { tx } } })
        this.alertService.stopLoading()
      })
      .catch((error) => {
        switch (error.message) {
          case 'ERR_CONNECTION':
            this.alertService.showError('ERROR_SEND_TEXT', '')
            break
          case 'ERR_CREATE_TX':
            // already handle in create function
            break
          case 'ERR_BROADCAST':
            this.translate.get('MESSAGE.ONE_TX_PER_BLOCK').subscribe((message: string) => {
              this.alertService.showError('MESSAGE.BROADCAST_ERROR', message)
            })
            break
          case 'ERR_INSUFFICIENT_BALANCE':
            this.alertService.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
            break
          default:
            this.alertService.showError('MESSAGE.CREATE_TRANSACTION', error.message)
        }
      })
  }

  format = (quantity, decimals) => quantity / Math.pow(10, decimals)

  round = (val: number) => Math.round(val * 100000000) / 100000000

  loadCerts() {
    return this.metaverseService.listCerts()
      .then((certs) => {
        this.certs = certs
        this.checkCerts(certs)
      })
      .catch((error) => {
        console.error(error)
        this.error_loading_certs = true
      })
  }

  checkCerts(certs) {
    this.list_my_domain_certs = []
    this.list_domain_certs = []
    this.list_my_naming_certs = []
    certs.forEach(cert => {
      if (cert.attachment.cert === 'domain') {
        if (cert.attachment.owner === this.issuer_name) {
          this.list_my_domain_certs.push(cert.attachment.symbol)
        } else {
          this.list_domain_certs.push(cert.attachment.symbol)
        }
      } else if ((cert.attachment.cert === 'naming') && (cert.attachment.owner === this.issuer_name)) {
        this.list_my_naming_certs.push(cert.attachment.symbol)
      }
    })
    this.symbolChanged()
  }

  loadAvatars() {
    return this.metaverseService.listAvatars()
      .then((avatars) => {
        this.avatars = avatars
        if (this.avatars.length === 0) {
          this.no_avatar = true
        }
      })
  }

  setAttenuationModel = (output: any) => {
    this.attenuation_model = output.attenuation_model
  }

  setMiningModel = (model: string) => {
    this.mstMiningModel = model
  }

  async symbolChanged() {
    this.checkSymbol = true
    if (this.symbol && this.symbol.length >= 3) {
      this.symbol = this.symbol.trim()
      this.symbol = this.symbol.toUpperCase()
      try {
        const result = await Promise.all([this.metaverseService.suggestMST(this.symbol), this.symbol])
        if (this.symbol !== result[1]) {
          return
        } else if (result[0].indexOf(this.symbol) !== -1) {
          this.symbol_check = 'exist'
        } else {
          const domain = this.symbol.split('.')[0]
          if (this.list_my_naming_certs && this.list_my_naming_certs.indexOf(this.symbol) !== -1) {
            this.symbol_check = 'naming_owner'
          } else if (this.list_my_domain_certs && this.list_my_domain_certs.indexOf(domain) !== -1) {
            this.symbol_check = 'domain_owner'
          } else if (this.list_domain_certs && this.list_domain_certs.indexOf(domain) !== -1) {
            this.symbol_check = 'other_avatar_domain_owner'
          } else {
            const response = await this.metaverseService.getCert(domain, 'domain')
            if (domain !== this.symbol.split('.')[0].toUpperCase()) {
              return
            }
            if (!response || !response.result) {
              this.symbol_check = 'cant_check_domain'
            } else if (response.result.length > 0) {
              this.symbol_check = 'not_domain_owner'
            } else {
              this.symbol_check = 'available'
            }
          }
        }
      } catch (e) {
        this.symbol_check = 'cant_check_available'
      }
    } else {
      this.symbol_check = 'too_short'
    }
    this.checkSymbol = false
  }

  maxSupplyChanged = () => {
    const maxSupply = this.max_supply !== 'custom' ? this.max_supply : this.custom_max_supply
    if (this.asset_decimals !== undefined && (Math.floor(parseFloat(maxSupply) * Math.pow(10, this.asset_decimals))) > 10000000000000000) {
      this.error_too_high_max_supply = true
    } else {
      this.error_too_high_max_supply = false
    }

  }

  issuerChanged = () => {
    this.checkCerts(this.certs)
    this.avatars.forEach((avatar) => {
      if (avatar.symbol === this.issuer_name) {
        this.issue_address = avatar.address
        return
      }
    })
  }

  cancel() {
    this.location.back()
  }

}
