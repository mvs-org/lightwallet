import { Page } from './app.po'
import { existsSync, mkdirSync } from 'fs'


describe('Account', () => {
describe('Account', () => {

    const FILEPATH = process.cwd() + '/e2e/wallet.json'
    const PASSWORD = 'password123'
    const LANGUAGE = 1

    const DEBUG = false

    let page = new Page();

    if (DEBUG) {
        setInterval(() => page.takeScreenshot('debug.png'), 500)
    }

    beforeAll(async (done) => {
        if (!existsSync('./screenshots')) {
            mkdirSync('./screenshots')
        }
        await page.navigateTo('/')
        await page.selectLanguage(LANGUAGE)
        page.takeScreenshot('./screenshots/login.png')
        await page.openImportPage()
        page.takeScreenshot('./screenshots/import-wallet.png')
        await page.openWalletFile(FILEPATH)
        await page.enterPassphrase(PASSWORD).catch(console.error)
        await page.waitForSync()
        await page.sleep(500)
        done()
    })

    it('Open receive ETP page', async () => {
        await page.navigateTo('/')
        await page.sleep(500)
        await page.waitForElement({ css: 'etp-card .row-buttons ion-col:nth-child(1) button' })
        await page.getElement('etp-card .row-buttons ion-col:nth-child(1) button').click()
        const url = await page.waitForUrlChange(10000)
        expect(/receive\/ETP$/.test(url)).toBeTruthy()
        page.takeScreenshot('./screenshots/receive-etp.png')
    });

    it('Open send ETP page', async () => {
        await page.navigateTo('/')
        await page.sleep(500)
        await page.waitForElement({ css: 'etp-card .row-buttons ion-col:nth-child(2) button' })
        await page.getElement('etp-card .row-buttons ion-col:nth-child(2) button').click()
        await page.waitForElement({ css: 'input[name=recipient_address]' })
        await page.sleep(500)
        expect(await page.hasElement('input[name=recipient_address]')).toBeTruthy()
        page.takeScreenshot('./screenshots/send-etp.png')
    });

    it('Open ETP history page', async () => {
        await page.navigateTo('/')
        await page.sleep(500)
        await page.waitForElement({ css: 'etp-card .row-buttons ion-col:nth-child(3) button' })
        await page.getElement('etp-card .row-buttons ion-col:nth-child(3) button').click()
        const url = await page.waitForUrlChange(10000)
        expect(/transactions\/ETP$/.test(url)).toBeTruthy()
        page.takeScreenshot('./screenshots/history-etp.png')
    });

});
});
