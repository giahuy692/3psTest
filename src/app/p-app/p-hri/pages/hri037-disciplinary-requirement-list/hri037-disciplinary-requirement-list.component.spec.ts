import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri037DisciplinaryRequirementListComponent } from './hri037-disciplinary-requirement-list.component';

describe('Hri037DisciplinaryRequirementListComponent', () => {
  let component: Hri037DisciplinaryRequirementListComponent;
  let fixture: ComponentFixture<Hri037DisciplinaryRequirementListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri037DisciplinaryRequirementListComponent]
    });
    fixture = TestBed.createComponent(Hri037DisciplinaryRequirementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
