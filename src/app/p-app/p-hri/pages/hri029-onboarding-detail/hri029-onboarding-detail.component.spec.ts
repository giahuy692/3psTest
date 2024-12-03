import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri029OnboardingDetailComponent } from './hri029-onboarding-detail.component';

describe('Hri029OnboardingDetailComponent', () => {
  let component: Hri029OnboardingDetailComponent;
  let fixture: ComponentFixture<Hri029OnboardingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri029OnboardingDetailComponent]
    });
    fixture = TestBed.createComponent(Hri029OnboardingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
