import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri033OffboardingDetailComponent } from './hri033-offboarding-detail.component';

describe('Hri033OffboardingDetailComponent', () => {
  let component: Hri033OffboardingDetailComponent;
  let fixture: ComponentFixture<Hri033OffboardingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri033OffboardingDetailComponent]
    });
    fixture = TestBed.createComponent(Hri033OffboardingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
