import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridPlantillasComponent } from './grid-plantillas.component';

describe('GridPlantillasComponent', () => {
  let component: GridPlantillasComponent;
  let fixture: ComponentFixture<GridPlantillasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridPlantillasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridPlantillasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
