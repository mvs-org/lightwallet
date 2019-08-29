import { Component, Input } from '@angular/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@Component({
    selector: 'output-item',
    templateUrl: 'output-item.html'
})
export class OutputItemComponent {

    @Input() output: any;
    @Input() decimalsMst: any;
    @Input() mode: string;

    attenuationObject: any = {}
    height: number
    blocktime: number
    current_time: number

    constructor(
        private mvs: MvsServiceProvider,
    ) {

    }

    async ngAfterViewInit() {
        if(this.output.attenuation) {
            this.current_time = Date.now()
            this.height = await this.mvs.getHeight()
            this.blocktime = await this.mvs.getBlocktime(this.height)
            const attenuationArray = this.output.attenuation.model.split(';')
            attenuationArray.forEach(param => {
                const temp = param.split('=')
                this.attenuationObject[temp[0]] = temp[1]
            })
            this.output.locked_until = this.height + 1 + parseInt(this.attenuationObject.LP)
        }
    }

}
