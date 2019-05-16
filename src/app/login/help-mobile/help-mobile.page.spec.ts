import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpMobilePage } from './help-mobile.page';

describe('HelpMobilePage', () => {
  let component: HelpMobilePage;
  let fixture: ComponentFixture<HelpMobilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpMobilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpMobilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
