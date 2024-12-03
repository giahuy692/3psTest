import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri032PreOffboardingDetailComponent } from './hri032-pre-offboarding-detail.component';

describe('Hri032PreOffboardingDetailComponent', () => {
  let component: Hri032PreOffboardingDetailComponent;
  let fixture: ComponentFixture<Hri032PreOffboardingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri032PreOffboardingDetailComponent]
    });
    fixture = TestBed.createComponent(Hri032PreOffboardingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
