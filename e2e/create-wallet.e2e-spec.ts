import { Page } from './app.po';

describe('Wallet Generation', () => {

    let page: Page;

    beforeEach(() => {
        page = new Page();
        page.navigateTo('/');
    });

    describe('Generate new wallet', () => {
        beforeEach(() => {
            page.clickId("create-wallet-button")
        });

        it('Generation page should show 24 backup words', () => {
            page.hasId("backup-words")
                .then(res => {
                    expect(res).toEqual(true);
                })
                .then(() => page.getElementById('backup-words').getText())
                .then(words => {
                    expect(words.split(' ').length).toEqual(24)
                })
        });
    })

});
