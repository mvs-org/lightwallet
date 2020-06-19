import { Component, Input } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'

@Component({
    selector: 'output-item',
    templateUrl: 'output-item.html'
})
export class OutputItemComponent {

    @Input() output: any
    @Input() decimalsMst: any
    @Input() mode: string

    attenuationObject: any = {}
    height: number
    blocktime: number
    currentTime: number

    constructor(
        public mvs: MetaverseService,
    ) {
        this.init()
    }

    async init() {
        if (this.output && this.output.attenuation) {
            this.currentTime = Date.now()
            this.height = await this.mvs.getHeight()
            this.blocktime = await this.mvs.getBlocktime(this.height)
            const attenuationArray = this.output.attenuation.model.split(';')
            attenuationArray.forEach(param => {
                const temp = param.split('=')
                this.attenuationObject[temp[0]] = temp[1]
            })
            this.output.locked_until = this.height + 1 + parseInt(this.attenuationObject.LP, 10)
        }
    }

}
