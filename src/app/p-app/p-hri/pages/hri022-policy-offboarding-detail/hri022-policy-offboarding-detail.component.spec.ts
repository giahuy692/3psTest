import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri022PolicyOffboardingDetailComponent } from './hri022-policy-offboarding-detail.component';

describe('Hri022PolicyOffboardingDetailComponent', () => {
  let component: Hri022PolicyOffboardingDetailComponent;
  let fixture: ComponentFixture<Hri022PolicyOffboardingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri022PolicyOffboardingDetailComponent]
    });
    fixture = TestBed.createComponent(Hri022PolicyOffboardingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
