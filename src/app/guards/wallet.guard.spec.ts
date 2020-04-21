import { TestBed, async, inject } from '@angular/core/testing';

import { WalletGuard } from './wallet.guard';

describe('WalletGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WalletGuard]
    });
  });

  it('should ...', inject([WalletGuard], (guard: WalletGuard) => {
    expect(guard).toBeTruthy();
  }));
});
