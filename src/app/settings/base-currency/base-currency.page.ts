import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AppService } from 'src/app/services/app.service'
import { CATCH_STACK_VAR } from '@angular/compiler/src/output/output_ast'

@Component({
  selector: 'app-base-currency',
  templateUrl: './base-currency.page.html',
  styleUrls: ['./base-currency.page.scss'],
})
export class BaseCurrencyPage implements OnInit {

  currencies = ['BTC', 'USD', 'CNY', 'EUR', 'JPY', 'GBP', 'CAD']
  currentBase: string

  constructor(
    private router: Router,
    private appService: AppService,
  ) { }

  async ngOnInit() {
  }

  async ionViewDidEnter() {
    this.currentBase = await this.appService.getBaseCurrency()
  }

  async select(currency) {
    try {
      this.currentBase = currency
      await this.appService.setBaseCurrency(currency)
      this.router.navigate(['account', 'portfolio'])
    } catch (e) {
      console.log('Error changing base currency')
    }
  }


}
