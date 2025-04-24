import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridTablasValoresItemsComponent } from './grid-tablas-valores-items.component';
describe('GridTablasValoresItemsComponent', () => {
  let component: GridTablasValoresItemsComponent;
  let fixture: ComponentFixture<GridTablasValoresItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridTablasValoresItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridTablasValoresItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
