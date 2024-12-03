import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri030OnboardedListComponent } from './hri030-onboarded-list.component';

describe('Hri030OnboardedListComponent', () => {
  let component: Hri030OnboardedListComponent;
  let fixture: ComponentFixture<Hri030OnboardedListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri030OnboardedListComponent]
    });
    fixture = TestBed.createComponent(Hri030OnboardedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
