import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri036DisciplinaryListComponent } from './hri036-disciplinary-list.component';

describe('Hri036DisciplinaryListComponent', () => {
  let component: Hri036DisciplinaryListComponent;
  let fixture: ComponentFixture<Hri036DisciplinaryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri036DisciplinaryListComponent]
    });
    fixture = TestBed.createComponent(Hri036DisciplinaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
