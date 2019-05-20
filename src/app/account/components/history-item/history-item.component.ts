import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss'],
})
export class HistoryItemComponent implements OnInit {

  @Input() transaction: any;
  addresses$ = new BehaviorSubject<string[]>([]);

  constructor() { }

  ngOnInit() {

    this.transaction.inputs.forEach(input => {
      console.log(input)
      //input.personnal = this.addresses$.indexOf(input.address) > -1
      
    });
  }

}
