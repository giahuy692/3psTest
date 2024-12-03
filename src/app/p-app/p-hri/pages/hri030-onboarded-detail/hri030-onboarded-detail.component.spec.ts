import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri030OnboardedDetailComponent } from './hri030-onboarded-detail.component';

describe('Hri030OnboardedDetailComponent', () => {
  let component: Hri030OnboardedDetailComponent;
  let fixture: ComponentFixture<Hri030OnboardedDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri030OnboardedDetailComponent]
    });
    fixture = TestBed.createComponent(Hri030OnboardedDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
