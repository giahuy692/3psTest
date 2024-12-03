import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrPolicyTransitionListComponent } from './hr-policy-transition-list.component';

describe('HrPolicyTransitionListComponent', () => {
  let component: HrPolicyTransitionListComponent;
  let fixture: ComponentFixture<HrPolicyTransitionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrPolicyTransitionListComponent]
    });
    fixture = TestBed.createComponent(HrPolicyTransitionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
