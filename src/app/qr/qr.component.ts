import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss'],
})
export class QrComponent implements OnInit {

  @Input() title: string
  @Input() content: string

  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() { }

  cancel() {
    this.modalController.dismiss({
      dismissed: true
    })
  }
}
