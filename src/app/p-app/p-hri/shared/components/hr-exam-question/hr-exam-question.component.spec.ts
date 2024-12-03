import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrExamQuestionComponent } from './hr-exam-question.component';

describe('HrExamQuestionComponent', () => {
  let component: HrExamQuestionComponent;
  let fixture: ComponentFixture<HrExamQuestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrExamQuestionComponent]
    });
    fixture = TestBed.createComponent(HrExamQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
