import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportWalletMnemonicPage } from './import-wallet-mnemonic.page';

describe('ImportWalletMnemonicPage', () => {
  let component: ImportWalletMnemonicPage;
  let fixture: ComponentFixture<ImportWalletMnemonicPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportWalletMnemonicPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportWalletMnemonicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
