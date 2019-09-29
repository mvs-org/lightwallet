import { Component, Input, Output, EventEmitter, SimpleChanges, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';

@Component({
    selector: 'mining-model-selector',
    templateUrl: 'mining-model-selector.html'
})
export class MiningModelSelectorComponent {

    @Input() decimals: number;
    @Input() asset: string;

    initial: number
    interval: number
    basePercent: number = 50
    mst_mining_model: string

    @Output() modelChanged : EventEmitter<string> = new EventEmitter<string>();

    constructor(
        public platform: Platform,
        private zone: NgZone,
    ) {

    }

    ngOnChanges(changes: SimpleChanges) {
        this.inputChange(event)
    }

    inputChange(event) {
        let mst_mining_model: string = undefined
        let base = (100-this.basePercent)/100

        if(this.validInitial(this.initial) && this.validInterval(this.interval))
            mst_mining_model = "initial:" + Math.round(this.initial * Math.pow(10, this.decimals)) + ",interval:" + this.interval + ",base:" + base                     

        if(this.mst_mining_model != mst_mining_model) {
            this.modelChanged.emit(mst_mining_model)
            this.mst_mining_model = mst_mining_model
        }
        
    }

    validInitial = (initial) => initial && initial > 0 && this.countDecimals(initial) <= this.decimals

    validInterval = (interval) => interval && interval > 0 && this.countDecimals(interval) == 0

    countDecimals(value) {
        if (Math.floor(value) !== value && value.toString().split(".").length > 1)
            return value.toString().split(".")[1].length || 0;
        return 0;
    }

    updateRange() {
        this.zone.run(() => { });
    }

}
