import { browser, element, by } from 'protractor';

export class Page {

    navigateTo = (destination) => browser.get(destination)

    getTitle = () => browser.getTitle()

    getElementById = (id) => element(by.id(id))

    clickId = (id) => this.getElementById(id).click()

    hasId = (id) => browser.isElementPresent(this.getElementById(id))

}
