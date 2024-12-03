import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri022PolicyOffboardingListComponent } from './hri022-policy-offboarding-list.component';

describe('Hri022PolicyOffboardingListComponent', () => {
  let component: Hri022PolicyOffboardingListComponent;
  let fixture: ComponentFixture<Hri022PolicyOffboardingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri022PolicyOffboardingListComponent]
    });
    fixture = TestBed.createComponent(Hri022PolicyOffboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
