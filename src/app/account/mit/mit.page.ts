import { Component, OnInit } from '@angular/core';
import { MetaverseService } from 'src/app/services/metaverse.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mit',
  templateUrl: './mit.page.html',
  styleUrls: ['./mit.page.scss'],
})
export class MitPage implements OnInit {

  balances: any

  constructor(
    private metaverseService: MetaverseService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.showBalances()
  }

  private async showBalances() {
    try {
      this.balances = await this.metaverseService.getBalances()
      console.log(this.balances)
    } catch (e) {
        console.error(e)
        console.log('Can\'t load balances')
    }
  }

  reorder = () => this.router.navigate(['/account', 'mst', 'reorder'])

}
