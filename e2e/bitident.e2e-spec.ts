import { Page } from './app.po'
import { existsSync, mkdirSync } from 'fs'

const FILEPATH = process.cwd() + '/e2e/wallet.json'
const PASSWORD = 'password123'
const LANGUAGE = 1

const DEBUG = true

describe('Bitident', () => {
describe('Bitident', () => {

    let page = new Page()

    if (DEBUG) {
        setInterval(() => page.takeScreenshot('debug.png'), 500)
    }

    beforeAll(async () => {
        if (!existsSync('./screenshots')) {
            mkdirSync('./screenshots')
        }
        await page.navigateTo('/')
        await page.selectLanguage(LANGUAGE)
        page.takeScreenshot('./screenshots/login.png')
        await page.sleep(1000)
        await page.openImportPage()
        page.takeScreenshot('./screenshots/import-wallet.png')
        await page.openWalletFile(FILEPATH)
        await page.enterPassphrase(PASSWORD).catch(console.error)
        await page.waitForSync()
    })

    it('Open Authentication', async () => {
        await page.navigateTo('/')
        await page.sleep(500)
        await page.openMenu()
        await page.selectMenuItem(3)
        await page.waitForElement({ css: '#open-how-to-auth' })
        expect(page.hasId('open-how-to-auth')).toBeTruthy()
        page.takeScreenshot('./screenshots/bitident.png')
    });

    it('Open How To', async () => {
        await page.navigateTo('/')
        await page.sleep(500)
        await page.openMenu()
        await page.selectMenuItem(3)
        await page.waitForElement({ css: '#open-how-to-auth' })
        await page.clickId('open-how-to-auth')
        await page.waitForElement({css: '.mobile-import-image'})
        await page.sleep(500)
        expect(page.hasElement('.mobile-import-image')).toBeTruthy()
        page.takeScreenshot('./screenshots/bitident-howto.png')
        await page.sleep(500)
    });

});
});
