import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { AppService } from 'src/app/services/app.service'

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  symbol: string
  history: Array<any> = []
  content: string
  owner: string
  creator: string
  create_tx: string

  constructor(
    private activatedRoute: ActivatedRoute,
    private metaverseService: MetaverseService,
    public walletService: WalletService,
    private appService: AppService,
  ) { }

  async ngOnInit() {
    this.symbol = this.activatedRoute.snapshot.params.symbol

    const outputs = await this.metaverseService.getGlobalMit(this.symbol)

    this.owner = outputs[0].attachment.to_did
    this.creator = outputs[outputs.length - 1].attachment.to_did
    this.create_tx = outputs[outputs.length - 1].tx
    outputs.forEach(output => {
      this.history.push({
        from_did: output.attachment.from_did,
        to_did: output.attachment.to_did,
        tx: output.tx,
        index: output.index,
        height: output.height,
        status: output.attachment.status,
        confirmed_at: output.confirmed_at
      })
      if (output.attachment.status === 'registered') {
        this.content = output.attachment.content
      }
    })

  }

  checkTx = (type, data) => this.walletService.openLink(this.explorerURL(type, data))

  explorerURL = (type, data) => (this.appService.network === 'mainnet') ? 'https://explorer.mvs.org/' + type + '/' + data : 'https://explorer-testnet.mvs.org/' + type + '/' + data


}
