import { TestBed } from '@angular/core/testing';

import { MultisigService } from './multisig.service';

describe('MultisigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MultisigService = TestBed.get(MultisigService);
    expect(service).toBeTruthy();
  });
});
