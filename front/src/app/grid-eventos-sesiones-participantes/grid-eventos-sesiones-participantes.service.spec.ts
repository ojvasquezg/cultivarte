import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridEventosSesionesParticipantesComponent } from './grid-eventos-sesiones-participantes.component';
describe('GridEventosSesionesParticipantesComponent', () => {
  let component: GridEventosSesionesParticipantesComponent;
  let fixture: ComponentFixture<GridEventosSesionesParticipantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridEventosSesionesParticipantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridEventosSesionesParticipantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
