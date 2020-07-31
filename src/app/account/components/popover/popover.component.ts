import { Component, OnInit, Input } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { PopoverController } from '@ionic/angular'

class Button {
  constructor(
    public icon: string,
    public text: string,
    public action: string,
  ) { }
}

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})

export class PopoverComponent implements OnInit {

  @Input() buttons: Array<Button> = []

  constructor(
    public popoverController: PopoverController
  ) { }

  ngOnInit() {
    console.log(this.buttons)
  }

  action(action) {
    this.popoverController.dismiss({
      action,
    })
  }

}
