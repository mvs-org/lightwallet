import { browser, element, by } from 'protractor';
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

    waitForUrlChange = () => {
        return browser.getCurrentUrl()
            .then(current=>{
                browser.ignoreSynchronization = true
                browser.driver.wait(function() {
                    return browser.driver.getCurrentUrl().then(function(url) {
                        return url!==current
                    });
                }, 5000);
                return;
            })
    }

    takeScreenshot = (filename) => browser.takeScreenshot().then(function (png) {
        writeScreenShot(png, filename);
    });
}
