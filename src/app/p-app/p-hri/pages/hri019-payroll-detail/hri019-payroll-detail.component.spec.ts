import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri019PayrollDetailComponent } from './hri019-payroll-detail.component';

describe('Hri019SalaryDetailComponent', () => {
  let component: Hri019PayrollDetailComponent;
  let fixture: ComponentFixture<Hri019PayrollDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri019PayrollDetailComponent]
    });
    fixture = TestBed.createComponent(Hri019PayrollDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
