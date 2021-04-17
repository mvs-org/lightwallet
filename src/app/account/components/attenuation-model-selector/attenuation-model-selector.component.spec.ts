import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AttenuationModelSelectorComponent } from './attenuation-model-selector.component';

describe('AttenuationModelSelectorComponent', () => {
  let component: AttenuationModelSelectorComponent;
  let fixture: ComponentFixture<AttenuationModelSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttenuationModelSelectorComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AttenuationModelSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
