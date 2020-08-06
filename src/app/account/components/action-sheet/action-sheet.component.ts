import { Component, OnInit, Input } from '@angular/core'
import { ActionSheetController } from '@ionic/angular'

class Button {
  constructor(
    public icon: string,
    public text: string,
    public role: string,
  ) { }
}

@Component({
  selector: 'app-action-sheet',
  templateUrl: './action-sheet.component.html',
  styleUrls: ['./action-sheet.component.scss'],
})
export class ActionSheetComponent implements OnInit {

  @Input() buttons: Array<Button> = []

  constructor(
    public actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
    this.presentActionSheet(this.buttons)
  }

  async presentActionSheet(buttons: Array<Button>) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Albums',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          console.log('Delete clicked')
        }
      }, {
        text: 'Share',
        icon: 'share',
        handler: () => {
          console.log('Share clicked')
        }
      }, {
        text: 'Play (open modal)',
        icon: 'caret-forward-circle',
        handler: () => {
          console.log('Play clicked')
        }
      }, {
        text: 'Favorite',
        icon: 'heart',
        handler: () => {
          console.log('Favorite clicked')
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked')
        }
      }]
    })
    await actionSheet.present()
  }

}
