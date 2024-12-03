import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri017ReEvaluateComponent } from './hri017-re-evaluate.component';

describe('Hri017ReEvaluateComponent', () => {
  let component: Hri017ReEvaluateComponent;
  let fixture: ComponentFixture<Hri017ReEvaluateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri017ReEvaluateComponent]
    });
    fixture = TestBed.createComponent(Hri017ReEvaluateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
