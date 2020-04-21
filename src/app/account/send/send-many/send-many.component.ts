import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-send-many',
  templateUrl: './send-many.component.html',
  styleUrls: ['./send-many.component.scss'],
})
export class SendManyComponent implements OnInit {

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
