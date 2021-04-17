import { TestBed } from '@angular/core/testing';

import { AccountGuard } from './account.guard';

describe('AccountGuard', () => {
  let guard: AccountGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AccountGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
