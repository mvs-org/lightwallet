import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HowtoPage } from './howto.page';

describe('HowtoPage', () => {
  let component: HowtoPage;
  let fixture: ComponentFixture<HowtoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HowtoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HowtoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
