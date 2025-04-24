import { TestBed } from '@angular/core/testing';

import { GridTablasValoresService } from './grid-tablas-valores.service';

describe('GridTablasValoresService', () => {
  let service: GridTablasValoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridTablasValoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
