import { Page } from './app.po';

describe('Load Wallet', () => {

    let page = new Page()

    describe('Open wallet from file wallet', () => {
        beforeEach(() => {
            page.navigateTo('/')
        })

        function openImportPage() {
            return page.clickId("open-wallet-button")
                .then(() => page.sleep(200))
        }

        function enterPassphrase(passphrase) {
            page.moveTo(page.getElementById('password-input'))
            var input = page.getElement('#password-input .text-input')
            input.sendKeys(passphrase);
            page.clickId('submit-button')
            return input;
        }

        function openWalletFile() {
            page.moveTo(page.getElement("#disclaimer-agree button"))
            page.sleep(500)
            page.getElement("button.item-cover").click()
            var fileToUpload = process.cwd() + '/e2e/wallet.json'
            page.getElementById('file').sendKeys(fileToUpload)
            return fileToUpload
        }

        it('Open import page', () => {
            openImportPage()
            page.hasElement("#disclaimer-agree button")
                .then(res => expect(res).toEqual(true))
        });

        it('Open file and detect wrong passphrase', () => {
            openImportPage()
                .then(() => openWalletFile())
                .then(() => enterPassphrase('wrongpassphrase'))
                .then(() => page.sleep(200))
                .then(() => page.hasElement('.alert-message'))
                .then(has => expect(has).toBe(true))
        });

        it('Open and decrypt wallet', () => {
            openImportPage()
                .then(() => openWalletFile())
                .then(() => enterPassphrase('password123'))
                .then(() => page.waitForUrlChange())
                .then(() => {
                    page.hasId('load_progress')
                        .then(hasProgressbar => expect(hasProgressbar).toBe(true))
                })
        });

    });
});
