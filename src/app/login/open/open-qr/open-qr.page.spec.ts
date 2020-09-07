import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OpenQrPage } from './open-qr.page';

describe('OpenQrPage', () => {
  let component: OpenQrPage;
  let fixture: ComponentFixture<OpenQrPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenQrPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OpenQrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
