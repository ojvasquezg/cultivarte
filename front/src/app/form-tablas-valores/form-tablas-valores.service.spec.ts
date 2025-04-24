import { TestBed } from '@angular/core/testing';

import { FormTablasValoresService } from './form-tablas-valores.service';

describe('FormTablasValoresService', () => {
  let service: FormTablasValoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormTablasValoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
