import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridEventosSesionesComponent } from './grid-eventos-sesiones.component';
describe('GridEventosSesionesComponent', () => {
  let component: GridEventosSesionesComponent;
  let fixture: ComponentFixture<GridEventosSesionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridEventosSesionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridEventosSesionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
