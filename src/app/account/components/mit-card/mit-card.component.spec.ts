import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MitCardComponent } from './mit-card.component';

describe('MitCardComponent', () => {
  let component: MitCardComponent;
  let fixture: ComponentFixture<MitCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MitCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MitCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
