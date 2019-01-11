import { Component, Input, Output, EventEmitter, SimpleChanges, SimpleChange } from '@angular/core';

class Period {
    constructor(
        public duration: number,
        public quantity: number
    ) { }
}

@Component({
    selector: 'attenuation-model-selector',
    templateUrl: 'attenuation-model-selector.html'
})
export class AttenuationModelSelectorComponent {

    @Input() quantity: string;              //Displayed quantity
    @Input() decimals: number;

    type: string = 'simple'
    periods: Array<Period> = []
    periods_nbr_limit: number = 50
    periods_length_limit: number = 10000000
    locktime: number
    nbrPeriod: number
    attenuation_model: string

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
                                
        if(this.quantity)
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
                break;
            }
        if(this.attenuation_model != attenuation_model) {
            this.modelChanged.emit(attenuation_model)
            this.attenuation_model = attenuation_model
        }
        
    }

    validLocktime = (locktime) => locktime && locktime > 0 && !/[^0-9]/g.test(locktime)

    validNbrPeriod = (nbrPeriod) => nbrPeriod && nbrPeriod > 0 && nbrPeriod <= 1000 && !/[^0-9]/g.test(nbrPeriod)

    validLockPeriod = (lockPeriod) => lockPeriod && lockPeriod > 0 && !/[^0-9]/g.test(lockPeriod) && lockPeriod < 1000000

}
