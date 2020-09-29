import { Page } from './app.po';

describe('Login', () => {

    let page = new Page();

    const DEFAULT_NETWORK = 'mainnet'

    beforeEach(() => {
        page.navigateTo('/');
    });

    describe('Load login page', () => {
        it('Login should have an create wallet button', () => {
            page.hasId("create-wallet-button").then(res => {
                expect(res).toEqual(true);
            });
        });
        it('Login should have correct title', () => {
            page.getTitle().then(title => {
                expect(title).toEqual('Metaverse Lightwallet');
            });
        });
    })

    describe('Change network settings', () => {
        it('Login has a network switch', () => {
            page.hasId("network-switch").then(res => expect(res).toEqual(true));
        });
        it('Default network', () => {
            page.getElementById('label-network').getAttribute('value')
                .then(network => expect(network).toEqual(DEFAULT_NETWORK));
        });
        it('Switch network', () => {
            page.clickId('network-switch-option-testnet')
                .then(() => page.getElementById('label-network').getAttribute('value'))
                .then(network => expect(network).toEqual('testnet'))
                .then(() => page.clickId('network-switch-option-mainnet'))
                .then(() => page.sleep(100))
                .then(() => page.getElementById('label-network').getAttribute('value'))
                .then(network => expect(network).toEqual('mainnet'));
        });
    })

});
