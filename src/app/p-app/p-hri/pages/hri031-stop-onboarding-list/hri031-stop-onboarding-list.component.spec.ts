import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri031StopOnboardingListComponent } from './hri031-stop-onboarding-list.component';

describe('Hri031StopOnboardingListComponent', () => {
  let component: Hri031StopOnboardingListComponent;
  let fixture: ComponentFixture<Hri031StopOnboardingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri031StopOnboardingListComponent]
    });
    fixture = TestBed.createComponent(Hri031StopOnboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
