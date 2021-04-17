import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginXpubPage } from './login-xpub.page';

describe('LoginXpubPage', () => {
  let component: LoginXpubPage;
  let fixture: ComponentFixture<LoginXpubPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginXpubPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginXpubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
