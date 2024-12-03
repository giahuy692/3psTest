import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri036DisciplinaryDetailComponent } from './hri036-disciplinary-detail.component';

describe('Hri036DisciplinaryDetailComponent', () => {
  let component: Hri036DisciplinaryDetailComponent;
  let fixture: ComponentFixture<Hri036DisciplinaryDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri036DisciplinaryDetailComponent]
    });
    fixture = TestBed.createComponent(Hri036DisciplinaryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
