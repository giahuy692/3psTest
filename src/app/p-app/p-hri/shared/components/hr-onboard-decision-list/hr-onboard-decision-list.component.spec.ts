import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrOnboardDecisionListComponent } from './hr-onboard-decision-list.component';

describe('HrOnboardDecisionListComponent', () => {
  let component: HrOnboardDecisionListComponent;
  let fixture: ComponentFixture<HrOnboardDecisionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrOnboardDecisionListComponent]
    });
    fixture = TestBed.createComponent(HrOnboardDecisionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
