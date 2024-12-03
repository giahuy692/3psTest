import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri028PreOnboardingListComponent } from './hri028-pre-onboarding-list.component';

describe('Hri028PreOnboardingListComponent', () => {
  let component: Hri028PreOnboardingListComponent;
  let fixture: ComponentFixture<Hri028PreOnboardingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri028PreOnboardingListComponent]
    });
    fixture = TestBed.createComponent(Hri028PreOnboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
