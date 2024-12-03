import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri028PreOnboardingDetailComponent } from './hri028-pre-onboarding-detail.component';

describe('Hri028PreOnboardingDetailComponent', () => {
  let component: Hri028PreOnboardingDetailComponent;
  let fixture: ComponentFixture<Hri028PreOnboardingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri028PreOnboardingDetailComponent]
    });
    fixture = TestBed.createComponent(Hri028PreOnboardingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
