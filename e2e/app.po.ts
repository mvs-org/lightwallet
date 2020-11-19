import { browser, element, by, Locator, WebElement, ElementFinder, } from 'protractor';
import { timeout } from 'q';
var fs = require('fs');

// abstract writing screen shot to a file
function writeScreenShot(data, filename) {
    var stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
}
export class Page {

    navigateTo = (destination) => browser.get(destination)

    getTitle = () => browser.getTitle()

    getElementById = (id) => element(by.id(id))

    getElement = (selector) => element(by.css(selector))

    moveClick = (element) => browser.actions().mouseMove(element).click().perform()

    moveTo = element => browser.actions().mouseMove(element).perform()

    clickId = (id) => this.getElementById(id).click()

    hasId = (id) => browser.isElementPresent(this.getElementById(id))

    hasElement = (selector) => browser.isElementPresent(this.getElement(selector))
    sleep = browser.sleep

    waitForElement = (locatorOrElement: Locator | WebElement | ElementFinder, timeout = 15000, message?: string) => browser.driver.wait(() => {
        browser.ignoreSynchronization = true;
        return browser.isElementPresent(locatorOrElement)
    }, timeout, message)

    waitForUrlChange = (timeout=5000) => {
        return browser.getCurrentUrl()
            .then(current => {
                browser.ignoreSynchronization = true
                browser.driver.wait(function () {
                    return browser.driver.getCurrentUrl().then(function (url) {
                        return url !== current
                    });
                }, timeout);
                return browser.driver.getCurrentUrl();
            })
    }

    takeScreenshot = (filename) => browser.takeScreenshot().then(function (png) {
        writeScreenShot(png, filename);
    });

    openImportPage = async () => {
        await this.sleep(300)
        await this.waitForElement({ id: 'open-wallet-button' }, 5000, 'Timeout waiting for open wallet button to appear')
        await this.sleep(800)
        await this.clickId("open-wallet-button")
    }

    enterPassphrase = async (passphrase: string) => {
        await this.waitForElement({ css: 'input[name=password]' })
        await this.moveTo(this.getElementById('password-input'))
        await this.getElement('input[name=password]').sendKeys(passphrase)
        await this.clickId('submit-button')
    }

    openWalletFile = async (path: string) => {
        await this.waitForElement({ css: '#disclaimer-agree button' })
        await this.moveTo(this.getElement('#disclaimer-agree button'))
        await this.sleep(500)
        await this.getElement('#disclaimer-agree button').click()
        await this.waitForElement({ id: 'file' })
        await this.moveTo(this.getElement("#file"))
        await this.getElementById('file').sendKeys(path)
    }

    waitForSync = async (timeout=120000) => {
        await this.waitForElement({ css: 'etp-card' }, timeout)
    }

    selectLanguage = async (index: number) => {
        await this.sleep(500)
        await this.waitForElement({ css: '.footer .row .col:nth-child(2)' }, 5000)
        await this.getElement('.footer .row .col:nth-child(2) button').click()
        await this.waitForElement({ css: `ion-list ion-item:nth-child(${index})`})
        await this.sleep(500)
        await this.getElement(`ion-list ion-item:nth-child(${index})`).click()
        await this.waitForUrlChange()
    }
    
    openMenu = async () => {
        await this.sleep(300)
        await this.waitForElement({ css: 'button.bar-button-menutoggle' }, 5000, 'Timeout waiting for menu button to appear')
        await this.getElement('button.bar-button-menutoggle').click()
        await this.sleep(300)
    }

    selectMenuItem = async(index: number) => {
        await this.sleep(300)
        await this.waitForElement({ css: `ion-menu ion-content ion-list button:nth-child(${index})` }, 5000, 'Timeout waiting for menu item to appear')
        await this.getElement(`ion-menu ion-content ion-list button:nth-child(${index})`).click()
        await this.sleep(200)
    }
}
