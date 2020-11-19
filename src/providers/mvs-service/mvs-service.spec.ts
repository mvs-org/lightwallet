import { async, TestBed } from '@angular/core/testing';
import { AppGlobals } from '../../app/app.global';
import { MvsServiceProvider } from './mvs-service';
import { IonicStorageModule } from '@ionic/storage';
import { MockStorage, MockEvents } from '../../types/mocks';

describe('MVS Service Provider', () => {
    let mvs: MvsServiceProvider = null;
    let storage: MockStorage;
    let events: MockEvents;

    describe('Asset order', () => {
        beforeEach(() => {
            storage = new MockStorage({})
            events = new MockEvents();
            mvs = new MvsServiceProvider(
                new AppGlobals(events, storage),
                undefined,
                events,
                storage
            )
        });
        it('Get asset order', (done) => {
            return mvs.assetOrder()
                .then(result => {
                    expect(result).toEqual(Object.keys(mvs.DEFAULT_BALANCES.MST))
                    done()
                })
        });
        it('Set asset order list', (done) => {
            var list = ['a', 'b', 'c']
            return mvs.setAssetOrder(list)
                .then(() => storage.get('asset_order'))
                .then(result => {
                    expect(result).toEqual(list)
                    done()
                })
        });
        it('Add asset order entry', (done) => {
            var list = ['a', 'b', 'c']
            return storage.set('asset_order', list)
                .then(() => mvs.addAssetsToAssetOrder(['d', 'e']))
                .then(() => storage.get('asset_order'))
                .then(result => {
                    expect(result).toEqual(['a', 'b', 'c', 'd','e'])
                    done()
                })
        });
    });

    describe('Addresses', () => {
        let event: any;
        let globals : AppGlobals;
        beforeEach(() => {
            event = new MockEvents()
            globals = new AppGlobals(event, storage)
            storage = new MockStorage({})
            mvs = new MvsServiceProvider(
                globals,
                undefined,
                event,
                storage
            )
        });
        it('Set addresses', (done) => {
            var list = ['a', 'b', 'c']
            return mvs.setAddresses(list)
                .then(() => storage.get('mvs_addresses'))
                .then(result => {
                    expect(event.published()).toBe(true)
                    expect(result).toEqual(list)
                    done()
                })
        })
        it('Validate address mainnet', () => {
            globals.network='mainnet'
            var target = [
                'MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB'
            ]
            target.forEach(address=>{
                expect(mvs.validAddress(address)).toBe(true)
            })
        })
        it('Validate address testnet', () => {
            globals.network='testnet'
            var target = [
                'tPd41bKLJGf1C5RRvaiV2mytqZB6WfM1vR'
            ]
            target.forEach(address=>{
                expect(mvs.validAddress(address)).toBe(true)
            })
        })
        it('Validate invalid addresses', () => {
            globals.network='mainnet'
            var fail = [
                '1KXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB',
                'tKXYH2MhpvA3GU7kMk8y3SoywG',
                'MKXYH2MhpvA3GU7kMk8y22222222222222SoywG',
                '3KXY2MhpvA3GU7kMk8y3SoywGnyHEj5SB'
            ]
            fail.forEach(address=>{
                expect(mvs.validAddress(address)).toBe(false)
            })
        })
    });
});
