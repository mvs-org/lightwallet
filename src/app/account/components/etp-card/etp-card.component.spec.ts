import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EtpCardComponent } from './etp-card.component';

describe('EtpCardComponent', () => {
  let component: EtpCardComponent;
  let fixture: ComponentFixture<EtpCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtpCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EtpCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
