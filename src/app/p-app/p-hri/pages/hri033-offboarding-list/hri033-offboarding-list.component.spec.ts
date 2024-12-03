import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri033OffboardingListComponent } from './hri033-offboarding-list.component';

describe('Hri033OffboardingListComponent', () => {
  let component: Hri033OffboardingListComponent;
  let fixture: ComponentFixture<Hri033OffboardingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri033OffboardingListComponent]
    });
    fixture = TestBed.createComponent(Hri033OffboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
