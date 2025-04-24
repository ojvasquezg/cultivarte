import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramacionEventosComponent } from './programacion-eventos.component';

describe('ProgramacionEventosComponent', () => {
  let component: ProgramacionEventosComponent;
  let fixture: ComponentFixture<ProgramacionEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramacionEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramacionEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
