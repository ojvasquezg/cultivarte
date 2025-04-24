import { TestBed } from '@angular/core/testing';

import { GridTablasValoresItemsService } from './grid-tablas-valores-items.service';

describe('GridTablasValoresItemsService', () => {
  let service: GridTablasValoresItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridTablasValoresItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
