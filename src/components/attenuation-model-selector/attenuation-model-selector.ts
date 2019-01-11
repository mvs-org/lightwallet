import { Component, Input, Output, EventEmitter, SimpleChanges, SimpleChange } from '@angular/core';

class Period {
    constructor(
        public locktime: string,
        public quantity: string
    ) { }
}

@Component({
    selector: 'attenuation-model-selector',
    templateUrl: 'attenuation-model-selector.html'
})
export class AttenuationModelSelectorComponent {

    @Input() quantity: string;              //Displayed quantity
    @Input() decimals: number;
    @Input() asset: string;

    type: string = 'simple'
    periods: Array<Period> = []
    periods_nbr_limit: number = 50
    periods_length_limit: number = 10000000
    locktime: number
    nbrPeriod: number
    attenuation_model: string
    total_quantity: number = 0
    total_locktime: number = 0

    @Output() modelChanged : EventEmitter<string> = new EventEmitter<string>();

    constructor() {
        this.periods.push(new Period(undefined, undefined))     
    }

    ngOnChanges(changes: SimpleChanges) {
        const quantity: SimpleChange = changes.quantity;
        this.inputChange(event)
        this.quantity = quantity.currentValue;
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
        let attenuation_model: string = undefined
        let quantity = Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals))

        switch(this.type){
            case "simple":
                if(this.validLocktime(this.locktime))
                    attenuation_model = "PN=0;LH=" + this.locktime + ";TYPE=1;LQ=" + quantity + ";LP=" + this.locktime + ";UN=1"                     
                break;
            case "recurrent":
                if(this.validLocktime(this.locktime) && this.validNbrPeriod(this.nbrPeriod))
                    attenuation_model = "PN=0;LH=" + Math.floor(this.locktime/this.nbrPeriod) + ";TYPE=1;LQ=" + quantity + ";LP=" + this.locktime + ";UN=" + this.nbrPeriod                     
                break;
            case "custom":
                let valid: boolean = true
                let total_quantity: number = 0
                let total_locktime: number = 0
                let UQ: string
                let UC: string
                for(let i = 0; i < this.periods.length; i ++) {
                    let period = this.periods[i]
                    if(period.quantity)
                        total_quantity += parseFloat(period.quantity)
                    if(period.locktime)
                        total_locktime += parseFloat(period.locktime)
                    UQ = i == 0 ? Math.round(parseFloat(period.quantity) * Math.pow(10, this.decimals)) +'' : UQ + ',' + Math.round(parseFloat(period.quantity) * Math.pow(10, this.decimals))
                    UC = i == 0 ? period.locktime : UC + ',' + period.locktime
                    if(!this.validQuantity(period.quantity) || !this.validLocktime(period.locktime))
                        valid = false
                }
                this.total_quantity = total_quantity
                this.total_locktime = total_locktime
                if(valid && this.validLocktime(total_locktime) && this.total_quantity <= parseFloat(this.quantity))
                    attenuation_model = "PN=0;LH=" + this.periods[0].locktime + ";TYPE=2;LQ=" + Math.round(total_quantity * Math.pow(10, this.decimals)) + ";LP=" + total_locktime + ";UN=" + this.periods.length + ";UC=" + UC + ";UQ=" + UQ
                break;
        }

        if(this.attenuation_model != attenuation_model && this.quantity) {
            this.modelChanged.emit(attenuation_model)
            this.attenuation_model = attenuation_model
        }
        
    }

    validLocktime = (locktime) => locktime && locktime > 0 && this.countDecimals(locktime) == 0 && locktime < 100000000

    validNbrPeriod = (nbrPeriod) => nbrPeriod && nbrPeriod > 0 && nbrPeriod <= 1000 && this.countDecimals(nbrPeriod) == 0

    validQuantity = (quantity) => quantity != undefined
        && this.countDecimals(quantity) <= this.decimals
        && parseFloat(this.quantity) >= parseFloat(quantity)
        && (quantity > 0)

    countDecimals(value) {
        if (Math.floor(value) !== value && value.toString().split(".").length > 1)
            return value.toString().split(".")[1].length || 0;
        return 0;
    }

}
