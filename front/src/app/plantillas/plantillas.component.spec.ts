import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillasComponent } from './plantillas.component';

describe('PlantillasComponent', () => {
  let component: PlantillasComponent;
  let fixture: ComponentFixture<PlantillasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantillasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantillasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
