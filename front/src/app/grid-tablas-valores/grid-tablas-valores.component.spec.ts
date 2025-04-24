import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridTablasValoresComponent } from './grid-tablas-valores.component';

describe('GridTablasValoresComponent', () => {
  let component: GridTablasValoresComponent;
  let fixture: ComponentFixture<GridTablasValoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridTablasValoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridTablasValoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
