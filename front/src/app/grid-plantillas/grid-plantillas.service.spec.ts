import { TestBed } from '@angular/core/testing';

import { GridPlantillasService } from './grid-plantillas.service';

describe('GridPlantillasService', () => {
  let service: GridPlantillasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridPlantillasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
