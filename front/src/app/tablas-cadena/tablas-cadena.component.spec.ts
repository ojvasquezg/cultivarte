import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablasCadenaComponent } from './tablas-cadena.component';

describe('TablasCadenaComponent', () => {
  let component: TablasCadenaComponent;
  let fixture: ComponentFixture<TablasCadenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablasCadenaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablasCadenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
