import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri019PayrollListComponent } from './hri019-payroll-list.component';

describe('Hri019PayrollListComponent', () => {
  let component: Hri019PayrollListComponent;
  let fixture: ComponentFixture<Hri019PayrollListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri019PayrollListComponent]
    });
    fixture = TestBed.createComponent(Hri019PayrollListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
