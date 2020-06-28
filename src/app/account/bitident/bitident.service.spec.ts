import { TestBed } from '@angular/core/testing';

import { BitidentService } from './bitident.service';

describe('BitidentService', () => {
  let service: BitidentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BitidentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
