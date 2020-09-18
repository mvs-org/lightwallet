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
    public metaverseService: MetaverseService,
    public walletService: WalletService,
    public translate: TranslateService,
    private router: Router,
    private alertService: AlertService,
  ) {
    this.fileLoaded = false
  }

  ngOnInit() {
    this.isMobile = this.walletService.isMobile()
  }

  ionViewWillEnter() {
    this.data = undefined
    this.fileLoaded = false
    this.disclaimer_agreed = false
    this.password = ''
  }


  open(e) {
    let file = e.target.files
    let reader = new FileReader()
    reader.onload = (e: any) => {
      let content = e.target.result
      try {
        this.data = JSON.parse(content)
        this.walletService.setWallet(this.data).then(() => this.fileLoaded = true)
      } catch (e) {
        console.error(e)
        this.alertService.showMessage('OPEN_FILE.WRONG_FILE.TITLE', 'OPEN_FILE.WRONG_FILE.SUBTITLE', '')
      }
    }
    if (file[0]) {
      reader.readAsText(file[0])
    }
  }


  async decrypt(password) {
    try {
      await this.alertService.showLoading()
      await this.metaverseService.dataReset()
      await this.walletService.setSeed(password)
      const xpub = await this.walletService.getMasterPublicKey(password)
      await this.walletService.setXpub(xpub)
      const wallet = await this.walletService.getWallet(password)
      const index = await this.walletService.getAddressIndexFromWallet()
      const addresses = await this.walletService.generateAddresses(wallet, 0, index)
      await this.metaverseService.setAddresses(addresses)
      await this.walletService.saveSessionAccount(password)
      await this.router.navigate(['/loading'], { state: { data: { reset: true } } })
      await this.alertService.stopLoading()
    } catch (e) {
      console.error(e)
      await this.alertService.stopLoading()
      this.alertService.showError('OPEN_FILE.WRONG_PASSWORD', '')
    }
  }

}

