// import { async, TestBed } from '@angular/core/testing';

import { MvsServiceProvider } from './mvs-service';

describe('Metaverse Provider', () => {
    let mvs = null;


    beforeEach(()=> {
        mvs = new MvsServiceProvider();
    });


    it('createEtpWallet should return mnemonic/seed', () => {
        let result = mvs.createEtpWallet();
        console.log(result)
        expect(result).toBeTruthy;
        // expect(result.length).toBeGreaterThan(0);
        // expect(result).toContain(3);
    });

    it('getHDNode should return wallet object', ()=> {
        let test_mnemonic = "test string for mnemonic"
        let result = mvs.getHDNodeFromMnemonic(test_mnemonic);
        console.log(result)
        expect(result).toBeTruthy;
    });

});
