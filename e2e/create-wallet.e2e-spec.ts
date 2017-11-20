import { Page } from './app.po';

describe('Wallet creation', () => {
  let page: Page;

  beforeEach(() => {
    page = new Page();
  });

  describe('open wallet', () => {
    beforeEach(() => {
      page.navigateTo('/');
    });

    it('should have an open wallet button', () => {
      page.hasOpenWalletButton().then(res => {
        expect(res).toEqual(true);
      });
    });
    it('should have a title saying Login', () => {
      page.getTitle().then(title => {
        expect(title).toEqual('MyETPWallet.com');
      });
    });
  })
});
