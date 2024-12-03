import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri038DisciplinaryDecisionListComponent } from './hri038-disciplinary-decision-list.component';

describe('Hri038DisciplinaryDecisionListComponent', () => {
  let component: Hri038DisciplinaryDecisionListComponent;
  let fixture: ComponentFixture<Hri038DisciplinaryDecisionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri038DisciplinaryDecisionListComponent]
    });
    fixture = TestBed.createComponent(Hri038DisciplinaryDecisionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
