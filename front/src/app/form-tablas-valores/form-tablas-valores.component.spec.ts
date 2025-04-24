import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTablasValoresComponent } from './form-tablas-valores.component';

describe('FormTablasValoresComponent', () => {
  let component: FormTablasValoresComponent;
  let fixture: ComponentFixture<FormTablasValoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormTablasValoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTablasValoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
