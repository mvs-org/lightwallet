import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { MiningModelSelectorComponent } from './mining-model-selector.component'

describe('MiningModelSelectorComponent', () => {
  let component: MiningModelSelectorComponent
  let fixture: ComponentFixture<MiningModelSelectorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiningModelSelectorComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(MiningModelSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
