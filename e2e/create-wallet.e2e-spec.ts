import { Page } from './app.po';

describe('Wallet creation', () => {

    let page: Page;

    beforeEach(() => {
        page = new Page();
    });

    describe('Load login page', () => {
        beforeEach(() => {
            page.navigateTo('/');
        });

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

    describe('Generate new wallet', () => {
        beforeEach(() => {
            page.navigateTo('/');
            page.clickId("create-wallet-button")
        });

        it('Generation page should show 24 backup words', () => {
            page.hasId("backup-words")
                .then(res => {
                    expect(res).toEqual(true);
                    expect(true).toEqual(true);
                })
                .then(() => page.getElementById('backup-words').getText())
                .then(words => {
                    expect(words.split(' ').length).toEqual(24)
                })
        });
    })

});
