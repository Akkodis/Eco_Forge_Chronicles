import { TestBed } from '@angular/core/testing';

import { FilterImagesService } from './filter-images.service';

describe('FilterImagesService', () => {
  let service: FilterImagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterImagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
