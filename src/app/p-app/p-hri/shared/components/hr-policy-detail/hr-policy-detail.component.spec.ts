import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrPolicyDetailComponent } from './hr-policy-detail.component';

describe('HrPolicyDetailComponent', () => {
  let component: HrPolicyDetailComponent;
  let fixture: ComponentFixture<HrPolicyDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrPolicyDetailComponent]
    });
    fixture = TestBed.createComponent(HrPolicyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
