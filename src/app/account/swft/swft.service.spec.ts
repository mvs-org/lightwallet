import { TestBed } from '@angular/core/testing';

import { SwftService } from './swft.service';

describe('SwftService', () => {
  let service: SwftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
