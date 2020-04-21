import { TestBed } from '@angular/core/testing';

import { LogoutService } from './logout.service';

describe('LogoutService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LogoutService = TestBed.get(LogoutService);
    expect(service).toBeTruthy();
  });
});
