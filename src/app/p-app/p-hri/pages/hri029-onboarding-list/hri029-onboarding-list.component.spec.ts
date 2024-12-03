import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri029OnboardingListComponent } from './hri029-onboarding-list.component';

describe('Hri029OnboardingListComponent', () => {
  let component: Hri029OnboardingListComponent;
  let fixture: ComponentFixture<Hri029OnboardingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri029OnboardingListComponent]
    });
    fixture = TestBed.createComponent(Hri029OnboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
