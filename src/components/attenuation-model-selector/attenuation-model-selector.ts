import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Platform } from 'ionic-angular';
import { AlertProvider } from '../../providers/alert/alert';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

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
    @Input() toMany: boolean = false;

    type: string = 'simple'
    periods: Array<Period> = []
    periods_nbr_limit: number = 50
    periods_length_limit: number = 10000000
    locktime: number
    nbrPeriod: number
    attenuation_model: string
    total_quantity: number = 0
    total_locktime: number = 0
    duration_days: number = 0
    duration_hours: number = 0
    blocktime: number

    @Output() modelChanged: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        public platform: Platform,
        private alert: AlertProvider,
        private mvs: MvsServiceProvider,
    ) {
        this.periods.push(new Period(undefined, undefined))

        this.mvs.getHeight()
            .then(height => this.mvs.getBlocktime(height))
            .then(blocktime => this.blocktime = blocktime)
            .catch((error) => {
                console.error(error.message)
            })
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
        let attenuation_model: string = undefined
        let quantity = Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals))
        this.duration_days = Math.floor(this.blocktime * this.locktime / (24 * 60 * 60))
        this.duration_hours = Math.floor((this.blocktime * this.locktime / (60 * 60)) - (24 * this.duration_days))

        switch (this.type) {
            case "simple":
                if (this.validLocktime(this.locktime)) {
                    if (!this.toMany) {
                        attenuation_model = "PN=0;LH=" + this.locktime + ";TYPE=1;LQ=" + quantity + ";LP=" + this.locktime + ";UN=1"
                    } else {
                        //Do not set the quantity if send to many, the quantity LQ is set per recipient
                        attenuation_model = "PN=0;LH=" + this.locktime + ";TYPE=1;LP=" + this.locktime + ";UN=1"
                    }
                }
                break;
            case "recurrent":
                if (this.validLocktime(this.locktime) && this.validNbrPeriod(this.nbrPeriod))
                    attenuation_model = "PN=0;LH=" + Math.floor(this.locktime / this.nbrPeriod) + ";TYPE=1;LQ=" + quantity + ";LP=" + this.locktime + ";UN=" + this.nbrPeriod
                break;
            case "custom":
                let valid: boolean = true
                let total_quantity: number = 0
                let total_locktime: number = 0
                let UQ: string
                let UC: string
                for (let i = 0; i < this.periods.length; i++) {
                    let period = this.periods[i]
                    if (period.quantity)
                        total_quantity += parseFloat(period.quantity)
                    if (period.locktime)
                        total_locktime += parseFloat(period.locktime)
                    UQ = i == 0 ? Math.round(parseFloat(period.quantity) * Math.pow(10, this.decimals)) + '' : UQ + ',' + Math.round(parseFloat(period.quantity) * Math.pow(10, this.decimals))
                    UC = i == 0 ? period.locktime : UC + ',' + period.locktime
                    if (!this.validQuantity(period.quantity) || !this.validLocktime(period.locktime))
                        valid = false
                }
                this.total_quantity = total_quantity
                this.total_locktime = total_locktime
                if (valid && this.validLocktime(total_locktime) && this.total_quantity <= parseFloat(this.quantity))
                    attenuation_model = "PN=0;LH=" + this.periods[0].locktime + ";TYPE=2;LQ=" + Math.round(total_quantity * Math.pow(10, this.decimals)) + ";LP=" + total_locktime + ";UN=" + this.periods.length + ";UC=" + UC + ";UQ=" + UQ
                break;
        }

        if (this.attenuation_model != attenuation_model && (this.quantity || this.toMany)) {
            let output = {
                'attenuation_model': attenuation_model,
                'locktime': this.locktime
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
        if (Math.floor(value) !== value && value.toString().split(".").length > 1)
            return value.toString().split(".")[1].length || 0;
        return 0;
    }

    import(e) {
        this.alert.showLoading()
            .then(() => {
                setTimeout(() => {
                    this.open(e)
                }, 500);
            })
    }

    open(e) {
        let file = e.target.files
        let reader = new FileReader();
        reader.onload = (e: any) => {
            let content = e.target.result;
            try {
                let data = content.split('\n');
                if (data.length > this.periods_nbr_limit) {
                    this.alert.showLimitReached('MESSAGE.LOCK_IMPORT_CSV_TOO_MANY_PERIODS_TITLE', 'MESSAGE.LOCK_IMPORT_CSV_TOO_MANY_PERIOD_BODY', this.periods_nbr_limit)
                } else {
                    this.periods = []
                    for (let i = 0; i < data.length; i++) {
                        if (data[i]) {
                            let period = data[i].split(',');
                            period[0] = period[0] ? period[0].trim() : period[0]
                            this.periods.push(new Period(period[0], period[1]))
                        }
                    }
                    this.inputChange(event)
                }
                this.alert.stopLoading()
            } catch (e) {
                this.alert.stopLoading()
                console.error(e);
                this.alert.showMessage('WRONG_FILE', '', 'SEND_MORE.WRONG_FILE')
            }
        };
        if (file[0])
            reader.readAsText(file[0]);
    }

    download() {
        var text = ''
        var filename = 'lock_model.csv'
        this.periods.forEach((period) => {
            let line = period.locktime + ',' + period.quantity + '\n'
            text += line
        })
        this.downloadFile(filename, text)
    }

    csvExample() {
        var text = 'Locktime in Block,Amount,Please delete this line before import\n10,1000\n20,2000\n50,10000';
        var filename = 'mvs_example.csv'
        this.downloadFile(filename, text)
    }

    downloadFile(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);

        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    }

}
