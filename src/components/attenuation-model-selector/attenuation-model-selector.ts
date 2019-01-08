import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'attenuation-model-selector',
  templateUrl: 'attenuation-model-selector.html'
})
export class AttenuationModelSelectorComponent {

  @Output() modelChanged : EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

  setModel(){
    this.modelChanged.emit('test')
  }
}
