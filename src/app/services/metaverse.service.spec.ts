import { TestBed } from '@angular/core/testing';

import { MetaverseService } from './metaverse.service';

describe('MetaverseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MetaverseService = TestBed.get(MetaverseService);
    expect(service).toBeTruthy();
  });
});
