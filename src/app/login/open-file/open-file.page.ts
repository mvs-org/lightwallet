import { Component, OnInit } from '@angular/core'
import { WalletService } from 'src/app/services/wallet.service'
import { MetaverseService } from '../../services/metaverse.service'
import { Router } from '@angular/router'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { AccountService } from '../../services/account.service'
import { AlertService } from '../../services/alert.service'

@Component({
  selector: 'app-open-file',
  templateUrl: './open-file.page.html',
  styleUrls: ['./open-file.page.scss'],
})
export class OpenFilePage implements OnInit {

  form: FormGroup
  fileData: any
  fileLoaded: boolean
  loader: any

  constructor(
    private walletService: WalletService,
    public metaverse: MetaverseService,
    private router: Router,
    private formBuilder: FormBuilder,
    private account: AccountService,
    private alertService: AlertService,
  ) { }

  async ngOnInit() {
    this.loader = await this.alertService.loading('OPEN_FILE.LOADER')

    this.form = this.formBuilder.group({
      passphrase: new FormControl('', [Validators.required, Validators.minLength(4)]),
    })
  }

  async open(e) {
    this.loader = await this.alertService.loading('OPEN_FILE.LOADER.OPENING_FILE')
    await this.loader.present()
    const file = e.target.files
    const reader = new FileReader()
    reader.onload = (e: any) => {
      const content = e.target.result
      try {
        this.fileData = JSON.parse(content)
        if (!this.fileData.mnemonic) {
          this.wrongFile()
        }
      } catch (e) {
        console.error(e)
        this.wrongFile()
      }
    }
    if (file[0]) {
      reader.readAsText(file[0])
    }
    await this.loader.dismiss()
  }

  async wrongFile() {
    await this.alertService.alert('OPEN_FILE', 'WRONG_FILE', 'TITLE', 'TEXT', ['OK'])
  }


  async decrypt() {
    this.loader = await this.alertService.loading('OPEN_FILE.LOADER.ENTERING_WALLET')
    await this.loader.present()
    const passphrase = this.form.value.passphrase
    await this.walletService.import(this.fileData, passphrase, this.metaverse.network)
    await this.account.saveSessionAccount(passphrase)
    this.router.navigate(['/account'])
    return this.loader.dismiss()
  }

}
