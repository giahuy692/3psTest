import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrTaskAdderComponent } from './hr-task-adder.component';

describe('HrTaskAdderComponent', () => {
  let component: HrTaskAdderComponent;
  let fixture: ComponentFixture<HrTaskAdderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrTaskAdderComponent]
    });
    fixture = TestBed.createComponent(HrTaskAdderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
