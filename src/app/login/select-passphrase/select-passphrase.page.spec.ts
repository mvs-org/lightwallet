import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPassphrasePage } from './select-passphrase.page';

describe('SelectPassphrasePage', () => {
  let component: SelectPassphrasePage;
  let fixture: ComponentFixture<SelectPassphrasePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectPassphrasePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPassphrasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
