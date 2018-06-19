import { Page } from './app.po';

describe('App', () => {
    let page: Page;

    beforeEach(() => {
        page = new Page();
    });

    describe('open wallet', () => {
        beforeEach(() => {
            page.navigateTo('/');
        });

        it('should have an open wallet button', () => {
            page.hasId("open-wallet-button").then(res => {
                expect(res).toEqual(true);
            });
        });
        it('should have a title saying Login', () => {
            page.getTitle().then(title => {
                expect(title).toEqual('Metaverse Lightwallet');
            });
        });
    })
});
