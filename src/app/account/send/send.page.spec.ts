import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendPage } from './send.page';

describe('SendPage', () => {
  let component: SendPage;
  let fixture: ComponentFixture<SendPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
