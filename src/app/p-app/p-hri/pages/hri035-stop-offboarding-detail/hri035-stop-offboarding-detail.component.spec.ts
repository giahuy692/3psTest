import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri035StopOffboardingDetailComponent } from './hri035-stop-offboarding-detail.component';

describe('Hri035StopOffboardingDetailComponent', () => {
  let component: Hri035StopOffboardingDetailComponent;
  let fixture: ComponentFixture<Hri035StopOffboardingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri035StopOffboardingDetailComponent]
    });
    fixture = TestBed.createComponent(Hri035StopOffboardingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
