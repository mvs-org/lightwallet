import { async, TestBed } from '@angular/core/testing';

import { WalletServiceProvider } from './wallet-service';
import { IonicStorageModule } from '@ionic/storage';
import { Storage } from '@ionic/storage';

describe('Wallet Provider', () => {
    let walletservice = null;

    beforeEach(()=> {
        walletservice = new WalletServiceProvider(undefined,
        new Storage({
            name: '__myetpwallet',
            driverOrder: ['indexeddb', 'localstorage']
        }), undefined, undefined)
    });

    it('Storage', (done)=> {
        walletservice.setA()
            .then(function(){ console.log(1); return walletservice.getA()})
            .then(function(result){
                expect(result).toBe(1)
                done()
            })
    });

});
