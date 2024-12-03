import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrPolicyTransitionInfoComponent } from './hr-policy-transition-info.component';

describe('HrPolicyTransitionInfoComponent', () => {
  let component: HrPolicyTransitionInfoComponent;
  let fixture: ComponentFixture<HrPolicyTransitionInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrPolicyTransitionInfoComponent]
    });
    fixture = TestBed.createComponent(HrPolicyTransitionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
