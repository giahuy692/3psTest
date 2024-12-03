import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri027TerminationDecisionListComponent } from './hri027-termination-decision-list.component';

describe('Hri027TerminationDecisionListComponent', () => {
  let component: Hri027TerminationDecisionListComponent;
  let fixture: ComponentFixture<Hri027TerminationDecisionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri027TerminationDecisionListComponent]
    });
    fixture = TestBed.createComponent(Hri027TerminationDecisionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
