import { Component, ViewChild, ElementRef } from '@angular/core';
import { AppGlobals } from '../../app/app.global';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service'
import { AlertProvider } from '../../providers/alert/alert';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { Plugin, PluginProvider } from '../../providers/plugin/plugin'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@IonicPage({
    segment: 'plugin/:name'
})
@Component({
    selector: 'page-plugin',
    templateUrl: 'plugin.html',
})
export class PluginPage {


    @ViewChild('iframe') iframe: ElementRef;
    plugin: Plugin = new Plugin()
    urlSafe: SafeResourceUrl;

    wallet: any;

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        private globals: AppGlobals,
        private alert: AlertProvider,
        private walletProvider: WalletServiceProvider,
        public sanitizer: DomSanitizer,
        private plugins: PluginProvider,
        public navParams: NavParams
    ) {
    }

    ionViewWillLeave() {
        window.removeEventListener('message', this.processMessage);
    }

    evaluateResponse(data) {
        switch (data.query) {
            case 'permissions':
                return Promise.resolve(this.plugin.config.permissions)
            case 'create-mit':
                return this.createMIT(data.params)
            case 'network':
                return Promise.resolve(this.globals.network)
            case 'avatars':
                return this.mvs.listAvatars()
            case 'sign':
                return this.sign(data.params.text, data.params.avatar)
            case 'verify':
                return Promise.resolve(this.walletProvider.verifyMessage(data.params.text, data.params.address, data.params.signature))
            case 'unlock':
                return this.unlock('MESSAGE.UNLOCK_WALLET_PASSWORD_MESSAGE')
            case 'addresses':
                return this.mvs.getAddresses()
            case 'broadcast':
                return this.mvs.broadcast(data.params.tx)
            default:
                throw Error('Illegal request')
        }
    }

    processMessage = (event) => {
        event.stopPropagation()
        let source: any = event.source;
        if (!this.hasPermission(event.data.query)) {
            source.postMessage({
                topic: 'error',
                nonce: event.data.nonce,
                value: "ERR_PERMISSION_DENIED"
            }, event.origin)
        } else {
            this.evaluateResponse(event.data)
                .then(response => {
                    source.postMessage({
                        topic: event.data.query,
                        nonce: event.data.nonce,
                        value: response
                    }, event.origin)
                })
                .catch(error => {
                    console.log(error)
                    source.postMessage({
                        topic: 'error',
                        nonce: event.data.nonce,
                        value: error.message
                    }, event.origin)
                })
        }
    }

    hasPermission(request_type) {
        switch (request_type) {
            case 'permissions':
            case 'verify':
            case 'network':
            case 'broadcast':
                return true;
            default:
                return this.plugin.config.permissions.indexOf(request_type) !== -1
        }
    }

    ionViewDidLoad() {
        this.plugins.getPlugins()
            .then(plugins => {
                plugins.forEach(plugin => {
                    if (plugin.name == this.navParams.get('name'))
                        this.plugin = plugin;
                })
                if (this.plugin == undefined) {
                    this.navCtrl.setRoot('AccountPage')
                } else {
                    if (this.plugin) {
                        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.plugin.url);
                        window.addEventListener("message", this.processMessage, false);
                    }
                }
            })
        console.log('ionViewDidLoad PluginPage');
    }

    sign(text, avatar_symbol) {
        console.info('attempt to sign ' + text + '  for ' + avatar_symbol)
        return this.mvs.listAvatars()
            .then(avatars => {
                let address = null;
                avatars.forEach(avatar => {
                    if (avatar.symbol == avatar_symbol) {
                        address = avatar.address;
                    }
                })
                if (address == null)
                    throw Error('Avatar not found');
                else
                    return this.wallet.signMessage(address, text)
            })
    }

    createMIT(params) {
        let address = null;
        if (params.avatar == undefined)
            throw 'ERR_AVATAR_UNDEFINED'
        if (params.symbol == undefined)
            throw 'ERR_MIT_SYMBOL_UNDEFINED'
        if (params.content == undefined)
            throw 'ERR_CONTENT_UNDEFINED'
        return this.mvs.listAvatars()
            .then(avatars => {
                avatars.forEach(avatar => {
                    if (avatar.symbol == params.avatar)
                        address = avatar.address
                })
                if (address == null) throw 'ERR_AVATAR_ADDRESS_NOT_FOUND'
                return address;
            })
            .then(address => {
                return this.askPassphrase(`Plugin wants to create new MIT ${params.symbol}. It will be issued for by your Avatar ${params.avatar}`)
                    .then((passphrase: string) => {
                        return this.mvs.createRegisterMITTx(address, params.avatar, params.symbol, params.content, undefined, undefined)
                            .then(rawtx => this.mvs.sign(rawtx, passphrase))   
                            .then(tx => (params.raw) ? tx.encode().toString('hex') : tx)
                    })
            })
    }

    unlock(text) {
        return this.askPassphrase(text)
            .then(passphrase => this.walletProvider.getWallet(passphrase))
            .then(wallet => {
                this.wallet = wallet;
                return true;
            })
            .catch((error) => {
                console.error(error.message)
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        return this.unlock('MESSAGE.WRONG_PASSWORD_TRY_AGAIN')
                    case "ERR_USER_CONFIRMATION_FAILED":
                        this.alert.showError('MESSAGE.UNLOCK_WALLET_PASSWORD_NOT_ENTERED', '')
                        throw Error('ERR_USER_CONFIRMATION_FAILED')
                    default:
                        this.alert.showError('MESSAGE.UNLOCK_WALLET', error.message)
                        throw Error('ERR_UNLOCK_WALLET')
                }
            })
    }

    askPassphrase(text) {
        return new Promise((resolve, reject) => {
            this.alert.askPassphrase(text, (passphrase) => {
                if (passphrase) resolve(passphrase)
                else reject(Error('ERR_USER_CONFIRMATION_FAILED'))
            })

        })
    }
}
