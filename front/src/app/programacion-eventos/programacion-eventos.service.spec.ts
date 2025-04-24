import { TestBed } from '@angular/core/testing';

import { ProgramacionEventosService } from './programacion-eventos.service';

describe('ProgramacionEventosService', () => {
  let service: ProgramacionEventosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramacionEventosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
