import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri038DisciplinaryDecisionDetailComponent } from './hri038-disciplinary-decision-detail.component';

describe('Hri038DisciplinaryDecisionDetailComponent', () => {
  let component: Hri038DisciplinaryDecisionDetailComponent;
  let fixture: ComponentFixture<Hri038DisciplinaryDecisionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri038DisciplinaryDecisionDetailComponent]
    });
    fixture = TestBed.createComponent(Hri038DisciplinaryDecisionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
