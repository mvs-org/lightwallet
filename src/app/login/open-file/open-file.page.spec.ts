import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenFilePage } from './open-file.page';

describe('OpenFilePage', () => {
  let component: OpenFilePage;
  let fixture: ComponentFixture<OpenFilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenFilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenFilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
