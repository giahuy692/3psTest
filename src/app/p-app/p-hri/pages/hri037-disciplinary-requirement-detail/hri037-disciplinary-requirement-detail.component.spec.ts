import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri037DisciplinaryRequirementDetailComponent } from './hri037-disciplinary-requirement-detail.component';

describe('Hri037DisciplinaryRequirementDetailComponent', () => {
  let component: Hri037DisciplinaryRequirementDetailComponent;
  let fixture: ComponentFixture<Hri037DisciplinaryRequirementDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri037DisciplinaryRequirementDetailComponent]
    });
    fixture = TestBed.createComponent(Hri037DisciplinaryRequirementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
