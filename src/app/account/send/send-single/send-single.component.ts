import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-send-single',
  templateUrl: './send-single.component.html',
  styleUrls: ['./send-single.component.scss'],
})
export class SendSingleComponent implements OnInit {

  symbol: string

  constructor(
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activatedRoute.parent.params.subscribe(params => {
      this.symbol = params.symbol
      })
  }

}
