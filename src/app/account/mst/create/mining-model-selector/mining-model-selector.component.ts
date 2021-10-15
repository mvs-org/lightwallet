import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Platform } from '@ionic/angular'

@Component({
  selector: 'app-mining-model-selector',
  templateUrl: './mining-model-selector.component.html',
  styleUrls: ['./mining-model-selector.component.scss'],
})

export class MiningModelSelectorComponent implements OnInit {

  @Input() decimals: number
  @Input() asset: string

  initial: number
  interval: number
  basePercent = 50
  mstMiningModel: string

  @Output() modelChanged: EventEmitter<string> = new EventEmitter<string>()

  constructor(
    public platform: Platform,
  ) { }

  ngOnInit() { }

  inputChange(event) {
    let mstMiningModel: string
    const base = (100 - this.basePercent) / 100

    if (this.validInitial(this.initial) && this.validInterval(this.interval)) {
      mstMiningModel = 'initial:' + Math.round(this.initial * Math.pow(10, this.decimals)) + ',interval:' + this.interval + ',base:' + base
    }

    if (this.mstMiningModel !== mstMiningModel) {
      this.modelChanged.emit(mstMiningModel)
      this.mstMiningModel = mstMiningModel
    }

  }

  validInitial = (initial) => initial && initial > 0 && this.countDecimals(initial) <= this.decimals

  validInterval = (interval) => interval && interval > 0 && this.countDecimals(interval) == 0

  countDecimals(value) {
    if (Math.floor(value) !== value && value.toString().split('.').length > 1) {
      return value.toString().split('.')[1].length || 0
    } else {
      return 0
    }
  }

}
