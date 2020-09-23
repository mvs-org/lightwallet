import { Component, OnInit } from '@angular/core'
import { OrderDetails, SwftService } from '../swft.service'
import { AppService } from 'src/app/services/app.service'
import { Router, ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})
export class OrderDetailPage implements OnInit {

  order: OrderDetails
  id: string

  constructor(
    public etpBridgeService: SwftService,
    public appService: AppService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {

  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id
    this.loadOrder(this.id)
  }

  private async loadOrder(id: string) {
    console.log(id)
    try {
      this.order = await this.etpBridgeService.getOrder(id).toPromise()
      if (this.order) {
        await this.etpBridgeService.saveOrder(this.order)
      }
    } catch (error) {
      console.error(error)
    }
  }

  explorerURL = (type, data) => (this.appService.network === 'mainnet') ? 'https://explorer.mvs.org/' + type + '/' + data : 'https://explorer-testnet.mvs.org/' + type + '/' + data

  gotoAssetTransfer = (asset, recipient, amount) =>
    this.router.navigate(['account', 'send', asset], { state: { data: { recipient, amount } } })

  show(address) {
    // let profileModal = this.modalCtrl.create('QRCodePage', { value: address })
    // profileModal.present()
  }


}
