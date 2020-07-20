import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { TranslateService } from '@ngx-translate/core'
import { Router } from '@angular/router'
import { AlertService } from 'src/app/services/alert.service'

@Component({
  selector: 'app-open-file',
  templateUrl: './open-file.page.html',
  styleUrls: ['./open-file.page.scss'],
})
export class OpenFilePage implements OnInit {

  data: Array<any>
  fileLoaded: boolean
  disclaimer_agreed = false
  password = ''
  isMobile: boolean

  constructor(
    public mvs: MetaverseService,
    public wallet: WalletService,
    public translate: TranslateService,
    private router: Router,
    private alert: AlertService,
  ) {
    this.fileLoaded = false
  }

  ngOnInit() {
    this.isMobile = this.wallet.isMobile()
  }


  open(e) {
    let file = e.target.files
    let reader = new FileReader()
    reader.onload = (e: any) => {
      let content = e.target.result
      try {
        this.data = JSON.parse(content)
        this.wallet.setWallet(this.data).then(() => this.fileLoaded = true)
      } catch (e) {
        console.error(e)
        this.alert.showMessage('OPEN_FILE.WRONG_FILE.TITLE', 'OPEN_FILE.WRONG_FILE.SUBTITLE', '')
      }
    }
    if (file[0]) {
      reader.readAsText(file[0])
    }
  }


  async decrypt(password) {
    try {
      await this.alert.showLoading()
      await this.mvs.dataReset()
      await this.wallet.setSeed(password)
      const xpub = await this.wallet.getMasterPublicKey(password)
      await this.wallet.setXpub(xpub)
      const wallet = await this.wallet.getWallet(password)
      const index = await this.wallet.getAddressIndexFromWallet()
      const addresses = await this.wallet.generateAddresses(wallet, 0, index)
      await this.mvs.setAddresses(addresses)
      await this.wallet.saveSessionAccount(password)
      await this.router.navigate(['/loading'], { state: { data: { reset: true } } })
      await this.alert.stopLoading()
    } catch (e) {
      console.error(e)
      await this.alert.stopLoading()
      this.alert.showError('OPEN_FILE.WRONG_PASSWORD', '')
    }
  }

}

