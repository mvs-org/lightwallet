import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PassphrasePage } from './passphrase.page';

describe('PassphrasePage', () => {
  let component: PassphrasePage;
  let fixture: ComponentFixture<PassphrasePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassphrasePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PassphrasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
