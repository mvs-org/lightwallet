import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginAccountPage } from './login-account.page';

describe('LoginAccountPage', () => {
  let component: LoginAccountPage;
  let fixture: ComponentFixture<LoginAccountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginAccountPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
