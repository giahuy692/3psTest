import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri032PreOffboardingListComponent } from './hri032-pre-offboarding-list.component';

describe('Hri032PreOffboardingListComponent', () => {
  let component: Hri032PreOffboardingListComponent;
  let fixture: ComponentFixture<Hri032PreOffboardingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri032PreOffboardingListComponent]
    });
    fixture = TestBed.createComponent(Hri032PreOffboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
