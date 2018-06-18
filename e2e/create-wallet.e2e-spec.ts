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

    describe('Gerneate new wallet', () => {
        beforeEach(() => {
            page.navigateTo('/');
            page.getElementById("create-wallet-button").click()
        });

        it('Page should have backup words', () => {
            page.hasId("backup-words").then(res => {
                expect(res).toEqual(true);
            });
        });
    })

});
