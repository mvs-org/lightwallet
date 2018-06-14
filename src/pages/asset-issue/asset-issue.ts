import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController, Loading, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'page-asset-issue',
    templateUrl: 'asset-issue.html',
})
export class AssetIssuePage {

    selectedAsset: any
    addresses: Array<string>
    balance: number
    decimals: number
    showBalance: number
    loading: Loading
    quantity: string
    rawtx: string
    passcodeSet: any
    addressbalances: Array<any>
    myaddressbalances: Array<any>
    sendFrom: string
    secondaryissue: boolean
    secondaryissue_threshold: number;
    feeAddress: string
    passphrase: string
    etpBalance: number
    symbol: string
    max_supply: string
    custom_max_supply: string;
    asset_decimals: number = 8
    issuer_name: string
    description: string
    issue_address: string
    certs: Array<any>;
    list_domain_certs: Array<any> = [];
    list_my_domain_certs: Array<any> = [];
    list_my_naming_certs: Array<any> = [];
    msts: Array<any>;
    list_msts: Array<any> = [];
    symbol_check: string;
    error_loading_msts: boolean = false
    error_loading_certs: boolean = false

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private translate: TranslateService) {

        this.selectedAsset = "ETP"
        this.sendFrom = 'auto'
        this.issue_address = navParams.get('avatar_address')
        this.feeAddress = 'auto'
        this.max_supply = ''
        this.custom_max_supply = ''
        this.symbol = ''
        this.issuer_name = navParams.get('avatar_name')
        this.description = ''
        this.passphrase = ''
        this.secondaryissue = false
        this.secondaryissue_threshold = 51

        //Load addresses
        mvs.getAddresses()
            .then((_: Array<string>) => {
                this.addresses = _
            })

        if(!(this.selectedAsset && this.selectedAsset.length))
            this.navCtrl.setRoot('AccountPage')

        //Load balances
        mvs.getBalances()
            .then((balances) => {
                let balance: any = balances[this.selectedAsset]
                this.balance = (balance && balance.available) ? balance.available : 0
                this.decimals = balance.decimals
                this.etpBalance = balances['ETP'].available
                this.showBalance = this.balance
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        this.addressbalances = addressbalances
                        let addrblncs = []
                        if (Object.keys(addressbalances).length) {
                            Object.keys(addressbalances).forEach((address) => {
                                if (addressbalances[address][this.selectedAsset] && addressbalances[address][this.selectedAsset].available) {
                                    addrblncs.push({ "address": address, "balance": addressbalances[address][this.selectedAsset].available })
                                }
                            })
                        }
                        this.myaddressbalances = addrblncs
                    })
            })

    }

    ionViewDidEnter() {
        console.log('Asset issue page loaded')
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    ionViewDidLoad() {
        this.loadCerts()
            .then(()=>this.loadMsts())
            .then(()=>this.symbolChanged())
            .catch(console.error);
    }

    onFromAddressChange(event) {
        if (this.sendFrom == 'auto') {
            this.showBalance = this.balance
        } else {
            if (this.addressbalances.length)
                this.addressbalances.forEach((addressbalance) => {
                    if (addressbalance.address == this.sendFrom)
                        this.showBalance = addressbalance.balance
                })
        }
    }

    onSendToAddressChange(event) {

    }

    //validSecondaryissueThreshold = (threshold) => (threshold>=-1&&threshold<=100)

    validMaxSupply = (max_supply, asset_decimals) => max_supply == 'custom' || (max_supply > 0 && ((asset_decimals == undefined)||(Math.floor(parseFloat(max_supply) * Math.pow(10, asset_decimals))) <= 10000000000000000))

    validMaxSupplyCustom = (max_supply_custom, asset_decimals) => max_supply_custom > 0 && ((asset_decimals == undefined)||(Math.floor(parseFloat(max_supply_custom) * Math.pow(10, asset_decimals))) <= 10000000000000000)

    validDecimals = (asset_decimals) => asset_decimals >= 0 && asset_decimals <= 8

    validSymbol = (symbol) => (symbol.length > 2) && (symbol.length < 64) && (!/[^A-Za-z0-9.]/g.test(symbol))

    //validName = (issuer_name) => (issuer_name.length > 0) && (issuer_name.length < 64) && (!/[^A-Za-z0-9.]/g.test(issuer_name))

    validDescription = (description) => (description.length > 0) && (description.length < 64)

    validPassword = (passphrase) => (passphrase.length > 0)

    validIssueAddress = this.mvs.validAddress

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    preview() {
        this.create()
            .then((tx) => {
            console.log('transaction details: '+tx)
                this.rawtx = tx.encode().toString('hex')
                this.loading.dismiss()
            })
            .catch((error)=>{
                this.loading.dismiss()
            })
    }

    create() {
        return this.showLoading()
            .then((addresses) => this.mvs.createIssueAssetTx(
                this.passphrase,
                this.toUpperCase(this.symbol),
                Math.floor(parseFloat(this.max_supply == 'custom' ? this.custom_max_supply : this.max_supply) * Math.pow(10, this.asset_decimals)),
                this.asset_decimals,
                this.issuer_name,
                this.description,
                (this.secondaryissue) ? (this.secondaryissue_threshold == 0) ? -1 : this.secondaryissue_threshold : 0,
                false,
                this.issue_address,
                (this.sendFrom != 'auto') ? this.sendFrom : null,
                undefined,
                (this.symbol_check == "available"),
                (this.symbol_check == "naming_owner")
            ))
            .catch((error) => {
                console.error(error)
                if (error.message == "ERR_DECRYPT_WALLET")
                    this.showError('MESSAGE.PASSWORD_WRONG','')
                else if (error.message == "ERR_INSUFFICIENT_BALANCE")
                    this.showError('MESSAGE.ISSUE_INSUFFICIENT_BALANCE','')
                else
                    this.showError('MESSAGE.CREATE_TRANSACTION',error.message)
                throw Error('ERR_CREATE_TX')
            })
    }

    confirm() {
        this.translate.get('ISSUE.CONFIRMATION_TITLE').subscribe((txt_title: string) => {
            this.translate.get('ISSUE.CONFIRMATION_SUBTITLE').subscribe((txt_subtitle: string) => {
                this.translate.get('REGISTER_MST').subscribe((txt_create: string) => {
                    this.translate.get('CANCEL').subscribe((txt_cancel: string) => {
                    const alert = this.alertCtrl.create({
                        title: txt_title,
                        subTitle: txt_subtitle,
                        buttons: [
                            {
                                text: txt_create,
                                handler: data => {
                                    // need error handling
                                    this.send()
                                }
                            },
                            {
                                  text: txt_cancel,
                                  role: 'cancel'
                            }
                        ]
                    });
                    alert.present(prompt)
                  });
              });
          });
      });
    }

    send() {
        this.create()
            .then((tx) => this.mvs.broadcast(tx.encode().toString('hex'), 1000000000))
            .then((result: any) => {
                this.navCtrl.pop()
                this.translate.get('SUCCESS_SEND_TEXT').subscribe((message: string) => {
                    this.showSent(message, result.hash)
                })
            })
            .catch((error) => {
                this.loading.dismiss()
                if(error.message=='ERR_CONNECTION')
                    this.showError('ERROR_SEND_TEXT','')
                else if (error.message == 'ERR_BROADCAST') {
                    this.translate.get('MESSAGE.ONE_TX_PER_BLOCK').subscribe((message: string) => {
                        this.showError('MESSAGE.BROADCAST_ERROR',message)
                    })
                }
            })
    }

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    round = (val:number) => Math.round(val*100000000)/100000000

    showLoading() {
        return new Promise((resolve, reject) => {
            this.translate.get('MESSAGE.LOADING').subscribe((loading: string) => {
                this.loading = this.loadingCtrl.create({
                    content: loading,
                    dismissOnPageChange: true
                })
                this.loading.present()
                resolve()
            })
        })
    }

    showSent(text, hash) {
        this.translate.get('MESSAGE.SUCCESS').subscribe((title: string) => {
            this.translate.get('OK').subscribe((ok: string) => {
                let alert = this.alertCtrl.create({
                    title: title,
                    subTitle: text + hash,
                    buttons: [ok]
                })
                alert.present(prompt)
            })
        })
    }

    showAlert(text) {
        this.translate.get('MESSAGE.ERROR_TITLE').subscribe((title: string) => {
            this.translate.get('OK').subscribe((ok: string) => {
                let alert = this.alertCtrl.create({
                    title: title,
                    subTitle: text,
                    buttons: [ok]
                })
                alert.present(prompt)
            })
        })
    }

    toUpperCase(text) {
        let textUpperCase: string = ''
        for(let i=0;i<text.length;i++){
            textUpperCase = textUpperCase + text.charAt(i).toUpperCase()
        }
        return textUpperCase
    }

    showError(message_key, error) {
        this.translate.get(['MESSAGE.ERROR_TITLE', message_key, 'OK']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.ERROR_TITLE'],
                subTitle: translations[message_key],
                message: error,
                buttons: [{
                    text: translations['OK']
                }]
            });
            alert.present(alert);
        })
    }

    loadCerts(){
        return this.mvs.listCerts()
            .then((certs) => {
                this.certs = certs;
                certs.forEach(cert=>{
                    if(cert.attachment.cert == 'domain') {
                        if(cert.attachment.owner == this.issuer_name) {
                            this.list_my_domain_certs.push(cert.attachment.symbol)
                        } else {
                            this.list_domain_certs.push(cert.attachment.symbol)
                        }
                    } else if((cert.attachment.cert == 'naming') && (cert.attachment.owner == this.issuer_name)) {
                        this.list_my_naming_certs.push(cert.attachment.symbol)
                    }
                })
            })
            .catch((error) => {
                console.error(error)
                this.error_loading_certs = true;
            })
    }

    loadMsts(){
        return this.mvs.getListMst()
            .then((msts) => {
                this.msts = msts;
                msts.forEach(mst=>{
                    this.list_msts.push(mst.symbol)
                })
            })
            .catch((error) => {
                console.error(error)
                this.error_loading_msts = true;
            })
    }

    symbolChanged = () => {
        if (this.symbol && this.symbol.length >= 3) {
            let symbol = this.symbol.toUpperCase()
            let domain = symbol.split('.')[0]
            if(this.list_msts && this.list_msts.indexOf(symbol) !== -1) {
                this.symbol_check = "exist"
            } else if(this.list_my_naming_certs && this.list_my_naming_certs.indexOf(symbol) !== -1) {
                this.symbol_check = "naming_owner"
            } else if(this.list_my_domain_certs && this.list_my_domain_certs.indexOf(domain) !== -1) {
                this.symbol_check = "domain_owner"
            } else if(this.list_my_domain_certs && this.list_domain_certs.indexOf(domain) !== -1) {
                this.symbol_check = "not_domain_owner"
            } else {
                this.symbol_check = "available"
            }
        } else {
            this.symbol_check = "too_short"
        }
    }

}
