import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri021PolicyOnboardingDetailComponent } from './hri021-policy-onboarding-detail.component';

describe('Hri021PolicyOnboardingDetailComponent', () => {
  let component: Hri021PolicyOnboardingDetailComponent;
  let fixture: ComponentFixture<Hri021PolicyOnboardingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri021PolicyOnboardingDetailComponent]
    });
    fixture = TestBed.createComponent(Hri021PolicyOnboardingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
