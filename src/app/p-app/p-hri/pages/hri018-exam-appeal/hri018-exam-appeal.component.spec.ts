import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri018ExamAppealComponent } from './hri018-exam-appeal.component';

describe('Hri018ExamAppealComponent', () => {
  let component: Hri018ExamAppealComponent;
  let fixture: ComponentFixture<Hri018ExamAppealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri018ExamAppealComponent]
    });
    fixture = TestBed.createComponent(Hri018ExamAppealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
