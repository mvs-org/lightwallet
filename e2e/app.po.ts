import { browser, element, by } from 'protractor';

export class Page {

    navigateTo(destination) {
        return browser.get(destination);
    }

    getTitle() {
        return browser.getTitle();
    }

    getElementById = (id) => element(by.id(id))

    hasId(id) {
        return browser.isElementPresent(this.getElementById(id))
    }

}
