import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri027TerminationDecisionDetailComponent } from './hri027-termination-decision-detail.component';

describe('Hri027TerminationDecisionDetailComponent', () => {
  let component: Hri027TerminationDecisionDetailComponent;
  let fixture: ComponentFixture<Hri027TerminationDecisionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri027TerminationDecisionDetailComponent]
    });
    fixture = TestBed.createComponent(Hri027TerminationDecisionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
