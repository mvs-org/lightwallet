import { async, TestBed } from '@angular/core/testing';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from './wallet-service';
import { CryptoServiceProvider } from '../crypto-service/crypto-service';
import { IonicStorageModule } from '@ionic/storage';
import { Storage } from '@ionic/storage';

describe('Wallet Provider', () => {
    let walletservice = null;

    beforeEach(()=> {
        walletservice = new WalletServiceProvider(undefined,
        new Storage({
            name: '__myetpwallet',
            driverOrder: ['indexeddb', 'localstorage']
        }), new AppGlobals(), new CryptoServiceProvider())
    });

    it('Generate Wallet', (done)=> {
        let passphrase = 'passphrase123'
        let wallet = null;
        return walletservice.createWallet()
            .then(result=>{
                expect(result !=undefined && result.mnemonic!==undefined).toBe(true)
                done()
            })
    });

    it('Store and retrieve Wallet', (done)=> {
        let passphrase = 'passphrase123'
        let wallet = null;
        return walletservice.createWallet()
            .then(result=>{
                expect(result !=undefined && result.mnemonic!==undefined).toBe(true)
                wallet=result;
                return walletservice.encryptWalletFromMnemonic(wallet.mnemonic, passphrase)
            })
            .then(wallet=>walletservice.setWallet(wallet))
            .then(wallet=>walletservice.getMnemonic(passphrase))
            .then((mnemonic)=>{
                expect(mnemonic).toBe(wallet.mnemonic)
                done()
            })
    });

});
