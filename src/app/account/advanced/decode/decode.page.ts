import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Router } from '@angular/router'
import { AlertService } from 'src/app/services/alert.service'
import { Location } from '@angular/common'

@Component({
  selector: 'app-decode',
  templateUrl: './decode.page.html',
  styleUrls: ['./decode.page.scss'],
})
export class DecodePage implements OnInit {

  decodedTx: any
  input: string

  constructor(
    private metaverseService: MetaverseService,
    private router: Router,
    private alertService: AlertService,
    private location: Location,
  ) {

  }

  ngOnInit() {

  }

  cancel() {
    this.location.back()
  }

  async decode(tx) {
    try {
      await this.metaverseService.decodeTx(tx)       // Try if the transaction can be decoded, if not, shows an error
      this.router.navigate(['account', 'confirm'], { state: { data: { tx } } })
    } catch (error) {
      console.error(error)
      this.alertService.showErrorTranslated('DECODE.ERROR_DECODE.TITLE', 'DECODE.ERROR_DECODE.SUBTITLE')
    }
  }

  onInputChange() {
    this.input = this.input.split(/[\n ]+/).join('')
  }

}
