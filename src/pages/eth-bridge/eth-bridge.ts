import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
    selector: 'page-eth-bridge',
    templateUrl: 'eth-bridge.html',
})
export class EthBridgePage {

    direction: string = 'ethtomvs'
    identifier: string = ''
    data: string = ''
    addresses: Array<string>
    balance: number
    showBalance: number
    addressbalances: Array<any>
    etpBalance: number
    ETPMap: string
    SwapAddress: string
    whitelist: any = []

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        private globals: AppGlobals,
        public platform: Platform
    ) {

        this.ETPMap = this.globals.ETPMap;
        this.SwapAddress = this.globals.SwapAddress;

        //Load addresses
        mvs.getAddresses()
            .then((_: Array<string>) => {
                this.addresses = _
            })

        //Load balances
        mvs.getBalances()
            .then((balances) => {
                let balance = balances.ETP
                this.balance = (balance && balance.available) ? balance.available : 0
                this.etpBalance = balances.ETP.available
                this.showBalance = this.balance
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        let addrblncs = []
                        if (Object.keys(addressbalances).length) {
                            Object.keys(addressbalances).forEach((address) => {
                                if (addressbalances[address].ETP.available > 0) {
                                    addrblncs.push({ "address": address, "avatar": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : "", "identifier": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address, "balance": addressbalances[address].ETP.available })
                                }
                            })
                        }
                        this.addressbalances = addrblncs
                    })
            })

        this.mvs.getWhitelist()
            .then((whitelist) => {
                this.whitelist = whitelist;
            })
    }

    ionViewDidEnter() {
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    toHex(s) {
        //var s = unescape(encodeURIComponent(s));
        var h = '';
        for (var i = 0; i < s.length; i++)
            h += s.charCodeAt(i).toString(16);
        return h;
    }

    zerofill(content, length, direction) {
        if(content.length>length)
            return (this.zerofill(content.slice(0, 64), 64, direction) + this.zerofill(content.slice(64), 64, direction))
        if(direction !== 'left')
            direction == 'right';
        let result = "" + content;
        var zeros = length - (result).length;
        for(let i = 0; i < zeros; i++)
            result = (direction == 'left') ? "0" + result:result + "0";
        return result;
    }

    registerEthBridge(identifier) {
        const FUNCTION_ID = "0xfa42f3e5";
        const LOCATION = "0000000000000000000000000000000000000000000000000000000000000020";
        var dynamic = this.toHex(identifier);
        var hexLength = identifier.length.toString(16);
        this.data = FUNCTION_ID + LOCATION + this.zerofill(hexLength, 64, 'left') + this.zerofill(dynamic, 64, 'right');
    }

    validIdentifier = (identifier) => identifier != undefined && identifier != ''

}
