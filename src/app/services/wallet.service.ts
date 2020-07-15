import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Storage } from '@ionic/storage'
import Metaverse from 'metaversejs/dist/metaverse.min.js'
import { CryptoService } from './crypto.service'
import { Platform } from '@ionic/angular'
import { AppService } from './app.service'
@Injectable({
  providedIn: 'root'
})
export class WalletService {

    constructor(
        public http: HttpClient,
        private storage: Storage,
        private appService: AppService,
        private crypto: CryptoService,
        public platform: Platform,
    ) { }

    public export(passphrase) {
        return this.getMnemonic(passphrase)
            .then((mnemonic) => Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.appService.network]))
            .then((seed) => this.crypto.encrypt(seed.toString('hex'), passphrase))
    }

    encryptWalletFromMnemonic(mnemonic, passphrase) {
        return this.crypto.encrypt(mnemonic, passphrase)
            .then((res) => this.dataToKeystoreJson(res))
    }

    dataToKeystoreJson(mnemonic) {
        let tmp = { version: this.appService.version, algo: this.appService.algo, index: this.appService.index, mnemonic: mnemonic }
        return tmp
    }

    getIcons() {
        let result = {
            MST: ['MVS.ZGC', 'MVS.ZDC', 'CSD.CSD', 'PARCELX.GPX', 'PARCELX.TEST', 'SDG', 'META', 'MVS.HUG', 'RIGHTBTC.RT', 'TIPLR.TPC', 'PANDO', 'VALOTY', 'KOALA.KT', 'DNA', 'GKC', 'DAY', 'APO', 'JKB', 'DIA'],
        }
        return result
    }

    exportMemonic() {
        return this.storage.get('wallet')
    }

    isSetup = () => {
        return this.storage.get('wallet')
            .then((wallet) => (wallet != undefined && wallet.index))
    }

    getMnemonic(passphrase) {
        return this.storage.get('wallet')
            .then((wallet) => this.crypto.decrypt(wallet.mnemonic, passphrase))
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET')
            })
    }

    setWallet(wallet) {
        return this.storage.set('wallet', wallet)
    }

    getWallet(passphrase) {
        return this.getSeed(passphrase)
            .then((seed: string) => this.getHDNodeFromSeed(Buffer.from(seed, 'hex')))
            .catch((error) => {
                console.error(error)
                return this.getMnemonic(passphrase)
                    .then((mnemonic) => this.getHDNodeFromMnemonic(mnemonic))
            })
    }

    createWallet() {
        let wallet: any = {}
        return Metaverse.wallet.generateMnemonic()
            .then((mnemonic) => {
                wallet.mnemonic = mnemonic
                return Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.appService.network])
            })
            .then((seed) => {
                wallet.seed = seed.toString('hex')
                return wallet
            })
            .catch((error) => {
                return Error(error.message)
            })
    }

    getHDNodeFromMnemonic(mnemonic) {
        return Metaverse.wallet.fromMnemonic(mnemonic, Metaverse.networks[this.appService.network])
    }

    verifyMessage(message, address, signature) {
        return Metaverse.message.verify(message, address, Buffer.from(signature, 'hex'))
    }

    validateMnemonic(mnemonic) {
        return Metaverse.wallet.validateMnemonic(mnemonic)
    }

    getHDNodeFromSeed(seed) {
        return Metaverse.wallet.fromSeed(seed, Metaverse.networks[this.appService.network])
    }

    setMobileWallet(seed) {
        return this.storage.set('seed', seed)
    }

    setSeed(passphrase) {
        return this.getMnemonic(passphrase)
            .then((mnemonic) => Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.appService.network]))
            .then((seed) => this.crypto.encrypt(seed.toString('hex'), passphrase))
            .then((encseed) => this.storage.set('seed', encseed))
    }

    setSeedMobile(passphrase, mnemonic) {
        return Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.appService.network])
            .then((seed) => this.crypto.encrypt(seed.toString('hex'), passphrase))
            .then((encseed) => this.storage.set('seed', encseed))
    }

    async getSeed(passphrase): Promise<string> {
        console.info('loading seed')
        const seed = await this.storage.get('seed')
        return await this.crypto.decrypt(seed, passphrase)
    }

    exportWallet() {
        return Promise.all([this.storage.get('seed'), this.getAddressIndex()])
            .then(([seed, index]) => {
                return seed + '&' + this.appService.network.charAt(0) + '&' + index + '&'
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET')
            })
    }

    exportWalletViewOnly() {
        return Promise.all([this.getAddressIndex(), this.storage.get('xpub')])
            .then(([index, xpub]) => {
                return '' + '&' + this.appService.network.charAt(0) + '&' + index + '&' + xpub
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_EXPORT_VIEW_ONLY_WALLET')
            })
    }

    getAddressIndex() {
        return this.storage.get('mvs_addresses')
            .then((addresses) => {
                if(addresses) {
                    return addresses.length
                }
            })
    }

    getAddressIndexFromWallet() {
        return this.storage.get('wallet')
            .then((wallet) => wallet && wallet.index ? wallet.index : undefined)
    }

    generateNewAddress(wallet: any, index: number) {
        return wallet.getAddress(index)
    }

    generateAddresses(wallet: any, from_index: number, to_index: number) {
        var addresses = []
        for (let i = from_index; i < to_index; i++) {
            addresses.push(this.generateNewAddress(wallet, i))
        }
        return addresses
    }

    getPublicKeyByAddress(wallet: any, address: string) {
        return wallet.findPublicKeyByAddess(address, 200)
    }

    getNewMultisigAddress(nbrSigReq, publicKeys) {
        return Metaverse.multisig.generate(nbrSigReq, publicKeys)
    }

    addMultisig(newMultisig) {
        return this.getMultisigAddresses()
            .then((multisig_addresses) => {
                if (multisig_addresses.indexOf(newMultisig.a) == -1) {
                    return Promise.all([this.addMultisigAddresses([newMultisig.a]), this.addMultisigInfo([newMultisig])])
                }
            })
    }

    getMultisigsInfo() {
        return this.storage.get('multisigs')
            .then((multisigs) => (multisigs) ? multisigs : [])
    }

    getMultisigInfoFromAddress(address) {
        return this.getMultisigsInfo()
            .then((multisigs) => {
                return this.findMultisigWallet(address, multisigs)
            })
    }

    findMultisigWallet(address, wallets) {
        if (wallets.length == 0)
            throw 'wallet not found'
        return (wallets[0].a == address) ? wallets[0] : this.findMultisigWallet(address, wallets.slice(1))
    }


    addMultisigInfo(newMultisig: Array<any>) {
        return this.getMultisigsInfo()
            .then((multisigs: Array<any>) => {
                newMultisig.map(multisig => {
                    multisig.r = Metaverse.multisig.generate(multisig.m, multisig.k).script
                    return multisig
                })
                this.storage.set('multisigs', multisigs.concat(newMultisig))
            })
    }

    async getMasterPublicKey(passphrase) {
        const seed = await this.getSeed(passphrase)
        const wallet = await Metaverse.wallet.fromSeed(Buffer.from(seed, 'hex'), Metaverse.networks[this.appService.network])
        return wallet.getMasterPublicKey()
    }

    getWalletFromMasterPublicKey(xpub) {
        return Metaverse.wallet.fromXPub(xpub, this.appService.network)
    }

    getMultisigAddresses() {
        return this.storage.get('multisig_addresses')
            .then((addresses) => (addresses) ? addresses : [])
    }

    setMultisigAddresses(multisig: Array<any>) {
        this.storage.set('multisig_addresses', multisig ? multisig : [])
    }

    setMultisigInfo(multisigs: Array<any>) {
        this.storage.set('multisigs', multisigs ? multisigs : [])
    }

    addMultisigAddresses(addresses: Array<string>) {
        return this.getMultisigAddresses()
            .then((addr: Array<string>) => this.storage.set('multisig_addresses', addr.concat(addresses)))
    }

    findDeriveNodeByPublic(wallet: any, publicKey: string, maxDepth: number) {
        return wallet.findDeriveNodeByPublicKey(publicKey, maxDepth ? maxDepth : 200)
    }

    async signMultisigTx(address, tx, passphrase) {
        let wallet = await this.getWallet(passphrase)
        let parameters = await this.getMultisigInfoFromAddress(address)
        return wallet.signMultisig(tx, parameters)
            .catch((error) => {
                console.error(error)
                switch (error) {
                    case "Signature already included":
                        throw Error('SIGN_ALREADY_INCL')
                    default:
                        throw Error('ERR_SIGN_TX')
                }

            })
    }

    getAccountName() {
        return this.storage.get('account_name')
    }

    setAccountName(account_name) {
        return this.storage.set('account_name', account_name)
    }

    deleteAccount(account_name) {
        return this.storage.get('saved_accounts')
            .then((accounts) => {
                if (accounts && accounts.length >= 1) {
                    accounts.find((o, i) => {
                        if (o && o.name === account_name) {
                            accounts.splice(i, 1)
                            return true // stop searching
                        }
                    })
                    return this.storage.set('saved_accounts', accounts)
                }
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DELETE_ACCOUNT')
            })
    }

    saveSessionAccount(password) {
        return Promise.all([this.storage.get('seed'), this.storage.get('wallet'), this.storage.get('multisig_addresses'), this.storage.get('multisigs'), this.storage.get('plugins'), this.storage.get('xpub')])
            .then(([seed, wallet, multisig_addresses, multisigs, plugins, xpub]) => {
                let new_account_content = {
                    seed: seed,
                    wallet: wallet,
                    multisig_addresses: multisig_addresses ? multisig_addresses : [],
                    multisigs: multisigs ? multisigs : [],
                    plugins: plugins ? plugins : [],
                    xpub: xpub ? xpub : '',
                }
                return this.crypto.encrypt(JSON.stringify(new_account_content), password)
                    .then((content) => this.storage.set('account_info', content))
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_SAVE_SESSION_ACCOUNT')
            })
    }

    getViewOnlySessionAccount() {
        return Promise.all([this.storage.get('multisig_addresses'), this.storage.get('multisigs'), this.storage.get('plugins'), this.storage.get('xpub')])
            .then(([multisig_addresses, multisigs, plugins, xpub]) => {
                let new_account_content = {
                    multisig_addresses: multisig_addresses ? multisig_addresses : [],
                    multisigs: multisigs ? multisigs : [],
                    plugins: plugins ? plugins : [],
                    xpub: xpub ? xpub : '',
                }
                return new_account_content
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_SAVE_VIEW_ONLY_SESSION_ACCOUNT')
            })
    }

    saveAccount(account_name) {
        return Promise.all([this.getSavedAccounts(), this.getSessionAccountInfo(), this.getAccountParams(), this.getViewOnlySessionAccount()])
            .then(([saved_accounts, content, params, view_only_content]) => {
                let old_account_index = -1
                if (saved_accounts) {
                    saved_accounts.find((o, i) => {
                        if (o && o.name === account_name) {
                            old_account_index = i
                            return true // stop searching
                        }
                    })
                }
                let new_account = {
                    "name": account_name,
                    "content": content ? content : undefined,
                    "params": params,
                    "network": this.appService.network,
                    "view_only_content": content ? undefined : view_only_content,
                    "type": "AES"
                }
                old_account_index > -1 ? saved_accounts[old_account_index] = new_account : saved_accounts.push(new_account)
                return this.storage.set('saved_accounts', saved_accounts)
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_SAVE_ACCOUNT')
            })
    }

    setupAccount(accountName, decryptedAccount) {
        return Promise.all([this.setWallet(decryptedAccount.wallet), this.setMobileWallet(decryptedAccount.seed), this.setAccountName(accountName), this.setMultisigAddresses(decryptedAccount.multisig_addresses), this.setMultisigInfo(decryptedAccount.multisigs), this.setPlugins(decryptedAccount.plugins), this.setXpub(decryptedAccount.xpub)])
            .catch((error) => {
                console.error(error)
                throw Error('ERR_SETUP_ACCOUNT')
            })
    }

    setupViewOnlyAccount(accountName, decryptedAccount) {
        return Promise.all([this.setAccountName(accountName), this.setMultisigAddresses(decryptedAccount.multisig_addresses), this.setMultisigInfo(decryptedAccount.multisigs), this.setPlugins(decryptedAccount.plugins), this.setXpub(decryptedAccount.xpub)])
            .catch((error) => {
                console.error(error)
                throw Error('ERR_SETUP_VIEW_ONLY_ACCOUNT')
            })
    }

    getSessionAccountInfo() {
        return this.storage.get('account_info')
    }

    getSavedAccounts() {
        return this.storage.get('saved_accounts')
            .then((accounts) => {
                return accounts ? accounts : []
            })
    }

    getMstList() {
        return this.storage.get('asset_order')
            .then((msts) => {
                return msts ? msts : []
            })
    }

    getAccountParams() {
        return Promise.all([this.storage.get('asset_order'), this.storage.get('hidden_mst'), this.storage.get('plugins'), this.getAddressIndex()])
            .then(([asset_order, hidden_mst, plugins, index]) => {
                let params = {}
                params['asset_order'] = asset_order ? asset_order : []
                params['hidden_mst'] = hidden_mst ? hidden_mst : []
                params['plugins'] = plugins ? plugins : []
                params['index'] = index ? index : this.appService.index
                return params
            })
    }

    async setAccountParams(params) {
        if (params) {
            if (params.asset_order) {
                await this.storage.set('asset_order', params.asset_order)
            }
            if (params.hidden_mst) {
                await this.storage.set('hidden_mst', params.hidden_mst)
            }
            if (params.plugins) {
                await this.storage.set('plugins', params.plugins)
            }
        }
    }

    decryptAccount(content, password) {
        return this.crypto.decrypt(content, password)
            .then((decrypted) => JSON.parse(decrypted.toString()))
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET')
            })
    }

    setPlugins(plugins: Array<any>) {
        this.storage.set('plugins', plugins ? plugins : [])
    }

    getNewNews(lang, limit) {
        return this.http.get("https://explorer.mvs.org/api/content/news?lang=" + lang + "&limit=" + limit)
    }

    getNews(lang = 'en-us') {
        return this.storage.get('news').then((news) => news && news[lang] ? news[lang] : [])
    }

    setNews(news, lang = 'en-us') {
        this.storage.get('news').then((allLangNews) => {
            allLangNews = allLangNews ? allLangNews : {}
            allLangNews[lang] = news
            this.storage.set('news', allLangNews)
        })
    }

    getLanguage() {
        return this.storage.get('language').then((lang) => lang ? lang : "en")
    }

    extractData(res: Response) {
        let body = res.json()
        return body || {}
    }

    handleErrorPromise(error: Response | any) {
        console.error(error.message || error)
        return Promise.reject(error.message || error)
    }

    openLink(url) {
        if (this.platform.is('mobile') && this.platform.is('ios'))
            window.open(url, '_self')
        else
            window.open(url, '_blank')
    }

    getElectionRewards(txs) {
        let url = this.appService.network === 'testnet' ? 'https://testnet-api.myetpwallet.com/api/' : 'https://mainnet-api.myetpwallet.com/api/'
        url += 'v2/election/rewards?'
        txs.forEach(tx => {
            url += 'txs=' + tx + '&'
        })
        url = url.substring(0, url.length - 1)
        return this.http.get(url).toPromise()
            .catch((error) => {
                return undefined
            })
    }

    setXpub(xpub) {
        return this.storage.set('xpub', xpub)
    }

    getXpub() {
        return this.storage.get('xpub')
    }

    hasSeed() {
        return this.storage.get('seed')
            .then((seed) => seed !== null && seed !== undefined)
    }

}