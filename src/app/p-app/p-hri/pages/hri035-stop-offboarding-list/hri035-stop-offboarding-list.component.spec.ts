import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri035StopOffboardingListComponent } from './hri035-stop-offboarding-list.component';

describe('Hri035StopOffboardingListComponent', () => {
  let component: Hri035StopOffboardingListComponent;
  let fixture: ComponentFixture<Hri035StopOffboardingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri035StopOffboardingListComponent]
    });
    fixture = TestBed.createComponent(Hri035StopOffboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
