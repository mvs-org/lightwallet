import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'

@Component({
    selector: 'mst-card',
    templateUrl: 'mst-card.component.html'
})

export class MSTCardComponent {

    @Input() balance: any
    @Input() symbol: string
    @Input() theme: string
    @Input() icon: string
    @Input() swap: boolean
    @Input() tickers: any
    @Input() base: string

    constructor(
        private router: Router
    ) { }

    errorImg = e => this.icon = this.icon !== 'assets/icon/' + this.symbol + '.png' ? 'assets/icon/' + this.symbol + '.png' : 'assets/icon/default_mst.png'

    gotoSwap = () => this.router.navigate(['/swap', this.symbol])

    gotoVote = () => this.router.navigate(['/vote'])
}
