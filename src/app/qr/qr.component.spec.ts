import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QrComponent } from './qr.component';

describe('QrComponent', () => {
  let component: QrComponent;
  let fixture: ComponentFixture<QrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
