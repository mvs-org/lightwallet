import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginAccountPage } from './login-account.page';

describe('LoginAccountPage', () => {
  let component: LoginAccountPage;
  let fixture: ComponentFixture<LoginAccountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginAccountPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
