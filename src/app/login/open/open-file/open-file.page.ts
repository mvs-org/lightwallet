import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { TranslateService } from '@ngx-translate/core'
import { ActivatedRoute, Router } from '@angular/router'

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

  constructor(
    public mvs: MetaverseService,
    public wallet: WalletService,
    public translate: TranslateService,
    private router: Router,
  ) {
    this.fileLoaded = false;
  }

  ngOnInit() {
  }


  open(e) {
    let file = e.target.files
    let reader = new FileReader();
    reader.onload = (e: any) => {
      let content = e.target.result;

      try {
        this.data = JSON.parse(content)
        this.wallet.setWallet(this.data).then(() => this.fileLoaded = true)

      } catch (e) {
        console.error(e);
        this.translate.get('WRONG_FILE').subscribe((message: string) => {
          //this.alert.showError(message, '');
        });
      }
    };
    if (file[0]) {
      reader.readAsText(file[0])
    }
  }


  decrypt(password) {
    //this.alert.showLoading()
    this.mvs.dataReset()
      .then(() => this.wallet.setSeed(password))
      .then(() => this.wallet.getMasterPublicKey(password))
      .then((xpub) => this.wallet.setXpub(xpub))
      .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndexFromWallet()]))
      .then(([wallet, index]) => this.wallet.generateAddresses(wallet, 0, index))
      .then((addresses) => this.mvs.setAddresses(addresses))
      .then(() => this.wallet.saveSessionAccount(password))
      .then(() => this.router.navigate(['/loading'], { state: { data: { reset: true } } }))
      .catch((e) => {
        console.error(e);
        //this.alert.showError('MESSAGE.PASSWORD_WRONG', '');
        //this.alert.stopLoading()
      });
  }

}

