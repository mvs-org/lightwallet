import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import { WalletService } from 'src/app/services/wallet.service';
import { MetaverseService } from 'src/app/services/metaverse.service';

@Component({
  selector: 'app-select-passphrase',
  templateUrl: './select-passphrase.page.html',
  styleUrls: ['./select-passphrase.page.scss'],
})
export class SelectPassphrasePage implements OnInit {

  form: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    public config: ConfigService,
    private wallet: WalletService,
    private metaverse: MetaverseService,
    private router: Router,
  ) {

    const passphrase = new FormControl('', [Validators.required, Validators.minLength(8)]);
    const repeat = new FormControl('', [Validators.required]);
    this.form = this.formBuilder.group({
      passphrase,
      repeat
    }, {
        validators: [this.isSame(passphrase, repeat)]
      });
  }

  isSame(targetControl: FormControl, checkControl: FormControl) {
    return () => checkControl.value === targetControl.value ? null : { notSame: true };
  }

  getError(control: FormControl, group?: FormGroup) {
    if (control.pristine) {
      return;
    }
    if (control.errors) {
      return Object.entries(control.errors)[0];
    }
    if (group !== undefined && group.errors) {
      return Object.entries(group.errors)[0];
    }
    return;
  }

  async submit() {
    const wallet = {
      mnemonic: this.activatedRoute.snapshot.queryParams.mnemonic,
    };
    const passphrase = this.form.value.passphrase;
    const encryptedWallet = await this.wallet.encryptWallet(wallet, passphrase);
    // this.downloadFile('mvs_keystore.json', JSON.stringify(encryptedWallet));
    this.wallet.import(encryptedWallet, passphrase, this.metaverse.network);
    this.router.navigate(['/account']);
  }

  ngOnInit() {
  }

  downloadFile(filename: string, text: string) {
    const pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
      const event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  }

}
