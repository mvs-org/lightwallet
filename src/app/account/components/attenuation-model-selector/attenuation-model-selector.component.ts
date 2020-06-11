import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core'
import { AlertService } from 'src/app/services/alert.service'
import { Platform } from '@ionic/angular'
import { MetaverseService } from 'src/app/services/metaverse.service'

class Period {
  constructor(
    public locktime: string,
    public quantity: string
  ) { }
}

@Component({
  selector: 'app-attenuation-model-selector',
  templateUrl: './attenuation-model-selector.component.html',
  styleUrls: ['./attenuation-model-selector.component.scss'],
})
export class AttenuationModelSelectorComponent {

  @Input() quantity: string              // Displayed quantity
  @Input() decimals: number
  @Input() asset: string
  @Input() toMany = false

  type = 'simple'
  periods: Array<Period> = []
  periods_nbr_limit = 50
  periods_length_limit = 10000000
  locktime: number
  nbrPeriod: number
  attenuation_model: string
  total_quantity = 0
  total_locktime = 0
  duration_days = 0
  duration_hours = 0
  blocktime: number

  @Output() modelChanged: EventEmitter<any> = new EventEmitter<any>()

  constructor(
    public platform: Platform,
    private alertService: AlertService,
    private metaverseService: MetaverseService,
  ) {

  }

  async ngOnInit() {
    this.periods.push(new Period(undefined, undefined))

    try {
      const height = await this.metaverseService.getHeight()
      this.blocktime = await this.metaverseService.getBlocktime(height)
    } catch (error) {
      console.error(error.message)
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    this.inputChange(event)
    if (this.toMany) {
      this.type = 'simple'
    }
  }

  addPeriod() {
    this.periods.push(new Period(undefined, undefined))
    this.inputChange(event)
  }

  removePeriod(index) {
    this.periods.splice(index, 1)
    this.inputChange(event)
  }

  inputChange(event) {
    let attenuation_model: string
    let quantity = Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals))
    this.duration_days = Math.floor(this.blocktime * this.locktime / (24 * 60 * 60))
    this.duration_hours = Math.floor((this.blocktime * this.locktime / (60 * 60)) - (24 * this.duration_days))

    switch (this.type) {
      case 'simple':
        if (this.validLocktime(this.locktime)) {
          if (!this.toMany) {
            attenuation_model = 'PN=0;LH=' + this.locktime + ';TYPE=1;LQ=' + quantity + ';LP=' + this.locktime + ';UN=1'
          } else {
            // Do not set the quantity if send to many, the quantity LQ is set per recipient
            attenuation_model = 'PN=0;LH=' + this.locktime + ';TYPE=1;LP=' + this.locktime + ';UN=1'
          }
        }
        break
      case 'recurrent':
        if (this.validLocktime(this.locktime) && this.validNbrPeriod(this.nbrPeriod)) {
          attenuation_model = 'PN=0;LH=' + Math.floor(this.locktime / this.nbrPeriod) + ';TYPE=1;LQ=' + quantity + ';LP=' + this.locktime + ';UN=' + this.nbrPeriod
        }
        break
      case 'custom':
        let valid = true
        let total_quantity: number = 0
        let total_locktime: number = 0
        let UQ: string
        let UC: string
        for (let i = 0; i < this.periods.length; i++) {
          const period = this.periods[i]
          if (period.quantity) {
            total_quantity += parseFloat(period.quantity)
          }
          if (period.locktime) {
            total_locktime += parseFloat(period.locktime)
          }
          UQ = i === 0 ? Math.round(parseFloat(period.quantity) * Math.pow(10, this.decimals)) + '' : UQ + ',' + Math.round(parseFloat(period.quantity) * Math.pow(10, this.decimals))
          UC = i === 0 ? period.locktime : UC + ',' + period.locktime
          if (!this.validQuantity(period.quantity) || !this.validLocktime(period.locktime)) {
            valid = false
          }
        }
        this.total_quantity = total_quantity
        this.total_locktime = total_locktime
        if (valid && this.validLocktime(total_locktime) && this.total_quantity <= parseFloat(this.quantity)) {
          attenuation_model = 'PN=0;LH=' + this.periods[0].locktime + ';TYPE=2;LQ=' + Math.round(total_quantity * Math.pow(10, this.decimals)) + ';LP=' + total_locktime + ';UN=' + this.periods.length + ';UC=' + UC + ';UQ=' + UQ
        }
        break
    }

    if (this.attenuation_model !== attenuation_model && (this.quantity || this.toMany)) {
      const output = {
        attenuation_model,
        locktime: this.locktime
      }
      this.modelChanged.emit(output)
      this.attenuation_model = attenuation_model
    }

  }

  validLocktime = (locktime) => locktime && locktime > 0 && this.countDecimals(locktime) == 0 && locktime < 100000000

  validNbrPeriod = (nbrPeriod) => nbrPeriod && nbrPeriod > 0 && nbrPeriod <= 1000 && this.countDecimals(nbrPeriod) == 0

  validQuantity = (quantity) => quantity != undefined
    && this.countDecimals(quantity) <= this.decimals
    && (quantity > 0)

  countDecimals(value) {
    if (Math.floor(value) !== value && value.toString().split('.').length > 1) {
      return value.toString().split('.')[1].length || 0
    }
    return 0
  }

  import(e) {
    this.alertService.showLoading()
      .then(() => {
        setTimeout(() => {
          this.open(e)
        }, 500)
      })
  }

  open(e) {
    const file = e.target.files
    const reader = new FileReader()
    reader.onload = (e: any) => {
      const content = e.target.result
      try {
        const data = content.split('\n')
        if (data.length > this.periods_nbr_limit) {
          this.alertService.showLimitReached('MESSAGE.LOCK_IMPORT_CSV_TOO_MANY_PERIODS_TITLE', 'MESSAGE.LOCK_IMPORT_CSV_TOO_MANY_PERIOD_BODY', this.periods_nbr_limit)
        } else {
          this.periods = []
          for (let i = 0; i < data.length; i++) {
            if (data[i]) {
              let period = data[i].split(',')
              period[0] = period[0] ? period[0].trim() : period[0]
              this.periods.push(new Period(period[0], period[1]))
            }
          }
          this.inputChange(event)
        }
        this.alertService.stopLoading()
      } catch (e) {
        this.alertService.stopLoading()
        console.error(e)
        this.alertService.showMessage('WRONG_FILE', '', 'SEND_MORE.WRONG_FILE')
      }
    }
    if (file[0]) {
      reader.readAsText(file[0])
    }
  }

  download() {
    let text = ''
    const filename = 'lock_model.csv'
    this.periods.forEach((period) => {
      const line = period.locktime + ',' + period.quantity + '\n'
      text += line
    })
    this.downloadFile(filename, text)
  }

  csvExample() {
    const text = 'Locktime in Block,Amount,Please delete this line before import\n10,1000\n20,2000\n50,10000'
    const filename = 'mvs_example.csv'
    this.downloadFile(filename, text)
  }

  downloadFile(filename, text) {
    const pom = document.createElement('a')
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    pom.setAttribute('download', filename)

    if (document.createEvent) {
      const event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      pom.dispatchEvent(event)
    }
    else {
      pom.click()
    }
  }

}
