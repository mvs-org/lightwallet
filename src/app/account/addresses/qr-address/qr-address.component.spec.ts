import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrAddressComponent } from './qr-address.component';

describe('QrAddressComponent', () => {
  let component: QrAddressComponent;
  let fixture: ComponentFixture<QrAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrAddressComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
