import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrExceptionAdderComponent } from './hr-exception-adder.component';

describe('HrExceptionAdderComponent', () => {
  let component: HrExceptionAdderComponent;
  let fixture: ComponentFixture<HrExceptionAdderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrExceptionAdderComponent]
    });
    fixture = TestBed.createComponent(HrExceptionAdderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
