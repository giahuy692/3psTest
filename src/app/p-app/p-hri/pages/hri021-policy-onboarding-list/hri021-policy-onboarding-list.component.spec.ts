import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri021PolicyOnboardingListComponent } from './hri021-policy-onboarding-list.component';

describe('Hri021PolicyOnboardingListComponent', () => {
  let component: Hri021PolicyOnboardingListComponent;
  let fixture: ComponentFixture<Hri021PolicyOnboardingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri021PolicyOnboardingListComponent]
    });
    fixture = TestBed.createComponent(Hri021PolicyOnboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
