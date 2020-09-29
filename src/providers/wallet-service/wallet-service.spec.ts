import { async, TestBed } from '@angular/core/testing';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from './wallet-service';
import { CryptoServiceProvider } from '../crypto-service/crypto-service';
import { IonicStorageModule } from '@ionic/storage';
import { MockStorage, MockEvents } from '../../types/mocks';
import { Platform } from 'ionic-angular'

describe('Wallet Provider', () => {
    let walletservice = null
    let storage = new MockStorage({})

    beforeEach(() => {
        walletservice = new WalletServiceProvider(undefined, storage, new AppGlobals(new MockEvents(), storage), new CryptoServiceProvider(), new Platform())
    });

    it('Generate Wallet', (done) => {
        let passphrase = 'passphrase123'
        let wallet = null;
        return walletservice.createWallet()
            .then(result => {
                expect(result != undefined && result.mnemonic !== undefined).toBe(true)
                done()
            })
    });

    it('Store and retrieve Wallet', (done) => {
        let passphrase = 'passphrase123'
        let wallet = null;
        return walletservice.createWallet()
            .then(result => {
                expect(result != undefined && result.mnemonic !== undefined).toBe(true)
                wallet = result;
                return walletservice.encryptWalletFromMnemonic(wallet.mnemonic, passphrase)
            })
            .then(wallet => walletservice.setWallet(wallet))
            .then(wallet => walletservice.getMnemonic(passphrase))
            .then((mnemonic) => {
                expect(mnemonic).toBe(wallet.mnemonic)
                done()
            })
    });

});
