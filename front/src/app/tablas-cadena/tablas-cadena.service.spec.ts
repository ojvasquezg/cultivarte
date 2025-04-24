import { TestBed } from '@angular/core/testing';

import { TablasCadenaService } from './tablas-cadena.service';

describe('TablasCadenaService', () => {
  let service: TablasCadenaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablasCadenaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
