import { browser, element, by } from 'protractor';

export class Page {

  navigateTo(destination) {
    return browser.get(destination);
  }

  getTitle() {
    return browser.getTitle();
  }

    hasOpenWalletButton(){
        return browser.isElementPresent(element(by.id("close-wallet-button")))
    }
  
}
