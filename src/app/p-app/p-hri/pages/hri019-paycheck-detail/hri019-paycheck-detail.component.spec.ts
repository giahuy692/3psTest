import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri019PaycheckDetailComponent } from './hri019-paycheck-detail.component';

describe('Hri019PaycheckDetailComponent', () => {
  let component: Hri019PaycheckDetailComponent;
  let fixture: ComponentFixture<Hri019PaycheckDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri019PaycheckDetailComponent]
    });
    fixture = TestBed.createComponent(Hri019PaycheckDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
