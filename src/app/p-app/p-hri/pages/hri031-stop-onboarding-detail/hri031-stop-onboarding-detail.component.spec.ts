import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri031StopOnboardingDetailComponent } from './hri031-stop-onboarding-detail.component';

describe('Hri031StopOnboardingDetailComponent', () => {
  let component: Hri031StopOnboardingDetailComponent;
  let fixture: ComponentFixture<Hri031StopOnboardingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri031StopOnboardingDetailComponent]
    });
    fixture = TestBed.createComponent(Hri031StopOnboardingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
