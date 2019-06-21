import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendManyComponent } from './send-many.component';

describe('SendManyComponent', () => {
  let component: SendManyComponent;
  let fixture: ComponentFixture<SendManyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendManyComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendManyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
